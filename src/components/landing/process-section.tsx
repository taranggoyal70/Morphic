import { productPrinciples } from "@/components/landing/content";

export function ProcessSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-surface">
      <div className="mx-auto max-w-[1440px] border-x border-line px-5 py-24 sm:px-10 sm:py-32 lg:px-14 xl:px-20">
        <div className="flex flex-col justify-between gap-8 border-b border-line-strong pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-evidence">
              Control rules
            </p>
            <h2 className="font-display mt-5 max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.055em] text-paper sm:text-7xl">
              Nothing important happens off-route.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-light">
            The workspace may adapt. The evidence record, approval gate, and
            delivery trail do not.
          </p>
        </div>

        <ol className="grid border-b border-line-strong lg:grid-cols-3">
          {productPrinciples.map((principle, index) => (
            <li
              key={principle.label}
              className="relative border-b border-line-strong py-10 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-evidence">
                <span>{principle.label}</span>
                {index < productPrinciples.length - 1 && (
                  <span
                    className="h-px flex-1 bg-evidence/30"
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3 className="font-display mt-12 max-w-sm text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-paper">
                {principle.title}
              </h3>
              <p className="mt-5 max-w-sm text-sm leading-6 text-muted-light">
                {principle.body}
              </p>
              <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {index === 0 && "Input / GitHub snapshot"}
                {index === 1 && "Gate / explicit decision"}
                {index === 2 && "Output / draft pull request"}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
