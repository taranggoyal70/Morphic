import { z } from "zod";

export const DESIGN_PARTNER_INCIDENT_WINDOW_DAYS = 90;
export const DESIGN_PARTNER_PILOT_DURATION_DAYS = 90;

export const DESIGN_PARTNER_ENGINEERING_TEAM_SIZES = [
  "1-19",
  "20-49",
  "50-99",
  "100-200",
  "201+",
] as const;
export type DesignPartnerEngineeringTeamSize =
  (typeof DESIGN_PARTNER_ENGINEERING_TEAM_SIZES)[number];

export const DESIGN_PARTNER_STACKS = [
  "braintrust",
  "langsmith",
  "arize",
  "langfuse",
  "sentry",
  "github_actions",
  "other",
] as const;
export type DesignPartnerStack = (typeof DESIGN_PARTNER_STACKS)[number];
export const DESIGN_PARTNER_STACK_LABELS = {
  braintrust: "Braintrust",
  langsmith: "LangSmith",
  arize: "Arize",
  langfuse: "Langfuse",
  sentry: "Sentry",
  github_actions: "GitHub Actions",
  other: "Other",
} satisfies Record<DesignPartnerStack, string>;

export const DESIGN_PARTNER_PILOT_READINESS_OPTIONS = [
  "ready_to_pay",
  "needs_approval",
  "not_ready",
] as const;
export type DesignPartnerPilotReadiness =
  (typeof DESIGN_PARTNER_PILOT_READINESS_OPTIONS)[number];
export const DESIGN_PARTNER_PILOT_READINESS_LABELS = {
  ready_to_pay: "Ready to fund a $10K-$25K pilot",
  needs_approval: "Interested, but another owner must approve",
  not_ready: "Not ready to fund a pilot",
} satisfies Record<DesignPartnerPilotReadiness, string>;

export const designPartnerApplicationSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  engineeringTeamSize: z.enum(DESIGN_PARTNER_ENGINEERING_TEAM_SIZES),
  productionAgentConfirmed: z.literal(true),
  githubConfirmed: z.literal(true),
  incidentOccurredAt: z
    .string()
    .datetime()
    .refine(
      (value) => {
        const ageMs = Date.now() - new Date(value).getTime();
        return (
          ageMs >= 0 &&
          ageMs <= DESIGN_PARTNER_INCIDENT_WINDOW_DAYS * 24 * 60 * 60 * 1_000
        );
      },
      {
        message: `Use a production incident from the last ${DESIGN_PARTNER_INCIDENT_WINDOW_DAYS} days.`,
      },
    ),
  incidentSummary: z.string().trim().min(20).max(1_000),
  currentStack: z
    .array(z.enum(DESIGN_PARTNER_STACKS))
    .min(1)
    .max(DESIGN_PARTNER_STACKS.length),
  currentProofProcess: z.string().trim().min(20).max(1_500),
  artifactWilling: z.boolean(),
  pilotReadiness: z.enum(DESIGN_PARTNER_PILOT_READINESS_OPTIONS),
  redactionConfirmed: z.literal(true),
});

export type DesignPartnerApplicationInput = z.infer<
  typeof designPartnerApplicationSchema
>;
