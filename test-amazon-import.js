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
    log('Starting Amazon Seller Central import test...');

    // Navigate to login
    log('Navigating to login page...');
    await page.goto('http://localhost:5173/login');
    log('Login page loaded');

    // Wait for login form to be ready
    log('Waiting for login form...');
    await page.waitForSelector('[data-testid="login-email"]', { timeout: 10000 });
    log('Login form ready');

    // Login
    log('Filling login credentials...');
    await page.fill('[data-testid="login-email"]', 'ops@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    log('Credentials filled');

    log('Submitting login form...');
    await page.click('[data-testid="btn-login-submit"]');
    log('Login form submitted');

    // Wait for navigation
    log('Waiting for navigation...');
    await page.waitForTimeout(3000);

    // Navigate to imports page
    log('Navigating to imports page...');
    await page.goto('http://localhost:5173/imports');
    log('Imports page loaded');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Click on Sales category
    log('Clicking Sales category...');
    await page.getByTestId('imp-cat-sales').click();
    log('Sales category clicked');

    // Wait for navigation to sales page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/imports/sales')) {
      log('✅ Successfully navigated to sales import page');
      
      // Create a sample Amazon Seller Central TSV file with correct format
      const amazonTsvContent = `order-id	order-item-id	purchase-date	payments-date	reporting-date	promise-date	days-past-promise	buyer-email	buyer-name	buyer-phone-number	sku	product-name	quantity-purchased	quantity-shipped	quantity-to-ship	ship-service-level	recipient-name	ship-address-1	ship-address-2	ship-address-3	ship-city	ship-state	ship-postal-code	ship-country	is-business-order	purchase-order-number	price-designation	is-iba	verge-of-cancellation	verge-of-lateShipment
408-4870009-9733125	52336476957402	2025-07-30T08:34:47+00:00	2025-07-30T08:34:47+00:00	2025-07-31T04:21:19+00:00	2025-08-21T18:29:59+00:00	-2	p3vkb18m93xc7lv@marketplace.amazon.in	Mandeep Dhillon	9855161554	ARB_B0B79CYVTM	VSN Noise Gate Pedal, Noise Killer Guitar Pedal	1	0	1	Standard	Mandeep Dhillon	6368 Ground Floor	Rajiv Vihar, Manimajra		CHANDIGARH	CHANDIGARH	160101	IN	false			false	false	false
404-8712750-6212352	52427051134402	2025-07-31T23:57:52+00:00	2025-07-31T23:57:52+00:00	2025-08-01T00:27:39+00:00	2025-08-22T18:29:59+00:00	-3	4g6l85kyf1hj3gs@marketplace.amazon.in	Meghna	9686372602	ARB_B084SDXVBD	Polaroid Color Film for I-Type (6000)	1	0	1	Standard	Meghna Aravind	6A Annaiah Reddy Layout 30th Main Road	JP Nagar 6th phase		BENGALURU	KARNATAKA	560078	IN	false			false	false	false
408-1498953-3866768	52458442042522	2025-08-01T04:51:58+00:00	2025-08-01T04:51:58+00:00	2025-08-01T05:22:11+00:00	2025-08-22T18:29:59+00:00	-3	pqqwbvjykpr4v0b@marketplace.amazon.in	Venkatesh Nagan	9971066445	ARB_B00FJ2WOJE	OSTENT 850mAh Rechargeable Lithium-ion Battery	1	0	1	Standard	Venkatesh Nagan	Flat No. M2, Builtech Greens Apartments	Manapullikavu		PALAKKAD	KERALA	678013	IN	false			false	false	false`;
      
      const testFilePath = 'amazon-seller-central-test.txt';
      fs.writeFileSync(testFilePath, amazonTsvContent);
      log(`Created Amazon TSV test file: ${testFilePath}`);

      try {
        // Find the file input and upload
        const fileInput = page.locator('input[type="file"]');
        log('Uploading Amazon TSV file...');
        await fileInput.setInputFiles(testFilePath);
        log('File selected successfully');
        
        // Wait for processing
        log('Waiting for file processing...');
        await page.waitForTimeout(5000);
        
        // Check for success/error messages
        log('Checking for status messages...');
        const successMessages = page.locator('.text-green-600, .text-green-800, [class*="success"]');
        const errorMessages = page.locator('.text-red-600, .text-red-800, [class*="error"]');
        const warningMessages = page.locator('.text-yellow-600, .text-yellow-800, [class*="warning"]');
        
        const successCount = await successMessages.count();
        const errorCount = await errorMessages.count();
        const warningCount = await warningMessages.count();
        
        log(`Found ${successCount} success messages, ${errorCount} error messages, ${warningCount} warning messages`);
        
        // Log all messages
        for (let i = 0; i < successCount; i++) {
          const message = successMessages.nth(i);
          const text = await message.textContent();
          log(`✅ Success: "${text?.trim()}"`);
        }
        
        for (let i = 0; i < errorCount; i++) {
          const message = errorMessages.nth(i);
          const text = await message.textContent();
          log(`❌ Error: "${text?.trim()}"`);
        }
        
        for (let i = 0; i < warningCount; i++) {
          const message = warningMessages.nth(i);
          const text = await message.textContent();
          log(`⚠️ Warning: "${text?.trim()}"`);
        }

        // Check for test hook
        log('Checking for test hook...');
        const testHook = await page.evaluate(() => {
          return window.__test_lastImport;
        });
        
        if (testHook) {
          log(`✅ Test hook found: ${JSON.stringify(testHook)}`);
        } else {
          log('❌ Test hook not found');
        }

        // Check console for detailed import log
        log('Checking console output...');
        await page.waitForTimeout(1000);

      } catch (error) {
        log(`File upload error: ${error.message}`);
      }

      // Clean up test file
      try {
        fs.unlinkSync(testFilePath);
        log('Test file cleaned up');
      } catch (error) {
        log(`Cleanup error: ${error.message}`);
      }

    } else {
      log('❌ Failed to navigate to sales import page');
    }

    // Take a screenshot
    log('Taking screenshot...');
    await page.screenshot({ path: 'amazon-import-test-result.png', fullPage: true });
    log('Screenshot saved as amazon-import-test-result.png');

    log('Test completed. Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    log(`Test failed with error: ${error.message}`);
    console.error('Full error:', error);
  } finally {
    await browser.close();
    log('Browser closed');
  }
})();
