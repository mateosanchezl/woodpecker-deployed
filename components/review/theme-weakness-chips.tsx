"use client";

import type { ThemeWeakness } from "@/app/api/training/review/route";
import { cn } from "@/lib/utils";

function formatTheme(theme: string): string {
  return theme
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

interface ThemeWeaknessChipsProps {
  weaknesses: ThemeWeakness[];
  selectedTheme: string | null;
  onSelectTheme: (theme: string | null) => void;
}

/**
 * Displays the user's weakest themes as interactive filter chips.
 * Clicking a chip filters the review puzzle list to that theme.
 */
export function ThemeWeaknessChips({
  weaknesses,
  selectedTheme,
  onSelectTheme,
}: ThemeWeaknessChipsProps) {
  if (weaknesses.length === 0) return null;

  const topWeaknesses = weaknesses.slice(0, 8);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Filter by theme
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectTheme(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            selectedTheme === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
          )}
        >
          All
        </button>

        {topWeaknesses.map((weakness) => {
          const isSelected = selectedTheme === weakness.theme;

          return (
            <button
              key={weakness.theme}
              onClick={() => onSelectTheme(isSelected ? null : weakness.theme)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {formatTheme(weakness.theme)} {weakness.accuracy}%
            </button>
          );
        })}
      </div>
    </div>
  );
}
