import { ArrowRightIcon, GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";
import type { Route } from "next";
import Link from "next/link";

export function HeroCopy() {
  return (
    <div className="px-5 pb-14 pt-16 sm:px-10 sm:pb-16 sm:pt-24 lg:px-14 lg:pb-20 lg:pt-28 xl:px-20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 font-mono text-[10px] uppercase tracking-[0.16em]">
        <span className="text-evidence">Execution brief / 001</span>
        <span className="text-muted">State: awaiting objective</span>
      </div>

      <h1 className="font-display mt-10 max-w-[1180px] text-[clamp(4rem,10.2vw,10rem)] font-semibold leading-[0.79] tracking-[-0.075em] text-paper">
        Every change
        <span className="block pl-[9vw] text-evidence">should show</span>
        <span className="block">its work.</span>
      </h1>

      <div className="mt-12 grid gap-8 border-t border-line pt-6 lg:grid-cols-[minmax(0,680px)_1fr] lg:items-end lg:gap-16">
        <div>
          <p className="text-lg leading-8 text-muted-light sm:text-xl">
            Give Morphic an outcome. It attaches the repository facts, records
            the decisions, and waits for approval before any code runs.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase leading-5 tracking-[0.1em] text-muted">
            GitHub in → evidence attached → decision recorded → draft PR out
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Link
            href={"/sign-up" as Route}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded bg-evidence px-6 text-sm font-semibold text-ink transition hover:bg-evidence-soft"
          >
            Start an execution brief
            <ArrowRightIcon size={17} weight="bold" />
          </Link>
          <a
            href="https://github.com/taranggoyal70/Morphic"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-line-strong px-5 text-sm font-semibold text-paper transition hover:border-paper hover:bg-surface"
          >
            <GithubLogoIcon size={17} weight="fill" />
            Source
          </a>
        </div>
      </div>
    </div>
  );
}
