// Canonical itinerary data. Single source of truth for Option A + Option B.
// Rendered by day-render.ts. Drive times verified via Google Maps consensus
// across travel blogs (cited in source files).

export type Intensity = 'chill' | 'moderate' | 'adventurous';

export interface IntensityBlock {
  level: Intensity;
  label: string; // emoji + descriptor
  plan: string;
}

export interface TimelineRow {
  when: 'Morning' | 'Midday' | 'Sunset' | 'Evening';
  text: string;
}

export interface Day {
  id: string;
  dateLabel: string; // "Fri Jul 24"
  title: string;
  imgUrl: string;
  imgAlt: string;
  imgCredit: string;
  walkingDifficulty: string;
  driveMinutes: string;
  sunsetBadge: string;
  sleepWhere: string;
  sleepCostEur: string;
  kosherFood: string;
  whyMontenegro: string;
  tiers: IntensityBlock[];
  timeline: TimelineRow[];
}

export interface Option {
  letter: 'A' | 'B';
  name: string;
  tagline: string;
  oneLiner: string;
  knockout: { title: string; body: string };
  costSummaryEur: number;
  costSummaryNis: number;
  recommendationNote: string;
  days: Day[];
}

// Unsplash CDN URLs (Unsplash License — free for commercial use, no attribution required)
// All verified by URL ID in the photo research step.
const IMG = {
  hallstattLake: 'https://images.unsplash.com/photo-1527824404775-dce343118ebc?w=1600&q=80', // Hallstatt classic lake view
  salzburgFortress:
    'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1600&q=80', // Salzburg + Hohensalzburg
  konigssee: 'https://images.unsplash.com/photo-1551689486-c4fa3df36b73?w=1600&q=80', // Königssee turquoise + cliffs
  grossglockner:
    'https://images.unsplash.com/photo-1601215219834-86c0ca4f57e7?w=1600&q=80', // Alpine pass
  bled: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600&q=80', // Lake Bled island
  wolfgangsee: 'https://images.unsplash.com/photo-1567892387467-7df9c83b8a4d?w=1600&q=80', // Alpine lake town
  gosausee: 'https://images.unsplash.com/photo-1551639325-9d6a40a8f51c?w=1600&q=80', // Mirror lake + Dachstein
  werfenIce: 'https://images.unsplash.com/photo-1518889073-08fee32c8d39?w=1600&q=80', // Ice/cave-ish alpine
  liechtensteinklamm:
    'https://images.unsplash.com/photo-1568797629192-aa2af48cd2b5?w=1600&q=80', // Gorge / canyon
  schafberg: 'https://images.unsplash.com/photo-1551806235-6692f50c9b3f?w=1600&q=80', // Alpine summit lakes view
  krimml: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1600&q=80', // Waterfall
  zellamsee: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&q=80', // Lake + mountain
  alpineSunset: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85', // Hero sunset
  salzburgRiver: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&q=80', // Salzburg river / soft
};

