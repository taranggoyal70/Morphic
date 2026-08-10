type GitCommandResult = {
  exitCode: number;
  stderr(): Promise<string>;
};

export async function pushWithEphemeralCredentials(input: {
  repositoryFullName: string;
  githubToken: string;
  branchName: string;
  runGit: (args: string[], timeoutMs?: number) => Promise<GitCommandResult>;
}) {
  const publicUrl = `https://github.com/${input.repositoryFullName}.git`;
  const authenticatedUrl = `https://x-access-token:${input.githubToken}@github.com/${input.repositoryFullName}.git`;

  const authenticated = await input.runGit([
    "remote",
    "set-url",
    "origin",
    authenticatedUrl,
  ]);
  if (authenticated.exitCode !== 0) {
    throw new Error(
      `Could not authenticate the publication remote: ${await authenticated.stderr()}`,
    );
  }

  let pushError: Error | null = null;
  try {
    const push = await input.runGit(
      ["push", "--set-upstream", "origin", input.branchName],
      120_000,
    );
    if (push.exitCode !== 0) {
      pushError = new Error(`Git push failed: ${await push.stderr()}`);
    }
  } finally {
    const cleaned = await input.runGit([
      "remote",
      "set-url",
      "origin",
      publicUrl,
    ]);
    if (cleaned.exitCode !== 0) {
      throw new Error(
        `Could not remove credentials from the publication remote: ${await cleaned.stderr()}`,
      );
    }
  }

  if (pushError) throw pushError;
}
