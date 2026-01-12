/**
 * Simple SEVER Game Automation with Playwright (Headless)
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🎭 SEVER Game Automation (Headless)\n');

  const browser = await chromium.launch({
    headless: true // Run in background
  });

  const page = await browser.newPage();

  try {
    // Navigate to game
    console.log('📍 Loading game...');
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas');

    // Screenshot 1: Initial state with instructions
    await page.screenshot({ path: 'screenshots/01-initial-state.png', fullPage: true });
    console.log('📸 Screenshot 1: Initial state');

    // Click to dismiss instructions
    const canvas = await page.locator('canvas').boundingBox();
    await page.mouse.click(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
    await page.waitForTimeout(500);

    // Screenshot 2: Game start
    await page.screenshot({ path: 'screenshots/02-game-start.png', fullPage: true });
    console.log('📸 Screenshot 2: Game start');

    // Simulate Player 1 anchoring
    await page.mouse.click(canvas.x + 50, canvas.y + 300);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/03-p1-anchor.png', fullPage: true });
    console.log('📸 Screenshot 3: P1 anchored');

    // Simulate Player 2 anchoring (after turn switch)
    await page.mouse.click(canvas.x + 750, canvas.y + 300);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/04-p2-anchor.png', fullPage: true });
    console.log('📸 Screenshot 4: P2 anchored');

    console.log('\n✅ Automation complete! Check ./screenshots/');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