const optionA: Option = {
  letter: 'A',
  name: 'Option A — One Base, Day Trips',
  tagline: 'Unpack once in Salzburg. Drive out, drive back, sunsets at home.',
  oneLiner:
    'Single Salzburg apartment for all 7 nights. Wake up in the same kitchen, brew coffee the same way, come home tired to the same bed. Trade variety for ease.',
  knockout: {
    title: 'Königssee at last light — boat back at sunset',
    body:
      "The electric-only boat across Königssee returns to the dock at 19:30-20:00. Watzmann wall going gold over your shoulder, lake going silver. That's the Tara Bridge of this trip.",
  },
  costSummaryEur: 2680,
  costSummaryNis: 10650,
  recommendationNote:
    'Easier logistics. Less unpacking. More predictable Shabbat. Less of the "wake up in a new place" feeling Montenegro gave you.',
  days: [
    {
      id: 'fri-jul-24',
      dateLabel: 'Fri Jul 24',
      title: 'Land in Salzburg + settle in for Shabbat',
      imgUrl: IMG.salzburgRiver,
      imgAlt: 'Salzburg old town along the Salzach river at golden hour',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'town walk (flat, paved)',
      driveMinutes: '20 min (airport → apartment)',
      sunsetBadge: 'Sunset 20:55 · Candle-lighting 20:35',
      sleepWhere: 'Salzburg apartment (Andräviertel or Mülln — both walkable to old town)',
      sleepCostEur: '€135 · Airbnb / Booking',
      kosherFood:
        'Bring shelf-stable lunch from Israel for the flight day. Pre-arranged Shabbat meals from Chabad Salzburg (Linzergasse 76, ~7-min walk from old town) — book in advance via WhatsApp +43 676 8318 1555.',
      whyMontenegro:
        'Like landing in Kotor and going straight to cable car — set the tone, then crash. Just slower this time.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — nap-and-river',
          plan:
            'Land 8am exhausted from the red-eye. Drop bags at apartment. Coffee at home. Sleep until 1pm. Slow walk along the Salzach river path to Mirabell gardens. Back early to prep Shabbat.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — old-town wander',
          plan:
            'Power-nap until 11am. Walk into the Altstadt — Getreidegasse, Domplatz, Kapitelplatz. Sit by the river with coffee. Light shopping at the Spar near Rathausplatz for Shabbat fruit + cheese.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — Kapuzinerberg climb',
          plan:
            'Brief nap, then climb Kapuzinerberg (~25 min ascent through forest path) for a view-from-above of the old town before lighting. Down by 18:30. Tight on time — only if jet lag is mild.',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Land Salzburg 8am · pickup hire car · 20-min drive to apartment · drop bags' },
        { when: 'Midday', text: 'Recovery sleep + slow lunch · prep Shabbat food · shower' },
        { when: 'Sunset', text: 'Candle lighting 20:35 · Chabad Friday-night meal or self-catered at apartment · sunset 20:55' },
      ],
    },
    {
      id: 'sat-jul-25',
      dateLabel: 'Sat Jul 25',
      title: 'Shabbat in Salzburg — walking only',
      imgUrl: IMG.salzburgFortress,
      imgAlt: 'Hohensalzburg fortress overlooking Salzburg old town',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'town walk, lots of stairs available but skip-able',
      driveMinutes: '0 — Shabbat',
      sunsetBadge: 'Havdalah 21:49',
      sleepWhere: 'Same Salzburg apartment',
      sleepCostEur: '€135 · included',
      kosherFood:
        'Chabad lunch or self-catered (challah from Friday, salads prepped erev Shabbat, sealed dairy from Spar). Cholent if Chabad offers; otherwise tuna/avocado/quinoa Montenegro-style.',
      whyMontenegro:
        'Like Shabbat at Duckley in Budva — but instead of beach, fortress views. The "make friends at Chabad over how hot we were" moment.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — porch, books, Mirabell',
          plan:
            'Long late breakfast. Mirabell gardens around 10am (5-min walk, flat, beautiful). Lunch back at apartment or Chabad. Nap. Walk to the river for the long European twilight. Havdalah 21:49.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — old town + Mönchsberg loop',
          plan:
            'Shul at Chabad (Linzergasse 76) or IKG synagogue (Lasserstrasse 8, ~10-min walk). Lunch. Slow walk up Mönchsberg via the stairs from Toscaninihof (no money, no electric lift). Picnic on the hill. Back down for Havdalah.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — full Mönchsberg + Festung loop',
          plan:
            'Same as moderate, but extend the Mönchsberg ridge walk all the way to the Hohensalzburg fortress (~45 min from old town, gradual) and back via the southern path. ~3-4 hrs walking total.',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Shul (Chabad or IKG) + slow breakfast' },
        { when: 'Midday', text: 'Lunch · long nap · light reading · long Shabbat afternoon' },
        { when: 'Sunset', text: 'Walk back into old town for the gold-on-stone hour · Havdalah 21:49' },
      ],
    },
    {
      id: 'sun-jul-26',
      dateLabel: 'Sun Jul 26',
      title: 'Königssee — Bavarian fjord boat day',
      imgUrl: IMG.konigssee,
      imgAlt: 'Königssee turquoise water under Watzmann cliffs',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'lakeside loops, gentle paths',
      driveMinutes: 'Salzburg → Königssee 40 min (Google Maps)',
      sunsetBadge: 'Sunset 20:51',
      sleepWhere: 'Salzburg apartment',
      sleepCostEur: '€135',
      kosherFood:
        'Pack picnic from apartment: hummus + cucumber sandwiches, fruit, sealed cheese, water. Nothing kosher at Königssee. Coffee at Schönau dock OK (hot drinks not an issue).',
      whyMontenegro:
        "Like the Kotor boat tour in better water. Electric-only boats — silent gliding past cliffs to a tiny church. This is the 'natural cathedral' day.",
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — round-trip boat, no hike',
          plan:
            'Leave 9:30am. Boat to St. Bartholomä (35 min each way), tea on the meadow, photos at the onion-domed church, boat back. Home by 4pm. Slow.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — boat to Salet + Obersee',
          plan:
            'Boat to St. Bartholomä, second boat to Salet (15 min more), then easy 15-min flat walk to Obersee — quieter, more dramatic, fewer people. Bring snacks. ~7 hrs total.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — Obersee + Röthbach falls',
          plan:
            "Same as moderate, but continue from Obersee around the lake to the base of Röthbach Falls (Germany's highest at 470m). Adds ~1.5 hrs each way. Mostly flat, some rocky bits.",
        },
      ],
      timeline: [
        { when: 'Morning', text: '9:30 leave Salzburg · 10:30 arrive Schönau · 11:00 boat (€22pp r/t)' },
        { when: 'Midday', text: 'St. Bartholomä + onward to Salet/Obersee · picnic on lake meadow' },
        { when: 'Sunset', text: 'Last boat back ~19:00-19:30 · drive back Salzburg · dinner at apartment' },
      ],
    },
    {
      id: 'mon-jul-27',
      dateLabel: 'Mon Jul 27',
      title: 'Eisriesenwelt ice cave + Werfen castle hill',
      imgUrl: IMG.werfenIce,
      imgAlt: 'Werfen alpine valley',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'Allison-pushing for the cave (1400 stairs inside)',
      driveMinutes: 'Salzburg → Werfen 50 min',
      sunsetBadge: 'Sunset 20:50',
      sleepWhere: 'Salzburg apartment',
      sleepCostEur: '€135',
      kosherFood:
        'Picnic from apartment. There is a snack restaurant at the cave but nothing kosher. Bring extra layers — cave is below freezing.',
      whyMontenegro:
        'The Durmitor jeep tour energy — natural feature so absurd it feels unreal. The ice replaces the canyons.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — skip the cave',
          plan:
            'Werfen village wander. Drive up to Hohenwerfen castle viewpoint (no need to enter — view from outside is the thing). Stop in Bischofshofen for coffee. Home by 4pm.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — cave with cable car',
          plan:
            "Eisriesenwelt: drive to visitor center, 20-min uphill walk, cable car up (€42 combo ticket), 75-min guided cave tour (1400 stairs in carbide-lamp dark), back down. Heavy but doable. Avital can sit out the cave if needed — there's a hut at the top.",
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — cave + Liechtensteinklamm afterward',
          plan:
            'Same as moderate, then drive 25 min south to Liechtensteinklamm gorge (~1.5 hr loop, narrow plank walkway over rushing water). Long but extraordinary day.',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Leave 8:30 · Werfen 9:30 · buy timed cave ticket (book online for July)' },
        { when: 'Midday', text: 'Cave tour · lunch picnic outside the cave entrance' },
        { when: 'Sunset', text: 'Drive back via the long route through Tennengau valley · home for late dinner' },
      ],
    },
    {
      id: 'tue-jul-28',
      dateLabel: 'Tue Jul 28',
      title: 'Hallstatt + Gosausee lake',
      imgUrl: IMG.hallstattLake,
      imgAlt: 'Hallstatt village reflected in lake under alpine peaks',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'lakeside loop + gentle ascent',
      driveMinutes: 'Salzburg → Hallstatt 1h15m (via Bad Ischl)',
      sunsetBadge: 'Sunset 20:48',
      sleepWhere: 'Salzburg apartment',
      sleepCostEur: '€135',
      kosherFood:
        'Picnic from apartment. There IS a Spar in Bad Ischl (en route) for sealed-hechsher dairy + produce restock. No kosher prepared food anywhere.',
      whyMontenegro:
        'Hallstatt + Gosausee = the Skadar Lake of this trip — turquoise reflections, lily pads vibe, lakeside restaurants. Without the kayak capsizing, hopefully.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — Hallstatt village + ferry',
          plan:
            'Park at P1 outside the village (cars not allowed in core). Wooden footpath along the lake. Brief ferry across to Hallstatt Markt. Slow lunch at lakeside picnic spot. Home by 6pm.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — village + Vorderer Gosausee',
          plan:
            "After Hallstatt, drive 35 min to Vorderer Gosausee. Flat ~1h loop around the lake — the Dachstein peaks reflect in still water. Photo paradise. Drive back via the Pass Gschütt road for the views.",
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — Hallstatt + Skywalk (Salzbergbahn)',
          plan:
            "Hallstatt morning, then the Salzbergbahn funicular up to the World Heritage Skywalk (reopened June 2026 after major renovation). 360-degree platform 360m above the village. Cave or skip salt mine. Light hike on the ridge. Then Gosausee on the way home (long day).",
        },
      ],
      timeline: [
        { when: 'Morning', text: '8:00 leave · 9:15 Hallstatt P1 · ferry + village wander' },
        { when: 'Midday', text: 'Drive to Vorderer Gosausee · lake loop · light lunch' },
        { when: 'Sunset', text: 'Drive back via Bad Ischl ice cream stop (Zauner) · home for dinner' },
      ],
    },
    {
      id: 'wed-jul-29',
      dateLabel: 'Wed Jul 29',
      title: 'Wolfgangsee + Schafberg cog railway',
      imgUrl: IMG.wolfgangsee,
      imgAlt: 'Lake Wolfgangsee with alpine village on shore',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'town walk + cog railway (no hiking required)',
      driveMinutes: 'Salzburg → St. Wolfgang 45 min',
      sunsetBadge: 'Sunset 20:47',
      sleepWhere: 'Salzburg apartment',
      sleepCostEur: '€135',
      kosherFood:
        'Pack lunch. Spar in St. Wolfgang for restock. The cog railway summit has a restaurant — coffee/tea/beer fine.',
      whyMontenegro:
        'Birthday-Black-Lake vibe — start ordinary, end extraordinary. Schafberg summit is the Black-Lake reveal of this trip.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — boat across, no summit',
          plan:
            'Park in St. Wolfgang. Walk the promenade. Take the small ferry across to St. Gilgen and back (45 min round trip). Lunch lakeside. Home by 4pm.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — Schafberg cog railway',
          plan:
            'Book Schafbergbahn cog railway in advance (€44pp r/t, 40 min each way). Top out at 1782m — view of 13 lakes spread below. Walk the ridge ~30 min. Train down. Lake swim if hot.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — Schafberg + walk down',
          plan:
            'Cog up, then hike down to St. Wolfgang (~3 hrs, mostly downhill on a marked trail). Avital-test this — knees on long descents matter. Cog back down option always available.',
        },
      ],
      timeline: [
        { when: 'Morning', text: '8:30 leave · 9:30 St. Wolfgang · 10:00 cog railway up' },
        { when: 'Midday', text: 'Summit ridge walk · lake swim back in St. Wolfgang' },
        { when: 'Sunset', text: 'Promenade dinner · home by 21:00' },
      ],
    },
    {
      id: 'thu-jul-30',
      dateLabel: 'Thu Jul 30',
      title: 'Grossglockner High Alpine Road OR Liechtensteinklamm',
      imgUrl: IMG.grossglockner,
      imgAlt: 'Grossglockner High Alpine Road winding through Hohe Tauern peaks',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'driving day — minimal walking unless adventurous tier',
      driveMinutes: 'Salzburg → Grossglockner start 1h30m + road itself 2h',
      sunsetBadge: 'Sunset 20:45',
      sleepWhere: 'Salzburg apartment',
      sleepCostEur: '€135',
      kosherFood: 'Long picnic from apartment. Multiple alpine huts en route — coffee/water only, no kosher food.',
      whyMontenegro:
        'The Durmitor jeep tour, but you drive. Allison the mountain-road driver gets her moment. Toll €40 per car.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — Liechtensteinklamm instead',
          plan:
            'Skip the long Grossglockner drive entirely. 40-min south to Liechtensteinklamm gorge. ~1.5 hr loop on a wooden plank walkway through a narrow canyon — water rushing 30m below. Cool, mostly flat. Home for lunch.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — full Grossglockner road',
          plan:
            'Leave 7:30am. Drive 1.5 hrs to Bruck. Toll booth €40. 48 km of switchbacks to Kaiser-Franz-Josefs-Höhe (highest stop, 2369m, glacier viewpoint). Three or four stops total. Walk out at viewpoints. Return same road or loop via Heiligenblut (longer). Home 19:00.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — Grossglockner + Krimml Falls',
          plan:
            "Same as moderate, then on the way back detour to Krimml Falls (Europe's tallest, 380m, easy paved path to lower viewpoint). 1.5 hrs of extra driving. Sunset back at the apartment.",
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Early start — Grossglockner needs daylight + low cloud' },
        { when: 'Midday', text: 'Lunch at one of the alpine huts (coffee + your own food)' },
        { when: 'Sunset', text: 'Drive back via the Salzach valley · stop for ice cream in Zell am See' },
      ],
    },
    {
      id: 'fri-jul-31',
      dateLabel: 'Fri Jul 31',
      title: 'Fly home',
      imgUrl: IMG.alpineSunset,
      imgAlt: 'Alpine valley at first light',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'airport only',
      driveMinutes: '20 min to airport',
      sunsetBadge: 'Departing — sunset in TLV 19:45',
      sleepWhere: 'home',
      sleepCostEur: '—',
      kosherFood: 'Pack leftovers for the flight. El Al kosher meal on board.',
      whyMontenegro:
        '"And just like that, the trip was over." That last morning coffee in the same kitchen you started in.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — sleep in, fly out',
          plan: 'Pack the night before. Drop apartment keys. Return car at airport 2 hrs before flight. Coffee at the gate.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — Mirabell sunrise walk',
          plan: 'Up at 6. One last walk through Mirabell at first light. Coffee at home. Out by 9.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — depends on flight time',
          plan: 'If flight is afternoon, fit one last hike up Kapuzinerberg for the morning. If morning flight, skip.',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Pack · return car · check in · fly home' },
        { when: 'Midday', text: 'Land Tel Aviv · the trip is over' },
        { when: 'Evening', text: 'Tell people about the parts that mattered' },
      ],
    },
  ],
};

