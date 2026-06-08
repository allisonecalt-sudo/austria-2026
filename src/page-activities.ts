// Activities-by-base hub.
//
// REWRITTEN 2026-05-19 — v4 restructure: bases are now Salzburg / Zell am
// See / Gosau / Salzburg-airport (per Avital's Mon May 18 counter-proposal,
// no summit overnight). Schafberg cog + Krippenstein cable car are
// day-trip options from Gosau, NOT bases.
//
// 4-base structure (v4):
//   - Salzburg          (Fri-Sun, 2N) — Shabbat anchor, walking radius
//   - Zell am See       (Sun-Tue, 2N) — alpine-lake anchor, Schmittenhöhe +
//                                       Kitzsteinhorn + Krimml in range
//   - Gosau             (Tue-Thu, 2N) — Salzkammergut-lakes anchor, Hallstatt
//                                       + Krippenstein cable + Schafberg cog
//                                       as day-trips
//   - Salzburg airport  (Thu-Fri, 1N) — sleep only, car returned Thu eve
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

import { NATURE_DESTINATIONS, type NatureDestination, type SunsetGrade } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { initSharedShortlist, pickButtonOverlay } from './shortlist-shared.js';

// =====================================================================
// Base config — drive times sourced from trip-data.ts where present.
// v4 (2026-05-19): Salzburg / Zell am See / Gosau / Airport.
//
// trip-data.ts has fromSalzburgMin + fromHallstattMin. We re-use:
//   - Salzburg base  → fromSalzburgMin
//   - Zell am See    → fromSalzburgMin + 60 (rough proxy — Zell is ~1h20
//                      south of Salzburg, so anything Salzburg-reachable is
//                      another hour from Zell; specific high-impact picks
//                      surfaced manually in the page header copy)
//   - Gosau base     → fromHallstattMin (Gosau is in the same Salzkammergut
//                      cluster, ~30 min west of Hallstatt — close enough
//                      proxy for the at-door / easy / half-day bucketing)
//   - Airport base   → fromSalzburgMin (airport ≈ Salzburg for drive)
// =====================================================================

type BaseKey = 'salzburg' | 'zell-am-see' | 'gosau' | 'salzburg-airport';

interface BaseSpec {
  key: BaseKey;
  name: string;
  vibe: string; // one-liner
  nightsLabel: string;
  driveMinutesById: (d: NatureDestination) => number;
  hero: string; // image url
  heroAlt: string;
  // Some bases have no meaningful activity radius (airport = sleep only).
  // Render a short message instead of cards.
  collapseToMessage?: string;
}

const SALZBURG_BASE: BaseSpec = {
  key: 'salzburg',
  name: 'Salzburg base · Shabbat anchor',
  vibe: 'Old Town + Mönchsberg walks. Drive radius hits Berchtesgaden + Werfen + Fuschlsee in under an hour. Shabbat = walking radius only.',
  nightsLabel: 'Fri Jul 24 → Sun Jul 26 · 2 nights',
  driveMinutesById: (d) => d.fromSalzburgMin,
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
  heroAlt: 'Salzach river through Salzburg old town under the Mönchsberg',
};

const ZELL_BASE: BaseSpec = {
  key: 'zell-am-see',
  name: 'Zell am See base · alpine-lake anchor',
  vibe: 'Pinzgau alpine lake at the foot of the Schmittenhöhe + Hohe Tauern. Schmittenhöhe cable car + Kitzsteinhorn glacier + Krimml falls all reachable within an hour. Different feel from the Salzkammergut second half.',
  nightsLabel: 'Sun Jul 26 → Tue Jul 28 · 2 nights',
  // Zell am See ≈ Salzburg + 60 min for general purposes — gives an
  // honest "everything is further from Zell than from Salzburg" floor
  // without inventing a drive matrix.
  driveMinutesById: (d) => d.fromSalzburgMin + 60,
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Zell_am_See_CC.JPG/1280px-Zell_am_See_CC.JPG',
  heroAlt: 'Zell am See on the Pinzgau with peaks rising behind the lake',
  collapseToMessage:
    'From Zell: Schmittenhöhe cable car (5 min drive), Kitzsteinhorn glacier at Kaprun (25 min), Krimml Waterfalls (1h10), Zeller See swim (5 min walk). Most of the trip-data nature picks are clustered around the Hallstatt area — so the cards below are filtered to spots reachable from this base. For day-by-day specifics see the itinerary.',
};

