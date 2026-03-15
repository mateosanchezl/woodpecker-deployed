import { prisma } from "@/lib/prisma";

interface SessionCycleData {
  id: string;
  puzzleSetId: string;
  cycleNumber: number;
  totalPuzzles: number;
  attemptedCount: number;
  nextPosition: number;
  solvedCorrect: number;
  solvedIncorrect: number;
  skipped: number;
  totalTime: number | null;
  completedAt: Date | null;
}

interface SessionPuzzleRecord {
  id: string;
  position: number;
  totalAttempts: number;
  correctAttempts: number;
  averageTime: number | null;
  puzzle: {
    id: string;
    fen: string;
    moves: string;
    rating: number;
    themes: string[];
  };
}

export interface TrainingSessionSnapshotRow {
  cycleId: string;
  puzzleSetId: string;
  cycleNumber: number;
  totalPuzzles: number;
  attemptedCount: number;
  nextPosition: number;
  solvedCorrect: number;
  solvedIncorrect: number;
  skipped: number;
  totalTime: number | null;
  completedAt: Date | null;
  puzzleInSetId: string | null;
  position: number | null;
  totalAttempts: number | null;
  correctAttempts: number | null;
  averageTime: number | null;
  puzzleId: string | null;
  fen: string | null;
  moves: string | null;
  rating: number | null;
  themes: string[] | null;
}

export interface SessionPuzzlePayload {
  puzzle: {
    id: string;
    fen: string;
    moves: string;
    rating: number;
    themes: string[];
  };
  puzzleInSet: {
    id: string;
    position: number;
    totalAttempts: number;
    correctAttempts: number;
    averageTime: number | null;
  };
}

export interface TrainingSessionPayload {
  current: SessionPuzzlePayload | null;
  prefetchedNext: SessionPuzzlePayload | null;
  progress: {
    currentPosition: number;
    totalPuzzles: number;
    completedInCycle: number;
    cycleNumber: number;
  };
  isCycleComplete: boolean;
  cycleStats: {
    solvedCorrect: number;
    solvedIncorrect: number;
    skipped: number;
    totalTime: number | null;
  };
}

function toSessionPuzzlePayload(
  record: SessionPuzzleRecord | null | undefined,
): SessionPuzzlePayload | null {
  if (!record) return null;

  return {
    puzzle: {
      id: record.puzzle.id,
      fen: record.puzzle.fen,
      moves: record.puzzle.moves,
      rating: record.puzzle.rating,
      themes: record.puzzle.themes,
    },
    puzzleInSet: {
      id: record.id,
      position: record.position,
      totalAttempts: record.totalAttempts,
      correctAttempts: record.correctAttempts,
      averageTime: record.averageTime,
    },
  };
}

export function buildTrainingSessionPayload(
  cycle: SessionCycleData,
  upcomingPuzzles: SessionPuzzleRecord[],
): TrainingSessionPayload {
  const computedCycleComplete =
    cycle.completedAt !== null || cycle.nextPosition > cycle.totalPuzzles;
  const isCycleComplete =
    computedCycleComplete || (!computedCycleComplete && upcomingPuzzles.length === 0);

  const current = isCycleComplete
    ? null
    : toSessionPuzzlePayload(upcomingPuzzles[0]);
  const prefetchedNext = isCycleComplete
    ? null
    : toSessionPuzzlePayload(upcomingPuzzles[1]);

  return {
    current,
    prefetchedNext,
    progress: {
      currentPosition: current?.puzzleInSet.position ?? cycle.totalPuzzles,
      totalPuzzles: cycle.totalPuzzles,
      completedInCycle: cycle.attemptedCount,
      cycleNumber: cycle.cycleNumber,
    },
    isCycleComplete,
    cycleStats: {
      solvedCorrect: cycle.solvedCorrect,
      solvedIncorrect: cycle.solvedIncorrect,
      skipped: cycle.skipped,
      totalTime: cycle.totalTime,
    },
  };
}

