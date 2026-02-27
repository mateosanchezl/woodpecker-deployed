import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/training/puzzle-sets/[setId]
 * Deletes a puzzle set and all associated data (cycles, attempts, puzzleInSet).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { setId } = await params

    // Verify the puzzle set exists and belongs to this user
    const puzzleSet = await prisma.puzzleSet.findFirst({
      where: {
        id: setId,
        user: {
          clerkId,
        },
      },
    })

    if (!puzzleSet) {
      return NextResponse.json({ error: 'Puzzle set not found' }, { status: 404 })
    }

    // Delete the puzzle set (cascades to PuzzleInSet, Cycle, and Attempt)
    await prisma.puzzleSet.delete({
      where: { id: setId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting puzzle set:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
