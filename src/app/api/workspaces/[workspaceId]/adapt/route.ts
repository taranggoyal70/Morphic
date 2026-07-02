import { start } from "workflow/api";

import { requireMorphicUser } from "@/lib/auth";
import { adaptWorkspaceSchema } from "@/lib/domain/workspace";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createWorkspaceCommand,
  setWorkspaceGenerationRun,
} from "@/lib/workspaces";
import { generateWorkspaceWorkflow } from "@/workflows/generate-workspace";

export async function POST(
  request: Request,
  context: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    await enforceRateLimit({
      userId: user.id,
      action: "workspace-adapt",
      limit: 20,
      window: "1 h",
    });
    const { workspaceId } = await context.params;
    const input = adaptWorkspaceSchema.parse(await request.json());
    const command = await createWorkspaceCommand({
      userId: user.id,
      workspaceId,
      command: input.command,
    });
    const run = await start(generateWorkspaceWorkflow, [
      {
        userId: user.id,
        workspaceId,
        commandId: command.id,
      },
    ]);
    await setWorkspaceGenerationRun(user.id, workspaceId, run.runId);

    return Response.json(
      {
        command,
        generationRunId: run.runId,
      },
      { status: 202 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
