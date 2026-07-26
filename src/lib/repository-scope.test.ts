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
});
