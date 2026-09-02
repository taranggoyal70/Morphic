"use client";

import { ArrowUpIcon, SparkleIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export function AdaptWorkspaceForm({
  workspaceId,
  disabled,
}: {
  workspaceId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const command = String(data.get("command") ?? "").trim();
    if (!command) return;
    setPending(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/adapt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Workspace could not adapt.");
      }
      form.reset();
      toast.success("Morphic is adapting the workspace.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Workspace could not adapt.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded border border-line-strong bg-surface-raised px-3 py-2 focus-within:border-paper"
    >
      <SparkleIcon size={17} weight="fill" className="shrink-0 text-evidence" />
      <input
        name="command"
        disabled={disabled || pending}
        minLength={3}
        maxLength={800}
        required
        placeholder="Update the outcome, guardrails, or next decision…"
        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-paper placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled || pending}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded bg-evidence text-ink transition hover:bg-evidence-soft disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Adapt workspace"
      >
        <ArrowUpIcon size={15} weight="bold" />
      </button>
    </form>
  );
}
