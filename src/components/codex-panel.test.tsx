import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CodexPanel } from "@/components/codex-panel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

afterEach(cleanup);

describe("CodexPanel", () => {
  it("shows the immutable evidence captured by each proposed run", () => {
    render(
      <CodexPanel
        workspaceId="workspace-1"
        workspaceReady
        repositoryFullName="acme/checkout"
        runs={[
          {
            id: "run-1",
            instruction: "First change",
            status: "awaiting_approval",
            pullRequestNumber: null,
            pullRequestUrl: null,
            resultSummary: null,
            error: null,
            createdAt: new Date("2026-08-09T10:00:00.000Z"),
            approvalContext: {
              snapshotSha: "1111111111111111111111111111111111111111",
              workspaceVersion: 3,
            },
          },
          {
            id: "run-2",
            instruction: "Second change",
            status: "awaiting_approval",
            pullRequestNumber: null,
            pullRequestUrl: null,
            resultSummary: null,
            error: null,
            createdAt: new Date("2026-08-09T11:00:00.000Z"),
            approvalContext: {
              snapshotSha: "2222222222222222222222222222222222222222",
              workspaceVersion: 4,
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("acme/checkout@1111111")).toBeInTheDocument();
    expect(screen.getByText("Workspace Version v3")).toBeInTheDocument();
    expect(screen.getByText("acme/checkout@2222222")).toBeInTheDocument();
    expect(screen.getByText("Workspace Version v4")).toBeInTheDocument();
  });
});
