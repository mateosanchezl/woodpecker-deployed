"use client";

import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { resolveBoardTheme } from "@/lib/chess/board-themes";
import {
  applyReviewResultToQueueResponse,
} from "@/lib/training/review-queue";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock3,
  ListFilter,
  RefreshCw,
  Target,
} from "lucide-react";
import type {
  ReviewPatchResponse,
  ReviewPuzzle,
  ReviewResponse,
} from "@/app/api/training/review/route";

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

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface ReviewMutationVariables {
  puzzleInSetId: string;
  isCorrect: boolean;
}

/**
 * Review page: a queue-first surface for resolving pending review puzzles.
 */
export default function ReviewPage() {
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  const [resolvedPuzzle, setResolvedPuzzle] = useState<ReviewPuzzle | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const reviewQueryKey = useMemo(
    () => ["review-puzzles", selectedTheme] as const,
    [selectedTheme],
  );

  const { data, isLoading, error, refetch } = useQuery<ReviewResponse>({
    queryKey: reviewQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedTheme) params.set("theme", selectedTheme);

      const res = await fetch(`/api/training/review?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch review puzzles");
      return res.json() as Promise<ReviewResponse>;
    },
  });

  const reviewResultMutation = useMutation<
    ReviewPatchResponse,
    Error,
    ReviewMutationVariables
  >({
    mutationFn: async (payload) => {
      const res = await fetch("/api/training/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Failed to update review queue");
      }

      return res.json() as Promise<ReviewPatchResponse>;
    },
    onSuccess: (result) => {
      queryClient.setQueriesData<ReviewResponse>(
        { queryKey: ["review-puzzles"] },
        (current) =>
          current
            ? applyReviewResultToQueueResponse(
                current,
                result.puzzleInSetId,
                result.isCorrect,
                result.reviewedAt,
              )
            : current,
      );
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || "Failed to update review queue");
    },
  });

  const effectiveSelectedPuzzleId = useMemo(() => {
    const selectedPuzzleIsLoaded = data?.puzzles.some(
      (puzzle) => puzzle.puzzleInSetId === selectedPuzzleId,
    );
    const selectedPuzzleHasSnapshot =
      resolvedPuzzle?.puzzleInSetId === selectedPuzzleId;

    if (selectedPuzzleId) {
      if (selectedPuzzleIsLoaded || selectedPuzzleHasSnapshot) {
        return selectedPuzzleId;
      }
    }

    return data?.puzzles[0]?.puzzleInSetId ?? null;
  }, [data, resolvedPuzzle, selectedPuzzleId]);

  const selectedPuzzle = useMemo(
    () =>
      data?.puzzles.find(
        (puzzle) => puzzle.puzzleInSetId === effectiveSelectedPuzzleId,
      ) ?? null,
    [data, effectiveSelectedPuzzleId],
  );

  const displayedPuzzle =
    selectedPuzzle ??
    (resolvedPuzzle?.puzzleInSetId === effectiveSelectedPuzzleId
      ? resolvedPuzzle
      : null);

  const selectedPuzzleIndex = useMemo(() => {
    if (!data?.puzzles || !effectiveSelectedPuzzleId) return -1;

    return data.puzzles.findIndex(
      (puzzle) => puzzle.puzzleInSetId === effectiveSelectedPuzzleId,
    );
  }, [data, effectiveSelectedPuzzleId]);

  const nextReviewPuzzle = useMemo(() => {
    if (!data?.puzzles.length || !displayedPuzzle) return null;

    return (
      data.puzzles.find(
        (puzzle) => puzzle.puzzleInSetId !== displayedPuzzle.puzzleInSetId,
      ) ?? null
    );
  }, [data, displayedPuzzle]);

  const boardTheme = resolveBoardTheme(data?.boardTheme);

  const handleSelectPuzzle = useCallback((puzzle: ReviewPuzzle) => {
    setResolvedPuzzle(null);
    setSelectedPuzzleId(puzzle.puzzleInSetId);
    setIsPickerOpen(false);
  }, []);

  const handleThemeChange = useCallback((theme: string | null) => {
    setSelectedTheme(theme);
    setSelectedPuzzleId(null);
    setResolvedPuzzle(null);
  }, []);

  const handlePuzzleComplete = useCallback(
    (isCorrect: boolean) => {
      if (!displayedPuzzle) return;

      setSelectedPuzzleId(displayedPuzzle.puzzleInSetId);
      if (isCorrect) {
        setResolvedPuzzle(displayedPuzzle);
      }

      reviewResultMutation.mutate({
        puzzleInSetId: displayedPuzzle.puzzleInSetId,
        isCorrect,
      });
    },
    [displayedPuzzle, reviewResultMutation],
  );

  const handleNextPuzzle = useCallback(() => {
    setResolvedPuzzle(null);

    if (nextReviewPuzzle) {
      setSelectedPuzzleId(nextReviewPuzzle.puzzleInSetId);
      return;
    }

    setSelectedPuzzleId(null);
  }, [nextReviewPuzzle]);

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

  if (!data || (data.totalPendingPuzzles === 0 && !displayedPuzzle)) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-6 p-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Review queue cleared
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Missed or skipped training puzzles will appear here automatically.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/training">
            <ArrowLeft className="h-4 w-4" />
            Back to Training
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-5 p-4 lg:p-6">
          <div className="rounded-lg border bg-background px-4 py-4 shadow-sm sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Target className="h-4 w-4" />
                  </span>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Review
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{data.totalPendingPuzzles} pending</span>
                  {selectedTheme && (
                    <>
                      <span className="text-border">/</span>
                      <span>
                        {data.filteredPendingPuzzles} {formatTheme(selectedTheme)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setIsPickerOpen(true)}
                >
                  <ListFilter className="mr-2 h-4 w-4" />
                  Queue
                  <Badge variant="secondary" className="ml-1">
                    {data.filteredPendingPuzzles}
                  </Badge>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/training">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Training
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
            <main className="min-w-0 space-y-4">
              {displayedPuzzle ? (
                <>
                  <ReviewContextStrip
                    puzzle={displayedPuzzle}
                    queuePosition={
                      selectedPuzzleIndex >= 0 ? selectedPuzzleIndex + 1 : null
                    }
                    visibleCount={data.puzzles.length}
                  />

                  <ReviewPuzzleBoard
                  key={displayedPuzzle.puzzleInSetId}
                  fen={displayedPuzzle.puzzle.fen}
                  moves={displayedPuzzle.puzzle.moves}
                  themes={displayedPuzzle.puzzle.themes}
                  boardTheme={boardTheme}
                    canGoToNextPuzzle={Boolean(nextReviewPuzzle)}
                    isSavingResult={reviewResultMutation.isPending}
                    onNextPuzzle={handleNextPuzzle}
                    onComplete={handlePuzzleComplete}
                  />
                </>
              ) : (
                <Card className="min-h-[520px] items-center justify-center rounded-lg py-0 shadow-sm">
                  <CardContent className="flex max-w-md flex-col items-center justify-center py-12 text-center">
                    <Brain className="mb-4 h-12 w-12 text-primary/45" />
                    <p className="font-medium">
                      No review puzzles match this filter
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Clear the theme filter to return to the full review queue.
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
            </main>

            <aside className="hidden lg:block">
              <div className="sticky top-4 flex max-h-[calc(100vh-5rem)] flex-col gap-4">
                <ReviewSelectionPanel
                  puzzles={data.puzzles}
                  totalPendingPuzzles={data.totalPendingPuzzles}
                  filteredPendingPuzzles={data.filteredPendingPuzzles}
                  selectedPuzzleId={selectedPuzzle?.puzzleInSetId ?? null}
                  selectedTheme={selectedTheme}
                  onSelectTheme={handleThemeChange}
                  onSelectPuzzle={handleSelectPuzzle}
                  facets={data.themeFacets}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Sheet open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] rounded-t-[24px] border-border/60"
        >
          <SheetHeader className="pb-2 pr-12">
            <SheetTitle>Review Queue</SheetTitle>
            <SheetDescription>
              {data.filteredPendingPuzzles} shown, {data.totalPendingPuzzles} pending.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            <ReviewSelectionPanel
              puzzles={data.puzzles}
              totalPendingPuzzles={data.totalPendingPuzzles}
              filteredPendingPuzzles={data.filteredPendingPuzzles}
              selectedPuzzleId={selectedPuzzle?.puzzleInSetId ?? null}
              selectedTheme={selectedTheme}
              onSelectTheme={handleThemeChange}
              onSelectPuzzle={handleSelectPuzzle}
              facets={data.themeFacets}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function ReviewContextStrip({
  puzzle,
  queuePosition,
  visibleCount,
}: {
  puzzle: ReviewPuzzle;
  queuePosition: number | null;
  visibleCount: number;
}) {
  const topThemes = puzzle.puzzle.themes.slice(0, 4);
  const accuracyWidth = `${Math.max(4, Math.min(100, puzzle.successRate))}%`;

  return (
    <div className="mx-auto w-full max-w-[760px] rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
              <Target className="h-3.5 w-3.5" />
              <span className="font-mono">{puzzle.puzzle.rating}</span>
            </Badge>
            {queuePosition ? (
              <Badge variant="outline" className="px-2.5 py-1">
                {queuePosition} of {visibleCount}
              </Badge>
            ) : (
              <Badge variant="secondary" className="px-2.5 py-1">
                Solved
              </Badge>
            )}
            <span className="truncate text-sm font-medium">
              {puzzle.puzzleSetName} · position {puzzle.position}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {topThemes.map((theme) => (
              <span
                key={theme}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {formatTheme(theme)}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[180px_1fr] md:w-[420px]">
          <div className="rounded-lg border bg-muted/25 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Accuracy</span>
              <span>{puzzle.successRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: accuracyWidth }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="rounded-lg border bg-muted/25 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Last seen</span>
              </div>
              <div className="mt-1 font-medium text-foreground">
                {timeAgo(puzzle.lastAttemptAt)}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/25 px-3 py-2">
              <div>Review count</div>
              <div className="mt-1 font-medium text-foreground">
                {puzzle.reviewCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSelectionPanel({
  puzzles,
  totalPendingPuzzles,
  filteredPendingPuzzles,
  selectedPuzzleId,
  selectedTheme,
  onSelectTheme,
  onSelectPuzzle,
  facets,
}: {
  puzzles: ReviewPuzzle[];
  totalPendingPuzzles: number;
  filteredPendingPuzzles: number;
  selectedPuzzleId: string | null;
  selectedTheme: string | null;
  onSelectTheme: (theme: string | null) => void;
  onSelectPuzzle: (puzzle: ReviewPuzzle) => void;
  facets: ReviewResponse["themeFacets"];
}) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-lg py-0 shadow-sm">
      <CardHeader className="border-b border-border/60 px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Queue</CardTitle>
            <CardDescription>
              {selectedTheme
                ? `${filteredPendingPuzzles} shown`
                : `${totalPendingPuzzles} pending`}
            </CardDescription>
          </div>
          <div className="rounded-lg bg-primary/10 px-3 py-2 text-right">
            <div className="text-lg font-semibold leading-none text-primary">
              {filteredPendingPuzzles}
            </div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-primary/70">
              Ready
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-5">
        <ThemeWeaknessChips
          facets={facets}
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
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 p-4 lg:p-6">
        <Skeleton className="h-[100px] w-full rounded-lg" />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            <Skeleton className="h-[116px] w-full rounded-lg" />
            <Skeleton className="mx-auto aspect-square w-full max-w-[760px] rounded-lg" />
            <Skeleton className="mx-auto h-[156px] w-full max-w-[760px] rounded-lg" />
          </div>

          <div className="hidden lg:block">
            <Skeleton className="h-[640px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
