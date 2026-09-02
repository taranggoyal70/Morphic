import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { recordAuditEvent } from "@/lib/audit";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export async function POST(request: NextRequest) {
  let payload;

  try {
    payload = await verifyWebhook(request);
  } catch {
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

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
