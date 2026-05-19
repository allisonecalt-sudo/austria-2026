// Entry script for /bases.html — 4-base v4 trip structure.
//
// REWRITTEN 2026-05-19 by sweep agent. The previous page rendered
// BASE_CONFIGS (3 mountain-anchor alternates + a LOCKED Schafbergspitze
// summit night). That model is obsolete after the Mon May 18 restructure:
// Avital's structural counter-proposal moved the trip to a clean
// Salzburg → Zell am See → Gosau → Airport shape with no summit overnight.
//
// BASE_CONFIGS in trip-data.ts still exists (pullable-archives rule) and
// powers an "Archived: previously considered" `<details>` collapsible at
// the bottom of the page. The live cards above are rendered from
// TRIP.lodgings which IS the v4 source of truth.
//
// Live picks pulled at render time:
//   1. Salzburg                       (Fri-Sun, 2 nights)   pickName='master Linzergasse'
//   2. Zell am See                    (Sun-Tue, 2 nights)   pickName='Aparthotel Zell am See'
//   3. Gosau                          (Tue-Thu, 2 nights)   pickName='Der Ulmenhof (Gosau)'
//   4. Salzburg airport-side          (Thu-Fri, 1 night)    pickName='Landhaus Grünau'

import {
  BASE_CONFIGS,
  TRIP,
  type BaseConfig,
  type BaseConfigDriveRow,
  type BaseConfigLodgingPick,
  type BudgetTier,
  type Lodging,
  type LodgingLaundry,
  type LodgingVibe,
} from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { initSharedShortlist } from './shortlist-shared.js';
import { startPicksSync } from './sync-picks.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Badge helpers (kept for the archived BASE_CONFIGS rendering) ---

function tierBadge(tier?: BudgetTier): string {
  if (!tier) return '';
  const map: Record<BudgetTier, string> = {
    lean: '💰 Lean',
    standard: '💰💰 Standard',
    splurge: '💰💰💰 Mid-high',
    'mid-high': '💰💰💰 Mid-high',
  };
  return `<span class="chip" title="Budget tier">${map[tier]}</span>`;
}

function vibeBadge(vibe?: LodgingVibe): string {
  if (!vibe || vibe === 'in-town') return '';
  const labels: Record<Exclude<LodgingVibe, 'in-town'>, string> = {
    'nature-view': '🌄 Nature view',
    'farm-stay': '🐐 Farm stay',
    'lake-edge': '🏞️ Lake edge',
    'forest-cabin': '🌲 Forest cabin',
  };
  return `<span class="chip" title="Setting">${labels[vibe]}</span>`;
}

function laundryBadge(l?: LodgingLaundry): string {
  if (!l || l === 'unknown') return '';
  const labels: Record<Exclude<LodgingLaundry, 'unknown'>, { text: string; cls: string }> = {
    'washer+dryer': { text: '🧺 Washer + dryer', cls: 'chip chip-good' },
    washer: { text: '🧺 Washer', cls: 'chip chip-good' },
    shared: { text: '🧺 Shared laundry', cls: 'chip chip-warn' },
    none: { text: '🚫 No laundry', cls: 'chip chip-bad' },
  };
  const x = labels[l];
  return `<span class="${x.cls}" title="Laundry status">${x.text}</span>`;
}

function bedroomBadge(b?: number | 'studio'): string {
  if (b === undefined) return '';
  const label = b === 'studio' ? 'Studio' : `${b} BR`;
  return `<span class="chip" title="Bedrooms">🛏 ${label}</span>`;
}

function bedsBadge(beds?: string): string {
  if (!beds) return '';
  return `<span class="chip" title="Beds">${escapeHtml(beds)}</span>`;
}

function chipRow(chips: string[]): string {
  const non = chips.filter(Boolean);
  if (non.length === 0) return '';
  return `<div class="day-meta" style="margin-top:0.6rem;">${non.join('')}</div>`;
}

// =====================================================================
// LIVE v4 base cards — Salzburg / Zell am See / Gosau / Airport
// =====================================================================

interface V4BaseCard {
  key: Lodging['baseKey'];
  label: string;
  nightsLine: string;
  pitch: string;
  whyHere: string;
  dayShape: string;
  driveNotes: string[];
  nearby: string[];
}

