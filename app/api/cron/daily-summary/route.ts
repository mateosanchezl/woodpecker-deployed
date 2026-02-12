import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { DailySummary } from '@/components/email/daily-summary';
import * as Sentry from '@sentry/nextjs';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * GET /api/cron/daily-summary
 * Vercel cron: runs daily at 9:00 UTC (see vercel.json).
 * Sends an email with yesterday's puzzle completions and new user signups.
 * Secured by CRON_SECRET in Authorization header.
 */
export async function GET(req: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/cron/daily-summary',
    },
    async () => {
      const authHeader = req.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', { status: 401 });
      }

      if (!process.env.RESEND_API_KEY) {
        Sentry.captureException(new Error('RESEND_API_KEY not set for daily summary'));
        return new Response('Email not configured', { status: 500 });
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        Sentry.captureException(new Error('ADMIN_EMAIL not set for daily summary'));
        return new Response('Admin email not configured', { status: 500 });
      }

      try {
        const now = new Date();
        const yesterdayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0, 0));
        const yesterdayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

        const [puzzlesCompleted, newUsers] = await Promise.all([
          prisma.attempt.count({
            where: {
              attemptedAt: { gte: yesterdayStart, lt: yesterdayEnd },
              wasSkipped: false,
            },
          }),
          prisma.user.count({
            where: {
              createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
            },
          }),
        ]);

        const dateLabel = yesterdayStart.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        });

        const { error } = await resend.emails.send({
          from: 'Peck <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `Peck daily summary – ${dateLabel}`,
          react: DailySummary({
            date: dateLabel,
            puzzlesCompleted,
            newUsers,
          }),
        });

        if (error) {
          Sentry.captureException(error);
          return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({
          ok: true,
          date: dateLabel,
          puzzlesCompleted,
          newUsers,
        });
      } catch (err) {
        Sentry.captureException(err);
        return Response.json(
          { error: err instanceof Error ? err.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }
  );
}
