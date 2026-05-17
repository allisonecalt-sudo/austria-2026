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
        // === 2-BEDROOM / 2-BED+LIVING-ROOM ADDITIONS 2026-05-17 ===
        // Allison 2026-05-17 05:58: "we need more options in Salzburg with 2
        // bedroom, can go a little farther from chabad if needed, or at least
        // 2 bed and living room also good because shabbat". Walk-to-Chabad
        // cap relaxed from 15 → 25 min. All apartments below were verified
        // 2026-05-17 via Playwright on Booking.com for Jul 24-26 actual dates:
        // bedroom count, separate living room (for Shabbat separation),
        // kitchen, washer, free cancellation, and live availability all
        // confirmed at detail-page level. Photos left empty so Wave 4d
        // Photo Deep-Fetch can hydrate them; carousel falls back to `img`.
        {
          name: 'Residence Mozart by Welcome to Salzburg',
          url: 'https://www.booking.com/hotel/at/salzburg-residence-b.html?checkin=2026-07-24&checkout=2026-07-26&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/243969787.jpg?k=14d243719c109fc7f2a3610ef31f8d81edbe159fbd0263034ebe841cc21271cf&o=&hp=1',
          review: '9.0 · Wonderful · 623 reviews',
          pricePerNight: '€205 / night (₪816)',
          note: 'TRUE 2-BEDROOM. 50m² Two-Bedroom Apartment: Bedroom 1 (queen) + Bedroom 2 (queen) + Living room (sofa bed) — sleeps 4-6. Real Shabbat separation. Washing machine + dishwasher + AC + private kitchen + private bath. Neutorstraße 30, Riedenburg — ~12-min walk to Chabad. Free cancellation. The single best straight-up-2BR pick of the new batch.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'in-town',
          walkToChabadMin: 12,
          laundry: 'washer',
          bedrooms: 2,
          beds: '2 queens + 1 sofa bed (living room)',
          notableDetails: ['True 2BR', 'Living room with sofa bed', 'Washer', 'Dishwasher', 'AC', '12-min walk to Chabad'],
          maxGuests: 6,
          kitchen: 'full',
          bath: 'private',
          ac: true,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Villa Maxglan',
          url: 'https://www.booking.com/hotel/at/villa-maxglan.html?checkin=2026-07-24&checkout=2026-07-26&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/223324389.jpg?k=24521820d894f821151f00fe61c826b8791610c89c285c031b8de9605b6138b8&o=&hp=1',
          review: '9.8 · Exceptional · 267 reviews',
          pricePerNight: '€178 / night (₪707)',
          note: 'HUGE 144m² THREE-BEDROOM Apartment with Terrace: Bedroom 1 (king) + Bedroom 2 (king) + Bedroom 3 (king) — sleeps up to 6. Garden + mountain views, private terrace, washer + dishwasher + full kitchen. 9.8 review = highest in Salzburg apartments. Riedenburg side, Haslbergerweg 26 — ~22-min walk to Chabad. Free cancellation. Splurge size on a mid-high price.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'in-town',
          walkToChabadMin: 22,
          laundry: 'washer',
          bedrooms: 2,
          beds: '3 kings (3 separate bedrooms)',
          notableDetails: ['3 separate bedrooms', '144m²', 'Terrace', 'Garden + mountain view', 'Washer', 'Dishwasher', '9.8 score'],
          maxGuests: 6,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          beautyPick: true,
          beautyNote: '144m² three-bedroom with private terrace and mountain view — 9.8 score, biggest apartment in our Salzburg set.',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'master Mirabell',
          url: 'https://www.booking.com/hotel/at/master-mirabell.html?checkin=2026-07-24&checkout=2026-07-26&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/590315269.jpg?k=c8c3b7db6b7413495d7eaef4bdd403f7212db3a44baa686f9b60e9edc28d4f2a&o=&hp=1',
          review: '9.0 · Wonderful · 3,275 reviews',
          pricePerNight: '€227 / night (₪902)',
          note: 'Deluxe One-Bedroom Apartment: Bedroom 1 (queen) + separate Living room (sofa bed) — sleeps 3. 30m². Washer + dishwasher + AC + full kitchen. Rainerstraße 7 — same operator as master Linzergasse, ~10-min walk to Chabad. 3,275 reviews = the most battle-tested apartment-style stay in Salzburg. Free cancellation.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'in-town',
          walkToChabadMin: 10,
          laundry: 'washer',
          bedrooms: 1,
          beds: '1 queen + sofa bed (living room)',
          notableDetails: ['Separate living room', 'Washer', 'Dishwasher', 'AC', '3,275 reviews', 'Same operator as master Linzergasse'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: true,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Salzburg Luxury Residence',
          url: 'https://www.booking.com/hotel/at/salzburg-luxury-residence.html?checkin=2026-07-24&checkout=2026-07-26&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/604171878.jpg?k=c1b8d0b9fad47e94c6137c279a983459c5256c7b970d27d09ab04cca09e518f1&o=&hp=1',
          review: '9.0 · Wonderful · 103 reviews',
          pricePerNight: '€260 / night (₪1,031)',
          note: 'MASSIVE 115m² Apartment: one bedroom + spacious living room — "the entire place is yours". Washer + dishwasher + full kitchen + free on-site parking. Wiesbauerstraße 14, Maxglan — ~25-min walk to Chabad (at the edge of the new walk cap). Free cancellation. The "we want room to spread out for Shabbat" pick.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'in-town',
          walkToChabadMin: 25,
          laundry: 'washer',
          bedrooms: 1,
          beds: '1 bedroom + spacious living room',
          notableDetails: ['115m² spacious', 'Entire place yours', 'Free parking', 'Washer', 'Dishwasher'],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'urban',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Casa Wendl',
          url: 'https://www.booking.com/hotel/at/benjamins-refugium.html?checkin=2026-07-24&checkout=2026-07-26&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/522591295.jpg?k=8787e08ee2f5b81bd939bbc702d32fcb78b0e28281c5c5d32d7621854f00f928&o=&hp=1',
          review: '9.0 · Wonderful · 109 reviews',
          pricePerNight: '€174 / night (₪689)',
          note: '64m² Apartment with Mountain View: Bedroom 1 (king) + Living room (sofa bed) + balcony — sleeps 4. Washer + dishwasher + full kitchen + soundproof. Mountain + garden + city + landmark views from the balcony. Innsbrucker Bundesstraße 102, Maxglan — ~25-min walk to Chabad. 18% Genius discount applied. Free cancellation. Best price-to-size ratio of the batch.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'nature-view',
          walkToChabadMin: 25,
          laundry: 'washer',
          bedrooms: 1,
          beds: '1 king + sofa bed (living room)',
          notableDetails: ['64m² spacious', 'Mountain-view balcony', 'King bed', 'Soundproof', 'Washer', '18% Genius discount'],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Holiday Apartments by Das Grüne Hotel zur Post (BIO) & Villa Ceconi',
          url: 'https://www.booking.com/hotel/at/holiday-apartments-by-das-grune-zur-post-100-bio-amp-villa-ceconi.html?checkin=2026-07-24&checkout=2026-07-26&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/790319738.jpg?k=ac6e44a677d4b417f5b2df913844d7c82e135bc48c0c306a3cc6b5c76d874034&o=&hp=1',
          review: '8.7 · Excellent · 179 reviews',
          pricePerNight: '€128 / night (₪508)',
          note: '38m² One-Bedroom Apartment: Bedroom 1 (queen) + Living room (sofa bed) — sleeps 3. Eco-certified ("100% BIO") apartment-hotel. Washer + dishwasher + full kitchen + soundproof. Maxglaner Hauptstraße 45 — ~25-min walk to Chabad. Lowest price in the new batch and still passes every filter. Free cancellation.',
          budgetTier: 'standard',
          platform: 'booking',
          vibeTag: 'in-town',
          walkToChabadMin: 25,
          laundry: 'washer',
          bedrooms: 1,
          beds: '1 queen + sofa bed (living room)',
          notableDetails: ['Eco-certified BIO', 'Washer', 'Dishwasher', 'Soundproof', 'Lowest price in batch'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/680881702.jpg?k=59283c1b5a74c248bae94c44c8d5c0f824af89f88a074d3fc3a6d49ee14a2395&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/680882731.jpg?k=6fdf812fbcd53c03da05e3e9e4d65bdef3d3e336236937e0eb4e621e2510d0f2&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/345286485.jpg?k=3188cc64b997fca1c8c8bb8bcc6d02acec46e117edf1a7dce35e8dccd1ad7d56&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/680888904.jpg?k=4ea5b2239e951dd9527e023534edb38b3a7b599a3461430c214d6866444ca517&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/680882506.jpg?k=2b69fa3832ae0590ed52cbdc3c45f160391df16d8d05df99aa287072f54130fb&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/688166456.jpg?k=8891b17eea3ea704d7cb77c87761df1cb28d31017889fdbd31285e1f59998c77&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/680888951.jpg?k=ffd94126d80724083723b32a11f13cb21831be5c1b1d4f5fe74a788aa04dfd1a&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/680882649.jpg?k=34ee841e2fe91973795708a4a56f0f6203ad5d09e2d9e49bf286d77098a92ade&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/680882844.jpg?k=85387675d543b0be5fc7565d0ef95e125597480d1435fd445e328cd83a8f7db9&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/688166741.jpg?k=dad7c7532224e470baed51ead69ecdc86c56761a3bf110e5cb1a764ce6cab224&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/16860996.jpg?k=da94da2d6d936b99246f07d05eb9b34cc82047a1185d99a92aded9c88142d56e&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/805561963.jpg?k=b346b742183c78fa456ab06f658068dcb1d0c90d022f28de01d08db282db192a&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/805562030.jpg?k=0922b1c11aaf6d335a3183650c56e9ea6006cd3b93ae8a5cc1fdcf272fc3320c&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/805561939.jpg?k=0722554ce9c80e154efc8de4ca0cb96f3932175a9ce2effb903f61daab79194d&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/82629555.jpg?k=d6fa4ef6e7defa70f82f793f0868c61d235388d970b57aa530712a333572f32f&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/16860918.jpg?k=8587a079f5261383b26ec034ebbb15ae1692a273f1e2963d201ae3befae19444&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/82633844.jpg?k=15d78664755c2df584aeea2981e1fbe078be7a27d7f114f87fde192d2c49e7c7&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/16861117.jpg?k=326af86682ec6d778747469696e31c67c179b491bd1c655394fed9d577ccec76&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/154815940.jpg?k=02266380db918230b6b271356f2194bf3be7a02f9bb6be1d76bd55c45ef625c4&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/154815954.jpg?k=e26047e2ec2a89fcfc8d020925c87cd6906bb4b1f067d5b4350ac534ce302a28&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/194990009.jpg?k=767e2ffda592ceaa5954228d7d8833ca14e6d8cd151c0703396b726f8914aa28&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/36933595.jpg?k=f38361aa979d69e0560ff8aa2c7c6fdd6f687a4aff58bae8f247afb47b8c1777&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/36933804.jpg?k=450690af2f6dcd095f7473b975701e864aa422aacf96cc587fc50565665915da&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/71051799.jpg?k=f2509aa3428ca4b13e304480ecf49061267c2191042a5cff24630935756df99f&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/71052138.jpg?k=300b6dfb5ebcd058c0ccfd7a994a88637549be3b825233cff98876bce2a09481&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/194990002.jpg?k=c7293438891bda9d39652fbce1311c1b947561e845150d2d49dffe752ae121dc&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/71047492.jpg?k=4973fa70fb4ad11e4a05218cc926623b0dcdcf80cd0869b22f49d518fe337727&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/253197953.jpg?k=0b47df351dfd3cc2d3458b0b5c17e0e477cfe96149fdff325d7822352400863d&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/595387789.jpg?k=c744fda7c7ae806277812a025211a9459d7742b6f32cc2c5aba85ae559f1e1b8&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/263571289.jpg?k=2acfdcca8bd31bb77f158e0191dbf73c48940ef26af0bce425f91ca9b169c35b&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200641506.jpg?k=ab3f801b4831293efaccaf5bac938f4eaaf1f905ff49d773d830bca2c02f1053&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200609122.jpg?k=64365ad0b4d1ecae2b4d5a5b4afffd0ceedcbe3f9f1f40adac0a1a9212062855&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200609133.jpg?k=08c1b310ff18afdb33aae4a20cff04d4b97a49a346e57adff77d379042fa960f&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/43748595.jpg?k=b965cbb97cedb1fc7b3e5361d9e25056b30cb2dca0aeeb8ce4da36b0c354fa64&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200641536.jpg?k=cc66ca5ab903236d386899eef7da90c8c3c1b4fc05ec88aabcae01b20cd818f5&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200641519.jpg?k=be2d2288da47c86679827b3ea9087006d704d06a034379656b9e2ee5f7a488ff&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200612242.jpg?k=7b73f0f427bfaf7620e008bc57b72ec8fd367f378a81746c68a274f100b22a46&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200632357.jpg?k=31005c6623c92245e2d20459fb369ca02acad89d1be6692d8cf413e79aba6e7c&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200641511.jpg?k=4e01a78120c37cfbd1a3fed100f47724704c641433cff581d1c188aef3f3c47f&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/200641524.jpg?k=5924e6eecfb19404b3d0787e6f222a6b0cfdc4bfffa277ba763a0665dbb2fd65&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/55717428.jpg?k=769dbb7084932b80caa72d87a6b385a4a35340cdbc0dafb2022bb4aae33f1136&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/53927391.jpg?k=d7fc52956e27804d81b93ff3ea6aac37a5b1c390cd15eca84ff54f121e5fb51b&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/509568263.jpg?k=a505bf20113b7c1b0ccc3cf83562dad737a750668b97a776a6938236a4718b4a&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/509568280.jpg?k=6cc3b5b22884b7a42ecbc9cbfc1d6733d5b564b98b28e9cc39e0495571bb43a6&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/509568261.jpg?k=4ef5553154b1dcc34a72470d6a61dac21dffe64d6af9a6eb231ab71ad51ffe91&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/509568256.jpg?k=1b015d4629e69faa753fc4526c3848249571c1a6d8b25a340065c77fba56c231&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/509568262.jpg?k=dfc881b1a2341f31d2934254f4d10887129ce8b07bf0afd6ffeca0552040e316&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/509568283.jpg?k=83a54702fadd0609ff01d1a85d7f0e1e72193b9efb09a22e5b99e0404ef2227c&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/509568285.jpg?k=9646758152b707cbc7a4dc08ca9c2f161fb192853fa6e0f8ade7a5fea1384b64&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/509568270.jpg?k=38c68c68ab943d24de1334c6c7d813588d045ec60fe700d1d57328e810274f7c&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/410661012.jpg?k=e365df9a8161d2c596da7e2ee06ad2a52a1883e43f4504f9dd7db9734011d986&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/410662383.jpg?k=6c70a29533e9301d005ced3313de72e99554aeaa3426899e77b76c2edad850b4&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/416102434.jpg?k=2e573dad2620aa11cb6dcb1042e20d08ffdaeb2588ada269aeb6280ae87a7b11&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/410733230.jpg?k=2189e8f2145e49efcfb7cfa173437c043492b7a81a11c9056ce0364efee05548&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/415930538.jpg?k=c6ed62351cb9fc4d230f0ca24aa0ae9e36de9a5ebf6eb6fc396399a7992b282e&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/410797212.jpg?k=bd1ef12df60848be6d57314b4bd64699016a0549446ec000df4c8b6f9cd5e43e&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/415930098.jpg?k=4d892c7f34b8ecc14579651251cac67f973882b7e62e11db20c5530fe0a79576&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/410732904.jpg?k=7b8035f30ce1ef539991ce557d6ae138970d65093b2777e8fbfd5e3433c15975&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/415929512.jpg?k=1c224bab58f56f166227566e6296b4bc1137f9794fcf009e73fa6672aa06cd8e&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/414400202.jpg?k=8cd3dc698679ba72d85e482bc037e4c6553e9f30abbb0c1c31a4fb118a441ea3&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/542231476.jpg?k=f3a27de3e8806070fd2dc13ef11786e09e9ac8aa5eea359e1a617010ad678857&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/542231280.jpg?k=6f04cb9081b091b697d531a51b897b9ffa887681d2d6a3be16600a67533bede8&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/542231383.jpg?k=3b1b5318887af756128915a8e12a4e70b435e83c756489e36e649c52cf4a62d3&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/771624993.jpg?k=97b6df493038b2ff1e654396a71afadcb8a8e93626fdd0b7398542665e5425ea&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/542231391.jpg?k=59d5e1cabdc424fdafb2fa96c62c9c94e44db8d49b8d32b1ec3920184e24a385&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/784755213.jpg?k=d6c080f0b01bbd001331e27b47f6c511639e7edc3013eddf95fef8dc1b4316eb&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/602729247.jpg?k=2123d1b42cf2184a144fc8b1259c0d2872b0efdbb7c508b3147b107d2f6e0a68&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/602728193.jpg?k=924af0241e8d389777a34cb49717718fb4b832fb420e6bcd5cce78c06dd66d18&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/632527216.jpg?k=6af69b75f42cd30d102bd31cc7491f43f4383b538db431d09a5817844bf53b7b&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/623008876.jpg?k=a74fd653ffc236c3e7deea351ee7faab6fcc45d83ee79fe5defad2c643615db2&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/34414377.jpg?k=bdc80e3a7a52640345336b92278226eb6656c9eef8b281681742b90af20e582a&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/74135503.jpg?k=27bc5bbf999489171d40e38d9dbe1f2f327619cfede81d65edd1d9379e725808&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/74134905.jpg?k=c80fa6c8795918703bca4b9fe6b9ef11240581d514eafe79fdee21a5abefd212&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/75585825.jpg?k=21644a0a6e0d592fdd538c58e461d3527bc4ac9d57b531a7d43b02de20d66322&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/773660438.jpg?k=e30b547b2ad2e73753c25e562dccc5b9011376cfcad0f382af5928b11c68bbfa&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/85749641.jpg?k=20036666a9eed6a0c5702c6bdc45aad846d466332b93b0a1df47a8eac671c54f&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/773660938.jpg?k=0a87fb052221a3174678258f7c4f41afb75404831a8c6cb91e7d6440864d22b2&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/25100453.jpg?k=e05aa61dc2afdd473ff20661e707722a37ff239f730c9175185fb692a0582769&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/25100409.jpg?k=c73cedecc0b6325ba7ccc68a0614e7ba01d1b1b2e34733e2fe6ec94f4f43bd2b&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/80895830.jpg?k=163207a05a0a9e68776b56e6dfb0036dc8c1217ef78d40066040d4b28e2a83cd&o=&hp=1',
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
          // PHOTO-FETCH-FAIL 2026-05-17: pension-sydler.html redirects to a
          // different Salzburg listing — original Bad Goisern listing is
          // dead. Keeping the existing hero + Wikimedia fallback.
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/186766752.jpg?k=17a6e635a80c3bd712d0722a35687dd5b980f5af151a833b22ac02a9582a40f3&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/186170385.jpg?k=1b5256a2b8d2a3651c9f386e4bee39d4be307a55250d784b481d237c71545955&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/386259952.jpg?k=c6153b5f1b47a1d4c124064d76278fbd60a7a75934490eabf027268240304451&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/386260106.jpg?k=4945076eb359fe82ed883429f1e7d6ee96b8fda059048f28fc7e60252439a1f1&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/386260141.jpg?k=f1c56881b39a709718bec2c2898c4117d991031f8dae76cf16ba061385591faf&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/186170293.jpg?k=0ebf7fbb5dbd22869dfd91b4033df93c96430fe053011d22abeee43a3b08c7a9&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/386260115.jpg?k=5fc8065e863610465f4499c3bac33cfd0dc058a101f714bcb06bf01dcf13177f&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/386260130.jpg?k=2e7b01a80fa0d8cce3a628482442bde994fcf02c8e42da9245689670a51a9806&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/386260136.jpg?k=f5fda8ccd3ab6d3e94223165cf966663f52e6dbb557603a0eed99b1c15c863e2&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/386260155.jpg?k=8ca129546c45ca27dd49ccfb87d58f347193400eb86801c504a94721617f0a86&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/706447402.jpg?k=9a73362a46ae82837a4a94dc5d5dc8b2c46203b823a1dc43eeab0126a2923fdc&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/653008289.jpg?k=43a6aff51cee8680624befb434f9dc4ee3889a7c7272c9f593f15a0c099e6206&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/545866009.jpg?k=86b6ea56e6d94d9a899f65ffa49021aa8510f4080cbe23c6b6ee6d784939d669&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/235082674.jpg?k=4c9e63f07f0ef87025f03b7e7810848817300c2e4525f905fe7cc2b31abc6343&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/302277178.jpg?k=f9c335d10065b35234337f470e78abdaa6e6957cf09c3f04cff4d79999baeb58&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/256695342.jpg?k=ac7a1d0c73ad1ea6d03c9a4e0ad14ac9a4e09f43d61910ffe64e79add92f4f34&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/302274979.jpg?k=0585c7473a151ceba31b31518c5144ef14e88a30e720d30b46739fdfd180a23d&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/555878323.jpg?k=7d63dcf50e6e505ac6eba2692ced2afabf400503590de4834786e1c13d1de37e&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/858766319.jpg?k=6d98792583a38aded081ff87fd4d0e40f5e24ab57f2e7e34ea79c57731f53724&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/858766324.jpg?k=9908f45043014d51fe4cead719321c1db0700d077eeed5c31c3560720f7536ac&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/296543725.jpg?k=a95248bed807efd02bc6b47470ec7a20b2c2c2f36acd9554f389727e0799c028&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/22042409.jpg?k=314378f5b0df27f853da3799bece101c7c6854b299c3e81597dd29185cf0f857&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/258751848.jpg?k=0056f1ae227776d6acb9b7373b4de527a1bd1804030e249f77340b49db8b6752&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/36109062.jpg?k=99d4e0760f65bd458f77ffd983de22bceb8ff1327df51c1c891a419b64978171&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/22042565.jpg?k=9fa79cddd0a73dcc8f7d896d8d1c2dde79273761e6923992942f8a7e7bf4439c&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/22042411.jpg?k=4b6201b5af567593cc48d760303a524b9fb99b0bc5e2c7994b63c33bc2a5254f&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/36109057.jpg?k=932e1cafe6f89a862f4e51e675e8bfe57ee2bbb78bb0377cf712fafe2f08da48&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/258757642.jpg?k=d5c87ea8930e42414ad2243366e5b1b5e5bcb97be9338feb7c4852642a8eb8a3&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/270312360.jpg?k=c596048282360afbe4d8f42695d12ca3b7ad7cd7ff938ff2adf7ede82a55126a&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/258744937.jpg?k=787a832747b6cc430b6c2458ffe92f0117f12c79f800046168c13b93106c5356&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/585968658.jpg?k=c7d214bd1ba98238c62526e870a402b0ae3ab58d9a4df7be7e4873a7eee97efb&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/590195917.jpg?k=51577153d0fd2c1204150b26cb0ad449b42cb91b6e571254e5f9af281405deac&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/707176658.jpg?k=7176d23a56d17704860d050a03c495ffbcb3ae908075616daf54a1c6417e8071&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/498768988.jpg?k=6ccf3c13488b7e8d717da6dc79065d47aaa4eb988d51c3123cf9e6e2e8270db6&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/661492260.jpg?k=1aed8bd5ca802dea6279209b2d5b7e260d20fc818ae1da53ecaca3e8481cecaa&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/585968357.jpg?k=1f86116b7925d2507462300b70173bd137b203d14478f6485cdec182520c1fb9&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/586069274.jpg?k=e732d6c13beae587a0024c9d3a2eba84a619ba316a708a0195ba9e686850b020&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/585968607.jpg?k=59c93de35314f44092517671265f0e51fe3a1244e8b7501d03f37a69a3bd9e6a&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/585968711.jpg?k=d6df8aab13d1cc3355c6c04414039eb366e4ae4b82158713897a328bb2394fdb&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/586070550.jpg?k=c9ebb4e318b55a5b3fd40ec016dec820cb52f0ddf7ef46e3b2625b38eeb7dcbc&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/693757778.jpg?k=ef4b226506ad9dbd1f65bf30fada1bc8f80152e99acd37cf86c8a8d5a72cd563&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/481024037.jpg?k=3ae6a8ea87432896ce3810f5f0edc2fce90e84abeb25853d06340bdbc1453a4b&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/692557337.jpg?k=31cfca6ad3138e80d56fb67a517e43b3932821eaba7351aace7fe3f22c88e407&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/692557330.jpg?k=ec34edbb7b0c7c00653a15e88bf0412a8e0161d096c4d9d788c436c27a3e0f71&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/481024033.jpg?k=2328b44eb48dc07e646a67b536183929374c4ffa75e90c4b77e744cce183c9d1&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/481024028.jpg?k=1ed1ea70285987f871c4b96ccfbde76ac81d5d369d36fc5f947c42f091283801&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/481029080.jpg?k=7ec9ad35bfcd50f89f779e1442e95104556dff7591675f1b211c0fafff446486&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/481024036.jpg?k=63c55b2a4f8dcbe91b923156f4e7eaaf06d235c035911f764954448cdbfe5e68&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/481026995.jpg?k=3f5aabaf4b8131cf89f980d3c5535cce720ac174548aaf4df6f71008f8276936&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/481024064.jpg?k=3a6c38b13a3decd84e2e6fab03e5c8738968d588ede814558587229157d647d8&o=&hp=1',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283331.jpg?k=0c0451b607312db5f246a14b4dcaea090aa15bc122f5b3f8cfda1d777d217a15&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283344.jpg?k=0904136ae0328d878a19257b549857ea135a98619827a7b0b798ed51bff69060&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283348.jpg?k=16d86ff4f4077a1efede09edc958d73ed90ed493b984bed49fe42ce26f5ab728&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283349.jpg?k=4c8b00d0ac20146eb41ca04c95e39a1b224642e6eeef833d6e7481a54e33d0af&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283370.jpg?k=0d549a1638e39ab7ef8633587e57849c2b4cbb80b1b7101d7a341f920b529dc7&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283352.jpg?k=70868499939b6db078452f60f4dd45f2a2420487e488eb6885a7c6ae030c1a1d&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283353.jpg?k=5ab49db62333f978cf9c4c8cb0d2040274f4b9c017a21560768eb33a21e1c936&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283356.jpg?k=55eaf495366d0e428e74276b9bff7c20a2bd5807b2887ff3a197a271cdd89cae&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283354.jpg?k=f55263b509dcc07615dc531477cb3b8f64a063cbe64c22e4471c0641a7b8ae78&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/763048812.jpg?k=ae41056b82060867b0ed04900a8febb29abb37a7eb1179533831e23c88eb00c6&o=',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/487668919.jpg?k=871fbd40859af271168ca250fd8b76861be52672d6a5c5f253b1a5d222594d98&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/597187178.jpg?k=a5dae5fb8829548b1ced4b98d4c703b22455e355827294b10bb920889350de68&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/597187181.jpg?k=583a43280ac9b24a6492cf156bf0dc79594f49881b0a4d5bed9548e96b6dbe2c&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/597187187.jpg?k=2ca1e7057d461b0e13f0a5b651f4d27aa8bb77dcda33c3e9f4713f6f6e9261ae&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/597187190.jpg?k=b8ad1e04e108bba33a293abdac294c9b79acbf7ce9d7b53a32eb19b9667d5dff&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/597187192.jpg?k=d8d867fc82ef70bd0a379ca4d611912e4f0d7072378d5c787c117b4d1c6118d3&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/597187084.jpg?k=f9eabb100109a68a372898f3b63c0d176eebb49fbcdf4c49d4e09049c9e26515&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/409240269.jpg?k=da9596e2278e6993e6f7975a597f240d80d4a0279afc229fc7a716e7e2750c0c&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/409240124.jpg?k=4acd8e954a97f60227d60a060dab1538359ac5a76551862c619a466708007661&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/409240163.jpg?k=9e2c8cbf4fe8d211fae741e0fb356c994c38ef9894b2b1c2210a0bb7c6a6f285&o=',
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
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139217677.jpg?k=ebc0c828c528549905c9c09bbe92ccc4e2a9f32aaf5cfa7c5d2372e7cd7ca11c&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139225821.jpg?k=44da1ce3ae8675fc39c0040f121ca71d64b8d56b8f5fddaaec46558b266206fa&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139225867.jpg?k=6608efb7ea139e3bedcf1b62493f8971bce4a4701cab4d0f47abc8bbb7d63769&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/340301203.jpg?k=25a616fbcf89af9af3b5a22c9108fa70bc9cb7bb12c5bce8440c4026a15ffe82&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/268296200.jpg?k=9834bebeac742655d13fda1b3a034ffdb3167b94b32fdd7cf66231e1d6ef95bd&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139217480.jpg?k=e7d7785be92316e0d72de3fe731a3c2e1eb8bea541ab2d5064404daefecf8a7c&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/340301091.jpg?k=df17b4495d8f4465564807dfb592bae2cfba187cf2ba5b94a3db4f7af2524965&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139225810.jpg?k=df64ea5643cc8890d6646cd6fc7ecdce1a1ebe4c29347d900232b536483c0467&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139217334.jpg?k=8487d2aa05bb29d8f4c66d4bbd4db573c2841cbdcdbac7fdb0f52b59b3b8525a&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139703431.jpg?k=beab409d17a9d0c44fee8582785be893749a55bb4d77579449c849709e489c39&o=&hp=1',
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
  // Carousel photos (added 2026-05-17 by location-interaction agent —
  // ride-along: photo-curation agent had already populated `photos: [...]`
  // on several entries below without declaring the field, which broke
  // `tsc --noEmit`. First entry is the hero / fallback when hero.src is
  // empty. Wikimedia stable URLs only (same convention as LodgingAlt.photos).
  photos?: string[];
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Vorderer_Gosausee_mit_Dachstein.jpg/1280px-Vorderer_Gosausee_mit_Dachstein.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/1957-09-28_Vorderer_Gosausee_mit_Dachstein.jpg/1280px-1957-09-28_Vorderer_Gosausee_mit_Dachstein.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Hallstatt_Austria_Bergsee_Lake_Alpine_Summer.jpg/1280px-Hallstatt_Austria_Bergsee_Lake_Alpine_Summer.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Hallstatt_at_Lake_Hallstatt_-_1.jpg/1280px-Hallstatt_at_Lake_Hallstatt_-_1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Hallstatt_at_Lake_Hallstatt_-_2.jpg/1280px-Hallstatt_at_Lake_Hallstatt_-_2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Hallstatt_lake.jpg/1280px-Hallstatt_lake.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hallstatt_Aug2020.jpg/1280px-Hallstatt_Aug2020.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Houses_in_Hallstatt.jpg/1280px-Houses_in_Hallstatt.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Hallstatt_Hallst%C3%A4tter_See_361.jpg/1280px-Hallstatt_Hallst%C3%A4tter_See_361.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/A-Krippenstein-5fingers.jpg/1280px-A-Krippenstein-5fingers.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/5/5f/5_fingers.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/5_fingers_29-07-2013.jpg/1280px-5_fingers_29-07-2013.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/5-Fingers-Glasboden_29-07-2013.jpg/1280px-5-Fingers-Glasboden_29-07-2013.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/5-Fingers-Sprungbrett_29-07-2013.jpg/1280px-5-Fingers-Sprungbrett_29-07-2013.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/A-Krippenstein-hallstatter-see.jpg/1280px-A-Krippenstein-hallstatter-see.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Wolfgangsee_und_Schafberg_vom_Elferstein.jpg/1280px-Wolfgangsee_und_Schafberg_vom_Elferstein.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blick_auf_Schafberg_und_Wolfgangsee_-_panoramio.jpg/1280px-Blick_auf_Schafberg_und_Wolfgangsee_-_panoramio.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Schafberg_Panorama_-_panoramio.jpg/1280px-Schafberg_Panorama_-_panoramio.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Berg_Schafberg_II.jpg/1280px-Berg_Schafberg_II.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/WolfgangseePanorama110425-1.jpg/1280px-WolfgangseePanorama110425-1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/WolfgangseePanorama110425-2.jpg/1280px-WolfgangseePanorama110425-2.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/St_Wolfgang%2C_Austria.jpg/1280px-St_Wolfgang%2C_Austria.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG/1280px-St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/St._Wolfgang_im_Salzkammergut_Wolfgangsee_2.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_2.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/St._Wolfgang_im_Salzkammergut_Wolfgangsee_3.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_3.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/St._Wolfgang_im_Salzkammergut_Wolfgangsee_4.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_4.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Wolfgangsee_mit_St._Wolfgang.jpg/1280px-Wolfgangsee_mit_St._Wolfgang.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Attersee_am_Attersee%2C_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg/1280px-Attersee_am_Attersee%2C_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Attersee-Luftaufnahme3.jpg/1280px-Attersee-Luftaufnahme3.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Attersee-Luftaufnahme3_retouched.jpg/1280px-Attersee-Luftaufnahme3_retouched.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Attersee-Flugzeug2.jpg/1280px-Attersee-Flugzeug2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Gustav_Mahler%27s%2C_House_at_Attersee_lake_%28reflection_in_window%29%2CSalzkammergut%2CUpper_Austria.JPG/1280px-Gustav_Mahler%27s%2C_House_at_Attersee_lake_%28reflection_in_window%29%2CSalzkammergut%2CUpper_Austria.JPG',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Aerial_image_of_K%C3%B6nigssee_%28view_from_the_south%29.jpg/1280px-Aerial_image_of_K%C3%B6nigssee_%28view_from_the_south%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Aerial_image_of_Watzmann_and_K%C3%B6nigssee_%28view_from_the_south%29.jpg/1280px-Aerial_image_of_Watzmann_and_K%C3%B6nigssee_%28view_from_the_south%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Bartholomaevonoben.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Koenigssee_-_St._Bartholomew%27s_Church_02.jpg/1280px-Koenigssee_-_St._Bartholomew%27s_Church_02.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/StBartholom%C3%A4.jpg/1280px-StBartholom%C3%A4.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Spiegelung_im_Obersee_%28Nationalpark_Berchtesgaden%29.jpg/1280px-Spiegelung_im_Obersee_%28Nationalpark_Berchtesgaden%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/5/54/Obersee_01aug2020.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Hintersee-Hochkalter.jpg/1280px-Hintersee-Hochkalter.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c5/Hintersee_%28Ramsau_bei_Berchtesgaden%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Zauberwald_am_Hintersee_in_Ramsau.jpg/1280px-Zauberwald_am_Hintersee_in_Ramsau.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Green_Hintersee_slopes_%28Unsplash%29.jpg/1280px-Green_Hintersee_slopes_%28Unsplash%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Hintersee_Ramsau_Berchtesgaden_.jpg/1280px-Hintersee_Ramsau_Berchtesgaden_.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Nationalpark_Berchtesgaden_Hintersee_Ramsau_2.jpg/1280px-Nationalpark_Berchtesgaden_Hintersee_Ramsau_2.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Almbachklamm_8_Wasserfall_1.jpg/1280px-Almbachklamm_8_Wasserfall_1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Almbachklamm_1.JPG/1280px-Almbachklamm_1.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Almbachklamm_1.jpg/1280px-Almbachklamm_1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/f/f6/Almbachklamm_2.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Almbachklamm_3.JPG/1280px-Almbachklamm_3.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Almbachklamm_08_Schlund.jpg/1280px-Almbachklamm_08_Schlund.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Almbachklamm_14_Mittelteil.jpg/1280px-Almbachklamm_14_Mittelteil.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Entrance_of_Eisriesenwelt_ice_cave_Werfen_Austria.jpg/1280px-Entrance_of_Eisriesenwelt_ice_cave_Werfen_Austria.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Eisriesenwelt_Werfen_Austria_01.jpg/1280px-Eisriesenwelt_Werfen_Austria_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Eisriesenwelt_Werfen_Austria_02.jpg/1280px-Eisriesenwelt_Werfen_Austria_02.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/0/02/IceCaveEntrance.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Eisriesenwelt_trail.jpg/1280px-Eisriesenwelt_trail.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Eisriesenwelt_orgel.jpg/1280px-Eisriesenwelt_orgel.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Hohenwerfen_castle.jpg/1280px-Hohenwerfen_castle.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Liechtensteinklamm_gorge_%2824277176943%29.jpg/1280px-Liechtensteinklamm_gorge_%2824277176943%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Liechtensteinklamm_%2824856512015%29.jpg/1280px-Liechtensteinklamm_%2824856512015%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/f/f4/Liechtensteinklamm%2C_Bild_1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Liechtensteinklamm_03.JPG/1280px-Liechtensteinklamm_03.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Liechtensteinklamm_11.JPG/1280px-Liechtensteinklamm_11.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Liechtensteinklamm_14.JPG/1280px-Liechtensteinklamm_14.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Liechtensteinklamm_22.JPG/1280px-Liechtensteinklamm_22.JPG',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Krimml_Waterfalls%2C_2014_%2802%29.JPG/1280px-Krimml_Waterfalls%2C_2014_%2802%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Krimml_Waterfalls%2C_2014_%2801%29.JPG/1280px-Krimml_Waterfalls%2C_2014_%2801%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Krimml_Waterfalls%2C_2014_%2803%29.JPG/1280px-Krimml_Waterfalls%2C_2014_%2803%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Krimml_Waterfalls%2C_2014_%2804%29.JPG/1280px-Krimml_Waterfalls%2C_2014_%2804%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Krimml_Waterfalls%2C_2014_%2805%29.JPG/1280px-Krimml_Waterfalls%2C_2014_%2805%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Krimml_Waterfalls%2C_2014_%2808%29.JPG/1280px-Krimml_Waterfalls%2C_2014_%2808%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/KRIMML_WATERFALLS_-_AUSTRIA.jpg/1280px-KRIMML_WATERFALLS_-_AUSTRIA.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_2.jpg/1280px-Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_1.jpg/1280px-Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_3.jpg/1280px-Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_3.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_4.jpg/1280px-Gro%C3%9Fglockner-Hochalpenstra%C3%9Fe_4.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Gro%C3%9Fglockner_Hochalpenstra%C3%9Fe_21082018_97.jpg/1280px-Gro%C3%9Fglockner_Hochalpenstra%C3%9Fe_21082018_97.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Gro%C3%9Fglockner_Hochalpenstra%C3%9Fe_21082018_102.jpg/1280px-Gro%C3%9Fglockner_Hochalpenstra%C3%9Fe_21082018_102.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Gro%C3%9Fglockner_Hochalpenstra%C3%9Fe_21082018_186.jpg/1280px-Gro%C3%9Fglockner_Hochalpenstra%C3%9Fe_21082018_186.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/In_der_Wimbachklamm_%2826%29.JPG/1280px-In_der_Wimbachklamm_%2826%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/In_der_Wimbachklamm_%2822%29.JPG/1280px-In_der_Wimbachklamm_%2822%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/In_der_Wimbachklamm_%2823%29.JPG/1280px-In_der_Wimbachklamm_%2823%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Wimbachklamm_2.JPG/1280px-Wimbachklamm_2.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Wimbachklamm_05.JPG/1280px-Wimbachklamm_05.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Wimbachklamm_08.JPG/1280px-Wimbachklamm_08.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Wimbachklamm_Ramsau.jpg/1280px-Wimbachklamm_Ramsau.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/West_view_of_Bischofsm%C3%BCtze_%282009%29.jpg/1280px-West_view_of_Bischofsm%C3%BCtze_%282009%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Bischofsm%C3%BCtze_3-2017_10.jpg/1280px-Bischofsm%C3%BCtze_3-2017_10.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bischofsm%C3%BCtze_1234_07-09-30.JPG/1280px-Bischofsm%C3%BCtze_1234_07-09-30.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Bischofsm%C3%BCtze_1245_11-09-11.JPG/1280px-Bischofsm%C3%BCtze_1245_11-09-11.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Bischofsm%C3%BCtze_1248_11-09-11.JPG/1280px-Bischofsm%C3%BCtze_1248_11-09-11.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bischofsm%C3%BCtze_1260_11-09-11.JPG/1280px-Bischofsm%C3%BCtze_1260_11-09-11.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Bischofsm%C3%BCtze_im_Gosaukamm_des_Dachsteinmassivs.jpg/1280px-Bischofsm%C3%BCtze_im_Gosaukamm_des_Dachsteinmassivs.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Zw%C3%B6lferhorn_von_St.Gilgen.JPG/1280px-Zw%C3%B6lferhorn_von_St.Gilgen.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Sankt_Gilgen%2C_Wolfgangsee_and_Schafberg%2C_Salzkammergut%2C_Austria_from_Zw%C3%B6lferhorn.jpg/1280px-Sankt_Gilgen%2C_Wolfgangsee_and_Schafberg%2C_Salzkammergut%2C_Austria_from_Zw%C3%B6lferhorn.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Sankt_Gilgen%2C_Salzkammergut%2C_Austria_from_cable_car_to_Zw%C3%B6lferhorn.jpg/1280px-Sankt_Gilgen%2C_Salzkammergut%2C_Austria_from_cable_car_to_Zw%C3%B6lferhorn.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Sankt_Gilgen_and_Wolfgangsee%2C_Salzkammergut%2C_Austria_from_cable_car_to_Zw%C3%B6lferhorn.jpg/1280px-Sankt_Gilgen_and_Wolfgangsee%2C_Salzkammergut%2C_Austria_from_cable_car_to_Zw%C3%B6lferhorn.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Sankt_Gilgen_Zw%C3%B6lferhorn_01.jpg/1280px-Sankt_Gilgen_Zw%C3%B6lferhorn_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sankt_Gilgen_Zw%C3%B6lferhorn_02.jpg/1280px-Sankt_Gilgen_Zw%C3%B6lferhorn_02.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Zw%C3%B6lferhorn%2C_St._Gilgen%2C_Salzburg%2C_Austria_-_panoramio.jpg/1280px-Zw%C3%B6lferhorn%2C_St._Gilgen%2C_Salzburg%2C_Austria_-_panoramio.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Postalm%2C_Austria_%28Unsplash_OoQKL4cLZuc%29.jpg/1280px-Postalm%2C_Austria_%28Unsplash_OoQKL4cLZuc%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Postalm_-_Austria_%28Unsplash%29.jpg/1280px-Postalm_-_Austria_%28Unsplash%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Postalm.jpg/1280px-Postalm.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Auf_der_Postalm_-_panoramio.jpg/1280px-Auf_der_Postalm_-_panoramio.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/7/7b/Auf_der_Postalm_-_panoramio_-_holger_mohaupt.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/43/Auf_der_Postalm_-_panoramio_-_holger_mohaupt_%281%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Schafbergblickh%C3%BCtte_auf_der_Postalm_-_panoramio.jpg/1280px-Schafbergblickh%C3%BCtte_auf_der_Postalm_-_panoramio.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Klausbachtal.jpg/1280px-Klausbachtal.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Klausbachtal%2C_H%C3%A4ngebr%C3%BCcke.jpg/1280px-Klausbachtal%2C_H%C3%A4ngebr%C3%BCcke.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Klausbach%2C_Ramsau.jpg/1280px-Klausbach%2C_Ramsau.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Klausbach01.JPG/1280px-Klausbach01.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Bindalm%2C_Klausbachtal.jpg/1280px-Bindalm%2C_Klausbachtal.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Klausbach-Hirschbichlklausgraben_H%C3%A4ngebr%C3%BCcke.JPG/1280px-Klausbach-Hirschbichlklausgraben_H%C3%A4ngebr%C3%BCcke.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Lahnwald-Diensth%C3%BCtte_01.JPG/1280px-Lahnwald-Diensth%C3%BCtte_01.JPG',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Seisenberg_Klamm_006.jpg/1280px-Seisenberg_Klamm_006.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_01.jpg/1280px-Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_02.jpg/1280px-Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_02.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_09.jpg/1280px-Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_09.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_10.jpg/1280px-Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_10.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_16.jpg/1280px-Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_16.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_22.jpg/1280px-Wei%C3%9Fbach_bei_Lofer_Seisenbergklamm_22.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Golling-waterfall.jpg/1280px-Golling-waterfall.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Beautiful_Gollinger_Wasserfall.jpg/1280px-Beautiful_Gollinger_Wasserfall.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Gollinger_Wasserfall%2C_AT.jpg/1280px-Gollinger_Wasserfall%2C_AT.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Gollinger_Wasserfall_02.jpg/1280px-Gollinger_Wasserfall_02.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Gollinger_Wasserfall_04.jpg/1280px-Gollinger_Wasserfall_04.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Gollinger_Wasserfall_3.jpg/1280px-Gollinger_Wasserfall_3.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bluntautal_-_Land_Salzburg_%281%29.jpg/1280px-Bluntautal_-_Land_Salzburg_%281%29.jpg',
    ],
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
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Aerial_image_of_the_Fuschlsee_%28view_from_the_southeast%29.jpg/1280px-Aerial_image_of_the_Fuschlsee_%28view_from_the_southeast%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Fuschlsee_Lake_looking_back_to_Fuschl_%286902760829%29.jpg/1280px-Fuschlsee_Lake_looking_back_to_Fuschl_%286902760829%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Fuschlsee_-_Osts%C3%BCdostansicht.JPG/1280px-Fuschlsee_-_Osts%C3%BCdostansicht.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Fuschlsee_%28DFdB%29.JPG/1280px-Fuschlsee_%28DFdB%29.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Fuschlsee_as_seen_from_Bauernhof_Unterh%C3%B6fner_01.jpg/1280px-Fuschlsee_as_seen_from_Bauernhof_Unterh%C3%B6fner_01.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Fuschlsee_as_seen_from_Bauernhof_Unterh%C3%B6fner_02.jpg/1280px-Fuschlsee_as_seen_from_Bauernhof_Unterh%C3%B6fner_02.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Frauenkopf_Fuschlsee.jpg/1280px-Frauenkopf_Fuschlsee.jpg',
    ],
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
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/499609382.jpg?k=0474875d8c2bcfadee661df6a9ac5d92c2a49fb51d57a87ea225b8d58323388e&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/435762808.jpg?k=36c58947aca63d5a6e0521506d6dca2c2705e80689bf28f74a72e30b8f6e0e69&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/435762810.jpg?k=a5e57a1623c5778bbd6f3cf99a339733e7cf09bd2460fb0254caff67dfdaccb9&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/348845909.jpg?k=870e822bcb1db9fe9fd973349d735b5fb187587dade4a2989e71fb8f087ec270&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/435762797.jpg?k=9a79997e3ddf00d5eb5c5c24c9f04fa85fd2fdfafbaeecaae07507dbea5634bd&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/688930481.jpg?k=61645e4d6b3d73e5b98aa9488620fd2730b81910699817b645b3870cb06dbb45&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/349481338.jpg?k=7251090ef9b8d2aaf92f316f9130b2832b2007e1f4db5777293941deeb5fe9c4&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/435762800.jpg?k=179e3c6570feaa30ff8602a6af4210df1b935627f7fb4ecd4a819adaad6617ee&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/349481337.jpg?k=525755a934e46fdcb44abf47fffdf0e4387ed01d6a37ea708a2ce0e3e8122b82&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/349482038.jpg?k=d023262b1fddc0826f58e7ce487c1d3e13c6c6894e68780664e868ebc3c38eef&o=&hp=1',
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
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/330190226.jpg?k=5aa7162cba5ae19352ac8a6fa7973050f6a81cd3ef099e6270e5afa2a6b1243b&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/401066080.jpg?k=dad868c4d03ff14ebe913c88cf7c45e946c1edf387f4e731f5f031d90d2696e4&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/425334017.jpg?k=389e067ac49e565aea9dc26734f3a9f7fb4e2928cba584f95a59c85da39865d4&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/330190223.jpg?k=59cb198f5365861520c27fa2626ee1b476cf7504ab049a6d79c1a8c674241028&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/330190224.jpg?k=56f3449d4b98023df57611b0ff0d657e463977a69447239a6d17dbfee730b78a&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/330190228.jpg?k=018fbdeec3341762ca60e75f72f5a6c42f65757778650e7085d9cc62e8c5de31&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/330190230.jpg?k=c46488aeed332660b68c7bd40b5bbf69d264cb09d8fa13d94ba72c54e8691178&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/401066083.jpg?k=838827a227fbdca06ea5a0e06e3c153e00a19978206cf8a36faf5fa3583f3cd1&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/401066081.jpg?k=908da63d6ecf330e2a68898afc8d7429163df59f3f1de56b75f0813c6d62db97&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/330190222.jpg?k=a6510e89155513f6cddc39d2e37f6b01e3ac4d4ae18cac888398f6a4bb7065e1&o=&hp=1',
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
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/394674223.jpg?k=ec8860216f21e4b724b2b8ddd9cc1dfecb0e93e33f82a0d463ad38cebdd00a2c&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/399717827.jpg?k=e1b1eb75e9a91fcd134fe5c0bcbf60d7bde344b9fe467908f3d6fdef53f86a39&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/396775813.jpg?k=2f19e7df04c8edfc647d2c9accb51425ee6f229807dc8c69574e4002d78d5744&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/396775814.jpg?k=3f501b2d07c4dcdce5559d23f30b97b583246f5b6f86d0a6bdb8612e331b4273&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/396775815.jpg?k=c0f3848d6d84b78d9cb472fb072fc0347c12105536d2238c8012d0cbf0409f09&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/395416363.jpg?k=c42dce9cbeb340d9148cb3de89280c82a75dc13a4f824c35c86a13e9c4be77af&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/395430694.jpg?k=fb989d13a62024d1fb736a4a2c61ff0280e485a86b207319e04c9d95ea80c389&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/395416321.jpg?k=9939447a45968b45f590e973193021ace66d79f60b04c7a0a86ce3ab424d6e87&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/395430701.jpg?k=179943a2c52fa4ed6758a6a1c7ec0fcd5af669a0f0ca9bd79d614f72fbe5fc4a&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/396775817.jpg?k=c22dda446d65271002fe28e8972dabd19dd86d50314ce9e2cd6c6f10fbb8f638&o=&hp=1',
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
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/663995892.jpg?k=de1856f8eb4588a1e2422774ea1f6d08fed73048a481f6855885050ab6053e56&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/289634598.jpg?k=91444a01b507a7bd24a12df2021dc8713104379d4ae1bc14dc2085c00b021eef&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/117506688.jpg?k=256206a1a29fdc28a5c7dd7463f6bb352dd4a3007bac946568725a618144682a&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/289637582.jpg?k=60bfd58e27c5f7531a427f99f89c5a33d8d7023dc30fb7b04b645cce6db4be6a&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/71496530.jpg?k=ef2a58bdf03f7a51131aa39bc6f04568517c549534c70e3e183f98841a09b565&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/117505683.jpg?k=aa3ed033a1730fc5e2cf2a2fcf97e2a62f082859cabf15bb3a8953a455e97ba7&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/117505731.jpg?k=9c3ca5fa24d0397470d5ebe77b20f090eb6d8ba282bee8e048b20cf40962cb81&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/71475708.jpg?k=236c479211d0b583f01c989a8acc395d2e6d22c89c1fd757a5de7fbf306794ce&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/71362247.jpg?k=98ba9e3fcc3bd45b49865dc74310ee3ace1e1c683b6816973ac12d0df80a16f9&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/117506642.jpg?k=faaf645db8a31f4e0985288717d59edb3ac22e672019d036da3be80e8ae78bd5&o=&hp=1',
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
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/516214270.jpg?k=ffb15aec8a945259e166df2eeb91ed4c6228eacb782fa24acf3e7172480d8ad6&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/471204631.jpg?k=1971c002cdab37ccbea9bbeb2b9074db1e26a768d32dd677d939a8c3a569d327&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/296410603.jpg?k=519946cb3a3dfbaacf6caccd5b4fbbd71c8b5b5fd821d89a147030195983a6a3&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/481047434.jpg?k=19d8c37267d22c5fb5914cf6b14f4cecad49e7d44f9694ef9c137370dae11ff9&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/471204666.jpg?k=90acfec0b3d6fe1eb6dea61ec33d87f4f8bd8c710c06968076b4be75b31daf1e&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/502442905.jpg?k=c12b2d6ca4a52f6df454dd3a0c87f2fb8963c4a1a6d2781430c392355aeb2700&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/496507057.jpg?k=330917bd2cbbddd0b4377d858dadcc2e05847285d73e670f178150ff3826fa95&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/471210264.jpg?k=c10433e86b4e61708777622fbc8b717bc1a6b6db48292ac1bf5a78172ee40dd6&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/266275817.jpg?k=d430c7dc0558f333c5a9e1741ce2b45ff2b8cd0fe95086957cf170283081056d&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/295000406.jpg?k=2bac88c5a7801ec1f45b747b17cc0333bc4607d1a10998d6e5b5bf508c4118bc&o=&hp=1',
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
    // PHOTO-FETCH-FAIL 2026-05-17: wolfgangsee-appartement.html returns a
    // generic Booking landing page — listing appears delisted. Kept the
    // Wolfgangsee Wikimedia fallback so the carousel still has shots.
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
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/545303073.jpg?k=96411e726587d0266c157db063ada61235a65973cc445ee51e9a75bdce086070&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/686018868.jpg?k=579e8e9660cfe29e83e4c94ff7c9c722f41e2fbf96ba826fbf89f5dd656275ee&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/581145247.jpg?k=26a5572e25efc3a81df50f9f66fcb2bf542c31ed81de164584bd100d5fa50785&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/409374639.jpg?k=19584c6bf5716cd78abc9486a6b9933fce18ab8526f7432801dc4e8f167edde9&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/478022452.jpg?k=31b0aad106aa36c08ac640d922b969193f465eaf18270efd66f4377c1c849ff8&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/581145084.jpg?k=e6838160dd6b2c1320817f85bc0c2342e5418d65ed3ef90caac5a20c6175d425&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/545302891.jpg?k=d7237eeafda7d8787ec05a9747f55b1eb3ae30e61fe059a079b219e10f3b4364&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/820212363.jpg?k=e3e3a3620d2ff9198b417826cb758c94e1b2185e23723ce7777774b835aa9f04&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/478022350.jpg?k=b31f04f4f37a2a981f9c64d759147b8049faf14da37c1f015c7f6766553db382&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/581145255.jpg?k=d0e2095209c127d364c2d429da3b143848ace2abf7959ea4724f62b4d26a0cd0&o=&hp=1',
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
    // PHOTO-FETCH-FAIL 2026-05-17: 70m2-ferienwohnung-am-wolfgangsee-strobl
    // redirects to a Strobl search with closed_msg — listing closed.
    // Kept the Strobl-area Wikimedia fallback.
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
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/816822610.jpg?k=b625fe068bb0b5d15be457a7828a301265b36d5a54ce48d1ebc04334c98ad16e&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/502325429.jpg?k=83cf62310483423e4d8d8139670dd937b2cfd9afc70f3a047caaf09ca06aa33d&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/502325203.jpg?k=3fde4bb86fa00a44be3b157f574a25762a26f335a52f74d02f0f888ce625564e&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/525092078.jpg?k=6e9aaad07e36e712240365ae300357d7a164574e17a6e170037b75c20b56d7db&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/708195093.jpg?k=fd22a7c4b99b138c6d5a0c68248dfd1c3efbed2f1ac5aa68091a0551cedcfc8a&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474925273.jpg?k=97e46841e90af9968e9c373f2a0771d1dec63135919722e7d8f21631f3355064&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/512024169.jpg?k=e435ef72e754d75efe4f7b37ec1040456f9866910ce14ab6a60285dba87ee4f5&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/502328074.jpg?k=cb836916728018756824a35f7d3db051b0a11dd5b50c865ad41fcec4fc9f176e&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/635564892.jpg?k=44c55a61072c5578916bea873aa5c49222cd894f5f6460f8db3e60518396c568&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/812220344.jpg?k=0dcdac9f9a38eeaeacd64aaa424fb58d261d8bd1c3e63754aaf35d55cefef84a&o=&hp=1',
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
    // Photos sourced live from Booking.com listing 2026-05-17.
    photos: [
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/6222076.jpg?k=cf20c648026dc3b512808189e9c95e9c7ec81caff418ec98980b93f16efab5b1&o=&hp=1',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/29574102.jpg?k=6e3bb81adc9ca036109a58008507cc6033c4699b8d7ba15cfeb6b6f0adcb2425&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/29574133.jpg?k=c2adb7fac3c79e1018e5eadde6c237639d98fed8de994a3f733f5063e129fba7&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/78490402.jpg?k=1f201a498e179f2c7f2f7184e30ae12ba227787c9cff0dfbdcedb458636d5d81&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/26613157.jpg?k=15b89251d1a9274077b4ae7d6d395aed2375c94ed7517b07f9955aade01daa85&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/131197216.jpg?k=dd5ff39c31128735c005aa3ca80285533e445e355cf417dc525ef95317021bf2&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/317670967.jpg?k=e06ad01cb4747c1426a136db0b3b18297a4e3c6c66514b6f05386a72ad9153f3&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/482778525.jpg?k=7bcbe1490c83da6485b900c20b5c006f0f23e93ac5f1906ae1e37494c750c0f1&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/40556775.jpg?k=c9e475103bf6c160e690423f3f7c388ef4bb12e859804c256bf4ed7098d876e9&o=',
      'https://cf.bstatic.com/xdata/images/hotel/max1280x900/482779525.jpg?k=d0dcc85daf40c7f9cd1a6c2edc1e5c7675d46df2cdd84f1f2d6c86cc94050b3f&o=',
    ],
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
