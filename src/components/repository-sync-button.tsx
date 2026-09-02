"use client";

import { ArrowsClockwiseIcon, GithubLogoIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function RepositorySyncButton({
  label = "Sync GitHub",
  autoSync = false,
}: {
  label?: string;
  autoSync?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const autoSyncStarted = useRef(false);

  const sync = useCallback(async () => {
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
  }, [router]);

  useEffect(() => {
    if (!autoSync || autoSyncStarted.current) return;
    autoSyncStarted.current = true;
    void sync();
  }, [autoSync, sync]);

  return (
    <button
      type="button"
      onClick={sync}
      disabled={pending}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-3.5 text-sm font-semibold text-paper transition hover:border-evidence/40 hover:bg-evidence/10 hover:text-evidence disabled:cursor-wait disabled:opacity-60"
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
