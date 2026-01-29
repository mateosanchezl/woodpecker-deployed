/**
 * Achievement evaluation engine
 * Checks and unlocks achievements based on user actions
 */

import { prisma } from "@/lib/prisma";
import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition,
} from "./definitions";

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
 * Context provided when a puzzle attempt is recorded
 */
export interface AttemptContext {
  isCorrect: boolean;
  timeSpentMs: number;
  attemptedAt: Date;
  puzzleThemes: string[];
  puzzleRating?: number;
}

/**
 * Context provided when a cycle is completed
 */
export interface CycleCompleteContext {
  puzzleSetId: string;
  cycleNumber: number;
  accuracy: number; // 0-100
  totalPuzzles: number;
  correctPuzzles: number;
}

/**
 * Context provided when streak is updated
 */
export interface StreakContext {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Get user's already unlocked achievement IDs
 */
async function getUserUnlockedAchievementIds(
  userId: string,
): Promise<Set<string>> {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  return new Set(userAchievements.map((ua) => ua.achievementId));
}

/**
 * Unlock achievements for a user
 */
async function unlockAchievements(
  userId: string,
  achievementIds: string[],
): Promise<UnlockedAchievement[]> {
  if (achievementIds.length === 0) return [];

  const now = new Date();

  // Create user achievements
  await prisma.userAchievement.createMany({
    data: achievementIds.map((achievementId) => ({
      userId,
      achievementId,
      unlockedAt: now,
    })),
    skipDuplicates: true,
  });

  // Return the unlocked achievement details
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

/**
 * Check puzzle count achievements (first-blood, century, half-thousand, millennium)
 */
async function checkPuzzleCountAchievements(
  userId: string,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  // Get total correct attempts for user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalCorrectAttempts: true },
  });

  if (!user) return toUnlock;

  const totalCorrect = user.totalCorrectAttempts;

  // Check first-blood
  if (!unlockedIds.has("first-blood") && totalCorrect >= 1) {
    toUnlock.push("first-blood");
  }

  // Check century
  if (!unlockedIds.has("century") && totalCorrect >= 100) {
    toUnlock.push("century");
  }

  // Check half-thousand
  if (!unlockedIds.has("half-thousand") && totalCorrect >= 500) {
    toUnlock.push("half-thousand");
  }

  // Check millennium
  if (!unlockedIds.has("millennium") && totalCorrect >= 1000) {
    toUnlock.push("millennium");
  }

  return toUnlock;
}

/**
 * Check speed achievement (speed-demon)
 */
function checkSpeedAchievement(
  context: AttemptContext,
  unlockedIds: Set<string>,
): string[] {
  const toUnlock: string[] = [];

  if (
    !unlockedIds.has("speed-demon") &&
    context.isCorrect &&
    context.timeSpentMs < 3000
  ) {
    toUnlock.push("speed-demon");
  }

  return toUnlock;
}

/**
 * Check time-of-day achievements (early-bird, night-owl)
 */
function checkTimeOfDayAchievements(
  context: AttemptContext,
  unlockedIds: Set<string>,
): string[] {
  const toUnlock: string[] = [];
  const hour = context.attemptedAt.getHours();

  // Early bird: before 7am
  if (!unlockedIds.has("early-bird") && hour < 7) {
    toUnlock.push("early-bird");
  }

  // Night owl: between midnight and 5am
  if (!unlockedIds.has("night-owl") && hour >= 0 && hour < 5) {
    toUnlock.push("night-owl");
  }

  return toUnlock;
}

/**
 * Check theme accuracy achievement (theme-master-fork)
 */
