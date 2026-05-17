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
  type LodgingKitchen,
  type LodgingBath,
  type LodgingParking,
  type LodgingViewType,
  type LodgingAvailability,
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
    short: 'Fri Jul 24 → Sun Jul 26 (2N) · Shabbat Fri night',
    long: 'Friday Jul 24 → Sunday Jul 26, 2026 — 2 nights. Shabbat is Fri Jul 24 night only (candle-lighting 20:35 Fri → Havdalah 21:49 Sat). All Salzburg picks are within walking distance of Chabad on Linzergasse.',
    nights: 2,
    bookingCheckIn: '2026-07-24',
    bookingCheckOut: '2026-07-26',
    shabbat: true,
  },
  obertraun: {
    short: 'Sun Jul 26 → Wed Jul 29 (3N)',
    long: 'Sunday Jul 26 → Wednesday Jul 29, 2026 — 3 nights. The deep midweek anchor for the Salzkammergut. (Wed Jul 29 night is the Schafbergspitze summit overnight — separate booking, see Sunset stays.)',
    nights: 3,
    bookingCheckIn: '2026-07-26',
    bookingCheckOut: '2026-07-29',
    shabbat: false,
  },
  berchtesgaden: {
    short: 'Sun Jul 26 → Wed Jul 29 (3N)',
    long: 'Sunday Jul 26 → Wednesday Jul 29, 2026 — 3 nights. Bavarian Alps midweek anchor. (Wed Jul 29 night is the Schafbergspitze summit overnight — separate booking.)',
    nights: 3,
    bookingCheckIn: '2026-07-26',
    bookingCheckOut: '2026-07-29',
    shabbat: false,
  },
  wolfgangsee: {
    short: 'Sun Jul 26 → Wed Jul 29 (3N)',
    long: 'Sunday Jul 26 → Wednesday Jul 29, 2026 — 3 nights. Wolfgangsee midweek anchor. (Wed Jul 29 night is the Schafbergspitze summit overnight — separate booking.)',
    nights: 3,
    bookingCheckIn: '2026-07-26',
    bookingCheckOut: '2026-07-29',
    shabbat: false,
  },
  airport: {
    short: 'Thu Jul 30 → Fri Jul 31 (1N) · pre-flight',
    long: 'Thursday Jul 30 → Friday Jul 31, 2026 — 1 night. Pre-flight airport orbit for the LY5194 08:55 morning departure (~06:15 rental-car drop).',
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
  // Carousel photos (added 2026-05-17 by lodging-carousel agent — Avital's
  // "Can we have multiple picture for sleeping where we can swipe between
  // pictures"). When empty/undefined, renderer falls back to [img].
  photos?: string[];
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
  // Data-completeness fields (added 2026-05-17 by booking-deep-verify agent)
  maxGuests?: number;
  kitchen: LodgingKitchen;
  bath: LodgingBath;
  parking: LodgingParking;
  wifi: boolean;
  viewType: LodgingViewType;
  // Live availability (Playwright sweep 2026-05-17).
  availability: LodgingAvailability;
  availabilityCheckedDate?: string;
  availabilityNote?: string;
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
  // Free cancellation (added 2026-05-17 evening by booking-genius agent —
  // Allison's hard rule: "All bookings need free cancellation"). Default
  // true for all booking.com listings (Booking offers free-cancel on the
  // vast majority of properties; we filter out non-FC rates at booking time
  // via URL params). Explicit `freeCancellation: false` opts out per listing.
  freeCancellation: boolean;
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
type SortKey = 'best-fit' | 'price-low' | 'score-high' | 'walk-chabad' | 'closest-nature';

interface FilterState {
  view: 'list' | 'grid' | 'map';
  showShortlistOnly: boolean;
  bases: Set<BaseKey>;
  tiers: Set<BudgetTier>;
  vibes: Set<LodgingVibe>;
  bedrooms: Set<'studio' | '1' | '2' | '3+'>;
  amenities: Set<'washer' | 'washer-dryer' | 'ac' | 'parking'>;
  platforms: Set<LodgingPlatform>;
  sort: SortKey;
}

const SORT_STORAGE_KEY = 'austria-lodging-sort';
const TOOLTIP_STORAGE_KEY = 'austria-lodging-filter-tooltip-seen';

function loadStoredSort(): SortKey {
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY);
    if (
      raw === 'best-fit' ||
      raw === 'price-low' ||
      raw === 'score-high' ||
      raw === 'walk-chabad' ||
      raw === 'closest-nature'
    )
      return raw;
  } catch {
    /* ignore */
  }
  return 'best-fit';
}

function storeSort(s: SortKey): void {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, s);
  } catch {
    /* ignore */
  }
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
  sort: loadStoredSort(),
};

// Compare-2 mode: holds up to 2 listing ids the user has selected via the
// 📊 Compare icon on the card. When length hits 2, the compare modal opens
// automatically. Reset on close. Per stay-ux deliverable B (2026-05-17).
const compareSelection: string[] = [];

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
      photos: l.pickPhotos,
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
      maxGuests: l.pickMaxGuests,
      kitchen: l.pickKitchen ?? 'unknown',
      bath: l.pickBath ?? 'unknown',
      parking: l.pickParking ?? 'unknown',
      wifi: l.pickWifi ?? true,
      viewType: l.pickViewType ?? 'unknown',
      availability: l.pickAvailability ?? 'unverified',
      availabilityCheckedDate: l.pickAvailabilityCheckedDate,
      availabilityNote: l.pickAvailabilityNote,
      coords: COORDS[l.pickName],
      isPick: true,
      isBeauty: false,
      hasWasher:
        l.pickLaundry === 'washer' ||
        l.pickLaundry === 'washer+dryer' ||
        detectAmenity(pickDetails, /washing\s*machine|washer/i),
      hasWasherDryer: l.pickLaundry === 'washer+dryer' || detectAmenity(pickDetails, /dryer/i),
      hasAc: l.pickAc === true || detectAmenity(pickDetails, /\bAC\b|air[-\s]?cond/i),
      hasFreeParking: l.pickParking === 'free' || detectAmenity(pickDetails, /free\s*parking/i),
      hasFarmAnimals: false,
      hasLakeView: false,
      // Allison's hard rule 2026-05-16: "All bookings need free cancellation."
      // Defaults true for all booking.com properties (they offer FC on the
      // vast majority of rates — URL filter below applies it at booking time).
      // Explicit false in trip-data.ts opts out.
      freeCancellation: l.pickFreeCancellation ?? true,
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
        photos: a.photos,
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
        maxGuests: a.maxGuests,
        kitchen: a.kitchen ?? 'unknown',
        bath: a.bath ?? 'unknown',
        parking: a.parking ?? 'unknown',
        wifi: a.wifi ?? true,
        viewType: a.viewType ?? 'unknown',
        availability: a.availability ?? 'unverified',
        availabilityCheckedDate: a.availabilityCheckedDate,
        availabilityNote: a.availabilityNote,
        coords: COORDS[a.name],
        isPick: false,
        isBeauty: a.beautyPick === true,
        beautyNote: a.beautyNote,
        hasWasher:
          a.laundry === 'washer' ||
          a.laundry === 'washer+dryer' ||
          detectAmenity(dets, /washing\s*machine|washer/i),
        hasWasherDryer: a.laundry === 'washer+dryer' || detectAmenity(dets, /dryer/i),
        hasAc: a.ac === true || detectAmenity(dets, /\bAC\b|air[-\s]?cond/i),
        hasFreeParking: a.parking === 'free' || detectAmenity(dets, /free\s*parking/i),
        hasFarmAnimals: false,
        hasLakeView: false,
        freeCancellation: a.freeCancellation ?? true,
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
        photos: p.photos,
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
        maxGuests: p.maxGuests,
        kitchen: p.kitchen ?? 'unknown',
        bath: p.bath ?? 'unknown',
        parking: p.parking ?? 'unknown',
        wifi: p.wifi ?? true,
        viewType: p.viewType ?? 'unknown',
        availability: p.availability ?? 'unverified',
        availabilityCheckedDate: p.availabilityCheckedDate,
        availabilityNote: p.availabilityNote,
        coords: COORDS[p.name],
        isPick: false,
        isBeauty: false,
        hasWasher:
          p.laundry === 'washer' ||
          p.laundry === 'washer+dryer' ||
          detectAmenity(dets, /washing\s*machine|washer/i),
        hasWasherDryer: p.laundry === 'washer+dryer' || detectAmenity(dets, /dryer/i),
        hasAc: p.ac === true || detectAmenity(dets, /\bAC\b|air[-\s]?cond/i),
        hasFreeParking: p.parking === 'free' || detectAmenity(dets, /free\s*parking/i),
        hasFarmAnimals: false,
        hasLakeView: false,
        freeCancellation: p.freeCancellation ?? true,
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

