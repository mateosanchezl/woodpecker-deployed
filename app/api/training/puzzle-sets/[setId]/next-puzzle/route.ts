import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { withRouteMetrics } from "@/lib/metrics/request-metrics";
import { nextPuzzleQuerySchema } from "@/lib/validations/training";
import {
  fetchTrainingSessionSnapshot,
  toLegacyNextPuzzleResponse,
} from "@/lib/training/session";

interface RouteContext {
  params: Promise<{ setId: string }>;
}

/**
 * GET /api/training/puzzle-sets/[setId]/next-puzzle
 * Compatibility wrapper around the canonical session endpoint.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withRouteMetrics("training.next-puzzle.get", async () => {
    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { setId } = await context.params;
      const cycleId = request.nextUrl.searchParams.get("cycleId");
      const validation = nextPuzzleQuerySchema.safeParse({ cycleId });

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid parameters", details: validation.error.message },
          { status: 400 },
        );
      }

      const session = await fetchTrainingSessionSnapshot({
        clerkId,
        setId,
        cycleId: validation.data.cycleId,
      });

      if (!session) {
        return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
      }

      return NextResponse.json(toLegacyNextPuzzleResponse(session));
    } catch (error) {
      console.error("Error fetching next puzzle:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
