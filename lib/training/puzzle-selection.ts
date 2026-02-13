import { prisma } from '@/lib/prisma'
import type { TrainingTheme } from '@/lib/chess/training-themes'

export interface SelectPuzzlesForSetInput {
  minRating: number
  maxRating: number
  size: number
  focusTheme?: TrainingTheme | null
}

export interface SelectedPuzzle {
  id: string
}

/**
 * Selects random puzzles for set generation in a single DB query.
 */
export async function selectRandomPuzzlesForSet(
  input: SelectPuzzlesForSetInput
): Promise<SelectedPuzzle[]> {
  const { minRating, maxRating, size, focusTheme } = input

  if (focusTheme) {
    return prisma.$queryRaw<SelectedPuzzle[]>`
      SELECT id FROM "Puzzle"
      WHERE rating >= ${minRating}
        AND rating <= ${maxRating}
        AND themes @> ARRAY[${focusTheme}]::text[]
      ORDER BY RANDOM()
      LIMIT ${size}
    `
  }

  return prisma.$queryRaw<SelectedPuzzle[]>`
    SELECT id FROM "Puzzle"
    WHERE rating >= ${minRating}
      AND rating <= ${maxRating}
    ORDER BY RANDOM()
    LIMIT ${size}
  `
}
