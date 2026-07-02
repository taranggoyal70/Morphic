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
        "inline-flex items-center gap-2 text-paper no-underline",
        className,
      )}
      aria-label="Morphic home"
    >
      <Image
        src="/brand/morphic-mark.png"
        width={30}
        height={30}
        alt=""
        priority
        className="size-7 object-contain"
      />
      {!compact && (
        <span className="text-[15px] font-semibold tracking-[-0.02em]">
          Morphic
        </span>
      )}
    </Link>
  );
}
