import { captureRepositorySnapshot } from "@/lib/github";
import { generateWorkspacePlan } from "@/lib/openai";
import {
  getWorkspaceForUser,
  getWorkspaceGenerationContext,
  markWorkspaceGenerationFailed,
  persistWorkspaceVersion,
} from "@/lib/workspaces";

async function captureEvidenceStep(userId: string, workspaceId: string) {
  "use step";

  console.info("Capturing GitHub evidence", { userId, workspaceId });
  const { workspace } = await getWorkspaceForUser(userId, workspaceId);
  const snapshot = await captureRepositorySnapshot({
    userId,
    repositoryId: workspace.repositoryId,
  });
  return snapshot.id;
}

async function compileWorkspaceStep(input: {
  userId: string;
  workspaceId: string;
  snapshotId: string;
  commandId?: string;
}) {
  "use step";

  console.info("Compiling adaptive workspace", input);
  const context = await getWorkspaceGenerationContext(input);
  const generated = await generateWorkspacePlan({
    objective: context.workspace.objective,
    targetDate: context.workspace.targetDate,
    constraints: context.workspace.constraints,
    repository: {
      fullName: context.repository.fullName,
      defaultBranch: context.repository.defaultBranch,
    },
    snapshot: {
      headSha: context.snapshot.headSha,
      issues: context.snapshot.issues,
      pullRequests: context.snapshot.pullRequests,
      tree: context.snapshot.tree,
    },
    previousPlan: context.previousPlan,
    adaptationCommand: context.command?.command,
  });

  const version = await persistWorkspaceVersion({
    ...input,
    generationKey: input.commandId
      ? `command:${input.commandId}`
      : `initial:${input.workspaceId}`,
    plan: generated.plan,
    responseId: generated.responseId,
    model: generated.model,
    promptVersion: generated.promptVersion,
  });
  return version.id;
}

async function markFailedStep(input: {
  userId: string;
  workspaceId: string;
  commandId?: string;
  message: string;
}) {
  "use step";

  console.error("Workspace generation failed", input);
  await markWorkspaceGenerationFailed(input);
}

export async function generateWorkspaceWorkflow(input: {
  userId: string;
  workspaceId: string;
  commandId?: string;
}) {
  "use workflow";

  console.info("Starting workspace generation workflow", input);
  try {
    const snapshotId = await captureEvidenceStep(
      input.userId,
      input.workspaceId,
    );
    const versionId = await compileWorkspaceStep({
      ...input,
      snapshotId,
    });
    console.info("Workspace generation workflow completed", {
      ...input,
      versionId,
    });
    return { workspaceId: input.workspaceId, versionId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown generation error";
    await markFailedStep({ ...input, message });
    throw error;
  }
}
