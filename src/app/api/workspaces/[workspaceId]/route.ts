import { requireMorphicUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/errors";
import { getWorkspaceView } from "@/lib/workspaces";

export async function GET(
  _request: Request,
  context: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    const { workspaceId } = await context.params;
    return Response.json({
      data: await getWorkspaceView(user.id, workspaceId),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
