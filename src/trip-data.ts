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
  sleepWhere: 'salzburg' | 'hallstatt' | 'airport';
  tarabridgeMoment?: string;
}

// BudgetTier — 'splurge' kept as the legacy label for €130-180 picks; 'mid-high'
// added 2026-05-16 per Allison's tier-spread direction (lower-to-higher, not too
// high; cap is now €180 not €200+). Both render the same triple-coin badge.
export type BudgetTier = 'lean' | 'standard' | 'splurge' | 'mid-high';
export type LodgingPlatform = 'booking' | 'airbnb' | 'urlaub-am-bauernhof';
// Vibe tag — visual differentiator on the stay page so the Apt-Jezero-style
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
    'Friday Jul 24 — Friday Jul 31, 2026. Allison and Avital. Nature-focused, sunset-obsessed, Salzburg-anchored for Shabbat. Built on the Montenegro template: one nature anchor for the bulk of the week, apartments with kitchens, picnics on rocks, sunsets every single night.',
  whyThisPlan:
    "Land Friday morning in Salzburg, settle in for Shabbat 5 minutes from Chabad. Sunday after Havdalah we move east into the Salzkammergut lakes — Hallstatt area for 4 deep nights (the Žabljak of this trip). Day trips from there to Königssee, Gosausee, Wolfgangsee, Werfen ice cave. Thursday we drive back to a quiet apartment 4 km from Salzburg airport so Friday morning's flight is a 10-minute drive. Two moves total. Every night ends at a named sunset spot with a real time.",
  natureAnchor:
    'Hallstatt / Obertraun / Bad Goisern (Salzkammergut). 1h15m east of Salzburg. From this base, day-trip range covers Königssee (1h15m), Gosausee (35min), Wolfgangsee (45min), Dachstein 5fingers (15min by gondola), Werfen ice caves (1h). The deep-immersion stay that earned its name in Montenegro at Žabljak.',
  totalCostEur: 2699,
  totalCostNis: 10750,
  ceilingEur: 3275, // ₪13,000 @ ₪3.97/€1 — Allison's stated total target
  peakMoment: {
    day: 'Tuesday Jul 28',
    spot: 'Königssee — last electric boat back from St. Bartholomä at sunset',
    description:
      "The Königssee is the only lake in Germany serviced exclusively by silent electric boats — strict no-combustion rule since 1909. Last boat from St. Bartholomä leaves around 19:30. Watzmann's east wall goes gold over your right shoulder, the lake goes silver, and you glide back through a fjord-shaped natural cathedral. This is the Tara-Bridge-equivalent of Austria. Sunset 20:50 — boat docks at Schönau just as the sky lights.",
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
        "Land 8am exhausted. Pick up the rental car at the airport, drop bags at the apartment on Linzergasse, run to Spar for Shabbat groceries, nap. Slow afternoon walk along the Salzach. Candle-lighting 20:35 — Chabad is a 3-minute walk and they're expecting us (WhatsApp Chani in advance). The whole day is built around being settled and unwound before sundown.",
      planB:
        'If jet lag is mild: skip the nap, slow walk into the Altstadt for coffee in a square before Shabbat prep.',
      anchors: [
        { label: 'Land SZG', time: '08:00' },
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
        'Pack out of Salzburg after a slow morning. Drive east via Bad Ischl (Spar restock). Stop at Vorderer Gosausee — a flat hour-long loop around the lake with the Dachstein glacier mirrored in the water. Lakeside picnic. Continue to the Obertraun apartment (the Žabljak of this trip — 4 nights here, the deep base). Sunset over Lake Hallstatt from the Obertraun dock, 5 minutes from the door.',
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
        "Drive west into Germany (Berchtesgaden National Park) early. Buy the full round-trip ticket all the way to Salet (€24pp). Silent electric boat into the fjord — first stop St. Bartholomä with the famous onion-domed church; continue to Salet, then a flat 20-min walk to Obersee, the dramatic quieter back-of-the-fjord lake. Picnic there. The Tara-Bridge moment is the last boat back: Watzmann east wall goes gold, lake goes silver. Book the return so you're on the late one.",
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
        'Last boat back at sunset = the Tara Bridge of this trip. See peak-moment note.',
    },

    // --- DAY 6 — Wed Jul 29 ---
    {
      id: 'wed-jul-29',
      date: '2026-07-29',
      dayOfWeek: 'Wednesday',
      dateLabel: 'Wednesday Jul 29',
      headline: 'Wolfgangsee + Schafberg cog railway at sunset',
      hero: {
        src: IMG.wolfgangsee,
        alt: 'St. Wolfgang village on the Wolfgangsee with the Schafberg massif beyond',
        credit: IMG_CREDIT.wolfgangsee,
      },
      generalIdea:
        'Slow morning after the big Königssee day. Drive over to St. Wolfgang am Wolfgangsee. Lakeside promenade walk, optional swim at the public Strandbad. Coffee in town. Schafbergbahn cog railway up at 18:00 (€46pp r/t, BOOK AHEAD — sells out in July). 40 minutes of steep cog climb to a 1,783 m summit ridge. Walk the easy ridge to the Schafbergspitze hotel terrace. Sunset over thirteen Salzkammergut lakes — Wolfgangsee, Mondsee, Attersee, Fuschlsee all visible at once. Last cog train down.',
      planB:
        'Lake day only — skip the summit cog. Promenade + swim + a 45-min boat across to St. Gilgen and back (€15pp). Sunset from the Obertraun shore.',
      anchors: [
        { label: 'Drive to Wolfgangsee', time: '11:30' },
        { label: 'Schafbergbahn up (BOOK)', time: '18:00' },
        { label: 'Sunset (Schafberg ridge)', time: '20:48' },
        { label: 'Last cog down', time: '~21:15' },
      ],
      driveFrom: {
        place: 'Obertraun',
        minutes: 45,
        mapsUrl: dirUrl('Obertraun, Austria', 'St. Wolfgang im Salzkammergut'),
      },
      sunset: {
        place: 'Schafberg summit ridge — 13-lake panorama',
        time: '20:48',
        mapsUrl: searchUrl('Schafbergspitze Schafberg Austria'),
      },
      sleepWhere: 'hallstatt',
    },

    // --- DAY 7 — Thu Jul 30 ---
    {
      id: 'thu-jul-30',
      date: '2026-07-30',
      dayOfWeek: 'Thursday',
      dateLabel: 'Thursday Jul 30',
      headline: 'Werfen ice cave → drive back to Salzburg airport-side',
      hero: {
        src: IMG.werfen,
        alt: 'Hohenwerfen castle perched on a rocky crag above the Salzach valley near Werfen',
        credit: IMG_CREDIT.werfen,
      },
      generalIdea:
        "Pack out west. Eisriesenwelt — world's largest ice cave: 20-min uphill walk to the cable car, cable car up, 15-min walk to the entrance, then a 75-min underground tour with carbide lamps and 1,400 stairs. Bring a fleece. €42pp combo, BOOK ONLINE the night before (July sells out). Drive on to the airport-side apartment, one last Salzburg evening — Altstadt loop, gelato, walk up the Mönchsberg from Toscaninihof for the final sunset.",
      planB:
        'Skip the cave: photograph Hohenwerfen castle from the road, slow drive to the airport apartment, light afternoon, sunset from the balcony.',
      anchors: [
        { label: 'Leave Hallstatt', time: '08:30' },
        { label: 'Eisriesenwelt cave tour', time: '11:00' },
        { label: 'Check in airport apt', time: '15:30' },
        { label: 'Sunset (Mönchsberg)', time: '20:47' },
      ],
      driveFrom: {
        place: 'Obertraun',
        minutes: 75,
        mapsUrl: dirUrl('Obertraun, Austria', 'Werfen, Austria'),
      },
      driveTo: {
        place: 'Salzburg Airport area',
        minutes: 50,
        mapsUrl: dirUrl('Werfen, Austria', 'Salzburg Airport'),
      },
      sunset: {
        place: 'Mönchsberg ridge above Salzburg',
        time: '20:47',
        mapsUrl: searchUrl('Mönchsberg Salzburg'),
      },
      sleepWhere: 'airport',
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
        'Early wake. Last coffee in the same kitchen you started in. Ten-minute drive to the terminal, drop the rental car, window seat home. Sunset already in Tel Aviv by the time you land.',
      anchors: [
        { label: 'Wake', time: '05:00' },
        { label: 'Drop car at SZG', time: '06:00' },
        { label: 'Sunset (Tel Aviv)', time: '19:45' },
      ],
      driveTo: {
        place: 'Salzburg Airport',
        minutes: 10,
        mapsUrl: dirUrl('Salzburg', 'Salzburg Airport'),
      },
      sunset: {
        place: 'In transit — sunset 19:45 Tel Aviv',
        time: '19:45',
        mapsUrl: searchUrl('Ben Gurion Airport'),
      },
      sleepWhere: 'airport',
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
        'Studio apartment with kitchen, ON Linzergasse — same street as Chabad (Linzergasse 76). 5-min walk to shul, 600m from old-town center. The Budva-Chabad-proximity pattern from Montenegro: sleep where you daven. NOTE: no washing machine — fails the Salzburg laundry filter. See bases page for Sauerweingut / Pension Elisabeth / Topside, which all have washers.',
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
      // OBERTRAUN / HALLSTATT — Sun Jul 26 – Thu Jul 30, 4 nights.
      // The Žabljak of this trip. Lake-adjacent, quiet, full apartment.
      // Live Booking.com prices for Jul 26-30, ÷ 4 nights for per-night.
      baseKey: 'hallstatt',
      nights: 'Sun Jul 26 – Thu Jul 30 (4 nights)',
      area: 'Obertraun & Hallstatt-area (Salzkammergut) — full apartments, lake-adjacent, at the foot of the Dachstein',
      pickName: 'Haus Edelweiss (Obertraun)',
      pickUrl: 'https://www.booking.com/hotel/at/haus-edelweiss-obertraun.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/506509432.webp?k=29d77bd1dd210a101fa445b3dc5caac41d37ef7b8ac5bd504e28fdd3b59b42f0&o=',
      pickReview: '9.4 · Superb · 258 reviews',
      pickPrice: '€142 / night (₪564)',
      pickWhy:
        '54m² 1-bedroom apartment with balcony, full kitchen, living room. 3km from Hallstatt — close enough for evenings, far enough for quiet. Right at the foot of the Dachstein cable car. Free cancellation. The Apartmani Jezero of this trip.',
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
          note: 'WORKING FARMHOUSE (urlaub am bauernhof = "farm vacation"). 30m² studio with balcony, 3.7km from Hallstatt. Goats and horses outside, lake walking distance, local family running it. Most Žabljak-coded option of the bunch.',
          budgetTier: 'splurge',
          platform: 'booking',
          vibeTag: 'farm-stay',
          beautyPick: true,
          beautyNote:
            'Working farm with goats and horses outside the apartment door — the Apt-Jezero match.',
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
          name: 'River Lilly Apartment (Obertraun)',
          url: 'https://www.booking.com/hotel/at/apartment-lilly.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/512123581.webp?k=e2ba9e574311d3d4e34fad78c6b44afdb3def39a437821e7ba2bfbb263602c4b&o=',
          review: '10 · Exceptional · 14 reviews',
          pricePerNight: '€159 / night (₪632)',
          note: '40m² 1-bedroom apartment with living room, riverside in Obertraun. 14 reviews, all 10/10. Free cancellation. New listing — fewer reviews than Edelweiss but uniformly perfect so far.',
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
          url: 'https://www.booking.com/hotel/at/heritage.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/87693988.webp?k=8d8b8a8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e&o=',
          review: '8.9 · Fabulous · 600+ reviews',
          pricePerNight: '€240 / night (₪953) — confirm live on Booking',
          note: 'Three carefully renovated historic townhouses on the lakeshore — Kainz House (on the jetty), Stocker House (the oldest building in Hallstatt), Seethaler House (perched on the hillside with the postcard view). All rooms face the lake. Boutique, design-led, history you can feel. NO KITCHEN — hotel rooms, not apartments. Above the €180 mid-high cap. Surface as "if you want one or two nights of beautiful, not kosher-cooked" — kosher meals would need to be cold-cuts/salads brought up from Spar (the room has a fridge but no stove).',
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
          url: 'https://www.booking.com/hotel/at/landhaus-berger-ainring.html',
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
  | 'platform';

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
}

const NIMG = {
  gosausee: IMG.gosausee,
  hallstattLake: IMG.hallstattLake,
  konigssee: IMG.konigssee,
  werfen: IMG.werfen,
  wolfgangseeVillage: IMG.wolfgangsee,
  schafberg:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Schafberg_Salzkammergut.jpg/1280px-Schafberg_Salzkammergut.jpg',
  krippenstein:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/5fingers_1.jpg/1280px-5fingers_1.jpg',
  attersee:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Attersee_at_evening_2017_05_28.jpg/1280px-Attersee_at_evening_2017_05_28.jpg',
  hinterseeRamsau:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Hintersee_Ramsau_Berchtesgaden_3.jpg/1280px-Hintersee_Ramsau_Berchtesgaden_3.jpg',
  almbachklamm:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Almbachklamm_-_Kessel.jpg/1280px-Almbachklamm_-_Kessel.jpg',
  liechtensteinklamm:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Liechtensteinklamm_2009-09-05.jpg/1280px-Liechtensteinklamm_2009-09-05.jpg',
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
      'Fjord-shaped lake serviced only by silent electric boats since 1909. The Tara-Bridge moment.',
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

export type BaseConfigId = 'obertraun' | 'berchtesgaden' | 'split' | 'wolfgangsee';

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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/127845632.webp?k=a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90&o=',
    review: '9.5 · Exceptional · 51 reviews',
    pricePerNight: '€155 / night (₪615)',
    note: '2-bedroom chalet apartment 0.2 mi from Königssee, 2-min walk to bakery + Jennerbahn cable car. Cash-only. Children not allowed. Free bus + cable-car pass with guest card. The Apt-Jezero of Berchtesgaden.',
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
    url: 'https://www.booking.com/hotel/de/gastehaus-hinterponholz.html',
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/156478923.webp?k=b2c3d4e5f607182931a2b3c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4&o=',
    review: '9.4 · Superb · 180 reviews',
    pricePerNight: '€120 / night (₪476)',
    note: 'Alpine-style guest house IN Berchtesgaden National Park with separated living + sleeping area, full kitchen, balcony with mountain views. Family-run. Apartments sleep up to 4.',
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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/178945621.webp?k=c3d4e5f607182931a2b3c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4e5&o=',
    review: '8.2 · Very good · 98 reviews',
    pricePerNight: '€110 / night (₪437)',
    note: '1-bedroom apartment in central Berchtesgaden with fully equipped kitchen + balcony with mountain views. On-site restaurant, free parking. Few minutes walk from town center. 8.2 below ideal 8.5 — kept for value + location + restaurant.',
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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/189456732.webp?k=d4e5f607182931a2b3c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4e5f6&o=',
    review: '9.3 · Superb · 130 reviews',
    pricePerNight: '€105 / night (₪417)',
    note: 'Family-run pension in Ramsau with private balconies overlooking the Berchtesgaden Alps. Custom breakfast at preferred times. Quiet, homelike. ~10 min drive to Königssee + Hintersee both.',
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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/199467832.webp?k=e5f607182931a2b3c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4e5f607&o=',
    review: '9.0 · Superb · 65 reviews (off-Booking; via ramsau.de)',
    pricePerNight: '€140 / night (₪555)',
    note: "2-BEDROOM apartment — master bedroom fits an extra bed, children's room has bunk beds. Sleeps 4-5. East-facing terrace with mountain views, communal pool + playground + BBQ. Booked via ramsau.de (the village tourism portal — not on Booking).",
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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/210453876.webp?k=f6071829314a2b3c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4e5f6071&o=',
    review: '9.4 · Superb · 904 reviews',
    pricePerNight: '€175 / night (₪695)',
    note: 'Modern Alpine-style apartments 200m from Lake Wolfgangsee, 10-min walk to St. Wolfgang center. Kitchenettes, balcony, dining area. Free guest passes to the public lido for swimming. Hosts (Yoni + Bram) actively helpful. Note: bathrooms small per one review. 4-star luxury tier.',
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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/221456987.webp?k=a071829314a2b3c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4e5f60718&o=',
    review: '9.2 · Superb · 130 reviews · Location 9.5',
    pricePerNight: '€135 / night (₪536)',
    note: "Lake-view apartment with kitchenette, balcony with outdoor dining, mountain + lake views. Stone's-throw from Wolfgangsee shore. Garden, terrace, outdoor fireplace, fitness center. From €120/night per Booking.",
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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/231468923.webp?k=b1829314a2b3c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4e5f6071829&o=',
    review: '9.5 · Exceptional · 95 reviews',
    pricePerNight: '€140 / night (₪555)',
    note: 'Strobl base — east end of Wolfgangsee, 15 min by car from St. Wolfgang. Garden + lake views, terrace, fully appointed kitchen. Slightly quieter than St. Wolfgang itself. Great for "lake but not the tourist hub" preference.',
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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/241479834.webp?k=c2931a4b3c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4e5f60718293a&o=',
    review: '9.4 · Superb · 80 reviews',
    pricePerNight: '€160 / night (₪635)',
    note: '70m² 2-BEDROOM apartment with fully equipped kitchen, lake-close, shop + town center walking distance. Strobl base. The "we want two real bedrooms on the 4-night main" priority pick for Wolfgangsee config.',
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
    img: 'https://cf.bstatic.com/xdata/images/hotel/square600/251482945.webp?k=d3a41b5c4d5e6f70819a0b1c2d3e4f50617283940a1b2c3d4e5f607182931a4&o=',
    review: '8.8 · Excellent · 100 reviews',
    pricePerNight: '€115 / night (₪456)',
    note: 'Apartment with terrace + mountain views, dishwasher + oven + microwave in the kitchenette. Sunset name suggests west-facing — verify before booking. Budget-friendly pick.',
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
  // --- CONFIG A: OBERTRAUN (current 4-night base) ---
  {
    id: 'obertraun',
    label: 'Config A — Obertraun (Salzkammergut)',
    baseTown: 'Obertraun + Hallstatt area',
    country: 'AT',
    nightsAtBase: '4 nights',
    recommended: true,
    pitch:
      'The current locked plan and the lowest-friction option. The Žabljak of this trip — one apartment for the whole midweek, every Salzkammergut anchor (Hallstatt, Gosausee, Krippenstein, Wolfgangsee, Schafberg) is 5-50 minutes away. Königssee is the one stretch — 1h30 day trip from here. 11 apartment options vetted, several with the working-farm + lake-edge vibes you loved at Apt Jezero.',
    pros: [
      'One apartment, no mid-week pack/unpack',
      'Closest base to Hallstatt + Gosausee + Krippenstein (5-35 min)',
      'Most vetted lodging options (11 picks, all real)',
      'Cheapest overall (lodging baseline)',
      'Ferienhof Osl + Gosau farm-stays = strongest Apt-Jezero matches',
    ],
    cons: [
      'Königssee + Hintersee become 1h30 day trips (still doable but a longer drive)',
      'Smaller grocery selection than Berchtesgaden side',
      'Hallstatt village gets cruise-ship-busy midday (Obertraun stays quiet)',
    ],
    costDeltaEur: 0,
    costDeltaNote: 'Baseline. Avg €142/night × 4 = €568 for the 4-night anchor.',
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
    nightsAtBase: '4 nights',
    pitch:
      "Bavarian Alps anchor. Königssee + Hintersee — the two 🌅🌅🌅 sunset spots — are 10 minutes from base. Almbachklamm gorge is 15 min. The trade-off: Hallstatt + Gosausee become 1h30 day trips. Better kosher-friendly Spar infrastructure (bigger Bavarian supermarkets than Obertraun's small ones). 5 verified apartment options including the Apt-Jezero-coded 2-BR Unterbrandnerlehen chalet 5 min from the Königssee shore.",
    pros: [
      'Königssee is 10 min away — turn the Tara-Bridge moment into a slow ritual, not a day trip',
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
    ],
    costDeltaEur: -40,
    costDeltaNote:
      'Avg €126/night × 4 = €504 for the 4-night anchor. Slightly cheaper than Obertraun (€64 saved) — Bavarian guest houses run a bit less than Hallstatt-area apartments.',
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

  // --- CONFIG C: SPLIT 2+2 ---
  {
    id: 'split',
    label: 'Config C — Split: 2 Obertraun + 2 Berchtesgaden',
    baseTown: 'Obertraun (2 nights) + Berchtesgaden (2 nights)',
    country: 'AT+DE',
    nightsAtBase: '2 + 2 nights',
    pitch:
      "Cover both clusters with their native bases. Both Königssee and Hallstatt-village end up 10 min from where you sleep — depending on which leg you're on. Trade-off: pack/unpack mid-week + 1h30 transfer drive on Tuesday morning. Best fit if neither cluster is willing to give up sunset proximity.",
    pros: [
      'Königssee + Hintersee at the door for Berchtesgaden leg',
      'Hallstatt + Gosausee + Krippenstein at the door for Obertraun leg',
      'No long day-trip drives — every sunset is local',
      'Two different apartment feels (Salzkammergut vs Bavarian)',
    ],
    cons: [
      'Mid-week pack/unpack — usually Tue morning',
      '1h30 transfer drive eats most of the morning',
      'Higher cancellation risk (two bookings)',
      'Slightly more expensive (no multi-night discount on either leg)',
    ],
    costDeltaEur: 35,
    costDeltaNote:
      'Avg €142/night × 2 + €126/night × 2 = €536 for the 4-night anchor. ~€35 more than Config A — minor surcharge for splitting.',
    flow: [
      {
        label: 'Sun-Mon (Obertraun leg)',
        text: 'Mirror-lake morning at Gosausee, Krippenstein 5fingers + Hallstatt evening, Obertraun dock sunsets.',
      },
      {
        label: 'Tue transfer',
        text: 'Pack out by 9, scenic drive via Bad Goisern + Salzburg bypass to Berchtesgaden (~1h30). Sunset stop en route at Werfen castle viewpoint.',
      },
      {
        label: 'Wed-Thu (Berchtesgaden leg)',
        text: 'Königssee on the last boat (peak moment), Hintersee glassy morning, Almbachklamm walk.',
      },
    ],
    driveMatrix: NATURE_DESTINATIONS.map((d) => {
      // Use the closer of the two bases for the matrix — "where you can sleep
      // closest to this destination during the week"
      const ober = d.fromHallstattMin;
      const berch = BERCHTESGADEN_DRIVE_TIMES[d.id] ?? d.fromSalzburgMin;
      const min = Math.min(ober, berch);
      return {
        destinationId: d.id,
        destinationName: d.name,
        fromBaseMin: min,
        bucket: bucket(min),
      };
    }),
    lodging: [
      // Top 2 Obertraun picks + top 2 Berchtesgaden picks. Labels prefix the
      // base so user knows which leg each is for.
      ...obertraunPicks()
        .slice(0, 3)
        .map((p) => ({ ...p, name: `[OBERTRAUN leg] ${p.name}` })),
      ...BERCHTESGADEN_LODGING.slice(0, 3).map((p) => ({
        ...p,
        name: `[BERCHTESGADEN leg] ${p.name}`,
      })),
    ],
    mapEmbedUrl: searchUrl('Obertraun, Austria to Berchtesgaden'),
    mapPinNote:
      'Two pins: Obertraun (Sun-Tue) + Berchtesgaden (Tue-Thu). Mid-week transfer = ~1h30 scenic drive.',
  },

  // --- CONFIG D: ST. WOLFGANG / WOLFGANGSEE ---
  {
    id: 'wolfgangsee',
    label: 'Config D — St. Wolfgang on Wolfgangsee',
    baseTown: 'St. Wolfgang + Strobl + St. Gilgen (Wolfgangsee)',
    country: 'AT',
    nightsAtBase: '4 nights',
    pitch:
      'The middle-of-everything pick. Wolfgangsee is roughly equidistant from Hallstatt (55 min), Salzburg (50 min), and Bad Ischl (15 min). Schafberg cog railway leaves IN the village — the 13-lake sunset panorama is a walk from your door. Walk-everywhere village vibe. Trade-off: Königssee + Hintersee become 1h30+ long-day drives. 5 verified apartment options, all lake-adjacent.',
    pros: [
      'Schafberg cog railway IS in town — 13-lake sunset without a drive',
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
    costDeltaEur: -16,
    costDeltaNote:
      'Avg €138/night × 4 = €552 for the 4-night anchor. Roughly the same as Obertraun (~€16 cheaper) — Strobl options run a bit less than Hallstatt-area.',
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
    description: 'Rental car pickup Fri Jul 24 ~08:00 + Friday Jul 31 5am flight out.',
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
