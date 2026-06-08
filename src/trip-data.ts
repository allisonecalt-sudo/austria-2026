// =====================================================================
// REMOVED-DO-NOT-READD (2026-05-17 12:11 per Allison)
// "we dont even need to see sold out at all" / "just take it off the site
// but make sure it doesnt get put back on"
// The following lodging slugs were SOLD OUT or DELISTED on Booking.com
// for the trip dates as of 2026-05-17 and have been DELETED from this file.
// Do NOT re-add them without first re-verifying via Booking.com live with
// the actual trip dates (Salzburg checkin 2026-07-24 / Mountain anchor
// 2026-07-26 / Airport 2026-07-30) AND free-cancellation policy.
//   AlpenParks Hagan Lodge Altaussee (log-cabin village)
//   Apartment Sunset am Wolfgangsee (Strobl)
//   Appartements Mair (Strobl, 70m² 2-BR)
//   Bräugasthof Hallstatt (700-year-old lake-edge inn)
//   Chalet Jochwand (Bad Goisern, brand-new 4-star)
//   Ferienwohnung Schmaranzer (Gosau)
//   Gästehaus Amort (Ramsau)
//   Gästehaus Hinterponholz (Ramsau)
//   Haus im Grünen (Gosau)
//   Heritage.Hotel Hallstatt (3 restored historic houses)
//   Landhaus Lilly (Obertraun) — Liz & Paul B&B
//   Mühlradl Apartments Gosau
//   Pension Sydler (Bad Goisern)
//   Salzburg Topside Apartments
//   Wolf & Schaf Apartments (St. Wolfgang)
//   Wolf & Schaf Apartments-equivalent — Ferienwohnung da Celia (Berchtesgaden town)
//   Wolfgangsee Appartement (St. Wolfgang)
//   gasthof-gosausee-stay
//   naturchalet-primushausl
//   schwadenguetl-gosau
// =====================================================================

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
  // sleepWhere — kept as union string literal. Legacy values 'hallstatt',
  // 'schafbergspitze', 'lodge-am-krippenstein' are DEPRECATED 2026-05-19
  // when the trip restructured to drop the summit overnight (Avital
  // counter-proposal + Allison's relaxed-lakes-radius course correction).
  // New values 'zell-am-see', 'gosau', 'salzburg-airport' added — Salzburg
  // stays 'salzburg'. Keep deprecated values in the union so old data still
  // type-checks; SLEEP_LABEL renders them with a "(deprecated)" tag for
  // pull-back visibility per the pullable-archives rule.
  sleepWhere:
    | 'salzburg'
    | 'zell-am-see'
    | 'gosau'
    | 'salzburg-airport'
    // --- deprecated 2026-05-19, kept as inactive base keys (not rendered) ---
    | 'hallstatt'
    | 'schafbergspitze'
    | 'lodge-am-krippenstein'
    | 'airport';
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
  // baseKey extended 2026-05-19 trip restructure. Legacy keys 'hallstatt' +
  // 'airport' are DEPRECATED and only kept in the archived lodging blocks at
  // the bottom of TRIP.lodgings so the prior decisions remain pullable.
  // Active keys for the v4 (Avital counter-proposal) plan are:
  //   'salzburg'         — Sat-Sun (2 nights, includes Shabbat)
  //   'zell-am-see'      — Sun-Tue (2 nights, main #1+#2)
  //   'gosau'            — Tue-Thu (2 nights, main #3+#4)
  //   'salzburg-airport' — Thu-Fri (1 night)
  baseKey:
    | 'salzburg'
    | 'zell-am-see'
    | 'gosau'
    | 'salzburg-airport'
    // --- deprecated 2026-05-19, kept for archived blocks ---
    | 'hallstatt'
    | 'airport';
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
  // Added 2026-05-19 — Day 3 hero was using IMG.wolfgangsee but the day is the
  // Zell am See arrival, not St. Wolfgang. Real Zell am See lake-town photo.
  zellAmSee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Zell_am_See_CC.JPG/1280px-Zell_am_See_CC.JPG',
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
  zellAmSee: 'Wikimedia / BestZeller, CC BY-SA 3.0',
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
    'Friday Jul 24 — Friday Jul 31, 2026. Allison and Avital. Nature-focused, sunset-obsessed, Salzburg-anchored for Shabbat, then an alpine-lake leg at Zell am See and a Salzkammergut-lakes leg at Gosau. Apartments with kitchens, picnics on rocks, sunsets every single night.',
  whyThisPlan:
    "Land Friday morning in Salzburg, settle in for Shabbat 5 minutes from Chabad. Sunday after Havdalah we move south to Zell am See — alpine-lake anchor for 2 nights, foot of the Schmittenhöhe + Hohe Tauern. Tuesday we move northeast to Gosau (via Bad Ischl) — Salzkammergut-lakes anchor for 2 nights, with Vorderer Gosausee out the door, Hallstatt 20 min away, and the Krippenstein cable car 25 min as a day-trip. Thursday we drive to a quiet apartment near Salzburg airport and return the rental car Thursday night for Friday's early flight. Four bases, three moves. Every night ends at a named sunset spot with a real time.",
  natureAnchor:
    'Two-anchor lakes plan: Zell am See (Pinzgau alpine lake, Schmittenhöhe + Kitzsteinhorn glacier) Sun-Tue, then Gosau (Salzkammergut, Vorderer Gosausee + Hallstatt + Dachstein-Krippenstein cluster) Tue-Thu. The Avital-counter-proposal shape (v4 May 19) — Salzburg → alpine lake → Salzkammergut lakes → airport.',
  // COST-SYNC 2026-05-17 (PriceVerify wave 4n): lodging prices spiked overnight on
  // Booking.com. Master Linzergasse €128→€286/nt (Salzburg pick locked-in even at higher
  // price). Villa Maxglan €178→€456/nt. Haus Edelweiss (primary mountain anchor) SOLD OUT
  // for Jul 26-29 — new mountain pick = Austrian Apartments (Bad Goisern) or Ferienhof Osl,
  // both €160/nt. Airport pick Best Western Walserberg €105→€71/nt (price DROPPED).
  // Standard pick recomputed: keep master Linzergasse (Allison hasn't unlocked it) + swap
  // mountain to Austrian Apartments. Cheapest viable scenario also surfaced in costs.html.
  totalCostEur: 4144, // 2026-06-08: Salzburg held at a €569/2nt placeholder (2 options, not yet decided: Amedeo Zotti $628 / Master Linzergasse $657, all free-cancellation). Bottom-up all-in = ₪16,452 / €4,144 (lodging 6,837 [Salzburg placeholder 2,259 + der Sonnberg 1,977 + Transylvania 2,124 + Best Western 477] + car 1,669 + buffer 214 + acts 1,445 + food 2,580 + flights 3,337 + bag 370). NOTE: options quoted in USD; no USD→EUR rate to convert cleanly, so the €569 placeholder is kept and flagged.
  totalCostNis: 16452, // 2026-06-08: see breakdown above. 3 of 4 bases booked; Salzburg not yet decided (€569 placeholder, 2 options).
  ceilingEur: 3275, // ₪13,000 @ ₪3.97/€1 — Allison's stated total target (NOT updated; this is the target, not the actual)
  peakMoment: {
    day: 'Tuesday Jul 28',
    spot: 'Vorderer Gosausee — Dachstein mirror lake at sunset',
    description:
      "Move day Zell am See → Gosau, ~1h45 via Bad Ischl. We check into Transylvania Villa & Spa in the afternoon and walk straight to the Vorderer Gosausee — one of the most-photographed lakes in Austria. The Dachstein glacier mirrors in the water, the gravel loop is flat and easy, and we get the lake almost to ourselves after the day-tripper buses leave. Lakeside picnic, sunset 20:51. The 'we're really here' moment of the trip — three bases in, the alpine quiet sinks in.",
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
        'Land 07:50 → Salzburg Old Town. Pick from: Mozart Geburtshaus / Mirabell Gardens / café-only if tired. Settled by 17:30 (no Hohensalzburg / no Mondsee — both blow the 17:30 prep ceiling). Full Friday menu lives at friday-salzburg.html. Shabbat prep 17:30, candle-lighting 20:35.',
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
    // REWRITTEN 2026-05-19 — Avital counter-proposal + relaxed-lakes course
    // correction. Old 'Obertraun via Gosausee' narrative archived in git.
    // New plan: Salzburg → Zell am See (2 nights, the alpine-lake anchor).
    {
      id: 'sun-jul-26',
      date: '2026-07-26',
      dayOfWeek: 'Sunday',
      dateLabel: 'Sunday Jul 26',
      headline: 'Havdalah on the road → Zell am See',
      hero: {
        src: IMG.zellAmSee,
        alt: 'Alpine lake town with peaks rising behind — Zell am See on the Pinzgau',
        credit: IMG_CREDIT.zellAmSee,
      },
      generalIdea:
        'Slow Salzburg morning. Pack out after Havdalah / late checkout. Drive south to Zell am See (~90 km, ~1h20 via the Salzach valley B311). Check in at der Sonnberg Alpinlodges — 2 nights here Sun-Tue, the alpine-lake first half of the week. The lodge sits up the hill (Sonnbergstraße 57a), ~1.1 km / ~15-min walk down to the lake & town (uphill back). Self check-in 17:00-18:00. Drop bags, walk down to the Zeller See shore. The lake sits right at the foot of the Schmittenhöhe and the Hohe Tauern peaks — a different feel from the lush Salzkammergut lakes. Lake walk + sunset from the Esplanade promenade. Private sauna + lake-view balcony back at the lodge.',
      planB:
        'If Shabbat tired the legs: skip the lake walk, settle into the apartment for a long balcony afternoon, sunset over the lake from the window.',
      anchors: [
        { label: 'Leave Salzburg', time: '~10:30 (after slow morning)' },
        { label: 'Check in der Sonnberg Alpinlodges', time: '17:00–18:00 (self check-in)' },
        { label: 'Zeller See lake walk', time: '17:00' },
        { label: 'Sunset (Esplanade promenade)', time: '20:53' },
      ],
      driveFrom: {
        place: 'Salzburg',
        minutes: 80,
        mapsUrl: dirUrl('Salzburg, Austria', 'Zell am See, Austria'),
      },
      driveTo: {
        place: 'Zell am See',
        minutes: 80,
        mapsUrl: dirUrl('Salzburg, Austria', 'Zell am See, Austria'),
      },
      sunset: {
        place: 'Zeller See Esplanade promenade',
        time: '20:53',
        mapsUrl: searchUrl('Esplanade Zell am See lakeshore'),
      },
      sleepWhere: 'zell-am-see',
      doingSummary:
        'Move to Zell am See ~1h20. Day options: lakeshore walk / Schmittenhöhe cable car peek / café in town / settle into apartment.',
    },

    // --- DAY 4 — Mon Jul 27 ---
    // REWRITTEN 2026-05-19 — Mon is the FULL DAY at Zell am See. Pick from
    // Schmittenhöhe / Kitzsteinhorn glacier / Kaprun / Krimml waterfalls.
    {
      id: 'mon-jul-27',
      date: '2026-07-27',
      dayOfWeek: 'Monday',
      dateLabel: 'Monday Jul 27',
      headline: 'Full day Zell am See — peaks, glacier, or waterfalls',
      hero: {
        src: IMG.alpineSunset,
        alt: 'High-alpine peaks at golden hour — stock alpine sunset for the Zell am See full day',
        credit: IMG_CREDIT.alpineSunset,
      },
      generalIdea:
        "The full day at the alpine-lake base. Top picks: ride the Schmittenhöhe cable car (1,965 m, panorama deck over the lake) for an easy peak day; OR drive 25 min south to Kaprun and ride the Kitzsteinhorn glacier gondola to 3,029 m (snow + glacier + 360° Hohe Tauern view, even in July); OR commit the full day to the Krimml Waterfalls (~1h10 west, Austria's tallest at 380 m, three-tier walk-up trail). Evening back at Zell — swim from the Strandbad if it's warm, sunset on the Esplanade.",
      planB:
        'Low-energy version: stay in Zell, slow morning, Strandbad swim at the lake lido, café on the Esplanade, sunset right out the door.',
      anchors: [
        { label: 'Cable-car / drive out', time: '~09:00 (depends on pick)' },
        { label: 'Back at Zell apartment', time: '~17:00' },
        { label: 'Sunset (Esplanade)', time: '20:52' },
      ],
      sunset: {
        place: 'Zell am See Esplanade promenade',
        time: '20:52',
        mapsUrl: searchUrl('Esplanade Zell am See lakeshore'),
      },
      sleepWhere: 'zell-am-see',
      doingSummary:
        'Full Zell am See day. Pick from: (1) Schmittenhöhe cable car panorama (easy, half-day). (2) Kitzsteinhorn glacier at Kaprun — 3,029 m, snow in July (25-min drive, half-day). (3) Krimml Waterfalls full-day (1h10 west, 380 m tallest in Austria). (4) Lake swim + Esplanade café slow-day (recovery). Sunset on the Zeller See either way.',
    },

    // --- DAY 5 — Tue Jul 28 ---
    // REWRITTEN 2026-05-19 — move day from Zell am See → Gosau. Old Königssee
    // boat day archived in git; Königssee is now too far for either base and
    // was dropped when the trip structure swung south + east.
    {
      id: 'tue-jul-28',
      date: '2026-07-28',
      dayOfWeek: 'Tuesday',
      dateLabel: 'Tuesday Jul 28',
      headline: 'Move to Gosau — Vorderer Gosausee mirror lake + sunset',
      hero: {
        src: IMG.gosausee,
        alt: 'Vorderer Gosausee with the Dachstein massif reflected in the water',
        credit: IMG_CREDIT.gosausee,
      },
      generalIdea:
        'Slow Zell morning, pack out, drive northeast to Gosau (~100 km, ~1h45 via the Tauern A10 + B166 through Bad Ischl). Stop in Bad Ischl mid-route for a Spar restock + café break. Check in at Transylvania Villa & Spa — 2 nights here Tue-Thu, the lakes-region second half of the week. Full kitchen + Finnish sauna + infrared spa; key-card self check-in 16:00-21:00. Gosau village sits close to the Vorderer Gosausee (~14 min) — one of the most-photographed lakes in Austria, with the Dachstein glacier mirrored in the water. Easy 1-hour gravel loop around the lake before sunset. Lakeside picnic.',
      planB:
        'If the drive tired the legs: skip the lake loop, settle into the apartment for a long balcony afternoon, walk to the Gosausee just for the sunset.',
      anchors: [
        { label: 'Leave Zell am See', time: '~10:00' },
        { label: 'Bad Ischl Spar + coffee', time: '~11:30 (mid-route stop)' },
        { label: 'Check in Transylvania Villa & Spa', time: '16:00–21:00 (key-card check-in)' },
        { label: 'Gosausee loop walk', time: '~1 hr, flat gravel' },
        { label: 'Sunset (Gosausee shore)', time: '20:51' },
      ],
      driveFrom: {
        place: 'Zell am See',
        minutes: 105,
        mapsUrl: dirUrl('Zell am See, Austria', 'Gosau, Austria'),
      },
      driveTo: {
        place: 'Gosau (Dachstein West)',
        minutes: 105,
        mapsUrl: dirUrl('Zell am See, Austria', 'Gosau, Austria'),
      },
      sunset: {
        place: 'Vorderer Gosausee — Dachstein mirror lake',
        time: '20:51',
        mapsUrl: searchUrl('Vorderer Gosausee Dachstein'),
      },
      sleepWhere: 'gosau',
      doingSummary:
        'Move to Gosau ~1h45 (via Bad Ischl). Check in Transylvania Villa & Spa afternoon. Gosausee loop walk + sunset on the mirror lake ~14 min away.',
    },

    // --- DAY 6 — Wed Jul 29 — full day from Gosau base ---
    // REWRITTEN 2026-05-19 — summit overnight DROPPED in v4 restructure.
    // Wed is now the full day at Gosau base — Hallstatt is 15-20 min away
    // and Krippenstein cable car is 25 min away as a DAY TRIP, not an
    // overnight. Old summit-overnight narrative archived in git.
    {
      id: 'wed-jul-29',
      date: '2026-07-29',
      dayOfWeek: 'Wednesday',
      dateLabel: 'Wednesday Jul 29',
      headline: 'Full day from Gosau — Hallstatt, Krippenstein, or deeper Gosausee',
      hero: {
        src: IMG.hallstattLake,
        alt: 'Hallstatt village boathouses along the lake at the foot of alpine slopes',
        credit: IMG_CREDIT.hallstattLake,
      },
      generalIdea:
        'The full day from the Gosau base — and almost everything in the Salzkammergut cluster is <25 min from here. Top picks: drive ~20 min to Hallstatt Markt, ride the Skywalk funicular for the 360° view, walk the lakeside promenade. OR ~25 min to the Dachstein-Krippenstein cable car valley station at Obertraun, gondolas to 2,109 m for the 5 Fingers cantilevered viewing platform (the famous photo). OR go deeper on the Gosausee — walk to the Hinterer Gosausee for the dramatic back-of-valley view (longer day, harder terrain). Sunset back at Vorderer Gosausee or from a Hallstatt viewpoint.',
      planB:
        'Low-energy day: stay near Gosau, slow morning, balcony coffee, a second loop around the Vorderer Gosausee, café in Gosau village, sunset out the door.',
      anchors: [
        { label: 'Day-trip out', time: '~09:30 (depends on pick)' },
        { label: 'Back at Gosau apartment', time: '~17:00' },
        { label: 'Sunset (varies)', time: '20:50' },
      ],
      sunset: {
        place: 'Vorderer Gosausee OR Hallstatt Markt lakeside walkway',
        time: '20:50',
        mapsUrl: searchUrl('Vorderer Gosausee Dachstein'),
      },
      sleepWhere: 'gosau',
      doingSummary:
        'Full day from Gosau base — all the Salzkammergut anchors are <25 min. Pick from: (1) Hallstatt Markt + Skywalk (20 min). (2) Dachstein-Krippenstein 5 Fingers cable car day (25 min). (3) Hinterer Gosausee hike (deeper, harder). (4) Slow recovery day — second Gosausee loop + Gosau café. Sunset on the mirror lake or Hallstatt promenade.',
    },

    // --- DAY 7 — Thu Jul 30 ---
    // REWRITTEN 2026-05-19 — Gosau → SZG airport-side. No more summit
    // descent narrative — that disappeared with the v4 restructure.
    {
      id: 'thu-jul-30',
      date: '2026-07-30',
      dayOfWeek: 'Thursday',
      dateLabel: 'Thursday Jul 30',
      headline: 'Morning Gosau → drive to Salzburg airport-side',
      hero: {
        src: IMG.werfen,
        alt: 'Hohenwerfen castle perched on a rocky crag above the Salzach valley near Werfen',
        credit: IMG_CREDIT.werfen,
      },
      generalIdea:
        "Slow Gosau morning. Optional quick spin to Hallstatt Markt for one last lake-view coffee if you didn't get there Wed. Pack out, drive to the Salzburg airport area (~75 km, ~1h20 via the B166 + A1). Check in at Best Western Hotel am Walserberg (Zollstrasse 4, Wals — ~5 km / ~10 min from SZG, €120.15 — the booked one-night pre-flight pick; 24-hour reception, checkout from 06:00) late afternoon. Open afternoon — pick from: lazy day at the hotel / Mönchsberg ridge sunset from Toscaninihof / Eisriesenwelt ice cave at Werfen if energy is there (the world's largest, 75-min underground tour — BOOK the night before, July sells out). KEEP THE RENTAL CAR overnight — the Alamo booking runs through Fri 31 Jul 06:30, so you drive yourselves to the airport Friday morning and drop it there (no Thursday-night return, no taxi).",
      planB:
        'If Wed was big and you need recovery: drive Gosau → SZG directly, lazy afternoon at the apartment, walk to a nearby café for sunset, in bed early for the 5am wake.',
      anchors: [
        { label: 'Slow morning in Gosau', time: 'until ~10:00' },
        { label: 'Leave Gosau', time: '~10:30' },
        { label: 'Check in Best Western am Walserberg', time: '~13:00' },
        { label: 'Sunset (Mönchsberg or apartment area)', time: '20:47' },
      ],
      driveFrom: {
        place: 'Gosau',
        minutes: 80,
        mapsUrl: dirUrl('Gosau, Austria', 'Salzburg Airport'),
      },
      driveTo: {
        place: 'Salzburg Airport area',
        minutes: 80,
        mapsUrl: dirUrl('Gosau, Austria', 'Salzburg Airport'),
      },
      sunset: {
        place: 'Mönchsberg ridge above Salzburg',
        time: '20:47',
        mapsUrl: searchUrl('Mönchsberg Salzburg'),
      },
      sleepWhere: 'salzburg-airport',
      doingSummary:
        'Drive Gosau → SZG ~1h20. Check in Best Western am Walserberg afternoon. Keep the car for the Friday-morning airport drop. Optional: Mönchsberg sunset / Eisriesenwelt ice cave at Werfen.',
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
        'Early wake at Best Western am Walserberg (checkout available from 06:00). Drive the ~5 km to SZG and drop the Alamo car at the airport at 06:30 (after-hours key-drop — counter opens 08:00). Board LY5194 at 08:55. Lands TLV 13:25 — full Friday afternoon to settle before Shabbat.',
      anchors: [
        { label: 'Wake', time: '05:30' },
        { label: 'Drive to SZG + drop Alamo car at airport', time: '06:30' },
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
      sleepWhere: 'salzburg-airport',
      doingSummary:
        'Drive to SZG + drop Alamo car at airport 06:30 → LY5194 08:55 → land TLV 13:25.',
    },
  ],

  lodgings: [
    {
      // SALZBURG — Fri Jul 24 – Sun Jul 26, 2 nights, Shabbat base.
      // Curated 2026-05-16 by lodging-only agent. All within walking
      // distance of Chabad Salzburg, Linzergasse 76 (Andräviertel).
      // Live Booking.com prices for the actual Jul 24-26 dates, ÷ 2 nights
      // for per-night, EUR computed at ₪3.97/€1.
      //
      // RECONCILED 2026-06-08 (Claude): Salzburg is down to 2 apartment options,
      // NOT yet decided. Food is brought from Israel and cooked in the apartment
      // (NOT meals at Chabad); synagogue Shabbat morning is optional, not a must.
      // That removed the old walkable-vs-home-Shabbat split. Because food is
      // self-cooked, a stovetop is the decider. CANONICAL SOURCE = stay.html.
      //   2 options (all Jul 24-26, 2nt, free cancellation):
      //     Amedeo Zotti     — $628, stovetop kitchen, ~26 min to Chabad
      //     Master Linzergasse — $657, NO stove, best location (~3 min to Chabad)
      // UPDATED 2026-06-08 PM: Villa Salzburg REMOVED (canceled — electronic-only
      // door code, no physical key = a Shabbat dealbreaker). The two remaining
      // options are NOT yet decided — no default pick. The "pick" fields below
      // surface Amedeo Zotti as one of the two open options (not a lean); Master
      // Linzergasse is the other. Salzburg is the ONLY base still being decided —
      // Zell, Gosau, and the airport night are all booked & confirmed.
      baseKey: 'salzburg',
      nights: 'Fri Jul 24 – Sun Jul 26 (2 nights)',
      area: 'Salzburg — 2 apartment options (not yet decided). Food brought from Israel + cooked in the apartment; synagogue (Chabad, Linzer Gasse 76 / IKG, Lasserstraße 8) optional.',
      // 2026-06-08: 2 apartment options, not yet decided — no default pick.
      // Amedeo Zotti ($628, stovetop) and Master Linzergasse ($657, no stove)
      // are the two open options. Full set lives in stay.html #salzburg-picks.
      pickName: 'Amedeo Zotti Residence Salzburg',
      pickFreeCancellation: true,
      pickFreeCancellationUntil: '2026-07-21',
      pickUrl: 'https://www.booking.com/hotel/at/amadeo-zotti-residence-salzburg.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/572731112.jpg?k=04ec0d8cf3406ca879a48a2e609183c06442f2cda4da9d1252268b6fa002fbd8&o=&hp=1',
      pickReview: '8.3 · Very good · 1,808 reviews',
      pickPrice:
        '$628 / 2 nights — 1 of 2 open options (not yet decided). 39m² Schallmoos apartment with stovetop kitchen, partial A/C, physical-key entry, ~26 min to Chabad, near the station. Free cancellation.',
      pickWhy:
        'ONE OF 2 not-yet-decided Salzburg options (no default pick yet). 39m² 1-bedroom apartment with a stovetop kitchen — food is brought from Israel and cooked in the apartment, so a stovetop is the decider, and this option has one. Schallmoos, near the train station, ~26-min walk to Chabad. Partial A/C, physical-key entry (works for Shabbat). Free cancellation. The other open option is Master Linzergasse ($657, no stove, best location ~3 min to Chabad).',
      pickBudgetTier: 'splurge',
      pickPlatform: 'booking',
      pickWalkToChabadMin: 26,
      pickLaundry: 'unknown',
      pickBedrooms: 1,
      pickBeds: '1 queen',
      pickNotableDetails: [
        '1 of 2 open options',
        'Stovetop kitchen',
        'Partial A/C · near station',
        '$628 · can cook',
        'Physical-key entry',
      ],
      pickMaxGuests: 2,
      pickKitchen: 'full',
      pickBath: 'private',
      pickAc: false,
      pickParking: 'paid',
      pickWifi: true,
      pickViewType: 'urban',
      pickAvailability: 'available',
      pickAvailabilityCheckedDate: '2026-06-08',
      pickPhotos: [
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/572731112.jpg?k=04ec0d8cf3406ca879a48a2e609183c06442f2cda4da9d1252268b6fa002fbd8&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/76051577.jpg?k=db51a33732916e3c9e6d5e033885911ee4b37c01dfdcf695aaf2d073aeeec8c4&o=',
      ],
      // === Master Linzergasse — the OTHER open option (no default pick). Was
      // primary May 16-19; kept here as the second of the two live options. ===
      alts: [
        {
          name: 'Master Linzergasse',
          url: 'https://www.booking.com/hotel/at/master-linzergasse.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/474092866.webp?k=a9eb0579f7697c620a3882666545cdbb7bae93ae9281b0247269232ff2abc0d4&o=',
          review: '9.2 · Superb · 2,309 reviews',
          pricePerNight:
            '$657 / 2 nights — best location (~3 min to Chabad), NO stove (fridge + kettle only). Free cancellation.',
          note: 'ONE OF 2 open options (1 of 2) — $657 / 2 nights. Studio apartment ON Linzergasse — same street as Chabad, ~3-min walk to shul. Best location of the two. A/C + elevator. NO stove (fridge + kettle only) — the trade-off against cooking a Shabbat meal. Free cancellation.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 3,
          laundry: 'none',
          bedrooms: 'studio',
          beds: '1 queen',
          notableDetails: [
            '1 of 2 open options',
            'Best location (~3 min to Chabad)',
            'A/C + elevator',
            'No stove (fridge + kettle only)',
          ],
          maxGuests: 2,
          kitchen: 'none',
          bath: 'private',
          ac: true,
          parking: 'paid',
          wifi: true,
          viewType: 'urban',
          availability: 'available',
          availabilityCheckedDate: '2026-06-08',
          freeCancellation: true,
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474092866.jpg?k=986634218fc93628f2d52c8ad8e3a29b81db08747371da66f9d861a5c1d8b08d&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474189965.jpg?k=a1ac6798e4a3719fa5438391411cbdef0a325981cfbc98bfab15e33f982b7c31&o=',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474190876.jpg?k=0bf8d877adad096e225e7a29ecba7563c4954cff4b63fe1915d59ebeb1624df7&o=',
          ],
        },
      ],
    },
    // =====================================================================
    // v4 ACTIVE LODGINGS (2026-05-19 restructure) — Zell am See + Gosau + SZG airport
    // =====================================================================
    // Per Avital's structural counter-proposal (Sun May 17) + Allison's two
    // course corrections (factual-override-with-facts Mon May 18 + relaxed-
    // lakes-radius Tue May 19): the trip restructured to 2nt Salzburg → 2nt
    // Zell am See → 2nt Gosau → 1nt SZG airport. Lodging picks below come
    // from the lodging research pass at
    // `projects/austria-2026/lodging-research-2026-05-19.md`. The old 3-night
    // Obertraun anchor + old 1-night airport block remain below as ARCHIVED
    // (pullable-archives rule) so prior decisions stay visible.

    {
      // ZELL AM SEE — Sun Jul 26 → Tue Jul 28, 2 nights. Main-night base #1.
      // 2 beds mandatory (Allison + Avital are friends, not couple).
      // Verified 2-bed configs only — see lodging-research-2026-05-19.md.
      baseKey: 'zell-am-see',
      nights: 'Sun Jul 26 – Tue Jul 28 (2 nights)',
      area: 'Zell am See town — Pinzgau, foot of the Schmittenhöhe + Hohe Tauern. Apartments with full kitchens, 2-bed configurations verified for Jul 26-28.',
      // BOOKED 2026-06-01, CONFIRMED: Allison locked der Sonnberg Alpinlodges
      // as the Zell base. Real booked rate €498/2nt. Non-chosen alternates
      // removed (chosen-only per the 2026-06-08 reconcile).
      pickName: 'der Sonnberg Alpinlodges (Two-Bedroom)',
      pickFreeCancellation: true,
      pickFreeCancellationUntil: '2026-07-11',
      pickUrl: 'https://www.booking.com/hotel/at/der-sonnberg-alpinlodges.html',
      pickImg:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Zell_am_See_CC.JPG/1280px-Zell_am_See_CC.JPG',
      pickReview: '8.5 · Very good',
      pickPrice:
        '€498 / 2 nights (₪1,977) — "Schönwieskopf" Two-Bedroom apartment, 66m², free cancel until Jul 11, 2026 (pay by bank transfer before arrival)',
      pickWhy:
        'BOOKED. 66m² two-bedroom "Schönwieskopf" apartment (separate bedrooms — Avital-Allison friends-not-couple constraint passes cleanly). Private sauna + lake-view balcony. Kitchenette with fridge + stovetop + dishwasher + kettle/toaster/coffee machine (no oven). Free private parking + self check-in. Sonnbergstraße 57a — up the hill, ~1.1 km / ~15-min walk down to the lake & town (uphill on the way back). Check-in Sun Jul 26 17:00-18:00 (owner-confirmed window); checkout Tue Jul 28 by 10:00. Booking score 8.5. Free cancel until Jul 11; payment by bank transfer before arrival.',
      pickBudgetTier: 'mid-high',
      pickPlatform: 'booking',
      pickVibeTag: 'nature-view',
      pickLaundry: 'unknown',
      pickBedrooms: 2,
      pickBeds: '1 king + 2 twins (separate bedrooms)',
      pickNotableDetails: [
        'BOOKED',
        'TRUE 2-bedroom',
        'Private sauna',
        'Lake-view balcony',
        'Kitchenette (no oven)',
        'Free parking',
        'Self check-in 17:00-18:00',
        '~1.1 km uphill from town',
        'Free cancel until Jul 11',
      ],
      pickMaxGuests: 4,
      pickKitchen: 'kitchenette',
      pickBath: 'private',
      pickAc: false,
      pickParking: 'free',
      pickWifi: true,
      pickViewType: 'lake',
      pickAvailability: 'available',
      pickAvailabilityCheckedDate: '2026-06-01',
      pickPhotos: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Zell_am_See_CC.JPG/1280px-Zell_am_See_CC.JPG',
      ],
      alts: [],
    },

    {
      // GOSAU — Tue Jul 28 → Thu Jul 30, 2 nights. Main-night base #2.
      // 2 separate ROOMS preferred (not just 2 beds). Verified Jul 28-30
      // via broad Salzkammergut lakes-region search 2026-05-19.
      // Avital's URL Landhaus Osborne (Obertraun) REJECTED — only 1-queen
      // Apartment (3) left for the dates = fails 2-bed mandatory.
      baseKey: 'gosau',
      nights: 'Tue Jul 28 – Thu Jul 30 (2 nights)',
      area: 'Gosau village (Dachstein West / Hallstattersee cluster) — next to Vorderer Gosausee, ~20 min to Hallstatt, ~25 min to Krippenstein cable car. 2-bedroom apartments with private kitchens.',
      // BOOKED 2026-06-01, CONFIRMED: Allison locked Transylvania Villa & Spa
      // (Gosau) as the Salzkammergut base (was Der Ulmenhof placeholder €513).
      // Superior Two-Bedroom Apartment with Balcony (entire apartment, sleeps up
      // to 6). Real booked rate €535/2nt (~US$632). Check-in Tue Jul 28
      // 16:00-21:00, check-out Thu Jul 30 by 10:00. Der Ulmenhof demoted to alt.
      pickName: 'Transylvania Villa & Spa (Gosau)',
      pickFreeCancellation: true,
      pickFreeCancellationUntil: '2026-07-13',
      pickUrl: 'https://www.booking.com/hotel/at/transylvania-villa-spa.html',
      pickImg:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
      pickReview: '9.0 · Wonderful',
      pickPrice:
        '~US$632 / 2 nights (€535 booked rate, ₪2,124) — Superior Two-Bedroom Apartment with Balcony, full kitchen with oven, free cancel until Jul 13',
      pickWhy:
        'CONFIRMED. Superior Two-Bedroom Apartment with Balcony — the entire apartment, sleeps up to 6, two separate bedrooms (passes the friends-not-couple constraint). Full kitchen WITH oven (kosher-critical), balcony + patio, mountain/garden views, Finnish sauna + infrared spa, free private parking. Check-in Tue Jul 28 16:00-21:00; check-out Thu Jul 30 by 10:00. ~44 min from Salzburg Airport (SZG); note the apartment is on the 2nd floor, stairs only. Location is excellent for this leg: Hallstatt ~15 min, Vorderer Gosausee ~14 min, Krippenstein / Five Fingers / Dachstein ice cave ~36 min. Free cancel until Jul 13.',
      pickBudgetTier: 'mid-high',
      pickPlatform: 'booking',
      pickVibeTag: 'nature-view',
      pickLaundry: 'unknown',
      pickBedrooms: 2,
      pickBeds: 'Superior Two-Bedroom Apartment (separate bedrooms, sleeps up to 6)',
      pickNotableDetails: [
        'CONFIRMED',
        'Booking 9.0',
        'Superior Two-Bedroom Apartment + balcony',
        'Full kitchen with oven',
        'Balcony + patio · mountain/garden views',
        'Finnish sauna + infrared spa',
        'Free parking',
        'Check-in Tue Jul 28 16:00-21:00 · out Thu Jul 30 by 10:00',
        '~44 min from SZG · 2nd floor, stairs only',
        'Hallstatt 15 min · Gosausee 14 min',
        'Free cancel until Jul 13',
      ],
      pickMaxGuests: 6,
      pickKitchen: 'full',
      pickBath: 'private',
      pickAc: false,
      pickParking: 'free',
      pickWifi: true,
      pickViewType: 'mountain',
      pickAvailability: 'available',
      pickAvailabilityCheckedDate: '2026-06-01',
      pickPhotos: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
      ],
      alts: [],
    },

    {
      // SALZBURG AIRPORT (v4 restructure 2026-05-19) — Thu Jul 30 → Fri Jul 31, 1 night.
      // 1 bed OK (Allison: "shabbat can be one bed and airport but not main nights").
      // Replaces the old airport block (Best Western Walserberg + 5 alts) — all
      // 6 of the original candidates except Hapimag failed the relaxed 8.5 floor;
      // the broad SZG-orbit search surfaced three stronger picks.
      baseKey: 'salzburg-airport',
      nights: 'Thu Jul 30 – Fri Jul 31 (1 night)',
      area: 'Salzburg airport orbit — within 5 km / ~10-min drive of W. A. Mozart airport (SZG) for the Friday 08:55 LY5194 departure. 1 bed OK per the airport-night rule.',
      // 2026-05-19 PM: Allison swapped the recommended pick to Landhaus Grünau
      // ("airport night cheaper is better just one night"). Villa Verde + Gabi
      // demoted to alts. All 3 are gold-stamped, free-cancel — pick is reversible.
      // BOOKED 2026-06-01, CONFIRMED & PAID: Allison locked Best Western Hotel
      // am Walserberg (Wals) as the airport night (was Landhaus Grünau placeholder
      // €176). Standard Twin Room (2 twin beds), 1 night. Real booked rate
      // €120.15/1nt (~US$139). Check-in Thu Jul 30 from 14:00, check-out Fri
      // Jul 31 by 11:00. Free cancellation until Jul 27. Landhaus Grünau demoted to alt.
      pickName: 'Best Western Hotel am Walserberg',
      pickFreeCancellation: true,
      pickFreeCancellationUntil: '2026-07-27',
      pickUrl: 'https://www.booking.com/hotel/at/servus-europa-salzburg-am-walserberg.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283331.jpg?k=0c0451b607312db5f246a14b4dcaea090aa15bc122f5b3f8cfda1d777d217a15&o=&hp=1',
      pickReview: '3.9 · Tripadvisor (motorway noise reports)',
      pickPrice:
        '~US$139 / night (€120.15 booked rate, ₪477) — Standard Twin Room (2 twin beds), Wals next to Salzburg Airport, breakfast buffet included',
      pickWhy:
        'CONFIRMED & PAID. Standard Twin Room (2 twin beds), 1 night — right for one pre-flight night next to Salzburg Airport (SZG), ~5 km / ~10 min away. Check-in Thu Jul 30 from 14:00; check-out Fri Jul 31 by 11:00. 24-hour reception (checkout also available early) — works cleanly for the 08:55 Fri LY5194 departure. Free parking, Finnish sauna/wellness + breakfast buffet. NO in-room kitchen/fridge (fine — last night, no Shabbat). Honest caveat: rating is softer (Tripadvisor 3.9, dinged for motorway noise) — pack earplugs if you sleep light. Free cancellation until Jul 27. One airport night only.',
      pickBudgetTier: 'standard',
      pickPlatform: 'booking',
      pickDriveToAirportMin: 10,
      pickLaundry: 'none',
      pickBedrooms: 1,
      pickBeds: 'Standard Twin Room (2 twin beds)',
      pickNotableDetails: [
        'CONFIRMED & PAID',
        'Standard Twin Room (2 twin beds)',
        'Next to SZG · ~5 km / ~10 min',
        'Check-in Thu Jul 30 from 14:00 · out Fri Jul 31 by 11:00',
        '24-hour reception',
        'Breakfast buffet + sauna',
        'No in-room kitchen/fridge',
        'Free cancel until Jul 27',
        '⚠ Tripadvisor 3.9 · motorway noise',
      ],
      pickMaxGuests: 2,
      pickKitchen: 'none',
      pickBath: 'private',
      pickAc: true,
      pickParking: 'free',
      pickWifi: true,
      pickViewType: 'urban',
      pickAvailability: 'available',
      pickAvailabilityCheckedDate: '2026-06-01',
      pickPhotos: [
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283331.jpg?k=0c0451b607312db5f246a14b4dcaea090aa15bc122f5b3f8cfda1d777d217a15&o=&hp=1',
      ],
      alts: [],
    },

    // =====================================================================
    // ARCHIVED LODGINGS — kept for pull-back (Allison's pullable-archives rule)
    // =====================================================================
    // These two blocks below (the 3-night Obertraun anchor + the original
    // 6-candidate airport block) were ACTIVE through 2026-05-17 and dropped
    // 2026-05-19 when the trip restructured. They remain in TRIP.lodgings
    // so the data structure stays whole and decisions are reviewable, but
    // the active trip pages filter them out via the ACTIVE allowlist in
    // page-trip-summary.ts buildStayCards + page-stay.ts FILTER. To restore
    // either, swap their baseKey back to 'zell-am-see' or 'gosau' or
    // 'salzburg-airport' and remove the matching active block above.

    {
      // OBERTRAUN / HALLSTATT — ARCHIVED 2026-05-19. Sun Jul 26 – Wed Jul 29, 3 nights.
      // The deep-anchor stay. Lake-adjacent, quiet, full apartment.
      // Restructured 2026-05-17: shortened from 4 → 3 nights so Wed night
      // can be the Berghotel Schafbergspitze summit overnight (new base 3
      // of 4). See SUNSET_STAYS[schafbergspitze-stay] for the Wed night.
      // Live Booking.com prices for Jul 26-29, ÷ 3 nights for per-night.
      // ARCHIVED 2026-05-19 — superseded by Zell am See + Gosau split per
      // Avital counter-proposal + Allison's relaxed-lakes correction.
      baseKey: 'hallstatt',
      nights: 'Sun Jul 26 – Wed Jul 29 (3 nights)',
      area: 'Obertraun & Hallstatt-area (Salzkammergut) — full apartments, lake-adjacent, at the foot of the Dachstein',
      pickName: 'Haus Edelweiss (Obertraun)',
      pickFreeCancellation: true,
      pickUrl: 'https://www.booking.com/hotel/at/haus-edelweiss-obertraun.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/506509432.webp?k=29d77bd1dd210a101fa445b3dc5caac41d37ef7b8ac5bd504e28fdd3b59b42f0&o=',
      pickReview: '9.4 · Superb · 258 reviews',
      pickPrice:
        '€142 / night (₪564) — SOLD OUT for Jul 26-29 as of 2026-05-17 (PRICE-VERIFIED: "Check available dates" returned no rooms on Booking live). PRIMARY mountain anchor unavailable — pick alternate.',
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
      // Master-pick photos sourced live from Booking.com 2026-05-17 — 10 real
      // listing shots instead of the carousel() helper that mixed the hero
      // with Wikimedia area photos.
      pickPhotos: [
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/506509432.jpg?k=10c2bf42576ef96c8a14743e4349a0cd6e154fcf2c3ce64a107b8fe66e9cab2e&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/506509650.jpg?k=ee9e0cecd809a6cc515e5e48a9563d5984e45e007115cef357bfbfbe94bbc980&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/506533919.jpg?k=5e1e39dfd10e21cc8efafbee43aee23c75c6b6d76f3dd075f2ae70d7fa1564e1&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/506509603.jpg?k=9c7500f3f51584b2442ea1b7c598ef795ab6a2802d1c925c667f346931a770f1&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/512121245.jpg?k=f5049e965c579b2fc08f99a520dfa96df13f2bb1d0e69268e1f3f881aa0a414c&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/512121251.jpg?k=63041b7d565b4bb84943f6b68dc271fef7e584242778d15340723cd92e14b867&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/512121253.jpg?k=fa9a3fcf8bb07d9468424ec2cc253bd5d85791322029c24c7330fb090742142b&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/512121256.jpg?k=1138c85ca38a151dd7a10362602b7e9fe0d790005c8d6b77ec43855c99a593c3&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/512121260.jpg?k=d8076661e019d5dd3828d15262a1fa0745b1b21ed515bd029ebd3b51f61b386a&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/512121262.jpg?k=edbe4f8801df37a7b66a9538a79e28998f436a15bfea86c73cb9a7bd2e7a5230&o=&hp=1',
      ],
      alts: [
        {
          name: 'Austrian Apartments (Bad Goisern)',
          url: 'https://www.booking.com/hotel/at/austria-apartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/680881702.webp?k=5280eca98f2aeb08f8cda08936a27de206b90945809344c6ce032c9c2f968d02&o=',
          review: '9.5 · Exceptional · 294 reviews',
          pricePerNight:
            '€160 / night (₪636) — PRICE-VERIFIED 2026-05-17: was €136, now €160 (Booking live, €481 / 3 nights)',
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
          pricePerNight:
            '€160 / night (₪636) — PRICE-VERIFIED 2026-05-17: was €136, now €160 (Booking live, €481 / 3 nights)',
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
          pricePerNight:
            '€187 / night (₪743) — PRICE-VERIFIED 2026-05-17: was €156, now €187 (Booking live, €560 / 3 nights)',
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
          name: 'Landhaus Osborne (Obertraun)',
          url: 'https://www.booking.com/hotel/at/landhaus-osborne.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/55717428.webp?k=d49f9c3fd40d5ac080db10edb8608e1eb774d5a55f89ba5d36f11651ae8b1927&o=',
          review: '9.4 · Superb · 200 reviews',
          pricePerNight:
            '€177 / night (₪703) — PRICE-VERIFIED 2026-05-17: was €151, now €177 (Booking live, €531 / 3 nights)',
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
          name: 'Weisses Lamm Holiday Home (Hallstatt)',
          url: 'https://www.booking.com/hotel/at/weisses-lamm.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/186766752.webp?k=268d3b8120e740e18ee5453b9ba40aa5807e79a435351ef6f3a94f77f4e2e722&o=',
          review: '8.2 · Very good · 2,113 reviews',
          pricePerNight:
            '€275 / night (₪1,092) — PRICE-VERIFIED 2026-05-17: was €217, now €275 (Booking live, €825 / 3 nights)',
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

        // === MOUNTAIN-ANCHOR DEEP-SEARCH ADDITIONS 2026-05-17 ===
        // Allison 2026-05-17 06:17: "The mountain anchor we haven't chosen
        // where to sleep yet and I want to really be linked to all places and
        // have them sortable". 8 fresh Salzkammergut apartment finds added
        // alongside the existing Obertraun/Hallstatt/Gosau/Bad Goisern set.
        // All verified live on Booking.com for Jul 26-29: free-cancellation
        // filter (fc=2) + apartment type (ht_id=201) applied to the search.
        // Unit type, bedroom count, kitchen, beds, m², and price-per-night
        // drawn from the live search-result payload. Bad Aussee adds (Martens,
        // Kalss, Meranplatz) widen the base east of Hallstatt — ~25-min drive
        // to Hallstatt itself, longer to Königssee (flagged in note) but
        // inside the Salzkammergut feel. Photos left empty so Wave 4d Photo
        // Deep-Fetch can hydrate later; carousel falls back to `img`.
        {
          name: 'Bürgermeister Chalet (Obertraun)',
          url: 'https://www.booking.com/hotel/at/burgermeister-chalet.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/718932330.webp?k=b425cad7e5964db4dadf0146c5122bf9666176070fb98af651832f65b2e07930&o=',
          review: '9.7 · Exceptional · 24 reviews',
          pricePerNight: '€245 / night (₪974)',
          note: '60m² One-Bedroom chalet-apartment with separate living room + full kitchen + king bed. 9.7 review score — joint-highest in the Mountain-anchor set. Lower review count (24) than Haus Edelweiss but newer listing so reviews skew strong. Chalet style — quieter, more standalone than apartment-in-a-house. Free cancellation.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'forest-cabin',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 extra-large double + sofa (living room)',
          notableDetails: [
            '60m² chalet-style',
            'Separate living room',
            'King bed',
            'Full kitchen',
            '9.7 score',
          ],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Chalet am Sonnenhang (Hallstatt area)',
          url: 'https://www.booking.com/hotel/at/gutl-am-sonnenhang.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/261753282.webp?k=d69fec6d0db011a672d57e58bf20dc6c302012c28d04ce1188c3a583688a009a&o=',
          review: '9.6 · Exceptional · 152 reviews',
          pricePerNight: '€261 / night (₪1,036)',
          note: '37m² apartment on a sunny hillside (Sonnenhang = "sun-slope") near Hallstatt — extra-large double bed, full kitchen, private bath. 9.6 review across 152 reviews — battle-tested character pick. Above the standard cap but flagged for the view-from-balcony vibe and the hillside-not-village setting Avital responds to.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'nature-view',
          beautyPick: true,
          beautyNote:
            'Sunny-hillside chalet with 9.6 score across 152 reviews — the alpine-balcony pick of the area.',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 extra-large double',
          notableDetails: ['Sunny hillside', 'Full kitchen', '152 reviews', '9.6 score'],
          maxGuests: 2,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Apartment Alpenblick (Bad Goisern)',
          url: 'https://www.booking.com/hotel/at/apartment-alpenblick-bad-goisern.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/625364346.webp?k=268fbeb1b31a136b9e1dacca1501a2b5f3c426c07ffc2aa7dc96bb325d1cfbeb&o=',
          review: '9.4 · Superb · 22 reviews',
          pricePerNight: '€120 / night (₪477)',
          note: 'LEAN-tier value find — 34m² One-Bedroom Apartment with separate living room + double + sofa bed in Bad Goisern. Alpenblick = "Alpine view." Cheapest mountain-anchor pick that still clears the 9.0+ bar. Lower review count (22) but uniformly strong. 9.4 score. Free cancellation. The "we spent on Salzburg, save on the mountain" option.',
          budgetTier: 'lean',
          platform: 'booking',
          vibeTag: 'nature-view',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 double + sofa bed (living room)',
          notableDetails: [
            'Cheapest pick in batch',
            'Separate living room',
            'Alpine view',
            '9.4 score',
          ],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Jonas Deluxe Apartment Panoramablick',
          url: 'https://www.booking.com/hotel/at/jonas-appartment.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/358009777.webp?k=9ef2533ee49d18c16ab3095bc7a17b88cc5e3dc63d273ba8d190da7695d06d02&o=',
          review: '9.0 · Superb · 79 reviews',
          pricePerNight: '€175 / night (₪695)',
          note: '35m² Apartment with Balcony — Panoramablick = "panoramic view." 1 large double + sofa bed, full kitchen, private bath. The balcony is the headline — Hallstatt-area panoramic view at €175/n. Free cancellation. Standard-tier value with a view.',
          budgetTier: 'standard',
          platform: 'booking',
          vibeTag: 'nature-view',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 large double + sofa bed',
          notableDetails: ['Panoramic-view balcony', 'Full kitchen', 'Sofa bed', '79 reviews'],
          maxGuests: 3,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Appartementgitti (Hallstatt area)',
          url: 'https://www.booking.com/hotel/at/appartementgitti.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/643263725.webp?k=fac6d14921ede1326474830a93cc40a74770d63cdaffff3136a20e1f39a9836a&o=',
          review: '9.7 · Exceptional · 52 reviews',
          pricePerNight:
            '€256 / night (₪1,016) — PRICE-VERIFIED 2026-05-17: was €286, now €256 (Booking live, €768 / 3 nights)',
          note: '51m² One-Bedroom Apartment with 1 large double bed, private bath. 9.7 review score across 52 reviews. Above the standard cap — splurge tier; surface as "premium clean-apartment pick when budget allows." Free cancellation. Hallstatt-area location.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'in-town',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 large double',
          notableDetails: ['9.7 score', '51m²', 'Splurge tier'],
          maxGuests: 2,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Ferienwohnungen Kalss nahe Altaussee',
          url: 'https://www.booking.com/hotel/at/ferienwohnungen-kalss.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/299447544.webp?k=0bc030fdc0e62a1c824cbad7685ae1b5fb2b1e7fcf70d6ce84aa53ffa433d3b5&o=',
          review: '9.4 · Superb · 423 reviews',
          pricePerNight: '€231 / night (₪917)',
          note: 'TRUE 2-BEDROOM 86m² apartment near Altaussee with full kitchen, 2 large double beds. 423 reviews = the most battle-tested fresh pick in this batch. Altaussee (the lake village east of Bad Aussee) — quieter side of Salzkammergut, ~30-min drive to Hallstatt. Free cancellation. Best big-group pick: sleeps 4 in 2 separate bedrooms.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'lake-edge',
          laundry: 'unknown',
          bedrooms: 2,
          beds: '2 large doubles (2 separate bedrooms)',
          notableDetails: [
            'TRUE 2BR',
            '86m² spacious',
            '423 reviews',
            'Near Altaussee lake',
            'Sleeps 4',
          ],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Ferienwohnung Martens Villa (Bad Aussee)',
          url: 'https://www.booking.com/hotel/at/ferienwohnung-martens-villa.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/478184788.webp?k=8889f9572a5c71e95c9c8352b7cab07fd060ecdfa224ddde3bcbba39856c1834&o=',
          review: '9.6 · Exceptional · 22 reviews',
          pricePerNight: '€185 / night (₪734)',
          note: 'TRUE 2-BEDROOM 70m² apartment in Bad Aussee with separate living room, full kitchen, dishwasher, WASHER (verified), free private parking, terrace + garden + mountain views. 1 extra-large double + 2 sofa beds — sleeps 4. Free cancellation. Best amenity-stack of the batch (dishwasher AND washer AND terrace AND mountain view) and only one verified to have a washer in this set. Bad Aussee = ~25-min drive to Hallstatt, ~2h to Königssee (flagged as edge of day-trip range).',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'nature-view',
          beautyPick: true,
          beautyNote:
            'Villa-style 2BR with garden, terrace, and mountain view — the most equipped fresh pick in the batch (washer + dishwasher verified).',
          laundry: 'washer',
          bedrooms: 2,
          beds: '1 extra-large double + 2 sofa beds',
          notableDetails: [
            'TRUE 2BR',
            'Washer verified',
            'Dishwasher',
            'Terrace + garden',
            'Mountain view',
            'Free parking',
          ],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        {
          name: 'Zentrales Panorama-Apartment am Meranplatz (Bad Aussee)',
          url: 'https://www.booking.com/hotel/at/wohnen-uber-den-dachern-am-meranplatz.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/666207565.webp?k=c0eb4d037523ca069618b35c3c01029e092e2c02c843bbe2be2bcf7a9e926661&o=',
          review: '9.4 · Superb · 17 reviews',
          pricePerNight:
            '€192 / night (₪762) — PRICE-VERIFIED 2026-05-17: was €247, now €192 (Booking live, €576 / 3 nights — listing dropped 22%)',
          note: 'TRUE 2-BEDROOM 85m² apartment "above the rooftops" on Meranplatz in Bad Aussee with balcony + terrace + separate living room. Full kitchen. Sleeps up to 5 (2 singles + 1 extra-large double + 2 sofa beds). Town-centre location with panoramic-rooftop view — the "wake up over a town square in the Alps" pick. Free cancellation. Bad Aussee = ~25-min drive to Hallstatt.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'in-town',
          beautyPick: true,
          beautyNote:
            'Above-the-rooftops 2BR with balcony AND terrace on a Bad Aussee town square — town-centre character + view.',
          laundry: 'unknown',
          bedrooms: 2,
          beds: '2 singles + 1 extra-large double + 2 sofa beds',
          notableDetails: [
            'TRUE 2BR',
            '85m² spacious',
            'Balcony + terrace',
            'Above-rooftops view',
            'Town-centre',
          ],
          maxGuests: 5,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mixed',
          availability: 'available',
          availabilityCheckedDate: '2026-05-17',
          freeCancellation: true,
          photos: [],
        },
        // === UNBELIEVABLE-NATURE-LOCATION ADDS 2026-05-17 ===
        // Beautiful-lodging-hunt v2 specialist pass (Allison: "really
        // unbelievable sleeping locations in terms of natur location").
        // Picks below are character-rich nature stays for the 3-night
        // Mountain anchor (Sun-Wed Jul 26-29). Verified via WebSearch +
        // cross-referenced operator + Tripadvisor data; Booking.com
        // availability flagged 'unverified' because parallel agent held
        // the Playwright browser during the research window — confirm
        // before booking.

        {
          name: 'Naturresort FiSCHERGUT — Lodge Wolfgangthal (St. Wolfgang farm-stay)',
          url: 'https://www.booking.com/hotel/at/fischergut.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
          review:
            '8.6 · Excellent · 108 reviews (live-verified 2026-05-17; was 9.2/93 stored, drifted down 0.6 in real reviews)',
          pricePerNight:
            '€292 / night (₪1,160) — PRICE-VERIFIED 2026-05-17: was €180, now €292 (Booking live, €876 / 3 nights — was 62% understated)',
          note: 'WOW: a modern farm-stay LODGE in the Wolfgangthal valley above St. Wolfgang, surrounded by forest and pastureland. Full apartment with satellite TV, fully equipped kitchen + fridge, private bath, terrace, BBQ, children\'s playground, free parking. Couples rate location 9.3 — "perfect for people who would like to break away from busy weekdays." ~45 min drive to Hallstatt, ~10 min to Wolfgangsee/Schafberg cog. Pairs well with the Wolfgangsee config or as a Mountain-anchor variant. [Photo is St. Wolfgang shoreline — view live listing photos on Booking.]',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'farm-stay',
          beautyPick: true,
          beautyNote:
            'Modern farm-stay lodge in a forested valley above St. Wolfgang — break-from-the-world energy, with BBQ, terrace, and the Schafberg cog 10 minutes away.',
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen + sofa (sleeps 2-4)',
          notableDetails: [
            'Farm-stay lodge',
            'Terrace + BBQ',
            'Full kitchen',
            'Forest + pasture setting',
            '10 min to Schafberg cog',
            'Free parking + playground',
          ],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'unverified',
          availabilityCheckedDate: '2026-05-17',
          availabilityNote:
            'Confirm Jul 26-29 live on Booking.com — Playwright sweep blocked this pass.',
          freeCancellation: true,
          photos: [],
        },
        // === ALLISON URL-QUEUE PICK 2026-05-17 (Allison: "her fav so far") ===
        {
          name: 'Dangos Mountainview Gosau',
          url: 'https://www.booking.com/hotel/at/dangos.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/865965055.webp?k=f977aa15adc80578fdccad30eb5672682d78dc894ced2254d76e5848a9cb02f5&o=',
          review: '9.8 · Exceptional · 132 reviews',
          pricePerNight:
            '€298 / night (₪1,184) — PRICE-VERIFIED 2026-05-17: was €255, now €298 (Booking live, €893 / 3 nights)',
          note: 'ALLISON\'S FAVORITE FROM THE URL QUEUE (submitted 2026-05-17). Modern 2-BR apartment in Gosau village (Kirchenstraße 34a), 65 m² entire-place with 2 king beds (one per bedroom — true Shabbat-separation), full private kitchen, dishwasher, balcony, terrace, garden + mountain + landmark views, washing machine. Highest review score in the entire queue (9.8 / 132 reviews · location 9.7). Free cancellation until June 26, 2026 + pay nothing until June 24. "We have 1 left" at time of check — book early. Trade-off vs Obertraun: Königssee day-trip is ~1h45 from Gosau vs ~1h15 from Obertraun, but Gosausee mirror-lake is on your doorstep (~10 min) and Hallstatt ~50 min. The closest, easiest base for the marquee Gosausee day.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'nature-view',
          beautyPick: true,
          beautyNote:
            "Allison's favorite from the URL queue — 9.8 / 132 reviews, true 2-BR with separate king bedrooms, 65 m² with balcony + terrace facing the Gosau valley.",
          laundry: 'washer',
          bedrooms: 2,
          beds: '2 king beds (1 per bedroom)',
          notableDetails: [
            'TRUE 2-BR Shabbat separation',
            '65 m² with balcony + terrace',
            'Dishwasher + washing machine',
            'Gosau village (Kirchenstraße)',
            "Allison's favorite (URL queue)",
            '"We have 1 left" — book early',
          ],
          maxGuests: 4,
          kitchen: 'full',
          bath: 'private',
          ac: false,
          parking: 'free',
          wifi: true,
          viewType: 'mountain',
          availability: 'limited',
          availabilityCheckedDate: '2026-05-17',
          availabilityNote:
            'Booking showed "We have 1 left" for Jul 26-29 on 2026-05-17 03:59 UTC — bookable but moving fast.',
          freeCancellation: true,
          freeCancellationUntil: '2026-06-26',
          photos: [
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/865965055.jpg?k=f977aa15adc80578fdccad30eb5672682d78dc894ced2254d76e5848a9cb02f5&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/459377301.jpg?k=69c0b7040f8f728e94c3ceb84c0a5dca5d0a8186720aa55ec74e48cf9fca4801&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/865968713.jpg?k=677784f1ced367ab0ad5503eaed074333d7fe087d1798c20da16ae6ab765b06b&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/865968700.jpg?k=9b252c6d2da4f792d44531a9763504f6051c55610dcc28ecf245d51b8e425c22&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/488328546.jpg?k=96fe202458e95d8ed7ac3014769c7ca15e3da5ffc6ebf213954fd17bc2fa2d5c&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/865968669.jpg?k=b89b16cf4878d0d01bf20e2234c91ba573f2f864b6351d9245b89d74016c751b&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/865968793.jpg?k=930a2990b06527a971b7fe8a3634fad4a8bc96ce9bbc7f78239c2ed0c243c1df&o=&hp=1',
            'https://cf.bstatic.com/xdata/images/hotel/max1280x900/488328552.jpg?k=e2e78392507d2a2a8bd2162cd943724866b1e9b2ef604df490a08097fb527204&o=&hp=1',
            ...PHOTO_POOL.gosauValley,
          ],
        },
      ],
    },
    {
      // SALZBURG AIRPORT — ARCHIVED 2026-05-19. Thu Jul 30 – Fri Jul 31, 1 night.
      // Original 6-candidate budget-tier block (Best Western Walserberg pick +
      // 5 alts including soom Capsule, Hey Lou, B&B Salzburg-Nord, Landhotel
      // Berger, Hapimag). Replaced 2026-05-19 by B&B Villa Verde + Hotel Gabi
      // + Landhaus Grünau active block above — all 5 of the original alts
      // except Hapimag failed the relaxed ≥8.5 floor on Booking score.
      // Pullable-archives rule: kept here in case a re-check ever wants any
      // of the budget chains back.
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
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/585968658.jpg?k=c7d214bd1ba98238c62526e870a402b0ae3ab58d9a4df7be7e4873a7eee97efb&o=&hp=1',
      pickReview: '8.1 · Very good · 1,639 reviews',
      pickPrice:
        '€71 / night (₪282) — PRICE-VERIFIED 2026-05-17: was €105, now €71 (Booking live for Jul 30-31 — cheapest non-refundable rate; free-cancel rates start €77)',
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
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/585968658.jpg?k=c7d214bd1ba98238c62526e870a402b0ae3ab58d9a4df7be7e4873a7eee97efb&o=&hp=1',
        ...PHOTO_POOL.salzburgOldTown,
      ),
      alts: [
        {
          name: 'soom Salzburg Capsule Hotel',
          url: 'https://www.booking.com/hotel/at/soom-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/585968658.jpg?k=c7d214bd1ba98238c62526e870a402b0ae3ab58d9a4df7be7e4873a7eee97efb&o=&hp=1',
          review: '8.9 · Excellent · 758 reviews',
          pricePerNight: '€96 / night (₪383)',
          note: 'CHEAPEST + highest-reviewed budget option — 4.5 km from airport. Modern capsule-style sleep pods (Japanese-inspired). 8.9 score across 758 reviews. FLAG: it IS a capsule — sleep pod, not a private room. Surface this so Allison/Avital know what they are booking. Perfect for "just need a clean bed for 5 hours before a 5am flight". Free cancellation. Modern design + clean reviews = nice enough for Allison taste per the directive.',
          budgetTier: 'lean',
          platform: 'booking',
          driveToAirportMin: 8,
          laundry: 'none',
          bedrooms: 'studio',
          beds: '1 capsule pod',
          notableDetails: [
            'CAPSULE POD (not private room)',
            '8.9 score',
            '758 reviews',
            'Modern design',
            'Free cancellation',
          ],
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
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/693757778.jpg?k=ef4b226506ad9dbd1f65bf30fada1bc8f80152e99acd37cf86c8a8d5a72cd563&o=&hp=1',
          review: '8.4 · Very good · 2,119 reviews',
          pricePerNight: '€113 / night (₪451)',
          note: 'Just over the German border in Piding (7.4 km from SZG). 2,119 reviews = extremely battle-tested. Modern small-hotel chain, design-forward, clean+functional. Free cancellation. Drive crosses the border so leave 5-10 extra min buffer for the 5am drive — Schengen so no passport check, just an extra junction.',
          budgetTier: 'lean',
          platform: 'booking',
          driveToAirportMin: 12,
          laundry: 'none',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: [
            'German side of border',
            '2,119 reviews',
            'Modern hotel chain',
            'Free cancellation',
          ],
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
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/745283331.jpg?k=0c0451b607312db5f246a14b4dcaea090aa15bc122f5b3f8cfda1d777d217a15&o=&hp=1',
          review: '8.1 · Very good · 2,496 reviews',
          pricePerNight: '€124 / night (₪496)',
          note: 'B&B Hotels chain (German-owned, ~600 properties). 6.2 km / ~10-min drive to SZG. 2,496 reviews = the most-stayed-at budget option in the airport orbit. Free cancellation. The "I just want chain-level predictability" pick — nothing memorable, but you know exactly what you are getting.',
          budgetTier: 'lean',
          platform: 'booking',
          driveToAirportMin: 10,
          laundry: 'none',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: [
            'B&B Hotels chain',
            '2,496 reviews',
            'Chain predictability',
            'Free cancellation',
          ],
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
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/487668919.jpg?k=871fbd40859af271168ca250fd8b76861be52672d6a5c5f253b1a5d222594d98&o=&hp=1',
          review: '8.4 · Very good · 421 reviews',
          pricePerNight: '€135 / night (₪536) — apartment-with-kitchen room type',
          note: '28m² apartment with kitchen + BREAKFAST INCLUDED. 8km southwest of SZG (12-min drive). Free cancellation, no prepayment. The "if Avital wants self-catering instead of a plain hotel room" pick. Apartment-tier price is higher than the chains above but still budget — kitchen + breakfast is the extra value.',
          budgetTier: 'lean',
          platform: 'booking',
          driveToAirportMin: 12,
          laundry: 'unknown',
          bedrooms: 1,
          beds: '1 queen',
          notableDetails: [
            'Apartment + kitchen',
            'Breakfast included',
            'Free cancellation',
            'No prepayment',
          ],
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
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139217677.jpg?k=ebc0c828c528549905c9c09bbe92ccc4e2a9f32aaf5cfa7c5d2372e7cd7ca11c&o=&hp=1',
          review: '9.4 · Superb · 304 reviews',
          pricePerNight:
            '€442 / night (₪1,755) — PRICE-VERIFIED 2026-05-17: was €320, now €442 (Booking live, €442 / 1 night)',
          note: 'PREVIOUS pick — moved to bench because the budget directive (Allison 2026-05-17 22:33) says cheaper end. Kept here in case the budget chains feel too sterile and you want the full studio-apartment-with-kitchen experience even for one night. 34m² studio, 9.4 score, free cancellation. WARNING: above the budget tier — only book if Allison/Avital explicitly choose to splurge.',
          budgetTier: 'mid-high',
          platform: 'booking',
          driveToAirportMin: 10,
          laundry: 'unknown',
          bedrooms: 'studio',
          beds: '1 queen',
          notableDetails: [
            'ABOVE BUDGET TIER',
            '34m² studio',
            'Full kitchen',
            'Free cancellation',
            'For splurge only',
          ],
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
      wikipedia: 'https://en.wikipedia.org/wiki/Vorderer_Gosausee',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Vorderer Gosausee'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Vorderer Gosausee'),
    },
    sourceUrl: 'https://www.dachstein-salzkammergut.com/en/destinations/lakes/gosausee.html',
    walkFromParkingMin: 5,
    walkFromParkingNote:
      'Lakeside parking (Gosausee-Parkplatz, ~€5/day). 5-min flat walk to the lake edge.',
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
    walkFromParkingNote:
      'Cars park outside the village (P1/P2 lots — €14/day). 10-min flat walk in along the lake. Or drive in 11:30-16:00 only with the special permit.',
    accessibilityNote:
      'Village core is flat lakeside. Some narrow streets + steps to the upper church — skip those for stroller/wheelchair.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Village open year-round, 24/7. Shops typically 09:00-18:00.',
    seasonNote:
      'July = peak season + biggest crowds. Best light at sunset when day-tour buses leave.',
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
    walkFromParkingNote:
      'Free parking at Obertraun valley station. 3-min walk to gondola entrance. Two cable-car sections do the actual climb (no hike).',
    accessibilityNote:
      'Top-station to 5fingers: 20-min flat compacted gravel path, signed barrier-free. Mountain Gym 5fingers viewing-cage has steps — stop at 5fingers platform if needed.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours:
      'Gondola daily 08:40-16:30 in summer (last ascent 15:30). Check live status before going — cloud cover closes the upper section.',
    seasonNote:
      'Summer season mid-May to late-Oct. 5fingers platform itself is year-round if gondola runs.',
    priceEur: 44.5,
    priceNote:
      'Round-trip Panorama Ticket €44.50pp (2025 rate, both gondola sections). Salzkammergut card discount available.',
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
    walkFromParkingNote:
      'Paid parking at Markt St. Wolfgang Schafbergbahn lot. 5-min walk to the cog station. Cog does the 1,000m climb (no hike).',
    accessibilityNote:
      'Cog cars have steep step-up but staff assist. Top-station to terrace = ~10-min mild incline on gravel — walkable for most but not stroller-ideal. Hotel Schafbergspitze terrace fully accessible.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours:
      'Cog runs late-April to late-Oct, daily ~09:00-16:30. Sunset trip = book the last ascent + last descent.',
    seasonNote:
      'Closed Nov-April. Last departure depends on month — verify on schafbergbahn.at before locking sunset plan.',
    priceEur: 51,
    priceNote:
      'Round-trip cog €51pp (2025 adult fare). Reservation €1 extra, strongly recommended for July weekends.',
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
    walkFromParkingNote:
      'Garage P1 (Schafbergbahn lot) or village street parking. 5-min walk to the lakeside promenade.',
    accessibilityNote:
      'Promenade is flat + paved, fully wheelchair/stroller-accessible. Pilgrim Church has a few steps.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours:
      'Village open year-round, 24/7. Strandbad swim area mid-May to mid-Sept ~09:00-19:00.',
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
    walkFromParkingNote:
      'Lakeside village parking (Nußdorf, Unterach, Weyregg — all free or €1/hr). 2-min walk to the water at every esplanade.',
    accessibilityNote: 'All lakeside promenades flat + paved. Bus access throughout the lake ring.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Lake access year-round. Boat services (Attersee-Schifffahrt) May-Oct.',
    seasonNote:
      'Best July-Aug for swim + sunset combo. West-shore villages (Nußdorf, Weyregg) face the sunset.',
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
    walkFromParkingNote:
      'Schönau parking (€5/day, Parkplatz Königssee). 8-min walk past the souvenir lane to the boat dock at the lakehead. From Salet end-dock: 20-min flat walk to Obersee.',
    accessibilityNote:
      'Boats are wheelchair-accessible at Schönau dock (call ahead). Salet → Obersee path is flat compacted gravel — stroller OK, wheelchair OK with help. St. Bartholomä mostly flat.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours:
      'Boats April-Oct, first departure 08:00, last return 17:00 (varies — check seenschifffahrt.de monthly schedule).',
    seasonNote:
      'Closed Nov-March (lake freezes). Peak crowds Jul-Aug — first boat at 08:00 is the quiet option.',
    priceEur: 22.5,
    priceNote:
      'Round-trip boat to Salet €22.50pp (St. Bartholomä-only round-trip €19.50pp). Cash + card accepted.',
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
    walkFromParkingNote:
      'Parkplatz Hintersee (€4/day). 2-min walk to lake edge. Loop trail starts at the parking lot.',
    accessibilityNote:
      'Loop is flat gravel with some tree roots — stroller OK with care, wheelchair OK on the main lakeside section.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Open year-round, 24/7. Restaurant Seeklause (lakeside) seasonal.',
    seasonNote:
      'Late-July glassy water + alpenglow conditions are why photographers come. Calmest at dawn.',
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
    walkFromParkingNote:
      'Parkplatz Almbachklamm in Marktschellenberg (€3/day). 5-min walk past Kugelmühle (marble-mill) to the entrance ticket booth.',
    accessibilityNote:
      'NOT stroller- or wheelchair-friendly past the entrance — narrow plank bridges, steps, wet rock. Sturdy shoes required.',
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
    walkFromParkingNote:
      'Werfen Eishöhlen-Parkplatz (€8/day). 20-min steep uphill walk OR shuttle bus (€8 round-trip) to the cable-car valley station, then 15-min walk from upper station to cave entrance.',
    accessibilityNote:
      'NOT for limited mobility. 1,400 stairs inside the cave; entire route is uphill, slippery ice, narrow passages, ~1.5°C. Wheelchairs/strollers cannot enter. Cave temperature 0°C — fleece + closed shoes mandatory.',
    avitalFitNote: 'may be too strenuous',
    verificationStatus: 'verified',
    openingHours:
      'May 1 to Oct 26 2026, daily 09:00-15:30 last tour. Tours every ~30 min, guided only.',
    seasonNote: 'CLOSED Nov-April. Tour is the only way in — book online to skip queue.',
    priceEur: 38,
    priceNote:
      'Combo ticket €38pp (cable car + tour). Cable-car-only €30pp. Pay cash or card at booth.',
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
    walkFromParkingNote:
      'Parking at the gorge entrance (€3-5/day). 5-min walk down to the ticket booth + start of the gorge boardwalk.',
    accessibilityNote:
      'Not stroller- or wheelchair-accessible. 440 steps on partly grated metal walkways, narrow passages. Sturdy footwear required, no flip-flops.',
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
    walkFromParkingNote:
      'Parkplatz Krimmler Wasserfälle (€7/day). 5-min walk to the lowest viewpoint. Top of falls = ~1h15 uphill on paved zigzag path.',
    accessibilityNote:
      'Lowest viewpoint stroller- + wheelchair-accessible. Upper viewpoints require climbing the paved zigzag (no stairs, but steep). Wheelchair-accessible up to 2nd viewpoint with help.',
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
    walkFromParkingNote:
      'Drive-through experience. Free parking at every viewpoint (Edelweißspitze, Kaiser-Franz-Josefs-Höhe). Short walks (5-15 min) from each pull-off — no hike for the main views.',
    accessibilityNote:
      'All major viewpoints accessible from car parks. Kaiser-Franz-Josefs-Höhe visitor centre has elevator + ramp.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours:
      'Open early-May to late-Oct (snow-dependent). Daily 06:00-19:30 in summer. Pay at toll gate.',
    seasonNote: 'CLOSED Nov-April. Best clear-weather days only — clouds erase the views.',
    priceEur: 46.5,
    priceNote:
      'Day-ticket toll €46.50/car (incl. up to 9 occupants). On top of Austrian vignette. No discounts.',
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
    walkFromParkingNote:
      'Parkplatz Wimbachbrücke (€4/day). 25-min flat forest path to the gorge entrance booth, then timber walkway through.',
    accessibilityNote:
      'Approach path is flat + gravel-firm — stroller OK. Gorge boardwalk itself has steps + narrow sections, NOT wheelchair-friendly.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours:
      'Daily mid-May to mid-Oct, ~09:00-17:00 (booth-hours; trail itself accessible most daylight hours when open).',
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
    walkFromParkingNote:
      'Drive the Bachlalm toll road (€6/car) right up to the car park at the hut. Loop circuit starts from the parking area — no approach walk needed.',
    accessibilityNote:
      'The circuit has roots + uneven sections. Easy hike but not stroller/wheelchair-friendly. Sturdy shoes recommended.',
    avitalFitNote: 'good fit',
    verificationStatus: 'partial',
    openingHours:
      'Toll road open daily mid-May to late-Oct, ~07:00-18:00. Bachlalm hut serves 09:00-17:00.',
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
    walkFromParkingNote:
      'Free parking at the St. Gilgen valley station. 3-min walk to the gondola entrance.',
    accessibilityNote:
      '2022 gondolas barrier-free + spacious. Top station has a 200m paved path to the summit terrace. Steeper trails branch off — stay on the main loop for easy walking.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours:
      'Daily early-May to early-Nov, 09:00-16:30 (last ascent 15:30 / last descent 17:00).',
    seasonNote:
      'Closed Nov-April for summer ops. Sunset trips require advance check — gondola usually stops 17:00.',
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
    sourceUrl:
      'https://wolfgangsee.salzkammergut.at/en/oesterreich-poi/detail/430003408/postalm-hiking-area.html',
    walkFromParkingMin: 0,
    walkFromParkingNote:
      'Pay the Postalmstraße toll (€14/car) at Strobl, then drive 26km up to any of the dozen+ pull-offs. Park + step out at multiple stops.',
    accessibilityNote:
      'Several signed barrier-free paths from the upper pull-offs. Most meadow trails are flat + wide. Strollers OK on the marked easy circuits.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Toll road open daily May-Oct, ~07:00-19:00. Huts seasonal hours.',
    seasonNote: 'Closed Nov-April (toll road shut for snow). Best clear weather days only.',
    priceEur: 14,
    priceNote:
      'Toll €14/car (day-pass, all occupants included). Free walking on the plateau itself.',
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
    sourceUrl:
      'https://www.nationalpark-berchtesgaden.de/english/infopoints/facilities/observation_point/index.htm',
    walkFromParkingMin: 2,
    walkFromParkingNote:
      'Klausbachhaus parking (€4/day) OR free national-park shuttle from Ramsau village. 2-min walk to the Klausbachhaus visitor centre + trailhead.',
    accessibilityNote:
      'Marked barrier-free section through the valley — stroller + wheelchair OK. Suspension bridge access via stairs on one side, ramp on the other.',
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
    walkFromParkingNote:
      'Parking at the Naturpark Weißbach entrance (€3-5/day). 5-min walk to ticket booth + start of gorge.',
    accessibilityNote:
      'NOT stroller- or wheelchair-friendly. 51 wooden footbridges + 373 steps; gripped soles required.',
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
    walkFromParkingNote:
      'Parkplatz Gollinger Wasserfall (€3/day). 10-min walk to the lower waterfall view (forest path, mild incline). Upper viewpoint adds 15 min + stairs. Bluntautal lakes from same parking — 6km flat loop.',
    accessibilityNote:
      'Lower waterfall viewpoint requires uneven forest path + some steps. Bluntautal lakes loop is mostly flat. Neither stroller-ideal but Bluntautal loop is do-able.',
    avitalFitNote: 'mixed — see notes',
    verificationStatus: 'verified',
    openingHours:
      'Waterfall daily April-Oct, ~08:00-18:00. Bluntautal trail year-round (signed seasonal closures).',
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
    walkFromParkingNote:
      'Free village parking at Fuschl am See (or €1/hr at the lakeside lot). 2-min walk to the lake edge + promenade start.',
    accessibilityNote:
      'Lakeside promenade flat + paved, stroller + wheelchair OK. Full circuit (~3h) has gravel + roots in the back-half.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Lake open year-round, 24/7. Strandbad (Fuschl swim area) May-Sept ~09:00-19:00.',
    seasonNote:
      'July = peak swim + SUP season. West-facing sunsets best from the Fuschl village shore.',
    priceEur: 0,
    priceNote:
      'Free lake access. Strandbad day-pass ~€4pp. SUP rental ~€15/hr at Fuschl Aqua-Center.',
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
  // ===================================================================
  // 8 new destinations added 2026-05-17 12:00 from missing-places research
  // doc (projects/budget-app/austria-missing-places-research-2026-05-17.md).
  // All hiddenGem: true. Per Allison "just go till the end" + her ask to
  // surface what she + Avital are missing. NatureRegion enum doesn't have
  // 'salzburg-area' so Salzburg-city + Untersberg get 'berchtesgaden'
  // (geographically adjacent) and Hellbrunn/Kapuzinerberg/Mondsee get
  // 'salzkammergut' (broad regional umbrella).
  // ===================================================================
  {
    id: 'jenner-cable-car',
    name: 'Jenner cable car',
    localName: 'Jennerbahn',
    region: 'berchtesgaden',
    type: 'peak',
    country: 'DE',
    fromSalzburgMin: 45,
    fromHallstattMin: 105,
    sunset: 3,
    bestTime: 'sunset',
    walk: 'walk',
    walkNote:
      'Glass-cabin gondola, 8.5 min to 1,800m. Flat 5-min walk at top to the panorama terrace.',
    pairsWith: ['konigssee', 'hintersee-ramsau'],
    feature: 'Glass-cabin gondola over Königssee + Watzmann — wow-without-effort summit.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Jennerbahn_2019.jpg/1280px-Jennerbahn_2019.jpg',
      alt: 'Jenner cable car glass cabin above the Berchtesgaden valley',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.berchtesgaden.de/en/cable-cars/jennerbahn',
      wikipedia: 'https://en.wikipedia.org/wiki/Jenner_(mountain)',
      mapsFromSalzburg: dirUrl(
        'Salzburg, Austria',
        'Jenner Cable Car, Schönau am Königssee, Germany',
      ),
      mapsFromHallstatt: dirUrl(
        'Obertraun, Austria',
        'Jenner Cable Car, Schönau am Königssee, Germany',
      ),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.berchtesgaden.de/en/cable-cars/jennerbahn',
    walkFromParkingMin: 3,
    walkFromParkingNote: 'Free or paid lot at the valley station, 3-min walk to the gondola.',
    accessibilityNote:
      'Glass cabins are wheelchair accessible. Top platform partly accessible — restaurant + lower terrace yes, summit ridge no.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Daily May-Oct ~08:30-17:00; check operator for July 2026 exact.',
    seasonNote: 'Summer ops May 1 – Nov 1 2026 (typical).',
    priceEur: 32,
    priceNote: '€32 round-trip adult.',
  },
  {
    id: 'untersberg-cable-car',
    name: 'Untersberg cable car',
    localName: 'Untersbergbahn',
    region: 'berchtesgaden',
    type: 'peak',
    country: 'AT',
    fromSalzburgMin: 20,
    fromHallstattMin: 80,
    sunset: 2,
    bestTime: 'golden',
    walk: 'walk',
    walkNote:
      '8.5 min cable car to summit. Flat 30-min walk at top to Salzburger Hochthron viewpoint.',
    pairsWith: ['kapuzinerberg-salzburg', 'hellbrunn-trick-fountains'],
    feature: 'Summit view spanning Salzburg + Berchtesgaden + Chiemsee on a clear day.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Untersberg_Sterneck_Salzburg_3.jpg/1280px-Untersberg_Sterneck_Salzburg_3.jpg',
      alt: 'Untersberg massif rising above the Salzburg valley',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.salzburg.info/en/sights/excursions/cable-car-untersberg',
      wikipedia: 'https://en.wikipedia.org/wiki/Untersberg',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Untersbergbahn, Grödig, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Untersbergbahn, Grödig, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.salzburg.info/en/sights/excursions/cable-car-untersberg',
    walkFromParkingMin: 2,
    walkFromParkingNote:
      'Valley parking at Grödig, 2-min walk to the cable car. Bus 25 from Mirabellplatz also lands here.',
    accessibilityNote:
      'Cable car accessible; summit terrain is rocky alpine, not stroller-friendly.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Daily ~08:30-17:30 in summer.',
    seasonNote: 'Open year-round, peak views July-Sept.',
    priceEur: 30,
    priceNote: '€30 round-trip adult.',
  },
  {
    id: 'langbathsee-ebensee',
    name: 'Vorderer Langbathsee',
    localName: 'Vorderer Langbathsee',
    region: 'salzkammergut',
    type: 'lake',
    country: 'AT',
    fromSalzburgMin: 75,
    fromHallstattMin: 50,
    sunset: 2,
    bestTime: 'golden',
    walk: 'walk',
    walkNote:
      'Flat 1-hour paved loop around the lake. Stroller + wheelchair friendly. Both Langbathseen loop = ~2h.',
    pairsWith: ['almsee-grunau', 'hallstatt-markt'],
    feature: 'Jewel-blue forest lake, swimmable to 25°C, near-empty vs Hallstattersee.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vorderer_Langbathsee_im_August_2018.jpg/1280px-Vorderer_Langbathsee_im_August_2018.jpg',
      alt: 'Vorderer Langbathsee — emerald lake ringed by forest',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official:
        'https://www.salzkammergut.at/en/oesterreich-tour/detail/430001116/walk-around-lakes-langbathsee-at-ebensee.html',
      wikipedia: 'https://de.wikipedia.org/wiki/Langbathseen',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Vorderer Langbathsee, Ebensee, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Vorderer Langbathsee, Ebensee, Austria'),
    },
    hiddenGem: true,
    sourceUrl:
      'https://www.salzkammergut.at/en/oesterreich-tour/detail/430001116/walk-around-lakes-langbathsee-at-ebensee.html',
    walkFromParkingMin: 2,
    walkFromParkingNote: 'Drive-up parking right at the lake. Free.',
    accessibilityNote: 'Paved loop, fully stroller + wheelchair friendly.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Open year-round, 24/7.',
    seasonNote: 'July peak swim. Cold in May/Oct.',
    priceEur: 0,
    priceNote: 'Free lake + parking.',
  },
  {
    id: 'almsee-grunau',
    name: 'Almsee',
    localName: 'Almsee',
    region: 'salzkammergut',
    type: 'lake',
    country: 'AT',
    fromSalzburgMin: 90,
    fromHallstattMin: 60,
    sunset: 3,
    bestTime: 'sunrise',
    walk: 'walk',
    walkNote: 'Flat 1h45 loop around the protected lake. Drive directly to lakeside parking.',
    pairsWith: ['langbathsee-ebensee', 'gosausee'],
    feature:
      'Mirror lake reflecting the Tote Gebirge — pure Avital aesthetic, near-empty even in peak summer.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Almsee_im_Almtal_Gr%C3%BCnau_Ober%C3%B6sterreich_001.jpg/1280px-Almsee_im_Almtal_Gr%C3%BCnau_Ober%C3%B6sterreich_001.jpg',
      alt: 'Almsee mirror lake at dawn with Tote Gebirge reflections',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official:
        'https://www.upperaustria.com/en/oesterreich-tour/detail/100257/walk-to-the-lake-almsee.html',
      wikipedia: 'https://en.wikipedia.org/wiki/Almsee',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Almsee, Grünau im Almtal, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Almsee, Grünau im Almtal, Austria'),
    },
    hiddenGem: true,
    sourceUrl:
      'https://www.upperaustria.com/en/oesterreich-tour/detail/100257/walk-to-the-lake-almsee.html',
    walkFromParkingMin: 1,
    walkFromParkingNote: 'Drive-up lakeside parking. €4-6/day.',
    accessibilityNote: 'Loop is dirt + gravel — stroller-OK if all-terrain, wheelchair partly.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Open year-round.',
    seasonNote: 'Best at sunrise for the mirror — wind picks up after 10am.',
    priceEur: 0,
    priceNote: 'Free lake. Parking ~€4-6/day.',
  },
  {
    id: 'hellbrunn-trick-fountains',
    name: 'Hellbrunn Trick Fountains',
    localName: 'Schloss Hellbrunn Wasserspiele',
    region: 'salzkammergut',
    type: 'village',
    country: 'AT',
    fromSalzburgMin: 20,
    fromHallstattMin: 90,
    sunset: 1,
    bestTime: 'midday',
    walk: 'walk',
    walkNote: '50-min trick-fountain tour + free gardens. Total time ~2-3h.',
    pairsWith: ['untersberg-cable-car', 'kapuzinerberg-salzburg'],
    feature:
      '400-year-old Baroque water-puzzle palace + Sound-of-Music gazebo. Light, playful, you-will-get-wet on purpose.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Hellbrunn_palace_complete.jpg/1280px-Hellbrunn_palace_complete.jpg',
      alt: 'Hellbrunn palace with the trick fountain gardens',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.salzburg.info/en/sights/top10/hellbrunn-palace-trick-fountains',
      wikipedia: 'https://en.wikipedia.org/wiki/Hellbrunn_Palace',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Schloss Hellbrunn, Salzburg, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Schloss Hellbrunn, Salzburg, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.salzburg.info/en/sights/top10/hellbrunn-palace-trick-fountains',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Bus 25 from Mirabellplatz; or drive + park on-site.',
    accessibilityNote:
      'Gardens accessible; trick-fountain tour involves stone paths + intentional water — bring a change of clothes.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Daily Apr-Oct ~09:00-17:30.',
    seasonNote: 'Fountain tour runs Apr-Nov (water turned off in winter).',
    priceEur: 16,
    priceNote: '€16.50 adult — combo ticket includes palace exhibition + fountains.',
    caveat: 'You will get sprayed. Wear quick-dry layers + bring a small towel.',
  },
  {
    id: 'berchtesgaden-salt-mine',
    name: 'Berchtesgaden Salt Mine',
    localName: 'Salzbergwerk Berchtesgaden',
    region: 'berchtesgaden',
    type: 'cave',
    country: 'DE',
    fromSalzburgMin: 50,
    fromHallstattMin: 110,
    sunset: 1,
    bestTime: 'anytime',
    walk: 'walk',
    walkNote: 'Underground train into the mountain + miner-slide + salt-lake ferry. 1.5h tour.',
    pairsWith: ['konigssee', 'jenner-cable-car'],
    feature:
      'Rain-proof, constant 12°C. THE substitute for Hallstatt salt mine (closed summer 2026).',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Salzbergwerk_Berchtesgaden_Einfahrt.jpg/1280px-Salzbergwerk_Berchtesgaden_Einfahrt.jpg',
      alt: 'Entrance to the Berchtesgaden Salt Mine',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.salzbergwerk.de/en',
      wikipedia: 'https://en.wikipedia.org/wiki/Salzbergwerk_Berchtesgaden',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Salzbergwerk Berchtesgaden, Germany'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Salzbergwerk Berchtesgaden, Germany'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.salzbergwerk.de/en',
    walkFromParkingMin: 5,
    walkFromParkingNote:
      'On-site parking + 5-min walk to tour entry. Get protective miner overalls at the start.',
    accessibilityNote:
      'Mine train + boat make most of it accessible; some slides + ramps are not wheelchair-friendly — book the alternative route.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Daily ~09:00-17:00 May-Oct, reduced hours in winter.',
    seasonNote: 'Year-round, 12°C constant — bring a layer.',
    priceEur: 24,
    priceNote: '€24 adult, includes underground transport.',
  },
  {
    id: 'mondsee-basilika-st-michael',
    name: 'Basilika St. Michael, Mondsee',
    localName: 'Basilika St. Michael',
    region: 'salzkammergut',
    type: 'village',
    country: 'AT',
    fromSalzburgMin: 35,
    fromHallstattMin: 65,
    sunset: 1,
    bestTime: 'midday',
    walk: 'walk',
    walkNote:
      '15th-century late-Gothic church. 20-min visit + pair with Mondsee swim/walk for a half-day.',
    pairsWith: ['wolfgangsee'],
    feature: 'The Sound-of-Music wedding-church — Maria + Georg married here on film.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Basilika_zum_hl._Michael_in_Mondsee_-_Sicht_vom_Marktplatz_aus.jpg/1280px-Basilika_zum_hl._Michael_in_Mondsee_-_Sicht_vom_Marktplatz_aus.jpg',
      alt: 'Basilika St. Michael Mondsee from the market square',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official:
        'https://mondsee.salzkammergut.at/en/oesterreich-poi/detail/401362/wedding-church-basilica-st-michael-mondsee.html',
      wikipedia: 'https://en.wikipedia.org/wiki/Mondsee_Abbey',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Basilika St. Michael, Mondsee, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Basilika St. Michael, Mondsee, Austria'),
    },
    hiddenGem: true,
    sourceUrl:
      'https://mondsee.salzkammergut.at/en/oesterreich-poi/detail/401362/wedding-church-basilica-st-michael-mondsee.html',
    walkFromParkingMin: 3,
    walkFromParkingNote: 'Park in Mondsee centre, 3-min walk to the church on the market square.',
    accessibilityNote: 'Church interior accessible via main entrance.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Daily during day; mass times vary.',
    seasonNote: 'Open year-round.',
    priceEur: 0,
    priceNote: 'Free entry. Donations welcome.',
  },
  // 3 more 'immersive get-lost-in-nature, safe + not strenuous' picks
  // (Allison 2026-05-17 12:58: 'we love immersive nature thats safe and not
  // too strenuous'). All flat / easy walks in vast natural settings.
  {
    id: 'wimbachgries-valley',
    name: 'Wimbachgries Valley',
    localName: 'Wimbachgries',
    region: 'berchtesgaden',
    type: 'valley',
    country: 'DE',
    fromSalzburgMin: 55,
    fromHallstattMin: 105,
    sunset: 2,
    bestTime: 'midday',
    walk: 'easy-hike',
    walkNote:
      'Flat 2-hour walk into a vast U-shaped gravel-river valley. Mountains rise on both sides. Wimbachschloss hut (1hr in) is a turn-around point.',
    pairsWith: ['wimbachklamm', 'hintersee-ramsau'],
    feature:
      'Get-lost-in-nature walk: vast silent valley, flat gravel river bed, mountains all around.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Wimbachgries_Watzmann.jpg/1280px-Wimbachgries_Watzmann.jpg',
      alt: 'Wimbachgries valley with the Watzmann massif',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.berchtesgaden.de/en/nature/hiking/wimbachtal',
      wikipedia: 'https://en.wikipedia.org/wiki/Wimbachklamm',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Wimbachbrücke, Ramsau, Germany'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Wimbachbrücke, Ramsau, Germany'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.berchtesgaden.de/en/nature/hiking/wimbachtal',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Park at Wimbachbrücke lot (€5/day), 5-min walk to entry.',
    accessibilityNote: 'Flat gravel paths, mostly stroller-friendly for the first 30 min.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Open year-round. Wimbachschloss hut May-Oct.',
    seasonNote: 'July: wildflowers + cool river breeze.',
    priceEur: 0,
    priceNote: 'Free. Wimbachschloss hut sells food extra.',
  },
  {
    id: 'schwarzensee-wolfgangsee',
    name: 'Schwarzensee',
    localName: 'Schwarzensee',
    region: 'salzkammergut',
    type: 'lake',
    country: 'AT',
    fromSalzburgMin: 55,
    fromHallstattMin: 60,
    sunset: 3,
    bestTime: 'golden',
    walk: 'easy-hike',
    walkNote:
      '50-min gentle uphill hike from St. Wolfgang valley to a small forest-rimmed alpine lake. Silent, often empty even in peak summer.',
    pairsWith: ['wolfgangsee-village', 'kapuzinerberg-salzburg'],
    feature: 'Hidden alpine lake above St. Wolfgang. The get-lost version of the lake-cluster.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Schwarzensee_St._Wolfgang_im_Salzkammergut_3.jpg/1280px-Schwarzensee_St._Wolfgang_im_Salzkammergut_3.jpg',
      alt: 'Schwarzensee — quiet alpine lake above St. Wolfgang',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official:
        'https://www.wolfgangsee.salzkammergut.at/en/oesterreich-tour/detail/430000928/walk-to-the-schwarzensee.html',
      wikipedia: 'https://de.wikipedia.org/wiki/Schwarzensee_(Salzkammergut)',
      mapsFromSalzburg: dirUrl(
        'Salzburg, Austria',
        'Schwarzensee, St. Wolfgang im Salzkammergut, Austria',
      ),
      mapsFromHallstatt: dirUrl(
        'Obertraun, Austria',
        'Schwarzensee, St. Wolfgang im Salzkammergut, Austria',
      ),
    },
    hiddenGem: true,
    sourceUrl:
      'https://www.wolfgangsee.salzkammergut.at/en/oesterreich-tour/detail/430000928/walk-to-the-schwarzensee.html',
    walkFromParkingMin: 50,
    walkFromParkingNote:
      'Park at trailhead (free, signed from St. Wolfgang). 50-min uphill forest path.',
    accessibilityNote:
      'Forest path with roots/rocks — NOT stroller/wheelchair friendly. Easy by hike standards.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Open year-round.',
    seasonNote: 'July: warm enough to dip, much quieter than Wolfgangsee proper.',
    priceEur: 0,
    priceNote: 'Free lake + free trailhead parking.',
  },
  {
    id: 'ramsau-dachstein-almenrunde',
    name: 'Ramsau am Dachstein Almenrunde',
    localName: 'Almenrunde Ramsau',
    region: 'salzkammergut',
    type: 'meadow',
    country: 'AT',
    fromSalzburgMin: 90,
    fromHallstattMin: 65,
    sunset: 2,
    bestTime: 'golden',
    walk: 'easy-hike',
    walkNote:
      '6km flat-ish meadow loop below the south Dachstein wall. Pass working alpine huts, grazing cattle, wildflowers. 2-2.5 hours easy.',
    pairsWith: ['krippenstein-5fingers', 'gosausee'],
    feature:
      'Alpine meadow walking with the Dachstein looming above. Cows + bells + wildflowers + huts. Lost in alpine pasture.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ramsau_am_Dachstein_View.jpg/1280px-Ramsau_am_Dachstein_View.jpg',
      alt: 'Ramsau am Dachstein meadows with the Dachstein wall behind',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://ramsau.com/en/hiking',
      wikipedia: 'https://en.wikipedia.org/wiki/Ramsau_am_Dachstein',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Ramsau am Dachstein, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Ramsau am Dachstein, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://ramsau.com/en/hiking',
    walkFromParkingMin: 5,
    walkFromParkingNote: 'Park at Ramsau village or trailhead lots. Most free.',
    accessibilityNote:
      'Gravel + grass meadow paths — flat overall, NOT paved. Stroller-OK for portions.',
    avitalFitNote: 'good fit',
    verificationStatus: 'verified',
    openingHours: 'Open year-round. Alpine huts May-Oct.',
    seasonNote: 'July prime: cattle on pasture, wildflowers peak.',
    priceEur: 0,
    priceNote: 'Free trails. Hut snacks extra.',
  },
  {
    id: 'kapuzinerberg-salzburg',
    name: 'Kapuzinerberg + Stefan-Zweig-Weg',
    localName: 'Kapuzinerberg',
    region: 'salzkammergut',
    type: 'peak',
    country: 'AT',
    fromSalzburgMin: 0,
    fromHallstattMin: 75,
    sunset: 3,
    bestTime: 'sunset',
    walk: 'easy-hike',
    walkNote:
      '1.5km city-hike up the OTHER hill across the river from Hohensalzburg. 2h round-trip max via Steingasse + Imbergstiege stairs.',
    pairsWith: ['hellbrunn-trick-fountains', 'untersberg-cable-car'],
    feature:
      'Quiet sunset hill opposite Hohensalzburg. Hettwer Bastei viewpoint + Stefan Zweig memorial + golden Old Town panorama.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Salzburg_Kapuzinerberg_Aussicht_01.jpg/1280px-Salzburg_Kapuzinerberg_Aussicht_01.jpg',
      alt: 'Salzburg Old Town panorama from the Kapuzinerberg',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.salzburg.info/en/sights/sights-a-z/kapuzinerberg',
      wikipedia: 'https://en.wikipedia.org/wiki/Kapuzinerberg',
      mapsFromSalzburg: dirUrl('Linzergasse, Salzburg', 'Kapuzinerberg, Salzburg, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Kapuzinerberg, Salzburg, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.salzburg.info/en/sights/sights-a-z/kapuzinerberg',
    walkFromParkingMin: 0,
    walkFromParkingNote:
      'Walkable from any Salzburg city apartment (Linzergasse is 5 min from the trailhead via Steingasse).',
    accessibilityNote: 'Stair climb — NOT stroller / wheelchair friendly. ~250 steps up.',
    avitalFitNote: 'easy walk-friendly',
    verificationStatus: 'verified',
    openingHours: 'Trail open dawn-dusk; Hettwer Bastei viewpoint open year-round.',
    seasonNote: 'Best at golden hour — quietest viewpoint over Salzburg Old Town.',
    priceEur: 0,
    priceNote: 'Free.',
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
    name: 'Wolfgangsee Appartements (Strobl, east end of the lake)',
    url: 'https://www.booking.com/hotel/at/wolfgangsee-appartements.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
    review: '9.5 · Exceptional · 95 reviews',
    pricePerNight:
      '€257 / night (₪1,021) — PRICE-VERIFIED 2026-05-17: was €140, now €257 (Booking live, €771 / 3 nights — was 83% understated)',
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
  // === ARCHIVED — v3 3-night-mountain-anchor configs ===
  // SUPERSEDED 2026-05-19 by Avital's 4-base counter-proposal. The 4 live
  // bases are now Salzburg / Zell am See / Gosau / Salzburg-airport — see
  // V4_CARDS in src/page-bases.ts for the current shape. These configs are
  // kept under a <details>-collapsible archive on bases.html per the
  // pullable-archives rule. Do NOT use as a source of truth for the current
  // trip shape. The 'recommended: true' flag below is historical (v3 era).
  //
  // --- CONFIG A: OBERTRAUN (3-night mountain anchor) [ARCHIVED] ---
  // Restructured 2026-05-17: was a 4-night anchor; now 3 nights Sun-Wed.
  // Wed night is the Lodge am Krippenstein summit overnight (LOCKED across
  // all configs — not optional). Krippenstein cable car runs OUT of Obertraun
  // so Config A has a 5-min drive advantage for Wed-night (vs ~1h40 from
  // Berchtesgaden, ~50 min back from Wolfgangsee). Pivot 2026-05-17 from
  // Schafbergspitze (3.6★ / rude staff) — see krippenstein.html.
  {
    id: 'obertraun',
    label: 'Config A — Obertraun (Salzkammergut)',
    baseTown: 'Obertraun + Hallstatt area',
    country: 'AT',
    nightsAtBase: '3 nights · then Krippenstein Wed',
    recommended: true,
    pitch:
      'The lowest-friction mountain anchor — and post-Krippenstein-pivot it has a unique advantage: the cable car for the Wed summit night LEAVES OUT OF OBERTRAUN. 5-minute drive from your apartment to the valley station vs ~1h40 from Berchtesgaden. One apartment for the 3-night midweek (Sun-Wed), every Salzkammergut anchor (Hallstatt, Gosausee, Krippenstein, Wolfgangsee) is 5-50 minutes away. Königssee is the one stretch — 1h30 day trip from here. 11 apartment options vetted, several with the working-farm + lake-edge vibes. Wed afternoon you pack a small bag, drive 5 min, ride the cable car up to Lodge am Krippenstein (2,063m) for the summit overnight (locked across all configs).',
    pros: [
      'One apartment for the 3-night anchor, no mid-week pack/unpack until Wed',
      'Closest base to Hallstatt + Gosausee + Krippenstein (5-35 min)',
      'Most vetted lodging options (11 picks, all real)',
      'Cheapest overall (lodging baseline)',
      'Ferienhof Osl + Gosau farm-stays = the deepest farm-and-lake immersion options',
      'KRIPPENSTEIN ADVANTAGE: cable car valley station is 5 min from your door — the shortest Wed-night drive of any config (1h35 saved vs Berchtesgaden)',
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
    nightsAtBase: '3 nights · then Krippenstein Wed',
    pitch:
      "Bavarian Alps mountain anchor. 3 nights Sun-Wed. Königssee + Hintersee — the two 🌅🌅🌅 sunset spots — are 10 minutes from base. Almbachklamm gorge is 15 min. The trade-off: Hallstatt + Gosausee become 1h30 day trips, AND the Wed Krippenstein cable car is ~1h40 back across to Obertraun (the longest drive of any config for that). Better kosher-friendly Spar infrastructure (bigger Bavarian supermarkets than Obertraun's small ones). 5 verified apartment options including the lake-side 2-BR Unterbrandnerlehen chalet 5 min from the Königssee shore. Wed afternoon = ~1h40 drive back to Obertraun to ride the Krippenstein cable car for the summit overnight (locked across all configs).",
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
      'Krippenstein 5 Fingers (the Wed-night destination) is 1h40 each way',
      'Furthest drive (~1h40) back to Obertraun for the Wed Krippenstein cable car',
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
    nightsAtBase: '3 nights · then Krippenstein Wed',
    pitch:
      "The middle-of-everything mountain anchor. 3 nights Sun-Wed. Wolfgangsee is roughly equidistant from Hallstatt (55 min), Salzburg (50 min), and Bad Ischl (15 min). The Schafberg cog railway leaves IN the village (great for a day-trip ride). Walk-everywhere village vibe. Trade-offs: Königssee + Hintersee become 1h30+ long-day drives, AND for the Wed summit night you'd drive ~50 min back to Obertraun for the Krippenstein cable car (Config A wins the Wed-night logistics). 5 verified apartment options, all lake-adjacent.",
    pros: [
      'Walk-everywhere village (most options 200-500m from lake shore)',
      'Schafberg cog railway IS in town — great for a half-day cog-up ride (separate from the Wed summit night)',
      'Equidistant to Hallstatt + Salzburg (55 / 50 min)',
      'Lakeside promenade with public lido swim access',
      'Attersee + Wolfgangsee both within 30 min',
    ],
    cons: [
      'Königssee + Hintersee are 1h30+ each way — long-day commitments',
      'Eisriesenwelt ice cave + Werfen castle are 70+ min',
      'Smaller cluster of destinations within 30 min than Obertraun',
      'Less of the "deep nature anchor" feel — more village-y, more touristy in summer',
      'Wed Krippenstein cable car is ~50 min back to Obertraun (vs 5 min from Config A)',
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
//
// COORD FACT-CHECK 2026-05-17 (Map Reliability Specialist): all 13 nature
// pins re-verified against Wikipedia infoboxes + OSM Nominatim. 8 of 13
// were drift-corrected (range 785m to 6.3km off). The previous coord
// table was assembled fast in v1 and several entries pointed at the
// wrong end of a lake, the wrong gorge entry, or a misplaced pass.
// Per-pin source labelled in the trailing comment after each line.
export const NATURE_COORDS: Record<string, LatLng> = {
  // Salzkammergut (Austria)
  gosausee: { lat: 47.5277, lng: 13.5081 }, // Vorderer Gosausee — OSM 2026-05-17 (was 47.5375/13.495 ≈ 1.4km NW into village)
  'hallstatt-markt': { lat: 47.5622, lng: 13.6493 }, // Hallstatt village square — Wikipedia infobox 47.562/13.649
  'krippenstein-5fingers': { lat: 47.5242, lng: 13.692 }, // 5fingers platform — web cross-check 47.524199/13.691955 (was 47.5147 ≈ 1km S of platform)
  schafbergspitze: { lat: 47.77639, lng: 13.43389 }, // Schafberg summit — Wikipedia infobox (was 47.7747/13.4361, ~250m off, refined)
  'wolfgangsee-village': { lat: 47.73833, lng: 13.44806 }, // St. Wolfgang — Wikipedia (was 47.7397/13.4475, ~160m, refined)
  attersee: { lat: 47.88325, lng: 13.52377 }, // Nußdorf am Attersee — OSM (was 47.8467/13.5197 ≈ 4km S into wrong village, MAJOR FIX)
  // Berchtesgaden / Bavarian Alps (Germany)
  konigssee: { lat: 47.588, lng: 12.9888 }, // Königssee Seelände dock at Schönau — OSM (was 47.5536/12.9847 ≈ 3.8km S into middle of lake, MAJOR FIX)
  'hintersee-ramsau': { lat: 47.6065, lng: 12.8537 }, // Hintersee lake — OSM (was 47.6/12.85, ~785m S of lake)
  almbachklamm: { lat: 47.6706, lng: 13.0309 }, // Almbachklamm Kugelmühle entrance — OSM (was 47.7197/13.0464 ≈ 5.6km N near Salzburg, MAJOR FIX)
  // Hohe Tauern / Pongau (Austria)
  'eisriesenwelt-werfen': { lat: 47.50294, lng: 13.19025 }, // Eisriesenwelt ice cave — Wikipedia infobox (was 47.503/13.1894, ~75m, refined)
  liechtensteinklamm: { lat: 47.3128, lng: 13.1893 }, // Liechtensteinklamm gorge — OSM (was 47.3392/13.2178 ≈ 3.7km NE, MAJOR FIX)
  'krimml-waterfalls': { lat: 47.19806, lng: 12.17139 }, // Krimml Waterfalls — Wikipedia infobox (was 47.2056/12.1683 ≈ 870m N)
  'grossglockner-road': { lat: 47.0812, lng: 12.8426 }, // Grossglockner Hochtor pass — OSM + Wikipedia 47.08333/12.84278 (was 47.1342/12.825 ≈ 6.3km N off-pass, MAJOR FIX)
  // 8 newly-researched (2026-05-17 12:00) — coords via Wikipedia/OSM
  'jenner-cable-car': { lat: 47.55706, lng: 12.99917 }, // Jenner valley station Königssee — Wikipedia
  'untersberg-cable-car': { lat: 47.7269, lng: 13.0144 }, // Untersbergbahn Grödig valley station — OSM
  'langbathsee-ebensee': { lat: 47.81639, lng: 13.71028 }, // Vorderer Langbathsee — Wikipedia (47.816389/13.710278)
  'almsee-grunau': { lat: 47.7572, lng: 13.96 }, // Almsee — Wikipedia (47.7572°N, 13.9600°E)
  'hellbrunn-trick-fountains': { lat: 47.7619, lng: 13.0608 }, // Schloss Hellbrunn — Wikipedia
  'berchtesgaden-salt-mine': { lat: 47.6308, lng: 13.0094 }, // Salzbergwerk Berchtesgaden — OSM
  'mondsee-basilika-st-michael': { lat: 47.85694, lng: 13.34556 }, // Basilika St. Michael Mondsee — Wikipedia
  'kapuzinerberg-salzburg': { lat: 47.80194, lng: 13.05222 }, // Kapuzinerberg Salzburg — Wikipedia
  // 3 immersive get-lost picks (2026-05-17 12:58 per Allison)
  'wimbachgries-valley': { lat: 47.60472, lng: 12.92139 },
  'schwarzensee-wolfgangsee': { lat: 47.74333, lng: 13.36667 },
  'ramsau-dachstein-almenrunde': { lat: 47.41028, lng: 13.65417 },
};

// Lodging — keyed by exact pickName / alt.name string. Map agent fills as
// many as could be verified; entries without a coord get filtered out at
// render with a console.warn.
export const LODGING_COORDS: Record<string, LatLng> = {
  // v4 RESTRUCTURE 2026-05-19 — Zell am See + Gosau + B&B Villa Verde
  // active picks. Coordinates are address-derived (Zell am See town
  // center / Gosau village / Salzburg airport orbit).
  // ZELL AM SEE (Sun-Tue, 2 nights)
  'Aparthotel Zell am See': { lat: 47.3252, lng: 12.795 }, // Imbachhornstraße 17, 2.8 km from downtown
  'der Sonnberg Alpinlodges (Two-Bedroom)': { lat: 47.327, lng: 12.799 }, // Sonnbergstraße 57a — hilltop above town
  'Sunny Ferienwohnungen (Deluxe Two-Bedroom)': { lat: 47.326, lng: 12.797 }, // ~2 km from downtown
  'Schönblick Residence Apartments (Two-Bedroom)': { lat: 47.3285, lng: 12.7935 }, // 2.3 km from downtown
  // GOSAU (Tue-Thu, 2 nights)
  'Transylvania Villa & Spa (Gosau)': { lat: 47.5849, lng: 13.5312 }, // Gosau village — BOOKED 2026-06-01
  'Der Ulmenhof (Gosau)': { lat: 47.5856, lng: 13.5286 }, // Gosau village
  'Auszeit Salzkammergut Appartements (Bad Ischl)': { lat: 47.7117, lng: 13.6228 }, // Bad Ischl town center
  // SALZBURG AIRPORT (Thu-Fri, 1 night)
  'Best Western Hotel am Walserberg': { lat: 47.7969, lng: 12.9647 }, // Zollstrasse 4, Wals-Siezenheim — ~5 km from SZG — BOOKED 2026-06-01
  'B&B Villa Verde': { lat: 47.7933, lng: 13.0043 }, // 2.7 km from SZG
  'Hotel Gabi (Wals)': { lat: 47.795, lng: 13.0025 }, // 2.8 km from SZG
  'Landhaus Grünau': { lat: 47.79, lng: 12.99 }, // 3.4 km from SZG
  'Hapimag Ferienwohnungen Salzburg (old town fallback)': { lat: 47.8164, lng: 13.0014 }, // ~5 km from SZG, old town
  // SALZBURG (Shabbat base) — PROVISIONAL lead pick 2026-06-02 (Bergland dropped)
  'master Linzergasse (PROVISIONAL — not locked)': { lat: 47.8049, lng: 13.0476 }, // Linzergasse, Andräviertel — 5-min walk to Chabad (Linzer Gasse 76)
  'Bergland Hotel - Adults only': { lat: 47.8064, lng: 13.0494 }, // Rupertgasse 15, Schallmoos — 4-min walk to Chabad (Linzer Gasse 76)
  'Villa Flöckner Bed & Breakfast': { lat: 47.8113, lng: 13.052 }, // Jahnstraße 13, Elisabeth-Vorstadt
  // --- legacy / archived coords below (kept for pullable archives) ---
  // SALZBURG (Shabbat base) — Linzergasse / Andräviertel / Altstadt / Schallmoos
  'master Linzergasse': { lat: 47.8049, lng: 13.0476 }, // Linzergasse, Andräviertel
  "Junker's Apartments": { lat: 47.8003, lng: 13.0289 }, // ~1.9km from old town
  Sauerweingut: { lat: 47.7972, lng: 13.0339 }, // Aigen / Nonntal direction
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
  'Pension Sydler (Bad Goisern)': { lat: 47.6439, lng: 13.6167 }, // Konrad-Deubler-Gasse 8 (Nominatim verified 2026-05-17)
  'Weisses Lamm Holiday Home (Hallstatt)': { lat: 47.5614, lng: 13.6486 },
  // SUMMIT NIGHT (Wed-Thu) — 5-option menu added 2026-05-17 (Krippenstein demoted from LOCKED to 1-of-5)
  'Lodge am Krippenstein': { lat: 47.5126, lng: 13.6929 }, // Dachstein Krippenstein summit, 2,063m — same valley as Obertraun base
  'Post am See, Traunkirchen': { lat: 47.85, lng: 13.7833 }, // Traunkirchen peninsula on Traunsee
  "Seehotel Brandauer's Villen (Strobl)": { lat: 47.7178, lng: 13.475 }, // East end of Wolfgangsee
  'Scalaria Sunset Wing (St. Wolfgang)': { lat: 47.7375, lng: 13.4444 }, // St. Wolfgang am Wolfgangsee
  // AIRPORT (Thu→Fri pre-flight)
  'Hapimag Ferienwohnungen Salzburg': { lat: 47.8164, lng: 13.0014 }, // ~5km from SZG
  'Landhotel Berger (Ainring, just over the German border)': { lat: 47.8056, lng: 12.9614 },
  'Hotel Astoria': { lat: 47.7963, lng: 13.0257 }, // Maxglaner Hauptstraße 7, Maxglan (Nominatim verified 2026-05-17, was 1.8km off)
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
//
// Jewish-sights ranking added 2026-05-17 by Jewish Sights Ranking Specialist.
// Per Allison: "For jesuh places also do ranking holcausry very important to alkison"
// — Holocaust memorials elevated as a category; Avital "likes Jewish stuff also"
// but heavy memorials (Mauthausen-scale) are "consider, not push."
//
// priority chips:
//   'top'         — zero-detour or category-priority (Holocaust memorial that fits)
//   'recommended' — deliberate but reasonable visit; not in locked itinerary
//   'alternate'   — full-day commitment / requires opt-in / replaces another day
//
// subcategory tags (Jewish-only):
//   'holocaust-memorial'  — Holocaust-commemoration as primary content
//   'living-community'    — active synagogue, current Jewish community site
//   'historical-quarter'  — medieval / pre-Shoah Jewish-history streetscape
//   'cemetery'            — Jewish burial ground
//   'chabad'              — Chabad House (not a sight per se but anchor)
export interface MapPOI {
  id: string;
  name: string;
  description: string;
  category: 'airport' | 'chabad' | 'jewish';
  priority?: 'top' | 'recommended' | 'alternate';
  subcategory?:
    | 'holocaust-memorial'
    | 'living-community'
    | 'historical-quarter'
    | 'cemetery'
    | 'chabad';
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
    description:
      'Optional Shabbat-morning davening (synagogue, not a must). Food is cooked in the apartment. Linzer Gasse 76.',
    category: 'chabad',
    priority: 'top',
    subcategory: 'chabad',
    lat: 47.8047,
    lng: 13.0481,
    link: 'shabbat.html',
  },
  // Jewish sights — ranked + subcategorized 2026-05-17.
  {
    id: 'judengasse',
    name: 'Judengasse (medieval Jewish quarter)',
    description: 'Pre-1404 expulsion Jewish street in the Altstadt. Stolpersteine route start.',
    category: 'jewish',
    priority: 'top',
    subcategory: 'historical-quarter',
    lat: 47.7989,
    lng: 13.0456,
    link: 'jewish-sights.html#judengasse',
  },
  {
    id: 'stolpersteine-linzergasse',
    name: 'Stolpersteine route (Linzergasse + Andräviertel)',
    description:
      'Brass paving-stone memorials for Jews + other Nazi-deportation victims. 519+ stones in Salzburg; the very first was laid on Linzergasse itself in August 2007. Free, walking, no entry.',
    category: 'jewish',
    priority: 'top',
    subcategory: 'holocaust-memorial',
    lat: 47.8045,
    lng: 13.0488,
    link: 'jewish-sights.html#stolpersteine',
  },
  {
    id: 'ikg-salzburg',
    name: 'IKG Salzburg synagogue (Lasserstraße 8)',
    description:
      'Active community synagogue rebuilt post-WWII (orig 1901, destroyed 1938). Kristallnacht memorial sculpture in courtyard.',
    category: 'jewish',
    priority: 'recommended',
    subcategory: 'living-community',
    lat: 47.8061,
    lng: 13.0464,
    link: 'jewish-sights.html#ikg',
  },
  {
    id: 'jewish-cemetery',
    name: 'Jewish cemetery (Aigen, Uferstraße 47)',
    description:
      '1893 cemetery, ~450 graves. Closed by default for security — visits go through IKG office. ~15 min drive from old town.',
    category: 'jewish',
    priority: 'recommended',
    subcategory: 'cemetery',
    // Coord re-verified 2026-05-17 against OSM Nominatim for Uferstraße 47
    // Aigen (was 47.7886/13.0681 ≈ 1.7km NW of actual address — fixed).
    lat: 47.776,
    lng: 13.0791,
    link: 'jewish-sights.html#cemetery',
  },
  {
    id: 'ebensee-memorial',
    name: 'KZ-Gedenkstätte Ebensee (concentration-camp memorial)',
    description:
      'Mauthausen sub-camp memorial in the Salzkammergut. Underground tunnel exhibition (Gedenkstollen) + Zeitgeschichte Museum + cemetery. ~30 km / 30 min from Hallstatt — fits as a Hallstatt-base half/full day. Holocaust-memorial category.',
    category: 'jewish',
    priority: 'recommended',
    subcategory: 'holocaust-memorial',
    // Coord re-verified 2026-05-17 against Wikipedia infobox 47.78750/13.75778
    // (was 47.8073/13.7906 ≈ 3.1km NE of memorial site — fixed).
    lat: 47.7875,
    lng: 13.75778,
    link: 'jewish-sights.html#ebensee',
  },
  {
    id: 'bad-ischl-pins',
    name: 'Bad Ischl — "Pins of Remembrance" + Jewish Ischl walking route',
    description:
      '12 self-guided commemorative pins across Bad Ischl marking Jewish + resistance history. Free, QR-coded, map at tourist office. On the Salzburg ↔ Hallstatt drive. Light-to-medium emotional weight, walkable.',
    category: 'jewish',
    priority: 'recommended',
    subcategory: 'holocaust-memorial',
    // Coord re-verified 2026-05-17 against Wikipedia infobox 47.72028/13.63333
    // (was 47.7108/13.6225 ≈ 1.45km SW of town center — fixed).
    lat: 47.72028,
    lng: 13.63333,
    link: 'jewish-sights.html#bad-ischl',
  },
  {
    id: 'mauthausen',
    name: 'Mauthausen Memorial',
    description:
      'Main KZ Mauthausen memorial, 20 km east of Linz. ~1h45m–2h drive from Salzburg. Free, no booking. 3–4 hr on-site minimum + drive = full heavy day. Opt-in only.',
    category: 'jewish',
    priority: 'alternate',
    subcategory: 'holocaust-memorial',
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

export type SunsetStayStatus = 'bookable' | 'confirm-with-host' | 'skip-too-hard' | 'superseded';

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
      'SUPERSEDED 2026-05-17 — pivoted to Lodge am Krippenstein. Reason: Berghotel Schafbergspitze surfaced as 3.6★ across 1,012 Google reviews with persistent complaints about rude/dismissive staff toward overnight guests, very basic 2-star rooms (no TV, no AC, tiny bathrooms), "soulless" overpriced food, cash only. Lodge am Krippenstein is 9.2/10 across 339 Booking reviews, higher elevation (2,063m vs 1,783m), takes cards, same valley as Obertraun anchor.',
    status: 'superseded',
    bookingNote:
      '⚠️ NO LONGER THE PICK as of 2026-05-17. See "Lodge am Krippenstein" below or krippenstein.html. Historical booking process retained for reference: phone +43 (0) 6138 / 35 42 (office hours 08:30-12:00 + 16:00-20:00 daily), or email via the contact form at schafberg.net.',
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
    elevationM: 2063,
    region: 'dachstein',
    pitch:
      'Sleep on the Dachstein plateau at 2,063m. After the last cable car DOWN at 19:10, the high plateau empties — you have the 5 Fingers cantilevered viewing platform to yourselves for sunset over Hallstättersee, stars, and sunrise. Modern architectural lodge, 9.2★ on Booking (339 reviews).',
    whyInsane:
      'At 2,063m on the Krippenstein plateau (280m HIGHER than Schafberg), the lodge sits 5 min from the Welterbespirale viewpoint and 20 min from the 5 Fingers cantilevered platform. Hallstättersee straight down to the north; Dachstein glacier above to the south. Sunset paints the entire Dachstein massif red. Last cable car DOWN at 19:10 (Jul 2026 schedule) — day-trippers leave, you have the high plateau to yourself. Modern Zirben (Swiss stone pine) beds, free infrared sauna, owner is an ex-Olympic ski coach. Cards accepted (unlike Schafberg). Verified live 2026-05-17: Booking 9.2/339, TripAdvisor 4.0/48 — Booking-heavy review base, both green-lit.',
    pricePerNightEur: '€112-€353 / night (Jul 29-30 2026 live on Booking.com, varies by room)',
    pricePerNightNote:
      'Six room categories: Standard / Komfort / Panorama / Gallery / Panorama Suite / Bunks (dorm). Gallery + Panorama Doubles (designed around the view) are the sweet spot — roughly €220-280/night. Bookable instantly on Booking.com with cards.',
    logistics: [
      {
        label: 'Cable car up',
        value:
          '2 sections from Obertraun valley (Talstation Krippenstein). Section II (top) operates Jul 4-Sep 13, 2026',
      },
      { label: 'First cable car UP', value: '08:40' },
      {
        label: 'Last cable car DOWN',
        value: '19:10 (after this, plateau belongs to overnight guests)',
      },
      { label: 'Walk lodge ↔ top station', value: '2 min' },
      { label: 'Walk lodge ↔ 5 Fingers platform', value: '~20 min easy plateau path' },
      { label: 'Drive from Obertraun apartment', value: '5 min to the valley station' },
    ],
    kosherKit:
      'No in-room kitchen. Restaurant on site (not kosher). Plan: bring sealed dinner + breakfast (or rely on sealed items in the included breakfast spread — call stay@lodge.at to ask what they can isolate). Plus side: only 5 min from your car at the valley station, so worst case you cable-car down to Obertraun for groceries.',
    packList:
      "Overnight bag only (rest stays in the Obertraun apartment — checkout isn't until Thursday morning). Layers (10-15°C cooler at 2,063m even in July). Sealed kosher dinner + breakfast. Headlamp. Camera + power bank. Plateau is exposed — wind shell mandatory.",
    weatherRisk:
      'Cable car closes in thunderstorms. Plateau exposed — lightning risk REAL if storms develop. Check weather morning of, abort if storms forecast 16:00-22:00.',
    verdict:
      'FULL for Jul 29-30 as of 2026-05-18 — no overnight in revised plan. Cable car remains as a day-trip from Gosau (25-min drive). Original concept was "I slept on a mountain" — dissolved when the v4 restructure (2nt Zell am See + 2nt Gosau + 1nt SZG airport) dropped the summit-overnight slot entirely. Lodge stays here as a reference / pullable archive.',
    status: 'superseded',
    bookingNote:
      'NO LONGER THE PICK as of 2026-05-19 — full for Jul 29-30 + summit-overnight slot dropped from the v4 plan. Cable car day-trip from Gosau is the new shape (25-min drive). If a future trip re-enables the overnight, the lodge is bookable at https://www.booking.com/hotel/at/lodge-am-krippenstein.html or direct stay@lodge.at / +43 664 380 405 4.',
    sourceLinks: [
      {
        label: 'Booking.com listing',
        url: 'https://www.booking.com/hotel/at/lodge-am-krippenstein.html',
      },
      { label: 'Official site (lodge.at)', url: 'https://www.lodge.at/en/' },
      { label: 'Lodge contact + rooms', url: 'https://www.lodge.at/en/contact/' },
      {
        label: 'Krippenstein cable car schedule + pricing',
        url: 'https://www.dachstein-salzkammergut.com/en/summer/operation-times-summer',
      },
      {
        label: 'TripAdvisor cross-check (4.0/48 — Booking-heavy review base)',
        url: 'https://www.tripadvisor.com/Hotel_Review-g641766-d1819967-Reviews-Krippenstein_Lodge-Obertraun_Upper_Austria.html',
      },
    ],
  },

  // === WED JUL 29 SUMMIT-NIGHT MENU ADDS 2026-05-17 ===
  // Allison: "I have no time to coordinate this so just put it all in and make
  // it organized and we'll deal with it later." Job is presenting 5 equally-
  // good candidates, NOT recommending. Krippenstein demoted from LOCKED to
  // "1 of 5." Three new entries below + Seehotel am Hallstättersee surfaces
  // in the krippenstein.html comparison table (not added here — it dissolves
  // the summit-night concept, lives as an in-Obertraun upgrade alternative).
  // Notable sold-outs for Jul 29-30: Berghotel Schmittenhöhe + Kempinski
  // Berchtesgaden both booked solid — not added as options.

  {
    id: 'post-am-see-traunkirchen',
    name: 'Post am See, Traunkirchen',
    url: 'https://www.booking.com/hotel/at/post-traunkirchen.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Traunkirchen_-_Panoramablick.JPG/1280px-Traunkirchen_-_Panoramablick.JPG',
    imgCredit: 'Wikimedia Commons',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Traunkirchen_-_Panoramablick.JPG/1280px-Traunkirchen_-_Panoramablick.JPG',
    ],
    elevationM: 0,
    region: 'salzkammergut',
    pitch:
      '4-star Superior on the Traunkirchen peninsula. Infinity pool over the water, Traunstein massif rising directly across the lake. Quiet village, lake-level luxury option for Wed Jul 29.',
    whyInsane:
      'Traunkirchen sits on a wooded peninsula jutting into the Traunsee. Post am See is a 4-star Superior with a glass-edged infinity pool that hangs out over the lake — at sunset the pool surface, the lake, and the sky merge. The Traunstein massif (1,691m) rises straight up from the opposite shore, so you have a wall of mountain across the water from your room. Highest Booking score in the 5-option set (9.3/10 across 1,054 reviews). Quietest of the 5 locations — Traunkirchen is a tiny village, not a tourist town.',
    pricePerNightEur: '€409 / night (Jul 29-30 2026 live on Booking.com, 2 adults)',
    pricePerNightNote:
      'Most expensive of the 5 options. 4-star Superior, infinity pool included. Free-cancellation rate usually available on Booking.com — confirm at booking.',
    logistics: [
      { label: 'Drive from Obertraun apartment', value: '~70 min via B145' },
      { label: 'Drive from Salzburg airport (Thu morning)', value: '~1h 15 min via A1' },
      { label: 'Address', value: 'Ortsplatz 5, 4801 Traunkirchen, Austria (to confirm exact)' },
      { label: 'Star rating', value: '4-star Superior' },
      { label: 'Check-in / check-out times', value: 'to confirm at booking' },
    ],
    kosherKit:
      'BYO sealed dinner + breakfast — same kit as the other 4 options. Restaurant on site is not kosher. 4-star hotel, no in-room kitchen — pack ready-to-eat sealed items.',
    packList:
      'Overnight bag only (rest stays in Obertraun apartment — checkout Thursday). Sealed kosher dinner + breakfast. Swimsuit for the infinity pool. Camera + power bank. Lake-level so no extra layers needed.',
    weatherRisk:
      'Lake-level 4-star hotel, no weather sensitivity. Drive on B145 is well-maintained, no mountain passes.',
    verdict:
      'LUXURY-LAKE PICK — one of 5 equally-good options for Wed Jul 29. Pick this one if you want the most polished property on the most dramatic lake-and-mountain setting + an infinity pool. Trade-off: most expensive (€409), longest drive from Obertraun (70 min), dissolves the "summit" concept in favor of "luxury lake retreat." Pick when ready — all 5 verified available 2026-05-17.',
    status: 'bookable',
    bookingNote:
      'Bookable on Booking.com — https://www.booking.com/hotel/at/post-traunkirchen.html — free-cancellation rate usually available. No need to lock today — one of 5 candidates.',
    sourceLinks: [
      {
        label: 'Booking.com listing',
        url: 'https://www.booking.com/hotel/at/post-traunkirchen.html',
      },
    ],
  },

  {
    id: 'brandauers-villen-strobl',
    name: "Seehotel Brandauer's Villen (Strobl)",
    url: 'https://www.booking.com/hotel/at/brandauersvillen.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
    imgCredit: 'Wikimedia Commons',
    photos: PHOTO_POOL.strobl,
    elevationM: 0,
    region: 'wolfgangsee',
    pitch:
      'Boutique restored historic villas on the Wolfgangsee shore at Strobl. Schafberg view across the water + closest of the 5 options to SZG airport for the Thu morning hand-off.',
    whyInsane:
      'Two historic lakeside villas at the east end of the Wolfgangsee, restored as a small boutique property (9.2/10 across 558 Booking reviews). Schafberg rises across the water — so you sleep at lake-level with the same mountain you would have slept ON under the original plan visible from your window. Small property (limited rooms) gives intimate feel vs. resort. Of the 5 options it is also the closest to Salzburg airport (~55 min for Thu morning), which trims the airport-day drive.',
    pricePerNightEur: '€314-€397 / night (Jul 29-30 2026 live on Booking.com, 2 adults)',
    pricePerNightNote:
      'Small property — availability windows can be thin. Free-cancellation rate usually available on Booking.com. Verify exact rate + room type at booking.',
    logistics: [
      { label: 'Drive from Obertraun apartment', value: '~55 min via B158' },
      { label: 'Drive from Salzburg airport (Thu morning)', value: '~55 min — closest of the 5' },
      { label: 'Address', value: 'Strobl, east end of Wolfgangsee (to confirm exact)' },
      { label: 'Star rating', value: 'Boutique 4-star equivalent' },
      { label: 'Property size', value: 'Small — restored historic villas, thin availability' },
    ],
    kosherKit:
      'BYO sealed dinner + breakfast — same kit as the other 4 options. Restaurant on site is not kosher. Strobl has a Spar in the village for last-minute groceries (5-min drive).',
    packList:
      'Overnight bag only. Sealed kosher dinner + breakfast. Swimsuit (lake swimming from the property shore). Camera. Lake-level so no extra layers.',
    weatherRisk:
      'Lake-level boutique hotel, no weather sensitivity. Drive on B158 is well-maintained.',
    verdict:
      'LAKE-VILLA PICK — one of 5 equally-good options for Wed Jul 29. Pick this one if you want lake-level boutique with the Schafberg view across the water + the easiest Thu morning airport hand-off (~55 min vs 70-75 min for the others). Trade-off: small property = thin availability, dissolves the summit concept. Pick when ready — all 5 verified available 2026-05-17.',
    status: 'bookable',
    bookingNote:
      'Bookable on Booking.com — https://www.booking.com/hotel/at/brandauersvillen.html — free-cancellation rate usually available. Small property so confirm room type. No need to lock today — one of 5 candidates.',
    sourceLinks: [
      {
        label: 'Booking.com listing',
        url: 'https://www.booking.com/hotel/at/brandauersvillen.html',
      },
    ],
  },

  {
    id: 'scalaria-sunset-wing',
    name: 'Scalaria Sunset Wing (St. Wolfgang)',
    url: 'https://www.booking.com/hotel/at/sunset-wing-club.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
    imgCredit: 'Wikimedia Commons',
    photos: PHOTO_POOL.stWolfgang,
    elevationM: 0,
    region: 'wolfgangsee',
    pitch:
      'Literally named for the Wolfgangsee evening light. West-facing lakefront wing of the Scalaria event-resort complex, adults-oriented, 4-star, on the St. Wolfgang shore.',
    whyInsane:
      'The Sunset Wing is the adults-oriented lakefront wing of the larger Scalaria complex at St. Wolfgang. West-facing rooms catch the full Wolfgangsee sunset over the lake — the name is literal, not marketing. 9.0/10 across 1,260 Booking reviews (largest review base of the 5 options). Schafberg cog railway is in the same village (you can still ride it as a day trip Wed afternoon before checking in here). 4-star comfort, real lakefront, but you accept being part of a larger event-resort property.',
    pricePerNightEur: '€352-€391 / night (Jul 29-30 2026 live on Booking.com, 2 adults)',
    pricePerNightNote:
      'Mid-range of the 5 options. Free-cancellation rate usually available on Booking.com. Confirm Sunset Wing specifically (not the main Scalaria building) at booking — west-facing lake-view rooms are the reason.',
    logistics: [
      { label: 'Drive from Obertraun apartment', value: '~75 min via B158' },
      {
        label: 'Drive from Salzburg airport (Thu morning)',
        value: '~50 min via Wolfgangsee Bundesstraße',
      },
      { label: 'Address', value: 'St. Wolfgang am Wolfgangsee (to confirm exact)' },
      { label: 'Star rating', value: '4-star' },
      {
        label: 'Property feel',
        value: 'Adults-oriented wing of larger Scalaria event-resort complex',
      },
    ],
    kosherKit:
      'BYO sealed dinner + breakfast — same kit as the other 4 options. Restaurants on the Scalaria complex are not kosher. St. Wolfgang has a Spar in the village for last-minute groceries.',
    packList:
      'Overnight bag only. Sealed kosher dinner + breakfast. Swimsuit. Camera (sunset is the point — pack the tripod). Lake-level so no extra layers.',
    weatherRisk:
      'Lake-level resort, no weather sensitivity. Drive on B158 is well-maintained. Cloud cover at sunset is the only thing that diminishes the concept.',
    verdict:
      'WEST-FACING SUNSET PICK — one of 5 equally-good options for Wed Jul 29. Pick this one if you want a property literally engineered around catching the Wolfgangsee evening light + the largest review base for confidence (1,260 reviews). Trade-off: part of a larger event-resort complex — can feel busy in peak summer, not intimate. Pick when ready — all 5 verified available 2026-05-17.',
    status: 'bookable',
    bookingNote:
      'Bookable on Booking.com — https://www.booking.com/hotel/at/sunset-wing-club.html — free-cancellation rate usually available. Confirm Sunset Wing specifically (west-facing lake-view rooms). No need to lock today — one of 5 candidates.',
    sourceLinks: [
      {
        label: 'Booking.com listing',
        url: 'https://www.booking.com/hotel/at/sunset-wing-club.html',
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
  // === UNBELIEVABLE-NATURE-LOCATION ADDS 2026-05-17 ===
  // Beautiful-lodging-hunt v2 specialist pass (Allison: "really unbelievable
  // sleeping locations in terms of natur location"). Picks below are 1-night
  // unique-experience nature stays for swap into any midweek slot — each one
  // is the kind of place where the building IS the story (alpine pasture log
  // lodge / solid-wood naturchalet on the lake / 150m² historic wooden chalet
  // in a high mountain valley). Free cancellation verified on Booking.com for
  // all three; live Jul 26-29 availability flagged 'confirm-with-host' because
  // parallel agent held the Playwright browser this pass.

  {
    id: 'postalm-lodge-lienbachhof',
    name: 'Postalm Lodge Lienbachhof (high alpine pasture)',
    url: 'https://www.lienbachhof.at/',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
    imgCredit: 'Wikimedia Commons',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Schafberg_Panorama_Attersee_Mondsee.jpg/1280px-Schafberg_Panorama_Attersee_Mondsee.jpg',
    ],
    elevationM: 1150,
    region: 'wolfgangsee',
    pitch:
      'Sleep on the second-largest high plateau in Europe — wooden log lodge at 1,150 m on the Postalm pasture, drive-up access, panoramic terrace, sleeps 2-4 from €98/night.',
    whyInsane:
      'The Postalm is Austria\'s largest contiguous alpine pasture and the second-largest high plateau in Europe — 38 km² of meadows, wooden hütten, grazing cattle, no cell towers in your sightline. Lienbachhof is a "bright, friendly, hearty, very cozy" 40m² wooden lodge with 2 bedrooms, kitchen, terrace, and a wraparound view of the pasture. The road is open in summer, 30 on-site parking spots, you drive up with groceries. Unlike Schafberg or Krippenstein this is not a hike-or-cog summit — you can leave and return at will. €98/night is the cheapest unique-experience nature stay in this entire set. The wow is the PLACE, not the building polish.',
    pricePerNightEur: '€98 / night + €3 city tax (breakfast packages on request)',
    pricePerNightNote:
      'Direct booking only (no Booking.com listing). Phone +43 6137 6061, email postalm.lienbachhof@aon.at, or website lienbachhof.at.',
    logistics: [
      { label: 'Drive from Obertraun apartment', value: '~1h via B166 + Postalmstraße toll road' },
      { label: 'Drive from Strobl (Wolfgangsee)', value: '~25 min via Postalmstraße' },
      { label: 'Drive from Salzburg airport', value: '~1h 15 min' },
      { label: 'Postalm toll road', value: 'Open May-Oct, ~€15/car (verify before driving up)' },
      { label: 'Parking', value: '30 spots on-site, free for guests' },
      { label: 'Cell signal', value: 'Patchy — bring offline maps' },
    ],
    kosherKit:
      'Full kitchen in the unit. Cook from Strobl Spar before driving up (~25 min away — last shop). On-site restaurant exists but is not kosher; you self-cater. The plateau location means committing to your provisions — no last-minute runs.',
    packList:
      'Overnight bag, groceries (no shop on the plateau), warm jacket (1150 m is 7-10°C colder than valley at night), camera, offline map. Sunrise here over the Tennengebirge is unbelievable — pack the tripod.',
    weatherRisk:
      'Postalm road can close briefly in heavy storms or early snow; in mid-July risk is minimal but check before driving up. Cell signal patchy.',
    verdict:
      'PASTURE-PLATEAU PICK — the most "out there" of the unique-experience set without requiring a cog or cable car. Best if you want to swap one Mountain-anchor night for a stay surrounded by 38 km² of working pasture. €98/night = lowest barrier of all SUNSET_STAYS picks.',
    status: 'confirm-with-host',
    bookingNote:
      'Direct booking ONLY — call +43 6137 6061 or email postalm.lienbachhof@aon.at. Specify Jul 2026 dates, 2-4 adults, request the Lodge unit. Confirm cancellation terms in writing before paying deposit (no standard free-cancellation guarantee — Austrian standard terms apply).',
    sourceLinks: [
      { label: 'Operator site (lienbachhof.at)', url: 'https://www.lienbachhof.at/' },
      {
        label: 'Wolfgangsee tourism listing',
        url: 'https://wolfgangsee.salzkammergut.at/en/oesterreich-unterkunft/detail/103184/postalm-lodge-lienbachhof.html',
      },
      {
        label: 'About the Postalm plateau',
        url: 'https://wolfgangsee.salzkammergut.at/en/oesterreich-poi/detail/430003408/postalm-hiking-area.html',
      },
    ],
  },
];

// =====================================================================
// Derived: total bookable lodging listings shown by the stay page
// =====================================================================
// Computed at build time so TLDR copy ("X apartments across the 4 trip
// bases") can never drift from reality. Counts:
//   - TRIP.lodgings: 1 pickEntry + N alts per base × 3 bases (Salzburg,
//     Hallstatt/Obertraun, Airport)
//   - BASE_CONFIGS for `berchtesgaden` + `wolfgangsee` — the alternate
//     mountain anchors that page-stay surfaces alongside the canonical 4
//   - Subtract anything explicitly flagged sold-out (filter hides these).
//
// Integration glue, 2026-05-17: replaces five drift-prone hard-coded
// strings ("22+", "25+", "36 vetted", "36 listings", "54 listings").
// page-stay.ts can also recompute live from buildListings(), but the
// number quoted in the TLDR string and footer ships at build via the
// data-bind="available-count" hook in page-stay.ts.
function countAvailableLodgings(): number {
  let n = 0;
  for (const l of TRIP.lodgings) {
    if ((l.pickAvailability ?? 'unverified') !== 'sold-out') n += 1;
    for (const a of l.alts) {
      if ((a.availability ?? 'unverified') !== 'sold-out') n += 1;
    }
  }
  for (const cfg of BASE_CONFIGS) {
    if (cfg.id !== 'berchtesgaden' && cfg.id !== 'wolfgangsee') continue;
    for (const p of cfg.lodging) {
      if ((p.availability ?? 'unverified') !== 'sold-out') n += 1;
    }
  }
  return n;
}
export const AVAILABLE_LODGING_COUNT: number = countAvailableLodgings();
