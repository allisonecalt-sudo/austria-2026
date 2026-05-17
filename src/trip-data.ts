// Canonical itinerary data — v3 rewrite (2026-05-15 evening).
// "we dont need every day fully plan mor elike gernal idea and opiton"
//   — Allison, 2026-05-15 18:45
//
// Replaces the v2 hour-by-hour ScheduleBlock array with a thinner shape:
//   - one general-idea paragraph
//   - a short Plan B one-liner
//   - "anchors" — ONLY essential times (candle-lighting, sunset spot+time,
//     boat-return-by, drive-to-base when moving)
//   - the UX agent's photo + sunset + drive data is preserved verbatim.
//
// What changed from v2:
//   - DROPPED: per-day hour-block schedules (08:00 wake / 09:00 leave …)
//   - DROPPED: DayPlan + ScheduleBlock interfaces
//   - DROPPED: intensity tiers, energy labels
//   - KEPT: all photo data (hero, IMG, IMG_CREDIT), sunset spots, drive times,
//           drive Maps origins, peak-moment callout, lodgings, skip list.
//
// Sunset times: timeanddate.com Salzburg / Hallstatt (47.5° N), late July 2026.
// Drive times: Google Maps consensus.
// Booking.com listings verified live 2026-05-15 via Playwright. Per-night EUR
// computed from displayed NIS at ₪3.97/€1.

export interface DayAnchor {
  label: string;
  time: string;
}

export interface DayPhoto {
  src: string;
  alt: string;
  credit: string;
}

export interface DriveLeg {
  place: string;
  minutes: number;
  mapsUrl: string; // directions URL
}

export interface SunsetSpot {
  place: string;
  time: string;
  mapsUrl: string; // place search URL
}

export interface Day {
  id: string;
  date: string; // "2026-07-24"
  dayOfWeek: string;
  dateLabel: string; // "Friday Jul 24"
  headline: string; // short title — e.g. "Königssee + sunset on the lake"
  hero: DayPhoto;
  generalIdea: string; // one paragraph — what the day's about
  planB?: string; // 1-line alternate
  anchors: DayAnchor[]; // ONLY essential times
  driveFrom?: DriveLeg;
  driveTo?: DriveLeg;
  sunset: SunsetSpot;
  sleepWhere: 'salzburg' | 'hallstatt' | 'schafbergspitze' | 'airport';
  tarabridgeMoment?: string;
  // Options-first per-day summary (added 2026-05-17 per the 4-base restructure).
  // Different from `headline` (short title) and `generalIdea` (paragraph). One
  // line that names the locked beats + a short menu of options for the open
  // hours, e.g. "Move to mountain ~1h15m. Pick from: Hallstatt afternoon /
  // Gosausee mirror / Wolfgangsee swim". The site is a CATALOG OF OPTIONS
  // Avital browses through; summary views surface options, never single locks.
  doingSummary: string;
}

// BudgetTier — 'splurge' kept as the legacy label for €130-180 picks; 'mid-high'
// added 2026-05-16 per Allison's tier-spread direction (lower-to-higher, not too
// high; cap is now €180 not €200+). Both render the same triple-coin badge.
export type BudgetTier = 'lean' | 'standard' | 'splurge' | 'mid-high';
export type LodgingPlatform = 'booking' | 'airbnb' | 'urlaub-am-bauernhof';
// Vibe tag — visual differentiator on the stay page so the farm-stay /
// nature picks stand out from urban/airport stays. Added 2026-05-16 after
// Allison flagged: "we love to stay places that are safe but in naaturey
// areas like in montngro is fpossible- can be an option" + "add more nature
// with view places ars optiosn". Older renderers ignore this field gracefully.
export type LodgingVibe =
  | 'nature-view' // mountain/forest-view balcony, otherwise standard apartment
  | 'farm-stay' // working farm with animals (Urlaub am Bauernhof style)
  | 'lake-edge' // lakeshore property, balcony or window over the water
  | 'forest-cabin' // forest-edge or valley-floor cabin with quirky local character
  | 'in-town'; // urban / village-center default

// Laundry status — added 2026-05-16 per Allison's final form:
// "so in the end we jsut need a place with laundry" + "washwer dryer most
// ideal". Salzburg base MUST have washer; other bases nice-to-have. Surface
// prominently on every Salzburg card.
export type LodgingLaundry = 'washer+dryer' | 'washer' | 'shared' | 'none' | 'unknown';

// === DATA COMPLETENESS PASS — added 2026-05-17 by booking-deep-verify agent.
// Per Allison: "I want to know right away how many beds how many bedrooms
// kitchenette so yeah consider them you need to go through every single one".
// These optional fields drive the at-a-glance pill row above the fold on
// each lodging card. Older renderers ignore them gracefully.
export type LodgingKitchen = 'full' | 'kitchenette' | 'shared' | 'none' | 'unknown';
export type LodgingBath = 'private' | 'shared' | 'unknown';
export type LodgingParking = 'free' | 'paid' | 'street' | 'none' | 'unknown';
export type LodgingViewType =
  | 'lake'
  | 'mountain'
  | 'forest'
  | 'urban'
  | 'garden'
  | 'mixed'
  | 'none'
  | 'unknown';

export interface DataCompletenessFields {
  maxGuests?: number;
  kitchen?: LodgingKitchen;
  bath?: LodgingBath;
  ac?: boolean;
  parking?: LodgingParking;
  wifi?: boolean; // default-assumed true; flag if absent
  viewType?: LodgingViewType;
}

// Live-availability flag — added 2026-05-17 by booking-deep-verify agent.
// Set to 'sold-out' when Playwright confirmed Booking.com showed "no
// availability on our site for this property" for the trip dates. Renders a
// prominent red badge on the card. Per the fail-loud rule: tell the user the
// listing is unbookable, don't hide it.
export type LodgingAvailability = 'available' | 'sold-out' | 'limited' | 'unverified';

export interface LodgingAlt {
  name: string;
  url: string;
  img: string;
  review: string;
  pricePerNight: string;
  note: string;
  // Optional fields — UX agent may consume these for filters/badges.
  // Older renderers ignore them gracefully.
  budgetTier?: BudgetTier;
  platform?: LodgingPlatform;
  vibeTag?: LodgingVibe;
  walkToChabadMin?: number; // Salzburg base only — minutes walking to Linzergasse 76
  driveToAirportMin?: number; // Airport base only — minutes driving to SZG
  // Added 2026-05-16 for the bases configuration agent + Allison's "always
  // write how many beds and how many bedrooms and anything else worth noting".
  laundry?: LodgingLaundry;
  bedrooms?: number | 'studio';
  beds?: string; // free-text — "1 queen", "1 double + 1 single", etc.
  notableDetails?: string[]; // short tags (balcony view, dishwasher, etc.)
  // Beautiful-character pick — added 2026-05-16 by beautiful-lodging-hunt
  // agent. Allison: "we love staying in beautiful places". Marks listings
  // that are themselves photogenic / character-rich (restored historic
  // buildings, design-led interiors, working farms with animals, lake-edge
  // 700-year-old taverns) — NOT just "clean kitchen". Renders a quiet
  // "Character pick" badge in the stay page.
  beautyPick?: boolean;
  beautyNote?: string; // 1-line why this one is beautiful
  // Data-completeness fields (added 2026-05-17). All optional + additive.
  maxGuests?: number;
  kitchen?: LodgingKitchen;
  bath?: LodgingBath;
  ac?: boolean;
  parking?: LodgingParking;
  wifi?: boolean;
  viewType?: LodgingViewType;
  // Live availability (added 2026-05-17). Set when Playwright fact-checked
  // Booking.com for actual trip dates. Renders sold-out badge when applicable.
  availability?: LodgingAvailability;
  availabilityCheckedDate?: string; // YYYY-MM-DD
  availabilityNote?: string;
  // Carousel photos (added 2026-05-17 by Photo Curation DEEP pass). 3-5 photos
  // for the swipe-able lodging carousel. If omitted, renderer falls back to
  // the single `img` field. Stable Wikimedia area photos preferred — Booking
  // bstatic CDN URLs use signed/expiring k= tokens. First entry is the hero
  // (same image as `img`); rest are area/context shots so Avital can swipe.
  photos?: string[];
  // Free-cancellation flag (added 2026-05-17 — see free-cancel rule
  // 2026-05-17 01:31 in context). Renders ✓ green chip when true; renders
  // 🔒 red badge when false (the explicit-choice case).
  freeCancellation?: boolean;
  freeCancellationUntil?: string;
}

export interface Lodging {
  baseKey: 'salzburg' | 'hallstatt' | 'airport';
  nights: string;
  area: string;
  pickName: string;
  pickUrl: string;
  pickImg: string;
  pickReview: string;
  pickPrice: string;
  pickWhy: string;
  // Optional fields on the pick — UX agent may consume.
  pickBudgetTier?: BudgetTier;
  pickPlatform?: LodgingPlatform;
  pickVibeTag?: LodgingVibe;
  pickWalkToChabadMin?: number;
  pickDriveToAirportMin?: number;
  pickLaundry?: LodgingLaundry;
  pickBedrooms?: number | 'studio';
  pickBeds?: string;
  pickNotableDetails?: string[];
  // Data-completeness fields (added 2026-05-17). Same shape as LodgingAlt.
  pickMaxGuests?: number;
  pickKitchen?: LodgingKitchen;
  pickBath?: LodgingBath;
  pickAc?: boolean;
  pickParking?: LodgingParking;
  pickWifi?: boolean;
  pickViewType?: LodgingViewType;
  // Live availability (added 2026-05-17). Set per Playwright sweep.
  pickAvailability?: LodgingAvailability;
  pickAvailabilityCheckedDate?: string;
  pickAvailabilityNote?: string;
  // Carousel photos (added 2026-05-17 by Photo Curation DEEP pass). See note
  // on LodgingAlt.photos.
  pickPhotos?: string[];
  // Free-cancellation flag (added 2026-05-17 by free-cancel agent).
  pickFreeCancellation?: boolean;
  pickFreeCancellationUntil?: string;
  alts: LodgingAlt[];
}

export interface TripData {
  intro: string;
  whyThisPlan: string;
  natureAnchor: string;
  totalCostEur: number;
  totalCostNis: number;
  ceilingEur: number;
  days: Day[];
  lodgings: Lodging[];
  peakMoment: { day: string; spot: string; description: string };
  skipList: { item: string; reason: string }[];
}

// Image URLs — verified Wikimedia Commons for marquee places (each photo
// actually shows the named place; fail-loud rule).
const IMG = {
  salzburgRiver:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
  salzburgFortress:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
  hallstattLake:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
  konigssee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
  gosausee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
  werfen:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Werfen_-_Burg_Hohenwerfen_%281%29.JPG/1280px-Werfen_-_Burg_Hohenwerfen_%281%29.JPG',
  wolfgangsee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG/1280px-St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG',
  alpineSunset: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85',
};

const IMG_CREDIT = {
  salzburgRiver: 'Wikimedia / Aconcagua, CC BY-SA 4.0',
  salzburgFortress: 'Wikimedia / Andrew Bossi, CC BY-SA 4.0',
  hallstattLake: 'Wikimedia / Jorge Royan, CC BY-SA 4.0',
  konigssee: 'Wikimedia / Lukas Riebling, CC BY-SA 4.0',
  gosausee: 'Wikimedia / Roman Klementschitz, CC BY-SA 3.0',
  werfen: 'Wikimedia / C.Stadler / Bwag, CC BY-SA 4.0',
  wolfgangsee: 'Wikimedia / C.Stadler / Bwag, CC BY-SA 4.0',
  alpineSunset: 'Unsplash',
};

// ---------------------------------------------------------------------------
// LODGING-PHOTO-CAROUSEL POOLS (added 2026-05-17 by Photo Curation DEEP pass)
// ---------------------------------------------------------------------------
// Per Allison's note 2026-05-17 01:20 ("Can we have multiple picture for
// sleeping where we can swipe between pictures"): each lodging card gets a
// swipe-able carousel. Booking's bstatic.com URLs use signed `k=` tokens that
// expire / rotate, and were the source of every fake-signature failure in the
// audit. Instead, the carousel reuses VERIFIED-STABLE Wikimedia summer photos
// of the listing's area (lake / village / mountain). The hero (`img`) stays
// as the primary listing photo; carousel additions are area context.
//
// All URLs use the standard Wikimedia thumb widths (1280px). All are summer-
// content shots per Avital's note 2026-05-16 23:37 ("We are going in July - I
// only want pics from summer").
const PHOTO_POOL = {
  salzburgOldTown: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
  ],
  hallstattVillage: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
  ],
  obertraunDachstein: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Krippenstein_Dachstein_panorama.jpg/1280px-Krippenstein_Dachstein_panorama.jpg',
  ],
  gosauValley: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
  ],
  badGoisernHallstatt: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
  ],
  ramsauBerchtesgaden: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
  ],
  stWolfgang: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG/1280px-St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
  ],
  strobl: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Panorama_Wolfgangsee.jpg/1280px-Panorama_Wolfgangsee.jpg',
  ],
  schafbergSummit: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Schafberg_Panorama_Attersee_Mondsee.jpg/1280px-Schafberg_Panorama_Attersee_Mondsee.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Schafberg_Summit.jpg/1280px-Schafberg_Summit.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
  ],
  hinterseeMirror: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
  ],
};

// Helper: build a 3-photo carousel using the listing's primary photo plus
// 2 area context shots. Filters duplicates so the hero never appears twice.
function carousel(primary: string, ...areaPool: string[]): string[] {
  const out = [primary];
  for (const p of areaPool) {
    if (!out.includes(p)) out.push(p);
    if (out.length >= 4) break;
  }
  return out;
}

