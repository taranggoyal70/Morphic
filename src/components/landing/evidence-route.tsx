import {
  CheckCircleIcon,
  GitBranchIcon,
  GitCommitIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";

import { evidenceSteps } from "@/components/landing/content";
import { cn } from "@/lib/utils";

const icons = {
  objective: GitCommitIcon,
  evidence: GitBranchIcon,
  decision: WarningCircleIcon,
  run: ShieldCheckIcon,
};

export function EvidenceRoute() {
  return (
    <section aria-labelledby="trace-title" className="border-t border-line">
      <div className="flex flex-col justify-between gap-3 bg-paper px-5 py-4 text-ink sm:flex-row sm:items-center sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center gap-3">
          <span className="size-2 bg-evidence" aria-hidden="true" />
          <h2
            id="trace-title"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"
          >
            Repository trace / morphic-onboarding
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-line-strong">
          <CheckCircleIcon
            size={13}
            weight="fill"
            className="text-evidence-soft"
          />
          Snapshot synced 2m ago
        </span>
      </div>

      <ol className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
        {evidenceSteps.map((step, index) => {
          const Icon = icons[step.id as keyof typeof icons];
          return (
            <li
              key={step.id}
              className="group relative min-h-56 bg-ink px-5 py-6 transition hover:bg-surface sm:px-8 sm:py-8"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-line-strong group-hover:bg-evidence" />
              <div className="flex items-start justify-between gap-5">
                <span
                  className={cn(
                    "inline-flex size-10 items-center justify-center border bg-ink",
                    step.tone === "paper" && "border-paper text-paper",
                    step.tone === "evidence" && "border-evidence text-evidence",
                    step.tone === "decision" && "border-decision text-decision",
                    step.tone === "resolved" && "border-resolved text-resolved",
                  )}
                >
                  <Icon size={18} weight="duotone" />
                </span>
                <span className="font-mono text-[10px] text-muted">
                  TRACE-{String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted">
                  {step.eyebrow}
                </p>
                <p className="mt-3 max-w-[250px] text-lg font-semibold leading-6 text-paper">
                  {step.title}
                </p>
                <p className="mt-3 font-mono text-[10px] leading-5 text-muted-light">
                  {step.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
