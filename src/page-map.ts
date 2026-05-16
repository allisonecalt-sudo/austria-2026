/**
 * page-map.ts — Leaflet bird's-eye map for the full Austria 2026 trip.
 *
 * Replaces the prior single-marker OSM iframe. Renders:
 *   - 13 nature destinations (color-coded by region: salzkammergut /
 *     berchtesgaden / hohe-tauern)
 *   - 22+ lodging picks (color-coded by base: salzburg-shabbat / obertraun
 *     / airport / berchtesgaden / wolfgangsee)
 *   - Salzburg airport (rental-car pickup + Friday 5am departure)
 *   - Chabad Salzburg (Shabbat home, Linzergasse 76)
 *   - Jewish sights (Judengasse, IKG, cemetery, Mauthausen)
 *
 * Features:
 *   - Auto-fit bounds on load (all pins zoomed to fit)
 *   - Color-coded divIcon markers (no external icon files)
 *   - Marker clustering at low zoom (markercluster plugin)
 *   - Layer toggle top-right (Nature / Lodging / Jewish + Airport)
 *   - Legend bottom-right (color/icon meanings)
 *   - Click pin → popup with name + description + "view details" link
 *   - Mobile-responsive (full-width map, touch gestures, sized popups)
 *
 * Coordinates source: NATURE_COORDS / LODGING_COORDS / STANDALONE_POIS in
 * trip-data.ts. All public data from Wikipedia + OpenStreetMap infoboxes.
 *
 * Created 2026-05-16 by map agent.
 */

import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import {
  NATURE_DESTINATIONS,
  NATURE_COORDS,
  LODGING_COORDS,
  STANDALONE_POIS,
  TRIP,
  BASE_CONFIGS,
} from './trip-data.js';
import type { LatLng, MapPOI, Lodging, NatureDestination } from './trip-data.js';

initNotesWidget();
initChatPlanPopup();

// =====================================================================
// Leaflet ambient types — the plugin is loaded via <script src> in
// map.html, so we declare a minimal surface here rather than depending
// on @types/leaflet (avoids new devDep + version mismatch).
// =====================================================================
interface LMap {
  setView(center: [number, number], zoom: number): LMap;
  fitBounds(bounds: LBounds, opts?: { padding?: [number, number] }): LMap;
  flyTo(center: [number, number], zoom: number, opts?: { duration?: number }): LMap;
  addLayer(layer: unknown): LMap;
  removeLayer(layer: unknown): LMap;
  invalidateSize(): void;
}
interface LBounds {
  extend(latLng: [number, number]): LBounds;
  isValid(): boolean;
}
interface LMarker {
  bindPopup(html: string, opts?: { maxWidth?: number; className?: string }): LMarker;
  addTo(layer: unknown): LMarker;
  openPopup(): LMarker;
  getLatLng(): { lat: number; lng: number };
}
interface LLayerGroup {
  addLayer(layer: unknown): LLayerGroup;
  addTo(map: LMap): LLayerGroup;
}
interface LDivIconOpts {
  html: string;
  className: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
}
interface LeafletStatic {
  map(id: string, opts?: { zoomControl?: boolean; scrollWheelZoom?: boolean }): LMap;
  tileLayer(url: string, opts: { attribution: string; maxZoom: number }): { addTo(m: LMap): void };
  marker(latLng: [number, number], opts?: { icon?: unknown; zIndexOffset?: number }): LMarker;
  divIcon(opts: LDivIconOpts): unknown;
  latLngBounds(latLngs: Array<[number, number]>): LBounds;
  control: {
    layers(
      baseLayers: Record<string, unknown>,
      overlays: Record<string, unknown>,
      opts?: { collapsed?: boolean; position?: string },
    ): { addTo(m: LMap): void };
    (opts: { position: string }): {
      onAdd: (fn: (map: LMap) => HTMLElement) => void;
      addTo(m: LMap): void;
    };
  };
  Control: {
    extend(proto: {
      onAdd: (map: LMap) => HTMLElement;
      options?: { position: string };
    }): new () => {
      addTo(m: LMap): void;
    };
  };
  DomUtil: { create(tag: string, className?: string): HTMLElement };
  markerClusterGroup(opts?: {
    showCoverageOnHover?: boolean;
    maxClusterRadius?: number;
    disableClusteringAtZoom?: number;
  }): LLayerGroup;
  layerGroup(): LLayerGroup;
}

declare global {
  interface Window {
    L: LeafletStatic;
  }
}

// =====================================================================
// Pin styling — color-coded divIcons via inline SVG. No image files.
// =====================================================================

