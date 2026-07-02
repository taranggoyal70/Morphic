"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Decision = {
  id: string;
  question: string;
  context: string;
  recommendedOptionId: string;
  options: Array<{
    id: string;
    label: string;
    tradeoff: string;
  }>;
};

export function DecisionOptions({
  workspaceId,
  version,
  decision,
  disabled,
}: {
  workspaceId: string;
  version: number;
  decision: Decision;
  disabled: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>();
  const [pending, setPending] = useState(false);

  async function choose(optionId: string) {
    setSelected(optionId);
    setPending(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionId: decision.id,
          optionId,
          version,
        }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(
          payload.error?.message ?? "Decision could not be saved.",
        );
      }
      toast.success("Decision saved. Morphic is adapting the workspace.");
      router.refresh();
    } catch (error) {
      setSelected(undefined);
      toast.error(
        error instanceof Error ? error.message : "Decision could not be saved.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium leading-5 text-paper">
        {decision.question}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted">{decision.context}</p>
      <div className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line">
        {decision.options.map((option) => (
          <label
            key={option.id}
            className="flex w-full cursor-pointer items-start gap-2.5 bg-transparent px-3 py-2.5 text-left transition hover:bg-white/[0.035] has-disabled:cursor-not-allowed has-disabled:opacity-60"
          >
            <input
              type="radio"
              name={`decision-${decision.id}`}
              value={option.id}
              checked={selected === option.id}
              onChange={() => choose(option.id)}
              disabled={disabled || pending}
              className="mt-0.5 size-3.5 shrink-0 accent-violet"
            />
            <span>
              <span className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-paper">
                {option.label}
                {option.id === decision.recommendedOptionId && (
                  <span className="rounded bg-violet/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-violet-light">
                    Recommended
                  </span>
                )}
              </span>
              <span className="mt-1 block text-[11px] leading-4 text-muted">
                {option.tradeoff}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
