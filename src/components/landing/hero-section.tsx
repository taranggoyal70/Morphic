import { EvidenceRoute } from "@/components/landing/evidence-route";
import { HeroCopy } from "@/components/landing/hero-copy";

export function HeroSection() {
  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-[1440px] border-x border-line">
        <div className="grid lg:grid-cols-[88px_minmax(0,1fr)]">
          <div
            aria-hidden="true"
            className="hidden border-r border-line bg-surface lg:flex lg:items-center lg:justify-center"
          >
            <p className="rotate-180 [writing-mode:vertical-rl] font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Repository facts · visible decisions · approved execution
            </p>
          </div>
          <div className="min-w-0">
            <HeroCopy />
            <EvidenceRoute />
          </div>
        </div>
      </div>
    </section>
  );
}