const GOSAU_BASE: BaseSpec = {
  key: 'gosau',
  name: 'Gosau base · Salzkammergut-lakes anchor',
  vibe: 'Vorderer Gosausee 5 min away (the Dachstein mirror), Hallstatt 20 min, Krippenstein cable car 25 min, Schafberg cog ~50 min — all as day-trips. Two full days of options.',
  nightsLabel: 'Tue Jul 28 → Thu Jul 30 · 2 nights',
  driveMinutesById: (d) => d.fromHallstattMin,
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
  heroAlt: 'Vorderer Gosausee with the Dachstein massif reflected in the water',
};

// Airport night = sleep + 10-min drive to gate Friday morning. Nothing
// else is an "activity" here — surface as a message + cross-reference
// the Gosau-day or Salzburg-evening as the actual Thursday activity.
const AIRPORT_BASE: BaseSpec = {
  key: 'salzburg-airport',
  name: 'Salzburg airport-side · sleep only',
  vibe: 'Just sleep + shower. Car returned Thu evening per Avital. 10-min cab to SZG terminal for the 08:55 Friday flight.',
  nightsLabel: 'Thu Jul 30 → Fri Jul 31 · 1 night',
  driveMinutesById: (d) => d.fromSalzburgMin, // airport ≈ Salzburg for drive purposes
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Werfen_-_Burg_Hohenwerfen_%281%29.JPG/1280px-Werfen_-_Burg_Hohenwerfen_%281%29.JPG',
  heroAlt: 'Hohenwerfen castle above the Salzach valley near the airport drive',
  collapseToMessage:
    'Thursday afternoon is the drive from Gosau (~1h20) → check in → return rental at SZG Thursday evening. Friday morning is just a 10-min cab to the gate. If Thursday afternoon feels open, Hohenwerfen castle + Eisriesenwelt ice cave are 30-40 min off the Gosau → Salzburg route — same drive-times as the Salzburg base column above.',
};

const BASES: BaseSpec[] = [SALZBURG_BASE, ZELL_BASE, GOSAU_BASE, AIRPORT_BASE];

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
      if (
        d.id === 'schafbergspitze' ||
        d.id === 'krippenstein-5fingers' ||
        d.id === 'zwoelferhorn'
      ) {
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
    case 'salzburg-airport':
      return d.links.mapsFromSalzburg;
    case 'gosau':
      // Gosau is in the same Salzkammergut cluster as Hallstatt — the
      // mapsFromHallstatt link is close enough for routing purposes.
      return d.links.mapsFromHallstatt;
    case 'zell-am-see':
      // No pre-computed Zell-am-See routing link in trip-data — generate
      // a direction URL inline from the town name.
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Zell am See, Austria')}&destination=${encodeURIComponent(d.localName ?? d.name)}`;
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
function bucketBlock(bucketKey: Bucket, dests: NatureDestination[], base: BaseSpec): string {
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
      base.key === 'salzburg-airport'
        ? '<a href="#base-salzburg">↑ See Salzburg-base activities</a> (drive times are the same — airport ≈ Salzburg)'
        : '<a href="#base-gosau">↓ See Gosau-base activities</a>';
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
        `<li><strong>${escape(d.name)}</strong> · ${base.driveMinutesById(d)} min</li>`,
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
      document.querySelectorAll<HTMLButtonElement>('.filter-chip.is-on').forEach((b) => {
        b.classList.remove('is-on');
        b.setAttribute('aria-pressed', 'false');
      });
      applyFilters();
      clearBtn.hidden = true;
    });
  }
}

function applyFilters(): void {
  const active = Array.from(document.querySelectorAll<HTMLButtonElement>('.filter-chip.is-on')).map(
    (b) => b.dataset.cat ?? '',
  );
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
    const visible = Array.from(b.querySelectorAll<HTMLElement>('.act-card')).some((c) => !c.hidden);
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
