import { describe, expect, it } from "vitest";

import { authenticationReadiness } from "@/lib/deployment-readiness";

describe("authenticationReadiness", () => {
  it("recognizes a matched production Clerk configuration", () => {
    expect(
      authenticationReadiness({
        publishableKey: "pk_live_example",
        secretKey: "sk_live_example",
      }),
    ).toEqual({ mode: "production", productionReady: true });
  });

  it("reports matched test credentials as development mode", () => {
    expect(
      authenticationReadiness({
        publishableKey: "pk_test_example",
        secretKey: "sk_test_example",
      }),
    ).toEqual({ mode: "development", productionReady: false });
  });

  it("rejects missing or mixed credential modes", () => {
    expect(
      authenticationReadiness({
        publishableKey: "pk_live_example",
        secretKey: "sk_test_example",
      }),
    ).toEqual({ mode: "misconfigured", productionReady: false });
    expect(authenticationReadiness({})).toEqual({
      mode: "misconfigured",
      productionReady: false,
    });
  });
});
