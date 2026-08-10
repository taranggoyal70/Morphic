import { Sandbox } from "@vercel/sandbox";
import OpenAI from "openai";
import { FatalError } from "workflow";

import {
  appendCodexEvents,
  getCodexExecutionContextForUser,
  getCodexRunForUser,
  updateCodexRun,
} from "@/lib/codex-runs";
import {
  AGENT_TOOLS,
  executeToolCall,
  SYSTEM_PROMPT,
} from "@/lib/coding-agent";
import { getGitHubAccessToken } from "@/lib/auth";
import {
  assertReviewedCommit,
  type ExecutionContext,
} from "@/lib/domain/execution-context";
import { getServerEnv } from "@/lib/env";
import { errorMessage } from "@/lib/error-message";
import { buildExecutionContextPrompt } from "@/lib/execution-prompt";
import {
  assertBaseStillReviewed,
  assertPublishablePaths,
  buildPullRequestDraft,
} from "@/lib/publication-policy";
import { pushWithEphemeralCredentials } from "@/lib/publication-remote";
import {
  assertVerificationPassed,
  createIncidentTestCommand,
  createVerificationPlan,
  findIncidentRegressionTestPaths,
  isRepositoryTestPath,
  provesIncidentTestExecution,
} from "@/lib/verification-plan";
import type { VerificationResult } from "@/lib/domain/verification";

const GITHUB_MODELS_BASE_URL = "https://models.github.ai/inference";
const MAX_AGENT_TURNS = 14;
const REPO_CWD = "/vercel/sandbox";
// GitHub Models' free tier caps requests at roughly 8K input / 4K output
// tokens for gpt-4.1-class models, so both the conversation and max_tokens
// must stay under those ceilings or every request past a few file reads 413s.
const MAX_COMPLETION_TOKENS = 3_000;
const MAX_PROMPT_CHARS = 24_000;
const STALE_TOOL_OUTPUT_CHARS = 400;
const RECENT_TOOL_OUTPUT_CHARS = 2_000;
type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

function redactSensitiveText(value: string) {
  return value
    .replace(
      /https:\/\/x-access-token:[^@\s]+@/gi,
      "https://x-access-token:[REDACTED]@",
    )
    .replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[REDACTED_API_KEY]")
    .replace(
      /\b(?:github_pat_[A-Za-z0-9_]+|gh[pousr]_[A-Za-z0-9]+)\b/g,
      "[REDACTED_GITHUB_TOKEN]",
    );
}

// Tool-call arguments are re-sent every turn too — a write_file call carries
// the entire file body in its arguments, so ignoring them undercounts badly.
function messageSize(message: ChatMessage): number {
  let total = typeof message.content === "string" ? message.content.length : 0;
  if (message.role === "assistant" && message.tool_calls) {
    for (const call of message.tool_calls) {
      if (call.type === "function") total += call.function.arguments.length;
    }
  }
  return total;
}

function trimToolContent(message: ChatMessage, max: number): ChatMessage {
  if (
    message.role !== "tool" ||
    typeof message.content !== "string" ||
    message.content.length <= max
  ) {
    return message;
  }
  return {
    ...message,
    content: `${message.content.slice(0, max)}\n…[trimmed — re-read the file if needed]`,
  };
}

