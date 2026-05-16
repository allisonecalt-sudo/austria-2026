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
import { TRIP } from './trip-data.js';
import type { Day, Lodging } from './trip-data.js';

initNotesWidget();

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
    'Friday Jul 24 — Friday Jul 31, 2026. Salzburg for Shabbat, then four deep nights in the Hallstatt-area lakes with day trips out to Königssee, Wolfgangsee, and Werfen. Two moves total. The exact day order can flex around weather + energy.';
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
  const labelMap: Record<Lodging['baseKey'], string> = {
    salzburg: 'Salzburg · Shabbat base',
    hallstatt: 'Obertraun / Hallstatt · the anchor',
    airport: 'Salzburg airport-side · last night',
  };
  return TRIP.lodgings.map((lod) => ({
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
// 2 — Must-see places per day (with sleep + drive-from)
// ---------------------------------------------------------------
interface PlaceRow {
  day: string;
  date: string;
  place: string;
  sleep: string;
  driveFromLabel: string;
}

const SLEEP_LABEL: Record<Day['sleepWhere'], string> = {
  salzburg: 'Salzburg (Linzergasse)',
  hallstatt: 'Obertraun / Hallstatt area',
  airport: 'Salzburg airport-side',
};

function pickPlaceForDay(d: Day): string {
  // Pull the headline as the must-see anchor for each day.
  return d.headline;
}

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
      place: pickPlaceForDay(d),
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
          <div class="ts-place-headline">${escapeHtml(r.place)}</div>
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
    spot: 'Schafberg summit ridge — 13-lake panorama',
    day: 'Wed Jul 29',
    time: '20:48',
    oneLine:
      'Cog rail up to 1,783m. Wolfgangsee, Mondsee, Attersee, Fuschlsee all visible at once. Last train down at 21:15.',
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
      "Five minutes from the apartment door. The arrival sunset — settle in, exhale, watch the lake light up the day you move east.",
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
