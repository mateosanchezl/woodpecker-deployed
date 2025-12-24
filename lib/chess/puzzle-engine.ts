import { Chess } from 'chess.js'
import type { ParsedMove, BoardOrientation, Square, PuzzleData } from './types'

/**
 * Parse a UCI move string into its components.
 * UCI format: "e2e4" (normal move) or "e7e8q" (promotion)
 */
export function parseUciMove(uci: string): ParsedMove {
  if (uci.length < 4 || uci.length > 5) {
    throw new Error(`Invalid UCI move: ${uci}`)
  }

  const from = uci.slice(0, 2) as Square
  const to = uci.slice(2, 4) as Square
  const promotion = uci.length === 5
    ? (uci[4] as 'q' | 'r' | 'b' | 'n')
    : undefined

  // Validate squares are valid chess squares
  const validSquare = /^[a-h][1-8]$/
  if (!validSquare.test(from) || !validSquare.test(to)) {
    throw new Error(`Invalid UCI move: ${uci}`)
  }

  return { from, to, promotion }
}

/**
 * Convert a chess.js move object to UCI notation.
 */
export function toUciMove(from: Square, to: Square, promotion?: string): string {
  return from + to + (promotion || '')
}

/**
 * Determine board orientation from FEN.
 * In puzzles, the first move shown is the opponent's move.
 * So the player's color is OPPOSITE of whose turn it is in the FEN.
 */
export function getOrientationFromFen(fen: string): BoardOrientation {
  const parts = fen.split(' ')
  if (parts.length < 2) {
    throw new Error(`Invalid FEN: ${fen}`)
  }
  const turn = parts[1] // 'w' or 'b'
  // Player responds after opponent's first move, so player is opposite color
  return turn === 'w' ? 'black' : 'white'
}

/**
 * Get the color that moves first from FEN (opponent in puzzle context).
 */
export function getTurnFromFen(fen: string): 'w' | 'b' {
  const parts = fen.split(' ')
  if (parts.length < 2) {
    throw new Error(`Invalid FEN: ${fen}`)
  }
  return parts[1] as 'w' | 'b'
}

/**
 * Parse the solution moves string into an array of UCI moves.
 */
export function parseSolutionMoves(moves: string): string[] {
  return moves.trim().split(/\s+/).filter(Boolean)
}

/**
 * Check if a move results in pawn promotion.
 */
export function isPromotionMove(
  fen: string,
  from: Square,
  to: Square
): boolean {
  const chess = new Chess(fen)
  const piece = chess.get(from)

  if (!piece || piece.type !== 'p') {
    return false
  }

  // Check if pawn is moving to the last rank
  const targetRank = to[1]
  if (piece.color === 'w' && targetRank === '8') {
    return true
  }
  if (piece.color === 'b' && targetRank === '1') {
    return true
  }

  return false
}

/**
 * Validate that a puzzle's FEN and moves are valid and legal.
 * Returns true if valid, throws an error with details if invalid.
 */
export function validatePuzzleData(puzzle: PuzzleData): boolean {
  try {
    const chess = new Chess()

    // Validate FEN by trying to load it
    chess.load(puzzle.fen)

    // Validate each move in the solution
    const moves = parseSolutionMoves(puzzle.moves)

    if (moves.length === 0) {
      throw new Error('Puzzle has no solution moves')
    }

    for (const moveUci of moves) {
      const parsed = parseUciMove(moveUci)
      const result = chess.move({
        from: parsed.from,
        to: parsed.to,
        promotion: parsed.promotion,
      })

      if (!result) {
        throw new Error(`Illegal move in solution: ${moveUci}`)
      }
    }

    return true
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid puzzle data: ${error.message}`)
    }
    throw error
  }
}

/**
 * Check if a player's move matches the expected solution move.
 */
export function isCorrectMove(
  from: Square,
  to: Square,
  promotion: string | undefined,
  expectedUci: string
): boolean {
  const expected = parseUciMove(expectedUci)

  return (
    from === expected.from &&
    to === expected.to &&
    (promotion || undefined) === expected.promotion
  )
}

/**
 * Check if a move is legal in the given position.
 */
export function isLegalMove(
  fen: string,
  from: Square,
  to: Square,
  promotion?: string
): boolean {
  try {
    const chess = new Chess(fen)
    const result = chess.move({
      from,
      to,
      promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    })
    return result !== null
  } catch {
    return false
  }
}

/**
 * Get all legal moves from a square.
 */
export function getLegalMovesFromSquare(fen: string, square: Square): Square[] {
  try {
    const chess = new Chess(fen)
    const moves = chess.moves({ square, verbose: true })
    return moves.map(m => m.to as Square)
  } catch {
    return []
  }
}

/**
 * Sleep utility for animation delays.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
