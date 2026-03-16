import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { serializeAppUser, serializePuzzleSets } from "@/lib/app-bootstrap";
import { withUserProvisionFallback } from "@/lib/ensure-user";
import { withRouteMetrics } from "@/lib/metrics/request-metrics";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bootstrap
 * Returns the authenticated app-shell bootstrap payload.
 */
export async function GET() {
  return withRouteMetrics("bootstrap.get", async () => {
    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const user = await withUserProvisionFallback(clerkId, () =>
        prisma.user.findUnique({
          where: { clerkId },
          include: {
            puzzleSets: {
              include: {
                cycles: {
                  orderBy: { cycleNumber: "desc" },
                  take: 1,
                  select: {
                    id: true,
                    cycleNumber: true,
                    completedAt: true,
                    startedAt: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        }),
      );

      if (!user) {
        return NextResponse.json(
          { error: "User not found. Please try again in a moment." },
          { status: 404 },
        );
      }

      const sets = serializePuzzleSets(user.puzzleSets);

      return NextResponse.json({
        user: serializeAppUser(user, sets.length),
        sets,
      });
    } catch (error) {
      console.error("Error fetching bootstrap payload:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  });
}
