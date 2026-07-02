"use client";

import { ArrowsClockwiseIcon, GithubLogoIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RepositorySyncButton({
  label = "Sync GitHub",
}: {
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function sync() {
    setPending(true);
    try {
      const response = await fetch("/api/repositories", { method: "POST" });
      const payload = (await response.json()) as {
        repositories?: unknown[];
        error?: { message?: string; code?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "GitHub sync failed.");
      }
      toast.success(
        `${payload.repositories?.length ?? 0} repositories synchronized.`,
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "GitHub sync failed.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={sync}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-3.5 py-2 text-sm font-medium text-paper transition hover:bg-surface-hover disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? (
        <ArrowsClockwiseIcon size={16} className="animate-spin" />
      ) : (
        <GithubLogoIcon size={16} weight="fill" />
      )}
      {pending ? "Syncing…" : label}
    </button>
  );
}
