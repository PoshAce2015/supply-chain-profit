import { test, expect } from '@playwright/test'

test.describe('Imports Categories', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto('/login')
    await page.fill('[data-testid="login-email"]', 'ops@example.com')
    await page.fill('[data-testid="login-password"]', 'password123')
    await page.click('[data-testid="btn-login-submit"]')
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard')
  })

  test('should display all 7 category tiles on /imports', async ({ page }) => {
    await page.goto('/imports')
    
    // Check that all 7 category tiles are visible
    const expectedCategories = [
      'imp-cat-sales',
      'imp-cat-purchase', 
      'imp-cat-international-shipping',
      'imp-cat-national-shipping',
      'imp-cat-payment',
      'imp-cat-refund',
      'imp-cat-fba'
    ]
    
    for (const testId of expectedCategories) {
      await expect(page.getByTestId(testId)).toBeVisible()
    }
    
    // Verify the page title and description
    await expect(page.getByRole('heading', { name: 'Data Imports' })).toBeVisible()
  })

  test('should navigate to correct category pages', async ({ page }) => {
    await page.goto('/imports')
    
    const categoryTests = [
      { testId: 'imp-cat-sales', route: '/imports/sales', title: 'Sales' },
      { testId: 'imp-cat-purchase', route: '/imports/purchase', title: 'Purchase' },
      { testId: 'imp-cat-international-shipping', route: '/imports/international-shipping', title: 'International Shipping' },
      { testId: 'imp-cat-national-shipping', route: '/imports/national-shipping', title: 'National Shipping' },
      { testId: 'imp-cat-payment', route: '/imports/payment', title: 'Payment' },
      { testId: 'imp-cat-refund', route: '/imports/refund', title: 'Refund' },
      { testId: 'imp-cat-fba', route: '/imports/fba', title: 'FBA' }
    ]
    
    for (const { testId, route, title } of categoryTests) {
      // Click the category tile
      await page.getByTestId(testId).click()
      
      // Verify navigation to correct route
      await page.waitForURL(route)
      
      // Verify page title
      await expect(page.getByTestId('imp-category-title')).toContainText(title)
      
      // Verify dropzone is present
      await expect(page.getByTestId('imp-dropzone')).toBeVisible()
      
      // Verify template download link is present
      await expect(page.getByTestId('imp-template-download')).toBeVisible()
      
      // Verify columns table is present
      await expect(page.getByTestId('imp-columns-table')).toBeVisible()
      
      // Go back to imports page
      await page.goto('/imports')
    }
  })

  test('should ensure no divider/border below nav-settings', async ({ page }) => {
    await page.goto('/imports')
    
    // Check that there's no bottom border on the settings navigation item
    const border = await page.getByTestId('nav-settings').evaluate(el => {
      const style = getComputedStyle(el)
      return style.borderBottomWidth
    })
    
    expect(parseFloat(border)).toBe(0)
  })
})
