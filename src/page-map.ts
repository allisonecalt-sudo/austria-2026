/**
 * page-map.ts — Leaflet bird's-eye map for the full Austria 2026 trip.
 *
 * Renders:
 *   - 21 nature destinations (color-coded by region: salzkammergut /
 *     berchtesgaden / hohe-tauern)
 *   - 36 lodging picks (color-coded by base: salzburg-shabbat / obertraun
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
import { NAV_OPENED_EVENT, NAV_CLOSED_EVENT } from './nav-coordinator.js';
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

// 2026-06-08 reconcile: the 15 archived deep-dive pages were DELETED (site =
// current only). POI `link` fields that pointed at those pages are repointed
// to the live page that now holds the content; the dead #anchor is dropped.
const ARCHIVED_PAGE_HOME: Record<string, string> = {
  'trip-options.html': 'itinerary.html',
  'trip-summary.html': 'itinerary.html',
  'krippenstein.html': 'itinerary.html',
  'bases.html': 'stay.html',
  'shabbat.html': 'logistics.html',
  'friday-salzburg.html': 'logistics.html',
  'sundays-closed.html': 'logistics.html',
  'weather-plan-c.html': 'logistics.html',
  'nature-destinations.html': 'activities.html',
  'top-sunsets.html': 'activities.html',
  'lake-swimming.html': 'activities.html',
  'water-activities.html': 'activities.html',
  'jewish-sights.html': 'activities.html',
  'recommendations.html': 'activities.html',
  'schafbergspitze.html': 'activities.html',
};
function resolvePoiUrl(url: string): string {
  if (/^(https?:|\/|\.\.\/|archive\/)/.test(url)) return url;
  const page = url.split('#')[0];
  return ARCHIVED_PAGE_HOME[page] ?? url;
}

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
    ? `<div class="pop-actions"><a class="pop-link" href="${escapeHtml(resolvePoiUrl(poi.link))}">View details →</a></div>`
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
// Place drawer (added 2026-05-17 by location-interaction agent)
// =====================================================================
//
// Drawer = mobile bottom sheet (70vh) / desktop right rail (380px).
// Renders rich place detail with: photo carousel, badges (sunset, fit,
// hidden-gem, locked-day), drive-time pills, "what people do here"
// bullets pulled from NATURE_DESTINATIONS Logistics-Wave fields, action
// row (Open in Google Maps + View full details + source link), and
// "similar places" footer. Driven by data already in trip-data.ts —
// nothing fabricated.
//
// TODO follow-up agent: a numeric `beautyScore` field on
// NatureDestination would let us render a single 0-10 chip alongside
// sunset/fit. Today we only have `sunset: 1|2|3` + `hiddenGem: boolean`
// which already proxy beauty/uniqueness — render those and leave the
// dedicated score for a data-pass.
//
// Reuses the .lodging-carousel-* selectors (Wave 4b) inside the drawer
// — same swipe/dots/arrows/keyboard nav, just sized smaller.

type DrawerVariant = 'nature' | 'lodging' | 'poi';

interface DrawerSource {
  variant: DrawerVariant;
  id: string;
  photos: string[];
  // The rendered HTML body of the drawer.
  bodyHtml: string;
  // Eyebrow + title shown in the drawer header.
  eyebrow: string;
  title: string;
  // For "open in google maps" external link.
  coord: { lat: number; lng: number };
}

function gmapsLinkForCoord(lat: number, lng: number, label: string): string {
  const q = encodeURIComponent(label);
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(5)},${lng.toFixed(5)}&query_place_id=${q}`;
}

function carouselHtml(photos: string[], alt: string): string {
  // Inline mini-carousel mirroring page-stay's lodgingCarouselHtml but
  // adapted for drawer width. Reuses the .lodging-carousel-* classes so
  // CSS + scroll-snap come for free.
  if (photos.length === 0) {
    return '';
  }
  if (photos.length === 1) {
    return `<div class="place-drawer-carousel"><img class="lodging-carousel__img" loading="eager" decoding="async" src="${escapeHtml(photos[0]!)}" alt="${escapeHtml(alt)}" /></div>`;
  }
  const total = photos.length;
  const slides = photos
    .map((src, i) => {
      const loading = i === 0 ? 'eager' : 'lazy';
      return `<div class="lodging-carousel__slide" data-slide-index="${i}" role="group" aria-roledescription="slide" aria-label="Photo ${i + 1} of ${total}"><img class="lodging-carousel__img" loading="${loading}" decoding="async" src="${escapeHtml(src)}" alt="${escapeHtml(alt)} photo ${i + 1}" /></div>`;
    })
    .join('');
  const dots = photos
    .map(
      (_, i) =>
        `<button type="button" class="lodging-carousel__dot${i === 0 ? ' is-active' : ''}" data-dot-index="${i}" aria-label="Go to photo ${i + 1} of ${total}"></button>`,
    )
    .join('');
  return `
    <div class="place-drawer-carousel">
      <div class="lodging-carousel" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${escapeHtml(alt)} photos">
        <div class="lodging-carousel__track" data-carousel-track>${slides}</div>
        <button type="button" class="lodging-carousel__arrow lodging-carousel__arrow--prev" aria-label="Previous photo" tabindex="-1">◀</button>
        <button type="button" class="lodging-carousel__arrow lodging-carousel__arrow--next" aria-label="Next photo" tabindex="-1">▶</button>
        <div class="lodging-carousel__dots" role="tablist" aria-label="Photo navigation">${dots}</div>
        <span class="lodging-carousel__counter" aria-hidden="true">1 / ${total}</span>
      </div>
    </div>`;
}

function initCarouselsInDrawer(root: ParentNode): void {
  root.querySelectorAll<HTMLDivElement>('.lodging-carousel').forEach((carousel) => {
    if (carousel.dataset.carouselReady === '1') return;
    carousel.dataset.carouselReady = '1';
    const track = carousel.querySelector<HTMLDivElement>('[data-carousel-track]');
    if (!track) return;
    const slides = Array.from(track.querySelectorAll<HTMLDivElement>('.lodging-carousel__slide'));
    const dots = Array.from(carousel.querySelectorAll<HTMLButtonElement>('.lodging-carousel__dot'));
    const counter = carousel.querySelector<HTMLSpanElement>('.lodging-carousel__counter');
    const prevBtn = carousel.querySelector<HTMLButtonElement>('.lodging-carousel__arrow--prev');
    const nextBtn = carousel.querySelector<HTMLButtonElement>('.lodging-carousel__arrow--next');
    if (slides.length < 2) return;
    const goTo = (idx: number, smooth = true): void => {
      const clamped = Math.max(0, Math.min(slides.length - 1, idx));
      const target = slides[clamped];
      if (!target) return;
      track.scrollTo({ left: target.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
    };
    const updateActive = (): void => {
      const scrollLeft = track.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.offsetLeft - scrollLeft);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === best);
      });
      if (counter) counter.textContent = `${best + 1} / ${slides.length}`;
    };
    let scrollTimer: number | null = null;
    track.addEventListener('scroll', () => {
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(updateActive, 60);
    });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goTo(i);
      });
    });
    const currentIndex = (): number => {
      const scrollLeft = track.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.offsetLeft - scrollLeft);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    };
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goTo(currentIndex() - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goTo(currentIndex() + 1);
      });
    }
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(currentIndex() - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(currentIndex() + 1);
      }
    });
    updateActive();
  });
}

function natureTypeLabel(t: NatureDestination['type']): string {
  switch (t) {
    case 'lake':
      return 'Lake';
    case 'gorge':
      return 'Gorge';
    case 'waterfall':
      return 'Waterfall';
    case 'peak':
      return 'Peak';
    case 'cave':
      return 'Cave';
    case 'village':
      return 'Village';
    case 'road':
      return 'Alpine road';
    case 'platform':
      return 'Viewing platform';
    case 'meadow':
      return 'Meadow';
    case 'valley':
      return 'Valley';
  }
}

function regionLabel(r: NatureDestination['region']): string {
  return r === 'salzkammergut'
    ? 'Salzkammergut · Austria'
    : r === 'berchtesgaden'
      ? 'Berchtesgaden · Germany'
      : 'Hohe Tauern · Austria';
}

function natureDrawerSource(d: NatureDestination): DrawerSource {
  const eyebrow = `${natureTypeLabel(d.type)} · ${regionLabel(d.region)}`;
  // Photos: use the carousel `photos[]` if the curation agent filled it,
  // otherwise fall back to the single hero image.
  const photos: string[] =
    d.photos && d.photos.length > 0 ? d.photos : d.hero?.src ? [d.hero.src] : [];
  // Badges: sunset (1-3), avitalFit, hidden-gem, locked-day.
  const sunsetTxt =
    d.sunset === 3 ? '✶✶✶ epic sunset' : d.sunset === 2 ? '✶✶ good sunset' : '✶ light sunset';
  const sunsetBadge = `<span class="place-drawer-badge place-drawer-badge--sunset" title="Sunset grade ${d.sunset}/3">${sunsetTxt}</span>`;
  const fitBadge = d.avitalFitNote
    ? `<span class="place-drawer-badge place-drawer-badge--fit" title="Avital fit (walk-friendliness)">✓ ${escapeHtml(d.avitalFitNote)}</span>`
    : '';
  const hiddenBadge = d.hiddenGem
    ? `<span class="place-drawer-badge place-drawer-badge--hidden" title="Hidden gem — off the beaten path">◇ hidden gem</span>`
    : '';
  const lockedBadge = d.lockedDay
    ? `<span class="place-drawer-badge place-drawer-badge--locked">✓ ${escapeHtml(d.lockedDay)}</span>`
    : '';
  // TODO: when beautyScore field exists, render:
  //   <span class="place-drawer-badge place-drawer-badge--beauty">★ ${score}/10 beauty</span>
  const badges = [sunsetBadge, fitBadge, hiddenBadge, lockedBadge].filter(Boolean).join('');
  // "What people do here" bullets — pulled from existing fields, no fabrication.
  const bullets: string[] = [];
  bullets.push(
    `<li><span class="place-drawer-bullets__icon" aria-hidden="true">🥾</span><span class="place-drawer-bullets__text">${escapeHtml(d.walkNote)}</span></li>`,
  );
  if (d.walkFromParkingMin != null && d.walkFromParkingNote) {
    bullets.push(
      `<li><span class="place-drawer-bullets__icon" aria-hidden="true">🅿️</span><span class="place-drawer-bullets__text"><strong>${d.walkFromParkingMin} min from parking</strong> — ${escapeHtml(d.walkFromParkingNote)}</span></li>`,
    );
  }
  if (d.openingHours) {
    bullets.push(
      `<li><span class="place-drawer-bullets__icon" aria-hidden="true">🕒</span><span class="place-drawer-bullets__text">${escapeHtml(d.openingHours)}</span></li>`,
    );
  }
  if (d.seasonNote) {
    bullets.push(
      `<li><span class="place-drawer-bullets__icon" aria-hidden="true">☀️</span><span class="place-drawer-bullets__text">${escapeHtml(d.seasonNote)}</span></li>`,
    );
  }
  if (d.priceEur != null) {
    const priceTxt =
      d.priceEur === 0
        ? 'Free entry'
        : `€${d.priceEur.toFixed(d.priceEur % 1 === 0 ? 0 : 2)}/person${d.priceNote ? ' · ' + d.priceNote : ''}`;
    bullets.push(
      `<li><span class="place-drawer-bullets__icon" aria-hidden="true">€</span><span class="place-drawer-bullets__text">${escapeHtml(priceTxt)}</span></li>`,
    );
  }
  if (d.accessibilityNote) {
    bullets.push(
      `<li><span class="place-drawer-bullets__icon" aria-hidden="true">♿</span><span class="place-drawer-bullets__text">${escapeHtml(d.accessibilityNote)}</span></li>`,
    );
  }
  if (d.caveat) {
    bullets.push(
      `<li><span class="place-drawer-bullets__icon" aria-hidden="true">⚠️</span><span class="place-drawer-bullets__text"><strong>Heads-up:</strong> ${escapeHtml(d.caveat)}</span></li>`,
    );
  }
  // If after all the above we have nothing concrete, fail-loud per CLAUDE.md.
  const bulletsHtml =
    bullets.length > 0
      ? `<ul class="place-drawer-bullets">${bullets.join('')}</ul>`
      : `<p class="place-drawer-verify-note">Verify activities on arrival — Logistics enrichment pass hasn't covered this destination yet.</p>`;
  const sourceUrl = d.sourceUrl ?? d.links?.official ?? d.links?.wikipedia;
  const sourceHtml = sourceUrl
    ? `<p class="place-drawer-source">Source: <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(new URL(sourceUrl).hostname)}</a> · coords verified 2026-05-16 (Wikipedia / OSM).</p>`
    : `<p class="place-drawer-source"><span class="place-drawer-verify-note">No official source linked yet — verify on arrival.</span></p>`;
  const coord = NATURE_COORDS[d.id];
  const bodyHtml = `
    ${carouselHtml(photos, d.hero?.alt ?? d.name)}
    <p class="place-drawer-feature">${escapeHtml(d.feature)}</p>
    <div class="place-drawer-badges">${badges}</div>
    <div class="place-drawer-drives">
      <div class="place-drawer-drive">
        <div class="place-drawer-drive__label">From Salzburg</div>
        <div class="place-drawer-drive__time">${d.fromSalzburgMin} min</div>
      </div>
      <div class="place-drawer-drive">
        <div class="place-drawer-drive__label">From Hallstatt anchor</div>
        <div class="place-drawer-drive__time">${d.fromHallstattMin} min</div>
      </div>
    </div>
    <div class="place-drawer-section">
      <h3 class="place-drawer-section__title">What people do here</h3>
      ${bulletsHtml}
    </div>
    <div class="place-drawer-actions">
      <a class="place-drawer-action place-drawer-action--primary" href="nature-destinations.html#${encodeURIComponent(d.id)}">View full details →</a>
      <a class="place-drawer-action" href="${escapeHtml(d.links?.mapsFromHallstatt ?? gmapsLinkForCoord(coord?.lat ?? 0, coord?.lng ?? 0, d.name))}" target="_blank" rel="noreferrer noopener">📍 Open in Google Maps</a>
    </div>
    ${sourceHtml}
    <div id="place-drawer-similar"></div>
  `;
  return {
    variant: 'nature',
    id: `nature-${d.id}`,
    photos,
    bodyHtml,
    eyebrow,
    title: d.name,
    coord: { lat: coord?.lat ?? 0, lng: coord?.lng ?? 0 },
  };
}

function lodgingDrawerSource(l: LodgingPinInput): DrawerSource {
  const eyebrow = l.baseLabel;
  const photos: string[] = []; // lodging photos live in trip-data Lodging.photos but
  // map-side LodgingPinInput doesn't currently carry them — render the popup's
  // existing image path via `gallery` would require a wider refactor; the
  // primary discovery + photo flow for lodging is the Stay page. Keep the
  // map drawer minimal: it acts as a wayfinding card with the link out.
  const bodyHtml = `
    <p class="place-drawer-feature">${escapeHtml(l.note)}</p>
    <div class="place-drawer-badges">
      <span class="place-drawer-badge place-drawer-badge--locked">${escapeHtml(l.pricePerNight)}</span>
      <span class="place-drawer-badge place-drawer-badge--fit">${escapeHtml(l.review)}</span>
    </div>
    <div class="place-drawer-actions">
      <a class="place-drawer-action place-drawer-action--primary" href="stay.html#${encodeURIComponent(l.stayAnchor)}">See on Stay page (photos + reviews) →</a>
      <a class="place-drawer-action" href="${escapeHtml(l.url)}" target="_blank" rel="noreferrer noopener">Booking →</a>
      <a class="place-drawer-action" href="${gmapsLinkForCoord(l.coord.lat, l.coord.lng, l.name)}" target="_blank" rel="noreferrer noopener">📍 Open in Google Maps</a>
    </div>
    <p class="place-drawer-source">Coords verified 2026-05-16 (Booking address + OSM). Full photo gallery + Avital's bedroom/kitchen check are on the <a href="stay.html#${encodeURIComponent(l.stayAnchor)}">Stay page</a>.</p>
  `;
  return {
    variant: 'lodging',
    id: `lodging-${l.stayAnchor}`,
    photos,
    bodyHtml,
    eyebrow,
    title: l.name,
    coord: { lat: l.coord.lat, lng: l.coord.lng },
  };
}

function poiDrawerSource(poi: MapPOI): DrawerSource {
  const eyebrow =
    poi.category === 'airport'
      ? 'Salzburg Airport (SZG)'
      : poi.category === 'chabad'
        ? 'Chabad Salzburg'
        : 'Jewish sight';
  const linkRow = poi.link
    ? `<a class="place-drawer-action place-drawer-action--primary" href="${escapeHtml(resolvePoiUrl(poi.link))}">View details →</a>`
    : '';
  const bodyHtml = `
    <p class="place-drawer-feature">${escapeHtml(poi.description)}</p>
    <div class="place-drawer-actions">
      ${linkRow}
      <a class="place-drawer-action" href="${gmapsLinkForCoord(poi.lat, poi.lng, poi.name)}" target="_blank" rel="noreferrer noopener">📍 Open in Google Maps</a>
    </div>
    <p class="place-drawer-source">Coords verified 2026-05-16 (Wikipedia / OSM).</p>
  `;
  return {
    variant: 'poi',
    id: `other-${poi.id}`,
    photos: [],
    bodyHtml,
    eyebrow,
    title: poi.name,
    coord: { lat: poi.lat, lng: poi.lng },
  };
}

// Similar-places algorithm (Pattern 6, Booking.com "Others you may like"):
// 1) Same `type` first (lake → other lakes)
// 2) Then same region
// 3) Then nearest by haversine
// Return up to 3 entries, excluding self.
function similarNatureDestinations(d: NatureDestination, max = 3): NatureDestination[] {
  const here: [number, number] = [NATURE_COORDS[d.id]?.lat ?? 0, NATURE_COORDS[d.id]?.lng ?? 0];
  type Scored = { dest: NatureDestination; score: number; km: number };
  const candidates: Scored[] = [];
  for (const other of NATURE_DESTINATIONS) {
    if (other.id === d.id) continue;
    const oc = NATURE_COORDS[other.id];
    if (!oc) continue;
    const km = haversineKm(here, [oc.lat, oc.lng]);
    // Lower score = better. Type match wins; same region next; distance breaks ties.
    let score = km;
    if (other.type === d.type) score -= 1000;
    if (other.region === d.region) score -= 500;
    candidates.push({ dest: other, score, km });
  }
  candidates.sort((a, b) => a.score - b.score);
  return candidates.slice(0, max).map((c) => c.dest);
}

function similarSectionHtml(d: NatureDestination): string {
  const sims = similarNatureDestinations(d);
  if (sims.length === 0) return '';
  const cards = sims
    .map((s) => {
      const driveLine = `${natureTypeLabel(s.type)} · Hallstatt ${s.fromHallstattMin}m · SZG ${s.fromSalzburgMin}m`;
      const thumb = s.photos && s.photos[0] ? s.photos[0] : (s.hero?.src ?? '');
      return `
      <button type="button" class="map-similar__card" data-similar-id="${escapeHtml(s.id)}" aria-label="Open ${escapeHtml(s.name)}">
        ${thumb ? `<img class="map-similar__thumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(s.name)}" loading="lazy" decoding="async" />` : '<span class="map-similar__thumb" aria-hidden="true"></span>'}
        <span class="map-similar__text">
          <span class="map-similar__name">${escapeHtml(s.name)}</span>
          <span class="map-similar__meta">${escapeHtml(driveLine)}</span>
        </span>
      </button>`;
    })
    .join('');
  return `
    <section class="map-similar" aria-labelledby="map-similar-title">
      <h3 class="map-similar__title" id="map-similar-title">Similar places nearby</h3>
      <div class="map-similar__row">${cards}</div>
    </section>`;
}

// =====================================================================
// Lodging gathering — merge TRIP.lodgings (3 bases) + BASE_CONFIGS B & D
// (Berchtesgaden + Wolfgangsee). De-duplicate by name.
// =====================================================================

function slugifyName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 64);
}

interface GatherLodgingResult {
  withCoord: LodgingPinInput[];
  noCoord: NoCoordEntry[];
}

function gatherLodging(): GatherLodgingResult {
  const seen = new Set<string>();
  const out: LodgingPinInput[] = [];
  const noCoord: NoCoordEntry[] = [];

  // Updated 2026-05-19 for v4 4-base restructure. New baseKeys
  // 'zell-am-see' + 'gosau' both map to the lodging-obertraun visual
  // category (teal) — they're the new "mountain anchor" equivalents and
  // the Leaflet palette only has the one slot. 'salzburg-airport' merges
  // with the legacy 'airport' category.
  const baseToCategory = (baseKey: Lodging['baseKey']): PinCategory => {
    if (baseKey === 'salzburg') return 'lodging-salzburg';
    if (baseKey === 'zell-am-see') return 'lodging-wolfgangsee'; // orange — alpine-lake first half
    if (baseKey === 'gosau') return 'lodging-obertraun'; // teal — Salzkammergut second half
    if (baseKey === 'hallstatt') return 'lodging-obertraun';
    if (baseKey === 'salzburg-airport') return 'lodging-airport';
    return 'lodging-airport';
  };
  const baseLabel = (baseKey: Lodging['baseKey']): string => {
    if (baseKey === 'salzburg') return 'Salzburg · Shabbat base (Sat-Sun)';
    if (baseKey === 'zell-am-see') return 'Zell am See · alpine-lake anchor (Sun-Tue, 2 nights)';
    if (baseKey === 'gosau') return 'Gosau · Salzkammergut lakes anchor (Tue-Thu, 2 nights)';
    if (baseKey === 'hallstatt')
      return 'Mountain anchor · 3-night midweek (Sun-Wed) — ARCHIVED 2026-05-19';
    if (baseKey === 'salzburg-airport') return 'Airport-area · Thu-Fri pre-flight';
    return 'Airport-area · Thu-Fri pre-flight';
  };

  const push = (input: LodgingPinInput): void => {
    if (seen.has(input.name)) return;
    seen.add(input.name);
    out.push(input);
  };

  const noteNoCoord = (name: string, cat: PinCategory, label: string, detailUrl: string): void => {
    if (seen.has(name)) return;
    seen.add(name);
    noCoord.push({
      id: `lodging-nc-${slugifyName(name)}`,
      name,
      group: 'lodging',
      category: cat,
      region: null,
      subLabel: `${label} · no map pin yet — see Stay page`,
      detailUrl,
    });
    // Intentionally no console.warn — these items are surfaced in the
    // sidebar as "(no pin — see list)" rows so they don't silently vanish.
    // The dataset owner adds coords when verified.
  };

  // Allison 2026-05-17 09:00: "never show sold out". Sold-out lodgings are
  // skipped entirely from map pins (matches the same rule applied in
  // page-stay.ts applyFilters + search-index.ts indexLodgings).
  // v4 RESTRUCTURE 2026-05-19: also skip archived 'hallstatt' + legacy
  // 'airport' baseKey blocks (their replacements are zell-am-see + gosau +
  // salzburg-airport). The archived rows still live in TRIP.lodgings for
  // pull-back; they just don't get map pins.
  const ACTIVE_BASE_KEYS: Lodging['baseKey'][] = [
    'salzburg',
    'zell-am-see',
    'gosau',
    'salzburg-airport',
  ];
  for (const lod of TRIP.lodgings) {
    if (!ACTIVE_BASE_KEYS.includes(lod.baseKey)) continue;
    const cat = baseToCategory(lod.baseKey);
    const label = baseLabel(lod.baseKey);
    if (lod.pickAvailability !== 'sold-out') {
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
          stayAnchor: slugifyName(lod.pickName),
        });
      } else {
        noteNoCoord(
          lod.pickName,
          cat,
          `${label} · TOP PICK`,
          `stay.html#${slugifyName(lod.pickName)}`,
        );
      }
    }
    for (const alt of lod.alts.filter((a) => a.availability !== 'sold-out')) {
      const c = LODGING_COORDS[alt.name];
      if (!c) {
        noteNoCoord(alt.name, cat, label, `stay.html#${slugifyName(alt.name)}`);
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
        stayAnchor: slugifyName(alt.name),
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
    for (const pick of cfg.lodging.filter((p) => p.availability !== 'sold-out')) {
      const c = LODGING_COORDS[pick.name];
      if (!c) {
        noteNoCoord(pick.name, cat, label, `stay.html#${slugifyName(pick.name)}`);
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
        stayAnchor: slugifyName(pick.name),
      });
    }
  }

  return { withCoord: out, noCoord };
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

// Items known to the dataset but with no map coord yet — surfaced in the
// sidebar as "(no pin — see details)" rows so they don't silently vanish.
// Replaces the prior console.warn-only path (Avital pointed out the map
// was lying about coverage when 30% of pins were dropped silently).
interface NoCoordEntry {
  id: string;
  name: string;
  group: GroupKey;
  category: PinCategory;
  region: RegionKey;
  subLabel: string;
  detailUrl: string; // page to open with "view details"
}

// =====================================================================
// Day-route polyline — 7-day shape, animated reveal.
// v4 sequence (2026-05-19 restructure — Obertraun + Schafberg + Königssee
// multi-day all dropped after Avital counter-proposal):
//   Fri 24  arrive SZG → Salzburg (Linzergasse)
//   Sat 25  Salzburg (Shabbat — no drive)
//   Sun 26  Salzburg → Zell am See (~1h20)
//   Mon 27  Zell area (Schmittenhöhe / Kitzsteinhorn / Krimml — local)
//   Tue 28  Zell → Bad Ischl → Gosau (~1h45)
//   Wed 29  Gosau → Hallstatt + Krippenstein day-trip (local)
//   Thu 30  Gosau → Salzburg airport area
//   Fri 31  airport apt → SZG (depart ~9am)
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
      day: 'Fri 24 arrive',
      color: '#0033a0',
      fromKey: 'airport',
      toKey: 'salzburg',
      label: 'SZG → Salzburg · ~15 min',
    },
    {
      day: 'Sun 26',
      color: '#2f7a4f',
      fromKey: 'salzburg',
      toKey: 'zell',
      label: 'Salzburg → Zell am See · ~1h20',
    },
    // Mon 27 is a full local day from Zell — no inter-base drive. Optional
    // day-trips (Schmittenhöhe / Kitzsteinhorn / Krimml) are <1h round-trip
    // but live as activity pins, not a route segment. The polyline shape
    // reads cleaner without the local-day loop.
    {
      day: 'Tue 28',
      color: '#2d6a8f',
      fromKey: 'zell',
      toKey: 'gosau',
      label: 'Zell → Gosau (via Bad Ischl) · ~1h45',
    },
    {
      day: 'Wed 29',
      color: '#b9892a',
      fromKey: 'gosau',
      toKey: 'krippenstein',
      label: 'Gosau → Krippenstein cable car · ~25 min',
    },
    {
      day: 'Wed pm',
      color: '#b9892a',
      fromKey: 'krippenstein',
      toKey: 'gosausee',
      label: 'Krippenstein → Gosausee sunset · ~30 min',
    },
    {
      day: 'Thu 30',
      color: '#9b5fa5',
      fromKey: 'gosau',
      toKey: 'airportApt',
      label: 'Gosau → Salzburg airport area · ~1h20',
    },
    {
      day: 'Fri 31 depart',
      color: '#5d6d76',
      fromKey: 'airportApt',
      toKey: 'airport',
      label: 'Best Western am Walserberg → SZG · ~10 min',
    },
  ];
}

function getRouteAnchors(): Record<string, [number, number]> {
  // 2026-06-08: Salzburg is 1 of 2 options, not yet decided (Villa Salzburg
  // removed — canceled). The trip-map anchor uses Amedeo Zotti, falling back to
  // the old-town coord (master Linzergasse), then a hard-coded centroid.
  const salzburgPrimary =
    LODGING_COORDS['Amedeo Zotti Residence Salzburg'] ?? LODGING_COORDS['master Linzergasse'];
  // Chosen stays (booked): Sonnberg (Zell), Transylvania (Gosau), Best Western (airport).
  const zellLodging = LODGING_COORDS['der Sonnberg Alpinlodges (Two-Bedroom)'];
  const gosauLodging = LODGING_COORDS['Transylvania Villa & Spa (Gosau)'];
  const airportLodging = LODGING_COORDS['Best Western Hotel am Walserberg'];
  const airport = STANDALONE_POIS.find((p) => p.id === 'salzburg-airport');
  return {
    airport: airport ? [airport.lat, airport.lng] : [47.7933, 13.0043],
    salzburg: salzburgPrimary ? [salzburgPrimary.lat, salzburgPrimary.lng] : [47.8064, 13.0494],
    zell: zellLodging ? [zellLodging.lat, zellLodging.lng] : [47.3252, 12.795],
    gosau: gosauLodging ? [gosauLodging.lat, gosauLodging.lng] : [47.5856, 13.5286],
    airportApt: airportLodging ? [airportLodging.lat, airportLodging.lng] : [47.79, 12.99],
    gosausee: [NATURE_COORDS.gosausee.lat, NATURE_COORDS.gosausee.lng],
    krippenstein: [
      NATURE_COORDS['krippenstein-5fingers'].lat,
      NATURE_COORDS['krippenstein-5fingers'].lng,
    ],
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

function whenLeafletReady(cb: () => void, onTimeout: (reason: string) => void): void {
  // Cap at 8 seconds. If Leaflet CDN never resolves, fall through to the
  // error banner instead of polling forever (the old behavior was a silent
  // white box — exactly what trashed trust per the empathy-gap report).
  const deadline = Date.now() + 8000;
  const tick = (): void => {
    const L = (window as unknown as { L?: LeafletStatic }).L;
    if (L) {
      cb();
      return;
    }
    if (Date.now() > deadline) {
      onTimeout('Leaflet CDN did not load within 8s — likely network / blocker.');
      return;
    }
    window.setTimeout(tick, 30);
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
  const noCoordRegistry: NoCoordEntry[] = [];

  // Helper: register a pin so the sidebar + filters can find it.
  const register = (entry: PinEntry): void => {
    pinRegistry.push(entry);
  };

  // === Nature destinations ===
  let natureCount = 0;
  for (const dest of NATURE_DESTINATIONS) {
    const coord = NATURE_COORDS[dest.id];
    if (!coord) {
      const cat: PinCategory =
        dest.region === 'salzkammergut'
          ? 'nature-salzkammergut'
          : dest.region === 'berchtesgaden'
            ? 'nature-berchtesgaden'
            : 'nature-hohe-tauern';
      noCoordRegistry.push({
        id: `nature-nc-${dest.id}`,
        name: dest.name,
        group: 'nature',
        category: cat,
        region: dest.region as RegionKey,
        subLabel: `${PIN_LABEL[cat]} · no map pin yet — see details`,
        detailUrl: `nature-destinations.html#${encodeURIComponent(dest.id)}`,
      });
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
  const lodgingResult = gatherLodging();
  const lodging = lodgingResult.withCoord;
  for (const nc of lodgingResult.noCoord) noCoordRegistry.push(nc);
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
    const visibleNoCoord = noCoordRegistry.filter((p) => {
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
      const ncRows = visibleNoCoord.filter((v) => v.group === g.key);
      if (rows.length === 0 && ncRows.length === 0) continue;
      any = true;
      const totalCount = rows.length + ncRows.length;
      const ncSuffix =
        ncRows.length > 0
          ? ` <span class="map-sidebar-nc-count">(${ncRows.length} no-pin)</span>`
          : '';
      html += `<div class="map-sidebar-group"><h3>${escapeHtml(g.label)} <span class="map-sidebar-count">${totalCount}</span>${ncSuffix}</h3>`;
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
      for (const row of ncRows) {
        const color = PIN_COLORS[row.category];
        html += `
          <a class="map-sidebar-row map-sidebar-row--nocoord" href="${escapeHtml(row.detailUrl)}" data-nopin="${escapeHtml(row.id)}" title="Coords not on the map yet — opens details page">
            <span class="map-sidebar-dot map-sidebar-dot--hollow" style="border-color:${color}"></span>
            <span class="map-sidebar-text">
              <span class="map-sidebar-name">${escapeHtml(row.name)} <span class="map-sidebar-nocoord-tag">no pin</span></span>
              <span class="map-sidebar-sub">${escapeHtml(row.subLabel)}</span>
            </span>
          </a>
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
    const ncTotal = noCoordRegistry.length;
    const ncSuffix =
      ncTotal > 0
        ? ` · <strong>${ncTotal} more</strong> in the dataset without map pins yet (find them in <strong>List view</strong> — tagged <em>no pin</em>, link to details).`
        : '';
    statsEl.innerHTML = `<strong>${total} pins</strong> on the map · ${natureCount} nature · ${lodging.length} lodging · ${airportCount} airport · ${chabadCount} Chabad · ${jewishCount} Jewish sight${jewishCount === 1 ? '' : 's'}.${ncSuffix} Use filter chips above to focus · open <strong>List view</strong> to search · toggle <strong>Show 7-day route</strong> for the trip shape · shift-click two list rows to draw a distance line.`;
    statsEl.title = `Categories: ${Object.values(PIN_LABEL).join(' · ')}`;
  }

  // =====================================================================
  // DRAWER + HOVER + DEEP-LINK WIRING (location-interaction agent, 2026-05-17)
  // Done at the end of bootMap so it sees the fully-populated pinRegistry.
  // =====================================================================

  // Build a drawer-source map keyed by pin id. We re-derive nature drawers
  // from NATURE_DESTINATIONS directly (richer data than the registry row),
  // lodging from the gatherLodging result we already have, and POIs from
  // STANDALONE_POIS.
  const drawerSources = new Map<string, DrawerSource>();
  for (const dest of NATURE_DESTINATIONS) {
    if (!NATURE_COORDS[dest.id]) continue;
    drawerSources.set(`nature-${dest.id}`, natureDrawerSource(dest));
  }
  for (const l of lodging) {
    drawerSources.set(`lodging-${l.stayAnchor}`, lodgingDrawerSource(l));
  }
  for (const poi of STANDALONE_POIS) {
    drawerSources.set(`other-${poi.id}`, poiDrawerSource(poi));
  }

  const drawerEl = document.getElementById('place-drawer');
  const drawerBodyEl = document.getElementById('place-drawer-body');
  const drawerTitleEl = document.getElementById('place-drawer-title');
  const drawerEyebrowEl = document.getElementById('place-drawer-eyebrow');
  const drawerCloseBtn = drawerEl?.querySelector<HTMLButtonElement>('[data-close="place-drawer"]');
  const hoverPreviewEl = document.getElementById('place-hover-preview');

  let lastSelectedPinId: string | null = null;
  let lastFocusedBeforeDrawer: HTMLElement | null = null;

  function clearSelectedPin(): void {
    if (!lastSelectedPinId) return;
    const entry = pinRegistry.find((p) => p.id === lastSelectedPinId);
    if (entry) {
      const el = entry.marker.getElement();
      if (el) el.classList.remove('leaflet-pin-selected');
    }
    lastSelectedPinId = null;
  }

  function setSelectedPin(id: string): void {
    clearSelectedPin();
    const entry = pinRegistry.find((p) => p.id === id);
    if (!entry) return;
    const el = entry.marker.getElement();
    if (el) el.classList.add('leaflet-pin-selected');
    lastSelectedPinId = id;
  }

  function closeDrawer(): void {
    if (!drawerEl) return;
    drawerEl.setAttribute('aria-hidden', 'true');
    clearSelectedPin();
    // Restore focus to whatever triggered the open.
    if (lastFocusedBeforeDrawer) {
      try {
        lastFocusedBeforeDrawer.focus();
      } catch {
        /* DOM gone — ignore */
      }
      lastFocusedBeforeDrawer = null;
    }
    // Strip ?focus= so a refresh doesn't reopen.
    if (window.location.search.includes('focus=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('focus');
      window.history.replaceState({}, '', url.toString());
    }
  }

  function openDrawer(pinId: string, opts: { fly?: boolean } = {}): void {
    if (!drawerEl || !drawerBodyEl || !drawerTitleEl || !drawerEyebrowEl) return;
    const src = drawerSources.get(pinId);
    if (!src) return;
    const entry = pinRegistry.find((p) => p.id === pinId);
    lastFocusedBeforeDrawer = (document.activeElement as HTMLElement | null) ?? null;
    drawerEyebrowEl.textContent = src.eyebrow;
    drawerTitleEl.textContent = src.title;
    drawerBodyEl.innerHTML = src.bodyHtml;
    // Inject similar-places footer only for nature pins (lodging belongs on
    // the Stay page).
    const similarMount = drawerBodyEl.querySelector<HTMLDivElement>('#place-drawer-similar');
    if (similarMount && src.variant === 'nature') {
      const destId = pinId.replace(/^nature-/, '');
      const dest = NATURE_DESTINATIONS.find((d) => d.id === destId);
      if (dest) similarMount.innerHTML = similarSectionHtml(dest);
    }
    initCarouselsInDrawer(drawerBodyEl);
    // Wire similar-place card buttons to swap the drawer in place.
    drawerBodyEl.querySelectorAll<HTMLButtonElement>('.map-similar__card').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const simId = btn.dataset.similarId;
        if (!simId) return;
        const targetPinId = `nature-${simId}`;
        const targetEntry = pinRegistry.find((p) => p.id === targetPinId);
        if (targetEntry) {
          map.flyTo([targetEntry.coord.lat, targetEntry.coord.lng], 12, { duration: 0.6 });
        }
        openDrawer(targetPinId, { fly: false });
      });
    });
    drawerEl.setAttribute('aria-hidden', 'false');
    // Scroll drawer body to top — important for similar-place swaps.
    drawerBodyEl.scrollTop = 0;
    if (entry) {
      setSelectedPin(pinId);
      if (opts.fly) {
        map.flyTo([entry.coord.lat, entry.coord.lng], 13, { duration: 0.6 });
      }
    }
    // Move keyboard focus to drawer title region for a11y. Title is not
    // focusable by default, so set tabindex temporarily.
    drawerTitleEl.setAttribute('tabindex', '-1');
    try {
      drawerTitleEl.focus({ preventScroll: true });
    } catch {
      /* older browsers */
    }
  }

  drawerCloseBtn?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && drawerEl?.getAttribute('aria-hidden') === 'false') {
      closeDrawer();
    }
  });

  // === Mobile nav coordination ===
  // When the hamburger menu opens, retract any open map overlays so the
  // slide-over isn't fighting them visually. Restore on nav close ONLY if
  // they were open before — don't surprise-open something the user closed.
  // Triggered by body.nav-mobile-open class via nav-coordinator.ts.
  let sidebarWasOpenBeforeNav = false;
  let drawerWasOpenBeforeNav = false;
  window.addEventListener(NAV_OPENED_EVENT, () => {
    sidebarWasOpenBeforeNav = sidebar?.classList.contains('is-open') ?? false;
    drawerWasOpenBeforeNav = drawerEl?.getAttribute('aria-hidden') === 'false';
    if (sidebarWasOpenBeforeNav) {
      sidebar?.classList.remove('is-open');
      sidebarToggleBtn?.setAttribute('aria-expanded', 'false');
    }
    if (drawerWasOpenBeforeNav) {
      // closeDrawer() also clears selected-pin highlight + URL focus param.
      closeDrawer();
    }
  });
  window.addEventListener(NAV_CLOSED_EVENT, () => {
    // Only restore the sidebar — re-opening the place-drawer would feel
    // intrusive (Allison closed the nav to look at the map, not the card).
    if (sidebarWasOpenBeforeNav) {
      sidebar?.classList.add('is-open');
      sidebarToggleBtn?.setAttribute('aria-expanded', 'true');
    }
    sidebarWasOpenBeforeNav = false;
    drawerWasOpenBeforeNav = false;
  });

  // Wire every marker click → openDrawer.
  for (const entry of pinRegistry) {
    const markerEl = entry.marker;
    // Leaflet's marker.on isn't in our narrow type; cast.
    const m = markerEl as unknown as { on(ev: string, fn: (e: unknown) => void): void };
    m.on('click', () => {
      openDrawer(entry.id, { fly: false });
    });
    // Hover preview wiring (desktop only — guarded by CSS @media (hover: none)).
    let hoverTimer: number | null = null;
    const showPreview = (clientX: number, clientY: number): void => {
      if (!hoverPreviewEl) return;
      if (window.matchMedia('(hover: none)').matches) return;
      // Don't show preview while the drawer is already open for this pin.
      if (lastSelectedPinId === entry.id) return;
      const src = drawerSources.get(entry.id);
      const photo = src?.photos[0] ?? '';
      const teaser =
        src?.variant === 'nature'
          ? (NATURE_DESTINATIONS.find((d) => `nature-${d.id}` === entry.id)?.feature ?? '')
          : entry.subLabel;
      hoverPreviewEl.innerHTML = `
        ${photo ? `<img class="place-hover-preview__img" src="${escapeHtml(photo)}" alt="" decoding="async" />` : ''}
        <div class="place-hover-preview__body">
          <p class="place-hover-preview__name">${escapeHtml(entry.name)}</p>
          <p class="place-hover-preview__teaser">${escapeHtml(teaser)}</p>
          <p class="place-hover-preview__nudge">Click for full details →</p>
        </div>
      `;
      // Position above + slightly right of the cursor. Clamp to viewport.
      const w = 220;
      let left = clientX - w / 2;
      let top = clientY - 160;
      left = Math.max(8, Math.min(window.innerWidth - w - 8, left));
      top = Math.max(8, top);
      hoverPreviewEl.style.left = `${left}px`;
      hoverPreviewEl.style.top = `${top}px`;
      hoverPreviewEl.setAttribute('aria-hidden', 'false');
    };
    const hidePreview = (): void => {
      if (!hoverPreviewEl) return;
      hoverPreviewEl.setAttribute('aria-hidden', 'true');
    };
    const onEnter = (e: MouseEvent): void => {
      if (hoverTimer !== null) window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => showPreview(e.clientX, e.clientY), 120);
    };
    const onLeave = (): void => {
      if (hoverTimer !== null) {
        window.clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      hidePreview();
    };
    // Use Leaflet's DOM element once the marker has been added to the map.
    // We attach via raw DOM after a tick — markers might not have an element
    // until they're added.
    window.setTimeout(() => {
      const el = entry.marker.getElement();
      if (!el) return;
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    }, 60);
  }

  // Sidebar rows: re-render sidebar so click handlers (added inside
  // renderSidebar) also open the drawer in addition to flyTo+popup.
  // Wrap the existing click flow by listening on the sidebar list and
  // routing through openDrawer.
  sidebarList?.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    const rowEl = target.closest<HTMLElement>('.map-sidebar-row[data-pin]');
    if (!rowEl) return;
    if ((ev as MouseEvent).shiftKey) return; // measure flow owns shift-click
    const pinId = rowEl.dataset.pin;
    if (!pinId) return;
    // Defer slightly so the existing click handler's flyTo runs first.
    window.setTimeout(() => openDrawer(pinId, { fly: false }), 150);
  });

  // Filter-chip pulse (Pattern E) — when the user toggles a chip on,
  // briefly pulse all newly-visible pins so the change is felt.
  function pulseVisible(group: GroupKey): void {
    for (const p of pinRegistry) {
      if (p.group !== group) continue;
      const el = p.marker.getElement();
      if (!el) continue;
      el.classList.add('leaflet-pin-pulse');
      window.setTimeout(() => el.classList.remove('leaflet-pin-pulse'), 700);
    }
  }
  document.querySelectorAll<HTMLButtonElement>('.map-chip[data-layer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-pressed') === 'true') {
        pulseVisible(btn.dataset.layer as GroupKey);
      }
    });
  });

  // ?focus=<slug> deep-link handling (Pattern 8).
  // Accept formats: `?focus=gosausee` (bare slug → nature), `?focus=nature-gosausee`
  // (fully-qualified id), `?focus=lodging-haus-edelweiss-obertraun`,
  // `?focus=other-salzburg-airport`.
  const params = new URLSearchParams(window.location.search);
  const focusSlug = params.get('focus');
  if (focusSlug) {
    const tryIds = [focusSlug, `nature-${focusSlug}`, `lodging-${focusSlug}`, `other-${focusSlug}`];
    let opened = false;
    for (const candidateId of tryIds) {
      if (drawerSources.has(candidateId)) {
        const entry = pinRegistry.find((p) => p.id === candidateId);
        if (entry) {
          // Defer to next tick so map fitBounds has run + cluster is ready.
          window.setTimeout(() => {
            if (entry.isCluster) {
              const cluster = entry.layerOwner as LClusterGroup;
              cluster.zoomToShowLayer(entry.marker, () => openDrawer(candidateId, { fly: true }));
            } else {
              map.flyTo([entry.coord.lat, entry.coord.lng], 13, { duration: 0.6 });
              window.setTimeout(() => openDrawer(candidateId, { fly: false }), 700);
            }
          }, 600);
          opened = true;
          break;
        }
      }
    }
    if (!opened) {
      console.warn(`[map] ?focus=${focusSlug} did not match any pin id`);
    }
  }
}

