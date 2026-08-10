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
        reviewedSha: "1111111111111111111111111111111111111111",
        workspaceVersion: 3,
        verification: {
          status: "passed",
          commands: [
            {
              id: "test",
              label: "Tests",
              command: "pnpm test",
              timeoutMs: 120_000,
              exitCode: 0,
              output: "12 tests passed",
            },
          ],
        },
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

  it("renders the reviewed snapshot and independent checks as evidence", () => {
    const draft = buildPullRequestDraft({
      owner: "acme",
      repo: "checkout",
      head: "morphic/run-123",
      base: "main",
      objective: "Prevent duplicate charges",
      instruction: "Add idempotency to checkout",
      runId: "run-123",
      summary: null,
      reviewedSha: "1111111111111111111111111111111111111111",
      workspaceVersion: 3,
      verification: {
        status: "passed",
        commands: [
          {
            id: "test",
            label: "Tests",
            command: "pnpm test",
            timeoutMs: 120_000,
            exitCode: 0,
            output: "12 tests passed",
          },
        ],
      },
    });

    expect(draft.body).toContain("| Reviewed snapshot | `1111111` |");
    expect(draft.body).toContain("| Workspace Version | `v3` |");
    expect(draft.body).toContain("| `pnpm test` | Passed |");
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

  it("rejects unvalidated commit identifiers", () => {
    expect(() => assertBaseStillReviewed("main", "main")).toThrow(
      /full lowercase Git commit SHA/,
    );
  });
});
