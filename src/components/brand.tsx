import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex min-h-10 items-center gap-2.5 text-paper no-underline",
        className,
      )}
      aria-label="Morphic home"
    >
      <Image
        src="/brand/morphic-mark.png"
        width={32}
        height={32}
        alt=""
        priority
        className="size-8 object-contain transition-transform duration-200 group-hover:-rotate-6"
      />
      {!compact && (
        <span className="font-display text-[16px] font-semibold tracking-[-0.035em]">
          Morphic
        </span>
      )}
    </Link>
  );
}
