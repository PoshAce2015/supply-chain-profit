import { test, expect } from "@playwright/test";
test("@smoke loads dashboard when authed", async ({ page }) => {
  await page.addInitScript(() => {
    const user = { email: "ops@example.com", role: "ops" };
    localStorage.setItem("users.currentUser", JSON.stringify(user));
  });
  await page.goto("/dashboard");
  await expect(page.getByTestId("app-header")).toBeVisible();
});
