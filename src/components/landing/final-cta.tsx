import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Route } from "next";
import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-paper px-5 pb-5 text-ink sm:px-8 sm:pb-8">
      <div className="mx-auto grid max-w-[1180px] gap-8 rounded-[22px] bg-[#0b1b2b] p-7 text-paper sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-14">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-evidence">
            Your repository already has the evidence
          </p>
          <h2 className="font-display mt-5 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
            Give the next outcome a path everyone can review.
          </h2>
        </div>
        <Link
          href={"/sign-up" as Route}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-decision px-5 text-sm font-bold text-ink transition hover:bg-[#ffb08f]"
        >
          Connect GitHub
          <ArrowRightIcon size={17} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
