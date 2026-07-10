"use client";

import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  CircleNotchIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

async function parseError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  return payload?.error?.message ?? fallback;
}

export function WorkspaceActions({
  workspaceId,
  status,
}: {
  workspaceId: string;
  status: "generating" | "active" | "archived" | "failed";
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"archive" | "delete" | null>(null);
  const busy = status === "generating";

  async function archive() {
    setPending("archive");
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error(
          await parseError(response, "The workspace could not be archived."),
        );
      }
      toast.success("Workspace archived.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The workspace could not be archived.",
      );
    } finally {
      setPending(null);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      "Delete this workspace and its full version history? This cannot be undone.",
    );
    if (!confirmed) return;
    setPending("delete");
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error(
          await parseError(response, "The workspace could not be deleted."),
        );
      }
      toast.success("Workspace deleted.");
      router.push("/workspaces");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The workspace could not be deleted.",
      );
      setPending(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status !== "archived" && (
        <button
          type="button"
          disabled={busy || pending !== null}
          onClick={archive}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs text-muted-light transition hover:bg-white/5 hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
          title="Archive workspace"
        >
          {pending === "archive" ? (
            <CircleNotchIcon size={13} className="animate-spin" />
          ) : (
            <ArchiveIcon size={13} />
          )}
          Archive
        </button>
      )}
      <button
        type="button"
        disabled={busy || pending !== null}
        onClick={remove}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-danger/25 px-2.5 text-xs text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
        title="Delete workspace"
      >
        {pending === "delete" ? (
          <CircleNotchIcon size={13} className="animate-spin" />
        ) : (
          <TrashIcon size={13} />
        )}
        Delete
      </button>
    </div>
  );
}

export function RetryGenerationButton({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function retry() {
    setPending(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/adapt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command:
            "Retry the workspace compilation for the same objective using the latest repository evidence.",
        }),
      });
      if (!response.ok) {
        throw new Error(
          await parseError(response, "The retry could not be started."),
        );
      }
      toast.success("Retrying workspace compilation.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The retry could not be started.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={retry}
      className="inline-flex items-center gap-2 rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-light hover:text-ink disabled:opacity-50"
    >
      {pending ? (
        <CircleNotchIcon size={15} className="animate-spin" />
      ) : (
        <ArrowClockwiseIcon size={15} />
      )}
      Retry compilation
    </button>
  );
}
