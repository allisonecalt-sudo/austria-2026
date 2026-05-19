/**
 * page-trip-summary.ts — High-level "trip at a glance" view.
 *
 * Built per Avital feedback 2026-05-16: she wants the summary, not the
 * hour-by-hour. Key places + drive times + where staying + great views,
 * with flex-around-the-days framing. Itinerary remains as the deep view.
 *
 * Renders:
 *   1. Where we sleep — 3 bases as cards
 *   2. Must-see places — 7 anchors per day with sleep + driveFrom
 *   3. The views — top 5 sunset spots
 *   4. 7-day strip — headline + sleep + must-see per day
 *   5. Drive matrix (HTML in the page itself)
 */

import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { TRIP } from './trip-data.js';
import type { Day, Lodging } from './trip-data.js';

initNotesWidget();
initChatPlanPopup();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------
// Short "why this plan" — landing-style two-sentence summary
// ---------------------------------------------------------------
function bindWhyShort(): void {
  const el = document.querySelector<HTMLParagraphElement>('[data-bind="why-short"]');
  if (!el) return;
  el.textContent =
    'Friday Jul 24 — Friday Jul 31, 2026. Salzburg for Shabbat (2 nights), then Zell am See for the alpine-lake first half (2 nights), then Gosau for the Salzkammergut lakes second half (2 nights — Hallstatt + Krippenstein as day-trips), then 1 night at Salzburg airport-side before the Friday 08:55 flight. 4 bases, 3 moves. Each open day shows OPTIONS — Avital picks per energy + weather.';
}

// ---------------------------------------------------------------
// 1 — Where we sleep
// ---------------------------------------------------------------
interface StayCard {
  baseKey: Lodging['baseKey'];
  label: string;
  nightsLabel: string;
  area: string;
  pickName: string;
  pickPrice: string;
  pickWhy: string;
  pickUrl: string;
}

function buildStayCards(): StayCard[] {
  // Rewritten 2026-05-19 — old labelMap drove the deprecated 3-base shape
  // (salzburg / hallstatt / airport + injected Schafberg summit). v4
  // restructure is straight 4-base: salzburg / zell-am-see / gosau /
  // salzburg-airport. Deprecated keys kept in the map so any archived
  // lodgings still render with a flagged label if they re-appear.
  const labelMap: Record<Lodging['baseKey'], string> = {
    salzburg: 'Salzburg · Shabbat base',
    'zell-am-see': 'Zell am See · alpine-lake anchor (2 nights)',
    gosau: 'Gosau · Salzkammergut lakes anchor (2 nights)',
    'salzburg-airport': 'Salzburg airport-side · last night',
    // deprecated 2026-05-19 — kept for archived blocks
    hallstatt: 'Mountain anchor (Obertraun) — ARCHIVED 2026-05-19, see Zell am See + Gosau',
    airport: 'Salzburg airport-side (legacy entry) — ARCHIVED 2026-05-19, see B&B Villa Verde',
  };
  // Filter out archived/deprecated lodgings from the active stay-cards view.
  // The archived entries still live in TRIP.lodgings (pullable archives rule)
  // but the trip-summary page only shows the v4 active 4-base set.
  const ACTIVE: Lodging['baseKey'][] = [
    'salzburg',
    'zell-am-see',
    'gosau',
    'salzburg-airport',
  ];
  return TRIP.lodgings
    .filter((lod) => ACTIVE.includes(lod.baseKey))
    .map((lod) => ({
      baseKey: lod.baseKey,
      label: labelMap[lod.baseKey],
      nightsLabel: lod.nights,
      area: lod.area,
      pickName: lod.pickName,
      pickPrice: lod.pickPrice,
      pickWhy: lod.pickWhy,
      pickUrl: lod.pickUrl,
    }));
}