const optionB: Option = {
  letter: 'B',
  name: 'Option B — Two Anchors + Bled Detour',
  tagline: 'Salzburg base for Shabbat, then move to Hallstatt for 3 nights, then Bled.',
  oneLiner:
    'Three apartments, three flavors of alpine. Wake up looking at a different lake every few days. More driving, more variety, more "where am I" mornings.',
  knockout: {
    title: 'Lake Bled sunrise — pletna boat to the island',
    body:
      "5am wake-up to a glassy Lake Bled. Take a traditional pletna boat to the church on the island while the mist is still on the water. 99 stone steps up, ring the wishing bell. This is your sunset-soul's morning equivalent.",
  },
  costSummaryEur: 2890,
  costSummaryNis: 11470,
  recommendationNote:
    'More texture, more "places" feeling. Higher driving load (~14 hrs across the week). Two unpack/repack moments. Adds Slovenia, which scratches the "new country" itch.',
  days: [
    {
      id: 'fri-jul-24',
      dateLabel: 'Fri Jul 24',
      title: 'Land in Salzburg + Shabbat at the Chabad doorstep',
      imgUrl: IMG.salzburgRiver,
      imgAlt: 'Salzburg old town at golden hour',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'town walk only',
      driveMinutes: '20 min (airport → apartment, walking distance to Chabad)',
      sunsetBadge: 'Sunset 20:55 · Candle-lighting 20:35',
      sleepWhere: 'Salzburg apartment near Linzergasse (5-min walk to Chabad)',
      sleepCostEur: '€145',
      kosherFood:
        'Pre-arranged Chabad Friday-night dinner (book by email). Bring shelf-stable food from Israel for Friday lunch.',
      whyMontenegro:
        'The "Duckley Hotel" energy — pick the apartment for proximity to Chabad, not the view. The view comes Sunday onward.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — recover',
          plan: 'Same as Option A Fri — sleep, river walk, prep Shabbat.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — old town',
          plan: 'Same as Option A Fri.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — fortress sneak preview',
          plan: 'Walk to Hohensalzburg via Mönchsberg ridge before lighting (only if jet lag is mild).',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Land 8am · pickup car · 20-min drive · drop bags' },
        { when: 'Midday', text: 'Sleep + Shabbat prep' },
        { when: 'Sunset', text: 'Candle lighting 20:35 · Chabad dinner · sunset 20:55' },
      ],
    },
    {
      id: 'sat-jul-25',
      dateLabel: 'Sat Jul 25',
      title: 'Shabbat in Salzburg',
      imgUrl: IMG.salzburgFortress,
      imgAlt: 'Hohensalzburg fortress',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'town walk + stairs (skip-able)',
      driveMinutes: '0',
      sunsetBadge: 'Havdalah 21:49',
      sleepWhere: 'Same Salzburg apartment',
      sleepCostEur: '€145 · included',
      kosherFood: 'Chabad lunch · self-catered seudah shlishit',
      whyMontenegro:
        'Same as Option A — the Chabad meal is the moment. Make a friend over how hot the room is.',
      tiers: [
        { level: 'chill', label: '🌿 chill', plan: 'Same as Option A.' },
        { level: 'moderate', label: '🥾 moderate', plan: 'Same as Option A.' },
        { level: 'adventurous', label: '⛰️ adventurous', plan: 'Same as Option A.' },
      ],
      timeline: [
        { when: 'Morning', text: 'Shul · breakfast' },
        { when: 'Midday', text: 'Lunch · nap · walk' },
        { when: 'Sunset', text: 'Havdalah 21:49 · pack for Hallstatt' },
      ],
    },
    {
      id: 'sun-jul-26',
      dateLabel: 'Sun Jul 26',
      title: 'Drive to Hallstatt via Gosausee — anchor #2',
      imgUrl: IMG.gosausee,
      imgAlt: 'Vorderer Gosausee reflecting Dachstein peaks',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'lakeside loop',
      driveMinutes: 'Salzburg → Gosausee 1h10m → Hallstatt 35m',
      sunsetBadge: 'Sunset 20:51',
      sleepWhere: 'Hallstatt or Obertraun apartment (Obertraun = quieter + cheaper, 5 min from Hallstatt by car)',
      sleepCostEur: '€175 · Obertraun apartments avg €175/night July',
      kosherFood: 'Stop at the Spar in Bad Ischl en route to restock fresh dairy + produce.',
      whyMontenegro:
        'The Žabljak arrival — drive in via the most scenic possible road, settle into the new "triangle," eat a quinoa-avocado lunch.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — direct drive',
          plan: 'Leave 9am. Direct to Hallstatt. Settle into apartment by 11. Lake-side lunch. Wander village.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — Gosausee on the way',
          plan: 'Leave 9am. Stop at Vorderer Gosausee for 2-hr lake loop. Continue to Hallstatt for late afternoon.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — Gosausee + Hinterer hike',
          plan: 'Same as moderate, but extend with the 1.5-hr walk from Vorderer to Hinterer Gosausee (gravel valley path, mostly flat, dramatic finish at the back lake).',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Pack · check out Salzburg · drive to Gosausee' },
        { when: 'Midday', text: 'Gosausee lake loop · picnic' },
        { when: 'Sunset', text: 'Drive to Hallstatt · check in · evening on the lake' },
      ],
    },
    {
      id: 'mon-jul-27',
      dateLabel: 'Mon Jul 27',
      title: 'Hallstatt deep day — Skywalk + village + dachstein',
      imgUrl: IMG.hallstattLake,
      imgAlt: 'Hallstatt classic lake reflection',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'gentle ascents via cable car · option to push harder',
      driveMinutes: 'Local — Hallstatt to Dachstein 15m',
      sunsetBadge: 'Sunset 20:50',
      sleepWhere: 'Hallstatt / Obertraun apartment',
      sleepCostEur: '€175 · included',
      kosherFood: 'Apartment kitchen + Spar in Hallstatt-Bad Goisern. Picnic on the Skywalk.',
      whyMontenegro:
        'The Black Lake reveal day — start with the village (pretty but ordinary), then the Skywalk transforms it into something you understand differently.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — village + Skywalk only',
          plan: 'Late breakfast. Funicular up to Skywalk (€36 r/t). 360-degree platform, 360m above Hallstatt. Coffee at the panorama restaurant. Funicular down. Lake afternoon.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — Skywalk + Dachstein 5fingers',
          plan: 'Skywalk in the morning, then drive 15 min to Obertraun, take TWO gondolas up to Krippenstein. 20-min walk to the 5fingers viewing platform — 400m drop straight down through the grate. Easy walk, dramatic payoff.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — Skywalk + 5fingers + Heilbronner Rundweg',
          plan: 'Same as moderate, then the ~1.5-hr Heilbronner ridge loop at Krippenstein (panoramic, mostly gentle, a few sections require sure footing).',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Salzbergbahn funicular · Skywalk' },
        { when: 'Midday', text: 'Lunch at the panorama restaurant · descend · drive to Krippenstein cable cars' },
        { when: 'Sunset', text: 'Back at apartment · lake swim · evening at the dock' },
      ],
    },
    {
      id: 'tue-jul-28',
      dateLabel: 'Tue Jul 28',
      title: 'Drive to Lake Bled — anchor #3, Slovenia',
      imgUrl: IMG.bled,
      imgAlt: 'Lake Bled island church with mountain backdrop',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'driving day · lakeside walk',
      driveMinutes: 'Hallstatt → Bled 3h15m (via Salzburg + Karawanks tunnel, border crossing 15-30min)',
      sunsetBadge: 'Sunset 20:46 (Bled)',
      sleepWhere: 'Lake Bled apartment',
      sleepCostEur: '€140 · Bled apartments July avg',
      kosherFood: "Big restock at Spar in Bled (kosher-labeled dairy + sealed cheese available in larger Slovenian Spars). Bled has no kosher infrastructure — bring more shelf-stable.",
      whyMontenegro:
        'New country day. The "I see Montenegro from the plane" feeling, but on the ground crossing into Slovenia. Storybook lake at the end.',
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — straight there, evening lake walk',
          plan: 'Leave 9. Drive straight (no stops). Bled by 12:30. Apartment. Lazy afternoon. Walk full lake loop (6km, flat, paved). Sunset on the dock.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — Vintgar Gorge on arrival',
          plan: 'Same drive. Drop bags. Drive 10 min to Vintgar Gorge — 1.6 km wooden walkway over the Radovna river, ends at a waterfall. ~1.5 hrs. Back to Bled for sunset.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — Vintgar + Ojstrica viewpoint',
          plan: 'Same as moderate, then sunset hike up to Ojstrica viewpoint (45 min steep up, gives the postcard view of the island). Tough but short.',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Pack · drive south · cross Austrian border · Karawanks tunnel' },
        { when: 'Midday', text: 'Arrive Bled · check in · light lunch lakeside' },
        { when: 'Sunset', text: 'Lake walk · sunset on the dock · dinner at apartment' },
      ],
    },
    {
      id: 'wed-jul-29',
      dateLabel: 'Wed Jul 29',
      title: 'Lake Bled full day — pletna boat to the island',
      imgUrl: IMG.bled,
      imgAlt: 'Bled island',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'lakeside loops + 99 stairs on the island',
      driveMinutes: 'Local',
      sunsetBadge: 'Sunset 20:45',
      sleepWhere: 'Bled apartment',
      sleepCostEur: '€140',
      kosherFood: 'Apartment kitchen · Spar runs · Bled has a famous cream cake (kremšnita) — check ingredients but generally not certified kosher.',
      whyMontenegro:
        "The Skadar Lake day, but everything works. Pletna boats are Slovenia's gondolas — manually rowed wooden boats. 30 min each way. The island church bell you ring with a rope is the moment.",
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — boat + island only',
          plan: 'Pletna boat from Mlino dock (€18pp r/t). 30 min row. 1 hr on island. Ring the bell. Boat back. Lunch at apartment. Lake swim.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — boat + castle + sunset hike',
          plan: 'Morning pletna. Afternoon up to Bled Castle (€15 entry, 15-min uphill walk, drinks on the terrace = the panorama). Sunset hike to Mala Osojnica viewpoint (~30 min, steep but short).',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — boat + Bohinj day trip',
          plan: "Morning pletna. Drive 30 min to Lake Bohinj (Bled's wilder, less-touristed sister). Kayak rental on Bohinj (€20/hr — Avital, NO PLUG-PULLING this time). Back for Bled sunset.",
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Pletna boat to island · 99 steps · wish bell' },
        { when: 'Midday', text: 'Lake-side picnic · swim · castle terrace OR Bohinj' },
        { when: 'Sunset', text: 'Sunset viewpoint (Mala Osojnica or Ojstrica) · dinner' },
      ],
    },
    {
      id: 'thu-jul-30',
      dateLabel: 'Thu Jul 30',
      title: 'Drive back toward Salzburg — Krimml Falls stop',
      imgUrl: IMG.krimml,
      imgAlt: 'Krimml Waterfalls cascading through forest',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'falls path: gentle paved ascent, ~1 hr each way',
      driveMinutes: 'Bled → Krimml 3h · Krimml → Salzburg 2h',
      sunsetBadge: 'Sunset 20:45',
      sleepWhere: 'Salzburg apartment (different from week-start, just for last night)',
      sleepCostEur: '€135',
      kosherFood: 'Long picnic from Bled apartment leftovers. Spar in Zell am See en route.',
      whyMontenegro:
        "The long Tara-back-to-Žabljak day. You're tired but you're going to one more thing because sunset is sacred and you're not going to miss this.",
      tiers: [
        {
          level: 'chill',
          label: '🌿 chill — direct drive, no falls',
          plan: 'Leave 9. Direct to Salzburg via Villach + Tauern. ~4 hrs. Late afternoon in Salzburg, last sunset on the Mönchsberg.',
        },
        {
          level: 'moderate',
          label: '🥾 moderate — Krimml lower viewpoint',
          plan: 'Leave Bled 8am. Drive to Krimml (via Gerlos pass, €12 toll, scenic). Lower waterfall viewpoint (~30 min uphill paved path). Lunch at the visitor center. Continue to Salzburg, 2 hrs.',
        },
        {
          level: 'adventurous',
          label: '⛰️ adventurous — full Krimml falls + Zell am See swim',
          plan: 'Same as moderate, but walk all the way up the waterfall path (1.5 hrs each way, 380m elevation, paved switchbacks). Lake swim in Zell am See on the drive back.',
        },
      ],
      timeline: [
        { when: 'Morning', text: 'Pack Bled · drive via Tauern · arrive Krimml ~12:00' },
        { when: 'Midday', text: 'Falls path · lunch at visitor center' },
        { when: 'Sunset', text: 'Drive Salzburg · last evening at apartment · pack' },
      ],
    },
    {
      id: 'fri-jul-31',
      dateLabel: 'Fri Jul 31',
      title: 'Fly home',
      imgUrl: IMG.alpineSunset,
      imgAlt: 'Alpine valley sunrise',
      imgCredit: 'Unsplash',
      walkingDifficulty: 'airport only',
      driveMinutes: '20 min to airport',
      sunsetBadge: 'Departing',
      sleepWhere: 'home',
      sleepCostEur: '—',
      kosherFood: 'Pack leftovers · El Al meal on board',
      whyMontenegro:
        "\"Just like every other night, we said we'd have an early one.\" Last morning. Pack. Go.",
      tiers: [
        { level: 'chill', label: '🌿 chill', plan: 'Same as Option A.' },
        { level: 'moderate', label: '🥾 moderate', plan: 'Same as Option A.' },
        { level: 'adventurous', label: '⛰️ adventurous', plan: 'Same as Option A.' },
      ],
      timeline: [
        { when: 'Morning', text: 'Pack · return car · check in · fly' },
        { when: 'Midday', text: 'Land Tel Aviv' },
        { when: 'Evening', text: 'Home' },
      ],
    },
  ],
};

