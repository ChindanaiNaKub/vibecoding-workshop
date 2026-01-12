/**
 * SEVER Game Automation with Playwright
 *
 * This script automates browser interactions with the SEVER game.
 * It can take screenshots, click on elements, and simulate gameplay.
 */

const { chromium } = require('playwright');

(async () => {
  console.log('🎭 Starting SEVER Game Automation...\n');

  // Launch browser
  const browser = await chromium.launch({
    headless: false, // Show browser window
    slowMo: 500 // Slow down actions for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 900, height: 700 }
  });

  const page = await context.newPage();

  // Navigate to the local game
  const gameUrl = 'http://localhost:8000';
  console.log(`📍 Navigating to ${gameUrl}...`);

  try {
    await page.goto(gameUrl, { waitUntil: 'networkidle' });
    console.log('✅ Game loaded!\n');

    // Wait for canvas to be ready
    await page.waitForSelector('canvas', { timeout: 5000 });

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/01-initial-state.png' });
    console.log('📸 Screenshot saved: screenshots/01-initial-state.png');

    // Get canvas element
    const canvas = await page.locator('canvas').boundingBox();
    console.log(`\n🎮 Canvas size: ${canvas.width}x${canvas.height}`);

    // Wait a moment for instructions to be visible
    await page.waitForTimeout(1000);

    // Click to dismiss instructions
    console.log('\n👆 Clicking to dismiss instructions...');
    await page.mouse.click(canvas.width / 2, canvas.height / 2);
    await page.waitForTimeout(1000);

    // Screenshot after dismissing instructions
    await page.screenshot({ path: 'screenshots/02-game-start.png' });
    console.log('📸 Screenshot saved: screenshots/02-game-start.png');

    // Simulate gameplay - Player 1 actions
    console.log('\n🎯 Player 1 (Orange) Actions:');

    // Action 1: Anchor a new tether on Player 1's wall (left side)
    console.log('  - Anchoring new tether on P1 wall...');
    await page.mouse.click(50, 300); // Left wall center
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshots/03-p1-anchored.png' });
    console.log('📸 Screenshot saved: screenshots/03-p1-anchored.png');

    // Action 2: Reinforce an existing tether
    console.log('  - Reinforcing P1 tether...');
    await page.mouse.click(250, 300); // Approximate tether position
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshots/04-p1-reinforced.png' });
    console.log('📸 Screenshot saved: screenshots/04-p1-reinforced.png');

    // Player 2's turn (simulated)
    console.log('\n🎯 Player 2 (Blue) Actions:');

    // Action 1: Anchor a new tether on Player 2's wall (right side)
    console.log('  - Anchoring new tether on P2 wall...');
    await page.mouse.click(750, 300); // Right wall center
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshots/05-p2-anchored.png' });
    console.log('📸 Screenshot saved: screenshots/05-p2-anchored.png');

    // Action 2: Sever Player 1's tether
    console.log('  - Severing P1 tether...');
    await page.mouse.click(200, 280); // Approximate tether position
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshots/06-after-sever.png' });
    console.log('📸 Screenshot saved: screenshots/06-after-sever.png');

    console.log('\n✅ Automation complete!');
    console.log('\n📁 Screenshots saved in ./screenshots/');
    console.log('   - 01-initial-state.png');
    console.log('   - 02-game-start.png');
    console.log('   - 03-p1-anchored.png');
    console.log('   - 04-p1-reinforced.png');
    console.log('   - 05-p2-anchored.png');
    console.log('   - 06-after-sever.png');

    // Keep browser open for 5 seconds for inspection
    console.log('\n⏳ Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the game is running on http://localhost:8000');
    console.log('   Run: python3 -m http.server 8000');
  } finally {
    await browser.close();
    console.log('\n🎭 Browser closed.');
  }
})();
