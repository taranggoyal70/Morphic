import { start } from "workflow/api";
import { z } from "zod";

import { requireMorphicUser } from "@/lib/auth";
import { toErrorResponse, AppError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createWorkspaceCommand,
  getWorkspaceView,
  setWorkspaceGenerationRun,
} from "@/lib/workspaces";
import { generateWorkspaceWorkflow } from "@/workflows/generate-workspace";

const decisionInput = z.object({
  decisionId: z.string().min(1).max(80),
  optionId: z.string().min(1).max(80),
  version: z.number().int().positive(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    await enforceRateLimit({
      userId: user.id,
      action: "workspace-decision",
      limit: 30,
      window: "1 h",
    });
    const { workspaceId } = await context.params;
    const input = decisionInput.parse(await request.json());
    const view = await getWorkspaceView(user.id, workspaceId);
    if (!view.version || view.version.version !== input.version) {
      throw new AppError(
        "The workspace changed. Review the latest decision options.",
        409,
        "workspace_version_changed",
      );
    }
    const decision = view.version.plan.decisions.find(
      (candidate) => candidate.id === input.decisionId,
    );
    const option = decision?.options.find(
      (candidate) => candidate.id === input.optionId,
    );
    if (!decision || !option) {
      throw new AppError(
        "Decision option not found.",
        404,
        "decision_option_not_found",
      );
    }

    const command = await createWorkspaceCommand({
      userId: user.id,
      workspaceId,
      command: `Resolve decision "${decision.question}" with option "${option.label}". Preserve this as a user-owned decision and adapt the critical path, risks, and repository impact accordingly.`,
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
      { command, generationRunId: run.runId },
      { status: 202 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
