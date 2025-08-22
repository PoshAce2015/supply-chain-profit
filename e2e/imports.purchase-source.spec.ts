/// <reference types="@playwright/test" />
import { test, expect } from '@playwright/test';

test.describe('@imports purchase source', () => {
  test('requires a vendor; stamps canonical vendor', async ({ page }) => {
    // First log in
    await page.goto('/login')
    await page.fill('input[type="email"]', 'ops@demo.co')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // Wait for login to complete and redirect
    await page.waitForURL('/dashboard')
    
    await page.goto('/imports/purchase');

    // Dropzone should be disabled until a vendor is chosen (implementation-specific)
    await expect(page.getByTestId('purchase-source-help')).toBeVisible();

    await page.getByTestId('purchase-source-select').selectOption('amazon_com');
    // Upload minimal CSV
    const csv = 'order_id,sku,qty\nPO-001,ABC,2\n';
    await page.getByTestId('imp-dropzone').setInputFiles({
      name: 'purchase.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv)
    });

    const last = await page.evaluate(() => (window as any).__test_lastImport);
    expect(last?.category).toBe('purchase');
    expect(last?.sample?.purchaseSource?.vendor).toBe('amazon_com');
    expect(last?.sample?.purchaseSource?.domain).toBeUndefined();
  });

  test('custom requires domain; normalizes hostname', async ({ page }) => {
    // First log in
    await page.goto('/login')
    await page.fill('input[type="email"]', 'ops@demo.co')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // Wait for login to complete and redirect
    await page.waitForURL('/dashboard')
    
    await page.goto('/imports/purchase');
    await page.getByTestId('purchase-source-select').selectOption('custom');
    await page.getByTestId('purchase-source-domain').fill(' https://Store.Example.com/path ');
    // Upload minimal CSV
    const csv = 'order_id,sku,qty\nPO-002,DEF,1\n';
    await page.getByTestId('imp-dropzone').setInputFiles({
      name: 'purchase.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv)
    });
    const last = await page.evaluate(() => (window as any).__test_lastImport);
    expect(last?.sample?.purchaseSource?.vendor).toBe('custom');
    expect(last?.sample?.purchaseSource?.domain).toBe('store.example.com');
  });

  test('legacy columns vendor/domain are normalized if present in file', async ({ page }) => {
    // First log in
    await page.goto('/login')
    await page.fill('input[type="email"]', 'ops@demo.co')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // Wait for login to complete and redirect
    await page.waitForURL('/dashboard')
    
    await page.goto('/imports/purchase');
    // Don't select UI vendor to ensure legacy takes precedence per row
    const csv = 'order_id,sku,qty,vendor,domain\nPO-003,GHI,1,ebay,ebay.com\n';
    await page.getByTestId('imp-dropzone').setInputFiles({
      name: 'legacy.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv)
    });
    const last = await page.evaluate(() => (window as any).__test_lastImport);
    expect(last?.sample?.purchaseSource?.vendor).toBe('ebay_com');
    expect(last?.sample?.purchaseSource?.domain).toBeUndefined(); // not custom
  });
});