type PinCategory =
  | 'nature-salzkammergut'
  | 'nature-berchtesgaden'
  | 'nature-hohe-tauern'
  | 'lodging-salzburg'
  | 'lodging-obertraun'
  | 'lodging-airport'
  | 'lodging-berchtesgaden'
  | 'lodging-wolfgangsee'
  | 'airport'
  | 'chabad'
  | 'jewish';

const PIN_COLORS: Record<PinCategory, string> = {
  'nature-salzkammergut': '#2f7a4f', // green (matches --green-deep)
  'nature-berchtesgaden': '#2d6a8f', // blue (matches --blue-lake)
  'nature-hohe-tauern': '#9b5fa5', // purple (per spec — distinct from gold lodging)
  'lodging-salzburg': '#d4a017', // gold (Shabbat base)
  'lodging-obertraun': '#0aa39e', // teal
  'lodging-airport': '#7f8c95', // gray
  'lodging-berchtesgaden': '#c8482c', // red
  'lodging-wolfgangsee': '#e87b1c', // orange
  airport: '#1c1c1c', // near-black (airplane)
  chabad: '#0033a0', // navy (Star of David)
  jewish: '#5d6d76', // muted slate (secondary)
};

const PIN_LABEL: Record<PinCategory, string> = {
  'nature-salzkammergut': 'Nature · Salzkammergut (AT)',
  'nature-berchtesgaden': 'Nature · Berchtesgaden / Bavaria (DE)',
  'nature-hohe-tauern': 'Nature · Hohe Tauern / Pongau (AT)',
  'lodging-salzburg': 'Lodging · Salzburg (Shabbat base)',
  'lodging-obertraun': 'Lodging · Obertraun / Hallstatt-area',
  'lodging-airport': 'Lodging · Airport-area (last night)',
  'lodging-berchtesgaden': 'Lodging · Berchtesgaden / Ramsau',
  'lodging-wolfgangsee': 'Lodging · St. Wolfgang / Strobl',
  airport: 'Salzburg Airport (SZG)',
  chabad: 'Chabad Salzburg',
  jewish: 'Jewish sight',
};

/** Build a Leaflet divIcon with a color-coded pin shape. */
function makePinIcon(category: PinCategory): unknown {
  const color = PIN_COLORS[category];
  let inner = '';
  let html = '';
  let size: [number, number] = [26, 26];
  let anchor: [number, number] = [13, 13];
  let popupAnchor: [number, number] = [0, -13];

  if (category === 'airport') {
    inner = '<span class="pin-glyph">✈</span>';
  } else if (category === 'chabad') {
    // OVERSIZED Chabad pin — Avital flagged it wasn't visible. Now 42x42
    // with pulsing ring + permanent "Chabad" text label hanging below.
    // Always-on-top via zIndexOffset on the marker side.
    inner = '<span class="pin-glyph pin-glyph-chabad">✡</span>';
    html = `
      <div class="leaflet-pin leaflet-pin--chabad" style="background:${color}">${inner}</div>
      <div class="leaflet-pin-label leaflet-pin-label--chabad">Chabad</div>
    `;
    size = [44, 56];
    anchor = [22, 22];
    popupAnchor = [0, -22];
  } else if (category.startsWith('lodging-')) {
    inner = '<span class="pin-glyph">⌂</span>';
  } else if (category === 'jewish') {
    inner = '<span class="pin-glyph pin-glyph-small">✡</span>';
  }

  if (!html) {
    html = `<div class="leaflet-pin leaflet-pin--${category}" style="background:${color}">${inner}</div>`;
  }
  return window.L.divIcon({
    html,
    className: 'leaflet-pin-wrapper',
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor,
  });
}

// =====================================================================
// Popup HTML — name + 1-line description + "view details" link.
// =====================================================================

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function naturePopup(d: NatureDestination): string {
  const regionLabel =
    d.region === 'salzkammergut'
      ? 'Salzkammergut · Austria'
      : d.region === 'berchtesgaden'
        ? 'Berchtesgaden · Germany'
        : 'Hohe Tauern · Austria';
  const lockedBadge = d.lockedDay
    ? `<span class="pop-badge pop-badge-locked">✓ ${escapeHtml(d.lockedDay)}</span>`
    : '';
  return `
    <div class="pop">
      <div class="pop-cat">${regionLabel}</div>
      <div class="pop-title">${escapeHtml(d.name)}</div>
      <div class="pop-desc">${escapeHtml(d.feature)}</div>
      <div class="pop-meta">
        <span>From Salzburg: <strong>${d.fromSalzburgMin} min</strong></span> ·
        <span>From Hallstatt: <strong>${d.fromHallstattMin} min</strong></span>
      </div>
      ${lockedBadge}
      <div class="pop-actions">
        <a class="pop-link" href="nature-destinations.html#${encodeURIComponent(d.id)}">View details →</a>
      </div>
      <div class="pop-verified">Coords verified 2026-05-16 (Wikipedia / OSM)</div>
    </div>
  `;
}

