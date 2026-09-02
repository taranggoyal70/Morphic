import { ArrowRightIcon, GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";
import type { Route } from "next";
import Link from "next/link";

export function HeroCopy() {
  return (
    <div className="max-w-[650px]">
      <div className="mb-7 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-evidence">
        <span className="h-px w-9 bg-evidence" aria-hidden="true" />
        Adaptive workspaces for software delivery
      </div>
      <h1 className="font-display text-[clamp(3.4rem,7.4vw,7.25rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-paper">
        Turn repository facts into a reviewable path.
      </h1>
      <p className="mt-7 max-w-[590px] text-base leading-7 text-muted-light sm:text-lg sm:leading-8">
        Name the outcome. Morphic maps live GitHub evidence, surfaces the
        decisions, and keeps every approved Codex run visible through the pull
        request.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href={"/sign-up" as Route}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-evidence px-5 text-sm font-bold text-ink transition hover:bg-evidence-soft"
        >
          Connect a repository
          <ArrowRightIcon size={17} weight="bold" />
        </Link>
        <a
          href="https://github.com/taranggoyal70/Morphic"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line-strong px-5 text-sm font-semibold text-paper transition hover:border-evidence/60 hover:bg-white/5"
        >
          <GithubLogoIcon size={17} weight="fill" />
          Inspect the source
        </a>
      </div>
      <p className="mt-5 font-mono text-[11px] leading-5 text-muted">
        GitHub in · explicit approval · isolated execution · draft PR out
      </p>
    </div>
  );
}
