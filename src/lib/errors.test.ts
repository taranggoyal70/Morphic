import { describe, expect, it } from "vitest";
import { z } from "zod";

import { toErrorResponse } from "./errors";

describe("toErrorResponse", () => {
  it("returns an actionable client error for invalid application input", async () => {
    const result = z.object({ companyName: z.string().min(2) }).safeParse({
      companyName: "",
    });
    if (result.success) throw new Error("Expected invalid test input.");

    const response = toErrorResponse(result.error);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: {
        code: "invalid_request",
        message: "Check the highlighted fields and try again.",
      },
    });
  });
});
