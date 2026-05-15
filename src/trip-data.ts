// Canonical itinerary data — v2 rewrite (2026-05-15).
// Single-spine 7-night trip, hour-by-hour, with per-day Plan A / Plan B.
// Salzburg base (Fri-Sun for Shabbat), Hallstatt area anchor (Sun-Thu, 4 nights),
// Salzburg airport-side return (Thu-Fri, 1 night) for early Friday flight.
//
// Booking.com listings verified live 2026-05-15 via Playwright. Per-night EUR
// computed from displayed NIS at ₪3.97/€1.
//
// Sunset times: timeanddate.com Salzburg / Hallstatt (47.5° N), late July 2026.
// Drive times: Google Maps consensus.

export interface ScheduleBlock {
  time: string; // "08:30", "12:00", etc.
  what: string;
}

export interface DayPlan {
  label: string; // "Plan A" / "Plan B"
  headline: string;
  energy: string; // "primary / full day" or "lighter / if tired"
  blocks: ScheduleBlock[];
}

export interface Day {
  id: string;
  date: string; // "2026-07-24"
  dayOfWeek: string; // "Friday"
  dateLabel: string; // "Friday Jul 24"
  title: string;
  summary: string; // 1-2 sentence morning/afternoon/sunset distillation
  imgUrl: string;
  imgAlt: string;
  imgCredit?: string; // Wikimedia / Unsplash attribution
  sunsetTime: string; // "20:55"
  sunsetSpot: string; // e.g. "Hintersee dock"
  sunsetMapsQuery?: string; // Maps query string for the sunset spot, if linkable
  driveSummary: string;
  driveFrom?: string; // optional Maps origin
  driveTo?: string; // optional Maps destination (renders driveSummary as directions link)
  sleepWhere: string; // referenced lodging key
  walkingNote: string;
  meals: string;
  planA: DayPlan;
  planB: DayPlan;
  tarabridgeMoment?: string;
}

