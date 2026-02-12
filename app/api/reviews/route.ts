import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensure-user";
import { appReviewSchema } from "@/lib/validations/reviews";

/**
 * GET /api/reviews
 * Returns the current user's app review (if any).
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.NODE_ENV === "development") {
      await ensureUserExists(clerkId);
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const review = await prisma.appReview.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      review: review
        ? {
            id: review.id,
            rating: review.rating,
            headline: review.headline,
            comment: review.comment,
            createdAt: review.createdAt.toISOString(),
            updatedAt: review.updatedAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching app review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/reviews
 * Creates or updates the current user's app review.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.NODE_ENV === "development") {
      await ensureUserExists(clerkId);
    }

    const body = await request.json();
    const validation = appReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.message },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const normalizedHeadline = validation.data.headline?.trim() || null;

    const review = await prisma.appReview.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        rating: validation.data.rating,
        headline: normalizedHeadline,
        comment: validation.data.comment.trim(),
      },
      update: {
        rating: validation.data.rating,
        headline: normalizedHeadline,
        comment: validation.data.comment.trim(),
      },
    });

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        headline: review.headline,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error saving app review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
