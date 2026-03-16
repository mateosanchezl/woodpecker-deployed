export interface AppBootstrapUser {
  id: string;
  email: string;
  name: string | null;
  estimatedRating: number;
  preferredSetSize: number;
  targetCycles: number;
  autoStartNextPuzzle: boolean;
  boardTheme: string;
  hasCompletedOnboarding: boolean;
  showOnLeaderboard: boolean;
  puzzleSetCount: number;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  lastTrainedDate: string | null;
  totalXp: number;
  currentLevel: number;
  weeklyXp: number;
}

export interface AppBootstrapPuzzleSet {
  id: string;
  name: string;
  size: number;
  focusTheme: string | null;
  targetCycles: number;
  targetRating: number;
  minRating: number;
  maxRating: number;
  isActive: boolean;
  createdAt: string;
  currentCycle: number | null;
  currentCycleId: string | null;
  completedCycles: number;
  lastTrainedAt: string | null;
}

export interface AppBootstrapResponse {
  user: AppBootstrapUser;
  sets: AppBootstrapPuzzleSet[];
}

interface LatestCycleSource {
  id: string;
  cycleNumber: number;
  completedAt: Date | null;
  startedAt: Date;
}

interface PuzzleSetSource {
  id: string;
  name: string;
  size: number;
  focusTheme: string | null;
  targetCycles: number;
  targetRating: number;
  minRating: number;
  maxRating: number;
  isActive: boolean;
  createdAt: Date;
  lastTrainedAt: Date | null;
  cycles: LatestCycleSource[];
}

interface AppUserSource {
  id: string;
  email: string;
  name: string | null;
  estimatedRating: number;
  preferredSetSize: number;
  targetCycles: number;
  autoStartNextPuzzle: boolean;
  boardTheme: string;
  hasCompletedOnboarding: boolean;
  showOnLeaderboard: boolean;
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
  lastTrainedDate: Date | null;
  totalXp: number;
  currentLevel: number;
  weeklyXp: number;
  _count?: {
    puzzleSets: number;
  };
}

export function serializePuzzleSets(
  puzzleSets: PuzzleSetSource[],
): AppBootstrapPuzzleSet[] {
  const setsWithActivity = puzzleSets.map((set) => {
    const latestCycle = set.cycles[0];
    const isCurrentCycleComplete = latestCycle?.completedAt !== null;
    const lastTrainedAt = set.lastTrainedAt || latestCycle?.startedAt || null;

    return {
      id: set.id,
      name: set.name,
      size: set.size,
      focusTheme: set.focusTheme,
      targetCycles: set.targetCycles,
      targetRating: set.targetRating,
      minRating: set.minRating,
      maxRating: set.maxRating,
      isActive: set.isActive,
      createdAt: set.createdAt.toISOString(),
      currentCycle: latestCycle?.cycleNumber || null,
      currentCycleId: latestCycle && !isCurrentCycleComplete ? latestCycle.id : null,
      completedCycles: isCurrentCycleComplete
        ? latestCycle?.cycleNumber ?? 0
        : (latestCycle?.cycleNumber ?? 1) - 1,
      lastTrainedAt: lastTrainedAt?.toISOString() ?? null,
    } satisfies AppBootstrapPuzzleSet;
  });

  setsWithActivity.sort((a, b) => {
    if (!a.lastTrainedAt && !b.lastTrainedAt) return 0;
    if (!a.lastTrainedAt) return 1;
    if (!b.lastTrainedAt) return -1;
    return new Date(b.lastTrainedAt).getTime() - new Date(a.lastTrainedAt).getTime();
  });

  return setsWithActivity;
}

export function serializeAppUser(
  user: AppUserSource,
  puzzleSetCount: number,
): AppBootstrapUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    estimatedRating: user.estimatedRating,
    preferredSetSize: user.preferredSetSize,
    targetCycles: user.targetCycles,
    autoStartNextPuzzle: user.autoStartNextPuzzle,
    boardTheme: user.boardTheme,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    showOnLeaderboard: user.showOnLeaderboard,
    puzzleSetCount,
    createdAt: user.createdAt.toISOString(),
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastTrainedDate: user.lastTrainedDate?.toISOString() ?? null,
    totalXp: user.totalXp,
    currentLevel: user.currentLevel,
    weeklyXp: user.weeklyXp,
  };
}
