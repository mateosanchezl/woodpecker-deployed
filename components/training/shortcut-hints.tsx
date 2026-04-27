import { cn } from "@/lib/utils";

export function ShortcutHints({
  keys,
  className,
}: {
  keys: readonly string[];
  className?: string;
}) {
  return (
    <span className={cn("ml-1 inline-flex items-center gap-1", className)}>
      {keys.map((key) => (
        <kbd
          key={key}
          className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-muted-foreground shadow-sm"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
