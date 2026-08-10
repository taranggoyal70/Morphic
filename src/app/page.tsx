import { auth } from "@clerk/nextjs/server";
import {
  ArrowRightIcon,
  GitBranchIcon,
  ShieldCheckIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "Morphic — Adaptive workspaces for software builders",
  description:
    "Turn a software objective into a living interface grounded in GitHub, then supervise approved Codex work from plan to pull request.",
};

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/workspaces");

  return (
    <main className="min-h-screen bg-ink">
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <Brand />
        <div className="flex items-center gap-3">
          <Link
            href={"/demo" as Route}
            className="rounded-lg border border-line-strong px-3 py-2 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
          >
            View demo
          </Link>
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

      <section className="mx-auto grid max-w-[1180px] gap-16 px-6 pb-20 pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pt-28">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3 py-1.5 text-xs font-medium text-violet-light">
            <SparkleIcon size={14} weight="fill" />
            Adaptive software for builders
          </p>
          <h1 className="max-w-[720px] text-5xl font-semibold leading-[1.02] text-paper sm:text-6xl lg:text-7xl">
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
            <Link
              href={"/demo" as Route}
              className="inline-flex items-center gap-2 rounded-lg border border-mint/30 bg-mint/5 px-5 py-3 text-sm font-medium text-mint transition hover:bg-mint/10"
            >
              See incident-to-PR demo
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

        <div className="relative overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[0_18px_60px_rgba(0,0,0,0.38)] transition duration-200 hover:border-violet/40">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase text-violet-light">
                Active objective
              </p>
              <p className="mt-2 text-xl font-semibold text-paper">
                Ship onboarding by Friday
              </p>
            </div>
            <span className="rounded-md border border-mint/20 bg-mint/10 px-2 py-1 text-xs text-mint">
              On track
            </span>
          </div>
          <div className="grid grid-cols-3 border-b border-line">
            <div className="border-r border-line px-5 py-4">
              <strong className="block text-2xl text-paper">5</strong>
              <span className="text-xs text-muted">path items</span>
            </div>
            <div className="border-r border-line px-5 py-4">
              <strong className="block text-2xl text-mint">3</strong>
              <span className="text-xs text-muted">ready now</span>
            </div>
            <div className="px-5 py-4">
              <strong className="block text-2xl text-amber">1</strong>
              <span className="text-xs text-muted">open decision</span>
            </div>
          </div>
          <div className="px-5 py-2">
            {[
              ["01", "Map existing auth flow", "Ready", "src/app/sign-in"],
              [
                "02",
                "Add organization invite path",
                "Ready",
                "src/lib/invites.ts",
              ],
              ["03", "Choose session handoff", "Decision", "2 options"],
              ["04", "Implement onboarding state", "Queued", "blocked by 03"],
            ].map(([index, task, status, evidence]) => (
              <div
                key={index}
                className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-2 py-4 transition-colors last:border-b-0 hover:bg-white/[0.025]"
              >
                <span className="font-mono text-[10px] text-muted">
                  {index}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-paper">
                    {task}
                  </p>
                  <p className="mt-1 truncate font-mono text-[10px] text-muted">
                    {evidence}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-[10px] font-medium ${status === "Ready" ? "bg-mint/10 text-mint" : status === "Decision" ? "bg-amber/10 text-amber" : "bg-white/5 text-muted-light"}`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
          <div className="grid gap-4 border-t border-line bg-ink/50 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon
                size={18}
                className="text-violet-light"
                weight="duotone"
              />
              <div>
                <p className="text-xs font-medium text-paper">
                  Codex run awaiting approval
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Isolated sandbox · branch + draft PR
                </p>
              </div>
            </div>
            <span className="rounded border border-violet/30 bg-violet/10 px-3 py-2 text-center text-xs text-violet-light">
              Review run
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] border-t border-line px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="font-mono text-[10px] uppercase text-mint">
              One durable path
            </p>
            <h2 className="mt-5 max-w-sm text-4xl font-semibold leading-tight text-paper sm:text-5xl">
              From objective to reviewed PR.
            </h2>
          </div>
          <div className="border-t border-line">
            {[
              {
                icon: GitBranchIcon,
                title: "Ground",
                body: "Snapshot the repository, issues, and pull requests into durable evidence.",
              },
              {
                icon: SparkleIcon,
                title: "Shape",
                body: "Compile a critical path, open decisions, and the interface this objective needs.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Execute",
                body: "Approve an isolated agent run and receive a reviewable branch and draft pull request.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="grid grid-cols-[42px_120px_1fr] gap-4 border-b border-line px-2 py-6 transition-colors hover:bg-white/[0.025]"
              >
                <span className="font-mono text-[10px] text-muted">
                  0{index + 1}
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-paper">
                  <item.icon
                    size={16}
                    className="text-violet-light"
                    weight="duotone"
                  />
                  {item.title}
                </div>
                <p className="m-0 text-sm leading-6 text-muted-light">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 pb-20">
        <div className="grid gap-8 rounded-lg border border-line-strong bg-paper p-8 text-ink sm:grid-cols-[1fr_auto] sm:items-end sm:p-10">
          <div>
            <p className="font-mono text-[10px] uppercase text-violet">
              GitHub in. Reviewable work out.
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
              Shape the workspace around the outcome, not the other way around.
            </h2>
          </div>
          <Link
            href={"/sign-up" as Route}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-violet"
          >
            Connect GitHub <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </div>
      </section>
    </main>
  );
}
