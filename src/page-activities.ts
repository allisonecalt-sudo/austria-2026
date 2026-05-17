// Activities-by-base hub.
//
// IA reframe (2026-05-17 — Allison: "rethink how to present info now that we
// have set up of salsburg. Mt, sunset place salasburg an dalso how activities
// presented").
//
// 4-base structure is locked:
//   - Salzburg (Fri-Sun, 2N) — Shabbat anchor, walking radius + Old Town
//   - Mountain anchor / Obertraun (Sun-Wed, 3N) — Salzkammergut + Berchtesgaden
//   - Schafbergspitze (Wed-Thu, 1N) — summit hotel, the peak moment
//   - Airport (Thu-Fri, 1N) — sleep only
//
// For each base we surface: walking-from-base options, ≤30min "easy",
// 30-60min "half-day", 60-120min "make a plan." Long-day commitments
// (>120min) are surfaced only as cross-references.
//
// Sorting: within each bucket, sort by sunset rating desc (sunsets are
// sacred per Allison), then by walk type (walk > easy-hike), so the
// breathtaking-and-easy ones float to top.
//
// Filter pills start EMPTY (booking-style). User taps category to narrow.
// Categories are NatureType but grouped into Avital-friendly labels
// (Water / Easy walk / Scenic drive / Cog-train / Cave / Sunset spot).
//
// NO Montenegro comparisons (Avital's explicit ban). NO winter photos.

import {
  NATURE_DESTINATIONS,
  type NatureDestination,
  type SunsetGrade,
} from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { initSharedShortlist, pickButtonOverlay } from './shortlist-shared.js';

// =====================================================================
// Base config — drive times sourced from trip-data.ts where present,
// patched here for Schafberg + airport bases (which aren't in the base
// drive-time matrices).
// =====================================================================

type BaseKey = 'salzburg' | 'obertraun' | 'summit' | 'airport';

interface BaseSpec {
  key: BaseKey;
  name: string;
  vibe: string; // one-liner
  nightsLabel: string;
  driveMinutesById: (d: NatureDestination) => number;
  hero: string; // image url
  heroAlt: string;
  // Some bases have no meaningful activity radius (summit = stay put;
  // airport = sleep only). Render a short message instead of cards.
  collapseToMessage?: string;
}

// Drive-time matrices — for Obertraun reuse NatureDestination.fromHallstattMin,
// for Salzburg reuse fromSalzburgMin. Summit + airport are too narrow to
// drive activities from, so they get a short note.
const SALZBURG_BASE: BaseSpec = {
  key: 'salzburg',
  name: 'Salzburg base',
  vibe: 'Old Town + Mönchsberg walks. Drive radius hits Berchtesgaden + Werfen + Fuschlsee in under an hour.',
  nightsLabel: 'Fri Jul 24 → Sun Jul 26 · 2 nights',
  driveMinutesById: (d) => d.fromSalzburgMin,
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
  heroAlt: 'Salzach river through Salzburg old town under the Mönchsberg',
};

const OBERTRAUN_BASE: BaseSpec = {
  key: 'obertraun',
  name: 'Mountain anchor (Obertraun / Hallstatt area)',
  vibe: 'The deep-immersion 3 nights. Lake out the window, Dachstein at the door, Königssee + Wolfgangsee on day trips.',
  nightsLabel: 'Sun Jul 26 → Wed Jul 29 · 3 nights',
  driveMinutesById: (d) => d.fromHallstattMin,
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
  heroAlt: 'Hallstatt boathouses on the lake under the painted village',
};

