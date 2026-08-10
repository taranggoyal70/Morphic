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
  title: "Morphic — Evidence-bound AI incident fixes",
  description:
    "Bind a production AI incident, reviewed source, repository regression, and human approval into one drift-resistant release record.",
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
            href={"/design-partners" as Route}
            className="rounded-lg border border-mint/30 bg-mint/5 px-3 py-2 text-sm text-mint transition hover:bg-mint/10"
          >
            Paid pilot
          </Link>
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
            <ShieldCheckIcon size={14} weight="fill" />
            Incident-to-regression release control
          </p>
          <h1 className="max-w-[720px] text-5xl font-semibold leading-[1.02] text-paper sm:text-6xl lg:text-7xl">
            A green check is not proof.
            <span className="block text-muted">
              Bind the fix to the incident.
            </span>
          </h1>
          <p className="mt-7 max-w-[610px] text-lg leading-8 text-muted-light">
            Morphic proves that an approved production AI fix and its repository
            regression ran against the exact source under review, then blocks
            publication when the reviewed source drifts.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={"/design-partners" as Route}
              className="inline-flex items-center gap-2 rounded-lg bg-violet px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-light hover:text-ink"
            >
              Apply for the paid pilot
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
          <div className="border-b border-violet/20 bg-violet/10 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-violet-light">
            Illustrative synthetic evidence · not customer or repository data
          </div>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase text-violet-light">
                Illustrative incident · INC-284
              </p>
              <p className="mt-2 text-xl font-semibold text-paper">
                Refund agent repeated a credit
              </p>
            </div>
            <span className="rounded-md border border-amber/20 bg-amber/10 px-2 py-1 text-xs text-amber">
              Awaiting approval
            </span>
          </div>
          <div className="grid grid-cols-3 border-b border-line">
            <div className="border-r border-line px-5 py-4">
              <strong className="block font-mono text-sm text-paper">
                c418a7f
              </strong>
              <span className="text-xs text-muted">reviewed SHA</span>
            </div>
            <div className="border-r border-line px-5 py-4">
              <strong className="block text-2xl text-mint">1</strong>
              <span className="text-xs text-muted">linked test</span>
            </div>
            <div className="px-5 py-4">
              <strong className="block text-2xl text-paper">0</strong>
              <span className="text-xs text-muted">skipped cases</span>
            </div>
          </div>
          <div className="px-5 py-2">
            {[
              [
                "01",
                "Incident evidence bound",
                "Bound",
                "Braintrust · INC-284",
              ],
              ["02", "Repository snapshot reviewed", "Bound", "main · c418a7f"],
              [
                "03",
                "Behavioral regression passed",
                "Passed",
                "refund-idempotency.test.ts",
              ],
              [
                "04",
                "Human release decision",
                "Review",
                "source drift blocks publication",
              ],
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
                  className={`rounded px-2 py-1 text-[10px] font-medium ${status === "Passed" ? "bg-mint/10 text-mint" : status === "Review" ? "bg-amber/10 text-amber" : "bg-violet/10 text-violet-light"}`}
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
                  Evidence-bound run awaiting approval
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Workspace v4 · exact SHA · direct test path
                </p>
              </div>
            </div>
            <span className="rounded border border-violet/30 bg-violet/10 px-3 py-2 text-center text-xs text-violet-light">
              Review evidence
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
              From incident to reviewed PR.
            </h2>
          </div>
          <div className="border-t border-line">
            {[
              {
                icon: GitBranchIcon,
                title: "Ground",
                body: "Bind a redacted production incident to a durable repository snapshot.",
              },
              {
                icon: SparkleIcon,
                title: "Shape",
                body: "Compile its acceptance criteria into a critical path and repository-owned regression.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Execute",
                body: "Approve an isolated Codex Run and receive independently verified draft evidence.",
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
              Seeking three paid design partners
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
              Test the control gap on a real incident in shadow mode.
            </h2>
          </div>
          <Link
            href={"/design-partners" as Route}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-violet"
          >
            Apply for the paid pilot <ArrowRightIcon size={16} weight="bold" />
          </Link>
        </div>
      </section>
    </main>
  );
}
