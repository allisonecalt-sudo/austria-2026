// Entry script for /stay.html — multi-view filterable lodging interface.
//
// Built 2026-05-16 by stay-multiview agent. Heavily upgraded 2026-05-17 by
// mini-Booking.com agent per Avital + Allison feedback cluster:
//   - "✓ We need this" pick button per card + shortlist view (Avital #1)
//   - Per-lodging drive-time matrix to all 13+ nature destinations (Avital #3)
//   - Booking-style filter: start EMPTY, click to NARROW (Avital #4)
//   - Booking-card polish: TLDR top, amenity icons, distance chips, big CTA
//   - Washer / dryer ALWAYS prominent
//   - Correct dates per base (only Salzburg is Shabbat-framed)
//   - Verified-date trust pill per listing
//
// Three views (List / Grid / Map) on a sticky toggle. Picks are persisted to
// localStorage AND mirrored to Supabase (austria_notes, activity_id =
// "lodging:<slug>") so Allison's Claude can see what Avital has shortlisted.

import {
  TRIP,
  BASE_CONFIGS,
  SUNSET_STAYS,
  NATURE_DESTINATIONS,
  type BudgetTier,
  type LodgingPlatform,
  type LodgingVibe,
  type LodgingLaundry,
  type SunsetStay,
} from './trip-data.js';
import { insertNote } from './supabase.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';

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
  'Landhaus Lilly (Obertraun) — Liz & Paul B&B': [47.5479, 13.6957],
  'Landhaus Osborne (Obertraun)': [47.5486, 13.6895],
  'Ferienwohnung Schmaranzer (Gosau)': [47.5805, 13.5258],
  'Haus im Grünen (Gosau)': [47.5832, 13.5388],
  'Mühlradl Apartments Gosau': [47.579, 13.531],
  'Pension Sydler (Bad Goisern)': [47.638, 13.622],
  'Weisses Lamm Holiday Home (Hallstatt)': [47.5618, 13.6483],
  'Heritage.Hotel Hallstatt (3 restored historic houses)': [47.5615, 13.6485],
  'Bräugasthof Hallstatt (700-year-old lake-edge inn)': [47.5618, 13.649],

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
// Per-base date ranges + Shabbat framing flag. Allison: "only the first
// salzburg is shabbat thats it" — non-Salzburg listings get the plain night
// count, no Shabbat language.
// ---------------------------------------------------------------------------
type BaseKey = 'salzburg' | 'obertraun' | 'berchtesgaden' | 'wolfgangsee' | 'airport';

interface BaseDateInfo {
  short: string; // pill on card
  long: string; // full sentence on expanded
  nights: number;
  bookingCheckIn: string; // YYYY-MM-DD for query param
  bookingCheckOut: string;
  shabbat: boolean;
}

const BASE_DATES: Record<BaseKey, BaseDateInfo> = {
  salzburg: {
    short: 'Fri Jul 24 → Sun Jul 26 (2 nights)',
    long: 'Friday Jul 24 → Sunday Jul 26, 2026 — 2 nights. This is the Shabbat anchor; all Salzburg picks are within walking distance of Chabad on Linzergasse.',
    nights: 2,
    bookingCheckIn: '2026-07-24',
    bookingCheckOut: '2026-07-26',
    shabbat: true,
  },
  obertraun: {
    short: 'Sun Jul 26 → Wed Jul 29 (3 nights)',
    long: 'Sunday Jul 26 → Wednesday Jul 29, 2026 — 3 nights. The deep midweek anchor for the Salzkammergut. (Wed night is the Schafbergspitze summit overnight — separate booking.)',
    nights: 3,
    bookingCheckIn: '2026-07-26',
    bookingCheckOut: '2026-07-29',
    shabbat: false,
  },
  berchtesgaden: {
    short: 'Sun Jul 26 → Wed Jul 29 (3 nights)',
    long: 'Sunday Jul 26 → Wednesday Jul 29, 2026 — 3 nights. Bavarian Alps midweek anchor. (Wed night is the Schafbergspitze summit overnight — separate booking.)',
    nights: 3,
    bookingCheckIn: '2026-07-26',
    bookingCheckOut: '2026-07-29',
    shabbat: false,
  },
  wolfgangsee: {
    short: 'Sun Jul 26 → Wed Jul 29 (3 nights)',
    long: 'Sunday Jul 26 → Wednesday Jul 29, 2026 — 3 nights. Wolfgangsee midweek anchor. (Wed night is the Schafbergspitze summit overnight — separate booking.)',
    nights: 3,
    bookingCheckIn: '2026-07-26',
    bookingCheckOut: '2026-07-29',
    shabbat: false,
  },
  airport: {
    short: 'Thu Jul 30 → Fri Jul 31 (1 night)',
    long: 'Thursday Jul 30 → Friday Jul 31, 2026 — 1 night. Pre-flight airport orbit for the LY5194 morning departure.',
    nights: 1,
    bookingCheckIn: '2026-07-30',
    bookingCheckOut: '2026-07-31',
    shabbat: false,
  },
};