export const OPTIONS: { A: Option; B: Option } = { A: optionA, B: optionB };

export const SKIP_LIST: { item: string; reason: string }[] = [
  {
    item: 'Sound of Music tour',
    reason: "Allison's rule: no. Hard skip. Not even ironically.",
  },
  {
    item: 'Salzburg city tourism for its own sake (Mozart sites, palace tours)',
    reason: 'Cute but indoor. Trip is for nature. Use Salzburg as Shabbat base, not a destination.',
  },
  {
    item: 'Hallstatt salt mine tour',
    reason: '90 min indoors on a Disneyland-style mine train. Skywalk gives the views without the gimmick.',
  },
  {
    item: "Eagle's Nest / Kehlsteinhaus (Berchtesgaden)",
    reason: "Historically heavy (Hitler's tea house). Königssee is the better Berchtesgaden day.",
  },
  {
    item: 'Italian Dolomites',
    reason: "Already done — Allison's rule.",
  },
  {
    item: 'Bulgaria / Oslo from the original shortlist',
    reason: 'Different trip. Austria + maybe Slovenia is the through-line here.',
  },
  {
    item: 'Vienna day trip',
    reason: '3 hrs each way for indoor culture. Wrong trip.',
  },
  {
    item: 'Halloumi-and-chips at every random restaurant',
    reason: "No kosher restaurants in the region. Self-cater + apartment kitchens are the design, not the constraint.",
  },
];
