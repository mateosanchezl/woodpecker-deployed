/**
 * Achievement evaluation engine (optimized)
 *
 * Replaces the old per-category check functions with a single unified
 * `checkAllAchievements()` that uses at most 3 DB queries total:
 *   1. Load already-unlocked achievement IDs
 *   2. Single CTE raw query for all DB-dependent achievement data
 *   3. Batch-save any newly unlocked achievements
 *
 * Context-only achievements (Category A) need zero DB queries.
 * The `rising-star` achievement is checked in the leaderboard route instead.
 */

import { prisma } from "@/lib/prisma";
import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition,
} from "./definitions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface AchievementCheckResult {
  newlyUnlocked: UnlockedAchievement[];
}

/**
 * Unified context that supplies everything the achievement engine needs.
 * The caller is responsible for passing post-transaction values for `user`.
 */
export interface AchievementContext {
  userId: string;

  /** Always present when called from the attempt route */
  attempt?: {
    isCorrect: boolean;
    timeSpentMs: number;
    attemptedAt: Date;
    puzzleThemes: string[];
    puzzleRating: number;
  };

  /**
   * User counters – must reflect the *post-transaction* state so that
   * puzzle-count and weekly achievements evaluate correctly.
   */
  user: {
    totalCorrectAttempts: number;
    weeklyCorrectAttempts: number;
    totalXp: number;
    weeklyXp: number;
  };

  /** Present when the attempt completes a cycle */
  cycleComplete?: {
    puzzleSetId: string;
    cycleNumber: number;
    accuracy: number; // 0-100
    totalPuzzles: number;
    correctPuzzles: number;
  };

  /** Present when the streak was updated (first attempt of the day) */
  streak?: {
    currentStreak: number;
    longestStreak: number;
  };
}

// ---------------------------------------------------------------------------
// CTE result shape (from the single raw SQL query)
// ---------------------------------------------------------------------------

interface ThemeStat {
  theme: string;
  total: number;
  correct: number;
}

interface RecentAttempt {
  isCorrect: boolean;
  timeSpent: number;
  rn: number;
}

interface CycleCount {
  puzzleSetId: string;
  completed: number;
}

interface CycleTime {
  puzzleSetId: string;
  cycleNumber: number;
  totalTime: number;
}

interface CteResult {
  theme_stats: ThemeStat[] | null;
  recent_attempts: RecentAttempt[] | null;
  total_attempts: number | null;
  high_rating_correct: number | null;
  cycle_counts: CycleCount[] | null;
  cycle_times: CycleTime[] | null;
}

// ---------------------------------------------------------------------------
// IDs for each category, for early-exit logic
// ---------------------------------------------------------------------------

/** Category A: achievements that only need context data (zero DB queries) */
const CATEGORY_A_IDS = new Set([
  // From attempt context
  "speed-demon",
  "lightning-fast",
  "early-bird",
  "night-owl",
  // From user counters
  "first-blood",
  "century",
  "half-thousand",
  "millennium",
  "weekly-warrior",
  // From cycle-complete context
  "perfectionist",
  "sharp-shooter",
  "no-mistakes",
  // From streak context
  "on-fire",
  "unstoppable",
  "consistent-trainer",
  "dedicated",
]);

/** Category B: achievements that need the CTE query */
const CATEGORY_B_IDS = new Set([
  "theme-master-fork",
  "theme-master-pin",
  "theme-master-skewer",
  "mate-master",
  "versatile",
  "speed-streak",
  "flawless-streak",
  "tactical-prodigy",
  "rating-climber",
  "cycle-complete",
  "woodpecker-pro",
  "woodpecker-master",
  "improvement-king",
]);

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Check ALL achievements in a single pass. Returns newly unlocked achievements.
 *
 * DB queries:
 *   1. `findMany` for already-unlocked IDs
 *   2. Single CTE `$queryRaw` (skipped if all Category B already unlocked)
 *   3. `createMany` for newly unlocked (skipped if nothing new)
 */
