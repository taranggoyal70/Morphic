import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApprovalEvidence } from "@/components/approval-evidence";

describe("ApprovalEvidence", () => {
  it("shows the exact reviewed Repository Snapshot", () => {
    render(
      <ApprovalEvidence
        repositoryFullName="acme/checkout"
        snapshotSha="1111111111111111111111111111111111111111"
      />,
    );

    expect(screen.getByText("acme/checkout@1111111")).toBeInTheDocument();
  });
});
