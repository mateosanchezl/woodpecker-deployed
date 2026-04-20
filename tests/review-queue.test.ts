import assert from "node:assert/strict";
import test from "node:test";
import {
  applyReviewResultToQueueResponse,
  shouldSeedReviewQueueItem,
  sortReviewQueueItems,
  type ReviewQueueOrderingFields,
} from "@/lib/training/review-queue";

function item(
  puzzleInSetId: string,
  overrides: Partial<ReviewQueueOrderingFields> = {},
): ReviewQueueOrderingFields {
  return {
    puzzleInSetId,
    queuedAt: "2026-04-01T09:00:00.000Z",
    lastReviewedAt: null,
    reviewCount: 0,
    ...overrides,
  };
}

test("sortReviewQueueItems orders untouched items first and uses queuedAt then id as tie-breakers", () => {
  const sorted = sortReviewQueueItems([
    item("reviewed-b", {
      queuedAt: "2026-04-01T07:00:00.000Z",
      lastReviewedAt: "2026-04-02T10:00:00.000Z",
      reviewCount: 1,
    }),
    item("untouched-b", { queuedAt: "2026-04-01T10:00:00.000Z" }),
    item("reviewed-a", {
      queuedAt: "2026-04-01T07:00:00.000Z",
      lastReviewedAt: "2026-04-02T10:00:00.000Z",
      reviewCount: 1,
    }),
    item("untouched-a", { queuedAt: "2026-04-01T08:00:00.000Z" }),
  ]);

  assert.deepEqual(
    sorted.map((entry) => entry.puzzleInSetId),
    ["untouched-a", "untouched-b", "reviewed-a", "reviewed-b"],
  );
});

test("applyReviewResultToQueueResponse removes correctly solved items immediately", () => {
  const response = {
    puzzles: [item("a"), item("b")],
    totalPendingPuzzles: 2,
    filteredPendingPuzzles: 2,
  };

  const next = applyReviewResultToQueueResponse(response, "a", true);

  assert.deepEqual(next.puzzles.map((entry) => entry.puzzleInSetId), ["b"]);
  assert.equal(next.totalPendingPuzzles, 1);
  assert.equal(next.filteredPendingPuzzles, 1);
});

test("applyReviewResultToQueueResponse updates review state and reorders pending items for resume", () => {
  const response = {
    puzzles: [
      item("untouched-a", { queuedAt: "2026-04-01T08:00:00.000Z" }),
      item("untouched-b", { queuedAt: "2026-04-01T09:00:00.000Z" }),
      item("reviewed-c", {
        queuedAt: "2026-04-01T07:00:00.000Z",
        lastReviewedAt: "2026-04-02T08:00:00.000Z",
        reviewCount: 1,
      }),
    ],
    totalPendingPuzzles: 3,
    filteredPendingPuzzles: 3,
  };

  const next = applyReviewResultToQueueResponse(
    response,
    "untouched-a",
    false,
    "2026-04-02T11:00:00.000Z",
  );

  assert.deepEqual(
    next.puzzles.map((entry) => entry.puzzleInSetId),
    ["untouched-b", "reviewed-c", "untouched-a"],
  );
  assert.equal(next.puzzles[2]?.reviewCount, 1);
  assert.equal(next.puzzles[2]?.lastReviewedAt, "2026-04-02T11:00:00.000Z");
});

test("shouldSeedReviewQueueItem only backfills unresolved latest failures", () => {
  assert.equal(
    shouldSeedReviewQueueItem({
      totalAttempts: 3,
      correctAttempts: 1,
      lastAttemptIsCorrect: false,
    }),
    true,
  );

  assert.equal(
    shouldSeedReviewQueueItem({
      totalAttempts: 3,
      correctAttempts: 1,
      lastAttemptIsCorrect: true,
    }),
    false,
  );

  assert.equal(
    shouldSeedReviewQueueItem({
      totalAttempts: 0,
      correctAttempts: 0,
      lastAttemptIsCorrect: null,
    }),
    false,
  );

  assert.equal(
    shouldSeedReviewQueueItem({
      totalAttempts: 2,
      correctAttempts: 2,
      lastAttemptIsCorrect: false,
    }),
    false,
  );
});