// Schafbergspitze sits at the summit — drive irrelevant. The "activity" IS
// the cog railway up, sunset on the terrace, sunrise over the Dachstein.
const SUMMIT_BASE: BaseSpec = {
  key: 'summit',
  name: 'Schafbergspitze summit (1,783 m)',
  vibe: 'The peak moment of the trip. Cog railway up Wed afternoon, sunset over 13 lakes, sunrise on the Dachstein, cog back Thu morning.',
  nightsLabel: 'Wed Jul 29 → Thu Jul 30 · 1 night · splurge',
  driveMinutesById: () => 0,
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
  heroAlt: 'Schafberg summit ridge with Salzkammergut lakes visible far below',
  collapseToMessage:
    'You are the activity. The cog railway from St. Wolfgang is the journey, the terrace at the top is the destination, sunset is the event. No driving, no choosing — this is the one night the trip pre-decides for you.',
};

// Airport night = sleep + 15-min drive to gate Friday morning. Nothing
// else is an "activity" here — surface as a message + cross-reference
// Werfen / Bluntautal / Almbachklamm as Thursday-day options before the
// sleep transfer.
const AIRPORT_BASE: BaseSpec = {
  key: 'airport',
  name: 'Airport-area sleep (Salzburg West)',
  vibe: 'Just sleep + shower. 15-min drive to SZG for the 6:30 Friday flight.',
  nightsLabel: 'Thu Jul 30 → Fri Jul 31 · 1 night',
  driveMinutesById: (d) => d.fromSalzburgMin, // airport ≈ Salzburg for drive purposes
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Werfen_-_Burg_Hohenwerfen_%281%29.JPG/1280px-Werfen_-_Burg_Hohenwerfen_%281%29.JPG',
  heroAlt: 'Hohenwerfen castle above the Salzach valley near the airport drive',
  collapseToMessage:
    "Thursday is a full day. Do Werfen / Eisriesenwelt or Bluntautal as the day's activity, then drive to the airport hotel after sunset. Friday morning is just a 15-min hop to the gate. Same drive-times as the Salzburg base column below.",
};

const BASES: BaseSpec[] = [SALZBURG_BASE, OBERTRAUN_BASE, SUMMIT_BASE, AIRPORT_BASE];

// =====================================================================
// Drive-time bucket
// =====================================================================
type Bucket = 'at-door' | 'easy' | 'half-day' | 'long-day';

function bucket(min: number): Bucket {
  if (min <= 10) return 'at-door';
  if (min <= 30) return 'easy';
  if (min <= 75) return 'half-day';
  return 'long-day';
}

const BUCKET_LABEL: Record<Bucket, string> = {
  'at-door': '🚶 At the door (≤10 min)',
  easy: '🚗 Easy (≤30 min)',
  'half-day': '🚙 Half-day (≤75 min)',
  'long-day': '🛣️ Big day (>75 min — make a plan)',
};

// =====================================================================
// Category taxonomy — fold NatureType into Avital-friendly category labels.
// Filter pills use these.
// =====================================================================
type Category =
  | 'sunset'
  | 'lake'
  | 'gorge'
  | 'waterfall'
  | 'cog-train'
  | 'cave'
  | 'village'
  | 'scenic-drive'
  | 'platform'
  | 'meadow';

interface CategorySpec {
  key: Category;
  label: string;
  icon: string;
}

const CATEGORIES: CategorySpec[] = [
  { key: 'sunset', label: 'Sunset spot', icon: '🌅' },
  { key: 'lake', label: 'Lake', icon: '🏞️' },
  { key: 'gorge', label: 'Gorge', icon: '🌊' },
  { key: 'waterfall', label: 'Waterfall', icon: '💧' },
  { key: 'cog-train', label: 'Cog train / gondola', icon: '🚠' },
  { key: 'cave', label: 'Cave', icon: '🕳️' },
  { key: 'village', label: 'Painted village', icon: '🏘️' },
  { key: 'scenic-drive', label: 'Scenic drive', icon: '🛣️' },
  { key: 'platform', label: 'Skywalk / viewpoint', icon: '🪜' },
  { key: 'meadow', label: 'Alpine meadow', icon: '🌾' },
];

