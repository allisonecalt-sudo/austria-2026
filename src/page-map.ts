/**
 * page-map.ts — Leaflet bird's-eye map for the full Austria 2026 trip.
 *
 * Renders:
 *   - 13 nature destinations (color-coded by region: salzkammergut /
 *     berchtesgaden / hohe-tauern)
 *   - 22+ lodging picks (color-coded by base: salzburg-shabbat / obertraun
 *     / airport / berchtesgaden / wolfgangsee)
 *   - Salzburg airport (rental-car pickup + Friday 5am departure)
 *   - Chabad Salzburg (Shabbat home, Linzergasse 76)
 *   - Jewish sights (Judengasse, IKG, cemetery, Mauthausen)
 *
 * Features (refresh 2026-05-17 — map-interactivity-genius pass):
 *   - Filter chip strip above map (replaces default L.control.layers)
 *   - Sidebar drawer on desktop / slide-over on mobile — every pin
 *     listed, searchable, click → flyTo + openPopup (cluster-safe via
 *     zoomToShowLayer callback)
 *   - Day-route polyline toggle — animated 7-segment trip shape
 *   - Two-pin distance line (shift-click two rows in sidebar)
 *   - Collapsible legend (default open desktop, collapsed mobile)
 *   - Richer popups: photo slot + drive-time row + close affordance
 *   - "Find" mini-toolbar: Chabad / Schafbergspitze / Airport
 *
 * Coordinates source: NATURE_COORDS / LODGING_COORDS / STANDALONE_POIS in
 * trip-data.ts.
 *
 * Design spec: MAP_INTERACTIVITY_RESEARCH.md (created same day).
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
// Leaflet ambient types — Leaflet itself is loaded via CDN <script> in
// map.html. Declared narrowly here rather than depending on
// @types/leaflet (avoids devDep + version drift).
// =====================================================================
interface LMap {
  setView(center: [number, number], zoom: number): LMap;
  fitBounds(bounds: LBounds, opts?: { padding?: [number, number] }): LMap;
  flyTo(center: [number, number], zoom: number, opts?: { duration?: number }): LMap;
  addLayer(layer: unknown): LMap;
  removeLayer(layer: unknown): LMap;
  hasLayer(layer: unknown): boolean;
  invalidateSize(): void;
  on(event: string, fn: (e: unknown) => void): void;
}
interface LBounds {
  extend(latLng: [number, number]): LBounds;
  isValid(): boolean;
}
interface LMarker {
  bindPopup(html: string, opts?: { maxWidth?: number; className?: string }): LMarker;
  bindTooltip(html: string, opts?: Record<string, unknown>): LMarker;
  addTo(layer: unknown): LMarker;
  openPopup(): LMarker;
  closePopup(): LMarker;
  getLatLng(): { lat: number; lng: number };
  setIcon(icon: unknown): LMarker;
  getElement(): HTMLElement | null;
}
interface LClusterGroup {
  addLayer(layer: unknown): LClusterGroup;
  addTo(map: LMap): LClusterGroup;
  zoomToShowLayer(marker: LMarker, callback: () => void): void;
}
interface LLayerGroup {
  addLayer(layer: unknown): LLayerGroup;
  removeLayer(layer: unknown): LLayerGroup;
  clearLayers(): LLayerGroup;
  addTo(map: LMap): LLayerGroup;
}
interface LPolyline {
  addTo(layer: unknown): LPolyline;
  setStyle(opts: Record<string, unknown>): LPolyline;
  setLatLngs(latLngs: Array<[number, number]>): LPolyline;
  remove(): LPolyline;
  bindTooltip(html: string, opts?: Record<string, unknown>): LPolyline;
}
interface LDivIconOpts {
  html: string;
  className: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor?: [number, number];
}
interface LeafletStatic {
  map(id: string, opts?: { zoomControl?: boolean; scrollWheelZoom?: boolean }): LMap;
  tileLayer(url: string, opts: { attribution: string; maxZoom: number }): { addTo(m: LMap): void };
  marker(latLng: [number, number], opts?: { icon?: unknown; zIndexOffset?: number }): LMarker;
  divIcon(opts: LDivIconOpts): unknown;
  latLngBounds(latLngs: Array<[number, number]>): LBounds;
  polyline(latLngs: Array<[number, number]>, opts?: Record<string, unknown>): LPolyline;
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
  DomEvent: {
    disableClickPropagation(el: HTMLElement): void;
    disableScrollPropagation(el: HTMLElement): void;
  };
  markerClusterGroup(opts?: {
    showCoverageOnHover?: boolean;
    maxClusterRadius?: number;
    disableClusteringAtZoom?: number;
  }): LClusterGroup;
  layerGroup(): LLayerGroup;
}

declare global {
  interface Window {
    L: LeafletStatic;
  }
}

// =====================================================================
// Pin styling — color-coded divIcons via inline HTML. No image files.
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

type GroupKey = 'nature' | 'lodging' | 'other';
type RegionKey = 'salzkammergut' | 'berchtesgaden' | 'hohe-tauern' | null;

const PIN_COLORS: Record<PinCategory, string> = {
  'nature-salzkammergut': '#2f7a4f', // green (matches --green-deep)
  'nature-berchtesgaden': '#2d6a8f', // blue (matches --blue-lake)
  'nature-hohe-tauern': '#9b5fa5', // purple (distinct from gold lodging)
  'lodging-salzburg': '#d4a017', // gold (Shabbat base)
  'lodging-obertraun': '#0aa39e', // teal
  'lodging-airport': '#7f8c95', // gray
  'lodging-berchtesgaden': '#c8482c', // red
  'lodging-wolfgangsee': '#e87b1c', // orange
  airport: '#1c1c1c',
  chabad: '#0033a0',
  jewish: '#5d6d76',
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

function makeSchafbergSummitIcon(): unknown {
  const html = `
    <div class="leaflet-pin leaflet-pin--summit-sleep" style="background:#b9892a;color:#fff;">
      <span class="pin-glyph">🏔</span>
    </div>
    <div class="leaflet-pin-label leaflet-pin-label--summit-sleep">SLEEP · Wed</div>
  `;
  return window.L.divIcon({
    html,
    className: 'leaflet-pin-wrapper',
    iconSize: [44, 56],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

// =====================================================================
// Popup HTML — name + drive-time row + close affordance + actions.
// =====================================================================

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function popupClose(): string {
  return '<button type="button" class="pop-close" aria-label="Close popup" data-pop-close>✕</button>';
}

function naturePopup(d: NatureDestination): string {
  const regionLabel =
    d.region === 'salzkammergut'
      ? 'Salzkammergut · Austria'
      : d.region === 'berchtesgaden'
        ? 'Berchtesgaden · Germany'
        : 'Hohe Tauern · Austria';
  const isSchafberg = d.id === 'schafbergspitze';
  const sleepBadge = isSchafberg
    ? '<span class="pop-badge pop-badge-summit-sleep">🏔 SLEEP HERE Wed Jul 29 → Thu Jul 30</span>'
    : '';
  const lockedBadge = d.lockedDay
    ? `<span class="pop-badge pop-badge-locked">✓ ${escapeHtml(d.lockedDay)}</span>`
    : '';
  const summitExtra = isSchafberg
    ? '<div class="pop-desc pop-desc--sleep"><strong>Berghotel Schafbergspitze</strong> · 1,783m · €155.80 pp incl. cog + breakfast. BOOK direct 2-3 weeks ahead: +43 6138 35 42 · <a href="https://schafberg.net/en/" target="_blank" rel="noreferrer noopener">schafberg.net</a></div>'
    : '';
  return `
    <div class="pop${isSchafberg ? ' pop--summit-sleep' : ''}">
      ${popupClose()}
      <div class="pop-cat">${regionLabel}</div>
      <div class="pop-title">${escapeHtml(d.name)}</div>
      <div class="pop-desc">${escapeHtml(d.feature)}</div>
      ${summitExtra}
      <div class="pop-drive">
        <span class="pop-drive-pill">SZG ${d.fromSalzburgMin}m</span>
        <span class="pop-drive-pill">Hallstatt ${d.fromHallstattMin}m</span>
      </div>
      ${sleepBadge}${lockedBadge}
      <div class="pop-actions">
        <a class="pop-link" href="nature-destinations.html#${encodeURIComponent(d.id)}">View details →</a>
        ${isSchafberg ? '<a class="pop-link pop-link-secondary" href="stay.html#sunset-schafbergspitze-stay">Summit stay info →</a>' : ''}
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
  stayAnchor: string;
}

function lodgingPopup(l: LodgingPinInput): string {
  return `
    <div class="pop">
      ${popupClose()}
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
      ${popupClose()}
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
// (Berchtesgaden + Wolfgangsee). De-duplicate by name.
// =====================================================================

function gatherLodging(): LodgingPinInput[] {
  const seen = new Set<string>();
  const out: LodgingPinInput[] = [];

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
    if (baseKey === 'hallstatt') return 'Mountain anchor · 3-night midweek (Sun-Wed)';
    return 'Airport-area · Thu-Fri pre-flight';
  };

  const push = (input: LodgingPinInput): void => {
    if (seen.has(input.name)) return;
    seen.add(input.name);
    out.push(input);
  };

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

  for (const cfg of BASE_CONFIGS) {
    if (cfg.id !== 'berchtesgaden' && cfg.id !== 'wolfgangsee') continue;
    const cat: PinCategory =
      cfg.id === 'berchtesgaden' ? 'lodging-berchtesgaden' : 'lodging-wolfgangsee';
    const label =
      cfg.id === 'berchtesgaden'
        ? 'Berchtesgaden / Ramsau · Config B option'
        : 'St. Wolfgang / Strobl · Config C option';
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
// Pin registry — unified record of every marker for sidebar / filter.
// =====================================================================

interface PinEntry {
  id: string;
  name: string;
  group: GroupKey;
  category: PinCategory;
  region: RegionKey;
  subLabel: string;
  marker: LMarker;
  coord: { lat: number; lng: number };
  layerOwner: LClusterGroup | LLayerGroup;
  isCluster: boolean;
}

// =====================================================================
// Day-route polyline — 7-day shape, animated reveal.
// Sequence + colour-by-day for the locked v1 itinerary:
//   Fri  arrive SZG → Salzburg (Linzergasse)
//   Sat  Salzburg (Shabbat — no drive)
//   Sun  Salzburg → Obertraun, side-trip Gosausee
//   Mon  Obertraun → Hallstatt + Krippenstein (local)
//   Tue  Obertraun → Königssee (peak Bavaria day)
//   Wed  Obertraun → St. Wolfgang → Schafbergspitze summit (sleep up)
//   Thu  Schafberg → Werfen → airport apt
//   Fri  airport apt → SZG (depart 5am)
// =====================================================================

interface DaySegment {
  day: string;
  color: string;
  fromKey: string;
  toKey: string;
  label: string;
}

function getDaySegments(): DaySegment[] {
  return [
    {
      day: 'Fri arrive',
      color: '#0033a0',
      fromKey: 'airport',
      toKey: 'salzburg',
      label: 'SZG → Salzburg · ~15 min',
    },
    {
      day: 'Sun',
      color: '#2f7a4f',
      fromKey: 'salzburg',
      toKey: 'gosausee',
      label: 'Salzburg → Gosausee · ~80 min',
    },
    {
      day: 'Sun pm',
      color: '#2f7a4f',
      fromKey: 'gosausee',
      toKey: 'obertraun',
      label: 'Gosausee → Obertraun · ~35 min',
    },
    {
      day: 'Mon',
      color: '#0aa39e',
      fromKey: 'obertraun',
      toKey: 'krippenstein',
      label: 'Obertraun → Krippenstein 5fingers · local',
    },
    {
      day: 'Tue',
      color: '#2d6a8f',
      fromKey: 'obertraun',
      toKey: 'konigssee',
      label: 'Obertraun → Königssee · ~1h15',
    },
    {
      day: 'Wed',
      color: '#b9892a',
      fromKey: 'obertraun',
      toKey: 'schafberg',
      label: 'Obertraun → Schafbergspitze summit · cog up',
    },
    {
      day: 'Thu',
      color: '#9b5fa5',
      fromKey: 'schafberg',
      toKey: 'werfen',
      label: 'Schafberg → Werfen · ice cave',
    },
    {
      day: 'Thu pm',
      color: '#9b5fa5',
      fromKey: 'werfen',
      toKey: 'airportApt',
      label: 'Werfen → airport apt · ~1h',
    },
    {
      day: 'Fri depart',
      color: '#5d6d76',
      fromKey: 'airportApt',
      toKey: 'airport',
      label: 'Airport apt → SZG · ~15 min',
    },
  ];
}

function getRouteAnchors(): Record<string, [number, number]> {
  const linz = LODGING_COORDS['master Linzergasse'];
  const edel = LODGING_COORDS['Haus Edelweiss (Obertraun)'];
  const hapi = LODGING_COORDS['Hapimag Ferienwohnungen Salzburg'];
  const airport = STANDALONE_POIS.find((p) => p.id === 'salzburg-airport');
  return {
    airport: airport ? [airport.lat, airport.lng] : [47.7933, 13.0043],
    salzburg: linz ? [linz.lat, linz.lng] : [47.8049, 13.0476],
    obertraun: edel ? [edel.lat, edel.lng] : [47.5497, 13.6892],
    airportApt: hapi ? [hapi.lat, hapi.lng] : [47.8164, 13.0014],
    gosausee: [NATURE_COORDS.gosausee.lat, NATURE_COORDS.gosausee.lng],
    krippenstein: [
      NATURE_COORDS['krippenstein-5fingers'].lat,
      NATURE_COORDS['krippenstein-5fingers'].lng,
    ],
    konigssee: [NATURE_COORDS.konigssee.lat, NATURE_COORDS.konigssee.lng],
    schafberg: [NATURE_COORDS.schafbergspitze.lat, NATURE_COORDS.schafbergspitze.lng],
    werfen: [NATURE_COORDS['eisriesenwelt-werfen'].lat, NATURE_COORDS['eisriesenwelt-werfen'].lng],
  };
}

// =====================================================================
// Haversine — straight-line distance + naive drive-time estimate for
// the "shift-click two pins" measurement. Motorway average 75 km/h.
// =====================================================================

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function estimateDriveMinutes(km: number): number {
  // 75 km/h average — alpine roads aren't all motorway, so haversine
  // straight-line × 1.4 detour factor / 75 km/h. Always rounded up.
  const detour = km * 1.4;
  return Math.ceil((detour / 75) * 60);
}

// =====================================================================
// Boot
// =====================================================================

function whenLeafletReady(cb: () => void): void {
  const tick = (): void => {
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
  const map = L.map('map', { scrollWheelZoom: false, zoomControl: true }).setView([47.65, 13.2], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  // === Layer groups ===
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
  const otherLayer = L.layerGroup();

  // Route + distance overlay layers — separate so toggles don't fight.
  const routeLayer = L.layerGroup();
  const measureLayer = L.layerGroup();

  const allLatLngs: Array<[number, number]> = [];
  const pinRegistry: PinEntry[] = [];

  // Helper: register a pin so the sidebar + filters can find it.
  const register = (entry: PinEntry): void => {
    pinRegistry.push(entry);
  };

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
    const isSchafbergSleep = dest.id === 'schafbergspitze';
    const icon = isSchafbergSleep ? makeSchafbergSummitIcon() : makePinIcon(cat);
    const marker = L.marker([coord.lat, coord.lng], {
      icon,
      zIndexOffset: isSchafbergSleep ? 800 : undefined,
    })
      .bindPopup(naturePopup(dest), { maxWidth: 300, className: 'leaflet-popup-trip' })
      .bindTooltip(escapeHtml(dest.name), { direction: 'top', offset: [0, -16] });
    natureLayer.addLayer(marker);
    allLatLngs.push([coord.lat, coord.lng]);
    natureCount += 1;
    register({
      id: `nature-${dest.id}`,
      name: dest.name,
      group: 'nature',
      category: cat,
      region: dest.region as RegionKey,
      subLabel: `${PIN_LABEL[cat]} · SZG ${dest.fromSalzburgMin}m · Hallstatt ${dest.fromHallstattMin}m`,
      marker,
      coord,
      layerOwner: natureLayer,
      isCluster: true,
    });
  }

  // === Lodging ===
  const lodging = gatherLodging();
  for (const l of lodging) {
    const marker = L.marker([l.coord.lat, l.coord.lng], { icon: makePinIcon(l.category) })
      .bindPopup(lodgingPopup(l), { maxWidth: 300, className: 'leaflet-popup-trip' })
      .bindTooltip(escapeHtml(l.name), { direction: 'top', offset: [0, -16] });
    lodgingLayer.addLayer(marker);
    allLatLngs.push([l.coord.lat, l.coord.lng]);
    register({
      id: `lodging-${l.stayAnchor}`,
      name: l.name,
      group: 'lodging',
      category: l.category,
      region: null,
      subLabel: `${PIN_LABEL[l.category]} · ${l.pricePerNight}`,
      marker,
      coord: l.coord,
      layerOwner: lodgingLayer,
      isCluster: true,
    });
  }

  // === Standalone POIs (airport, Chabad, Jewish sights) ===
  let airportCount = 0;
  let chabadCount = 0;
  let jewishCount = 0;
  let chabadMarker: LMarker | null = null;
  let airportMarker: LMarker | null = null;
  for (const poi of STANDALONE_POIS) {
    const cat: PinCategory =
      poi.category === 'airport' ? 'airport' : poi.category === 'chabad' ? 'chabad' : 'jewish';
    if (poi.category === 'airport') airportCount += 1;
    else if (poi.category === 'chabad') chabadCount += 1;
    else jewishCount += 1;
    const zOffset = cat === 'chabad' ? 1000 : 0;
    const marker = L.marker([poi.lat, poi.lng], {
      icon: makePinIcon(cat),
      zIndexOffset: zOffset,
    })
      .bindPopup(poiPopup(poi), { maxWidth: 270, className: 'leaflet-popup-trip' })
      .bindTooltip(escapeHtml(poi.name), { direction: 'top', offset: [0, -16] });
    otherLayer.addLayer(marker);
    allLatLngs.push([poi.lat, poi.lng]);
    if (cat === 'chabad') chabadMarker = marker;
    if (cat === 'airport') airportMarker = marker;
    register({
      id: `other-${poi.id}`,
      name: poi.name,
      group: 'other',
      category: cat,
      region: null,
      subLabel: PIN_LABEL[cat],
      marker,
      coord: { lat: poi.lat, lng: poi.lng },
      layerOwner: otherLayer,
      isCluster: false,
    });
  }

  // Add all layers on by default
  natureLayer.addTo(map);
  lodgingLayer.addTo(map);
  otherLayer.addTo(map);

  // === Legend (collapsible — bottom-right) ===
  const Legend = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: (): HTMLElement => {
      const div = L.DomUtil.create('div', 'map-legend-box');
      const startOpen = window.matchMedia('(min-width: 900px)').matches;
      div.classList.toggle('is-open', startOpen);
      div.innerHTML = `
        <button type="button" class="lg-toggle" aria-label="Toggle map legend" aria-expanded="${startOpen ? 'true' : 'false'}">
          <span class="lg-toggle-label">Legend</span>
          <span class="lg-toggle-icon" aria-hidden="true">${startOpen ? '▾' : '▸'}</span>
        </button>
        <div class="lg-body">
          <div class="lg-section"><strong>Nature</strong></div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['nature-salzkammergut']}"></span>Salzkammergut (AT)</div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['nature-berchtesgaden']}"></span>Berchtesgaden (DE)</div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['nature-hohe-tauern']}"></span>Hohe Tauern (AT)</div>
          <div class="lg-section"><strong>Lodging ⌂</strong></div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-salzburg']}"></span>Salzburg · Shabbat</div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-obertraun']}"></span>Obertraun · 4-night</div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-berchtesgaden']}"></span>Berchtesgaden · Config B</div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-wolfgangsee']}"></span>St. Wolfgang · Config C</div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['lodging-airport']}"></span>Airport · last night</div>
          <div class="lg-section"><strong>Other</strong></div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['airport']};color:#fff">✈</span>Salzburg Airport</div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['chabad']};color:#ffd700">✡</span>Chabad Salzburg</div>
          <div class="lg-row"><span class="lg-dot" style="background:${PIN_COLORS['jewish']};color:#fff">✡</span>Jewish sights</div>
        </div>
      `;
      const toggle = div.querySelector<HTMLButtonElement>('.lg-toggle');
      toggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !div.classList.contains('is-open');
        div.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        const iconEl = toggle.querySelector('.lg-toggle-icon');
        if (iconEl) iconEl.textContent = open ? '▾' : '▸';
      });
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      return div;
    },
  });
  new Legend().addTo(map);

  // === "Find" mini-toolbar (top-left) — Chabad / Schafberg / Airport ===
  interface FindEntry {
    label: string;
    glyph: string;
    cls: string;
    marker: LMarker;
    zoom: number;
  }
  const findRaw: Array<{
    label: string;
    glyph: string;
    cls: string;
    marker: LMarker | null;
    zoom: number;
  }> = [
    { label: 'Find Chabad', glyph: '✡', cls: 'fc-chabad', marker: chabadMarker, zoom: 15 },
    {
      label: 'Find Sleep · Schafberg',
      glyph: '🏔',
      cls: 'fc-summit',
      marker: pinRegistry.find((p) => p.id === 'nature-schafbergspitze')?.marker ?? null,
      zoom: 13,
    },
    { label: 'Find Airport', glyph: '✈', cls: 'fc-airport', marker: airportMarker, zoom: 13 },
  ];
  const findEntries: FindEntry[] = findRaw
    .filter((e): e is typeof e & { marker: LMarker } => e.marker !== null)
    .map((e) => ({ ...e, marker: e.marker }));

  if (findEntries.length > 0) {
    const FindBar = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: (): HTMLElement => {
        const div = L.DomUtil.create('div', 'leaflet-bar map-find-bar');
        div.innerHTML = findEntries
          .map(
            (e) => `
            <a href="#" role="button" class="${e.cls}" aria-label="${escapeHtml(e.label)}">
              <span class="fc-star">${e.glyph}</span>
              <span class="fc-label">${escapeHtml(e.label)}</span>
            </a>
          `,
          )
          .join('');
        const links = div.querySelectorAll<HTMLAnchorElement>('a');
        links.forEach((link, i) => {
          link.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const entry = findEntries[i];
            if (!entry) return;
            const ll = entry.marker.getLatLng();
            map.flyTo([ll.lat, ll.lng], entry.zoom, { duration: 0.8 });
            window.setTimeout(() => entry.marker.openPopup(), 900);
          });
        });
        L.DomEvent.disableClickPropagation(div);
        return div;
      },
    });
    new FindBar().addTo(map);
  }

  // === Filter chip strip (toolbar above map) — wire to layers + registry ===
  const layerOn: Record<GroupKey, boolean> = { nature: true, lodging: true, other: true };
  const regionOn: Record<'salzkammergut' | 'berchtesgaden' | 'hohe-tauern', boolean> = {
    salzkammergut: true,
    berchtesgaden: true,
    'hohe-tauern': true,
  };

  function applyLayerVisibility(): void {
    if (layerOn.nature) {
      if (!map.hasLayer(natureLayer)) map.addLayer(natureLayer);
    } else if (map.hasLayer(natureLayer)) map.removeLayer(natureLayer);
    if (layerOn.lodging) {
      if (!map.hasLayer(lodgingLayer)) map.addLayer(lodgingLayer);
    } else if (map.hasLayer(lodgingLayer)) map.removeLayer(lodgingLayer);
    if (layerOn.other) {
      if (!map.hasLayer(otherLayer)) map.addLayer(otherLayer);
    } else if (map.hasLayer(otherLayer)) map.removeLayer(otherLayer);
    applyRegionFilter();
    renderSidebar();
  }

  function applyRegionFilter(): void {
    // For nature pins: add/remove each marker from natureLayer based on
    // whether its region's chip is on. This is cheap for 13 markers.
    for (const entry of pinRegistry) {
      if (entry.group !== 'nature' || !entry.region) continue;
      const wanted = regionOn[entry.region];
      const owner = entry.layerOwner as unknown as {
        hasLayer(m: unknown): boolean;
        addLayer(m: unknown): void;
        removeLayer(m: unknown): void;
      };
      if (wanted) {
        if (!owner.hasLayer(entry.marker)) owner.addLayer(entry.marker);
      } else if (owner.hasLayer(entry.marker)) {
        owner.removeLayer(entry.marker);
      }
    }
  }

  document.querySelectorAll<HTMLButtonElement>('.map-chip[data-layer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const layer = btn.dataset.layer as GroupKey;
      const next = !(layerOn[layer] ?? true);
      layerOn[layer] = next;
      btn.setAttribute('aria-pressed', next ? 'true' : 'false');
      applyLayerVisibility();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('.map-chip[data-region]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const region = btn.dataset.region as 'salzkammergut' | 'berchtesgaden' | 'hohe-tauern';
      const next = !(regionOn[region] ?? true);
      regionOn[region] = next;
      btn.setAttribute('aria-pressed', next ? 'true' : 'false');
      applyRegionFilter();
      renderSidebar();
    });
  });

  // === Day-route toggle — animated polyline reveal ===
  let routeShown = false;
  function clearRoute(): void {
    routeLayer.clearLayers();
    if (map.hasLayer(routeLayer)) map.removeLayer(routeLayer);
  }
  function showRoute(): void {
    routeLayer.clearLayers();
    const anchors = getRouteAnchors();
    const segments = getDaySegments();
    if (!map.hasLayer(routeLayer)) routeLayer.addTo(map);
    // Reveal each segment with a brief stagger so the eye traces the
    // shape rather than the whole thing flashing on at once.
    segments.forEach((seg, i) => {
      const from = anchors[seg.fromKey];
      const to = anchors[seg.toKey];
      if (!from || !to) {
        console.warn(`[map] route segment missing anchor: ${seg.fromKey}→${seg.toKey}`);
        return;
      }
      window.setTimeout(() => {
        if (!routeShown) return; // race-safe — user toggled off mid-animation
        const line = L.polyline([from, to], {
          color: seg.color,
          weight: 4,
          opacity: 0.85,
          dashArray: '10 6',
          lineCap: 'round',
          interactive: true,
        }).addTo(routeLayer);
        line.bindTooltip(`<strong>${escapeHtml(seg.day)}</strong><br/>${escapeHtml(seg.label)}`, {
          sticky: true,
          direction: 'top',
        });
      }, i * 140);
    });
  }

  const routeBtn = document.querySelector<HTMLButtonElement>('.map-chip[data-toggle="day-route"]');
  routeBtn?.addEventListener('click', () => {
    routeShown = !routeShown;
    routeBtn.setAttribute('aria-pressed', routeShown ? 'true' : 'false');
    routeBtn.classList.toggle('is-active', routeShown);
    if (routeShown) showRoute();
    else clearRoute();
  });

  // === Sidebar — searchable filterable list of every pin ===
  measureLayer.addTo(map);
  const sidebar = document.getElementById('map-sidebar');
  const sidebarList = document.getElementById('map-sidebar-list');
  const sidebarSearch = document.getElementById('map-sidebar-search') as HTMLInputElement | null;
  const sidebarToggleBtn = document.querySelector<HTMLButtonElement>(
    '.map-chip[data-toggle="sidebar"]',
  );
  const sidebarCloseBtn = document.querySelector<HTMLButtonElement>(
    '.map-sidebar-close[data-close="sidebar"]',
  );

  // Two-pin distance measurement.
  let measureSelection: PinEntry[] = [];
  let measureLine: LPolyline | null = null;
  function clearMeasure(): void {
    measureLayer.clearLayers();
    measureLine = null;
    measureSelection = [];
    document
      .querySelectorAll('.map-sidebar-row.is-measured')
      .forEach((el) => el.classList.remove('is-measured'));
  }
  function pushMeasure(entry: PinEntry, rowEl: HTMLElement): void {
    if (measureSelection.some((e) => e.id === entry.id)) {
      measureSelection = measureSelection.filter((e) => e.id !== entry.id);
      rowEl.classList.remove('is-measured');
      if (measureLine) {
        measureLine.remove();
        measureLine = null;
      }
      return;
    }
    if (measureSelection.length >= 2) {
      // Replace the older selection (FIFO so 3rd click rotates).
      const dropped = measureSelection.shift();
      if (dropped) {
        document
          .querySelector(`.map-sidebar-row[data-pin="${dropped.id}"]`)
          ?.classList.remove('is-measured');
      }
      if (measureLine) {
        measureLine.remove();
        measureLine = null;
      }
    }
    measureSelection.push(entry);
    rowEl.classList.add('is-measured');
    if (measureSelection.length === 2) {
      const a: [number, number] = [measureSelection[0].coord.lat, measureSelection[0].coord.lng];
      const b: [number, number] = [measureSelection[1].coord.lat, measureSelection[1].coord.lng];
      const km = haversineKm(a, b);
      const mins = estimateDriveMinutes(km);
      measureLine = L.polyline([a, b], {
        color: '#0033a0',
        weight: 3,
        opacity: 0.8,
        dashArray: '4 6',
        interactive: true,
      }).addTo(measureLayer);
      measureLine.bindTooltip(
        `<strong>≈ ${km.toFixed(1)} km</strong><br/>≈ ${mins} min driving (motorway avg)`,
        { sticky: true, direction: 'top' },
      );
    }
  }

  function renderSidebar(): void {
    if (!sidebarList) return;
    const q = (sidebarSearch?.value ?? '').trim().toLowerCase();
    const visible = pinRegistry.filter((p) => {
      if (!layerOn[p.group]) return false;
      if (p.group === 'nature' && p.region && !regionOn[p.region]) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.subLabel.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    const groups: Array<{ key: GroupKey; label: string }> = [
      { key: 'nature', label: 'Nature' },
      { key: 'lodging', label: 'Lodging' },
      { key: 'other', label: 'Airport · Chabad · Jewish' },
    ];
    let html = '';
    let any = false;
    for (const g of groups) {
      const rows = visible.filter((v) => v.group === g.key);
      if (rows.length === 0) continue;
      any = true;
      html += `<div class="map-sidebar-group"><h3>${escapeHtml(g.label)} <span class="map-sidebar-count">${rows.length}</span></h3>`;
      for (const row of rows) {
        const color = PIN_COLORS[row.category];
        html += `
          <button type="button" class="map-sidebar-row" data-pin="${escapeHtml(row.id)}">
            <span class="map-sidebar-dot" style="background:${color}"></span>
            <span class="map-sidebar-text">
              <span class="map-sidebar-name">${escapeHtml(row.name)}</span>
              <span class="map-sidebar-sub">${escapeHtml(row.subLabel)}</span>
            </span>
          </button>
        `;
      }
      html += '</div>';
    }
    if (!any) {
      html = '<p class="map-sidebar-empty">No pins match this filter.</p>';
    }
    sidebarList.innerHTML = html;

    sidebarList.querySelectorAll<HTMLButtonElement>('.map-sidebar-row').forEach((rowEl) => {
      const id = rowEl.dataset.pin;
      const entry = pinRegistry.find((p) => p.id === id);
      if (!entry) return;
      rowEl.addEventListener('mouseenter', () => {
        const el = entry.marker.getElement();
        if (el) el.classList.add('leaflet-pin-highlighted');
      });
      rowEl.addEventListener('mouseleave', () => {
        const el = entry.marker.getElement();
        if (el) el.classList.remove('leaflet-pin-highlighted');
      });
      rowEl.addEventListener('click', (ev) => {
        if (ev.shiftKey) {
          ev.preventDefault();
          pushMeasure(entry, rowEl);
          return;
        }
        // Single click → fly + open popup. Cluster-safe via zoomToShowLayer.
        if (entry.isCluster) {
          const cluster = entry.layerOwner as LClusterGroup;
          cluster.zoomToShowLayer(entry.marker, () => entry.marker.openPopup());
        } else {
          const ll = entry.marker.getLatLng();
          map.flyTo([ll.lat, ll.lng], 14, { duration: 0.6 });
          window.setTimeout(() => entry.marker.openPopup(), 700);
        }
        // Mobile: close drawer after click
        if (window.matchMedia('(max-width: 899px)').matches) {
          sidebar?.classList.remove('is-open');
          sidebarToggleBtn?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  sidebarSearch?.addEventListener('input', renderSidebar);
  sidebarToggleBtn?.addEventListener('click', () => {
    const open = !sidebar?.classList.contains('is-open');
    sidebar?.classList.toggle('is-open', open);
    sidebarToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  sidebarCloseBtn?.addEventListener('click', () => {
    sidebar?.classList.remove('is-open');
    sidebarToggleBtn?.setAttribute('aria-expanded', 'false');
    if (measureSelection.length > 0) clearMeasure();
  });

  // === Popup close affordance (event delegation on map container) ===
  el.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    if (target.matches('[data-pop-close]')) {
      ev.preventDefault();
      // Find the open popup and close every marker that owns it.
      pinRegistry.forEach((p) => p.marker.closePopup());
    }
  });

  // === Fit bounds to show every pin ===
  if (allLatLngs.length > 0) {
    const bounds = L.latLngBounds(allLatLngs);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  window.setTimeout(() => map.invalidateSize(), 250);

  // === Initial sidebar render ===
  renderSidebar();

  // === Stats line ===
  const statsEl = document.getElementById('map-stats');
  if (statsEl) {
    const total = natureCount + lodging.length + airportCount + chabadCount + jewishCount;
    statsEl.innerHTML = `<strong>${total} pins</strong> on the map · ${natureCount} nature · ${lodging.length} lodging · ${airportCount} airport · ${chabadCount} Chabad · ${jewishCount} Jewish sight${jewishCount === 1 ? '' : 's'}. Use filter chips above to focus · open <strong>List view</strong> to search · toggle <strong>Show 7-day route</strong> for the trip shape · shift-click two list rows to draw a distance line.`;
    statsEl.title = `Categories: ${Object.values(PIN_LABEL).join(' · ')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  whenLeafletReady(bootMap);
});
