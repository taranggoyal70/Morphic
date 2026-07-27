import { describe, expect, it } from "vitest";

import { buildAgentPullRequest } from "@/lib/pull-request";

describe("buildAgentPullRequest", () => {
  it("keeps the approved instruction, run evidence, and repository refs together", () => {
    const pullRequest = buildAgentPullRequest({
      owner: "taranggoyal70",
      repository: "example",
      branchName: "morphic/run-123",
      baseBranch: "main",
      objective: "Repair the checkout flow",
      instruction: "Add a regression test and fix the retry boundary.",
      runId: "run-123",
      summary: "Added coverage and bounded retry handling.",
    });

    expect(pullRequest).toMatchObject({
      owner: "taranggoyal70",
      repo: "example",
      head: "morphic/run-123",
      base: "main",
      title: "Morphic: Repair the checkout flow",
    });
    expect(pullRequest.body).toContain(
      "**Approved instruction:** Add a regression test and fix the retry boundary.",
    );
    expect(pullRequest.body).toContain(
      "**Summary:** Added coverage and bounded retry handling.",
    );
    expect(pullRequest.body).toContain("Run ID: `run-123`");
    expect(pullRequest.body).toContain(
      "explicitly approved, isolated agent run",
    );
  });

  it("caps GitHub's generated title while preserving the full approved instruction", () => {
    const longObjective = "A".repeat(220);
    const pullRequest = buildAgentPullRequest({
      owner: "taranggoyal70",
      repository: "example",
      branchName: "morphic/run-456",
      baseBranch: "main",
      objective: longObjective,
      instruction: "Keep this exact instruction.",
      runId: "run-456",
      summary: null,
    });

    expect(pullRequest.title).toHaveLength("Morphic: ".length + 180);
    expect(pullRequest.body).toContain(
      "**Approved instruction:** Keep this exact instruction.",
    );
    expect(pullRequest.body).not.toContain("**Summary:**");
  });
});
