import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  };

  try {
    log('Testing with REAL Amazon Seller Central file...');

    // Navigate to login
    log('Navigating to login page...');
    await page.goto('http://localhost:5173/login');

    // Login
    await page.waitForSelector('[data-testid="login-email"]', { timeout: 10000 });
    await page.fill('[data-testid="login-email"]', 'ops@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="btn-login-submit"]');
    log('Login completed');

    // Navigate to imports
    await page.waitForTimeout(3000);
    await page.goto('http://localhost:5173/imports');
    await page.waitForTimeout(2000);

    // Click Sales category
    await page.getByTestId('imp-cat-sales').click();
    await page.waitForTimeout(2000);
    log('Navigated to Sales import page');

    // Check if real Amazon file exists
    const amazonFilePath = path.resolve('Attachment Doc/Amazon Sellercentral(sales data).txt');
    if (fs.existsSync(amazonFilePath)) {
      log('✅ Real Amazon Seller Central file found');
      
      try {
        // Upload the real file
        const fileInput = page.locator('input[type="file"]');
        log('Uploading REAL Amazon Seller Central file...');
        await fileInput.setInputFiles(amazonFilePath);
        log('Real file selected successfully');
        
        // Wait for processing (might take longer for real file)
        log('Waiting for file processing (real file may take longer)...');
        await page.waitForTimeout(10000);
        
        // Check results
        const successMessages = page.locator('.text-green-600, .text-green-800, [class*="success"]');
        const errorMessages = page.locator('.text-red-600, .text-red-800, [class*="error"]');
        const warningMessages = page.locator('.text-yellow-600, .text-yellow-800, [class*="warning"]');
        
        const successCount = await successMessages.count();
        const errorCount = await errorMessages.count();
        const warningCount = await warningMessages.count();
        
        log(`REAL FILE RESULTS: ${successCount} success, ${errorCount} errors, ${warningCount} warnings`);
        
        // Log first few messages
        for (let i = 0; i < Math.min(successCount, 3); i++) {
          const message = successMessages.nth(i);
          const text = await message.textContent();
          log(`✅ Success: "${text?.trim()}"`);
        }
        
        for (let i = 0; i < Math.min(errorCount, 5); i++) {
          const message = errorMessages.nth(i);
          const text = await message.textContent();
          log(`❌ Error: "${text?.trim()}"`);
        }
        
        for (let i = 0; i < Math.min(warningCount, 3); i++) {
          const message = warningMessages.nth(i);
          const text = await message.textContent();
          log(`⚠️ Warning: "${text?.trim()}"`);
        }

        // Check test hook
        const testHook = await page.evaluate(() => {
          return window.__test_lastImport;
        });
        
        if (testHook) {
          log(`✅ REAL FILE IMPORTED: ${JSON.stringify(testHook)}`);
        } else {
          log('❌ No test hook found for real file');
        }

      } catch (error) {
        log(`❌ Error uploading real file: ${error.message}`);
      }
      
    } else {
      log('❌ Real Amazon Seller Central file not found at expected location');
      log(`   Expected: ${amazonFilePath}`);
    }

    // Take final screenshot
    await page.screenshot({ path: 'real-amazon-import-test.png', fullPage: true });
    log('Screenshot saved as real-amazon-import-test.png');

    log('Test completed. Browser will stay open for 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    log(`Test failed: ${error.message}`);
  } finally {
    await browser.close();
  }
})();
