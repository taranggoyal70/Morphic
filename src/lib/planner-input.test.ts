import { describe, expect, it } from "vitest";

import { compactPlannerInput, type PlannerInput } from "@/lib/planner-input";

function plannerInput(): PlannerInput {
  return {
    userId: "user_123",
    objective: "Ship reliable onboarding",
    targetDate: new Date("2026-07-20T00:00:00.000Z"),
    constraints: ["Preserve existing routes"],
    repository: {
      fullName: "acme/product",
      defaultBranch: "main",
    },
    snapshot: {
      headSha: "head-sha",
      issues: [
        {
          number: 42,
          title: "Add onboarding",
          state: "open",
          labels: ["product"],
          assignees: ["octocat"],
          updatedAt: "2026-07-01T00:00:00.000Z",
          url: "https://github.com/acme/product/issues/42",
        },
      ],
      pullRequests: [
        {
          number: 43,
          title: "Draft onboarding",
          state: "open",
          draft: true,
          head: "onboarding",
          base: "main",
          updatedAt: "2026-07-02T00:00:00.000Z",
          url: "https://github.com/acme/product/pull/43",
        },
      ],
      tree: [
        {
          path: "src/app/onboarding/page.tsx",
          type: "blob",
          sha: "blob-sha",
          size: 12_345,
        },
      ],
    },
  };
}

describe("compactPlannerInput", () => {
  it("keeps planning evidence while removing token-heavy transport metadata", () => {
    const compact = compactPlannerInput(plannerInput());

    expect(compact.snapshot.issues[0]).not.toHaveProperty("url");
    expect(compact.snapshot.issues[0]).not.toHaveProperty("updatedAt");
    expect(compact.snapshot.pullRequests[0]).not.toHaveProperty("url");
    expect(compact.snapshot.tree[0]).toEqual({
      path: "src/app/onboarding/page.tsx",
      type: "blob",
    });
    expect(JSON.stringify(compact)).not.toContain("user_123");
  });

  it("serializes the target date for the provider", () => {
    expect(compactPlannerInput(plannerInput()).targetDate).toBe(
      "2026-07-20T00:00:00.000Z",
    );
  });

  it("bounds pathologically long strings to protect the token budget", () => {
    const input = plannerInput();
    input.objective = "x".repeat(5_000);
    input.snapshot.issues[0].title = "y".repeat(500);
    const compact = compactPlannerInput(input);
    expect(compact.objective.length).toBe(1_000);
    expect(compact.objective.endsWith("…")).toBe(true);
    expect(compact.snapshot.issues[0].title.length).toBe(200);
  });
});
