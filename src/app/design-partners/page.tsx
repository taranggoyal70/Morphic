import { auth } from "@clerk/nextjs/server";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  FingerprintIcon,
  GitBranchIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { Brand } from "@/components/brand";
import { DesignPartnerApplicationForm } from "@/components/design-partner-application-form";
import { getDesignPartnerApplicationForUser } from "@/lib/design-partners";
import {
  DESIGN_PARTNER_INCIDENT_WINDOW_DAYS,
  DESIGN_PARTNER_PILOT_DURATION_DAYS,
} from "@/lib/domain/design-partner";

export const metadata: Metadata = {
  title: "Paid design partnership",
  description:
    "Apply for Morphic's paid incident-to-regression design partnership for production AI teams.",
};

const EVIDENCE_CHAIN = [
  {
    label: "Production incident",
    evidence: "A redacted Braintrust or LangSmith trace",
    icon: FingerprintIcon,
  },
  {
    label: "Reviewed source",
    evidence: "The full Git commit and Workspace Version",
    icon: GitBranchIcon,
  },
  {
    label: "Repository regression",
    evidence: "The exact changed test path and non-skipped pass",
    icon: CheckCircleIcon,
  },
  {
    label: "Required decision",
    evidence: "Human approval plus a publication block on source drift",
    icon: ShieldCheckIcon,
  },
] as const;

export default async function DesignPartnersPage() {
  const { userId } = await auth();
  const application = userId
    ? await getDesignPartnerApplicationForUser(userId)
    : null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-ink text-paper">
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <Brand />
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="rounded-lg px-3 py-2 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
          >
            Product demo
          </Link>
          {!userId && (
            <Link
              href={"/sign-in?redirect_url=/design-partners" as Route}
              className="rounded-lg border border-line-strong px-3 py-2 text-sm text-paper transition hover:border-violet/50 hover:bg-white/5"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      <section className="mx-auto grid max-w-[1180px] gap-14 px-6 pb-20 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-end lg:pt-24">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mint">
            Seeking three paid design partners ·{" "}
            {DESIGN_PARTNER_PILOT_DURATION_DAYS} days · shadow mode first
          </p>
          <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-paper sm:text-7xl">
            A green check is not proof.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-light">
            Morphic is testing one release-control job: after a production AI
            incident, prove the approved fix and its repository regression ran
            against the exact source under review. If the default branch moves
            beyond that reviewed commit, draft publication is blocked.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 rounded-lg bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mint"
            >
              Apply for the paid pilot
              <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
            </a>
            <Link
              href="/demo"
              className="inline-flex items-center rounded-lg border border-line-strong px-5 py-3 text-sm font-medium text-paper transition hover:border-violet/50 hover:bg-white/5"
            >
              Inspect the evidence model
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-light">
                Chain of custody
              </p>
              <p className="mt-2 text-sm text-muted-light">
                Every link must survive review.
              </p>
            </div>
            <span className="rounded-md border border-amber/30 bg-amber/10 px-2.5 py-1.5 font-mono text-[10px] uppercase text-amber">
              approval bound
            </span>
          </div>
          <ol>
            {EVIDENCE_CHAIN.map((step, index) => (
              <li
                key={step.label}
                className="grid grid-cols-[36px_34px_minmax(0,1fr)] gap-3 border-b border-line px-5 py-5 last:border-0"
              >
                <span className="pt-1 font-mono text-[10px] text-muted">
                  0{index + 1}
                </span>
                <span className="flex size-8 items-center justify-center rounded-md border border-violet/20 bg-violet/10 text-violet-light">
                  <step.icon size={16} weight="duotone" aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-sm font-medium text-paper">
                    {step.label}
                  </strong>
                  <span className="mt-1 block text-xs leading-5 text-muted">
                    {step.evidence}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-line bg-surface/45">
        <div className="mx-auto grid max-w-[1180px] gap-px px-6 lg:grid-cols-3">
          {[
            [
              "Who fits",
              `A B2B team with a customer-facing AI agent, GitHub source, and a behavioral incident in the last ${DESIGN_PARTNER_INCIDENT_WINDOW_DAYS} days.`,
            ],
            [
              "What stays",
              "Keep Braintrust, LangSmith, Sentry, and GitHub. The pilot tests the release-control gap between them.",
            ],
            [
              "What commits",
              `$10K-$25K upfront for ${DESIGN_PARTNER_PILOT_DURATION_DAYS} days, starting in shadow mode with pre-registered success and stop criteria.`,
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="border-line py-8 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-light">
                {title}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-light">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="apply"
        className="mx-auto grid max-w-[1180px] gap-12 px-6 py-20 lg:grid-cols-[0.72fr_1.28fr]"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mint">
            Qualification, not a waitlist
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.03em] text-paper">
            Start with the last incident.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted-light">
            We review the existing workflow before showing the product. A form
            submission does not count as validation. A qualified problem
            interview, received artifact, or paid contract does.
          </p>
          <div className="mt-8 rounded-xl border border-line-strong bg-surface p-5">
            <p className="text-sm font-medium text-paper">Do not submit</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              <li>Customer names, messages, prompts, or personal data</li>
              <li>Credentials, private URLs, or raw production traces</li>
              <li>An incident your team cannot discuss in redacted form</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-line-strong bg-surface p-6 sm:p-8">
          {application ? (
            <div role="status">
              <CheckCircleIcon
                size={30}
                weight="fill"
                className="text-mint"
                aria-hidden="true"
              />
              <h2 className="mt-5 text-2xl font-semibold text-paper">
                Application on record
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-light">
                Submitted for {application.companyName} on{" "}
                {application.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                . Current status: {application.status.replaceAll("_", " ")}.
              </p>
            </div>
          ) : userId ? (
            <DesignPartnerApplicationForm today={today} />
          ) : (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-light">
                Attributable evidence only
              </p>
              <h2 className="mt-5 text-2xl font-semibold text-paper">
                Sign in before applying
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-light">
                Morphic ties each application to a verified account so the
                intake accepts one submission per account. Operators reconcile
                duplicate people or companies before counting demand.
              </p>
              <Link
                href={"/sign-up?redirect_url=/design-partners" as Route}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mint"
              >
                Create an account to apply
                <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
