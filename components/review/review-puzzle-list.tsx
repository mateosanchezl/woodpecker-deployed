"use client";

import { ChevronRight, Clock3, Target } from "lucide-react";
import type { ReviewPuzzle } from "@/app/api/training/review/route";
import { cn } from "@/lib/utils";

function formatTheme(theme: string): string {
  return theme
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";

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
    <div className="space-y-2.5">
      {puzzles.map((puzzle, index) => {
        const isSelected = selectedPuzzleId === puzzle.puzzleInSetId;
        const accuracyWidth = `${Math.max(4, Math.min(100, puzzle.successRate))}%`;

        return (
          <button
            key={puzzle.puzzleInSetId}
            onClick={() => onSelectPuzzle(puzzle)}
            className={cn(
              "group relative min-h-[132px] w-full overflow-hidden rounded-lg border bg-card p-3 text-left shadow-sm transition-all",
              "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
              isSelected &&
                "border-primary/45 bg-primary/[0.035] ring-1 ring-primary/15",
            )}
          >
            <div
              className={cn(
                "absolute inset-y-3 left-0 w-1 rounded-r-full bg-border transition-colors",
                isSelected && "bg-primary",
              )}
            />

            <div className="flex h-full items-start gap-3 pl-1.5">
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        <span className="font-mono">{puzzle.puzzle.rating}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {puzzle.puzzleSetName} · position {puzzle.position}
                      </div>
                    </div>
                    {puzzle.reviewCount > 0 && (
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {puzzle.reviewCount}x
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: accuracyWidth }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{puzzle.successRate}% accuracy</span>
                      <span>{puzzle.correctAttempts}/{puzzle.totalAttempts}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {puzzle.puzzle.themes.slice(0, 2).map((theme) => (
                      <span
                        key={theme}
                        className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {formatTheme(theme)}
                      </span>
                    ))}
                    {puzzle.puzzle.themes.length > 2 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        +{puzzle.puzzle.themes.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    <span>{timeAgo(puzzle.lastAttemptAt)}</span>
                  </div>
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
