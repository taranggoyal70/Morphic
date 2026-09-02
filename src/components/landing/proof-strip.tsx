const proofs = [
  ["Evidence", "Files, issues, and PRs stored before planning"],
  ["Control", "No agent run without explicit approval"],
  ["Delivery", "Every run ends in a branch and draft PR"],
];

export function ProofStrip() {
  return (
    <section aria-label="Product guarantees" className="border-b border-line bg-surface/40">
      <div className="mx-auto grid max-w-[1240px] sm:grid-cols-3">
        {proofs.map(([label, body]) => (
          <div
            key={label}
            className="grid grid-cols-[88px_1fr] gap-3 border-b border-line px-5 py-5 last:border-b-0 sm:block sm:border-b-0 sm:border-r sm:px-8 sm:last:border-r-0"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-evidence">
              {label}
            </p>
            <p className="text-sm leading-6 text-muted-light sm:mt-2">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
