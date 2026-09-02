import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FinalCta } from "@/components/landing/final-cta";
import { HeroSection } from "@/components/landing/hero-section";
import { ProcessSection } from "@/components/landing/process-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata: Metadata = {
  title: "Morphic — Repository evidence to reviewable pull request",
  description:
    "Turn a software objective into an adaptive workspace grounded in live GitHub evidence, explicit decisions, and approved Codex execution.",
};

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/workspaces");

  return (
    <div className="min-h-screen bg-ink">
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <ProcessSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
