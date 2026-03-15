import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  LeaderboardResponse,
} from "@/lib/validations/leaderboard";

/**
 * Get the start of the ISO week (Monday 00:00:00 UTC) for a given date.
 */
export function getISOWeekStart(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  const day = d.getUTCDay()
  // Adjust for Monday (day 0 is Sunday, so we need Monday = 1)
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  d.setUTCDate(diff)
  return d
}

/**
 * Check if two dates are in the same ISO week.
 */
export function isSameISOWeek(date1: Date, date2: Date): boolean {
  const week1 = getISOWeekStart(date1)
  const week2 = getISOWeekStart(date2)
  return week1.getTime() === week2.getTime()
}

/**
 * Format a date as ISO week string (e.g., "2024-W01")
 */
export function formatISOWeek(date: Date): string {
  const weekStart = getISOWeekStart(date)
  const year = weekStart.getUTCFullYear()

  // Calculate week number
  const jan1 = new Date(Date.UTC(year, 0, 1))
  const jan1Day = jan1.getUTCDay()
  const jan1Monday =
    jan1Day <= 4
      ? new Date(Date.UTC(year, 0, 1 - jan1Day + 1))
      : new Date(Date.UTC(year, 0, 1 + (8 - jan1Day)))

  const weekNumber =
    Math.ceil(
      (weekStart.getTime() - jan1Monday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ) + 1

  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

export interface LeaderboardSnapshot {
  entries: LeaderboardEntry[];
  total: number;
  currentUser: LeaderboardResponse["currentUser"];
}

export interface RawLeaderboardSnapshot {
  entries: LeaderboardEntry[] | null;
  total: number | null;
  currentUser: LeaderboardResponse["currentUser"];
}

export function normalizeLeaderboardSnapshot(
  rawSnapshot: RawLeaderboardSnapshot | null | undefined,
): LeaderboardSnapshot {
  return {
    entries: rawSnapshot?.entries ?? [],
    total: rawSnapshot?.total ?? 0,
    currentUser: rawSnapshot?.currentUser ?? null,
  };
}

export function buildLeaderboardResponse(params: {
  snapshot: LeaderboardSnapshot;
  period: LeaderboardPeriod;
  limit: number;
  offset: number;
  weekStartDate?: string;
}): LeaderboardResponse {
  const { snapshot, period, limit, offset, weekStartDate } = params;

  return {
    entries: snapshot.entries,
    pagination: {
      total: snapshot.total,
      limit,
      offset,
      hasMore: offset + limit < snapshot.total,
    },
    currentUser: snapshot.currentUser,
    period,
    ...(weekStartDate ? { weekStartDate } : {}),
  };
}

export async function fetchLeaderboardSnapshot(params: {
  clerkId: string;
  period: LeaderboardPeriod;
  limit: number;
  offset: number;
  currentWeekStart: Date;
}): Promise<LeaderboardSnapshot> {
  const { clerkId, period, limit, offset, currentWeekStart } = params;
  const xpExpr =
    period === "weekly"
      ? Prisma.sql`CASE WHEN u."weeklyXpStartDate" >= ${currentWeekStart} THEN u."weeklyXp" ELSE 0 END`
      : Prisma.sql`u."totalXp"`;
  const puzzlesSolvedExpr =
    period === "weekly"
      ? Prisma.sql`CASE WHEN u."weeklyCorrectStartDate" >= ${currentWeekStart} THEN u."weeklyCorrectAttempts" ELSE 0 END`
      : Prisma.sql`u."totalCorrectAttempts"`;
  const leaderboardFilter =
    period === "weekly"
      ? Prisma.sql`u."showOnLeaderboard" = true AND u."weeklyXp" > 0 AND u."weeklyXpStartDate" >= ${currentWeekStart}`
      : Prisma.sql`u."showOnLeaderboard" = true AND u."totalXp" > 0`;

  const rows = await prisma.$queryRaw<Array<{ data: RawLeaderboardSnapshot }>>`
    WITH scoped_users AS (
      SELECT
        u.id,
        u.name,
        u."estimatedRating",
        u."currentLevel",
        ${xpExpr}::int AS xp,
        ${puzzlesSolvedExpr}::int AS "puzzlesSolved"
      FROM "User" u
      WHERE ${leaderboardFilter}
    ),
    ranked_users AS (
      SELECT
        su.*,
        ROW_NUMBER() OVER (ORDER BY su.xp DESC, su.id ASC)::int AS rank,
        COUNT(*) OVER ()::int AS total_count
      FROM scoped_users su
    ),
    paged_users AS (
      SELECT *
      FROM ranked_users
      ORDER BY rank ASC
      OFFSET ${offset}
      LIMIT ${limit}
    ),
    current_user_row AS (
      SELECT
        u.id,
        u.name,
        u."estimatedRating",
        u."currentLevel",
        u."showOnLeaderboard",
        ${xpExpr}::int AS xp,
        ${puzzlesSolvedExpr}::int AS "puzzlesSolved"
      FROM "User" u
      WHERE u."clerkId" = ${clerkId}
      LIMIT 1
    ),
    current_user_rank AS (
      SELECT
        (COUNT(*) + 1)::int AS rank
      FROM ranked_users ru
      CROSS JOIN current_user_row cu
      WHERE ru.xp > cu.xp
    )
    SELECT json_build_object(
      'entries',
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'rank', pu.rank,
              'userId', pu.id,
              'name', pu.name,
              'xp', pu.xp,
              'level', pu."currentLevel",
              'puzzlesSolved', pu."puzzlesSolved",
              'estimatedRating', pu."estimatedRating",
              'isCurrentUser', pu.id = cu.id
            )
            ORDER BY pu.rank
          )
          FROM paged_users pu
          LEFT JOIN current_user_row cu ON true
        ),
        '[]'::json
      ),
      'total',
      COALESCE((SELECT MAX(total_count) FROM ranked_users), 0),
      'currentUser',
      CASE
        WHEN EXISTS (SELECT 1 FROM current_user_row) THEN (
          SELECT CASE
            WHEN cu.xp <= 0 THEN json_build_object('rank', NULL, 'entry', NULL)
            ELSE json_build_object(
                'rank',
                CASE
                  WHEN cu."showOnLeaderboard" THEN cur.rank
                  ELSE NULL
                END,
              'entry',
              json_build_object(
                'rank', cur.rank,
                'userId', cu.id,
                'name', cu.name,
                'xp', cu.xp,
                'level', cu."currentLevel",
                'puzzlesSolved', cu."puzzlesSolved",
                'estimatedRating', cu."estimatedRating",
                'isCurrentUser', true
              )
            )
          END
          FROM current_user_row cu
          LEFT JOIN current_user_rank cur ON true
        )
        ELSE NULL
      END
    ) AS data;
  `;

  return normalizeLeaderboardSnapshot(rows[0]?.data);
}
