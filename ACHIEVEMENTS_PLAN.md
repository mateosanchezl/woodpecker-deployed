# Plan: Add 20 New Achievements to Woodpecker Chess App

## Overview

Add 20 new achievements to complement the existing 10, focusing on competitive/social elements, milestones, and performance tracking. All achievements are designed to be attainable within the first month for most users.

## Achievement Summary by Category

### Puzzles (3 new achievements)
Progressive milestones for puzzle solving:

1. **Half Thousand** 🎖️ - Solve 500 puzzles correctly
2. **Millennium** 👑 - Solve 1000 puzzles correctly
3. **Weekly Warrior** 📅 - Solve 100 puzzles in a single week

### Speed (2 new achievements)
Enhanced speed challenges:

4. **Lightning Fast** ⚡ - Solve a puzzle in under 1.5 seconds
5. **Speed Streak** 💨 - Solve 10 consecutive puzzles in under 5 seconds each

### Cycles (3 new achievements)
Cycle completion & improvement tracking:

6. **Cycle Complete** ♻️ - Complete your first full cycle
7. **Woodpecker Master** 🏆 - Complete 10 cycles of the same set
8. **Improvement King** 📈 - Reduce cycle completion time by 50% compared to first cycle

### Streaks (2 new achievements)
Extended consistency rewards:

9. **Consistent Trainer** 💪 - Train for 14 consecutive days
10. **Dedicated** 🔱 - Train for 60 consecutive days

### Accuracy (3 new achievements - NEW CATEGORY)
Performance excellence achievements:

11. **Sharp Shooter** 🎯 - Maintain 95% accuracy over 50 puzzles in a cycle
12. **Flawless Streak** ✅ - Solve 25 consecutive puzzles correctly
13. **No Mistakes** 💎 - Complete a full cycle without a single error (min 20 puzzles, no skips)

### Themes (3 new achievements)
Tactical mastery expansion:

14. **Theme Master: Pins** 📌 - 90%+ accuracy on pin puzzles (min 20 attempts)
15. **Theme Master: Skewers** 🗡️ - 90%+ accuracy on skewer puzzles (min 20 attempts)
16. **Mate Master** ♟️ - 90%+ accuracy on checkmate puzzles (min 30 attempts)

### Mastery (3 new achievements - NEW CATEGORY)
Advanced skill demonstration:

17. **Tactical Prodigy** 🧠 - Achieve 85%+ accuracy across 200 total attempts
18. **Rating Climber** 📊 - Solve 50 puzzles with rating 1800+
19. **Versatile** 🎨 - Solve puzzles from 5 different tactical themes with 80%+ accuracy (min 15 each)

### Leaderboard (1 new achievement - NEW CATEGORY)
Competitive achievements:

20. **Rising Star** ⭐ - Reach top 100 on the weekly leaderboard

## Detailed Achievement Specifications

### Achievement Data Structure

Each achievement includes:
- **id**: Unique kebab-case identifier
- **name**: Display name (catchy and motivating)
- **description**: One sentence explaining unlock criteria
- **category**: puzzles | speed | cycles | streaks | accuracy | themes | mastery | leaderboard
- **icon**: Single emoji representing the achievement
- **sortOrder**: Number for ordering within category
- **unlock criteria**: Specific, measurable condition

### Complete Achievement List