// Friendly fallback if bootMap throws OR if Leaflet never loads. Replaces
// the silent white box / cryptic console error pattern. Surfaces a path
// forward (sidebar list, nature page, stay page) so trust isn't lost.
function showMapErrorBanner(reason: string): void {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  // Avoid double-render if already shown.
  if (mapEl.querySelector('.map-error-banner')) return;
  mapEl.innerHTML = `
    <div class="map-error-banner" role="alert">
      <strong>Map couldn't render right now.</strong>
      <p>This is usually a tile-server / CDN hiccup — try refreshing in a few seconds.</p>
      <p class="map-error-fallback">
        In the meantime, every pin still exists as a list:
        <a href="nature-destinations.html">nature destinations</a> ·
        <a href="stay.html">lodging</a> ·
        <a href="jewish-sights.html">Jewish sights</a>.
      </p>
      <p class="map-error-tech"><small>Reason: ${escapeHtml(reason)}</small></p>
    </div>
  `;
  const statsEl = document.getElementById('map-stats');
  if (statsEl) {
    statsEl.innerHTML =
      'Map render failed — use the per-page lists above (linked in the banner) to browse pins.';
  }
}

function bootMapSafely(): void {
  try {
    bootMap();
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[map] bootMap threw:', err);
    showMapErrorBanner(msg);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  whenLeafletReady(bootMapSafely, showMapErrorBanner);
});
