import type {
  PackageManager,
  VerificationCapability,
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

const TEST_PATH_PATTERNS = [
  /(^|\/)(?:__tests__|test|tests|spec)\/.*\.(?:[cm]?[jt]sx?|py|rb|go)$/,
  /\.(?:test|spec)\.[cm]?[jt]sx?$/,
  /(^|\/)test_[^/]+\.py$/,
  /_(?:test\.(?:go|py)|spec\.rb)$/,
];

export function isRepositoryTestPath(path: string) {
  return TEST_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

export function findIncidentRegressionTestPaths(
  incidentExternalId: string,
  changedFiles: Array<{ path: string; content: string }>,
) {
  return changedFiles
    .filter(
      ({ path, content }) =>
        isRepositoryTestPath(path) && content.includes(incidentExternalId),
    )
    .map(({ path }) => path);
}

export function detectPackageManager(paths: string[]): PackageManager {
  const names = new Set(paths);
  return LOCKFILES.find(([lockfile]) => names.has(lockfile))?.[1] ?? "unknown";
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

function scriptCapabilities(
  script: string,
  body: string,
): VerificationCapability[] {
  if (script === "test") return ["repository-tests"];
  if (
    script === "check" &&
    /\b(?:pnpm|npm|yarn|bun)(?:\s+run)?\s+test\b/.test(body)
  ) {
    return ["repository-tests"];
  }
  if (script === "typecheck" || script === "lint") {
    return ["static-analysis"];
  }
  if (script === "build") return ["production-build"];
  return [];
}

export function createVerificationPlan(
  paths: string[],
  packageJson: unknown,
  options: { requireRepositoryTests?: boolean } = {},
): VerificationPlan {
  const packageManager = detectPackageManager(paths);
  const scripts = packageScripts(packageJson);
  const selected = options.requireRepositoryTests
    ? scripts.test
      ? ["test"]
      : scripts.check &&
          scriptCapabilities("check", scripts.check).includes(
            "repository-tests",
          )
        ? ["check"]
        : []
    : scripts.check
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
      capabilities: [...scriptCapabilities(script, scripts[script])],
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

export function assertVerificationPassed(
  result: VerificationResult,
  options: { incidentExternalId?: string } = {},
) {
  if (result.status !== "passed") {
    const failed = result.commands.find(({ exitCode }) => exitCode !== 0);
    throw new Error(
      `Independent verification failed${failed ? `: ${failed.command} exited ${failed.exitCode}` : ""}. Publication was blocked.`,
    );
  }

  if (options.incidentExternalId) {
    const evidence = result.behavioralEvidence;
    const hasLinkedEvidence =
      evidence?.incidentExternalId === options.incidentExternalId &&
      evidence.testPaths.length > 0;
    const behavioralCommandPassed = result.commands.some(
      ({ capabilities, exitCode }) =>
        capabilities.includes("behavioral-regression") && exitCode === 0,
    );
    if (hasLinkedEvidence && behavioralCommandPassed) return;
    throw new Error(
      "Independent verification did not record a linked behavioral regression test and a passing repository-owned test command for this incident. Publication was blocked.",
    );
  }
}
