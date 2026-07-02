import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import {
  githubSnapshots,
  repositories,
  workspaceCommands,
  workspaces,
  workspaceVersions,
} from "@/db/schema";
import type { WorkspacePlan } from "@/lib/domain/workspace";
import { AppError } from "@/lib/errors";

export async function listWorkspaces(userId: string) {
  return getDb()
    .select({
      workspace: workspaces,
      repository: repositories,
    })
    .from(workspaces)
    .innerJoin(repositories, eq(workspaces.repositoryId, repositories.id))
    .where(eq(workspaces.userId, userId))
    .orderBy(desc(workspaces.updatedAt));
}

export async function createWorkspaceRecord(input: {
  userId: string;
  repositoryId: string;
  objective: string;
  targetDate?: string | null;
  constraints: string[];
}) {
  const [repository] = await getDb()
    .select({ id: repositories.id })
    .from(repositories)
    .where(
      and(
        eq(repositories.id, input.repositoryId),
        eq(repositories.userId, input.userId),
      ),
    )
    .limit(1);
  if (!repository) {
    throw new AppError("Repository not found.", 404, "repository_not_found");
  }

  const [workspace] = await getDb()
    .insert(workspaces)
    .values({
      userId: input.userId,
      repositoryId: input.repositoryId,
      objective: input.objective,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      constraints: input.constraints,
      status: "generating",
    })
    .returning();

  return workspace;
}

export async function getWorkspaceForUser(userId: string, workspaceId: string) {
  const [result] = await getDb()
    .select({
      workspace: workspaces,
      repository: repositories,
    })
    .from(workspaces)
    .innerJoin(repositories, eq(workspaces.repositoryId, repositories.id))
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)))
    .limit(1);

  if (!result) {
    throw new AppError("Workspace not found.", 404, "workspace_not_found");
  }
  return result;
}

export async function getWorkspaceView(userId: string, workspaceId: string) {
  const result = await getWorkspaceForUser(userId, workspaceId);
  const [version] =
    result.workspace.currentVersion > 0
      ? await getDb()
          .select()
          .from(workspaceVersions)
          .where(
            and(
              eq(workspaceVersions.workspaceId, workspaceId),
              eq(workspaceVersions.version, result.workspace.currentVersion),
            ),
          )
          .limit(1)
      : [];
  const [latestCommand] = await getDb()
    .select()
    .from(workspaceCommands)
    .where(eq(workspaceCommands.workspaceId, workspaceId))
    .orderBy(desc(workspaceCommands.createdAt))
    .limit(1);

  return {
    ...result,
    version: version ?? null,
    latestCommand: latestCommand ?? null,
  };
}

export async function getWorkspaceGenerationContext(input: {
  userId: string;
  workspaceId: string;
  snapshotId: string;
  commandId?: string;
}) {
  const { workspace, repository } = await getWorkspaceForUser(
    input.userId,
    input.workspaceId,
  );
  const [snapshot] = await getDb()
    .select()
    .from(githubSnapshots)
    .where(
      and(
        eq(githubSnapshots.id, input.snapshotId),
        eq(githubSnapshots.repositoryId, repository.id),
      ),
    )
    .limit(1);
  if (!snapshot) {
    throw new AppError("Snapshot not found.", 404, "snapshot_not_found");
  }

  const [previousVersion] =
    workspace.currentVersion > 0
      ? await getDb()
          .select()
          .from(workspaceVersions)
          .where(
            and(
              eq(workspaceVersions.workspaceId, workspace.id),
              eq(workspaceVersions.version, workspace.currentVersion),
            ),
          )
          .limit(1)
      : [];

  const [command] = input.commandId
    ? await getDb()
        .select()
        .from(workspaceCommands)
        .where(
          and(
            eq(workspaceCommands.id, input.commandId),
            eq(workspaceCommands.workspaceId, workspace.id),
            eq(workspaceCommands.userId, input.userId),
          ),
        )
        .limit(1)
    : [];

  return {
    workspace,
    repository,
    snapshot,
    previousPlan: previousVersion?.plan,
    command,
  };
}

