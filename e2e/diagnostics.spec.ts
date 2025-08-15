import { test, expect } from '@playwright/test'

test('diagnostics', async ({ page }) => {
  const consoleLogs: Array<{level: string, message: string}> = []
  const pageErrors: Array<{message: string, stack: string}> = []
  const networkErrors: Array<{url: string, status: number}> = []

  // Collect console messages
  page.on('console', msg => {
    consoleLogs.push({ level: msg.type(), message: msg.text() })
  })

  // Collect page errors
  page.on('pageerror', error => {
    pageErrors.push({ message: error.message, stack: error.stack || '' })
  })

  // Intercept network requests
  await page.route('**', async route => {
    const response = await route.fetch()
    if (response.status() >= 400) {
      networkErrors.push({ url: response.url(), status: response.status() })
    }
    await route.fulfill({ response })
  })

  // Navigate and wait
  await page.goto('/')
  await page.waitForTimeout(3000)

  // Capture page state
  const url = page.url()
  const h1Elements = await page.locator('h1').allTextContents()
  const h2Elements = await page.locator('h2').allTextContents()
  const navLinks = await page.locator('nav a').evaluateAll(els => 
    els.map(el => ({
      text: el.textContent?.trim() || '',
      href: el.getAttribute('href') || '',
      ariaCurrent: el.getAttribute('aria-current') || ''
    }))
  )
  const bodyText = await page.evaluate(() => document.body.innerText)

  // Print results
  console.log('\n=== DIAGNOSTICS REPORT ===')
  console.log(`1) URL: ${url}`)
  console.log(`2) H1 elements: ${h1Elements.join(' | ')}`)
  console.log(`3) H2 elements: ${h2Elements.join(' | ')}`)
  console.log('4) Nav links:')
  navLinks.forEach(link => {
    console.log(`   ${link.text} | ${link.href} | aria-current="${link.ariaCurrent}"`)
  })
  console.log(`5) Body text (first 600 chars): ${bodyText.substring(0, 600)}`)
  console.log('6) Console logs:')
  consoleLogs.forEach(log => {
    console.log(`   [${log.level}] ${log.message}`)
  })
  console.log('7) Page errors:')
  pageErrors.forEach(error => {
    console.log(`   ${error.message}`)
    console.log(`   Stack: ${error.stack.substring(0, 200)}...`)
  })
  console.log('8) Network errors (4xx/5xx):')
  networkErrors.forEach(error => {
    console.log(`   ${error.url} - ${error.status}`)
  })
})