function renderStays(): void {
  const root = document.getElementById('ts-stays');
  if (!root) return;
  const cards = buildStayCards();
  root.innerHTML = cards
    .map(
      (c) => `
      <article class="ts-stay-card ts-stay--${escapeHtml(c.baseKey)}">
        <div class="ts-stay-eyebrow">${escapeHtml(c.label)}</div>
        <div class="ts-stay-nights">${escapeHtml(c.nightsLabel)}</div>
        <div class="ts-stay-area">${escapeHtml(c.area)}</div>
        <div class="ts-stay-pick">
          <span class="ts-stay-pick-h">Pick:</span>
          <a href="${escapeHtml(c.pickUrl)}" target="_blank" rel="noreferrer noopener"
            ><strong>${escapeHtml(c.pickName)}</strong></a
          >
          <span class="ts-stay-price">${escapeHtml(c.pickPrice)}</span>
        </div>
        <p class="ts-stay-why">${escapeHtml(c.pickWhy.slice(0, 220))}${c.pickWhy.length > 220 ? '…' : ''}</p>
        <a class="ts-stay-more" href="stay.html">All options for this base →</a>
      </article>`,
    )
    .join('');
}

// ---------------------------------------------------------------
// 2 — Per-day OPTIONS-FIRST summary (added 2026-05-17 per the
// "OPTIONS-FIRST OVERRIDE TRIP SUMMARY" spec). Each row shows the
// locked beats + a short menu of options for the open hours +
// where we sleep + drive time. Avital scans, picks, iterates.
// ---------------------------------------------------------------
interface PlaceRow {
  day: string;
  date: string;
  headline: string;
  doing: string;
  sleep: string;
  driveFromLabel: string;
}

// SLEEP_LABEL map — kept IN-SYNC with the sleepWhere enum in trip-data.ts.
// CRITICAL: every literal in Day['sleepWhere'] must have a key here, or
// SLEEP_LABEL[d.sleepWhere] is `undefined` and rendering breaks. Deprecated
// values are still listed so archived data still renders gracefully.
const SLEEP_LABEL: Record<Day['sleepWhere'], string> = {
  salzburg: 'Salzburg (Linzergasse)',
  'zell-am-see': 'Zell am See (Aparthotel Zell am See)',
  gosau: 'Gosau (Der Ulmenhof)',
  'salzburg-airport': 'Salzburg airport-side (B&B Villa Verde)',
  // --- deprecated 2026-05-19, kept so archived rows still render ---
  hallstatt: 'Mountain anchor (Obertraun) — ARCHIVED 2026-05-19',
  schafbergspitze: 'Berghotel Schafbergspitze — SUPERSEDED 2026-05-17',
  'lodge-am-krippenstein': 'Lodge am Krippenstein — ARCHIVED 2026-05-19',
  airport: 'Salzburg airport-side (legacy) — ARCHIVED 2026-05-19',
};

function buildPlaceRows(): PlaceRow[] {
  return TRIP.days.map((d) => {
    let driveLabel = '—';
    if (d.driveFrom) {
      driveLabel = `${d.driveFrom.minutes} min from ${d.driveFrom.place}`;
    } else if (d.driveTo) {
      driveLabel = `${d.driveTo.minutes} min to ${d.driveTo.place}`;
    }
    return {
      day: d.dayOfWeek,
      date: d.dateLabel,
      headline: d.headline,
      doing: d.doingSummary,
      sleep: SLEEP_LABEL[d.sleepWhere],
      driveFromLabel: driveLabel,
    };
  });
}

function renderPlaces(): void {
  const root = document.getElementById('ts-places');
  if (!root) return;
  const rows = buildPlaceRows();
  root.innerHTML = rows
    .map(
      (r, i) => `
      <div class="ts-place-row">
        <div class="ts-place-num">${i + 1}</div>
        <div class="ts-place-body">
          <div class="ts-place-when">${escapeHtml(r.date)}</div>
          <div class="ts-place-headline">${escapeHtml(r.headline)}</div>
          <div class="ts-place-doing"><span class="ts-place-doing-label">Doing:</span> ${escapeHtml(r.doing)}</div>
          <div class="ts-place-meta">
            <span class="ts-place-meta-item">🏠 Sleep: <strong>${escapeHtml(r.sleep)}</strong></span>
            <span class="ts-place-meta-item">🚗 ${escapeHtml(r.driveFromLabel)}</span>
          </div>
        </div>
      </div>`,
    )
    .join('');
}

