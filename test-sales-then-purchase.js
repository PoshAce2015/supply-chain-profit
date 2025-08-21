import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  };

  const salesPath = path.resolve(process.cwd(), 'Attachment Doc', 'Amazon Sellercentral(sales data).txt');
  const purchasePath = path.resolve(process.cwd(), 'Attachment Doc', 'Amazon.com(purchase data).csv');
  if (!fs.existsSync(salesPath) || !fs.existsSync(purchasePath)) {
    console.error('Input files missing. Expected at:', salesPath, 'and', purchasePath);
    process.exit(1);
  }

  try {
    // Login
    await page.goto('http://localhost:5173/login', { timeout: 10000 });
    await page.waitForSelector('[data-testid="login-email"]', { timeout: 15000 });
    await page.fill('[data-testid="login-email"]', 'ops@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForTimeout(1500);

    // Upload Sales (Orders)
    log('Uploading Sales TSV...');
    await page.goto('http://localhost:5173/imports/sales');
    await page.waitForSelector('[data-testid="imp-dropzone"]', { timeout: 15000 });
    await page.locator('input[type="file"]').setInputFiles(salesPath);
    await page.waitForTimeout(6000);
    const salesSuccess = await page.locator('div.bg-green-50').first();
    const salesText = (await salesSuccess.textContent())?.trim() || '';
    log('Sales upload banner: ' + salesText);

    // Upload Purchase (Amazon.com Business)
    log('Uploading Purchase CSV...');
    await page.goto('http://localhost:5173/imports/purchase');
    await page.waitForSelector('[data-testid="imp-dropzone"]', { timeout: 15000 });
    await page.locator('input[type="file"]').setInputFiles(purchasePath);
    await page.waitForTimeout(8000);

    // Read success banner and warnings panel only inside the banner card
    const successCard = page.locator('div.bg-green-50').first();
    const successText = (await successCard.textContent())?.replace(/\s+/g, ' ').trim() || '';
    log('Purchase upload banner: ' + successText);

    // Warnings inside the success card
    const warningsTitle = successCard.locator('p:text("Warnings:")');
    if (await warningsTitle.count()) {
      const card = warningsTitle.locator('..');
      const li = card.locator('ul li');
      const c = await li.count();
      log(`Warnings count: ${c}`);
      for (let i = 0; i < Math.min(c, 10); i++) {
        const t = (await li.nth(i).textContent())?.trim();
        if (t) log(' - ' + t);
      }
    } else {
      log('No warnings block in success card.');
    }

    // Test hook
    const hook = await page.evaluate(() => window.__test_lastImport || null);
    log('TEST HOOK: ' + JSON.stringify(hook));

    await page.screenshot({ path: 'sales-then-purchase.png', fullPage: true });
    log('Screenshot saved: sales-then-purchase.png');

    await page.waitForTimeout(10000);
  } catch (e) {
    console.error('Flow failed:', e);
  } finally {
    await browser.close();
  }
})();
