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
  incidentRegression: null,
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

  it("accepts a redacted production incident with measurable acceptance criteria", () => {
    const incident = {
      source: "braintrust",
      externalId: "bt-9831",
      title: "Refund assistant repeated a customer credit",
      observedBehavior: "A retried webhook issued two credits.",
      expectedBehavior: "A retried webhook issues exactly one credit.",
      occurredAt: "2026-08-07T14:32:00.000Z",
      traceUrl: "https://braintrust.dev/app/acme/p/trace/bt-9831",
      acceptanceCriteria: [
        "Replaying the same webhook issues exactly one credit.",
        "The regression is covered by a repository-owned test.",
      ],
      redactionConfirmed: true,
    } as const;

    expect(
      createWorkspaceSchema.parse({
        repositoryId: crypto.randomUUID(),
        objective: "Prevent duplicate credits on retried support actions",
        constraints: [],
        incident,
      }).incident,
    ).toEqual(incident);
  });

  it("rejects incident evidence before redaction is confirmed", () => {
    expect(() =>
      createWorkspaceSchema.parse({
        repositoryId: crypto.randomUUID(),
        objective: "Prevent duplicate credits on retried support actions",
        constraints: [],
        incident: {
          source: "manual",
          externalId: "INC-284",
          title: "Refund assistant repeated a customer credit",
          observedBehavior: "A retried webhook issued two credits.",
          expectedBehavior: "A retried webhook issues exactly one credit.",
          occurredAt: "2026-08-07T14:32:00.000Z",
          traceUrl: null,
          acceptanceCriteria: [
            "Replaying the same webhook issues exactly one credit.",
          ],
          redactionConfirmed: false,
        },
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