export function mapTrainingSessionSnapshotRows(
  rows: TrainingSessionSnapshotRow[],
): TrainingSessionPayload | null {
  if (rows.length === 0) {
    return null;
  }

  const [firstRow] = rows;
  const cycle: SessionCycleData = {
    id: firstRow.cycleId,
    puzzleSetId: firstRow.puzzleSetId,
    cycleNumber: firstRow.cycleNumber,
    totalPuzzles: firstRow.totalPuzzles,
    attemptedCount: firstRow.attemptedCount,
    nextPosition: firstRow.nextPosition,
    solvedCorrect: firstRow.solvedCorrect,
    solvedIncorrect: firstRow.solvedIncorrect,
    skipped: firstRow.skipped,
    totalTime: firstRow.totalTime,
    completedAt: firstRow.completedAt,
  };

  const upcomingPuzzles: SessionPuzzleRecord[] = rows
    .filter((row): row is TrainingSessionSnapshotRow & { puzzleInSetId: string } =>
      row.puzzleInSetId !== null,
    )
    .map((row) => ({
      id: row.puzzleInSetId,
      position: row.position ?? cycle.nextPosition,
      totalAttempts: row.totalAttempts ?? 0,
      correctAttempts: row.correctAttempts ?? 0,
      averageTime: row.averageTime,
      puzzle: {
        id: row.puzzleId ?? "",
        fen: row.fen ?? "",
        moves: row.moves ?? "",
        rating: row.rating ?? 0,
        themes: row.themes ?? [],
      },
    }));

  return buildTrainingSessionPayload(cycle, upcomingPuzzles);
}

export async function fetchTrainingSessionSnapshot(params: {
  clerkId: string;
  setId: string;
  cycleId: string;
}): Promise<TrainingSessionPayload | null> {
  const { clerkId, setId, cycleId } = params;

  const rows = await prisma.$queryRaw<TrainingSessionSnapshotRow[]>`
    SELECT
      c.id AS "cycleId",
      c."puzzleSetId",
      c."cycleNumber",
      c."totalPuzzles",
      c."attemptedCount",
      c."nextPosition",
      c."solvedCorrect",
      c."solvedIncorrect",
      c."skipped",
      c."totalTime",
      c."completedAt",
      upcoming."puzzleInSetId",
      upcoming.position,
      upcoming."totalAttempts",
      upcoming."correctAttempts",
      upcoming."averageTime",
      upcoming."puzzleId",
      upcoming.fen,
      upcoming.moves,
      upcoming.rating,
      upcoming.themes
    FROM "Cycle" c
    JOIN "PuzzleSet" ps ON ps.id = c."puzzleSetId"
    JOIN "User" u ON u.id = ps."userId"
    LEFT JOIN LATERAL (
      SELECT
        pis.id AS "puzzleInSetId",
        pis.position,
        pis."totalAttempts",
        pis."correctAttempts",
        pis."averageTime",
        p.id AS "puzzleId",
        p.fen,
        p.moves,
        p.rating,
        p.themes
      FROM "PuzzleInSet" pis
      JOIN "Puzzle" p ON p.id = pis."puzzleId"
      WHERE pis."puzzleSetId" = ps.id
        AND c."completedAt" IS NULL
        AND c."nextPosition" <= c."totalPuzzles"
        AND pis.position >= c."nextPosition"
      ORDER BY pis.position ASC
      LIMIT 2
    ) upcoming ON true
    WHERE c.id = ${cycleId}
      AND c."puzzleSetId" = ${setId}
      AND u."clerkId" = ${clerkId}
    ORDER BY upcoming.position ASC NULLS LAST;
  `;

  return mapTrainingSessionSnapshotRows(rows);
}

export const fetchTrainingSessionForUser = fetchTrainingSessionSnapshot;

export function toLegacyNextPuzzleResponse(session: TrainingSessionPayload) {
  return {
    puzzle: session.current?.puzzle ?? null,
    puzzleInSet: session.current?.puzzleInSet ?? null,
    progress: session.progress,
    isCycleComplete: session.isCycleComplete,
    cycleStats: session.cycleStats,
    prefetchedNext: session.prefetchedNext
      ? {
          puzzle: session.prefetchedNext.puzzle,
          puzzleInSet: session.prefetchedNext.puzzleInSet,
        }
      : null,
  };
}
