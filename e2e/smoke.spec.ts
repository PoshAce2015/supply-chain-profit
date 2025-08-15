import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load application and display navigation @smoke', async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Should redirect to imports tab
    await expect(page).toHaveURL('/imports')
    
    // Should display the header
    await expect(page.getByTestId('app-header').locator('h1')).toContainText('Supply Chain & Profit 1.0')
    
    // Should display navigation tabs
    await expect(page.getByTestId('app-nav')).toBeVisible()
    await expect(page.getByTestId('tab-imports')).toBeVisible()
    await expect(page.getByTestId('tab-calculator')).toBeVisible()
    await expect(page.getByTestId('tab-orders')).toBeVisible()
    await expect(page.getByTestId('tab-sla')).toBeVisible()
    await expect(page.getByTestId('tab-analytics')).toBeVisible()
    await expect(page.getByTestId('tab-cashflow')).toBeVisible()
    await expect(page.getByTestId('tab-reconcile')).toBeVisible()
    await expect(page.getByTestId('tab-validator')).toBeVisible()
    await expect(page.getByTestId('tab-settings')).toBeVisible()
    await expect(page.getByTestId('tab-users')).toBeVisible()
  })

  test('should navigate between tabs @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Click on Calculator tab
    await page.getByTestId('tab-calculator').click()
    await expect(page).toHaveURL('/calculator')
    await expect(page.locator('h2')).toContainText('Calculator')
    
    // Click on Orders tab
    await page.getByTestId('tab-orders').click()
    await expect(page).toHaveURL('/orders')
    await expect(page.locator('h2')).toContainText('Orders')
    
    // Click on Settings tab
    await page.getByTestId('tab-settings').click()
    await expect(page).toHaveURL('/settings')
    await expect(page.locator('h2')).toContainText('Settings')
  })

  test('should display KPI tiles in header @smoke', async ({ page }) => {
    await page.goto('/')
    
    // Should display KPI tiles
    await expect(page.getByTestId('kpi-revenue')).toBeVisible()
    await expect(page.getByTestId('kpi-profit')).toBeVisible()
    await expect(page.getByTestId('kpi-orders')).toBeVisible()
    await expect(page.getByTestId('kpi-avg-margin')).toBeVisible()
    await expect(page.getByTestId('kpi-settlement-var')).toBeVisible()
  })
})