export async function persistWorkspaceVersion(input: {
  userId: string;
  workspaceId: string;
  snapshotId: string;
  generationKey: string;
  plan: WorkspacePlan;
  responseId: string;
  model: string;
  promptVersion: string;
  commandId?: string;
}) {
  const { workspace } = await getWorkspaceForUser(
    input.userId,
    input.workspaceId,
  );
  const [existingVersion] = await getDb()
    .select()
    .from(workspaceVersions)
    .where(eq(workspaceVersions.generationKey, input.generationKey))
    .limit(1);
  if (existingVersion) {
    await getDb()
      .update(workspaces)
      .set({
        currentVersion: existingVersion.version,
        status: "active",
        lastError: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workspaces.id, workspace.id),
          eq(workspaces.userId, input.userId),
        ),
      );

    if (input.commandId) {
      await getDb()
        .update(workspaceCommands)
        .set({
          status: "completed",
          resultVersion: existingVersion.version,
          completedAt: new Date(),
        })
        .where(
          and(
            eq(workspaceCommands.id, input.commandId),
            eq(workspaceCommands.userId, input.userId),
          ),
        );
    }

    return existingVersion;
  }

  const nextVersion = workspace.currentVersion + 1;

  const [version] = await getDb()
    .insert(workspaceVersions)
    .values({
      workspaceId: workspace.id,
      snapshotId: input.snapshotId,
      version: nextVersion,
      generationKey: input.generationKey,
      plan: input.plan,
      openaiResponseId: input.responseId,
      model: input.model,
      promptVersion: input.promptVersion,
    })
    .returning();

  await getDb()
    .update(workspaces)
    .set({
      currentVersion: nextVersion,
      status: "active",
      lastError: null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(workspaces.id, workspace.id), eq(workspaces.userId, input.userId)),
    );

  if (input.commandId) {
    await getDb()
      .update(workspaceCommands)
      .set({
        status: "completed",
        resultVersion: nextVersion,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(workspaceCommands.id, input.commandId),
          eq(workspaceCommands.userId, input.userId),
        ),
      );
  }

  return version;
}

export async function createWorkspaceCommand(input: {
  userId: string;
  workspaceId: string;
  command: string;
}) {
  const { workspace } = await getWorkspaceForUser(
    input.userId,
    input.workspaceId,
  );
  if (workspace.status === "generating") {
    throw new AppError(
      "This workspace is already adapting.",
      409,
      "workspace_busy",
    );
  }

  const [command] = await getDb()
    .insert(workspaceCommands)
    .values({
      userId: input.userId,
      workspaceId: workspace.id,
      command: input.command,
    })
    .returning();

  await getDb()
    .update(workspaces)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(workspaces.id, workspace.id));

  return command;
}

export async function setWorkspaceGenerationRun(
  userId: string,
  workspaceId: string,
  runId: string,
) {
  await getDb()
    .update(workspaces)
    .set({ generationRunId: runId, updatedAt: new Date() })
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)));
}

export async function markWorkspaceGenerationFailed(input: {
  userId: string;
  workspaceId: string;
  commandId?: string;
  message: string;
}) {
  await getDb()
    .update(workspaces)
    .set({
      status: "failed",
      lastError: input.message.slice(0, 1_000),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(workspaces.id, input.workspaceId),
        eq(workspaces.userId, input.userId),
      ),
    );

  if (input.commandId) {
    await getDb()
      .update(workspaceCommands)
      .set({
        status: "failed",
        error: input.message.slice(0, 1_000),
        completedAt: new Date(),
      })
      .where(
        and(
          eq(workspaceCommands.id, input.commandId),
          eq(workspaceCommands.userId, input.userId),
        ),
      );
  }
}
