import { recordAuditEvent } from "@/lib/audit";
import { requireMorphicUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/errors";
import {
  archiveWorkspace,
  deleteWorkspace,
  getWorkspaceView,
} from "@/lib/workspaces";

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

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    const { workspaceId } = await context.params;
    await archiveWorkspace(user.id, workspaceId);
    await recordAuditEvent({
      userId: user.id,
      action: "workspace.archived",
      resourceType: "workspace",
      resourceId: workspaceId,
    });
    return Response.json({ status: "archived" });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const user = await requireMorphicUser();
    const { workspaceId } = await context.params;
    await deleteWorkspace(user.id, workspaceId);
    await recordAuditEvent({
      userId: user.id,
      action: "workspace.deleted",
      resourceType: "workspace",
      resourceId: workspaceId,
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
