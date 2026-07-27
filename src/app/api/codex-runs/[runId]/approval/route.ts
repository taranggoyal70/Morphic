import { start } from "workflow/api";
import { z } from "zod";

import { recordAuditEvent } from "@/lib/audit";
import { requireMorphicUser } from "@/lib/auth";
import {
  approveCodexRun,
  rejectCodexRun,
  setCodexWorkflowRunId,
  updateCodexRun,
} from "@/lib/codex-runs";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { codexRunWorkflow } from "@/workflows/codex-run";

const approvalInput = z.discriminatedUnion("decision", [
  z.object({ decision: z.literal("approve") }),
  z.object({
    decision: z.literal("reject"),
    note: z.string().trim().max(1_000).optional(),
  }),
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ runId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    await enforceRateLimit({
      userId: user.id,
      action: "codex-run-approval",
      limit: 20,
      window: "1 h",
    });
    const { runId } = await context.params;
    const input = approvalInput.parse(await request.json());
    if (input.decision === "reject") {
      await rejectCodexRun(user.id, runId, input.note);
      await recordAuditEvent({
        userId: user.id,
        action: "codex_run.rejected",
        resourceType: "codex_run",
        resourceId: runId,
        metadata: { note: input.note },
      });
      return Response.json({ status: "rejected" });
    }

    await approveCodexRun(user.id, runId);
    await recordAuditEvent({
      userId: user.id,
      action: "codex_run.approved",
      resourceType: "codex_run",
      resourceId: runId,
    });
    let workflowRun: Awaited<ReturnType<typeof start>>;
    try {
      workflowRun = await start(codexRunWorkflow, [{ userId: user.id, runId }]);
    } catch (error) {
      await updateCodexRun(runId, {
        status: "failed",
        error:
          error instanceof Error
            ? error.message.slice(0, 2_000)
            : "Workflow could not start.",
        completedAt: new Date(),
      });
      throw error;
    }

    let trackingPersisted = true;
    try {
      await setCodexWorkflowRunId(user.id, runId, workflowRun.runId);
    } catch (error) {
      trackingPersisted = false;
      console.error("Workflow started but its tracking ID could not be saved", {
        runId,
        workflowRunId: workflowRun.runId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return Response.json(
      {
        status: "queued",
        workflowRunId: workflowRun.runId,
        trackingPersisted,
      },
      { status: 202 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
