import { productPrinciples } from "@/components/landing/content";

export function ProcessSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-paper text-ink">
      <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#376775]">
              One durable route
            </p>
            <h2 className="font-display mt-5 max-w-lg text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl">
              The plan can change. The evidence stays attached.
            </h2>
          </div>

          <ol className="border-t border-ink/20">
            {productPrinciples.map((principle, index) => (
              <li
                key={principle.label}
                className="grid gap-3 border-b border-ink/20 py-7 sm:grid-cols-[48px_130px_1fr] sm:gap-5"
              >
                <span className="font-mono text-xs text-[#58707a]">0{index + 1}</span>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#376775]">
                  {principle.label}
                </p>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.025em]">
                    {principle.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#415463]">
                    {principle.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
