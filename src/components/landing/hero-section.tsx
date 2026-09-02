import { EvidenceRoute } from "@/components/landing/evidence-route";
import { HeroCopy } from "@/components/landing/hero-copy";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[minmax(0,.95fr)_minmax(460px,1.05fr)] lg:items-center lg:gap-16 lg:pb-32 lg:pt-28">
        <HeroCopy />
        <EvidenceRoute />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-evidence/45 to-transparent"
      />
    </section>
  );
}
