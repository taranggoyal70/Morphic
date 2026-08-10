import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RunTimeline } from "@/components/run-timeline";

afterEach(() => {
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
    fireEvent.click(screen.getByRole("button", { name: /activity/i }));

    expect(
      await screen.findByText("Independent verification passed"),
    ).toBeInTheDocument();
    expect(screen.getByText("pnpm test · passed")).toBeInTheDocument();
  });
});
