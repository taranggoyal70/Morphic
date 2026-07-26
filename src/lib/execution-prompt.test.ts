import { describe, expect, it } from "vitest";

import type { ExecutionContext } from "@/lib/domain/execution-context";
import { buildExecutionContextPrompt } from "@/lib/execution-prompt";

function executionContext(): ExecutionContext {
  return {
    runId: "run-1",
    workspaceId: "workspace-1",
    workspaceVersionId: "version-1",
    workspaceVersion: 3,
    repositorySnapshotId: "snapshot-1",
    repositoryFullName: "acme/product",
    repositoryBranch: "main",
    repositoryHeadSha: "a".repeat(40),
    objective: "Ship reliable onboarding",
    targetDate: "2026-08-01T00:00:00.000Z",
    constraints: ["Preserve the existing sign-in route"],
    instruction: "Implement the approved onboarding route.",
    plan: {
      summary: "Prioritize the onboarding path.",
      outcome: {
        statement: "New users finish onboarding.",
        definitionOfDone: ["The onboarding route is verified."],
        successSignal: "The onboarding integration test passes.",
      },
      criticalPath: [
        {
          id: "route",
          title: "Create onboarding route",
          detail: "Implement the route backed by the existing issue.",
          status: "todo",
          sourceType: "issue",
          sourceNumber: 42,
          dependencyIds: [],
          estimatedMinutes: 60,
        },
      ],
      repositoryImpact: [
        {
          path: "src/app/onboarding/page.tsx",
          reason: "Owns onboarding.",
          changeKind: "create",
          confidence: 0.9,
        },
      ],
      decisions: [],
      risks: [],
      interface: {
        primaryModule: "critical_path",
        moduleOrder: [
          "outcome",
          "critical_path",
          "repository_impact",
          "decisions",
        ],
        density: "comfortable",
      },
    },
    repositoryPaths: ["src/app/onboarding/page.tsx"],
  };
}

describe("buildExecutionContextPrompt", () => {
  it("renders the exact reviewed evidence and approved work", () => {
    const prompt = buildExecutionContextPrompt(executionContext());

    expect(prompt).toContain("Repository: acme/product");
    expect(prompt).toContain(`Reviewed commit: ${"a".repeat(40)}`);
    expect(prompt).toContain("Workspace Version: 3");
    expect(prompt).toContain("Preserve the existing sign-in route");
    expect(prompt).toContain("Create onboarding route");
    expect(prompt).toContain("src/app/onboarding/page.tsx");
    expect(prompt).not.toContain("[object Object]");
  });
});
