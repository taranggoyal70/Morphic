export function buildAgentPullRequest(input: {
  owner: string;
  repository: string;
  branchName: string;
  baseBranch: string;
  objective: string;
  instruction: string;
  runId: string;
  summary: string | null;
}) {
  return {
    owner: input.owner,
    repo: input.repository,
    head: input.branchName,
    base: input.baseBranch,
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
      "This pull request was created from an explicitly approved, isolated agent run.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
