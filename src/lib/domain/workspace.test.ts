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

  it("rejects duplicate Critical Path Item identifiers", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        criticalPath: [
          validPlan.criticalPath[0],
          { ...validPlan.criticalPath[0], title: "Duplicate route" },
        ],
      }),
    ).toThrow();
  });

  it("rejects Critical Path Items that depend on themselves", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        criticalPath: [
          {
            ...validPlan.criticalPath[0],
            dependencyIds: [validPlan.criticalPath[0].id],
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects dependencies that do not reference a Critical Path Item", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        criticalPath: [
          {
            ...validPlan.criticalPath[0],
            dependencyIds: ["missing-item"],
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects duplicate dependency references", () => {
    const prerequisite = {
      ...validPlan.criticalPath[0],
      id: "prerequisite",
      sourceNumber: 41,
    };
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        criticalPath: [
          prerequisite,
          {
            ...validPlan.criticalPath[0],
            dependencyIds: [prerequisite.id, prerequisite.id],
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects cycles in the Critical Path", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        criticalPath: [
          {
            ...validPlan.criticalPath[0],
            id: "design",
            sourceNumber: 41,
            dependencyIds: ["build"],
          },
          {
            ...validPlan.criticalPath[0],
            id: "build",
            dependencyIds: ["design"],
          },
        ],
      }),
    ).toThrow();
  });

  it("requires source numbers only for issue and pull request evidence", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        criticalPath: [
          {
            ...validPlan.criticalPath[0],
            sourceType: "issue",
            sourceNumber: null,
          },
        ],
      }),
    ).toThrow();
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        criticalPath: [
          {
            ...validPlan.criticalPath[0],
            sourceType: "repository",
            sourceNumber: 42,
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects duplicate repository impact paths", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        repositoryImpact: [
          validPlan.repositoryImpact[0],
          { ...validPlan.repositoryImpact[0], reason: "Duplicate evidence." },
        ],
      }),
    ).toThrow();
  });

  it("rejects duplicate Open Decision identifiers", () => {
    const decision = {
      id: "hosting",
      question: "Where should the service run?",
      context: "The runtime affects operations.",
      options: [
        { id: "a", label: "Option A", tradeoff: "Simpler operations." },
        { id: "b", label: "Option B", tradeoff: "More control." },
      ],
      recommendedOptionId: "a",
    };
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        decisions: [decision, { ...decision, question: "Duplicate decision" }],
      }),
    ).toThrow();
  });

  it("rejects duplicate options inside an Open Decision", () => {
    const option = {
      id: "keep",
      label: "Keep the current provider",
      tradeoff: "Avoids migration work.",
    };
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        decisions: [
          {
            id: "provider",
            question: "Which provider should remain?",
            context: "The choice affects the delivery path.",
            options: [option, { ...option, label: "Duplicate option" }],
            recommendedOptionId: option.id,
          },
        ],
      }),
    ).toThrow();
  });

  it("requires an Open Decision recommendation to reference an option", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        decisions: [
          {
            id: "provider",
            question: "Which provider should remain?",
            context: "The choice affects the delivery path.",
            options: [
              { id: "a", label: "Option A", tradeoff: "Less migration." },
              { id: "b", label: "Option B", tradeoff: "More control." },
            ],
            recommendedOptionId: "missing",
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects duplicate Risk identifiers", () => {
    const risk = {
      id: "schedule",
      title: "Schedule pressure",
      detail: "The review target is close.",
      severity: "high",
      mitigation: "Reduce the initial scope.",
    } as const;
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        risks: [risk, { ...risk, title: "Duplicate risk" }],
      }),
    ).toThrow();
  });

  it("rejects duplicate Adaptive Workspace modules", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        interface: {
          ...validPlan.interface,
          moduleOrder: [
            "outcome",
            "critical_path",
            "critical_path",
            "repository_impact",
          ],
        },
      }),
    ).toThrow();
  });

  it("requires the primary module to appear in the Adaptive Workspace", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        interface: {
          ...validPlan.interface,
          primaryModule: "risks",
          moduleOrder: [
            "outcome",
            "critical_path",
            "repository_impact",
            "decisions",
          ],
        },
      }),
    ).toThrow();
  });

  it("rejects duplicate Outcome completion criteria", () => {
    expect(() =>
      workspacePlanSchema.parse({
        ...validPlan,
        outcome: {
          ...validPlan.outcome,
          definitionOfDone: [
            "The onboarding route exists.",
            "The onboarding route exists.",
          ],
        },
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

  it("rejects review targets that are already in the past", () => {
    expect(() =>
      createWorkspaceSchema.parse({
        repositoryId: crypto.randomUUID(),
        objective: "Ship a reviewable onboarding outcome",
        targetDate: "2020-01-01T00:00:00.000Z",
        constraints: [],
      }),
    ).toThrow();
  });

  it("deduplicates guardrails without case sensitivity", () => {
    const parsed = createWorkspaceSchema.parse({
      repositoryId: crypto.randomUUID(),
      objective: "Ship a reviewable onboarding outcome",
      constraints: [
        "No auth changes",
        "no auth changes",
        "Keep the API stable",
      ],
    });

    expect(parsed.constraints).toEqual([
      "No auth changes",
      "Keep the API stable",
    ]);
  });

  it("normalizes repeated whitespace in user-authored inputs", () => {
    const parsed = createWorkspaceSchema.parse({
      repositoryId: crypto.randomUUID(),
      objective: "  Ship   a reviewable\n onboarding outcome  ",
      constraints: ["  Keep   the API\n stable  "],
    });

    expect(parsed.objective).toBe("Ship a reviewable onboarding outcome");
    expect(parsed.constraints).toEqual(["Keep the API stable"]);
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