export interface Lodging {
  baseKey: 'salzburg' | 'hallstatt' | 'airport';
  nights: string; // "Fri Jul 24 – Sun Jul 26 (2 nights)"
  area: string;
  pickName: string;
  pickUrl: string;
  pickImg: string;
  pickReview: string;
  pickPrice: string; // per night EUR
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
// actually shows the named place; fail-loud rule). Unsplash only for the
// fly-home day where stake is low (generic dawn/clouds).
//
// Thumbnail width 1280px = a sanctioned size per MediaWiki $wgThumbnailSteps
// (others: 20/40/60/120/250/330/500/960/1280/1920/3840). Using 1280 keeps
// payloads ~150-300KB per photo on mobile while still sharp on 21:9 desktop.
// Sources verified 2026-05-15 by Claude via Wikimedia category lookups.
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

// Photo credits (kept here so future audits can verify provenance fast).
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

export const TRIP: TripData = {
  intro:
    "Friday Jul 24 — Friday Jul 31, 2026. Allison and Avital. Nature-focused, sunset-obsessed, Salzburg-anchored for Shabbat. Built on the Montenegro template: one nature anchor for the bulk of the week, apartments with kitchens, picnics on rocks, sunsets every single night.",
  whyThisPlan:
    "Land Friday morning in Salzburg, settle in for Shabbat 5 minutes from Chabad. Sunday after Havdalah we move east into the Salzkammergut lakes — Hallstatt area for 4 deep nights (the Žabljak of this trip). Day trips from there to Königssee, Gosausee, Wolfgangsee, Werfen ice cave. Thursday we drive back to a quiet apartment 4 km from Salzburg airport so Friday morning's flight is a 10-minute drive. Two moves total. Every night ends at a named sunset spot with a real time.",
  natureAnchor:
    "Hallstatt / Obertraun / Bad Goisern (Salzkammergut). 1h15m east of Salzburg. From this base, day-trip range covers Königssee (1h15m), Gosausee (35min), Wolfgangsee (45min), Dachstein 5fingers (15min by gondola), Werfen ice caves (1h). Apartments here run €130-150/night with kitchen + balcony, vs €280-320/night for in-Hallstatt-Markt. The deep-immersion stay that earned its name in Montenegro at Žabljak.",
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
      dateLabel: 'Friday July 24',
      title: 'Land Salzburg — settle in for Shabbat',
      summary:
        "Land 8am exhausted. Nap. Stock the apartment from Spar on Linzergasse. Walk into Shabbat — candle-lighting 20:35, Chabad three minutes from the door.",
      imgUrl: IMG.salzburgRiver,
      imgAlt: 'Salzach river running through Salzburg old town beneath the Mönchsberg',
      imgCredit: IMG_CREDIT.salzburgRiver,
      sunsetTime: '20:55',
      sunsetSpot: 'Apartment / Chabad table (in by candle-lighting 20:35)',
      sunsetMapsQuery: 'Chabad Salzburg Linzergasse 76',
      driveSummary: 'Airport → apartment 15 min · no other driving',
      driveFrom: 'Salzburg Airport',
      driveTo: 'Linzergasse, Salzburg',
      sleepWhere: 'salzburg',
      walkingNote: 'Flat town walking only. Chabad 5 min, old town 8 min.',
      meals:
        'Lunch: shelf-stable from Israel (tuna/crackers/avocado from a Spar stop). Dinner: Chabad Friday-night meal OR self-catered (challah pickup at Mann\'s Bakery on Linzergasse if open; cholent/dips/cheese from Spar).',
      planA: {
        label: 'Plan A',
        headline: 'Recover-and-prep · primary',
        energy: 'low — they land exhausted',
        blocks: [
          { time: '08:00', what: 'Land Salzburg W. A. Mozart airport (SZG). Bags, customs.' },
          { time: '08:45', what: 'Pick up rental car from airport counter.' },
          { time: '09:15', what: 'Drive to apartment (15 min, Andräviertel near Linzergasse).' },
          { time: '09:45', what: 'Drop bags. Apartment may not be ready — leave luggage, head out.' },
          { time: '10:00', what: 'Spar on Linzergasse for Shabbat stock: sealed-hechsher dairy, produce, water, challah if available. Mann\'s Bakery (Linzergasse 22) for backup challah.' },
          { time: '11:30', what: 'Back to apartment. Unpack. Quick coffee. SLEEP — 2-3 hour nap.' },
          { time: '15:00', what: 'Wake. Shower. Prep Shabbat — cold salads (quinoa-avocado-chickpea Montenegro-style), set out food, set up Shabbat-mode (lights/hot plate).' },
          { time: '17:30', what: 'Slow walk along the Salzach to Mirabell Gardens (5 min). Decompress.' },
          { time: '19:00', what: 'Home. Final prep.' },
          { time: '20:35', what: 'Candle lighting. Walk to Chabad (Linzergasse 76, ~3 min) for Friday-night service + dinner. OR self-cater at apartment if pre-booking Chabad failed.' },
          { time: '23:00', what: 'Home. Sleep hard.' },
        ],
      },
      planB: {
        label: 'Plan B',
        headline: 'Old-town wander · if jet lag is mild',
        energy: 'low-medium',
        blocks: [
          { time: '08:00', what: 'Land. Car. Apartment by 9:30.' },
          { time: '10:00', what: 'Spar run (same).' },
          { time: '11:00', what: 'Power nap until 13:00.' },
          { time: '13:30', what: 'Walk into the Altstadt — Getreidegasse, Domplatz, Mozartplatz. Take it slow. Coffee in a square.' },
          { time: '16:00', what: 'Back at apartment. Shabbat prep.' },
          { time: '19:00', what: 'Final prep.' },
          { time: '20:35', what: 'Candle lighting + Chabad / dinner at home.' },
        ],
      },
    },

