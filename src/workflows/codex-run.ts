import { Sandbox } from "@vercel/sandbox";
import { sleep } from "workflow";

import {
  appendCodexEvents,
  getCodexRunForUser,
  updateCodexRun,
} from "@/lib/codex-runs";
import { getGitHubAccessToken } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";

const CODEX_CLI_VERSION = "0.142.5";
const GITHUB_MODELS_BASE_URL = "https://models.github.ai/inference";

function sandboxCredentials() {
  const env = getServerEnv();
  if (env.VERCEL_TOKEN && env.VERCEL_TEAM_ID && env.VERCEL_PROJECT_ID) {
    return {
      token: env.VERCEL_TOKEN,
      teamId: env.VERCEL_TEAM_ID,
      projectId: env.VERCEL_PROJECT_ID,
    };
  }
  return {};
}

async function provisionSandboxStep(userId: string, runId: string) {
  "use step";

  console.info("Provisioning Codex sandbox", { userId, runId });
  const { run, repository } = await getCodexRunForUser(userId, runId);
  const githubToken = await getGitHubAccessToken(userId);
  const sandboxName = `morphic-${run.id}`;
  const branchName = `morphic/${run.id.slice(0, 8)}`;

  const sandbox = await Sandbox.getOrCreate({
    ...sandboxCredentials(),
    name: sandboxName,
    source: {
      type: "git",
      url: `https://github.com/${repository.fullName}.git`,
      username: "x-access-token",
      password: githubToken,
      revision: repository.defaultBranch,
      depth: 20,
    },
    runtime: "node24",
    resources: { vcpus: 2 },
    timeout: 1_200_000,
    persistent: false,
    env: {
      // Drive the Codex CLI through GitHub Models using the same OAuth token
      // that powers workspace planning — no separate OpenAI credential needed.
      OPENAI_API_KEY: githubToken,
      OPENAI_BASE_URL: GITHUB_MODELS_BASE_URL,
    },
    networkPolicy: {
      allow: [
        "models.github.ai",
        "api.openai.com",
        "github.com",
        "api.github.com",
        "*.githubusercontent.com",
        "registry.npmjs.org",
        "*.npmjs.org",
      ],
    },
  });

  const base = await sandbox.runCommand("git", ["rev-parse", "HEAD"]);
  const baseSha = (await base.stdout()).trim();
  await sandbox.runCommand("git", ["checkout", "-b", branchName]);
  await sandbox.runCommand("git", ["config", "user.name", "Morphic Codex"]);
  await sandbox.runCommand("git", [
    "config",
    "user.email",
    "codex@morphic.dev",
  ]);
  const install = await sandbox.runCommand(
    "npm",
    ["install", "-g", `@openai/codex@${CODEX_CLI_VERSION}`],
    { timeoutMs: 180_000 },
  );
  if (install.exitCode !== 0) {
    throw new Error(`Codex installation failed: ${await install.stderr()}`);
  }

  await updateCodexRun(runId, {
    status: "running",
    sandboxId: sandboxName,
    branchName,
    baseSha,
    startedAt: new Date(),
  });
  await appendCodexEvents(runId, [
    {
      sequence: 0,
      eventType: "run.started",
      payload: {
        branchName,
        baseSha,
        repository: repository.fullName,
      },
    },
  ]);

  return { sandboxName, branchName };
}