async function checkThemeAccuracyAchievements(
  userId: string,
  context: AttemptContext,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  // Only check if the puzzle has the fork theme
  if (!context.puzzleThemes.includes("fork")) return toUnlock;
  if (unlockedIds.has("theme-master-fork")) return toUnlock;

  // Get all attempts on fork puzzles for this user
  const forkAttempts = await prisma.attempt.findMany({
    where: {
      puzzleInSet: {
        puzzle: {
          themes: { has: "fork" },
        },
        puzzleSet: {
          userId,
        },
      },
    },
    select: {
      isCorrect: true,
    },
  });

  const totalAttempts = forkAttempts.length;
  const correctAttempts = forkAttempts.filter((a) => a.isCorrect).length;

  // Need at least 20 attempts and 90% accuracy
  if (totalAttempts >= 20) {
    const accuracy = (correctAttempts / totalAttempts) * 100;
    if (accuracy >= 90) {
      toUnlock.push("theme-master-fork");
    }
  }

  return toUnlock;
}

/**
 * Check cycle accuracy achievement (perfectionist)
 */
function checkCycleAccuracyAchievement(
  context: CycleCompleteContext,
  unlockedIds: Set<string>,
): string[] {
  const toUnlock: string[] = [];

  if (!unlockedIds.has("perfectionist") && context.accuracy === 100) {
    toUnlock.push("perfectionist");
  }

  return toUnlock;
}

/**
 * Check cycles same set achievement (woodpecker-pro)
 */
async function checkCyclesSameSetAchievement(
  userId: string,
  context: CycleCompleteContext,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("woodpecker-pro")) return toUnlock;

  // Count completed cycles for this puzzle set
  const completedCycles = await prisma.cycle.count({
    where: {
      puzzleSetId: context.puzzleSetId,
      completedAt: { not: null },
      puzzleSet: {
        userId,
      },
    },
  });

  if (completedCycles >= 5) {
    toUnlock.push("woodpecker-pro");
  }

  return toUnlock;
}

/**
 * Check streak achievements (on-fire, unstoppable)
 */
function checkStreakAchievements(
  context: StreakContext,
  unlockedIds: Set<string>,
): string[] {
  const toUnlock: string[] = [];
  const streak = Math.max(context.currentStreak, context.longestStreak);

  if (!unlockedIds.has("on-fire") && streak >= 7) {
    toUnlock.push("on-fire");
  }

  if (!unlockedIds.has("unstoppable") && streak >= 30) {
    toUnlock.push("unstoppable");
  }

  return toUnlock;
}

/**
 * Check weekly puzzle count achievement (weekly-warrior)
 */
async function checkWeeklyPuzzleCountAchievement(
  userId: string,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("weekly-warrior")) return toUnlock;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyCorrectAttempts: true },
  });

  if (user && user.weeklyCorrectAttempts >= 100) {
    toUnlock.push("weekly-warrior");
  }

  return toUnlock;
}

/**
 * Check lightning speed achievement (lightning-fast)
 */
function checkLightningSpeedAchievement(
  context: AttemptContext,
  unlockedIds: Set<string>,
): string[] {
  const toUnlock: string[] = [];

  if (
    !unlockedIds.has("lightning-fast") &&
    context.isCorrect &&
    context.timeSpentMs < 1500
  ) {
    toUnlock.push("lightning-fast");
  }

  return toUnlock;
}

/**
 * Check speed streak achievement (speed-streak)
 */
async function checkSpeedStreakAchievement(
  userId: string,
  context: AttemptContext,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("speed-streak")) return toUnlock;
  if (!context.isCorrect || context.timeSpentMs >= 5000) return toUnlock;

  // Get the last 10 attempts for this user
  const recentAttempts = await prisma.attempt.findMany({
    where: {
      puzzleInSet: {
        puzzleSet: { userId },
      },
    },
    orderBy: { attemptedAt: "desc" },
    take: 10,
    select: { isCorrect: true, timeSpent: true },
  });

  // Check if all recent attempts are correct and under 5 seconds
  if (
    recentAttempts.length >= 10 &&
    recentAttempts.every((a) => a.isCorrect && a.timeSpent < 5000)
  ) {
    toUnlock.push("speed-streak");
  }

  return toUnlock;
}

/**
 * Check first cycle complete achievement (cycle-complete)
 */
