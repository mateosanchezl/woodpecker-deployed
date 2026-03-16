import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getISOWeekStart } from "@/lib/leaderboard";
import { getTodayUTC } from "@/lib/streak";
import { prisma } from "@/lib/prisma";
import type { SessionCycleData } from "@/lib/training/session";

interface AttemptRecord {
  id: string;
  timeSpent: number;
  isCorrect: boolean;
  wasSkipped: boolean;
}

interface AttemptHotPathUserState {
  totalCorrectAttempts: number;
  weeklyCorrectAttempts: number;
  weeklyCorrectStartDate: Date | null;
  totalXp: number;
  weeklyXp: number;
  weeklyXpStartDate: Date | null;
  currentStreak: number;
  longestStreak: number;
  lastTrainedDate: Date | null;
  currentLevel?: number;
}

interface AttemptHotPathPuzzleContext {
  userId: string;
  puzzleId: string;
  puzzleRating: number;
  puzzleThemes: string[];
  puzzlePosition: number;
  totalAttemptsBefore: number;
  correctAttemptsBefore: number;
  averageTimeBefore: number | null;
  previousAttempt: {
    isCorrect: boolean;
    timeSpentMs: number;
  } | null;
}

interface AttemptHotPathSuccess {
  status: "ok";
  expectedPuzzleInSetId: string;
  attempt: AttemptRecord;
  updatedCycle: SessionCycleData;
  isLastPuzzle: boolean;
  puzzleContext: AttemptHotPathPuzzleContext;
  userBefore: AttemptHotPathUserState;
  userAfter: AttemptHotPathUserState;
}

interface AttemptHotPathStale {
  status: "stale_attempt";
  expectedPuzzleInSetId: string;
}

type AttemptHotPathResult =
  | { status: "not_found" }
  | { status: "cycle_complete" }
  | { status: "expected_puzzle_missing" }
  | AttemptHotPathStale
  | { status: "duplicate_attempt" }
  | AttemptHotPathSuccess;

interface AttemptHotPathRawUserState {
  totalCorrectAttempts: number;
  weeklyCorrectAttempts: number;
  weeklyCorrectStartDate: string | null;
  totalXp: number;
  weeklyXp: number;
  weeklyXpStartDate: string | null;
  currentStreak: number;
  longestStreak: number;
  lastTrainedDate: string | null;
  currentLevel?: number;
}

interface AttemptHotPathRawData {
  status: AttemptHotPathResult["status"];
  expectedPuzzleInSetId?: string | null;
  attempt?: AttemptRecord | null;
  updatedCycle?: {
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
    completedAt: string | null;
  } | null;
  isLastPuzzle?: boolean | null;
  puzzleContext?: {
    userId: string;
    puzzleId: string;
    puzzleRating: number;
    puzzleThemes: string[];
    puzzlePosition: number;
    totalAttemptsBefore: number;
    correctAttemptsBefore: number;
    averageTimeBefore: number | null;
    previousAttempt: {
      isCorrect: boolean;
      timeSpentMs: number;
    } | null;
  } | null;
  userBefore?: AttemptHotPathRawUserState | null;
  userAfter?: AttemptHotPathRawUserState | null;
}

function parseUtcTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null;

  const normalized =
    /(?:Z|[+-]\d{2}:?\d{2})$/.test(value) || value.includes("GMT")
      ? value
      : `${value}Z`;

  return new Date(normalized);
}

function parseUserState(
  state: AttemptHotPathRawUserState | null | undefined,
): AttemptHotPathUserState {
  if (!state) {
    throw new Error("Missing user state from attempt hot path");
  }

  return {
    totalCorrectAttempts: state.totalCorrectAttempts,
    weeklyCorrectAttempts: state.weeklyCorrectAttempts,
    weeklyCorrectStartDate: parseUtcTimestamp(state.weeklyCorrectStartDate),
    totalXp: state.totalXp,
    weeklyXp: state.weeklyXp,
    weeklyXpStartDate: parseUtcTimestamp(state.weeklyXpStartDate),
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    lastTrainedDate: parseUtcTimestamp(state.lastTrainedDate),
    currentLevel: state.currentLevel,
  };
}

