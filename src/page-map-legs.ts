/**
 * page-map-legs.ts — Per-leg mini-maps for map.html
 *
 * Allison + Avital asked for per-leg detail maps so they can see where
 * each candidate lodging sits relative to the activities for that leg.
 * Allison Tue May 19 14:45: "maybe make a map of all locations we want
 * to visit near leg so get idea of where town is".
 *
 * Renders 4 small Leaflet maps below the existing 4-cluster overview on
 * map.html (does NOT replace or coordinate with page-map.ts — fully
 * standalone). Each leg map shows:
 *   - Lodging candidates as house-icon pins, color-coded:
 *       blue   = Allison's pick
 *       purple = Avital's pick
 *       gold   = current leading pick (marked with `lead: true`)
 *       gray   = bonus / rejected (de-emphasised)
 *   - Activity pins as green mountain-icon pins
 *   - Popups with name + town + walk/drive to anchor
 *   - fitBounds to all markers with 10% padding
 *
 * Coordinates are inlined here rather than pulled from trip-data.ts
 * because most leg-candidate coords are NEW (broad-search agent results
 * that haven't been added to trip-data yet — May 19, 2026). When the
 * broad-search lodging picks land in trip-data, this file can be
 * refactored to read from there.
 */

// =====================================================================
// Leaflet ambient types — kept narrow (CDN load via map.html, no
// @types/leaflet dependency, parallel approach to page-map.ts).
// =====================================================================
interface LegLMap {
  setView(center: [number, number], zoom: number): LegLMap;
  fitBounds(bounds: LegLBounds, opts?: { padding?: [number, number] }): LegLMap;
  invalidateSize(): void;
  on(event: string, fn: (e: unknown) => void): void;
}
interface LegLBounds {
  extend(latLng: [number, number]): LegLBounds;
  isValid(): boolean;
}
interface LegLMarker {
  bindPopup(html: string, opts?: { maxWidth?: number; className?: string }): LegLMarker;
  bindTooltip(html: string, opts?: Record<string, unknown>): LegLMarker;
  addTo(layer: unknown): LegLMarker;
}
interface LegLeafletStatic {
  map(id: string, opts?: { zoomControl?: boolean; scrollWheelZoom?: boolean }): LegLMap;
  tileLayer(
    url: string,
    opts: { attribution: string; maxZoom: number },
  ): { addTo(m: LegLMap): void };
  marker(latLng: [number, number], opts?: { icon?: unknown; zIndexOffset?: number }): LegLMarker;
  divIcon(opts: {
    html: string;
    className: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
    popupAnchor?: [number, number];
  }): unknown;
  latLngBounds(latLngs: Array<[number, number]>): LegLBounds;
}

// =====================================================================
// Data — per-leg lodging + activity coordinates with leader-pick flags.
// =====================================================================

type LodgingTag = 'allison' | 'avital' | 'lead' | 'bonus' | 'rejected';

interface LegLodging {
  name: string;
  town: string;
  lat: number;
  lng: number;
  tags: LodgingTag[]; // first tag drives icon color; lead overrides
  note?: string; // shown in popup + legend list
}

interface LegActivity {
  name: string;
  lat: number;
  lng: number;
  note?: string;
}

interface Leg {
  id: string;
  title: string;
  dates: string;
  summary: string;
  zoom: number;
  lodging: LegLodging[];
  activities: LegActivity[];
}