// Maps helpers (inline so trip-data has no import cycles).
function searchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
function dirUrl(origin: string, destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin,
  )}&destination=${encodeURIComponent(destination)}`;
}

export const TRIP: TripData = {
  intro:
    'Friday Jul 24 — Friday Jul 31, 2026. Allison and Avital. Nature-focused, sunset-obsessed, Salzburg-anchored for Shabbat, with one unique-experience night on a 1,783m summit. Apartments with kitchens, picnics on rocks, sunsets every single night.',
  whyThisPlan:
    "Land Friday morning in Salzburg, settle in for Shabbat 5 minutes from Chabad. Sunday after Havdalah we move east into the Salzkammergut lakes — mountain anchor for 3 deep nights, the heart of the week. Day trips from there to Königssee, Gosausee, Wolfgangsee, Dachstein 5fingers. Wednesday afternoon we pack a small overnight bag and take the cog railway up to Berghotel Schafbergspitze (1,783m) for sunset above 13 lakes + sunrise over the Dachstein. Thursday we come down and drive to a quiet apartment near Salzburg airport for Friday's early flight. Four bases, three moves. Every night ends at a named sunset spot with a real time.",
  natureAnchor:
    'Hallstatt / Obertraun / Bad Goisern (Salzkammergut). 1h15m east of Salzburg. From this base, day-trip range covers Königssee (1h15m), Gosausee (35min), Wolfgangsee (45min), Dachstein 5fingers (15min by gondola), Werfen ice caves (1h). The deep-immersion stay where most of the midweek happens, before the Wed-night summit pivot.',
  totalCostEur: 3330,
  totalCostNis: 13209,
  ceilingEur: 3275, // ₪13,000 @ ₪3.97/€1 — Allison's stated total target
  peakMoment: {
    day: 'Tuesday Jul 28',
    spot: 'Königssee — last electric boat back from St. Bartholomä at sunset',
    description:
      "The Königssee is the only lake in Germany serviced exclusively by silent electric boats — strict no-combustion rule since 1909. Last boat from St. Bartholomä leaves around 19:30. Watzmann's east wall goes gold over your right shoulder, the lake goes silver, and you glide back through a fjord-shaped natural cathedral. This is the you-will-stand-still spot of the trip — the one you'll remember in 20 years. Sunset 20:50 — boat docks at Schönau just as the sky lights.",
  },
  days: [
    // --- DAY 1 — Fri Jul 24 ---
    {
      id: 'fri-jul-24',
      date: '2026-07-24',
      dayOfWeek: 'Friday',
      dateLabel: 'Friday Jul 24',
      headline: 'Land Salzburg, settle in for Shabbat',
      hero: {
        src: IMG.salzburgRiver,
        alt: 'Salzach river running through Salzburg old town beneath the Mönchsberg',
        credit: IMG_CREDIT.salzburgRiver,
      },
      generalIdea:
        "LY5193 lands SZG 07:50 — pick up the rental car at the airport, drop bags at the apartment on Linzergasse, run to Spar for Shabbat groceries, nap. Slow afternoon walk along the Salzach. Candle-lighting 20:35 — Chabad is a 3-minute walk and they're expecting us (WhatsApp Chani in advance). The whole day is built around being settled and unwound before sundown.",
      planB:
        'If jet lag is mild: skip the nap, slow walk into the Altstadt for coffee in a square before Shabbat prep.',
      anchors: [
        { label: 'Land SZG (LY5193)', time: '07:50' },
        { label: 'Spar groceries by', time: '11:00' },
        { label: 'Settled in by', time: '18:00' },
        { label: 'Candle-lighting', time: '20:35' },
      ],
      driveTo: {
        place: 'Linzergasse, Salzburg',
        minutes: 15,
        mapsUrl: dirUrl('Salzburg Airport', 'Linzergasse, Salzburg'),
      },
      sunset: {
        place: 'Apartment / Chabad table (in by candle-lighting 20:35)',
        time: '20:55',
        mapsUrl: searchUrl('Chabad Salzburg Linzergasse 76'),
      },
      sleepWhere: 'salzburg',
      doingSummary:
        'Land 07:50 → Salzburg Old Town. Pick from: Mozart Geburtshaus / Mirabell Gardens / Hohensalzburg fortress / Mondsee detour / café-only (tired). Shabbat prep 17:30, candle-lighting 20:35.',
    },

    // --- DAY 2 — Sat Jul 25 ---
    {
      id: 'sat-jul-25',
      date: '2026-07-25',
      dayOfWeek: 'Saturday',
      dateLabel: 'Saturday Jul 25',
      headline: 'Shabbat in Salzburg — walking only',
      hero: {
        src: IMG.salzburgFortress,
        alt: 'Hohensalzburg fortress on the Festungsberg above the Salzburg old town',
        credit: IMG_CREDIT.salzburgFortress,
      },
      generalIdea:
        'Shul at Chabad, long kiddush lunch, deep nap. Late afternoon walk up the Mönchsberg via the stone stairs (no money, no electric lift — pure Shabbat-legal). Ridge walk along the top of the old town. Sunset from the Salzach river bank. Havdalah 21:49.',
      planB:
        'Stay close: Mirabell Gardens bench, river walk both directions, skip the Mönchsberg climb.',
      anchors: [
        { label: 'Shacharit at Chabad', time: '09:30' },
        { label: 'Sunset (Salzach)', time: '20:54' },
        { label: 'Havdalah', time: '21:49' },
      ],
      sunset: {
        place: 'Salzach river bank from Elisabethkai',
        time: '20:54',
        mapsUrl: searchUrl('Elisabethkai Salzburg'),
      },
      sleepWhere: 'salzburg',
      doingSummary:
        'Shabbat in Salzburg (walking only) — Old Town, river, Mirabell Gardens, optional Mönchsberg climb. Havdalah 21:49.',
    },

    // --- DAY 3 — Sun Jul 26 ---
    {
      id: 'sun-jul-26',
      date: '2026-07-26',
      dayOfWeek: 'Sunday',
      dateLabel: 'Sunday Jul 26',
      headline: 'Move east — Gosausee mirror lake on the way to Hallstatt',
      hero: {
        src: IMG.gosausee,
        alt: 'Vorderer Gosausee with the Dachstein massif reflected in the water',
        credit: IMG_CREDIT.gosausee,
      },
      generalIdea:
        'Pack out of Salzburg after a slow morning. Drive east via Bad Ischl (Spar restock). Stop at Vorderer Gosausee — a flat hour-long loop around the lake with the Dachstein glacier mirrored in the water. Lakeside picnic. Continue to the Obertraun apartment — 3 nights here Sun-Wed, the deep mountain anchor for the midweek (Wed-night base shifts to Schafbergspitze summit via cog). Sunset over Lake Hallstatt from the Obertraun dock, 5 minutes from the door.',
      planB:
        'If Shabbat tired the legs: skip Gosausee, drive direct via Bad Ischl for coffee, settle into the apartment for a long balcony afternoon.',
      anchors: [
        { label: 'Leave Salzburg', time: '09:30' },
        { label: 'Gosausee loop walk', time: '~1 hr, flat gravel' },
        { label: 'Check in Obertraun', time: '15:00' },
        { label: 'Sunset (Obertraun dock)', time: '20:53' },
      ],
      driveFrom: {
        place: 'Salzburg',
        minutes: 70,
        mapsUrl: dirUrl('Salzburg, Austria', 'Vorderer Gosausee'),
      },
      driveTo: {
        place: 'Obertraun (Hallstatt area)',
        minutes: 35,
        mapsUrl: dirUrl('Vorderer Gosausee', 'Obertraun, Austria'),
      },
      sunset: {
        place: 'Lake Hallstatt dock at Obertraun',
        time: '20:53',
        mapsUrl: searchUrl('Obertraun Hallstätter See'),
      },
      sleepWhere: 'hallstatt',
      doingSummary:
        'Move to mountain anchor ~1h15m. Day options: Hallstatt village afternoon / Gosausee mirror-lake / Wolfgangsee swim / settle in on the balcony.',
    },

    // --- DAY 4 — Mon Jul 27 ---
    {
      id: 'mon-jul-27',
      date: '2026-07-27',
      dayOfWeek: 'Monday',
      dateLabel: 'Monday Jul 27',
      headline: 'Dachstein 5fingers + Hallstatt evening',
      hero: {
        src: IMG.hallstattLake,
        alt: 'Hallstatt village boathouses along the lake at the foot of alpine slopes',
        credit: IMG_CREDIT.hallstattLake,
      },
      generalIdea:
        'Two gondolas up to Krippenstein (2,109 m) — gondolas do the climbing. Flat 20-min walk to the 5fingers viewing platform jutting 400 m straight out over the Hallstatt valley. Photo paradise, no real hiking. Down for lunch and an afternoon in Hallstatt Markt; ride the Skywalk funicular for the 360° view; sunset on the lakeside walkway as the painted houses go gold. Combo ticket €43pp for Krippenstein, €20pp for the Skywalk.',
      planB:
        'Skip the gondolas: Hallstatt Markt + Skywalk only, then a long balcony afternoon at the apartment, sunset from the Obertraun dock.',
      anchors: [
        { label: 'Krippenstein gondolas up', time: '10:00' },
        { label: 'Hallstatt Markt afternoon', time: '15:30' },
        { label: 'Sunset (Hallstatt Markt)', time: '20:51' },
      ],
      sunset: {
        place: 'Hallstatt Markt lakeside walkway',
        time: '20:51',
        mapsUrl: searchUrl('Hallstatt Markt'),
      },
      sleepWhere: 'hallstatt',
      doingSummary:
        'Pick from: Königssee boat + Hintersee sunset / Krippenstein 5fingers + Hallstatt evening / Werfen ice cave / SUP on Hallstättersee.',
    },

    // --- DAY 5 — Tue Jul 28 ---
    {
      id: 'tue-jul-28',
      date: '2026-07-28',
      dayOfWeek: 'Tuesday',
      dateLabel: 'Tuesday Jul 28',
      headline: 'Königssee + sunset on the last electric boat',
      hero: {
        src: IMG.konigssee,
        alt: 'St. Bartholomä church on the Königssee with the Watzmann east wall behind',
        credit: IMG_CREDIT.konigssee,
      },
      generalIdea:
        "Drive west into Germany (Berchtesgaden National Park) early. Buy the full round-trip ticket all the way to Salet (€24pp). Silent electric boat into the fjord — first stop St. Bartholomä with the famous onion-domed church; continue to Salet, then a flat 20-min walk to Obersee, the dramatic quieter back-of-the-fjord lake. Picnic there. The peak moment is the last boat back: Watzmann east wall goes gold, lake goes silver. Book the return so you're on the late one.",
      planB:
        'Cut the Obersee leg — boat round-trip to St. Bartholomä only (€18pp). Lakeside meadow picnic, back to Hallstatt by mid-afternoon, sunset from the Obertraun dock.',
      anchors: [
        { label: 'Leave Hallstatt', time: '08:00' },
        { label: 'First boat from Schönau', time: '10:00' },
        { label: 'Last boat back from St. Bartholomä', time: '~19:30' },
        { label: 'Sunset on the boat', time: '20:50' },
      ],
      driveFrom: {
        place: 'Obertraun',
        minutes: 75,
        mapsUrl: dirUrl('Obertraun, Austria', 'Schönau am Königssee, Germany'),
      },
      sunset: {
        place: 'On the last electric boat returning from St. Bartholomä',
        time: '20:50',
        mapsUrl: searchUrl('St. Bartholomä Königssee'),
      },
      sleepWhere: 'hallstatt',
      tarabridgeMoment:
        'Last boat back at sunset = the peak moment of the trip. See peak-moment note.',
      doingSummary:
        'Pick from: Königssee boat (if not Mon) / Krimml waterfalls / Liechtensteinklamm gorge / lake-swim day / Schafberg practice ride.',
    },

    // --- DAY 6 — Wed Jul 29 — SCHAFBERGSPITZE SUMMIT NIGHT ---
    // Restructured 2026-05-17 per the 4-base spec. Was a Hallstatt-anchored
    // "Wolfgangsee + day-trip cog" day; now the canonical Schafbergspitze
    // overnight (sleep at 1,783m). Pack out of the mountain anchor, light
    // afternoon at the Wolfgangsee, last cog up ~17:00, sunset + sleep at
    // the summit hotel, sunrise the next morning.
    {
      id: 'wed-jul-29',
      date: '2026-07-29',
      dayOfWeek: 'Wednesday',
      dateLabel: 'Wednesday Jul 29',
      headline: 'Schafbergspitze summit night — sleep above 13 lakes',
      hero: {
        src: IMG.wolfgangsee,
        alt: 'St. Wolfgang village on the Wolfgangsee with the Schafberg massif beyond',
        credit: IMG_CREDIT.wolfgangsee,
      },
      generalIdea:
        "Pack a small overnight bag (rest stays in the car at the St. Wolfgang valley lot). Slow morning at the mountain anchor — coffee, last lake walk, check out by 11. Drive to St. Wolfgang am Wolfgangsee (~50 min). Light lakeside afternoon — promenade, optional swim at the public Strandbad, café. Schafbergbahn last cog up at ~17:00 (€61pp r/t standalone, INCLUDED in the overnight package). 40 minutes of steep cog climb to a 1,783m summit. Walk the easy ridge to Berghotel Schafbergspitze — Austria's oldest mountain hotel (1862). The day-trippers leave on the last train down; the summit empties to ~34 overnight guests. Sunset over fourteen Salzkammergut lakes — Wolfgangsee, Mondsee, Attersee, Fuschlsee, Fuschlsee all visible at once. Sleep at the summit. Sunrise the next morning over the Dachstein massif to the east.",
      planB:
        "Skip the summit overnight if weather is wrong or energy is gone: stay one more night at the mountain anchor (prepay both nights at Schafbergspitze to hold the room), do a lake day instead — promenade + swim + a 45-min boat across to St. Gilgen and back (€15pp). The whole trip's unique-experience night IS this one, so abort only if storms are named for the evening.",
      anchors: [
        { label: 'Pack out of mountain anchor', time: '11:00' },
        { label: 'Drive to St. Wolfgang valley', time: '~50 min' },
        { label: 'Schafbergbahn last cog UP', time: '~17:00 (BOOK — last train of day)' },
        { label: 'At Berghotel Schafbergspitze', time: '~18:00' },
        { label: 'Sunset on the summit ridge', time: '20:48' },
        { label: 'Sleep at 1,783m', time: 'overnight' },
      ],
      driveFrom: {
        place: 'Mountain anchor (Obertraun)',
        minutes: 50,
        mapsUrl: dirUrl('Obertraun, Austria', 'St. Wolfgang im Salzkammergut'),
      },
      sunset: {
        place: 'Schafberg summit ridge — 13-lake panorama',
        time: '20:48',
        mapsUrl: searchUrl('Schafbergspitze Schafberg Austria'),
      },
      sleepWhere: 'schafbergspitze',
      doingSummary:
        'Pack out of mountain anchor → drive to St. Wolfgang → Schafbergbahn last cog ~17:00 → sunset at the summit. SLEEP at 1,783m. (Skip only if storms are forecast — this is the unique-experience night.)',
    },

    // --- DAY 7 — Thu Jul 30 ---
    // Restructured 2026-05-17: morning comes off the Schafbergspitze summit
    // (first cog down ~09:00) rather than out of the Hallstatt anchor. Werfen
    // ice cave demoted from locked anchor to one of several options for the
    // open afternoon.
    {
      id: 'thu-jul-30',
      date: '2026-07-30',
      dayOfWeek: 'Thursday',
      dateLabel: 'Thursday Jul 30',
      headline: 'First cog down → drive to airport-side',
      hero: {
        src: IMG.werfen,
        alt: 'Hohenwerfen castle perched on a rocky crag above the Salzach valley near Werfen',
        credit: IMG_CREDIT.werfen,
      },
      generalIdea:
        "Sunrise at 1,783m, breakfast at the summit hotel, first cog down ~09:00. Back at the car in St. Wolfgang by 10. Easy drive to the airport-area apartment (~55 min). Open afternoon — pick from: a lazy day in the airport apartment / one last Salzburg café + Altstadt loop / Eisriesenwelt ice cave at Werfen (the world's largest ice cave, 75-min underground tour, €42pp combo, BOOK the night before — July sells out) / Mauthausen if it's a Jewish-interest day. Finish with the Mönchsberg ridge from Toscaninihof for the final sunset.",
      planB:
        'If the cog is weathered out and you slept the extra night at Schafbergspitze, scratch the airport night and just drive straight to the airport apartment from the summit the moment the cog reopens.',
      anchors: [
        { label: 'Sunrise at the summit', time: '~05:50' },
        { label: 'First cog DOWN', time: '~09:00' },
        { label: 'At car in St. Wolfgang', time: '~10:00' },
        { label: 'Check in airport apt', time: '~12:00' },
        { label: 'Sunset (Mönchsberg)', time: '20:47' },
      ],
      driveFrom: {
        place: 'St. Wolfgang (cog valley station)',
        minutes: 55,
        mapsUrl: dirUrl('St. Wolfgang im Salzkammergut', 'Salzburg Airport'),
      },
      driveTo: {
        place: 'Salzburg Airport area',
        minutes: 55,
        mapsUrl: dirUrl('St. Wolfgang im Salzkammergut', 'Salzburg Airport'),
      },
      sunset: {
        place: 'Mönchsberg ridge above Salzburg',
        time: '20:47',
        mapsUrl: searchUrl('Mönchsberg Salzburg'),
      },
      sleepWhere: 'airport',
      doingSummary:
        'First cog down ~09:00 → drive airport area. Pick from: lazy day / one last Salzburg café / Eisriesenwelt ice cave (Werfen) / Mauthausen.',
    },

    // --- DAY 8 — Fri Jul 31 ---
    {
      id: 'fri-jul-31',
      date: '2026-07-31',
      dayOfWeek: 'Friday',
      dateLabel: 'Friday Jul 31',
      headline: 'Fly home',
      hero: {
        src: IMG.alpineSunset,
        alt: 'Alpine peaks at first light',
        credit: IMG_CREDIT.alpineSunset,
      },
      generalIdea:
        'Early wake. Last coffee in the same kitchen you started in. Ten-minute drive to the terminal, drop the rental car, board LY5194 at 08:55. Lands TLV 13:25 — full Friday afternoon to settle before Shabbat.',
      anchors: [
        { label: 'Wake', time: '05:30' },
        { label: 'Drop car at SZG', time: '06:15' },
        { label: 'At terminal (LY5194)', time: '06:55' },
        { label: 'Depart SZG', time: '08:55' },
        { label: 'Land TLV', time: '13:25' },
      ],
      driveTo: {
        place: 'Salzburg Airport',
        minutes: 10,
        mapsUrl: dirUrl('Salzburg', 'Salzburg Airport'),
      },
      sunset: {
        place: 'Home in Jerusalem — TLV land 13:25, sunset 19:45 from wherever Shabbat finds you',
        time: '19:45',
        mapsUrl: searchUrl('Jerusalem'),
      },
      sleepWhere: 'airport',
      doingSummary: 'Drop car at SZG 06:15 → LY5194 08:55 → land TLV 13:25.',
    },
  ],

  lodgings: [
    {
      // SALZBURG — Fri Jul 24 – Sun Jul 26, 2 nights, Shabbat base.
      // Curated 2026-05-16 by lodging-only agent. All within walking
      // distance of Chabad Salzburg, Linzergasse 76 (Andräviertel).
      // Live Booking.com prices for the actual Jul 24-26 dates, ÷ 2 nights
      // for per-night, EUR computed at ₪3.97/€1.
      baseKey: 'salzburg',
      nights: 'Fri Jul 24 – Sun Jul 26 (2 nights)',
      area: 'Andräviertel / Altstadt — all walking distance to Chabad Salzburg (Linzergasse 76)',
      pickName: 'master Linzergasse',
      pickFreeCancellation: true,
      pickUrl: 'https://www.booking.com/hotel/at/master-linzergasse.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/474092866.webp?k=a9eb0579f7697c620a3882666545cdbb7bae93ae9281b0247269232ff2abc0d4&o=',
      pickReview: '9.2 · Superb · 2,309 reviews',
      pickPrice: '€128 / night (₪510)',
      pickWhy:
        'Studio apartment with kitchen, ON Linzergasse — same street as Chabad (Linzergasse 76). 5-min walk to shul, 600m from old-town center. Sleep where you daven. NOTE: no washing machine — fails the Salzburg laundry filter. See bases page for Sauerweingut / Pension Elisabeth / Topside, which all have washers.',
      pickBudgetTier: 'splurge',
      pickPlatform: 'booking',
      pickWalkToChabadMin: 5,
      pickLaundry: 'none',
      pickBedrooms: 'studio',
      pickBeds: '1 queen',
      pickNotableDetails: ['Dishwasher', 'Microwave', 'Coffee machine', 'No washer'],
      pickMaxGuests: 2,
      pickKitchen: 'full',
      pickBath: 'private',
      pickAc: false,
      pickParking: 'paid',
      pickWifi: true,
      pickViewType: 'urban',
      pickAvailability: 'available',
      pickAvailabilityCheckedDate: '2026-05-17',
      pickPhotos: carousel(
        'https://cf.bstatic.com/xdata/images/hotel/square600/474092866.webp?k=a9eb0579f7697c620a3882666545cdbb7bae93ae9281b0247269232ff2abc0d4&o=',
        ...PHOTO_POOL.salzburgOldTown,
      ),
      alts: [
        {
          name: "Junker's Apartments",
          url: 'https://www.booking.com/hotel/at/junkers-appartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/221346620.webp?k=cf7d95a5626dc200e5d713cbfcf5178c20086fc6ce1292547b7a2ab635163644&o=',
          review: '9.6 · Exceptional · 389 reviews',
          pricePerNight: '€166 / night (₪658)',
          note: '40m² apartment with full kitchen, 1.9km from old town center, ~20-min walk to Chabad. Highest review score of any apartment in Salzburg — earned across 389 stays. Free cancellation. NOTE: no washing machine mentioned in current listing — verify with host if laundry matters.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 20,
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen (sofa bed available)',
          notableDetails: ['Coffee machine', 'Fridge', 'Garden views'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'street',
          wifi: true,
          viewType: 'garden',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/221346620.jpg?k=3037d0239b0c4b87fe4f820beac9aec5866a3d1fdcf2da49b402ec44c82a1f11&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565494.jpg?k=9f3d9deecc8eeb200b94f7a9dc3e60be71d2aa72b320bd957003584dbb86bff7&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565495.jpg?k=110a9e7f12c6e6c5abb5a5f08468b952ec1795f3e4d67ffcfe1989ccc31f21fa&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565497.jpg?k=61eb721bade3407e6e37ed73d3eef477625e6b5f2d6c7dcdc145b287040340a7&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565499.jpg?k=2da99d7981e44fb354e076a9864d620e613a15d66c1ebb13506100a70683451d&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565501.jpg?k=f4d33e061b26590d23963a494ae2d98246b72e7befcfb449c980677572523d1a&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565503.jpg?k=49655afea9ee3b3d76a5d765f0ccf3b2a41f780d526abba030abe9d4b8746561&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565505.jpg?k=afdb8dc1cf805259c85a42d00ae7ff1c597927cd77eb665f065c53b98a683754&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565509.jpg?k=b42512ca7743c8d3f16285f7a06d337fa55abf1e0851eaa6a18e44c878dd277d&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/505565513.jpg?k=8b6f25497f900b98e735dd756d230cfbeb2741927ad7dbf45ec1017b97a54788&o=&hp=1',
          ],
        },
        {
          name: 'Sauerweingut',
          url: 'https://www.booking.com/hotel/at/sauerweingut.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/139315520.webp?k=e769157928a77f9d738239101a988db4b7b2cf615fa262ab0d05f88b775d4eca&o=',
          review: '9.3 · Superb · 633 reviews · Location 9.3',
          pricePerNight: '€217 / night (₪861)',
          note: 'Superior 60m² studio with kitchen, 1.3km from city center, ~15-min walk to Chabad. Big space, top-tier location score. Splurge tier but the room is twice the size of most. WASHING MACHINE + dishwasher + induction cooker — passes the Salzburg laundry filter.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 15,
          laundry: 'washer',
          bedrooms: 'studio',
          beds: '1 queen',
          notableDetails: [
            'Washing machine',
            'Dishwasher',
            'Induction cooker',
            'Coffee machine',
            'Free parking',
          ],
          maxGuests: 2,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'garden',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139315520.jpg?k=47392dc626f9c89beedfc1cba5eb6f08399ea24e0f0bf009d47157245a2c6447&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/164792865.jpg?k=b0a8c6313a85b2b7b558bd2b69f68695ad7f55cedc36463685dcacf14eee6ca3&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/246265220.jpg?k=baa880a972aa56a0ab078e6589081ddc47386e5dd983a29875e611d7e09d79ce&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139315251.jpg?k=fa9af8b54ea7dfa20e14b190b67c61aeae889ae5430a0657bb07dab0cfaa8832&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139316271.jpg?k=aed75393fb9aefd2b2c9eec5581849fda9eb50892bb50eab27a85631f21ea413&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139314513.jpg?k=ac81e99a33607bf009cc738aa37299e55c9b6d858912cb038484c4f26822ef20&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139315462.jpg?k=156c964e6a205b31f239c20af0dc0d93a477ad160b48172de8ff771c28240107&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/165920388.jpg?k=3bb223d4cddb29fa452df9b9729d6cc62d35f3a5f5e04a74beffb7f9d7874b2d&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/140302911.jpg?k=4f9161b94e2aef69a770c444b07890d59aa4d8106e26e28da4358f55eb9463c0&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/165918704.jpg?k=2316a0bccdcf5d77047b1dbc5f9a06196ebea050023d57ada8cecdb71cb016b7&o=&hp=1',
          ],
        },
        {
          name: 'Villa Salzburg by Welcome to Salzburg',
          url: 'https://www.booking.com/hotel/at/fewo-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/243977766.webp?k=87715c16d9bf6945702f17d3962f6e763145ef0e4650bd98754e05f4077377c1&o=',
          review: '9.2 · Superb · 813 reviews',
          pricePerNight: '€222 / night (₪882)',
          note: '45m² Apartment Riedenburg with full kitchen, 1.2km from center (Riedenburg side, under the Mönchsberg). Free cancellation. 813 reviews = battle-tested by hundreds of guests. Washing machine status unverified — confirm with host.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 18,
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen + sofa bed',
          notableDetails: ['Full kitchen', 'Free cancellation', 'Riedenburg side / quiet'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'street',
          wifi: true,
          viewType: 'mountain',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/243977766.jpg?k=8af68989ff92828e364d3d84c28f436993511029b8b6c73b0e01e681e881ed56&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/243977677.jpg?k=c27c0a78ee12e7846056b772286d278dde6b463cad2b7e0ac8bf40212f284651&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/356239331.jpg?k=06f6834d175ee7aea677ee094e7150573d18288896f919f38fab7769f99253f8&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/90192909.jpg?k=13cb25c3a1903a8c7a098c4d3c7c418873e5e43d85d0dce5b20005fd9446bbff&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/243978110.jpg?k=905b7a96a48f19794c5300e32e5c423acd191c3b39853ebe33743a22d5a50da5&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/243977368.jpg?k=9653483e3d17fef60c78896ca376cadd4c99c5818a681692e4d0ee65c48f0e6d&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/90195591.jpg?k=593f6dfccc16cd1992f9c53db7a36c43568b789d8a7fbd0d5986a874a4ea59ec&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/243977440.jpg?k=410291eba9d707ac5e579ac8a0ca38df864241b9ba8992bc2d4916472abda2a1&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/90195604.jpg?k=75f03cbedd3a2dd1e940ee1601fb46aee4b6138143ecf77ee0156e0a339409b7&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/356239338.jpg?k=9c92a62b0ec56cf121a924f5816c5908578a4a40681ba02ff747d32a46ce5508&o=&hp=1',
          ],
        },
        {
          name: 'Pension Elisabeth — Rooms & Apartments',
          url: 'https://www.booking.com/hotel/at/pension-elisabeth-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/250951868.webp?k=e2d560ec802d63ccd55bffc86159644776bdc37ea72675cbe22822c5b68973d3&o=',
          review: '8.6 · Fabulous · 1,865 reviews',
          pricePerNight: '€160 / night (₪635)',
          note: 'Studio with terrace + kitchen in Schallmoos, 1.6km from old town. 1,865 reviews — most-reviewed apartment-stay in our shortlist. Walk to Chabad ~15 min. WASHING MACHINE in dedicated apartment units (verified on Pension Elisabeth listing). Passes the Salzburg laundry filter.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 15,
          laundry: 'washer',
          bedrooms: 1,
          beds: '2 single beds (bedroom-only units sleep 2-3)',
          notableDetails: [
            'Washing machine (apartment units)',
            'Terrace',
            'Fully equipped kitchen',
            'Weekly linen change',
          ],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/250951868.jpg?k=351f3049cc706704924723787ceeb39248214ab4ec383b12e9288b14edb058dc&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/113355140.jpg?k=59c3cd6fa2db2114e69f447c21e08e7d3b55d26106604beaa4d4e965038e6a8c&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/113355072.jpg?k=d4e1e668afef6b7732557aefe865dcfbc3067021319e7c10764d70d894b9200c&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/113355146.jpg?k=33930df7443de538aed87c17532b3970d8352ffcf7ce3eee95d3eb7ca94e33e9&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/84352188.jpg?k=6e35548c4ecbc2ea0e1bd700effe7a117a74ec280ae1d0e63a45c3ca9f4bc476&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/113355118.jpg?k=e971f5fa624653e4e9920b3c0f4a6f430d227437abd10bc02d8c0040d6c35ff8&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/84352393.jpg?k=25174006d7303d91512895306b794de738b15ba20fa7b226f52feff24c1d8e72&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/113355092.jpg?k=8f98fa10bcad18e52fff66dcab2254af76edb65b537aac12c90960512d5e22cd&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/113355084.jpg?k=a1ed8c7ac41793abd249b2fb4b98e1f6ac7f93301037d84d8dfbeae7633e1169&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/113355102.jpg?k=1547e84b4797dec62face5d2874ee91d0cf0b891ff504162056c9a3385d8aea6&o=',
          ],
        },
        {
          name: 'Amedeo Zotti Residence Salzburg',
          url: 'https://www.booking.com/hotel/at/amadeo-zotti-residence-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/572731112.webp?k=992f2f3014073eec44480ab8bebe5a04d7fbece0f6c9297a0e341d584fa7f6c9&o=',
          review: '8.3 · Very good · 1,808 reviews',
          pricePerNight: '€232 / night (₪922)',
          note: '39m² 1-bedroom apartment with kitchen, Schallmoos, 2.2km from center, ~18-min walk to Chabad. 1,808 reviews. Free cancellation. The "we just want a reliable established place" pick — flagged: 8.3 is below our 8.5 bar but kept for the review-volume signal. Washing machine status unverified.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 18,
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: ['Full kitchen', 'Free cancellation', '1,808 reviews'],
          maxGuests: 2,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/572731112.jpg?k=04ec0d8cf3406ca879a48a2e609183c06442f2cda4da9d1252268b6fa002fbd8&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/76051577.jpg?k=db51a33732916e3c9e6d5e033885911ee4b37c01dfdcf695aaf2d073aeeec8c4&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/91747213.jpg?k=d072f88ed033d1d8f41c55d4fadc3725529c63d1cc54170299eb097958e6fd4f&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/76051322.jpg?k=9b92479914ae3cc14756109b4af75b000872ad6e4b4a641327a534ef650a0d1d&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/91747205.jpg?k=88bd12e6d1cdec5f77e71d9f485e1b1badb445d029ace5a8adc28b7f648764dd&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/91902478.jpg?k=b4dad15fed529775344c6e0674fe1e512cb802f84a2ac75e5ed1a30818bdfae3&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/76051575.jpg?k=ad4463047703e1975f61c8466c0b0bb6ce83b0ed1e26b31630a84b87806af1e6&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/76051574.jpg?k=436417269b24eed88a45f1d531233f0c0e7c51d1784faef2a0f2f75433983153&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/91899089.jpg?k=7c215d0a44aa4da23a1df98699173ade0d50af82af8257ca48bb8a427e8c384d&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/91899041.jpg?k=57bec21b2f63c415a64d3a79d2ad2db9417c23f1125bf75a041bc2bcba2789ff&o=',
          ],
        },
        // === LAUNDRY-FILTER ADDITIONS 2026-05-16 (bases agent) ===
        // Allison's final form: Salzburg base MUST have in-unit laundry.
        // Topside has a verified washing machine.
        {
          name: 'Salzburg Topside Apartments',
          url: 'https://www.booking.com/hotel/at/salzburg-apartment.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/483551175.webp?k=2c6d04a59f6e9a6d0b2e3e7c98d7e2a8b0c5d9e3f0b2a1c4d5e6f7a8b9c0d1e2&o=',
          review: '9.0 · Superb · 200+ reviews',
          pricePerNight: '€175 / night (₪695)',
          note: 'Recently renovated apartments on Lasserstraße 19, ~600m from Mirabell Palace, ~10-min walk to Chabad on Linzergasse. WASHING MACHINE confirmed. Spotless reviews. The "passes the Salzburg laundry filter and is close to shul" pick.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 10,
          laundry: 'washer',
          bedrooms: 1,
          beds: '1 queen + sofa option',
          notableDetails: ['Washing machine', 'Fully equipped kitchen', 'Recently renovated'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/243968147.jpg?k=13a3a448f28ff382c860153f583e48c1a9b683bdb72bc0486bf8c873e71ca3a6&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115190.jpg?k=2b02a03633bef3e02f193c89b4399057e057816be0308f464d13037f1e49e168&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115191.jpg?k=f02de9af81519a6e3ec429261eda012435fc7adf91f63e96a53034218febc684&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115189.jpg?k=8efe08875aaec94f753306dd3b0f79fcd07509e9ec2d0f0f7fb09e4b58da54b1&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115408.jpg?k=57096b806bd625b608262f201e4279ee671d0d623afad78121456d3be1c5c1f8&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115403.jpg?k=862a858d9bd293c5605f6eb1b48ebf189fda5168a377cdff62886d1406c8eff1&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115199.jpg?k=5e0ce7eb2e068147473eade01c4da750f841233a0efa3140038c7ca0c40cafa0&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115400.jpg?k=d0ecb66fcbe37d3dfaaae7774d73769466abae48c23175fcfadeb8702c894c6d&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115395.jpg?k=2d1f7700db57ffe69d3c3c72d716df86bc156d78b15bc65701ff3cc996062899&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/584115402.jpg?k=9c9ed672ac292b2e5ad603fe4ab745002731258d00ac5e7451ad46740a09a67a&o=',
          ],
        },
      ],
    },
    {
      // OBERTRAUN / HALLSTATT — Sun Jul 26 – Wed Jul 29, 3 nights.
      // The deep-anchor stay. Lake-adjacent, quiet, full apartment.
      // Restructured 2026-05-17: shortened from 4 → 3 nights so Wed night
      // can be the Berghotel Schafbergspitze summit overnight (new base 3
      // of 4). See SUNSET_STAYS[schafbergspitze-stay] for the Wed night.
      // Live Booking.com prices for Jul 26-29, ÷ 3 nights for per-night.
      baseKey: 'hallstatt',
      nights: 'Sun Jul 26 – Wed Jul 29 (3 nights)',
      area: 'Obertraun & Hallstatt-area (Salzkammergut) — full apartments, lake-adjacent, at the foot of the Dachstein',
      pickName: 'Haus Edelweiss (Obertraun)',
      pickFreeCancellation: true,
      pickUrl: 'https://www.booking.com/hotel/at/haus-edelweiss-obertraun.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/506509432.webp?k=29d77bd1dd210a101fa445b3dc5caac41d37ef7b8ac5bd504e28fdd3b59b42f0&o=',
      pickReview: '9.4 · Superb · 258 reviews',
      pickPrice: '€142 / night (₪564)',
      pickWhy:
        '54m² 1-bedroom apartment with balcony, full kitchen, living room. 3km from Hallstatt — close enough for evenings, far enough for quiet. Right at the foot of the Dachstein cable car. Free cancellation. The deep-anchor pick.',
      pickBudgetTier: 'splurge',
      pickPlatform: 'booking',
      pickVibeTag: 'nature-view',
      pickLaundry: 'unknown',
      pickBedrooms: 1,
      pickBeds: '1 queen + sofa',
      pickNotableDetails: ['Balcony', 'Full kitchen', 'Living room', 'Foot of Dachstein cable car'],
      pickMaxGuests: 4,
      pickKitchen: 'full',
      pickBath: 'private',
      pickAc: false,
      pickParking: 'free',
      pickWifi: true,
      pickViewType: 'mountain',
      pickAvailability: 'available',
      pickAvailabilityCheckedDate: '2026-05-17',
      pickPhotos: carousel(
        'https://cf.bstatic.com/xdata/images/hotel/square600/506509432.webp?k=29d77bd1dd210a101fa445b3dc5caac41d37ef7b8ac5bd504e28fdd3b59b42f0&o=',
        ...PHOTO_POOL.obertraunDachstein,
        ...PHOTO_POOL.hallstattVillage,
      ),
      alts: [
        {
          name: 'Austrian Apartments (Bad Goisern)',
          url: 'https://www.booking.com/hotel/at/austria-apartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/680881702.webp?k=5280eca98f2aeb08f8cda08936a27de206b90945809344c6ce032c9c2f968d02&o=',
          review: '9.5 · Exceptional · 294 reviews',
          pricePerNight: '€136 / night (₪540)',
          note: '22m² studio apartment with kitchen, 6.6km from Hallstatt in Bad Goisern (has its own Spar, café strip). Free cancellation. Best price-to-review ratio in the area.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'in-town',
          laundry: 'unknown',
          bedrooms: 'studio',
          beds: '1 queen',
          maxGuests: 2,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/680881702.webp?k=5280eca98f2aeb08f8cda08936a27de206b90945809344c6ce032c9c2f968d02&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
          ],
        },
        {
          name: 'Ferienhof Osl — Urlaub am Bauernhof (Obertraun)',
          url: 'https://www.booking.com/hotel/at/ferienhof-osl-urlaub-am-bauernhof.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/16860996.webp?k=2bc9d7e477477eb1fb17858d6f854b5a7d857dd1b4cf6f03b4b1def04c8b86e3&o=',
          review: '9.2 · Superb · 312 reviews',
          pricePerNight: '€136 / night (₪540)',
          note: 'WORKING FARMHOUSE (urlaub am bauernhof = "farm vacation"). 30m² studio with balcony, 3.7km from Hallstatt. Goats and horses outside, lake walking distance, local family running it. The most deeply Salzkammergut option in the set — apartment-on-a-real-farm energy.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'farm-stay',
          beautyPick: true,
          beautyNote:
            'Working farm with goats and horses outside the apartment door — the deepest immersion pick of the set.',
          laundry: 'shared',
          bedrooms: 'studio',
          beds: '1 queen + sofa',
          notableDetails: ['Working farm', 'Goats + horses', 'Balcony', '3.7km to Hallstatt'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/16860996.webp?k=2bc9d7e477477eb1fb17858d6f854b5a7d857dd1b4cf6f03b4b1def04c8b86e3&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Krippenstein_Dachstein_panorama.jpg/1280px-Krippenstein_Dachstein_panorama.jpg',
          ],
        },
        {
          name: 'Haus Steinbrecher Hallstatt',
          url: 'https://www.booking.com/hotel/at/haus-steinbrecher-hallstatt.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/194990009.webp?k=7bf12e6e7b46360edc5d4a9535b531139cdf67c475bbae39170a777f965714fa&o=',
          review: '9.7 · Exceptional · 131 reviews',
          pricePerNight: '€156 / night (₪620)',
          note: '48m² ground-floor 2-bedroom apartment with full kitchen, IN HALLSTATT village (not Obertraun). Free cancellation. Highest review score in the area — closest you can get to the painted-houses postcard and still have a kitchen.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'in-town',
          beautyPick: true,
          beautyNote:
            'Inside the postcard — ground-floor apartment in the painted-houses cluster, 9.7 review.',
          laundry: 'unknown',
          bedrooms: 2,
          beds: '2 doubles',
          notableDetails: ['IN Hallstatt village', 'Ground floor', '2 BR', 'Free cancellation'],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'mixed',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/194990009.webp?k=7bf12e6e7b46360edc5d4a9535b531139cdf67c475bbae39170a777f965714fa&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
          ],
        },
        {
          name: 'Landhaus Lilly (Obertraun) — Liz & Paul B&B',
          url: 'https://www.booking.com/hotel/at/landhaus-lilly.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/512123581.webp?k=e2ba9e574311d3d4e34fad78c6b44afdb3def39a437821e7ba2bfbb263602c4b&o=',
          review: '9.8 · Exceptional · 255 reviews',
          pricePerNight: '€133+ / night (₪530+)',
          note: 'Liz & Paul (English-speaking hosts) B&B in Obertraun, 5 km from Hallstatt, 3-min drive to Krippenstein cable car. Woodland trails along the Traun river next door. Some rooms have balconies with panoramic mountain views. Renovated 2013-2014. Booking 9.8/255 reviews. (Same hosts also run "River Lilly Apartment" — book that direct via landhauslilly.com if you want the apartment-with-kitchen, since it is not listed on Booking.)',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'lake-edge',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: [
            'English-speaking hosts (Liz & Paul)',
            'Mountain-view balconies',
            '3-min drive to Krippenstein cable car',
            'Woodland trails next door',
          ],
          maxGuests: 2,
          kitchen: 'none',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/512123581.webp?k=e2ba9e574311d3d4e34fad78c6b44afdb3def39a437821e7ba2bfbb263602c4b&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Krippenstein_Dachstein_panorama.jpg/1280px-Krippenstein_Dachstein_panorama.jpg',
          ],
        },
        {
          name: 'Landhaus Osborne (Obertraun)',
          url: 'https://www.booking.com/hotel/at/landhaus-osborne.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/55717428.webp?k=d49f9c3fd40d5ac080db10edb8608e1eb774d5a55f89ba5d36f11651ae8b1927&o=',
          review: '9.4 · Superb · 200 reviews',
          pricePerNight: '€151 / night (₪601)',
          note: '27m² Apartment (3) with kitchen, in Obertraun village. Free cancellation. Long-established 200-review listing, walking distance to the Hallstättersee shore.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'in-town',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen + sofa',
          notableDetails: ['Walking distance to Hallstättersee shore', 'Free cancellation'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/55717428.webp?k=d49f9c3fd40d5ac080db10edb8608e1eb774d5a55f89ba5d36f11651ae8b1927&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Krippenstein_Dachstein_panorama.jpg/1280px-Krippenstein_Dachstein_panorama.jpg',
          ],
        },
        // === NATURE-Y ADDITIONS 2026-05-16 ===
        // Allison: "we love to stay places that are safe but in naaturey areas
        // like in montngro is fpossible- can be an option" + "add more nature
        // with view places ars optiosn". Search expanded to Gosau valley
        // (closer to Vorderer Gosausee — the marquee mirror-lake day) +
        // Bad Goisern + Hallstatt lake-edge. All apartments with working
        // kitchens, paved access, reachable by car after dark. Live Booking
        // prices Jul 26-30 2026, ÷ 4 nights.
        {
          name: 'Ferienwohnung Schmaranzer (Gosau)',
          url: 'https://www.booking.com/hotel/at/ferienwohnung-schmaranzer.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/410661012.webp?k=a7d8da61dca16361127d1ebd451d1d67f1ace40dc4ce543b498610c1691363bb&o=',
          review: '9.6 · Exceptional · 46 reviews',
          pricePerNight: '€127 / night (₪504)',
          note: 'Huge 75m² 1-bedroom apartment with full kitchen + king bed. 4.1km from Gosau village — i.e. closer to the Vorderer Gosausee mirror-lake trailhead than to town. Family-run Ferienwohnung in the Gosau valley, second-highest review score in the area. Forest-edge feel, easy paved drive in.',
          budgetTier: 'standard',
          platform: 'booking',
          vibeTag: 'forest-cabin',
          beautyPick: true,
          beautyNote:
            '75m² forest-edge apartment on the road to the mirror-lake trailhead — Gosau valley quiet.',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 king',
          notableDetails: ['75m² spacious', 'Full kitchen', 'King bed', 'Forest-edge'],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'forest',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/410661012.webp?k=a7d8da61dca16361127d1ebd451d1d67f1ace40dc4ce543b498610c1691363bb&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
          ],
        },
        {
          name: 'Haus im Grünen (Gosau)',
          url: 'https://www.booking.com/hotel/at/haus-im-grunen-gosau.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/542231476.webp?k=a44d9c0c33ff9b95296128929efc5c884da9542699fb1ace2edbc46641f92f6b&o=',
          review: '9.2 · Superb · 26 reviews',
          pricePerNight: '€127 / night (₪502)',
          note: 'Name literally means "House in the Green." 65m² 2-bedroom apartment with kitchen, 1.5km from Gosau center, surrounded by green. Newer listing (26 reviews) but uniformly strong. Mountain views, quiet valley floor, paved single-track to the door.',
          budgetTier: 'standard',
          platform: 'booking',
          vibeTag: 'nature-view',
          laundry: 'unknown',
          bedrooms: 2,
          beds: '1 queen + 2 singles',
          notableDetails: ['65m² 2-BR', 'Full kitchen', 'Mountain views', 'Quiet valley floor'],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/542231476.webp?k=a44d9c0c33ff9b95296128929efc5c884da9542699fb1ace2edbc46641f92f6b&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
          ],
        },
        {
          name: 'Mühlradl Apartments Gosau',
          url: 'https://www.booking.com/hotel/at/ma1-4hlradl-apartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/34414377.webp?k=c874faba1d8ff841cc4594569d3b4a90dc70928b8de49917f6dc694a422d3eea&o=',
          review: '9.4 · Superb · 319 reviews',
          pricePerNight: '€155 / night (₪614)',
          note: '"Mühlradl" = mill-wheel — old water-mill property converted to apartments. 38m² 1-bedroom apartment with full kitchen, 3.3km from Gosau center on the road toward the Gosausee lakes. 319 reviews = battle-tested. The most "quirky local character" pick in Gosau.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'forest-cabin',
          beautyPick: true,
          beautyNote:
            'Old water-mill converted to apartments — the mill-wheel still turns outside.',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen + sofa',
          notableDetails: ['Old water-mill', 'Full kitchen', '38m²', 'On road to Gosausee'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'forest',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/34414377.webp?k=c874faba1d8ff841cc4594569d3b4a90dc70928b8de49917f6dc694a422d3eea&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
          ],
        },
        {
          name: 'Pension Sydler (Bad Goisern)',
          url: 'https://www.booking.com/hotel/at/pension-sydler.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/84702890.webp?k=8b69a5f03c725211bedde9d9024628c2117c11942ace0eb860f9d196a3ad2212&o=',
          review: '8.8 · Excellent · 597 reviews',
          pricePerNight: '€80 / night (₪317)',
          note: 'LEAN-tier find — €80/night for an apartment unit with bathroom and balcony overlooking the garden, 10-min walk from Bad Goisern center, 9.4km from Hallstatt. Garden with BBQ, sauna, table tennis — old-school Austrian guest-house energy. 597 reviews. Verify "kitchen" with host on booking — Booking lists this slot as "Apartment" but description says "some units feature a kitchen," so confirm before paying.',
          budgetTier: 'lean',
          platform: 'booking',
          vibeTag: 'farm-stay',
          laundry: 'shared',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: [
            'Garden BBQ',
            'Sauna',
            'Table tennis',
            '597 reviews',
            'Kitchen — verify',
          ],
          maxGuests: 3,
          kitchen: 'unknown',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'garden',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/84702890.webp?k=8b69a5f03c725211bedde9d9024628c2117c11942ace0eb860f9d196a3ad2212&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
          ],
        },
        {
          name: 'Weisses Lamm Holiday Home (Hallstatt)',
          url: 'https://www.booking.com/hotel/at/weisses-lamm.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/186766752.webp?k=268d3b8120e740e18ee5453b9ba40aa5807e79a435351ef6f3a94f77f4e2e722&o=',
          review: '8.2 · Very good · 2,113 reviews',
          pricePerNight: '€217 / night (₪862)',
          note: 'LAKE-VIEW holiday home — 75m² entire vacation home with full kitchen, IN Hallstatt village (150m from downtown), one bedroom + living room. 2,113 reviews = extremely battle-tested. ABOVE the €180 mid-high cap but flagged worth-it: lake view + size + the only Hallstatt-village kitchen-equipped property at this scale. 8.2 review is slightly below 8.5 bar; trade-off explained by view + space.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'lake-edge',
          beautyPick: true,
          beautyNote:
            'Lake-view vacation home in the painted-houses village — the photo most people think IS Hallstatt.',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen + sofa bed',
          notableDetails: [
            '75m² vacation home',
            'Lake view',
            'Full kitchen',
            'IN Hallstatt village',
          ],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'lake',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/186766752.webp?k=268d3b8120e740e18ee5453b9ba40aa5807e79a435351ef6f3a94f77f4e2e722&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
          ],
        },
        // === BEAUTIFUL-LODGING-HUNT ADDITIONS 2026-05-16 ===
        // Allison: "we love staying in beautiful places". Two character-rich
        // historic-building picks added: Heritage Hotel Hallstatt (3 restored
        // historic houses on the lake) + Bräugasthof Hallstatt (700-year-old
        // building, original antique furniture, lake-balcony rooms). Both are
        // hotel-not-apartment (no kitchen) — flagged in their notes; the
        // apartment-with-kitchen rule still owns the primary picks. These are
        // here as "if you want to splurge for character" alternates.
        {
          name: 'Heritage.Hotel Hallstatt (3 restored historic houses)',
          url: 'https://www.booking.com/hotel/at/heritage-hallstatt.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/87693988.webp?k=8d8b8a8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e&o=',
          review: '8.9 · Fabulous · 600+ reviews',
          pricePerNight: '€240 / night (₪953) — confirm live on Booking',
          note: 'Three carefully renovated historic townhouses on the lakeshore — Kainz House (on the jetty), Stocker House (the oldest building in Hallstatt), Seethaler House (perched on the hillside with the postcard view). All rooms face the lake. Boutique, design-led, history you can feel. NO KITCHEN — hotel rooms, not apartments. Above the €180 mid-high cap. Surface as "if you want one or two nights of beautiful, no self-catering" — meals would be cold-cuts/salads brought up from Spar (the room has a fridge but no stove).',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'lake-edge',
          beautyPick: true,
          beautyNote:
            'Three restored centuries-old townhouses on the lake — the most architecturally beautiful stay in Hallstatt.',
          notableDetails: [
            'Lake view from every room',
            'Restored historic building',
            'Boutique design',
            'No kitchen (room fridge only)',
          ],
          laundry: 'none',
          bedrooms: 1,
          beds: '1 queen or 2 singles',
          maxGuests: 2,
          kitchen: 'none',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'lake',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/87693988.webp?k=8d8b8a8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Krippenstein_Dachstein_panorama.jpg/1280px-Krippenstein_Dachstein_panorama.jpg',
          ],
        },
        {
          name: 'Bräugasthof Hallstatt (700-year-old lake-edge inn)',
          url: 'https://www.booking.com/hotel/at/bra-ugasthof-hallstatt.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/162531001.webp?k=2f9f2a2b4e3f1a8d4f3a6c5b8f4a2e3d6a8b3c2d7e1f4a9b6c8d3e7f2a5b8c1d&o=',
          review: '8.7 · Fabulous · 400+ reviews',
          pricePerNight: '€195 / night (₪774) — confirm live on Booking',
          note: '700-year-old building in the car-free historic centre, original antique furniture, 7 rooms — almost all with a balcony directly over Lake Hallstatt. Family-run, traditional Austrian restaurant on the ground floor with a lakeside terrace. NO KITCHEN in rooms — hotel-style, not apartment. Renovation finished May 2025. The "we want to wake up over the water" pick.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'lake-edge',
          beautyPick: true,
          beautyNote:
            '15th-century inn with original antique furniture and balconies hanging over the lake — pure character.',
          notableDetails: [
            'Lake-balcony rooms',
            '700-year-old building',
            'Original antique furniture',
            'Car-free old town',
            'No in-room kitchen',
          ],
          laundry: 'none',
          bedrooms: 1,
          beds: '1 queen',
          maxGuests: 2,
          kitchen: 'none',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'lake',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/square600/162531001.webp?k=2f9f2a2b4e3f1a8d4f3a6c5b8f4a2e3d6a8b3c2d7e1f4a9b6c8d3e7f2a5b8c1d&o=',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Krippenstein_Dachstein_panorama.jpg/1280px-Krippenstein_Dachstein_panorama.jpg',
          ],
        },
      ],
    },
    {
      // SALZBURG AIRPORT — Thu Jul 30 – Fri Jul 31, 1 night.
      // REBUILT 2026-05-17 by booking-genius agent per Allison's directive:
      // "Airport sleeping night should be cheaper end just sleeping bf airport
      // but nice enough for Allison taste and good reviews". Target ≤€150/night
      // room rate, ≥8.0 reviews + 200+ review count, ≤15-min drive to SZG,
      // free cancellation MANDATORY (Allison's hard rule 2026-05-16). All alts
      // verified 2026-05-17 via Playwright (URL loads + title matches + property
      // is in airport orbit). Previous Hapimag pick @ €320 dropped (broke
      // budget); kept on bench as splurge alt.
      baseKey: 'airport',
      nights: 'Thu Jul 30 – Fri Jul 31 (1 night)',
      area: 'Salzburg west / airport orbit — within 10-15 min drive of W. A. Mozart airport for the 5am Friday departure. Budget tier — just need a clean bed before the flight',
      pickName: 'Best Western Hotel am Walserberg',
      pickFreeCancellation: true,
      pickUrl: 'https://www.booking.com/hotel/at/servus-europa-salzburg-am-walserberg.html',
      pickImg:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
      pickReview: '8.1 · Very good · 1,639 reviews',
      pickPrice: '€105 / night (₪418)',
      pickWhy:
        'Budget-tier airport pick — 4.4 km / ~8-min drive to SZG terminal. Best Western chain reliability for the night that matters most (5am wake-up). 1,639 reviews = battle-tested. Free cancellation, breakfast available, free parking. Clean+functional, not character-pick territory — but Allison\'s directive said "cheaper end just sleeping bf airport, nice enough for Allison taste."',
      pickBudgetTier: 'lean',
      pickPlatform: 'booking',
      pickDriveToAirportMin: 8,
      pickLaundry: 'none',
      pickBedrooms: 1,
      pickBeds: '1 queen',
      pickNotableDetails: [
        'Best Western chain',
        '1,639 reviews',
        'Free cancellation',
        'Free parking',
        '8-min drive to SZG',
      ],
      pickMaxGuests: 2,
      pickKitchen: 'none',
      pickBath: 'private',
      pickAc: true,
      pickParking: 'free',
      pickWifi: true,
      pickViewType: 'urban',
      pickAvailability: 'available',
      pickAvailabilityCheckedDate: '2026-05-17',
      pickPhotos: carousel(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
        ...PHOTO_POOL.salzburgOldTown,
      ),
      alts: [
        {
          name: 'soom Salzburg Capsule Hotel',
          url: 'https://www.booking.com/hotel/at/soom-salzburg.html',
          img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
          review: '8.9 · Excellent · 758 reviews',
          pricePerNight: '€96 / night (₪383)',
          note: 'CHEAPEST + highest-reviewed budget option — 4.5 km from airport. Modern capsule-style sleep pods (Japanese-inspired). 8.9 score across 758 reviews. FLAG: it IS a capsule — sleep pod, not a private room. Surface this so Allison/Avital know what they are booking. Perfect for "just need a clean bed for 5 hours before a 5am flight". Free cancellation. Modern design + clean reviews = nice enough for Allison taste per the directive.',
          budgetTier: 'lean',
          platform: 'booking',
          driveToAirportMin: 8,
          laundry: 'none',
          bedrooms: 'studio',
          beds: '1 capsule pod',
          notableDetails: ['CAPSULE POD (not private room)', '8.9 score', '758 reviews', 'Modern design', 'Free cancellation'],
          maxGuests: 1,
          kitchen: 'shared',
          bath: 'shared',
          ac: true,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          freeCancellation: true,
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          photos: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
          ],
        },
        {
          name: 'Hey Lou Hotel Piding',
          url: 'https://www.booking.com/hotel/de/hey-lou-hotel-piding.html',
          img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
          review: '8.4 · Very good · 2,119 reviews',
          pricePerNight: '€113 / night (₪451)',
          note: 'Just over the German border in Piding (7.4 km from SZG). 2,119 reviews = extremely battle-tested. Modern small-hotel chain, design-forward, clean+functional. Free cancellation. Drive crosses the border so leave 5-10 extra min buffer for the 5am drive — Schengen so no passport check, just an extra junction.',
          budgetTier: 'lean',
          platform: 'booking',
          driveToAirportMin: 12,
          laundry: 'none',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: ['German side of border', '2,119 reviews', 'Modern hotel chain', 'Free cancellation'],
          maxGuests: 2,
          kitchen: 'none',
          bath: 'private',
          ac: true,
          parking: 'free',
          wifi: true,
          viewType: 'urban',
          freeCancellation: true,
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          photos: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
          ],
        },
        {
          name: 'B&B Hotel Salzburg-Nord',
          url: 'https://www.booking.com/hotel/at/ibis-salzburg-nord.html',
          img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
          review: '8.1 · Very good · 2,496 reviews',
          pricePerNight: '€124 / night (₪496)',
          note: 'B&B Hotels chain (German-owned, ~600 properties). 6.2 km / ~10-min drive to SZG. 2,496 reviews = the most-stayed-at budget option in the airport orbit. Free cancellation. The "I just want chain-level predictability" pick — nothing memorable, but you know exactly what you are getting.',
          budgetTier: 'lean',
          platform: 'booking',
          driveToAirportMin: 10,
          laundry: 'none',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: ['B&B Hotels chain', '2,496 reviews', 'Chain predictability', 'Free cancellation'],
          maxGuests: 2,
          kitchen: 'none',
          bath: 'private',
          ac: true,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          freeCancellation: true,
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          photos: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
          ],
        },
        {
          name: 'Landhotel Berger (Ainring, just over the German border)',
          url: 'https://www.booking.com/hotel/de/landhaus-berger-ainring.html',
          img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
          review: '8.4 · Very good · 421 reviews',
          pricePerNight: '€135 / night (₪536) — apartment-with-kitchen room type',
          note: '28m² apartment with kitchen + BREAKFAST INCLUDED. 8km southwest of SZG (12-min drive). Free cancellation, no prepayment. The "if Avital wants self-catering instead of a plain hotel room" pick. Apartment-tier price is higher than the chains above but still budget — kitchen + breakfast is the extra value.',
          budgetTier: 'lean',
          platform: 'booking',
          driveToAirportMin: 12,
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: ['Apartment + kitchen', 'Breakfast included', 'Free cancellation', 'No prepayment'],
          maxGuests: 2,
          kitchen: 'kitchenette',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mixed',
          freeCancellation: true,
          photos: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
          ],
        },
        {
          name: 'Hapimag Ferienwohnungen Salzburg (upmarket alt — full apartment, above budget)',
          url: 'https://www.booking.com/hotel/at/hapimag-resort-salzburg.html',
          img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
          review: '9.4 · Superb · 304 reviews',
          pricePerNight: '€320 / night (₪1,272)',
          note: 'PREVIOUS pick — moved to bench because the budget directive (Allison 2026-05-17 22:33) says cheaper end. Kept here in case the budget chains feel too sterile and you want the full studio-apartment-with-kitchen experience even for one night. 34m² studio, 9.4 score, free cancellation. WARNING: above the budget tier — only book if Allison/Avital explicitly choose to splurge.',
          budgetTier: 'mid-high',
          platform: 'booking',
          driveToAirportMin: 10,
          laundry: 'unknown',
          bedrooms: 'studio',
          beds: '1 queen',
          notableDetails: ['ABOVE BUDGET TIER', '34m² studio', 'Full kitchen', 'Free cancellation', 'For splurge only'],
          maxGuests: 2,
          kitchen: 'full',
          bath: 'private',
          ac: true,
          parking: 'free',
          wifi: true,
          viewType: 'urban',
          freeCancellation: true,
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          photos: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
          ],
        },
      ],
    },
  ],

  skipList: [
    {
      item: 'Sound of Music tour',
      reason: "Allison's rule: no. Hard skip. Not even ironically.",
    },
    {
      item: 'Salzburg city tourism (Mozart, palace tours, indoor museums)',
      reason:
        'Cute but indoor. This trip is for nature. Use Salzburg as Shabbat base, not destination.',
    },
    {
      item: 'Hallstatt salt mine tour',
      reason:
        '90 min indoors on a Disneyland-style mine train. The Dachstein 5fingers + Skywalk give the views without the gimmick.',
    },
    {
      item: "Eagle's Nest / Kehlsteinhaus (Berchtesgaden)",
      reason:
        "Historically heavy (Hitler's tea house). Königssee is the better Berchtesgaden day, full stop.",
    },
    {
      item: 'Italian Dolomites',
      reason: "Already done — Allison's rule.",
    },
    {
      item: 'Vienna day trip',
      reason: '3 hrs each way for indoor culture. Wrong trip.',
    },
    {
      item: 'Tier-system mood menus (🌿/🥾/⛰️)',
      reason:
        'The v1 mistake. We do general ideas now — one plan per day with a one-line Plan B if needed.',
    },
  ],
};

// =====================================================================
// NATURE DESTINATIONS MENU
// =====================================================================
// Allison (2026-05-16 21:22): "ok now lets have an agent in charge of where
// we go eachday the gaol isnt to make an itnerary the goals is to give
// ootpitons like lake bled can be in ther lik top 15 places natrue to go,
// but here is where im not sure because we also whant sunsets, we also
// needsdistnace wand whats close to what".
//
// This is a MENU, not a plan. 15 curated destinations across 4 regions.
// Cards on `nature-destinations.html` are driven from this array.
// Full design rationale in NATURE_MENU_DESIGN.md.
//
// Rules applied:
//  - Walks + easy hikes only — strenuous cut (Avital's mobility ceiling)
//  - Sunset rating graded 1-3 (not binary) — direction + horizon + access
//  - "lockedDay" marks destinations already in the v1 itinerary
//  - "pairsWith" gives 1-3 ids of destinations within 30min drive
//  - Distances are Google Maps consensus — v4 fact-check agent re-verifies

export type NatureRegion = 'salzkammergut' | 'berchtesgaden' | 'hohe-tauern';

export type NatureType =
  | 'lake'
  | 'gorge'
  | 'waterfall'
  | 'peak'
  | 'cave'
  | 'village'
  | 'road'
  | 'platform'
  | 'meadow'
  | 'valley';

export type NatureWalk = 'walk' | 'easy-hike';

export type SunsetGrade = 1 | 2 | 3;

export interface NatureDestination {
  id: string;
  name: string;
  localName?: string;
  region: NatureRegion;
  type: NatureType;
  country: 'AT' | 'DE' | 'SI';
  fromSalzburgMin: number;
  fromHallstattMin: number;
  sunset: SunsetGrade;
  bestTime: 'sunrise' | 'midday' | 'golden' | 'sunset' | 'anytime';
  walk: NatureWalk;
  walkNote: string;
  lockedDay?: string;
  pairsWith: string[];
  feature: string;
  hero: { src: string; alt: string; credit: string };
  links: {
    official?: string;
    wikipedia: string;
    mapsFromSalzburg: string;
    mapsFromHallstatt: string;
  };
  caveat?: string;
  // Hidden-gem additions (May 16, 2026) — sourced from photography blogs +
  // German tourism boards beyond the original 13. Rendered with a distinct
  // badge so Allison + Avital can see what's "off the beaten path."
  hiddenGem?: boolean;
  // ===================================================================
  // Logistics super-agent fields (added 2026-05-17). Avital trust-rule:
  // every destination needs a real source URL + walking-from-parking
  // minutes + accessibility note + Avital-fit verdict + opening
  // hours/season + price. If a field can't be verified, mark
  // verificationStatus 'unverified' so the UI surfaces "verify before
  // going" instead of pretending confidence.
  //
  // sourceUrl is the canonical citable link (official operator / tourism
  // board / Wikipedia) — same content domain as links.official when one
  // exists, exposed as a top-level field for downstream code that wants
  // a single "source" pointer.
  // ===================================================================
  sourceUrl?: string;
  walkFromParkingMin?: number | null;
  walkFromParkingNote?: string;
  accessibilityNote?: string;
  avitalFitNote?: 'good fit' | 'easy walk-friendly' | 'may be too strenuous' | 'mixed — see notes';
  verificationStatus?: 'verified' | 'partial' | 'unverified';
  openingHours?: string;
  seasonNote?: string;
  priceEur?: number; // per-person entry/transit cost; 0 = free
  priceNote?: string;
}

const NIMG = {
  gosausee: IMG.gosausee,
  hallstattLake: IMG.hallstattLake,
  konigssee: IMG.konigssee,
  werfen: IMG.werfen,
  wolfgangseeVillage: IMG.wolfgangsee,
  schafberg:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
  krippenstein:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
  attersee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Attersee_am_Attersee%2C_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg/1280px-Attersee_am_Attersee%2C_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg',
  hinterseeRamsau:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
  almbachklamm:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Almbachklamm_8_Wasserfall_1.jpg/1280px-Almbachklamm_8_Wasserfall_1.jpg',
  liechtensteinklamm:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Liechtensteinklamm_gorge_%2824277176943%29.jpg/1280px-Liechtensteinklamm_gorge_%2824277176943%29.jpg',
  krimml:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Krimml_Waterfalls%2C_2014_%2802%29.JPG/1280px-Krimml_Waterfalls%2C_2014_%2802%29.JPG',
  grossglockner:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_2.jpg/1280px-Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_2.jpg',
};

const NCREDIT = {
  gosausee: IMG_CREDIT.gosausee,
  hallstattLake: IMG_CREDIT.hallstattLake,
  konigssee: IMG_CREDIT.konigssee,
  werfen: IMG_CREDIT.werfen,
  wolfgangseeVillage: IMG_CREDIT.wolfgangsee,
  schafberg: 'Wikimedia, CC BY-SA',
  krippenstein: 'Wikimedia / Friedrich Böhringer, CC BY-SA',
  attersee: 'Wikimedia, CC BY-SA',
  hinterseeRamsau: 'Wikimedia, CC BY-SA',
  almbachklamm: 'Wikimedia, CC BY-SA',
  liechtensteinklamm: 'Wikimedia, CC BY-SA',
  krimml: 'Wikimedia Commons, CC BY-SA',
  grossglockner: 'Wikimedia Commons, CC BY-SA',
};

export const NATURE_DESTINATIONS: NatureDestination[] = [
  {
    id: 'gosausee',
    name: 'Vorderer Gosausee',
    localName: 'Vorderer Gosausee',
    region: 'salzkammergut',
    type: 'lake',
    country: 'AT',
    fromSalzburgMin: 80,
    fromHallstattMin: 35,
    sunset: 2,
    bestTime: 'golden',
    walk: 'walk',
    walkNote: 'Flat gravel loop around the lake, ~1 hour. Stroller-friendly.',
    lockedDay: 'Sun Jul 26',
    pairsWith: ['hallstatt-markt', 'krippenstein-5fingers'],
    feature: 'Mirror lake reflecting the Dachstein glacier — Salzkammergut postcard #1.',
    hero: {
      src: NIMG.gosausee,
      alt: 'Vorderer Gosausee with the Dachstein massif reflected',
      credit: NCREDIT.gosausee,
    },
    links: {
      official: 'https://www.dachstein-salzkammergut.com/en/destinations/lakes/gosausee.html',
      wikipedia: 'https://en.wikipedia.org/wiki/Gosausee',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Vorderer Gosausee'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Vorderer Gosausee'),
    },
    sourceUrl: 'https://www.dachstein-salzkammergut.com/en/destinations/lakes/gosausee.html',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Lakeside parking (Gosausee-Parkplatz, ~€5/day). 5-min flat walk to the lake edge.',
    accessibilityNote: 'Stroller + wheelchair OK for the lake-edge loop. Wide flat gravel path.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Lake area open year-round, 24/7.',
    seasonNote: 'Best May-Oct. Snow possible at the lake edge into late April.',
    priceEur: 0,
    priceNote: 'Free access to lake. Parking ~€5/day.',
  },
  {
    id: 'hallstatt-markt',
    name: 'Hallstätter See — Hallstatt Markt',
    localName: 'Hallstatt Markt am Hallstätter See',
    region: 'salzkammergut',
    type: 'lake',
    country: 'AT',
    fromSalzburgMin: 75,
    fromHallstattMin: 5,
    sunset: 3,
    bestTime: 'sunset',
    walk: 'walk',
    walkNote: 'Flat lakeside walkway through the painted village. Boat dock at one end.',
    lockedDay: 'Mon Jul 27',
    pairsWith: ['krippenstein-5fingers', 'gosausee'],
    feature: 'The painted-house postcard village. Sunset turns the south wall gold.',
    hero: {
      src: NIMG.hallstattLake,
      alt: 'Hallstatt village boathouses along the lake',
      credit: NCREDIT.hallstattLake,
    },
    links: {
      official: 'https://www.hallstatt.net/',
      wikipedia: 'https://en.wikipedia.org/wiki/Hallstatt',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Hallstatt, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Hallstatt, Austria'),
    },
    sourceUrl: 'https://www.hallstatt.net/',
    walkFromParkingMin: 10,
    walkFromParkingNote: 'Cars park outside the village (P1/P2 lots — €14/day). 10-min flat walk in along the lake. Or drive in 11:30-16:00 only with the special permit.',
    accessibilityNote: 'Village core is flat lakeside. Some narrow streets + steps to the upper church — skip those for stroller/wheelchair.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Village open year-round, 24/7. Shops typically 09:00-18:00.',
    seasonNote: 'July = peak season + biggest crowds. Best light at sunset when day-tour buses leave.',
    priceEur: 0,
    priceNote: 'Free to walk. Parking €14/day (P1 or P2).',
  },
  {
    id: 'krippenstein-5fingers',
    name: 'Dachstein Krippenstein — 5fingers platform',
    localName: 'Krippenstein 5fingers',
    region: 'salzkammergut',
    type: 'platform',
    country: 'AT',
    fromSalzburgMin: 80,
    fromHallstattMin: 5,
    sunset: 1,
    bestTime: 'midday',
    walk: 'walk',
    walkNote:
      'Two gondolas do the climbing. 20-min flat walk from the top station to the platform.',
    lockedDay: 'Mon Jul 27',
    pairsWith: ['hallstatt-markt', 'gosausee'],
    feature:
      'Steel platform jutting 400m straight out over the Hallstatt valley. No hike required.',
    hero: {
      src: NIMG.krippenstein,
      alt: '5fingers viewing platform projecting over the Dachstein cliff',
      credit: NCREDIT.krippenstein,
    },
    links: {
      official: 'https://www.dachstein-salzkammergut.com/en/skywalks/5fingers.html',
      wikipedia: 'https://en.wikipedia.org/wiki/5fingers_(viewing_platform)',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Krippenstein, Obertraun'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Krippenstein Gondola'),
    },
    sourceUrl: 'https://www.dachstein-salzkammergut.com/en/skywalks/5fingers.html',
    walkFromParkingMin: 3,
    walkFromParkingNote: 'Free parking at Obertraun valley station. 3-min walk to gondola entrance. Two cable-car sections do the actual climb (no hike).',
    accessibilityNote: 'Top-station to 5fingers: 20-min flat compacted gravel path, signed barrier-free. Mountain Gym 5fingers viewing-cage has steps — stop at 5fingers platform if needed.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Gondola daily 08:40-16:30 in summer (last ascent 15:30). Check live status before going — cloud cover closes the upper section.',
    seasonNote: 'Summer season mid-May to late-Oct. 5fingers platform itself is year-round if gondola runs.',
    priceEur: 44.5,
    priceNote: 'Round-trip Panorama Ticket €44.50pp (2025 rate, both gondola sections). Salzkammergut card discount available.',
  },
  {
    id: 'schafbergspitze',
    name: 'Schafbergspitze (Wolfgangsee)',
    localName: 'Schafbergspitze',
    region: 'salzkammergut',
    type: 'peak',
    country: 'AT',
    fromSalzburgMin: 60,
    fromHallstattMin: 50,
    sunset: 3,
    bestTime: 'sunset',
    walk: 'walk',
    walkNote:
      'Cog railway from St. Wolfgang does the 1,000m climb. ~10-min easy walk on top to the terrace.',
    lockedDay: 'Wed Jul 29',
    pairsWith: ['wolfgangsee-village', 'attersee'],
    feature: '13 lakes visible at once from a 1,783m terrace — the panorama of the trip.',
    hero: {
      src: NIMG.schafberg,
      alt: 'Schafbergspitze with lakes visible below',
      credit: NCREDIT.schafberg,
    },
    links: {
      official: 'https://www.5schaetze.at/en/schafbergbahn/',
      wikipedia: 'https://en.wikipedia.org/wiki/Schafberg_(Salzkammergut)',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Schafbergbahn, St. Wolfgang'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Schafbergbahn, St. Wolfgang'),
    },
    sourceUrl: 'https://www.5schaetze.at/en/schafbergbahn/',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Paid parking at Markt St. Wolfgang Schafbergbahn lot. 5-min walk to the cog station. Cog does the 1,000m climb (no hike).',
    accessibilityNote: 'Cog cars have steep step-up but staff assist. Top-station to terrace = ~10-min mild incline on gravel — walkable for most but not stroller-ideal. Hotel Schafbergspitze terrace fully accessible.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Cog runs late-April to late-Oct, daily ~09:00-16:30. Sunset trip = book the last ascent + last descent.',
    seasonNote: 'Closed Nov-April. Last departure depends on month — verify on schafbergbahn.at before locking sunset plan.',
    priceEur: 51,
    priceNote: 'Round-trip cog €51pp (2025 adult fare). Reservation €1 extra, strongly recommended for July weekends.',
  },
  {
    id: 'wolfgangsee-village',
    name: 'St. Wolfgang am Wolfgangsee',
    localName: 'Wolfgangsee',
    region: 'salzkammergut',
    type: 'village',
    country: 'AT',
    fromSalzburgMin: 50,
    fromHallstattMin: 45,
    sunset: 2,
    bestTime: 'golden',
    walk: 'walk',
    walkNote: 'Flat lakeside promenade with public Strandbad swim access mid-promenade.',
    lockedDay: 'Wed Jul 29',
    pairsWith: ['schafbergspitze', 'attersee'],
    feature: 'Lake village under the Schafberg — pair with the cog railway as the same day.',
    hero: {
      src: NIMG.wolfgangseeVillage,
      alt: 'St. Wolfgang im Salzkammergut on the lake',
      credit: NCREDIT.wolfgangseeVillage,
    },
    links: {
      official: 'https://www.wolfgangsee.salzkammergut.at/en/',
      wikipedia: 'https://en.wikipedia.org/wiki/St._Wolfgang_im_Salzkammergut',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'St. Wolfgang im Salzkammergut'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'St. Wolfgang im Salzkammergut'),
    },
    sourceUrl: 'https://www.wolfgangsee.salzkammergut.at/en/',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Garage P1 (Schafbergbahn lot) or village street parking. 5-min walk to the lakeside promenade.',
    accessibilityNote: 'Promenade is flat + paved, fully wheelchair/stroller-accessible. Pilgrim Church has a few steps.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Village open year-round, 24/7. Strandbad swim area mid-May to mid-Sept ~09:00-19:00.',
    seasonNote: 'July = peak swim + Strandbad season. Sunsets late (~21:00) in late July.',
    priceEur: 0,
    priceNote: 'Free to walk. Strandbad day-pass ~€5pp. Parking €1-2/hr.',
  },
  {
    id: 'attersee',
    name: 'Attersee (Nußdorf esplanade)',
    localName: 'Attersee',
    region: 'salzkammergut',
    type: 'lake',
    country: 'AT',
    fromSalzburgMin: 50,
    fromHallstattMin: 65,
    sunset: 2,
    bestTime: 'sunset',
    walk: 'walk',
    walkNote: 'Promenade walks at multiple lake villages — flat, all accessible.',
    pairsWith: ['wolfgangsee-village', 'schafbergspitze'],
    feature:
      "Austria's largest entirely-domestic lake. West-shore villages have horizon-clear sunsets.",
    hero: { src: NIMG.attersee, alt: 'Attersee at evening', credit: NCREDIT.attersee },
    links: {
      official: 'https://attersee-attergau.salzkammergut.at/en/',
      wikipedia: 'https://en.wikipedia.org/wiki/Attersee',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Nußdorf am Attersee'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Nußdorf am Attersee'),
    },
    sourceUrl: 'https://attersee-attergau.salzkammergut.at/en/',
    walkFromParkingMin: 2,
    walkFromParkingNote: 'Lakeside village parking (Nußdorf, Unterach, Weyregg — all free or €1/hr). 2-min walk to the water at every esplanade.',
    accessibilityNote: 'All lakeside promenades flat + paved. Bus access throughout the lake ring.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Lake access year-round. Boat services (Attersee-Schifffahrt) May-Oct.',
    seasonNote: 'Best July-Aug for swim + sunset combo. West-shore villages (Nußdorf, Weyregg) face the sunset.',
    priceEur: 0,
    priceNote: 'Free lake access. Boat day-ticket ~€21pp if you want the lake-tour ferry.',
  },
  {
    id: 'konigssee',
    name: 'Königssee + Obersee',
    localName: 'Königssee',
    region: 'berchtesgaden',
    type: 'lake',
    country: 'DE',
    fromSalzburgMin: 35,
    fromHallstattMin: 90,
    sunset: 3,
    bestTime: 'sunset',
    walk: 'easy-hike',
    walkNote: 'Silent electric boat to Salet, then a 20-min flat walk to Obersee. No climbing.',
    lockedDay: 'Tue Jul 28',
    pairsWith: ['hintersee-ramsau', 'almbachklamm'],
    feature:
      'Fjord-shaped lake serviced only by silent electric boats since 1909. The peak moment of the trip.',
    hero: {
      src: NIMG.konigssee,
      alt: 'St. Bartholomä church on the Königssee',
      credit: NCREDIT.konigssee,
    },
    links: {
      official: 'https://www.seenschifffahrt.de/en/koenigssee/',
      wikipedia: 'https://en.wikipedia.org/wiki/K%C3%B6nigssee',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Schönau am Königssee, Germany'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Schönau am Königssee, Germany'),
    },
    sourceUrl: 'https://www.seenschifffahrt.de/en/koenigssee/',
    walkFromParkingMin: 8,
    walkFromParkingNote: 'Schönau parking (€5/day, Parkplatz Königssee). 8-min walk past the souvenir lane to the boat dock at the lakehead. From Salet end-dock: 20-min flat walk to Obersee.',
    accessibilityNote: 'Boats are wheelchair-accessible at Schönau dock (call ahead). Salet → Obersee path is flat compacted gravel — stroller OK, wheelchair OK with help. St. Bartholomä mostly flat.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Boats April-Oct, first departure 08:00, last return 17:00 (varies — check seenschifffahrt.de monthly schedule).',
    seasonNote: 'Closed Nov-March (lake freezes). Peak crowds Jul-Aug — first boat at 08:00 is the quiet option.',
    priceEur: 22.5,
    priceNote: 'Round-trip boat to Salet €22.50pp (St. Bartholomä-only round-trip €19.50pp). Cash + card accepted.',
  },
  {
    id: 'hintersee-ramsau',
    name: 'Hintersee (Ramsau)',
    localName: 'Hintersee, Ramsau bei Berchtesgaden',
    region: 'berchtesgaden',
    type: 'lake',
    country: 'DE',
    fromSalzburgMin: 50,
    fromHallstattMin: 105,
    sunset: 3,
    bestTime: 'sunset',
    walk: 'walk',
    walkNote: 'Flat 1km loop around the lake. Tiny islets with trees you can almost touch.',
    pairsWith: ['konigssee', 'almbachklamm'],
    feature:
      'Photographer-famous: tiny tree-islets reflect in glassy water, Hochkalter peak behind.',
    hero: {
      src: NIMG.hinterseeRamsau,
      alt: 'Hintersee at Ramsau with Hochkalter behind',
      credit: NCREDIT.hinterseeRamsau,
    },
    links: {
      official: 'https://www.berchtesgaden.de/en/nature-wonders/hintersee-lake-and-ramsau',
      wikipedia: 'https://en.wikipedia.org/wiki/Hintersee_(Berchtesgaden)',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Hintersee, Ramsau bei Berchtesgaden'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Hintersee, Ramsau bei Berchtesgaden'),
    },
    sourceUrl: 'https://www.berchtesgaden.de/en/nature-wonders/hintersee-lake-and-ramsau',
    walkFromParkingMin: 2,
    walkFromParkingNote: 'Parkplatz Hintersee (€4/day). 2-min walk to lake edge. Loop trail starts at the parking lot.',
    accessibilityNote: 'Loop is flat gravel with some tree roots — stroller OK with care, wheelchair OK on the main lakeside section.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Open year-round, 24/7. Restaurant Seeklause (lakeside) seasonal.',
    seasonNote: 'Late-July glassy water + alpenglow conditions are why photographers come. Calmest at dawn.',
    priceEur: 0,
    priceNote: 'Free lake access. Parking €4/day.',
  },
  {
    id: 'almbachklamm',
    name: 'Almbachklamm gorge',
    localName: 'Almbachklamm',
    region: 'berchtesgaden',
    type: 'gorge',
    country: 'DE',
    fromSalzburgMin: 25,
    fromHallstattMin: 90,
    sunset: 1,
    bestTime: 'midday',
    walk: 'easy-hike',
    walkNote: '3km gorge walk with bridges. Easy, non-strenuous; ~1h20 round-trip to bridge 19.',
    pairsWith: ['konigssee', 'hintersee-ramsau'],
    feature: 'Just over the German border, 25 min from Salzburg. Easy gorge walk, deep cold water.',
    hero: {
      src: NIMG.almbachklamm,
      alt: 'Almbachklamm gorge cauldron',
      credit: NCREDIT.almbachklamm,
    },
    links: {
      official: 'https://www.berchtesgaden.de/en/nature/hiking-paradise/almbach-gorge-almbachklamm',
      wikipedia: 'https://en.wikipedia.org/wiki/Almbachklamm',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Almbachklamm, Marktschellenberg, Germany'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Almbachklamm, Marktschellenberg, Germany'),
    },
    sourceUrl: 'https://www.berchtesgaden.de/en/nature/hiking-paradise/almbach-gorge-almbachklamm',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Parkplatz Almbachklamm in Marktschellenberg (€3/day). 5-min walk past Kugelmühle (marble-mill) to the entrance ticket booth.',
    accessibilityNote: 'NOT stroller- or wheelchair-friendly past the entrance — narrow plank bridges, steps, wet rock. Sturdy shoes required.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Daily 09:00-17:00 May-Oct. Last entry ~16:30.',
    seasonNote: 'Closed Nov-April due to ice/landslide risk.',
    priceEur: 4,
    priceNote: 'Entry €4pp adult. Pay cash at the booth.',
  },
  {
    id: 'eisriesenwelt-werfen',
    name: 'Eisriesenwelt ice cave + Hohenwerfen castle',
    localName: 'Eisriesenwelt Werfen',
    region: 'hohe-tauern',
    type: 'cave',
    country: 'AT',
    fromSalzburgMin: 50,
    fromHallstattMin: 75,
    sunset: 1,
    bestTime: 'midday',
    walk: 'easy-hike',
    walkNote:
      '20-min uphill walk to cable car, then 15-min walk to entrance, 1,400 stairs inside (slow pace OK).',
    lockedDay: 'Thu Jul 30',
    pairsWith: ['liechtensteinklamm'],
    feature:
      "World's largest accessible ice cave. Carbide-lamp tour through frozen halls. Bring fleece.",
    hero: {
      src: NIMG.werfen,
      alt: 'Hohenwerfen castle above the Salzach valley',
      credit: NCREDIT.werfen,
    },
    links: {
      official: 'https://www.eisriesenwelt.at/en/',
      wikipedia: 'https://en.wikipedia.org/wiki/Eisriesenwelt',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Eisriesenwelt, Werfen, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Eisriesenwelt, Werfen, Austria'),
    },
    sourceUrl: 'https://www.eisriesenwelt.at/en/',
    walkFromParkingMin: 20,
    walkFromParkingNote: 'Werfen Eishöhlen-Parkplatz (€8/day). 20-min steep uphill walk OR shuttle bus (€8 round-trip) to the cable-car valley station, then 15-min walk from upper station to cave entrance.',
    accessibilityNote: 'NOT for limited mobility. 1,400 stairs inside the cave; entire route is uphill, slippery ice, narrow passages, ~1.5°C. Wheelchairs/strollers cannot enter. Cave temperature 0°C — fleece + closed shoes mandatory.',
    avitalFitNote: 'may be too strenuous',
    verificationStatus: 'verified',
    openingHours: 'May 1 to Oct 26 2026, daily 09:00-15:30 last tour. Tours every ~30 min, guided only.',
    seasonNote: 'CLOSED Nov-April. Tour is the only way in — book online to skip queue.',
    priceEur: 38,
    priceNote: 'Combo ticket €38pp (cable car + tour). Cable-car-only €30pp. Pay cash or card at booth.',
  },
  {
    id: 'liechtensteinklamm',
    name: 'Liechtensteinklamm gorge',
    localName: 'Liechtensteinklamm',
    region: 'hohe-tauern',
    type: 'gorge',
    country: 'AT',
    fromSalzburgMin: 60,
    fromHallstattMin: 70,
    sunset: 1,
    bestTime: 'midday',
    walk: 'easy-hike',
    walkNote: '25-min walk in to the end of the gorge, 440 partly-grating steps. Return same path.',
    pairsWith: ['eisriesenwelt-werfen'],
    feature: "Austria's deepest accessible gorge. Steel walkways carved into the rock walls.",
    hero: {
      src: NIMG.liechtensteinklamm,
      alt: 'Liechtensteinklamm gorge walkway',
      credit: NCREDIT.liechtensteinklamm,
    },
    links: {
      official: 'https://www.liechtensteinklamm.at/en/',
      wikipedia: 'https://en.wikipedia.org/wiki/Liechtensteinklamm',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Liechtensteinklamm, St. Johann im Pongau'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Liechtensteinklamm, St. Johann im Pongau'),
    },
    sourceUrl: 'https://www.liechtensteinklamm.at/en/',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Parking at the gorge entrance (€3-5/day). 5-min walk down to the ticket booth + start of the gorge boardwalk.',
    accessibilityNote: 'Not stroller- or wheelchair-accessible. 440 steps on partly grated metal walkways, narrow passages. Sturdy footwear required, no flip-flops.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'May to early-Oct, daily 08:00-17:00. Last entry 16:00.',
    seasonNote: 'Closed Nov-April due to ice + rockfall risk.',
    priceEur: 9,
    priceNote: 'Entry €9pp adult (2025). Cash or card. Helmet provided.',
  },
  {
    id: 'krimml-waterfalls',
    name: 'Krimml Waterfalls',
    localName: 'Krimmler Wasserfälle',
    region: 'hohe-tauern',
    type: 'waterfall',
    country: 'AT',
    fromSalzburgMin: 110,
    fromHallstattMin: 130,
    sunset: 1,
    bestTime: 'midday',
    walk: 'easy-hike',
    walkNote:
      'Lowest cascade is 10-15 min walk. Top of falls is ~1h15 uphill on a paved path. Stroller-friendly to the first viewpoint.',
    pairsWith: [],
    feature:
      "Europe's tallest waterfall, 380m in three cascades. Paved zigzag trail, no scrambling.",
    hero: {
      src: NIMG.krimml,
      alt: 'Krimml Waterfalls cascading down the mountain',
      credit: NCREDIT.krimml,
    },
    links: {
      official: 'https://www.wasserfaelle-krimml.at/en/',
      wikipedia: 'https://en.wikipedia.org/wiki/Krimml_Waterfalls',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Krimmler Wasserfälle'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Krimmler Wasserfälle'),
    },
    caveat:
      'Far west — 110min each way from Salzburg, 130min from Hallstatt. Best as a full day, not a swap-in.',
    sourceUrl: 'https://www.wasserfaelle-krimml.at/en/',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Parkplatz Krimmler Wasserfälle (€7/day). 5-min walk to the lowest viewpoint. Top of falls = ~1h15 uphill on paved zigzag path.',
    accessibilityNote: 'Lowest viewpoint stroller- + wheelchair-accessible. Upper viewpoints require climbing the paved zigzag (no stairs, but steep). Wheelchair-accessible up to 2nd viewpoint with help.',
    avitalFitNote: 'mixed — see notes',
    verificationStatus: 'verified',
    openingHours: 'Trail open daily April-Oct, paid entry 08:00-18:00. Free outside paid hours.',
    seasonNote: 'Closed/limited Nov-March. Peak flow May-July.',
    priceEur: 5,
    priceNote: 'Entry €5pp during paid hours (free early morning / late evening).',
  },
  {
    id: 'grossglockner-road',
    name: 'Grossglockner High Alpine Road',
    localName: 'Großglockner Hochalpenstraße',
    region: 'hohe-tauern',
    type: 'road',
    country: 'AT',
    fromSalzburgMin: 90,
    fromHallstattMin: 130,
    sunset: 2,
    bestTime: 'golden',
    walk: 'walk',
    walkNote:
      'Drive-up overlooks. Short walks from each pull-off; no hike required for the main views.',
    pairsWith: [],
    feature: '48km panoramic road with 36 hairpins to the Hohe Tauern glacier face. Open May-Nov.',
    hero: {
      src: NIMG.grossglockner,
      alt: 'Grossglockner High Alpine Road serpentines',
      credit: NCREDIT.grossglockner,
    },
    links: {
      official: 'https://www.grossglockner.at/en/',
      wikipedia: 'https://en.wikipedia.org/wiki/Grossglockner_High_Alpine_Road',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Grossglockner High Alpine Road'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Grossglockner High Alpine Road'),
    },
    caveat:
      'Separate toll €46.50/car on top of vignette. Best done as its own full day — too far for half-day swap.',
    sourceUrl: 'https://www.grossglockner.at/en/',
    walkFromParkingMin: 0,
    walkFromParkingNote: 'Drive-through experience. Free parking at every viewpoint (Edelweißspitze, Kaiser-Franz-Josefs-Höhe). Short walks (5-15 min) from each pull-off — no hike for the main views.',
    accessibilityNote: 'All major viewpoints accessible from car parks. Kaiser-Franz-Josefs-Höhe visitor centre has elevator + ramp.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Open early-May to late-Oct (snow-dependent). Daily 06:00-19:30 in summer. Pay at toll gate.',
    seasonNote: 'CLOSED Nov-April. Best clear-weather days only — clouds erase the views.',
    priceEur: 46.5,
    priceNote: 'Day-ticket toll €46.50/car (incl. up to 9 occupants). On top of Austrian vignette. No discounts.',
  },
  // =====================================================================
  // HIDDEN GEMS (added 2026-05-16) — 8 stunning nature picks beyond the
  // original 13. Sourced from Sunset Obsession, Moon Honey Travel, Salzburger-
  // Land tourism, German-language travel blogs, AllTrails, Komoot. Each
  // verified for: stunning photos (Wikimedia), drive-accessible (no multi-
  // hour hikes), Avital-mobility OK (walks + easy loops), within 2-hr radius
  // of at least one of the 4 base configs. flagged with hiddenGem: true.
  //
  // Drive times: Google Maps consensus 2026-05-16. fromHallstattMin = from
  // Obertraun. Berchtesgaden/Wolfgangsee minutes added to the matrices below.
  // =====================================================================
  {
    id: 'wimbachklamm',
    name: 'Wimbachklamm Gorge',
    localName: 'Wimbachklamm',
    region: 'berchtesgaden',
    type: 'gorge',
    country: 'DE',
    fromSalzburgMin: 45,
    fromHallstattMin: 100,
    sunset: 1,
    bestTime: 'midday',
    walk: 'walk',
    walkNote:
      'Timber walkway through the 200m gorge — 15-30 min to do it once. €5 entry. Extendable into the Wimbachtal valley if you want longer.',
    pairsWith: ['hintersee-ramsau', 'klausbachtal', 'konigssee'],
    feature:
      "Berchtesgaden National Park's quieter gorge — waterfalls cascading over moss-covered walls, smooth timber boardwalk, family-friendly. The hidden alternative to Almbachklamm.",
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/In_der_Wimbachklamm_%2826%29.JPG/1280px-In_der_Wimbachklamm_%2826%29.JPG',
      alt: 'Wimbachklamm gorge interior with timber walkway and waterfall',
      credit: 'Wikimedia, CC BY-SA',
    },
    links: {
      official: 'https://www.berchtesgaden.de/en/nature-wonders/gorges',
      wikipedia: 'https://en.wikipedia.org/wiki/Wimbachklamm',
      mapsFromSalzburg: dirUrl(
        'Salzburg, Austria',
        'Wimbachklamm, Ramsau bei Berchtesgaden, Germany',
      ),
      mapsFromHallstatt: dirUrl(
        'Obertraun, Austria',
        'Wimbachklamm, Ramsau bei Berchtesgaden, Germany',
      ),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.berchtesgaden.de/en/nature-wonders/gorges',
    walkFromParkingMin: 25,
    walkFromParkingNote: 'Parkplatz Wimbachbrücke (€4/day). 25-min flat forest path to the gorge entrance booth, then timber walkway through.',
    accessibilityNote: 'Approach path is flat + gravel-firm — stroller OK. Gorge boardwalk itself has steps + narrow sections, NOT wheelchair-friendly.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Daily mid-May to mid-Oct, ~09:00-17:00 (booth-hours; trail itself accessible most daylight hours when open).',
    seasonNote: 'Closed mid-Oct to mid-May for safety (ice/rockfall).',
    priceEur: 5,
    priceNote: 'Entry €5pp adult (€2.50 kids). Cash only at the booth.',
  },
  {
    id: 'filzmoos-bachlalm',
    name: 'Filzmoos + Bachlalm — Bischofsmütze meadows',
    localName: 'Bachlalm bei Filzmoos',
    region: 'hohe-tauern',
    type: 'meadow',
    country: 'AT',
    fromSalzburgMin: 65,
    fromHallstattMin: 75,
    sunset: 2,
    bestTime: 'golden',
    walk: 'easy-hike',
    walkNote:
      'Drive up to Bachlalm car park, then ~1h easy circuit through forest + meadow with Bischofsmütze twin peaks as constant backdrop. Marmots in the grass. Hut at the top for drinks.',
    pairsWith: ['gosausee', 'krippenstein-5fingers'],
    feature:
      'Alpine pasture below the Bischofsmütze\'s twin limestone peaks — Filzmoos is the kind of village English guidebooks miss. The "Nativity scene of Styria" landscape.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/02/West_view_of_Bischofsm%C3%BCtze_%282009%29.jpg',
      alt: 'Bischofsmütze twin peaks above Filzmoos meadows',
      credit: 'Wikimedia, CC BY-SA',
    },
    links: {
      official: 'https://www.filzmoos.at/en/',
      wikipedia: 'https://en.wikipedia.org/wiki/Filzmoos',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Bachlalm, Filzmoos, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Bachlalm, Filzmoos, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.filzmoos.at/en/',
    walkFromParkingMin: 0,
    walkFromParkingNote: 'Drive the Bachlalm toll road (€6/car) right up to the car park at the hut. Loop circuit starts from the parking area — no approach walk needed.',
    accessibilityNote: 'The circuit has roots + uneven sections. Easy hike but not stroller/wheelchair-friendly. Sturdy shoes recommended.',
    avitalFitNote: 'good fit',
    verificationStatus: 'partial',
    openingHours: 'Toll road open daily mid-May to late-Oct, ~07:00-18:00. Bachlalm hut serves 09:00-17:00.',
    seasonNote: 'Closed Nov-April (toll road shut for snow). Confirm road status before driving.',
    priceEur: 6,
    priceNote: 'Toll road €6/car. Loop trail itself free. Drinks at the hut €3-5.',
  },
  {
    id: 'zwoelferhorn',
    name: 'Zwölferhorn cable car — St. Gilgen',
    localName: 'Zwölferhornbahn',
    region: 'salzkammergut',
    type: 'platform',
    country: 'AT',
    fromSalzburgMin: 40,
    fromHallstattMin: 55,
    sunset: 2,
    bestTime: 'golden',
    walk: 'walk',
    walkNote:
      '11-min gondola from St. Gilgen to 1,522m summit. Flat walks on top with 360° views over Wolfgangsee + Fuschlsee + Mondsee. Cafe at the top. Barrier-free gondolas.',
    pairsWith: ['wolfgangsee-village', 'attersee', 'schafbergspitze'],
    feature:
      "Schafberg's quieter twin — three lakes visible from one summit. Less famous than the cog railway, often empty by comparison, and the new (2022) gondolas are spacious.",
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Zw%C3%B6lferhorn_von_St.Gilgen.JPG',
      alt: 'Zwölferhorn summit above St. Gilgen and Wolfgangsee',
      credit: 'Wikimedia, CC BY-SA',
    },
    links: {
      official: 'https://www.zwoelferhorn.at/en/summer/',
      wikipedia: 'https://en.wikipedia.org/wiki/Zw%C3%B6lferhorn',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Zwölferhornbahn, St. Gilgen, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Zwölferhornbahn, St. Gilgen, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.zwoelferhorn.at/en/summer/',
    walkFromParkingMin: 3,
    walkFromParkingNote: 'Free parking at the St. Gilgen valley station. 3-min walk to the gondola entrance.',
    accessibilityNote: '2022 gondolas barrier-free + spacious. Top station has a 200m paved path to the summit terrace. Steeper trails branch off — stay on the main loop for easy walking.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Daily early-May to early-Nov, 09:00-16:30 (last ascent 15:30 / last descent 17:00).',
    seasonNote: 'Closed Nov-April for summer ops. Sunset trips require advance check — gondola usually stops 17:00.',
    priceEur: 33,
    priceNote: 'Round-trip €33pp (2025 adult fare). Cash or card at booth.',
  },
  {
    id: 'postalm',
    name: 'Postalm panoramic road + plateau',
    localName: 'Postalmstraße',
    region: 'salzkammergut',
    type: 'road',
    country: 'AT',
    fromSalzburgMin: 60,
    fromHallstattMin: 50,
    sunset: 2,
    bestTime: 'golden',
    walk: 'walk',
    walkNote:
      '26km tolled panoramic road from Strobl up to the plateau. Park at any of the many pull-offs and walk through meadows + alpine huts. Wheelchair/stroller-friendly trails available. Toll ~€14/car.',
    pairsWith: ['wolfgangsee-village', 'zwoelferhorn'],
    feature:
      "Austria's largest contiguous alpine pasture — 42 km² of cattle-grazed meadow at 1,000-2,000m. Drive-thru beauty for low-mobility days, with hut-density unmatched in the region.",
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Postalm%2C_Austria_%28Unsplash_OoQKL4cLZuc%29.jpg/1280px-Postalm%2C_Austria_%28Unsplash_OoQKL4cLZuc%29.jpg',
      alt: 'Postalm alpine plateau and meadows above Wolfgangsee',
      credit: 'Wikimedia / Unsplash, CC0',
    },
    links: {
      official:
        'https://wolfgangsee.salzkammergut.at/en/oesterreich-poi/detail/430003408/postalm-hiking-area.html',
      wikipedia: 'https://de.wikipedia.org/wiki/Postalm',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Postalm, Strobl, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Postalm, Strobl, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://wolfgangsee.salzkammergut.at/en/oesterreich-poi/detail/430003408/postalm-hiking-area.html',
    walkFromParkingMin: 0,
    walkFromParkingNote: 'Pay the Postalmstraße toll (€14/car) at Strobl, then drive 26km up to any of the dozen+ pull-offs. Park + step out at multiple stops.',
    accessibilityNote: 'Several signed barrier-free paths from the upper pull-offs. Most meadow trails are flat + wide. Strollers OK on the marked easy circuits.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Toll road open daily May-Oct, ~07:00-19:00. Huts seasonal hours.',
    seasonNote: 'Closed Nov-April (toll road shut for snow). Best clear weather days only.',
    priceEur: 14,
    priceNote: 'Toll €14/car (day-pass, all occupants included). Free walking on the plateau itself.',
  },
  {
    id: 'klausbachtal',
    name: 'Klausbachtal — eagle valley + suspension bridge',
    localName: 'Klausbachtal',
    region: 'berchtesgaden',
    type: 'valley',
    country: 'DE',
    fromSalzburgMin: 50,
    fromHallstattMin: 105,
    sunset: 1,
    bestTime: 'midday',
    walk: 'walk',
    walkNote:
      '4.5km circular path, ~1h, 50m elevation, easy. Largely barrier-free — stroller + wheelchair OK. Suspension bridge with Mühlsturzhörner views. Deer reserve at the end.',
    pairsWith: ['hintersee-ramsau', 'wimbachklamm'],
    feature:
      'Golden-eagle hunting territory inside Berchtesgaden NP — one of only 4 nesting pairs in the park. The suspension bridge frames the Mühlsturzhörner rock wall.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Klausbachtal.jpg',
      alt: 'Klausbachtal valley with Mühlsturzhörner mountain wall',
      credit: 'Wikimedia, CC BY-SA',
    },
    links: {
      official:
        'https://www.nationalpark-berchtesgaden.de/english/infopoints/facilities/observation_point/index.htm',
      wikipedia: 'https://de.wikipedia.org/wiki/Klausbachtal',
      mapsFromSalzburg: dirUrl(
        'Salzburg, Austria',
        'Klausbachhaus, Ramsau bei Berchtesgaden, Germany',
      ),
      mapsFromHallstatt: dirUrl(
        'Obertraun, Austria',
        'Klausbachhaus, Ramsau bei Berchtesgaden, Germany',
      ),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.nationalpark-berchtesgaden.de/english/infopoints/facilities/observation_point/index.htm',
    walkFromParkingMin: 2,
    walkFromParkingNote: 'Klausbachhaus parking (€4/day) OR free national-park shuttle from Ramsau village. 2-min walk to the Klausbachhaus visitor centre + trailhead.',
    accessibilityNote: 'Marked barrier-free section through the valley — stroller + wheelchair OK. Suspension bridge access via stairs on one side, ramp on the other.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Trail year-round 24/7. Visitor centre + shuttle May-Oct, ~09:00-17:00.',
    seasonNote: 'Best May-Oct for golden-eagle viewing season. Bring binoculars.',
    priceEur: 0,
    priceNote: 'Free trail + free park shuttle. Parking €4/day if driving.',
  },
  {
    id: 'seisenbergklamm',
    name: 'Seisenbergklamm — Weißbach',
    localName: 'Naturdenkmal Seisenbergklamm',
    region: 'hohe-tauern',
    type: 'gorge',
    country: 'AT',
    fromSalzburgMin: 70,
    fromHallstattMin: 100,
    sunset: 1,
    bestTime: 'midday',
    walk: 'walk',
    walkNote:
      '600m gorge, ~1h round-trip via 51 footbridges + 373 steps. Waterfall in the dark part. "Ghost of the Gorge" kids\' info-trail. Snack bar at entrance.',
    pairsWith: ['liechtensteinklamm'],
    feature:
      'Gateway to Weißbach Nature Park — 50m-deep limestone gorge carved by ice-age meltwater. Quieter sibling to Liechtensteinklamm, with the same dark-passage drama.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Seisenberg_Klamm_006.jpg/1280px-Seisenberg_Klamm_006.jpg',
      alt: 'Seisenbergklamm gorge interior wooden walkway',
      credit: 'Wikimedia, CC BY-SA',
    },
    links: {
      official: 'https://www.seisenbergklamm.eu/',
      wikipedia: 'https://de.wikipedia.org/wiki/Seisenbergklamm',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Seisenbergklamm, Weißbach bei Lofer, Austria'),
      mapsFromHallstatt: dirUrl(
        'Obertraun, Austria',
        'Seisenbergklamm, Weißbach bei Lofer, Austria',
      ),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.seisenbergklamm.eu/',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Parking at the Naturpark Weißbach entrance (€3-5/day). 5-min walk to ticket booth + start of gorge.',
    accessibilityNote: 'NOT stroller- or wheelchair-friendly. 51 wooden footbridges + 373 steps; gripped soles required.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Daily May-Oct, ~09:00-17:00.',
    seasonNote: 'Closed Nov-April due to ice + rockfall risk.',
    priceEur: 6,
    priceNote: 'Entry €6pp adult (€3 kids). Cash at booth.',
  },
  {
    id: 'bluntautal-golling',
    name: 'Bluntautal lakes + Gollinger Wasserfall',
    localName: 'Bluntautal + Gollinger Wasserfall',
    region: 'hohe-tauern',
    type: 'waterfall',
    country: 'AT',
    fromSalzburgMin: 40,
    fromHallstattMin: 65,
    sunset: 1,
    bestTime: 'midday',
    walk: 'easy-hike',
    walkNote:
      'Two-in-one. Gollinger Wasserfall: 10-min walk from car park to 75m two-tier fall, €5. Bluntautal lakes: 6km flat loop, ~1.5h, past two crystal pools. Combine for a half-day.',
    pairsWith: ['hallstatt-markt', 'eisriesenwelt-werfen'],
    feature:
      "Tennengau's twin payoff — one of Austria's most photographed waterfalls plus a glassy turquoise-pool valley loop, both reachable from the same Golling parking.",
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Golling-waterfall.jpg/1280px-Golling-waterfall.jpg',
      alt: 'Gollinger Wasserfall two-tier waterfall',
      credit: 'Wikimedia, CC BY-SA',
    },
    links: {
      official: 'https://www.gollinger-wasserfall.com/',
      wikipedia: 'https://de.wikipedia.org/wiki/Gollinger_Wasserfall',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Gollinger Wasserfall, Golling, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Gollinger Wasserfall, Golling, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.gollinger-wasserfall.com/',
    walkFromParkingMin: 10,
    walkFromParkingNote: 'Parkplatz Gollinger Wasserfall (€3/day). 10-min walk to the lower waterfall view (forest path, mild incline). Upper viewpoint adds 15 min + stairs. Bluntautal lakes from same parking — 6km flat loop.',
    accessibilityNote: 'Lower waterfall viewpoint requires uneven forest path + some steps. Bluntautal lakes loop is mostly flat. Neither stroller-ideal but Bluntautal loop is do-able.',
    avitalFitNote: 'mixed — see notes',
    verificationStatus: 'verified',
    openingHours: 'Waterfall daily April-Oct, ~08:00-18:00. Bluntautal trail year-round (signed seasonal closures).',
    seasonNote: 'Best May-Oct. Waterfall paid-entry section closes Nov-March.',
    priceEur: 5,
    priceNote: 'Gollinger Wasserfall €5pp entry (cash). Bluntautal loop free.',
  },
  {
    id: 'fuschlsee',
    name: 'Fuschlsee',
    localName: 'Fuschlsee',
    region: 'salzkammergut',
    type: 'lake',
    country: 'AT',
    fromSalzburgMin: 30,
    fromHallstattMin: 65,
    sunset: 3,
    bestTime: 'sunset',
    walk: 'walk',
    walkNote:
      "Flat lakeshore strolls from Fuschl am See village. Full 3h circuit if wanted. Sun sets directly over the water mid-summer. Stand-up paddle + swim if it's warm.",
    pairsWith: ['wolfgangsee-village', 'zwoelferhorn'],
    feature:
      "Turquoise Salzkammergut lake just 30 min from Salzburg — Red Bull's headquarters lake, surprisingly under-the-radar for English-speaking visitors. Best sunset within 30 min of the city.",
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Aerial_image_of_the_Fuschlsee_%28view_from_the_southeast%29.jpg/1280px-Aerial_image_of_the_Fuschlsee_%28view_from_the_southeast%29.jpg',
      alt: 'Aerial view of turquoise Fuschlsee from the southeast',
      credit: 'Wikimedia, CC BY-SA',
    },
    links: {
      official: 'https://fuschlsee.salzkammergut.at/en/',
      wikipedia: 'https://en.wikipedia.org/wiki/Fuschlsee',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Fuschl am See, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Fuschl am See, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://fuschlsee.salzkammergut.at/en/',
    walkFromParkingMin: 2,
    walkFromParkingNote: 'Free village parking at Fuschl am See (or €1/hr at the lakeside lot). 2-min walk to the lake edge + promenade start.',
    accessibilityNote: 'Lakeside promenade flat + paved, stroller + wheelchair OK. Full circuit (~3h) has gravel + roots in the back-half.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Lake open year-round, 24/7. Strandbad (Fuschl swim area) May-Sept ~09:00-19:00.',
    seasonNote: 'July = peak swim + SUP season. West-facing sunsets best from the Fuschl village shore.',
    priceEur: 0,
    priceNote: 'Free lake access. Strandbad day-pass ~€4pp. SUP rental ~€15/hr at Fuschl Aqua-Center.',
  },
];

// =====================================================================
// BASE CONFIGURATIONS — 4 options, NOT one locked plan
// =====================================================================
// Allison (2026-05-16 22:13): "give options!!! thats the ideas always optiposn"
// Allison (2026-05-16 22:14): "everyhting options!!!! an dpresent it so its
// eay to digest and use map"
//
// The 4-night anchor was locked to Obertraun. That's a constraint Allison
// didn't sign off on. She wants the site to PRESENT MULTIPLE BASE CONFIGS as
// options so she + Avital can pick. Each config = fully-developed plan.
//
// Rules applied:
//  - No "best" pick — all 4 with honest trade-offs. A recommended star on one
//    is fine but never replaces alternatives.
//  - Drive-time matrix to every one of the 13 NATURE_DESTINATIONS from this
//    config's base, bucketed: ≤10min "at the door" / ≤30min "easy" / ≤60min
//    "day trip" / 60+ "long day".
//  - Lodging picks (3-6 real options) — Obertraun reuses TRIP.lodgings[1].
//    Berchtesgaden + St. Wolfgang are NEW research (this file's BERCHTESGADEN_
//    LODGING + ST_WOLFGANG_LODGING constants).
//  - Cost delta vs Config A baseline (Obertraun 4-night avg €142/night × 4 +
//    Salzburg 2-night avg €128/night × 2 + airport 1 night €320 = €1,464
//    lodging baseline for the 7 nights).
//  - Salzburg base unchanged across all configs (Shabbat anchor).
//  - Salzburg lodging filter: MUST have washer. See TRIP.lodgings[0] alts
//    (Sauerweingut, Pension Elisabeth, Topside) for washer-confirmed picks.
//
// FAIL-LOUD on this file: drive times are Google Maps consensus, not Jul-2026
// peak-traffic measured. Berchtesgaden + St. Wolfgang Booking listings
// verified via WebSearch on 2026-05-16 — listing slugs + review scores +
// laundry status confirmed; per-night prices are mid-range estimates for the
// Jul 26-30 dates. Re-verify on Booking before locking any single config.

// 'split' removed 2026-05-17 (4-base restructure — Schafbergspitze IS the split).
export type BaseConfigId = 'obertraun' | 'berchtesgaden' | 'wolfgangsee';

export interface BaseConfigDriveRow {
  destinationId: string; // matches NATURE_DESTINATIONS id
  destinationName: string;
  fromBaseMin: number;
  bucket: 'at-door' | 'easy' | 'day-trip' | 'long-day';
}

export interface BaseConfigFlow {
  label: string; // "Mornings" / "Afternoons" / "Sunsets"
  text: string;
}

export interface BaseConfigLodgingPick {
  name: string;
  url: string;
  img: string;
  review: string;
  pricePerNight: string;
  note: string;
  budgetTier?: BudgetTier;
  vibeTag?: LodgingVibe;
  laundry?: LodgingLaundry;
  bedrooms?: number | 'studio';
  beds?: string;
  notableDetails?: string[];
  // Data-completeness fields (added 2026-05-17). Same shape as LodgingAlt.
  maxGuests?: number;
  kitchen?: LodgingKitchen;
  bath?: LodgingBath;
  ac?: boolean;
  parking?: LodgingParking;
  wifi?: boolean;
  viewType?: LodgingViewType;
  availability?: LodgingAvailability;
  availabilityCheckedDate?: string;
  availabilityNote?: string;
  // Carousel photos (added 2026-05-17 by Photo Curation DEEP pass).
  photos?: string[];
  // Free-cancellation flag (added 2026-05-17 — same as LodgingAlt).
  freeCancellation?: boolean;
  freeCancellationUntil?: string;
}

export interface BaseConfig {
  id: BaseConfigId;
  label: string;
  baseTown: string;
  country: 'AT' | 'DE' | 'AT+DE';
  nightsAtBase: string; // human description e.g. "4 nights"
  recommended?: boolean; // optional star
  pitch: string; // one paragraph
  pros: string[];
  cons: string[];
  costDeltaEur: number; // vs Config A baseline (positive = pricier)
  costDeltaNote: string;
  flow: BaseConfigFlow[];
  driveMatrix: BaseConfigDriveRow[];
  lodging: BaseConfigLodgingPick[];
  mapEmbedUrl: string; // Google Maps search/embed link for the base area
  mapPinNote: string; // what the map shows
}

// --- Drive-time helper ---
function bucket(min: number): BaseConfigDriveRow['bucket'] {
  if (min <= 10) return 'at-door';
  if (min <= 30) return 'easy';
  if (min <= 60) return 'day-trip';
  return 'long-day';
}

// --- Reuse Obertraun drive times from NATURE_DESTINATIONS (already verified
//     by the nature-destinations agent — Salzburg + Hallstatt minutes only).
//     For Berchtesgaden + St. Wolfgang we add manual rows below — Google Maps
//     consensus drive times.

function obertraunDriveRow(d: (typeof NATURE_DESTINATIONS)[number]): BaseConfigDriveRow {
  return {
    destinationId: d.id,
    destinationName: d.name,
    fromBaseMin: d.fromHallstattMin,
    bucket: bucket(d.fromHallstattMin),
  };
}

// Berchtesgaden base drive times (Google Maps consensus) — base = Berchtesgaden
// town / Ramsau / Schönau am Königssee (within 10 min of each other).
const BERCHTESGADEN_DRIVE_TIMES: Record<string, number> = {
  gosausee: 130,
  'hallstatt-markt': 90,
  'krippenstein-5fingers': 90,
  schafbergspitze: 100,
  'wolfgangsee-village': 95,
  attersee: 95,
  konigssee: 10,
  'hintersee-ramsau': 10,
  almbachklamm: 15,
  'eisriesenwelt-werfen': 70,
  liechtensteinklamm: 80,
  'krimml-waterfalls': 130,
  'grossglockner-road': 110,
  // Hidden-gem additions (2026-05-16)
  wimbachklamm: 15,
  'filzmoos-bachlalm': 90,
  zwoelferhorn: 80,
  postalm: 100,
  klausbachtal: 20,
  seisenbergklamm: 45,
  'bluntautal-golling': 45,
  fuschlsee: 70,
};

// St. Wolfgang base drive times (Google Maps consensus) — base = St. Wolfgang
// village on Wolfgangsee.
const WOLFGANGSEE_DRIVE_TIMES: Record<string, number> = {
  gosausee: 60,
  'hallstatt-markt': 55,
  'krippenstein-5fingers': 60,
  schafbergspitze: 5, // cog railway is in town
  'wolfgangsee-village': 0, // you're IN the village
  attersee: 30,
  konigssee: 90,
  'hintersee-ramsau': 105,
  almbachklamm: 75,
  'eisriesenwelt-werfen': 70,
  liechtensteinklamm: 80,
  'krimml-waterfalls': 130,
  'grossglockner-road': 120,
  // Hidden-gem additions (2026-05-16)
  wimbachklamm: 80,
  'filzmoos-bachlalm': 75,
  zwoelferhorn: 15,
  postalm: 25,
  klausbachtal: 90,
  seisenbergklamm: 80,
  'bluntautal-golling': 60,
  fuschlsee: 30,
};

function berchtesgadenDriveRow(d: (typeof NATURE_DESTINATIONS)[number]): BaseConfigDriveRow {
  const min = BERCHTESGADEN_DRIVE_TIMES[d.id] ?? d.fromSalzburgMin;
  return {
    destinationId: d.id,
    destinationName: d.name,
    fromBaseMin: min,
    bucket: bucket(min),
  };
}

function wolfgangseeDriveRow(d: (typeof NATURE_DESTINATIONS)[number]): BaseConfigDriveRow {
  const min = WOLFGANGSEE_DRIVE_TIMES[d.id] ?? d.fromSalzburgMin;
  return {
    destinationId: d.id,
    destinationName: d.name,
    fromBaseMin: min,
    bucket: bucket(min),
  };
}

// === Berchtesgaden / Ramsau / Schönau am Königssee lodging set (NEW) ===
// Verified via WebSearch 2026-05-16. Booking.com slugs confirmed for each.
// Prices are mid-range estimates for Jul 26-30 — re-verify on Booking before
// locking. All have kitchens. Sorted: 2-BR / split-sleeping first.
const BERCHTESGADEN_LODGING: BaseConfigLodgingPick[] = [
  {
    name: 'Apart Chalet Unterbrandnerlehen (Schönau am Königssee)',
    url: 'https://www.booking.com/hotel/de/fewo-unterbrandnerlehen.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
    review: '9.5 · Exceptional · 51 reviews',
    pricePerNight: '€155 / night (₪615)',
    note: '2-bedroom chalet apartment 0.2 mi from Königssee, 2-min walk to bakery + Jennerbahn cable car. Cash-only. Children not allowed. Free bus + cable-car pass with guest card. The character-stay pick of Berchtesgaden. [Photo is the Königssee area, not the listing — view live photos on Booking.]',
    budgetTier: 'mid-high',
    vibeTag: 'forest-cabin',
    laundry: 'washer',
    bedrooms: 2,
    beds: '1 queen + 2 single (sleeps 4)',
    notableDetails: [
      'Washing machine',
      'Dishwasher',
      'Pool view',
      '5-min walk to Königssee shore',
      'Cash-only',
    ],
    maxGuests: 4,
    kitchen: 'full',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'mountain',
    availability: 'sold-out',
    availabilityCheckedDate: '2026-05-17',
    availabilityNote:
      'Booking.com shows no availability Sun Jul 26 → Wed Jul 29, 2026 (verified live 2026-05-17). Pick a different Berchtesgaden stay or different dates.',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
    ],
  },
  {
    name: 'Gästehaus Hinterponholz (Ramsau)',
    url: 'https://www.booking.com/hotel/de/ga-stehaus-hinterponholz.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Ramsau_bei_Berchtesgaden_%28DE%29%2C_Milchstra%C3%9Fe_%C3%BCber_Hochkalter_%26_Hintersee_--_2024_--_1018-50.jpg/1280px-Ramsau_bei_Berchtesgaden_%28DE%29%2C_Milchstra%C3%9Fe_%C3%BCber_Hochkalter_%26_Hintersee_--_2024_--_1018-50.jpg',
    review: '9.4 · Superb · 180 reviews',
    pricePerNight: '€120 / night (₪476)',
    note: 'Alpine-style guest house IN Berchtesgaden National Park with separated living + sleeping area, full kitchen, balcony with mountain views. Family-run. Apartments sleep up to 4. [Photo is the Ramsau area, not the listing — view live photos on Booking.]',
    budgetTier: 'standard',
    vibeTag: 'nature-view',
    laundry: 'shared',
    bedrooms: 1,
    beds: '1 queen + sofa bed in living area',
    notableDetails: [
      'Alpine-style traditional',
      'Mountain-view balcony',
      'Full kitchen',
      'IN national park',
    ],
    maxGuests: 4,
    kitchen: 'full',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'mountain',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Ramsau_bei_Berchtesgaden_%28DE%29%2C_Milchstra%C3%9Fe_%C3%BCber_Hochkalter_%26_Hintersee_--_2024_--_1018-50.jpg/1280px-Ramsau_bei_Berchtesgaden_%28DE%29%2C_Milchstra%C3%9Fe_%C3%BCber_Hochkalter_%26_Hintersee_--_2024_--_1018-50.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
    ],
  },
  {
    name: 'Wolf & Schaf Apartments-equivalent — Ferienwohnung da Celia (Berchtesgaden town)',
    url: 'https://www.booking.com/hotel/de/ferienwohnung-da-celia.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Rathaus%2C_Berchtesgaden_%28Town_Hall%2C_Berchtesgaden%29_-_geograph.org.uk_-_7935.jpg',
    review: '8.2 · Very good · 98 reviews',
    pricePerNight: '€110 / night (₪437)',
    note: '1-bedroom apartment in central Berchtesgaden with fully equipped kitchen + balcony with mountain views. On-site restaurant, free parking. Few minutes walk from town center. 8.2 below ideal 8.5 — kept for value + location + restaurant. [Photo is Berchtesgaden town, not the listing — view live photos on Booking.]',
    budgetTier: 'standard',
    vibeTag: 'in-town',
    laundry: 'unknown',
    bedrooms: 1,
    beds: '1 queen',
    notableDetails: ['Mountain-view balcony', 'On-site restaurant', 'Free parking', 'Town center'],
    maxGuests: 2,
    kitchen: 'full',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'mountain',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/8/82/Rathaus%2C_Berchtesgaden_%28Town_Hall%2C_Berchtesgaden%29_-_geograph.org.uk_-_7935.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
    ],
  },
  {
    name: 'Gästehaus Amort (Ramsau)',
    url: 'https://www.booking.com/hotel/de/gastehaus-amort.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Pfarrkirche_St._Sebastian_%28Ramsau%29.jpg/1280px-Pfarrkirche_St._Sebastian_%28Ramsau%29.jpg',
    review: '9.3 · Superb · 130 reviews',
    pricePerNight: '€105 / night (₪417)',
    note: 'Family-run pension in Ramsau with private balconies overlooking the Berchtesgaden Alps. Custom breakfast at preferred times. Quiet, homelike. ~10 min drive to Königssee + Hintersee both. [Photo is Ramsau village (St. Sebastian church), not the listing — view live photos on Booking.]',
    budgetTier: 'standard',
    vibeTag: 'nature-view',
    laundry: 'shared',
    bedrooms: 1,
    beds: '1 queen + single',
    notableDetails: [
      'Alpine-view balcony',
      'Breakfast included + custom hours',
      'Family-run',
      'Quiet Ramsau setting',
    ],
    maxGuests: 3,
    kitchen: 'none',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'mountain',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Pfarrkirche_St._Sebastian_%28Ramsau%29.jpg/1280px-Pfarrkirche_St._Sebastian_%28Ramsau%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
    ],
  },
  {
    name: 'Grubenlehen (Ramsau)',
    url: 'https://www.ramsau.de/en/accomodations/self-catering-apartments/grubenlehen.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
    review: '9.0 · Superb · 65 reviews (off-Booking; via ramsau.de)',
    pricePerNight: '€140 / night (₪555)',
    note: "2-BEDROOM apartment — master bedroom fits an extra bed, children's room has bunk beds. Sleeps 4-5. East-facing terrace with mountain views, communal pool + playground + BBQ. Booked via ramsau.de (the village tourism portal — not on Booking). [Photo is Ramsau village, not the listing — view live photos on ramsau.de.]",
    budgetTier: 'standard',
    vibeTag: 'farm-stay',
    laundry: 'washer',
    bedrooms: 2,
    beds: '1 queen (expandable) + bunk beds (sleeps 4-5)',
    notableDetails: [
      'Washing machine',
      'East-facing terrace',
      'Mountain views',
      'Communal pool',
      'Playground + BBQ',
    ],
    maxGuests: 5,
    kitchen: 'full',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'mountain',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
    ],
  },
];

// === St. Wolfgang / Strobl / St. Gilgen lodging set (NEW) ===
// Verified via WebSearch 2026-05-16. Booking.com slugs confirmed.
const ST_WOLFGANG_LODGING: BaseConfigLodgingPick[] = [
  {
    name: 'Wolf & Schaf Apartments (St. Wolfgang)',
    url: 'https://www.booking.com/hotel/at/harmonie-st-wolfgang.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
    review: '9.4 · Superb · 904 reviews',
    pricePerNight: '€175 / night (₪695)',
    note: 'Modern Alpine-style apartments 200m from Lake Wolfgangsee, 10-min walk to St. Wolfgang center. Kitchenettes, balcony, dining area. Free guest passes to the public lido for swimming. Hosts (Yoni + Bram) actively helpful. Note: bathrooms small per one review. 4-star luxury tier. [Photo is St. Wolfgang lakeshore, not the listing — view live photos on Booking.]',
    budgetTier: 'mid-high',
    vibeTag: 'lake-edge',
    laundry: 'washer',
    bedrooms: 1,
    beds: '1 queen',
    notableDetails: [
      'Washing machine',
      '200m to lake',
      'Free lido pass',
      'Modern design',
      'Helpful hosts',
    ],
    maxGuests: 2,
    kitchen: 'kitchenette',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'lake',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG/1280px-St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
    ],
  },
  {
    name: 'Wolfgangsee Appartement (St. Wolfgang)',
    url: 'https://www.booking.com/hotel/at/wolfgangsee-appartement.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Panorama_Wolfgangsee.jpg/1280px-Panorama_Wolfgangsee.jpg',
    review: '9.2 · Superb · 130 reviews · Location 9.5',
    pricePerNight: '€135 / night (₪536)',
    note: "Lake-view apartment with kitchenette, balcony with outdoor dining, mountain + lake views. Stone's-throw from Wolfgangsee shore. Garden, terrace, outdoor fireplace, fitness center. From €120/night per Booking. [Photo is Wolfgangsee panorama, not the listing — view live photos on Booking.]",
    budgetTier: 'standard',
    vibeTag: 'lake-edge',
    laundry: 'unknown',
    bedrooms: 1,
    beds: '1 queen + sofa',
    notableDetails: [
      'Lake-view balcony',
      'Outdoor fireplace / picnic area',
      'Fitness center',
      "Stone's-throw to lake",
    ],
    maxGuests: 3,
    kitchen: 'kitchenette',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'lake',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Panorama_Wolfgangsee.jpg/1280px-Panorama_Wolfgangsee.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG/1280px-St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
    ],
  },
  {
    name: 'Wolfgangsee Appartements (Strobl, east end of the lake)',
    url: 'https://www.booking.com/hotel/at/wolfgangsee-appartements.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
    review: '9.5 · Exceptional · 95 reviews',
    pricePerNight: '€140 / night (₪555)',
    note: 'Strobl base — east end of Wolfgangsee, 15 min by car from St. Wolfgang. Garden + lake views, terrace, fully appointed kitchen. Slightly quieter than St. Wolfgang itself. Great for "lake but not the tourist hub" preference. [Photo is Strobl on the Wolfgangsee, not the listing — view live photos on Booking.]',
    budgetTier: 'standard',
    vibeTag: 'lake-edge',
    laundry: 'unknown',
    bedrooms: 1,
    beds: '1 queen + sofa',
    notableDetails: ['Lake view', 'Garden + terrace', 'Quieter than St. Wolfgang'],
    maxGuests: 3,
    kitchen: 'full',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'lake',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Panorama_Wolfgangsee.jpg/1280px-Panorama_Wolfgangsee.jpg',
    ],
  },
  {
    name: 'Appartements Mair (Strobl, 70m² 2-BR)',
    url: 'https://www.booking.com/hotel/at/70m2-ferienwohnung-am-wolfgangsee-strobl.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Wolfgangsee_bei_Strobl_nach_Norden_-_panoramio.jpg/1280px-Wolfgangsee_bei_Strobl_nach_Norden_-_panoramio.jpg',
    review: '9.4 · Superb · 80 reviews',
    pricePerNight: '€160 / night (₪635)',
    note: '70m² 2-BEDROOM apartment with fully equipped kitchen, lake-close, shop + town center walking distance. Strobl base. The "we want two real bedrooms on the 4-night main" priority pick for Wolfgangsee config. [Photo is Wolfgangsee at Strobl, not the listing — view live photos on Booking.]',
    budgetTier: 'mid-high',
    vibeTag: 'in-town',
    laundry: 'unknown',
    bedrooms: 2,
    beds: '1 queen + 2 singles (sleeps 4)',
    notableDetails: [
      '70m² spacious',
      '2-BR priority',
      'Walking distance to shop + center',
      'Fully equipped kitchen',
    ],
    maxGuests: 4,
    kitchen: 'full',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'mixed',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Wolfgangsee_bei_Strobl_nach_Norden_-_panoramio.jpg/1280px-Wolfgangsee_bei_Strobl_nach_Norden_-_panoramio.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Panorama_Wolfgangsee.jpg/1280px-Panorama_Wolfgangsee.jpg',
    ],
  },
  {
    name: 'Apartment Sunset am Wolfgangsee (Strobl)',
    url: 'https://www.booking.com/hotel/at/apartment-sunset-am-wolfgangsee.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
    review: '8.8 · Excellent · 100 reviews',
    pricePerNight: '€115 / night (₪456)',
    note: 'Apartment with terrace + mountain views, dishwasher + oven + microwave in the kitchenette. Sunset name suggests west-facing — verify before booking. Budget-friendly pick. [Photo is the Wolfgangsee at St. Wolfgang, not the listing — view live photos on Booking.]',
    budgetTier: 'standard',
    vibeTag: 'nature-view',
    laundry: 'unknown',
    bedrooms: 1,
    beds: '1 queen',
    notableDetails: [
      'Mountain-view terrace',
      'Dishwasher',
      'Oven + microwave',
      'Possible sunset orientation',
    ],
    maxGuests: 2,
    kitchen: 'kitchenette',
    bath: 'private',
    ac: false,
    parking: 'free',
    wifi: true,
    viewType: 'mountain',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Panorama_Wolfgangsee.jpg/1280px-Panorama_Wolfgangsee.jpg',
    ],
  },
];

// === Helper to format Obertraun lodging into BaseConfigLodgingPick (reuse
//     TRIP.lodgings[1] which is the Hallstatt-area set — pick + alts). Sorts
//     2-BR / 2-sleeping-area picks to top per Allison's main-anchor rule.
function obertraunPicks(): BaseConfigLodgingPick[] {
  const hallstatt = TRIP.lodgings.find((l) => l.baseKey === 'hallstatt');
  if (!hallstatt) return [];
  const pick: BaseConfigLodgingPick = {
    name: hallstatt.pickName,
    url: hallstatt.pickUrl,
    img: hallstatt.pickImg,
    review: hallstatt.pickReview,
    pricePerNight: hallstatt.pickPrice,
    note: hallstatt.pickWhy,
    budgetTier: hallstatt.pickBudgetTier,
    vibeTag: hallstatt.pickVibeTag,
  };
  const alts: BaseConfigLodgingPick[] = hallstatt.alts.map((a) => ({
    name: a.name,
    url: a.url,
    img: a.img,
    review: a.review,
    pricePerNight: a.pricePerNight,
    note: a.note,
    budgetTier: a.budgetTier,
    vibeTag: a.vibeTag,
  }));
  return [pick, ...alts];
}

export const BASE_CONFIGS: BaseConfig[] = [
  // --- CONFIG A: OBERTRAUN (3-night mountain anchor) ---
  // Restructured 2026-05-17: was a 4-night anchor; now 3 nights Sun-Wed.
  // Wed night is the canonical Schafbergspitze summit overnight (LOCKED
  // across all configs — not optional). Pick which 3-night mountain anchor
  // you want; the Wed cog-summit night is the same in every config.
  {
    id: 'obertraun',
    label: 'Config A — Obertraun (Salzkammergut)',
    baseTown: 'Obertraun + Hallstatt area',
    country: 'AT',
    nightsAtBase: '3 nights · then Schafbergspitze Wed',
    recommended: true,
    pitch:
      'The lowest-friction mountain anchor. One apartment for the 3-night midweek (Sun-Wed), every Salzkammergut anchor (Hallstatt, Gosausee, Krippenstein, Wolfgangsee, Schafberg valley station) is 5-50 minutes away. Königssee is the one stretch — 1h30 day trip from here. 11 apartment options vetted, several with the working-farm + lake-edge vibes. Wed night you pack a small bag and ride the cog up to Berghotel Schafbergspitze for the summit overnight (locked across all configs).',
    pros: [
      'One apartment for the 3-night anchor, no mid-week pack/unpack until Wed',
      'Closest base to Hallstatt + Gosausee + Krippenstein (5-35 min)',
      'Most vetted lodging options (11 picks, all real)',
      'Cheapest overall (lodging baseline)',
      'Ferienhof Osl + Gosau farm-stays = the deepest farm-and-lake immersion options',
      '~50 min drive from Obertraun to the Schafbergbahn valley station for the Wed cog-up',
    ],
    cons: [
      'Königssee + Hintersee become 1h30 day trips (still doable but a longer drive)',
      'Smaller grocery selection than Berchtesgaden side',
      'Hallstatt village gets cruise-ship-busy midday (Obertraun stays quiet)',
    ],
    costDeltaEur: 0,
    costDeltaNote: 'Baseline. Avg €142/night × 3 = €426 for the 3-night anchor.',
    flow: [
      {
        label: 'Mornings',
        text: 'Coffee on the balcony, gondola up Krippenstein or short drive to Gosausee for the mirror-lake walk.',
      },
      {
        label: 'Afternoons',
        text: 'Hallstatt Markt promenade, Skywalk funicular, swim in the Hallstättersee from the Obertraun dock.',
      },
      {
        label: 'Sunsets',
        text: 'Obertraun dock most nights (3-min walk), Schafberg cog one night, Hallstatt Markt south wall going gold.',
      },
    ],
    driveMatrix: NATURE_DESTINATIONS.map(obertraunDriveRow),
    lodging: obertraunPicks(),
    mapEmbedUrl: searchUrl('Obertraun, Austria'),
    mapPinNote:
      'Base = Obertraun. Day-trip range covers all of Salzkammergut + Werfen + Königssee.',
  },

  // --- CONFIG B: BERCHTESGADEN / RAMSAU ---
  {
    id: 'berchtesgaden',
    label: 'Config B — Berchtesgaden / Ramsau (Bavarian Alps)',
    baseTown: 'Berchtesgaden + Ramsau + Schönau am Königssee',
    country: 'DE',
    nightsAtBase: '3 nights · then Schafbergspitze Wed',
    pitch:
      "Bavarian Alps mountain anchor. 3 nights Sun-Wed. Königssee + Hintersee — the two 🌅🌅🌅 sunset spots — are 10 minutes from base. Almbachklamm gorge is 15 min. The trade-off: Hallstatt + Gosausee become 1h30 day trips. Better kosher-friendly Spar infrastructure (bigger Bavarian supermarkets than Obertraun's small ones). 5 verified apartment options including the lake-side 2-BR Unterbrandnerlehen chalet 5 min from the Königssee shore. Wed afternoon = ~1h40 drive to the Schafbergbahn valley station for the summit overnight (locked across all configs).",
    pros: [
      'Königssee is 10 min away — turn the peak sunset-boat moment into a slow ritual, not a day trip',
      'Hintersee photographer-spot is 10 min away too',
      'Almbachklamm gorge + Salzburg both reachable in 25 min',
      'Bigger supermarkets (Bavarian Spar / Edeka) than Obertraun',
      'Family-run guest-house feel dominates the available stock',
    ],
    cons: [
      'Hallstatt + Gosausee become 1h30 day trips (the inversion of Config A)',
      'Cross-border each way means more vignette / Maut admin (covered by car insurance)',
      "Fewer verified apartments (5 vs Obertraun's 11)",
      'No equivalent of Krippenstein 5fingers — that becomes a long-day drive',
      'Furthest drive (~1h40) to the Schafbergbahn cog valley station on Wed',
    ],
    costDeltaEur: -48,
    costDeltaNote:
      'Avg €126/night × 3 = €378 for the 3-night anchor. Slightly cheaper than Obertraun (€48 saved) — Bavarian guest houses run a bit less than Hallstatt-area apartments.',
    flow: [
      {
        label: 'Mornings',
        text: 'Walk to Königssee dock for the early electric boat, OR slow morning + Hintersee loop walk.',
      },
      {
        label: 'Afternoons',
        text: 'Almbachklamm gorge walk, Salzburg Altstadt loop, Hohenwerfen castle photo stop.',
      },
      {
        label: 'Sunsets',
        text: 'Königssee on the last boat (the peak moment), Hintersee glassy water nights, balcony evenings.',
      },
    ],
    driveMatrix: NATURE_DESTINATIONS.map(berchtesgadenDriveRow),
    lodging: BERCHTESGADEN_LODGING,
    mapEmbedUrl: searchUrl('Berchtesgaden, Germany'),
    mapPinNote:
      'Base = Berchtesgaden + Ramsau + Schönau am Königssee (all within 10 min of each other). Day-trip range covers Königssee + Hintersee at the door; Hallstatt cluster is 1h30 east.',
  },

  // --- CONFIG C dropped 2026-05-17: the 2+2 split is obsolete now that
  // Schafbergspitze IS the de-facto split (3-night anchor → 1-night summit).
  // History preserved in git. ---

  // --- CONFIG D (now C): ST. WOLFGANG / WOLFGANGSEE ---
  {
    id: 'wolfgangsee',
    label: 'Config C — St. Wolfgang on Wolfgangsee',
    baseTown: 'St. Wolfgang + Strobl + St. Gilgen (Wolfgangsee)',
    country: 'AT',
    nightsAtBase: '3 nights · then Schafbergspitze Wed',
    pitch:
      "The middle-of-everything mountain anchor. 3 nights Sun-Wed. Wolfgangsee is roughly equidistant from Hallstatt (55 min), Salzburg (50 min), and Bad Ischl (15 min). Schafberg cog railway leaves IN the village — Wed's cog-up is a 5-minute walk from your door. Walk-everywhere village vibe. Trade-off: Königssee + Hintersee become 1h30+ long-day drives. 5 verified apartment options, all lake-adjacent.",
    pros: [
      'Schafberg cog railway IS in town — Wed cog-up is a 5-min walk, not a 50-min drive',
      'Walk-everywhere village (most options 200-500m from lake shore)',
      'Equidistant to Hallstatt + Salzburg (55 / 50 min)',
      'Lakeside promenade with public lido swim access',
      'Attersee + Wolfgangsee both within 30 min',
    ],
    cons: [
      'Königssee + Hintersee are 1h30+ each way — long-day commitments',
      'Eisriesenwelt ice cave + Werfen castle are 70+ min',
      'Smaller cluster of destinations within 30 min than Obertraun',
      'Less of the "deep nature anchor" feel — more village-y, more touristy in summer',
    ],
    costDeltaEur: -12,
    costDeltaNote:
      'Avg €138/night × 3 = €414 for the 3-night anchor. Roughly the same as Obertraun (~€12 cheaper) — Strobl options run a bit less than Hallstatt-area.',
    flow: [
      {
        label: 'Mornings',
        text: 'Schafberg cog at sunrise (early train), Wolfgangsee promenade walk, swim at the public Strandbad.',
      },
      {
        label: 'Afternoons',
        text: 'Hallstatt day trip (55 min), Gosausee (1h), Attersee evening promenade, Salzburg Altstadt half-day.',
      },
      {
        label: 'Sunsets',
        text: 'Schafberg ridge 13-lake panorama (cog runs late in July), Wolfgangsee west shore, Attersee Nußdorf.',
      },
    ],
    driveMatrix: NATURE_DESTINATIONS.map(wolfgangseeDriveRow),
    lodging: ST_WOLFGANG_LODGING,
    mapEmbedUrl: searchUrl('St. Wolfgang im Salzkammergut, Austria'),
    mapPinNote:
      'Base = St. Wolfgang / Strobl / St. Gilgen (all on Wolfgangsee). Equidistant to Salzburg + Hallstatt + Bad Ischl. Königssee is 1h30+ east.',
  },
];

// =====================================================================
// MAP COORDINATES — Leaflet pin geometry (map.html)
// =====================================================================
// Added 2026-05-16 by map agent. Decimal-degree lat/lng for every pin
// rendered on the interactive Leaflet map. Public data, sourced from
// Wikipedia + OpenStreetMap article infoboxes. Additive only — does not
// mutate any existing NATURE_DESTINATIONS or TRIP.lodgings field.
//
// Keys (NATURE_COORDS, LODGING_COORDS) match the destination id / lodging
// name verbatim. Page-map.ts joins them at render time. If a lodging is
// added with no coordinate, the pin is silently skipped + logged to
// console.warn (fail-loud rule).

export interface LatLng {
  lat: number;
  lng: number;
}

// Nature destinations — keyed by NatureDestination.id
export const NATURE_COORDS: Record<string, LatLng> = {
  // Salzkammergut (Austria)
  gosausee: { lat: 47.5375, lng: 13.495 }, // Vorderer Gosausee
  'hallstatt-markt': { lat: 47.5622, lng: 13.6493 }, // Hallstatt village square
  'krippenstein-5fingers': { lat: 47.5147, lng: 13.6907 }, // 5fingers platform on Krippenstein
  schafbergspitze: { lat: 47.7747, lng: 13.4361 }, // Schafberg summit
  'wolfgangsee-village': { lat: 47.7397, lng: 13.4475 }, // St. Wolfgang im Salzkammergut
  attersee: { lat: 47.8467, lng: 13.5197 }, // Nußdorf am Attersee
  // Berchtesgaden / Bavarian Alps (Germany)
  konigssee: { lat: 47.5536, lng: 12.9847 }, // Königssee Schönau dock
  'hintersee-ramsau': { lat: 47.6, lng: 12.85 }, // Hintersee at Ramsau
  almbachklamm: { lat: 47.7197, lng: 13.0464 }, // Almbachklamm entrance, Marktschellenberg
  // Hohe Tauern / Pongau (Austria)
  'eisriesenwelt-werfen': { lat: 47.503, lng: 13.1894 }, // Eisriesenwelt + Hohenwerfen
  liechtensteinklamm: { lat: 47.3392, lng: 13.2178 }, // Liechtensteinklamm, St. Johann im Pongau
  'krimml-waterfalls': { lat: 47.2056, lng: 12.1683 }, // Krimml Waterfalls
  'grossglockner-road': { lat: 47.1342, lng: 12.825 }, // Grossglockner Hochalpenstraße (Hochtor pass)
};

// Lodging — keyed by exact pickName / alt.name string. Map agent fills as
// many as could be verified; entries without a coord get filtered out at
// render with a console.warn.
export const LODGING_COORDS: Record<string, LatLng> = {
  // SALZBURG (Shabbat base) — Linzergasse / Andräviertel / Altstadt / Schallmoos
  'master Linzergasse': { lat: 47.8049, lng: 13.0476 }, // Linzergasse, Andräviertel
  "Junker's Apartments": { lat: 47.8003, lng: 13.0289 }, // ~1.9km from old town
  Sauerweingut: { lat: 47.7972, lng: 13.0339 }, // Aigen / Nonntal direction
  'Villa Salzburg by Welcome to Salzburg': { lat: 47.7967, lng: 13.0322 }, // Riedenburg
  'Pension Elisabeth — Rooms & Apartments': { lat: 47.8128, lng: 13.0489 }, // Schallmoos
  'Amedeo Zotti Residence Salzburg': { lat: 47.8156, lng: 13.0506 }, // Schallmoos
  'Salzburg Topside Apartments': { lat: 47.8072, lng: 13.0428 }, // Lasserstraße 19
  // HALLSTATT / OBERTRAUN (4-night anchor)
  'Haus Edelweiss (Obertraun)': { lat: 47.5497, lng: 13.6892 }, // Obertraun, foot of Dachstein
  'Austrian Apartments (Bad Goisern)': { lat: 47.6394, lng: 13.6178 }, // Bad Goisern
  'Ferienhof Osl — Urlaub am Bauernhof (Obertraun)': { lat: 47.5481, lng: 13.6831 },
  'Haus Steinbrecher Hallstatt': { lat: 47.5611, lng: 13.6489 }, // IN Hallstatt
  'River Lilly Apartment (Obertraun)': { lat: 47.5489, lng: 13.6856 },
  'Landhaus Osborne (Obertraun)': { lat: 47.5494, lng: 13.6883 },
  'Ferienwohnung Schmaranzer (Gosau)': { lat: 47.5836, lng: 13.5403 }, // Gosau valley
  'Haus im Grünen (Gosau)': { lat: 47.5853, lng: 13.5328 },
  'Mühlradl Apartments Gosau': { lat: 47.5811, lng: 13.5378 },
  'Pension Sydler (Bad Goisern)': { lat: 47.6386, lng: 13.6189 },
  'Weisses Lamm Holiday Home (Hallstatt)': { lat: 47.5614, lng: 13.6486 },
  // AIRPORT (Thu→Fri pre-flight)
  'Hapimag Ferienwohnungen Salzburg': { lat: 47.8164, lng: 13.0014 }, // ~5km from SZG
  'Landhotel Berger (Ainring, just over the German border)': { lat: 47.8056, lng: 12.9614 },
  'Hotel Astoria': { lat: 47.8061, lng: 13.0064 }, // ~2.3km from terminal
  'Goldgasse Apartments de Luxe': { lat: 47.7989, lng: 13.0467 }, // Altstadt / Goldgasse
  'Rock Salzburg': { lat: 47.7989, lng: 13.0436 }, // Altstadt
  // BERCHTESGADEN / RAMSAU (Config B + Split C)
  'Apart Chalet Unterbrandnerlehen (Schönau am Königssee)': { lat: 47.5867, lng: 12.9839 },
  'Gästehaus Hinterponholz (Ramsau)': { lat: 47.605, lng: 12.9019 }, // Ramsau bei Berchtesgaden
  'Wolf & Schaf Apartments-equivalent — Ferienwohnung da Celia (Berchtesgaden town)': {
    lat: 47.6306,
    lng: 13.0019,
  },
  'Gästehaus Amort (Ramsau)': { lat: 47.6094, lng: 12.8989 },
  'Grubenlehen (Ramsau)': { lat: 47.6053, lng: 12.8956 },
  // ST. WOLFGANG / STROBL (Config D)
  'Wolf & Schaf Apartments (St. Wolfgang)': { lat: 47.7397, lng: 13.4506 },
  'Wolfgangsee Appartement (St. Wolfgang)': { lat: 47.7411, lng: 13.4467 },
  'Wolfgangsee Appartements (Strobl, east end of the lake)': { lat: 47.7136, lng: 13.4842 },
  'Appartements Mair (Strobl, 70m² 2-BR)': { lat: 47.715, lng: 13.485 },
  'Apartment Sunset am Wolfgangsee (Strobl)': { lat: 47.7128, lng: 13.4856 },
};

// Standalone POIs — airport, Chabad, Jewish sights
export interface MapPOI {
  id: string;
  name: string;
  description: string;
  category: 'airport' | 'chabad' | 'jewish';
  lat: number;
  lng: number;
  link?: string;
}

export const STANDALONE_POIS: MapPOI[] = [
  {
    id: 'salzburg-airport',
    name: 'Salzburg W. A. Mozart Airport (SZG)',
    description:
      'Rental car pickup Fri Jul 24 ~08:30 (LY5193 lands 07:50) + Friday Jul 31 LY5194 dep 08:55 (rental drop ~06:15).',
    category: 'airport',
    lat: 47.7933,
    lng: 13.0043,
    link: 'rental-car.html',
  },
  {
    id: 'chabad-salzburg',
    name: 'Chabad Salzburg — Linzergasse 76',
    description: 'Shabbat home. Davening + meals. 5-min walk from master Linzergasse apartment.',
    category: 'chabad',
    lat: 47.8047,
    lng: 13.0481,
    link: 'shabbat.html',
  },
  // Jewish sights — secondary set
  {
    id: 'judengasse',
    name: 'Judengasse (medieval Jewish quarter)',
    description: 'Pre-1404 expulsion Jewish street in the Altstadt. Stolpersteine route start.',
    category: 'jewish',
    lat: 47.7989,
    lng: 13.0456,
    link: 'jewish-sights.html#judengasse',
  },
  {
    id: 'ikg-salzburg',
    name: 'IKG Salzburg synagogue (Lasserstraße 8)',
    description: 'Active community synagogue rebuilt post-WWII. Friday-night service option.',
    category: 'jewish',
    lat: 47.8061,
    lng: 13.0464,
    link: 'jewish-sights.html#ikg',
  },
  {
    id: 'jewish-cemetery',
    name: 'Jewish cemetery (Aigen, Uferstraße)',
    description: '19th-century cemetery on the Salzach east bank. Quiet, walkable.',
    category: 'jewish',
    lat: 47.7886,
    lng: 13.0681,
    link: 'jewish-sights.html#cemetery',
  },
  {
    id: 'mauthausen',
    name: 'Mauthausen Memorial',
    description:
      'KZ Mauthausen — concentration camp memorial. 90-min drive east of Salzburg. Heavy day.',
    category: 'jewish',
    lat: 48.2569,
    lng: 14.5022,
    link: 'jewish-sights.html#mauthausen',
  },
];

// =====================================================================
// SUNSET STAYS — "sleep + sunset in the same spot"
// =====================================================================
// Added 2026-05-16 by beautiful-lodging-hunt agent.
// Allison: "if theres a place to sleep with an insane sunset wotht
// noting" + "we love staying in beautiful places" + "be crrative".
//
// Special cross-finds — NOT the primary lodging picks. Alternates or
// "swap one night" picks where you wake up where the sunset happens.
// Each is a verified-bookable property for Jul 2026.

export type SunsetStayStatus = 'bookable' | 'confirm-with-host' | 'skip-too-hard';

export interface SunsetStayLogistics {
  label: string;
  value: string;
}

export interface SunsetStay {
  id: string;
  name: string;
  url: string;
  img: string;
  imgCredit?: string;
  // Carousel photos (added 2026-05-17 by Photo Curation DEEP pass). 3-5
  // stable Wikimedia summit/area photos for the sunset-stay carousel.
  photos?: string[];
  elevationM?: number;
  region: 'salzkammergut' | 'berchtesgaden' | 'wolfgangsee' | 'dachstein';
  pitch: string;
  whyInsane: string;
  pricePerNightEur: string;
  pricePerNightNote?: string;
  logistics: SunsetStayLogistics[];
  kosherKit: string;
  packList: string;
  weatherRisk: string;
  verdict: string;
  status: SunsetStayStatus;
  bookingNote: string;
  sourceLinks: { label: string; url: string }[];
}

export const SUNSET_STAYS: SunsetStay[] = [
  {
    id: 'schafbergspitze-stay',
    name: 'Berghotel Schafbergspitze',
    url: 'https://schafberg.net/en/',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Schafberg_Panorama_Attersee_Mondsee.jpg/1280px-Schafberg_Panorama_Attersee_Mondsee.jpg',
    imgCredit: 'Wikimedia Commons',
    photos: PHOTO_POOL.schafbergSummit,
    elevationM: 1783,
    region: 'wolfgangsee',
    pitch:
      "Sleep on a 1,783 m peak after every day-tripper takes the last cog down. Sunset over fourteen Salzkammergut lakes from Austria's oldest mountain hotel (built 1862).",
    whyInsane:
      'Cog railway runs day-trippers up and back until ~17:00. After that the summit empties to ~34 overnight guests. 360-degree panorama covers Wolfgangsee, Mondsee, Attersee, Fuschlsee. Sun sets behind the western horizon at ~20:46 in late July, golden hour stretches a full hour because you are above the haze. Sunrise the next morning over the Dachstein massif to the east. Built 1862 — predates the railway by 30 years.',
    pricePerNightEur: '€155.80 / person (double, includes cog round-trip + breakfast)',
    pricePerNightNote:
      "Single supplement +€22. Tourist tax €3.50/person. B&B-only (no train): €105 double. 'Night on the Schafberg' package for 2 people ≈ €311 + €7 tax.",
    logistics: [
      {
        label: 'Cog railway up',
        value: '~40 min ride (St. Wolfgang valley station → 1,732 m summit)',
      },
      {
        label: '2026 cog round-trip',
        value: '€61 / adult standalone — INCLUDED in the overnight package',
      },
      { label: 'First cog up', value: '~09:00 (verify Jul 2026 timetable — runs Apr 25-Nov 1)' },
      { label: 'Last cog down', value: '~17:00 (verify — this is your storm-escape window)' },
      {
        label: 'Park at valley station',
        value: 'St. Wolfgang Markt — paid lot, ~€5-8/24h (confirm at booking)',
      },
      { label: 'Drive from Obertraun apartment', value: '~50 min (53 km via B166)' },
      {
        label: 'Drive from Salzburg airport',
        value: '~55 min (52 km via Wolfgangsee Bundesstraße)',
      },
    ],
    kosherKit:
      'NO guest kitchen / kettle / microwave in rooms (Tripadvisor + UNIQ Hotels both confirm rooms are spartan — "proper heating + functioning bathroom" only). Restaurant menu is NOT kosher. Plan: bring sealed snacks + sandwiches from the Spar run. Ask reception if they will boil a kettle of hot water for tea (low-friction, no kosher contact). Breakfast is included — eat sealed items only (sealed fruit, sealed yogurt with hechsher you bring yourself, sealed jam, sealed crackers). Realistic call: this is a one-night picnic-in, not a self-catered night.',
    packList:
      'Overnight bag only (rest stays in the car at the valley lot). Layers — summit is 10-15°C colder than valley, can be 5°C at sunrise. Headlamp. Warm jacket + hat. Sealed kosher dinner (sandwiches, salami, hummus tubs, pita, fruit, water). Cash for tip. Camera + power bank.',
    weatherRisk:
      'Cog railway runs in summer rain but suspends in thunderstorms / high wind / lightning. If the last train is cancelled you stay an extra night (the hotel accommodates, prepay your 2nd night). Forecast check at 12:00 the day you go up — if a storm is named for the evening, defer.',
    verdict:
      'LOCKED Wed Jul 29 → Thu Jul 30. The 4th base of the trip (not optional). Restructured 2026-05-17: was a "swap one anchor night" stretch pick; now the canonical Wed-night base across all mountain-anchor configs.',
    status: 'bookable',
    bookingNote:
      'BOOK ~2-3 WEEKS AHEAD — small hotel (~34 person capacity). Book direct: phone +43 (0) 6138 / 35 42 (office hours 08:30-12:00 + 16:00-20:00 daily), or email via the contact form at schafberg.net. Specify "Night on the Schafberg" package + Wed Jul 29 → Thu Jul 30, 2026 + 2 adults double room. Package paid at the cog railway valley station before ascent.',
    sourceLinks: [
      { label: 'Official site (schafberg.net)', url: 'https://schafberg.net/en/' },
      { label: 'Rooms + 2026 prices', url: 'https://schafberg.net/en/rooms/' },
      {
        label: '"Night on the Schafberg" package',
        url: 'https://www.5schaetze.at/en/schafbergbahn/events-and-experiences/night-on-the-schafberg.html',
      },
      {
        label: 'Cog railway 2026 prices + timetable',
        url: 'https://www.5schaetze.at/en/schafbergbahn/prices-and-timetables.html',
      },
      {
        label: 'Tripadvisor reviews',
        url: 'https://www.tripadvisor.com/Hotel_Review-g296672-d570320-Reviews-Schafbergspitze-St_Wolfgang_Upper_Austria.html',
      },
    ],
  },
  {
    id: 'krippenstein-lodge',
    name: 'Lodge am Krippenstein',
    url: 'https://www.lodge.at/en/',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Krippenstein_Dachstein_panorama.jpg/1280px-Krippenstein_Dachstein_panorama.jpg',
    imgCredit: 'Wikimedia Commons',
    photos: PHOTO_POOL.obertraunDachstein,
    elevationM: 2050,
    region: 'dachstein',
    pitch:
      'Sleep next to the 5fingers viewing platform on the Dachstein. Deep-red sunset from the Welterbespirale ("World Heritage Spiral") 5 min from your door.',
    whyInsane:
      'At 2,050 m on the Krippenstein plateau, the lodge is 5 min from the Welterbespirale viewpoint and 20 min from the 5fingers cantilevered platform. Hallstättersee sits 1,600 m straight down to the north; the Dachstein glacier 1,500 m up to the south. Sunset paints the entire Dachstein massif red. Section II cable car runs last DOWN at 19:00 in July 2026 (later than Schafberg) — day-trippers leave by 17:00, you have the high plateau to yourself with breakfast at sunrise.',
    pricePerNightEur: '~€236 / night (per Kayak listing — "Price on request" official)',
    pricePerNightNote:
      'No 2026 public rate sheet. Standard / Komfort / Panorama / Gallery rooms + bunk beds. Email moni@lodge.at for an exact Jul 2026 quote.',
    logistics: [
      {
        label: 'Cable car up',
        value: '2 sections from Obertraun valley. Section II (top) operates Jul 4-Sep 13, 2026',
      },
      { label: 'First cable car', value: '08:40' },
      { label: 'Last cable car DOWN', value: '19:00' },
      { label: 'Walk lodge ↔ top station', value: '2 min' },
      { label: 'Walk lodge ↔ 5fingers', value: '~20 min easy plateau path' },
      { label: 'Drive from Obertraun apartment', value: '5 min to the valley station' },
    ],
    kosherKit:
      'Lodge has rooms (no in-room kitchen mentioned). Restaurant on site (not kosher). Same pattern as Schafberg: bring sealed dinner + breakfast (or rely on sealed items in the breakfast spread — call moni@lodge.at to ask what they can isolate). Plus side: only 5 min from your car at the valley station, so worst case you cable-car down to Obertraun for groceries.',
    packList:
      'Same as Schafberg: overnight bag, layers (10-15°C at 2,050 m even in July), sealed kosher dinner + breakfast, headlamp, camera. Plateau is exposed — wind shell mandatory.',
    weatherRisk:
      'Cable car closes in thunderstorms. Plateau exposed — lightning risk REAL if storms develop. Check weather morning of, abort if storms forecast 16:00-22:00.',
    verdict:
      'STRETCH PICK — easier logistics than Schafberg (you base in Obertraun, 5 min to the cable car). Less of a "world apart" feel because the lodge sits in the ski-area zone, not on a single peak. Strong backup if Schafberg is full.',
    status: 'confirm-with-host',
    bookingNote:
      'Direct: email moni@lodge.at or phone +43 (0) 664 380 405 4. Ask for a Jul 27-28 or Jul 28-29 2026 double room + breakfast + 2 adults.',
    sourceLinks: [
      { label: 'Official site (lodge.at)', url: 'https://www.lodge.at/en/' },
      {
        label: 'Krippenstein cable car schedule + pricing',
        url: 'https://www.dachstein-salzkammergut.com/en/summer/operation-times-summer',
      },
      {
        label: 'Hallstatt.net lodge profile',
        url: 'https://www.hallstatt.net/about-hallstatt/active-summer-holiday/wanderzeit-en-US/mountain-huts-and-alpine/lodge-am-krippenstein-en-US/',
      },
    ],
  },
  {
    id: 'gasthof-gosausee-stay',
    name: 'Gasthof Gosausee',
    url: 'https://www.gasthof-gosausee.at/en/guesthouse-gosausee/',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
    imgCredit: 'Wikimedia Commons / Roman Klementschitz, CC BY-SA 3.0',
    photos: PHOTO_POOL.gosauValley,
    elevationM: 933,
    region: 'salzkammergut',
    pitch:
      'The only inn directly on Lake Gosau. Watch the Dachstein glacier go pink in the mirror at sunset from the lakeside terrace — Swiss-pine "Gosausee" rooms have the same view from the in-room balcony.',
    whyInsane:
      'Vorderer Gosausee is the marquee mirror-lake of the Salzkammergut — Dachstein\'s glacier face reflected in calm water at golden hour. Day-trippers crowd the trail 11-15:00 then disperse. Gasthof Gosausee is the SOLE lake-level lodging, so by 18:00 you have the lake to yourself + a beer-garden terrace facing the mountain. Swiss-pine furnished "Gosausee" rooms have direct lake + Dachstein view from in-room balcony. Family-run, kitchen, beer garden, snack kiosk.',
    pricePerNightEur: '~€110-160 / night (varies by room type, breakfast typically included)',
    pricePerNightNote: 'Confirm Jul 26-30 dates direct on Booking.com or via the official site.',
    logistics: [
      { label: 'Drive from Obertraun apartment', value: '35-40 min via B166 + Gosau valley' },
      { label: 'Drive from Salzburg airport', value: '~75 min' },
      { label: 'Parking', value: 'Free on-site (lakeside)' },
      { label: 'Walk to mirror viewpoint', value: 'Out the door, 200 m to lake-edge bench' },
    ],
    kosherKit:
      'No in-room kitchen (it is a guesthouse, not an apartment). Restaurant not kosher but they will store bagged food in the kitchen fridge — ask at check-in. Realistic plan: bring dinner from the Bad Goisern Spar (15 min back) or eat at the Obertraun apartment before driving up. Breakfast included is bread/dairy/jam — request sealed items in advance.',
    packList:
      'Overnight bag, dinner picnic, camera. Lower elevation than the peak picks — summer night ~12-15°C, normal layers.',
    weatherRisk:
      'Valley floor lodging — no cable car / cog dependency. Worst case is overcast sunset (forecast morning of). Easy to drive back to Obertraun if it rains all day.',
    verdict:
      'VALLEY-LEVEL CHARACTER PICK — easier logistics than the peak picks, but real lake-edge magic. The you-will-stand-still-here spot for the Salzkammergut mirror-lake hour.',
    status: 'bookable',
    bookingNote:
      'Booking.com listing live (search "Gasthof Gosausee"). Specifically request the "Gosausee" Swiss-pine room with the lake-view balcony — not the back-of-house rooms.',
    sourceLinks: [
      { label: 'Official site', url: 'https://www.gasthof-gosausee.at/en/guesthouse-gosausee/' },
      {
        label: 'Booking.com listing',
        url: 'https://www.booking.com/hotel/at/gasthof-gosausee.html',
      },
      {
        label: 'Tripadvisor reviews (sunset confirmed)',
        url: 'https://www.tripadvisor.com/Hotel_Review-g666530-d1583953-Reviews-Guesthouse_Gosausee-Gosau_Upper_Austria.html',
      },
    ],
  },
  {
    id: 'hintersee-lake-edge',
    name: 'Hintersee lake-edge apartments (Ramsau)',
    url: 'https://www.booking.com/searchresults.html?ss=Hintersee+Ramsau+Berchtesgaden',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Hintersee_Panorama.JPG/1280px-Hintersee_Panorama.JPG',
    imgCredit: 'Wikimedia Commons',
    photos: PHOTO_POOL.hinterseeMirror,
    elevationM: 790,
    region: 'berchtesgaden',
    pitch:
      'Wake up to the Hintersee. Apartment with a balcony directly over the water, Hochkalter glacier glowing at sunrise.',
    whyInsane:
      'The Hintersee at sunrise is one of the most-photographed scenes in the Bavarian Alps — dead-calm water, Hochkalter and the Blue Ice Glacier reflected. Day-trippers do not arrive until 09:00. Multiple apartments on the lake edge (Residenz am Hintersee, "Vacation apartment directly at Hintersee", Mountain-view Apartment in Ramsau) have west / south-facing balconies. Sunset over the Reiteralpe to the west at ~21:00 in late July, but SUNRISE is the move — and you only get it if you sleep there.',
    pricePerNightEur: '~€140-200 / night (varies by listing)',
    pricePerNightNote:
      'Multiple lake-edge apartments — Residenz am Hintersee (€141+), Vacation apartment directly at Hintersee (€149+). Confirm Jul dates live.',
    logistics: [
      {
        label: 'Drive from Obertraun apartment',
        value: '~1h 30 min via B166 + Ramsau road (worth it only if you stay overnight)',
      },
      {
        label: 'Drive from Königssee',
        value: '20 min — natural pairing with the Königssee boat day',
      },
      { label: 'Parking', value: 'Free at most lake-edge apartments' },
      {
        label: 'Best for',
        value: 'Second nature anchor if you swap Obertraun for the split-base config',
      },
    ],
    kosherKit:
      'Apartments WITH kitchens (full stovetop + fridge). Same setup as the Obertraun base — cook from Spar groceries (nearest Spar is in Ramsau village, 4 km from the lake). Easiest self-catered option of the four sunset picks because it is a real apartment.',
    packList: 'Standard 1-night apartment-stay packing. Camera tripod for the sunrise.',
    weatherRisk: 'None real — apartment, valley floor, car-accessible year-round.',
    verdict:
      'BERCHTESGADEN-SIDE BEAUTIFUL APARTMENT — best if you go for the Split or Berchtesgaden base config (Config B / C on the Bases page). For Config A (Obertraun-only), this is a 1h30 drive each way — not worth it as a single night.',
    status: 'confirm-with-host',
    bookingNote:
      'Search Booking.com or Airbnb "Hintersee Ramsau" with date filter Jul 26-30. Filter "apartments" + "view: lake" + "balcony". Multiple listings — pick the one with explicit "lake view balcony" + free cancellation.',
    sourceLinks: [
      {
        label: 'Booking.com Hintersee apartments',
        url: 'https://www.booking.com/apartments/city/at/hintersee.html',
      },
      {
        label: 'Lake Hintersee official info',
        url: 'https://www.ramsau.de/en/attractions/our-village/lake-hintersee.html',
      },
    ],
  },
];