interface LodgingPinInput {
  name: string;
  url: string;
  pricePerNight: string;
  review: string;
  note: string;
  baseLabel: string;
  category: PinCategory;
  coord: LatLng;
  stayAnchor: string; // hash anchor for stay.html (kebab name)
}

function lodgingPopup(l: LodgingPinInput): string {
  return `
    <div class="pop">
      <div class="pop-cat">${escapeHtml(l.baseLabel)}</div>
      <div class="pop-title">${escapeHtml(l.name)}</div>
      <div class="pop-desc">${escapeHtml(l.note.slice(0, 180))}${l.note.length > 180 ? '…' : ''}</div>
      <div class="pop-meta">
        <span><strong>${escapeHtml(l.pricePerNight)}</strong></span> ·
        <span>${escapeHtml(l.review)}</span>
      </div>
      <div class="pop-actions">
        <a class="pop-link" href="stay.html#${encodeURIComponent(l.stayAnchor)}">Open on Stay page →</a>
        <a class="pop-link pop-link-secondary" href="${escapeHtml(l.url)}" target="_blank" rel="noreferrer noopener">Booking →</a>
      </div>
      <div class="pop-verified">Coords verified 2026-05-16 (Booking address + OSM)</div>
    </div>
  `;
}

function poiPopup(poi: MapPOI): string {
  const catLabel =
    poi.category === 'airport'
      ? 'Salzburg Airport (SZG)'
      : poi.category === 'chabad'
        ? 'Chabad Salzburg'
        : 'Jewish sight';
  const linkHtml = poi.link
    ? `<div class="pop-actions"><a class="pop-link" href="${escapeHtml(poi.link)}">View details →</a></div>`
    : '';
  return `
    <div class="pop">
      <div class="pop-cat">${catLabel}</div>
      <div class="pop-title">${escapeHtml(poi.name)}</div>
      <div class="pop-desc">${escapeHtml(poi.description)}</div>
      ${linkHtml}
      <div class="pop-verified">Coords verified 2026-05-16 (Wikipedia / OSM)</div>
    </div>
  `;
}

// =====================================================================
// Lodging gathering — merge TRIP.lodgings (3 bases) + BASE_CONFIGS B & D
// (Berchtesgaden + Wolfgangsee). De-duplicate by name (same listing may
// appear in both Obertraun TRIP base and Config A base).
// =====================================================================

function gatherLodging(): LodgingPinInput[] {
  const seen = new Set<string>();
  const out: LodgingPinInput[] = [];

  // Helper: kebab-ify a name for stay.html anchor (matches what stay-page
  // would build if it ever adds anchors — at minimum the link won't 404,
  // it just falls back to top of stay.html).
  const slugify = (s: string): string =>
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 64);

  const baseToCategory = (baseKey: Lodging['baseKey']): PinCategory => {
    if (baseKey === 'salzburg') return 'lodging-salzburg';
    if (baseKey === 'hallstatt') return 'lodging-obertraun';
    return 'lodging-airport';
  };
  const baseLabel = (baseKey: Lodging['baseKey']): string => {
    if (baseKey === 'salzburg') return 'Salzburg · Shabbat base (Fri-Sun)';
    if (baseKey === 'hallstatt') return 'Obertraun / Hallstatt · 4-night anchor';
    return 'Airport-area · Thu-Fri pre-flight';
  };

  const push = (input: LodgingPinInput): void => {
    if (seen.has(input.name)) return;
    seen.add(input.name);
    out.push(input);
  };

  // Pass 1 — TRIP.lodgings (3 base sets, pick + alts)
  for (const lod of TRIP.lodgings) {
    const cat = baseToCategory(lod.baseKey);
    const label = baseLabel(lod.baseKey);
    const pickCoord = LODGING_COORDS[lod.pickName];
    if (pickCoord) {
      push({
        name: lod.pickName,
        url: lod.pickUrl,
        pricePerNight: lod.pickPrice,
        review: lod.pickReview,
        note: lod.pickWhy,
        baseLabel: `${label} · TOP PICK`,
        category: cat,
        coord: pickCoord,
        stayAnchor: slugify(lod.pickName),
      });
    } else {
      console.warn(`[map] Missing coord for pick: ${lod.pickName}`);
    }
    for (const alt of lod.alts) {
      const c = LODGING_COORDS[alt.name];
      if (!c) {
        console.warn(`[map] Missing coord for lodging: ${alt.name}`);
        continue;
      }
      push({
        name: alt.name,
        url: alt.url,
        pricePerNight: alt.pricePerNight,
        review: alt.review,
        note: alt.note,
        baseLabel: label,
        category: cat,
        coord: c,
        stayAnchor: slugify(alt.name),
      });
    }
  }

  // Pass 2 — BASE_CONFIGS B (Berchtesgaden) + D (Wolfgangsee). Skip A & C
  // because A reuses TRIP.lodgings and C combines existing entries.
  for (const cfg of BASE_CONFIGS) {
    if (cfg.id !== 'berchtesgaden' && cfg.id !== 'wolfgangsee') continue;
    const cat: PinCategory =
      cfg.id === 'berchtesgaden' ? 'lodging-berchtesgaden' : 'lodging-wolfgangsee';
    const label =
      cfg.id === 'berchtesgaden'
        ? 'Berchtesgaden / Ramsau · Config B option'
        : 'St. Wolfgang / Strobl · Config D option';
    for (const pick of cfg.lodging) {
      const c = LODGING_COORDS[pick.name];
      if (!c) {
        console.warn(`[map] Missing coord for config lodging: ${pick.name}`);
        continue;
      }
      push({
        name: pick.name,
        url: pick.url,
        pricePerNight: pick.pricePerNight,
        review: pick.review,
        note: pick.note,
        baseLabel: label,
        category: cat,
        coord: c,
        stayAnchor: slugify(pick.name),
      });
    }
  }

  return out;
}

