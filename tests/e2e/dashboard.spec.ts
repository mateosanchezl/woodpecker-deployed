import { expect, test } from "@playwright/test";
import { E2E_AUTH_FILE } from "./support/auth";
import {
  blockNextImageRequests,
  disconnectE2EDataClients,
  ensureE2EAppFixtures,
  resetE2EAppState,
} from "./support/fixtures";

test.use({ storageState: E2E_AUTH_FILE });

test.beforeEach(async () => {
  await ensureE2EAppFixtures();
  await resetE2EAppState();
});

test.afterAll(async () => {
  await disconnectE2EDataClients();
});

test("authenticated users can reach the protected dashboard shell", async ({
  page,
}) => {
  await blockNextImageRequests(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Training" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /start training now/i }),
  ).toBeVisible();
});