function parseResult(data: AttemptHotPathRawData): AttemptHotPathResult {
  if (data.status === "not_found") {
    return { status: "not_found" };
  }

  if (data.status === "cycle_complete") {
    return { status: "cycle_complete" };
  }

  if (data.status === "expected_puzzle_missing") {
    return { status: "expected_puzzle_missing" };
  }

  if (data.status === "duplicate_attempt") {
    return { status: "duplicate_attempt" };
  }

  if (data.status === "stale_attempt") {
    return {
      status: "stale_attempt",
      expectedPuzzleInSetId: data.expectedPuzzleInSetId ?? "",
    };
  }

  if (
    !data.attempt ||
    !data.updatedCycle ||
    !data.puzzleContext ||
    !data.userBefore ||
    !data.userAfter ||
    !data.expectedPuzzleInSetId
  ) {
    throw new Error("Incomplete attempt hot path result");
  }

  return {
    status: "ok",
    expectedPuzzleInSetId: data.expectedPuzzleInSetId,
    attempt: data.attempt,
    updatedCycle: {
      id: data.updatedCycle.id,
      puzzleSetId: data.updatedCycle.puzzleSetId,
      cycleNumber: data.updatedCycle.cycleNumber,
      totalPuzzles: data.updatedCycle.totalPuzzles,
      attemptedCount: data.updatedCycle.attemptedCount,
      nextPosition: data.updatedCycle.nextPosition,
      solvedCorrect: data.updatedCycle.solvedCorrect,
      solvedIncorrect: data.updatedCycle.solvedIncorrect,
      skipped: data.updatedCycle.skipped,
      totalTime: data.updatedCycle.totalTime,
      completedAt: parseUtcTimestamp(data.updatedCycle.completedAt),
    },
    isLastPuzzle: Boolean(data.isLastPuzzle),
    puzzleContext: data.puzzleContext,
    userBefore: parseUserState(data.userBefore),
    userAfter: parseUserState(data.userAfter),
  };
}

