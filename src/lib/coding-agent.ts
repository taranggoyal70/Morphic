import "server-only";

import type { Sandbox } from "@vercel/sandbox";

const SANDBOX_CWD = "/vercel/sandbox";
// GitHub Models' free tier allows ~8K input tokens per request; a single
// oversized tool output can consume the whole budget, so file reads must
// stay a fraction of it (~2K tokens) for the conversation to keep fitting.
const MAX_OUTPUT_CHARS = 6_000;
const MAX_FILE_CHARS = 8_000;

export const SYSTEM_PROMPT = `You are Morphic's coding agent, executing an approved task inside an isolated sandbox that already has the repository checked out on a fresh branch.

Work in small, deliberate steps using the provided tools:
- Inspect the repository before editing: list files and read the ones you will change or need context from.
- Follow the existing conventions of the project (language, style, structure).
- Keep the change tightly scoped to the approved instruction. Do not refactor unrelated code.
- Never expose secrets, modify authentication credentials, weaken security controls, or add malicious code.
- Do not run destructive commands (no force-push, no history rewrites, no deleting the repo).
- When the implementation is complete and the working tree holds the finished change, call "finish" with a concise summary. Do not commit, push, or open a pull request yourself — Morphic handles that after you finish.

Prefer reading before writing. Verify your edits with a read or a build/test command when practical. Be efficient with tool calls; the environment has a limited budget.`;

export type ToolName =
  "list_files" | "read_file" | "write_file" | "run_command" | "finish";

export const AGENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "list_files",
      description:
        "List files and directories under a repository-relative path. Use '.' for the repository root.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Repository-relative directory path. Defaults to '.'.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "read_file",
      description: "Read the full contents of a repository-relative file.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Repository-relative file path.",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "write_file",
      description:
        "Create or overwrite a repository-relative file with the given contents. Creates parent directories as needed.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Repository-relative file path.",
          },
          content: { type: "string", description: "Full file contents." },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "run_command",
      description:
        "Run a shell command from the repository root (e.g. npm install, npm test, ls, cat). Returns stdout, stderr, and exit code.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "The shell command to run." },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "finish",
      description:
        "Call when the implementation is complete and the working tree holds the finished change.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "A concise summary of what was changed and why.",
          },
        },
        required: ["summary"],
      },
    },
  },
];

const BLOCKED_COMMAND =
  /(rm\s+-rf\s+\/|git\s+push|git\s+reset\s+--hard|:\(\)\{)/;

function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n…[truncated ${text.length - max} chars]`;
}

function safePath(path: string) {
  const trimmed = path.replace(/^\.?\/+/, "").trim();
  if (!trimmed || trimmed.startsWith("..") || trimmed.includes("/../")) {
    throw new Error("Path must stay inside the repository.");
  }
  return trimmed;
}

export type ToolCallResult = {
  output: string;
  finished: boolean;
  summary?: string;
  changedTree?: boolean;
};

export async function executeToolCall(
  sandbox: Sandbox,
  name: string,
  args: Record<string, unknown>,
): Promise<ToolCallResult> {
  if (name === "finish") {
    return {
      output: "Finished.",
      finished: true,
      summary:
        typeof args.summary === "string" ? args.summary : "Task completed.",
    };
  }

  if (name === "list_files") {
    const path = safePath(typeof args.path === "string" ? args.path : ".");
    const result = await sandbox.runCommand("bash", [
      "-lc",
      `cd ${SANDBOX_CWD} && find ${path === "" ? "." : path} -maxdepth 2 -not -path '*/node_modules/*' -not -path '*/.git/*' | head -200`,
    ]);
    return {
      output: clamp(
        (await result.stdout()).trim() || "(empty)",
        MAX_OUTPUT_CHARS,
      ),
      finished: false,
    };
  }

  if (name === "read_file") {
    const path = safePath(String(args.path ?? ""));
    const result = await sandbox.runCommand("bash", [
      "-lc",
      `cd ${SANDBOX_CWD} && cat ${JSON.stringify(path)}`,
    ]);
    if (result.exitCode !== 0) {
      return {
        output: `File ${path} does not exist or is unreadable.`,
        finished: false,
      };
    }
    return {
      output: clamp((await result.stdout()) || "(empty file)", MAX_FILE_CHARS),
      finished: false,
    };
  }

  if (name === "write_file") {
    const path = safePath(String(args.path ?? ""));
    const content = typeof args.content === "string" ? args.content : "";
    // Write through the same shell/cwd that git uses so the change is part of
    // the repository working tree (the writeFiles API and git observed
    // different filesystem state across workflow steps). base64 keeps
    // arbitrary content safe through the shell.
    const b64 = Buffer.from(content, "utf8").toString("base64");
    const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    const script = [
      `cd ${SANDBOX_CWD}`,
      dir && `mkdir -p ${JSON.stringify(dir)}`,
      `printf '%s' ${JSON.stringify(b64)} | base64 -d > ${JSON.stringify(path)}`,
    ]
      .filter(Boolean)
      .join(" && ");
    const result = await sandbox.runCommand("bash", ["-lc", script]);
    if (result.exitCode !== 0) {
      return {
        output: `Failed to write ${path}: ${(await result.stderr()).slice(0, 400)}`,
        finished: false,
      };
    }
    return {
      output: `Wrote ${path} (${content.length} chars).`,
      finished: false,
      changedTree: true,
    };
  }

  if (name === "run_command") {
    const command = String(args.command ?? "").trim();
    if (!command) return { output: "No command provided.", finished: false };
    if (BLOCKED_COMMAND.test(command)) {
      return {
        output:
          "That command is not allowed. Do not push, reset history, or delete the repository — Morphic commits and opens the PR for you.",
        finished: false,
      };
    }
    const result = await sandbox.runCommand(
      "bash",
      ["-lc", `cd ${SANDBOX_CWD} && ${command}`],
      {
        timeoutMs: 120_000,
      },
    );
    const stdout = (await result.stdout()).trim();
    const stderr = (await result.stderr()).trim();
    const body = [
      `exit code: ${result.exitCode}`,
      stdout && `stdout:\n${stdout}`,
      stderr && `stderr:\n${stderr}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    return {
      output: clamp(body, MAX_OUTPUT_CHARS),
      finished: false,
      changedTree: true,
    };
  }

  return { output: `Unknown tool: ${name}`, finished: false };
}
