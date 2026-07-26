import { describe, expect, it } from "vitest";

import { detectPackageManager } from "@/lib/verification-plan";

describe("detectPackageManager", () => {
  it.each([
    [["package.json", "pnpm-lock.yaml"], "pnpm"],
    [["package.json", "package-lock.json"], "npm"],
    [["package.json", "yarn.lock"], "yarn"],
    [["package.json", "bun.lock"], "bun"],
  ] as const)("detects %s", (paths, expected) => {
    expect(detectPackageManager([...paths])).toBe(expected);
  });

  it("returns unknown when no supported lockfile exists", () => {
    expect(detectPackageManager(["package.json", "src/index.ts"])).toBe(
      "unknown",
    );
  });
});
