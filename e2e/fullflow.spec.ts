import { test, expect } from '@playwright/test'

test.describe('Full Application Flow', () => {
  test('@full should complete entire application workflow', async ({ page }) => {
    // Navigate to imports
    await page.goto('/imports')
    await expect(page.getByTestId('imports-view')).toBeVisible()

    // Test Calculator (with existing data)
    await page.goto('/calculator')
    await expect(page.getByTestId('calc-view')).toBeVisible()
    
    // Test Analytics
    await page.goto('/analytics')
    await expect(page.getByTestId('analytics-view')).toBeVisible()
    
    // Test Cashflow
    await page.goto('/cashflow')
    await expect(page.getByTestId('cashflow-view')).toBeVisible()
    
    // Test Orders
    await page.goto('/orders')
    await expect(page.getByTestId('orders-view')).toBeVisible()
    
    // Test Reconcile
    await page.goto('/reconcile')
    await expect(page.getByTestId('reconcile-view')).toBeVisible()
    
    // Test Validator
    await page.goto('/validator')
    await expect(page.getByTestId('validator-view')).toBeVisible()
    
    // Test Settings
    await page.goto('/settings')
    await expect(page.getByTestId('settings-view')).toBeVisible()
    
    // Test Users
    await page.goto('/users')
    await expect(page.getByTestId('users-view')).toBeVisible()
  })
})
