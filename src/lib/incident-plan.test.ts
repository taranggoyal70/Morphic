import { describe, expect, it } from "vitest";

import type { IncidentEvidence } from "@/lib/domain/incident";
import type { WorkspacePlan } from "@/lib/domain/workspace";
import { assertIncidentPlanCoverage } from "@/lib/incident-plan";

const incident: IncidentEvidence = {
  source: "braintrust",
  externalId: "bt-9831",
  title: "Refund assistant repeated a customer credit",
  observedBehavior: "A retried webhook issued two credits.",
  expectedBehavior: "A retried webhook issues exactly one credit.",
  occurredAt: "2026-08-07T14:32:00.000Z",
  traceUrl: null,
  acceptanceCriteria: [
    "Replaying the same webhook issues exactly one credit.",
    "The regression is covered by a repository-owned test.",
  ],
  redactionConfirmed: true,
};

const plan = {
  summary: "Prevent the refund incident from recurring.",
  outcome: {
    statement: "Retried refund actions are idempotent.",
    definitionOfDone: ["The refund regression passes."],
    successSignal: "Repository tests pass.",
  },
  criticalPath: [
    {
      id: "refund-regression",
      title: "Add refund regression",
      detail: "Reproduce the duplicate credit and prove idempotency.",
      status: "todo",
      sourceType: "inferred",
      sourceNumber: null,
      dependencyIds: [],
      estimatedMinutes: 60,
    },
  ],
  repositoryImpact: [],
  decisions: [],
  risks: [],
  interface: {
    primaryModule: "critical_path",
    moduleOrder: ["outcome", "critical_path", "repository_impact", "decisions"],
    density: "comfortable",
  },
  incidentRegression: {
    incidentExternalId: "bt-9831",
    acceptanceCriteria: [
      "Replaying the same webhook issues exactly one credit.",
    ],
    criticalPathItemId: "refund-regression",
  },
} as WorkspacePlan;

describe("assertIncidentPlanCoverage", () => {
  it("rejects an incident plan that omits an acceptance criterion", () => {
    expect(() => assertIncidentPlanCoverage(plan, incident)).toThrow(
      "acceptance criterion",
    );
  });

  it("accepts exact criteria linked to a real Critical Path Item", () => {
    const completePlan = {
      ...plan,
      incidentRegression: {
        incidentExternalId: incident.externalId,
        acceptanceCriteria: incident.acceptanceCriteria,
        criticalPathItemId: "refund-regression",
      },
    } as WorkspacePlan;

    expect(assertIncidentPlanCoverage(completePlan, incident)).toBe(
      completePlan,
    );
  });

  it("rejects criteria linked to a missing Critical Path Item", () => {
    const unlinkedPlan = {
      ...plan,
      incidentRegression: {
        incidentExternalId: incident.externalId,
        acceptanceCriteria: incident.acceptanceCriteria,
        criticalPathItemId: "missing-regression",
      },
    } as WorkspacePlan;

    expect(() => assertIncidentPlanCoverage(unlinkedPlan, incident)).toThrow(
      "Critical Path Item",
    );
  });
});
