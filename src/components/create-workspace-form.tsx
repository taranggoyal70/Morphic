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
  const [mode, setMode] = useState<"incident" | "objective">("incident");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([]);
  const [acceptanceCriterionDraft, setAcceptanceCriterionDraft] = useState("");

  function addConstraint() {
    const next = constraintDraft.trim();
    if (!next || constraints.includes(next) || constraints.length >= 12) return;
    setConstraints((current) => [...current, next]);
    setConstraintDraft("");
  }

  function addAcceptanceCriterion() {
    const next = acceptanceCriterionDraft.trim();
    if (
      next.length < 8 ||
      acceptanceCriteria.includes(next) ||
      acceptanceCriteria.length >= 8
    ) {
      return;
    }
    setAcceptanceCriteria((current) => [...current, next]);
    setAcceptanceCriterionDraft("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const occurredAt = form.get("occurredAt");
    const traceUrl = String(form.get("traceUrl") ?? "").trim();
    const incident =
      mode === "incident"
        ? {
            source: form.get("incidentSource"),
            externalId: form.get("incidentExternalId"),
            title: form.get("incidentTitle"),
            observedBehavior: form.get("observedBehavior"),
            expectedBehavior: form.get("expectedBehavior"),
            occurredAt: new Date(String(occurredAt)).toISOString(),
            traceUrl: traceUrl || null,
            acceptanceCriteria,
            redactionConfirmed: form.get("redactionConfirmed") === "on",
          }
        : null;
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
          incident,
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
      toast.success(
        mode === "incident"
          ? "Morphic is compiling the incident regression workspace."
          : "Morphic is compiling your workspace.",
      );
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
      <fieldset className="mb-7 grid gap-2 rounded-xl border border-line-strong bg-surface/60 p-1.5 sm:grid-cols-2">
        <legend className="sr-only">Workspace type</legend>
        <button
          type="button"
          aria-pressed={mode === "incident"}
          onClick={() => setMode("incident")}
          className={`rounded-lg px-4 py-3 text-left transition ${
            mode === "incident"
              ? "bg-violet/15 text-paper ring-1 ring-violet/35"
              : "text-muted-light hover:bg-white/5 hover:text-paper"
          }`}
        >
          <span className="block text-sm font-semibold">
            Incident regression
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted">
            Turn a redacted production failure into verified behavioral
            evidence.
          </span>
        </button>
        <button
          type="button"
          aria-pressed={mode === "objective"}
          onClick={() => setMode("objective")}
          className={`rounded-lg px-4 py-3 text-left transition ${
            mode === "objective"
              ? "bg-violet/15 text-paper ring-1 ring-violet/35"
              : "text-muted-light hover:bg-white/5 hover:text-paper"
          }`}
        >
          <span className="block text-sm font-semibold">General objective</span>
          <span className="mt-1 block text-xs leading-5 text-muted">
            Compile a repository-grounded plan without incident evidence.
          </span>
        </button>
      </fieldset>

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
            {mode === "incident"
              ? "State the behavior that must be prevented, not the implementation."
              : "Use an observable outcome, not a broad project name."}
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

      {mode === "incident" && (
        <section className="mt-7 border-t border-line pt-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-sm font-semibold text-paper">
                Redacted production evidence
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
                Provide the smallest artifact that explains what happened and
                what a repository-owned regression must prove. Do not paste raw
                customer data or secrets.
              </p>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-amber">
              Required for incident mode
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="incidentSource"
                className="mb-2 block text-xs font-medium text-paper"
              >
                Incident source
              </label>
              <select
                id="incidentSource"
                name="incidentSource"
                required
                defaultValue="manual"
                className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper"
              >
                <option value="manual">Manual incident</option>
                <option value="braintrust">Braintrust</option>
                <option value="langsmith">LangSmith</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="incidentExternalId"
                className="mb-2 block text-xs font-medium text-paper"
              >
                Incident ID
              </label>
              <input
                id="incidentExternalId"
                name="incidentExternalId"
                required
                maxLength={160}
                placeholder="INC-284"
                className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper placeholder:text-muted"
              />
            </div>
            <div>
              <label
                htmlFor="occurredAt"
                className="mb-2 block text-xs font-medium text-paper"
              >
                Occurred at
              </label>
              <input
                id="occurredAt"
                name="occurredAt"
                type="datetime-local"
                required
                className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper"
              />
            </div>
            <div>
              <label
                htmlFor="traceUrl"
                className="mb-2 block text-xs font-medium text-paper"
              >
                Trace URL
                <span className="ml-1 font-normal text-muted">optional</span>
              </label>
              <input
                id="traceUrl"
                name="traceUrl"
                aria-label="Trace URL"
                type="url"
                maxLength={2_000}
                placeholder="https://…"
                className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper placeholder:text-muted"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="incidentTitle"
              className="mb-2 block text-xs font-medium text-paper"
            >
              Incident title
            </label>
            <input
              id="incidentTitle"
              name="incidentTitle"
              required
              minLength={8}
              maxLength={240}
              placeholder="Refund assistant repeated a customer credit"
              className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper placeholder:text-muted"
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="observedBehavior"
                className="mb-2 block text-xs font-medium text-paper"
              >
                Observed behavior
              </label>
              <textarea
                id="observedBehavior"
                name="observedBehavior"
                required
                minLength={8}
                maxLength={2_000}
                placeholder="A retried webhook issued two credits."
                className="min-h-28 w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm leading-6 text-paper placeholder:text-muted"
              />
            </div>
            <div>
              <label
                htmlFor="expectedBehavior"
                className="mb-2 block text-xs font-medium text-paper"
              >
                Expected behavior
              </label>
              <textarea
                id="expectedBehavior"
                name="expectedBehavior"
                required
                minLength={8}
                maxLength={2_000}
                placeholder="A retried webhook issues exactly one credit."
                className="min-h-28 w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm leading-6 text-paper placeholder:text-muted"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="acceptanceCriterion"
              className="mb-2 block text-xs font-medium text-paper"
            >
              Acceptance criterion
            </label>
            <div className="flex max-w-3xl gap-2">
              <input
                id="acceptanceCriterion"
                value={acceptanceCriterionDraft}
                onChange={(event) =>
                  setAcceptanceCriterionDraft(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addAcceptanceCriterion();
                  }
                }}
                minLength={8}
                maxLength={400}
                placeholder="Replaying the same webhook issues exactly one credit"
                className="h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-sm text-paper placeholder:text-muted"
              />
              <button
                type="button"
                onClick={addAcceptanceCriterion}
                disabled={acceptanceCriteria.length >= 8}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong px-3 text-xs font-medium text-muted-light transition hover:bg-white/5 hover:text-paper disabled:opacity-40"
              >
                <PlusIcon size={14} />
                Add acceptance criterion
              </button>
            </div>
            {acceptanceCriteria.length > 0 && (
              <ul className="mt-3 max-w-3xl space-y-2">
                {acceptanceCriteria.map((criterion) => (
                  <li
                    key={criterion}
                    className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs leading-5 text-muted-light"
                  >
                    <span>{criterion}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAcceptanceCriteria((current) =>
                          current.filter((value) => value !== criterion),
                        )
                      }
                      className="mt-0.5 shrink-0 text-muted transition hover:text-paper"
                      aria-label={`Remove ${criterion}`}
                    >
                      <XIcon size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="mt-5 flex max-w-3xl items-start gap-3 rounded-lg border border-amber/20 bg-amber/5 p-3 text-xs leading-5 text-muted-light">
            <input
              name="redactionConfirmed"
              aria-label="I confirm this incident evidence is redacted"
              type="checkbox"
              required
              className="mt-1 accent-violet"
            />
            <span>
              I confirm this incident evidence is redacted
              <span className="block text-muted">
                No secrets, credentials, raw customer content, or unnecessary
                personal data are included.
              </span>
            </span>
          </label>
        </section>
      )}

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
          disabled={
            pending ||
            repositories.length === 0 ||
            (mode === "incident" && acceptanceCriteria.length === 0)
          }
          className="inline-flex items-center gap-2 rounded-lg bg-violet px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-light hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Compiling…"
            : mode === "incident"
              ? "Create regression workspace"
              : "Shape workspace"}
          {!pending && <ArrowRightIcon size={16} weight="bold" />}
        </button>
      </div>
    </form>
  );
}
