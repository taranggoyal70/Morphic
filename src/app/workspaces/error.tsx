"use client";

import { WarningIcon } from "@phosphor-icons/react";

export default function WorkspacesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-ink px-5"
    >
      <div className="max-w-md rounded-2xl border border-line-strong bg-surface-raised px-7 py-9 text-center shadow-[0_2px_8px_rgba(26,26,26,.08)]">
        <WarningIcon
          size={34}
          weight="duotone"
          className="mx-auto text-danger"
        />
        <h1 className="font-display mt-5 text-2xl font-semibold tracking-[-0.035em] text-paper">
          Workspace unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {error.message || "Morphic could not load this workspace."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 min-h-11 rounded bg-evidence px-6 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition hover:bg-evidence-soft"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
