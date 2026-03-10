"use client";

import { ChevronRight } from "lucide-react";
import type { ReviewPuzzle } from "@/app/api/training/review/route";
import { cn } from "@/lib/utils";

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
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
        <p className="text-sm font-medium">No puzzles match this filter.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Clear the theme filter or keep training to add more review material.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {puzzles.map((puzzle, index) => {
        const isSelected = selectedPuzzleId === puzzle.puzzleInSetId;
        const successToneClass =
          puzzle.successRate >= 50
            ? "text-amber-700 dark:text-amber-300"
            : "text-rose-700 dark:text-rose-300";

        return (
          <button
            key={puzzle.puzzleInSetId}
            onClick={() => onSelectPuzzle(puzzle)}
            className={cn(
              "group w-full rounded-xl border bg-card/90 p-3 text-left transition-all",
              "hover:border-primary/30 hover:bg-accent/10",
              isSelected &&
                "border-primary/45 bg-accent/20 ring-1 ring-primary/15",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono font-medium">
                    {puzzle.puzzle.rating}
                  </span>
                  <span className={cn("font-medium", successToneClass)}>
                    {puzzle.successRate}% success
                  </span>
                  <span className="text-xs text-muted-foreground">
                    #{index + 1}
                  </span>
                </div>

                <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  <span className="truncate">{puzzle.puzzleSetName}</span>
                  <span>{puzzle.correctAttempts}/{puzzle.totalAttempts} correct</span>
                  <span>Position {puzzle.position}</span>
                  <span>
                    {puzzle.lastAttemptAt
                      ? `Last seen ${timeAgo(puzzle.lastAttemptAt)}`
                      : "Not attempted recently"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {puzzle.puzzle.themes.slice(0, 3).map((theme) => (
                    <span key={theme}>{formatTheme(theme)}</span>
                  ))}
                  {puzzle.puzzle.themes.length > 3 && (
                    <span>+{puzzle.puzzle.themes.length - 3} more</span>
                  )}
                </div>
              </div>

              <ChevronRight
                className={cn(
                  "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5",
                  isSelected && "text-primary",
                )}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
