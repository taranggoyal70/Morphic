"use client";

import { WarningIcon } from "@phosphor-icons/react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink text-paper antialiased">
        <main
          id="main-content"
          className="grid min-h-screen place-items-center px-5"
        >
          <div className="max-w-md rounded-[20px] border border-line-strong bg-surface px-7 py-9 text-center shadow-[0_28px_80px_rgba(0,0,0,.2)]">
            <WarningIcon
              size={34}
              weight="duotone"
              className="mx-auto text-danger"
            />
            <h1 className="font-display mt-5 text-2xl font-semibold tracking-[-0.035em]">
              Morphic lost the route
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-light">
              {error.message || "Morphic encountered an unexpected error."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 min-h-11 rounded-lg bg-evidence px-4 text-sm font-bold text-ink transition hover:bg-evidence-soft"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
