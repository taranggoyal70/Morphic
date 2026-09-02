"use client";

import { ArrowRightIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { CharacterCounter } from "@/components/character-counter";

type RepositoryOption = {
  id: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
};

export function CreateWorkspaceForm({
  repositories,
}: {
  repositories: RepositoryOption[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [constraintDraft, setConstraintDraft] = useState("");
  const [objectiveLength, setObjectiveLength] = useState(0);

  function addConstraint() {
    const next = constraintDraft.trim();
    if (!next || constraints.includes(next) || constraints.length >= 12) return;
    setConstraints((current) => [...current, next]);
    setConstraintDraft("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repositoryId: form.get("repositoryId"),
          objective: form.get("objective"),
          targetDate: form.get("targetDate")
            ? new Date(String(form.get("targetDate"))).toISOString()
            : null,
          constraints,
        }),
      });
      const payload = (await response.json()) as {
        workspace?: { id: string };
        error?: { message?: string };
      };
      if (!response.ok || !payload.workspace) {
        throw new Error(
          payload.error?.message ?? "Workspace could not be created.",
        );
      }
      toast.success("Morphic is compiling your workspace.");
      router.push(`/workspaces/${payload.workspace.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Workspace could not be created.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-10 rounded-2xl border border-line bg-surface-raised p-5 shadow-[0_2px_8px_rgba(26,26,26,.08)] sm:p-7"
    >
      <div className="grid gap-7 lg:grid-cols-[1fr_0.88fr]">
        <div>
          <label
            htmlFor="objective"
            className="mb-2 block text-sm font-medium text-paper"
          >
            Verifiable outcome
          </label>
          <textarea
            id="objective"
            name="objective"
            required
            minLength={8}
            maxLength={500}
            autoFocus
            onChange={(event) => setObjectiveLength(event.target.value.length)}
            placeholder="Ship organization onboarding with invitation and recovery paths"
            className="min-h-40 w-full resize-none rounded-xl border border-line-strong bg-ink px-4 py-4 text-lg leading-7 text-paper placeholder:text-muted focus:border-evidence"
          />
          <div className="mt-2 flex items-start justify-between gap-4">
            <p className="text-xs text-muted">
              Describe the result a reviewer could confirm, not a project label.
            </p>
            <CharacterCounter
              current={objectiveLength}
              maximum={500}
              label="Objective"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="repositoryId"
              className="mb-2 block text-sm font-medium text-paper"
            >
              Evidence source
            </label>
            <select
              id="repositoryId"
              name="repositoryId"
              required
              defaultValue=""
              className="h-12 w-full rounded border border-line-strong bg-ink px-3 text-sm text-paper focus:border-paper"
            >
              <option value="" disabled>
                Choose a GitHub repository
              </option>
              {repositories.map((repository) => (
                <option key={repository.id} value={repository.id}>
                  {repository.fullName}
                  {repository.isPrivate ? " · private" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="targetDate"
              className="mb-2 block text-sm font-medium text-paper"
            >
              Review target
              <span className="ml-1 font-normal text-muted">optional</span>
            </label>
            <input
              id="targetDate"
              name="targetDate"
              type="datetime-local"
              className="h-12 w-full rounded border border-line-strong bg-ink px-3 text-sm text-paper focus:border-paper"
            />
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-xl border border-line bg-ink/55 p-4 sm:p-5">
        <label
          htmlFor="constraint"
          className="mb-2 block text-sm font-medium text-paper"
        >
          Guardrails
          <span className="ml-1 font-normal text-muted">optional</span>
        </label>
        <div className="flex max-w-2xl gap-2">
          <input
            id="constraint"
            value={constraintDraft}
            onChange={(event) => setConstraintDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addConstraint();
              }
            }}
            maxLength={180}
            placeholder="No authentication changes"
            className="h-11 min-w-0 flex-1 rounded border border-line-strong bg-ink px-3 text-sm text-paper placeholder:text-muted focus:border-paper"
          />
          <button
            type="button"
            onClick={addConstraint}
            className="inline-flex size-11 items-center justify-center rounded border border-paper text-paper transition hover:border-evidence hover:text-evidence"
            aria-label="Add constraint"
          >
            <PlusIcon size={16} />
          </button>
        </div>
        <div className="mt-2 max-w-2xl text-right">
          <CharacterCounter
            current={constraintDraft.length}
            maximum={180}
            label="Guardrail"
          />
        </div>
        {constraints.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {constraints.map((constraint) => (
              <span
                key={constraint}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 text-xs text-muted-light"
              >
                {constraint}
                <button
                  type="button"
                  onClick={() =>
                    setConstraints((current) =>
                      current.filter((value) => value !== constraint),
                    )
                  }
                  className="inline-flex size-6 items-center justify-center rounded text-muted transition hover:bg-surface-hover hover:text-paper"
                  aria-label={`Remove ${constraint}`}
                >
                  <XIcon size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={pending || repositories.length === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded bg-evidence px-6 text-sm font-semibold uppercase tracking-[0.05em] text-ink transition hover:bg-evidence-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Mapping evidence…" : "Create evidence route"}
          {!pending && <ArrowRightIcon size={16} weight="bold" />}
        </button>
      </div>
    </form>
  );
}
