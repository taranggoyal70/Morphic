import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AppError, toErrorResponse } from "@/lib/errors";

describe("toErrorResponse", () => {
  it("returns a client error for invalid request data", async () => {
    const failure = z
      .object({ name: z.string().min(3) })
      .safeParse({ name: "x" });

    expect(failure.success).toBe(false);
    if (failure.success) return;

    const response = toErrorResponse(failure.error);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "invalid_request",
        message: "The request contains invalid data.",
      },
    });
  });

  it("prevents error payloads from being cached", () => {
    const response = toErrorResponse(
      new AppError("Workspace not found.", 404, "workspace_not_found"),
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("tells rate-limited clients when they may retry", () => {
    const response = toErrorResponse(
      new AppError("Too many requests.", 429, "rate_limited", {
        resetAt: Date.now() + 5_000,
      }),
    );

    expect(Number(response.headers.get("retry-after"))).toBeGreaterThanOrEqual(
      4,
    );
  });
});
