import { recordAuditEvent } from "@/lib/audit";
import { requireMorphicUser } from "@/lib/auth";
import {
  createDesignPartnerApplication,
  getDesignPartnerApplicationForUser,
} from "@/lib/design-partners";
import { designPartnerApplicationSchema } from "@/lib/domain/design-partner";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const user = await requireMorphicUser();
    return Response.json({
      application: await getDesignPartnerApplicationForUser(user.id),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireMorphicUser();
    await enforceRateLimit({
      userId: user.id,
      action: "design-partner-application",
      limit: 2,
      window: "24 h",
    });
    const input = designPartnerApplicationSchema.parse(await request.json());
    const application = await createDesignPartnerApplication({
      userId: user.id,
      ...input,
    });

    await recordAuditEvent({
      userId: user.id,
      action: "design_partner.application_submitted",
      resourceType: "design_partner_application",
      resourceId: application.id,
      metadata: {
        companyName: input.companyName,
        engineeringTeamSize: input.engineeringTeamSize,
        currentStack: input.currentStack,
        artifactWilling: input.artifactWilling,
        pilotReadiness: input.pilotReadiness,
      },
    });

    return Response.json({ application }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