async function startCodexCommandStep(input: {
  userId: string;
  runId: string;
  sandboxName: string;
}) {
  "use step";

  console.info("Starting Codex command", input);
  const { run, workspace, repository } = await getCodexRunForUser(
    input.userId,
    input.runId,
  );
  const sandbox = await Sandbox.get({
    ...sandboxCredentials(),
    name: input.sandboxName,
  });
  const prompt = `You are executing an approved Morphic coding task.

Repository: ${repository.fullName}
Objective: ${workspace.objective}
Approved instruction: ${run.instruction}

Implement the instruction in this repository. Inspect existing conventions first. Keep the change scoped, run relevant tests, and leave the working tree with the complete implementation. Do not push, merge, expose secrets, modify authentication credentials, or weaken security controls.`;
  const command = await sandbox.runCommand({
    cmd: "codex",
    args: [
      "exec",
      "--json",
      "--ephemeral",
      "--ignore-user-config",
      "--dangerously-bypass-approvals-and-sandbox",
      "--color",
      "never",
      // Register GitHub Models as an OpenAI-compatible provider that speaks
      // the chat-completions wire API (the Codex default Responses API is not
      // available on GitHub Models).
      "-c",
      'model_provider="github-models"',
      "-c",
      'model_providers.github-models.name="GitHub Models"',
      "-c",
      `model_providers.github-models.base_url="${GITHUB_MODELS_BASE_URL}"`,
      "-c",
      'model_providers.github-models.wire_api="chat"',
      "-c",
      'model_providers.github-models.env_key="OPENAI_API_KEY"',
      "--model",
      getServerEnv().MORPHIC_CODEX_MODEL,
      prompt,
    ],
    cwd: "/vercel/sandbox",
    detached: true,
    timeoutMs: 900_000,
  });
  return command.cmdId;
}

async function pollCodexCommandStep(input: {
  sandboxName: string;
  commandId: string;
}) {
  "use step";

  const sandbox = await Sandbox.get({
    ...sandboxCredentials(),
    name: input.sandboxName,
  });
  const command = await sandbox.getCommand(input.commandId);
  return {
    done: command.exitCode !== null,
    exitCode: command.exitCode,
  };
}

async function finalizeCodexStep(input: {
  userId: string;
  runId: string;
  sandboxName: string;
  commandId: string;
  branchName: string;
}) {
  "use step";

  console.info("Finalizing Codex run", input);
  const sandbox = await Sandbox.get({
    ...sandboxCredentials(),
    name: input.sandboxName,
  });
  const command = await sandbox.getCommand(input.commandId);
  const result = await command.wait();
  const stdout = await result.stdout();
  const stderr = await result.stderr();
  const parsedEvents = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        const payload = JSON.parse(line) as Record<string, unknown>;
        return {
          sequence: index + 1,
          eventType:
            typeof payload.type === "string" ? payload.type : "codex.event",
          payload,
        };
      } catch {
        return {
          sequence: index + 1,
          eventType: "codex.output",
          payload: { text: line.slice(0, 4_000) },
        };
      }
    });
  await appendCodexEvents(input.runId, parsedEvents);

  if (result.exitCode !== 0) {
    throw new Error(
      `Codex exited with ${result.exitCode}: ${stderr.slice(-2_000)}`,
    );
  }

  const status = await sandbox.runCommand("git", ["status", "--porcelain"], {
    timeoutMs: 30_000,
  });
  const changedFiles = (await status.stdout()).trim();
  if (!changedFiles) {
    await updateCodexRun(input.runId, {
      status: "completed",
      resultSummary: "Codex completed without repository changes.",
      completedAt: new Date(),
    });
    return { changed: false };
  }

  await sandbox.runCommand("git", ["add", "--all"]);
  const commit = await sandbox.runCommand("git", [
    "commit",
    "-m",
    "morphic: approved Codex run",
  ]);
  if (commit.exitCode !== 0) {
    throw new Error(`Git commit failed: ${await commit.stderr()}`);
  }
  const shaResult = await sandbox.runCommand("git", ["rev-parse", "HEAD"]);
  const commitSha = (await shaResult.stdout()).trim();
  const push = await sandbox.runCommand(
    "git",
    ["push", "--set-upstream", "origin", input.branchName],
    { timeoutMs: 120_000 },
  );
  if (push.exitCode !== 0) {
    throw new Error(`Git push failed: ${await push.stderr()}`);
  }

  const { run, workspace, repository } = await getCodexRunForUser(
    input.userId,
    input.runId,
  );
  const githubToken = await getGitHubAccessToken(input.userId);
  const { Octokit } = await import("@octokit/rest");
  const github = new Octokit({ auth: githubToken, userAgent: "morphic/0.1.0" });
  const pull = await github.rest.pulls.create({
    owner: repository.owner,
    repo: repository.name,
    head: input.branchName,
    base: repository.defaultBranch,
    title: `Morphic: ${workspace.objective.slice(0, 180)}`,
    body: [
      "## Morphic Codex run",
      "",
      run.instruction,
      "",
      `Run ID: \`${run.id}\``,
      "",
      "This pull request was created from an explicitly approved, isolated Codex run.",
    ].join("\n"),
  });

  await updateCodexRun(input.runId, {
    status: "completed",
    commitSha,
    pullRequestNumber: pull.data.number,
    pullRequestUrl: pull.data.html_url,
    resultSummary: "Codex pushed a branch and opened a pull request.",
    completedAt: new Date(),
  });
  await appendCodexEvents(input.runId, [
    {
      sequence: parsedEvents.length + 1,
      eventType: "pull_request.created",
      payload: {
        number: pull.data.number,
        url: pull.data.html_url,
        commitSha,
      },
    },
  ]);
  return {
    changed: true,
    pullRequestUrl: pull.data.html_url,
  };
}

