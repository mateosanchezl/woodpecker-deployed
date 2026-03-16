import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { serializeAppUser } from '@/lib/app-bootstrap'
import { prisma } from '@/lib/prisma'
import { ensureUserExists, withUserProvisionFallback } from '@/lib/ensure-user'
import { withRouteMetrics } from '@/lib/metrics/request-metrics'
import type { BoardThemeId } from '@/lib/chess/board-themes'
import {
  completeOnboardingSchema,
  updateUserSettingsSchema,
} from '@/lib/validations/training'

/**
 * GET /api/user
 * Returns the current user's profile.
 * Creates the local user row on demand if webhook delivery lags behind sign-up.
 */
export async function GET() {
  return withRouteMetrics('user.get', async () => {
    try {
      const { userId: clerkId } = await auth()
      if (!clerkId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const user = await withUserProvisionFallback(clerkId, () =>
        prisma.user.findUnique({
          where: { clerkId },
          include: {
            _count: {
              select: { puzzleSets: true },
            },
          },
        })
      )

      if (!user) {
        return NextResponse.json(
          { error: 'User not found. Please try again in a moment.' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        user: serializeAppUser(user, user._count.puzzleSets),
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

/**
 * PATCH /api/user
 * Updates the current user's profile.
 * Supports both onboarding (estimatedRating only) and settings updates.
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Try settings schema first (more permissive), fall back to onboarding schema
    const settingsValidation = updateUserSettingsSchema.safeParse(body)
    const onboardingValidation = completeOnboardingSchema.safeParse(body)

    const submittedKeys =
      body && typeof body === 'object' && !Array.isArray(body)
        ? Object.keys(body)
        : []

    // Treat estimatedRating-only requests as onboarding completion.
    const isOnboarding =
      onboardingValidation.success &&
      submittedKeys.length === 1 &&
      submittedKeys[0] === 'estimatedRating'

    if (isOnboarding) {
      const { estimatedRating } = onboardingValidation.data

      const user = await updateUserByClerkId(clerkId, {
        estimatedRating,
        hasCompletedOnboarding: true,
      })

      return NextResponse.json({
        user: {
          id: user.id,
          estimatedRating: user.estimatedRating,
          boardTheme: user.boardTheme,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          showOnLeaderboard: user.showOnLeaderboard,
        },
      })
    }

    // Otherwise, treat as settings update
    if (!settingsValidation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: settingsValidation.error.message },
        { status: 400 }
      )
    }

    const {
      estimatedRating,
      preferredSetSize,
      targetCycles,
      autoStartNextPuzzle,
      boardTheme,
      showOnLeaderboard,
    } = settingsValidation.data

    // Build update data only with provided fields
    const updateData: {
      estimatedRating?: number
      preferredSetSize?: number
      targetCycles?: number
      autoStartNextPuzzle?: boolean
      boardTheme?: BoardThemeId
      showOnLeaderboard?: boolean
    } = {}
    if (estimatedRating !== undefined) {
      updateData.estimatedRating = estimatedRating
    }
    if (preferredSetSize !== undefined) {
      updateData.preferredSetSize = preferredSetSize
    }
    if (targetCycles !== undefined) {
      updateData.targetCycles = targetCycles
    }
    if (autoStartNextPuzzle !== undefined) {
      updateData.autoStartNextPuzzle = autoStartNextPuzzle
    }
    if (boardTheme !== undefined) {
      updateData.boardTheme = boardTheme
    }
    if (showOnLeaderboard !== undefined) {
      updateData.showOnLeaderboard = showOnLeaderboard
    }

    const user = await updateUserByClerkId(clerkId, updateData)

    return NextResponse.json({
      user: {
        id: user.id,
        estimatedRating: user.estimatedRating,
        preferredSetSize: user.preferredSetSize,
        targetCycles: user.targetCycles,
        autoStartNextPuzzle: user.autoStartNextPuzzle,
        boardTheme: user.boardTheme,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        showOnLeaderboard: user.showOnLeaderboard,
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateUserByClerkId(
  clerkId: string,
  data: {
    estimatedRating?: number
    preferredSetSize?: number
    targetCycles?: number
    autoStartNextPuzzle?: boolean
    boardTheme?: BoardThemeId
    showOnLeaderboard?: boolean
    hasCompletedOnboarding?: boolean
  }
) {
  try {
    return await prisma.user.update({
      where: { clerkId },
      data,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      await ensureUserExists(clerkId)
      return prisma.user.update({
        where: { clerkId },
        data,
      })
    }

    throw error
  }
}
