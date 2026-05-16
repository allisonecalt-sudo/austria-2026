// Entry script for /stay.html — multi-view filterable lodging interface.
//
// Built 2026-05-16 by stay-multiview agent per Allison's directive:
//   "give multiple views if there is beautiful stays and I don't know avi
//    tells us she wants there to be a filtering option Also I think a map
//    would be good work at integrating maps"
//
// Three views (List / Grid / Map) on a sticky toggle. Filter bar with chips
// for budget tier / base / vibe / bedrooms / amenities (laundry, AC,
// parking) / platform. URL hash preserves view (#list / #grid / #map).
// Map = Leaflet over OSM tiles, pins color-coded by base, click pin to
// scroll the corresponding card into view.
//
// Aggregates all 22+ listings:
//   - TRIP.lodgings (Salzburg / Hallstatt / Airport — the locked plan)
//   - BERCHTESGADEN_LODGING (Config B alternative base)
//   - ST_WOLFGANG_LODGING (Config D alternative base)
// Each is normalized into a single shape (UnifiedListing) so view + filter
// code stays simple.

import {
  TRIP,
  BASE_CONFIGS,
  SUNSET_STAYS,
  type BudgetTier,
  type LodgingPlatform,
  type LodgingVibe,
  type LodgingLaundry,
  type SunsetStay,
} from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';

// ---------------------------------------------------------------------------
// Leaflet typings — loaded via CDN <script> in stay.html (no npm dep).
// ---------------------------------------------------------------------------
declare const L: {
  map: (id: string, opts?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, opts?: Record<string, unknown>) => { addTo: (m: LeafletMap) => unknown };
  divIcon: (opts: Record<string, unknown>) => LeafletIcon;
  marker: (latlng: [number, number], opts?: { icon?: LeafletIcon }) => LeafletMarker;
  latLngBounds: (corners: [number, number][]) => LeafletBounds;
};
interface LeafletMap {
  setView: (latlng: [number, number], zoom: number) => LeafletMap;
  fitBounds: (b: LeafletBounds, opts?: Record<string, unknown>) => LeafletMap;
  invalidateSize: () => void;
  removeLayer: (layer: unknown) => void;
}
interface LeafletIcon {
  options: Record<string, unknown>;
}
interface LeafletMarker {
  addTo: (m: LeafletMap) => LeafletMarker;
  bindPopup: (html: string) => LeafletMarker;
  on: (event: string, fn: (e: unknown) => void) => LeafletMarker;
  openPopup: () => LeafletMarker;
}
interface LeafletBounds {
  pad: (n: number) => LeafletBounds;
}

// ---------------------------------------------------------------------------
// Base-coordinate lookup — for the embedded map.
// ---------------------------------------------------------------------------
// Pin coords keyed by listing name. Hand-mapped 2026-05-16 against Google
// Maps for each property. Coords aren't load-bearing for booking — they
// place the pin in the right village. Where the precise lat/lng wasn't
// findable, we fall back to the village centroid (still places the pin
// in the correct cluster). Salzburg apartments scattered ±200m around
// Linzergasse / Schallmoos / Riedenburg. Bad Goisern / Gosau cluster.
// All values in WGS84 decimal degrees.
const COORDS: Record<string, [number, number]> = {
  // === SALZBURG ===
  'master Linzergasse': [47.8056, 13.0464],
  "Junker's Apartments": [47.811, 13.022],
  Sauerweingut: [47.7944, 13.0357],
  'Villa Salzburg by Welcome to Salzburg': [47.794, 13.029],
  'Pension Elisabeth — Rooms & Apartments': [47.8123, 13.063],
  'Amedeo Zotti Residence Salzburg': [47.815, 13.063],
  'Salzburg Topside Apartments': [47.808, 13.0475],

  // === HALLSTATT / OBERTRAUN / GOSAU / BAD GOISERN ===
  'Haus Edelweiss (Obertraun)': [47.5483, 13.6904],
  'Austrian Apartments (Bad Goisern)': [47.6358, 13.6203],
  'Ferienhof Osl — Urlaub am Bauernhof (Obertraun)': [47.5495, 13.6873],
  'Haus Steinbrecher Hallstatt': [47.5622, 13.649],
  'River Lilly Apartment (Obertraun)': [47.5479, 13.6957],
  'Landhaus Osborne (Obertraun)': [47.5486, 13.6895],
  'Ferienwohnung Schmaranzer (Gosau)': [47.5805, 13.5258],
  'Haus im Grünen (Gosau)': [47.5832, 13.5388],
  'Mühlradl Apartments Gosau': [47.579, 13.531],
  'Pension Sydler (Bad Goisern)': [47.638, 13.622],
  'Weisses Lamm Holiday Home (Hallstatt)': [47.5618, 13.6483],

  // === AIRPORT (SZG = 47.7933, 13.0043) ===
  'Hapimag Ferienwohnungen Salzburg': [47.7975, 12.967],
  'Landhotel Berger (Ainring, just over the German border)': [47.781, 12.93],
  'Hotel Astoria': [47.799, 12.985],
  'Goldgasse Apartments de Luxe': [47.799, 13.045],
  'Rock Salzburg': [47.8001, 13.043],

  // === BERCHTESGADEN / RAMSAU / SCHÖNAU ===
  'Apart Chalet Unterbrandnerlehen (Schönau am Königssee)': [47.5928, 12.985],
  'Gästehaus Hinterponholz (Ramsau)': [47.6075, 12.913],
  'Wolf & Schaf Apartments-equivalent — Ferienwohnung da Celia (Berchtesgaden town)': [
    47.629, 13.0035,
  ],
  'Gästehaus Amort (Ramsau)': [47.6105, 12.9285],
  'Grubenlehen (Ramsau)': [47.6085, 12.9265],

  // === ST. WOLFGANG / STROBL / WOLFGANGSEE ===
  'Wolf & Schaf Apartments (St. Wolfgang)': [47.7398, 13.4488],
  'Wolfgangsee Appartement (St. Wolfgang)': [47.74, 13.45],
  'Wolfgangsee Appartements (Strobl, east end of the lake)': [47.7176, 13.4845],
  'Appartements Mair (Strobl, 70m² 2-BR)': [47.7175, 13.4795],
  'Apartment Sunset am Wolfgangsee (Strobl)': [47.7165, 13.485],
};

