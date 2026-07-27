import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  approve: vi.fn(),
  audit: vi.fn(),
  rateLimit: vi.fn(),
  reject: vi.fn(),
  setWorkflowRunId: vi.fn(),
  start: vi.fn(),
  update: vi.fn(),
  user: vi.fn(),
  workflow: vi.fn(),
}));

vi.mock("workflow/api", () => ({ start: mocks.start }));
vi.mock("@/lib/audit", () => ({ recordAuditEvent: mocks.audit }));
vi.mock("@/lib/auth", () => ({ requireMorphicUser: mocks.user }));
vi.mock("@/lib/codex-runs", () => ({
  approveCodexRun: mocks.approve,
  rejectCodexRun: mocks.reject,
  setCodexWorkflowRunId: mocks.setWorkflowRunId,
  updateCodexRun: mocks.update,
}));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: mocks.rateLimit,
}));
vi.mock("@/workflows/codex-run", () => ({
  codexRunWorkflow: mocks.workflow,
}));

import { POST } from "@/app/api/codex-runs/[runId]/approval/route";

const context = { params: Promise.resolve({ runId: "run-123" }) };

function approvalRequest(
  body: { decision: "approve" } | { decision: "reject"; note?: string },
) {
  return new Request("https://morphic.test/api/codex-runs/run-123/approval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("codex run approval route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user.mockResolvedValue({ id: "user-123" });
    mocks.start.mockResolvedValue({ runId: "workflow-123" });
  });

  it("queues the durable workflow only after recording approval", async () => {
    const response = await POST(
      approvalRequest({ decision: "approve" }),
      context,
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      status: "queued",
      workflowRunId: "workflow-123",
      trackingPersisted: true,
    });
    expect(mocks.rateLimit).toHaveBeenCalledWith({
      userId: "user-123",
      action: "codex-run-approval",
      limit: 20,
      window: "1 h",
    });
    expect(mocks.approve).toHaveBeenCalledWith("user-123", "run-123");
    expect(mocks.audit).toHaveBeenCalledWith({
      userId: "user-123",
      action: "codex_run.approved",
      resourceType: "codex_run",
      resourceId: "run-123",
    });
    expect(mocks.approve.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.start.mock.invocationCallOrder[0],
    );
    expect(mocks.start).toHaveBeenCalledWith(mocks.workflow, [
      { userId: "user-123", runId: "run-123" },
    ]);
    expect(mocks.setWorkflowRunId).toHaveBeenCalledWith(
      "user-123",
      "run-123",
      "workflow-123",
    );
  });

  it("records a rejection without starting any workflow", async () => {
    const response = await POST(
      approvalRequest({ decision: "reject", note: "Needs a smaller scope." }),
      context,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "rejected" });
    expect(mocks.reject).toHaveBeenCalledWith(
      "user-123",
      "run-123",
      "Needs a smaller scope.",
    );
    expect(mocks.audit).toHaveBeenCalledWith({
      userId: "user-123",
      action: "codex_run.rejected",
      resourceType: "codex_run",
      resourceId: "run-123",
      metadata: { note: "Needs a smaller scope." },
    });
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it("marks the approved run failed when workflow startup fails", async () => {
    const error = new Error("Workflow service unavailable.");
    mocks.start.mockRejectedValue(error);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const response = await POST(
      approvalRequest({ decision: "approve" }),
      context,
    );

    expect(response.status).toBe(500);
    expect(mocks.update).toHaveBeenCalledWith(
      "run-123",
      expect.objectContaining({
        status: "failed",
        error: "Workflow service unavailable.",
        completedAt: expect.any(Date),
      }),
    );
    expect(mocks.setWorkflowRunId).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("keeps a started workflow queued when only tracking persistence fails", async () => {
    mocks.setWorkflowRunId.mockRejectedValue(
      new Error("Database temporarily unavailable."),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const response = await POST(
      approvalRequest({ decision: "approve" }),
      context,
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      status: "queued",
      workflowRunId: "workflow-123",
      trackingPersisted: false,
    });
    expect(mocks.update).not.toHaveBeenCalledWith(
      "run-123",
      expect.objectContaining({ status: "failed" }),
    );
    consoleError.mockRestore();
  });
});
