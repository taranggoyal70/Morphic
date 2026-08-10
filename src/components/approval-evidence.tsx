export function ApprovalEvidence({
  repositoryFullName,
  snapshotSha,
}: {
  repositoryFullName: string;
  snapshotSha: string;
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
    </div>
  );
}
