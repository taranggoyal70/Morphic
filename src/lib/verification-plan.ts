import type {
  PackageManager,
  VerificationPlan,
  VerificationResult,
} from "@/lib/domain/verification";

const LOCKFILES: Array<[string, PackageManager]> = [
  ["pnpm-lock.yaml", "pnpm"],
  ["package-lock.json", "npm"],
  ["yarn.lock", "yarn"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
];

export function detectPackageManager(paths: string[]): PackageManager {
  const names = new Set(paths);
  return (
    LOCKFILES.find(([lockfile]) => names.has(lockfile))?.[1] ?? "unknown"
  );
}

function packageScripts(packageJson: unknown): Record<string, string> {
  try {
    const parsed =
      typeof packageJson === "string" ? JSON.parse(packageJson) : packageJson;
    if (!parsed || typeof parsed !== "object" || !("scripts" in parsed)) {
      return {};
    }
    const scripts = (parsed as { scripts?: unknown }).scripts;
    if (!scripts || typeof scripts !== "object") return {};
    return Object.fromEntries(
      Object.entries(scripts).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

function runCommand(manager: PackageManager, script: string) {
  if (manager === "yarn") return `yarn ${script}`;
  if (manager === "unknown") return "";
  return `${manager} run ${script}`;
}

export function createVerificationPlan(
  paths: string[],
  packageJson: unknown,
): VerificationPlan {
  const packageManager = detectPackageManager(paths);
  const scripts = packageScripts(packageJson);
  const selected = scripts.check
    ? ["check"]
    : ["test", "typecheck", "lint", "build"]
        .filter((script) => scripts[script])
        .slice(0, 3);
  const commands = selected
    .map((script) => ({
      id: script,
      label: `Run ${script}`,
      command: runCommand(packageManager, script),
      timeoutMs: script === "build" || script === "check" ? 600_000 : 300_000,
    }))
    .filter(({ command }) => command.length > 0);

  return {
    packageManager,
    commands,
    reason:
      commands.length > 0
        ? "Selected bounded repository-owned verification scripts."
        : "No supported lockfile and verification script combination was found.",
  };
}

export function assertVerificationPassed(result: VerificationResult) {
  if (result.status === "passed") return;
  const failed = result.commands.find(({ exitCode }) => exitCode !== 0);
  throw new Error(
    `Independent verification failed${failed ? `: ${failed.command} exited ${failed.exitCode}` : ""}. Publication was blocked.`,
  );
}