async function checkFirstCycleCompleteAchievement(
  userId: string,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("cycle-complete")) return toUnlock;

  const completedCyclesCount = await prisma.cycle.count({
    where: {
      completedAt: { not: null },
      puzzleSet: { userId },
    },
  });

  if (completedCyclesCount >= 1) {
    toUnlock.push("cycle-complete");
  }

  return toUnlock;
}

/**
 * Check cycles same set extended achievement (woodpecker-master)
 */
async function checkCyclesSameSetExtendedAchievement(
  userId: string,
  context: CycleCompleteContext,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("woodpecker-master")) return toUnlock;

  const completedCycles = await prisma.cycle.count({
    where: {
      puzzleSetId: context.puzzleSetId,
      completedAt: { not: null },
      puzzleSet: { userId },
    },
  });

  if (completedCycles >= 10) {
    toUnlock.push("woodpecker-master");
  }

  return toUnlock;
}

/**
 * Check cycle time improvement achievement (improvement-king)
 */
async function checkCycleTimeImprovementAchievement(
  userId: string,
  context: CycleCompleteContext,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("improvement-king")) return toUnlock;

  // Get first and latest completed cycles for this puzzle set
  const cycles = await prisma.cycle.findMany({
    where: {
      puzzleSetId: context.puzzleSetId,
      completedAt: { not: null },
      totalTime: { not: null },
      puzzleSet: { userId },
    },
    orderBy: { cycleNumber: "asc" },
    select: { cycleNumber: true, totalTime: true },
  });

  if (cycles.length < 2) return toUnlock;

  const firstCycle = cycles[0];
  const latestCycle = cycles[cycles.length - 1];

  if (!firstCycle.totalTime || !latestCycle.totalTime) return toUnlock;

  const percentReduction =
    ((firstCycle.totalTime - latestCycle.totalTime) / firstCycle.totalTime) *
    100;

  if (percentReduction >= 50) {
    toUnlock.push("improvement-king");
  }

  return toUnlock;
}

/**
 * Check extended streak achievements (consistent-trainer, dedicated)
 */
function checkStreakExtendedAchievements(
  context: StreakContext,
  unlockedIds: Set<string>,
): string[] {
  const toUnlock: string[] = [];
  const streak = Math.max(context.currentStreak, context.longestStreak);

  if (!unlockedIds.has("consistent-trainer") && streak >= 14) {
    toUnlock.push("consistent-trainer");
  }

  if (!unlockedIds.has("dedicated") && streak >= 60) {
    toUnlock.push("dedicated");
  }

  return toUnlock;
}

/**
 * Check cycle high accuracy achievement (sharp-shooter)
 */
function checkCycleHighAccuracyAchievement(
  context: CycleCompleteContext,
  unlockedIds: Set<string>,
): string[] {
  const toUnlock: string[] = [];

  if (
    !unlockedIds.has("sharp-shooter") &&
    context.totalPuzzles >= 50 &&
    context.accuracy >= 95
  ) {
    toUnlock.push("sharp-shooter");
  }

  return toUnlock;
}

/**
 * Check consecutive correct achievement (flawless-streak)
 */
async function checkConsecutiveCorrectAchievement(
  userId: string,
  context: AttemptContext,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("flawless-streak")) return toUnlock;
  if (!context.isCorrect) return toUnlock;

  // Get the last 25 attempts for this user
  const recentAttempts = await prisma.attempt.findMany({
    where: {
      puzzleInSet: {
        puzzleSet: { userId },
      },
    },
    orderBy: { attemptedAt: "desc" },
    take: 25,
    select: { isCorrect: true },
  });

  // Check if all recent attempts are correct
  if (recentAttempts.length >= 25 && recentAttempts.every((a) => a.isCorrect)) {
    toUnlock.push("flawless-streak");
  }

  return toUnlock;
}

/**
 * Check perfect cycle strict achievement (no-mistakes)
 */
