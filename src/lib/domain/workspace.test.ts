import { describe, expect, it } from "vitest";

import {
  adaptWorkspaceSchema,
  createCodexRunSchema,
  createWorkspaceSchema,
  workspacePlanSchema,
} from "./workspace";

const validPlan = {
  summary: "A grounded plan.",
  outcome: {
    statement: "Users complete onboarding.",
    definitionOfDone: ["The onboarding route exists."],
    successSignal: "A verified end-to-end test passes.",
  },
  criticalPath: [
    {
      id: "onboarding-route",
      title: "Create onboarding route",
      detail: "Implement the existing issue.",
      status: "todo",
      sourceType: "issue",
      sourceNumber: 42,
      dependencyIds: [],
      estimatedMinutes: 90,
    },
  ],
  repositoryImpact: [
    {
      path: "src/app/onboarding/page.tsx",
      reason: "This route owns the onboarding experience.",
      changeKind: "create",
      confidence: 0.85,
    },
  ],
  decisions: [],
  risks: [],
  interface: {
    primaryModule: "critical_path",
    moduleOrder: ["outcome", "critical_path", "repository_impact", "decisions"],
    density: "comfortable",
  },
} as const;

describe("workspace domain contracts", () => {
  it("accepts a grounded adaptive workspace plan", () => {
    expect(workspacePlanSchema.parse(validPlan)).toEqual(validPlan);
  });

  it("rejects confidence outside the supported range", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        repositoryImpact: [
          { ...validPlan.repositoryImpact[0], confidence: 1.2 },
        ],
      }),
    ).toThrow();
  });

  it("requires a concrete objective", () => {
    expect(() =>
      createWorkspaceSchema.parse({
        repositoryId: crypto.randomUUID(),
        objective: "AI",
        constraints: [],
      }),
    ).toThrow();
  });

  it("requires explicit approval for every Codex proposal", () => {
    const base = {
      workspaceId: crypto.randomUUID(),
      instruction: "Implement the approved onboarding route.",
    };
    expect(() =>
      createCodexRunSchema.parse({ ...base, approvalRequired: false }),
    ).toThrow();
    expect(
      createCodexRunSchema.parse({ ...base, approvalRequired: true }),
    ).toMatchObject({ approvalRequired: true });
  });

  it("bounds adaptation commands", () => {
    expect(
      adaptWorkspaceSchema.parse({ command: "Prioritize security." }),
    ).toMatchObject({
      command: "Prioritize security.",
    });
    expect(() => adaptWorkspaceSchema.parse({ command: "" })).toThrow();
  });
});