// ---------------------------------------------------------------
// 3 — Top 5 sunset spots (curated from the trip's named sunsets)
// ---------------------------------------------------------------
interface SunsetPick {
  rank: number;
  spot: string;
  day: string;
  time: string;
  oneLine: string;
}

const TOP_5_SUNSETS: SunsetPick[] = [
  {
    rank: 1,
    spot: 'Königssee — last electric boat from St. Bartholomä',
    day: 'Tue Jul 28',
    time: '20:50',
    oneLine:
      "Silent electric boat back as Watzmann's east wall goes gold and the lake goes silver. The trip's peak moment — hours, not minutes.",
  },
  {
    rank: 2,
    spot: 'Schafbergspitze summit — SLEEP at 1,783m (Wed Jul 29 base)',
    day: 'Wed Jul 29',
    time: '20:48',
    oneLine:
      "Cog rail up at ~17:00 → after last train down the summit empties to ~34 overnight guests. Sleep at Austria's oldest mountain hotel (1862). 360° panorama: 13 lakes at sunset, Dachstein at sunrise. Locked base, not a day trip.",
  },
  {
    rank: 3,
    spot: 'Hallstatt Markt lakeside walkway',
    day: 'Mon Jul 27',
    time: '20:51',
    oneLine:
      'The painted boathouses go amber as the sun drops behind the Salzberg ridge. The iconic Hallstatt photo at the iconic Hallstatt hour.',
  },
  {
    rank: 4,
    spot: 'Mönchsberg ridge above Salzburg',
    day: 'Thu Jul 30',
    time: '20:47',
    oneLine:
      'Last sunset of the trip — old town spread below, fortress catching the light. Climb from Toscaninihof after Eisriesenwelt.',
  },
  {
    rank: 5,
    spot: 'Lake Hallstatt dock at Obertraun',
    day: 'Sun Jul 26',
    time: '20:53',
    oneLine:
      'Five minutes from the apartment door. The arrival sunset — settle in, exhale, watch the lake light up the day you move east.',
  },
];

function renderSunsets(): void {
  const root = document.getElementById('ts-sunsets');
  if (!root) return;
  root.innerHTML = TOP_5_SUNSETS.map(
    (s) => `
      <article class="ts-sunset-card">
        <div class="ts-sunset-rank">#${s.rank}</div>
        <div class="ts-sunset-body">
          <div class="ts-sunset-when">${escapeHtml(s.day)} · 🌅 ${escapeHtml(s.time)}</div>
          <div class="ts-sunset-spot">${escapeHtml(s.spot)}</div>
          <p class="ts-sunset-line">${escapeHtml(s.oneLine)}</p>
        </div>
      </article>`,
  ).join('');
}

// ---------------------------------------------------------------
// 4 — 7-day strip
// ---------------------------------------------------------------
function renderWeekStrip(): void {
  const root = document.getElementById('ts-week');
  if (!root) return;
  root.innerHTML = TRIP.days
    .map(
      (d, i) => `
      <a class="ts-week-card" href="itinerary.html#${escapeHtml(d.id)}">
        <div class="ts-week-num">Day ${i + 1}</div>
        <div class="ts-week-date">${escapeHtml(d.dateLabel)}</div>
        <div class="ts-week-headline">${escapeHtml(d.headline)}</div>
        <div class="ts-week-meta">
          <span>🏠 ${escapeHtml(SLEEP_LABEL[d.sleepWhere])}</span>
          <span>🌅 ${escapeHtml(d.sunset.time)}</span>
        </div>
        ${d.tarabridgeMoment ? '<div class="ts-week-peak">⭐ Peak moment</div>' : ''}
      </a>`,
    )
    .join('');
}

// ---------------------------------------------------------------
// Boot
// ---------------------------------------------------------------
function boot(): void {
  bindWhyShort();
  renderStays();
  renderPlaces();
  renderSunsets();
  renderWeekStrip();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
