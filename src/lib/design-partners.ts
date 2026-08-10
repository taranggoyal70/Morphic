import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { designPartnerApplications } from "@/db/schema";
import type { DesignPartnerApplicationInput } from "@/lib/domain/design-partner";
import { AppError } from "@/lib/errors";

export async function getDesignPartnerApplicationForUser(userId: string) {
  const [application] = await getDb()
    .select()
    .from(designPartnerApplications)
    .where(eq(designPartnerApplications.userId, userId))
    .limit(1);

  return application ?? null;
}

export async function createDesignPartnerApplication(
  input: DesignPartnerApplicationInput & { userId: string },
) {
  const [application] = await getDb()
    .insert(designPartnerApplications)
    .values({
      ...input,
      incidentOccurredAt: new Date(input.incidentOccurredAt),
    })
    .onConflictDoNothing({ target: designPartnerApplications.userId })
    .returning();

  if (!application) {
    throw new AppError(
      "A design-partner application already exists for this account.",
      409,
      "design_partner_application_exists",
    );
  }

  return application;
}
