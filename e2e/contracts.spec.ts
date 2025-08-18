import { test, expect } from "@playwright/test";

const setAuthed = async (page: any) => {
  await page.addInitScript(() => {
    // Clear localStorage to ensure a clean state for auth-related tests
    localStorage.clear();
    // Set Redux persist state directly for authenticated user
    const user = { email: "ops@example.com", role: "ops" };
    localStorage.setItem("scp:v1", JSON.stringify({ users: { currentUser: user } }));
  });
};

test.describe("@contract UI invariants", () => {
  test("Login page exposes required elements", async ({ page }) => {
    await page.addInitScript(() => { localStorage.clear(); }); // Ensure no user is logged in
    await page.goto("/login");
    await page.addStyleTag({ content: ".no-anim *{transition:none!important;animation:none!important}" });
    await page.evaluate(() => document.body.classList.add("no-anim"));

    await expect(page.getByTestId("login-view")).toBeVisible();
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("btn-login-submit")).toBeVisible();
    await expect(page.getByTestId("link-register")).toBeVisible();
  });

  test("Header popovers (alerts & user menu) render above and fully visible", async ({ page }) => {
    await setAuthed(page);
    await page.goto("/dashboard");
    await page.addStyleTag({ content: ".no-anim *{transition:none!important;animation:none!important}" });
    await page.evaluate(() => document.body.classList.add("no-anim"));

    // Alerts
    const alertsBtn = page.getByTestId("alerts-button");
    await expect(alertsBtn).toBeVisible();
    await alertsBtn.click();
    const alertsPanel = page.getByTestId("alerts-panel");
    await expect(alertsPanel).toBeVisible();
    const alertsInViewport = await alertsPanel.evaluate((el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
    });
    expect(alertsInViewport).toBeTruthy();
    const zAlerts = await alertsPanel.evaluate((el: HTMLElement) => getComputedStyle(el).zIndex);
    expect(Number(zAlerts) || 0).toBeGreaterThanOrEqual(60);

    // User menu
    const userBtn = page.getByTestId("user-menu-button");
    await expect(userBtn).toBeVisible();
    await userBtn.click();
    const menuPanel = page.getByTestId("user-menu-panel");
    await expect(menuPanel).toBeVisible();
    const menuInViewport = await menuPanel.evaluate((el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
    });
    expect(menuInViewport).toBeTruthy();
    const menuZ = await menuPanel.evaluate((el: HTMLElement) => getComputedStyle(el).zIndex);
    expect(Number(menuZ) || 0).toBeGreaterThanOrEqual(60);
  });

  test("Sidebar basic navigability", async ({ page }) => {
    await setAuthed(page);
    await page.goto("/dashboard");
    await expect(page.getByTestId("app-header")).toBeVisible();
    await page.getByTestId("nav-imports").click();
    await expect(page).toHaveURL(/\/imports$/);
    await page.getByTestId("nav-dashboard").click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("User menu items navigate and logout", async ({ page }) => {
    // simulate authed user
    await page.addInitScript(() => {
      localStorage.setItem("users.currentUser", JSON.stringify({ email: "ops@example.com", role: "ops" }))
    })
    await page.goto("/dashboard")

    await page.getByTestId("user-menu-button").click()
    await page.getByTestId("menu-item-profile").click()
    await expect(page).toHaveURL(/\/users$/)

    await page.getByTestId("user-menu-button").click()
    await page.getByTestId("menu-item-settings").click()
    await expect(page).toHaveURL(/\/settings$/)

    await page.getByTestId("user-menu-button").click()
    await page.getByTestId("menu-item-logout").click()
    await expect(page).toHaveURL(/\/login$/)
  })
});
