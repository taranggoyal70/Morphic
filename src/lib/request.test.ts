import { describe, expect, it } from "vitest";

import { parseJsonBody } from "@/lib/request";

describe("parseJsonBody", () => {
  it("turns malformed JSON into an actionable client error", async () => {
    const request = new Request("https://morphic.test/api/workspaces", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json",
    });

    await expect(parseJsonBody(request)).rejects.toMatchObject({
      status: 400,
      code: "invalid_json",
      message: "The request body must be valid JSON.",
    });
  });

  it("returns a valid JSON value unchanged", async () => {
    const request = new Request("https://morphic.test/api/workspaces", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "Ship onboarding" }),
    });

    await expect(parseJsonBody(request)).resolves.toEqual({
      objective: "Ship onboarding",
    });
  });

  it("rejects mutation payloads without a JSON media type", async () => {
    const request = new Request("https://morphic.test/api/workspaces", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: JSON.stringify({ objective: "Ship onboarding" }),
    });

    await expect(parseJsonBody(request)).rejects.toMatchObject({
      status: 415,
      code: "unsupported_media_type",
    });
  });

  it("rejects oversized JSON mutation payloads", async () => {
    const request = new Request("https://morphic.test/api/workspaces", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "x".repeat(300_000) }),
    });

    await expect(parseJsonBody(request)).rejects.toMatchObject({
      status: 413,
      code: "payload_too_large",
    });
  });
});