function categoriesFor(d: NatureDestination): Category[] {
  const cats: Category[] = [];
  // Type → category (1:1 mostly).
  switch (d.type) {
    case 'lake':
      cats.push('lake');
      break;
    case 'gorge':
      cats.push('gorge');
      break;
    case 'waterfall':
      cats.push('waterfall');
      break;
    case 'cave':
      cats.push('cave');
      break;
    case 'village':
      cats.push('village');
      break;
    case 'road':
      cats.push('scenic-drive');
      break;
    case 'platform':
    case 'peak':
      // Schafberg + Krippenstein are cog/cable reached — tag both
      cats.push('platform');
      if (d.id === 'schafbergspitze' || d.id === 'krippenstein-5fingers' || d.id === 'zwoelferhorn') {
        cats.push('cog-train');
      }
      break;
    case 'meadow':
      cats.push('meadow');
      break;
    case 'valley':
      cats.push('meadow');
      break;
  }
  // Sunset overlay — any 🌅🌅🌅 entry also counts as a sunset spot.
  if (d.sunset === 3) cats.push('sunset');
  return cats;
}

// =====================================================================
// HTML helpers
// =====================================================================
function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sunsetStars(n: SunsetGrade): string {
  return '🌅'.repeat(n);
}

function walkBadge(walk: NatureDestination['walk']): string {
  return walk === 'walk' ? '🚶 walk' : '🥾 easy hike';
}

// TLDR — ≤30 words above the fold per Avital format request. Takes feature +
// trims to two sentences or 28 words, whichever shorter.
function tldr(d: NatureDestination): string {
  const text = d.feature.trim();
  const words = text.split(/\s+/);
  if (words.length <= 30) return text;
  return words.slice(0, 28).join(' ') + '…';
}

