import { mkdir } from "node:fs/promises";
import path from "node:path";

import { clerk } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";
import {
  blockNextImageRequests,
  disconnectE2EDataClients,
  ensureE2EAppFixtures,
  getE2EUserConfig,
} from "./support/fixtures";
import { E2E_AUTH_FILE } from "./support/auth";

setup("authenticate the shared e2e user", async ({ page }) => {
  try {
    await ensureE2EAppFixtures();
    await mkdir(path.dirname(E2E_AUTH_FILE), { recursive: true });
    await blockNextImageRequests(page);

    await page.goto("/");
    await clerk.signIn({
      page,
      emailAddress: getE2EUserConfig().email,
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "Training" })).toBeVisible();

    await page.context().storageState({ path: E2E_AUTH_FILE });
  } finally {
    await disconnectE2EDataClients();
  }
});