const V4_CARDS: V4BaseCard[] = [
  {
    key: 'salzburg',
    label: 'Base 1 — Salzburg (Shabbat anchor)',
    nightsLine: 'Fri Jul 24 → Sun Jul 26 · 2 nights',
    pitch:
      'Old-town apartment 5 min walk from Chabad. Land Friday morning, settle in, candles 20:35. Shabbat 100% walkable — Linzergasse + Andräviertel + the river. Sunday morning is the move day east.',
    whyHere:
      'Closest practical Shabbat plan to Israel. Chabad on the same street, kosher grocery options scoped, Stolpersteine + Judengasse + Mönchsberg ridge all in walking range. No driving needed for the whole 2 nights.',
    dayShape:
      'Fri AM land → check in afternoon → light Friday menu (Mönchsberg / Mirabell / Festung). Sat = Shabbat full day in Salzburg. Sun AM pack out post-Havdalah, drive ~1h20 south to Zell am See.',
    driveNotes: [
      'SZG airport → Salzburg apartment: 15 min',
      'Salzburg → Zell am See: ~1h20 (~90 km via B311)',
    ],
    nearby: [
      'Chabad Salzburg (Linzergasse 76) — 5 min walk',
      'Festung Hohensalzburg — 15 min walk',
      'Mirabell Gardens — 10 min walk',
      'Mönchsberg ridge sunset — 15 min climb',
    ],
  },
  {
    key: 'zell-am-see',
    label: 'Base 2 — Zell am See (alpine-lake anchor)',
    nightsLine: 'Sun Jul 26 → Tue Jul 28 · 2 nights',
    pitch:
      'Pinzgau alpine lake at the foot of the Schmittenhöhe + the Hohe Tauern. Different feel from the lush Salzkammergut — bigger sky, glacier in view. Two full days to pick from: cable-car peak, glacier at Kaprun, Krimml waterfalls, or a recovery lake-swim day.',
    whyHere:
      "Avital's Booking pick (Sun May 17 note) — free cancellation, lake view. Confirmed 2026-05-19: Aparthotel Zell am See €396 total for the 2 nights, 2.8 km from downtown. Free-cancellation window respected.",
    dayShape:
      'Sun afternoon arrival → Esplanade walk + lakeside sunset. Mon = full day: Schmittenhöhe panorama OR Kitzsteinhorn glacier (25-min drive) OR Krimml falls (1h10 west) OR lake-swim recovery day. Tue AM pack out, ~1h45 NE to Gosau via Bad Ischl.',
    driveNotes: [
      'Salzburg → Zell am See: ~1h20 (~90 km)',
      'Zell am See → Schmittenhöhe valley station: 5 min',
      'Zell am See → Kitzsteinhorn (Kaprun): 25 min',
      'Zell am See → Krimml Waterfalls: 1h10',
      'Zell am See → Gosau (next base): ~1h45 via Bad Ischl',
    ],
    nearby: [
      'Schmittenhöhe peak (2,000m, cable car)',
      'Kitzsteinhorn glacier at Kaprun (3,029m, snow in July)',
      'Krimml Waterfalls (Austria\'s tallest, 380m)',
      'Zeller See — lake swim from the Strandbad',
    ],
  },
  {
    key: 'gosau',
    label: 'Base 3 — Gosau (Salzkammergut lakes anchor)',
    nightsLine: 'Tue Jul 28 → Thu Jul 30 · 2 nights',
    pitch:
      'Right next to the Vorderer Gosausee — the Dachstein-mirror lake that anchors so many of the trip photos. Hallstatt is 20 min north, the Krippenstein cable-car valley station is 25 min, and the Schafberg cog (sunset day-trip option, NOT overnight) is about 50 min back west.',
    whyHere:
      "Lakes-region anchor for the second half. Der Ulmenhof €513 total for 2 nights — 2026-05-19 verified. Gosausee is a 5-min walk from the apartment. Hallstatt + Dachstein-Krippenstein cluster is here. Schafberg cog is reachable as a day-trip but not the centerpiece — cable car at Krippenstein gets the headliner sunset day-trip.",
    dayShape:
      'Tue afternoon arrival → Gosausee loop + lakeside sunset. Wed = pick ONE day-trip headliner (Krippenstein cable car + 5 Fingers OR Hallstatt village + Skywalk OR Schafberg cog as a sunset day-trip) and pair with a slower second pick. Thu AM pack out, ~1h20 SW to airport hotel.',
    driveNotes: [
      'Zell am See → Gosau: ~1h45 via Bad Ischl',
      'Gosau → Vorderer Gosausee: 5 min',
      'Gosau → Hallstatt village: 20 min',
      'Gosau → Krippenstein cable car valley station: 25 min',
      'Gosau → Schafbergbahn valley station (St. Wolfgang): ~50 min',
      'Gosau → Salzburg airport (next base): ~1h20',
    ],
    nearby: [
      'Vorderer Gosausee — Dachstein mirror lake (5 min)',
      'Hallstatt village + Skywalk (20 min)',
      'Krippenstein 5 Fingers platform (cable car day-trip, 25 min to valley station)',
      'Dachstein Eishöhle ice cave (cable car + walk)',
      'Schafberg cog railway from St. Wolfgang (~50 min — day-trip sunset option)',
    ],
  },
  {
    key: 'salzburg-airport',
    label: 'Base 4 — Salzburg airport-side',
    nightsLine: 'Thu Jul 30 → Fri Jul 31 · 1 night',
    pitch:
      "Last night near SZG so the Friday 08:55 LY5194 is a quiet 10-min drive instead of a panicked dash. Landhaus Grünau €176 — 3.4 km from the terminal, free parking, free cancellation. Drop the rental car Thursday night per Avital's logic (no morning-of return scramble).",
    whyHere:
      "Avital's specific logistics idea (voice note Sun May 17, 23:25): \"return the car Thursday night... we could just stay at a hotel in the airport and then not have to worry about returning the car in the morning.\" Friday morning we walk/cab the 3.4 km to the gate.",
    dayShape:
      'Thu afternoon drive from Gosau (~1h20) → check in → return rental car to airport Thursday evening → quick airport-area dinner. Fri AM 06:30 wake → 06:55 at gate (2-hr international check-in) → fly TLV.',
    driveNotes: [
      'Gosau → SZG airport hotel: ~1h20',
      'Airport hotel → SZG terminal: 10 min (or short cab on Friday AM)',
    ],
    nearby: [
      'SZG terminal (3.4 km)',
      'Salzburg Altstadt — 15 min back into town if Thu evening feels open',
    ],
  },
];

