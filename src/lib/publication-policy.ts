import type { IncidentEvidence } from "@/lib/domain/incident";
import type { VerificationResult } from "@/lib/domain/verification";
import { repositoryCommitShaSchema } from "@/lib/domain/execution-context";

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
  const reviewed = repositoryCommitShaSchema.parse(reviewedSha);
  const current = repositoryCommitShaSchema.parse(currentBaseSha);
  if (current !== reviewed) {
    throw new Error(
      "Publication was blocked because the base branch advanced since the Repository Snapshot was reviewed.",
    );
  }
  return current;
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
  reviewedSha: string;
  workspaceVersion: number;
  incident?: IncidentEvidence | null;
  verification: VerificationResult;
}) {
  const verificationRows = input.verification.commands.map(
    (command) =>
      `| \`${command.command}\` | ${command.exitCode === 0 ? "Passed" : `Failed (${command.exitCode})`} |`,
  );
  const incidentSection = input.incident
    ? [
        "## Production incident",
        "",
        `**Evidence:** \`${input.incident.externalId}\` from ${input.incident.source}`,
        `**Title:** ${input.incident.title}`,
        `**Observed behavior:** ${input.incident.observedBehavior}`,
        `**Expected behavior:** ${input.incident.expectedBehavior}`,
        input.incident.traceUrl ? `**Trace:** ${input.incident.traceUrl}` : "",
        "",
        "### Acceptance criteria",
        "",
        ...input.incident.acceptanceCriteria.map(
          (criterion) => `- [ ] ${criterion}`,
        ),
        "",
      ]
    : [];
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
      ...incidentSection,
      "## Execution evidence",
      "",
      "| Evidence | Value |",
      "| --- | --- |",
      `| Reviewed snapshot | \`${input.reviewedSha.slice(0, 7)}\` |`,
      `| Workspace Version | \`v${input.workspaceVersion}\` |`,
      `| Independent verification | ${input.verification.status === "passed" ? "Passed" : "Failed"} |`,
      "",
      "| Verification command | Result |",
      "| --- | --- |",
      ...verificationRows,
      "",
      `Run ID: \`${input.runId}\``,
      "",
      "This draft pull request was created from an explicitly approved, isolated agent run.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