// Parse e.g. "€95-120" or "€78" → 95 (low end). Falls back to Infinity for sort.
function parsePriceLow(price: string): number {
  const m = /(\d{2,4})/.exec(price.replace(/[,\s]/g, ''));
  if (!m || !m[1]) return Infinity;
  return parseInt(m[1], 10);
}

// Parse e.g. "8.7 · 412 reviews" → 8.7. Falls back to -1 for sort.
function parseReviewScore(review: string): number {
  const m = /(\d{1,2}\.\d)/.exec(review);
  if (!m || !m[1]) return -1;
  return parseFloat(m[1]);
}

// Closest nature destination drive-time in minutes (min across the matrix).
// Used by "Closest to nature" sort. Returns Infinity if no matrix.
function closestNatureMin(l: UnifiedListing): number {
  const matrix = driveMatrixForListing(l);
  if (matrix.length === 0) return Infinity;
  return matrix.reduce((m, r) => Math.min(m, r.fromBaseMin), Infinity);
}

function sortListings(items: UnifiedListing[]): UnifiedListing[] {
  const out = items.slice();
  switch (state.sort) {
    case 'price-low':
      out.sort((a, b) => parsePriceLow(a.pricePerNight) - parsePriceLow(b.pricePerNight));
      break;
    case 'score-high':
      out.sort((a, b) => parseReviewScore(b.review) - parseReviewScore(a.review));
      break;
    case 'walk-chabad':
      // Salzburg-only sort; non-Salzburg sink to bottom.
      out.sort((a, b) => {
        const aw = a.walkToChabadMin ?? Infinity;
        const bw = b.walkToChabadMin ?? Infinity;
        return aw - bw;
      });
      break;
    case 'closest-nature':
      out.sort((a, b) => closestNatureMin(a) - closestNatureMin(b));
      break;
    case 'best-fit':
    default:
      // Default = picks first, then beauty picks, then everything in source order.
      out.sort((a, b) => {
        const aRank = a.isPick ? 0 : a.isBeauty ? 1 : 2;
        const bRank = b.isPick ? 0 : b.isBeauty ? 1 : 2;
        return aRank - bRank;
      });
      break;
  }
  return out;
}