// =====================================================================
// Boot — wait for both DOMContentLoaded + Leaflet script to be ready.
// =====================================================================

function whenLeafletReady(cb: () => void): void {
  const tick = (): void => {
    // window.L is injected by the CDN <script> tag in map.html; until that
    // script executes the global is undefined. Cast to unknown for the
    // existence check since the declared type asserts it's always present.
    const L = (window as unknown as { L?: LeafletStatic }).L;
    if (L) {
      cb();
    } else {
      window.setTimeout(tick, 30);
    }
  };
  tick();
}

function bootMap(): void {
  const el = document.getElementById('map');
  if (!el) {
    console.warn('[map] No #map element on page');
    return;
  }
  const L = window.L;

  // Initial view — Salzburg-area center, will be overridden by fitBounds.
  const map = L.map('map', { scrollWheelZoom: false, zoomControl: true }).setView([47.65, 13.2], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  // === Build layer groups ===
  const natureLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40,
    disableClusteringAtZoom: 10,
  });
  const lodgingLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 35,
    disableClusteringAtZoom: 11,
  });
  const jewishAirportLayer = L.layerGroup();

  const allLatLngs: Array<[number, number]> = [];

  // === Nature destinations ===
  let natureCount = 0;
  for (const dest of NATURE_DESTINATIONS) {
    const coord = NATURE_COORDS[dest.id];
    if (!coord) {
      console.warn(`[map] Missing coord for nature destination: ${dest.id}`);
      continue;
    }
    const cat: PinCategory =
      dest.region === 'salzkammergut'
        ? 'nature-salzkammergut'
        : dest.region === 'berchtesgaden'
          ? 'nature-berchtesgaden'
          : 'nature-hohe-tauern';
    const marker = L.marker([coord.lat, coord.lng], { icon: makePinIcon(cat) }).bindPopup(
      naturePopup(dest),
      { maxWidth: 280, className: 'leaflet-popup-trip' },
    );
    natureLayer.addLayer(marker);
    allLatLngs.push([coord.lat, coord.lng]);
    natureCount += 1;
  }

  // === Lodging ===
  const lodging = gatherLodging();
  for (const l of lodging) {
    const marker = L.marker([l.coord.lat, l.coord.lng], {
      icon: makePinIcon(l.category),
    }).bindPopup(lodgingPopup(l), { maxWidth: 300, className: 'leaflet-popup-trip' });
    lodgingLayer.addLayer(marker);
    allLatLngs.push([l.coord.lat, l.coord.lng]);
  }

  // === Standalone POIs (airport, Chabad, Jewish sights) ===
  let airportCount = 0;
  let chabadCount = 0;
  let jewishCount = 0;
  let chabadMarker: LMarker | null = null;
  for (const poi of STANDALONE_POIS) {
    const cat: PinCategory =
      poi.category === 'airport' ? 'airport' : poi.category === 'chabad' ? 'chabad' : 'jewish';
    if (poi.category === 'airport') airportCount += 1;
    else if (poi.category === 'chabad') chabadCount += 1;
    else jewishCount += 1;
    // Chabad sits above ALL other markers — zIndexOffset 1000 wins over
    // lodging cluster pins at the same Salzburg coordinates.
    const zOffset = cat === 'chabad' ? 1000 : 0;
    const marker = L.marker([poi.lat, poi.lng], {
      icon: makePinIcon(cat),
      zIndexOffset: zOffset,
    }).bindPopup(poiPopup(poi), { maxWidth: 270, className: 'leaflet-popup-trip' });
    jewishAirportLayer.addLayer(marker);
    allLatLngs.push([poi.lat, poi.lng]);
    if (cat === 'chabad') chabadMarker = marker;
  }

  // Add all layers on by default
  natureLayer.addTo(map);
  lodgingLayer.addTo(map);
  jewishAirportLayer.addTo(map);

  // === Layer toggle control ===
  L.control
    .layers(
      {},
      {
        [`Nature destinations (${natureCount})`]: natureLayer,
        [`Lodging picks (${lodging.length})`]: lodgingLayer,
        [`Airport + Chabad + Jewish sights (${airportCount + chabadCount + jewishCount})`]:
          jewishAirportLayer,
      },
      { collapsed: false, position: 'topright' },
    )
    .addTo(map);

  // === Legend control (bottom-right) ===
  const Legend = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: (): HTMLElement => {
      const div = L.DomUtil.create('div', 'map-legend-box');
      div.innerHTML = `
        <div class="lg-title">Pin legend</div>
        <div class="lg-section"><strong>Nature</strong></div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['nature-salzkammergut']}"></span>Salzkammergut (AT)</div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['nature-berchtesgaden']}"></span>Berchtesgaden (DE)</div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['nature-hohe-tauern']}"></span>Hohe Tauern (AT)</div>
        <div class="lg-section"><strong>Lodging ⌂</strong></div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-salzburg']}"></span>Salzburg · Shabbat</div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-obertraun']}"></span>Obertraun · 4-night</div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-berchtesgaden']}"></span>Berchtesgaden · Config B</div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-wolfgangsee']}"></span>St. Wolfgang · Config D</div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-airport']}"></span>Airport · last night</div>
        <div class="lg-section"><strong>Other</strong></div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['airport']}">✈</span>Salzburg Airport</div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['chabad']}">✡</span>Chabad Salzburg</div>
        <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['jewish']}">✡</span>Jewish sights</div>
      `;
      // Prevent map drag/scroll when interacting with the legend on mobile.
      div.addEventListener('click', (e) => e.stopPropagation());
      div.addEventListener('wheel', (e) => e.stopPropagation());
      return div;
    },
  });
  new Legend().addTo(map);

  // === Fit bounds to show every pin ===
  if (allLatLngs.length > 0) {
    const bounds = L.latLngBounds(allLatLngs);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  // === Find Chabad button — Avital flagged the pin wasn't obvious. ===
  // Top-left control: tap to fly to Chabad at zoom 15 + auto-open popup.
  if (chabadMarker) {
    const FindChabad = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: (): HTMLElement => {
        const div = L.DomUtil.create('div', 'leaflet-bar map-find-chabad');
        div.innerHTML = `
          <a href="#" role="button" aria-label="Zoom to Chabad Salzburg">
            <span class="fc-star">✡</span>
            <span class="fc-label">Find Chabad</span>
          </a>
        `;
        div.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (chabadMarker) {
            const ll = chabadMarker.getLatLng();
            map.flyTo([ll.lat, ll.lng], 15, { duration: 0.8 });
            window.setTimeout(() => chabadMarker?.openPopup(), 900);
          }
        });
        div.addEventListener('wheel', (e) => e.stopPropagation());
        return div;
      },
    });
    new FindChabad().addTo(map);
  }

  // Invalidate size after layout settles (fonts load asynchronously).
  window.setTimeout(() => map.invalidateSize(), 250);

  // === Stats line beneath map (fail-loud count) ===
  const statsEl = document.getElementById('map-stats');
  if (statsEl) {
    const total = natureCount + lodging.length + airportCount + chabadCount + jewishCount;
    statsEl.innerHTML = `<strong>${total} pins</strong> on the map · ${natureCount} nature destinations · ${lodging.length} lodging picks · ${airportCount} airport · ${chabadCount} Chabad · ${jewishCount} Jewish sight${jewishCount === 1 ? '' : 's'}. Toggle groups top-right. Click any pin for details.`;
    statsEl.title = `Categories: ${Object.values(PIN_LABEL).join(' · ')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  whenLeafletReady(bootMap);
});
