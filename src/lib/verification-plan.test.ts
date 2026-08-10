import { describe, expect, it } from "vitest";

import {
  assertVerificationPassed,
  createIncidentTestCommand,
  createVerificationPlan,
  detectPackageManager,
  findIncidentRegressionTestPaths,
  provesIncidentTestExecution,
} from "@/lib/verification-plan";

describe("findIncidentRegressionTestPaths", () => {
  it("links an incident only to changed test files that name its identifier", () => {
    expect(
      findIncidentRegressionTestPaths("bt-9831", [
        {
          path: "src/refund.ts",
          content: "// bt-9831 production fix",
        },
        {
          path: "src/refund.test.ts",
          content: "it('prevents bt-9831 from recurring', () => {})",
        },
        {
          path: "src/unrelated.test.ts",
          content: "it('covers another behavior', () => {})",
        },
      ]),
    ).toEqual(["src/refund.test.ts"]);
  });
});

describe("provesIncidentTestExecution", () => {
  it("rejects a linked test file when the incident case was only skipped", () => {
    expect(
      provesIncidentTestExecution(
        "bt-9831",
        "refund.test.ts > prevents bt-9831 (skipped)\nTests 1 skipped",
      ),
    ).toBe(false);
  });

  it("accepts runner output that names the incident and a passing test", () => {
    expect(
      provesIncidentTestExecution(
        "bt-9831",
        "✓ refund.test.ts > prevents bt-9831 from recurring\nTests 1 passed (1)",
      ),
    ).toBe(true);
  });

  it("rejects a skipped incident case when an unrelated case passes", () => {
    expect(
      provesIncidentTestExecution(
        "bt-9831",
        "- prevents bt-9831 (skipped)\n✓ calculates tax\nTests 1 passed | 1 skipped",
      ),
    ).toBe(false);
  });

  it.each([
    "ok 1 - prevents INC.284 from recurring\n# tests 1\n# pass 1\n# fail 0",
    "✔ prevents INC.284 from recurring\nℹ tests 1\nℹ pass 1\nℹ fail 0",
  ])(
    "accepts native Node test output that proves the incident passed",
    (output) => {
      expect(provesIncidentTestExecution("INC.284", output)).toBe(true);
    },
  );
});

describe("createIncidentTestCommand", () => {
  it("targets a linked Vitest file with verbose runner output", () => {
    expect(
      createIncidentTestCommand(
        "pnpm",
        JSON.stringify({ scripts: { test: "vitest run" } }),
        "src/refund.test.ts",
        "bt-9831",
      ),
    ).toMatchObject({
      id: "incident-regression:src/refund.test.ts",
      capabilities: ["repository-tests"],
      execution: {
        executable: "pnpm",
        args: [
          "run",
          "test",
          "--",
          "src/refund.test.ts",
          "--reporter=verbose",
          "--testNamePattern=bt-9831",
        ],
      },
    });
  });

  it("treats regex metacharacters in incident identifiers as literals", () => {
    expect(
      createIncidentTestCommand(
        "pnpm",
        JSON.stringify({ scripts: { test: "vitest run" } }),
        "src/refund.test.ts",
        "bt.9831[retry]",
      ),
    ).toMatchObject({
      execution: {
        args: [
          "run",
          "test",
          "--",
          "src/refund.test.ts",
          "--reporter=verbose",
          "--testNamePattern=bt\\.9831\\[retry\\]",
        ],
      },
    });
  });

  it("targets a linked test with Node's repository-owned test runner", () => {
    expect(
      createIncidentTestCommand(
        "npm",
        JSON.stringify({ scripts: { test: "node --test" } }),
        "test/refund.test.js",
        "INC.284",
      ),
    ).toMatchObject({
      execution: {
        executable: "npm",
        args: [
          "run",
          "test",
          "--",
          "--test-name-pattern=INC\\.284",
          "test/refund.test.js",
        ],
      },
    });
  });

  it("passes the linked path to a repository-owned test wrapper", () => {
    expect(
      createIncidentTestCommand(
        "pnpm",
        JSON.stringify({ scripts: { test: "./scripts/test-ci" } }),
        "tests/refund.spec.ts",
        "INC-284",
      ),
    ).toMatchObject({
      execution: {
        executable: "pnpm",
        args: ["run", "test", "--", "tests/refund.spec.ts"],
      },
    });
  });
});

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

describe("assertVerificationPassed", () => {
  it("accepts a fully passing verification result", () => {
    expect(() =>
      assertVerificationPassed({ status: "passed", commands: [] }),
    ).not.toThrow();
  });

  it("rejects publication with the failing command", () => {
    expect(() =>
      assertVerificationPassed({
        status: "failed",
        commands: [
          {
            id: "test",
            label: "Run test",
            command: "pnpm run test",
            timeoutMs: 300_000,
            capabilities: ["repository-tests"],
            exitCode: 1,
            output: "one test failed",
          },
        ],
      }),
    ).toThrow("pnpm run test");
  });

  it("blocks incident publication without a linked changed regression test", () => {
    expect(() =>
      assertVerificationPassed(
        {
          status: "passed",
          commands: [
            {
              id: "lint",
              label: "Run lint",
              command: "pnpm run lint",
              timeoutMs: 300_000,
              capabilities: ["static-analysis"],
              exitCode: 0,
              output: "",
            },
          ],
        },
        { incidentExternalId: "bt-9831" },
      ),
    ).toThrow("linked behavioral regression");
  });

  it("reports missing execution proof even when the direct runner exits zero", () => {
    expect(() =>
      assertVerificationPassed(
        {
          status: "failed",
          behavioralEvidence: {
            incidentExternalId: "bt-9831",
            testPaths: [],
          },
          commands: [
            {
              id: "incident-regression:src/refund.test.ts",
              label: "Run linked regression",
              command: "pnpm run test -- src/refund.test.ts",
              timeoutMs: 300_000,
              capabilities: ["repository-tests"],
              exitCode: 0,
              output: "Tests 1 skipped",
            },
          ],
        },
        { incidentExternalId: "bt-9831" },
      ),
    ).toThrow("linked behavioral regression");
  });

  it.each(["test", "check"])(
    "accepts incident publication after a linked passing %s command",
    (id) => {
      expect(() =>
        assertVerificationPassed(
          {
            status: "passed",
            behavioralEvidence: {
              incidentExternalId: "bt-9831",
              testPaths: ["src/refund.test.ts"],
            },
            commands: [
              {
                id,
                label: `Run ${id}`,
                command: `pnpm run ${id}`,
                timeoutMs: 300_000,
                capabilities: ["repository-tests", "behavioral-regression"],
                exitCode: 0,
                output: "",
              },
            ],
          },
          { incidentExternalId: "bt-9831" },
        ),
      ).not.toThrow();
    },
  );
});

describe("createVerificationPlan", () => {
  it("selects an explicit test command for incident verification", () => {
    expect(
      createVerificationPlan(
        ["package.json", "pnpm-lock.yaml"],
        JSON.stringify({
          scripts: {
            check: "pnpm lint && pnpm test",
            test: "vitest run",
          },
        }),
        { requireRepositoryTests: true },
      ).commands.map(({ id }) => id),
    ).toEqual(["test"]);
  });

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
