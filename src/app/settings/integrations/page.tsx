import {
  CheckCircleIcon,
  GithubLogoIcon,
  SparkleIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { RepositorySyncButton } from "@/components/repository-sync-button";
import { requireMorphicUser, getGitHubAccessToken } from "@/lib/auth";
import { listRepositories } from "@/lib/github";

export const metadata: Metadata = {
  title: "Integrations",
};

export default async function IntegrationsPage() {
  const user = await requireMorphicUser();
  let githubConnected = false;
  try {
    await getGitHubAccessToken(user.id);
    githubConnected = true;
  } catch {
    githubConnected = false;
  }
  const repositories = githubConnected ? await listRepositories(user.id) : [];

  return (
    <main className="mx-auto max-w-[920px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <div className="flex items-center gap-2 text-xs font-medium text-violet-light">
        <SparkleIcon size={15} weight="fill" />
        Product connections
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-paper">
        Integrations
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-light">
        Morphic uses server-side OAuth tokens and managed infrastructure. It
        never stores provider tokens in browser storage.
      </p>

      <section className="mt-9 rounded-xl border border-line-strong bg-surface px-5 py-5">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-ink">
              <GithubLogoIcon size={21} weight="fill" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-paper">GitHub</h2>
                {githubConnected ? (
                  <CheckCircleIcon
                    size={14}
                    weight="fill"
                    className="text-mint"
                  />
                ) : (
                  <XCircleIcon
                    size={14}
                    weight="fill"
                    className="text-danger"
                  />
                )}
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">
                {githubConnected
                  ? `${repositories.length} repositories currently synchronized.`
                  : "Connect GitHub in your account profile to provide repository evidence."}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={"/user-profile" as Route}
              className="inline-flex items-center rounded-lg border border-line-strong px-3.5 py-2 text-sm font-medium text-muted-light transition hover:bg-white/5 hover:text-paper"
            >
              Manage account
            </Link>
            {githubConnected && <RepositorySyncButton />}
          </div>
        </div>
      </section>
    </main>
  );
}
