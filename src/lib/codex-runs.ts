import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import {
  approvals,
  codexRunEvents,
  codexRuns,
  githubSnapshots,
  repositories,
  workspaces,
  workspaceVersions,
} from "@/db/schema";
import {
  repositoryCommitShaSchema,
  type ExecutionContext,
} from "@/lib/domain/execution-context";
import { AppError } from "@/lib/errors";

export async function createCodexRun(input: {
  userId: string;
  workspaceId: string;
  instruction: string;
}) {
  const [result] = await getDb()
    .select({
      workspace: workspaces,
      workspaceVersion: workspaceVersions,
    })
    .from(workspaces)
    .leftJoin(
      workspaceVersions,
      and(
        eq(workspaceVersions.workspaceId, workspaces.id),
        eq(workspaceVersions.version, workspaces.currentVersion),
      ),
    )
    .where(
      and(
        eq(workspaces.id, input.workspaceId),
        eq(workspaces.userId, input.userId),
      ),
    )
    .limit(1);
  if (!result) {
    throw new AppError("Workspace not found.", 404, "workspace_not_found");
  }
  const { workspace, workspaceVersion } = result;
  if (workspace.status !== "active") {
    throw new AppError(
      "The workspace must finish generating before Codex can run.",
      409,
      "workspace_not_ready",
    );
  }
  if (!workspaceVersion) {
    throw new AppError(
      "The workspace has no accepted version to execute.",
      409,
      "workspace_version_missing",
    );
  }

  const [run] = await getDb()
    .insert(codexRuns)
    .values({
      workspaceId: workspace.id,
      workspaceVersionId: workspaceVersion.id,
      repositorySnapshotId: workspaceVersion.snapshotId,
      userId: input.userId,
      instruction: input.instruction,
    })
    .returning();
  await getDb().insert(approvals).values({
    runId: run.id,
    userId: input.userId,
  });
  return run;
}

export async function getCodexRunForUser(userId: string, runId: string) {
  const [result] = await getDb()
    .select({
      run: codexRuns,
      workspace: workspaces,
      workspaceVersion: workspaceVersions,
      repositorySnapshot: githubSnapshots,
      repository: repositories,
      approval: approvals,
    })
    .from(codexRuns)
    .innerJoin(workspaces, eq(codexRuns.workspaceId, workspaces.id))
    .innerJoin(repositories, eq(workspaces.repositoryId, repositories.id))
    .leftJoin(
      workspaceVersions,
      eq(workspaceVersions.id, codexRuns.workspaceVersionId),
    )
    .leftJoin(
      githubSnapshots,
      eq(githubSnapshots.id, codexRuns.repositorySnapshotId),
    )
    .leftJoin(approvals, eq(codexRuns.id, approvals.runId))
    .where(and(eq(codexRuns.id, runId), eq(codexRuns.userId, userId)))
    .limit(1);

  if (!result) {
    throw new AppError("Codex run not found.", 404, "codex_run_not_found");
  }
  return result;
}

export async function getCodexExecutionContextForUser(
  userId: string,
  runId: string,
): Promise<ExecutionContext> {
  const result = await getCodexRunForUser(userId, runId);
  if (!result.workspaceVersion || !result.repositorySnapshot) {
    throw new AppError(
      "This run is missing an accepted Workspace Version or Repository Snapshot.",
      409,
      "execution_context_missing",
    );
  }

  const parsedSha = repositoryCommitShaSchema.safeParse(
    result.repositorySnapshot.headSha,
  );
  if (!parsedSha.success) {
    throw new AppError(
      "The accepted Repository Snapshot does not contain a valid commit SHA.",
      409,
      "invalid_repository_snapshot",
    );
  }

  return {
    runId: result.run.id,
    workspaceId: result.workspace.id,
    workspaceVersionId: result.workspaceVersion.id,
    workspaceVersion: result.workspaceVersion.version,
    repositorySnapshotId: result.repositorySnapshot.id,
    repositoryFullName: result.repository.fullName,
    repositoryBranch: result.repositorySnapshot.branch,
    repositoryHeadSha: parsedSha.data,
    objective: result.workspace.objective,
    targetDate: result.workspace.targetDate?.toISOString() ?? null,
    constraints: result.workspace.constraints,
    instruction: result.run.instruction,
    plan: result.workspaceVersion.plan,
    repositoryPaths: result.repositorySnapshot.tree
      .filter((entry) => entry.type === "blob")
      .map((entry) => entry.path),
  };
}

