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
            className="hidden min-h-10 items-center rounded-lg px-3 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper sm:inline-flex"
          >
            How it works
          </a>
          <Link
            href={"/sign-in" as Route}
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm text-muted-light transition hover:bg-white/5 hover:text-paper"
          >
            Sign in
          </Link>
          <Link
            href={"/sign-up" as Route}
            className="inline-flex min-h-10 items-center rounded-lg bg-paper px-4 text-sm font-semibold text-ink transition hover:bg-evidence-soft"
          >
            Connect GitHub
          </Link>
        </div>
      </nav>
    </header>
  );
}