```typescript
// PUZZLES (sortOrder 3-5)
{
  id: 'half-thousand',
  name: 'Half Thousand',
  description: 'Solve 500 puzzles correctly',
  category: 'puzzles',
  icon: '🎖️',
  sortOrder: 3,
  criteria: { type: 'puzzle_count', count: 500 }
}

{
  id: 'millennium',
  name: 'Millennium',
  description: 'Solve 1000 puzzles correctly',
  category: 'puzzles',
  icon: '👑',
  sortOrder: 4,
  criteria: { type: 'puzzle_count', count: 1000 }
}

{
  id: 'weekly-warrior',
  name: 'Weekly Warrior',
  description: 'Solve 100 puzzles in a single week',
  category: 'puzzles',
  icon: '📅',
  sortOrder: 5,
  criteria: { type: 'weekly_puzzle_count', count: 100 }
}

// SPEED (sortOrder 11-12)
{
  id: 'lightning-fast',
  name: 'Lightning Fast',
  description: 'Solve a puzzle in under 1.5 seconds',
  category: 'speed',
  icon: '⚡',
  sortOrder: 11,
  criteria: { type: 'lightning_speed', milliseconds: 1500 }
}

{
  id: 'speed-streak',
  name: 'Speed Streak',
  description: 'Solve 10 consecutive puzzles in under 5 seconds each',
  category: 'speed',
  icon: '💨',
  sortOrder: 12,
  criteria: { type: 'speed_streak', consecutiveCount: 10, maxSeconds: 5 }
}

// CYCLES (sortOrder 22-24)
{
  id: 'cycle-complete',
  name: 'Cycle Complete',
  description: 'Complete your first full cycle',
  category: 'cycles',
  icon: '♻️',
  sortOrder: 22,
  criteria: { type: 'first_cycle_complete' }
}

{
  id: 'woodpecker-master',
  name: 'Woodpecker Master',
  description: 'Complete 10 cycles of the same set',
  category: 'cycles',
  icon: '🏆',
  sortOrder: 23,
  criteria: { type: 'cycles_same_set_extended', count: 10 }
}

{
  id: 'improvement-king',
  name: 'Improvement King',
  description: 'Reduce cycle completion time by 50% compared to first cycle',
  category: 'cycles',
  icon: '📈',
  sortOrder: 24,
  criteria: { type: 'cycle_time_improvement', percentReduction: 50 }
}

// STREAKS (sortOrder 42-43)
{
  id: 'consistent-trainer',
  name: 'Consistent Trainer',
  description: 'Train for 14 consecutive days',
  category: 'streaks',
  icon: '💪',
  sortOrder: 42,
  criteria: { type: 'streak_extended', days: 14 }
}

{
  id: 'dedicated',
  name: 'Dedicated',
  description: 'Train for 60 consecutive days',
  category: 'streaks',
  icon: '🔱',
  sortOrder: 43,
  criteria: { type: 'streak_extended', days: 60 }
}

// ACCURACY (sortOrder 60-62) - NEW CATEGORY
{
  id: 'sharp-shooter',
  name: 'Sharp Shooter',
  description: 'Maintain 95% accuracy over 50 puzzles in a cycle',
  category: 'accuracy',
  icon: '🎯',
  sortOrder: 60,
  criteria: { type: 'cycle_high_accuracy', percent: 95, minPuzzles: 50 }
}

{
  id: 'flawless-streak',
  name: 'Flawless Streak',
  description: 'Solve 25 consecutive puzzles correctly',
  category: 'accuracy',
  icon: '✅',
  sortOrder: 61,
  criteria: { type: 'consecutive_correct', count: 25 }
}

{
  id: 'no-mistakes',
  name: 'No Mistakes',
  description: 'Complete a full cycle without a single error (min 20 puzzles)',
  category: 'accuracy',
  icon: '💎',
  sortOrder: 62,
  criteria: { type: 'perfect_cycle_strict', minPuzzles: 20 }
}

// THEMES (sortOrder 51-53)
{
  id: 'theme-master-pin',
  name: 'Theme Master: Pins',
  description: '90%+ accuracy on pin puzzles (min 20 attempts)',
  category: 'themes',
  icon: '📌',
  sortOrder: 51,
  criteria: { type: 'theme_accuracy_extended', theme: 'pin', percent: 90, minAttempts: 20 }
}

{
  id: 'theme-master-skewer',
  name: 'Theme Master: Skewers',
  description: '90%+ accuracy on skewer puzzles (min 20 attempts)',
  category: 'themes',
  icon: '🗡️',
  sortOrder: 52,
  criteria: { type: 'theme_accuracy_extended', theme: 'skewer', percent: 90, minAttempts: 20 }
}

{
  id: 'mate-master',
  name: 'Mate Master',
  description: '90%+ accuracy on checkmate puzzles (min 30 attempts)',
  category: 'themes',
  icon: '♟️',
  sortOrder: 53,
  criteria: { type: 'theme_accuracy_extended', theme: 'mate', percent: 90, minAttempts: 30 }
}

// MASTERY (sortOrder 70-72) - NEW CATEGORY
{
  id: 'tactical-prodigy',
  name: 'Tactical Prodigy',
  description: 'Achieve 85%+ accuracy across 200 total attempts',
  category: 'mastery',
  icon: '🧠',
  sortOrder: 70,
  criteria: { type: 'overall_accuracy', percent: 85, minAttempts: 200 }
}

{
  id: 'rating-climber',
  name: 'Rating Climber',
  description: 'Solve 50 puzzles with rating 1800+',
  category: 'mastery',
  icon: '📊',
  sortOrder: 71,
  criteria: { type: 'high_rating_count', minRating: 1800, count: 50 }
}

{
  id: 'versatile',
  name: 'Versatile',
  description: 'Solve puzzles from 5 different tactical themes with 80%+ accuracy (min 15 each)',
  category: 'mastery',
  icon: '🎨',
  sortOrder: 72,
  criteria: { type: 'multi_theme_mastery', themeCount: 5, percent: 80, minPerTheme: 15 }
}

// LEADERBOARD (sortOrder 80) - NEW CATEGORY
{
  id: 'rising-star',
  name: 'Rising Star',
  description: 'Reach top 100 on the weekly leaderboard',
  category: 'leaderboard',
  icon: '⭐',
  sortOrder: 80,
  criteria: { type: 'weekly_leaderboard_rank', maxRank: 100 }
}
```