    // --- DAY 2 — Sat Jul 25 ---
    {
      id: 'sat-jul-25',
      date: '2026-07-25',
      dayOfWeek: 'Saturday',
      dateLabel: 'Saturday July 25',
      title: 'Shabbat in Salzburg — walking only',
      summary:
        "Shul at Chabad, kiddush lunch, long nap. Late afternoon walk up the Mönchsberg stone stairs to the ridge above the old town. Havdalah at the apartment at 21:49.",
      imgUrl: IMG.salzburgFortress,
      imgAlt: 'Hohensalzburg fortress on the Festungsberg above the Salzburg old town',
      imgCredit: IMG_CREDIT.salzburgFortress,
      sunsetTime: '20:54',
      sunsetSpot: 'Salzach river bank from Elisabethkai',
      sunsetMapsQuery: 'Elisabethkai Salzburg',
      driveSummary: 'No driving — Shabbat.',
      sleepWhere: 'salzburg',
      walkingNote: 'Town only. Mirabell, Salzach path, Mönchsberg stairs accessible from old town side.',
      meals:
        'Breakfast: leftover challah + dairy at apartment. Lunch: Chabad kiddush + meal (~5 min walk) OR cholent + cold salads at home. Seudah shlishit at home.',
      planA: {
        label: 'Plan A',
        headline: 'Shul + long Mönchsberg afternoon · primary',
        energy: 'medium — walking, no rush',
        blocks: [
          { time: '08:30', what: 'Slow breakfast at apartment.' },
          { time: '09:30', what: 'Shul at Chabad Salzburg, Linzergasse 76. ~3-min walk. Service runs ~2 hrs.' },
          { time: '12:30', what: 'Shabbat lunch at Chabad — sit next to someone new. This is the Shaindy-at-Budva moment of the trip.' },
          { time: '15:00', what: 'Home. Long nap.' },
          { time: '17:30', what: 'Walk to Toscaninihof, up the Mönchsberg via the stone stairs (no money, no electric lift — pure Shabbat-legal). ~15-min ascent. Walk the ridge to the Modern Art Museum terrace for the city view.' },
          { time: '19:30', what: 'Slowly descend via the Festungsgasse path (skip the fortress lift). Walk through the old town as the gold-hour light hits the buildings.' },
          { time: '20:54', what: 'Sunset from the Salzach river bank.' },
          { time: '21:49', what: 'Havdalah at apartment.' },
        ],
      },
      planB: {
        label: 'Plan B',
        headline: 'Stay close · low-key day',
        energy: 'low',
        blocks: [
          { time: '09:30', what: 'Shul at Chabad.' },
          { time: '12:30', what: 'Chabad lunch.' },
          { time: '15:00', what: 'Long nap.' },
          { time: '17:30', what: 'Slow walk to Mirabell Gardens (5 min). Sit on a bench. Read.' },
          { time: '19:30', what: 'Walk along the river both directions.' },
          { time: '21:49', what: 'Havdalah.' },
        ],
      },
    },

    // --- DAY 3 — Sun Jul 26 ---
    {
      id: 'sun-jul-26',
      date: '2026-07-26',
      dayOfWeek: 'Sunday',
      dateLabel: 'Sunday July 26',
      title: 'Move to Hallstatt — Gosausee mirror lake on the way',
      summary:
        "Pack out east via Bad Ischl. Hour-long flat loop around Vorderer Gosausee with the Dachstein mirrored in front of you. Unpack for four nights in Obertraun. Sunset over Lake Hallstatt from your new dock.",
      imgUrl: IMG.gosausee,
      imgAlt: 'Vorderer Gosausee with the Dachstein massif reflected in the water',
      imgCredit: IMG_CREDIT.gosausee,
      sunsetTime: '20:53',
      sunsetSpot: 'Lake Hallstatt dock at Obertraun (5 min from apartment)',
      sunsetMapsQuery: 'Obertraun Hallstätter See',
      driveSummary:
        'Salzburg → Vorderer Gosausee 1h10m (via Bad Ischl + Gosau) → Hallstatt area 35 min · ~2h driving + stops',
      driveFrom: 'Salzburg, Austria',
      driveTo: 'Obertraun, Austria',
      sleepWhere: 'hallstatt',
      walkingNote: 'Gosausee lake loop is flat ~1h, gravel + boardwalk. Easy.',
      meals:
        'Breakfast: apartment leftovers + coffee. Lunch: lakeside picnic at Gosausee (quinoa/cucumber/tuna/sealed cheese). Dinner: groceries at apartment after settling in.',
      planA: {
        label: 'Plan A',
        headline: 'Gosausee loop on the move · primary',
        energy: 'medium — driving + 1hr lake walk',
        blocks: [
          { time: '08:30', what: 'Pack out of Salzburg apartment. Coffee at home.' },
          { time: '09:30', what: 'Leave Salzburg. Drive east via Bad Ischl.' },
          { time: '10:45', what: 'Stop at Spar in Bad Ischl for fresh produce + dairy restock.' },
          { time: '11:15', what: 'Continue to Vorderer Gosausee. Park (free).' },
          { time: '11:45', what: 'Walk the flat loop around Vorderer Gosausee — ~1 hr, lake mirrors the Dachstein glacier behind. Photo paradise.' },
          { time: '13:00', what: 'Lakeside picnic on a bench.' },
          { time: '14:00', what: 'Drive to Hallstatt area apartment (~35 min via Gosau pass).' },
          { time: '15:00', what: 'Check in. Unpack — this is the 4-night base. Coffee on the balcony.' },
          { time: '17:30', what: 'Walk down to the lake shore in Obertraun.' },
          { time: '20:53', what: 'Sunset over Lake Hallstatt from the Obertraun dock.' },
          { time: '21:30', what: 'Dinner at apartment.' },
        ],
      },
      planB: {
        label: 'Plan B',
        headline: 'Direct drive · if tired from Shabbat',
        energy: 'low',
        blocks: [
          { time: '10:00', what: 'Pack out, slow start.' },
          { time: '11:00', what: 'Leave Salzburg.' },
          { time: '12:15', what: 'Bad Ischl: Spar + coffee + ice cream at Café Zauner (cash, sealed kosher items only).' },
          { time: '13:30', what: 'Drive direct to Hallstatt area apartment. Skip Gosausee, save for another day.' },
          { time: '14:30', what: 'Check in. Unpack. Long balcony afternoon.' },
          { time: '17:00', what: 'Walk to the lake.' },
          { time: '20:53', what: 'Sunset at Obertraun dock.' },
        ],
      },
    },

