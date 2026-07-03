import { GithubLogoIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { CreateWorkspaceForm } from "@/components/create-workspace-form";
import { RepositorySyncButton } from "@/components/repository-sync-button";
import { getGitHubAccessToken, requireMorphicUser } from "@/lib/auth";
import { listRepositories } from "@/lib/github";

export const metadata: Metadata = {
  title: "New objective",
};

export default async function WorkspacesPage() {
  const user = await requireMorphicUser();
  const repositories = await listRepositories(user.id);
  let githubConnected = true;
  try {
    await getGitHubAccessToken(user.id);
  } catch {
    githubConnected = false;
  }

  return (
    <main className="mx-auto max-w-[1050px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-violet-light">
            <SparkleIcon size={15} weight="fill" />
            New adaptive workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-paper sm:text-4xl">
            Begin with the outcome.
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-light">
            Morphic will inspect live GitHub evidence, compile the critical
            path, and shape the interface around what must happen next.
          </p>
        </div>
        {githubConnected ? (
          <RepositorySyncButton />
        ) : (
          <Link
            href={"/settings/connect-github" as Route}
            className="inline-flex h-10 items-center rounded-lg border border-violet/40 bg-violet/10 px-4 text-sm font-medium text-violet-light transition hover:bg-violet/20"
          >
            Connect GitHub
          </Link>
        )}
      </div>

      {repositories.length === 0 ? (
        <section className="mt-10 rounded-xl border border-line-strong bg-surface px-6 py-12 text-center">
          <GithubLogoIcon
            size={32}
            weight="fill"
            className="mx-auto text-muted-light"
          />
          <h2 className="mt-5 text-lg font-semibold text-paper">
            GitHub evidence is required
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Sign in with GitHub or connect it in Clerk, then synchronize the
            repositories you can access. Morphic never invents repository data.
          </p>
          <div className="mt-5">
            {githubConnected ? (
              <RepositorySyncButton label="Sync GitHub repositories" />
            ) : (
              <Link
                href={"/settings/connect-github" as Route}
                className="inline-flex h-10 items-center rounded-lg bg-violet px-4 text-sm font-semibold text-white transition hover:bg-violet-light hover:text-ink"
              >
                Open account connections
              </Link>
            )}
          </div>
        </section>
      ) : (
        <CreateWorkspaceForm
          repositories={repositories.map((repository) => ({
            id: repository.id,
            fullName: repository.fullName,
            description: repository.description,
            isPrivate: repository.isPrivate,
          }))}
        />
      )}
    </main>
  );
}