export async function checkAllAchievements(
  ctx: AchievementContext,
): Promise<AchievementCheckResult> {
  // ---- Query 1: Load already-unlocked IDs -----------------------------------
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: ctx.userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  // Early exit: all 30 achievements already unlocked
  if (unlockedIds.size >= ACHIEVEMENT_DEFINITIONS.length) {
    return { newlyUnlocked: [] };
  }

  const toUnlock: string[] = [];

  // ---- Category A: context-only checks (0 DB queries) -----------------------
  checkCategoryA(ctx, unlockedIds, toUnlock);

  // ---- Category B: CTE-dependent checks ------------------------------------
  const hasPendingB = [...CATEGORY_B_IDS].some((id) => !unlockedIds.has(id));

  if (hasPendingB) {
    // ---- Query 2: Single CTE raw query --------------------------------------
    const puzzleSetId = ctx.cycleComplete?.puzzleSetId ?? "__none__";
    const cteRows = await prisma.$queryRaw<[{ data: CteResult }]>`
WITH theme_stats AS (
  SELECT theme,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE a."isCorrect")::int AS correct
  FROM "Attempt" a
  JOIN "PuzzleInSet" pis ON a."puzzleInSetId" = pis.id
  JOIN "Puzzle" p ON pis."puzzleId" = p.id
  JOIN "PuzzleSet" ps ON pis."puzzleSetId" = ps.id,
  LATERAL unnest(p.themes) AS theme
  WHERE ps."userId" = ${ctx.userId}
  GROUP BY theme
),
recent_attempts AS (
  SELECT a."isCorrect",
    a."timeSpent",
    ROW_NUMBER() OVER (ORDER BY a."attemptedAt" DESC)::int AS rn
  FROM "Attempt" a
  JOIN "PuzzleInSet" pis ON a."puzzleInSetId" = pis.id
  JOIN "PuzzleSet" ps ON pis."puzzleSetId" = ps.id
  WHERE ps."userId" = ${ctx.userId}
  ORDER BY a."attemptedAt" DESC
  LIMIT 25
),
total_attempts AS (
  SELECT COUNT(*)::int AS total
  FROM "Attempt" a
  JOIN "PuzzleInSet" pis ON a."puzzleInSetId" = pis.id
  JOIN "PuzzleSet" ps ON pis."puzzleSetId" = ps.id
  WHERE ps."userId" = ${ctx.userId}
),
high_rating_correct AS (
  SELECT COUNT(*)::int AS count
  FROM "Attempt" a
  JOIN "PuzzleInSet" pis ON a."puzzleInSetId" = pis.id
  JOIN "Puzzle" p ON pis."puzzleId" = p.id
  JOIN "PuzzleSet" ps ON pis."puzzleSetId" = ps.id
  WHERE ps."userId" = ${ctx.userId}
    AND a."isCorrect" = true
    AND p.rating >= 1800
),
cycle_counts AS (
  SELECT c."puzzleSetId",
    COUNT(*) FILTER (WHERE c."completedAt" IS NOT NULL)::int AS completed
  FROM "Cycle" c
  JOIN "PuzzleSet" ps ON c."puzzleSetId" = ps.id
  WHERE ps."userId" = ${ctx.userId}
  GROUP BY c."puzzleSetId"
),
cycle_times AS (
  SELECT c."puzzleSetId",
    c."cycleNumber",
    c."totalTime"
  FROM "Cycle" c
  JOIN "PuzzleSet" ps ON c."puzzleSetId" = ps.id
  WHERE ps."userId" = ${ctx.userId}
    AND c."completedAt" IS NOT NULL
    AND c."totalTime" IS NOT NULL
    AND c."puzzleSetId" = ${puzzleSetId}
  ORDER BY c."cycleNumber" ASC
)
SELECT json_build_object(
  'theme_stats',        (SELECT json_agg(json_build_object('theme', theme, 'total', total, 'correct', correct)) FROM theme_stats),
  'recent_attempts',    (SELECT json_agg(json_build_object('isCorrect', "isCorrect", 'timeSpent', "timeSpent", 'rn', rn)) FROM recent_attempts),
  'total_attempts',     (SELECT total FROM total_attempts),
  'high_rating_correct',(SELECT count FROM high_rating_correct),
  'cycle_counts',       (SELECT json_agg(json_build_object('puzzleSetId', "puzzleSetId", 'completed', completed)) FROM cycle_counts),
  'cycle_times',        (SELECT json_agg(json_build_object('puzzleSetId', "puzzleSetId", 'cycleNumber', "cycleNumber", 'totalTime', "totalTime")) FROM cycle_times)
) AS data;`;

    const cte: CteResult = cteRows[0].data;

    checkCategoryB(ctx, unlockedIds, cte, toUnlock);
  }

  // ---- Query 3: Save newly unlocked ----------------------------------------
  const newlyUnlocked = await saveUnlocked(ctx.userId, toUnlock);

  return { newlyUnlocked };
}

