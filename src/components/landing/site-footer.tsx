import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="bg-paper px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 border-t border-ink/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
        <Brand className="text-ink" />
        <p className="max-w-lg text-sm leading-6 text-[#516474]">
          Adaptive software delivery grounded in GitHub evidence and explicit
          human approval.
        </p>
        <a
          href="https://github.com/taranggoyal70/Morphic"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
        >
          GitHub source
        </a>
      </div>
    </footer>
  );
}
