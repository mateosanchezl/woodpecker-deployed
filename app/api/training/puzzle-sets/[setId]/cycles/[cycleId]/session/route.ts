import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { withRouteMetrics } from "@/lib/metrics/request-metrics";
import { fetchTrainingSessionForUser } from "@/lib/training/session";

interface RouteContext {
  params: Promise<{ setId: string; cycleId: string }>;
}

/**
 * GET /api/training/puzzle-sets/[setId]/cycles/[cycleId]/session
 * Canonical training-session read endpoint.
 */
export async function GET(_request: Request, context: RouteContext) {
  return withRouteMetrics("training.session.get", async () => {
    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { setId, cycleId } = await context.params;

      const session = await fetchTrainingSessionForUser({
        clerkId,
        setId,
        cycleId,
      });

      if (!session) {
        return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
      }

      return NextResponse.json({ session });
    } catch (error) {
      console.error("Error fetching training session:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
