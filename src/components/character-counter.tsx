import { cn } from "@/lib/utils";

export function CharacterCounter({
  current,
  maximum,
  label,
}: {
  current: number;
  maximum: number;
  label: string;
}) {
  const remaining = Math.max(0, maximum - current);
  const nearingLimit = remaining <= Math.ceil(maximum * 0.1);

  return (
    <output
      aria-label={`${label}: ${remaining} characters remaining`}
      className={cn(
        "font-mono text-[10px] tabular-nums text-muted",
        nearingLimit && "text-amber",
      )}
    >
      {remaining} characters remaining
    </output>
  );
}