    // --- DAY 4 — Mon Jul 27 ---
    {
      id: 'mon-jul-27',
      date: '2026-07-27',
      dayOfWeek: 'Monday',
      dateLabel: 'Monday July 27',
      title: 'Hallstatt village + Dachstein 5fingers viewing platform',
      summary:
        "Two gondolas to Krippenstein, flat walk to the 5fingers platform jutting 400m over the valley. Down for Hallstatt Markt in the afternoon, Skywalk funicular for the 360° view, sunset on the lakeside walkway.",
      imgUrl: IMG.hallstattLake,
      imgAlt: 'Hallstatt village boathouses along the lake at the foot of alpine slopes',
      imgCredit: IMG_CREDIT.hallstattLake,
      sunsetTime: '20:51',
      sunsetSpot: 'Hallstatt Markt lakeside walkway',
      sunsetMapsQuery: 'Hallstatt Markt',
      driveSummary:
        'Obertraun → Krippenstein cable-car base 5 min · → Hallstatt Markt 8 min · all local',
      sleepWhere: 'hallstatt',
      walkingNote: '5fingers platform: 20 min flat walk from top gondola station. Skywalk: 5 min from funicular top.',
      meals:
        'Breakfast: apartment. Lunch: pack from apartment + summit cafe coffee. Dinner: apartment.',
      planA: {
        label: 'Plan A',
        headline: 'Krippenstein 5fingers + Hallstatt evening · primary',
        energy: 'medium — gondolas do the climbing',
        blocks: [
          { time: '08:30', what: 'Coffee at apartment.' },
          { time: '09:30', what: 'Drive to Dachstein Krippenstein cable car base (Obertraun, 5 min from apt). Buy combo ticket €43pp.' },
          { time: '10:00', what: 'Take TWO gondolas up to Krippenstein top station (2,109 m).' },
          { time: '10:45', what: 'Flat 20-min walk to the 5fingers viewing platform — a 5-pronged steel platform jutting 400m straight out over the Hallstatt lake valley. Through-the-grate view down.' },
          { time: '11:30', what: 'Continue to Welterbespirale + Heilbronn cross viewpoints (15 more min, gentle).' },
          { time: '13:00', what: 'Lunch at the Krippenstein Lodge terrace (your packed food + their coffee).' },
          { time: '14:30', what: 'Gondolas down.' },
          { time: '15:30', what: 'Drive to Hallstatt Markt (8 min). Park at P1 (cars not allowed in village core). Walk the lakeside boardwalk into the village.' },
          { time: '16:30', what: 'Hallstatt Skywalk — Salzbergbahn funicular up (€20pp). 360° platform 360m above the village.' },
          { time: '18:00', what: 'Funicular back down. Lakeside coffee in Hallstatt Markt.' },
          { time: '20:51', what: 'Sunset on the Hallstatt Markt lakeside walkway. Last gold light on the painted houses.' },
          { time: '21:30', what: 'Drive back to apartment. Dinner.' },
        ],
      },
      planB: {
        label: 'Plan B',
        headline: 'Skywalk only · skip the gondolas',
        energy: 'low — half-day',
        blocks: [
          { time: '10:00', what: 'Coffee. Slow morning.' },
          { time: '11:00', what: 'Drive to Hallstatt Markt P1.' },
          { time: '11:30', what: 'Funicular + Skywalk.' },
          { time: '13:00', what: 'Lake-side lunch in Hallstatt Markt.' },
          { time: '15:00', what: 'Back at apartment. Long balcony afternoon. Read, nap, restock.' },
          { time: '19:00', what: 'Easy walk along Obertraun shore.' },
          { time: '20:51', what: 'Sunset at the apartment balcony / Obertraun dock.' },
        ],
      },
    },

