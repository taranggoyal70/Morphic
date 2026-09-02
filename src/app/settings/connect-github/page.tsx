import {
  ArrowLeftIcon,
  CheckCircleIcon,
  GithubLogoIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GitHubConnectButton } from "@/components/github-connect-button";
import { RepositorySyncButton } from "@/components/repository-sync-button";
import { getGitHubAccessToken, requireMorphicUser } from "@/lib/auth";
import { listRepositories } from "@/lib/github";

export const metadata: Metadata = {
  title: "Connect GitHub",
};

export default async function ConnectGitHubPage({
  searchParams,
}: {
  searchParams: Promise<{ github?: string }>;
}) {
  const user = await requireMorphicUser();
  const query = await searchParams;
  let githubConnected = false;
  try {
    await getGitHubAccessToken(user.id);
    githubConnected = true;
  } catch {
    githubConnected = false;
  }
  const repositories = githubConnected ? await listRepositories(user.id) : [];

  if (githubConnected && repositories.length > 0) {
    redirect("/workspaces");
  }

  return (
    <main id="main-content" className="mx-auto max-w-[640px] px-5 py-10 sm:px-8 lg:py-16">
      <Link
        href={"/workspaces" as Route}
        className="mb-8 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
      >
        <ArrowLeftIcon size={14} />
        Back to workspaces
      </Link>

      <div className="rounded-[20px] border border-line-strong bg-surface px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,.18)] sm:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-xl border border-evidence/30 bg-evidence/10 text-evidence">
            <GithubLogoIcon size={24} weight="fill" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.035em] text-paper">Connect repository evidence</h1>
            <p className="mt-0.5 text-sm text-muted">
              Authorize the source Morphic will ground every route in
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-line bg-ink/65 px-4 py-4">
            {githubConnected ? (
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="mt-0.5 shrink-0 text-mint"
              />
            ) : (
              <XCircleIcon
                size={18}
                weight="fill"
                className="mt-0.5 shrink-0 text-danger"
              />
            )}
            <div>
              <p className="text-sm font-medium text-paper">
                {githubConnected
                  ? "GitHub is connected"
                  : "Step 1: Connect your GitHub account"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {githubConnected
                  ? "Your GitHub account is linked with the required scopes."
                  : "Approve repository and organization access. Morphic keeps the provider token server-side and never stores it in your browser."}
              </p>
              {!githubConnected && (
                <GitHubConnectButton
                  returnUrl="/settings/connect-github?github=connected"
                  label="Authorize GitHub"
                  className="mt-3 h-9 font-medium"
                />
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-line bg-ink/65 px-4 py-4">
            {repositories.length > 0 ? (
              <CheckCircleIcon
                size={18}
                weight="fill"
                className="mt-0.5 shrink-0 text-mint"
              />
            ) : (
              <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border border-line-strong text-[10px] text-muted">
                2
              </span>
            )}
            <div>
              <p className="text-sm font-medium text-paper">
                {repositories.length > 0
                  ? `${repositories.length} repositories synced`
                  : "Step 2: Sync your repositories"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {repositories.length > 0
                  ? "Your repositories are available for workspace creation."
                  : "After connecting GitHub, sync to import your accessible repositories."}
              </p>
              {githubConnected && repositories.length === 0 && (
                <div className="mt-3">
                  <RepositorySyncButton
                    label="Sync repositories"
                    autoSync={query.github === "connected"}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {githubConnected && repositories.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              href={"/workspaces" as Route}
              className="inline-flex h-11 items-center rounded-lg bg-evidence px-5 text-sm font-bold text-ink transition hover:bg-evidence-soft"
            >
              Create your first workspace
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
