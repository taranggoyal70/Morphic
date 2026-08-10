"use client";

import { CheckCircleIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { type FormEvent, useState } from "react";

import { errorMessage } from "@/lib/error-message";

const fieldClass =
  "mt-2 w-full rounded-lg border border-line-strong bg-ink/70 px-3.5 py-3 text-sm text-paper placeholder:text-muted focus:border-violet-light";

const STACK_OPTIONS = [
  ["braintrust", "Braintrust"],
  ["langsmith", "LangSmith"],
  ["arize", "Arize"],
  ["langfuse", "Langfuse"],
  ["sentry", "Sentry"],
  ["github_actions", "GitHub Actions"],
  ["other", "Other"],
] as const;

export function DesignPartnerApplicationForm({ today }: { today: string }) {
  const [state, setState] = useState<"idle" | "pending" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    setError(null);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/design-partner-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.get("companyName"),
          role: form.get("role"),
          engineeringTeamSize: form.get("engineeringTeamSize"),
          productionAgentConfirmed:
            form.get("productionAgentConfirmed") === "on",
          githubConfirmed: form.get("githubConfirmed") === "on",
          incidentOccurredAt: new Date(
            `${String(form.get("incidentOccurredAt"))}T12:00:00.000Z`,
          ).toISOString(),
          incidentSummary: form.get("incidentSummary"),
          currentStack: form.getAll("currentStack"),
          currentProofProcess: form.get("currentProofProcess"),
          artifactWilling: form.get("artifactWilling") === "on",
          pilotReadiness: form.get("pilotReadiness"),
          redactionConfirmed: form.get("redactionConfirmed") === "on",
        }),
      });

      if (!response.ok) {
        throw await response.json();
      }
      setState("submitted");
    } catch (submissionError) {
      setError(
        errorMessage(
          submissionError,
          "The application could not be recorded. Check every field and try again.",
        ),
      );
      setState("idle");
    }
  }

  if (state === "submitted") {
    return (
      <div
        className="rounded-xl border border-mint/30 bg-mint/10 p-6"
        role="status"
      >
        <CheckCircleIcon
          size={28}
          weight="fill"
          className="text-mint"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-2xl font-semibold text-paper">
          Application received
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-light">
          We will review the incident and release workflow first. A qualified
          application moves to a problem interview before any product pitch or
          artifact exchange.
        </p>
      </div>
    );
  }

  const latestIncidentDate = today;
  const earliestIncidentDate = new Date(
    new Date(`${today}T12:00:00.000Z`).getTime() - 90 * 24 * 60 * 60 * 1_000,
  )
    .toISOString()
    .slice(0, 10);

  return (
    <form onSubmit={submitApplication} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-paper">
          Company name
          <input
            name="companyName"
            required
            minLength={2}
            maxLength={120}
            autoComplete="organization"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-paper">
          Your role
          <input
            name="role"
            required
            minLength={2}
            maxLength={120}
            autoComplete="organization-title"
            placeholder="AI platform lead"
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-paper sm:col-span-2">
          Engineering team size
          <select
            name="engineeringTeamSize"
            required
            defaultValue=""
            className={fieldClass}
          >
            <option value="" disabled>
              Select a range
            </option>
            <option value="1-19">1-19 engineers</option>
            <option value="20-49">20-49 engineers</option>
            <option value="50-99">50-99 engineers</option>
            <option value="100-200">100-200 engineers</option>
            <option value="201+">201+ engineers</option>
          </select>
        </label>
      </div>

      <fieldset className="rounded-xl border border-line-strong bg-ink/35 p-5">
        <legend className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-light">
          Production fit
        </legend>
        <div className="space-y-4">
          <label className="flex items-start gap-3 text-sm leading-6 text-muted-light">
            <input
              type="checkbox"
              name="productionAgentConfirmed"
              required
              className="mt-1 size-4 accent-violet"
            />
            <span>A customer-facing AI agent is in production</span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-6 text-muted-light">
            <input
              type="checkbox"
              name="githubConfirmed"
              required
              className="mt-1 size-4 accent-violet"
            />
            <span>Application code lives in GitHub</span>
          </label>
        </div>
      </fieldset>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="incidentOccurredAt"
            className="block text-sm font-medium text-paper"
          >
            Recent incident date
          </label>
          <p id="incident-date-guidance" className="mt-1 text-xs text-muted">
            Must be within 90 days.
          </p>
          <input
            id="incidentOccurredAt"
            type="date"
            name="incidentOccurredAt"
            required
            min={earliestIncidentDate}
            max={latestIncidentDate}
            aria-describedby="incident-date-guidance"
            className={fieldClass}
          />
        </div>
        <label className="block text-sm font-medium text-paper">
          Redacted incident summary
          <textarea
            name="incidentSummary"
            required
            minLength={20}
            maxLength={1_000}
            rows={4}
            placeholder="Describe what the agent did, the expected behavior, and the customer or business impact."
            className={fieldClass}
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-paper">
          Current stack
        </legend>
        <p className="mt-1 text-xs leading-5 text-muted">
          Select every system involved in tracing, evaluation, or release
          checks.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STACK_OPTIONS.map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-lg border border-line-strong bg-ink/50 px-3 py-2.5 text-sm text-muted-light transition hover:border-violet/40 hover:text-paper"
            >
              <input
                type="checkbox"
                name="currentStack"
                value={value}
                className="size-4 accent-violet"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-paper">
        How do you prove the fix today?
        <textarea
          name="currentProofProcess"
          required
          minLength={20}
          maxLength={1_500}
          rows={4}
          placeholder="Walk through trace, issue, code change, regression, approval, and merge evidence."
          className={fieldClass}
        />
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-paper">
          90-day pilot readiness
        </legend>
        {[
          ["ready_to_pay", "Ready to fund a $10K-$25K pilot"],
          ["needs_approval", "Interested, but another owner must approve"],
          ["not_ready", "Not ready to fund a pilot"],
        ].map(([value, label]) => (
          <label
            key={value}
            className="flex items-center gap-3 rounded-lg border border-line-strong bg-ink/35 px-4 py-3 text-sm text-muted-light"
          >
            <input
              type="radio"
              name="pilotReadiness"
              value={value}
              required
              className="size-4 accent-violet"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <div className="space-y-4 border-t border-line pt-6">
        <label className="flex items-start gap-3 text-sm leading-6 text-muted-light">
          <input
            type="checkbox"
            name="artifactWilling"
            className="mt-1 size-4 accent-mint"
          />
          <span>I can provide a redacted incident artifact</span>
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-muted-light">
          <input
            type="checkbox"
            name="redactionConfirmed"
            required
            className="mt-1 size-4 accent-mint"
          />
          <span>
            I confirm this application contains no customer data or secrets
          </span>
        </label>
      </div>

      {error && (
        <p
          className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "pending"}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mint disabled:cursor-wait disabled:opacity-60"
      >
        {state === "pending" ? (
          <SpinnerGapIcon
            size={17}
            className="animate-spin"
            aria-hidden="true"
          />
        ) : null}
        {state === "pending"
          ? "Recording application…"
          : "Apply for the paid pilot"}
      </button>
      <p className="text-center text-xs leading-5 text-muted">
        An application is not counted as customer validation until a qualified
        problem interview verifies the incident and workflow.
      </p>
    </form>
  );
}
