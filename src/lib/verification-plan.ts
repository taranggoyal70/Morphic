import type { PackageManager } from "@/lib/domain/verification";

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
