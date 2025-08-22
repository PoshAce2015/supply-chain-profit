/// <reference types="@playwright/test" />
import { test, expect } from '@playwright/test';

test.describe('@imports sales source', () => {
  test('requires provider and account; stamps ASC + code', async ({ page }) => {
    // First log in
    await page.goto('/login')
    await page.fill('input[type="email"]', 'ops@demo.co')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // Wait for login to complete and redirect
    await page.waitForURL('/dashboard')
    
    await page.goto('/imports/sales');
    await expect(page.getByTestId('sales-source-help')).toBeVisible();

    // Select provider
    await page.getByTestId('sales-source-provider').selectOption('amazon_seller_central');
    // Select account code
    await page.getByTestId('sales-source-account').selectOption('DJ');

    // Upload minimal CSV
    const csv = 'order_id,sku,qty\nSO-001,ABC,1\n';
    await page.getByTestId('imp-dropzone').setInputFiles({
      name: 'sales.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });

    const last = await page.evaluate(() => (window as any).__test_lastSalesImport);
    expect(last?.category).toBe('sales');
    expect(last?.sample?.salesSource?.provider).toBe('amazon_seller_central');
    expect(last?.sample?.salesSource?.accountCode).toBe('DJ');
  });

  test('legacy columns override UI when present', async ({ page }) => {
    // First log in
    await page.goto('/login')
    await page.fill('input[type="email"]', 'ops@demo.co')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // Wait for login to complete and redirect
    await page.waitForURL('/dashboard')
    
    await page.goto('/imports/sales');
    await page.getByTestId('sales-source-provider').selectOption('amazon_seller_central');
    await page.getByTestId('sales-source-account').selectOption('PT');

    const csv = 'order_id,sku,qty,provider,account_code\nSO-002,XYZ,2,amazon,PRT\n';
    await page.getByTestId('imp-dropzone').setInputFiles({
      name: 'legacy.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });

    const last = await page.evaluate(() => (window as any).__test_lastSalesImport);
    expect(last?.sample?.salesSource?.provider).toBe('amazon_seller_central');
    expect(last?.sample?.salesSource?.accountCode).toBe('PRT'); // from file, not UI
  });
});
