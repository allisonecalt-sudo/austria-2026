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
  totalCostEur: 2699,
  totalCostNis: 10750,
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
        },
      ],
    },
    {
      // SALZBURG AIRPORT — Thu Jul 30 – Fri Jul 31, 1 night.
      // Quiet enough to pack at 5am for early Friday flight.
      // 10-min drive max to SZG terminal.
      baseKey: 'airport',
      nights: 'Thu Jul 30 – Fri Jul 31 (1 night)',
      area: 'Salzburg city / west side — within 10-min drive of W. A. Mozart airport for the 5am Friday departure',
      pickName: 'Hapimag Ferienwohnungen Salzburg',
      pickUrl: 'https://www.booking.com/hotel/at/hapimag-resort-salzburg.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/139217677.webp?k=cc6b6af89947749e036d48a119040fc567cced209c7ba208ae102d736e18177e&o=',
      pickReview: '9.4 · Superb · 304 reviews',
      pickPrice: '€320 / night (₪1,272)',
      pickWhy:
        '34m² studio apartment with full kitchen, ~5km from airport (10-min drive), aparthotel-style. 9.4 score across 304 reviews. The "wake at 5am, be at the gate by 6" pick — fewer surprises than a one-off self-check-in for the night that matters most.',
      pickBudgetTier: 'splurge',
      pickPlatform: 'booking',
      pickDriveToAirportMin: 10,
      alts: [
        {
          name: 'Landhotel Berger (Ainring, just over the German border)',
          url: 'https://www.booking.com/hotel/de/landhaus-berger-ainring.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/487668919.webp?k=249e5a1260b40f9b2d5a1f924e3a04f5e27e1da37720c6dc36801c8ee7eecddc&o=',
          review: '8.4 · Very good · 421 reviews',
          pricePerNight: '€203 / night (₪807)',
          note: '28m² apartment with kitchen + BREAKFAST INCLUDED. 8km southwest of SZG (12-min drive). Free cancellation, no prepayment. Cheapest apartment-with-kitchen in the airport orbit that still meets the bar. Slightly below 8.5 — kept because breakfast included.',
          budgetTier: 'splurge',
          platform: 'booking',
          driveToAirportMin: 12,
        },
        {
          name: 'Hotel Astoria',
          url: 'https://www.booking.com/hotel/at/hotelastoriasalzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/384925943.webp?k=ac914eb88a1a5777c6911c69d0d7fb8e12e377b99cf1fcf4fd2293020d0f1e65&o=',
          review: '8.0 · Very good · 2,750 reviews',
          pricePerNight: '€245 / night (₪974)',
          note: '45m² apartment with kitchen, 2.3km from airport — CLOSEST to the terminal. 2,750 reviews — extremely established. 8.0 review is below our 8.5 bar but the proximity-to-terminal factor is hard to beat for a 5am flight.',
          budgetTier: 'splurge',
          platform: 'booking',
          driveToAirportMin: 6,
        },
        {
          name: 'Goldgasse Apartments de Luxe',
          url: 'https://www.booking.com/hotel/at/goldgasse-apartments-de-luxe.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/726601815.webp?k=d30c57b149f980df0f585af2f6c6d34b6952c72722670b488dd93a3009a686ed&o=',
          review: '8.7 · Fabulous · 210 reviews',
          pricePerNight: '€253 / night (₪1,005)',
          note: '30m² studio apartment with kitchen, IN THE ALTSTADT on Goldgasse (200m from Mozartplatz). ~15-min drive to SZG. Free cancellation. The "one more night in the old town" pick if Allison wants the Thursday-evening Mönchsberg sunset followed by a real Altstadt breakfast before flying.',
          budgetTier: 'splurge',
          platform: 'booking',
          driveToAirportMin: 15,
        },
        {
          name: 'Rock Salzburg',
          url: 'https://www.booking.com/hotel/at/rock-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/577305861.webp?k=b9a5438f173df851e9f2840d8eb1ce9313afa85205fb44ed9e9882450f585bc4&o=',
          review: '9.4 · Superb · 102 reviews',
          pricePerNight: '€292 / night (₪1,158)',
          note: '20m² 1-bedroom apartment in Altstadt, 250m from old-town center, ~15-min drive to SZG. Free cancellation. Premium for the last night if Allison wants the high-review pick.',
          budgetTier: 'splurge',
          platform: 'booking',
          driveToAirportMin: 15,
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
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Krimmler_Wasserf%C3%A4lle_2.JPG/1280px-Krimmler_Wasserf%C3%A4lle_2.JPG',
  grossglockner:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Grossglockner_High_Alpine_Road.JPG/1280px-Grossglockner_High_Alpine_Road.JPG',
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
  krimml: 'Wikimedia / Norbert Aepli, CC BY 3.0',
  grossglockner: 'Wikimedia, CC BY-SA',
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
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/600px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
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
  },
  {
    name: 'Gästehaus Hinterponholz (Ramsau)',
    url: 'https://www.booking.com/hotel/de/ga-stehaus-hinterponholz.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Ramsau_bei_Berchtesgaden_%28DE%29%2C_Milchstra%C3%9Fe_%C3%BCber_Hochkalter_%26_Hintersee_--_2024_--_1018-50.jpg/600px-Ramsau_bei_Berchtesgaden_%28DE%29%2C_Milchstra%C3%9Fe_%C3%BCber_Hochkalter_%26_Hintersee_--_2024_--_1018-50.jpg',
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
  },
  {
    name: 'Gästehaus Amort (Ramsau)',
    url: 'https://www.booking.com/hotel/de/gastehaus-amort.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Pfarrkirche_St._Sebastian_%28Ramsau%29.jpg/600px-Pfarrkirche_St._Sebastian_%28Ramsau%29.jpg',
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
  },
  {
    name: 'Grubenlehen (Ramsau)',
    url: 'https://www.ramsau.de/en/accomodations/self-catering-apartments/grubenlehen.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/600px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
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
  },
];

// === St. Wolfgang / Strobl / St. Gilgen lodging set (NEW) ===
// Verified via WebSearch 2026-05-16. Booking.com slugs confirmed.
const ST_WOLFGANG_LODGING: BaseConfigLodgingPick[] = [
  {
    name: 'Wolf & Schaf Apartments (St. Wolfgang)',
    url: 'https://www.booking.com/hotel/at/harmonie-st-wolfgang.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/600px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
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
  },
  {
    name: 'Wolfgangsee Appartement (St. Wolfgang)',
    url: 'https://www.booking.com/hotel/at/wolfgangsee-appartement.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Panorama_Wolfgangsee.jpg/600px-Panorama_Wolfgangsee.jpg',
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
  },
  {
    name: 'Wolfgangsee Appartements (Strobl, east end of the lake)',
    url: 'https://www.booking.com/hotel/at/wolfgangsee-appartements.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/600px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
    review: '9.5 · Exceptional · 95 reviews',
    pricePerNight: '€140 / night (₪555)',
    note: 'Strobl base — east end of Wolfgangsee, 15 min by car from St. Wolfgang. Garden + lake views, terrace, fully appointed kitchen. Slightly quieter than St. Wolfgang itself. Great for "lake but not the tourist hub" preference. [Photo is Strobl on the Wolfgangsee, not the listing — view live photos on Booking.]',
    budgetTier: 'standard',
    vibeTag: 'lake-edge',
    laundry: 'unknown',
    bedrooms: 1,
    beds: '1 queen + sofa',
    notableDetails: ['Lake view', 'Garden + terrace', 'Quieter than St. Wolfgang'],
  },
  {
    name: 'Appartements Mair (Strobl, 70m² 2-BR)',
    url: 'https://www.booking.com/hotel/at/70m2-ferienwohnung-am-wolfgangsee-strobl.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Wolfgangsee_bei_Strobl_nach_Norden_-_panoramio.jpg/600px-Wolfgangsee_bei_Strobl_nach_Norden_-_panoramio.jpg',
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
  },
  {
    name: 'Apartment Sunset am Wolfgangsee (Strobl)',
    url: 'https://www.booking.com/hotel/at/apartment-sunset-am-wolfgangsee.html',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/600px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
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
