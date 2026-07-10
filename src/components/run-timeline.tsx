"use client";

import {
  CaretDownIcon,
  CaretRightIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RunEvent = {
  id: number;
  sequence: number;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

type RunDetail = {
  run: {
    status: string;
    usage: {
      inputTokens: number;
      cachedInputTokens: number;
      outputTokens: number;
      reasoningOutputTokens: number;
    } | null;
  };
  events: RunEvent[];
};

const ACTIVE_STATUSES = new Set(["queued", "provisioning", "running"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown, max = 220) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function describeEvent(event: RunEvent): { tone: string; text: string } {
  const payload = event.payload;

  if (event.eventType === "run.started") {
    const branch = asText(payload.branchName) ?? "work branch";
    const base = asText(payload.baseSha)?.slice(0, 7);
    return {
      tone: "info",
      text: `Sandbox ready on ${branch}${base ? ` (base ${base})` : ""}`,
    };
  }

  if (event.eventType === "pull_request.created") {
    const number = payload.number;
    return {
      tone: "success",
      text: `Opened pull request${typeof number === "number" ? ` #${number}` : ""}`,
    };
  }

  if (event.eventType === "thread.started") {
    return { tone: "info", text: "Codex session started" };
  }

  if (event.eventType === "turn.completed") {
    const usage = asRecord(payload.usage);
    const output = usage?.output_tokens;
    return {
      tone: "info",
      text: `Turn completed${typeof output === "number" ? ` · ${output.toLocaleString()} output tokens` : ""}`,
    };
  }

  const item = asRecord(payload.item);
  if (item) {
    const itemType = asText(item.type) ?? "step";
    if (itemType === "command_execution") {
      const command = asText(item.command, 160) ?? "command";
      const exitCode = item.exit_code;
      const finished =
        event.eventType === "item.completed" && typeof exitCode === "number";
      return {
        tone: finished && exitCode !== 0 ? "error" : "command",
        text: `$ ${command}${finished ? ` → exit ${exitCode}` : ""}`,
      };
    }
    if (itemType === "agent_message") {
      return { tone: "message", text: asText(item.text) ?? "Codex replied" };
    }
    if (itemType === "reasoning") {
      return { tone: "muted", text: asText(item.text, 160) ?? "Reasoning…" };
    }
    if (itemType === "file_change") {
      const changes = Array.isArray(item.changes)
        ? item.changes
            .map((change) => asText(asRecord(change)?.path, 60))
            .filter(Boolean)
            .slice(0, 4)
            .join(", ")
        : null;
      return { tone: "success", text: `Edited ${changes ?? "files"}` };
    }
    return { tone: "muted", text: `${itemType.replaceAll("_", " ")}` };
  }

  const rawText = asText(payload.text);
  if (rawText) return { tone: "muted", text: rawText };

  return { tone: "muted", text: event.eventType };
}

function eventTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function RunTimeline({
  runId,
  runStatus,
}: {
  runId: string;
  runStatus: string;
}) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<RunDetail | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const isActive = ACTIVE_STATUSES.has(runStatus);
  const loading = open && !detail;

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/codex-runs/${runId}`);
      if (!response.ok) return;
      const payload = (await response.json()) as { data: RunDetail };
      setDetail(payload.data);
    } catch {
      // Non-critical: the panel keeps its last known state.
    }
  }, [runId]);

  useEffect(() => {
    if (!open) return;
    const initial = window.setTimeout(() => void load(), 0);
    const poll = isActive ? window.setInterval(() => void load(), 3_000) : null;
    return () => {
      window.clearTimeout(initial);
      if (poll !== null) window.clearInterval(poll);
    };
  }, [open, isActive, load]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [detail?.events.length]);

  const usage = detail?.run.usage;

  return (
    <div className="mt-2 pl-[22px]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition hover:text-paper"
      >
        {open ? <CaretDownIcon size={11} /> : <CaretRightIcon size={11} />}
        Activity
        {detail && ` · ${detail.events.length} events`}
      </button>

      {open && (
        <div className="mt-2 overflow-hidden rounded-lg border border-line bg-[#07090e]">
          {usage && (
            <div className="flex flex-wrap gap-2 border-b border-line px-3 py-2 font-mono text-[10px] text-muted">
              <span>in {usage.inputTokens.toLocaleString()}</span>
              <span>cached {usage.cachedInputTokens.toLocaleString()}</span>
              <span>out {usage.outputTokens.toLocaleString()}</span>
              <span>
                reasoning {usage.reasoningOutputTokens.toLocaleString()}
              </span>
            </div>
          )}
          <div ref={logRef} className="max-h-72 overflow-y-auto px-3 py-2">
            {loading && !detail && (
              <p className="flex items-center gap-2 py-2 text-xs text-muted">
                <CircleNotchIcon size={13} className="animate-spin" />
                Loading activity…
              </p>
            )}
            {detail && detail.events.length === 0 && (
              <p className="py-2 text-xs text-muted">
                {isActive
                  ? "The sandbox is being provisioned. The full execution log lands here as the run progresses."
                  : "No activity was recorded for this run."}
              </p>
            )}
            {detail?.events.map((event) => {
              const described = describeEvent(event);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-2 py-1 font-mono text-[11px] leading-4"
                >
                  <span className="w-14 shrink-0 text-muted/60">
                    {eventTime(event.createdAt)}
                  </span>
                  <span
                    className={cn(
                      "mt-1 size-1.5 shrink-0 rounded-full",
                      described.tone === "success" && "bg-mint",
                      described.tone === "error" && "bg-danger",
                      described.tone === "info" && "bg-violet-light",
                      described.tone === "command" && "bg-amber",
                      (described.tone === "muted" ||
                        described.tone === "message") &&
                        "bg-muted/50",
                    )}
                  />
                  <span
                    className={cn(
                      "min-w-0 break-words",
                      described.tone === "error"
                        ? "text-danger"
                        : described.tone === "message"
                          ? "text-paper"
                          : described.tone === "command"
                            ? "text-amber/90"
                            : "text-muted-light",
                    )}
                  >
                    {described.text}
                  </span>
                </div>
              );
            })}
            {isActive && detail && (
              <p className="flex items-center gap-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-violet-light">
                <CircleNotchIcon size={11} className="animate-spin" />
                Run in progress
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
