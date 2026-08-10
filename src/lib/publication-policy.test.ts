import { describe, expect, it } from "vitest";

import {
  assertBaseStillReviewed,
  assertPublishablePaths,
  buildPullRequestDraft,
} from "@/lib/publication-policy";

describe("assertPublishablePaths", () => {
  it("accepts normalized repository-relative paths", () => {
    expect(
      assertPublishablePaths(["src/app/page.tsx", ".github/ci.yml"]),
    ).toEqual(["src/app/page.tsx", ".github/ci.yml"]);
  });

  it.each([[["/etc/passwd"]], [["../outside"]], [["src/../secret"]], [[""]]])(
    "rejects a path outside the repository contract",
    (paths) => {
      expect(() => assertPublishablePaths(paths)).toThrow();
    },
  );
});

describe("buildPullRequestDraft", () => {
  it("always creates an explicitly reviewable draft", () => {
    expect(
      buildPullRequestDraft({
        owner: "acme",
        repo: "checkout",
        head: "morphic/run-123",
        base: "main",
        objective: "Prevent duplicate charges",
        instruction: "Add idempotency to checkout",
        runId: "run-123",
        summary: "Added an idempotency key to payment requests.",
      }),
    ).toMatchObject({
      owner: "acme",
      repo: "checkout",
      head: "morphic/run-123",
      base: "main",
      draft: true,
      title: "Morphic: Prevent duplicate charges",
    });
  });
});

describe("assertBaseStillReviewed", () => {
  it("blocks publication when the reviewed base branch has advanced", () => {
    expect(() =>
      assertBaseStillReviewed(
        "1111111111111111111111111111111111111111",
        "2222222222222222222222222222222222222222",
      ),
    ).toThrow(/advanced since the Repository Snapshot was reviewed/);
  });

  it("accepts the exact reviewed commit", () => {
    const sha = "1111111111111111111111111111111111111111";
    expect(assertBaseStillReviewed(sha, sha)).toBe(sha);
  });
});