function applyFilters(): UnifiedListing[] {
  const picks = readPicks();
  const filtered = ALL_LISTINGS.filter((l) => {
    // Allison 2026-05-17 07:25: "If booking isn't avai ok then don't show it."
    // Sold-out entries hide entirely. Data is preserved in trip-data.ts for
    // history + re-verify next pass; the renderer just skips them.
    if (l.availability === 'sold-out') return false;
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
  return sortListings(filtered);
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
  return `<span class="lodging-chip lodging-chip--essential">🛏 ${label}${bedsPart}</span>`;
}

// === Data-completeness pills (added 2026-05-17 by booking-deep-verify agent) ===

function sleepsPill(max?: number): string {
  if (!max) return '';
  return `<span class="lodging-chip lodging-chip--essential">👥 Sleeps ${max}</span>`;
}

function kitchenPill(k: LodgingKitchen): string {
  const map: Record<LodgingKitchen, { label: string; cls: string }> = {
    full: { label: '🍳 Full kitchen', cls: 'lodging-chip--good' },
    kitchenette: { label: '🍳 Kitchenette', cls: 'lodging-chip--essential' },
    shared: { label: '🍳 Shared kitchen', cls: 'lodging-chip--essential' },
    none: { label: '🚫 No kitchen', cls: 'lodging-chip--warn' },
    unknown: { label: '🍳 Kitchen?', cls: 'lodging-chip--neutral' },
  };
  const { label, cls } = map[k];
  return `<span class="lodging-chip ${cls}">${label}</span>`;
}

function bathPill(b: LodgingBath): string {
  if (b === 'private') return '<span class="lodging-chip lodging-chip--essential">🚿 Private bath</span>';
  if (b === 'shared') return '<span class="lodging-chip lodging-chip--warn">🚿 Shared bath</span>';
  return '<span class="lodging-chip lodging-chip--neutral">🚿 Bath?</span>';
}

function acPill(hasAc: boolean): string {
  return hasAc
    ? '<span class="lodging-chip lodging-chip--good">❄️ AC</span>'
    : '<span class="lodging-chip">❄️ No AC</span>';
}

function parkingPill(p: LodgingParking): string {
  if (p === 'free') return '<span class="lodging-chip lodging-chip--good">🅿️ Free parking</span>';
  if (p === 'paid') return '<span class="lodging-chip">🅿️ Paid parking</span>';
  if (p === 'street') return '<span class="lodging-chip">🅿️ Street parking</span>';
  if (p === 'none') return '<span class="lodging-chip lodging-chip--warn">🚫 No parking</span>';
  return '<span class="lodging-chip lodging-chip--neutral">🅿️ Parking?</span>';
}

function wifiPill(hasWifi: boolean): string {
  return hasWifi
    ? '<span class="lodging-chip">📶 Wi-Fi</span>'
    : '<span class="lodging-chip lodging-chip--warn">🚫 No Wi-Fi</span>';
}

function viewPill(v: LodgingViewType): string {
  const map: Record<LodgingViewType, string> = {
    lake: '🌊 Lake view',
    mountain: '🏔 Mountain view',
    forest: '🌲 Forest view',
    urban: '🏙 Urban',
    garden: '🌿 Garden view',
    mixed: '🏞 Mixed view',
    none: '',
    unknown: '',
  };
  const label = map[v];
  if (!label) return '';
  return `<span class="lodging-chip">${label}</span>`;
}

// Sold-out badge — RED, prominent, above the photo per fail-loud rule.
// Set per Playwright live-availability sweep 2026-05-17.
function soldOutBadge(l: UnifiedListing): string {
  if (l.availability !== 'sold-out') return '';
  const note = l.availabilityNote ? ` ${escapeHtml(l.availabilityNote)}` : '';
  return `<div class="lodging-soldout-badge" role="alert">❌ Sold out for these dates.${note}</div>`;
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

// Free-cancellation pill — Allison's hard rule 2026-05-16: every listing on
// the page MUST surface free-cancellation status. Green chip when true,
// orange warning when false (the rare opt-out case). Booking URL filter
// (bookingUrlWithDates above) also pre-filters the property page to
// free-cancel rates only.
function freeCancellationPill(fc: boolean): string {
  if (fc) {
    return '<span class="lodging-chip lodging-chip--good" title="Free cancellation rate available — Allison\'s hard rule">✓ Free cancellation</span>';
  }
  return '<span class="lodging-chip lodging-chip--warn" title="No free-cancellation rate visible — verify with host before booking">⚠ No free cancel</span>';
}

function datePill(base: BaseKey): string {
  const d = BASE_DATES[base];
  // The Shabbat / pre-flight framing is already baked into d.short per the
  // 2026-05-17 date-precision rule. Don't append more here.
  return `<span class="lodging-chip lodging-chip--date">📅 ${escapeHtml(d.short)}</span>`;
}

// Booking URL with check-in/check-out + 2 adults + FREE-CANCELLATION FILTER
// baked in (Allison's hard rule 2026-05-16: "All bookings need free
// cancellation"). The `nflt=fc%3D2` query param is Booking.com's free-cancel
// filter; for search-result URLs it narrows the list; for property-detail
// URLs it propagates to the rate-list view inside the property. Sort param
// `order=price_from_low_to_high` favors the cheap free-cancel options first.
// Falls back to the raw URL if it's not booking.com.
function bookingUrlWithDates(rawUrl: string, base: BaseKey): string {
  const d = BASE_DATES[base];
  if (!rawUrl.includes('booking.com/')) return rawUrl;
  const sep = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${sep}checkin=${d.bookingCheckIn}&checkout=${d.bookingCheckOut}&group_adults=2&no_rooms=1&group_children=0&nflt=fc%3D2&order=price`;
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

// Compare-2 icon — sits inside the media frame next to the pick button.
// Click toggles inclusion in compareSelection. At 2 selected, the compare
// modal opens. Per stay-ux deliverable B (2026-05-17).
function compareButtonHtml(l: UnifiedListing): string {
  const selected = compareSelection.includes(l.id);
  const cls = selected
    ? 'lodging-compare-btn lodging-compare-btn--on'
    : 'lodging-compare-btn';
  const label = selected ? '✓ In compare' : '📊 Compare';
  const aria = selected
    ? `Remove ${l.name} from comparison`
    : `Add ${l.name} to comparison (pick 2)`;
  return `<button type="button" class="${cls}" data-compare-id="${escapeHtml(l.id)}" aria-pressed="${selected}" aria-label="${aria}" title="Pick 2 to compare side-by-side">${label}</button>`;
}

// ---------------------------------------------------------------------------
// Lodging photo carousel (added 2026-05-17 by lodging-carousel agent).
// Avital's ask: "Can we have multiple picture for sleeping where we can swipe
// between pictures". CSS scroll-snap drives the swipe on touch; small ◀ ▶
// arrows + dot pagination handle desktop. Zero new deps.
//
// Data: uses `photos` if non-empty; falls back to `[img]` for graceful render
// when the photo-curation pass didn't fill the array.
// Perf: photos[0] is eager (so the hero loads), photos[1+] are lazy + async.
// A11y: aria-roledescription=carousel, "Photo N of M" labels, arrow-key nav
// when the carousel has focus.
// ---------------------------------------------------------------------------
function lodgingCarouselHtml(
  photos: string[] | undefined,
  fallbackImg: string,
  alt: string,
  imgClass: string,
): string {
  const list = photos && photos.length > 0 ? photos : [fallbackImg];
  const safeAlt = escapeHtml(alt);
  if (list.length === 1) {
    // Single-photo path — no carousel scaffolding (keeps DOM lean for the
    // ~half of listings the curation pass didn't fill).
    return `<img class="${imgClass}" loading="lazy" decoding="async" src="${escapeHtml(list[0]!)}" alt="${safeAlt}" />`;
  }
  const total = list.length;
  const slides = list
    .map((src, i) => {
      const loading = i === 0 ? 'eager' : 'lazy';
      const fetchPri = i === 0 ? ' fetchpriority="high"' : '';
      return `<div class="lodging-carousel__slide" data-slide-index="${i}" role="group" aria-roledescription="slide" aria-label="Photo ${i + 1} of ${total}"><img class="${imgClass} lodging-carousel__img" loading="${loading}" decoding="async"${fetchPri} src="${escapeHtml(src)}" alt="${safeAlt}" /></div>`;
    })
    .join('');
  const dots = list
    .map(
      (_, i) =>
        `<button type="button" class="lodging-carousel__dot${i === 0 ? ' is-active' : ''}" data-dot-index="${i}" aria-label="Go to photo ${i + 1} of ${total}"${i === 0 ? ' aria-current="true"' : ''}></button>`,
    )
    .join('');
  return `
    <div class="lodging-carousel" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${safeAlt} photos">
      <div class="lodging-carousel__track" data-carousel-track>${slides}</div>
      <button type="button" class="lodging-carousel__arrow lodging-carousel__arrow--prev" aria-label="Previous photo" tabindex="-1">◀</button>
      <button type="button" class="lodging-carousel__arrow lodging-carousel__arrow--next" aria-label="Next photo" tabindex="-1">▶</button>
      <div class="lodging-carousel__dots" role="tablist" aria-label="Photo navigation">${dots}</div>
      <span class="lodging-carousel__counter" aria-hidden="true">1 / ${total}</span>
    </div>`;
}

function initLodgingCarousels(root: ParentNode = document): void {
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
      // Pick the slide whose left-edge is closest to the track's scroll position.
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
        if (i === best) {
          dot.classList.add('is-active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('is-active');
          dot.removeAttribute('aria-current');
        }
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
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(slides.length - 1);
      }
    });

    updateActive();
  });
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

  // Date + verification + free-cancel row (above the essential pills). Free-
  // cancel pill added 2026-05-17 evening per Allison's hard rule.
  const dateRow = [datePill(l.base), verifiedPill(), freeCancellationPill(l.freeCancellation)]
    .filter(Boolean)
    .join('');

  // ESSENTIAL row — the "right away" pills per Allison's 2026-05-17 directive:
  // beds + bedrooms + sleeps + kitchen + laundry + bath. Above the fold, never
  // inside <details>. The "Avital opens any card, knows in 1 second" test.
  const essentialPills = [
    bedroomChip(l.bedrooms, l.beds),
    sleepsPill(l.maxGuests),
    kitchenPill(l.kitchen),
    laundryChip(l.laundry, l.base),
    bathPill(l.bath),
  ]
    .filter(Boolean)
    .join('');

  // SECONDARY row — AC, parking, wifi, view, character (vibe).
  const secondaryPills = [
    acPill(l.hasAc),
    parkingPill(l.parking),
    wifiPill(l.wifi),
    viewPill(l.viewType),
    vibeBadge(l.vibe),
  ]
    .filter(Boolean)
    .join('');

  const cardClass = [
    'stay-card',
    'lodging-card',
    variant === 'grid' ? 'stay-card--grid' : 'stay-card--list',
    l.isBeauty ? 'stay-card--beauty' : '',
    isPicked(l.id) ? 'lodging-card--picked' : '',
    compareSelection.includes(l.id) ? 'lodging-card--in-compare' : '',
    l.availability === 'sold-out' ? 'lodging-card--sold-out' : '',
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
        ${lodgingCarouselHtml(l.photos, l.img, l.name, 'stay-card__img')}
        ${pickButtonHtml(l)}
        ${compareButtonHtml(l)}
      </div>
      <div class="stay-card__body lodging-card__body">
        ${soldOutBadge(l)}
        <h3 class="stay-card__name">${escapeHtml(l.name)}</h3>
        <p class="lodging-tldr">${escapeHtml(tldr)}</p>
        <div class="stay-card__chips lodging-chips lodging-chips--date-row">${dateRow}</div>
        <div class="stay-card__chips lodging-chips lodging-chips--essential" aria-label="At-a-glance essentials">${essentialPills}</div>
        <div class="stay-card__chips lodging-chips lodging-chips--secondary" aria-label="Comfort + setting">${secondaryPills}</div>
        ${distanceChips(l)}
        <div class="stay-card__meta">${escapeHtml(l.review)} · <strong>${escapeHtml(l.pricePerNight)}</strong></div>
        ${beautyLine}
        <details class="lodging-details">
          <summary class="lodging-details__summary">More info · drive times · full notes</summary>
          <div class="lodging-details__body">
            <p class="stay-card__note">${escapeHtml(l.note)}</p>
            <div class="stay-card__chips">${chips}${platformBadge(l.platform)}</div>
            ${amenitiesIconRow(l)}
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
          ${megaCtaHtml(b)}
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
  // Per stay-ux deliverable H (2026-05-17): friendlier copy, single clear CTA,
  // soft illustration vibe. "No picks match" — invitational, not scolding.
  return `
    <div class="stay-empty stay-empty--lyrical">
      <div class="stay-empty__icon" aria-hidden="true">🌲</div>
      <p class="stay-empty__title"><strong>No stays match those filters.</strong></p>
      <p class="stay-empty__body">Try widening your shortlist — the right place is usually one chip away.</p>
      <button type="button" class="stay-empty__clear" id="empty-clear">↺ Reset filters</button>
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
        ${lodgingCarouselHtml(s.photos, s.img, s.name, 'sunset-stay__img')}
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
  // Per Allison 2026-05-17 00:27 + 00:28: "I think sunset booking section should be
  // colapsable" / "Sunset booking start collapsed". Wrap in <details> closed by default.
  return `
    <details class="sunset-stays" aria-labelledby="sunset-stays-heading">
      <summary class="sunset-stays__summary">
        <span class="sunset-stays__eyebrow">✨ Sunset stays</span>
        <span class="sunset-stays__summary-text">
          <strong>Sleep where the sunset happens</strong> · 4 places (Schafbergspitze summit + 3 more) · tap to explore
        </span>
      </summary>
      <header class="sunset-stays__head">
        <h2 id="sunset-stays-heading" class="sunset-stays__title">Sleep where the sunset happens</h2>
        <p class="sunset-stays__lede">
          Four places where the room IS the viewpoint — peak hotels above the cog railway, lakeside
          inns at the foot of the Dachstein, balconies hanging over Hintersee.
          Schafbergspitze is now LOCKED for Wed Jul 29.
        </p>
      </header>
      <div class="sunset-stays__grid">${cards}</div>
    </details>`;
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
      : '<span class="filter-bar__active filter-bar__active--empty">Showing all — tap a chip to narrow.</span>';

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
// Sort dropdown (stay-ux deliverable C — 2026-05-17)
// ---------------------------------------------------------------------------
function renderSortDropdown(): string {
  // Salzburg-only / Mountain-only sorts are conditional. We hide them when
  // the current filter set makes them irrelevant.
  const salzActive = state.bases.size === 0 || state.bases.has('salzburg');
  const natureActive =
    state.bases.size === 0 ||
    state.bases.has('obertraun') ||
    state.bases.has('berchtesgaden') ||
    state.bases.has('wolfgangsee');
  const opts: { value: SortKey; label: string; show: boolean }[] = [
    { value: 'best-fit', label: 'Best fit', show: true },
    { value: 'price-low', label: 'Lowest price', show: true },
    { value: 'score-high', label: 'Highest review score', show: true },
    { value: 'walk-chabad', label: 'Closest to Chabad', show: salzActive },
    { value: 'closest-nature', label: 'Closest to nature', show: natureActive },
  ];
  const items = opts
    .filter((o) => o.show)
    .map(
      (o) =>
        `<option value="${o.value}"${state.sort === o.value ? ' selected' : ''}>${escapeHtml(o.label)}</option>`,
    )
    .join('');
  return `
    <label class="stay-sort">
      <span class="stay-sort__label">Sort:</span>
      <select class="stay-sort__select" id="stay-sort-select" aria-label="Sort listings">${items}</select>
    </label>`;
}

// ---------------------------------------------------------------------------
// Per-base mega CTA (stay-ux deliverable D — 2026-05-17)
// "Open all <Base> picks on Booking.com with our filters." Pre-builds the
// Booking.com search URL with dates · 2 adults · free-cancel · score≥8.5 ·
// 2+ bedrooms (Salzburg only — Avital wants 2BR for the longest stays).
// ---------------------------------------------------------------------------
const BASE_BOOKING_DEST_ID: Record<BaseKey, string> = {
  salzburg: 'Salzburg', // ss=Salzburg
  obertraun: 'Obertraun',
  berchtesgaden: 'Berchtesgaden',
  wolfgangsee: 'St.+Wolfgang+im+Salzkammergut',
  airport: 'Salzburg+Airport',
};

function bookingSearchUrlForBase(base: BaseKey): string {
  const d = BASE_DATES[base];
  const ss = BASE_BOOKING_DEST_ID[base];
  // nflt=fc%3D2 = free cancellation; review_score=85 = ≥8.5; ht_id=204 = apartments;
  // entire_place=1 = entire-home filter. Salzburg gets a 2+ BR filter too.
  // Booking.com encodes multi-filter as semicolon-separated within nflt.
  const filters: string[] = ['fc=2', 'review_score=85', 'ht_id=204', 'entire_place=1'];
  if (base === 'salzburg') filters.push('min_bedrooms=2');
  const nflt = encodeURIComponent(filters.join(';'));
  return `https://www.booking.com/searchresults.html?ss=${ss}&checkin=${d.bookingCheckIn}&checkout=${d.bookingCheckOut}&group_adults=2&no_rooms=1&group_children=0&nflt=${nflt}&order=review_score_and_price`;
}

function megaCtaHtml(base: BaseKey): string {
  const url = bookingSearchUrlForBase(base);
  const label = BASE_LABELS[base];
  const filterDesc =
    base === 'salzburg'
      ? 'free-cancel · ≥ 8.5 score · 2+ BR · entire apt'
      : 'free-cancel · ≥ 8.5 score · entire apt';
  return `
    <a class="lodging-mega-cta" href="${escapeHtml(url)}" target="_blank" rel="noreferrer noopener"
       aria-label="Open all ${escapeHtml(label)} picks on Booking.com with our filters">
      <span class="lodging-mega-cta__icon" aria-hidden="true">🔍</span>
      <span class="lodging-mega-cta__text">
        <strong>Open all ${escapeHtml(label)} picks on Booking.com</strong>
        <span class="lodging-mega-cta__filters">${escapeHtml(filterDesc)}</span>
      </span>
      <span class="lodging-mega-cta__chev" aria-hidden="true">↗</span>
    </a>`;
}

// ---------------------------------------------------------------------------
// Bottom sticky shortlist bar (stay-ux deliverable A — 2026-05-17)
// Shows chips for picked stays (max 5 visible + "+N more"), Review/Clear/Share.
// Persists via existing PICKS_STORAGE_KEY. Share copies a URL with pick IDs.
// ---------------------------------------------------------------------------
function pickedListings(): UnifiedListing[] {
  const picks = readPicks();
  // Allison 2026-05-17: "never show sold out" — also applies to shortlist bar
  return ALL_LISTINGS.filter((l) => picks[l.id] && l.availability !== "sold-out");
}

function pickChipHtml(l: UnifiedListing): string {
  // Avatar initials from first letters of name words, max 2 chars.
  const initials = l.name
    .replace(/[^A-Za-z\s]/g, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || '?';
  const color = BASE_COLORS[l.base];
  return `
    <span class="bottom-shortlist__chip" style="background:${color}1f;border-color:${color}7a;color:${color}"
          title="${escapeHtml(l.name)} — ${escapeHtml(BASE_LABELS[l.base])}">
      <span class="bottom-shortlist__chip-initials">${escapeHtml(initials)}</span>
      <span class="bottom-shortlist__chip-name">${escapeHtml(l.name)}</span>
    </span>`;
}

function renderBottomShortlistBar(): string {
  const picks = pickedListings();
  if (picks.length === 0) return '';
  const visible = picks.slice(0, 5);
  const overflow = picks.length - visible.length;
  const chips = visible.map(pickChipHtml).join('');
  const moreChip =
    overflow > 0
      ? `<span class="bottom-shortlist__chip bottom-shortlist__chip--more">+${overflow} more</span>`
      : '';
  return `
    <div class="bottom-shortlist__inner" role="region" aria-label="Your shortlist (${picks.length})">
      <div class="bottom-shortlist__chips" aria-label="Picked stays">
        ${chips}${moreChip}
      </div>
      <div class="bottom-shortlist__actions">
        <button type="button" class="bottom-shortlist__btn bottom-shortlist__btn--primary"
                id="bottom-shortlist-review" aria-haspopup="dialog">
          Review picks (${picks.length})
        </button>
        <button type="button" class="bottom-shortlist__btn bottom-shortlist__btn--ghost"
                id="bottom-shortlist-share" aria-label="Copy shareable link to this shortlist">
          🔗 Share
        </button>
        <button type="button" class="bottom-shortlist__btn bottom-shortlist__btn--link"
                id="bottom-shortlist-clear" aria-label="Clear all picks">
          Clear
        </button>
      </div>
    </div>`;
}

// Shortlist modal body — one row per picked stay with name, photo, link, remove.
function renderShortlistModalBody(): string {
  const picks = pickedListings();
  if (picks.length === 0) {
    return `
      <p class="ux-modal__empty">Nothing picked yet. Tap <strong>+ Pick this</strong> on any stay to add it here.</p>`;
  }
  const rows = picks
    .map((l) => {
      const bookingUrl = bookingUrlWithDates(l.url, l.base);
      const firstPhoto = l.photos && l.photos.length > 0 ? l.photos[0]! : l.img;
      return `
        <article class="shortlist-row" id="shortlist-row-${escapeHtml(l.id)}">
          <img class="shortlist-row__thumb" src="${escapeHtml(firstPhoto)}" alt="${escapeHtml(l.name)}" loading="lazy" decoding="async" />
          <div class="shortlist-row__body">
            <h3 class="shortlist-row__name">${escapeHtml(l.name)}</h3>
            <p class="shortlist-row__meta">
              <span class="shortlist-row__base" style="color:${BASE_COLORS[l.base]}">${escapeHtml(BASE_LABELS[l.base])}</span>
              · ${escapeHtml(l.pricePerNight)} · ${escapeHtml(l.review)}
            </p>
            <p class="shortlist-row__meta shortlist-row__meta--dates">📅 ${escapeHtml(BASE_DATES[l.base].short)}</p>
            <div class="shortlist-row__actions">
              <a class="shortlist-row__link" href="${escapeHtml(bookingUrl)}" target="_blank" rel="noreferrer noopener">
                Open on Booking.com →
              </a>
              <button type="button" class="shortlist-row__remove" data-shortlist-remove="${escapeHtml(l.id)}"
                      aria-label="Remove ${escapeHtml(l.name)} from shortlist">
                Remove
              </button>
            </div>
          </div>
        </article>`;
    })
    .join('');
  return `
    <p class="ux-modal__lede">${picks.length} stay${picks.length === 1 ? '' : 's'} picked. Tap to open on Booking.com or remove.</p>
    <div class="shortlist-rows">${rows}</div>`;
}

function openShortlistModal(): void {
  const modal = document.getElementById('stay-shortlist-modal');
  const body = document.getElementById('shortlist-modal-body');
  if (!modal || !body) return;
  body.innerHTML = renderShortlistModalBody();
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('ux-modal-open');
  // Focus close for keyboard.
  const close = modal.querySelector<HTMLButtonElement>('.ux-modal__close');
  close?.focus();
}

function closeAllUxModals(): void {
  document.querySelectorAll<HTMLDivElement>('.ux-modal').forEach((m) => {
    m.hidden = true;
    m.setAttribute('aria-hidden', 'true');
  });
  document.body.classList.remove('ux-modal-open');
}

// ---------------------------------------------------------------------------
// Compare modal body (stay-ux deliverable B — 2026-05-17)
// ---------------------------------------------------------------------------
function deltaFlag(condition: boolean): string {
  return condition ? ' compare-cell--better' : '';
}

function compareCell(value: string, better: boolean): string {
  return `<td class="compare-cell${deltaFlag(better)}">${better ? '<span class="compare-cell__check" aria-hidden="true">✓ </span>' : ''}${value}</td>`;
}

function bedroomsNumeric(b: UnifiedListing['bedrooms']): number {
  if (b === 'studio') return 0;
  if (typeof b === 'number') return b;
  return -1;
}

function renderCompareModalBody(): string {
  const [aId, bId] = compareSelection;
  if (!aId || !bId) {
    return `<p class="ux-modal__empty">Pick 2 stays to compare. Tap the <strong>📊 Compare</strong> icon on any card.</p>`;
  }
  const a = ALL_LISTINGS.find((x) => x.id === aId);
  const b = ALL_LISTINGS.find((x) => x.id === bId);
  if (!a || !b) {
    return `<p class="ux-modal__empty">Couldn't load one of the stays. Try again?</p>`;
  }

  // Delta flags
  const aPriceLow = parsePriceLow(a.pricePerNight);
  const bPriceLow = parsePriceLow(b.pricePerNight);
  const aScore = parseReviewScore(a.review);
  const bScore = parseReviewScore(b.review);
  const aBR = bedroomsNumeric(a.bedrooms);
  const bBR = bedroomsNumeric(b.bedrooms);
  const aWalkChabad = a.walkToChabadMin ?? Infinity;
  const bWalkChabad = b.walkToChabadMin ?? Infinity;
  const aNature = closestNatureMin(a);
  const bNature = closestNatureMin(b);

  const photo = (l: UnifiedListing): string => {
    const src = l.photos && l.photos.length > 0 ? l.photos[0]! : l.img;
    return `<img class="compare-photo" src="${escapeHtml(src)}" alt="${escapeHtml(l.name)}" loading="lazy" decoding="async" />`;
  };

  const row = (label: string, cellA: string, cellB: string): string =>
    `<tr><th scope="row">${escapeHtml(label)}</th>${cellA}${cellB}</tr>`;

  const kitchenLabel = (k: LodgingKitchen): string =>
    k === 'full' ? 'Full' : k === 'kitchenette' ? 'Kitchenette' : k === 'shared' ? 'Shared' : k === 'none' ? 'None' : 'Unknown';
  const laundryLabel = (l: LodgingLaundry): string =>
    l === 'washer+dryer' ? 'Washer + dryer' : l === 'washer' ? 'Washer' : l === 'shared' ? 'Shared' : l === 'none' ? 'None' : 'Unknown';
  const bathLabel = (b: LodgingBath): string =>
    b === 'private' ? 'Private' : b === 'shared' ? 'Shared' : 'Unknown';
  const parkingLabel = (p: LodgingParking): string =>
    p === 'free' ? 'Free' : p === 'paid' ? 'Paid' : p === 'street' ? 'Street' : p === 'none' ? 'None' : 'Unknown';
  const brLabel = (l: UnifiedListing): string =>
    l.bedrooms === 'studio' ? 'Studio' : typeof l.bedrooms === 'number' ? `${l.bedrooms} BR` : '—';

  const aBookingUrl = bookingUrlWithDates(a.url, a.base);
  const bBookingUrl = bookingUrlWithDates(b.url, b.base);

  return `
    <div class="compare-grid">
      <table class="compare-table" aria-label="Side-by-side comparison">
        <thead>
          <tr>
            <th scope="col" class="compare-rowlabel"></th>
            <th scope="col">
              ${photo(a)}
              <p class="compare-name">${escapeHtml(a.name)}</p>
              <p class="compare-sub" style="color:${BASE_COLORS[a.base]}">${escapeHtml(BASE_LABELS[a.base])}</p>
            </th>
            <th scope="col">
              ${photo(b)}
              <p class="compare-name">${escapeHtml(b.name)}</p>
              <p class="compare-sub" style="color:${BASE_COLORS[b.base]}">${escapeHtml(BASE_LABELS[b.base])}</p>
            </th>
          </tr>
        </thead>
        <tbody>
          ${row('Beds + bedrooms', compareCell(`${brLabel(a)}${a.beds ? ' · ' + escapeHtml(a.beds) : ''}`, aBR > bBR), compareCell(`${brLabel(b)}${b.beds ? ' · ' + escapeHtml(b.beds) : ''}`, bBR > aBR))}
          ${row('Bath', compareCell(bathLabel(a.bath), a.bath === 'private' && b.bath !== 'private'), compareCell(bathLabel(b.bath), b.bath === 'private' && a.bath !== 'private'))}
          ${row('Kitchen', compareCell(kitchenLabel(a.kitchen), a.kitchen === 'full' && b.kitchen !== 'full'), compareCell(kitchenLabel(b.kitchen), b.kitchen === 'full' && a.kitchen !== 'full'))}
          ${row('Laundry', compareCell(laundryLabel(a.laundry), (a.hasWasherDryer && !b.hasWasherDryer) || (a.hasWasher && !b.hasWasher && !b.hasWasherDryer)), compareCell(laundryLabel(b.laundry), (b.hasWasherDryer && !a.hasWasherDryer) || (b.hasWasher && !a.hasWasher && !a.hasWasherDryer)))}
          ${row('AC', compareCell(a.hasAc ? 'Yes' : 'No', a.hasAc && !b.hasAc), compareCell(b.hasAc ? 'Yes' : 'No', b.hasAc && !a.hasAc))}
          ${row('Parking', compareCell(parkingLabel(a.parking), a.parking === 'free' && b.parking !== 'free'), compareCell(parkingLabel(b.parking), b.parking === 'free' && a.parking !== 'free'))}
          ${row('Walk to Chabad', compareCell(a.walkToChabadMin ? `${a.walkToChabadMin} min` : '—', aWalkChabad < bWalkChabad && aWalkChabad < Infinity), compareCell(b.walkToChabadMin ? `${b.walkToChabadMin} min` : '—', bWalkChabad < aWalkChabad && bWalkChabad < Infinity))}
          ${row('Closest nature anchor', compareCell(aNature < Infinity ? `${aNature} min drive` : '—', aNature < bNature && aNature < Infinity), compareCell(bNature < Infinity ? `${bNature} min drive` : '—', bNature < aNature && bNature < Infinity))}
          ${row('Score · reviews', compareCell(escapeHtml(a.review), aScore > bScore), compareCell(escapeHtml(b.review), bScore > aScore))}
          ${row('Price / night', compareCell(escapeHtml(a.pricePerNight), aPriceLow < bPriceLow), compareCell(escapeHtml(b.pricePerNight), bPriceLow < aPriceLow))}
          ${row('Free cancellation', compareCell(a.freeCancellation ? 'Yes' : 'No', a.freeCancellation && !b.freeCancellation), compareCell(b.freeCancellation ? 'Yes' : 'No', b.freeCancellation && !a.freeCancellation))}
        </tbody>
      </table>
      <div class="compare-ctas">
        <a class="lodging-cta lodging-cta--primary" href="${escapeHtml(aBookingUrl)}" target="_blank" rel="noreferrer noopener">Open ${escapeHtml(a.name)} ↗</a>
        <a class="lodging-cta lodging-cta--primary" href="${escapeHtml(bBookingUrl)}" target="_blank" rel="noreferrer noopener">Open ${escapeHtml(b.name)} ↗</a>
      </div>
      <p class="compare-hint">Green ✓ = better on that row. Tap × to close + pick a different pair.</p>
    </div>`;
}

function openCompareModal(): void {
  const modal = document.getElementById('stay-compare-modal');
  const body = document.getElementById('compare-modal-body');
  if (!modal || !body) return;
  body.innerHTML = renderCompareModalBody();
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('ux-modal-open');
  modal.querySelector<HTMLButtonElement>('.ux-modal__close')?.focus();
}

// ---------------------------------------------------------------------------
// Sticky filter summary (stay-ux deliverable E — 2026-05-17)
// Slim bar that appears when any filter is active AND user has scrolled past
// the filter bar. Mounted at body root; toggled via scroll listener.
// ---------------------------------------------------------------------------
function describeActiveFilters(): string {
  const bits: string[] = [];
  if (state.bases.size > 0) {
    bits.push(
      Array.from(state.bases)
        .map((b) => BASE_LABELS[b])
        .join(' / '),
    );
  }
  if (state.bedrooms.size > 0) {
    bits.push(
      Array.from(state.bedrooms)
        .map((b) => (b === 'studio' ? 'Studio' : `${b} BR`))
        .join(' / '),
    );
  }
  if (state.amenities.size > 0) {
    const aMap: Record<string, string> = {
      washer: 'Washer',
      'washer-dryer': 'Washer+dryer',
      ac: 'AC',
      parking: 'Free parking',
    };
    bits.push(
      Array.from(state.amenities)
        .map((a) => aMap[a] ?? a)
        .join(' + '),
    );
  }
  if (state.tiers.size > 0) {
    bits.push(
      Array.from(state.tiers)
        .map((t) => (t === 'lean' ? 'Lean' : t === 'standard' ? 'Standard' : 'Mid-high'))
        .join(' / '),
    );
  }
  if (state.vibes.size > 0) {
    bits.push(Array.from(state.vibes).join(' / '));
  }
  if (state.platforms.size > 0) {
    bits.push(Array.from(state.platforms).join(' / '));
  }
  if (state.showShortlistOnly) bits.push('Shortlist only');
  return bits.join(' · ');
}

function renderFilterSummary(): string {
  const total =
    state.bases.size +
    state.tiers.size +
    state.vibes.size +
    state.bedrooms.size +
    state.amenities.size +
    state.platforms.size +
    (state.showShortlistOnly ? 1 : 0);
  if (total === 0) return '';
  const matched = applyFilters().length;
  const desc = describeActiveFilters();
  return `
    <div class="filter-summary-bar__inner" role="status" aria-live="polite">
      <span class="filter-summary-bar__label">Filtering:</span>
      <span class="filter-summary-bar__desc">${escapeHtml(desc)}</span>
      <span class="filter-summary-bar__count">${matched} result${matched === 1 ? '' : 's'}</span>
      <button type="button" class="filter-summary-bar__clear" id="filter-summary-clear">Clear filters</button>
    </div>`;
}

function updateFilterSummaryVisibility(): void {
  const bar = document.getElementById('stay-filter-summary');
  if (!bar) return;
  const filterAside = document.querySelector<HTMLElement>('.filter-bar');
  if (!filterAside) {
    bar.hidden = true;
    return;
  }
  const total =
    state.bases.size +
    state.tiers.size +
    state.vibes.size +
    state.bedrooms.size +
    state.amenities.size +
    state.platforms.size +
    (state.showShortlistOnly ? 1 : 0);
  if (total === 0) {
    bar.hidden = true;
    bar.setAttribute('aria-hidden', 'true');
    return;
  }
  // Visible when the filter bar's bottom edge has scrolled above the viewport.
  const rect = filterAside.getBoundingClientRect();
  const scrolledPast = rect.bottom < 4;
  bar.hidden = !scrolledPast;
  bar.setAttribute('aria-hidden', scrolledPast ? 'false' : 'true');
}

// ---------------------------------------------------------------------------
// First-time filter tooltip (stay-ux deliverable F — 2026-05-17)
// Shown once near the filter chips; dismissable, auto-fades after 5s.
// ---------------------------------------------------------------------------
function maybeShowFilterTooltip(): void {
  try {
    if (localStorage.getItem(TOOLTIP_STORAGE_KEY) === '1') return;
  } catch {
    return;
  }
  // Find the bases chip group as anchor.
  const anchor = document.querySelector<HTMLDivElement>('[data-group-label="bases"]');
  if (!anchor) return;
  // Don't duplicate.
  if (document.getElementById('filter-first-tooltip')) return;
  const tip = document.createElement('div');
  tip.id = 'filter-first-tooltip';
  tip.className = 'filter-tooltip';
  tip.setAttribute('role', 'status');
  tip.innerHTML = `
    <span class="filter-tooltip__arrow" aria-hidden="true"></span>
    <span class="filter-tooltip__text">All stays shown. Tap a chip to narrow.</span>
    <button type="button" class="filter-tooltip__close" aria-label="Dismiss tip">✕</button>`;
  anchor.appendChild(tip);
  const dismiss = (): void => {
    try {
      localStorage.setItem(TOOLTIP_STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    tip.classList.add('filter-tooltip--gone');
    window.setTimeout(() => tip.remove(), 220);
  };
  tip.querySelector<HTMLButtonElement>('.filter-tooltip__close')?.addEventListener('click', dismiss);
  // Auto-fade after 5s
  window.setTimeout(dismiss, 5000);
}

// ---------------------------------------------------------------------------
// Share — copy a URL with picks=<id,id,...> query param.
// ---------------------------------------------------------------------------
function buildShareUrl(): string {
  const ids = Object.keys(readPicks());
  const url = new URL(window.location.href);
  url.searchParams.set('picks', ids.join(','));
  url.hash = '#grid';
  return url.toString();
}

function applyPicksFromQuery(): void {
  const url = new URL(window.location.href);
  const raw = url.searchParams.get('picks');
  if (!raw) return;
  const ids = raw.split(',').filter(Boolean);
  if (ids.length === 0) return;
  const picks = readPicks();
  let added = 0;
  for (const id of ids) {
    if (ALL_LISTINGS.find((l) => l.id === id) && !picks[id]) {
      picks[id] = { picked_at: new Date().toISOString(), by: whoIsPicking() };
      added++;
    }
  }
  if (added > 0) writePicks(picks);
  // Strip the query param so refreshes don't re-add.
  url.searchParams.delete('picks');
  history.replaceState(null, '', url.toString());
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
    <div class="view-toggle-row">
      <div class="view-toggle" role="tablist" aria-label="View mode">
        ${opt('list', 'List', '☰')}
        ${opt('grid', 'Grid', '▦')}
        ${opt('map', 'Map', '📍')}
      </div>
      ${renderSortDropdown()}
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

  // Bottom sticky shortlist bar (stay-ux deliverable A — 2026-05-17).
  const bottomEl = document.getElementById('stay-bottom-shortlist');
  if (bottomEl) {
    const html = renderBottomShortlistBar();
    if (html) {
      bottomEl.innerHTML = html;
      bottomEl.hidden = false;
      bottomEl.setAttribute('aria-hidden', 'false');
    } else {
      bottomEl.innerHTML = '';
      bottomEl.hidden = true;
      bottomEl.setAttribute('aria-hidden', 'true');
    }
  }

  // Sticky filter summary bar — render content (visibility handled by scroll).
  const summaryEl = document.getElementById('stay-filter-summary');
  if (summaryEl) {
    summaryEl.innerHTML = renderFilterSummary();
  }
  updateFilterSummaryVisibility();

  ensureMap();
  renderMapPins(matched);

  writeHash();
  bindDynamicHandlers();
  initLodgingCarousels();
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

  // Sort dropdown (stay-ux deliverable C — 2026-05-17)
  const sortSelect = document.querySelector<HTMLSelectElement>('#stay-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const v = sortSelect.value as SortKey;
      state.sort = v;
      storeSort(v);
      renderShell();
    });
  }

  // Compare buttons on cards (stay-ux deliverable B — 2026-05-17)
  document.querySelectorAll<HTMLButtonElement>('[data-compare-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-compare-id') ?? '';
      if (!id) return;
      const idx = compareSelection.indexOf(id);
      if (idx >= 0) {
        compareSelection.splice(idx, 1);
      } else {
        if (compareSelection.length >= 2) {
          // Boot the oldest selection — FIFO.
          compareSelection.shift();
        }
        compareSelection.push(id);
      }
      if (compareSelection.length === 2) {
        openCompareModal();
      }
      renderShell();
    });
  });

  // Bottom shortlist bar — Review / Share / Clear
  const reviewBtn = document.getElementById('bottom-shortlist-review');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', () => openShortlistModal());
  }
  const shareBtn = document.getElementById('bottom-shortlist-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const url = buildShareUrl();
      const fallback = (): void => {
        // Old-school copy fallback for iOS/older Safari.
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch {
          /* ignore */
        }
        document.body.removeChild(ta);
      };
      const flash = (msg: string): void => {
        shareBtn.textContent = msg;
        window.setTimeout(() => {
          shareBtn.textContent = '🔗 Share';
        }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(url)
          .then(() => flash('✓ Link copied'))
          .catch(() => {
            fallback();
            flash('✓ Link copied');
          });
      } else {
        fallback();
        flash('✓ Link copied');
      }
    });
  }
  const bottomClear = document.getElementById('bottom-shortlist-clear');
  if (bottomClear) {
    bottomClear.addEventListener('click', () => {
      if (!confirm('Clear all picked stays?')) return;
      writePicks({});
      state.showShortlistOnly = false;
      renderShell();
    });
  }

  // Shortlist modal — row remove buttons (event-delegated so re-renders work
  // without rebinding or infinite-loop bugs).
  const shortlistModalBody = document.getElementById('shortlist-modal-body');
  if (shortlistModalBody && shortlistModalBody.dataset.removeWired !== '1') {
    shortlistModalBody.dataset.removeWired = '1';
    shortlistModalBody.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;
      const removeBtn = target?.closest<HTMLButtonElement>('[data-shortlist-remove]');
      if (!removeBtn) return;
      const id = removeBtn.getAttribute('data-shortlist-remove') ?? '';
      if (!id) return;
      const picks = readPicks();
      delete picks[id];
      writePicks(picks);
      shortlistModalBody.innerHTML = renderShortlistModalBody();
      renderShell();
    });
  }

  // Modal close (delegated, idempotent)
  document.querySelectorAll<HTMLElement>('[data-modal-close]').forEach((el) => {
    if (el.dataset.modalCloseWired === '1') return;
    el.dataset.modalCloseWired = '1';
    el.addEventListener('click', () => closeAllUxModals());
  });

  // Filter summary clear (sticky bar)
  const summaryClear = document.getElementById('filter-summary-clear');
  if (summaryClear) {
    summaryClear.addEventListener('click', () => {
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
}

function init(): void {
  readHash();
  applyPicksFromQuery();

  const sunsetSlot = document.querySelector<HTMLDivElement>('#sunset-stays-slot');
  if (sunsetSlot) {
    sunsetSlot.innerHTML = renderSunsetStays();
    initLodgingCarousels(sunsetSlot);
  }

  let tries = 0;
  const poll = (): void => {
    if (typeof L !== 'undefined' || tries++ > 20) {
      renderShell();
      // First-time filter tooltip after the filter bar exists.
      window.setTimeout(maybeShowFilterTooltip, 600);
    } else {
      setTimeout(poll, 100);
    }
  };
  poll();

  window.addEventListener('hashchange', () => {
    readHash();
    renderShell();
  });

  // Scroll listener — toggles the sticky filter summary visibility.
  // Throttled to ~60fps via rAF.
  let scrollRaf = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        updateFilterSummaryVisibility();
      });
    },
    { passive: true },
  );

  // ESC closes any open UX modal.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openModal = document.querySelector<HTMLDivElement>('.ux-modal:not([hidden])');
    if (openModal) closeAllUxModals();
  });
}

init();
initNotesWidget();
initChatPlanPopup();
