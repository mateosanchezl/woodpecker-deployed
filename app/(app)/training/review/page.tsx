"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReviewPuzzleBoard } from "@/components/review/review-puzzle-board";
import { ReviewPuzzleList } from "@/components/review/review-puzzle-list";
import { ThemeWeaknessChips } from "@/components/review/theme-weakness-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Brain, ArrowLeft } from "lucide-react";
import type {
  ReviewPuzzle,
  ReviewResponse,
} from "@/app/api/training/review/route";
import Link from "next/link";

/**
 * Review page — focused practice on the user's weakest puzzles.
 * Fetches puzzles sorted by worst success rate + staleness,
 * lets users filter by theme, solve interactively, and view solutions.
 */
export default function ReviewPage() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedPuzzle, setSelectedPuzzle] = useState<ReviewPuzzle | null>(
    null,
  );

  // Fetch review puzzles
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

  const handleSelectPuzzle = useCallback((puzzle: ReviewPuzzle) => {
    setSelectedPuzzle(puzzle);
  }, []);

  const handleThemeChange = useCallback((theme: string | null) => {
    setSelectedTheme(theme);
    setSelectedPuzzle(null); // Reset selection when filter changes
  }, []);

  const handlePuzzleComplete = useCallback(() => {
    // XP is awarded through the normal attempt flow if the user is in a cycle.
    // For standalone review, we just let them keep practicing.
  }, []);

  // Move to next puzzle in list
  const handleNextPuzzle = useCallback(() => {
    if (!data?.puzzles || !selectedPuzzle) return;

    const currentIndex = data.puzzles.findIndex(
      (p) => p.puzzleInSetId === selectedPuzzle.puzzleInSetId,
    );
    if (currentIndex < data.puzzles.length - 1) {
      setSelectedPuzzle(data.puzzles[currentIndex + 1]);
    }
  }, [data, selectedPuzzle]);

  // Loading state
  if (isLoading) {
    return <ReviewPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load review puzzles</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // No data / no struggled puzzles at all
  if (!data || data.totalStruggledPuzzles === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4 p-4">
        <Brain className="h-12 w-12 text-green-600" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">Nothing to review yet!</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Keep training — puzzles you struggle with will appear here for
            focused practice.
          </p>
        </div>
        <Link href="/training">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Improvement Area
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data.totalStruggledPuzzles} puzzle
            {data.totalStruggledPuzzles !== 1 ? "s" : ""} to review — sorted by
            difficulty for you
          </p>
        </div>
        <Link href="/training">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Training
          </Button>
        </Link>
      </div>

      {/* Theme weakness chips */}
      <ThemeWeaknessChips
        weaknesses={data.themeWeaknesses}
        selectedTheme={selectedTheme}
        onSelectTheme={handleThemeChange}
      />

      {/* Main content: puzzle list + board */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Puzzle list (scrollable on left) */}
        <div className="lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto lg:pr-2">
          <ReviewPuzzleList
            puzzles={data.puzzles}
            selectedPuzzleId={selectedPuzzle?.puzzleInSetId ?? null}
            onSelectPuzzle={handleSelectPuzzle}
          />
        </div>

        {/* Board area */}
        <div className="min-h-100">
          {selectedPuzzle ? (
            <div className="flex flex-col gap-4">
              <ReviewPuzzleBoard
                key={selectedPuzzle.puzzleInSetId}
                fen={selectedPuzzle.puzzle.fen}
                moves={selectedPuzzle.puzzle.moves}
                puzzleRating={selectedPuzzle.puzzle.rating}
                themes={selectedPuzzle.puzzle.themes}
                successRate={selectedPuzzle.successRate}
                totalAttempts={selectedPuzzle.totalAttempts}
                correctAttempts={selectedPuzzle.correctAttempts}
                onComplete={handlePuzzleComplete}
              />

              {/* Next puzzle button */}
              {data.puzzles.findIndex(
                (p) => p.puzzleInSetId === selectedPuzzle.puzzleInSetId,
              ) <
                data.puzzles.length - 1 && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={handleNextPuzzle}>
                    Next Puzzle →
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="h-full min-h-100 flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  Select a puzzle from the list to start reviewing
                </p>
                <p className="text-muted-foreground/60 text-sm mt-1">
                  Puzzles are ordered by difficulty — your weakest first
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      <Skeleton className="h-24 w-full rounded-lg" />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-125 w-full rounded-lg" />
      </div>
    </div>
  );
}