const LEGS: Leg[] = [
  {
    id: 'salzburg',
    title: 'Anchor #1 — Salzburg (Shabbat)',
    dates: 'Fri Jul 24 → Sun Jul 26',
    summary: 'Chabad-walkable Shabbat + Old Town · Hohensalzburg · Mirabell · Mönchsberg',
    zoom: 13,
    // 2026-06-08: 2 current apartment options, not yet decided (no default pick).
    // Villa Salzburg removed (canceled — electronic-only door code, no physical
    // key = a Shabbat dealbreaker). Food is cooked in the apartment, so a stovetop
    // is the decider.
    lodging: [
      {
        name: 'Amedeo Zotti Residence',
        town: 'Schallmoos (near the train station)',
        lat: 47.8156,
        lng: 13.0506,
        tags: ['allison'],
        note: '$628 · stovetop kitchen · partial A/C · ~26 min to Chabad',
      },
      {
        name: 'Master Linzergasse',
        town: 'Old-town edge (Andräviertel)',
        lat: 47.8049,
        lng: 13.0476,
        tags: ['allison'],
        note: '$657 · no stove · A/C + elevator · ~3 min to Chabad (best location)',
      },
    ],
    activities: [
      {
        name: 'Chabad of Salzburg',
        lat: 47.8009,
        lng: 13.0497,
        note: 'Linzergasse 76 · Shabbat anchor',
      },
      {
        name: 'Salzburg Old Town / Mozart Geburtshaus',
        lat: 47.8009,
        lng: 13.0436,
      },
      {
        name: 'Festung Hohensalzburg',
        lat: 47.795,
        lng: 13.048,
      },
      {
        name: 'Mirabellplatz / Mirabell Gardens',
        lat: 47.8061,
        lng: 13.0428,
      },
      {
        name: 'Mönchsberg lift',
        lat: 47.7965,
        lng: 13.0394,
      },
      {
        name: 'Salzburg Airport SZG',
        lat: 47.7933,
        lng: 13.0043,
        note: 'Arrival Friday',
      },
    ],
  },
  {
    id: 'zell',
    title: 'Anchor #2 — Zell am See',
    dates: 'Sun Jul 26 → Tue Jul 28',
    summary: 'Schmittenhöhe + Kitzsteinhorn glacier + Krimml + Grossglockner',
    zoom: 11,
    lodging: [
      {
        name: 'der Sonnberg Alpinlodges',
        town: 'Sonnbergstraße 57a (hillside above town)',
        lat: 47.327,
        lng: 12.799,
        tags: ['lead'],
        note: '✓ Booked & confirmed · €498 / 2 nt · private sauna · ~1.1 km / 15-min walk to lake & town',
      },
    ],
    activities: [
      {
        name: 'Schmittenhöhe cable car base',
        lat: 47.3252,
        lng: 12.795,
        note: 'Zell town centre',
      },
      {
        name: 'Schmittenhöhe summit',
        lat: 47.3325,
        lng: 12.7383,
        note: 'Top of the cable car · panoramic',
      },
      {
        name: 'Kitzsteinhorn glacier base',
        lat: 47.27,
        lng: 12.69,
        note: 'Kaprun · year-round glacier',
      },
      {
        name: 'Krimml Falls',
        lat: 47.21,
        lng: 12.17,
        note: 'Highest waterfall in Austria',
      },
      {
        name: 'Grossglockner High Alpine Road entry',
        lat: 47.22,
        lng: 12.83,
        note: 'Fusch toll-road start',
      },
      {
        name: 'Zell am See lake walk',
        lat: 47.32,
        lng: 12.79,
      },
    ],
  },
  {
    id: 'salzkammergut',
    title: 'Anchor #3 — Salzkammergut (Gosau / Aussee)',
    dates: 'Tue Jul 28 → Thu Jul 30',
    summary: 'Hallstatt + Krippenstein + Gosausee + Altausseer · the lake cluster',
    zoom: 10,
    lodging: [
      {
        name: 'Transylvania Villa & Spa',
        town: 'Gosau village',
        lat: 47.5849,
        lng: 13.5312,
        tags: ['lead'],
        note: '✓ Booked · €535 / 2 nt · full kitchen + Finnish sauna + infrared spa · 14 min to Gosausee',
      },
    ],
    activities: [
      {
        name: 'Hallstatt village',
        lat: 47.5622,
        lng: 13.6492,
        note: 'Lakeside Markt',
      },
      {
        name: 'Gosausee Vorderer (mirror lake)',
        lat: 47.539,
        lng: 13.485,
        note: '10 min from Gosau village',
      },
      {
        name: 'Krippenstein cable car base',
        lat: 47.547,
        lng: 13.701,
        note: 'Obertraun',
      },
      {
        name: '5 Fingers viewpoint',
        lat: 47.516,
        lng: 13.696,
        note: 'Krippenstein summit · cantilever',
      },
      {
        name: 'Dachstein Eishöhle',
        lat: 47.515,
        lng: 13.69,
        note: 'Ice cave',
      },
      {
        name: 'Altausseer See',
        lat: 47.643,
        lng: 13.787,
      },
      {
        name: 'Bad Aussee town',
        lat: 47.609,
        lng: 13.785,
      },
      {
        name: 'Schafberg cog station',
        lat: 47.74,
        lng: 13.45,
        note: 'St. Wolfgang · optional day-trip',
      },
    ],
  },
  {
    id: 'airport',
    title: 'Anchor #4 — Salzburg Airport (last night)',
    dates: 'Thu Jul 30 → Fri Jul 31',
    summary: 'Buffer night before Friday 08:55 departure (LY5194)',
    zoom: 12,
    lodging: [
      {
        name: 'Best Western Hotel am Walserberg',
        town: 'Zollstrasse 4, Wals-Siezenheim (~5 km from SZG)',
        lat: 47.7969,
        lng: 12.9647,
        tags: ['lead'],
        note: '✓ Booked · €120.15 / 1 nt · 06:00 checkout for the 08:55 flight',
      },
    ],
    activities: [
      {
        name: 'Salzburg Airport SZG terminal',
        lat: 47.7933,
        lng: 13.0043,
        note: 'Friday 08:55 LY5194 departure',
      },
      {
        name: 'Old Town (evening visit)',
        lat: 47.8009,
        lng: 13.0436,
        note: 'Optional Thursday-evening detour',
      },
    ],
  },
];

