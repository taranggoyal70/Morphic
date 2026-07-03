import { eq } from "drizzle-orm";

import { recordAuditEvent } from "@/lib/audit";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    type: string;
    data: { id: string; deleted?: boolean };
  };

  if (payload.type === "user.deleted" && payload.data.id) {
    const userId = payload.data.id;

    await recordAuditEvent({
      userId,
      action: "user.deleted",
      resourceType: "user",
      resourceId: userId,
      metadata: { source: "clerk_webhook" },
    });

    await getDb().delete(users).where(eq(users.id, userId));

    return Response.json({ received: true });
  }

  return Response.json({ received: true });
}
