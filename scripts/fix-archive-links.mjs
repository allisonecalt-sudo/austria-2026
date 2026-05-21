/**
 * fix-archive-links.mjs — Repair internal links inside archived pages.
 *
 * WHAT: After moving 15 pages into archive/, their body links to root-level
 *       pages (itinerary, stay, map, activities, logistics, costs, notes, "./")
 *       break. This rewrites those to "../<page>". Links to OTHER archived
 *       pages stay relative (siblings in archive/). Full URLs and anchors are
 *       left alone.
 *
 * WHY: The owner's archive rule — pages must stay reachable, not just exist.
 *
 * Run once after the git mv: `node scripts/fix-archive-links.mjs`. Idempotent
 * (won't double-prefix because it only touches bare `href="page.html"`).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archiveDir = resolve(root, 'archive');

// Pages that LIVE in archive/ — links to these stay relative (siblings).
const archivedPages = new Set(readdirSync(archiveDir).filter((f) => f.endsWith('.html')));

const files = readdirSync(archiveDir).filter((f) => f.endsWith('.html'));
let total = 0;
for (const file of files) {
  const path = resolve(archiveDir, file);
  let html = readFileSync(path, 'utf8');
  const before = html;

  // Rewrite href="page.html..." → href="../page.html..." ONLY when the target
  // is a root-level page (not itself archived) and not already prefixed.
  html = html.replace(/href="([a-z][a-z0-9-]*\.html)([^"]*)"/g, (m, page, rest) => {
    if (archivedPages.has(page)) return m; // sibling in archive/, keep relative
    return `href="../${page}${rest}"`;
  });

  // Brand / home links: href="./" → href="../"
  html = html.replace(/href="\.\/"/g, 'href="../"');

  if (html !== before) {
    writeFileSync(path, html);
    const changes = (before.match(/href="[a-z]/g) || []).length;
    console.log(`fixed links: archive/${file} (${changes} candidate hrefs scanned)`);
    total++;
  }
}
console.log(`\nDone. ${total} archived files had links rewritten.`);
