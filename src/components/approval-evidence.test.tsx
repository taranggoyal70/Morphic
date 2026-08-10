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
});
