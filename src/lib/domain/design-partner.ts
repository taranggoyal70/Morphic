import { z } from "zod";

export const designPartnerApplicationSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  engineeringTeamSize: z.enum(["1-19", "20-49", "50-99", "100-200", "201+"]),
  productionAgentConfirmed: z.literal(true),
  githubConfirmed: z.literal(true),
  incidentOccurredAt: z
    .string()
    .datetime()
    .refine(
      (value) => {
        const ageMs = Date.now() - new Date(value).getTime();
        return ageMs >= 0 && ageMs <= 90 * 24 * 60 * 60 * 1_000;
      },
      { message: "Use a production incident from the last 90 days." },
    ),
  incidentSummary: z.string().trim().min(20).max(1_000),
  currentStack: z
    .array(
      z.enum([
        "braintrust",
        "langsmith",
        "arize",
        "langfuse",
        "sentry",
        "github_actions",
        "other",
      ]),
    )
    .min(1)
    .max(7),
  currentProofProcess: z.string().trim().min(20).max(1_500),
  artifactWilling: z.boolean(),
  pilotReadiness: z.enum(["ready_to_pay", "needs_approval", "not_ready"]),
  redactionConfirmed: z.literal(true),
});

export type DesignPartnerApplicationInput = z.infer<
  typeof designPartnerApplicationSchema
>;
