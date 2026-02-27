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

export async function fetchTrainingSessionForUser(params: {
  clerkId: string;
  setId: string;
  cycleId: string;
}): Promise<TrainingSessionPayload | null> {
  const { clerkId, setId, cycleId } = params;

  const cycle = await prisma.cycle.findFirst({
    where: {
      id: cycleId,
      puzzleSetId: setId,
      puzzleSet: {
        user: { clerkId },
      },
    },
    select: {
      id: true,
      puzzleSetId: true,
      cycleNumber: true,
      totalPuzzles: true,
      attemptedCount: true,
      nextPosition: true,
      solvedCorrect: true,
      solvedIncorrect: true,
      skipped: true,
      totalTime: true,
      completedAt: true,
    },
  });

  if (!cycle) return null;

  const isCycleComplete =
    cycle.completedAt !== null || cycle.nextPosition > cycle.totalPuzzles;

  const upcomingPuzzles = isCycleComplete
    ? []
    : await prisma.puzzleInSet.findMany({
        where: {
          puzzleSetId: setId,
          position: { gte: cycle.nextPosition },
        },
        orderBy: { position: "asc" },
        take: 2,
        select: {
          id: true,
          position: true,
          totalAttempts: true,
          correctAttempts: true,
          averageTime: true,
          puzzle: {
            select: {
              id: true,
              fen: true,
              moves: true,
              rating: true,
              themes: true,
            },
          },
        },
      });

  return buildTrainingSessionPayload(cycle, upcomingPuzzles);
}

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
