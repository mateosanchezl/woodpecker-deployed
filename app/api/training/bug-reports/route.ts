import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensure-user";
import {
  trainingBugReportSchema,
  type TrainingBugReportInput,
} from "@/lib/validations/bug-reports";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatValue(value: string | number | boolean | null) {
  if (value === null) return "n/a";
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

function buildReportText(params: {
  clerkId: string;
  userId: string | null;
  userEmail: string | null;
  submittedAt: string;
  userAgent: string | null;
  payload: TrainingBugReportInput;
}) {
  const { clerkId, userId, userEmail, submittedAt, userAgent, payload } = params;

  return [
    "Training bug report",
    "",
    "User message",
    payload.message,
    "",
    "User identity",
    `Clerk ID: ${clerkId}`,
    `User ID: ${formatValue(userId)}`,
    `Email: ${formatValue(userEmail)}`,
    "",
    "Training context",
    `Puzzle set ID: ${formatValue(payload.puzzleSetId)}`,
    `Cycle ID: ${formatValue(payload.cycleId)}`,
    `Cycle number: ${formatValue(payload.cycleNumber)}`,
    `Puzzle-in-set ID: ${formatValue(payload.puzzleInSetId)}`,
    `Puzzle ID: ${formatValue(payload.puzzleId)}`,
    `Puzzle position: ${formatValue(payload.puzzlePosition)}`,
    `Cycle complete: ${formatValue(payload.isCycleComplete)}`,
    `Session error: ${formatValue(payload.sessionError)}`,
    "",
    "Request metadata",
    `Current URL: ${payload.currentUrl}`,
    `Submitted at: ${submittedAt}`,
    `User agent: ${formatValue(userAgent)}`,
  ].join("\n");
}

/**
 * POST /api/training/bug-reports
 * Sends a bug report email with attached training context.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Bug reporting is unavailable right now" },
        { status: 503 },
      );
    }

    if (process.env.NODE_ENV === "development") {
      await ensureUserExists(clerkId);
    }

    const body = await request.json();
    const validation = trainingBugReportSchema.safeParse(body);

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
      },
    });

    const payload = validation.data;
    const subjectParts = [
      "Training bug report",
      payload.puzzleSetId ? `set ${payload.puzzleSetId}` : "set unknown",
      payload.cycleId ? `cycle ${payload.cycleId}` : "cycle unknown",
    ];

    const { error } = await resend.emails.send({
      from: "Peck <onboarding@resend.dev>",
      to: [process.env.ADMIN_EMAIL],
      subject: subjectParts.join(" - "),
      text: buildReportText({
        clerkId,
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        submittedAt: new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
        payload,
      }),
    });

    if (error) {
      console.error("Error sending training bug report:", error);
      return NextResponse.json(
        { error: "Couldn't send your report. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error sending training bug report:", error);
    return NextResponse.json(
      { error: "Couldn't send your report. Please try again." },
      { status: 500 },
    );
  }
}
