import { requireMorphicUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/errors";
import { listRepositories, syncRepositories } from "@/lib/github";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const user = await requireMorphicUser();
    return Response.json({
      repositories: await listRepositories(user.id),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST() {
  try {
    const user = await requireMorphicUser();
    await enforceRateLimit({
      userId: user.id,
      action: "repository-sync",
      limit: 10,
      window: "1 m",
    });
    return Response.json({
      repositories: await syncRepositories(user.id),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
