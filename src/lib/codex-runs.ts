import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import {
  approvals,
  codexRunEvents,
  codexRuns,
  repositories,
  workspaces,
} from "@/db/schema";
import { AppError } from "@/lib/errors";

export async function createCodexRun(input: {
  userId: string;
  workspaceId: string;
  instruction: string;
}) {
  const [workspace] = await getDb()
    .select()
    .from(workspaces)
    .where(
      and(
        eq(workspaces.id, input.workspaceId),
        eq(workspaces.userId, input.userId),
      ),
    )
    .limit(1);
  if (!workspace) {
    throw new AppError("Workspace not found.", 404, "workspace_not_found");
  }
  if (workspace.status !== "active") {
    throw new AppError(
      "The workspace must finish generating before Codex can run.",
      409,
      "workspace_not_ready",
    );
  }

  const [run] = await getDb()
    .insert(codexRuns)
    .values({
      workspaceId: workspace.id,
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
      repository: repositories,
      approval: approvals,
    })
    .from(codexRuns)
    .innerJoin(workspaces, eq(codexRuns.workspaceId, workspaces.id))
    .innerJoin(repositories, eq(workspaces.repositoryId, repositories.id))
    .leftJoin(approvals, eq(codexRuns.id, approvals.runId))
    .where(and(eq(codexRuns.id, runId), eq(codexRuns.userId, userId)))
    .limit(1);

  if (!result) {
    throw new AppError("Codex run not found.", 404, "codex_run_not_found");
  }
  return result;
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
