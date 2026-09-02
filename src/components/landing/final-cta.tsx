import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Route } from "next";
import Link from "next/link";

export function FinalCta() {
  return (
    <section className="border-y border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-[1440px] border-x border-line lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="px-5 py-16 sm:px-10 sm:py-20 lg:px-14 xl:px-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-evidence">
            Open a new brief
          </p>
          <h2 className="font-display mt-5 max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.055em] sm:text-7xl">
            Put the next objective on the record.
          </h2>
        </div>
        <Link
          href={"/sign-up" as Route}
          className="group flex min-h-48 items-center justify-between gap-6 border-t border-line bg-evidence px-8 text-xl font-semibold text-ink transition hover:bg-evidence-soft lg:min-h-0 lg:border-l lg:border-t-0"
        >
          Connect GitHub
          <ArrowRightIcon
            size={24}
            weight="bold"
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