function checkPerfectCycleStrictAchievement(
  context: CycleCompleteContext,
  unlockedIds: Set<string>,
): string[] {
  const toUnlock: string[] = [];

  if (
    !unlockedIds.has("no-mistakes") &&
    context.totalPuzzles >= 20 &&
    context.accuracy === 100 &&
    context.correctPuzzles === context.totalPuzzles
  ) {
    toUnlock.push("no-mistakes");
  }

  return toUnlock;
}

/**
 * Helper to check theme accuracy using count queries instead of loading all records
 */
async function checkThemeAccuracy(
  userId: string,
  theme: string,
  minAttempts: number,
): Promise<{ total: number; correct: number }> {
  const [total, correct] = await Promise.all([
    prisma.attempt.count({
      where: {
        puzzleInSet: {
          puzzle: { themes: { has: theme } },
          puzzleSet: { userId },
        },
      },
    }),
    prisma.attempt.count({
      where: {
        isCorrect: true,
        puzzleInSet: {
          puzzle: { themes: { has: theme } },
          puzzleSet: { userId },
        },
      },
    }),
  ]);
  return { total, correct };
}

/**
 * Check theme accuracy extended achievements (theme-master-pin, theme-master-skewer, mate-master)
 */
async function checkThemeAccuracyExtendedAchievements(
  userId: string,
  context: AttemptContext,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  // Check for pin theme
  if (
    !unlockedIds.has("theme-master-pin") &&
    context.puzzleThemes.includes("pin")
  ) {
    const { total, correct } = await checkThemeAccuracy(userId, "pin", 20);
    if (total >= 20 && (correct / total) * 100 >= 90) {
      toUnlock.push("theme-master-pin");
    }
  }

  // Check for skewer theme
  if (
    !unlockedIds.has("theme-master-skewer") &&
    context.puzzleThemes.includes("skewer")
  ) {
    const { total, correct } = await checkThemeAccuracy(userId, "skewer", 20);
    if (total >= 20 && (correct / total) * 100 >= 90) {
      toUnlock.push("theme-master-skewer");
    }
  }

  // Check for mate theme
  if (
    !unlockedIds.has("mate-master") &&
    context.puzzleThemes.includes("mate")
  ) {
    const { total, correct } = await checkThemeAccuracy(userId, "mate", 30);
    if (total >= 30 && (correct / total) * 100 >= 90) {
      toUnlock.push("mate-master");
    }
  }

  return toUnlock;
}

/**
 * Check overall accuracy achievement (tactical-prodigy)
 */
async function checkOverallAccuracyAchievement(
  userId: string,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("tactical-prodigy")) return toUnlock;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalCorrectAttempts: true },
  });

  if (!user) return toUnlock;

  // Count total attempts
  const totalAttempts = await prisma.attempt.count({
    where: {
      puzzleInSet: {
        puzzleSet: { userId },
      },
    },
  });

  if (totalAttempts >= 200) {
    const accuracy = (user.totalCorrectAttempts / totalAttempts) * 100;
    if (accuracy >= 85) {
      toUnlock.push("tactical-prodigy");
    }
  }

  return toUnlock;
}

/**
 * Check high rating count achievement (rating-climber)
 */
async function checkHighRatingCountAchievement(
  userId: string,
  puzzleRating: number | undefined,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("rating-climber")) return toUnlock;

  // Skip DB query if current puzzle isn't high-rated (can't unlock on this attempt)
  if (puzzleRating === undefined || puzzleRating < 1800) return toUnlock;

  // Count correct attempts on puzzles with rating >= 1800
  const highRatingCount = await prisma.attempt.count({
    where: {
      isCorrect: true,
      puzzleInSet: {
        puzzle: { rating: { gte: 1800 } },
        puzzleSet: { userId },
      },
    },
  });

  if (highRatingCount >= 50) {
    toUnlock.push("rating-climber");
  }

  return toUnlock;
}

/**
 * Check multi-theme mastery achievement (versatile)
 * Requires 5 themes with >= 80% accuracy and >= 15 attempts each
 */
