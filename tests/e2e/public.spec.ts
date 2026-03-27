import { expect, test, type Page } from "@playwright/test";
import { blockNextImageRequests } from "./support/fixtures";

async function gotoMarketingPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

async function openFreshMarketingPage(page: Page, path: string) {
  const freshPage = await page.context().newPage();
  await blockNextImageRequests(freshPage);
  await gotoMarketingPage(freshPage, path);
  return freshPage;
}

test("public marketing routes stay reachable", async ({ page }) => {
  await blockNextImageRequests(page);
  await gotoMarketingPage(page, "/");
  await expect(
    page.getByRole("heading", { name: /rewire your chess brain/i }),
  ).toBeVisible();

  const navChecks = [
    { linkName: "Features", path: "/features" },
    { linkName: "Pricing", path: "/pricing" },
    { linkName: "Docs", path: "/docs" },
    { linkName: "FAQ", path: "/faq" },
    { linkName: "Blog", path: "/blog" },
  ];

  for (const check of navChecks) {
    const navPage = await openFreshMarketingPage(page, "/");
    try {
      await navPage
        .locator("header")
        .getByRole("navigation")
        .first()
        .getByRole("link", { name: check.linkName, exact: true })
        .click();
      await expect(navPage).toHaveURL(check.path);
      await expect(navPage.locator("main")).toBeVisible();
    } finally {
      await navPage.close();
    }
  }

  for (const path of ["/privacy", "/terms"]) {
    const routePage = await openFreshMarketingPage(page, path);
    try {
      await expect(routePage).toHaveURL(path);
      await expect(routePage.locator("main")).toBeVisible();
    } finally {
      await routePage.close();
    }
  }
});
