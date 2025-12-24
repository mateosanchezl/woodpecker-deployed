import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { completeOnboardingSchema } from '@/lib/validations/training'

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
        puzzleSetCount: user._count.puzzleSets,
        createdAt: user.createdAt.toISOString(),
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
 * Updates the current user's profile and completes onboarding.
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = completeOnboardingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      )
    }

    const { estimatedRating } = validation.data

    // Update user
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
