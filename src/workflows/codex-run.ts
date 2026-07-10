import { Sandbox } from "@vercel/sandbox";
import OpenAI from "openai";

import {
  appendCodexEvents,
  getCodexRunForUser,
  updateCodexRun,
} from "@/lib/codex-runs";
import {
  AGENT_TOOLS,
  executeToolCall,
  SYSTEM_PROMPT,
} from "@/lib/coding-agent";
import { getGitHubAccessToken } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";

const GITHUB_MODELS_BASE_URL = "https://models.github.ai/inference";
const MAX_AGENT_TURNS = 14;
const REPO_CWD = "/vercel/sandbox";
type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

// The sandbox's default working directory is not the cloned repository, so
// every git command must run explicitly from the repo root — otherwise git
// operates outside the working tree and silently sees no changes.
function git(
  sandbox: Awaited<ReturnType<typeof Sandbox.getOrCreate>>,
  args: string[],
  timeoutMs = 30_000,
) {
  return sandbox.runCommand({
    cmd: "git",
    args,
    cwd: REPO_CWD,
    timeoutMs,
  });
}

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

  const base = await git(sandbox, ["rev-parse", "HEAD"]);
  const baseSha = (await base.stdout()).trim();
  const checkout = await git(sandbox, ["checkout", "-b", branchName]);
  if (checkout.exitCode !== 0) {
    throw new Error(
      `Could not create work branch: ${(await checkout.stderr()).slice(-500)}`,
    );
  }
  await git(sandbox, ["config", "user.name", "Morphic Agent"]);
  await git(sandbox, ["config", "user.email", "agent@morphic.dev"]);

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

async function agentTurnStep(input: {
  userId: string;
  runId: string;
  sandboxName: string;
  turn: number;
  messages: ChatMessage[];
}): Promise<{
  messages: ChatMessage[];
  done: boolean;
  summary: string | null;
}> {
  "use step";

  const env = getServerEnv();
  const accessToken = await getGitHubAccessToken(input.userId);
  const sandbox = await Sandbox.get({
    ...sandboxCredentials(),
    name: input.sandboxName,
  });
  const client = new OpenAI({
    apiKey: accessToken,
    baseURL: GITHUB_MODELS_BASE_URL,
  });

  const completion = await client.chat.completions.create({
    model: env.MORPHIC_CODEX_MODEL,
    messages: input.messages,
    tools: AGENT_TOOLS,
    tool_choice: "auto",
    max_tokens: 4_096,
  });

  const choice = completion.choices[0]?.message;
  if (!choice) {
    throw new Error("The model returned an empty response.");
  }

  const messages: ChatMessage[] = [...input.messages, choice];
  const events: Array<{
    sequence: number;
    eventType: string;
    payload: Record<string, unknown>;
  }> = [];
  let sequence = input.turn * 100;
  let done = false;
  let summary: string | null = null;

  if (choice.content && typeof choice.content === "string") {
    events.push({
      sequence: (sequence += 1),
      eventType: "item.completed",
      payload: { item: { type: "agent_message", text: choice.content } },
    });
  }

  const toolCalls = choice.tool_calls ?? [];
  for (const toolCall of toolCalls) {
    if (toolCall.type !== "function") continue;
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(toolCall.function.arguments || "{}");
    } catch {
      args = {};
    }

    events.push({
      sequence: (sequence += 1),
      eventType: "item.started",
      payload: {
        item: {
          type:
            toolCall.function.name === "run_command"
              ? "command_execution"
              : toolCall.function.name,
          command: args.command,
          path: args.path,
        },
      },
    });

    const result = await executeToolCall(sandbox, toolCall.function.name, args);

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: result.output,
    });

    events.push({
      sequence: (sequence += 1),
      eventType: "item.completed",
      payload: {
        item: {
          type:
            toolCall.function.name === "run_command"
              ? "command_execution"
              : toolCall.function.name,
          command: args.command,
          path: args.path,
          text: result.output.slice(0, 600),
        },
      },
    });

    if (result.finished) {
      done = true;
      summary = result.summary ?? "Task completed.";
    }
  }

  // A turn with neither tool calls nor a finish nudges the model to act.
  if (toolCalls.length === 0 && !done) {
    messages.push({
      role: "user",
      content:
        "Continue using the tools to complete the task, or call finish if the working tree already holds the finished change.",
    });
  }

  if (events.length > 0) {
    await appendCodexEvents(input.runId, events);
  }

  return { messages, done, summary };
}

