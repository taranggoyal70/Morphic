import { describe, expect, it } from "vitest";

import { designPartnerApplicationSchema } from "./design-partner";

const validApplication = {
  companyName: "Acme AI",
  role: "AI platform lead",
  engineeringTeamSize: "20-49",
  productionAgentConfirmed: true,
  githubConfirmed: true,
  incidentOccurredAt: new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1_000,
  ).toISOString(),
  incidentSummary:
    "A support agent repeated a refund after a retried tool call.",
  currentStack: ["braintrust", "github_actions"],
  currentProofProcess:
    "We copy a trace into an issue and rely on a broad pull request check.",
  artifactWilling: true,
  pilotReadiness: "ready_to_pay",
  redactionConfirmed: true,
} as const;

describe("design-partner application contract", () => {
  it("accepts a redacted application from a production AI team", () => {
    expect(
      designPartnerApplicationSchema.parse(validApplication),
    ).toMatchObject({
      companyName: "Acme AI",
      productionAgentConfirmed: true,
      pilotReadiness: "ready_to_pay",
    });
  });

  it("rejects an application without an incident in the last 90 days", () => {
    expect(() =>
      designPartnerApplicationSchema.parse({
        ...validApplication,
        incidentOccurredAt: new Date(
          Date.now() - 91 * 24 * 60 * 60 * 1_000,
        ).toISOString(),
      }),
    ).toThrow();
  });
});