## Implementation Steps

### Step 1: Update Type Definitions

**File:** `lib/achievements/definitions.ts`

1. Add new categories to `AchievementCategory` type:
```typescript
export type AchievementCategory =
  | 'puzzles'
  | 'streaks'
  | 'speed'
  | 'cycles'
  | 'time'
  | 'themes'
  | 'accuracy'      // NEW
  | 'mastery'       // NEW
  | 'leaderboard'   // NEW
```

2. Add new criteria types to `AchievementCriteria` union:
```typescript
export type AchievementCriteria =
  // ... existing criteria
  | { type: 'weekly_puzzle_count'; count: number }
  | { type: 'lightning_speed'; milliseconds: number }
  | { type: 'speed_streak'; consecutiveCount: number; maxSeconds: number }
  | { type: 'first_cycle_complete' }
  | { type: 'cycles_same_set_extended'; count: number }
  | { type: 'cycle_time_improvement'; percentReduction: number }
  | { type: 'streak_extended'; days: number }
  | { type: 'cycle_high_accuracy'; percent: number; minPuzzles: number }
  | { type: 'consecutive_correct'; count: number }
  | { type: 'perfect_cycle_strict'; minPuzzles: number }
  | { type: 'theme_accuracy_extended'; theme: string; percent: number; minAttempts: number }
  | { type: 'overall_accuracy'; percent: number; minAttempts: number }
  | { type: 'high_rating_count'; minRating: number; count: number }
  | { type: 'multi_theme_mastery'; themeCount: number; percent: number; minPerTheme: number }
  | { type: 'weekly_leaderboard_rank'; maxRank: number }
```

3. Add 20 new achievement definitions to `ACHIEVEMENT_DEFINITIONS` array

### Step 2: Update Validation Schemas

**File:** `lib/validations/achievements.ts`

Update `achievementCategorySchema`:
```typescript
export const achievementCategorySchema = z.enum([
  'puzzles',
  'streaks',
  'speed',
  'cycles',
  'time',
  'themes',
  'accuracy',
  'mastery',
  'leaderboard',
])
```

### Step 3: Add Evaluation Functions

**File:** `lib/achievements/engine.ts`

Add evaluation functions for each new achievement type:

1. **checkWeeklyPuzzleCount** - Query `User.weeklyCorrectAttempts >= count`
2. **checkLightningSpeed** - Check `timeSpentMs < 1500` on correct attempts
3. **checkSpeedStreak** - Track consecutive fast solves in session state
4. **checkFirstCycleComplete** - Count completed cycles for user, unlock if >= 1
5. **checkCyclesSameSetExtended** - Count completed cycles for set >= 10
6. **checkCycleTimeImprovement** - Compare latest cycle time vs first cycle time
7. **checkStreakExtended** - Check `currentStreak >= days` or `longestStreak >= days`
8. **checkCycleHighAccuracy** - Check cycle accuracy >= 95% with >= 50 puzzles
9. **checkConsecutiveCorrect** - Track consecutive correct in session state
10. **checkPerfectCycleStrict** - Check 100% accuracy, no skips, >= 20 puzzles
11. **checkThemeAccuracyExtended** - Query attempts on theme (pin/skewer/mate), calculate accuracy
12. **checkOverallAccuracy** - Calculate `totalCorrectAttempts / totalAttempts >= 85%` with >= 200 attempts
13. **checkHighRatingPuzzles** - Count correct attempts on puzzles with `rating >= 1800`
14. **checkMultiThemeMastery** - Group attempts by theme, count themes with >= 80% accuracy and >= 15 attempts, check if >= 5 themes qualify
15. **checkWeeklyLeaderboardRank** - Calculate user's rank by `weeklyCorrectAttempts` where `showOnLeaderboard=true`

Update trigger functions:
- `checkAchievementsAfterAttempt` - Add calls to new checks
- `checkAchievementsAfterCycleComplete` - Add calls to cycle-related checks
- `checkAchievementsAfterStreakUpdate` - Add calls to extended streak checks

### Step 4: Add Session State Tracking

**File:** `hooks/use-training-session.ts`

Add state variables for consecutive tracking:
```typescript
const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
const [consecutiveFastCount, setConsecutiveFastCount] = useState(0)
```

Update attempt submission logic:
- If correct: increment `consecutiveCorrect`, check if time < 5s and increment `consecutiveFastCount`
- If incorrect: reset both counters to 0
- Pass these values to achievement engine as session context

Update `AttemptContext` interface in `engine.ts`:
```typescript
export interface AttemptContext {
  isCorrect: boolean
  timeSpentMs: number
  attemptedAt: Date
  puzzleThemes: string[]
  consecutiveCorrect?: number      // NEW
  consecutiveFastCount?: number    // NEW
}
```