// Shrink the conversation until it fits the free-tier request budget, in
// escalating passes so recent context survives longest. Never drop messages:
// tool_call ids must keep their matching tool replies or the API rejects
// the request. Each pass must be able to reach the budget on its own worst
// case — an "exempt recent messages" carve-out is how the 413s slipped through.
function pruneMessages(messages: ChatMessage[]): ChatMessage[] {
  const size = (list: ChatMessage[]) =>
    list.reduce((total, message) => total + messageSize(message), 0);
  if (size(messages) <= MAX_PROMPT_CHARS) return messages;

  // Pass 1: newest two messages stay intact (the file the model just read
  // must arrive unclipped or exact-text edits become impossible), the next
  // few keep reduced detail, and everything older becomes a stub. Trimming
  // down to a single full-size survivor starves the model into a re-read
  // loop that burns the whole turn budget.
  let pruned = messages.map((message, i) => {
    const fromEnd = messages.length - 1 - i;
    if (fromEnd < 2) return message;
    if (fromEnd < 6) return trimToolContent(message, RECENT_TOOL_OUTPUT_CHARS);
    return trimToolContent(message, STALE_TOOL_OUTPUT_CHARS);
  });
  if (size(pruned) <= MAX_PROMPT_CHARS) return pruned;

  // Pass 2: everything except the newest two messages down to the stub size.
  pruned = pruned.map((message, i) =>
    pruned.length - 1 - i < 2
      ? message
      : trimToolContent(message, STALE_TOOL_OUTPUT_CHARS),
  );
  if (size(pruned) <= MAX_PROMPT_CHARS) return pruned;

  // Pass 3: elide bulky arguments on already-executed tool calls.
  pruned = pruned.map((message, i) => {
    if (
      message.role !== "assistant" ||
      !message.tool_calls ||
      i >= pruned.length - 2
    ) {
      return message;
    }
    return {
      ...message,
      tool_calls: message.tool_calls.map((call) =>
        call.type === "function" && call.function.arguments.length > 600
          ? {
              ...call,
              function: {
                ...call.function,
                arguments: JSON.stringify({
                  note: "arguments elided after execution",
                }),
              },
            }
          : call,
      ),
    };
  });
  if (size(pruned) <= MAX_PROMPT_CHARS) return pruned;

  // Pass 4: last resort — every tool output down to the stub size.
  return pruned.map((message) =>
    trimToolContent(message, STALE_TOOL_OUTPUT_CHARS),
  );
}

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

async function inspectChangedTestFiles(
  sandbox: Awaited<ReturnType<typeof Sandbox.getOrCreate>>,
  baseSha: string,
) {
  const changed = await git(sandbox, [
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    "-z",
    baseSha,
  ]);
  if (changed.exitCode !== 0) {
    throw new Error(
      `Could not inspect changed files for behavioral verification: ${await changed.stderr()}`,
    );
  }
  const untracked = await git(sandbox, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
  ]);
  if (untracked.exitCode !== 0) {
    throw new Error(
      `Could not inspect untracked files for behavioral verification: ${await untracked.stderr()}`,
    );
  }
  const paths = assertPublishablePaths(
    [
      ...(await changed.stdout()).split("\0"),
      ...(await untracked.stdout()).split("\0"),
    ]
      .filter(Boolean)
      .filter((path, index, all) => all.indexOf(path) === index),
  );
  const files: Array<{ path: string; content: string }> = [];
  for (const path of paths.filter(isRepositoryTestPath)) {
    const content = await sandbox.runCommand({
      cmd: "head",
      args: ["-c", "200000", "--", path],
      cwd: REPO_CWD,
      timeoutMs: 30_000,
    });
    if (content.exitCode !== 0) {
      throw new Error(
        `Could not inspect changed regression test ${path}: ${await content.stderr()}`,
      );
    }
    files.push({ path, content: await content.stdout() });
  }
  return files;
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

  console.info("Provisioning Morphic Agent sandbox", { userId, runId });
  const context = await getCodexExecutionContextForUser(userId, runId);
  const githubToken = await getGitHubAccessToken(userId);
  const sandboxName = `morphic-${context.runId}`;
  const branchName = `morphic/${context.runId.slice(0, 8)}`;

  const sandbox = await Sandbox.getOrCreate({
    ...sandboxCredentials(),
    name: sandboxName,
    source: {
      type: "git",
      url: `https://github.com/${context.repositoryFullName}.git`,
      username: "x-access-token",
      password: githubToken,
      revision: context.repositoryHeadSha,
      depth: 20,
    },
    runtime: "node24",
    resources: { vcpus: 2 },
    timeout: 1_200_000,
    persistent: false,
    env: {
      // Drive the Morphic Agent model loop through GitHub Models using the
      // same OAuth token that powers repository access.
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
  if (base.exitCode !== 0) {
    throw new Error(`Could not resolve sandbox HEAD: ${await base.stderr()}`);
  }
  const baseSha = assertReviewedCommit(
    (await base.stdout()).trim(),
    context.repositoryHeadSha,
  );
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
      eventType: "execution.context.bound",
      payload: {
        workspaceId: context.workspaceId,
        workspaceVersionId: context.workspaceVersionId,
        workspaceVersion: context.workspaceVersion,
        repositorySnapshotId: context.repositorySnapshotId,
        repositoryBranch: context.repositoryBranch,
        repositoryHeadSha: context.repositoryHeadSha,
      },
    },
    {
      sequence: 1,
      eventType: "run.started",
      payload: {
        branchName,
        baseSha,
        repository: context.repositoryFullName,
      },
    },
  ]);

  return { sandboxName, branchName, baseSha };
}

