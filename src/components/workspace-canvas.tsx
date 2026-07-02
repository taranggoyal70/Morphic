import {
  ArrowSquareOutIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  FileCodeIcon,
  GitBranchIcon,
  GithubLogoIcon,
  LockSimpleIcon,
  SparkleIcon,
  WarningIcon,
} from "@phosphor-icons/react/dist/ssr";
import { format, formatDistanceToNowStrict } from "date-fns";

import { AdaptWorkspaceForm } from "@/components/adapt-workspace-form";
import { CodexPanel } from "@/components/codex-panel";
import { DecisionOptions } from "@/components/decision-options";
import { WorkspaceRefresh } from "@/components/workspace-refresh";
import type { WorkspacePlan } from "@/lib/domain/workspace";
import { cn } from "@/lib/utils";

type WorkspaceData = {
  id: string;
  objective: string;
  targetDate: Date | null;
  constraints: string[];
  status: "generating" | "active" | "archived" | "failed";
  currentVersion: number;
  lastError: string | null;
  updatedAt: Date;
};

type RepositoryData = {
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
};

type RunData = {
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

function statusLabel(status: WorkspaceData["status"]) {
  if (status === "active") return "Live";
  if (status === "generating") return "Adapting";
  if (status === "failed") return "Needs attention";
  return "Archived";
}

function sourceUrl(
  repository: RepositoryData,
  sourceType: string,
  sourceNumber: number | null,
) {
  if (!sourceNumber) return null;
  const segment = sourceType === "pull_request" ? "pull" : "issues";
  return `https://github.com/${repository.fullName}/${segment}/${sourceNumber}`;
}

function moduleOrder(plan: WorkspacePlan, module: string) {
  const index = plan.interface.moduleOrder.indexOf(
    module as (typeof plan.interface.moduleOrder)[number],
  );
  return index === -1 ? 99 : index;
}

export function WorkspaceCanvas({
  workspace,
  repository,
  plan,
  version,
  runs,
}: {
  workspace: WorkspaceData;
  repository: RepositoryData;
  plan: WorkspacePlan | null;
  version: number | null;
  runs: RunData[];
}) {
  const adapting = workspace.status === "generating";

  return (
    <main className="min-h-screen bg-ink">
      <WorkspaceRefresh workspaceId={workspace.id} active={adapting} />

      <header className="bg-[#090b10] px-4 pt-5 sm:px-6 lg:px-7">
        <div className="mx-auto max-w-[1500px] rounded-xl border border-line-strong bg-surface/40 px-5 py-5">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.13em] text-violet-light">
                <span>Active objective</span>
                <span className="text-muted">/</span>
                <a
                  href={`https://github.com/${repository.fullName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 normal-case tracking-normal text-muted-light transition hover:text-paper"
                >
                  <GithubLogoIcon size={12} weight="fill" />
                  {repository.fullName}
                  <ArrowSquareOutIcon size={10} />
                </a>
              </div>
              <h1 className="mt-3 max-w-4xl text-2xl font-semibold tracking-[-0.035em] text-paper sm:text-3xl">
                {workspace.objective}
              </h1>
              {plan && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-light">
                  {plan.summary}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium",
                  workspace.status === "active" &&
                    "border-mint/20 bg-mint/10 text-mint",
                  workspace.status === "generating" &&
                    "border-violet/25 bg-violet/10 text-violet-light",
                  workspace.status === "failed" &&
                    "border-danger/25 bg-danger/10 text-danger",
                  workspace.status === "archived" &&
                    "border-line-strong text-muted-light",
                )}
              >
                {adapting ? (
                  <SparkleIcon
                    size={13}
                    weight="fill"
                    className="animate-pulse"
                  />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
                {statusLabel(workspace.status)}
              </span>
              {workspace.targetDate && (
                <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs text-muted-light">
                  <CalendarBlankIcon size={13} />
                  {format(workspace.targetDate, "MMM d, yyyy")}
                </span>
              )}
              <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 font-mono text-[10px] text-muted">
                <GitBranchIcon size={12} />
                {repository.defaultBranch}
              </span>
              {repository.isPrivate && (
                <span
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-line text-muted"
                  aria-label="Private repository"
                >
                  <LockSimpleIcon size={13} />
                </span>
              )}
            </div>
          </div>

          {workspace.constraints.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {workspace.constraints.map((constraint) => (
                <span
                  key={constraint}
                  className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-muted-light"
                >
                  {constraint}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {!plan ? (
        <section className="mx-auto grid min-h-[640px] max-w-[1500px] place-items-center px-5">
          <div className="max-w-md text-center">
            {workspace.status === "failed" ? (
              <WarningIcon
                size={34}
                weight="duotone"
                className="mx-auto text-danger"
              />
            ) : (
              <SparkleIcon
                size={34}
                weight="fill"
                className="mx-auto animate-pulse text-violet-light"
              />
            )}
            <h2 className="mt-5 text-lg font-semibold text-paper">
              {workspace.status === "failed"
                ? "Workspace compilation stopped"
                : "Compiling your workspace"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {workspace.status === "failed"
                ? (workspace.lastError ??
                  "Morphic could not compile this repository state.")
                : "Morphic is capturing live GitHub evidence and shaping the interface around your objective."}
            </p>
            {workspace.status === "failed" && (
              <div className="mt-6">
                <AdaptWorkspaceForm
                  workspaceId={workspace.id}
                  disabled={false}
                />
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="mx-auto max-w-[1500px] px-4 pb-6 pt-5 sm:px-6 lg:px-7">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparkleIcon
                  size={17}
                  weight="fill"
                  className="text-violet-light"
                />
                <h2 className="text-sm font-semibold text-paper">
                  Morphic&apos;s plan
                </h2>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                  v{version}
                </span>
              </div>
              <span className="text-[11px] text-muted">
                Updated{" "}
                {formatDistanceToNowStrict(workspace.updatedAt, {
                  addSuffix: true,
                })}
              </span>
            </div>

            <div className="grid grid-cols-1 border-y border-line xl:grid-cols-12">
              <section
                style={{ order: moduleOrder(plan, "outcome") }}
                className="border-b border-line py-5 pr-5 xl:col-span-2 xl:border-b-0 xl:border-r"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-paper">
                  <CheckCircleIcon
                    size={17}
                    weight="duotone"
                    className="text-violet-light"
                  />
                  Outcome
                </div>
                <p className="mt-4 text-sm leading-6 text-paper">
                  {plan.outcome.statement}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {plan.outcome.definitionOfDone.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-xs leading-5 text-muted-light"
                    >
                      <CheckCircleIcon
                        size={14}
                        className="mt-0.5 shrink-0 text-violet-light"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                    Success signal
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-light">
                    {plan.outcome.successSignal}
                  </p>
                </div>
              </section>

              <section
                style={{ order: moduleOrder(plan, "critical_path") }}
                className={cn(
                  "border-b border-line py-5 xl:border-b-0 xl:border-r xl:px-5",
                  plan.interface.primaryModule === "critical_path"
                    ? "xl:col-span-4"
                    : "xl:col-span-3",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-paper">
                    <GitBranchIcon
                      size={17}
                      weight="duotone"
                      className="text-violet-light"
                    />
                    Critical path
                  </div>
                  <span className="rounded border border-line px-2 py-0.5 font-mono text-[9px] text-muted">
                    {plan.criticalPath.length} steps
                  </span>
                </div>
                <div className="mt-4 divide-y divide-line">
                  {plan.criticalPath.map((item, index) => {
                    const url = sourceUrl(
                      repository,
                      item.sourceType,
                      item.sourceNumber,
                    );
                    return (
                      <div key={item.id} className="relative py-3 pl-7">
                        <span
                          className={cn(
                            "absolute left-0 top-3.5 inline-flex size-4 items-center justify-center rounded-full border text-[9px]",
                            item.status === "done" &&
                              "border-mint bg-mint/10 text-mint",
                            item.status === "in_progress" &&
                              "border-violet bg-violet/15 text-violet-light",
                            item.status === "blocked" &&
                              "border-danger bg-danger/10 text-danger",
                            item.status === "todo" &&
                              "border-line-strong text-muted",
                          )}
                        >
                          {item.status === "done" ? (
                            <CheckCircleIcon size={11} weight="fill" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <p className="text-xs font-medium leading-5 text-paper">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 text-muted">
                          {item.detail}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-violet-light hover:text-paper"
                            >
                              #{item.sourceNumber}
                              <ArrowSquareOutIcon size={9} />
                            </a>
                          ) : (
                            <span>{item.sourceType}</span>
                          )}
                          {item.estimatedMinutes && (
                            <span className="inline-flex items-center gap-1">
                              <ClockIcon size={9} />
                              {item.estimatedMinutes}m
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section
                style={{ order: moduleOrder(plan, "repository_impact") }}
                className={cn(
                  "border-b border-line py-5 xl:border-b-0 xl:border-r xl:px-5",
                  plan.interface.primaryModule === "repository_impact"
                    ? "xl:col-span-4"
                    : "xl:col-span-3",
                )}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-paper">
                  <FileCodeIcon
                    size={17}
                    weight="duotone"
                    className="text-violet-light"
                  />
                  Repository impact
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  Evidence-backed paths for this objective.
                </p>
                <div className="mt-4 divide-y divide-line">
                  {plan.repositoryImpact.map((impact) => (
                    <div
                      key={`${impact.path}:${impact.changeKind}`}
                      className="py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate font-mono text-[11px] text-muted-light">
                          {impact.path}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[9px] uppercase",
                            impact.changeKind === "delete"
                              ? "text-danger"
                              : impact.changeKind === "inspect"
                                ? "text-muted"
                                : "text-mint",
                          )}
                        >
                          {impact.changeKind}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-muted">
                        {impact.reason}
                      </p>
                      <div className="mt-2 h-px bg-white/5">
                        <div
                          className="h-px bg-violet/70"
                          style={{ width: `${impact.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {plan.repositoryImpact.length === 0 && (
                    <p className="py-6 text-xs leading-5 text-muted">
                      No file impact is supported by the current evidence.
                    </p>
                  )}
                </div>
              </section>

              <section
                style={{ order: moduleOrder(plan, "decisions") }}
                className="py-5 xl:col-span-3 xl:pl-5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-paper">
                  <CircleIcon
                    size={17}
                    weight="duotone"
                    className="text-violet-light"
                  />
                  Open decisions
                  {plan.decisions.length > 0 && (
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-muted">
                      {plan.decisions.length}
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-5">
                  {plan.decisions.map((decision) => (
                    <DecisionOptions
                      key={decision.id}
                      workspaceId={workspace.id}
                      version={version ?? 0}
                      decision={decision}
                      disabled={adapting}
                    />
                  ))}
                  {plan.decisions.length === 0 && (
                    <p className="text-xs leading-5 text-muted">
                      No consequential decision is currently blocking this
                      objective.
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-line pt-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-paper">
                    <WarningIcon
                      size={16}
                      weight="duotone"
                      className="text-amber"
                    />
                    Risks
                    {plan.risks.length > 0 && (
                      <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-muted">
                        {plan.risks.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {plan.risks.map((risk) => (
                      <details
                        key={risk.id}
                        className="group rounded-lg border border-line bg-surface px-3 py-2"
                      >
                        <summary className="cursor-pointer list-none text-xs font-medium leading-5 text-paper">
                          <span
                            className={cn(
                              "mr-2 inline-block size-1.5 rounded-full",
                              risk.severity === "critical" && "bg-danger",
                              risk.severity === "high" && "bg-amber",
                              risk.severity === "medium" && "bg-violet-light",
                              risk.severity === "low" && "bg-muted",
                            )}
                          />
                          {risk.title}
                        </summary>
                        <p className="mt-2 text-[11px] leading-4 text-muted">
                          {risk.detail}
                        </p>
                        <p className="mt-2 text-[11px] leading-4 text-muted-light">
                          Mitigation: {risk.mitigation}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </section>

          <CodexPanel
            workspaceId={workspace.id}
            workspaceReady={workspace.status === "active"}
            runs={runs}
          />
          <section className="mx-auto max-w-[1000px] px-4 py-3 sm:px-6">
            <AdaptWorkspaceForm
              workspaceId={workspace.id}
              disabled={adapting}
            />
          </section>
        </>
      )}
    </main>
  );
}
