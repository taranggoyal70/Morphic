import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DesignPartnerApplicationForm } from "./design-partner-application-form";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("DesignPartnerApplicationForm", () => {
  it("submits attributable pilot evidence and confirms receipt", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ application: { id: "application-1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const incidentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000)
      .toISOString()
      .slice(0, 10);

    render(
      <DesignPartnerApplicationForm
        today={new Date().toISOString().slice(0, 10)}
      />,
    );

    fireEvent.change(screen.getByLabelText("Company name"), {
      target: { value: "Acme AI" },
    });
    fireEvent.change(screen.getByLabelText("Your role"), {
      target: { value: "AI platform lead" },
    });
    fireEvent.change(screen.getByLabelText("Engineering team size"), {
      target: { value: "20-49" },
    });
    fireEvent.click(
      screen.getByLabelText("A customer-facing AI agent is in production"),
    );
    fireEvent.click(screen.getByLabelText("Application code lives in GitHub"));
    fireEvent.change(screen.getByLabelText("Recent incident date"), {
      target: { value: incidentDate },
    });
    fireEvent.change(screen.getByLabelText("Redacted incident summary"), {
      target: {
        value: "A support agent repeated a refund after a retried tool call.",
      },
    });
    fireEvent.click(screen.getByLabelText("Braintrust"));
    fireEvent.click(screen.getByLabelText("GitHub Actions"));
    fireEvent.change(screen.getByLabelText("How do you prove the fix today?"), {
      target: {
        value:
          "We copy a trace into an issue and rely on a broad pull request check.",
      },
    });
    fireEvent.click(
      screen.getByLabelText("I can provide a redacted incident artifact"),
    );
    fireEvent.click(screen.getByLabelText("Ready to fund a $10K-$25K pilot"));
    fireEvent.click(
      screen.getByLabelText(
        "I confirm this application contains no customer data or secrets",
      ),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Apply for the paid pilot" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(request.body))).toMatchObject({
      companyName: "Acme AI",
      engineeringTeamSize: "20-49",
      productionAgentConfirmed: true,
      githubConfirmed: true,
      currentStack: ["braintrust", "github_actions"],
      artifactWilling: true,
      pilotReadiness: "ready_to_pay",
      redactionConfirmed: true,
    });
    expect(screen.getByText("Application received")).toBeInTheDocument();
  });
});