type Usage = {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
};

async function agentTurnStep(input: {
  userId: string;
  runId: string;
  sandboxName: string;
  turn: number;
  messages: ChatMessage[];
  usage: Usage;
}): Promise<{
  messages: ChatMessage[];
  done: boolean;
  summary: string | null;
  usage: Usage;
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

  const prunedMessages = pruneMessages(input.messages);
  let completion: OpenAI.Chat.Completions.ChatCompletion;
  try {
    completion = await client.chat.completions.create({
      model: env.MORPHIC_CODEX_MODEL,
      messages: prunedMessages,
      tools: AGENT_TOOLS,
      tool_choice: "auto",
      max_tokens: MAX_COMPLETION_TOKENS,
    });
  } catch (error) {
    // 4xx responses (except 429) are deterministic — the workflow's automatic
    // step retries would repeat the identical rejected request at full cost.
    if (
      error instanceof OpenAI.APIError &&
      typeof error.status === "number" &&
      error.status >= 400 &&
      error.status < 500 &&
      error.status !== 429
    ) {
      throw new FatalError(
        `GitHub Models rejected the request (${error.status}): ${error.message}`,
      );
    }
    throw error;
  }

  // Accumulate token usage across turns and persist it so the run timeline
  // shows a live, growing cost as the agent works.
  const turnUsage = completion.usage;
  const usage: Usage = {
    inputTokens: input.usage.inputTokens + (turnUsage?.prompt_tokens ?? 0),
    cachedInputTokens:
      input.usage.cachedInputTokens +
      (turnUsage?.prompt_tokens_details?.cached_tokens ?? 0),
    outputTokens:
      input.usage.outputTokens + (turnUsage?.completion_tokens ?? 0),
    reasoningOutputTokens:
      input.usage.reasoningOutputTokens +
      (turnUsage?.completion_tokens_details?.reasoning_tokens ?? 0),
  };
  await updateCodexRun(input.runId, { usage });

  const choice = completion.choices[0]?.message;
  if (!choice) {
    throw new Error("The model returned an empty response.");
  }

  const messages: ChatMessage[] = [...prunedMessages, choice];
  const events: Array<{
    sequence: number;
    eventType: string;
    payload: Record<string, unknown>;
  }> = [];
  let sequence = (input.turn + 1) * 100;
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
          status: result.commandResult?.status,
          exitCode: result.commandResult?.exitCode,
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

  return { messages, done, summary, usage };
}

