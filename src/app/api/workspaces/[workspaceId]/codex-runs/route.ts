import { requireMorphicUser } from "@/lib/auth";
import { listCodexRuns } from "@/lib/codex-runs";
import { toErrorResponse } from "@/lib/errors";

export async function GET(
  _request: Request,
  context: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    const { workspaceId } = await context.params;
    return Response.json({
      runs: await listCodexRuns(user.id, workspaceId),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
