import { start } from "workflow/api";

import { recordAuditEvent } from "@/lib/audit";
import { requireMorphicUser } from "@/lib/auth";
import { createWorkspaceSchema } from "@/lib/domain/workspace";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createWorkspaceRecord,
  listWorkspaces,
  setWorkspaceGenerationRun,
} from "@/lib/workspaces";
import { generateWorkspaceWorkflow } from "@/workflows/generate-workspace";

export async function GET() {
  try {
    const user = await requireMorphicUser();
    return Response.json({
      workspaces: await listWorkspaces(user.id),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireMorphicUser();
    await enforceRateLimit({
      userId: user.id,
      action: "workspace-create",
      limit: 6,
      window: "1 h",
    });
    const input = createWorkspaceSchema.parse(await request.json());
    const workspace = await createWorkspaceRecord({
      userId: user.id,
      ...input,
    });
    await recordAuditEvent({
      userId: user.id,
      action: "workspace.created",
      resourceType: "workspace",
      resourceId: workspace.id,
      metadata: { objective: input.objective, repositoryId: input.repositoryId },
    });
    const run = await start(generateWorkspaceWorkflow, [
      {
        userId: user.id,
        workspaceId: workspace.id,
      },
    ]);
    await setWorkspaceGenerationRun(user.id, workspace.id, run.runId);

    return Response.json(
      {
        workspace: {
          ...workspace,
          generationRunId: run.runId,
        },
      },
      { status: 202 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
