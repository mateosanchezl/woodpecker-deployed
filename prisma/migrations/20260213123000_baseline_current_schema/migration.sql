-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "estimatedRating" INTEGER NOT NULL DEFAULT 1200,
    "preferredSetSize" INTEGER NOT NULL DEFAULT 150,
    "targetCycles" INTEGER NOT NULL DEFAULT 5,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastTrainedDate" TIMESTAMP(3),
    "streakUpdatedAt" TIMESTAMP(3),
    "showOnLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "totalCorrectAttempts" INTEGER NOT NULL DEFAULT 0,
    "weeklyCorrectAttempts" INTEGER NOT NULL DEFAULT 0,
    "weeklyCorrectStartDate" TIMESTAMP(3),
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "weeklyXp" INTEGER NOT NULL DEFAULT 0,
    "weeklyXpStartDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "headline" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puzzle" (
    "id" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "moves" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "ratingDeviation" INTEGER NOT NULL,
    "popularity" INTEGER NOT NULL,
    "nbPlays" INTEGER NOT NULL,
    "themes" TEXT[],
    "gameUrl" TEXT,
    "openingTags" TEXT[],
    "moveCount" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "hasMate" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleSet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Training Set',
    "targetRating" INTEGER NOT NULL,
    "minRating" INTEGER NOT NULL,
    "maxRating" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "focusTheme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetCycles" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PuzzleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleInSet" (
    "id" TEXT NOT NULL,
    "puzzleSetId" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "averageTime" DOUBLE PRECISION,

    CONSTRAINT "PuzzleInSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL,
    "puzzleSetId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalTime" INTEGER,
    "totalPuzzles" INTEGER NOT NULL,
    "solvedCorrect" INTEGER NOT NULL DEFAULT 0,
    "solvedIncorrect" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "puzzleInSetId" TEXT NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "wasSkipped" BOOLEAN NOT NULL DEFAULT false,
    "movesPlayed" TEXT[],

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","achievementId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_showOnLeaderboard_totalCorrectAttempts_idx" ON "User"("showOnLeaderboard", "totalCorrectAttempts" DESC);

-- CreateIndex
CREATE INDEX "User_showOnLeaderboard_weeklyCorrectAttempts_idx" ON "User"("showOnLeaderboard", "weeklyCorrectAttempts" DESC);

-- CreateIndex
CREATE INDEX "User_showOnLeaderboard_totalXp_idx" ON "User"("showOnLeaderboard", "totalXp" DESC);

-- CreateIndex
CREATE INDEX "User_showOnLeaderboard_weeklyXp_idx" ON "User"("showOnLeaderboard", "weeklyXp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "AppReview_userId_key" ON "AppReview"("userId");

-- CreateIndex
CREATE INDEX "AppReview_rating_idx" ON "AppReview"("rating");

-- CreateIndex
CREATE INDEX "AppReview_createdAt_idx" ON "AppReview"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Puzzle_rating_idx" ON "Puzzle"("rating");

-- CreateIndex
CREATE INDEX "Puzzle_popularity_idx" ON "Puzzle"("popularity");

-- CreateIndex
CREATE INDEX "Puzzle_themes_gin_idx" ON "Puzzle" USING GIN ("themes");

-- CreateIndex
CREATE INDEX "Puzzle_difficulty_idx" ON "Puzzle"("difficulty");

-- CreateIndex
CREATE INDEX "Puzzle_rating_popularity_idx" ON "Puzzle"("rating", "popularity");

-- CreateIndex
CREATE INDEX "PuzzleSet_userId_isActive_idx" ON "PuzzleSet"("userId", "isActive");

-- CreateIndex
CREATE INDEX "PuzzleSet_createdAt_idx" ON "PuzzleSet"("createdAt");

-- CreateIndex
CREATE INDEX "PuzzleInSet_puzzleSetId_idx" ON "PuzzleInSet"("puzzleSetId");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleInSet_puzzleSetId_puzzleId_key" ON "PuzzleInSet"("puzzleSetId", "puzzleId");

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleInSet_puzzleSetId_position_key" ON "PuzzleInSet"("puzzleSetId", "position");

-- CreateIndex
CREATE INDEX "Cycle_puzzleSetId_idx" ON "Cycle"("puzzleSetId");

-- CreateIndex
CREATE INDEX "Cycle_startedAt_idx" ON "Cycle"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cycle_puzzleSetId_cycleNumber_key" ON "Cycle"("puzzleSetId", "cycleNumber");

-- CreateIndex
CREATE INDEX "Attempt_cycleId_idx" ON "Attempt"("cycleId");

-- CreateIndex
CREATE INDEX "Attempt_puzzleInSetId_idx" ON "Attempt"("puzzleInSetId");

-- CreateIndex
CREATE INDEX "Attempt_attemptedAt_idx" ON "Attempt"("attemptedAt");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- AddForeignKey
ALTER TABLE "AppReview" ADD CONSTRAINT "AppReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleSet" ADD CONSTRAINT "PuzzleSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleInSet" ADD CONSTRAINT "PuzzleInSet_puzzleSetId_fkey" FOREIGN KEY ("puzzleSetId") REFERENCES "PuzzleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuzzleInSet" ADD CONSTRAINT "PuzzleInSet_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycle" ADD CONSTRAINT "Cycle_puzzleSetId_fkey" FOREIGN KEY ("puzzleSetId") REFERENCES "PuzzleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_puzzleInSetId_fkey" FOREIGN KEY ("puzzleInSetId") REFERENCES "PuzzleInSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

