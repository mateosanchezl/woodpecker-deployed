import assert from "node:assert/strict";
import test from "node:test";
import { serializeLeaderboardEntry } from "@/lib/leaderboard";
import {
  applySupporterBadgeAction,
  serializeSupporterBadgeState,
  type SupporterAdminStore,
  type SupporterAdminUser,
} from "@/lib/supporters";

function createSupporterUser(
  supporterBadgeGrantedAt: Date | null,
): SupporterAdminUser {
  return {
    id: "user-1",
    clerkId: "clerk_123",
    email: "mateo@example.com",
    name: "Mateo",
    supporterBadgeGrantedAt,
  };
}

function createStore(initialUser: SupporterAdminUser | null) {
  let user = initialUser;
  let updateCount = 0;

  const store: SupporterAdminStore = {
    async findUser() {
      return user;
    },
    async updateUserSupporterBadge(userId, supporterBadgeGrantedAt) {
      assert.ok(user);
      assert.equal(user.id, userId);
      updateCount += 1;
      user = {
        ...user,
        supporterBadgeGrantedAt,
      };
      return user;
    },
  };

  return {
    store,
    getUser: () => user,
    getUpdateCount: () => updateCount,
  };
}

test("serializeSupporterBadgeState derives boolean and ISO date", () => {
  const supporterState = serializeSupporterBadgeState({
    supporterBadgeGrantedAt: new Date("2026-04-03T12:00:00Z"),
  });

  assert.deepEqual(supporterState, {
    isSupporter: true,
    supporterBadgeGrantedAt: "2026-04-03T12:00:00.000Z",
  });
});

test("serializeLeaderboardEntry includes supporter state and period-specific stats", () => {
  const entry = serializeLeaderboardEntry({
    user: {
      id: "user-1",
      name: "Mateo",
      estimatedRating: 1500,
      totalCorrectAttempts: 900,
      weeklyCorrectAttempts: 40,
      totalXp: 2400,
      currentLevel: 8,
      weeklyXp: 160,
      supporterBadgeGrantedAt: new Date("2026-04-01T09:30:00Z"),
    },
    rank: 3,
    period: "weekly",
    currentUserId: "user-1",
  });

  assert.deepEqual(entry, {
    rank: 3,
    userId: "user-1",
    name: "Mateo",
    xp: 160,
    level: 8,
    puzzlesSolved: 40,
    estimatedRating: 1500,
    isCurrentUser: true,
    isSupporter: true,
  });
});

test("applySupporterBadgeAction grants a badge for a non-supporter", async () => {
  const now = new Date("2026-04-03T13:00:00Z");
  const { store, getUser, getUpdateCount } = createStore(createSupporterUser(null));

  const result = await applySupporterBadgeAction(
    store,
    "grant",
    { email: "mateo@example.com" },
    now,
  );

  assert.equal(result.outcome, "granted");
  assert.equal(getUpdateCount(), 1);
  assert.equal(getUser()?.supporterBadgeGrantedAt?.toISOString(), now.toISOString());
});

test("applySupporterBadgeAction is idempotent for already-granted supporters", async () => {
  const { store, getUpdateCount } = createStore(
    createSupporterUser(new Date("2026-04-03T13:00:00Z")),
  );

  const result = await applySupporterBadgeAction(store, "grant", {
    clerkId: "clerk_123",
  });

  assert.equal(result.outcome, "already_granted");
  assert.equal(getUpdateCount(), 0);
});

test("applySupporterBadgeAction revokes a granted badge", async () => {
  const { store, getUser, getUpdateCount } = createStore(
    createSupporterUser(new Date("2026-04-03T13:00:00Z")),
  );

  const result = await applySupporterBadgeAction(store, "revoke", {
    clerkId: "clerk_123",
  });

  assert.equal(result.outcome, "revoked");
  assert.equal(getUpdateCount(), 1);
  assert.equal(getUser()?.supporterBadgeGrantedAt, null);
});

test("applySupporterBadgeAction is idempotent for already-revoked users", async () => {
  const { store, getUpdateCount } = createStore(createSupporterUser(null));

  const result = await applySupporterBadgeAction(store, "revoke", {
    email: "mateo@example.com",
  });

  assert.equal(result.outcome, "already_revoked");
  assert.equal(getUpdateCount(), 0);
});

test("applySupporterBadgeAction reports not-found without updating", async () => {
  const { store, getUpdateCount } = createStore(null);

  const result = await applySupporterBadgeAction(store, "grant", {
    email: "missing@example.com",
  });

  assert.equal(result.outcome, "not_found");
  assert.equal(getUpdateCount(), 0);
});