function liveLodgingFor(baseKey: Lodging['baseKey']): Lodging | undefined {
  return TRIP.lodgings.find((l) => l.baseKey === baseKey);
}

function renderV4Card(c: V4BaseCard): string {
  const lod = liveLodgingFor(c.key);
  const lodgingBlock = lod
    ? `
        <div class="alts-grid" style="grid-template-columns: 1fr; gap: 0.8rem;">
          <a class="alt-card" href="${escapeHtml(lod.pickUrl)}" target="_blank" rel="noreferrer noopener">
            <img class="alt-img" loading="lazy" decoding="async" src="${escapeHtml(lod.pickImg)}" alt="${escapeHtml(lod.pickName)}" />
            <div class="alt-body">
              <div class="alt-name">${escapeHtml(lod.pickName)} <span class="chip chip-recommended">⭐ Current pick</span></div>
              <div class="alt-meta">${escapeHtml(lod.pickReview)} · <strong>${escapeHtml(lod.pickPrice)}</strong></div>
              ${chipRow([
                vibeBadge(lod.pickVibeTag),
                tierBadge(lod.pickBudgetTier),
                bedroomBadge(lod.pickBedrooms),
                bedsBadge(lod.pickBeds),
                laundryBadge(lod.pickLaundry),
              ])}
              <p class="alt-note">${escapeHtml(lod.pickWhy.slice(0, 240))}${lod.pickWhy.length > 240 ? '…' : ''}</p>
              <div class="alt-cta">View on Booking.com →</div>
            </div>
          </a>
        </div>
        <p style="font-size: 0.88rem; color: var(--ink-soft); margin-top: 0.6rem;">
          ${lod.alts.length} alternate apartments for this base — see
          <a href="stay.html#base-${escapeHtml(c.key)}"><strong>Stay page</strong></a> for the full list.
        </p>`
    : `
        <p style="font-size: 0.9rem; color: var(--ink-soft);">
          Live lodging pick not found for <code>${escapeHtml(c.key)}</code>. See
          <a href="stay.html"><strong>Stay page</strong></a> for the full lodging hub.
        </p>`;

  const driveList = c.driveNotes
    .map((n) => `<li>${escapeHtml(n)}</li>`)
    .join('');
  const nearList = c.nearby.map((n) => `<li>${escapeHtml(n)}</li>`).join('');

  return `
    <details class="base-config" id="config-${escapeHtml(c.key)}" open>
      <summary class="base-config-summary">
        <div class="base-config-head">
          <div class="base-config-label">${escapeHtml(c.label)}</div>
          <div class="base-config-town">${escapeHtml(c.nightsLine)}</div>
        </div>
        <div class="base-config-expand">Tap to collapse ▾</div>
      </summary>
      <div class="base-config-body">
        <p class="base-config-pitch">${escapeHtml(c.pitch)}</p>

        <h3 class="base-config-section-head">Why this base</h3>
        <p>${escapeHtml(c.whyHere)}</p>

        <h3 class="base-config-section-head">Day shape</h3>
        <p>${escapeHtml(c.dayShape)}</p>

        <h3 class="base-config-section-head">Where you stay</h3>
        ${lodgingBlock}

        <h3 class="base-config-section-head">Drive times</h3>
        <ul>${driveList}</ul>

        <h3 class="base-config-section-head">In range from this base</h3>
        <ul>${nearList}</ul>
      </div>
    </details>`;
}