    // --- DAY 5 — Tue Jul 28 ---
    {
      id: 'tue-jul-28',
      date: '2026-07-28',
      dayOfWeek: 'Tuesday',
      dateLabel: 'Tuesday July 28',
      title: 'Königssee day — electric boats + St. Bartholomä',
      summary:
        "Drive over to Schönau early. Silent electric boat to St. Bartholomä and on to Salet — Obersee picnic at the back of the fjord. Last boat back at sunset: Watzmann goes gold, the lake goes silver. This is the trip's Tara Bridge.",
      imgUrl: IMG.konigssee,
      imgAlt: 'St. Bartholomä church on the Königssee with the Watzmann east wall behind',
      imgCredit: IMG_CREDIT.konigssee,
      sunsetTime: '20:50',
      sunsetSpot: 'On the last electric boat returning from St. Bartholomä',
      sunsetMapsQuery: 'St. Bartholomä Königssee',
      driveSummary: 'Hallstatt area → Königssee Schönau 1h15m · same drive back',
      driveFrom: 'Obertraun, Austria',
      driveTo: 'Schönau am Königssee, Germany',
      sleepWhere: 'hallstatt',
      walkingNote: 'Boat-served. Optional 40-min flat walk to Obersee from Salet dock.',
      meals:
        'Breakfast: apartment. Lunch: full picnic on the St. Bartholomä meadow. Dinner: at apartment back at Hallstatt — leftovers, pasta night.',
      tarabridgeMoment:
        "Last boat back at sunset = the Tara Bridge of this trip. See peak-moment note.",
      planA: {
        label: 'Plan A',
        headline: 'St. Bartholomä + Obersee · the peak day',
        energy: 'medium-high — long day, mostly boats and flat walks',
        blocks: [
          { time: '07:30', what: 'Early coffee. Pack the big picnic.' },
          { time: '08:00', what: 'Leave Hallstatt area. Drive west via Salzburg ring road.' },
          { time: '09:15', what: 'Arrive Schönau am Königssee. Park (€5).' },
          { time: '09:45', what: 'Buy return ticket all the way to Salet (€24pp).' },
          { time: '10:00', what: 'First boat. 35 min silent electric glide to St. Bartholomä — the famous onion-domed church on the lake meadow.' },
          { time: '10:45', what: 'Coffee + photos at St. Bartholomä. Walk the lakeside meadow.' },
          { time: '11:30', what: 'Connecting boat to Salet (15 min more, deeper into the fjord).' },
          { time: '12:00', what: 'Flat 20-min walk from Salet dock to Obersee — quieter, more dramatic, fewer people.' },
          { time: '12:30', what: 'Lakeside picnic at Obersee. This is THE picnic spot of the trip.' },
          { time: '14:30', what: 'Walk back to Salet dock.' },
          { time: '15:00', what: 'Boat back to St. Bartholomä. Linger another hour at the church meadow.' },
          { time: '18:30', what: 'LAST BOAT back to Schönau. 35 min. Watzmann east wall going gold; lake going silver. THIS is the Tara Bridge moment.' },
          { time: '19:30', what: 'Disembark Schönau. Drive back toward Hallstatt.' },
          { time: '20:50', what: 'Sunset somewhere on the autobahn — pull over at a rest stop if a good ridge shows up.' },
          { time: '22:00', what: 'Back at apartment. Late dinner.' },
        ],
      },
      planB: {
        label: 'Plan B',
        headline: 'St. Bartholomä only · cut the Obersee leg',
        energy: 'medium',
        blocks: [
          { time: '08:30', what: 'Coffee. Pack lunch.' },
          { time: '09:00', what: 'Leave. Drive 1h15.' },
          { time: '10:15', what: 'Schönau parking.' },
          { time: '10:45', what: 'Boat to St. Bartholomä (€18pp return only to here).' },
          { time: '11:20', what: 'St. Bartholomä — meadow, church photos.' },
          { time: '12:30', what: 'Picnic on the lakeside meadow.' },
          { time: '14:30', what: 'Boat back. Schönau by 15:15.' },
          { time: '15:30', what: 'Drive back. Light afternoon.' },
          { time: '17:00', what: 'Apartment. Restock.' },
          { time: '20:50', what: 'Sunset at the Obertraun dock back home — still a sunset.' },
        ],
      },
    },

