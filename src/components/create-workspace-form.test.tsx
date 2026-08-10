import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CreateWorkspaceForm } from "@/components/create-workspace-form";

const { push, success } = vi.hoisted(() => ({
  push: vi.fn(),
  success: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("sonner", () => ({
  toast: { success, error: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("CreateWorkspaceForm", () => {
  it("creates an incident-first workspace with redacted acceptance evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ workspace: { id: "workspace-1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CreateWorkspaceForm
        repositories={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            fullName: "acme/checkout",
            description: null,
            isPrivate: true,
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Repository evidence"), {
      target: { value: "11111111-1111-4111-8111-111111111111" },
    });
    fireEvent.change(screen.getByLabelText("What outcome are you driving?"), {
      target: { value: "Prevent duplicate charges after tool retries" },
    });
    fireEvent.change(screen.getByLabelText("Incident source"), {
      target: { value: "braintrust" },
    });
    fireEvent.change(screen.getByLabelText("Incident ID"), {
      target: { value: "bt-9831" },
    });
    fireEvent.change(screen.getByLabelText("Incident title"), {
      target: { value: "Checkout agent repeated a customer charge" },
    });
    fireEvent.change(screen.getByLabelText("Occurred at"), {
      target: { value: "2026-08-07T14:32" },
    });
    fireEvent.change(screen.getByLabelText("Trace URL"), {
      target: {
        value: "https://braintrust.dev/app/acme/p/trace/bt-9831",
      },
    });
    fireEvent.change(screen.getByLabelText("Observed behavior"), {
      target: { value: "A retried tool call created two charges." },
    });
    fireEvent.change(screen.getByLabelText("Expected behavior"), {
      target: { value: "A retried tool call creates one charge." },
    });
    fireEvent.change(screen.getByLabelText("Acceptance criterion"), {
      target: {
        value: "Replaying the same tool call creates exactly one charge.",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Add acceptance criterion" }),
    );
    fireEvent.click(
      screen.getByLabelText("I confirm this incident evidence is redacted"),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Create regression workspace" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));

    expect(body.incident).toMatchObject({
      source: "braintrust",
      externalId: "bt-9831",
      title: "Checkout agent repeated a customer charge",
      observedBehavior: "A retried tool call created two charges.",
      expectedBehavior: "A retried tool call creates one charge.",
      traceUrl: "https://braintrust.dev/app/acme/p/trace/bt-9831",
      acceptanceCriteria: [
        "Replaying the same tool call creates exactly one charge.",
      ],
      redactionConfirmed: true,
    });
    expect(body.incident.occurredAt).toBe(
      new Date("2026-08-07T14:32").toISOString(),
    );
    expect(success).toHaveBeenCalledWith(
      "Morphic is compiling the incident regression workspace.",
    );
    expect(push).toHaveBeenCalledWith("/workspaces/workspace-1");
  });

  it("preserves the general objective workflow without incident evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ workspace: { id: "workspace-2" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CreateWorkspaceForm
        repositories={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            fullName: "acme/checkout",
            description: null,
            isPrivate: true,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /General objective/ }));
    expect(screen.queryByLabelText("Incident source")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Repository evidence"), {
      target: { value: "11111111-1111-4111-8111-111111111111" },
    });
    fireEvent.change(screen.getByLabelText("What outcome are you driving?"), {
      target: { value: "Ship reliable customer onboarding" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Shape workspace" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(request.body))).toMatchObject({ incident: null });
    expect(push).toHaveBeenCalledWith("/workspaces/workspace-2");
  });
});
