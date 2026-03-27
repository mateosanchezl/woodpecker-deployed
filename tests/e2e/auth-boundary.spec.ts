import { expect, test } from "@playwright/test";
import { blockNextImageRequests } from "./support/fixtures";

test("protected routes redirect unauthenticated users to sign in", async ({
  page,
}) => {
  await blockNextImageRequests(page);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in/);
  await expect(
    page.getByRole("heading", { name: /sign in to peck/i }),
  ).toBeVisible();
});