// ---------------------------------------------------------------------------
// Category A evaluators (pure logic, zero DB)
// ---------------------------------------------------------------------------

function checkCategoryA(
  ctx: AchievementContext,
  unlockedIds: Set<string>,
  toUnlock: string[],
): void {
  const { attempt, user, cycleComplete, streak } = ctx;

  // -- Attempt-context achievements -------------------------------------------
  if (attempt) {
    // Time-of-day (applies to any attempt, correct or not)
    const hour = attempt.attemptedAt.getHours();
    if (!unlockedIds.has("early-bird") && hour < 7) {
      toUnlock.push("early-bird");
    }
    if (!unlockedIds.has("night-owl") && hour >= 0 && hour < 5) {
      toUnlock.push("night-owl");
    }

    // Speed achievements (correct attempts only)
    if (attempt.isCorrect) {
      if (!unlockedIds.has("speed-demon") && attempt.timeSpentMs < 3000) {
        toUnlock.push("speed-demon");
      }
      if (!unlockedIds.has("lightning-fast") && attempt.timeSpentMs < 1500) {
        toUnlock.push("lightning-fast");
      }
    }
  }

  // -- User counter achievements (correct attempts only) ----------------------
  if (attempt?.isCorrect || !attempt) {
    const tc = user.totalCorrectAttempts;
    if (!unlockedIds.has("first-blood") && tc >= 1) toUnlock.push("first-blood");
    if (!unlockedIds.has("century") && tc >= 100) toUnlock.push("century");
    if (!unlockedIds.has("half-thousand") && tc >= 500)
      toUnlock.push("half-thousand");
    if (!unlockedIds.has("millennium") && tc >= 1000)
      toUnlock.push("millennium");

    if (!unlockedIds.has("weekly-warrior") && user.weeklyCorrectAttempts >= 100)
      toUnlock.push("weekly-warrior");
  }

  // -- Cycle-complete achievements --------------------------------------------
  if (cycleComplete) {
    if (!unlockedIds.has("perfectionist") && cycleComplete.accuracy === 100) {
      toUnlock.push("perfectionist");
    }
    if (
      !unlockedIds.has("sharp-shooter") &&
      cycleComplete.totalPuzzles >= 50 &&
      cycleComplete.accuracy >= 95
    ) {
      toUnlock.push("sharp-shooter");
    }
    if (
      !unlockedIds.has("no-mistakes") &&
      cycleComplete.totalPuzzles >= 20 &&
      cycleComplete.accuracy === 100 &&
      cycleComplete.correctPuzzles === cycleComplete.totalPuzzles
    ) {
      toUnlock.push("no-mistakes");
    }
  }

  // -- Streak achievements ----------------------------------------------------
  if (streak) {
    const s = Math.max(streak.currentStreak, streak.longestStreak);
    if (!unlockedIds.has("on-fire") && s >= 7) toUnlock.push("on-fire");
    if (!unlockedIds.has("unstoppable") && s >= 30) toUnlock.push("unstoppable");
    if (!unlockedIds.has("consistent-trainer") && s >= 14)
      toUnlock.push("consistent-trainer");
    if (!unlockedIds.has("dedicated") && s >= 60) toUnlock.push("dedicated");
  }
}

