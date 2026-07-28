import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1400, 'height': 900}, device_scale_factor=2)
        
        await page.goto("http://localhost:5173/", wait_until="networkidle")
        
        # 1. Hero initial state screenshot
        await page.screenshot(path="/Users/pete/.gemini/antigravity/brain/63dd7abd-f6dc-4e30-92fd-88f5abd6f078/showcase_hero.png")
        
        # 2. Click coin flip and screenshot
        coin = page.locator("#hero-coin")
        if await coin.count() > 0:
            await coin.click()
            await page.wait_for_timeout(800)
            await page.screenshot(path="/Users/pete/.gemini/antigravity/brain/63dd7abd-f6dc-4e30-92fd-88f5abd6f078/showcase_coin_flipped.png")
            
        # 3. Scroll to Work section & screenshot
        work_section = page.locator("#work")
        if await work_section.count() > 0:
            await work_section.scroll_into_view_if_needed()
            await page.wait_for_timeout(500)
            await page.screenshot(path="/Users/pete/.gemini/antigravity/brain/63dd7abd-f6dc-4e30-92fd-88f5abd6f078/showcase_work_grid.png")
            
        await browser.close()

asyncio.run(run())
