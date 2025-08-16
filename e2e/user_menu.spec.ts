import { test, expect } from "@playwright/test";

test.describe("UserMenu", () => {
  test("@smoke should open the user menu and show the panel", async ({ page }) => {
    await page.goto("/users");
    const btn = page.getByTestId("user-menu-button");
    await expect(btn).toBeVisible();
    await btn.click();
    const panel = page.getByTestId("user-menu-panel");
    await expect(panel).toBeVisible();
  });
});
