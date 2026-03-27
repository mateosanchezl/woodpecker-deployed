import { expect, test, type Page } from "@playwright/test";
import { E2E_AUTH_FILE } from "./support/auth";
import {
  blockNextImageRequests,
  disconnectE2EDataClients,
  ensureE2EAppFixtures,
  resetE2EAppState,
} from "./support/fixtures";

test.use({ storageState: E2E_AUTH_FILE });

async function resolveTrainingEntryState(page: Page) {
  const board = page.getByTestId("training-board");
  const continueButton = page.getByTestId("continue-training-button");
  const quickStartButton = page.getByTestId("training-quick-start-button");

  await expect
    .poll(
      async () => {
        if (await board.isVisible()) {
          return "board";
        }

        if (await continueButton.isVisible()) {
          return "continue";
        }

        if (await quickStartButton.isVisible()) {
          return "quickstart";
        }

        return "pending";
      },
      { timeout: 30_000 },
    )
    .not.toBe("pending");

  if (await board.isVisible()) {
    return "board";
  }

  if (await continueButton.isVisible()) {
    return "continue";
  }

  return "quickstart";
}

async function waitForAttemptSubmission(page: Page) {
  const response = await page.waitForResponse((request) => {
    return (
      request.url().includes("/api/training/puzzle-sets/") &&
      request.url().includes("/attempts") &&
      request.request().method() === "POST"
    );
  });

  if (!response.ok()) {
    throw new Error(
      `Attempt submission failed with ${response.status()}: ${await response.text()}`,
    );
  }
}

async function openTrainingSession(page: Page) {
  await blockNextImageRequests(page);
  await page.goto("/training?quickstart=1");

  const board = page.getByTestId("training-board");
  const progress = page.getByTestId("training-progress");
  const quickStartButton = page.getByTestId("training-quick-start-button");
  const continueButton = page.getByTestId("continue-training-button");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const entryState = await resolveTrainingEntryState(page);

    if (entryState === "board") {
      break;
    }

    if (entryState === "quickstart") {
      try {
        if (await quickStartButton.isVisible()) {
          await quickStartButton.click();
        }
      } catch {
        // The quick-start card can disappear once the auto-start mutation takes over.
      }
      continue;
    }

    try {
      if (await continueButton.isVisible()) {
        await continueButton.click();
      }
    } catch {
      // The continue card can be replaced by the live board between polling and click.
    }
  }

  await expect(board).toBeVisible();
  await expect(board).toHaveAttribute("data-puzzle-id", /.+/);
  await expect(progress).toHaveAttribute("data-current-position", "1");

  return { board, progress };
}

test.beforeEach(async () => {
  await ensureE2EAppFixtures();
  await resetE2EAppState();
});

test.afterAll(async () => {
  await disconnectE2EDataClients();
});

test("quick start creates an active training session", async ({ page }) => {
  await openTrainingSession(page);
});

test("skipping a puzzle advances progress and training can be resumed", async ({
  page,
}) => {
  const { board, progress } = await openTrainingSession(page);
  const initialPuzzleId = await board.getAttribute("data-puzzle-id");
  const skipRequest = waitForAttemptSubmission(page);

  await page.getByTestId("training-skip-button").click();
  await skipRequest;

  await expect(progress).toHaveAttribute("data-current-position", "2");
  await expect(board).not.toHaveAttribute("data-puzzle-id", initialPuzzleId ?? "");

  await page.goto("/training");
  await expect(page.getByTestId("continue-training-card")).toBeVisible();
  await page.getByTestId("continue-training-button").click();

  await expect(page.getByTestId("training-board")).toBeVisible();
  await expect(progress).toHaveAttribute("data-current-position", "2");
});

test("manual advance waits for next-puzzle click and persists auto-start preference", async ({
  page,
}) => {
  const { progress } = await openTrainingSession(page);
  const autoStartToggle = page.getByTestId("training-auto-start-toggle");
  const nextPuzzleButton = page.getByTestId("training-next-puzzle-button");

  await autoStartToggle.click();
  await expect(autoStartToggle).toHaveAttribute("aria-checked", "false");

  const skipRequest = waitForAttemptSubmission(page);
  await page.getByTestId("training-skip-button").click();
  await skipRequest;

  await expect(nextPuzzleButton).toBeVisible();
  await expect(progress).toHaveAttribute("data-current-position", "1");

  await nextPuzzleButton.click();
  await expect(progress).toHaveAttribute("data-current-position", "2");

  await page.reload();
  await expect(page.getByTestId("continue-training-card")).toBeVisible();
  await page.getByTestId("continue-training-button").click();
  await expect(page.getByTestId("training-board")).toBeVisible();
  await expect(autoStartToggle).toHaveAttribute("aria-checked", "false");
});
