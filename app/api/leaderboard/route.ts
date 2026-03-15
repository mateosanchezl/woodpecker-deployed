import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { leaderboardQuerySchema } from "@/lib/validations/leaderboard";
import {
  buildLeaderboardResponse,
  fetchLeaderboardSnapshot,
  getISOWeekStart,
} from "@/lib/leaderboard";
import { withRouteMetrics } from "@/lib/metrics/request-metrics";

export async function GET(request: NextRequest) {
  return withRouteMetrics("leaderboard.get", async () => {
    try {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      const parseResult = leaderboardQuerySchema.safeParse(searchParams);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400 },
        );
      }

      const { period, limit, offset } = parseResult.data;
      const currentWeekStart = getISOWeekStart(new Date());
      const snapshot = await fetchLeaderboardSnapshot({
        clerkId,
        period,
        limit,
        offset,
        currentWeekStart,
      });

      const response = buildLeaderboardResponse({
        snapshot,
        period,
        limit,
        offset,
        ...(period === "weekly"
          ? { weekStartDate: currentWeekStart.toISOString() }
          : {}),
      });

      return NextResponse.json(response);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 },
      );
    }
  });
}
