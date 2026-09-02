import { describe, expect, it } from "vitest";
import { z } from "zod";

import { toErrorResponse } from "@/lib/errors";

describe("toErrorResponse", () => {
  it("returns a client error for invalid request data", async () => {
    const failure = z.object({ name: z.string().min(3) }).safeParse({ name: "x" });

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
});
