import type { WorkspacePlan } from "@/lib/domain/workspace";

/**
 * Immutable evidence authorized by a user when they approve a Codex Run.
 *
 * This contract deliberately contains identifiers as well as rendered product
 * context so execution can be reproduced and audited without consulting a
 * moving repository branch.
 */
export type ExecutionContext = {
  runId: string;
  workspaceId: string;
  workspaceVersionId: string;
  workspaceVersion: number;
  repositorySnapshotId: string;
  repositoryFullName: string;
  repositoryBranch: string;
  repositoryHeadSha: string;
  objective: string;
  targetDate: string | null;
  constraints: string[];
  instruction: string;
  plan: WorkspacePlan;
  repositoryPaths: string[];
};
