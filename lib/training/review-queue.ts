export interface ReviewQueueOrderingFields {
  puzzleInSetId: string;
  queuedAt: string | Date;
  lastReviewedAt: string | Date | null;
  reviewCount: number;
}

export interface ReviewQueueResponseShape<TItem extends ReviewQueueOrderingFields> {
  puzzles: TItem[];
  totalPendingPuzzles: number;
  filteredPendingPuzzles: number;
}

function toTimestamp(value: string | Date | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  return new Date(value).getTime();
}

function compareNullableTimestamps(
  a: string | Date | null,
  b: string | Date | null,
): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return toTimestamp(a) - toTimestamp(b);
}

export function compareReviewQueueItems(
  a: ReviewQueueOrderingFields,
  b: ReviewQueueOrderingFields,
): number {
  const reviewedDelta = compareNullableTimestamps(
    a.lastReviewedAt,
    b.lastReviewedAt,
  );
  if (reviewedDelta !== 0) {
    return reviewedDelta;
  }

  const queuedDelta = toTimestamp(a.queuedAt) - toTimestamp(b.queuedAt);
  if (queuedDelta !== 0) {
    return queuedDelta;
  }

  return a.puzzleInSetId.localeCompare(b.puzzleInSetId);
}

export function sortReviewQueueItems<TItem extends ReviewQueueOrderingFields>(
  items: readonly TItem[],
): TItem[] {
  return [...items].sort(compareReviewQueueItems);
}

export function applyReviewResultToQueueResponse<TItem extends ReviewQueueOrderingFields>(
  response: ReviewQueueResponseShape<TItem>,
  puzzleInSetId: string,
  isCorrect: boolean,
  reviewedAt: string | Date = new Date(),
): ReviewQueueResponseShape<TItem> {
  const existingIndex = response.puzzles.findIndex(
    (puzzle) => puzzle.puzzleInSetId === puzzleInSetId,
  );

  if (existingIndex === -1) {
    return response;
  }

  if (isCorrect) {
    return {
      ...response,
      puzzles: response.puzzles.filter(
        (puzzle) => puzzle.puzzleInSetId !== puzzleInSetId,
      ),
      totalPendingPuzzles: Math.max(0, response.totalPendingPuzzles - 1),
      filteredPendingPuzzles: Math.max(0, response.filteredPendingPuzzles - 1),
    };
  }

  return {
    ...response,
    puzzles: sortReviewQueueItems(
      response.puzzles.map((puzzle) =>
        puzzle.puzzleInSetId === puzzleInSetId
          ? {
              ...puzzle,
              lastReviewedAt: reviewedAt,
              reviewCount: puzzle.reviewCount + 1,
            }
          : puzzle,
      ),
    ),
  };
}

export function shouldSeedReviewQueueItem(params: {
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptIsCorrect: boolean | null;
}): boolean {
  return (
    params.totalAttempts > 0 &&
    params.correctAttempts < params.totalAttempts &&
    params.lastAttemptIsCorrect === false
  );
}