function renderV4Compare(): string {
  const rows = V4_CARDS.map((c) => {
    const lod = liveLodgingFor(c.key);
    return `
      <a class="compare-card" href="#config-${escapeHtml(c.key)}">
        <div class="compare-card-label">${escapeHtml(c.label.replace(/^Base \d+ — /, ''))}</div>
        <div class="compare-card-meta">${escapeHtml(c.nightsLine)}</div>
        <div class="compare-card-pitch">
          ${lod ? `<strong>${escapeHtml(lod.pickName)}</strong> · ${escapeHtml(lod.pickPrice)}<br />` : ''}
          ${escapeHtml(c.pitch.slice(0, 140))}…
        </div>
      </a>`;
  }).join('');
  return `
    <h2 style="margin-bottom:1rem;">The 4 bases · at a glance</h2>
    <div class="compare-grid">${rows}</div>`;
}

// =====================================================================
// Archived section — old BASE_CONFIGS preserved per pullable-archives rule
// =====================================================================

function bucketLabel(b: BaseConfigDriveRow['bucket']): string {
  switch (b) {
    case 'at-door':
      return 'At the door';
    case 'easy':
      return 'Easy (≤30 min)';
    case 'day-trip':
      return 'Day trip (≤1h)';
    case 'long-day':
      return 'Long day (>1h)';
  }
}

function bucketClass(b: BaseConfigDriveRow['bucket']): string {
  return `drive-bucket drive-bucket-${b}`;
}

function renderDriveMatrix(rows: BaseConfigDriveRow[]): string {
  const buckets: Record<BaseConfigDriveRow['bucket'], BaseConfigDriveRow[]> = {
    'at-door': [],
    easy: [],
    'day-trip': [],
    'long-day': [],
  };
  rows.forEach((r) => buckets[r.bucket].push(r));
  const order: BaseConfigDriveRow['bucket'][] = ['at-door', 'easy', 'day-trip', 'long-day'];
  return order
    .filter((b) => buckets[b].length > 0)
    .map((b) => {
      const items = buckets[b]
        .sort((a, c) => a.fromBaseMin - c.fromBaseMin)
        .map(
          (r) =>
            `<li><span class="drive-min">${r.fromBaseMin} min</span> <span class="drive-name">${escapeHtml(r.destinationName)}</span></li>`,
        )
        .join('');
      return `
        <div class="${bucketClass(b)}">
          <div class="drive-bucket-head">${bucketLabel(b)} <span class="drive-bucket-count">${buckets[b].length}</span></div>
          <ul class="drive-bucket-list">${items}</ul>
        </div>`;
    })
    .join('');
}