### Step 5: Update Database Seed

**File:** `scripts/seed-achievements.ts`

Add 20 new achievement objects to `ACHIEVEMENTS` array with all metadata fields.

### Step 6: Update UI Components

**File:** `components/achievements/achievements-display.tsx`

1. Update `CATEGORY_LABELS`:
```typescript
const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  puzzles: 'Puzzles',
  streaks: 'Streaks',
  speed: 'Speed',
  cycles: 'Cycles',
  time: 'Time',
  themes: 'Themes',
  accuracy: 'Accuracy',        // NEW
  mastery: 'Mastery',          // NEW
  leaderboard: 'Competitive',  // NEW
}
```

2. Update `CATEGORY_ORDER`:
```typescript
const CATEGORY_ORDER: AchievementCategory[] = [
  'puzzles',
  'speed',
  'accuracy',
  'cycles',
  'streaks',
  'mastery',
  'leaderboard',
  'time',
  'themes',
]
```

### Step 7: Run Database Migration

Run the seed script to populate the Achievement table:
```bash
npx tsx scripts/seed-achievements.ts
```

## Critical Files to Modify

1. **`lib/achievements/definitions.ts`** - Add new criteria types and 20 achievement definitions
2. **`lib/achievements/engine.ts`** - Add 15+ evaluation functions for new achievement types
3. **`lib/validations/achievements.ts`** - Update category schema with new categories
4. **`scripts/seed-achievements.ts`** - Add 20 achievement records for database seeding
5. **`components/achievements/achievements-display.tsx`** - Add category labels and ordering
6. **`hooks/use-training-session.ts`** - Add session state tracking for consecutive achievements

## Data Availability

- ✅ User model fields: `totalCorrectAttempts`, `weeklyCorrectAttempts`, `currentStreak`, `longestStreak`
- ✅ Cycle stats: `solvedCorrect`, `totalPuzzles`, `totalTime`, `completedAt`
- ✅ Attempt records: `isCorrect`, `timeSpent`, `attemptedAt`
- ✅ Puzzle metadata: `rating`, `themes`, `hasMate`
- 🔨 Session state (requires addition): consecutive correct count, consecutive fast count
- 🔨 Leaderboard rank (requires query function)
- 🔨 Multi-theme mastery (requires aggregation query)

## Progressive Difficulty

### Immediate (1-7 days)
- Cycle Complete
- Weekly Warrior
- Sharp Shooter

### Short-term (1-2 weeks)
- Half Thousand
- Consistent Trainer
- Flawless Streak
- Lightning Fast

### Medium-term (2-4 weeks)
- Millennium
- Theme Masters (Pins, Skewers, Mate)
- Rating Climber
- Speed Streak

### Long-term (1-3 months)
- Woodpecker Master
- Dedicated
- Versatile
- Improvement King

## Verification Steps

### 1. Database Verification
- Run seed script: `npx tsx scripts/seed-achievements.ts`
- Verify 30 achievements in database (10 existing + 20 new)
- Check Achievement table has all new records with correct categories

### 2. Type Safety
- Run `npm run build` to verify TypeScript compilation
- Check no type errors in definitions.ts, engine.ts, validations

### 3. UI Verification
- Start dev server: `npm run dev`
- Navigate to `/achievements` page
- Verify 3 new categories appear: Accuracy, Mastery, Competitive
- Verify all 30 achievements display in proper category order
- Check locked achievements show in greyscale

### 4. Achievement Unlocking
Test simple achievements:
- Solve 1 puzzle → "First Blood" unlocks
- Solve 500 puzzles → "Half Thousand" unlocks
- Complete 1 cycle → "Cycle Complete" unlocks
- Verify toasts appear on unlock
- Check achievement badge turns to gradient amber/yellow

### 5. Edge Cases
- Test consecutive tracking resets on incorrect answer
- Test weekly leaderboard rank calculation
- Test multi-theme mastery with 5 different themes
- Verify no duplicate unlocks (already-unlocked check works)

### 6. Performance
- Check achievement evaluation doesn't slow down attempt submission
- Verify queries use proper indexes
- Test with large attempt counts (500+ puzzles)

## Rollback Plan

If issues arise:
1. **Database**: Remove new achievement records with `DELETE FROM Achievement WHERE sortOrder >= 3`
2. **Code**: Revert commits to definitions.ts, engine.ts, validations.ts
3. **UI**: Previous UI will ignore unknown categories gracefully

## Notes

- All achievements are visible (no secret achievements per user preference)
- Focus on competitive/social, milestones, and performance per user preference
- Mostly attainable difficulty (within first month) per user preference
- Builds on existing infrastructure with minimal breaking changes
- Progressive tiers encourage long-term engagement