    // --- DAY 6 — Wed Jul 29 ---
    {
      id: 'wed-jul-29',
      date: '2026-07-29',
      dayOfWeek: 'Wednesday',
      dateLabel: 'Wednesday July 29',
      title: 'Wolfgangsee + Schafberg cog railway at sunset',
      summary:
        "Easy lake-day morning in St. Wolfgang — promenade, swim. Schafbergbahn cog railway up at 18:00 (booked ahead). Packed dinner on the summit ridge with thirteen Salzkammergut lakes spread below. Sunset 20:48. Last cog train down.",
      imgUrl: IMG.wolfgangsee,
      imgAlt: 'St. Wolfgang village on the Wolfgangsee with the Schafberg massif beyond',
      imgCredit: IMG_CREDIT.wolfgangsee,
      sunsetTime: '20:48',
      sunsetSpot: 'Schafberg summit ridge (1,783 m) — 13-lake panorama',
      sunsetMapsQuery: 'Schafbergspitze Schafberg Austria',
      driveSummary: 'Hallstatt area → St. Wolfgang am Wolfgangsee 45 min · same back',
      driveFrom: 'Obertraun, Austria',
      driveTo: 'St. Wolfgang im Salzkammergut',
      sleepWhere: 'hallstatt',
      walkingNote: 'Cog railway up + 30-min ridge walk at summit. Bring layer — summit ~12°C even in July.',
      meals:
        'Breakfast: apartment. Lunch: in St. Wolfgang lakeside (picnic). Summit dinner = packed sandwiches + Schafbergspitze cafe coffee/tea.',
      planA: {
        label: 'Plan A',
        headline: 'Sunset cog · the trip\'s second peak moment',
        energy: 'medium-high — late evening',
        blocks: [
          { time: '10:00', what: 'Slow morning at apartment after the big Königssee day.' },
          { time: '11:30', what: 'Drive to St. Wolfgang am Wolfgangsee.' },
          { time: '12:15', what: 'Walk the lakefront promenade. Lakeside picnic.' },
          { time: '14:00', what: 'Lake swim from the public Strandbad (warm-ish in late July, ~22°C).' },
          { time: '16:00', what: 'Coffee in St. Wolfgang.' },
          { time: '17:30', what: 'Schafbergbahn cog railway BOOKED IN ADVANCE for the 18:00 ascent (€46pp r/t, last train back is the late one). 40 min steep cog climb.' },
          { time: '18:50', what: 'Summit station 1,783 m. Walk the easy ridge to the Schafbergspitze hotel terrace (20 min).' },
          { time: '19:30', what: 'Packed dinner on the ridge. View: 13 Salzkammergut lakes spread below — Wolfgangsee, Mondsee, Attersee, Fuschlsee all visible.' },
          { time: '20:48', what: 'SUNSET from the Schafberg ridge. This is the second peak moment — Black-Lake-reveal energy.' },
          { time: '21:15', what: 'LAST cog train down (book this seat — runs once after sunset in summer).' },
          { time: '22:00', what: 'Drive back to apartment.' },
          { time: '23:00', what: 'Home.' },
        ],
      },
      planB: {
        label: 'Plan B',
        headline: 'Lake day only · skip the summit',
        energy: 'low',
        blocks: [
          { time: '09:30', what: 'Coffee. Drive to St. Wolfgang.' },
          { time: '10:30', what: 'Promenade walk + lake swim.' },
          { time: '12:30', what: 'Lakeside picnic.' },
          { time: '14:00', what: 'Boat across to St. Gilgen and back (45-min round trip, €15pp).' },
          { time: '16:00', what: 'Coffee + ice cream. Slow ride back.' },
          { time: '18:00', what: 'Back at apartment.' },
          { time: '20:48', what: 'Sunset from the Obertraun shore.' },
        ],
      },
    },

