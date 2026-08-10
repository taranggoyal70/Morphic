export const incidentToPullRequestFixture = {
  incident: {
    id: "INC-284",
    severity: "High",
    title: "Refund assistant repeated a courtesy credit",
    detail:
      "A retried support webhook caused the agent to issue the same customer credit twice.",
    observedAt: "2026-08-07T14:32:00.000Z",
  },
  repository: {
    fullName: "acme/support-agent",
    branch: "main",
    snapshotSha: "86d30c47fe744404feaf2a8796bd2e913fe5fd4a",
  },
  workspace: {
    version: 4,
    objective: "Prevent duplicate refunds on retried support actions",
    decision:
      "Require one idempotency key per customer, incident, and refund action.",
  },
  regression: {
    name: "replayed webhook cannot issue a second credit",
    source: "Braintrust trace bt-9831",
    before: "Failed - 2 credits issued",
    after: "Passed - 1 credit issued",
  },
  publication: {
    branch: "morphic/inc-284-idempotent-refunds",
    pullRequestNumber: 184,
    state: "Draft",
  },
} as const;