export async function listCodexRuns(userId: string, workspaceId: string) {
  return getDb()
    .select()
    .from(codexRuns)
    .where(
      and(eq(codexRuns.userId, userId), eq(codexRuns.workspaceId, workspaceId)),
    )
    .orderBy(desc(codexRuns.createdAt));
}

export async function getCodexRunView(userId: string, runId: string) {
  const run = await getCodexRunForUser(userId, runId);
  const events = await getDb()
    .select()
    .from(codexRunEvents)
    .where(eq(codexRunEvents.runId, runId))
    .orderBy(asc(codexRunEvents.sequence));
  return { ...run, events };
}

export async function approveCodexRun(userId: string, runId: string) {
  const result = await getCodexRunForUser(userId, runId);
  if (
    result.run.status !== "awaiting_approval" ||
    result.approval?.status !== "pending"
  ) {
    throw new AppError(
      "This run is no longer awaiting approval.",
      409,
      "approval_not_pending",
    );
  }

  const [approved] = await getDb()
    .update(approvals)
    .set({ status: "approved", actedAt: new Date() })
    .where(
      and(
        eq(approvals.runId, runId),
        eq(approvals.userId, userId),
        eq(approvals.status, "pending"),
      ),
    )
    .returning();
  if (!approved) {
    throw new AppError(
      "This run was already reviewed.",
      409,
      "approval_already_reviewed",
    );
  }

  await getDb()
    .update(codexRuns)
    .set({ status: "queued" })
    .where(and(eq(codexRuns.id, runId), eq(codexRuns.userId, userId)));
  return result.run;
}

export async function rejectCodexRun(
  userId: string,
  runId: string,
  note?: string,
) {
  await getCodexRunForUser(userId, runId);
  const [rejected] = await getDb()
    .update(approvals)
    .set({
      status: "rejected",
      note: note?.slice(0, 1_000),
      actedAt: new Date(),
    })
    .where(
      and(
        eq(approvals.runId, runId),
        eq(approvals.userId, userId),
        eq(approvals.status, "pending"),
      ),
    )
    .returning();
  if (!rejected) {
    throw new AppError(
      "This run was already reviewed.",
      409,
      "approval_already_reviewed",
    );
  }
  await getDb()
    .update(codexRuns)
    .set({ status: "cancelled", completedAt: new Date() })
    .where(eq(codexRuns.id, runId));
}

export async function setCodexWorkflowRunId(
  userId: string,
  runId: string,
  workflowRunId: string,
) {
  await getDb()
    .update(codexRuns)
    .set({ workflowRunId })
    .where(and(eq(codexRuns.id, runId), eq(codexRuns.userId, userId)));
}

export async function updateCodexRun(
  runId: string,
  values: Partial<typeof codexRuns.$inferInsert>,
) {
  await getDb().update(codexRuns).set(values).where(eq(codexRuns.id, runId));
}

export async function appendCodexEvents(
  runId: string,
  events: Array<{
    sequence: number;
    eventType: string;
    payload: Record<string, unknown>;
  }>,
) {
  if (events.length === 0) return;
  await getDb()
    .insert(codexRunEvents)
    .values(events.map((event) => ({ runId, ...event })))
    .onConflictDoNothing({
      target: [codexRunEvents.runId, codexRunEvents.sequence],
    });
}
