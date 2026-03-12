"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ReviewPuzzleBoard } from "@/components/review/review-puzzle-board";
import { ReviewPuzzleList } from "@/components/review/review-puzzle-list";
import { ThemeWeaknessChips } from "@/components/review/theme-weakness-chips";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { resolveBoardTheme } from "@/lib/chess/board-themes";
import { AlertCircle, ArrowLeft, Brain, ListFilter, RefreshCw } from "lucide-react";
import type {
  ReviewPuzzle,
  ReviewResponse,
} from "@/app/api/training/review/route";

function formatTheme(theme: string): string {
  return theme
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Review page — focused practice on the user's weakest puzzles.
 * Fetches puzzles sorted by worst success rate + staleness,
 * lets users filter by theme, solve interactively, and view solutions.
 */
export default function ReviewPage() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<ReviewResponse>({
    queryKey: ["review-puzzles", selectedTheme],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTheme) params.set("theme", selectedTheme);
      params.set("limit", "50");

      const res = await fetch(`/api/training/review?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch review puzzles");
      return res.json();
    },
  });

  const effectiveSelectedPuzzleId = useMemo(() => {
    if (!data?.puzzles.length) {
      return null;
    }

    if (
      selectedPuzzleId &&
      data.puzzles.some((puzzle) => puzzle.puzzleInSetId === selectedPuzzleId)
    ) {
      return selectedPuzzleId;
    }

    return data.puzzles[0].puzzleInSetId;
  }, [data, selectedPuzzleId]);

  const selectedPuzzle = useMemo(
    () =>
      data?.puzzles.find(
        (puzzle) => puzzle.puzzleInSetId === effectiveSelectedPuzzleId,
      ) ?? null,
    [data, effectiveSelectedPuzzleId],
  );

  const selectedPuzzleIndex = useMemo(() => {
    if (!data?.puzzles || !effectiveSelectedPuzzleId) return -1;

    return data.puzzles.findIndex(
      (puzzle) => puzzle.puzzleInSetId === effectiveSelectedPuzzleId,
    );
  }, [data, effectiveSelectedPuzzleId]);

  const boardTheme = resolveBoardTheme(data?.boardTheme);
  const hasNextPuzzle =
    selectedPuzzleIndex >= 0 &&
    !!data?.puzzles &&
    selectedPuzzleIndex < data.puzzles.length - 1;

  const handleSelectPuzzle = useCallback((puzzle: ReviewPuzzle) => {
    setSelectedPuzzleId(puzzle.puzzleInSetId);
    setIsPickerOpen(false);
  }, []);

  const handleThemeChange = useCallback((theme: string | null) => {
    setSelectedTheme(theme);
  }, []);

  const handlePuzzleComplete = useCallback(() => {
    // Standalone review does not advance server state beyond local practice flow.
  }, []);

  const handleNextPuzzle = useCallback(() => {
    if (!data?.puzzles || selectedPuzzleIndex < 0) return;

    const nextPuzzle = data.puzzles[selectedPuzzleIndex + 1];
    if (!nextPuzzle) return;

    setSelectedPuzzleId(nextPuzzle.puzzleInSetId);
  }, [data, selectedPuzzleIndex]);

  if (isLoading) {
    return <ReviewPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load review puzzles</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!data || data.totalStruggledPuzzles === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-6 p-4">
        <div className="mx-auto bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mb-2 animate-in fade-in zoom-in duration-500">
          <Brain className="h-10 w-10 text-green-600" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold tracking-tight">Nothing to review yet!</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Keep training — puzzles you struggle with will appear here for
            focused practice.
          </p>
        </div>
        <Link href="/training">
          <Button size="lg" className="rounded-xl gap-2 mt-4 shadow-sm hover:shadow-md transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Training
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Improvement Area
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {data.totalStruggledPuzzles} puzzle
              {data.totalStruggledPuzzles !== 1 ? "s" : ""} sorted by lowest
              success rate first, then by staleness.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/training">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Training
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4 lg:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {selectedPuzzle
                    ? `Puzzle ${selectedPuzzleIndex + 1} of ${data.puzzles.length}`
                    : "Choose a review puzzle"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedPuzzle
                    ? `${selectedPuzzle.puzzleSetName} • position ${selectedPuzzle.position}`
                    : "Pick a puzzle from the queue to start reviewing."}
                </p>
                {selectedTheme && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Filtered by {formatTheme(selectedTheme)}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full sm:w-auto lg:hidden"
                onClick={() => setIsPickerOpen(true)}
              >
                <ListFilter className="mr-2 h-4 w-4" />
                Queue
              </Button>
            </div>

            {selectedPuzzle ? (
              <ReviewPuzzleBoard
                key={selectedPuzzle.puzzleInSetId}
                fen={selectedPuzzle.puzzle.fen}
                moves={selectedPuzzle.puzzle.moves}
                puzzleRating={selectedPuzzle.puzzle.rating}
                themes={selectedPuzzle.puzzle.themes}
                successRate={selectedPuzzle.successRate}
                totalAttempts={selectedPuzzle.totalAttempts}
                correctAttempts={selectedPuzzle.correctAttempts}
                boardTheme={boardTheme}
                canGoToNextPuzzle={hasNextPuzzle}
                onNextPuzzle={handleNextPuzzle}
                onComplete={handlePuzzleComplete}
              />
            ) : (
              <Card className="min-h-[420px] items-center justify-center py-0">
                <CardContent className="flex max-w-md flex-col items-center justify-center py-12 text-center">
                  <Brain className="mb-4 h-12 w-12 text-muted-foreground/40" />
                  <p className="font-medium">
                    No review puzzles match this filter
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try clearing the theme filter to load the full review queue.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleThemeChange(null)}
                  >
                    Clear Filter
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-4 flex max-h-[calc(100vh-5rem)] flex-col gap-4">
              <ReviewSelectionPanel
                puzzles={data.puzzles}
                totalStruggledPuzzles={data.totalStruggledPuzzles}
                selectedPuzzleId={effectiveSelectedPuzzleId}
                selectedTheme={selectedTheme}
                onSelectTheme={handleThemeChange}
                onSelectPuzzle={handleSelectPuzzle}
                weaknesses={data.themeWeaknesses}
              />
            </div>
          </aside>
        </div>
      </div>

      <Sheet open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] rounded-t-[28px] border-border/60"
        >
          <SheetHeader className="pb-2 pr-12">
            <SheetTitle>Review Queue</SheetTitle>
            <SheetDescription>
              Pick the next puzzle and optionally narrow the queue by theme.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            <ReviewSelectionPanel
              puzzles={data.puzzles}
              totalStruggledPuzzles={data.totalStruggledPuzzles}
              selectedPuzzleId={effectiveSelectedPuzzleId}
              selectedTheme={selectedTheme}
              onSelectTheme={handleThemeChange}
              onSelectPuzzle={handleSelectPuzzle}
              weaknesses={data.themeWeaknesses}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function ReviewSelectionPanel({
  puzzles,
  totalStruggledPuzzles,
  selectedPuzzleId,
  selectedTheme,
  onSelectTheme,
  onSelectPuzzle,
  weaknesses,
}: {
  puzzles: ReviewPuzzle[];
  totalStruggledPuzzles: number;
  selectedPuzzleId: string | null;
  selectedTheme: string | null;
  onSelectTheme: (theme: string | null) => void;
  onSelectPuzzle: (puzzle: ReviewPuzzle) => void;
  weaknesses: ReviewResponse["themeWeaknesses"];
}) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
      <CardHeader className="border-b border-border/60 py-4">
        <CardTitle className="text-base">Review Queue</CardTitle>
        <CardDescription>
          {selectedTheme
            ? `Showing ${puzzles.length} ${formatTheme(selectedTheme)} puzzle${puzzles.length !== 1 ? "s" : ""}.`
            : `Showing ${puzzles.length} of ${totalStruggledPuzzles} total review puzzles.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto pt-5 pb-5">
        <ThemeWeaknessChips
          weaknesses={weaknesses}
          selectedTheme={selectedTheme}
          onSelectTheme={onSelectTheme}
        />

        <div className="border-t border-border/60 pt-4">
          <ReviewPuzzleList
            puzzles={puzzles}
            selectedPuzzleId={selectedPuzzleId}
            onSelectPuzzle={onSelectPuzzle}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewPageSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:p-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 lg:space-y-6">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-[760px] w-full rounded-3xl" />
        </div>

        <div className="hidden lg:block">
          <Skeleton className="h-[640px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
