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
  alts: {
    name: string;
    url: string;
    img: string;
    review: string;
    pricePerNight: string;
    note: string;
  }[];
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
    "Friday Jul 24 — Friday Jul 31, 2026. Allison and Avital. Nature-focused, sunset-obsessed, Salzburg-anchored for Shabbat. Built on the Montenegro template: one nature anchor for the bulk of the week, apartments with kitchens, picnics on rocks, sunsets every single night.",
  whyThisPlan:
    "Land Friday morning in Salzburg, settle in for Shabbat 5 minutes from Chabad. Sunday after Havdalah we move east into the Salzkammergut lakes — Hallstatt area for 4 deep nights (the Žabljak of this trip). Day trips from there to Königssee, Gosausee, Wolfgangsee, Werfen ice cave. Thursday we drive back to a quiet apartment 4 km from Salzburg airport so Friday morning's flight is a 10-minute drive. Two moves total. Every night ends at a named sunset spot with a real time.",
  natureAnchor:
    "Hallstatt / Obertraun / Bad Goisern (Salzkammergut). 1h15m east of Salzburg. From this base, day-trip range covers Königssee (1h15m), Gosausee (35min), Wolfgangsee (45min), Dachstein 5fingers (15min by gondola), Werfen ice caves (1h). The deep-immersion stay that earned its name in Montenegro at Žabljak.",
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
        "If jet lag is mild: skip the nap, slow walk into the Altstadt for coffee in a square before Shabbat prep.",
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
        "Shul at Chabad, long kiddush lunch, deep nap. Late afternoon walk up the Mönchsberg via the stone stairs (no money, no electric lift — pure Shabbat-legal). Ridge walk along the top of the old town. Sunset from the Salzach river bank. Havdalah 21:49.",
      planB:
        "Stay close: Mirabell Gardens bench, river walk both directions, skip the Mönchsberg climb.",
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
        "Pack out of Salzburg after a slow morning. Drive east via Bad Ischl (Spar restock). Stop at Vorderer Gosausee — a flat hour-long loop around the lake with the Dachstein glacier mirrored in the water. Lakeside picnic. Continue to the Obertraun apartment (the Žabljak of this trip — 4 nights here, the deep base). Sunset over Lake Hallstatt from the Obertraun dock, 5 minutes from the door.",
      planB:
        "If Shabbat tired the legs: skip Gosausee, drive direct via Bad Ischl for coffee, settle into the apartment for a long balcony afternoon.",
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
        "Two gondolas up to Krippenstein (2,109 m) — gondolas do the climbing. Flat 20-min walk to the 5fingers viewing platform jutting 400 m straight out over the Hallstatt valley. Photo paradise, no real hiking. Down for lunch and an afternoon in Hallstatt Markt; ride the Skywalk funicular for the 360° view; sunset on the lakeside walkway as the painted houses go gold. Combo ticket €43pp for Krippenstein, €20pp for the Skywalk.",
      planB:
        "Skip the gondolas: Hallstatt Markt + Skywalk only, then a long balcony afternoon at the apartment, sunset from the Obertraun dock.",
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
        "Cut the Obersee leg — boat round-trip to St. Bartholomä only (€18pp). Lakeside meadow picnic, back to Hallstatt by mid-afternoon, sunset from the Obertraun dock.",
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
        "Last boat back at sunset = the Tara Bridge of this trip. See peak-moment note.",
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
        "Slow morning after the big Königssee day. Drive over to St. Wolfgang am Wolfgangsee. Lakeside promenade walk, optional swim at the public Strandbad. Coffee in town. Schafbergbahn cog railway up at 18:00 (€46pp r/t, BOOK AHEAD — sells out in July). 40 minutes of steep cog climb to a 1,783 m summit ridge. Walk the easy ridge to the Schafbergspitze hotel terrace. Sunset over thirteen Salzkammergut lakes — Wolfgangsee, Mondsee, Attersee, Fuschlsee all visible at once. Last cog train down.",
      planB:
        "Lake day only — skip the summit cog. Promenade + swim + a 45-min boat across to St. Gilgen and back (€15pp). Sunset from the Obertraun shore.",
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
      headline: "Werfen ice cave → drive back to Salzburg airport-side",
      hero: {
        src: IMG.werfen,
        alt: 'Hohenwerfen castle perched on a rocky crag above the Salzach valley near Werfen',
        credit: IMG_CREDIT.werfen,
      },
      generalIdea:
        "Pack out west. Eisriesenwelt — world's largest ice cave: 20-min uphill walk to the cable car, cable car up, 15-min walk to the entrance, then a 75-min underground tour with carbide lamps and 1,400 stairs. Bring a fleece. €42pp combo, BOOK ONLINE the night before (July sells out). Drive on to the airport-side apartment, one last Salzburg evening — Altstadt loop, gelato, walk up the Mönchsberg from Toscaninihof for the final sunset.",
      planB:
        "Skip the cave: photograph Hohenwerfen castle from the road, slow drive to the airport apartment, light afternoon, sunset from the balcony.",
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
        "Early wake. Last coffee in the same kitchen you started in. Ten-minute drive to the terminal, drop the rental car, window seat home. Sunset already in Tel Aviv by the time you land.",
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
      baseKey: 'salzburg',
      nights: 'Fri Jul 24 – Sun Jul 26 (2 nights)',
      area: 'Andräviertel, near Linzergasse (5-min walk to Chabad Salzburg)',
      pickName: 'master Linzergasse',
      pickUrl: 'https://www.booking.com/hotel/at/master-linzergasse.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/474092866.webp?k=a9eb0579f7697c620a3882666545cdbb7bae93ae9281b0247269232ff2abc0d4&o=',
      pickReview: '9.2 · Wonderful · 2,308 reviews',
      pickPrice: '€128 / night (₪510)',
      pickWhy:
        'Studio apartment with kitchen, 600m from old-town center, ON Linzergasse — same street as Chabad Salzburg (Linzergasse 76). Walking distance from anywhere meaningful for Shabbat. The Budva-Chabad-proximity pattern from Montenegro.',
      alts: [
        {
          name: "Junker's Apartments",
          url: 'https://www.booking.com/hotel/at/junkers-appartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/221346620.webp?k=cf7d95a5626dc200e5d713cbfcf5178c20086fc6ce1292547b7a2ab635163644&o=',
          review: '9.6 · Exceptional',
          pricePerNight: '€91 / night (₪361)',
          note: '40m² apartment with kitchen, 1.9km from old town. Best value pick — sub-€100/night, exceptional reviews. Free cancellation.',
        },
        {
          name: 'Pension Elisabeth — Rooms & Apartments',
          url: 'https://www.booking.com/hotel/at/pension-elisabeth-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/250951868.webp?k=e2d560ec802d63ccd55bffc86159644776bdc37ea72675cbe22822c5b68973d3&o=',
          review: '8.6 · Excellent',
          pricePerNight: '€80 / night (₪317)',
          note: 'Studio with terrace and kitchen. 1.6km from old town. Cheapest of the pack while still meeting the 8.5+ bar.',
        },
      ],
    },
    {
      baseKey: 'hallstatt',
      nights: 'Sun Jul 26 – Thu Jul 30 (4 nights)',
      area: 'Obertraun (5 min from Hallstatt by car) — the Žabljak equivalent: lake-adjacent, quiet, full apartment',
      pickName: 'Haus Edelweiss (Obertraun)',
      pickUrl: 'https://www.booking.com/hotel/at/haus-edelweiss-obertraun.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/506509432.webp?k=29d77bd1dd210a101fa445b3dc5caac41d37ef7b8ac5bd504e28fdd3b59b42f0&o=',
      pickReview: '9.4 · Wonderful · 258 reviews',
      pickPrice: '€142 / night (₪563)',
      pickWhy:
        '54m² 1-bedroom apartment with balcony, full kitchen, living room. 3km from Hallstatt — close enough for evenings, far enough for quiet. Right at the foot of the Dachstein cable car. Free cancellation. The Apartmani Jezero of this trip.',
      alts: [
        {
          name: 'Ferienhof Osl (Obertraun)',
          url: 'https://www.booking.com/hotel/at/ferienhof-osl-urlaub-am-bauernhof.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/16860996.webp?k=2bc9d7e477477eb1fb17858d6f854b5a7d857dd1b4cf6f03b4b1def04c8b86e3&o=',
          review: '9.2 · Wonderful',
          pricePerNight: '€138 / night (₪548)',
          note: 'WORKING FARMHOUSE (urlaub am bauernhof = "farm vacation"). 30m² studio with balcony, 3.7km from Hallstatt. Goats and horses outside, lake walking distance, local family running it. Most Žabljak-coded option.',
        },
        {
          name: 'Austrian Apartments (Bad Goisern)',
          url: 'https://www.booking.com/hotel/at/austria-apartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/680881702.webp?k=5280eca98f2aeb08f8cda08936a27de206b90945809344c6ce032c9c2f968d02&o=',
          review: '9.5 · Exceptional',
          pricePerNight: '€134 / night (₪531)',
          note: 'Studio apartment with kitchen, 6.6km from Hallstatt. Bad Goisern itself has a Spar within walking distance. Free cancellation.',
        },
      ],
    },
    {
      baseKey: 'airport',
      nights: 'Thu Jul 30 – Fri Jul 31 (1 night)',
      area: 'Salzburg west, ~4 km from W. A. Mozart airport (10-min drive to terminal)',
      pickName: 'morand I Apartments',
      pickUrl: 'https://www.booking.com/hotel/at/studio-velvet.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/653396353.webp?k=1bb7f1a7fa700e41621b17a8fd92d3491831f63d15ce4a18ac0462e48920f210&o=',
      pickReview: '8.7 · Excellent · 336 reviews',
      pickPrice: '€203 / night (₪806)',
      pickWhy:
        '1-bedroom apartment, 30m², 4.1km from Salzburg airport. Free cancellation. Quiet enough to pack at 5am for the early flight — but ALSO 10 min from central Salzburg so the Thursday-evening Mönchsberg sunset is still close.',
      alts: [
        {
          name: 'Hotel Astoria (apartment-style)',
          url: 'https://www.booking.com/hotel/at/hotelastoriasalzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/384925943.webp?k=ac914eb88a1a5777c6911c69d0d7fb8e12e377b99cf1fcf4fd2293020d0f1e65&o=',
          review: '8.0 · Very Good',
          pricePerNight: '€245 / night (₪973)',
          note: '45m² apartment with kitchen, 2.3km from airport — CLOSEST to the terminal. 2,759 reviews — extremely established.',
        },
        {
          name: 'Rock Salzburg',
          url: 'https://www.booking.com/hotel/at/rock-salzburg.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/577305861.webp?k=b9a5438f173df851e9f2840d8eb1ce9313afa85205fb44ed9e9882450f585bc4&o=',
          review: '9.4 · Wonderful',
          pricePerNight: '€294 / night (₪1,166)',
          note: '20m² 1-bedroom apartment, 4km from airport, 250m from downtown. Premium for the last night if Allison wants to splurge on the final breakfast in town.',
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
      reason: 'Cute but indoor. This trip is for nature. Use Salzburg as Shabbat base, not destination.',
    },
    {
      item: 'Hallstatt salt mine tour',
      reason: '90 min indoors on a Disneyland-style mine train. The Dachstein 5fingers + Skywalk give the views without the gimmick.',
    },
    {
      item: "Eagle's Nest / Kehlsteinhaus (Berchtesgaden)",
      reason: "Historically heavy (Hitler's tea house). Königssee is the better Berchtesgaden day, full stop.",
    },
    {
      item: 'Lake Bled detour into Slovenia',
      reason: 'Adds 6 hours of driving for one more lake. The Hallstatt-area lakes already deliver the storybook reflection. Save Bled for a Slovenia-specific trip.',
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
      reason: 'The v1 mistake. We do general ideas now — one plan per day with a one-line Plan B if needed.',
    },
  ],
};
