import { describe, expect, it, vi } from "vitest";

import { pushWithEphemeralCredentials } from "@/lib/publication-remote";

function result(exitCode = 0, error = "") {
  return {
    exitCode,
    stderr: vi.fn().mockResolvedValue(error),
  };
}

describe("pushWithEphemeralCredentials", () => {
  it("removes credentials from origin after a successful push", async () => {
    const runGit = vi.fn().mockResolvedValue(result());

    await pushWithEphemeralCredentials({
      repositoryFullName: "acme/checkout",
      githubToken: "secret-token",
      branchName: "morphic/run-123",
      runGit,
    });

    expect(runGit.mock.calls.at(-1)?.[0]).toEqual([
      "remote",
      "set-url",
      "origin",
      "https://github.com/acme/checkout.git",
    ]);
  });

  it("removes credentials from origin when the push fails", async () => {
    const runGit = vi
      .fn()
      .mockResolvedValueOnce(result())
      .mockResolvedValueOnce(result(1, "rejected"))
      .mockResolvedValueOnce(result());

    await expect(
      pushWithEphemeralCredentials({
        repositoryFullName: "acme/checkout",
        githubToken: "secret-token",
        branchName: "morphic/run-123",
        runGit,
      }),
    ).rejects.toThrow("Git push failed: rejected");

    expect(runGit.mock.calls.at(-1)?.[0]).toEqual([
      "remote",
      "set-url",
      "origin",
      "https://github.com/acme/checkout.git",
    ]);
  });
});
