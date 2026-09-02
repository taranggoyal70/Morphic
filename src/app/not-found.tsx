import { ArrowLeftIcon, PathIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-5">
      <section className="max-w-lg rounded-2xl border border-line-strong bg-surface-raised px-7 py-10 text-center shadow-[0_2px_8px_rgba(26,26,26,.08)]">
        <PathIcon
          size={36}
          weight="duotone"
          className="mx-auto text-evidence"
          aria-hidden="true"
        />
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Route not found · 404
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.04em] text-paper">
          This evidence route does not exist.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-light">
          The address may be outdated, or the workspace may have been removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded bg-evidence px-5 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition hover:bg-evidence-soft"
        >
          <ArrowLeftIcon size={15} weight="bold" aria-hidden="true" />
          Return home
        </Link>
      </section>
    </main>
  );
}
