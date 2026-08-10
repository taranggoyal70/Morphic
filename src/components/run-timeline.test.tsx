import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RunTimeline } from "@/components/run-timeline";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RunTimeline", () => {
  it("shows independent verification status and commands", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            run: {
              status: "completed",
              pullRequestUrl: null,
              error: null,
              usage: null,
            },
            events: [
              {
                id: 1,
                sequence: 0,
                eventType: "execution.context.bound",
                createdAt: "2026-08-09T17:59:59.000Z",
                payload: {
                  workspaceVersion: 3,
                  repositoryBranch: "main",
                  repositoryHeadSha: "1111111111111111111111111111111111111111",
                },
              },
              {
                id: 2,
                sequence: 90_000,
                eventType: "verification.completed",
                createdAt: "2026-08-09T18:00:00.000Z",
                payload: {
                  status: "passed",
                  commands: [{ command: "pnpm test", exitCode: 0 }],
                },
              },
            ],
          },
        }),
      }),
    );

    render(<RunTimeline runId="run-123" runStatus="completed" />);
    const activityButton = screen.getByRole("button", { name: /activity/i });
    expect(activityButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(activityButton);
    expect(activityButton).toHaveAttribute("aria-expanded", "true");

    expect(
      await screen.findByText("Bound Workspace v3 to snapshot 1111111"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Independent verification passed"),
    ).toBeInTheDocument();
    expect(screen.getByText("pnpm test · passed")).toBeInTheDocument();
  });

  it("shows the exact publication-blocking reason even without activity", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            run: {
              status: "failed",
              pullRequestUrl: null,
              error:
                "Publication was blocked because the base branch advanced since review.",
              usage: null,
            },
            events: [],
          },
        }),
      }),
    );

    render(<RunTimeline runId="run-456" runStatus="failed" />);
    fireEvent.click(screen.getByRole("button", { name: /activity/i }));

    expect(await screen.findByText("Publication blocked")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Publication was blocked because the base branch advanced since review.",
      ),
    ).toBeInTheDocument();
  });

  it("turns an activity load failure into a recoverable state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<RunTimeline runId="run-789" runStatus="completed" />);
    fireEvent.click(screen.getByRole("button", { name: /activity/i }));

    expect(
      await screen.findByText(
        "Activity unavailable. Close and reopen this panel to retry.",
      ),
    ).toBeInTheDocument();
  });
});
