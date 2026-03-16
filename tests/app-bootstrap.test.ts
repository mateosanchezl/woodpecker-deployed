import assert from "node:assert/strict";
import test from "node:test";
import { serializeAppUser, serializePuzzleSets } from "@/lib/app-bootstrap";

test("serializePuzzleSets derives cycle state and sorts by activity", () => {
  const sets = serializePuzzleSets([
    {
      id: "set-a",
      name: "Set A",
      size: 50,
      focusTheme: null,
      targetCycles: 5,
      targetRating: 1400,
      minRating: 1300,
      maxRating: 1500,
      isActive: true,
      createdAt: new Date("2026-03-01T12:00:00Z"),
      lastTrainedAt: null,
      cycles: [
        {
          id: "cycle-a",
          cycleNumber: 2,
          completedAt: null,
          startedAt: new Date("2026-03-10T12:00:00Z"),
        },
      ],
    },
    {
      id: "set-b",
      name: "Set B",
      size: 100,
      focusTheme: "fork",
      targetCycles: 3,
      targetRating: 1600,
      minRating: 1500,
      maxRating: 1700,
      isActive: true,
      createdAt: new Date("2026-03-05T12:00:00Z"),
      lastTrainedAt: new Date("2026-03-12T08:00:00Z"),
      cycles: [
        {
          id: "cycle-b",
          cycleNumber: 1,
          completedAt: new Date("2026-03-11T09:00:00Z"),
          startedAt: new Date("2026-03-11T08:00:00Z"),
        },
      ],
    },
  ]);

  assert.equal(sets[0].id, "set-b");
  assert.equal(sets[0].currentCycleId, null);
  assert.equal(sets[0].completedCycles, 1);
  assert.equal(sets[1].id, "set-a");
  assert.equal(sets[1].currentCycleId, "cycle-a");
  assert.equal(sets[1].completedCycles, 1);
  assert.equal(sets[1].lastTrainedAt, "2026-03-10T12:00:00.000Z");
});

test("serializeAppUser normalizes dates and keeps puzzle-set count explicit", () => {
  const user = serializeAppUser(
    {
      id: "user-1",
      email: "mateo@example.com",
      name: "Mateo",
      estimatedRating: 1500,
      preferredSetSize: 100,
      targetCycles: 5,
      autoStartNextPuzzle: true,
      boardTheme: "peck",
      hasCompletedOnboarding: true,
      showOnLeaderboard: true,
      createdAt: new Date("2026-03-01T00:00:00Z"),
      currentStreak: 4,
      longestStreak: 7,
      lastTrainedDate: new Date("2026-03-16T00:00:00Z"),
      totalXp: 1234,
      currentLevel: 6,
      weeklyXp: 210,
    },
    3,
  );

  assert.deepEqual(user, {
    id: "user-1",
    email: "mateo@example.com",
    name: "Mateo",
    estimatedRating: 1500,
    preferredSetSize: 100,
    targetCycles: 5,
    autoStartNextPuzzle: true,
    boardTheme: "peck",
    hasCompletedOnboarding: true,
    showOnLeaderboard: true,
    puzzleSetCount: 3,
    createdAt: "2026-03-01T00:00:00.000Z",
    currentStreak: 4,
    longestStreak: 7,
    lastTrainedDate: "2026-03-16T00:00:00.000Z",
    totalXp: 1234,
    currentLevel: 6,
    weeklyXp: 210,
  });
});
