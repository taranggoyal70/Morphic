import { describe, expect, it, vi } from "vitest";

import { resolveGitHubAuthorizationUrl } from "@/lib/github-connection";

const authorizationUrl = new URL("https://github.com/login/oauth/authorize");

describe("resolveGitHubAuthorizationUrl", () => {
  it("creates a connection for a new GitHub account", async () => {
    const create = vi.fn().mockResolvedValue({
      verification: { externalVerificationRedirectURL: authorizationUrl },
    });
    const reauthorize = vi.fn();

    await expect(
      resolveGitHubAuthorizationUrl({
        existingAccount: false,
        create,
        reauthorize,
      }),
    ).resolves.toBe(authorizationUrl.href);
    expect(create).toHaveBeenCalledOnce();
    expect(reauthorize).not.toHaveBeenCalled();
  });

  it("reauthorizes an existing account for required scopes", async () => {
    const create = vi.fn();
    const reauthorize = vi.fn().mockResolvedValue({
      verification: { externalVerificationRedirectURL: authorizationUrl },
    });

    await expect(
      resolveGitHubAuthorizationUrl({
        existingAccount: true,
        create,
        reauthorize,
      }),
    ).resolves.toBe(authorizationUrl.href);
    expect(reauthorize).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects a provider response without an authorization URL", async () => {
    await expect(
      resolveGitHubAuthorizationUrl({
        existingAccount: false,
        create: vi.fn().mockResolvedValue({ verification: null }),
        reauthorize: vi.fn(),
      }),
    ).rejects.toThrow("GitHub did not return an authorization URL.");
  });
});
