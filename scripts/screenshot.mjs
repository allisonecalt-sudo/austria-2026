// One-off: screenshot the built brochure at mobile + desktop + a day-card crop.
// Usage: node scripts/screenshot.mjs <baseUrl>
// Uses Playwright (chromium). Saves into the second-brain screenshots archive.
//
// Photo-load guard: the brochure now eager-loads its photos, AND this script
// scrolls the whole page top→bottom before each capture so nothing is mid-load
// when fullPage fires (the old site's #1 failure was empty photo frames in
// full-page captures). It then waits for every <img> to report complete.
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:4173/austria-2026/';
const OUT_DIR = 'C:/Users/allis/Documents/second-brain/archive/screenshots';

// Scroll the page in steps so lazy/async images all start loading, then wait
// for them all to finish (or time out), so full-page shots never catch a gap.
async function settlePage(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = window.innerHeight * 0.8;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        y += step;
        if (y >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 120);
    });
  });
  // Wait for every image to be complete (or already errored to its placeholder).
  await page
    .waitForFunction(
      () => Array.from(document.images).every((img) => img.complete),
      { timeout: 20000 },
    )
    .catch(() => {});
  await page.waitForTimeout(800);
}

const browser = await chromium.launch();

// 1) full-page mobile + desktop (v2)
const fullShots = [
  { name: 'austria-brochure-mobile-v2.png', width: 412, height: 892 },
  { name: 'austria-brochure-desktop-v2.png', width: 1280, height: 800 },
];
for (const s of fullShots) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
  await settlePage(page);
  await page.screenshot({ path: `${OUT_DIR}/${s.name}`, fullPage: true });
  console.log(`saved ${s.name} (${s.width}x${s.height})`);
  await ctx.close();
}

// 2) close-up crop of a single day card with its day-shape options expanded.
{
  const ctx = await browser.newContext({
    viewport: { width: 900, height: 1100 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
  await settlePage(page);
  // Expand the day-shape options on the Monday (Zell) free day.
  await page.evaluate(() => {
    const day = document.getElementById('mon-jul-27');
    if (!day) return;
    day
      .querySelectorAll('details.shape, details.block')
      .forEach((d) => d.setAttribute('open', ''));
  });
  await page.waitForTimeout(500);
  const day = await page.$('#mon-jul-27');
  if (day) {
    await day.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await day.screenshot({ path: `${OUT_DIR}/austria-brochure-daycard-v2.png` });
    console.log('saved austria-brochure-daycard-v2.png (day-card, options expanded)');
  } else {
    console.error('day card #mon-jul-27 not found — crop skipped');
  }
  await ctx.close();
}

await browser.close();
