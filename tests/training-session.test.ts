import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildTrainingSessionPayload,
  mapTrainingSessionSnapshotRows,
  type TrainingSessionSnapshotRow,
} from '../lib/training/session'

test('mapTrainingSessionSnapshotRows returns null when the cycle is missing', () => {
  assert.equal(mapTrainingSessionSnapshotRows([]), null)
})

test('mapTrainingSessionSnapshotRows maps current and prefetched puzzles from raw rows', () => {
  const rows: TrainingSessionSnapshotRow[] = [
    {
      cycleId: 'cycle_1',
      puzzleSetId: 'set_1',
      cycleNumber: 2,
      totalPuzzles: 10,
      attemptedCount: 2,
      nextPosition: 3,
      solvedCorrect: 2,
      solvedIncorrect: 0,
      skipped: 0,
      totalTime: 4200,
      completedAt: null,
      puzzleInSetId: 'pis_3',
      position: 3,
      totalAttempts: 1,
      correctAttempts: 1,
      averageTime: 1200,
      puzzleId: 'puzzle_3',
      fen: '8/8/8/8/8/8/8/8 w - - 0 1',
      moves: 'e2e4',
      rating: 1300,
      themes: ['fork'],
    },
    {
      cycleId: 'cycle_1',
      puzzleSetId: 'set_1',
      cycleNumber: 2,
      totalPuzzles: 10,
      attemptedCount: 2,
      nextPosition: 3,
      solvedCorrect: 2,
      solvedIncorrect: 0,
      skipped: 0,
      totalTime: 4200,
      completedAt: null,
      puzzleInSetId: 'pis_4',
      position: 4,
      totalAttempts: 0,
      correctAttempts: 0,
      averageTime: null,
      puzzleId: 'puzzle_4',
      fen: '8/8/8/8/8/8/8/8 b - - 0 1',
      moves: 'd7d5',
      rating: 1350,
      themes: ['pin'],
    },
  ]

  const session = mapTrainingSessionSnapshotRows(rows)

  assert.ok(session)
  assert.equal(session?.progress.currentPosition, 3)
  assert.equal(session?.progress.completedInCycle, 2)
  assert.equal(session?.current?.puzzle.id, 'puzzle_3')
  assert.equal(session?.prefetchedNext?.puzzle.id, 'puzzle_4')
})

test('buildTrainingSessionPayload marks completed cycles without upcoming puzzles', () => {
  const session = buildTrainingSessionPayload(
    {
      id: 'cycle_done',
      puzzleSetId: 'set_1',
      cycleNumber: 3,
      totalPuzzles: 10,
      attemptedCount: 10,
      nextPosition: 11,
      solvedCorrect: 9,
      solvedIncorrect: 1,
      skipped: 0,
      totalTime: 9000,
      completedAt: new Date('2026-03-15T10:00:00.000Z'),
    },
    []
  )

  assert.equal(session.isCycleComplete, true)
  assert.equal(session.current, null)
  assert.equal(session.prefetchedNext, null)
  assert.equal(session.progress.completedInCycle, 10)
})