// ---------------------------------------------------------------------------
// Category B evaluators (use CTE results)
// ---------------------------------------------------------------------------

function checkCategoryB(
  ctx: AchievementContext,
  unlockedIds: Set<string>,
  cte: CteResult,
  toUnlock: string[],
): void {
  // -- Theme accuracy achievements --------------------------------------------
  const themeStats = cte.theme_stats ?? [];

  const themeChecks: {
    id: string;
    theme: string;
    minAttempts: number;
    minAccuracy: number;
  }[] = [
    { id: "theme-master-fork", theme: "fork", minAttempts: 20, minAccuracy: 90 },
    { id: "theme-master-pin", theme: "pin", minAttempts: 20, minAccuracy: 90 },
    {
      id: "theme-master-skewer",
      theme: "skewer",
      minAttempts: 20,
      minAccuracy: 90,
    },
    { id: "mate-master", theme: "mate", minAttempts: 30, minAccuracy: 90 },
  ];

  for (const check of themeChecks) {
    if (unlockedIds.has(check.id)) continue;
    const stat = themeStats.find((t) => t.theme === check.theme);
    if (
      stat &&
      stat.total >= check.minAttempts &&
      (stat.correct / stat.total) * 100 >= check.minAccuracy
    ) {
      toUnlock.push(check.id);
    }
  }

  // -- Versatile (multi-theme mastery): 5 themes >= 80% accuracy, >= 15 each -
  if (!unlockedIds.has("versatile")) {
    const qualifying = themeStats.filter(
      (t) => t.total >= 15 && (t.correct / t.total) * 100 >= 80,
    ).length;
    if (qualifying >= 5) {
      toUnlock.push("versatile");
    }
  }

  // -- Speed streak (last 10 correct & < 5 s each) ---------------------------
  if (!unlockedIds.has("speed-streak") && ctx.attempt?.isCorrect && ctx.attempt.timeSpentMs < 5000) {
    const recent = (cte.recent_attempts ?? [])
      .filter((a) => a.rn <= 10)
      .sort((a, b) => a.rn - b.rn);
    if (
      recent.length >= 10 &&
      recent.every((a) => a.isCorrect && a.timeSpent < 5000)
    ) {
      toUnlock.push("speed-streak");
    }
  }

  // -- Flawless streak (last 25 all correct) ----------------------------------
  if (!unlockedIds.has("flawless-streak") && ctx.attempt?.isCorrect) {
    const recent = cte.recent_attempts ?? [];
    if (recent.length >= 25 && recent.every((a) => a.isCorrect)) {
      toUnlock.push("flawless-streak");
    }
  }

  // -- Tactical prodigy (overall accuracy >= 85% across 200+ attempts) --------
  if (!unlockedIds.has("tactical-prodigy")) {
    const totalAttempts = cte.total_attempts ?? 0;
    if (totalAttempts >= 200) {
      const accuracy =
        (ctx.user.totalCorrectAttempts / totalAttempts) * 100;
      if (accuracy >= 85) {
        toUnlock.push("tactical-prodigy");
      }
    }
  }

  // -- Rating climber (50+ correct on puzzles rated >= 1800) ------------------
  if (!unlockedIds.has("rating-climber")) {
    const shouldCheck =
      ctx.attempt?.puzzleRating !== undefined &&
      ctx.attempt.puzzleRating >= 1800;
    if (shouldCheck && (cte.high_rating_correct ?? 0) >= 50) {
      toUnlock.push("rating-climber");
    }
  }

  // -- Cycle-based achievements -----------------------------------------------
  const cycleCounts = cte.cycle_counts ?? [];

  // cycle-complete: any set with >= 1 completed cycle
  if (!unlockedIds.has("cycle-complete")) {
    if (cycleCounts.some((c) => c.completed >= 1)) {
      toUnlock.push("cycle-complete");
    }
  }

  // woodpecker-pro: any set with >= 5 completed cycles
  if (!unlockedIds.has("woodpecker-pro")) {
    if (cycleCounts.some((c) => c.completed >= 5)) {
      toUnlock.push("woodpecker-pro");
    }
  }

  // woodpecker-master: any set with >= 10 completed cycles
  if (!unlockedIds.has("woodpecker-master")) {
    if (cycleCounts.some((c) => c.completed >= 10)) {
      toUnlock.push("woodpecker-master");
    }
  }

  // -- Improvement king (50% time reduction first -> last cycle) --------------
  if (!unlockedIds.has("improvement-king") && ctx.cycleComplete) {
    const times = (cte.cycle_times ?? []).sort(
      (a, b) => a.cycleNumber - b.cycleNumber,
    );
    if (times.length >= 2) {
      const first = times[0].totalTime;
      const last = times[times.length - 1].totalTime;
      if (first && last) {
        const reduction = ((first - last) / first) * 100;
        if (reduction >= 50) {
          toUnlock.push("improvement-king");
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check rising-star (called from leaderboard route, not from attempt flow)
// ---------------------------------------------------------------------------

/**
 * Check the rising-star achievement when the user views the leaderboard.
 * This avoids loading 100 users on every puzzle attempt.
 */
export async function checkRisingStarAchievement(
  userId: string,
): Promise<AchievementCheckResult> {
  // Check if already unlocked
  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: "rising-star" } },
  });
  if (existing) return { newlyUnlocked: [] };

  // Check if user is in top 100 by weekly correct attempts
  const users = await prisma.user.findMany({
    where: { showOnLeaderboard: true, weeklyCorrectAttempts: { gt: 0 } },
    select: { id: true },
    orderBy: { weeklyCorrectAttempts: "desc" },
    take: 100,
  });

  const isInTop100 = users.some((u) => u.id === userId);
  if (!isInTop100) return { newlyUnlocked: [] };

  const newlyUnlocked = await saveUnlocked(userId, ["rising-star"]);
  return { newlyUnlocked };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Save newly unlocked achievements and return their details.
 */
async function saveUnlocked(
  userId: string,
  achievementIds: string[],
): Promise<UnlockedAchievement[]> {
  if (achievementIds.length === 0) return [];

  const now = new Date();

  await prisma.userAchievement.createMany({
    data: achievementIds.map((achievementId) => ({
      userId,
      achievementId,
      unlockedAt: now,
    })),
    skipDuplicates: true,
  });

  return achievementIds.map((id) => {
    const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id)!;
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlockedAt: now,
    };
  });
}

// ---------------------------------------------------------------------------
// getUserAchievements (unchanged - used by /api/user/achievements)
// ---------------------------------------------------------------------------

/**
 * Get all achievements with unlock status for a user
 */
export async function getUserAchievements(userId: string): Promise<{
  achievements: Array<
    AchievementDefinition & { unlockedAt: Date | null; isUnlocked: boolean }
  >;
  totalUnlocked: number;
  totalAchievements: number;
}> {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true, unlockedAt: true },
  });

  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]),
  );

  const achievements = ACHIEVEMENT_DEFINITIONS.map((def) => ({
    ...def,
    unlockedAt: unlockedMap.get(def.id) ?? null,
    isUnlocked: unlockedMap.has(def.id),
  }));

  return {
    achievements,
    totalUnlocked: userAchievements.length,
    totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
  };
}