// ---------------------------------------------------------------------------
// Filter taxonomies
// ---------------------------------------------------------------------------
type BaseKey = 'salzburg' | 'obertraun' | 'berchtesgaden' | 'wolfgangsee' | 'airport';

interface UnifiedListing {
  // Identity
  id: string;
  name: string;
  url: string;
  img: string;
  review: string;
  pricePerNight: string;
  note: string;
  // Classification
  base: BaseKey;
  budgetTier: BudgetTier; // normalized (splurge -> mid-high)
  platform: LodgingPlatform;
  vibe: LodgingVibe;
  laundry: LodgingLaundry;
  bedrooms?: number | 'studio';
  beds?: string;
  notableDetails: string[];
  // Map coords (lat, lng)
  coords?: [number, number];
  // Highlight
  isPick: boolean;
  // Beautiful-character pick (set 2026-05-16 by beautiful-lodging-hunt
  // agent). Quietly badged on existing cards.
  isBeauty: boolean;
  beautyNote?: string;
  // Derived booleans for amenity filters
  hasWasher: boolean;
  hasWasherDryer: boolean;
  hasAc: boolean;
  hasFreeParking: boolean;
  // Optional ext links not currently shown but kept
  walkToChabadMin?: number;
  driveToAirportMin?: number;
}

const BASE_LABELS: Record<BaseKey, string> = {
  salzburg: 'Salzburg',
  obertraun: 'Obertraun / Hallstatt',
  berchtesgaden: 'Berchtesgaden',
  wolfgangsee: 'St. Wolfgang',
  airport: 'Airport',
};

const BASE_COLORS: Record<BaseKey, string> = {
  salzburg: '#3a6f8f', // blue-lake
  obertraun: '#2e5d4f', // green-deep
  berchtesgaden: '#7a4f8f', // purple
  wolfgangsee: '#2a8a8a', // teal
  airport: '#777b7e', // gray
};

// Default state — all bases on, no other filters applied.
const ALL_BASES: BaseKey[] = ['salzburg', 'obertraun', 'berchtesgaden', 'wolfgangsee', 'airport'];

interface FilterState {
  view: 'list' | 'grid' | 'map';
  bases: Set<BaseKey>;
  tiers: Set<BudgetTier>; // 'lean' | 'standard' | 'mid-high' (splurge folded in)
  vibes: Set<LodgingVibe>;
  bedrooms: Set<'studio' | '1' | '2' | '3+'>;
  amenities: Set<'washer' | 'washer-dryer' | 'ac' | 'parking'>;
  platforms: Set<LodgingPlatform>;
}

const state: FilterState = {
  view: 'list',
  bases: new Set(ALL_BASES),
  tiers: new Set(),
  vibes: new Set(),
  bedrooms: new Set(),
  amenities: new Set(),
  platforms: new Set(),
};

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeTier(t?: BudgetTier): BudgetTier {
  // 'splurge' is legacy label for 'mid-high' per trip-data.ts comment.
  if (t === 'splurge') return 'mid-high';
  return t ?? 'standard';
}

function detectAmenity(details: string[] | undefined, keyword: RegExp): boolean {
  if (!details) return false;
  return details.some((d) => keyword.test(d));
}

