import { describe, expect, it } from "vitest";

import {
  createVerificationPlan,
  detectPackageManager,
} from "@/lib/verification-plan";

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

describe("createVerificationPlan", () => {
  it("prefers a repository-owned check script", () => {
    expect(
      createVerificationPlan(
        ["package.json", "pnpm-lock.yaml"],
        JSON.stringify({
          scripts: {
            check: "pnpm lint && pnpm test",
            test: "vitest run",
          },
        }),
      ),
    ).toMatchObject({
      packageManager: "pnpm",
      commands: [
        {
          id: "check",
          command: "pnpm run check",
        },
      ],
    });
  });

  it("selects bounded standard scripts when check is absent", () => {
    const plan = createVerificationPlan(
      ["package.json", "package-lock.json"],
      JSON.stringify({
        scripts: {
          test: "vitest run",
          typecheck: "tsc --noEmit",
          lint: "eslint .",
          build: "next build",
          deploy: "vercel --prod",
        },
      }),
    );

    expect(plan.commands.map(({ command }) => command)).toEqual([
      "npm run test",
      "npm run typecheck",
      "npm run lint",
    ]);
    expect(JSON.stringify(plan)).not.toContain("deploy");
  });

  it("uses Yarn's script syntax", () => {
    const plan = createVerificationPlan(
      ["package.json", "yarn.lock"],
      JSON.stringify({ scripts: { test: "jest" } }),
    );

    expect(plan.commands[0]?.command).toBe("yarn test");
  });

  it.each(["not-json", JSON.stringify({}), JSON.stringify({ scripts: null })])(
    "fails closed for missing or malformed package scripts",
    (packageJson) => {
      expect(
        createVerificationPlan(["package.json", "pnpm-lock.yaml"], packageJson)
          .commands,
      ).toEqual([]);
    },
  );

  it("does not guess commands without a supported lockfile", () => {
    expect(
      createVerificationPlan(
        ["package.json"],
        JSON.stringify({ scripts: { test: "vitest" } }),
      ),
    ).toMatchObject({ packageManager: "unknown", commands: [] });
  });
});
