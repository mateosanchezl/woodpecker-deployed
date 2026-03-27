import "dotenv/config";

import { createClerkClient } from "@clerk/nextjs/server";
import type { Page } from "@playwright/test";
import { prisma } from "../../../lib/prisma";

const DEFAULT_E2E_EMAIL = "peck-e2e@example.com";
const E2E_PUZZLE_PREFIX = "e2e-puzzle-";
const REQUIRED_PUZZLE_COUNT = 60;

export function getE2EUserConfig() {
  return {
    email: process.env.E2E_CLERK_TEST_EMAIL ?? DEFAULT_E2E_EMAIL,
    firstName: process.env.E2E_CLERK_TEST_FIRST_NAME ?? "Peck",
    lastName: process.env.E2E_CLERK_TEST_LAST_NAME ?? "E2E",
  };
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getClerkClient() {
  return createClerkClient({
    secretKey: getRequiredEnv("CLERK_SECRET_KEY"),
  });
}

function buildPuzzleFixtures() {
  return Array.from({ length: REQUIRED_PUZZLE_COUNT }, (_, index) => ({
    id: `${E2E_PUZZLE_PREFIX}${String(index + 1).padStart(3, "0")}`,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
    moves: "e7e5 g1f3 b8c6",
    rating: 1000,
    ratingDeviation: 60,
    popularity: 95,
    nbPlays: 10_000,
    themes: ["opening"],
    gameUrl: null,
    openingTags: ["king-pawn-game"],
    moveCount: 3,
    difficulty: "intermediate",
    hasMate: false,
  }));
}

export async function ensureE2EUser() {
  const clerkClient = getClerkClient();
  const { email, firstName, lastName } = getE2EUserConfig();
  const existingUsers = await clerkClient.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });
  const existingUser = existingUsers.data[0];

  if (existingUser) {
    return clerkClient.users.updateUser(existingUser.id, {
      firstName,
      lastName,
      skipLegalChecks: true,
    });
  }

  return clerkClient.users.createUser({
    emailAddress: [email],
    firstName,
    lastName,
    skipLegalChecks: true,
    skipPasswordRequirement: true,
  });
}

export async function ensureE2EPuzzles() {
  await prisma.puzzle.createMany({
    data: buildPuzzleFixtures(),
    skipDuplicates: true,
  });
}

export async function ensureE2EAppFixtures() {
  const user = await ensureE2EUser();
  await ensureE2EPuzzles();
  return user;
}

export async function resetE2EAppState() {
  const user = await ensureE2EUser();
  await prisma.user.deleteMany({
    where: {
      clerkId: user.id,
    },
  });

  return user;
}

export async function disconnectE2EDataClients() {
  await prisma.$disconnect();
}

export async function blockNextImageRequests(page: Page) {
  await page.route("**/_next/image**", async (route) => {
    await route.fulfill({
      status: 204,
      body: "",
    });
  });
}
