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

import { CharacterCounter } from "@/components/character-counter";
import { RunTimeline } from "@/components/run-timeline";

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
  const [instruction, setInstruction] = useState("");
  const hasActiveRun = runs.some((run) => activeStatuses.has(run.status));

  useEffect(() => {
    if (!hasActiveRun) return;
    const refreshVisibleRun = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = window.setInterval(refreshVisibleRun, 4_000);
    document.addEventListener("visibilitychange", refreshVisibleRun);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisibleRun);
    };
  }, [hasActiveRun, router]);

  async function createRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const normalizedInstruction = instruction.trim();
    if (!normalizedInstruction) return;
    setPending(true);
    try {
      const response = await fetch("/api/codex-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          instruction: normalizedInstruction,
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
      setInstruction("");
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

  async function cancelRun(runId: string) {
    const confirmed = window.confirm(
      "Cancel this run? The sandbox will be stopped and no pull request will be created.",
    );
    if (!confirmed) return;
    setPending(true);
    try {
      const response = await fetch(`/api/codex-runs/${runId}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        const payload = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(
          payload?.error?.message ?? "The run could not be cancelled.",
        );
      }
      toast.success("Run cancelled.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The run could not be cancelled.",
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
    <section className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <CodeIcon
            size={18}
            weight="duotone"
            className="text-violet-light"
            aria-hidden="true"
          />
          <h2 className="text-sm font-semibold text-paper">Codex proposals</h2>
          <span className="rounded bg-surface-hover px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted">
            Approval required
          </span>
        </div>

        <form
          onSubmit={createRun}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <div className="min-w-0 flex-1">
            <input
              name="instruction"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              required
              minLength={8}
              maxLength={4_000}
              disabled={!workspaceReady || pending}
              placeholder="Propose a scoped Codex task from this objective…"
              className="h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper placeholder:text-muted"
            />
            <div className="mt-1 text-right">
              <CharacterCounter
                current={instruction.length}
                maximum={4_000}
                label="Codex instruction"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!workspaceReady || pending}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet/40 bg-violet/10 px-4 text-sm font-medium text-violet-light transition hover:bg-violet/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlayIcon size={15} weight="fill" aria-hidden="true" />
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
                          aria-hidden="true"
                        />
                      ) : run.status === "completed" ? (
                        <CheckCircleIcon
                          size={14}
                          weight="fill"
                          className="text-mint"
                          aria-hidden="true"
                        />
                      ) : run.status === "failed" ||
                        run.status === "cancelled" ? (
                        <XCircleIcon
                          size={14}
                          weight="fill"
                          className="text-danger"
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className="size-3.5 rounded-full border border-amber bg-amber/10"
                          aria-hidden="true"
                        />
                      )}
                      <p className="truncate text-sm font-medium text-paper">
                        {run.instruction}
                      </p>
                    </div>
                    <p
                      aria-live="polite"
                      aria-label={`Codex run status: ${run.status.replaceAll("_", " ")}`}
                      className="mt-1 pl-[22px] font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                    >
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
                        className="rounded border border-line-strong px-3 py-1.5 text-xs font-medium text-muted-light transition hover:bg-surface-hover hover:text-paper disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => decide(run.id, "approve")}
                        className="rounded bg-evidence px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-evidence-soft disabled:opacity-50"
                      >
                        Approve run
                      </button>
                    </div>
                  )}

                  {activeStatuses.has(run.status) && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => cancelRun(run.id)}
                      className="shrink-0 rounded-lg border border-danger/25 px-3 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
                    >
                      Cancel run
                    </button>
                  )}

                  {run.pullRequestUrl && (
                    <a
                      href={run.pullRequestUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-mint/30 bg-mint/10 px-3 py-1.5 text-xs font-medium text-mint transition hover:bg-mint/15"
                    >
                      Pull request #{run.pullRequestNumber}
                      <ArrowSquareOutIcon size={13} aria-hidden="true" />
                    </a>
                  )}
                </div>
                {run.status !== "awaiting_approval" && (
                  <RunTimeline runId={run.id} runStatus={run.status} />
                )}
              </article>
            ))}
          </div>
        )}
        {runs.length === 0 && (
          <p className="mt-3 rounded-lg border border-dashed border-line px-4 py-3 text-xs leading-5 text-muted">
            No Codex proposals yet. Create one when the evidence route is ready;
            Morphic will require your approval before execution begins.
          </p>
        )}
      </div>
    </section>
  );
}
