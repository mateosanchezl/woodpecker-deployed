"use client";

import type { ThemeFacet } from "@/app/api/training/review/route";
import { cn } from "@/lib/utils";

function formatTheme(theme: string): string {
  return theme
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

interface ThemeWeaknessChipsProps {
  facets: ThemeFacet[];
  selectedTheme: string | null;
  onSelectTheme: (theme: string | null) => void;
}

/**
 * Displays the user's weakest themes as interactive filter chips.
 * Clicking a chip filters the review puzzle list to that theme.
 */
export function ThemeWeaknessChips({
  facets,
  selectedTheme,
  onSelectTheme,
}: ThemeWeaknessChipsProps) {
  if (facets.length === 0) return null;

  const topFacets = facets.slice(0, 12);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Themes
        </p>
        {selectedTheme && (
          <button
            onClick={() => onSelectTheme(null)}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onSelectTheme(null)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            selectedTheme === null
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent/40 hover:text-foreground",
          )}
        >
          All
        </button>

        {topFacets.map((facet) => {
          const isSelected = selectedTheme === facet.theme;

          return (
            <button
              key={facet.theme}
              onClick={() => onSelectTheme(isSelected ? null : facet.theme)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <span>{formatTheme(facet.theme)}</span>
              <span className={cn("ml-1 opacity-70", isSelected && "opacity-90")}>
                {facet.pendingCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
