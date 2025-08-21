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

  const filePath = path.resolve(process.cwd(), 'Attachment Doc', 'Amazon.com(purchase data).csv');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  try {
    // ensure dev server is up
    try {
      await page.goto('http://localhost:5173/login', { timeout: 5000 });
    } catch {
      log('Dev server on 5173 not reachable. Please run: npm run dev -- --port 5173');
      process.exit(1);
    }

    log('Login');
    await page.waitForSelector('[data-testid="login-email"]', { timeout: 15000 });
    await page.fill('[data-testid="login-email"]', 'ops@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForTimeout(2000);

    log('Navigate to Purchase imports');
    await page.goto('http://localhost:5173/imports/purchase');
    await page.waitForSelector('[data-testid="imp-dropzone"]', { timeout: 15000 });

    log('Upload file: ' + filePath);
    const input = page.locator('input[type="file"]');
    await input.setInputFiles(filePath);

    // wait processing
    await page.waitForTimeout(8000);

    // capture success banner
    const successBanner = page.locator('div.bg-green-50');
    const hasSuccess = await successBanner.count();
    if (hasSuccess > 0) {
      const text = await successBanner.textContent();
      log('SUCCESS BANNER: ' + (text || '').trim());
    } else {
      log('No success banner found');
    }

    // capture warning list
    const warningsRoot = page.locator('p:text("Warnings:")');
    if (await warningsRoot.count()) {
      const warningItems = page.locator('ul li');
      const count = await warningItems.count();
      log(`WARNINGS (${count}):`);
      for (let i = 0; i < count; i++) {
        const itemText = (await warningItems.nth(i).textContent())?.trim();
        if (itemText) log(' - ' + itemText);
      }
    } else {
      log('No warnings section');
    }

    // set test hook value for quick inspection
    const hook = await page.evaluate(() => window.__test_lastImport || null);
    log('TEST HOOK: ' + JSON.stringify(hook));

    // screenshot
    await page.screenshot({ path: 'purchase-upload-result.png', fullPage: true });
    log('Screenshot saved: purchase-upload-result.png');

    // stay open briefly for manual inspection
    await page.waitForTimeout(10000);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
