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
  sleepWhere: 'salzburg' | 'hallstatt' | 'schafbergspitze' | 'lodge-am-krippenstein' | 'airport';
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
  // COST-SYNC 2026-05-17 (PriceVerify wave 4n): lodging prices spiked overnight on
  // Booking.com. Master Linzergasse €128→€286/nt (Salzburg pick locked-in even at higher
  // price). Villa Maxglan €178→€456/nt. Haus Edelweiss (primary mountain anchor) SOLD OUT
  // for Jul 26-29 — new mountain pick = Austrian Apartments (Bad Goisern) or Ferienhof Osl,
  // both €160/nt. Airport pick Best Western Walserberg €105→€71/nt (price DROPPED).
  // Standard pick recomputed: keep master Linzergasse (Allison hasn't unlocked it) + swap
  // mountain to Austrian Apartments. Cheapest viable scenario also surfaced in costs.html.
  totalCostEur: 3686, // was 3330; +€356 from lodging spike
  totalCostNis: 14620, // was 13209; +₪1,411 from lodging spike
  ceilingEur: 3275, // ₪13,000 @ ₪3.97/€1 — Allison's stated total target (NOT updated; this is the target, not the actual)
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
        "Land 07:50 → Salzburg Old Town. Pick from: Mozart Geburtshaus / Mirabell Gardens / café-only if tired. Settled by 17:30 (no Hohensalzburg / no Mondsee — both blow the 17:30 prep ceiling). Full Friday menu lives at friday-salzburg.html. Shabbat prep 17:30, candle-lighting 20:35.",
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
        'Pack out of Salzburg after a slow morning. Drive east via Bad Ischl (Spar restock). Stop at Vorderer Gosausee — a flat hour-long loop around the lake with the Dachstein glacier mirrored in the water. Lakeside picnic. Continue to the Obertraun apartment — 3 nights here Sun-Wed, the deep mountain anchor for the midweek (Wed-night base shifts UP to Lodge am Krippenstein at 2,063m via the cable car right out of Obertraun). Sunset over Lake Hallstatt from the Obertraun dock, 5 minutes from the door.',
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
        'Pick from 4 fully-built shapes for this day — each is a complete combo, not just a name. Tap any to jump to its detail page. (1) Krippenstein 5fingers + Hallstatt evening (recommended above — gondolas up, photo-platform, lake town golden hour). (2) Königssee boat + Hintersee sunset (full-day Berchtesgaden — save for Tue if you want pacing). (3) Werfen ice cave (1,400 stairs, 0°C — flagged strenuous, see avitalFit; whole-day commitment). (4) SUP / lake swim at Hallstättersee Strandbad (low-key recovery day if Sun moved you too much). Or invent your own with the activities + nature menus.',
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
        'Pick from 5 fully-built shapes — each is a complete combo. (1) Königssee electric boat + St. Bartholomä + Obersee walk + golden-hour return (recommended above — the trip peak). (2) Krimml waterfalls full-day (1h45 drive, 380m falls, top section flagged mixed-fit). (3) Liechtensteinklamm gorge (1hr drive, dramatic narrow gorge walk, ~1.5hr). (4) Lake-swim day at Hallstättersee Strandbad + SUP rental + slow shore reading (recovery if Mon was big). (5) Schafberg "practice ride" cog up-and-back — not the summit night, just a day taste (skip if doing the full overnight Wed). Mix and match via activities + nature menus.',
    },

    // --- DAY 6 — Wed Jul 29 — KRIPPENSTEIN SUMMIT NIGHT ---
    // Restructured 2026-05-17 (Schafbergspitze pivot): originally planned
    // around Berghotel Schafbergspitze, but reviews surfaced a 3.6★/1,012
    // problem (rude staff, basic 2-star rooms). Pivoted same-day to Lodge
    // am Krippenstein — 9.2/10 across 339 reviews (live-verified on
    // Booking.com 2026-05-17), 2,063m (HIGHER than Schafberg), modern
    // architectural lodge, cards accepted, ex-Olympic-coach owner, same
    // valley as the Obertraun anchor (5-min drive vs 50-min to St. Wolfgang).
    {
      id: 'wed-jul-29',
      date: '2026-07-29',
      dayOfWeek: 'Wednesday',
      dateLabel: 'Wednesday Jul 29',
      headline: 'Krippenstein summit night — sleep at 2,063m above Hallstättersee',
      hero: {
        src: IMG.wolfgangsee,
        alt: 'Dachstein-Krippenstein plateau with the 5 Fingers viewing platform above Hallstättersee',
        credit: IMG_CREDIT.wolfgangsee,
      },
      generalIdea:
        "Pack a small overnight bag (rest stays in the apartment in Obertraun — checkout isn't until Thursday morning, you can leave most of your stuff). Slow morning, optional Hallstättersee dip, lakeside coffee. Drive 5 minutes to the Dachstein-Krippenstein cable car valley station. Ride the cable car up (~20 min, two sections via Schönbergalm). Check in to Lodge am Krippenstein on the summit plateau (2,063m — 280m higher than Schafberg). Late afternoon: short walk (5 min) to the Welterbespirale viewpoint, or the 20-min walk to the 5 Fingers cantilevered viewing platform (the famous one — 5 steel \"fingers\" jutting out into space over the Hallstättersee valley). The day-trippers leave on the last cable car DOWN at 19:10; you have the high plateau to yourselves. Sunset over the entire Dachstein massif from the 5 Fingers platform — Hallstättersee straight down to the north, glaciers above to the south. Sleep at 2,063m. Sunrise from the same plateau at ~05:50.",
      planB:
        "Skip the summit overnight if weather is wrong (low cloud blanking the view = no point being up there). Stay the extra night at the Obertraun apartment, do a lake day at Hallstättersee Strandbad instead. The unique-experience night IS this one, so abort only if storms are named for the evening — Krippenstein cable car closes in lightning.",
      anchors: [
        { label: 'Slow morning at Obertraun', time: 'until ~14:00' },
        { label: 'Drive to Krippenstein valley station', time: '~5 min' },
        { label: 'Cable car UP (Section I + II)', time: '~20 min ride' },
        { label: 'Check in at Lodge am Krippenstein', time: '~16:00' },
        { label: 'Last cable car DOWN (day-trippers leave)', time: '19:10' },
        { label: 'Sunset at the 5 Fingers platform', time: '20:48' },
        { label: 'Sleep at 2,063m', time: 'overnight' },
      ],
      driveFrom: {
        place: 'Obertraun apartment',
        minutes: 5,
        mapsUrl: dirUrl('Obertraun, Austria', 'Dachstein Krippenstein Talstation Obertraun'),
      },
      sunset: {
        place: '5 Fingers viewing platform — cantilevered over Hallstättersee',
        time: '20:48',
        mapsUrl: searchUrl('5 Fingers Krippenstein Dachstein viewing platform'),
      },
      sleepWhere: 'lodge-am-krippenstein',
      doingSummary:
        'Slow morning in Obertraun → 5-min drive to Krippenstein cable car → up to 2,063m → check in at Lodge am Krippenstein → 5 Fingers platform for sunset → sleep on the high plateau. (Skip only if storms are forecast.)',
    },

    // --- DAY 7 — Thu Jul 30 ---
    // Restructured 2026-05-17 (Krippenstein pivot): morning comes off the
    // Lodge am Krippenstein summit plateau (first cable car down 08:40) back
    // to the Obertraun valley station, swing through the Obertraun apartment
    // to collect main bags, then drive to the airport-area apartment. Werfen
    // ice cave remains an optional open-afternoon pick.
    {
      id: 'thu-jul-30',
      date: '2026-07-30',
      dayOfWeek: 'Thursday',
      dateLabel: 'Thursday Jul 30',
      headline: 'First cable car down → drive to airport-side',
      hero: {
        src: IMG.werfen,
        alt: 'Hohenwerfen castle perched on a rocky crag above the Salzach valley near Werfen',
        credit: IMG_CREDIT.werfen,
      },
      generalIdea:
        "Sunrise at 2,063m from the Krippenstein plateau, breakfast at the lodge, first cable car DOWN at 08:40. Back at the car in Obertraun by 09:10. Pick up the main bags from the apartment, check out. Easy drive to the airport-area apartment (~1h10). Open afternoon — pick from: a lazy day in the airport apartment / one last Salzburg café + Altstadt loop / Eisriesenwelt ice cave at Werfen (the world's largest ice cave, 75-min underground tour, €42pp combo, BOOK the night before — July sells out) / Mauthausen if it's a Jewish-interest day. Finish with the Mönchsberg ridge from Toscaninihof for the final sunset.",
      planB:
        'If the cable car is weathered out and you slept the extra night at Krippenstein, scratch the airport night and drive straight to the airport apartment the moment the cable car reopens.',
      anchors: [
        { label: 'Sunrise on the plateau', time: '~05:50' },
        { label: 'First cable car DOWN', time: '08:40' },
        { label: 'At car in Obertraun', time: '~09:10' },
        { label: 'Check in airport apt', time: '~11:30' },
        { label: 'Sunset (Mönchsberg)', time: '20:47' },
      ],
      driveFrom: {
        place: 'Obertraun (Krippenstein valley station)',
        minutes: 70,
        mapsUrl: dirUrl('Obertraun, Austria', 'Salzburg Airport'),
      },
      driveTo: {
        place: 'Salzburg Airport area',
        minutes: 70,
        mapsUrl: dirUrl('Obertraun, Austria', 'Salzburg Airport'),
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
      pickPrice: '€286 / night (₪1,138) — PRICE-VERIFIED 2026-05-17: was €128, now €286 (Booking live, €572 / 2 nights with discount)',
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
      // Master-pick photos sourced live from Booking.com 2026-05-17 — 10 real
      // listing shots instead of the carousel() helper that mixed the hero
      // with Wikimedia area photos.
      pickPhotos: [
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474092866.jpg?k=986634218fc93628f2d52c8ad8e3a29b81db08747371da66f9d861a5c1d8b08d&o=&hp=1',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474189965.jpg?k=a1ac6798e4a3719fa5438391411cbdef0a325981cfbc98bfab15e33f982b7c31&o=',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474190876.jpg?k=0bf8d877adad096e225e7a29ecba7563c4954cff4b63fe1915d59ebeb1624df7&o=',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474189924.jpg?k=f6bc9bfa3cddb6d9cb4f07cdbea582d310f2fd408b1666ad328b1468dcf1e440&o=',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/474190855.jpg?k=92365936f9794a339dd266c65b7b6ab546cecdf6e1eb00aa01b9022375ca7506&o=',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/776498811.jpg?k=2a119953b7bbddf5930209b7647fbc8768f8ce454a0b3393388c55066df1e7e5&o=',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/661109556.jpg?k=7d7491adf7e5bde8284076ec70438306ea3e6af3213510cad13bd4cdc7fa68ea&o=',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/776498791.jpg?k=07e75cd098fe54f38964b4659f88d054ea091fbfcbc036384397ce8ebd079516&o=',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/493260152.jpg?k=86cec665b63c61873842dbf2335b5640a0d8aee6c1337e986de09f5b5dff477d&o=',
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/493260204.jpg?k=8116818e0cf15afc814f321af727752f8042d3ad152ba3da0d6b7c142306aa1d&o=',
      ],
      alts: [
        {
          name: "Junker's Apartments",
          url: 'https://www.booking.com/hotel/at/junkers-appartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/221346620.webp?k=cf7d95a5626dc200e5d713cbfcf5178c20086fc6ce1292547b7a2ab635163644&o=',
          review: '9.6 · Exceptional · 389 reviews',
          pricePerNight: '€194 / night (₪771) — PRICE-VERIFIED 2026-05-17: was €166, now €194 (Booking live, €387 / 2 nights)',
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
          pricePerNight: '€278 / night (₪1,105) — PRICE-VERIFIED 2026-05-17: was €217, now €278 (Booking live, €555 / 2 nights)',
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
          pricePerNight: '€260 / night (₪1,033) — PRICE-VERIFIED 2026-05-17: was €222, now €260 (Booking live, €519 / 2 nights)',
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
          pricePerNight: '€125 / night (₪497) — PRICE-VERIFIED 2026-05-17: was €160, now €125 (Booking live, €249 / 2 nights — cheapest available rate, larger room types €280+)',
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
          pricePerNight: '€272 / night (₪1,081) — PRICE-VERIFIED 2026-05-17: was €232, now €272 (Booking live, €543 / 2 nights)',
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
          pricePerNight: '€481 / night (₪1,911) — PRICE-VERIFIED 2026-05-17: was €205, now €481 (Booking live, €961 / 2 nights — earlier "verified" note was wrong)',
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
          pricePerNight: '€456 / night (₪1,548) — PRICE-VERIFIED 2026-05-17: was €178, now €456 (Booking live, €912 / 2 nights standard rate). €416/night with 10% Genius discount.',
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
          pricePerNight: '€266 / night (₪1,057) — PRICE-VERIFIED 2026-05-17: was €227, now €266 (Booking live, €531 / 2 nights)',
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
          pricePerNight: '€294 / night (₪1,168) — PRICE-VERIFIED 2026-05-17: was €260, now €294 (Booking live, €588 / 2 nights)',
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
          pricePerNight: '€203 / night (₪806) — PRICE-VERIFIED 2026-05-17: was €174, now €203 (Booking live, €406 / 2 nights — note: URL now redirects to "Casa Wendl", property may have been renamed)',
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
          pricePerNight: '€299 / night (₪1,188) — PRICE-VERIFIED 2026-05-17: was €128, now €299 (Booking live, €598 / 2 nights — earlier price drastically understated)',
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
      pickPrice: '€142 / night (₪564) — SOLD OUT for Jul 26-29 as of 2026-05-17 (PRICE-VERIFIED: "Check available dates" returned no rooms on Booking live). PRIMARY mountain anchor unavailable — pick alternate.',
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
          pricePerNight: '€160 / night (₪636) — PRICE-VERIFIED 2026-05-17: was €136, now €160 (Booking live, €481 / 3 nights)',
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
          pricePerNight: '€160 / night (₪636) — PRICE-VERIFIED 2026-05-17: was €136, now €160 (Booking live, €481 / 3 nights)',
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
          pricePerNight: '€187 / night (₪743) — PRICE-VERIFIED 2026-05-17: was €156, now €187 (Booking live, €560 / 3 nights)',
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
          pricePerNight: '€177 / night (₪703) — PRICE-VERIFIED 2026-05-17: was €151, now €177 (Booking live, €531 / 3 nights)',
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
          pricePerNight: '€275 / night (₪1,092) — PRICE-VERIFIED 2026-05-17: was €217, now €275 (Booking live, €825 / 3 nights)',
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
          notableDetails: ['60m² chalet-style', 'Separate living room', 'King bed', 'Full kitchen', '9.7 score'],
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
          beautyNote: 'Sunny-hillside chalet with 9.6 score across 152 reviews — the alpine-balcony pick of the area.',
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
          notableDetails: ['Cheapest pick in batch', 'Separate living room', 'Alpine view', '9.4 score'],
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
          pricePerNight: '€256 / night (₪1,016) — PRICE-VERIFIED 2026-05-17: was €286, now €256 (Booking live, €768 / 3 nights)',
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
          notableDetails: ['TRUE 2BR', '86m² spacious', '423 reviews', 'Near Altaussee lake', 'Sleeps 4'],
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
          beautyNote: 'Villa-style 2BR with garden, terrace, and mountain view — the most equipped fresh pick in the batch (washer + dishwasher verified).',
          laundry: 'washer',
          bedrooms: 2,
          beds: '1 extra-large double + 2 sofa beds',
          notableDetails: ['TRUE 2BR', 'Washer verified', 'Dishwasher', 'Terrace + garden', 'Mountain view', 'Free parking'],
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
          pricePerNight: '€192 / night (₪762) — PRICE-VERIFIED 2026-05-17: was €247, now €192 (Booking live, €576 / 3 nights — listing dropped 22%)',
          note: 'TRUE 2-BEDROOM 85m² apartment "above the rooftops" on Meranplatz in Bad Aussee with balcony + terrace + separate living room. Full kitchen. Sleeps up to 5 (2 singles + 1 extra-large double + 2 sofa beds). Town-centre location with panoramic-rooftop view — the "wake up over a town square in the Alps" pick. Free cancellation. Bad Aussee = ~25-min drive to Hallstatt.',
          budgetTier: 'mid-high',
          platform: 'booking',
          vibeTag: 'in-town',
          beautyPick: true,
          beautyNote: 'Above-the-rooftops 2BR with balcony AND terrace on a Bad Aussee town square — town-centre character + view.',
          laundry: 'unknown',
          bedrooms: 2,
          beds: '2 singles + 1 extra-large double + 2 sofa beds',
          notableDetails: ['TRUE 2BR', '85m² spacious', 'Balcony + terrace', 'Above-rooftops view', 'Town-centre'],
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
          review: '9.2 · Superb · 93 reviews',
          pricePerNight: '€292 / night (₪1,160) — PRICE-VERIFIED 2026-05-17: was €180, now €292 (Booking live, €876 / 3 nights — was 62% understated)',
          note: 'WOW: a modern farm-stay LODGE in the Wolfgangthal valley above St. Wolfgang, surrounded by forest and pastureland. Full apartment with satellite TV, fully equipped kitchen + fridge, private bath, terrace, BBQ, children\'s playground, free parking. Couples rate location 9.3 — "perfect for people who would like to break away from busy weekdays." ~45 min drive to Hallstatt, ~10 min to Wolfgangsee/Schafberg cog. Pairs well with the Wolfgangsee config or as a Mountain-anchor variant. [Photo is St. Wolfgang shoreline — view live listing photos on Booking.]',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'farm-stay',
          beautyPick: true,
          beautyNote: 'Modern farm-stay lodge in a forested valley above St. Wolfgang — break-from-the-world energy, with BBQ, terrace, and the Schafberg cog 10 minutes away.',
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
          availabilityNote: 'Confirm Jul 26-29 live on Booking.com — Playwright sweep blocked this pass.',
          freeCancellation: true,
          photos: [],
        },
        // === ALLISON URL-QUEUE PICK 2026-05-17 (Allison: "her fav so far") ===
        {
          name: 'Dangos Mountainview Gosau',
          url: 'https://www.booking.com/hotel/at/dangos.html?checkin=2026-07-26&checkout=2026-07-29&group_adults=2&nflt=fc%3D2',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/865965055.webp?k=f977aa15adc80578fdccad30eb5672682d78dc894ced2254d76e5848a9cb02f5&o=',
          review: '9.8 · Exceptional · 132 reviews',
          pricePerNight: '€298 / night (₪1,184) — PRICE-VERIFIED 2026-05-17: was €255, now €298 (Booking live, €893 / 3 nights)',
          note: 'ALLISON\'S FAVORITE FROM THE URL QUEUE (submitted 2026-05-17). Modern 2-BR apartment in Gosau village (Kirchenstraße 34a), 65 m² entire-place with 2 king beds (one per bedroom — true Shabbat-separation), full private kitchen, dishwasher, balcony, terrace, garden + mountain + landmark views, washing machine. Highest review score in the entire queue (9.8 / 132 reviews · location 9.7). Free cancellation until June 26, 2026 + pay nothing until June 24. "We have 1 left" at time of check — book early. Trade-off vs Obertraun: Königssee day-trip is ~1h45 from Gosau vs ~1h15 from Obertraun, but Gosausee mirror-lake is on your doorstep (~10 min) and Hallstatt ~50 min. The closest, easiest base for the marquee Gosausee day.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'nature-view',
          beautyPick: true,
          beautyNote: 'Allison\'s favorite from the URL queue — 9.8 / 132 reviews, true 2-BR with separate king bedrooms, 65 m² with balcony + terrace facing the Gosau valley.',
          laundry: 'washer',
          bedrooms: 2,
          beds: '2 king beds (1 per bedroom)',
          notableDetails: [
            'TRUE 2-BR Shabbat separation',
            '65 m² with balcony + terrace',
            'Dishwasher + washing machine',
            'Gosau village (Kirchenstraße)',
            'Allison\'s favorite (URL queue)',
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
          availabilityNote: 'Booking showed "We have 1 left" for Jul 26-29 on 2026-05-17 03:59 UTC — bookable but moving fast.',
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
        'https://cf.bstatic.com/xdata/images/hotel/max1280x900/585968658.jpg?k=c7d214bd1ba98238c62526e870a402b0ae3ab58d9a4df7be7e4873a7eee97efb&o=&hp=1',
      pickReview: '8.1 · Very good · 1,639 reviews',
      pickPrice: '€71 / night (₪282) — PRICE-VERIFIED 2026-05-17: was €105, now €71 (Booking live for Jul 30-31 — cheapest non-refundable rate; free-cancel rates start €77)',
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
          img: 'https://cf.bstatic.com/xdata/images/hotel/max1280x900/139217677.jpg?k=ebc0c828c528549905c9c09bbe92ccc4e2a9f32aaf5cfa7c5d2372e7cd7ca11c&o=&hp=1',
          review: '9.4 · Superb · 304 reviews',
          pricePerNight: '€442 / night (₪1,755) — PRICE-VERIFIED 2026-05-17: was €320, now €442 (Booking live, €442 / 1 night)',
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
      wikipedia: 'https://en.wikipedia.org/wiki/Vorderer_Gosausee',
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
    walkNote: 'Glass-cabin gondola, 8.5 min to 1,800m. Flat 5-min walk at top to the panorama terrace.',
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
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Jenner Cable Car, Schönau am Königssee, Germany'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Jenner Cable Car, Schönau am Königssee, Germany'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.berchtesgaden.de/en/cable-cars/jennerbahn',
    walkFromParkingMin: 3,
    walkFromParkingNote: 'Free or paid lot at the valley station, 3-min walk to the gondola.',
    accessibilityNote: 'Glass cabins are wheelchair accessible. Top platform partly accessible — restaurant + lower terrace yes, summit ridge no.',
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
    walkNote: '8.5 min cable car to summit. Flat 30-min walk at top to Salzburger Hochthron viewpoint.',
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
    walkFromParkingNote: 'Valley parking at Grödig, 2-min walk to the cable car. Bus 25 from Mirabellplatz also lands here.',
    accessibilityNote: 'Cable car accessible; summit terrain is rocky alpine, not stroller-friendly.',
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
    walkNote: 'Flat 1-hour paved loop around the lake. Stroller + wheelchair friendly. Both Langbathseen loop = ~2h.',
    pairsWith: ['almsee-grunau', 'hallstatt-markt'],
    feature: 'Jewel-blue forest lake, swimmable to 25°C, near-empty vs Hallstattersee.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vorderer_Langbathsee_im_August_2018.jpg/1280px-Vorderer_Langbathsee_im_August_2018.jpg',
      alt: 'Vorderer Langbathsee — emerald lake ringed by forest',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.salzkammergut.at/en/oesterreich-tour/detail/430001116/walk-around-lakes-langbathsee-at-ebensee.html',
      wikipedia: 'https://de.wikipedia.org/wiki/Langbathseen',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Vorderer Langbathsee, Ebensee, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Vorderer Langbathsee, Ebensee, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.salzkammergut.at/en/oesterreich-tour/detail/430001116/walk-around-lakes-langbathsee-at-ebensee.html',
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
    feature: 'Mirror lake reflecting the Tote Gebirge — pure Avital aesthetic, near-empty even in peak summer.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Almsee_im_Almtal_Gr%C3%BCnau_Ober%C3%B6sterreich_001.jpg/1280px-Almsee_im_Almtal_Gr%C3%BCnau_Ober%C3%B6sterreich_001.jpg',
      alt: 'Almsee mirror lake at dawn with Tote Gebirge reflections',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.upperaustria.com/en/oesterreich-tour/detail/100257/walk-to-the-lake-almsee.html',
      wikipedia: 'https://en.wikipedia.org/wiki/Almsee',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Almsee, Grünau im Almtal, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Almsee, Grünau im Almtal, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.upperaustria.com/en/oesterreich-tour/detail/100257/walk-to-the-lake-almsee.html',
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
    feature: '400-year-old Baroque water-puzzle palace + Sound-of-Music gazebo. Light, playful, you-will-get-wet on purpose.',
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
    accessibilityNote: 'Gardens accessible; trick-fountain tour involves stone paths + intentional water — bring a change of clothes.',
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
    feature: 'Rain-proof, constant 12°C. THE substitute for Hallstatt salt mine (closed summer 2026).',
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
    walkFromParkingNote: 'On-site parking + 5-min walk to tour entry. Get protective miner overalls at the start.',
    accessibilityNote: 'Mine train + boat make most of it accessible; some slides + ramps are not wheelchair-friendly — book the alternative route.',
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
    walkNote: '15th-century late-Gothic church. 20-min visit + pair with Mondsee swim/walk for a half-day.',
    pairsWith: ['wolfgangsee'],
    feature: 'The Sound-of-Music wedding-church — Maria + Georg married here on film.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Basilika_zum_hl._Michael_in_Mondsee_-_Sicht_vom_Marktplatz_aus.jpg/1280px-Basilika_zum_hl._Michael_in_Mondsee_-_Sicht_vom_Marktplatz_aus.jpg',
      alt: 'Basilika St. Michael Mondsee from the market square',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://mondsee.salzkammergut.at/en/oesterreich-poi/detail/401362/wedding-church-basilica-st-michael-mondsee.html',
      wikipedia: 'https://en.wikipedia.org/wiki/Mondsee_Abbey',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Basilika St. Michael, Mondsee, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Basilika St. Michael, Mondsee, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://mondsee.salzkammergut.at/en/oesterreich-poi/detail/401362/wedding-church-basilica-st-michael-mondsee.html',
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
    walkNote: 'Flat 2-hour walk into a vast U-shaped gravel-river valley. Mountains rise on both sides. Wimbachschloss hut (1hr in) is a turn-around point.',
    pairsWith: ['wimbachklamm', 'hintersee-ramsau'],
    feature: 'Get-lost-in-nature walk: vast silent valley, flat gravel river bed, mountains all around.',
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
    walkNote: '50-min gentle uphill hike from St. Wolfgang valley to a small forest-rimmed alpine lake. Silent, often empty even in peak summer.',
    pairsWith: ['wolfgangsee-village', 'kapuzinerberg-salzburg'],
    feature: 'Hidden alpine lake above St. Wolfgang. The get-lost version of the lake-cluster.',
    hero: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Schwarzensee_St._Wolfgang_im_Salzkammergut_3.jpg/1280px-Schwarzensee_St._Wolfgang_im_Salzkammergut_3.jpg',
      alt: 'Schwarzensee — quiet alpine lake above St. Wolfgang',
      credit: 'Wikimedia Commons, CC BY-SA',
    },
    links: {
      official: 'https://www.wolfgangsee.salzkammergut.at/en/oesterreich-tour/detail/430000928/walk-to-the-schwarzensee.html',
      wikipedia: 'https://de.wikipedia.org/wiki/Schwarzensee_(Salzkammergut)',
      mapsFromSalzburg: dirUrl('Salzburg, Austria', 'Schwarzensee, St. Wolfgang im Salzkammergut, Austria'),
      mapsFromHallstatt: dirUrl('Obertraun, Austria', 'Schwarzensee, St. Wolfgang im Salzkammergut, Austria'),
    },
    hiddenGem: true,
    sourceUrl: 'https://www.wolfgangsee.salzkammergut.at/en/oesterreich-tour/detail/430000928/walk-to-the-schwarzensee.html',
    walkFromParkingMin: 50,
    walkFromParkingNote: 'Park at trailhead (free, signed from St. Wolfgang). 50-min uphill forest path.',
    accessibilityNote: 'Forest path with roots/rocks — NOT stroller/wheelchair friendly. Easy by hike standards.',
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
    walkNote: '6km flat-ish meadow loop below the south Dachstein wall. Pass working alpine huts, grazing cattle, wildflowers. 2-2.5 hours easy.',
    pairsWith: ['krippenstein-5fingers', 'gosausee'],
    feature: 'Alpine meadow walking with the Dachstein looming above. Cows + bells + wildflowers + huts. Lost in alpine pasture.',
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
    accessibilityNote: 'Gravel + grass meadow paths — flat overall, NOT paved. Stroller-OK for portions.',
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
    walkNote: '1.5km city-hike up the OTHER hill across the river from Hohensalzburg. 2h round-trip max via Steingasse + Imbergstiege stairs.',
    pairsWith: ['hellbrunn-trick-fountains', 'untersberg-cable-car'],
    feature: 'Quiet sunset hill opposite Hohensalzburg. Hettwer Bastei viewpoint + Stefan Zweig memorial + golden Old Town panorama.',
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
    walkFromParkingNote: 'Walkable from any Salzburg city apartment (Linzergasse is 5 min from the trailhead via Steingasse).',
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
    pricePerNight: '€257 / night (₪1,021) — PRICE-VERIFIED 2026-05-17: was €140, now €257 (Booking live, €771 / 3 nights — was 83% understated)',
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
  // --- CONFIG A: OBERTRAUN (3-night mountain anchor) ---
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
  'Pension Sydler (Bad Goisern)': { lat: 47.6439, lng: 13.6167 }, // Konrad-Deubler-Gasse 8 (Nominatim verified 2026-05-17)
  'Weisses Lamm Holiday Home (Hallstatt)': { lat: 47.5614, lng: 13.6486 },
  // SUMMIT NIGHT (Wed-Thu) — pivoted 2026-05-17 from Schafbergspitze to Lodge am Krippenstein
  'Lodge am Krippenstein': { lat: 47.5126, lng: 13.6929 }, // Dachstein Krippenstein summit, 2,063m — same valley as Obertraun base
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
    description: 'Shabbat home. Davening + meals. 5-min walk from master Linzergasse apartment.',
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
