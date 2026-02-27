import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { withRouteMetrics } from "@/lib/metrics/request-metrics";
import { buildTrainingSessionPayload } from "@/lib/training/session";

interface RouteContext {
  params: Promise<{ setId: string }>;
}

/**
 * POST /api/training/puzzle-sets/[setId]/cycles
 * Creates a new training cycle and returns initial session state.
 */
export async function POST(_request: Request, context: RouteContext) {
  return withRouteMetrics("training.cycles.post", async () => {
    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { setId } = await context.params;

      const puzzleSet = await prisma.puzzleSet.findFirst({
        where: {
          id: setId,
          user: { clerkId },
        },
        select: {
          id: true,
          size: true,
          targetCycles: true,
          cycles: {
            orderBy: { cycleNumber: "desc" },
            take: 1,
            select: {
              id: true,
              cycleNumber: true,
              completedAt: true,
            },
          },
        },
      });

      if (!puzzleSet) {
        return NextResponse.json(
          { error: "Puzzle set not found" },
          { status: 404 },
        );
      }

      const lastCycle = puzzleSet.cycles[0];
      const nextCycleNumber = lastCycle ? lastCycle.cycleNumber + 1 : 1;

      if (lastCycle && !lastCycle.completedAt) {
        return NextResponse.json(
          { error: "Previous cycle is not yet complete" },
          { status: 400 },
        );
      }

      if (lastCycle && lastCycle.cycleNumber >= puzzleSet.targetCycles) {
        return NextResponse.json(
          { error: "All target cycles have been completed" },
          { status: 400 },
        );
      }

      const cycle = await prisma.cycle.create({
        data: {
          puzzleSetId: setId,
          cycleNumber: nextCycleNumber,
          totalPuzzles: puzzleSet.size,
          attemptedCount: 0,
          nextPosition: 1,
          startedAt: new Date(),
        },
        select: {
          id: true,
          cycleNumber: true,
          totalPuzzles: true,
          startedAt: true,
          solvedCorrect: true,
          solvedIncorrect: true,
          skipped: true,
          totalTime: true,
          attemptedCount: true,
          nextPosition: true,
          completedAt: true,
          puzzleSetId: true,
        },
      });

      const upcomingPuzzles = await prisma.puzzleInSet.findMany({
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

      const session = buildTrainingSessionPayload(cycle, upcomingPuzzles);

      return NextResponse.json({
        cycle: {
          id: cycle.id,
          cycleNumber: cycle.cycleNumber,
          totalPuzzles: cycle.totalPuzzles,
          startedAt: cycle.startedAt.toISOString(),
        },
        session,
      });
    } catch (error) {
      console.error("Error creating cycle:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}

/**
 * GET /api/training/puzzle-sets/[setId]/cycles
 * Returns all cycles for a puzzle set.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { setId } = await context.params;

    const puzzleSet = await prisma.puzzleSet.findFirst({
      where: {
        id: setId,
        user: { clerkId },
      },
      select: { id: true },
    });

    if (!puzzleSet) {
      return NextResponse.json({ error: "Puzzle set not found" }, { status: 404 });
    }

    const cycles = await prisma.cycle.findMany({
      where: { puzzleSetId: setId },
      orderBy: { cycleNumber: "asc" },
    });

    return NextResponse.json({
      cycles: cycles.map((cycle) => ({
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        totalPuzzles: cycle.totalPuzzles,
        solvedCorrect: cycle.solvedCorrect,
        solvedIncorrect: cycle.solvedIncorrect,
        skipped: cycle.skipped,
        totalTime: cycle.totalTime,
        startedAt: cycle.startedAt.toISOString(),
        completedAt: cycle.completedAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching cycles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