async function openPullRequestStep(input: {
  userId: string;
  runId: string;
  sandboxName: string;
  branchName: string;
  baseSha: string;
  workspaceVersion: number;
  summary: string | null;
  verification: VerificationResult;
}) {
  "use step";

  const sandbox = await Sandbox.get({
    ...sandboxCredentials(),
    name: input.sandboxName,
  });

  // Commit any changes the agent left uncommitted. (The agent may also have
  // committed its own work — that is fine; we detect it by comparing HEAD to
  // the base commit below, so a clean working tree does not mean "no work".)
  const status = await git(sandbox, ["status", "--porcelain"]);
  const pendingChanges = Boolean((await status.stdout()).trim());
  if (pendingChanges) {
    await git(sandbox, ["add", "--all"]);
    const commit = await git(sandbox, [
      "commit",
      "-m",
      "morphic: approved agent run",
    ]);
    if (commit.exitCode !== 0) {
      throw new Error(`Git commit failed: ${await commit.stderr()}`);
    }
  }

  const shaResult = await git(sandbox, ["rev-parse", "HEAD"]);
  const commitSha = (await shaResult.stdout()).trim();
  const diffResult = await git(sandbox, [
    "diff",
    "--name-only",
    `${input.baseSha}...${commitSha}`,
  ]);
  if (diffResult.exitCode !== 0) {
    throw new Error(
      `Could not inspect the final diff: ${await diffResult.stderr()}`,
    );
  }
  const changedPaths = assertPublishablePaths(
    (await diffResult.stdout())
      .split("\n")
      .map((path) => path.trim())
      .filter(Boolean),
  );

  if (changedPaths.length === 0) {
    await updateCodexRun(input.runId, {
      status: "completed",
      resultSummary:
        input.summary ?? "The agent finished without changing any files.",
      completedAt: new Date(),
    });
    return { changed: false, changedPaths: [] };
  }

  const { run, workspace, repository } = await getCodexRunForUser(
    input.userId,
    input.runId,
  );
  const githubToken = await getGitHubAccessToken(input.userId);

  await pushWithEphemeralCredentials({
    repositoryFullName: repository.fullName,
    githubToken,
    branchName: input.branchName,
    runGit: (args, timeoutMs) => git(sandbox, args, timeoutMs),
  });

  const { Octokit } = await import("@octokit/rest");
  const github = new Octokit({ auth: githubToken, userAgent: "morphic/0.1.0" });
  const baseBranch = await github.rest.repos.getBranch({
    owner: repository.owner,
    repo: repository.name,
    branch: repository.defaultBranch,
  });
  assertBaseStillReviewed(input.baseSha, baseBranch.data.commit.sha);
  const pull = await github.rest.pulls.create(
    buildPullRequestDraft({
      owner: repository.owner,
      repo: repository.name,
      head: input.branchName,
      base: repository.defaultBranch,
      objective: workspace.objective,
      instruction: run.instruction,
      runId: run.id,
      summary: input.summary,
      reviewedSha: input.baseSha,
      workspaceVersion: input.workspaceVersion,
      incident: workspace.incident,
      verification: input.verification,
    }),
  );
  try {
    assertBaseStillReviewed(input.baseSha, pull.data.base.sha);
  } catch (error) {
    await Promise.allSettled([
      github.rest.pulls.update({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pull.data.number,
        state: "closed",
      }),
      github.rest.git.deleteRef({
        owner: repository.owner,
        repo: repository.name,
        ref: `heads/${input.branchName}`,
      }),
    ]);
    throw error;
  }

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
    changedPaths,
    pullRequestUrl: pull.data.html_url,
  };
}

function initialMessages(context: ExecutionContext): ChatMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: buildExecutionContextPrompt(context),
    },
  ];
}

