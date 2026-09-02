import type { Route } from "next";
import Link from "next/link";

import { Brand } from "@/components/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-xl">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8"
      >
        <Brand />
        <div className="flex items-center gap-1 sm:gap-3">
          <a
            href="#how-it-works"
            className="hidden min-h-10 items-center rounded px-3 text-sm text-muted-light transition hover:bg-surface hover:text-paper sm:inline-flex"
          >
            How it works
          </a>
          <Link
            href={"/sign-in" as Route}
            className="inline-flex min-h-10 items-center rounded px-3 text-sm text-muted-light transition hover:bg-surface hover:text-paper"
          >
            Sign in
          </Link>
          <Link
            href={"/sign-up" as Route}
            className="inline-flex min-h-11 items-center rounded bg-paper px-5 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition hover:bg-evidence"
          >
            Connect GitHub
          </Link>
        </div>
      </nav>
    </header>
  );
}