async function checkMultiThemeMasteryAchievement(
  userId: string,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("versatile")) return toUnlock;

  // First check if user has enough total attempts (minimum 75 = 5 themes * 15 each)
  const totalAttempts = await prisma.attempt.count({
    where: {
      puzzleInSet: {
        puzzleSet: { userId },
      },
    },
  });

  // Early exit if not enough attempts to qualify
  if (totalAttempts < 75) return toUnlock;

  // Check common tactical themes for mastery
  const themesToCheck = [
    "fork",
    "pin",
    "skewer",
    "discoveredAttack",
    "doubleCheck",
    "mate",
    "mateIn1",
    "mateIn2",
    "sacrifice",
    "deflection",
    "decoy",
    "interference",
    "clearance",
    "xRayAttack",
    "zugzwang",
    "quietMove",
    "defensiveMove",
    "attraction",
  ];

  let qualifyingThemes = 0;

  for (const theme of themesToCheck) {
    if (qualifyingThemes >= 5) break; // Already qualified

    const { total, correct } = await checkThemeAccuracy(userId, theme, 15);
    if (total >= 15) {
      const accuracy = (correct / total) * 100;
      if (accuracy >= 80) {
        qualifyingThemes++;
      }
    }
  }

  if (qualifyingThemes >= 5) {
    toUnlock.push("versatile");
  }

  return toUnlock;
}

/**
 * Check weekly leaderboard rank achievement (rising-star)
 */
async function checkWeeklyLeaderboardRankAchievement(
  userId: string,
  unlockedIds: Set<string>,
): Promise<string[]> {
  const toUnlock: string[] = [];

  if (unlockedIds.has("rising-star")) return toUnlock;

  // Get all users on the leaderboard ordered by weekly correct attempts
  const users = await prisma.user.findMany({
    where: { showOnLeaderboard: true },
    select: { id: true, weeklyCorrectAttempts: true },
    orderBy: { weeklyCorrectAttempts: "desc" },
    take: 100,
  });

  // Check if current user is in top 100
  const userRank = users.findIndex((u) => u.id === userId);
  if (userRank !== -1 && userRank < 100) {
    toUnlock.push("rising-star");
  }

  return toUnlock;
}

/**
 * Check achievements after a puzzle attempt is recorded
 */
export async function checkAchievementsAfterAttempt(
  userId: string,
  context: AttemptContext,
): Promise<AchievementCheckResult> {
  const unlockedIds = await getUserUnlockedAchievementIds(userId);
  const toUnlock: string[] = [];

  // Only check achievements for correct attempts (except time-of-day)
  if (context.isCorrect) {
    // Check puzzle count achievements (first-blood, century, half-thousand, millennium)
    const puzzleCountAchievements = await checkPuzzleCountAchievements(
      userId,
      unlockedIds,
    );
    toUnlock.push(...puzzleCountAchievements);

    // Check weekly puzzle count achievement (weekly-warrior)
    const weeklyPuzzleCount = await checkWeeklyPuzzleCountAchievement(
      userId,
      unlockedIds,
    );
    toUnlock.push(...weeklyPuzzleCount);

    // Check speed achievements (speed-demon, lightning-fast)
    toUnlock.push(...checkSpeedAchievement(context, unlockedIds));
    toUnlock.push(...checkLightningSpeedAchievement(context, unlockedIds));

    // Check speed streak achievement (speed-streak)
    const speedStreak = await checkSpeedStreakAchievement(
      userId,
      context,
      unlockedIds,
    );
    toUnlock.push(...speedStreak);

    // Check consecutive correct achievement (flawless-streak)
    const consecutiveCorrect = await checkConsecutiveCorrectAchievement(
      userId,
      context,
      unlockedIds,
    );
    toUnlock.push(...consecutiveCorrect);

    // Check theme accuracy achievements (theme-master-fork, theme-master-pin, theme-master-skewer, mate-master)
    const themeAchievements = await checkThemeAccuracyAchievements(
      userId,
      context,
      unlockedIds,
    );
    toUnlock.push(...themeAchievements);

    const themeAchievementsExtended =
      await checkThemeAccuracyExtendedAchievements(
        userId,
        context,
        unlockedIds,
      );
    toUnlock.push(...themeAchievementsExtended);

    // Check overall accuracy achievement (tactical-prodigy)
    const overallAccuracy = await checkOverallAccuracyAchievement(
      userId,
      unlockedIds,
    );
    toUnlock.push(...overallAccuracy);

    // Check high rating count achievement (rating-climber)
    const highRatingCount = await checkHighRatingCountAchievement(
      userId,
      context.puzzleRating,
      unlockedIds,
    );
    toUnlock.push(...highRatingCount);

    // Check multi-theme mastery achievement (versatile)
    const multiThemeMastery = await checkMultiThemeMasteryAchievement(
      userId,
      unlockedIds,
    );
    toUnlock.push(...multiThemeMastery);

    // Check weekly leaderboard rank achievement (rising-star)
    const leaderboardRank = await checkWeeklyLeaderboardRankAchievement(
      userId,
      unlockedIds,
    );
    toUnlock.push(...leaderboardRank);
  }

  // Time-of-day achievements apply to any attempt
  toUnlock.push(...checkTimeOfDayAchievements(context, unlockedIds));

  // Unlock the achievements
  const newlyUnlocked = await unlockAchievements(userId, toUnlock);

  return { newlyUnlocked };
}