// ---------------------------------------------------------------------------
// Build the unified listings array from the three sources.
// ---------------------------------------------------------------------------
function buildListings(): UnifiedListing[] {
  const out: UnifiedListing[] = [];

  // 1) TRIP.lodgings — the locked-plan picks + alts (Salzburg / Hallstatt / Airport)
  for (const l of TRIP.lodgings) {
    const base: BaseKey =
      l.baseKey === 'hallstatt' ? 'obertraun' : (l.baseKey as 'salzburg' | 'airport');

    // The headline pick
    const pickDetails = l.pickNotableDetails ?? [];
    out.push({
      id: slugify(l.pickName),
      name: l.pickName,
      url: l.pickUrl,
      img: l.pickImg,
      review: l.pickReview,
      pricePerNight: l.pickPrice,
      note: l.pickWhy,
      base,
      budgetTier: normalizeTier(l.pickBudgetTier),
      platform: l.pickPlatform ?? 'booking',
      vibe: l.pickVibeTag ?? 'in-town',
      laundry: l.pickLaundry ?? 'unknown',
      bedrooms: l.pickBedrooms,
      beds: l.pickBeds,
      notableDetails: pickDetails,
      coords: COORDS[l.pickName],
      isPick: true,
      isBeauty: false,
      hasWasher:
        l.pickLaundry === 'washer' ||
        l.pickLaundry === 'washer+dryer' ||
        detectAmenity(pickDetails, /washing\s*machine|washer/i),
      hasWasherDryer: l.pickLaundry === 'washer+dryer' || detectAmenity(pickDetails, /dryer/i),
      hasAc: detectAmenity(pickDetails, /\bAC\b|air[-\s]?cond/i),
      hasFreeParking: detectAmenity(pickDetails, /free\s*parking/i),
      walkToChabadMin: l.pickWalkToChabadMin,
      driveToAirportMin: l.pickDriveToAirportMin,
    });

    // Alts
    for (const a of l.alts) {
      const dets = a.notableDetails ?? [];
      out.push({
        id: slugify(a.name),
        name: a.name,
        url: a.url,
        img: a.img,
        review: a.review,
        pricePerNight: a.pricePerNight,
        note: a.note,
        base,
        budgetTier: normalizeTier(a.budgetTier),
        platform: a.platform ?? 'booking',
        vibe: a.vibeTag ?? 'in-town',
        laundry: a.laundry ?? 'unknown',
        bedrooms: a.bedrooms,
        beds: a.beds,
        notableDetails: dets,
        coords: COORDS[a.name],
        isPick: false,
        isBeauty: a.beautyPick === true,
        beautyNote: a.beautyNote,
        hasWasher:
          a.laundry === 'washer' ||
          a.laundry === 'washer+dryer' ||
          detectAmenity(dets, /washing\s*machine|washer/i),
        hasWasherDryer: a.laundry === 'washer+dryer' || detectAmenity(dets, /dryer/i),
        hasAc: detectAmenity(dets, /\bAC\b|air[-\s]?cond/i),
        hasFreeParking: detectAmenity(dets, /free\s*parking/i),
        walkToChabadMin: a.walkToChabadMin,
        driveToAirportMin: a.driveToAirportMin,
      });
    }
  }

  // 2) Alternative bases — Berchtesgaden + St. Wolfgang lodging from BASE_CONFIGS
  for (const cfg of BASE_CONFIGS) {
    if (cfg.id !== 'berchtesgaden' && cfg.id !== 'wolfgangsee') continue;
    const base: BaseKey = cfg.id;
    for (const p of cfg.lodging) {
      const dets = p.notableDetails ?? [];
      out.push({
        id: slugify(`${base}-${p.name}`),
        name: p.name,
        url: p.url,
        img: p.img,
        review: p.review,
        pricePerNight: p.pricePerNight,
        note: p.note,
        base,
        budgetTier: normalizeTier(p.budgetTier),
        platform: 'booking',
        vibe: p.vibeTag ?? 'in-town',
        laundry: p.laundry ?? 'unknown',
        bedrooms: p.bedrooms,
        beds: p.beds,
        notableDetails: dets,
        coords: COORDS[p.name],
        isPick: false,
        isBeauty: false,
        hasWasher:
          p.laundry === 'washer' ||
          p.laundry === 'washer+dryer' ||
          detectAmenity(dets, /washing\s*machine|washer/i),
        hasWasherDryer: p.laundry === 'washer+dryer' || detectAmenity(dets, /dryer/i),
        hasAc: detectAmenity(dets, /\bAC\b|air[-\s]?cond/i),
        hasFreeParking: detectAmenity(dets, /free\s*parking/i),
      });
    }
  }

  return out;
}

const ALL_LISTINGS = buildListings();

