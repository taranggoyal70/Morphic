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
    <div className="relative mx-auto w-full max-w-[620px] rounded-[22px] border border-line-strong bg-surface/90 p-3 shadow-[0_40px_100px_rgba(0,0,0,.28)] sm:p-4">
      <div className="flex items-center justify-between border-b border-line px-3 pb-4 pt-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-evidence">
            Live objective route
          </p>
          <p className="mt-1 text-sm text-muted-light">morphic / onboarding</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-resolved/30 bg-resolved/10 px-2.5 py-1 text-xs font-semibold text-resolved">
          <CheckCircleIcon size={13} weight="fill" />
          Synced
        </span>
      </div>

      <ol className="relative mt-2">
        <span
          aria-hidden="true"
          className="absolute bottom-10 left-[30px] top-10 w-px bg-gradient-to-b from-paper/40 via-evidence to-resolved/70"
        />
        {evidenceSteps.map((step, index) => {
          const Icon = icons[step.id as keyof typeof icons];
          return (
            <li
              key={step.id}
              className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-xl px-2 py-3 transition hover:bg-white/[0.035] sm:gap-4 sm:px-3 sm:py-4"
            >
              <span
                className={cn(
                  "relative z-10 inline-flex size-9 items-center justify-center rounded-full border bg-surface",
                  step.tone === "paper" && "border-paper/40 text-paper",
                  step.tone === "evidence" && "border-evidence/50 text-evidence",
                  step.tone === "decision" && "border-decision/50 text-decision",
                  step.tone === "resolved" && "border-resolved/50 text-resolved",
                )}
              >
                <Icon size={17} weight="duotone" />
              </span>
              <div className="min-w-0 border-b border-line pb-4 last:border-b-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {step.eyebrow}
                  </span>
                  <span className="font-mono text-[10px] text-muted">0{index + 1}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-paper sm:text-[15px]">
                  {step.title}
                </p>
                <p className="mt-1 truncate font-mono text-[11px] text-muted-light">
                  {step.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