// Maps URL helper — for the airport + summit bases that don't have
// pre-computed drive URLs in trip-data.ts, fall back to a generic search
// from "Salzburg" or "St. Wolfgang."
function driveLinkFromBase(base: BaseSpec, d: NatureDestination): string {
  switch (base.key) {
    case 'salzburg':
    case 'airport':
      return d.links.mapsFromSalzburg;
    case 'obertraun':
      return d.links.mapsFromHallstatt;
    case 'summit':
      // From St. Wolfgang (cog-railway base village) — direction link generated inline.
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('St. Wolfgang im Salzkammergut')}&destination=${encodeURIComponent(d.localName ?? d.name)}`;
  }
}

// =====================================================================
// Sort within a bucket — sunset desc, then walk (walk > easy-hike), then
// drive time asc. So the "stunning + close + easy" picks float to the top.
// =====================================================================
function sortBucket(arr: NatureDestination[], base: BaseSpec): NatureDestination[] {
  return [...arr].sort((a, b) => {
    if (b.sunset !== a.sunset) return b.sunset - a.sunset;
    if (a.walk !== b.walk) return a.walk === 'walk' ? -1 : 1;
    return base.driveMinutesById(a) - base.driveMinutesById(b);
  });
}

// =====================================================================
// Activity card — TLDR-first, photo on top, drive time + walk + category
// chips, source link out.
// =====================================================================
function activityCard(d: NatureDestination, base: BaseSpec): string {
  const mins = base.driveMinutesById(d);
  const mapsLink = driveLinkFromBase(base, d);

  const lockedBadge = d.lockedDay
    ? `<div class="day-hero-badge peak" title="Already in the v1 itinerary">✓ Locked · ${escape(d.lockedDay)}</div>`
    : d.hiddenGem
      ? `<div class="day-hero-badge hidden-gem-badge" title="Hidden gem">💎 Hidden gem</div>`
      : '';

  const cats = categoriesFor(d);
  const catChips = cats
    .map((c) => {
      const spec = CATEGORIES.find((x) => x.key === c);
      if (!spec) return '';
      return `<span class="chip act-cat" data-cat="${c}">${spec.icon} ${escape(spec.label)}</span>`;
    })
    .join('');

  const pickBtnHtml = pickButtonOverlay(d.id, 'activity', d.name);

  return `
    <article class="act-card" id="${d.id}-${base.key}" data-cats="${cats.join(' ')}" data-pick-card-id="${d.id}" data-pick-card-type="activity">
      <div class="act-card__media">
        <img src="${escape(d.hero.src)}" alt="${escape(d.hero.alt)}" loading="lazy" decoding="async" />
        ${lockedBadge}
        ${pickBtnHtml}
      </div>
      <div class="act-card__body">
        <div class="act-card__eyebrow">
          ${escape(d.country === 'AT' ? 'Austria' : 'Germany')}
          ${d.sunset === 3 ? ' · 🌅🌅🌅 marquee sunset' : ''}
        </div>
        <h3 class="act-card__title">${escape(d.name)}</h3>
        <p class="act-card__tldr">${escape(tldr(d))}</p>

        <div class="act-card__chips">
          <span class="chip" title="Sunset rating 1-3">${sunsetStars(d.sunset)}</span>
          <span class="chip">${escape(walkBadge(d.walk))}</span>
          <a href="${escape(mapsLink)}" target="_blank" rel="noreferrer noopener" class="chip act-chip--drive">
            🚗 ${mins === 0 ? 'on-site' : `${mins} min`}
          </a>
        </div>

        <p class="act-card__walk">
          <strong>Walk:</strong> ${escape(d.walkNote)}
        </p>

        <div class="act-card__catrow">${catChips}</div>

        <div class="act-card__links">
          ${
            d.links.official
              ? `<a href="${escape(d.links.official)}" target="_blank" rel="noreferrer noopener">Official site →</a>`
              : ''
          }
          <a href="${escape(d.links.wikipedia)}" target="_blank" rel="noreferrer noopener">Wikipedia →</a>
        </div>
      </div>
    </article>`;
}

// =====================================================================
// Bucket block — heading + grid of cards for one drive-time bucket
// inside one base.
// =====================================================================
function bucketBlock(
  bucketKey: Bucket,
  dests: NatureDestination[],
  base: BaseSpec,
): string {
  if (dests.length === 0) return '';
  const sorted = sortBucket(dests, base);
  return `
    <section class="act-bucket">
      <h3 class="act-bucket__head">
        ${escape(BUCKET_LABEL[bucketKey])}
        <span class="act-bucket__count">${sorted.length}</span>
      </h3>
      <div class="act-cards-grid">
        ${sorted.map((d) => activityCard(d, base)).join('')}
      </div>
    </section>`;
}

// =====================================================================
// Base section
// =====================================================================
function baseSection(base: BaseSpec): string {
  // If the base collapses to a message (summit, airport), render a
  // simpler block.
  if (base.collapseToMessage) {
    const xrefLink =
      base.key === 'summit'
        ? '<a href="#base-obertraun">↑ See mountain-anchor activities</a> (Wed afternoon is the cog-up; everything before is from Obertraun)'
        : '<a href="#base-salzburg">↑ See Salzburg-base activities</a> (drive times are the same)';
    return `
      <section class="acts-base" id="base-${base.key}">
        <header class="acts-base__head acts-base__head--${base.key}">
          <img class="acts-base__hero" src="${escape(base.hero)}" alt="${escape(base.heroAlt)}" loading="lazy" decoding="async" />
          <div class="acts-base__headoverlay">
            <div class="acts-base__eyebrow">${escape(base.nightsLabel)}</div>
            <h2 class="acts-base__title">${escape(base.name)}</h2>
            <p class="acts-base__vibe">${escape(base.vibe)}</p>
          </div>
        </header>
        <div class="acts-base__message">
          <p>${escape(base.collapseToMessage)}</p>
          <p class="acts-base__xref">${xrefLink}</p>
        </div>
      </section>`;
  }

  // Bucket the destinations by drive time.
  const buckets: Record<Bucket, NatureDestination[]> = {
    'at-door': [],
    easy: [],
    'half-day': [],
    'long-day': [],
  };
  for (const d of NATURE_DESTINATIONS) {
    const mins = base.driveMinutesById(d);
    buckets[bucket(mins)].push(d);
  }

  // Render at-door → easy → half-day. Long-day shown collapsed as one-liner
  // so you can see what's beyond reach without it dominating the page.
  const longDayList = buckets['long-day']
    .sort((a, b) => base.driveMinutesById(a) - base.driveMinutesById(b))
    .map(
      (d) =>
        `<li><strong>${escape(d.name)}</strong> · ${base.driveMinutesById(d)} min · <a href="nature-destinations.html#${escape(d.id)}">details →</a></li>`,
    )
    .join('');

  const longDayBlock = longDayList
    ? `<details class="act-longday">
        <summary>Big-day options (>75 min) — ${buckets['long-day'].length}</summary>
        <ul>${longDayList}</ul>
      </details>`
    : '';

  return `
    <section class="acts-base" id="base-${base.key}">
      <header class="acts-base__head acts-base__head--${base.key}">
        <img class="acts-base__hero" src="${escape(base.hero)}" alt="${escape(base.heroAlt)}" loading="lazy" decoding="async" />
        <div class="acts-base__headoverlay">
          <div class="acts-base__eyebrow">${escape(base.nightsLabel)}</div>
          <h2 class="acts-base__title">${escape(base.name)}</h2>
          <p class="acts-base__vibe">${escape(base.vibe)}</p>
        </div>
      </header>

      ${bucketBlock('at-door', buckets['at-door'], base)}
      ${bucketBlock('easy', buckets.easy, base)}
      ${bucketBlock('half-day', buckets['half-day'], base)}
      ${longDayBlock}
    </section>`;
}

// =====================================================================
// Filter pill bar — starts empty (no filter applied), tap to narrow.
// =====================================================================
function renderFilterPills(): void {
  const root = document.getElementById('acts-filterpills');
  if (!root) return;
  root.innerHTML = CATEGORIES.map(
    (c) =>
      `<button type="button" class="filter-chip" data-cat="${c.key}" aria-pressed="false">${c.icon} ${escape(c.label)}</button>`,
  ).join('');

  const clearBtn = document.getElementById('acts-filterclear') as HTMLButtonElement | null;

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const btn = target.closest<HTMLButtonElement>('button.filter-chip');
    if (!btn) return;
    const isOn = btn.classList.toggle('is-on');
    btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    applyFilters();
    if (clearBtn) clearBtn.hidden = document.querySelectorAll('.filter-chip.is-on').length === 0;
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document
        .querySelectorAll<HTMLButtonElement>('.filter-chip.is-on')
        .forEach((b) => {
          b.classList.remove('is-on');
          b.setAttribute('aria-pressed', 'false');
        });
      applyFilters();
      clearBtn.hidden = true;
    });
  }
}

function applyFilters(): void {
  const active = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.filter-chip.is-on'),
  ).map((b) => b.dataset.cat ?? '');
  const cards = document.querySelectorAll<HTMLElement>('.act-card');
  if (active.length === 0) {
    cards.forEach((c) => (c.hidden = false));
    hideEmptyBuckets();
    return;
  }
  cards.forEach((c) => {
    const cats = (c.dataset.cats ?? '').split(/\s+/);
    const match = active.some((a) => cats.includes(a));
    c.hidden = !match;
  });
  hideEmptyBuckets();
}

// After filtering, hide bucket headers whose grid has no visible cards.
function hideEmptyBuckets(): void {
  document.querySelectorAll<HTMLElement>('.act-bucket').forEach((b) => {
    const visible = Array.from(b.querySelectorAll<HTMLElement>('.act-card')).some(
      (c) => !c.hidden,
    );
    b.hidden = !visible;
  });
}

// =====================================================================
// Bootstrap
// =====================================================================
function render(): void {
  const root = document.getElementById('acts-root');
  if (!root) return;
  root.innerHTML = BASES.map((b) => baseSection(b)).join('');
  renderFilterPills();
}

render();
initNotesWidget();
initChatPlanPopup();
initSharedShortlist();
