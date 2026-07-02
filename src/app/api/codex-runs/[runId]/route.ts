import { getRun } from "workflow/api";

import { requireMorphicUser } from "@/lib/auth";
import { getCodexRunView, updateCodexRun } from "@/lib/codex-runs";
import { toErrorResponse } from "@/lib/errors";

export async function GET(
  _request: Request,
  context: { params: Promise<{ runId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    const { runId } = await context.params;
    return Response.json({ data: await getCodexRunView(user.id, runId) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ runId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    const { runId } = await context.params;
    const { run } = await getCodexRunView(user.id, runId);
    if (run.workflowRunId) {
      await getRun(run.workflowRunId).cancel();
    }
    await updateCodexRun(runId, {
      status: "cancelled",
      completedAt: new Date(),
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
