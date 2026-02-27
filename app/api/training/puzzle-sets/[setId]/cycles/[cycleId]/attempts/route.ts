import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { attemptSchema } from "@/lib/validations/training";
import { calculateStreakUpdate, getTodayUTC } from "@/lib/streak";
import { getISOWeekStart, isSameISOWeek } from "@/lib/leaderboard";
import {
  checkAllAchievements,
  checkFastAchievements,
  type AchievementContext,
} from "@/lib/achievements";
import {
  calculatePuzzleAttemptXp,
  calculateCycleCompleteXp,
  combineXpGains,
  getLevelFromXp,
  type XpGainResult,
} from "@/lib/xp";
import {
  buildTrainingSessionPayload,
} from "@/lib/training/session";
import { withRouteMetrics } from "@/lib/metrics/request-metrics";

interface RouteContext {
  params: Promise<{ setId: string; cycleId: string }>;
}

/**
 * POST /api/training/puzzle-sets/[setId]/cycles/[cycleId]/attempts
 * Records a puzzle attempt and returns updated session state.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return withRouteMetrics("training.attempts.post", async () => {
    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { setId, cycleId } = await context.params;

      const body = await request.json();
      const validation = attemptSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid request body", details: validation.error.message },
          { status: 400 },
        );
      }

      const { puzzleInSetId, timeSpent, isCorrect, wasSkipped, movesPlayed } =
        validation.data;
      const now = new Date();

      const result = await prisma.$transaction(async (tx) => {
        const cycleWithUser = await tx.cycle.findFirst({
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
            solvedCorrect: true,
            solvedIncorrect: true,
            skipped: true,
            totalTime: true,
            completedAt: true,
            nextPosition: true,
            attemptedCount: true,
            puzzleSet: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    totalCorrectAttempts: true,
                    weeklyCorrectAttempts: true,
                    weeklyCorrectStartDate: true,
                    totalXp: true,
                    weeklyXp: true,
                    weeklyXpStartDate: true,
                    currentStreak: true,
                    longestStreak: true,
                    lastTrainedDate: true,
                  },
                },
              },
            },
          },
        });

        if (!cycleWithUser) {
          return { status: "not_found" as const };
        }

        if (
          cycleWithUser.completedAt !== null ||
          cycleWithUser.nextPosition > cycleWithUser.totalPuzzles
        ) {
          return { status: "cycle_complete" as const };
        }

        const expectedPuzzleInSet = await tx.puzzleInSet.findUnique({
          where: {
            puzzleSetId_position: {
              puzzleSetId: setId,
              position: cycleWithUser.nextPosition,
            },
          },
          select: {
            id: true,
            position: true,
            totalAttempts: true,
            correctAttempts: true,
            averageTime: true,
            lastAttemptIsCorrect: true,
            lastAttemptTime: true,
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

        if (!expectedPuzzleInSet) {
          return { status: "expected_puzzle_missing" as const };
        }

        if (expectedPuzzleInSet.id !== puzzleInSetId) {
          return {
            status: "stale_attempt" as const,
            expectedPuzzleInSetId: expectedPuzzleInSet.id,
          };
        }

        let attempt;
        try {
          attempt = await tx.attempt.create({
            data: {
              cycleId,
              puzzleInSetId,
              timeSpent,
              isCorrect,
              wasSkipped,
              movesPlayed,
            },
            select: {
              id: true,
              timeSpent: true,
              isCorrect: true,
              wasSkipped: true,
            },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            return { status: "duplicate_attempt" as const };
          }
          throw error;
        }

        const newTotalAttempts = expectedPuzzleInSet.totalAttempts + 1;
        const newCorrectAttempts = isCorrect
          ? expectedPuzzleInSet.correctAttempts + 1
          : expectedPuzzleInSet.correctAttempts;
        const currentTotalTime =
          (expectedPuzzleInSet.averageTime ?? 0) *
          expectedPuzzleInSet.totalAttempts;
        const newAverageTime = (currentTotalTime + timeSpent) / newTotalAttempts;

        await tx.puzzleInSet.update({
          where: { id: expectedPuzzleInSet.id },
          data: {
            totalAttempts: newTotalAttempts,
            correctAttempts: newCorrectAttempts,
            averageTime: newAverageTime,
            lastAttemptIsCorrect: isCorrect,
            lastAttemptTime: timeSpent,
            lastAttemptAt: now,
          },
        });

        const nextAttemptedCount = cycleWithUser.attemptedCount + 1;
        const isLastPuzzle = nextAttemptedCount >= cycleWithUser.totalPuzzles;
        const nextPosition = Math.min(
          cycleWithUser.totalPuzzles + 1,
          cycleWithUser.nextPosition + 1,
        );

        const updatedCycle = await tx.cycle.update({
          where: { id: cycleId },
          data: {
            solvedCorrect: !wasSkipped && isCorrect ? { increment: 1 } : undefined,
            solvedIncorrect:
              !wasSkipped && !isCorrect ? { increment: 1 } : undefined,
            skipped: wasSkipped ? { increment: 1 } : undefined,
            totalTime: (cycleWithUser.totalTime ?? 0) + timeSpent,
            attemptedCount: nextAttemptedCount,
            nextPosition,
            completedAt: isLastPuzzle ? now : undefined,
          },
          select: {
            id: true,
            cycleNumber: true,
            totalPuzzles: true,
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

        const user = cycleWithUser.puzzleSet.user;
        const streakResult = calculateStreakUpdate(
          user.lastTrainedDate,
          user.currentStreak,
          user.longestStreak,
          now,
        );

        const userUpdateData: {
          currentStreak?: number;
          longestStreak?: number;
          lastTrainedDate?: Date;
          streakUpdatedAt?: Date;
          totalCorrectAttempts?: { increment: number };
          weeklyCorrectAttempts?: number | { increment: number };
          weeklyCorrectStartDate?: Date;
          totalXp?: number;
          currentLevel?: number;
          weeklyXp?: number | { increment: number };
          weeklyXpStartDate?: Date;
        } = {};

        if (streakResult.streakIncremented) {
          userUpdateData.currentStreak = streakResult.newStreak;
          userUpdateData.longestStreak = streakResult.newLongestStreak;
          userUpdateData.lastTrainedDate = getTodayUTC();
          userUpdateData.streakUpdatedAt = now;
        }

        if (isCorrect) {
          userUpdateData.totalCorrectAttempts = { increment: 1 };

          const currentWeekStart = getISOWeekStart(now);
          const needsWeeklyReset =
            !user.weeklyCorrectStartDate ||
            !isSameISOWeek(user.weeklyCorrectStartDate, now);

          userUpdateData.weeklyCorrectAttempts = needsWeeklyReset
            ? 1
            : { increment: 1 };
          userUpdateData.weeklyCorrectStartDate = currentWeekStart;
        }

        const previousAttempt =
          expectedPuzzleInSet.lastAttemptIsCorrect !== null &&
          expectedPuzzleInSet.lastAttemptTime !== null
            ? {
                isCorrect: expectedPuzzleInSet.lastAttemptIsCorrect,
                timeSpentMs: expectedPuzzleInSet.lastAttemptTime,
              }
            : undefined;

        const puzzleXpResult = calculatePuzzleAttemptXp({
          isCorrect,
          timeSpentMs: timeSpent,
          puzzleRating: expectedPuzzleInSet.puzzle.rating,
          currentStreak: streakResult.streakIncremented
            ? streakResult.newStreak
            : user.currentStreak,
          isFirstAttempt: expectedPuzzleInSet.totalAttempts === 0,
          previousAttempt,
          currentTotalXp: user.totalXp,
        });

        let cycleXpResult: XpGainResult | null = null;
        if (isLastPuzzle) {
          cycleXpResult = calculateCycleCompleteXp({
            solvedCorrect: updatedCycle.solvedCorrect,
            totalPuzzles: updatedCycle.totalPuzzles,
            currentTotalXp: puzzleXpResult.newTotalXp,
          });
        }

        const xpGains = cycleXpResult
          ? combineXpGains([puzzleXpResult, cycleXpResult])
          : puzzleXpResult;

        if (xpGains.totalXp > 0) {
          userUpdateData.totalXp = xpGains.newTotalXp;
          userUpdateData.currentLevel = getLevelFromXp(xpGains.newTotalXp);

          const currentWeekStart = getISOWeekStart(now);
          const needsWeeklyXpReset =
            !user.weeklyXpStartDate ||
            !isSameISOWeek(user.weeklyXpStartDate, now);

          userUpdateData.weeklyXp = needsWeeklyXpReset
            ? xpGains.totalXp
            : { increment: xpGains.totalXp };
          userUpdateData.weeklyXpStartDate = currentWeekStart;
        }

        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: userUpdateData,
          });
        }

        await tx.puzzleSet.update({
          where: { id: cycleWithUser.puzzleSet.id },
          data: { lastTrainedAt: now },
        });

        const upcomingPuzzles = isLastPuzzle
          ? []
          : await tx.puzzleInSet.findMany({
              where: {
                puzzleSetId: setId,
                position: { gte: updatedCycle.nextPosition },
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

        const session = buildTrainingSessionPayload(updatedCycle, upcomingPuzzles);

        const needsWeeklyResetForAch =
          !user.weeklyCorrectStartDate ||
          !isSameISOWeek(user.weeklyCorrectStartDate, now);
        const postTxTotalCorrect = isCorrect
          ? user.totalCorrectAttempts + 1
          : user.totalCorrectAttempts;
        const postTxWeeklyCorrect = !isCorrect
          ? needsWeeklyResetForAch
            ? 0
            : user.weeklyCorrectAttempts
          : needsWeeklyResetForAch
            ? 1
            : user.weeklyCorrectAttempts + 1;
        const needsWeeklyXpResetForAch =
          !user.weeklyXpStartDate || !isSameISOWeek(user.weeklyXpStartDate, now);
        const postTxWeeklyXp =
          xpGains.totalXp === 0
            ? needsWeeklyXpResetForAch
              ? 0
              : user.weeklyXp
            : needsWeeklyXpResetForAch
              ? xpGains.totalXp
              : user.weeklyXp + xpGains.totalXp;

        return {
          status: "ok" as const,
          attempt,
          updatedCycle,
          isLastPuzzle,
          streakResult,
          xpGains,
          session,
          achievementContext: {
            userId: user.id,
            attempt: {
              isCorrect,
              timeSpentMs: timeSpent,
              attemptedAt: now,
              puzzleThemes: expectedPuzzleInSet.puzzle.themes,
              puzzleRating: expectedPuzzleInSet.puzzle.rating,
            },
            user: {
              totalCorrectAttempts: postTxTotalCorrect,
              weeklyCorrectAttempts: postTxWeeklyCorrect,
              totalXp: xpGains.newTotalXp,
              weeklyXp: postTxWeeklyXp,
            },
            cycleComplete: isLastPuzzle
              ? {
                  puzzleSetId: setId,
                  cycleNumber: updatedCycle.cycleNumber,
                  accuracy:
                    (updatedCycle.solvedCorrect / updatedCycle.totalPuzzles) *
                    100,
                  totalPuzzles: updatedCycle.totalPuzzles,
                  correctPuzzles: updatedCycle.solvedCorrect,
                }
              : undefined,
            streak: streakResult.streakIncremented
              ? {
                  currentStreak: streakResult.newStreak,
                  longestStreak: streakResult.newLongestStreak,
                }
              : undefined,
          } satisfies AchievementContext,
        };
      });

      if (result.status === "not_found") {
        return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
      }

      if (result.status === "cycle_complete") {
        return NextResponse.json(
          { error: "Cycle already complete. Refresh session state." },
          { status: 409 },
        );
      }

      if (result.status === "expected_puzzle_missing") {
        return NextResponse.json(
          { error: "Expected puzzle not found for current cycle position." },
          { status: 409 },
        );
      }

      if (result.status === "stale_attempt") {
        return NextResponse.json(
          {
            error: "Attempt is out of date. Refresh session state.",
            expectedPuzzleInSetId: result.expectedPuzzleInSetId,
          },
          { status: 409 },
        );
      }

      if (result.status === "duplicate_attempt") {
        return NextResponse.json(
          { error: "Attempt already recorded for this puzzle in this cycle." },
          { status: 409 },
        );
      }

      const { newlyUnlocked } = result.isLastPuzzle
        ? await checkAllAchievements(result.achievementContext)
        : await checkFastAchievements(result.achievementContext);

      return NextResponse.json({
        attempt: result.attempt,
        cycleStats: {
          solvedCorrect: result.updatedCycle.solvedCorrect,
          solvedIncorrect: result.updatedCycle.solvedIncorrect,
          skipped: result.updatedCycle.skipped,
          totalTime: result.updatedCycle.totalTime,
        },
        isLastPuzzle: result.isLastPuzzle,
        streak: {
          current: result.streakResult.newStreak,
          longest: result.streakResult.newLongestStreak,
          incremented: result.streakResult.streakIncremented,
          broken: result.streakResult.streakBroken,
          isNewRecord: result.streakResult.isNewRecord,
        },
        xp: {
          gained: result.xpGains.totalXp,
          breakdown: result.xpGains.breakdown,
          newTotal: result.xpGains.newTotalXp,
          previousLevel: result.xpGains.previousLevel,
          newLevel: result.xpGains.newLevel,
          leveledUp: result.xpGains.leveledUp,
        },
        session: result.session,
        unlockedAchievements: newlyUnlocked.map((achievement) => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: achievement.unlockedAt.toISOString(),
        })),
      });
    } catch (error) {
      console.error("Error recording attempt:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
