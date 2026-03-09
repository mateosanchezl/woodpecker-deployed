import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ensureUserExists } from '@/lib/ensure-user'
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
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appUser = await ensureUserExists(clerkId)

    const user = await prisma.user.findUnique({
      where: { id: appUser.id },
      include: {
        _count: {
          select: { puzzleSets: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please try again in a moment.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        estimatedRating: user.estimatedRating,
        preferredSetSize: user.preferredSetSize,
        targetCycles: user.targetCycles,
        autoStartNextPuzzle: user.autoStartNextPuzzle,
        boardTheme: user.boardTheme,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        showOnLeaderboard: user.showOnLeaderboard,
        puzzleSetCount: user._count.puzzleSets,
        createdAt: user.createdAt.toISOString(),
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastTrainedDate: user.lastTrainedDate?.toISOString() ?? null,
        // XP & Levelling
        totalXp: user.totalXp,
        currentLevel: user.currentLevel,
        weeklyXp: user.weeklyXp,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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

    const appUser = await ensureUserExists(clerkId)

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

      const user = await prisma.user.update({
        where: { id: appUser.id },
        data: {
          estimatedRating,
          hasCompletedOnboarding: true,
        },
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

    const user = await prisma.user.update({
      where: { id: appUser.id },
      data: updateData,
    })

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