async function openPullRequestStep(input: {
  userId: string;
  runId: string;
  sandboxName: string;
  branchName: string;
  summary: string | null;
}) {
  "use step";

  const sandbox = await Sandbox.get({
    ...sandboxCredentials(),
    name: input.sandboxName,
  });

  const status = await git(sandbox, ["status", "--porcelain"]);
  const changedFiles = (await status.stdout()).trim();
  if (!changedFiles) {
    await updateCodexRun(input.runId, {
      status: "completed",
      resultSummary:
        input.summary ?? "The agent finished without changing any files.",
      completedAt: new Date(),
    });
    return { changed: false };
  }

  await git(sandbox, ["add", "--all"]);
  const commit = await git(sandbox, [
    "commit",
    "-m",
    "morphic: approved agent run",
  ]);
  if (commit.exitCode !== 0) {
    throw new Error(`Git commit failed: ${await commit.stderr()}`);
  }
  const shaResult = await git(sandbox, ["rev-parse", "HEAD"]);
  const commitSha = (await shaResult.stdout()).trim();
  const push = await git(
    sandbox,
    ["push", "--set-upstream", "origin", input.branchName],
    120_000,
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
      "## Morphic agent run",
      "",
      `**Approved instruction:** ${run.instruction}`,
      "",
      input.summary ? `**Summary:** ${input.summary}` : "",
      "",
      `Run ID: \`${run.id}\``,
      "",
      "This pull request was created from an explicitly approved, isolated agent run.",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  await updateCodexRun(input.runId, {
    status: "completed",
    commitSha,
    pullRequestNumber: pull.data.number,
    pullRequestUrl: pull.data.html_url,
    resultSummary:
      input.summary ?? "The agent pushed a branch and opened a pull request.",
    completedAt: new Date(),
  });
  await appendCodexEvents(input.runId, [
    {
      sequence: 100_000,
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

function initialMessages(input: {
  repositoryFullName: string;
  objective: string;
  instruction: string;
}): ChatMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Repository: ${input.repositoryFullName}
Objective: ${input.objective}
Approved instruction: ${input.instruction}

The repository is checked out on a fresh branch in the sandbox. Implement the approved instruction, then call finish.`,
    },
  ];
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

  console.info("Starting agent run workflow", input);
  let sandboxName: string | undefined;
  try {
    await updateRunProvisioningStep(input.runId);
    const { run, workspace, repository } = await loadRunContextStep(input);
    const provisioned = await provisionSandboxStep(input.userId, input.runId);
    sandboxName = provisioned.sandboxName;

    let messages = initialMessages({
      repositoryFullName: repository.fullName,
      objective: workspace.objective,
      instruction: run.instruction,
    });

    let summary: string | null = null;
    let done = false;
    for (let turn = 0; turn < MAX_AGENT_TURNS; turn += 1) {
      const result = await agentTurnStep({
        userId: input.userId,
        runId: input.runId,
        sandboxName,
        turn,
        messages,
      });
      messages = result.messages;
      if (result.done) {
        summary = result.summary;
        done = true;
        break;
      }
    }

    if (!done) {
      // The agent used its full turn budget. Whatever it produced is still
      // committed below, but we note that it did not signal completion.
      summary =
        "The agent reached its step limit. Review the pull request carefully — the change may be incomplete.";
    }

    return await openPullRequestStep({
      userId: input.userId,
      runId: input.runId,
      sandboxName,
      branchName: provisioned.branchName,
      summary,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown agent run error";
    await failCodexRunStep(input.runId, message);
    throw error;
  } finally {
    if (sandboxName) await stopSandboxStep(sandboxName);
  }
}

async function loadRunContextStep(input: { userId: string; runId: string }) {
  "use step";

  const { run, workspace, repository } = await getCodexRunForUser(
    input.userId,
    input.runId,
  );
  return {
    run: { instruction: run.instruction },
    workspace: { objective: workspace.objective },
    repository: { fullName: repository.fullName },
  };
}

async function updateRunProvisioningStep(runId: string) {
  "use step";

  console.info("Marking Codex run as provisioning", { runId });
  await updateCodexRun(runId, { status: "provisioning" });
}
