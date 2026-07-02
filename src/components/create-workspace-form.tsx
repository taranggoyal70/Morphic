"use client";

import { ArrowRightIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

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
    <form onSubmit={submit} className="mt-8">
      <div className="grid gap-7 lg:grid-cols-[1fr_0.88fr]">
        <div>
          <label
            htmlFor="objective"
            className="mb-2 block text-sm font-medium text-paper"
          >
            What outcome are you driving?
          </label>
          <textarea
            id="objective"
            name="objective"
            required
            minLength={8}
            maxLength={500}
            autoFocus
            placeholder="Ship onboarding by Friday"
            className="min-h-36 w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-[17px] leading-7 text-paper placeholder:text-muted focus:border-violet"
          />
          <p className="mt-2 text-xs text-muted">
            Use an observable outcome, not a broad project name.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="repositoryId"
              className="mb-2 block text-sm font-medium text-paper"
            >
              Repository evidence
            </label>
            <select
              id="repositoryId"
              name="repositoryId"
              required
              defaultValue=""
              className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper"
            >
              <option value="" disabled>
                Select a GitHub repository
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
              Target date
              <span className="ml-1 font-normal text-muted">optional</span>
            </label>
            <input
              id="targetDate"
              name="targetDate"
              type="datetime-local"
              className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper"
            />
          </div>
        </div>
      </div>

      <div className="mt-7 border-t border-line pt-6">
        <label
          htmlFor="constraint"
          className="mb-2 block text-sm font-medium text-paper"
        >
          Constraints
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
            className="h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper placeholder:text-muted"
          />
          <button
            type="button"
            onClick={addConstraint}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line-strong text-muted-light transition hover:bg-white/5 hover:text-paper"
            aria-label="Add constraint"
          >
            <PlusIcon size={16} />
          </button>
        </div>
        {constraints.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {constraints.map((constraint) => (
              <span
                key={constraint}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-raised px-2.5 py-1.5 text-xs text-muted-light"
              >
                {constraint}
                <button
                  type="button"
                  onClick={() =>
                    setConstraints((current) =>
                      current.filter((value) => value !== constraint),
                    )
                  }
                  className="text-muted transition hover:text-paper"
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
          className="inline-flex items-center gap-2 rounded-lg bg-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-light hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Compiling…" : "Shape workspace"}
          {!pending && <ArrowRightIcon size={16} weight="bold" />}
        </button>
      </div>
    </form>
  );
}
