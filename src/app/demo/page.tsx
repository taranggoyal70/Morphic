import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  GitBranchIcon,
  ShieldCheckIcon,
  WarningDiamondIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { Brand } from "@/components/brand";
import { incidentToPullRequestFixture as fixture } from "@/lib/demo/incident-to-pr";

export const metadata: Metadata = {
  title: "Incident-to-pull-request demo",
  description:
    "A static Morphic demo showing a production AI incident bound to source, verification, approval, and a draft pull request.",
};

const custody = [
  {
    label: "Incident",
    value: fixture.incident.id,
    detail: fixture.incident.severity,
  },
  {
    label: "Snapshot",
    value: fixture.repository.snapshotSha.slice(0, 7),
    detail: fixture.repository.branch,
  },
  {
    label: "Decision",
    value: `Workspace v${fixture.workspace.version}`,
    detail: "Approved",
  },
  {
    label: "Replay",
    value: "1 credit",
    detail: "Passed",
  },
  {
    label: "Publication",
    value: `PR #${fixture.publication.pullRequestNumber}`,
    detail: fixture.publication.state,
  },
] as const;

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-ink">
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <Brand />
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-light transition hover:text-paper"
        >
          <ArrowLeftIcon size={14} />
          Back to Morphic
        </Link>
      </nav>

      <section className="mx-auto max-w-[1180px] px-6 pb-20 pt-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded border border-amber/25 bg-amber/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
            Demo fixture
          </span>
          <span className="font-mono text-[10px] text-muted">
            Synthetic data - no customer information
          </span>
        </div>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-paper sm:text-6xl">
          One production incident. One reviewable chain of custody.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-light">
          Morphic binds the observed failure, exact repository state, corrective
          decision, independent replay, and draft pull request into one evidence
          trail.
        </p>

        <div className="mt-12 grid border-y border-line lg:grid-cols-5">
          {custody.map((item, index) => (
            <div
              key={item.label}
              className="relative border-b border-line px-4 py-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                {String(index + 1).padStart(2, "0")} / {item.label}
              </p>
              <p className="mt-3 font-mono text-sm text-paper">{item.value}</p>
              <p className="mt-1 text-xs text-mint">{item.detail}</p>
              {index < custody.length - 1 && (
                <ArrowRightIcon
                  aria-hidden="true"
                  size={14}
                  className="absolute -right-2 top-1/2 z-10 hidden bg-ink text-violet-light lg:block"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="rounded-xl border border-danger/25 bg-danger/5 p-5">
            <WarningDiamondIcon
              size={20}
              weight="duotone"
              className="text-danger"
            />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-danger">
              {fixture.incident.id} / {fixture.incident.severity}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-paper">
              {fixture.incident.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-light">
              {fixture.incident.detail}
            </p>
          </article>

          <article className="rounded-xl border border-line-strong bg-surface p-5">
            <GitBranchIcon
              size={20}
              weight="duotone"
              className="text-violet-light"
            />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              Approved correction
            </p>
            <h2 className="mt-2 text-lg font-semibold text-paper">
              {fixture.workspace.objective}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-light">
              {fixture.workspace.decision}
            </p>
          </article>

          <article className="rounded-xl border border-mint/25 bg-mint/5 p-5">
            <ShieldCheckIcon size={20} weight="duotone" className="text-mint" />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-mint">
              Independent replay
            </p>
            <h2 className="mt-2 text-lg font-semibold text-paper">
              {fixture.regression.name}
            </h2>
            <div className="mt-3 space-y-2 font-mono text-xs">
              <p className="text-danger">Before: {fixture.regression.before}</p>
              <p className="text-mint">After: {fixture.regression.after}</p>
            </div>
          </article>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-mint/30 bg-mint/5 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <CheckCircleIcon size={22} weight="fill" className="text-mint" />
            <div>
              <p className="text-sm font-medium text-paper">
                Draft pull request #{fixture.publication.pullRequestNumber}
              </p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {fixture.publication.branch}
              </p>
            </div>
          </div>
          <span className="text-xs text-mint">
            Human review required before merge
          </span>
        </div>
      </section>
    </main>
  );
}
