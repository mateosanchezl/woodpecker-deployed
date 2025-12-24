import type { Move, Square } from 'chess.js'

// Parsed UCI move format (e.g., "e2e4" or "e7e8q")
export interface ParsedMove {
  from: Square
  to: Square
  promotion?: 'q' | 'r' | 'b' | 'n'
}

// Puzzle status states
export type PuzzleStatus =
  | 'loading'
  | 'opponent_turn'
  | 'player_turn'
  | 'correct'
  | 'incorrect'
  | 'complete'

// Board orientation
export type BoardOrientation = 'white' | 'black'

// Puzzle state managed by useChessPuzzle hook
export interface PuzzleState {
  position: string // Current FEN
  orientation: BoardOrientation
  currentMoveIndex: number // Index in solution moves array
  status: PuzzleStatus
  lastMove: { from: Square; to: Square } | null
  movesPlayed: string[] // UCI moves the player has made
  isPlayerTurn: boolean
}

// Puzzle data from database
export interface PuzzleData {
  id: string
  fen: string
  moves: string // Space-separated UCI moves
  rating: number
  themes: string[]
}

// Puzzle in set with position and stats
export interface PuzzleInSetData {
  id: string
  position: number
  totalAttempts: number
  correctAttempts: number
  averageTime: number | null
  puzzle: PuzzleData
}

// Training progress information
export interface TrainingProgress {
  currentPosition: number
  totalPuzzles: number
  completedInCycle: number
  cycleNumber: number
}

// Result of a puzzle attempt
export interface AttemptResult {
  puzzleInSetId: string
  timeSpent: number // milliseconds
  isCorrect: boolean
  wasSkipped: boolean
  movesPlayed: string[] // UCI moves played by user
}

// Animation timing constants
export const ANIMATION_DURATION = 200 // Piece movement in ms
export const OPPONENT_MOVE_DELAY = 300 // Pause before opponent responds
export const FEEDBACK_DISPLAY_TIME = 400 // Show correct/incorrect feedback
export const NEXT_PUZZLE_DELAY = 600 // Delay before advancing to next puzzle

// Promotion piece types
export type PromotionPiece = 'q' | 'r' | 'b' | 'n'

// Promotion dialog state
export interface PromotionState {
  isOpen: boolean
  from: Square | null
  to: Square | null
  color: 'w' | 'b'
}

// chess.js Move type re-export for convenience
export type { Move, Square }
