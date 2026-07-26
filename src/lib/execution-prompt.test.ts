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
    expect(prompt).toContain("Prioritize the onboarding path.");
    expect(prompt).toContain("New users finish onboarding.");
    expect(prompt).toContain("The onboarding route is verified.");
    expect(prompt).toContain("The onboarding integration test passes.");
    expect(prompt).toContain("Create onboarding route");
    expect(prompt).toContain(
      "create src/app/onboarding/page.tsx. Confidence: 90%. Evidence: Owns onboarding.",
    );
    expect(prompt).not.toContain("[object Object]");
  });

  it("renders unresolved decisions and risks as explicit execution context", () => {
    const context = executionContext();
    context.plan.decisions = [
      {
        id: "auth-provider",
        question: "Which authentication provider remains supported?",
        context: "Existing users depend on Clerk.",
        options: [
          { id: "clerk", label: "Keep Clerk", tradeoff: "Existing dependency" },
          { id: "custom", label: "Build auth", tradeoff: "More control" },
        ],
        recommendedOptionId: "clerk",
      },
    ];
    context.plan.risks = [
      {
        id: "session-regression",
        title: "Session regression",
        detail: "Changing auth may invalidate active sessions.",
        severity: "high",
        mitigation: "Preserve the existing Clerk integration.",
      },
    ];

    const prompt = buildExecutionContextPrompt(context);

    expect(prompt).toContain(
      "Which authentication provider remains supported?",
    );
    expect(prompt).toContain("Context: Existing users depend on Clerk.");
    expect(prompt).toContain("Keep Clerk: Existing dependency");
    expect(prompt).toContain("Build auth: More control");
    expect(prompt).toContain("Recommended option: clerk");
    expect(prompt).toContain("HIGH Session regression");
    expect(prompt).toContain("Changing auth may invalidate active sessions.");
    expect(prompt).toContain("Preserve the existing Clerk integration.");
  });

  it("preserves Critical Path dependencies and estimates", () => {
    const context = executionContext();
    context.plan.criticalPath.push({
      id: "integration-test",
      title: "Verify onboarding",
      detail: "Exercise the completed route.",
      status: "blocked",
      sourceType: "repository",
      sourceNumber: null,
      dependencyIds: ["route"],
      estimatedMinutes: 30,
    });

    const prompt = buildExecutionContextPrompt(context);

    expect(prompt).toContain("integration-test [blocked] Verify onboarding");
    expect(prompt).toContain("Depends on: route");
    expect(prompt).toContain("Estimate: 30 minutes");
  });

  it("never exceeds the execution prompt budget", () => {
    const context = executionContext();
    context.instruction = "instruction ".repeat(2_000);
    context.objective = "objective ".repeat(2_000);
    context.repositoryPaths = Array.from(
      { length: 200 },
      (_, index) => `src/generated/${index}/${"deep/".repeat(80)}file.ts`,
    );

    expect(buildExecutionContextPrompt(context).length).toBeLessThanOrEqual(
      18_000,
    );
  });
});