export async function recordAttemptHotPath(params: {
  clerkId: string;
  setId: string;
  cycleId: string;
  puzzleInSetId: string;
  timeSpent: number;
  isCorrect: boolean;
  wasSkipped: boolean;
  movesPlayed: string[];
  now: Date;
}): Promise<AttemptHotPathResult> {
  const {
    clerkId,
    setId,
    cycleId,
    puzzleInSetId,
    timeSpent,
    isCorrect,
    wasSkipped,
    movesPlayed,
    now,
  } = params;

  const todayUtc = getTodayUTC();
  const weekStart = getISOWeekStart(now);
  const attemptId = randomUUID();
  const movesPlayedSql =
    movesPlayed.length > 0
      ? Prisma.sql`ARRAY[${Prisma.join(movesPlayed)}]::text[]`
      : Prisma.sql`ARRAY[]::text[]`;

  const rows = await prisma.$queryRaw<Array<{ data: AttemptHotPathRawData }>>`
    WITH locked_context AS (
      SELECT
        c.id AS cycle_id,
        c."puzzleSetId" AS puzzle_set_id,
        c."cycleNumber" AS cycle_number,
        c."totalPuzzles" AS total_puzzles,
        c."solvedCorrect" AS solved_correct,
        c."solvedIncorrect" AS solved_incorrect,
        c."skipped" AS skipped,
        c."totalTime" AS total_time,
        c."attemptedCount" AS attempted_count,
        c."nextPosition" AS next_position,
        c."completedAt" AS completed_at,
        ps.id AS verified_puzzle_set_id,
        u.id AS user_id,
        u."currentStreak" AS user_current_streak,
        u."longestStreak" AS user_longest_streak,
        u."lastTrainedDate" AS user_last_trained_date,
        u."streakUpdatedAt" AS user_streak_updated_at,
        u."totalCorrectAttempts" AS user_total_correct_attempts,
        u."weeklyCorrectAttempts" AS user_weekly_correct_attempts,
        u."weeklyCorrectStartDate" AS user_weekly_correct_start_date,
        u."totalXp" AS user_total_xp,
        u."currentLevel" AS user_current_level,
        u."weeklyXp" AS user_weekly_xp,
        u."weeklyXpStartDate" AS user_weekly_xp_start_date,
        pis.id AS expected_puzzle_in_set_id,
        pis.position AS puzzle_position,
        pis."totalAttempts" AS puzzle_total_attempts,
        pis."correctAttempts" AS puzzle_correct_attempts,
        pis."averageTime" AS puzzle_average_time,
        pis."lastAttemptIsCorrect" AS previous_attempt_is_correct,
        pis."lastAttemptTime" AS previous_attempt_time_spent,
        p.id AS puzzle_id,
        p.rating AS puzzle_rating,
        p.themes AS puzzle_themes
      FROM "Cycle" c
      JOIN "PuzzleSet" ps
        ON ps.id = c."puzzleSetId"
      JOIN "User" u
        ON u.id = ps."userId"
      LEFT JOIN "PuzzleInSet" pis
        ON pis."puzzleSetId" = ps.id
       AND pis.position = c."nextPosition"
      LEFT JOIN "Puzzle" p
        ON p.id = pis."puzzleId"
      WHERE c.id = ${cycleId}
        AND ps.id = ${setId}
        AND u."clerkId" = ${clerkId}
      FOR UPDATE OF c, ps, u
    ),
    status_context AS (
      SELECT
        lc.*,
        CASE
          WHEN lc.completed_at IS NOT NULL OR lc.next_position > lc.total_puzzles
            THEN 'cycle_complete'
          WHEN lc.expected_puzzle_in_set_id IS NULL
            THEN 'expected_puzzle_missing'
          WHEN lc.expected_puzzle_in_set_id <> ${puzzleInSetId}
            THEN 'stale_attempt'
          ELSE 'ok'
        END AS status,
        CASE
          WHEN lc.user_last_trained_date IS NULL
            THEN NULL
          ELSE ABS((CAST(${todayUtc} AS date) - DATE(lc.user_last_trained_date))::int)
        END AS streak_days_diff
      FROM locked_context lc
    ),
    calc AS (
      SELECT
        sc.*,
        CASE
          WHEN sc.user_last_trained_date IS NULL THEN TRUE
          WHEN sc.streak_days_diff = 0 THEN FALSE
          ELSE TRUE
        END AS streak_incremented,
        CASE
          WHEN sc.user_last_trained_date IS NULL THEN 1
          WHEN sc.streak_days_diff = 0 THEN sc.user_current_streak
          WHEN sc.streak_days_diff = 1 THEN sc.user_current_streak + 1
          ELSE 1
        END AS next_current_streak,
        CASE
          WHEN sc.user_last_trained_date IS NULL
            THEN GREATEST(1, sc.user_longest_streak)
          WHEN sc.streak_days_diff = 1
            THEN GREATEST(sc.user_longest_streak, sc.user_current_streak + 1)
          ELSE sc.user_longest_streak
        END AS next_longest_streak,
        sc.attempted_count + 1 AS next_attempted_count,
        (sc.attempted_count + 1) >= sc.total_puzzles AS is_last_puzzle,
        LEAST(sc.total_puzzles + 1, sc.next_position + 1) AS next_position_after,
        sc.solved_correct
          + CASE WHEN ${isCorrect} AND NOT ${wasSkipped} THEN 1 ELSE 0 END
          AS solved_correct_after,
        sc.solved_incorrect
          + CASE WHEN NOT ${isCorrect} AND NOT ${wasSkipped} THEN 1 ELSE 0 END
          AS solved_incorrect_after,
        sc.skipped
          + CASE WHEN ${wasSkipped} THEN 1 ELSE 0 END
          AS skipped_after,
        COALESCE(sc.total_time, 0) + ${timeSpent} AS total_time_after,
        sc.puzzle_total_attempts + 1 AS puzzle_total_attempts_after,
        sc.puzzle_correct_attempts
          + CASE WHEN ${isCorrect} THEN 1 ELSE 0 END
          AS puzzle_correct_attempts_after,
        (
          (COALESCE(sc.puzzle_average_time, 0) * sc.puzzle_total_attempts) + ${timeSpent}
        )::double precision
          / NULLIF(sc.puzzle_total_attempts + 1, 0) AS puzzle_average_time_after,
        CASE
          WHEN ${isCorrect}
            THEN (
              10
              + CASE
                  WHEN sc.puzzle_rating > 1000
                    THEN FLOOR((sc.puzzle_rating - 1000) / 100.0)::int
                  ELSE 0
                END
              + CASE WHEN ${timeSpent} < 10000 THEN 5 ELSE 0 END
              + (
                LEAST(
                  CASE
                    WHEN sc.user_last_trained_date IS NULL THEN 1
                    WHEN sc.streak_days_diff = 0 THEN sc.user_current_streak
                    WHEN sc.streak_days_diff = 1 THEN sc.user_current_streak + 1
                    ELSE 1
                  END,
                  10
                ) * 2
              )
              + CASE WHEN sc.puzzle_total_attempts = 0 THEN 5 ELSE 0 END
              + CASE
                  WHEN sc.previous_attempt_is_correct IS NOT NULL
                   AND sc.previous_attempt_time_spent IS NOT NULL
                   AND (
                     sc.previous_attempt_is_correct = FALSE
                     OR (
                       sc.previous_attempt_is_correct = TRUE
                       AND ${timeSpent} < sc.previous_attempt_time_spent
                     )
                   )
                    THEN 10
                  ELSE 0
                END
            )
          ELSE 0
        END AS puzzle_xp_gain
      FROM status_context sc
    ),
    calc_with_xp AS (
      SELECT
        c.*,
        CASE
          WHEN c.status <> 'ok' OR NOT c.is_last_puzzle THEN 0
          ELSE FLOOR(
            50 * CASE
              WHEN (c.solved_correct_after::double precision / NULLIF(c.total_puzzles, 0)) >= 1
                THEN 2
              WHEN (c.solved_correct_after::double precision / NULLIF(c.total_puzzles, 0)) >= 0.9
                THEN 1.5
              WHEN (c.solved_correct_after::double precision / NULLIF(c.total_puzzles, 0)) >= 0.8
                THEN 1.2
              ELSE 1
            END
          )::int
        END AS cycle_xp_gain
      FROM calc c
    ),
    final_calc AS (
      SELECT
        cx.*,
        (cx.puzzle_xp_gain + cx.cycle_xp_gain) AS total_xp_gain,
        cx.user_total_correct_attempts
          + CASE WHEN ${isCorrect} THEN 1 ELSE 0 END AS user_total_correct_attempts_after,
        CASE
          WHEN ${isCorrect} THEN
            CASE
              WHEN cx.user_weekly_correct_start_date IS NULL
                OR DATE(cx.user_weekly_correct_start_date) <> CAST(${weekStart} AS date)
                THEN 1
              ELSE cx.user_weekly_correct_attempts + 1
            END
          ELSE cx.user_weekly_correct_attempts
        END AS user_weekly_correct_attempts_after,
        CASE
          WHEN ${isCorrect} THEN CAST(${weekStart} AS timestamp)
          ELSE cx.user_weekly_correct_start_date
        END AS user_weekly_correct_start_date_after,
        cx.user_total_xp + (cx.puzzle_xp_gain + cx.cycle_xp_gain) AS user_total_xp_after,
        CASE
          WHEN (cx.puzzle_xp_gain + cx.cycle_xp_gain) > 0 THEN
            CASE
              WHEN cx.user_weekly_xp_start_date IS NULL
                OR DATE(cx.user_weekly_xp_start_date) <> CAST(${weekStart} AS date)
                THEN cx.puzzle_xp_gain + cx.cycle_xp_gain
              ELSE cx.user_weekly_xp + cx.puzzle_xp_gain + cx.cycle_xp_gain
            END
          ELSE cx.user_weekly_xp
        END AS user_weekly_xp_after,
        CASE
          WHEN (cx.puzzle_xp_gain + cx.cycle_xp_gain) > 0 THEN CAST(${weekStart} AS timestamp)
          ELSE cx.user_weekly_xp_start_date
        END AS user_weekly_xp_start_date_after,
        CASE
          WHEN (cx.puzzle_xp_gain + cx.cycle_xp_gain) > 0 THEN
            GREATEST(
              1,
              FLOOR(
                POWER(
                  ((cx.user_total_xp + cx.puzzle_xp_gain + cx.cycle_xp_gain)::double precision / 100),
                  (1.0 / 1.5)
                )
              )::int
            )
          ELSE cx.user_current_level
        END AS user_current_level_after
      FROM calc_with_xp cx
    ),
    inserted_attempt AS (
      INSERT INTO "Attempt" (
        id,
        "cycleId",
        "puzzleInSetId",
        "attemptedAt",
        "timeSpent",
        "isCorrect",
        "wasSkipped",
        "movesPlayed"
      )
      SELECT
        ${attemptId},
        fc.cycle_id,
        ${puzzleInSetId},
        CAST(${now} AS timestamp),
        ${timeSpent},
        ${isCorrect},
        ${wasSkipped},
        ${movesPlayedSql}
      FROM final_calc fc
      WHERE fc.status = 'ok'
      ON CONFLICT ("cycleId", "puzzleInSetId") DO NOTHING
      RETURNING id, "timeSpent", "isCorrect", "wasSkipped"
    ),
    mutation_state AS (
      SELECT
        fc.*,
        ia.id AS inserted_attempt_id,
        ia."timeSpent" AS inserted_attempt_time_spent,
        ia."isCorrect" AS inserted_attempt_is_correct,
        ia."wasSkipped" AS inserted_attempt_was_skipped,
        CASE
          WHEN fc.status = 'ok' AND ia.id IS NULL THEN 'duplicate_attempt'
          ELSE fc.status
        END AS final_status
      FROM final_calc fc
      LEFT JOIN inserted_attempt ia ON TRUE
    ),
    updated_puzzle_in_set AS (
      UPDATE "PuzzleInSet" pis
      SET
        "totalAttempts" = ms.puzzle_total_attempts_after,
        "correctAttempts" = ms.puzzle_correct_attempts_after,
        "averageTime" = ms.puzzle_average_time_after,
        "lastAttemptIsCorrect" = ${isCorrect},
        "lastAttemptTime" = ${timeSpent},
        "lastAttemptAt" = CAST(${now} AS timestamp)
      FROM mutation_state ms
      WHERE ms.final_status = 'ok'
        AND pis.id = ms.expected_puzzle_in_set_id
      RETURNING pis.id
    ),
    updated_cycle AS (
      UPDATE "Cycle" c
      SET
        "solvedCorrect" = ms.solved_correct_after,
        "solvedIncorrect" = ms.solved_incorrect_after,
        "skipped" = ms.skipped_after,
        "totalTime" = ms.total_time_after,
        "attemptedCount" = ms.next_attempted_count,
        "nextPosition" = ms.next_position_after,
        "completedAt" = CASE
          WHEN ms.is_last_puzzle THEN CAST(${now} AS timestamp)
          ELSE NULL
        END
      FROM mutation_state ms
      WHERE ms.final_status = 'ok'
        AND c.id = ms.cycle_id
      RETURNING
        c.id,
        c."puzzleSetId" AS "puzzleSetId",
        c."cycleNumber" AS "cycleNumber",
        c."totalPuzzles" AS "totalPuzzles",
        c."attemptedCount" AS "attemptedCount",
        c."nextPosition" AS "nextPosition",
        c."solvedCorrect" AS "solvedCorrect",
        c."solvedIncorrect" AS "solvedIncorrect",
        c."skipped" AS "skipped",
        c."totalTime" AS "totalTime",
        c."completedAt" AS "completedAt"
    ),
    updated_user AS (
      UPDATE "User" u
      SET
        "currentStreak" = ms.next_current_streak,
        "longestStreak" = ms.next_longest_streak,
        "lastTrainedDate" = CASE
          WHEN ms.streak_incremented THEN CAST(${todayUtc} AS timestamp)
          ELSE u."lastTrainedDate"
        END,
        "streakUpdatedAt" = CASE
          WHEN ms.streak_incremented THEN CAST(${now} AS timestamp)
          ELSE u."streakUpdatedAt"
        END,
        "totalCorrectAttempts" = ms.user_total_correct_attempts_after,
        "weeklyCorrectAttempts" = ms.user_weekly_correct_attempts_after,
        "weeklyCorrectStartDate" = ms.user_weekly_correct_start_date_after,
        "totalXp" = ms.user_total_xp_after,
        "currentLevel" = ms.user_current_level_after,
        "weeklyXp" = ms.user_weekly_xp_after,
        "weeklyXpStartDate" = ms.user_weekly_xp_start_date_after,
        "updatedAt" = CAST(${now} AS timestamp)
      FROM mutation_state ms
      WHERE ms.final_status = 'ok'
        AND u.id = ms.user_id
        AND (
          ms.streak_incremented
          OR ${isCorrect}
          OR ms.total_xp_gain > 0
        )
      RETURNING u.id
    ),
    updated_puzzle_set AS (
      UPDATE "PuzzleSet" ps
      SET "lastTrainedAt" = CAST(${now} AS timestamp)
      FROM mutation_state ms
      WHERE ms.final_status = 'ok'
        AND ps.id = ms.verified_puzzle_set_id
      RETURNING ps.id
    )
    SELECT CASE
      WHEN NOT EXISTS (SELECT 1 FROM locked_context) THEN
        jsonb_build_object('status', 'not_found')
      ELSE (
        SELECT jsonb_build_object(
          'status', ms.final_status,
          'expectedPuzzleInSetId', ms.expected_puzzle_in_set_id,
          'attempt', CASE
            WHEN ms.final_status = 'ok' THEN jsonb_build_object(
              'id', ms.inserted_attempt_id,
              'timeSpent', ms.inserted_attempt_time_spent,
              'isCorrect', ms.inserted_attempt_is_correct,
              'wasSkipped', ms.inserted_attempt_was_skipped
            )
            ELSE NULL
          END,
          'updatedCycle', CASE
            WHEN ms.final_status = 'ok' THEN (
              SELECT jsonb_build_object(
                'id', uc.id,
                'puzzleSetId', uc."puzzleSetId",
                'cycleNumber', uc."cycleNumber",
                'totalPuzzles', uc."totalPuzzles",
                'attemptedCount', uc."attemptedCount",
                'nextPosition', uc."nextPosition",
                'solvedCorrect', uc."solvedCorrect",
                'solvedIncorrect', uc."solvedIncorrect",
                'skipped', uc."skipped",
                'totalTime', uc."totalTime",
                'completedAt', uc."completedAt"
              )
              FROM updated_cycle uc
              LIMIT 1
            )
            ELSE NULL
          END,
          'isLastPuzzle', CASE WHEN ms.final_status = 'ok' THEN ms.is_last_puzzle ELSE NULL END,
          'puzzleContext', CASE
            WHEN ms.final_status = 'ok' THEN jsonb_build_object(
              'userId', ms.user_id,
              'puzzleId', ms.puzzle_id,
              'puzzleRating', ms.puzzle_rating,
              'puzzleThemes', ms.puzzle_themes,
              'puzzlePosition', ms.puzzle_position,
              'totalAttemptsBefore', ms.puzzle_total_attempts,
              'correctAttemptsBefore', ms.puzzle_correct_attempts,
              'averageTimeBefore', ms.puzzle_average_time,
              'previousAttempt', CASE
                WHEN ms.previous_attempt_is_correct IS NOT NULL
                 AND ms.previous_attempt_time_spent IS NOT NULL
                  THEN jsonb_build_object(
                    'isCorrect', ms.previous_attempt_is_correct,
                    'timeSpentMs', ms.previous_attempt_time_spent
                  )
                ELSE NULL
              END
            )
            ELSE NULL
          END,
          'userBefore', CASE
            WHEN ms.final_status = 'ok' THEN jsonb_build_object(
              'totalCorrectAttempts', ms.user_total_correct_attempts,
              'weeklyCorrectAttempts', ms.user_weekly_correct_attempts,
              'weeklyCorrectStartDate', ms.user_weekly_correct_start_date,
              'totalXp', ms.user_total_xp,
              'weeklyXp', ms.user_weekly_xp,
              'weeklyXpStartDate', ms.user_weekly_xp_start_date,
              'currentStreak', ms.user_current_streak,
              'longestStreak', ms.user_longest_streak,
              'lastTrainedDate', ms.user_last_trained_date,
              'currentLevel', ms.user_current_level
            )
            ELSE NULL
          END,
          'userAfter', CASE
            WHEN ms.final_status = 'ok' THEN jsonb_build_object(
              'totalCorrectAttempts', ms.user_total_correct_attempts_after,
              'weeklyCorrectAttempts', ms.user_weekly_correct_attempts_after,
              'weeklyCorrectStartDate', ms.user_weekly_correct_start_date_after,
              'totalXp', ms.user_total_xp_after,
              'weeklyXp', ms.user_weekly_xp_after,
              'weeklyXpStartDate', ms.user_weekly_xp_start_date_after,
              'currentStreak', ms.next_current_streak,
              'longestStreak', ms.next_longest_streak,
              'lastTrainedDate', CASE
                WHEN ms.streak_incremented THEN CAST(${todayUtc} AS timestamp)
                ELSE ms.user_last_trained_date
              END,
              'currentLevel', ms.user_current_level_after
            )
            ELSE NULL
          END
        )
        FROM mutation_state ms
        LIMIT 1
      )
    END AS data;
  `;

  const row = rows[0];
  if (!row) {
    throw new Error("Attempt hot path returned no rows");
  }

  return parseResult(row.data);
}
