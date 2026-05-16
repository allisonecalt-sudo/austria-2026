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

export type BudgetTier = 'lean' | 'standard' | 'splurge';
export type LodgingPlatform = 'booking' | 'airbnb';

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
  walkToChabadMin?: number; // Salzburg base only — minutes walking to Linzergasse 76
  driveToAirportMin?: number; // Airport base only — minutes driving to SZG
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
  pickWalkToChabadMin?: number;
  pickDriveToAirportMin?: number;
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
  totalCostEur: 2410,
  totalCostNis: 9568,
  ceilingEur: 2800,
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
        'Studio apartment with kitchen, ON Linzergasse — same street as Chabad (Linzergasse 76). 5-min walk to shul, 600m from old-town center. The Budva-Chabad-proximity pattern from Montenegro: sleep where you daven.',
      pickBudgetTier: 'splurge',
      pickPlatform: 'booking',
      pickWalkToChabadMin: 5,
      alts: [
        {
          name: "Junker's Apartments",
          url: 'https://www.booking.com/hotel/at/junkers-appartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/221346620.webp?k=cf7d95a5626dc200e5d713cbfcf5178c20086fc6ce1292547b7a2ab635163644&o=',
          review: '9.6 · Exceptional · 389 reviews',
          pricePerNight: '€166 / night (₪658)',
          note: '40m² apartment with full kitchen, 1.9km from old town center, ~20-min walk to Chabad. Highest review score of any apartment in Salzburg — earned across 389 stays. Free cancellation.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 20,
        },
        {
          name: 'Sauerweingut',
          url: 'https://www.booking.com/hotel/at/sauerweingut.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/139315520.webp?k=e769157928a77f9d738239101a988db4b7b2cf615fa262ab0d05f88b775d4eca&o=',
          review: '9.3 · Superb · 633 reviews · Location 9.3',
          pricePerNight: '€217 / night (₪861)',
          note: 'Superior 60m² studio with kitchen, 1.3km from city center, ~15-min walk to Chabad. Big space, top-tier location score. Splurge tier but the room is twice the size of most.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 15,
        },
        {
          name: 'Villa Salzburg by Welcome to Salzburg',
          url: 'https://www.booking.com/hotel/at/fewo-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/243977766.webp?k=87715c16d9bf6945702f17d3962f6e763145ef0e4650bd98754e05f4077377c1&o=',
          review: '9.2 · Superb · 813 reviews',
          pricePerNight: '€222 / night (₪882)',
          note: '45m² Apartment Riedenburg with full kitchen, 1.2km from center (Riedenburg side, under the Mönchsberg). Free cancellation. 813 reviews = battle-tested by hundreds of guests.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 18,
        },
        {
          name: 'Pension Elisabeth — Rooms & Apartments',
          url: 'https://www.booking.com/hotel/at/pension-elisabeth-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/250951868.webp?k=e2d560ec802d63ccd55bffc86159644776bdc37ea72675cbe22822c5b68973d3&o=',
          review: '8.6 · Fabulous · 1,865 reviews',
          pricePerNight: '€160 / night (₪635)',
          note: 'Studio with terrace + kitchen in Schallmoos, 1.6km from old town. 1,865 reviews — most-reviewed apartment-stay in our shortlist. Walk to Chabad ~15 min.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 15,
        },
        {
          name: 'Amedeo Zotti Residence Salzburg',
          url: 'https://www.booking.com/hotel/at/amadeo-zotti-residence-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/572731112.webp?k=992f2f3014073eec44480ab8bebe5a04d7fbece0f6c9297a0e341d584fa7f6c9&o=',
          review: '8.3 · Very good · 1,808 reviews',
          pricePerNight: '€232 / night (₪922)',
          note: '39m² 1-bedroom apartment with kitchen, Schallmoos, 2.2km from center, ~18-min walk to Chabad. 1,808 reviews. Free cancellation. The "we just want a reliable established place" pick — flagged: 8.3 is below our 8.5 bar but kept for the review-volume signal.',
          budgetTier: 'splurge',
          platform: 'booking',
          walkToChabadMin: 18,
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
      item: 'Lake Bled detour into Slovenia',
      reason:
        'Adds 6 hours of driving for one more lake. The Hallstatt-area lakes already deliver the storybook reflection. Save Bled for a Slovenia-specific trip.',
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
