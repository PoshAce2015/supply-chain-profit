import { test, expect } from "@playwright/test"
test("@smoke should load dashboard", async ({ page }) => { await page.goto("/dashboard"); await expect(page.getByTestId("app-header")).toBeVisible(); });
