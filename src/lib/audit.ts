import "server-only";

import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";

export async function recordAuditEvent(input: {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  await getDb()
    .insert(auditLogs)
    .values({
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadata: input.metadata ?? {},
    });
}
