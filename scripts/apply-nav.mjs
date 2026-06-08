/**
 * apply-nav.mjs — One-shot nav reorganizer (2026-05-21 cleanup).
 *
 * WHAT: Replaces the duplicated inline nav menu in every top-level HTML page
 *       with a single tight 6-item spine (Trip · Stay · Explore · Logistics ·
 *       Costs · Notes). Replaces BOTH the desktop `.nav-links` block and the
 *       `.nav-mobile` slide-over block, leaving the surrounding <nav> wrapper
 *       and the inline coordinator <script> untouched.
 *
 * WHY: The nav markup was copy-pasted into ~28 files behind 4 dropdowns with
 *      ~28 links, and carried a duplicate "Trip Options" bug (a second <a> with
 *      mismatched desktop+mobile classes). A 7-night trip needs a calm spine.
 *
 * DECIDED: Edit each file consistently (no build-time partial in the existing
 *      Vite multi-page setup). Direct links only — no dropdowns — so Avital can
 *      open cold and find things. Map is reachable from Trip + Explore + footer.
 *
 * Run once: `node scripts/apply-nav.mjs`. Idempotent (re-running re-applies the
 * same canonical block). Active-state is set per page from the file's basename.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Map every page to which nav item should be "active".
// (The 15 standalone deep-dive pages were deleted in the 2026-06-08 reconcile.)
const ACTIVE = {
  'index.html': null,
  'itinerary.html': 'trip',
  'stay.html': 'stay',
  'activities.html': 'explore',
  'logistics.html': 'logistics',
  'costs.html': 'costs',
  'notes.html': 'notes',
  'map.html': 'explore',
  'packing.html': 'logistics',
  'pre-trip.html': 'logistics',
  'cafes.html': 'logistics',
  'driving-austria.html': 'logistics',
  'rental-car.html': 'logistics',
};

const NAV_ITEMS = [
  ['trip', 'itinerary.html', 'Trip'],
  ['stay', 'stay.html', 'Stay'],
  ['explore', 'activities.html', 'Explore'],
  ['logistics', 'logistics.html', 'Logistics'],
  ['costs', 'costs.html', 'Costs'],
  ['notes', 'notes.html', 'Notes'],
];

const MOBILE_DESC = {
  trip: 'The seven days, plus bases, Shabbat & deep dives.',
  stay: 'Where you sleep at each of the 4 bases.',
  explore: 'Everything to see + do — tagged & filterable.',
  logistics: 'Flights, car, packing, kosher, pre-trip.',
  costs: 'Per-person totals + breakdown by bucket.',
  notes: '💬 Live feed — Avital + Allison.',
};

function buildDesktopLinks(prefix, active) {
  const links = NAV_ITEMS.map(([key, href, label]) => {
    const cls = key === active ? ' class="active" aria-current="page"' : '';
    return `          <a href="${prefix}${href}"${cls}>${label}</a>`;
  }).join('\n');
  return `<div class="nav-links">\n${links}\n        </div>`;
}

function buildMobile(prefix, active) {
  const sections = NAV_ITEMS.map(([key, href, label]) => {
    const cur = key === active ? ' aria-current="page"' : '';
    return `          <a href="${prefix}${href}"${cur}
            ><span>${label}</span
            ><span class="nav-mobile-section__desc">${MOBILE_DESC[key]}</span></a
          >`;
  }).join('\n');
  return `<div class="nav-mobile" id="nav-mobile" aria-hidden="true">
        <div class="nav-mobile-panel" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div class="nav-mobile-header">
            <span class="nav-mobile-header__title">Austria · 24-31 Jul</span>
            <button class="nav-mobile-close" type="button" aria-label="Close menu">✕</button>
          </div>
${sections}
        </div>
      </div>`;
}

// Replace the desktop nav-links block: from `<div class="nav-links">` up to the
// `</div>` immediately preceding `<button class="nav-hamburger"`.
const desktopRe = /<div class="nav-links">[\s\S]*?<\/div>\s*(?=<button\s+class="nav-hamburger")/;
// Replace the mobile block: from `<div class="nav-mobile"` up to its closing
// `</div>` immediately preceding the inline coordinator <script>.
const mobileRe = /<div class="nav-mobile" id="nav-mobile"[\s\S]*?<\/div>\s*(?=<script>)/;

function processDir(dir, prefix) {
  if (!existsSync(dir)) return 0;
  const files = readdirSync(dir).filter((f) => f.endsWith('.html'));
  let changed = 0;
  for (const file of files) {
    const name = basename(file);
    if (!(name in ACTIVE)) {
      console.warn(`SKIP (unknown page): ${name}`);
      continue;
    }
    const path = resolve(dir, file);
    let html = readFileSync(path, 'utf8');
    const active = ACTIVE[name];

    if (!desktopRe.test(html) || !mobileRe.test(html)) {
      console.warn(`SKIP (no nav match): ${name}`);
      continue;
    }
    html = html.replace(desktopRe, buildDesktopLinks(prefix, active) + '\n        ');
    html = html.replace(mobileRe, buildMobile(prefix, active) + '\n      ');
    writeFileSync(path, html);
    changed++;
    console.log(`nav updated: ${prefix}${name} (active=${active})`);
  }
  return changed;
}

let changed = 0;
changed += processDir(root, ''); // top-level pages → bare hrefs
console.log(`\nDone. ${changed} files updated.`);