// Date the lodging set was last live-verified on Booking.com (per
// fact-check passes 2026-05-15 / 2026-05-16 / 2026-05-17). Used for the
// "Verified DATE" trust pill per Avital trust rule.
const VERIFIED_DATE_LABEL = '2026-05-16';

// ---------------------------------------------------------------------------
// Filter taxonomies
// ---------------------------------------------------------------------------
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
  budgetTier: BudgetTier;
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
  isBeauty: boolean;
  beautyNote?: string;
  // Derived booleans for amenity filters
  hasWasher: boolean;
  hasWasherDryer: boolean;
  hasAc: boolean;
  hasFreeParking: boolean;
  hasFarmAnimals: boolean;
  hasLakeView: boolean;
  // Distance chips
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
  salzburg: '#3a6f8f',
  obertraun: '#2e5d4f',
  berchtesgaden: '#7a4f8f',
  wolfgangsee: '#2a8a8a',
  airport: '#777b7e',
};

// ---------------------------------------------------------------------------
// FILTER STATE — Booking-style: ALL sets start EMPTY = show ALL listings.
// Click a chip = ADD to the set = NARROW. Click again = REMOVE = WIDEN.
// (Old behavior: bases pre-populated, must un-click — Avital pushed back.)
// ---------------------------------------------------------------------------
interface FilterState {
  view: 'list' | 'grid' | 'map';
  showShortlistOnly: boolean;
  bases: Set<BaseKey>;
  tiers: Set<BudgetTier>;
  vibes: Set<LodgingVibe>;
  bedrooms: Set<'studio' | '1' | '2' | '3+'>;
  amenities: Set<'washer' | 'washer-dryer' | 'ac' | 'parking'>;
  platforms: Set<LodgingPlatform>;
}

const state: FilterState = {
  view: 'list',
  showShortlistOnly: false,
  bases: new Set(),
  tiers: new Set(),
  vibes: new Set(),
  bedrooms: new Set(),
  amenities: new Set(),
  platforms: new Set(),
};

// ---------------------------------------------------------------------------
// PICKS — localStorage primary, Supabase mirror.
// Schema: { [listingId]: { picked_at: ISO, by: 'avital'|'allison' } }
// ---------------------------------------------------------------------------
const PICKS_STORAGE_KEY = 'austria-lodging-picks';
const PICKER_KEY = 'austria-picker-author'; // 'avital' | 'allison'

interface PickRecord {
  picked_at: string;
  by: 'avital' | 'allison';
}

type PicksMap = Record<string, PickRecord>;

