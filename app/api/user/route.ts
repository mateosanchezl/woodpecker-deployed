import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  completeOnboardingSchema,
  updateUserSettingsSchema,
} from '@/lib/validations/training'

/**
 * GET /api/user
 * Returns the current user's profile.
 * User creation is handled by Clerk webhooks.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        _count: {
          select: { puzzleSets: true },
        },
      },
    })

    if (!user) {
      // User should be created by webhook - if not found, webhook may be delayed
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
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        showOnLeaderboard: user.showOnLeaderboard,
        puzzleSetCount: user._count.puzzleSets,
        createdAt: user.createdAt.toISOString(),
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
 * Supports both onboarding (estimatedRating) and settings updates (showOnLeaderboard).
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

    // If it's an onboarding request (has estimatedRating and no other fields)
    const isOnboarding =
      onboardingValidation.success && !('showOnLeaderboard' in body)

    if (isOnboarding) {
      const { estimatedRating } = onboardingValidation.data

      const user = await prisma.user.update({
        where: { clerkId },
        data: {
          estimatedRating,
          hasCompletedOnboarding: true,
        },
      })

      return NextResponse.json({
        user: {
          id: user.id,
          estimatedRating: user.estimatedRating,
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

    const { estimatedRating, preferredSetSize, targetCycles, showOnLeaderboard } = settingsValidation.data

    // Build update data only with provided fields
    const updateData: {
      estimatedRating?: number
      preferredSetSize?: number
      targetCycles?: number
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
    if (showOnLeaderboard !== undefined) {
      updateData.showOnLeaderboard = showOnLeaderboard
    }

    const user = await prisma.user.update({
      where: { clerkId },
      data: updateData,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        estimatedRating: user.estimatedRating,
        preferredSetSize: user.preferredSetSize,
        targetCycles: user.targetCycles,
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
