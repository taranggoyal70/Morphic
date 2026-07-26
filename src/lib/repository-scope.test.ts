import { describe, expect, it } from "vitest";

import { selectRepositoryScope } from "@/lib/repository-scope";

describe("selectRepositoryScope", () => {
  it("prioritizes accepted repository impact and matching task language", () => {
    const scope = selectRepositoryScope({
      instruction: "Implement and verify the onboarding route",
      objective: "Ship reliable onboarding",
      repositoryImpactPaths: ["src/app/onboarding/page.tsx"],
      snapshotPaths: [
        "README.md",
        "src/app/billing/page.tsx",
        "src/app/onboarding/page.tsx",
        "src/app/onboarding/onboarding.test.tsx",
        "src/lib/auth.ts",
      ],
      limit: 3,
    });

    expect(scope.paths).toEqual([
      "src/app/onboarding/page.tsx",
      "src/app/onboarding/onboarding.test.tsx",
      "src/app/billing/page.tsx",
    ]);
    expect(scope.totalPathCount).toBe(5);
    expect(scope.selectedPathCount).toBe(3);
    expect(scope.savedPercent).toBe(40);
  });

  it("is deterministic across snapshot order and duplicate paths", () => {
    const input = {
      instruction: "Repair the billing webhook",
      objective: "Restore billing",
      repositoryImpactPaths: ["src/api/billing/webhook.ts"],
      limit: 2,
    };
    const forward = selectRepositoryScope({
      ...input,
      snapshotPaths: [
        "src/lib/billing.ts",
        "src/api/billing/webhook.ts",
        "src/lib/billing.ts",
      ],
    });
    const reverse = selectRepositoryScope({
      ...input,
      snapshotPaths: [
        "src/lib/billing.ts",
        "src/api/billing/webhook.ts",
      ].reverse(),
    });

    expect(forward).toEqual(reverse);
    expect(forward.paths).toEqual([
      "src/api/billing/webhook.ts",
      "src/lib/billing.ts",
    ]);
  });

  it("returns an auditable empty result for an empty snapshot", () => {
    expect(
      selectRepositoryScope({
        instruction: "Update onboarding",
        objective: "Ship onboarding",
        repositoryImpactPaths: [],
        snapshotPaths: [],
      }),
    ).toMatchObject({
      paths: [],
      totalPathCount: 0,
      selectedPathCount: 0,
      savedPercent: 0,
    });
  });
});
