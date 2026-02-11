"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import type { ThemeWeakness } from "@/app/api/training/review/route";

// Theme badge colors for visual variety
const WEAKNESS_COLORS = [
  "bg-rose-100 text-rose-700 hover:bg-rose-200",
  "bg-amber-100 text-amber-700 hover:bg-amber-200",
  "bg-orange-100 text-orange-700 hover:bg-orange-200",
  "bg-violet-100 text-violet-700 hover:bg-violet-200",
  "bg-sky-100 text-sky-700 hover:bg-sky-200",
];

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="rounded-lg bg-rose-100 p-1.5">
            <Target className="h-4 w-4 text-rose-600" />
          </div>
          Weakest Themes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click a theme to filter puzzles
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {selectedTheme && (
            <button
              onClick={() => onSelectTheme(null)}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Clear filter ✕
            </button>
          )}
          {topWeaknesses.map((weakness, index) => {
            const isSelected = selectedTheme === weakness.theme;
            const colorClass = WEAKNESS_COLORS[index % WEAKNESS_COLORS.length];

            return (
              <button
                key={weakness.theme}
                onClick={() =>
                  onSelectTheme(isSelected ? null : weakness.theme)
                }
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-offset-1 ring-foreground/30 " + colorClass
                    : colorClass
                }`}
              >
                {formatTheme(weakness.theme)}
                <span className="ml-1.5 opacity-70">{weakness.accuracy}%</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
