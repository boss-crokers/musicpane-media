import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # High quality viewport
        page = await browser.new_page(viewport={'width': 1200, 'height': 1200}, device_scale_factor=2)
        
        urls = [
            ("https://www.bosscrokers.com/", "images/boss-crokers-site.jpg"),
            ("https://squareonehomeinspectors.com/", "images/square-one-site.jpg"),
            ("https://riobravo1959.com/", "images/rio-bravo-site.jpg")
        ]
        
        for url, output in urls:
            try:
                print(f"Loading {url}...")
                await page.goto(url, wait_until="networkidle", timeout=15000)
                await page.screenshot(path=output, quality=90, type='jpeg')
                print(f"Saved {output}")
            except Exception as e:
                print(f"Failed {url}: {e}")
                
        await browser.close()

asyncio.run(run())
