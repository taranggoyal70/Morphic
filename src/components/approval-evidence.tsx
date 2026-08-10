import type { IncidentEvidence } from "@/lib/domain/incident";

export function ApprovalEvidence({
  repositoryFullName,
  snapshotSha,
  workspaceVersion,
  incident = null,
}: {
  repositoryFullName: string;
  snapshotSha: string;
  workspaceVersion: number;
  incident?: IncidentEvidence | null;
}) {
  return (
    <div
      aria-label="Approval evidence"
      className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 pl-[22px] text-[11px]"
    >
      <span className="text-muted">Repository Snapshot</span>
      <code className="rounded border border-line bg-black/20 px-1.5 py-0.5 font-mono text-violet-light">
        {repositoryFullName}@{snapshotSha.slice(0, 7)}
      </code>
      <span className="text-muted">Workspace Version v{workspaceVersion}</span>
      <p className="basis-full leading-4 text-muted-light">
        Approval authorizes one isolated run against this snapshot. Morphic will
        verify the diff and can only open a draft pull request.
      </p>
      {incident && (
        <div className="mt-1 basis-full rounded-lg border border-amber/20 bg-amber/5 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-amber">
              Incident {incident.externalId}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              {incident.source}
            </span>
          </div>
          <p className="mt-2 font-medium text-paper">{incident.title}</p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-muted">Observed</dt>
              <dd className="mt-0.5 leading-4 text-muted-light">
                {incident.observedBehavior}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Expected</dt>
              <dd className="mt-0.5 leading-4 text-muted-light">
                {incident.expectedBehavior}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-muted">Required behavioral evidence</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-light">
            {incident.acceptanceCriteria.map((criterion) => (
              <li key={criterion}>{criterion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
