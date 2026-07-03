import {
  ArrowLeftIcon,
  CheckCircleIcon,
  GithubLogoIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RepositorySyncButton } from "@/components/repository-sync-button";
import { getGitHubAccessToken, requireMorphicUser } from "@/lib/auth";
import { listRepositories } from "@/lib/github";

export const metadata: Metadata = {
  title: "Connect GitHub",
};

export default async function ConnectGitHubPage() {
  const user = await requireMorphicUser();
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
    <main className="mx-auto max-w-[640px] px-5 py-10 sm:px-8 lg:py-16">
      <Link
        href={"/workspaces" as Route}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-light transition hover:text-paper"
      >
        <ArrowLeftIcon size={14} />
        Back to workspaces
      </Link>

      <div className="rounded-xl border border-line-strong bg-surface px-6 py-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-xl border border-line bg-ink">
            <GithubLogoIcon size={24} weight="fill" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-paper">Connect GitHub</h1>
            <p className="mt-0.5 text-sm text-muted">
              Morphic needs access to your repositories
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-line bg-ink/50 px-4 py-3.5">
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
                  : "Click your avatar in the bottom-left corner, then add GitHub under Connected Accounts. Morphic requires repo and read:org scopes."}
              </p>
              {!githubConnected && (
                <Link
                  href={"/user-profile" as Route}
                  className="mt-3 inline-flex h-9 items-center rounded-lg bg-violet px-4 text-sm font-medium text-white transition hover:bg-violet-light hover:text-ink"
                >
                  Open account settings
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-line bg-ink/50 px-4 py-3.5">
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
                  <RepositorySyncButton label="Sync repositories" />
                </div>
              )}
            </div>
          </div>
        </div>

        {githubConnected && repositories.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              href={"/workspaces" as Route}
              className="inline-flex h-10 items-center rounded-lg bg-violet px-5 text-sm font-semibold text-white transition hover:bg-violet-light hover:text-ink"
            >
              Create your first workspace
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
