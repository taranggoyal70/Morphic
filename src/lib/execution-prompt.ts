import type { ExecutionContext } from "@/lib/domain/execution-context";

const MAX_EXECUTION_PROMPT_CHARS = 18_000;
const MAX_LINE_CHARS = 600;

function bounded(value: string, max = MAX_LINE_CHARS) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= max
    ? normalized
    : `${normalized.slice(0, max - 1)}…`;
}

function bullets(values: string[], empty = "- None") {
  if (values.length === 0) return empty;
  return values.map((value) => `- ${bounded(value)}`).join("\n");
}

export function buildExecutionContextPrompt(context: ExecutionContext) {
  const plan = context.plan;
  const sections = [
    `Repository: ${context.repositoryFullName}`,
    `Reviewed branch: ${context.repositoryBranch}`,
    `Reviewed commit: ${context.repositoryHeadSha}`,
    `Workspace Version: ${context.workspaceVersion}`,
    `Workspace Version ID: ${context.workspaceVersionId}`,
    `Repository Snapshot ID: ${context.repositorySnapshotId}`,
    "",
    "Approved instruction",
    bounded(context.instruction, 4_000),
    "",
    "Objective",
    bounded(context.objective, 1_000),
    context.targetDate ? `Target date: ${context.targetDate}` : "Target date: none",
    "",
    "Constraints",
    bullets(context.constraints),
    "",
    "Accepted plan summary",
    bounded(plan.summary),
    "",
    "Accepted Outcome",
    bounded(plan.outcome.statement),
    "",
    "Definition of done",
    bullets(plan.outcome.definitionOfDone),
    "",
    `Success signal: ${bounded(plan.outcome.successSignal)}`,
    "",
    "Critical Path",
    bullets(
      plan.criticalPath.map(
        (item) =>
          `${item.id} [${item.status}] ${item.title}: ${item.detail}` +
          (item.sourceNumber ? ` Source: #${item.sourceNumber}.` : "") +
          (item.dependencyIds.length > 0
            ? ` Depends on: ${item.dependencyIds.join(", ")}.`
            : "") +
          (item.estimatedMinutes
            ? ` Estimate: ${item.estimatedMinutes} minutes.`
            : ""),
      ),
    ),
    "",
    "Repository impact",
    bullets(
      plan.repositoryImpact.map(
        (item) =>
          `${item.changeKind} ${item.path} (${Math.round(item.confidence * 100)}%): ${item.reason}`,
      ),
    ),
    "",
    "Open Decisions",
    bullets(
      plan.decisions.map(
        (decision) =>
          `${decision.id}: ${decision.question} Recommended option: ${decision.recommendedOptionId}.`,
      ),
    ),
    "",
    "Risks",
    bullets(
      plan.risks.map(
        (risk) =>
          `${risk.severity.toUpperCase()} ${risk.title}: ${risk.detail} Mitigation: ${risk.mitigation}`,
      ),
    ),
    "",
    "Stored Repository Snapshot paths",
    bullets(context.repositoryPaths.slice(0, 80)),
    "",
    "Work only against the reviewed commit above. Treat this accepted Workspace Version as the authorization boundary. Implement the approved instruction, inspect the final diff, run relevant verification, and call finish only when the change is complete.",
  ];

  const prompt = sections.join("\n");
  return prompt.length <= MAX_EXECUTION_PROMPT_CHARS
    ? prompt
    : `${prompt.slice(0, MAX_EXECUTION_PROMPT_CHARS - 1)}…`;
}