// =====================================================================
// Pin styling — minimal divIcon, doesn't need to match the main map's
// icon set 1:1. House glyph for lodging, mountain glyph for activities.
// =====================================================================

const LODGING_COLOR: Record<LodgingTag, string> = {
  allison: '#2a6cb5', // blue
  avital: '#7e3f9b', // purple
  lead: '#d4a017', // gold — same as Shabbat base for visual continuity
  bonus: '#7f8c95', // gray
  rejected: '#b5b5b5', // de-emphasised
};

const LODGING_LABEL: Record<LodgingTag, string> = {
  allison: "Allison's pick",
  avital: "Avital's pick",
  lead: 'Leading pick ★',
  bonus: 'Bonus tier',
  rejected: 'Rejected',
};

function primaryTag(tags: LodgingTag[]): LodgingTag {
  // lead always wins; otherwise first tag.
  if (tags.includes('lead')) return 'lead';
  if (tags.includes('rejected')) return 'rejected';
  if (tags.includes('bonus')) return 'bonus';
  if (tags.includes('avital')) return 'avital';
  return 'allison';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function lodgingIcon(L: LegLeafletStatic, tags: LodgingTag[]): unknown {
  const tag = primaryTag(tags);
  const color = LODGING_COLOR[tag];
  const isLead = tag === 'lead';
  const glyph = isLead ? '★' : '⌂';
  const size: [number, number] = isLead ? [32, 32] : [26, 26];
  const anchor: [number, number] = isLead ? [16, 16] : [13, 13];
  const popupAnchor: [number, number] = isLead ? [0, -16] : [0, -13];
  const html = `
    <div class="leg-map-pin leg-map-pin--lodging leg-map-pin--${tag}" style="background:${color}">
      <span class="leg-map-pin-glyph">${glyph}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'leg-map-pin-wrapper',
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor,
  });
}

function activityIcon(L: LegLeafletStatic): unknown {
  const html = `
    <div class="leg-map-pin leg-map-pin--activity" style="background:#2f7a4f">
      <span class="leg-map-pin-glyph">🏔</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'leg-map-pin-wrapper',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

function lodgingPopup(lodging: LegLodging): string {
  const tag = primaryTag(lodging.tags);
  const tagLabel = LODGING_LABEL[tag];
  const extraNote = lodging.note
    ? `<div class="leg-map-pop-note">${escapeHtml(lodging.note)}</div>`
    : '';
  return `
    <div class="leg-map-pop">
      <div class="leg-map-pop-cat leg-map-pop-cat--${tag}">🛏️ ${escapeHtml(tagLabel)}</div>
      <div class="leg-map-pop-title">${escapeHtml(lodging.name)}</div>
      <div class="leg-map-pop-town">${escapeHtml(lodging.town)}</div>
      ${extraNote}
    </div>
  `;
}

function activityPopup(activity: LegActivity): string {
  const extraNote = activity.note
    ? `<div class="leg-map-pop-note">${escapeHtml(activity.note)}</div>`
    : '';
  return `
    <div class="leg-map-pop">
      <div class="leg-map-pop-cat leg-map-pop-cat--activity">🏔 Activity</div>
      <div class="leg-map-pop-title">${escapeHtml(activity.name)}</div>
      ${extraNote}
    </div>
  `;
}

// =====================================================================
// Render — one section header + one Leaflet map + one legend per leg.
// =====================================================================

function renderLeg(L: LegLeafletStatic, leg: Leg): void {
  const mapEl = document.getElementById(`leg-map-${leg.id}`);
  if (!mapEl) {
    console.warn(`[leg-maps] missing #leg-map-${leg.id}`);
    return;
  }
  const map = L.map(`leg-map-${leg.id}`, { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  const allCoords: Array<[number, number]> = [];

  for (const a of leg.activities) {
    L.marker([a.lat, a.lng], { icon: activityIcon(L) })
      .bindPopup(activityPopup(a), { maxWidth: 240, className: 'leg-map-pop-wrapper' })
      .bindTooltip(a.name, {
        direction: 'top',
        offset: [0, -10] as unknown as Record<string, unknown>,
      })
      .addTo(map);
    allCoords.push([a.lat, a.lng]);
  }

  for (const lo of leg.lodging) {
    const tag = primaryTag(lo.tags);
    const zIndex = tag === 'lead' ? 1000 : tag === 'rejected' || tag === 'bonus' ? -100 : 0;
    L.marker([lo.lat, lo.lng], { icon: lodgingIcon(L, lo.tags), zIndexOffset: zIndex })
      .bindPopup(lodgingPopup(lo), { maxWidth: 260, className: 'leg-map-pop-wrapper' })
      .bindTooltip(lo.name, {
        direction: 'top',
        offset: [0, -10] as unknown as Record<string, unknown>,
      })
      .addTo(map);
    allCoords.push([lo.lat, lo.lng]);
  }

  if (allCoords.length > 0) {
    const bounds = L.latLngBounds(allCoords);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [28, 28] });
    } else {
      map.setView(allCoords[0], leg.zoom);
    }
  }

  // Force a re-measure once layout settles. Mini-maps inside a long
  // scrolling page sometimes init with 0px height if their parent
  // wasn't visible at boot.
  window.setTimeout(() => map.invalidateSize(), 200);
}

function whenLeafletReady(cb: (L: LegLeafletStatic) => void): void {
  const deadline = Date.now() + 8000;
  const tick = (): void => {
    const L = (window as unknown as { L?: LegLeafletStatic }).L;
    if (L) {
      cb(L);
      return;
    }
    if (Date.now() > deadline) {
      console.warn('[leg-maps] Leaflet never loaded — skipping per-leg maps');
      return;
    }
    window.setTimeout(tick, 30);
  };
  tick();
}

function bootLegMaps(): void {
  whenLeafletReady((L) => {
    for (const leg of LEGS) {
      try {
        renderLeg(L, leg);
      } catch (err) {
        console.error(`[leg-maps] failed to render leg ${leg.id}:`, err);
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootLegMaps);
} else {
  bootLegMaps();
}
