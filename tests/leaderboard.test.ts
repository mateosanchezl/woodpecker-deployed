import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildLeaderboardResponse,
  normalizeLeaderboardSnapshot,
  type LeaderboardSnapshot,
} from '../lib/leaderboard'

test('normalizeLeaderboardSnapshot falls back to empty values', () => {
  assert.deepEqual(normalizeLeaderboardSnapshot(null), {
    entries: [],
    total: 0,
    currentUser: null,
  })
})

test('buildLeaderboardResponse preserves pagination and week start metadata', () => {
  const snapshot: LeaderboardSnapshot = {
    entries: [
      {
        rank: 6,
        userId: 'user_1',
        name: 'Mateo',
        xp: 320,
        level: 4,
        puzzlesSolved: 18,
        estimatedRating: 1500,
        isCurrentUser: true,
      },
    ],
    total: 12,
    currentUser: {
      rank: 3,
      entry: {
        rank: 3,
        userId: 'user_1',
        name: 'Mateo',
        xp: 320,
        level: 4,
        puzzlesSolved: 18,
        estimatedRating: 1500,
        isCurrentUser: true,
      },
    },
  }

  const response = buildLeaderboardResponse({
    snapshot,
    period: 'weekly',
    limit: 5,
    offset: 5,
    weekStartDate: '2026-03-09T00:00:00.000Z',
  })

  assert.equal(response.pagination.total, 12)
  assert.equal(response.pagination.hasMore, true)
  assert.equal(response.currentUser?.rank, 3)
  assert.equal(response.weekStartDate, '2026-03-09T00:00:00.000Z')
})
