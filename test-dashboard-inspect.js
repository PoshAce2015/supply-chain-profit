import { chromium } from 'playwright';

async function inspectDashboard() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:5173/login');
    
    console.log('Logging in with demo credentials...');
    await page.fill('input[type="email"]', 'ops@demo.co');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for dashboard to load...');
    await page.waitForURL('http://localhost:5173/dashboard');
    
    console.log('Dashboard loaded successfully!');
    console.log('Page title:', await page.title());
    
    // Wait a bit for the page to fully render
    await page.waitForTimeout(2000);
    
    // Check if the dashboard content is visible
    const dashboardContent = await page.locator('[data-testid="dashboard-view"]');
    if (await dashboardContent.isVisible()) {
      console.log('✅ Dashboard content is visible');
    } else {
      console.log('❌ Dashboard content not found');
    }
    
    // Keep the browser open for manual inspection
    console.log('Browser will stay open for manual inspection. Press Ctrl+C to close.');
    await new Promise(() => {}); // Keep the script running
    
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
  }
}

inspectDashboard();