/**
 * Check achievements after a cycle is completed
 */
export async function checkAchievementsAfterCycleComplete(
  userId: string,
  context: CycleCompleteContext,
): Promise<AchievementCheckResult> {
  const unlockedIds = await getUserUnlockedAchievementIds(userId);
  const toUnlock: string[] = [];

  // Check cycle accuracy achievement (perfectionist)
  toUnlock.push(...checkCycleAccuracyAchievement(context, unlockedIds));

  // Check cycles same set achievement (woodpecker-pro)
  const cyclesSameSet = await checkCyclesSameSetAchievement(
    userId,
    context,
    unlockedIds,
  );
  toUnlock.push(...cyclesSameSet);

  // Check first cycle complete achievement (cycle-complete)
  const firstCycleComplete = await checkFirstCycleCompleteAchievement(
    userId,
    unlockedIds,
  );
  toUnlock.push(...firstCycleComplete);

  // Check cycles same set extended achievement (woodpecker-master)
  const cyclesSameSetExtended = await checkCyclesSameSetExtendedAchievement(
    userId,
    context,
    unlockedIds,
  );
  toUnlock.push(...cyclesSameSetExtended);

  // Check cycle time improvement achievement (improvement-king)
  const cycleTimeImprovement = await checkCycleTimeImprovementAchievement(
    userId,
    context,
    unlockedIds,
  );
  toUnlock.push(...cycleTimeImprovement);

  // Check cycle high accuracy achievement (sharp-shooter)
  toUnlock.push(...checkCycleHighAccuracyAchievement(context, unlockedIds));

  // Check perfect cycle strict achievement (no-mistakes)
  toUnlock.push(...checkPerfectCycleStrictAchievement(context, unlockedIds));

  // Unlock the achievements
  const newlyUnlocked = await unlockAchievements(userId, toUnlock);

  return { newlyUnlocked };
}

/**
 * Check achievements after streak is updated
 */
export async function checkAchievementsAfterStreakUpdate(
  userId: string,
  context: StreakContext,
): Promise<AchievementCheckResult> {
  const unlockedIds = await getUserUnlockedAchievementIds(userId);
  const toUnlock: string[] = [];

  // Check streak achievements (on-fire, unstoppable)
  toUnlock.push(...checkStreakAchievements(context, unlockedIds));

  // Check extended streak achievements (consistent-trainer, dedicated)
  toUnlock.push(...checkStreakExtendedAchievements(context, unlockedIds));

  // Unlock the achievements
  const newlyUnlocked = await unlockAchievements(userId, toUnlock);

  return { newlyUnlocked };
}

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
