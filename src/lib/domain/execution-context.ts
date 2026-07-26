import { z } from "zod";

import type { RepositoryScope } from "@/lib/domain/repository-scope";
import type { WorkspacePlan } from "@/lib/domain/workspace";

export const repositoryCommitShaSchema = z
  .string()
  .regex(
    /^[0-9a-f]{40}$/,
    "Repository Snapshot must use a full lowercase Git commit SHA.",
  );

export function assertReviewedCommit(
  sandboxHead: string,
  reviewedHead: string,
) {
  const parsedSandboxHead = repositoryCommitShaSchema.parse(sandboxHead);
  const parsedReviewedHead = repositoryCommitShaSchema.parse(reviewedHead);
  if (parsedSandboxHead !== parsedReviewedHead) {
    throw new Error(
      `Sandbox HEAD does not match the reviewed Repository Snapshot (${parsedSandboxHead} != ${parsedReviewedHead}).`,
    );
  }
  return parsedSandboxHead;
}

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
  repositoryScope: RepositoryScope;
};
