"use client";

import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  CodeIcon,
  FileCodeIcon,
  GitBranchIcon,
  SparkleIcon,
  WarningIcon,
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
    pullRequestUrl: string | null;
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

type Tone = "info" | "success" | "error" | "command" | "message" | "muted";

type Described = {
  icon: typeof CodeIcon;
  label: string;
  detail: string | null;
  tone: Tone;
  href?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

/** Map a stored run event to a display row. Returns null for noise. */
function describeEvent(event: RunEvent): Described | null {
  const payload = event.payload;

  if (event.eventType === "run.started") {
    const branch = asText(payload.branchName) ?? "work branch";
    const base = asText(payload.baseSha)?.slice(0, 7);
    return {
      icon: GitBranchIcon,
      label: `Provisioned sandbox on ${branch}`,
      detail: base ? `base commit ${base}` : null,
      tone: "info",
    };
  }

  if (event.eventType === "pull_request.created") {
    const number = payload.number;
    const url = asText(payload.url);
    return {
      icon: CheckCircleIcon,
      label: `Opened pull request${typeof number === "number" ? ` #${number}` : ""}`,
      detail: null,
      tone: "success",
      href: url ?? undefined,
    };
  }

  // Only the completed side of each tool call carries the outcome; the
  // "started" half is intentionally dropped to keep the log readable.
  if (event.eventType !== "item.completed") return null;

  const item = asRecord(payload.item);
  if (!item) return null;
  const itemType = asText(item.type) ?? "step";
  const text = asText(item.text);

  if (itemType === "agent_message") {
    return {
      icon: SparkleIcon,
      label: text ?? "Agent note",
      detail: null,
      tone: "message",
    };
  }

  if (itemType === "command_execution") {
    const command = asText(item.command) ?? "command";
    const failed = /exit code:\s*[1-9]/.test(text ?? "");
    return {
      icon: CodeIcon,
      label: `$ ${command}`,
      detail: text,
      tone: failed ? "error" : "command",
    };
  }

  if (itemType === "write_file") {
    return {
      icon: FileCodeIcon,
      label: text ?? "Wrote file",
      detail: null,
      tone: "success",
    };
  }

  if (itemType === "read_file") {
    const path = asText(item.path);
    return {
      icon: FileCodeIcon,
      label: `Read ${path ?? "file"}`,
      detail: null,
      tone: "muted",
    };
  }

  if (itemType === "list_files") {
    const path = asText(item.path);
    return {
      icon: FileCodeIcon,
      label: `Listed ${path ?? "repository"}`,
      detail: null,
      tone: "muted",
    };
  }

  if (itemType === "finish") {
    return {
      icon: CheckCircleIcon,
      label: "Marked the task complete",
      detail: null,
      tone: "success",
    };
  }

  return {
    icon: CodeIcon,
    label: itemType.replaceAll("_", " "),
    detail: text,
    tone: "muted",
  };
}

function eventTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const dotClass: Record<Tone, string> = {
  info: "text-violet-light",
  success: "text-mint",
  error: "text-danger",
  command: "text-amber",
  message: "text-paper",
  muted: "text-muted",
};

const textClass: Record<Tone, string> = {
  info: "text-muted-light",
  success: "text-mint",
  error: "text-danger",
  command: "text-amber/90",
  message: "text-paper",
  muted: "text-muted-light",
};

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

  const rows = (detail?.events ?? [])
    .map((event) => ({ event, described: describeEvent(event) }))
    .filter(
      (entry): entry is { event: RunEvent; described: Described } =>
        entry.described !== null,
    );

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [rows.length]);

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
        {rows.length > 0 && ` · ${rows.length}`}
      </button>

      {open && (
        <div className="mt-2 overflow-hidden rounded-lg border border-line bg-[#07090e]">
          {usage && (usage.inputTokens > 0 || usage.outputTokens > 0) && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-line px-3 py-2 font-mono text-[10px] text-muted">
              <span>{usage.inputTokens.toLocaleString()} in</span>
              <span>{usage.outputTokens.toLocaleString()} out</span>
              {usage.cachedInputTokens > 0 && (
                <span>{usage.cachedInputTokens.toLocaleString()} cached</span>
              )}
            </div>
          )}

          <div ref={logRef} className="max-h-80 overflow-y-auto px-3 py-2.5">
            {loading && (
              <p className="flex items-center gap-2 py-2 text-xs text-muted">
                <CircleNotchIcon size={13} className="animate-spin" />
                Loading activity…
              </p>
            )}

            {detail && rows.length === 0 && (
              <p className="py-2 text-xs text-muted">
                {isActive
                  ? "Provisioning the sandbox. The execution log appears here as the agent works."
                  : "No activity was recorded for this run."}
              </p>
            )}

            <div className="space-y-2">
              {rows.map(({ event, described }) => {
                const Icon = described.icon;
                return (
                  <div key={event.id} className="flex gap-2.5">
                    <span className="pt-0.5 font-mono text-[9px] text-muted/50">
                      {eventTime(event.createdAt)}
                    </span>
                    <Icon
                      size={13}
                      weight="duotone"
                      className={cn(
                        "mt-0.5 shrink-0",
                        dotClass[described.tone],
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      {described.href ? (
                        <a
                          href={described.href}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-medium hover:underline",
                            textClass[described.tone],
                          )}
                        >
                          {described.label}
                          <ArrowSquareOutIcon size={11} />
                        </a>
                      ) : (
                        <p
                          className={cn(
                            "break-words font-mono text-[11px] leading-4",
                            textClass[described.tone],
                          )}
                        >
                          {described.label}
                        </p>
                      )}
                      {described.detail && (
                        <pre className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap rounded border border-line bg-black/40 px-2 py-1 font-mono text-[10px] leading-4 text-muted">
                          {described.detail}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isActive && detail && (
              <p className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-violet-light">
                <CircleNotchIcon size={11} className="animate-spin" />
                Agent working…
              </p>
            )}

            {!isActive &&
              runStatus === "failed" &&
              detail &&
              rows.length > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-danger">
                  <WarningIcon size={12} weight="fill" />
                  Run failed before completion.
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
