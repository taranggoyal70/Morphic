import { describe, expect, it } from "vitest";

import { errorMessage } from "@/lib/error-message";

describe("errorMessage", () => {
  it("reads native errors", () => {
    expect(errorMessage(new Error("Planner failed."), "Unknown")).toBe(
      "Planner failed.",
    );
  });

  it("preserves messages serialized across a workflow boundary", () => {
    expect(
      errorMessage(
        { name: "FatalError", message: "GitHub Models quota reached." },
        "Unknown",
      ),
    ).toBe("GitHub Models quota reached.");
  });

  it("reads a nested serialized cause", () => {
    expect(
      errorMessage(
        { cause: { message: "Provider authentication failed." } },
        "Unknown",
      ),
    ).toBe("Provider authentication failed.");
  });

  it("uses the fallback for unhelpful values", () => {
    expect(errorMessage({ message: "" }, "Unknown")).toBe("Unknown");
  });
});
