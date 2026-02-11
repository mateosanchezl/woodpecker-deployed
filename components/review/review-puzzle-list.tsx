"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import type { ReviewPuzzle } from "@/app/api/training/review/route";

// Theme badge colors
const THEME_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
];

function getThemeColor(theme: string): string {
  let hash = 0;
  for (let i = 0; i < theme.length; i++) {
    hash = theme.charCodeAt(i) + ((hash << 5) - hash);
  }
  return THEME_COLORS[Math.abs(hash) % THEME_COLORS.length];
}

function formatTheme(theme: string): string {
  return theme
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface ReviewPuzzleListProps {
  puzzles: ReviewPuzzle[];
  selectedPuzzleId: string | null;
  onSelectPuzzle: (puzzle: ReviewPuzzle) => void;
}

/**
 * Scrollable list of struggled puzzles with key stats.
 * Clicking a puzzle loads it into the review board.
 */
export function ReviewPuzzleList({
  puzzles,
  selectedPuzzleId,
  onSelectPuzzle,
}: ReviewPuzzleListProps) {
  if (puzzles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No struggled puzzles found matching your filters.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Try clearing the theme filter or keep training!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {puzzles.map((puzzle) => {
        const isSelected = selectedPuzzleId === puzzle.puzzleInSetId;
        const successColor =
          puzzle.successRate >= 50 ? "text-amber-600" : "text-rose-600";

        return (
          <button
            key={puzzle.puzzleInSetId}
            onClick={() => onSelectPuzzle(puzzle)}
            className={`w-full text-left transition-all rounded-lg border p-3 ${
              isSelected
                ? "border-foreground/20 bg-accent shadow-sm"
                : "border-border hover:border-foreground/10 hover:bg-accent/50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-sm font-medium">
                    {puzzle.puzzle.rating}
                  </span>
                  <span
                    className={`font-mono text-xs font-medium ${successColor}`}
                  >
                    {puzzle.successRate}%
                    <span className="text-muted-foreground ml-0.5">
                      ({puzzle.correctAttempts}/{puzzle.totalAttempts})
                    </span>
                  </span>
                  {puzzle.lastAttemptAt && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {timeAgo(puzzle.lastAttemptAt)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {puzzle.puzzle.themes.slice(0, 3).map((theme) => (
                    <span
                      key={theme}
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${getThemeColor(theme)}`}
                    >
                      {formatTheme(theme)}
                    </span>
                  ))}
                  {puzzle.puzzle.themes.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{puzzle.puzzle.themes.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
