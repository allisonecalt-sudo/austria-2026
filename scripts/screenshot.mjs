// One-off: screenshot the built brochure at mobile + desktop.
// Usage: node scripts/screenshot.mjs <baseUrl>
// Uses Playwright (chromium). Saves into the second-brain screenshots archive.
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4173/austria-2026/';
const OUT_DIR = 'C:/Users/allis/Documents/second-brain/archive/screenshots';

const shots = [
  { name: 'austria-brochure-mobile.png', width: 412, height: 892 },
  { name: 'austria-brochure-desktop.png', width: 1280, height: 800 },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
  // give Leaflet tiles + lazy images a moment
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT_DIR}/${s.name}`, fullPage: true });
  console.log(`saved ${s.name} (${s.width}x${s.height})`);
  await ctx.close();
}
await browser.close();
