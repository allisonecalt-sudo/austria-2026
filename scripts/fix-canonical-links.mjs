/**
 * fix-canonical-links.mjs — Repoint body links from canonical pages to archive/.
 *
 * WHAT: The 8 top-level pages (index, itinerary, stay, activities, logistics,
 *       costs, notes, map) still link to pages that were moved into archive/.
 *       This rewrites `href="<archived>.html..."` → `href="archive/<archived>.html..."`
 *       in those files. The nav itself no longer references any archived page,
 *       so a blanket rewrite of these specific filenames is safe.
 *
 * WHY: Keep archived deep-dives reachable from the canonical pages per the
 *       owner's archive rule.
 *
 * Idempotent — skips hrefs already prefixed with archive/ or ../.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CANONICAL = [
  'index.html',
  'itinerary.html',
  'stay.html',
  'activities.html',
  'logistics.html',
  'costs.html',
  'notes.html',
  'map.html',
  // Root-level logistics deep-dives — stayed at root, also link to archived pages.
  'cafes.html',
  'driving-austria.html',
  'packing.html',
  'pre-trip.html',
  'rental-car.html',
];

const ARCHIVED = [
  'trip-options',
  'trip-summary',
  'bases',
  'shabbat',
  'friday-salzburg',
  'sundays-closed',
  'weather-plan-c',
  'nature-destinations',
  'top-sunsets',
  'lake-swimming',
  'water-activities',
  'jewish-sights',
  'recommendations',
  'schafbergspitze',
  'krippenstein',
];

const re = new RegExp(`href="(${ARCHIVED.join('|')})\\.html([^"]*)"`, 'g');

let total = 0;
for (const file of CANONICAL) {
  const path = resolve(root, file);
  let html = readFileSync(path, 'utf8');
  let n = 0;
  html = html.replace(re, (m, page, rest) => {
    n++;
    return `href="archive/${page}.html${rest}"`;
  });
  if (n > 0) {
    writeFileSync(path, html);
    console.log(`${file}: ${n} archived links repointed`);
    total += n;
  }
}
console.log(`\nDone. ${total} links repointed across canonical pages.`);
