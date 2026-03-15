import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { Resend } from "resend";
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

const resend = new Resend(process.env.RESEND_API_KEY);
const DUPLICATE_ATTEMPT_ERROR =
  "Attempt already recorded for this puzzle in this cycle.";

interface RouteContext {
  params: Promise<{ setId: string; cycleId: string }>;
}

interface AttemptContextRow {
  cycleId: string;
  puzzleSetId: string;
  cycleNumber: number;
  totalPuzzles: number;
  solvedCorrect: number;
  solvedIncorrect: number;
  skipped: number;
  totalTime: number | null;
  completedAt: Date | null;
  nextPosition: number;
  attemptedCount: number;
  userId: string;
  userEmail: string | null;
  totalCorrectAttempts: number;
  weeklyCorrectAttempts: number;
  weeklyCorrectStartDate: Date | null;
  totalXp: number;
  weeklyXp: number;
  weeklyXpStartDate: Date | null;
  currentStreak: number;
  longestStreak: number;
  lastTrainedDate: Date | null;
  expectedPuzzleInSetId: string | null;
  puzzlePosition: number | null;
  puzzleTotalAttempts: number | null;
  puzzleCorrectAttempts: number | null;
  puzzleAverageTime: number | null;
  lastAttemptIsCorrect: boolean | null;
  lastAttemptTime: number | null;
  puzzleId: string | null;
  fen: string | null;
  moves: string | null;
  rating: number | null;
  themes: string[] | null;
}

async function fetchAttemptWriteContext(
  tx: Pick<typeof prisma, '$queryRaw'>,
  params: {
    clerkId: string;
    setId: string;
    cycleId: string;
  },
) {
  const { clerkId, setId, cycleId } = params;
  const rows = await tx.$queryRaw<AttemptContextRow[]>`
    SELECT
      c.id AS "cycleId",
      c."puzzleSetId",
      c."cycleNumber",
      c."totalPuzzles",
      c."solvedCorrect",
      c."solvedIncorrect",
      c."skipped",
      c."totalTime",
      c."completedAt",
      c."nextPosition",
      c."attemptedCount",
      u.id AS "userId",
      u.email AS "userEmail",
      u."totalCorrectAttempts",
      u."weeklyCorrectAttempts",
      u."weeklyCorrectStartDate",
      u."totalXp",
      u."weeklyXp",
      u."weeklyXpStartDate",
      u."currentStreak",
      u."longestStreak",
      u."lastTrainedDate",
      expected."puzzleInSetId" AS "expectedPuzzleInSetId",
      expected.position AS "puzzlePosition",
      expected."totalAttempts" AS "puzzleTotalAttempts",
      expected."correctAttempts" AS "puzzleCorrectAttempts",
      expected."averageTime" AS "puzzleAverageTime",
      expected."lastAttemptIsCorrect",
      expected."lastAttemptTime",
      expected."puzzleId",
      expected.fen,
      expected.moves,
      expected.rating,
      expected.themes
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
        pis."lastAttemptIsCorrect",
        pis."lastAttemptTime",
        p.id AS "puzzleId",
        p.fen,
        p.moves,
        p.rating,
        p.themes
      FROM "PuzzleInSet" pis
      JOIN "Puzzle" p ON p.id = pis."puzzleId"
      WHERE pis."puzzleSetId" = ps.id
        AND pis.position = c."nextPosition"
      LIMIT 1
    ) expected ON true
    WHERE c.id = ${cycleId}
      AND c."puzzleSetId" = ${setId}
      AND u."clerkId" = ${clerkId}
    LIMIT 1;
  `;
  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    cycleWithUser: {
      id: row.cycleId,
      puzzleSetId: row.puzzleSetId,
      cycleNumber: row.cycleNumber,
      totalPuzzles: row.totalPuzzles,
      solvedCorrect: row.solvedCorrect,
      solvedIncorrect: row.solvedIncorrect,
      skipped: row.skipped,
      totalTime: row.totalTime,
      completedAt: row.completedAt,
      nextPosition: row.nextPosition,
      attemptedCount: row.attemptedCount,
      puzzleSet: {
        id: row.puzzleSetId,
        user: {
          id: row.userId,
          email: row.userEmail,
          totalCorrectAttempts: row.totalCorrectAttempts,
          weeklyCorrectAttempts: row.weeklyCorrectAttempts,
          weeklyCorrectStartDate: row.weeklyCorrectStartDate,
          totalXp: row.totalXp,
          weeklyXp: row.weeklyXp,
          weeklyXpStartDate: row.weeklyXpStartDate,
          currentStreak: row.currentStreak,
          longestStreak: row.longestStreak,
          lastTrainedDate: row.lastTrainedDate,
        },
      },
    },
    expectedPuzzleInSet: row.expectedPuzzleInSetId
      ? {
          id: row.expectedPuzzleInSetId,
          position: row.puzzlePosition ?? row.nextPosition,
          totalAttempts: row.puzzleTotalAttempts ?? 0,
          correctAttempts: row.puzzleCorrectAttempts ?? 0,
          averageTime: row.puzzleAverageTime,
          lastAttemptIsCorrect: row.lastAttemptIsCorrect,
          lastAttemptTime: row.lastAttemptTime,
          puzzle: {
            id: row.puzzleId ?? "",
            fen: row.fen ?? "",
            moves: row.moves ?? "",
            rating: row.rating ?? 0,
            themes: row.themes ?? [],
          },
        }
      : null,
  };
}

