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

export const DEFAULT_REVIEW_QUEUE_LIMIT = 30;
export const MAX_REVIEW_QUEUE_LIMIT = 50;

export function normalizeReviewQueueLimit(value: string | null): number {
  if (!value) return DEFAULT_REVIEW_QUEUE_LIMIT;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_REVIEW_QUEUE_LIMIT;
  }

  return Math.min(parsed, MAX_REVIEW_QUEUE_LIMIT);
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

export function applyReviewResultToQueueResponse<
  TItem extends ReviewQueueOrderingFields,
  TResponse extends ReviewQueueResponseShape<TItem>,
>(
  response: TResponse,
  puzzleInSetId: string,
  isCorrect: boolean,
  reviewedAt: string | Date = new Date(),
): TResponse {
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
    } as TResponse;
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
  } as TResponse;
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
