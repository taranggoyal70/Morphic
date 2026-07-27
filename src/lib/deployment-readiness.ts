export type AuthenticationMode =
  | "production"
  | "development"
  | "misconfigured";

export function authenticationReadiness(input: {
  publishableKey?: string;
  secretKey?: string;
}) {
  const publishableMode = input.publishableKey?.startsWith("pk_live_")
    ? "production"
    : input.publishableKey?.startsWith("pk_test_")
      ? "development"
      : "unknown";
  const secretMode = input.secretKey?.startsWith("sk_live_")
    ? "production"
    : input.secretKey?.startsWith("sk_test_")
      ? "development"
      : "unknown";
  const mode: AuthenticationMode =
    publishableMode === secretMode && publishableMode !== "unknown"
      ? publishableMode
      : "misconfigured";

  return {
    mode,
    productionReady: mode === "production",
  };
}