function renderArchivedLodgingPick(p: BaseConfigLodgingPick): string {
  return `
    <a class="alt-card" href="${escapeHtml(p.url)}" target="_blank" rel="noreferrer noopener">
      <img class="alt-img" loading="lazy" decoding="async" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" />
      <div class="alt-body">
        <div class="alt-name">${escapeHtml(p.name)}</div>
        <div class="alt-meta">${escapeHtml(p.review)} · <strong>${escapeHtml(p.pricePerNight)}</strong></div>
        ${chipRow([
          vibeBadge(p.vibeTag),
          tierBadge(p.budgetTier),
          bedroomBadge(p.bedrooms),
          bedsBadge(p.beds),
          laundryBadge(p.laundry),
        ])}
        <p class="alt-note">${escapeHtml(p.note)}</p>
        <div class="alt-cta">View on Booking.com →</div>
      </div>
    </a>`;
}

function renderArchivedConfigCard(c: BaseConfig): string {
  return `
    <details class="base-config" id="archived-config-${escapeHtml(c.id)}">
      <summary class="base-config-summary">
        <div class="base-config-head">
          <div class="base-config-label">${escapeHtml(c.label)} <span class="chip chip-warn">Archived</span></div>
          <div class="base-config-town">${escapeHtml(c.baseTown)} · ${escapeHtml(c.nightsAtBase)}</div>
        </div>
        <div class="base-config-expand">Tap to expand the archived plan ▾</div>
      </summary>
      <div class="base-config-body">
        <p class="base-config-pitch">${escapeHtml(c.pitch)}</p>

        <h3 class="base-config-section-head">Drive matrix (archived)</h3>
        <div class="drive-matrix">${renderDriveMatrix(c.driveMatrix)}</div>

        <h3 class="base-config-section-head">Lodging picks (archived)</h3>
        <div class="alts-grid">${c.lodging
          .filter((p) => p.availability !== 'sold-out')
          .map(renderArchivedLodgingPick)
          .join('')}</div>
      </div>
    </details>`;
}

function renderArchivedSection(): string {
  return `
    <details class="callout" style="margin-top: 2rem;">
      <summary style="cursor: pointer; font-weight: 600;">
        📁 Archived: the 3-night mountain-anchor configs we previously considered (Obertraun / Berchtesgaden / Wolfgangsee)
      </summary>
      <div style="margin-top: 1rem;">
        <p>
          Before Avital's Mon May 18 restructure, the trip was shaped as
          <em>Salzburg → 3-night mountain anchor (Obertraun / Berchtesgaden / St. Wolfgang)
          → 1-night Schafbergspitze summit → airport</em>. Schafbergspitze was rejected
          (3.6★ Google, rude-staff complaints — see
          <a href="schafbergspitze.html">schafbergspitze.html archive</a>). Lodge am
          Krippenstein replaced it briefly, then went FULL for Jul 29-30 — see
          <a href="krippenstein.html">krippenstein.html decisions log</a>. Avital then
          proposed the cleaner 4-base shape that's live above. The 3 archived
          mountain-anchor configs are kept here so we can pull the work back if we
          ever want to revisit.
        </p>
        ${BASE_CONFIGS.map(renderArchivedConfigCard).join('')}
      </div>
    </details>`;
}

// =====================================================================
// Render
// =====================================================================

function render(): void {
  const compare = document.querySelector<HTMLElement>('#bases-compare');
  if (compare) compare.innerHTML = renderV4Compare();

  // Salzburg laundry-status callout has been retired with the restructure.
  // Active Salzburg pick (master Linzergasse) is the locked Shabbat anchor;
  // the in-unit-washer decision is handled on the Stay page now.
  const laundry = document.querySelector<HTMLElement>('#salzburg-laundry-status');
  if (laundry) laundry.innerHTML = '';

  const root = document.querySelector<HTMLDivElement>('#bases-root');
  if (root) {
    root.innerHTML = V4_CARDS.map(renderV4Card).join('') + renderArchivedSection();
  }
}

render();
initNotesWidget();
initChatPlanPopup();
initSharedShortlist();

// Cross-device sync — keep wiring intact so any committed-base note from
// other surfaces still triggers re-render even though we don't surface a
// commit button on the v4 layout (the 4 bases are locked, no choice).
window.addEventListener('picks-synced', () => {
  render();
});
startPicksSync();