// ---------------------------------------------------------------------------
// Filter application
// ---------------------------------------------------------------------------
function bedroomBucket(b: UnifiedListing['bedrooms']): 'studio' | '1' | '2' | '3+' | null {
  if (b === undefined) return null;
  if (b === 'studio') return 'studio';
  if (typeof b === 'number') {
    if (b <= 1) return '1';
    if (b === 2) return '2';
    return '3+';
  }
  return null;
}

function applyFilters(): UnifiedListing[] {
  return ALL_LISTINGS.filter((l) => {
    if (!state.bases.has(l.base)) return false;
    if (state.tiers.size > 0 && !state.tiers.has(l.budgetTier)) return false;
    if (state.vibes.size > 0 && !state.vibes.has(l.vibe)) return false;
    if (state.bedrooms.size > 0) {
      const b = bedroomBucket(l.bedrooms);
      if (!b || !state.bedrooms.has(b)) return false;
    }
    if (state.amenities.size > 0) {
      // AND semantics across selected amenities — every selected must match.
      if (state.amenities.has('washer') && !l.hasWasher) return false;
      if (state.amenities.has('washer-dryer') && !l.hasWasherDryer) return false;
      if (state.amenities.has('ac') && !l.hasAc) return false;
      if (state.amenities.has('parking') && !l.hasFreeParking) return false;
    }
    if (state.platforms.size > 0 && !state.platforms.has(l.platform)) return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Card rendering (shared by list + grid views)
// ---------------------------------------------------------------------------
function tierBadge(tier: BudgetTier): string {
  const label =
    tier === 'lean' ? '💰 Lean' : tier === 'standard' ? '💰💰 Standard' : '💰💰💰 Mid-high';
  return `<span class="chip" title="Budget tier">${label}</span>`;
}

function vibeBadge(vibe: LodgingVibe): string {
  if (vibe === 'in-town') return '<span class="chip" title="Setting">🏙 In-town</span>';
  const map: Record<Exclude<LodgingVibe, 'in-town'>, string> = {
    'nature-view': '🏔 Nature view',
    'farm-stay': '🐎 Farm stay',
    'lake-edge': '🌊 Lake edge',
    'forest-cabin': '🌲 Forest cabin',
  };
  return `<span class="chip" title="Setting">${map[vibe]}</span>`;
}

function baseBadge(base: BaseKey): string {
  const color = BASE_COLORS[base];
  return `<span class="chip chip-base" style="background:${color}1f;color:${color};border-color:${color}3a">${BASE_LABELS[base]}</span>`;
}

function laundryBadge(l: LodgingLaundry): string {
  if (l === 'washer+dryer') return '<span class="chip chip-good">🧺 Washer + dryer</span>';
  if (l === 'washer') return '<span class="chip chip-good">🧺 Washer</span>';
  if (l === 'shared') return '<span class="chip">🧺 Shared laundry</span>';
  if (l === 'none') return '<span class="chip chip-bad">🚫 No laundry</span>';
  return '';
}

function bedroomBadge(b: UnifiedListing['bedrooms']): string {
  if (b === undefined) return '';
  if (b === 'studio') return '<span class="chip">🛏 Studio</span>';
  if (typeof b === 'number') {
    const label = b >= 3 ? `🛏 ${b} BR` : `🛏 ${b} BR`;
    return `<span class="chip">${label}</span>`;
  }
  return '';
}

function platformBadge(p: LodgingPlatform): string {
  const labels: Record<LodgingPlatform, string> = {
    booking: 'Booking.com',
    airbnb: 'Airbnb',
    'urlaub-am-bauernhof': 'Urlaub am Bauernhof',
  };
  return `<span class="chip">${labels[p]}</span>`;
}

function pickBadgeHtml(isPick: boolean): string {
  return isPick ? '<span class="chip chip-recommended">★ Allison\'s pick</span>' : '';
}

function beautyBadgeHtml(isBeauty: boolean): string {
  return isBeauty
    ? '<span class="chip chip-beauty" title="Character pick — beautiful place to stay">✨ Character pick</span>'
    : '';
}

function renderListingCard(l: UnifiedListing, variant: 'list' | 'grid'): string {
  const chips = [
    pickBadgeHtml(l.isPick),
    beautyBadgeHtml(l.isBeauty),
    baseBadge(l.base),
    tierBadge(l.budgetTier),
    vibeBadge(l.vibe),
    bedroomBadge(l.bedrooms),
    laundryBadge(l.laundry),
    platformBadge(l.platform),
  ]
    .filter(Boolean)
    .join('');

  const cardClass = [
    'stay-card',
    variant === 'grid' ? 'stay-card--grid' : 'stay-card--list',
    l.isBeauty ? 'stay-card--beauty' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const headingTag = variant === 'grid' ? 'h3' : 'h3';

  const beautyLine =
    l.isBeauty && l.beautyNote
      ? `<p class="stay-card__beauty-note">✨ ${escapeHtml(l.beautyNote)}</p>`
      : '';

  return `
    <article class="${cardClass}" id="card-${escapeHtml(l.id)}" data-base="${l.base}">
      <a class="stay-card__link" href="${escapeHtml(l.url)}" target="_blank" rel="noreferrer noopener">
        <img class="stay-card__img" loading="lazy" src="${escapeHtml(l.img)}" alt="${escapeHtml(l.name)}" />
        <div class="stay-card__body">
          <${headingTag} class="stay-card__name">${escapeHtml(l.name)}</${headingTag}>
          <div class="stay-card__meta">${escapeHtml(l.review)} · <strong>${escapeHtml(l.pricePerNight)}</strong></div>
          ${beautyLine}
          <p class="stay-card__note">${escapeHtml(l.note)}</p>
          <div class="stay-card__chips">${chips}</div>
          <div class="stay-card__cta">View listing →</div>
        </div>
      </a>
    </article>`;
}

// ---------------------------------------------------------------------------
// View rendering
// ---------------------------------------------------------------------------
function renderListView(items: UnifiedListing[]): string {
  // Group by base for List view — keeps the editorial structure intact.
  const groups: Record<BaseKey, UnifiedListing[]> = {
    salzburg: [],
    obertraun: [],
    berchtesgaden: [],
    wolfgangsee: [],
    airport: [],
  };
  for (const l of items) groups[l.base].push(l);

  const sections = (Object.keys(groups) as BaseKey[])
    .filter((b) => groups[b].length > 0)
    .map((b) => {
      const cards = groups[b].map((l) => renderListingCard(l, 'list')).join('');
      return `
        <section class="stay-group" id="group-${b}">
          <header class="stay-group__head">
            <span class="stay-group__dot" style="background:${BASE_COLORS[b]}"></span>
            <h2 class="stay-group__title">${BASE_LABELS[b]}</h2>
            <span class="stay-group__count">${groups[b].length} listing${groups[b].length === 1 ? '' : 's'}</span>
          </header>
          <div class="stay-list">${cards}</div>
        </section>`;
    })
    .join('');

  return sections || emptyStateHtml();
}

function renderGridView(items: UnifiedListing[]): string {
  if (items.length === 0) return emptyStateHtml();
  const cards = items.map((l) => renderListingCard(l, 'grid')).join('');
  return `<div class="stay-grid">${cards}</div>`;
}

function renderMapView(items: UnifiedListing[]): string {
  // Map view = the embedded map + a horizontal scroller of cards below.
  // The embedded map at the page top is always present; here we just give
  // a heading + the filtered cards in a compact strip.
  if (items.length === 0) return `<div class="stay-mapview__empty">${emptyStateHtml()}</div>`;
  const cards = items.map((l) => renderListingCard(l, 'grid')).join('');
  return `
    <div class="stay-mapview">
      <p class="stay-mapview__hint">
        Tap a pin on the map above to jump to that listing. Cards below match your filters.
      </p>
      <div class="stay-grid">${cards}</div>
    </div>`;
}

function emptyStateHtml(): string {
  return `
    <div class="stay-empty">
      <p><strong>No listings match these filters.</strong></p>
      <p>Try removing a filter, or <button type="button" class="stay-empty__clear" id="empty-clear">clear all filters</button>.</p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Sunset Stays — "sleep + sunset in the same spot" pinned section.
// Added 2026-05-16 by beautiful-lodging-hunt agent. Pinned above the main
// filterable listings so it's the first thing seen. NOT affected by filters
// (these are special cross-finds, not base options).
// ---------------------------------------------------------------------------
function renderSunsetStayCard(s: SunsetStay): string {
  const statusBadge: Record<typeof s.status, string> = {
    bookable:
      '<span class="sunset-stay__status sunset-stay__status--good">✓ Bookable Jul 2026</span>',
    'confirm-with-host':
      '<span class="sunset-stay__status sunset-stay__status--warn">Confirm with host</span>',
    'skip-too-hard':
      '<span class="sunset-stay__status sunset-stay__status--bad">Logistics too hard — skip</span>',
  };
  const logisticsRows = s.logistics
    .map(
      (row) =>
        `<li><span class="sunset-stay__log-label">${escapeHtml(row.label)}</span><span class="sunset-stay__log-value">${escapeHtml(row.value)}</span></li>`,
    )
    .join('');
  const sourceLinks = s.sourceLinks
    .map(
      (src) =>
        `<a href="${escapeHtml(src.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(src.label)}</a>`,
    )
    .join(' · ');
  const elev = s.elevationM ? `<span class="sunset-stay__elev">${s.elevationM} m</span>` : '';
  return `
    <article class="sunset-stay" id="sunset-${escapeHtml(s.id)}">
      <div class="sunset-stay__media">
        <img class="sunset-stay__img" loading="lazy" src="${escapeHtml(s.img)}" alt="${escapeHtml(s.name)}" />
        ${elev}
      </div>
      <div class="sunset-stay__body">
        <header class="sunset-stay__head">
          <h3 class="sunset-stay__name">${escapeHtml(s.name)}</h3>
          ${statusBadge[s.status]}
        </header>
        <p class="sunset-stay__pitch">${escapeHtml(s.pitch)}</p>
        <p class="sunset-stay__verdict">${escapeHtml(s.verdict)}</p>
        <details class="sunset-stay__details">
          <summary>Why the sunset is insane + full logistics</summary>
          <div class="sunset-stay__details-body">
            <p class="sunset-stay__why">${escapeHtml(s.whyInsane)}</p>
            <p class="sunset-stay__price"><strong>${escapeHtml(s.pricePerNightEur)}</strong>${s.pricePerNightNote ? ` <span class="sunset-stay__price-note">${escapeHtml(s.pricePerNightNote)}</span>` : ''}</p>
            <h4 class="sunset-stay__sub">Logistics</h4>
            <ul class="sunset-stay__logistics">${logisticsRows}</ul>
            <h4 class="sunset-stay__sub">Kosher cooking on the mountain</h4>
            <p>${escapeHtml(s.kosherKit)}</p>
            <h4 class="sunset-stay__sub">Pack list</h4>
            <p>${escapeHtml(s.packList)}</p>
            <h4 class="sunset-stay__sub">Weather risk</h4>
            <p>${escapeHtml(s.weatherRisk)}</p>
            <h4 class="sunset-stay__sub">How to book</h4>
            <p>${escapeHtml(s.bookingNote)}</p>
            <p class="sunset-stay__sources"><strong>Verified from:</strong> ${sourceLinks}</p>
          </div>
        </details>
        <a class="sunset-stay__cta" href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer noopener">
          Open the listing →
        </a>
      </div>
    </article>`;
}

function renderSunsetStays(): string {
  if (SUNSET_STAYS.length === 0) return '';
  const cards = SUNSET_STAYS.map(renderSunsetStayCard).join('');
  return `
    <section class="sunset-stays" aria-labelledby="sunset-stays-heading">
      <header class="sunset-stays__head">
        <span class="sunset-stays__eyebrow">✨ Sunset stays</span>
        <h2 id="sunset-stays-heading" class="sunset-stays__title">Sleep where the sunset happens</h2>
        <p class="sunset-stays__lede">
          Four places where the room IS the viewpoint — peak hotels above the cog railway, lakeside
          inns at the foot of the Dachstein, balconies hanging over Hintersee.
          Swap one Obertraun night for one of these.
        </p>
      </header>
      <div class="sunset-stays__grid">${cards}</div>
    </section>`;
}

// ---------------------------------------------------------------------------
// Filter bar rendering
// ---------------------------------------------------------------------------
interface ChipDef<V extends string> {
  value: V;
  label: string;
}

function renderChipGroup<V extends string>(
  groupLabel: string,
  chips: ChipDef<V>[],
  selected: Set<V>,
  groupKey: string,
): string {
  const buttons = chips
    .map((c) => {
      const isOn = selected.has(c.value);
      return `<button type="button" class="filter-chip${isOn ? ' is-on' : ''}" data-group="${groupKey}" data-value="${c.value}">${escapeHtml(c.label)}</button>`;
    })
    .join('');
  return `
    <div class="filter-group" data-group-label="${groupKey}">
      <span class="filter-group__label">${escapeHtml(groupLabel)}</span>
      <div class="filter-group__chips">${buttons}</div>
    </div>`;
}

function renderFilterBar(matchCount: number): string {
  const tiers: ChipDef<BudgetTier>[] = [
    { value: 'lean', label: '💰 Lean' },
    { value: 'standard', label: '💰💰 Standard' },
    { value: 'mid-high', label: '💰💰💰 Mid-high' },
  ];
  const bases: ChipDef<BaseKey>[] = [
    { value: 'salzburg', label: 'Salzburg' },
    { value: 'obertraun', label: 'Obertraun' },
    { value: 'berchtesgaden', label: 'Berchtesgaden' },
    { value: 'wolfgangsee', label: 'St. Wolfgang' },
    { value: 'airport', label: 'Airport' },
  ];
  const vibes: ChipDef<LodgingVibe>[] = [
    { value: 'nature-view', label: '🏔 Nature view' },
    { value: 'farm-stay', label: '🐎 Farm stay' },
    { value: 'lake-edge', label: '🌊 Lake edge' },
    { value: 'forest-cabin', label: '🌲 Forest cabin' },
    { value: 'in-town', label: '🏙 In-town' },
  ];
  const bedrooms: ChipDef<'studio' | '1' | '2' | '3+'>[] = [
    { value: 'studio', label: 'Studio' },
    { value: '1', label: '1 BR' },
    { value: '2', label: '2 BR' },
    { value: '3+', label: '3+ BR' },
  ];
  const amenities: ChipDef<'washer' | 'washer-dryer' | 'ac' | 'parking'>[] = [
    { value: 'washer', label: '🧺 Washer' },
    { value: 'washer-dryer', label: '🧺 Washer + dryer' },
    { value: 'ac', label: '❄️ AC' },
    { value: 'parking', label: '🅿️ Free parking' },
  ];
  const platforms: ChipDef<LodgingPlatform>[] = [
    { value: 'booking', label: 'Booking.com' },
    { value: 'airbnb', label: 'Airbnb' },
    { value: 'urlaub-am-bauernhof', label: 'Urlaub am Bauernhof' },
  ];

  const totalActive =
    (state.bases.size !== ALL_BASES.length ? state.bases.size : 0) +
    state.tiers.size +
    state.vibes.size +
    state.bedrooms.size +
    state.amenities.size +
    state.platforms.size;

  return `
    <div class="filter-bar__count">
      <strong>${matchCount}</strong> of ${ALL_LISTINGS.length} listings
      ${totalActive > 0 ? `<button type="button" class="filter-clear" id="filter-clear">Clear filters</button>` : ''}
    </div>
    ${renderChipGroup('Base', bases, state.bases, 'bases')}
    ${renderChipGroup('Budget', tiers, state.tiers, 'tiers')}
    ${renderChipGroup('Vibe', vibes, state.vibes, 'vibes')}
    ${renderChipGroup('Bedrooms', bedrooms, state.bedrooms, 'bedrooms')}
    ${renderChipGroup('Amenities', amenities, state.amenities, 'amenities')}
    ${renderChipGroup('Platform', platforms, state.platforms, 'platforms')}`;
}

// ---------------------------------------------------------------------------
// Map (Leaflet) — single instance, re-pinned on filter change.
// ---------------------------------------------------------------------------
let mapInstance: LeafletMap | null = null;
let mapMarkers: LeafletMarker[] = [];

function ensureMap(): void {
  if (mapInstance) return;
  if (typeof L === 'undefined') return; // Leaflet still loading
  // Rough centroid of Salzburg + Obertraun + Berchtesgaden + Wolfgangsee
  mapInstance = L.map('stay-map', { scrollWheelZoom: false }).setView([47.65, 13.3], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(mapInstance);
}

function renderMapPins(items: UnifiedListing[]): void {
  if (!mapInstance) return;
  // Clear old markers
  for (const m of mapMarkers) {
    mapInstance.removeLayer(m);
  }
  mapMarkers = [];

  const corners: [number, number][] = [];
  for (const l of items) {
    if (!l.coords) continue;
    corners.push(l.coords);
    const color = BASE_COLORS[l.base];
    const icon = L.divIcon({
      className: 'stay-pin',
      html: `<span class="stay-pin__dot" style="background:${color}"></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    const m = L.marker(l.coords, { icon }).addTo(mapInstance);
    const popupHtml = `
      <div class="stay-pin-popup">
        <strong>${escapeHtml(l.name)}</strong><br>
        ${escapeHtml(l.review)}<br>
        ${escapeHtml(l.pricePerNight)}<br>
        <a href="#card-${escapeHtml(l.id)}" class="stay-pin-popup__jump">Show card ↓</a>
        &nbsp;·&nbsp;
        <a href="${escapeHtml(l.url)}" target="_blank" rel="noreferrer noopener">Booking ↗</a>
      </div>`;
    m.bindPopup(popupHtml);
    mapMarkers.push(m);
  }

  if (corners.length > 0) {
    const bounds = L.latLngBounds(corners).pad(0.15);
    mapInstance.fitBounds(bounds, { maxZoom: 12 });
  }
  // Map needs a kick when its container has been display:none
  setTimeout(() => mapInstance?.invalidateSize(), 50);
}

// ---------------------------------------------------------------------------
// Wiring + render loop
// ---------------------------------------------------------------------------
function readHash(): void {
  const h = window.location.hash.replace('#', '');
  if (h === 'list' || h === 'grid' || h === 'map') state.view = h;
}

function writeHash(): void {
  // Use history.replaceState so we don't pollute back-button history.
  const h = `#${state.view}`;
  if (window.location.hash !== h) {
    history.replaceState(null, '', h);
  }
}

function renderViewToggle(): string {
  const opt = (v: 'list' | 'grid' | 'map', label: string, icon: string) =>
    `<button type="button" class="view-toggle__btn${state.view === v ? ' is-on' : ''}" data-view="${v}" aria-pressed="${state.view === v}">${icon} ${label}</button>`;
  return `
    <div class="view-toggle" role="tablist" aria-label="View mode">
      ${opt('list', 'List', '☰')}
      ${opt('grid', 'Grid', '▦')}
      ${opt('map', 'Map', '📍')}
    </div>`;
}

function renderShell(): void {
  const matched = applyFilters();

  const toggleEl = document.querySelector<HTMLDivElement>('#view-toggle');
  if (toggleEl) toggleEl.innerHTML = renderViewToggle();

  const filterEl = document.querySelector<HTMLDivElement>('#filter-bar');
  if (filterEl) filterEl.innerHTML = renderFilterBar(matched.length);

  const listEl = document.querySelector<HTMLDivElement>('#stay-listings');
  if (listEl) {
    if (state.view === 'list') listEl.innerHTML = renderListView(matched);
    else if (state.view === 'grid') listEl.innerHTML = renderGridView(matched);
    else listEl.innerHTML = renderMapView(matched);
  }

  // Map: always render pins (the map embed is at the top of the page so it
  // updates with filters regardless of which view is active). When in map
  // view, ensure invalidateSize so any container changes register.
  ensureMap();
  renderMapPins(matched);

  writeHash();
  bindDynamicHandlers();
}

function bindDynamicHandlers(): void {
  // View toggle buttons
  document.querySelectorAll<HTMLButtonElement>('.view-toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-view') as FilterState['view'];
      state.view = v;
      renderShell();
    });
  });

  // Filter chip buttons
  document.querySelectorAll<HTMLButtonElement>('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-group') as keyof FilterState;
      const value = btn.getAttribute('data-value') ?? '';
      const set = state[group] as Set<string>;
      if (set.has(value)) set.delete(value);
      else set.add(value);
      // Special: if user has cleared all bases, restore default (avoid 0
      // results from a single misclick — bases is exclusive in nature).
      if (group === 'bases' && state.bases.size === 0) {
        for (const b of ALL_BASES) state.bases.add(b);
      }
      renderShell();
    });
  });

  // Clear filters button
  const clearBtn = document.querySelector<HTMLButtonElement>('#filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.bases = new Set(ALL_BASES);
      state.tiers.clear();
      state.vibes.clear();
      state.bedrooms.clear();
      state.amenities.clear();
      state.platforms.clear();
      renderShell();
    });
  }

  // Empty-state clear button
  const emptyClear = document.querySelector<HTMLButtonElement>('#empty-clear');
  if (emptyClear) {
    emptyClear.addEventListener('click', () => {
      state.bases = new Set(ALL_BASES);
      state.tiers.clear();
      state.vibes.clear();
      state.bedrooms.clear();
      state.amenities.clear();
      state.platforms.clear();
      renderShell();
    });
  }

  // Map popup "show card" anchors — let default anchor scroll work, but
  // briefly highlight the target card.
  document.querySelectorAll<HTMLAnchorElement>('.stay-pin-popup__jump').forEach((a) => {
    a.addEventListener('click', () => {
      // Use a microtask so the browser handles the hash scroll, then we
      // add the highlight class.
      const targetId = a.getAttribute('href')?.replace('#', '') ?? '';
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.classList.add('stay-card--highlight');
          setTimeout(() => el.classList.remove('stay-card--highlight'), 2000);
        }
      }, 100);
    });
  });

  // Mobile: filter-sheet open/close
  const sheetOpen = document.querySelector<HTMLButtonElement>('#filter-sheet-open');
  const sheetClose = document.querySelector<HTMLButtonElement>('#filter-sheet-close');
  if (sheetOpen) {
    sheetOpen.addEventListener('click', () => {
      document.body.classList.add('filter-sheet-open');
    });
  }
  if (sheetClose) {
    sheetClose.addEventListener('click', () => {
      document.body.classList.remove('filter-sheet-open');
    });
  }
}

function init(): void {
  readHash();

  // Render the pinned Sunset Stays section once (independent of filters).
  const sunsetSlot = document.querySelector<HTMLDivElement>('#sunset-stays-slot');
  if (sunsetSlot) sunsetSlot.innerHTML = renderSunsetStays();

  // Wait for Leaflet (CDN script) before first render so the map slot can
  // initialize. We poll briefly; otherwise we just render without map
  // (it'll fill in on the next interaction).
  let tries = 0;
  const poll = (): void => {
    if (typeof L !== 'undefined' || tries++ > 20) {
      renderShell();
    } else {
      setTimeout(poll, 100);
    }
  };
  poll();

  // React to hash changes (e.g. user pastes #map URL into a new tab)
  window.addEventListener('hashchange', () => {
    readHash();
    renderShell();
  });
}

init();
initNotesWidget();
