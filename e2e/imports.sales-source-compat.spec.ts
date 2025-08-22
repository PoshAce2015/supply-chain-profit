import { test, expect } from '@playwright/test'

test('Legacy combined id normalized (flipkart_b2c)', async ({ page }) => {
  // First log in
  await page.goto('/login')
  await page.fill('input[type="email"]', 'ops@demo.co')
  await page.fill('input[type="password"]', 'demo123')
  await page.click('button[type="submit"]')
  
  // Wait for login to complete and redirect
  await page.waitForURL('/dashboard')
  
  await page.goto('/imports/sales')
  // Simulate legacy meta by bypassing UI and calling window hook
  await page.addInitScript(() => {
    (window as any).__force_legacy_source = 'flipkart_b2c';
  });
  const csv = 'order_id,sku,qty,source\nLEG-001,ABC,1,flipkart_b2c\n'
  await page.getByTestId('imp-dropzone').setInputFiles({ name:'sales.csv', mimeType:'text/csv', buffer: Buffer.from(csv) })
  const last = await page.evaluate(() => (window as any).__test_lastImport)
  expect(last?.sample?.source?.channel).toBe('flipkart')
  expect(last?.sample?.source?.orderClass).toBe('b2c')
})