    // --- DAY 7 — Thu Jul 30 ---
    {
      id: 'thu-jul-30',
      date: '2026-07-30',
      dayOfWeek: 'Thursday',
      dateLabel: 'Thursday July 30',
      title: 'Werfen ice cave → drive back to Salzburg',
      summary:
        "Pack out west. Eisriesenwelt — world's largest ice cave, cable car + 1,400 stairs underground with a carbide lamp. Drive on to the airport apartment. One last Salzburg evening, last sunset from the Mönchsberg ridge.",
      imgUrl: IMG.werfen,
      imgAlt: 'Hohenwerfen castle perched on a rocky crag above the Salzach valley near Werfen',
      imgCredit: IMG_CREDIT.werfen,
      sunsetTime: '20:47',
      sunsetSpot: 'Mönchsberg ridge above Salzburg',
      sunsetMapsQuery: 'Mönchsberg Salzburg',
      driveSummary:
        'Hallstatt area → Werfen 1h15m → Salzburg airport apartment 50 min · ~2h driving + cave',
      driveFrom: 'Obertraun, Austria',
      driveTo: 'Salzburg Airport',
      sleepWhere: 'airport',
      walkingNote: 'Eisriesenwelt is Allison-pushing: 20-min uphill walk to cable car, then 1,400 stairs inside the cave with a carbide lamp. Optional. Bring fleece — ice cave is below freezing year-round.',
      meals:
        'Breakfast: clean out Hallstatt apartment. Lunch: picnic at the Werfen cave parking area. Dinner: settle into airport apartment + Spar takeaway.',
      planA: {
        label: 'Plan A',
        headline: 'Eisriesenwelt cave + transit · full day',
        energy: 'high — biggest physical day',
        blocks: [
          { time: '07:30', what: 'Coffee. Pack out of Hallstatt apartment. Eat the last of the fridge.' },
          { time: '08:30', what: 'Drive west toward Werfen (1h15m).' },
          { time: '09:45', what: 'Park at Eisriesenwelt visitor lot. Buy timed combo ticket (€42pp, cable car + 75-min cave tour). BOOK ONLINE the night before — July sells out.' },
          { time: '10:00', what: '20-min uphill walk from lot to cable car station.' },
          { time: '10:30', what: 'Cable car up — 3 min, 500m vertical.' },
          { time: '10:45', what: '15-min walk from cable car top to cave entrance.' },
          { time: '11:00', what: 'Cave tour — 1 hr 15 min underground, 1,400 stairs, carbide lamp. World\'s largest ice cave (42 km mapped, you see the first 1 km).' },
          { time: '12:30', what: 'Walk + cable car down.' },
          { time: '13:15', what: 'Picnic at the visitor center benches.' },
          { time: '14:15', what: 'Drive to Salzburg airport apartment area (50 min).' },
          { time: '15:30', what: 'Check in to airport-area apartment. Unpack just the essentials — flight tomorrow.' },
          { time: '16:30', what: 'Drive 8 min into central Salzburg. One last Altstadt walk — buy any souvenirs, last European coffee, last gelato.' },
          { time: '19:00', what: 'Walk up Mönchsberg from the Toscaninihof stairs for the final fortress view.' },
          { time: '20:47', what: 'SUNSET from the Mönchsberg ridge. Last sunset of the trip.' },
          { time: '21:30', what: 'Drive back to airport apartment. Pack. Pre-fly admin.' },
        ],
      },
      planB: {
        label: 'Plan B',
        headline: 'Skip the cave · easy transit day',
        energy: 'low',
        blocks: [
          { time: '09:00', what: 'Slow pack-out from Hallstatt apartment.' },
          { time: '10:30', what: 'Leave. Drive west.' },
          { time: '11:45', what: 'Stop in Werfen village (no cave). Quick coffee. Photo of Hohenwerfen castle from the road.' },
          { time: '12:30', what: 'Continue to Salzburg.' },
          { time: '13:30', what: 'Check in to airport-area apartment.' },
          { time: '14:30', what: 'Light lunch + nap.' },
          { time: '17:00', what: 'Walk by the Salzach river or one last Altstadt loop.' },
          { time: '20:47', what: 'Sunset from the apartment balcony.' },
          { time: '22:00', what: 'Pack for flight.' },
        ],
      },
    },

