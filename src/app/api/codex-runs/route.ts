import { recordAuditEvent } from "@/lib/audit";
import { requireMorphicUser } from "@/lib/auth";
import { createCodexRun } from "@/lib/codex-runs";
import { createCodexRunSchema } from "@/lib/domain/workspace";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const user = await requireMorphicUser();
    await enforceRateLimit({
      userId: user.id,
      action: "codex-run-create",
      limit: 10,
      window: "1 h",
    });
    const input = createCodexRunSchema.parse(await request.json());
    const run = await createCodexRun({
      userId: user.id,
      workspaceId: input.workspaceId,
      instruction: input.instruction,
    });
    await recordAuditEvent({
      userId: user.id,
      action: "codex_run.created",
      resourceType: "codex_run",
      resourceId: run.id,
      metadata: { workspaceId: input.workspaceId },
    });
    return Response.json({ run }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
