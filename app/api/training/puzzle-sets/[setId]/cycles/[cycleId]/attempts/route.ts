import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { attemptSchema } from "@/lib/validations/training";
import { calculateStreakUpdate } from "@/lib/streak";
import { checkAllAchievements, type AchievementContext } from "@/lib/achievements";
import {
  calculatePuzzleAttemptXp,
  calculateCycleCompleteXp,
  combineXpGains,
  type XpGainResult,
} from "@/lib/xp";
import {
  buildTrainingSessionPayload,
  fetchUpcomingTrainingPuzzles,
} from "@/lib/training/session";
import { recordAttemptHotPath } from "@/lib/training/attempt-hot-path";
import { withRouteMetrics } from "@/lib/metrics/request-metrics";

const DUPLICATE_ATTEMPT_ERROR =
  "Attempt already recorded for this puzzle in this cycle.";

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

      const result = await recordAttemptHotPath({
        clerkId,
        setId,
        cycleId,
        puzzleInSetId,
        timeSpent,
        isCorrect,
        wasSkipped,
        movesPlayed,
        now,
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
          { error: DUPLICATE_ATTEMPT_ERROR },
          { status: 409 },
        );
      }

      const streakResult = calculateStreakUpdate(
        result.userBefore.lastTrainedDate,
        result.userBefore.currentStreak,
        result.userBefore.longestStreak,
        now,
      );

      const puzzleXpResult = calculatePuzzleAttemptXp({
        isCorrect,
        timeSpentMs: timeSpent,
        puzzleRating: result.puzzleContext.puzzleRating,
        currentStreak: streakResult.streakIncremented
          ? streakResult.newStreak
          : result.userBefore.currentStreak,
        isFirstAttempt: result.puzzleContext.totalAttemptsBefore === 0,
        previousAttempt: result.puzzleContext.previousAttempt ?? undefined,
        currentTotalXp: result.userBefore.totalXp,
      });

      let cycleXpResult: XpGainResult | null = null;
      if (result.isLastPuzzle) {
        cycleXpResult = calculateCycleCompleteXp({
          solvedCorrect: result.updatedCycle.solvedCorrect,
          totalPuzzles: result.updatedCycle.totalPuzzles,
          currentTotalXp: puzzleXpResult.newTotalXp,
        });
      }

      const xpGains = cycleXpResult
        ? combineXpGains([puzzleXpResult, cycleXpResult])
        : puzzleXpResult;

      const upcomingPuzzles = result.isLastPuzzle
        ? []
        : await fetchUpcomingTrainingPuzzles({
            puzzleSetId: setId,
            nextPosition: result.updatedCycle.nextPosition,
          });

      const session = buildTrainingSessionPayload(result.updatedCycle, upcomingPuzzles);

      const achievementContext: AchievementContext = {
        userId: result.puzzleContext.userId,
        attempt: {
          isCorrect,
          timeSpentMs: timeSpent,
          attemptedAt: now,
          puzzleThemes: result.puzzleContext.puzzleThemes,
          puzzleRating: result.puzzleContext.puzzleRating,
        },
        user: {
          totalCorrectAttempts: result.userAfter.totalCorrectAttempts,
          weeklyCorrectAttempts: result.userAfter.weeklyCorrectAttempts,
          totalXp: result.userAfter.totalXp,
          weeklyXp: result.userAfter.weeklyXp,
        },
        cycleComplete: result.isLastPuzzle
          ? {
              puzzleSetId: setId,
              cycleNumber: result.updatedCycle.cycleNumber,
              accuracy:
                (result.updatedCycle.solvedCorrect / result.updatedCycle.totalPuzzles) *
                100,
              totalPuzzles: result.updatedCycle.totalPuzzles,
              correctPuzzles: result.updatedCycle.solvedCorrect,
            }
          : undefined,
        streak: streakResult.streakIncremented
          ? {
              currentStreak: streakResult.newStreak,
              longestStreak: streakResult.newLongestStreak,
            }
          : undefined,
      };

      const { newlyUnlocked } = result.isLastPuzzle
        ? await checkAllAchievements(achievementContext)
        : { newlyUnlocked: [] };

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
          current: streakResult.newStreak,
          longest: streakResult.newLongestStreak,
          incremented: streakResult.streakIncremented,
          broken: streakResult.streakBroken,
          isNewRecord: streakResult.isNewRecord,
        },
        xp: {
          gained: xpGains.totalXp,
          breakdown: xpGains.breakdown,
          newTotal: xpGains.newTotalXp,
          previousLevel: xpGains.previousLevel,
          newLevel: xpGains.newLevel,
          leveledUp: xpGains.leveledUp,
        },
        session,
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
