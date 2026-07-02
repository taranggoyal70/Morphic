import { auth } from "@clerk/nextjs/server";
import {
  ArrowRightIcon,
  GitBranchIcon,
  ShieldCheckIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/workspaces");

  return (
    <main className="min-h-screen bg-ink">
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <Brand />
        <div className="flex items-center gap-3">
          <Link
            href={"/sign-in" as Route}
            className="rounded-lg px-3 py-2 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
          >
            Sign in
          </Link>
          <Link
            href={"/sign-up" as Route}
            className="rounded-lg bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
          >
            Start building
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-[1180px] gap-16 px-6 pb-24 pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pt-32">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3 py-1.5 text-xs font-medium text-violet-light">
            <SparkleIcon size={14} weight="fill" />
            Adaptive software for builders
          </p>
          <h1 className="max-w-[720px] text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-paper sm:text-6xl lg:text-7xl">
            Describe the outcome.
            <span className="block text-muted">
              Morphic shapes the workspace.
            </span>
          </h1>
          <p className="mt-7 max-w-[610px] text-lg leading-8 text-muted-light">
            Morphic turns a software objective into a living interface grounded
            in GitHub, then lets you supervise approved Codex work from plan to
            pull request.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={"/sign-up" as Route}
              className="inline-flex items-center gap-2 rounded-lg bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-light hover:text-ink"
            >
              Connect GitHub
              <ArrowRightIcon size={16} weight="bold" />
            </Link>
            <a
              href="https://github.com/taranggoyal70/Morphic"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-line-strong px-5 py-3 text-sm font-medium text-paper transition hover:bg-white/5"
            >
              View the repository
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-surface p-5 shadow-[0_32px_120px_rgba(0,0,0,0.55)]">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-light">
                Active objective
              </p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.025em] text-paper">
                Ship onboarding by Friday
              </p>
            </div>
            <span className="rounded-md border border-mint/20 bg-mint/10 px-2 py-1 text-xs text-mint">
              On track
            </span>
          </div>
          <div className="grid gap-0 sm:grid-cols-3">
            {[
              {
                icon: GitBranchIcon,
                title: "Critical path",
                body: "GitHub evidence becomes a dependency-aware plan.",
              },
              {
                icon: SparkleIcon,
                title: "Adaptive interface",
                body: "The workspace changes when the objective changes.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Governed Codex",
                body: "Every run is approved, isolated, and auditable.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-line px-4 py-5 first:pl-0 last:pr-0 sm:border-l sm:first:border-l-0"
              >
                <item.icon
                  size={19}
                  className="mb-7 text-violet-light"
                  weight="duotone"
                />
                <p className="text-sm font-medium text-paper">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
