type GitHubConnectionResult =
  | {
      verification?: {
        externalVerificationRedirectURL?: URL | null;
      } | null;
    }
  | null
  | undefined;

export async function resolveGitHubAuthorizationUrl(input: {
  existingAccount: boolean;
  create: () => Promise<GitHubConnectionResult>;
  reauthorize: () => Promise<GitHubConnectionResult>;
}) {
  const account = input.existingAccount
    ? await input.reauthorize()
    : await input.create();
  const url = account?.verification?.externalVerificationRedirectURL;

  if (!url) {
    throw new Error("GitHub did not return an authorization URL.");
  }

  return url.href;
}
