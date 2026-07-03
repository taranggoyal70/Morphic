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
      <body className="bg-[#0a0d14] text-white antialiased">
        <main className="grid min-h-screen place-items-center px-5">
          <div className="max-w-md text-center">
            <WarningIcon
              size={34}
              weight="duotone"
              className="mx-auto text-red-400"
            />
            <h1 className="mt-5 text-xl font-semibold">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {error.message || "Morphic encountered an unexpected error."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