function formatAlertValue(value: string | number | boolean | null) {
  if (value === null) return "n/a";
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

function buildDuplicateAttemptAlertText(params: {
  clerkId: string;
  userId: string;
  userEmail: string | null;
  setId: string;
  cycleId: string;
  cycleNumber: number;
  puzzleInSetId: string;
  puzzleId: string;
  puzzlePosition: number;
  timeSpent: number;
  isCorrect: boolean;
  wasSkipped: boolean;
  movesPlayedCount: number;
  apiUrl: string;
  referrer: string | null;
  userAgent: string | null;
  submittedAt: string;
}) {
  return [
    "Training alert",
    "",
    "Error",
    DUPLICATE_ATTEMPT_ERROR,
    "",
    "User identity",
    `Clerk ID: ${params.clerkId}`,
    `User ID: ${params.userId}`,
    `Email: ${formatAlertValue(params.userEmail)}`,
    "",
    "Training context",
    `Puzzle set ID: ${params.setId}`,
    `Cycle ID: ${params.cycleId}`,
    `Cycle number: ${params.cycleNumber}`,
    `Puzzle-in-set ID: ${params.puzzleInSetId}`,
    `Puzzle ID: ${params.puzzleId}`,
    `Puzzle position: ${params.puzzlePosition}`,
    `Time spent: ${params.timeSpent}`,
    `Attempt marked correct: ${formatAlertValue(params.isCorrect)}`,
    `Attempt marked skipped: ${formatAlertValue(params.wasSkipped)}`,
    `Moves played count: ${params.movesPlayedCount}`,
    "",
    "Request metadata",
    `API URL: ${params.apiUrl}`,
    `Referrer: ${formatAlertValue(params.referrer)}`,
    `User agent: ${formatAlertValue(params.userAgent)}`,
    `Submitted at: ${params.submittedAt}`,
  ].join("\n");
}

async function sendDuplicateAttemptAlert(params: {
  clerkId: string;
  userId: string;
  userEmail: string | null;
  setId: string;
  cycleId: string;
  cycleNumber: number;
  puzzleInSetId: string;
  puzzleId: string;
  puzzlePosition: number;
  timeSpent: number;
  isCorrect: boolean;
  wasSkipped: boolean;
  movesPlayedCount: number;
  apiUrl: string;
  referrer: string | null;
  userAgent: string | null;
  submittedAt: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!process.env.RESEND_API_KEY || !adminEmail) {
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: "Peck <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `Training alert - duplicate attempt - set ${params.setId} - cycle ${params.cycleId}`,
      text: buildDuplicateAttemptAlertText(params),
    });

    if (error) {
      console.error("Error sending duplicate attempt alert:", error);
    }
  } catch (error) {
    console.error("Error sending duplicate attempt alert:", error);
  }
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
        const attemptContext = await fetchAttemptWriteContext(tx, {
          clerkId,
          setId,
          cycleId,
        });

        if (!attemptContext) {
          return { status: "not_found" as const };
        }

        const { cycleWithUser, expectedPuzzleInSet } = attemptContext;

        if (
          cycleWithUser.completedAt !== null ||
          cycleWithUser.nextPosition > cycleWithUser.totalPuzzles
        ) {
          return { status: "cycle_complete" as const };
        }

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
            return {
              status: "duplicate_attempt" as const,
              alertContext: {
                userId: cycleWithUser.puzzleSet.user.id,
                userEmail: cycleWithUser.puzzleSet.user.email,
                cycleNumber: cycleWithUser.cycleNumber,
                puzzleInSetId: expectedPuzzleInSet.id,
                puzzleId: expectedPuzzleInSet.puzzle.id,
                puzzlePosition: expectedPuzzleInSet.position,
              },
            };
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
        await sendDuplicateAttemptAlert({
          clerkId,
          userId: result.alertContext.userId,
          userEmail: result.alertContext.userEmail,
          setId,
          cycleId,
          cycleNumber: result.alertContext.cycleNumber,
          puzzleInSetId: result.alertContext.puzzleInSetId,
          puzzleId: result.alertContext.puzzleId,
          puzzlePosition: result.alertContext.puzzlePosition,
          timeSpent,
          isCorrect,
          wasSkipped,
          movesPlayedCount: movesPlayed.length,
          apiUrl: request.url,
          referrer: request.headers.get("referer"),
          userAgent: request.headers.get("user-agent"),
          submittedAt: now.toISOString(),
        });

        return NextResponse.json(
          { error: DUPLICATE_ATTEMPT_ERROR },
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
