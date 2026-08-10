import type { IncidentEvidence } from "@/lib/domain/incident";
import type { WorkspacePlan } from "@/lib/domain/workspace";

export function assertIncidentPlanCoverage(
  plan: WorkspacePlan,
  incident: IncidentEvidence | null | undefined,
) {
  const binding = plan.incidentRegression;
  if (!incident) {
    if (binding !== null) {
      throw new Error(
        "A general workspace plan cannot claim an incident regression binding.",
      );
    }
    return plan;
  }
  if (!binding) {
    throw new Error(
      "The incident plan does not bind its behavioral acceptance criteria.",
    );
  }
  if (binding.incidentExternalId !== incident.externalId) {
    throw new Error(
      "The incident plan is bound to a different incident identifier.",
    );
  }
  for (const criterion of incident.acceptanceCriteria) {
    if (!binding.acceptanceCriteria.includes(criterion)) {
      throw new Error(
        `The incident plan omitted acceptance criterion: ${criterion}`,
      );
    }
  }
  if (
    binding.acceptanceCriteria.length !== incident.acceptanceCriteria.length
  ) {
    throw new Error(
      "The incident plan must preserve exactly the accepted incident criteria.",
    );
  }
  if (
    !plan.criticalPath.some((item) => item.id === binding.criticalPathItemId)
  ) {
    throw new Error(
      "The incident plan does not link its acceptance criteria to a Critical Path Item.",
    );
  }
  return plan;
}
