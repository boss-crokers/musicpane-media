import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:5173/");
  
  // Scroll down to work section
  await page.evaluate(() => {
    document.querySelectorAll('.fade-up-element').forEach(el => el.classList.add('visible'));
  });
  
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/Users/pete/.gemini/antigravity/brain/63dd7abd-f6dc-4e30-92fd-88f5abd6f078/showcase_6_grid_perfect.png" });
  await browser.close();
})();
