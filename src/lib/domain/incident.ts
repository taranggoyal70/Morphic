import { z } from "zod";

export const incidentEvidenceSchema = z.object({
  source: z.enum(["manual", "braintrust", "langsmith"]),
  externalId: z.string().trim().min(1).max(160),
  title: z.string().trim().min(8).max(240),
  observedBehavior: z.string().trim().min(8).max(2_000),
  expectedBehavior: z.string().trim().min(8).max(2_000),
  occurredAt: z.string().datetime(),
  traceUrl: z.string().url().max(2_000).nullable(),
  acceptanceCriteria: z.array(z.string().trim().min(8).max(400)).min(1).max(8),
  redactionConfirmed: z.literal(true),
});

export type IncidentEvidence = z.infer<typeof incidentEvidenceSchema>;
