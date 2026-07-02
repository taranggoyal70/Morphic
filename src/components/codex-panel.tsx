"use client";

import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  CodeIcon,
  PlayIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type CodexRun = {
  id: string;
  instruction: string;
  status:
    | "awaiting_approval"
    | "queued"
    | "provisioning"
    | "running"
    | "completed"
    | "failed"
    | "cancelled";
  pullRequestNumber: number | null;
  pullRequestUrl: string | null;
  resultSummary: string | null;
  error: string | null;
  createdAt: Date;
};

const activeStatuses = new Set(["queued", "provisioning", "running"]);

export function CodexPanel({
  workspaceId,
  workspaceReady,
  runs,
}: {
  workspaceId: string;
  workspaceReady: boolean;
  runs: CodexRun[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const hasActiveRun = runs.some((run) => activeStatuses.has(run.status));

  useEffect(() => {
    if (!hasActiveRun) return;
    const timer = window.setInterval(() => router.refresh(), 4_000);
    return () => window.clearInterval(timer);
  }, [hasActiveRun, router]);

  async function createRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const instruction = String(
      new FormData(form).get("instruction") ?? "",
    ).trim();
    if (!instruction) return;
    setPending(true);
    try {
      const response = await fetch("/api/codex-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          instruction,
          approvalRequired: true,
        }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Run could not be created.");
      }
      form.reset();
      toast.success("Codex proposal created. Review it before approval.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Run could not be created.",
      );
    } finally {
      setPending(false);
    }
  }

  async function decide(runId: string, decision: "approve" | "reject") {
    setPending(true);
    try {
      const response = await fetch(`/api/codex-runs/${runId}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(
          payload.error?.message ?? "The approval could not be saved.",
        );
      }
      toast.success(
        decision === "approve"
          ? "Approved. Codex is starting in an isolated sandbox."
          : "Proposal rejected.",
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The approval could not be saved.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="border-t border-line bg-[#0a0d13]">
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <CodeIcon size={18} weight="duotone" className="text-violet-light" />
          <h2 className="text-sm font-semibold text-paper">Codex proposals</h2>
          <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted">
            Approval required
          </span>
        </div>

        <form
          onSubmit={createRun}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <input
            name="instruction"
            required
            minLength={8}
            maxLength={4_000}
            disabled={!workspaceReady || pending}
            placeholder="Propose a scoped Codex task from this objective…"
            className="h-9 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!workspaceReady || pending}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet/40 bg-violet/10 px-4 text-sm font-medium text-violet-light transition hover:bg-violet/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlayIcon size={15} weight="fill" />
            Create proposal
          </button>
        </form>

        {runs.length > 0 && (
          <div className="mt-3 divide-y divide-line rounded-xl border border-line">
            {runs.map((run) => (
              <article key={run.id} className="px-3.5 py-2.5">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {activeStatuses.has(run.status) ? (
                        <CircleNotchIcon
                          size={14}
                          className="animate-spin text-violet-light"
                        />
                      ) : run.status === "completed" ? (
                        <CheckCircleIcon
                          size={14}
                          weight="fill"
                          className="text-mint"
                        />
                      ) : run.status === "failed" ||
                        run.status === "cancelled" ? (
                        <XCircleIcon
                          size={14}
                          weight="fill"
                          className="text-danger"
                        />
                      ) : (
                        <span className="size-3.5 rounded-full border border-amber bg-amber/10" />
                      )}
                      <p className="truncate text-sm font-medium text-paper">
                        {run.instruction}
                      </p>
                    </div>
                    <p className="mt-1 pl-[22px] font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                      {run.status.replaceAll("_", " ")}
                    </p>
                    {(run.resultSummary || run.error) && (
                      <p className="mt-1 pl-[22px] text-xs text-muted-light">
                        {run.resultSummary ?? run.error}
                      </p>
                    )}
                  </div>

                  {run.status === "awaiting_approval" && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => decide(run.id, "reject")}
                        className="rounded-lg border border-line-strong px-3 py-1.5 text-xs font-medium text-muted-light transition hover:bg-white/5 hover:text-paper disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => decide(run.id, "approve")}
                        className="rounded-lg bg-violet px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-light hover:text-ink disabled:opacity-50"
                      >
                        Approve run
                      </button>
                    </div>
                  )}

                  {run.pullRequestUrl && (
                    <a
                      href={run.pullRequestUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-mint/30 bg-mint/10 px-3 py-1.5 text-xs font-medium text-mint transition hover:bg-mint/15"
                    >
                      Pull request #{run.pullRequestNumber}
                      <ArrowSquareOutIcon size={13} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