    // --- DAY 8 — Fri Jul 31 ---
    {
      id: 'fri-jul-31',
      date: '2026-07-31',
      dayOfWeek: 'Friday',
      dateLabel: 'Friday July 31',
      title: 'Fly home',
      summary:
        "Early wake. Last coffee in the same kitchen you started in. Ten-minute drive to the terminal. Window seat home — sunset already in Tel Aviv by the time you land.",
      imgUrl: IMG.alpineSunset,
      imgAlt: 'Alpine peaks at first light',
      imgCredit: IMG_CREDIT.alpineSunset,
      sunsetTime: '19:45',
      sunsetSpot: 'In transit — sunset 19:45 Tel Aviv',
      driveSummary: 'Airport apartment → SZG terminal 10 min · drop car.',
      driveFrom: 'Salzburg',
      driveTo: 'Salzburg Airport',
      sleepWhere: 'airport',
      walkingNote: 'Airport only.',
      meals: 'Apartment leftovers for breakfast. El Al kosher meal on board.',
      planA: {
        label: 'Plan A',
        headline: 'Early flight · primary',
        energy: 'low',
        blocks: [
          { time: '05:00', what: 'Wake. Last coffee in the same kitchen you started in 24 hrs earlier.' },
          { time: '05:45', what: 'Final luggage check. Pre-packed last night.' },
          { time: '06:00', what: 'Drive to airport (10 min). Return rental car.' },
          { time: '06:30', what: 'Check in. Security. Gate.' },
          { time: '08:00', what: 'Fly. Allison gets a window seat.' },
          { time: '14:00', what: 'Land Tel Aviv.' },
          { time: 'Evening', what: 'Home. Tell people about the parts that mattered.' },
        ],
      },
      planB: {
        label: 'Plan B',
        headline: 'Later flight · if booked afternoon',
        energy: 'low',
        blocks: [
          { time: '08:00', what: 'Sleep in.' },
          { time: '09:30', what: 'Walk along the Salzach one last time.' },
          { time: '11:00', what: 'Return to apartment. Pack the car.' },
          { time: '12:30', what: 'Drop car. Check in for afternoon flight.' },
        ],
      },
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
          name: 'Junker\'s Apartments',
          url: 'https://www.booking.com/hotel/at/junkers-appartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/221346620.webp?k=cf7d95a5626dc200e5d713cbfcf5178c20086fc6ce1292547b7a2ab635163644&o=',
          review: '9.6 · Exceptional',
          pricePerNight: '€91 / night (₪361)',
          note: '40m² apartment with kitchen, 1.9km from old town. Best value pick — sub-€100/night, exceptional reviews. Free cancellation. Apartment Jezero energy at Apartment Jezero price.',
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
      area: 'Obertraun (5 min from Hallstatt by car) — the Zminca/Žabljak equivalent: lake-adjacent, quiet, full apartment',
      pickName: 'Haus Edelweiss (Obertraun)',
      pickUrl: 'https://www.booking.com/hotel/at/haus-edelweiss-obertraun.html',
      pickImg:
        'https://cf.bstatic.com/xdata/images/hotel/square600/506509432.webp?k=29d77bd1dd210a101fa445b3dc5caac41d37ef7b8ac5bd504e28fdd3b59b42f0&o=',
      pickReview: '9.4 · Wonderful · 258 reviews',
      pickPrice: '€142 / night (₪563)',
      pickWhy:
        '54m² 1-bedroom apartment with balcony, full kitchen, living room. 3km from Hallstatt — close enough for evenings, far enough for quiet. Right at the foot of the Dachstein cable car. Free cancellation. The Apartmani Jezero of this trip: deep base, lake walking distance, balcony coffee mornings.',
      alts: [
        {
          name: 'Ferienhof Osl (Obertraun)',
          url: 'https://www.booking.com/hotel/at/ferienhof-osl-urlaub-am-bauernhof.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/16860996.webp?k=2bc9d7e477477eb1fb17858d6f854b5a7d857dd1b4cf6f03b4b1def04c8b86e3&o=',
          review: '9.2 · Wonderful',
          pricePerNight: '€138 / night (₪548)',
          note: 'WORKING FARMHOUSE (urlaub am bauernhof = "farm vacation"). 30m² studio with balcony, 3.7km from Hallstatt. This is literally Apartment Jezero — goats and horses outside, lake walking distance, local family running it. Most Žabljak-coded option.',
        },
        {
          name: 'Austrian Apartments (Bad Goisern)',
          url: 'https://www.booking.com/hotel/at/austria-apartments.html',
          img: 'https://cf.bstatic.com/xdata/images/hotel/square600/680881702.webp?k=5280eca98f2aeb08f8cda08936a27de206b90945809344c6ce032c9c2f968d02&o=',
          review: '9.5 · Exceptional',
          pricePerNight: '€134 / night (₪531)',
          note: 'Studio apartment with kitchen, 6.6km from Hallstatt. Bad Goisern itself has a Spar within walking distance. Free cancellation. Slightly further drive to Hallstatt Markt but quieter and 8 EUR/night cheaper.',
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
          note: '45m² apartment with kitchen, 2.3km from airport — CLOSEST to the terminal. 2,759 reviews — extremely established. Slightly higher rating bar but it has the airport-proximity edge if Friday flight is very early.',
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
      reason: 'V1 considered this. Adds 6 hours of driving for one more lake. The Hallstatt-area lakes already deliver the storybook reflection. Save Bled for a Slovenia-specific trip.',
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
      reason: 'The v1 mistake. Each day has one Plan A + one Plan B — both real plans, neither a vibe.',
    },
  ],
};