async function failCodexRunStep(runId: string, message: string) {
  "use step";

  const safeMessage = redactSensitiveText(message);

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

async function verifyAgentChangeStep(input: {
  sandboxName: string;
  runId: string;
  baseSha: string;
  incidentExternalId?: string;
}): Promise<VerificationResult> {
  "use step";

  const sandbox = await Sandbox.get({
    ...sandboxCredentials(),
    name: input.sandboxName,
  });
  const trackedFiles = await git(sandbox, ["ls-files"]);
  if (trackedFiles.exitCode !== 0) {
    throw new Error(
      `Could not inspect repository files for verification: ${await trackedFiles.stderr()}`,
    );
  }
  const packageJson = await sandbox.runCommand("bash", [
    "-lc",
    `cd ${REPO_CWD} && test -f package.json && cat package.json`,
  ]);
  const packageJsonContent =
    packageJson.exitCode === 0 ? await packageJson.stdout() : null;
  const changedTestFiles = input.incidentExternalId
    ? await inspectChangedTestFiles(sandbox, input.baseSha)
    : [];
  const linkedTestPaths = input.incidentExternalId
    ? findIncidentRegressionTestPaths(
        input.incidentExternalId,
        changedTestFiles,
      )
    : [];
  const plan = createVerificationPlan(
    (await trackedFiles.stdout()).split("\n").filter(Boolean),
    packageJsonContent,
    { requireRepositoryTests: Boolean(input.incidentExternalId) },
  );
  if (plan.commands.length === 0) {
    throw new Error(`Independent verification could not start: ${plan.reason}`);
  }

  const commands: VerificationResult["commands"] = [];
  for (const command of plan.commands) {
    const result = await sandbox.runCommand(
      "bash",
      ["-lc", `cd ${REPO_CWD} && ${command.command}`],
      { timeoutMs: command.timeoutMs },
    );
    const output = redactSensitiveText(
      [(await result.stdout()).trim(), (await result.stderr()).trim()]
        .filter(Boolean)
        .join("\n")
        .slice(-4_000),
    );
    commands.push({
      ...command,
      exitCode: result.exitCode,
      output,
    });
    if (result.exitCode !== 0) break;
  }

  const provenTestPaths: string[] = [];
  if (
    input.incidentExternalId &&
    commands.every(({ exitCode }) => exitCode === 0)
  ) {
    for (const testPath of linkedTestPaths) {
      const directCommand = createIncidentTestCommand(
        plan.packageManager,
        packageJsonContent,
        testPath,
      );
      if (!directCommand?.execution) continue;
      const result = await sandbox.runCommand({
        cmd: directCommand.execution.executable,
        args: directCommand.execution.args,
        cwd: REPO_CWD,
        timeoutMs: directCommand.timeoutMs,
      });
      const output = redactSensitiveText(
        [(await result.stdout()).trim(), (await result.stderr()).trim()]
          .filter(Boolean)
          .join("\n")
          .slice(-4_000),
      );
      const proved =
        result.exitCode === 0 &&
        provesIncidentTestExecution(input.incidentExternalId, output);
      commands.push({
        ...directCommand,
        capabilities: proved
          ? [...directCommand.capabilities, "behavioral-regression"]
          : directCommand.capabilities,
        exitCode: result.exitCode,
        output,
      });
      if (proved) provenTestPaths.push(testPath);
      if (result.exitCode !== 0) break;
    }
  }

  const behavioralEvidencePassed = input.incidentExternalId
    ? linkedTestPaths.length > 0 &&
      provenTestPaths.length === linkedTestPaths.length
    : true;

  const verification: VerificationResult = {
    status:
      commands.every(({ exitCode }) => exitCode === 0) &&
      behavioralEvidencePassed
        ? "passed"
        : "failed",
    behavioralEvidence: input.incidentExternalId
      ? {
          incidentExternalId: input.incidentExternalId,
          testPaths: provenTestPaths,
        }
      : undefined,
    commands,
  };
  await updateCodexRun(input.runId, { verification });
  await appendCodexEvents(input.runId, [
    {
      sequence: 90_000,
      eventType: "verification.completed",
      payload: verification,
    },
  ]);
  return verification;
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
    const context = await loadRunContextStep(input);
    const provisioned = await provisionSandboxStep(input.userId, input.runId);
    sandboxName = provisioned.sandboxName;

    let messages = initialMessages(context);

    let summary: string | null = null;
    let done = false;
    let usage: Usage = {
      inputTokens: 0,
      cachedInputTokens: 0,
      outputTokens: 0,
      reasoningOutputTokens: 0,
    };
    for (let turn = 0; turn < MAX_AGENT_TURNS; turn += 1) {
      const result = await agentTurnStep({
        userId: input.userId,
        runId: input.runId,
        sandboxName,
        turn,
        messages,
        usage,
      });
      messages = result.messages;
      usage = result.usage;
      if (result.done) {
        summary = result.summary;
        done = true;
        break;
      }
    }

    if (!done) {
      throw new Error(
        "The agent reached its turn limit without declaring completion. Publication was blocked.",
      );
    }

    const verification = await verifyAgentChangeStep({
      sandboxName,
      runId: input.runId,
      baseSha: provisioned.baseSha,
      incidentExternalId: context.incident?.externalId,
    });
    assertVerificationPassed(verification, {
      incidentExternalId: context.incident?.externalId,
    });

    return await openPullRequestStep({
      userId: input.userId,
      runId: input.runId,
      sandboxName,
      branchName: provisioned.branchName,
      baseSha: provisioned.baseSha,
      workspaceVersion: context.workspaceVersion,
      summary,
      verification,
    });
  } catch (error) {
    await failCodexRunStep(
      input.runId,
      errorMessage(error, "Unknown agent run error"),
    );
    throw error;
  } finally {
    if (sandboxName) await stopSandboxStep(sandboxName);
  }
}

async function loadRunContextStep(input: { userId: string; runId: string }) {
  "use step";

  return getCodexExecutionContextForUser(input.userId, input.runId);
}

async function updateRunProvisioningStep(runId: string) {
  "use step";

  console.info("Marking Codex run as provisioning", { runId });
  await updateCodexRun(runId, { status: "provisioning" });
}
