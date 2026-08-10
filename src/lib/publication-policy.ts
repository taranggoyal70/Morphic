export function assertPublishablePaths(paths: string[]) {
  for (const path of paths) {
    if (
      !path ||
      path.startsWith("/") ||
      path === ".." ||
      path.startsWith("../") ||
      path.includes("/../") ||
      path.includes("\0")
    ) {
      throw new Error(
        `Publication was blocked because the diff contains an invalid repository path: ${JSON.stringify(path)}.`,
      );
    }
  }
  return paths;
}

export function assertBaseStillReviewed(
  reviewedSha: string,
  currentBaseSha: string,
) {
  if (currentBaseSha !== reviewedSha) {
    throw new Error(
      "Publication was blocked because the base branch advanced since the Repository Snapshot was reviewed.",
    );
  }
  return currentBaseSha;
}

export function buildPullRequestDraft(input: {
  owner: string;
  repo: string;
  head: string;
  base: string;
  objective: string;
  instruction: string;
  runId: string;
  summary: string | null;
}) {
  return {
    owner: input.owner,
    repo: input.repo,
    head: input.head,
    base: input.base,
    draft: true,
    title: `Morphic: ${input.objective.slice(0, 180)}`,
    body: [
      "## Morphic agent run",
      "",
      `**Approved instruction:** ${input.instruction}`,
      "",
      input.summary ? `**Summary:** ${input.summary}` : "",
      "",
      `Run ID: \`${input.runId}\``,
      "",
      "This draft pull request was created from an explicitly approved, isolated agent run.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
