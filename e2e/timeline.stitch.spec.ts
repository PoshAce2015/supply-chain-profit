/// <reference types="@playwright/test" />
import { test, expect } from '@playwright/test';

test('@timeline stitches sales and purchase', async ({ page }) => {
  // First log in
  await page.goto('/login')
  await page.fill('input[type="email"]', 'ops@demo.co')
  await page.fill('input[type="password"]', 'demo123')
  await page.click('button[type="submit"]')
  
  // Wait for login to complete and redirect
  await page.waitForURL('/dashboard')

  // Go to Sales import and upload a minimal CSV with Amazon order id
  await page.goto('/imports/sales');
  await page.getByTestId('sales-source-select').selectOption('amazon_in');
  await page.getByTestId('sales-orderclass-select').selectOption('b2c');

  const salesCsv = 'order_id,sku,qty,order_date\n123-1234567-1234567,ABC,1,2025-08-10\n';
  await page.getByTestId('imp-dropzone').locator('input[type="file"]').setInputFiles({
    name: 'sales.csv', mimeType: 'text/csv', buffer: Buffer.from(salesCsv),
  });

  // Wait for sales import to complete
  await page.waitForSelector('text=Successfully imported', { timeout: 10000 });

  // Go to Purchase import and upload a purchase row that matches by sku/date
  await page.goto('/imports/purchase');
  await page.getByTestId('purchase-source-select').selectOption('amazon_com');
  
  const purchaseCsv = 'sku,qty,purchase_date\nABC,1,2025-08-10\n';
  await page.getByTestId('imp-dropzone').locator('input[type="file"]').setInputFiles({
    name: 'purchase.csv', mimeType: 'text/csv', buffer: Buffer.from(purchaseCsv),
  });

  // Wait for purchase import to complete
  await page.waitForSelector('text=Successfully imported', { timeout: 10000 });

  // Open View Timeline
  await page.goto('/timeline');
  const timeline = page.getByTestId('orders-timeline');
  await expect(timeline).toBeVisible();

  const cards = page.getByTestId('timeline-order-card');
  await expect(cards).toHaveCount(1);

  // Assert both categories present
  await expect(page.getByTestId('timeline-row-sales')).toBeVisible();
  await expect(page.getByTestId('timeline-row-purchase')).toBeVisible();

  // Check that source chips are displayed
  await expect(page.getByTestId('sales-source-chip')).toBeVisible();
  await expect(page.getByTestId('purchase-source-chip')).toBeVisible();
});