function readPicks(): PicksMap {
  try {
    const raw = localStorage.getItem(PICKS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PicksMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePicks(picks: PicksMap): void {
  try {
    localStorage.setItem(PICKS_STORAGE_KEY, JSON.stringify(picks));
  } catch {
    // private mode / quota — pick still works for the session, just not persisted
  }
}

function whoIsPicking(): 'avital' | 'allison' {
  try {
    const raw = localStorage.getItem(PICKER_KEY);
    if (raw === 'allison' || raw === 'avital') return raw;
  } catch {
    /* ignore */
  }
  return 'avital'; // default — Avital is the primary picker per Allison
}

function setWhoIsPicking(who: 'avital' | 'allison'): void {
  try {
    localStorage.setItem(PICKER_KEY, who);
  } catch {
    /* ignore */
  }
}

function isPicked(id: string): boolean {
  return Boolean(readPicks()[id]);
}

function togglePick(listing: UnifiedListing): void {
  const picks = readPicks();
  if (picks[listing.id]) {
    delete picks[listing.id];
    writePicks(picks);
    void mirrorPickToSupabase(listing, 'unpicked');
  } else {
    const by = whoIsPicking();
    picks[listing.id] = { picked_at: new Date().toISOString(), by };
    writePicks(picks);
    void mirrorPickToSupabase(listing, 'picked');
  }
}

// Best-effort mirror — never block UI on this. The pick state is local-first.
async function mirrorPickToSupabase(
  listing: UnifiedListing,
  action: 'picked' | 'unpicked',
): Promise<void> {
  const by = whoIsPicking();
  try {
    await insertNote({
      option: 'general',
      day_id: null,
      activity_id: `lodging:${listing.id}`,
      note_text: `[${action}] ${listing.name} — ${BASE_LABELS[listing.base]} (${listing.pricePerNight})`,
      author: by,
    });
  } catch {
    // Silent — local pick still works.
  }
}

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
  if (t === 'splurge') return 'mid-high';
  return t ?? 'standard';
}

function detectAmenity(details: string[] | undefined, keyword: RegExp): boolean {
  if (!details) return false;
  return details.some((d) => keyword.test(d));
}

function detectAmenityAcross(l: { notableDetails: string[]; note: string }, kw: RegExp): boolean {
  return detectAmenity(l.notableDetails, kw) || kw.test(l.note);
}

// ---------------------------------------------------------------------------
// Build the unified listings array from the three sources.
// ---------------------------------------------------------------------------
function buildListings(): UnifiedListing[] {
  const out: UnifiedListing[] = [];

  // 1) TRIP.lodgings — Salzburg / Hallstatt / Airport
  for (const l of TRIP.lodgings) {
    const base: BaseKey =
      l.baseKey === 'hallstatt' ? 'obertraun' : (l.baseKey as 'salzburg' | 'airport');

    const pickDetails = l.pickNotableDetails ?? [];
    const pickEntry: UnifiedListing = {
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
      hasFarmAnimals: false,
      hasLakeView: false,
      walkToChabadMin: l.pickWalkToChabadMin,
      driveToAirportMin: l.pickDriveToAirportMin,
    };
    pickEntry.hasFarmAnimals = detectAmenityAcross(pickEntry, /farm|goat|horse|bauernhof/i);
    pickEntry.hasLakeView = detectAmenityAcross(pickEntry, /lake[-\s]?view|lakefront|lake[-\s]?edge/i);
    out.push(pickEntry);

    for (const a of l.alts) {
      const dets = a.notableDetails ?? [];
      const altEntry: UnifiedListing = {
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
        hasFarmAnimals: false,
        hasLakeView: false,
        walkToChabadMin: a.walkToChabadMin,
        driveToAirportMin: a.driveToAirportMin,
      };
      altEntry.hasFarmAnimals = detectAmenityAcross(altEntry, /farm|goat|horse|bauernhof/i);
      altEntry.hasLakeView = detectAmenityAcross(altEntry, /lake[-\s]?view|lakefront|lake[-\s]?edge/i);
      out.push(altEntry);
    }
  }

  // 2) Alternative bases — Berchtesgaden + St. Wolfgang
  for (const cfg of BASE_CONFIGS) {
    if (cfg.id !== 'berchtesgaden' && cfg.id !== 'wolfgangsee') continue;
    const base: BaseKey = cfg.id;
    for (const p of cfg.lodging) {
      const dets = p.notableDetails ?? [];
      const entry: UnifiedListing = {
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
        hasFarmAnimals: false,
        hasLakeView: false,
      };
      entry.hasFarmAnimals = detectAmenityAcross(entry, /farm|goat|horse|bauernhof/i);
      entry.hasLakeView = detectAmenityAcross(entry, /lake[-\s]?view|lakefront|lake[-\s]?edge/i);
      out.push(entry);
    }
  }

  return out;
}

const ALL_LISTINGS = buildListings();

// ---------------------------------------------------------------------------
// Drive-time matrix per listing — uses the base config's matrix. The vast
// majority of lodgings live in one of the 4 base centroids; for those we
// inherit the BASE_CONFIGS matrix directly. (Berghotel Schafbergspitze + the
// other peak/edge cases live in SUNSET_STAYS — separate UI.)
// ---------------------------------------------------------------------------
interface DriveRow {
  destinationId: string;
  destinationName: string;
  fromBaseMin: number;
}

function driveMatrixForListing(l: UnifiedListing): DriveRow[] {
  // Map listing base → BASE_CONFIGS id. salzburg + airport have no config
  // (those are the static Salzburg + airport orbits — we synthesize a
  // simple matrix using NATURE_DESTINATIONS' fromSalzburgMin field).
  const cfgIdMap: Partial<Record<BaseKey, 'obertraun' | 'berchtesgaden' | 'wolfgangsee'>> = {
    obertraun: 'obertraun',
    berchtesgaden: 'berchtesgaden',
    wolfgangsee: 'wolfgangsee',
  };
  const cfgId = cfgIdMap[l.base];
  if (cfgId) {
    const cfg = BASE_CONFIGS.find((c) => c.id === cfgId);
    if (cfg) {
      return cfg.driveMatrix.map((r) => ({
        destinationId: r.destinationId,
        destinationName: r.destinationName,
        fromBaseMin: r.fromBaseMin,
      }));
    }
  }
  // Salzburg + airport — synthesize from NATURE_DESTINATIONS.fromSalzburgMin
  // (both bases are within 15 min of the city centroid; close enough).
  return NATURE_DESTINATIONS.map((d) => ({
    destinationId: d.id,
    destinationName: d.name,
    fromBaseMin: d.fromSalzburgMin,
  }));
}

function driveBucketClass(min: number): string {
  if (min < 30) return 'drive-row--green';
  if (min < 60) return 'drive-row--yellow';
  if (min < 90) return 'drive-row--orange';
  return 'drive-row--red';
}

function renderDriveMatrix(l: UnifiedListing): string {
  const rows = driveMatrixForListing(l).slice().sort((a, b) => a.fromBaseMin - b.fromBaseMin);
  if (rows.length === 0) return '';
  const closest = rows.slice(0, 3);
  const farthest = rows.slice(-3).reverse();
  const rowHtml = rows
    .map(
      (r) => `
        <tr class="drive-row ${driveBucketClass(r.fromBaseMin)}">
          <td>${escapeHtml(r.destinationName)}</td>
          <td class="drive-row__min">${r.fromBaseMin} min</td>
        </tr>`,
    )
    .join('');
  return `
    <div class="drive-matrix" data-drive-matrix>
      <h4 class="drive-matrix__title">Drive times from this stay</h4>
      <table class="drive-matrix__table">
        <tbody>${rowHtml}</tbody>
      </table>
      <div class="drive-matrix__summary">
        <div>
          <strong>Closest 3:</strong>
          <ul>${closest.map((r) => `<li>${escapeHtml(r.destinationName)} — ${r.fromBaseMin} min</li>`).join('')}</ul>
        </div>
        <div>
          <strong>Farthest 3:</strong>
          <ul>${farthest.map((r) => `<li>${escapeHtml(r.destinationName)} — ${r.fromBaseMin} min</li>`).join('')}</ul>
        </div>
      </div>
      <p class="drive-matrix__legend">
        <span class="drive-matrix__swatch drive-matrix__swatch--green"></span>&lt;30 min
        <span class="drive-matrix__swatch drive-matrix__swatch--yellow"></span>30–59
        <span class="drive-matrix__swatch drive-matrix__swatch--orange"></span>60–89
        <span class="drive-matrix__swatch drive-matrix__swatch--red"></span>90+
      </p>
    </div>`;
}

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
  const picks = readPicks();
  return ALL_LISTINGS.filter((l) => {
    if (state.showShortlistOnly && !picks[l.id]) return false;
    // Booking-style: empty filter set = ALL. Selected = only those.
    if (state.bases.size > 0 && !state.bases.has(l.base)) return false;
    if (state.tiers.size > 0 && !state.tiers.has(l.budgetTier)) return false;
    if (state.vibes.size > 0 && !state.vibes.has(l.vibe)) return false;
    if (state.bedrooms.size > 0) {
      const b = bedroomBucket(l.bedrooms);
      if (!b || !state.bedrooms.has(b)) return false;
    }
    if (state.amenities.size > 0) {
      if (state.amenities.has('washer') && !l.hasWasher) return false;
      if (state.amenities.has('washer-dryer') && !l.hasWasherDryer) return false;
      if (state.amenities.has('ac') && !l.hasAc) return false;
      if (state.amenities.has('parking') && !l.hasFreeParking) return false;
    }
    if (state.platforms.size > 0 && !state.platforms.has(l.platform)) return false;
    return true;
  });
}

// Counter per filter option (Booking-style "Washer (12)") — counts listings
// that would match IF this single filter value were added to the current
// state. Other filter sets stay applied.
type FilterGroupKey = 'bases' | 'tiers' | 'vibes' | 'bedrooms' | 'amenities' | 'platforms';

function countForOption(group: FilterGroupKey, value: string): number {
  return ALL_LISTINGS.filter((l) => {
    if (state.showShortlistOnly && !readPicks()[l.id]) return false;
    for (const g of ['bases', 'tiers', 'vibes', 'bedrooms', 'amenities', 'platforms'] as const) {
      const currentSet = state[g] as Set<string>;
      if (g === group) {
        // Hypothetical: this option also selected.
        const merged = new Set<string>(currentSet);
        merged.add(value);
        if (!setMatchesListing(g, merged, l)) return false;
      } else if (currentSet.size > 0) {
        if (!setMatchesListing(g, currentSet, l)) return false;
      }
    }
    return true;
  }).length;
}

function setMatchesListing(
  group: 'bases' | 'tiers' | 'vibes' | 'bedrooms' | 'amenities' | 'platforms',
  set: Set<string>,
  l: UnifiedListing,
): boolean {
  switch (group) {
    case 'bases':
      return set.has(l.base);
    case 'tiers':
      return set.has(l.budgetTier);
    case 'vibes':
      return set.has(l.vibe);
    case 'bedrooms': {
      const b = bedroomBucket(l.bedrooms);
      return Boolean(b && set.has(b));
    }
    case 'amenities': {
      if (set.has('washer') && !l.hasWasher) return false;
      if (set.has('washer-dryer') && !l.hasWasherDryer) return false;
      if (set.has('ac') && !l.hasAc) return false;
      if (set.has('parking') && !l.hasFreeParking) return false;
      return true;
    }
    case 'platforms':
      return set.has(l.platform);
  }
}

// ---------------------------------------------------------------------------
// Card rendering — Booking-style
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

function laundryChip(l: LodgingLaundry, base: BaseKey): string {
  // Per Allison: washer/dryer should ALWAYS be prominent.
  if (l === 'washer+dryer') return '<span class="lodging-chip lodging-chip--good">🧺🌬 Washer + dryer</span>';
  if (l === 'washer') return '<span class="lodging-chip lodging-chip--good">🧺 Washer</span>';
  if (l === 'shared') return '<span class="lodging-chip">🧺 Shared laundry</span>';
  if (l === 'none')
    return base === 'salzburg' || base === 'airport'
      ? '<span class="lodging-chip lodging-chip--warn">🚫 No washer</span>'
      : '<span class="lodging-chip">🚫 No washer</span>';
  return '<span class="lodging-chip lodging-chip--neutral">🧺 Washer? unconfirmed</span>';
}

function bedroomChip(b: UnifiedListing['bedrooms'], beds?: string): string {
  let label = '';
  if (b === 'studio') label = 'Studio';
  else if (typeof b === 'number') label = `${b} BR`;
  if (!label && !beds) return '';
  const bedsPart = beds ? ` · ${escapeHtml(beds)}` : '';
  return `<span class="lodging-chip">🛏 ${label}${bedsPart}</span>`;
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

function verifiedPill(): string {
  return `<span class="lodging-chip lodging-chip--verified" title="Last live-checked on Booking.com">✓ Verified ${VERIFIED_DATE_LABEL}</span>`;
}

function datePill(base: BaseKey): string {
  const d = BASE_DATES[base];
  const note = d.shabbat ? ' · Shabbat anchor' : '';
  return `<span class="lodging-chip lodging-chip--date">📅 ${escapeHtml(d.short)}${escapeHtml(note)}</span>`;
}

// Booking URL with check-in/check-out + 2 adults baked in. Falls back to the
// raw URL if it already has params.
function bookingUrlWithDates(rawUrl: string, base: BaseKey): string {
  const d = BASE_DATES[base];
  if (!rawUrl.includes('booking.com/')) return rawUrl;
  const sep = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${sep}checkin=${d.bookingCheckIn}&checkout=${d.bookingCheckOut}&group_adults=2&no_rooms=1`;
}

// TLDR line — ≤50 words, scan-able. Tries to capture: price · BR · setting ·
// laundry · standout distance fact. Per Avital wow-factor + grasp rule.
function buildTldr(l: UnifiedListing): string {
  const parts: string[] = [];
  parts.push(l.pricePerNight);
  if (l.bedrooms === 'studio') parts.push('Studio');
  else if (typeof l.bedrooms === 'number') parts.push(`${l.bedrooms} BR`);
  if (l.hasLakeView) parts.push('lake view');
  if (l.vibe === 'farm-stay' || l.hasFarmAnimals) parts.push('working farm');
  else if (l.vibe === 'lake-edge') parts.push('lake-edge');
  else if (l.vibe === 'forest-cabin') parts.push('forest cabin');
  else if (l.vibe === 'nature-view') parts.push('nature view');
  if (l.hasWasherDryer) parts.push('washer + dryer');
  else if (l.hasWasher) parts.push('washer');
  if (l.walkToChabadMin) parts.push(`${l.walkToChabadMin}-min walk to Chabad`);
  if (l.driveToAirportMin) parts.push(`${l.driveToAirportMin} min to SZG`);
  // Cap word count
  const joined = parts.join(' · ');
  return joined.split(/\s+/).slice(0, 50).join(' ');
}

function amenitiesIconRow(l: UnifiedListing): string {
  const icons: string[] = [];
  if (l.hasWasherDryer) icons.push('<span title="Washer + dryer">🧺🌬</span>');
  else if (l.hasWasher) icons.push('<span title="Washer">🧺</span>');
  if (l.hasAc) icons.push('<span title="AC">❄️</span>');
  if (l.hasFreeParking) icons.push('<span title="Free parking">🅿️</span>');
  if (l.hasLakeView) icons.push('<span title="Lake view">🌊</span>');
  if (l.hasFarmAnimals) icons.push('<span title="Farm animals">🐎</span>');
  if (l.vibe === 'nature-view' || l.vibe === 'forest-cabin') icons.push('<span title="Nature view">🏔</span>');
  icons.push('<span title="Wi-Fi (standard at all listings)">📶</span>');
  icons.push('<span title="Kitchen (standard)">🍳</span>');
  return `<div class="lodging-amenities">${icons.join('')}</div>`;
}

function distanceChips(l: UnifiedListing): string {
  const chips: string[] = [];
  if (l.walkToChabadMin) chips.push(`<span class="lodging-chip">🚶 ${l.walkToChabadMin} min to Chabad</span>`);
  if (l.driveToAirportMin) chips.push(`<span class="lodging-chip">✈ ${l.driveToAirportMin} min to SZG</span>`);
  // Nearest nature destination (under 30 min) — pull from the drive matrix
  const matrix = driveMatrixForListing(l).slice().sort((a, b) => a.fromBaseMin - b.fromBaseMin);
  const closest = matrix[0];
  if (closest && closest.fromBaseMin > 0) {
    chips.push(
      `<span class="lodging-chip">🏞 ${closest.fromBaseMin} min to ${escapeHtml(closest.destinationName)}</span>`,
    );
  }
  return chips.length ? `<div class="lodging-distances">${chips.join('')}</div>` : '';
}

function pickButtonHtml(l: UnifiedListing): string {
  const picked = isPicked(l.id);
  const cls = picked ? 'lodging-pick-btn lodging-pick-btn--on' : 'lodging-pick-btn';
  const label = picked ? '★ Picked' : '+ Pick this';
  const aria = picked ? 'Unpick this stay' : 'Pick this stay';
  return `<button type="button" class="${cls}" data-pick-id="${escapeHtml(l.id)}" aria-pressed="${picked}" aria-label="${aria}">${label}</button>`;
}

function renderListingCard(l: UnifiedListing, variant: 'list' | 'grid'): string {
  const chips = [
    pickBadgeHtml(l.isPick),
    beautyBadgeHtml(l.isBeauty),
    baseBadge(l.base),
    tierBadge(l.budgetTier),
    vibeBadge(l.vibe),
  ]
    .filter(Boolean)
    .join('');

  const lodgingChips = [
    datePill(l.base),
    bedroomChip(l.bedrooms, l.beds),
    laundryChip(l.laundry, l.base),
    verifiedPill(),
  ]
    .filter(Boolean)
    .join('');

  const cardClass = [
    'stay-card',
    'lodging-card',
    variant === 'grid' ? 'stay-card--grid' : 'stay-card--list',
    l.isBeauty ? 'stay-card--beauty' : '',
    isPicked(l.id) ? 'lodging-card--picked' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const beautyLine =
    l.isBeauty && l.beautyNote
      ? `<p class="stay-card__beauty-note">✨ ${escapeHtml(l.beautyNote)}</p>`
      : '';

  const bookingUrl = bookingUrlWithDates(l.url, l.base);
  const tldr = buildTldr(l);
  const matrixHtml = renderDriveMatrix(l);

  return `
    <article class="${cardClass}" id="card-${escapeHtml(l.id)}" data-base="${l.base}">
      <div class="lodging-card__media">
        <img class="stay-card__img" loading="lazy" src="${escapeHtml(l.img)}" alt="${escapeHtml(l.name)}" />
        ${pickButtonHtml(l)}
      </div>
      <div class="stay-card__body lodging-card__body">
        <p class="lodging-tldr">${escapeHtml(tldr)}</p>
        <h3 class="stay-card__name">${escapeHtml(l.name)}</h3>
        <div class="stay-card__meta">${escapeHtml(l.review)} · <strong>${escapeHtml(l.pricePerNight)}</strong></div>
        <div class="stay-card__chips lodging-chips">${lodgingChips}</div>
        ${amenitiesIconRow(l)}
        ${distanceChips(l)}
        ${beautyLine}
        <details class="lodging-details">
          <summary class="lodging-details__summary">More info · drive times · full notes</summary>
          <div class="lodging-details__body">
            <p class="stay-card__note">${escapeHtml(l.note)}</p>
            <div class="stay-card__chips">${chips}${platformBadge(l.platform)}</div>
            ${matrixHtml}
          </div>
        </details>
        <div class="lodging-card__actions">
          <a class="lodging-cta lodging-cta--primary" href="${escapeHtml(bookingUrl)}" target="_blank" rel="noreferrer noopener" aria-label="Open ${escapeHtml(l.name)} on Booking.com">
            Book on Booking.com →
          </a>
          <a class="lodging-cta lodging-cta--ghost" href="#card-${escapeHtml(l.id)}" data-map-jump="${escapeHtml(l.id)}">
            Show on map ↑
          </a>
        </div>
      </div>
    </article>`;
}

// ---------------------------------------------------------------------------
// View rendering
// ---------------------------------------------------------------------------
function renderListView(items: UnifiedListing[]): string {
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
      const d = BASE_DATES[b];
      return `
        <section class="stay-group" id="group-${b}">
          <header class="stay-group__head">
            <span class="stay-group__dot" style="background:${BASE_COLORS[b]}"></span>
            <h2 class="stay-group__title">${BASE_LABELS[b]}</h2>
            <span class="stay-group__count">${groups[b].length} listing${groups[b].length === 1 ? '' : 's'}</span>
            <span class="stay-group__dates">${escapeHtml(d.short)}</span>
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
// Sunset Stays — unchanged from beautiful-lodging-hunt agent.
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
            <h4 class="sunset-stay__sub">Self-catering on the mountain</h4>
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
// Filter bar rendering — Booking-style
// ---------------------------------------------------------------------------
interface ChipDef<V extends string> {
  value: V;
  label: string;
}

function renderChipGroup<V extends string>(
  groupLabel: string,
  chips: ChipDef<V>[],
  selected: Set<V>,
  groupKey: FilterGroupKey,
): string {
  const buttons = chips
    .map((c) => {
      const isOn = selected.has(c.value);
      const count = countForOption(groupKey, c.value);
      const countHtml = ` <span class="filter-chip__count">(${count})</span>`;
      return `<button type="button" class="filter-chip${isOn ? ' is-on' : ''}" data-group="${groupKey}" data-value="${c.value}" aria-pressed="${isOn}">${escapeHtml(c.label)}${countHtml}</button>`;
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
    { value: 'washer-dryer', label: '🧺🌬 Washer + dryer' },
    { value: 'ac', label: '❄️ AC' },
    { value: 'parking', label: '🅿️ Free parking' },
  ];
  const platforms: ChipDef<LodgingPlatform>[] = [
    { value: 'booking', label: 'Booking.com' },
    { value: 'airbnb', label: 'Airbnb' },
    { value: 'urlaub-am-bauernhof', label: 'Urlaub am Bauernhof' },
  ];

  const totalActive =
    state.bases.size +
    state.tiers.size +
    state.vibes.size +
    state.bedrooms.size +
    state.amenities.size +
    state.platforms.size;

  const activeSummary =
    totalActive > 0
      ? `<span class="filter-bar__active">${totalActive} filter${totalActive === 1 ? '' : 's'} active</span>`
      : '<span class="filter-bar__active filter-bar__active--empty">No filters · showing everything. Click a chip to narrow.</span>';

  return `
    <div class="filter-bar__count">
      <strong>${matchCount}</strong> of ${ALL_LISTINGS.length} listings
      ${activeSummary}
      ${totalActive > 0 ? `<button type="button" class="filter-clear" id="filter-clear">Clear all</button>` : ''}
    </div>
    ${renderChipGroup('Base', bases, state.bases, 'bases')}
    ${renderChipGroup('Budget', tiers, state.tiers, 'tiers')}
    ${renderChipGroup('Vibe', vibes, state.vibes, 'vibes')}
    ${renderChipGroup('Bedrooms', bedrooms, state.bedrooms, 'bedrooms')}
    ${renderChipGroup('Amenities', amenities, state.amenities, 'amenities')}
    ${renderChipGroup('Platform', platforms, state.platforms, 'platforms')}`;
}

// ---------------------------------------------------------------------------
// Shortlist sticky bar
// ---------------------------------------------------------------------------
function renderShortlistBar(): string {
  const picks = readPicks();
  const count = Object.keys(picks).length;
  if (count === 0) {
    if (state.showShortlistOnly) {
      // Edge case: user toggled shortlist-only but then unpicked everything
      return `
        <div class="shortlist-bar shortlist-bar--empty">
          <span>Your shortlist is empty.</span>
          <button type="button" class="shortlist-bar__btn" id="shortlist-show-all">Show all stays</button>
        </div>`;
    }
    return '';
  }
  const picker = whoIsPicking();
  const toggleLabel = state.showShortlistOnly ? 'Show all stays' : 'Show shortlist only';
  return `
    <div class="shortlist-bar">
      <span class="shortlist-bar__count">★ ${count} stay${count === 1 ? '' : 's'} picked</span>
      <span class="shortlist-bar__author" title="Switch picker">
        Picking as
        <select id="shortlist-picker" aria-label="Who is picking">
          <option value="avital"${picker === 'avital' ? ' selected' : ''}>Avital</option>
          <option value="allison"${picker === 'allison' ? ' selected' : ''}>Allison</option>
        </select>
      </span>
      <button type="button" class="shortlist-bar__btn" id="shortlist-toggle">${toggleLabel}</button>
      <button type="button" class="shortlist-bar__btn shortlist-bar__btn--ghost" id="shortlist-clear">Clear shortlist</button>
    </div>`;
}

// ---------------------------------------------------------------------------
// Map (Leaflet) — single instance, re-pinned on filter change.
// ---------------------------------------------------------------------------
let mapInstance: LeafletMap | null = null;
let mapMarkers: LeafletMarker[] = [];

function ensureMap(): void {
  if (mapInstance) return;
  if (typeof L === 'undefined') return;
  mapInstance = L.map('stay-map', { scrollWheelZoom: false }).setView([47.65, 13.3], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(mapInstance);
}

function renderMapPins(items: UnifiedListing[]): void {
  if (!mapInstance) return;
  for (const m of mapMarkers) {
    mapInstance.removeLayer(m);
  }
  mapMarkers = [];

  const corners: [number, number][] = [];
  for (const l of items) {
    if (!l.coords) continue;
    corners.push(l.coords);
    const color = BASE_COLORS[l.base];
    const picked = isPicked(l.id);
    const ring = picked
      ? `<span class="stay-pin__ring"></span>`
      : '';
    const icon = L.divIcon({
      className: 'stay-pin',
      html: `${ring}<span class="stay-pin__dot" style="background:${color}"></span>`,
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
        <a href="${escapeHtml(bookingUrlWithDates(l.url, l.base))}" target="_blank" rel="noreferrer noopener">Booking ↗</a>
      </div>`;
    m.bindPopup(popupHtml);
    mapMarkers.push(m);
  }

  if (corners.length > 0) {
    const bounds = L.latLngBounds(corners).pad(0.15);
    mapInstance.fitBounds(bounds, { maxZoom: 12 });
  }
  setTimeout(() => mapInstance?.invalidateSize(), 50);
}

// ---------------------------------------------------------------------------
// Wiring + render loop
// ---------------------------------------------------------------------------
function readHash(): void {
  const h = window.location.hash.replace('#', '');
  if (h === 'list' || h === 'grid' || h === 'map') state.view = h;
  if (h === 'shortlist') {
    state.view = 'grid';
    state.showShortlistOnly = true;
  }
}

function writeHash(): void {
  const h = state.showShortlistOnly ? '#shortlist' : `#${state.view}`;
  if (window.location.hash !== h) {
    history.replaceState(null, '', h);
  }
}

function renderViewToggle(): string {
  const opt = (v: 'list' | 'grid' | 'map', label: string, icon: string) =>
    `<button type="button" class="view-toggle__btn${state.view === v && !state.showShortlistOnly ? ' is-on' : ''}" data-view="${v}" aria-pressed="${state.view === v && !state.showShortlistOnly}">${icon} ${label}</button>`;
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

  const shortlistEl = document.querySelector<HTMLDivElement>('#shortlist-bar-slot');
  if (shortlistEl) shortlistEl.innerHTML = renderShortlistBar();

  const listEl = document.querySelector<HTMLDivElement>('#stay-listings');
  if (listEl) {
    if (state.view === 'list' && !state.showShortlistOnly) listEl.innerHTML = renderListView(matched);
    else if (state.view === 'grid' || state.showShortlistOnly) listEl.innerHTML = renderGridView(matched);
    else listEl.innerHTML = renderMapView(matched);
  }

  ensureMap();
  renderMapPins(matched);

  writeHash();
  bindDynamicHandlers();
}

function bindDynamicHandlers(): void {
  // View toggle
  document.querySelectorAll<HTMLButtonElement>('.view-toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-view') as FilterState['view'];
      state.view = v;
      state.showShortlistOnly = false;
      renderShell();
    });
  });

  // Filter chips
  document.querySelectorAll<HTMLButtonElement>('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-group') as FilterGroupKey;
      const value = btn.getAttribute('data-value') ?? '';
      const set = state[group] as Set<string>;
      if (set.has(value)) set.delete(value);
      else set.add(value);
      // NEW behavior — NO auto-restore. If bases set is empty, just show all.
      renderShell();
    });
  });

  // Clear filters
  const clearBtn = document.querySelector<HTMLButtonElement>('#filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.bases.clear();
      state.tiers.clear();
      state.vibes.clear();
      state.bedrooms.clear();
      state.amenities.clear();
      state.platforms.clear();
      renderShell();
    });
  }

  const emptyClear = document.querySelector<HTMLButtonElement>('#empty-clear');
  if (emptyClear) {
    emptyClear.addEventListener('click', () => {
      state.bases.clear();
      state.tiers.clear();
      state.vibes.clear();
      state.bedrooms.clear();
      state.amenities.clear();
      state.platforms.clear();
      state.showShortlistOnly = false;
      renderShell();
    });
  }

  // Pick buttons
  document.querySelectorAll<HTMLButtonElement>('[data-pick-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-pick-id') ?? '';
      const listing = ALL_LISTINGS.find((l) => l.id === id);
      if (!listing) return;
      togglePick(listing);
      renderShell();
    });
  });

  // Shortlist toggle
  const shortlistToggle = document.querySelector<HTMLButtonElement>('#shortlist-toggle');
  if (shortlistToggle) {
    shortlistToggle.addEventListener('click', () => {
      state.showShortlistOnly = !state.showShortlistOnly;
      if (state.showShortlistOnly) state.view = 'grid';
      renderShell();
    });
  }
  const shortlistShowAll = document.querySelector<HTMLButtonElement>('#shortlist-show-all');
  if (shortlistShowAll) {
    shortlistShowAll.addEventListener('click', () => {
      state.showShortlistOnly = false;
      renderShell();
    });
  }
  const shortlistClear = document.querySelector<HTMLButtonElement>('#shortlist-clear');
  if (shortlistClear) {
    shortlistClear.addEventListener('click', () => {
      if (!confirm('Clear all picked stays?')) return;
      writePicks({});
      state.showShortlistOnly = false;
      renderShell();
    });
  }
  const pickerSelect = document.querySelector<HTMLSelectElement>('#shortlist-picker');
  if (pickerSelect) {
    pickerSelect.addEventListener('change', () => {
      const v = pickerSelect.value as 'avital' | 'allison';
      setWhoIsPicking(v);
    });
  }

  // Map popup jump anchors
  document.querySelectorAll<HTMLAnchorElement>('.stay-pin-popup__jump').forEach((a) => {
    a.addEventListener('click', () => {
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

  // "Show on map" buttons on cards — scroll to top map
  document.querySelectorAll<HTMLAnchorElement>('[data-map-jump]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const mapEl = document.querySelector<HTMLDivElement>('#stay-map');
      if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Mobile filter sheet
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

  const sunsetSlot = document.querySelector<HTMLDivElement>('#sunset-stays-slot');
  if (sunsetSlot) sunsetSlot.innerHTML = renderSunsetStays();

  let tries = 0;
  const poll = (): void => {
    if (typeof L !== 'undefined' || tries++ > 20) {
      renderShell();
    } else {
      setTimeout(poll, 100);
    }
  };
  poll();

  window.addEventListener('hashchange', () => {
    readHash();
    renderShell();
  });
}

init();
initNotesWidget();
initChatPlanPopup();