async function failCodexRunStep(runId: string, message: string) {
  "use step";

  const safeMessage = message
    .replace(
      /https:\/\/x-access-token:[^@\s]+@/gi,
      "https://x-access-token:[REDACTED]@",
    )
    .replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_API_KEY]")
    .replace(
      /\b(?:github_pat_[A-Za-z0-9_]+|gh[pousr]_[A-Za-z0-9]+)\b/g,
      "[REDACTED_GITHUB_TOKEN]",
    );

  console.error("Codex run failed", { runId, message: safeMessage });
  await updateCodexRun(runId, {
    status: "failed",
    error: safeMessage.slice(0, 2_000),
    completedAt: new Date(),
  });
}

async function stopSandboxStep(sandboxName: string) {
  "use step";

  console.info("Stopping Codex sandbox", { sandboxName });
  try {
    const sandbox = await Sandbox.get({
      ...sandboxCredentials(),
      name: sandboxName,
      resume: false,
    });
    await sandbox.stop();
  } catch (error) {
    console.warn("Sandbox stop failed", {
      sandboxName,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function codexRunWorkflow(input: {
  userId: string;
  runId: string;
}) {
  "use workflow";

  console.info("Starting Codex run workflow", input);
  let sandboxName: string | undefined;
  try {
    await updateRunProvisioningStep(input.runId);
    const provisioned = await provisionSandboxStep(input.userId, input.runId);
    sandboxName = provisioned.sandboxName;
    const commandId = await startCodexCommandStep({
      ...input,
      sandboxName,
    });

    // Poll for at most ~16 minutes (just past the 15-minute command timeout)
    // so a hung Codex process surfaces as a clear timeout instead of an
    // indefinitely "running" workspace.
    const maxPolls = 192;
    let finished = false;
    for (let poll = 0; poll < maxPolls; poll += 1) {
      await sleep("5s");
      const status = await pollCodexCommandStep({
        sandboxName,
        commandId,
      });
      if (status.done) {
        finished = true;
        break;
      }
    }

    if (!finished) {
      throw new Error(
        "Codex did not finish within the time limit. The sandbox was stopped without creating a pull request.",
      );
    }

    return await finalizeCodexStep({
      ...input,
      sandboxName,
      branchName: provisioned.branchName,
      commandId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Codex run error";
    await failCodexRunStep(input.runId, message);
    throw error;
  } finally {
    if (sandboxName) await stopSandboxStep(sandboxName);
  }
}

async function updateRunProvisioningStep(runId: string) {
  "use step";

  console.info("Marking Codex run as provisioning", { runId });
  await updateCodexRun(runId, { status: "provisioning" });
}
