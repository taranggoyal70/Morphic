import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  audit: vi.fn(),
  deleteUser: vi.fn(),
  verifyWebhook: vi.fn(),
  where: vi.fn(),
}));

vi.mock("@clerk/nextjs/webhooks", () => ({
  verifyWebhook: mocks.verifyWebhook,
}));
vi.mock("@/lib/audit", () => ({ recordAuditEvent: mocks.audit }));
vi.mock("@/db", () => ({
  getDb: () => ({ delete: mocks.deleteUser }),
}));

import { POST } from "@/app/api/webhooks/clerk/route";

function webhookRequest() {
  return new NextRequest("https://morphic.test/api/webhooks/clerk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "user.deleted",
      data: { id: "user-123", deleted: true },
    }),
  });
}

describe("Clerk webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteUser.mockReturnValue({ where: mocks.where });
  });

  it("rejects a request when Clerk cannot verify its signature", async () => {
    mocks.verifyWebhook.mockRejectedValue(new Error("Invalid signature"));

    const response = await POST(webhookRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid webhook signature",
    });
    expect(mocks.audit).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("deletes a user only after Clerk verifies a deletion event", async () => {
    mocks.verifyWebhook.mockResolvedValue({
      type: "user.deleted",
      data: { id: "user-123", deleted: true },
    });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(mocks.verifyWebhook).toHaveBeenCalledOnce();
    expect(mocks.audit).toHaveBeenCalledWith({
      userId: "user-123",
      action: "user.deleted",
      resourceType: "user",
      resourceId: "user-123",
      metadata: { source: "clerk_webhook" },
    });
    expect(mocks.deleteUser).toHaveBeenCalledOnce();
  });
});
