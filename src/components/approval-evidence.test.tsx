import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApprovalEvidence } from "@/components/approval-evidence";

describe("ApprovalEvidence", () => {
  it("shows the exact reviewed Repository Snapshot", () => {
    render(
      <ApprovalEvidence
        repositoryFullName="acme/checkout"
        snapshotSha="1111111111111111111111111111111111111111"
        workspaceVersion={3}
      />,
    );

    expect(screen.getByText("acme/checkout@1111111")).toBeInTheDocument();
    expect(screen.getByText("Workspace Version v3")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Approval authorizes one isolated run against this snapshot. Morphic will verify the diff and can only open a draft pull request.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the incident behavior a proposal is expected to prevent", () => {
    render(
      <ApprovalEvidence
        repositoryFullName="acme/checkout"
        snapshotSha="1111111111111111111111111111111111111111"
        workspaceVersion={3}
        incident={{
          source: "braintrust",
          externalId: "bt-9831",
          title: "Checkout agent repeated a customer charge",
          observedBehavior: "A retried tool call created two charges.",
          expectedBehavior: "A retried tool call creates one charge.",
          occurredAt: "2026-08-07T14:32:00.000Z",
          traceUrl: "https://braintrust.dev/app/acme/p/trace/bt-9831",
          acceptanceCriteria: [
            "Replaying the same tool call creates exactly one charge.",
          ],
          redactionConfirmed: true,
        }}
      />,
    );

    expect(screen.getByText("Incident bt-9831")).toBeInTheDocument();
    expect(
      screen.getByText("A retried tool call created two charges."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A retried tool call creates one charge."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Replaying the same tool call creates exactly one charge.",
      ),
    ).toBeInTheDocument();
  });
});
