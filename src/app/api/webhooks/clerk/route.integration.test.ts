import { createHmac } from "node:crypto";

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  audit: vi.fn(),
  deleteUser: vi.fn(),
  where: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({ recordAuditEvent: mocks.audit }));
vi.mock("@/db", () => ({
  getDb: () => ({ delete: mocks.deleteUser }),
}));

import { POST } from "@/app/api/webhooks/clerk/route";

const signingSecret = `whsec_${Buffer.from("morphic-webhook-secret").toString(
  "base64",
)}`;

function signature({
  body,
  id,
  timestamp,
}: {
  body: string;
  id: string;
  timestamp: number;
}) {
  const digest = createHmac("sha256", Buffer.from("morphic-webhook-secret"))
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
  return `v1,${digest}`;
}

function signedRequest(payload: unknown) {
  const body = JSON.stringify(payload);
  const id = "msg_user_deleted";
  const timestamp = Math.floor(Date.now() / 1000);
  return new NextRequest("https://morphic.test/api/webhooks/clerk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": id,
      "svix-timestamp": String(timestamp),
      "svix-signature": signature({ body, id, timestamp }),
    },
    body,
  });
}

describe("Clerk webhook signature integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CLERK_WEBHOOK_SIGNING_SECRET", signingSecret);
    mocks.deleteUser.mockReturnValue({ where: mocks.where });
  });

  it("accepts a user.deleted event signed with the configured Clerk secret", async () => {
    const response = await POST(
      signedRequest({
        type: "user.deleted",
        data: { id: "user_123", deleted: true },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(mocks.audit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_123",
        action: "user.deleted",
      }),
    );
    expect(mocks.deleteUser).toHaveBeenCalledOnce();
  });
});
