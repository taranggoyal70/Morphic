import type { Metadata } from "next";

import { WorkspaceCanvas } from "@/components/workspace-canvas";
import { requireMorphicUser } from "@/lib/auth";
import { listCodexRuns } from "@/lib/codex-runs";
import { getWorkspaceView } from "@/lib/workspaces";

export async function generateMetadata(context: {
  params: Promise<{ workspaceId: string }>;
}): Promise<Metadata> {
  const user = await requireMorphicUser();
  const { workspaceId } = await context.params;
  const { workspace } = await getWorkspaceView(user.id, workspaceId);
  return { title: workspace.objective };
}

export default async function WorkspacePage(context: {
  params: Promise<{ workspaceId: string }>;
}) {
  const user = await requireMorphicUser();
  const { workspaceId } = await context.params;
  const [{ workspace, repository, version }, runs] = await Promise.all([
    getWorkspaceView(user.id, workspaceId),
    listCodexRuns(user.id, workspaceId),
  ]);

  return (
    <WorkspaceCanvas
      workspace={{
        id: workspace.id,
        objective: workspace.objective,
        targetDate: workspace.targetDate,
        constraints: workspace.constraints,
        status: workspace.status,
        currentVersion: workspace.currentVersion,
        lastError: workspace.lastError,
        updatedAt: workspace.updatedAt,
      }}
      repository={{
        fullName: repository.fullName,
        defaultBranch: repository.defaultBranch,
        isPrivate: repository.isPrivate,
      }}
      plan={version?.plan ?? null}
      version={version?.version ?? null}
      runs={runs.map((run) => ({
        id: run.id,
        instruction: run.instruction,
        status: run.status,
        pullRequestNumber: run.pullRequestNumber,
        pullRequestUrl: run.pullRequestUrl,
        resultSummary: run.resultSummary,
        error: run.error,
        createdAt: run.createdAt,
      }))}
    />
  );
}
