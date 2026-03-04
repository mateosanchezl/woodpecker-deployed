import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensure-user";
import { appReviewSchema } from "@/lib/validations/reviews";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function formatValue(value: string | null) {
  return value && value.trim().length > 0 ? value : "n/a";
}

function buildReviewNotificationText(params: {
  action: "created" | "updated";
  clerkId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  rating: number;
  comment: string;
  submittedAt: string;
}) {
  return [
    "App feedback",
    "",
    `Action: ${params.action}`,
    `Clerk ID: ${params.clerkId}`,
    `User ID: ${params.userId}`,
    `Email: ${params.userEmail}`,
    `Name: ${formatValue(params.userName)}`,
    `Rating: ${params.rating}`,
    "",
    "Comment",
    formatValue(params.comment),
    "",
    `Submitted at: ${params.submittedAt}`,
  ].join("\n");
}

async function sendReviewNotification(params: {
  action: "created" | "updated";
  clerkId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  rating: number;
  comment: string;
}) {
  if (!resend) {
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "dwyc.co@gmail.com";
  const subjectEmail = params.userEmail || "unknown-user";

  try {
    const { error } = await resend.emails.send({
      from: "Peck <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `App feedback - ${params.rating} stars - ${subjectEmail}`,
      text: buildReviewNotificationText({
        ...params,
        submittedAt: new Date().toISOString(),
      }),
    });

    if (error) {
      console.error("Error sending app feedback notification:", error);
    }
  } catch (error) {
    console.error("Error sending app feedback notification:", error);
  }
}

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
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingReview = await prisma.appReview.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    const normalizedHeadline = validation.data.headline?.trim() || null;
    const normalizedComment = validation.data.comment.trim();

    const review = await prisma.appReview.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        rating: validation.data.rating,
        headline: normalizedHeadline,
        comment: normalizedComment,
      },
      update: {
        rating: validation.data.rating,
        headline: normalizedHeadline,
        comment: normalizedComment,
      },
    });

    await sendReviewNotification({
      action: existingReview ? "updated" : "created",
      clerkId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      rating: review.rating,
      comment: review.comment,
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
