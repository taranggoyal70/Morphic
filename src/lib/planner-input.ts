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

export function compactPlannerInput(input: PlannerInput) {
  return {
    objective: input.objective,
    targetDate: input.targetDate?.toISOString() ?? null,
    constraints: input.constraints,
    repository: input.repository,
    snapshot: {
      headSha: input.snapshot.headSha,
      issues: input.snapshot.issues.slice(0, 100).map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        labels: issue.labels,
        assignees: issue.assignees,
      })),
      pullRequests: input.snapshot.pullRequests.slice(0, 50).map((pull) => ({
        number: pull.number,
        title: pull.title,
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
