import type {
  GitHubIssueEvidence,
  GitHubPullEvidence,
  RepositoryTreeEntry,
} from "@/db/schema";
import type { WorkspacePlan } from "@/lib/domain/workspace";

export type PlannerInput = {
  userId: string;
  objective: string;
  targetDate: Date | null;
  constraints: string[];
  repository: {
    fullName: string;
    defaultBranch: string;
  };
  snapshot: {
    headSha: string;
    issues: GitHubIssueEvidence[];
    pullRequests: GitHubPullEvidence[];
    tree: RepositoryTreeEntry[];
  };
  previousPlan?: WorkspacePlan;
  adaptationCommand?: string;
};

// Array lengths are capped below; these bound individual string lengths too, so
// a single pathological title or objective can't blow up the planner's token
// budget.
const MAX_TITLE = 200;
const MAX_TEXT = 1_000;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function compactPlannerInput(input: PlannerInput) {
  return {
    objective: truncate(input.objective, MAX_TEXT),
    targetDate: input.targetDate?.toISOString() ?? null,
    constraints: input.constraints.map((constraint) => truncate(constraint, MAX_TITLE)),
    repository: input.repository,
    snapshot: {
      headSha: input.snapshot.headSha,
      issues: input.snapshot.issues.slice(0, 100).map((issue) => ({
        number: issue.number,
        title: truncate(issue.title, MAX_TITLE),
        state: issue.state,
        labels: issue.labels,
        assignees: issue.assignees,
      })),
      pullRequests: input.snapshot.pullRequests.slice(0, 50).map((pull) => ({
        number: pull.number,
        title: truncate(pull.title, MAX_TITLE),
        state: pull.state,
        draft: pull.draft,
        head: pull.head,
        base: pull.base,
      })),
      tree: input.snapshot.tree.slice(0, 2_000).map((entry) => ({
        path: entry.path,
        type: entry.type,
      })),
    },
    previousPlan: input.previousPlan,
    adaptationCommand: input.adaptationCommand,
  };
}
