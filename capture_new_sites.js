import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 2
  });

  const sites = [
    { url: 'https://cadprivateinvestigations.com/', file: 'images/cad-pi-site.jpg' },
    { url: 'https://www.turfkinglawns.com/', file: 'images/turf-king-site.jpg' },
    { url: 'https://neutraloverdrive.com/', file: 'images/neutral-overdrive-site.jpg' }
  ];

  for (const site of sites) {
    try {
      console.log(`Navigating to ${site.url}...`);
      await page.goto(site.url, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: site.file, quality: 90, type: 'jpeg' });
      console.log(`Saved ${site.file}`);
    } catch (err) {
      console.error(`Error capturing ${site.url}:`, err.message);
      try {
        await page.screenshot({ path: site.file, quality: 90, type: 'jpeg' });
        console.log(`Saved fallback ${site.file}`);
      } catch (e) {
        console.error(`Fallback failed for ${site.url}:`, e.message);
      }
    }
  }

  await browser.close();
})();
