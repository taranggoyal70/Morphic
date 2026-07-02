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
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <div className="max-w-md text-center">
        <WarningIcon
          size={34}
          weight="duotone"
          className="mx-auto text-danger"
        />
        <h1 className="mt-5 text-xl font-semibold text-paper">
          Workspace unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {error.message || "Morphic could not load this workspace."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-paper transition hover:bg-white/5"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
