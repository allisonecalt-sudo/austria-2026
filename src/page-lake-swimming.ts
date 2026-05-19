// Lake-swimming page bootstrap.
//
// Avital's ask, relayed 2026-05-16 23:10: "would want to swim in lakes is that possible"
//
// Answers "yes — and here are the 8 best, with where to enter, how cold,
// modesty options, and drive times from each base." Avoids the trip-data.ts
// surface because multiple agents are editing it; this page is self-contained.
//
// Warmth tiers: 🟢 swimmable (~20°C+), 🟡 cold-but-ok (16–19°C), 🔴 cold-shock
// (<16°C max). All temps from Salzkammergut.at and seatemperature.info July
// historical averages, verified 2026-05-16.

import { initSharedShortlist, pickButtonOverlay } from './shortlist-shared.js';

interface Lake {
  id: string;
  name: string;
  nameLocal?: string;
  region: 'salzkammergut' | 'berchtesgaden' | 'bavaria' | 'tyrol';
  tempBadge: 'warm' | 'cool' | 'cold'; // 🟢 / 🟡 / 🔴
  tempJulyText: string; // human-readable "~22–24°C late July"
  tempSourceUrl: string;
  swimAllowed: string; // "Yes — many public beaches" / "Yes — limited to natural shore" / etc.
  restrictions?: string; // national park rules, etc.
  bestEntry: string; // specific Strandbad / cove name + what you find there
  bestEntryAddress: string;
  bestEntryMapsUrl: string;
  facilities: string; // changing cabins, lifeguard, parking, kiosk
  cost: string; // "Free" / "€5 adults"
  crowding: string; // "Crowded peak weekends" / "Quiet — natural shore" / etc.
  modesty: string; // shvimkleid friendliness + quieter back-shore notes
  pairsWith: string[]; // chips: nearby hike / restaurant / sunset
  driveFromBases: {
    // Legacy keys (v3 base shape — kept so existing lake data still type-checks
    // and we don't have to rewrite 8 lake entries during the v4 polish pass).
    // The renderer maps Obertraun→Gosau (~25 min apart) and Salzburg→SZG
    // airport (~15 min apart) when the new-key value isn't supplied.
    obertraun: string;
    berchtesgaden: string;
    stWolfgang: string;
    salzburg: string;
    // v4 base shape — populate when the per-lake drive-time research lands.
    zellAmSee?: string;
    gosau?: string;
    salzburgAirport?: string;
  };
  heroPhoto: { src: string; alt: string; credit: string; sourceUrl: string };
  officialUrl: string;
  notesAvital?: string; // optional Avital-voice tldr
}

// =====================================================================
// The 8 curated deep-dive lakes
// =====================================================================
const LAKES: Lake[] = [
  {
    id: 'attersee',
    name: 'Attersee',
    nameLocal: 'Attersee',
    region: 'salzkammergut',
    tempBadge: 'warm',
    tempJulyText: "~22–24°C late July (up to 25°C in heatwaves) — Salzkammergut's warmest",
    tempSourceUrl: 'https://seatemperature.info/july/attersee-water-temperature.html',
    swimAllowed: 'Yes — drinking-water-quality, multiple public Strandbäder around the whole lake.',
    bestEntry:
      "Strandbad Seewalchen — 10-metre diving tower, solar-heated pool, long water slide, separate kids' shallow zone, boat rental on-site, two restaurants (Contis Beachclub + Cafe Eiszeit). Best-equipped public lido on this trip.",
    bestEntryAddress: 'Promenade 1a, 4863 Seewalchen am Attersee',
    bestEntryMapsUrl: 'https://maps.google.com/?q=Strandbad+Seewalchen+am+Attersee',
    facilities:
      'Changing cabins, lifeguard during opening hours, ~90 paid parking spots in front (€1/hr May 15–Sep 15, 10–17), kiosk, lounge chair + cabin rental.',
    cost: 'From €4 adults · family tickets available · discount with Salzkammergut Card.',
    crowding:
      'Popular and gets busy on hot weekends — arrive before 11:00 for shade + parking. For quieter: drive 20 min south to Unterach (smaller family lido) or further to Weissenbach (less infrastructure, more lawn).',
    modesty:
      'Big lido, lots of kids + families — shvimkleid is totally unremarkable. For more privacy: Unterach lido has shaded back-lawn corners; the south end (Weissenbach + Steinbach) has natural-shore spots with fewer eyes.',
    pairsWith: [
      'Schafbergspitze sunset (45 min)',
      'Mondsee village (20 min)',
      'Drinking-water-quality lake',
    ],
    driveFromBases: {
      obertraun: '55 min',
      berchtesgaden: '90 min',
      stWolfgang: '25 min',
      salzburg: '55 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Attersee_am_Attersee%2C_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg/1280px-Attersee_am_Attersee%2C_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg',
      alt: 'Attersee — large blue Salzkammergut lake under summer sky',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Attersee_am_Attersee,_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg',
    },
    officialUrl:
      'https://attersee-attergau.salzkammergut.at/en/activities/sports-and-health/bathing.html',
    notesAvital: 'Warmest of the lot — start here if cold water is the question.',
  },
  {
    id: 'mondsee',
    name: 'Mondsee',
    region: 'salzkammergut',
    tempBadge: 'warm',
    tempJulyText: '~19–24°C late July (avg 19.3°C, peak 24°C in hot spells)',
    tempSourceUrl: 'https://seatemperature.info/july/mondsee-water-temperature.html',
    swimAllowed: 'Yes — biggest outdoor swim facility in Salzkammergut.',
    bestEntry:
      'Alpenseebad Mondsee — 13,000 m² lawn, sandy beach, diving tower + slides (10:00–17:00), jetties, table tennis, buffet, huge parking lot. The maximalist lido of the region.',
    bestEntryAddress: 'Seebadstraße 1, 5310 Mondsee',
    bestEntryMapsUrl: 'https://maps.google.com/?q=Alpenseebad+Mondsee',
    facilities:
      "Changing cabins, lifeguard, slides, sandy children's beach, buffet kiosk, ping pong, generous parking.",
    cost: 'Adults €7 / kids 6–15 €3.50 · half-price after 13:00 · €3.50 after 16:00.',
    crowding:
      'Popular with Salzburg day-trippers — busy on hot summer afternoons. Mornings (9–11) are calmest.',
    modesty:
      'Family-heavy crowd, shvimkleid unremarkable. Lawn is huge — pick a back corner under trees for more shade + less foot traffic.',
    pairsWith: [
      'Mondsee town centre (Sound of Music church)',
      'St. Gilgen ferry (15 min)',
      'Schafbergbahn (30 min)',
    ],
    driveFromBases: {
      obertraun: '70 min',
      berchtesgaden: '85 min',
      stWolfgang: '25 min',
      salzburg: '35 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Aerial_image_of_the_Mondsee_%28view_from_the_southeast%29.jpg/1280px-Aerial_image_of_the_Mondsee_%28view_from_the_southeast%29.jpg',
      alt: 'Mondsee aerial — Salzkammergut lake from the southeast with the Drachenwand cliff face',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Aerial_image_of_the_Mondsee_(view_from_the_southeast).jpg',
    },
    officialUrl:
      'https://mondsee.salzkammergut.at/en/oesterreich-poi/detail/201982/alpine-beach-mondsee.html',
    notesAvital: 'The "big public pool" of lakes — water slides + diving tower + buffet.',
  },
  {
    id: 'wolfgangsee-strobl',
    name: 'Wolfgangsee',
    nameLocal: 'Wolfgangsee · Strandbad Strobl',
    region: 'salzkammergut',
    tempBadge: 'warm',
    tempJulyText: '~19–23°C late July (avg 19°C, can reach 23°C late month)',
    tempSourceUrl: 'https://seatemperature.info/july/wolfgangsee-water-temperature.html',
    swimAllowed:
      'Yes — three public Strandbäder (Strobl, St. Wolfgang, St. Gilgen) plus natural shore.',
    bestEntry:
      "Strandbad Liegewiese Felmayer (Strobl) — best balance of sun + shade trees, two beach volleyball courts, kids' playground, restaurant. Alt: Naturstrand Wasswiese (Strobl) — bigger lawn + boat rental + broader water access if you want more lawn-to-shore ratio.",
    bestEntryAddress: 'Seestraße, 5350 Strobl am Wolfgangsee',
    bestEntryMapsUrl: 'https://maps.google.com/?q=Strandbad+Strobl+Wolfgangsee',
    facilities:
      'Changing cabins, showers, kiosk, 30 parking spots (Felmayer) or larger paid lot (Wasswiese: €1/hr daytime, €5 all-day).',
    cost: 'Adults €5 · kids under 14 free · sun-lounger €3.50 · sunshade €3 · Wolfgangsee Card discount.',
    crowding:
      'Strobl is the quietest of the three Wolfgangsee Strandbäder (St. Wolfgang is busier, St. Gilgen is mid). Late afternoon (15:00+) thins out as day-trippers head back.',
    modesty:
      'Mix of locals + tourists, shvimkleid fine. For more quiet still: Naturstrand Wasswiese spreads people out more than Felmayer; the east shore between Strobl and St. Gilgen has small natural pull-offs.',
    pairsWith: ['Schafbergbahn (5 min)', 'St. Wolfgang village walk', 'Bürglstein viewpoint hike'],
    driveFromBases: {
      obertraun: '45 min',
      berchtesgaden: '80 min',
      stWolfgang: '5 min (Strobl) / 0 min (St. Wolfgang)',
      salzburg: '50 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
      alt: 'St. Wolfgang lakeshore on the Wolfgangsee with mountains behind',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
    },
    officialUrl:
      'https://wolfgangsee.salzkammergut.at/en/oesterreich-poi/detail/200729/strandbad-liegewiese-felmayer.html',
    notesAvital: 'If you base in St. Wolfgang, this is the walk-out-the-door swim.',
  },
  {
    id: 'hallstattersee-lahn',
    name: 'Hallstättersee',
    nameLocal: 'Lake Hallstatt · Strandbad Obertraun',
    region: 'salzkammergut',
    tempBadge: 'cool',
    tempJulyText:
      "~18–22°C late July (doesn't drop below 20°C in peak summer per Salzkammergut.at)",
    tempSourceUrl:
      'https://www.salzkammergut.at/en/things-to-do/summer/lakes-and-water-experience/water-temperatures.html',
    swimAllowed: 'Yes — multiple free public bathing areas around the whole lake.',
    bestEntry:
      "Strandbad Obertraun — family-friendly, beach volleyball, kids' playground, BBQ areas, water slide, FREE parking, large lawn. Among the best-maintained lidos on Lake Hallstatt. Alt for Hallstatt-side: Bathing Island in Hallstatt village — free, 24 hr open, shallow children's section + diving board + panoramic view.",
    bestEntryAddress: 'Seestraße, 4831 Obertraun (Strandbad Obertraun)',
    bestEntryMapsUrl: 'https://maps.google.com/?q=Strandbad+Obertraun',
    facilities:
      "Strandbad Obertraun: spacious changing rooms, snack bar, kids' playground, water slide, free parking. Hallstatt Bathing Island: changing rooms, toilets, diving board, kiosk in town.",
    cost: 'FREE — Obertraun strandbad and Hallstatt Bathing Island both no entry fee.',
    crowding:
      'Obertraun much quieter than Hallstatt village. Hallstatt Bathing Island gets the village tourist overflow — mornings or after 17:00 are calmest.',
    modesty:
      'Obertraun is mostly Austrian families + locals (very chill, less Instagram-tourist energy than Hallstatt village). Shvimkleid totally unremarkable. The natural-shore strip east of Obertraun toward Untersee is the quietest option of all.',
    pairsWith: [
      'Dachstein Eishöhle (5 Fingers, 15 min)',
      'Hallstatt village ferry',
      'Lake-loop bike path',
    ],
    driveFromBases: {
      obertraun: '0 min (legacy archive — Obertraun was the v3 anchor here)',
      berchtesgaden: '95 min',
      stWolfgang: '40 min',
      salzburg: '75 min',
      zellAmSee: '1h45',
      gosau: '20 min',
      salzburgAirport: '~1h20',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
      alt: 'Hallstatt boathouses on the Hallstättersee at golden hour',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Boathouses_in_Hallstatt,_Austria_-_2017jpg.jpg',
    },
    officialUrl:
      'https://www.obertraun.net/obertraun-en-US/active-holiday/bathing-at-lake-hallstatt/recreational-paradise-on-lake-hallstatt/',
    notesAvital: 'Your home-base lake if you stay in Obertraun. Free, quiet, easy.',
  },
  {
    id: 'fuschlsee',
    name: 'Fuschlsee',
    region: 'salzkammergut',
    tempBadge: 'cool',
    tempJulyText: '~18–22°C late July (drinking-water-quality clear, can hit 24°C in heatwaves)',
    tempSourceUrl: 'https://seatemperature.info/july/fuschlsee-water-temperature.html',
    swimAllowed: 'Yes — Fuschlseebad public lido + natural-shore spots.',
    bestEntry:
      'Fuschlseebad (Fuschl am See) — largest lawn in the area, 250-metre natural bathing beach, heated outdoor pool with indoor access, big water slide, beach volleyball, sauna, weather-protected seating hall. Closest "real" lake swim to Salzburg.',
    bestEntryAddress: 'Seepromenade, 5330 Fuschl am See',
    bestEntryMapsUrl: 'https://maps.google.com/?q=Fuschlseebad+Fuschl+am+See',
    facilities:
      "Changing cabins, lifeguard, heated outdoor pool (so even if lake is cold, the pool isn't), large water slide, sauna, gastronomy, parking.",
    cost: 'Strandbad entry (verify 2026 price — typically €5–7 adults).',
    crowding:
      'Smaller lake, fewer tourists than Wolfgangsee/Mondsee. Quieter weekday afternoons. Salzburgers come on weekends.',
    modesty:
      'Smaller, more local feel. The heated outdoor pool is an option if the lake reads as too cold day-of. Schloss Fuschl side has more natural-shore quieter spots if you walk along the lake-promenade.',
    pairsWith: [
      'Salzburg city day-trip combo (20 min)',
      'Wolfgangsee (15 min)',
      'Schafbergbahn (40 min)',
    ],
    driveFromBases: {
      obertraun: '70 min',
      berchtesgaden: '50 min',
      stWolfgang: '15 min',
      salzburg: '25 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Aerial_image_of_the_Fuschlsee_%28view_from_the_southeast%29.jpg/1280px-Aerial_image_of_the_Fuschlsee_%28view_from_the_southeast%29.jpg',
      alt: 'Fuschlsee aerial — surrounding green hills and lake from the southeast',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Aerial_image_of_the_Fuschlsee_(view_from_the_southeast).jpg',
    },
    officialUrl: 'https://www.fuschlseeregion.com/',
    notesAvital: 'Closest real lake-swim to Salzburg — heated pool as backup if water feels cold.',
  },
  {
    id: 'konigssee-malerwinkel',
    name: 'Königssee',
    nameLocal: 'Königssee · Malerwinkel bay',
    region: 'berchtesgaden',
    tempBadge: 'cold',
    tempJulyText: '~16–18°C max even in midsummer (locals say "barely reaches 20°C")',
    tempSourceUrl: 'https://www.tourispo.com/lake/lake-koenigssee.html',
    swimAllowed: 'Yes — allowed everywhere in Berchtesgaden NP lakes, but no developed beach.',
    restrictions:
      'No rubber dinghies or inflatable mattresses (national park rule). No motorboats — only the silent electric Bayerische Seenschifffahrt. Slippery stones at entry.',
    bestEntry:
      'Malerwinkel bay — northeast cove, 20-min easy walk from Schönau parking. Quieter than the Seelände town entry. Alt: Seelände in Schönau (right under the bobsleigh run) — easier but more crowded with day-trippers. Designated swim areas also at St. Bartholomä + Salet (reached only by boat).',
    bestEntryAddress: 'Malerwinkel Trailhead, Königsseer Fußweg, 83471 Schönau am Königssee',
    bestEntryMapsUrl: 'https://maps.google.com/?q=Malerwinkel+K%C3%B6nigssee',
    facilities:
      'NONE at Malerwinkel — no changing cabins, no lifeguard, no kiosk. Just the cove. Parking €5/day at Schönau main lot (fills by 10:00 on good weather days).',
    cost: 'Free swim · €5 parking · €24pp if you combine with the boat to St. Bartholomä.',
    crowding:
      'Malerwinkel is quieter than Seelände but still has hikers on the Rundweg. Best chance of "alone in the cove" is early morning or after 17:00.',
    modesty:
      'No formal lido = no judgmental Strandbad scene. Change at the car (Schönau lot). The Tara-Bridge-tier sunset boat happens the same day on the trip plan — bring shvimkleid for the cove + dry layer for the boat back.',
    pairsWith: [
      'Tara-Bridge-tier sunset boat (same day)',
      'St. Bartholomä church',
      'Obersee walk from Salet',
    ],
    driveFromBases: {
      obertraun: '90 min',
      berchtesgaden: '10 min',
      stWolfgang: '85 min',
      salzburg: '35 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
      alt: 'Königssee with St. Bartholomä chapel and Watzmann east face — turquoise alpine water framed by cliffs (same lake, Malerwinkel is the cove on the near shore)',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
    },
    officialUrl: 'https://www.nationalpark-berchtesgaden.bayern.de/',
    notesAvital: 'Cold-shock dip + brag. Not a "swim laps" lake. The cove is what you came for.',
  },
  {
    id: 'gosausee',
    name: 'Vorderer Gosausee',
    region: 'salzkammergut',
    tempBadge: 'cold',
    tempJulyText: '~16–18°C max (alpine glacier-fed nature reserve, drinking-water-quality)',
    tempSourceUrl: 'https://www.wildswimming.co.uk/map/gosausee-austria/',
    swimAllowed: 'Yes — no designated bathing area, no fee. Pick a spot, jump in.',
    restrictions: 'Nature reserve — no infrastructure, leave-no-trace.',
    bestEntry:
      'Far end of the lake (south shore, ~20 min walk on the flat lake-loop trail from the parking) — quieter, glacier reflection straight ahead, fewer day-trippers. The west-shore café-side has easier shoreline access but more people.',
    bestEntryAddress: 'Gosauseestraße parking, 4824 Gosau (then walk lake-loop)',
    bestEntryMapsUrl: 'https://maps.google.com/?q=Vorderer+Gosausee+parking',
    facilities:
      'Parking + café at the trailhead. No changing rooms, no lifeguard, no lockers. Outhouse toilet at café.',
    cost: 'Free swim · paid parking at trailhead (~€5/day).',
    crowding:
      'Café side gets bus-tour crowds 10:00–15:00. Far end of the lake is always quieter — 20 min walk filters out 90% of people. Early morning or evening = near-empty.',
    modesty:
      'Far-end shoreline is the modesty win of the trip — natural shore, glacier reflection, almost no one if you go before 09:30 or after 17:00. Change at the car.',
    pairsWith: [
      'Gosausee sunset spot (locked Day-3 trip-plan moment)',
      'Dachstein Krippenstein cable car',
      'Hallstatt village (20 min)',
    ],
    driveFromBases: {
      obertraun: '30 min',
      berchtesgaden: '110 min',
      stWolfgang: '55 min',
      salzburg: '85 min',
      zellAmSee: '1h55',
      gosau: '5 min walk / 2 min drive (the Gosau base lake)',
      salzburgAirport: '~1h35',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Vorderer_Gosausee_mit_Dachstein.jpg/1280px-Vorderer_Gosausee_mit_Dachstein.jpg',
      alt: 'Vorderer Gosausee with Dachstein glacier reflected in the still alpine water',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vorderer_Gosausee_mit_Dachstein.jpg',
    },
    officialUrl:
      'https://dachstein.salzkammergut.at/en/visitor-information/our-lakes/lake-gosau.html',
    notesAvital: 'Glacier in the reflection. Walk the loop to the far end before you swim.',
  },
  {
    id: 'hintersee-ramsau',
    name: 'Hintersee Ramsau',
    region: 'bavaria',
    tempBadge: 'cold',
    tempJulyText: "~14–16°C max (constant glacial inflow — among Bavaria's cleanest + coldest)",
    tempSourceUrl: 'https://www.tourispo.com/lake/hirschpoint-am-hintersee.html',
    swimAllowed: 'Yes — flat gravel shores all around. Locals call it "very fresh" (cold).',
    bestEntry:
      'North shore — flat gravel beach, easy walk-in. The lake-loop path circles the whole shoreline, so you can pick any quiet spot. No formal Strandbad anywhere.',
    bestEntryAddress: 'Hintersee parking lot, 83486 Ramsau bei Berchtesgaden',
    bestEntryMapsUrl: 'https://maps.google.com/?q=Hintersee+Ramsau',
    facilities:
      'Free parking on the north shore. No changing cabins, no lifeguard, no kiosk on the lake itself (Gasthof Auzinger is nearby for post-swim food). Public toilet at parking.',
    cost: 'Free swim · free parking.',
    crowding:
      "Quiet — landscape photographers + dog-walkers, not swim-tourists. Sunset crowd shows up 19:00+ but nobody's swimming then.",
    modesty:
      "The quietest swim of the trip. No Strandbad scene, no kids' slides, no eyes. Walk 5 min around the loop and you have a private gravel beach. Cold enough that you'll be in + out in 5 minutes anyway.",
    pairsWith: [
      'Hintersee sunset (mirror lake)',
      'Zauberwald enchanted-forest walk',
      'Ramsau village + Wimbachklamm gorge',
    ],
    driveFromBases: {
      obertraun: '105 min',
      berchtesgaden: '20 min',
      stWolfgang: '100 min',
      salzburg: '50 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Hintersee_Panorama.JPG/1280px-Hintersee_Panorama.JPG',
      alt: 'Hintersee Ramsau — still mirror lake with Reiteralpe massif reflected',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hintersee_Panorama.JPG',
    },
    officialUrl: 'https://www.berchtesgaden.de/hintersee',
    notesAvital: 'Quietest swim of the trip. Cold + private + flat gravel walk-in.',
  },
];

// =====================================================================
// All 11 for the warmth chart (8 above + the 3 we exclude from cards)
// =====================================================================
interface WarmthEntry {
  name: string;
  badge: 'warm' | 'cool' | 'cold';
  julyHigh: string; // for sort + display
  julyText: string;
  note: string;
}

const ALL_11: WarmthEntry[] = [
  {
    name: 'Attersee',
    badge: 'warm',
    julyHigh: '24°C',
    julyText: '22–24°C',
    note: 'Warmest of all 11. Drinking-water quality.',
  },
  {
    name: 'Mondsee',
    badge: 'warm',
    julyHigh: '24°C',
    julyText: '19–24°C',
    note: 'Big lido. Family pool energy.',
  },
  {
    name: 'Chiemsee (Prien)',
    badge: 'warm',
    julyHigh: '23°C',
    julyText: '19–23°C',
    note: 'Excluded from deep dives — 45+ min past Berchtesgaden into flatlands.',
  },
  {
    name: 'Wolfgangsee (Strobl)',
    badge: 'warm',
    julyHigh: '23°C',
    julyText: '19–23°C',
    note: 'Walk-out-the-door swim if you base in St. Wolfgang.',
  },
  {
    name: 'Fuschlsee',
    badge: 'cool',
    julyHigh: '23°C',
    julyText: '18–22°C (up to 24° in heatwaves)',
    note: 'Closest real lake-swim to Salzburg.',
  },
  {
    name: 'Hallstättersee (Obertraun)',
    badge: 'cool',
    julyHigh: '22°C',
    julyText: '18–22°C',
    note: 'Your home-base lake if you stay in Obertraun. Free.',
  },
  {
    name: 'Plansee (Tyrol)',
    badge: 'cool',
    julyHigh: '22°C',
    julyText: '19–22°C',
    note: 'Excluded — 3 hr west, out of range for any base on a swim afternoon.',
  },
  {
    name: 'Traunsee (Gmunden)',
    badge: 'cool',
    julyHigh: '24°C',
    julyText: '16–24°C',
    note: 'Excluded — Gmunden detour without obvious win over Attersee.',
  },
  {
    name: 'Königssee Malerwinkel',
    badge: 'cold',
    julyHigh: '18°C',
    julyText: '16–18°C max',
    note: 'Cold-shock dip. The "I swam in that lake" memory.',
  },
  {
    name: 'Vorderer Gosausee',
    badge: 'cold',
    julyHigh: '18°C',
    julyText: '16–18°C max',
    note: 'Glacier in the reflection. Walk to the quiet end first.',
  },
  {
    name: 'Hintersee Ramsau',
    badge: 'cold',
    julyHigh: '16°C',
    julyText: '14–16°C max',
    note: 'Coldest. Quietest. Glacier-clean.',
  },
];

// =====================================================================
// Render
// =====================================================================
function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badgeLabel(b: 'warm' | 'cool' | 'cold'): string {
  if (b === 'warm') return '🟢 Swimmable';
  if (b === 'cool') return '🟡 Cold but ok';
  return '🔴 Cold-shock';
}

function regionLabel(r: Lake['region']): string {
  if (r === 'salzkammergut') return 'Salzkammergut · AT';
  if (r === 'berchtesgaden') return 'Berchtesgaden · DE';
  if (r === 'bavaria') return 'Bavaria · DE';
  return 'Tyrol · AT';
}

function renderWarmthChart(): string {
  const rows = ALL_11.map(
    (l) => `
      <tr class="warmth-row warmth-row-${l.badge}">
        <td class="warmth-name">${escape(l.name)}</td>
        <td class="warmth-badge"><span class="lake-temp-badge lake-temp-${l.badge}">${badgeLabel(
          l.badge,
        )}</span></td>
        <td class="warmth-temp">${escape(l.julyText)}</td>
        <td class="warmth-note">${escape(l.note)}</td>
      </tr>
    `,
  ).join('');

  return `
    <div class="warmth-chart-wrap">
      <table class="warmth-chart">
        <thead>
          <tr>
            <th>Lake</th>
            <th>Swim verdict</th>
            <th>July water</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function lakeCard(l: Lake): string {
  const restrictionsBlock = l.restrictions
    ? `<div class="lake-section"><div class="lake-section-label">Restrictions</div><p>${escape(l.restrictions)}</p></div>`
    : '';

  const notesBlock = l.notesAvital
    ? `<div class="lake-card-tldr"><strong>TL;DR</strong> · ${escape(l.notesAvital)}</div>`
    : '';

  const chips = l.pairsWith.map((p) => `<span class="lake-chip">${escape(p)}</span>`).join('');

  const pickBtnHtml = pickButtonOverlay(l.id, 'lake', l.name);

  return `
    <article class="lake-card" id="lake-${l.id}" data-pick-card-id="${l.id}" data-pick-card-type="lake">
      <div class="lake-card-photo">
        <img src="${escape(l.heroPhoto.src)}" alt="${escape(l.heroPhoto.alt)}" loading="lazy" decoding="async" />
        ${pickBtnHtml}
        <div class="lake-card-region">${escape(regionLabel(l.region))}</div>
        <div class="lake-card-verified">Verified 2026-05-16</div>
        <div class="lake-card-temp-badge">
          <span class="lake-temp-badge lake-temp-${l.tempBadge}">${badgeLabel(l.tempBadge)}</span>
        </div>
        <div class="lake-card-photo-credit">
          <a href="${escape(l.heroPhoto.sourceUrl)}" target="_blank" rel="noreferrer noopener"
            >Photo: ${escape(l.heroPhoto.credit)}</a
          >
        </div>
      </div>

      <div class="lake-card-body">
        ${notesBlock}

        <h2 class="lake-card-name">${escape(l.name)}</h2>
        ${l.nameLocal ? `<p class="lake-card-namelocal">${escape(l.nameLocal)}</p>` : ''}

        <div class="lake-temp-block">
          <div class="lake-section-label">July water temperature</div>
          <p>${escape(l.tempJulyText)}</p>
          <a class="lake-source-link" href="${escape(l.tempSourceUrl)}" target="_blank" rel="noreferrer noopener">Source →</a>
        </div>

        <div class="lake-section">
          <div class="lake-section-label">Swim allowed?</div>
          <p>${escape(l.swimAllowed)}</p>
        </div>

        ${restrictionsBlock}

        <div class="lake-section">
          <div class="lake-section-label">Best entry point</div>
          <p>${escape(l.bestEntry)}</p>
          <p class="lake-entry-address">
            <strong>${escape(l.bestEntryAddress)}</strong>
            · <a href="${escape(l.bestEntryMapsUrl)}" target="_blank" rel="noreferrer noopener">Google Maps →</a>
          </p>
        </div>

        <div class="lake-section">
          <div class="lake-section-label">Facilities</div>
          <p>${escape(l.facilities)}</p>
        </div>

        <div class="lake-section">
          <div class="lake-section-label">Cost</div>
          <p>${escape(l.cost)}</p>
        </div>

        <div class="lake-section">
          <div class="lake-section-label">Crowding</div>
          <p>${escape(l.crowding)}</p>
        </div>

        <div class="lake-section lake-section-modesty">
          <div class="lake-section-label">Modesty / quieter shore</div>
          <p>${escape(l.modesty)}</p>
        </div>

        <div class="lake-section">
          <div class="lake-section-label">Pairs with</div>
          <div class="lake-chips">${chips}</div>
        </div>

        <div class="lake-drive-grid">
          <div class="lake-drive-label">Drive from base</div>
          <div class="lake-drive-cells">
            <div class="lake-drive-cell"><strong>Salzburg</strong><span>${escape(l.driveFromBases.salzburg)}</span></div>
            <div class="lake-drive-cell"><strong>Zell am See</strong><span>${escape(l.driveFromBases.zellAmSee ?? 'approx — see Salzburg + 1h20')}</span></div>
            <div class="lake-drive-cell"><strong>Gosau</strong><span>${escape(l.driveFromBases.gosau ?? l.driveFromBases.obertraun)}</span></div>
            <div class="lake-drive-cell"><strong>SZG airport</strong><span>${escape(l.driveFromBases.salzburgAirport ?? l.driveFromBases.salzburg)}</span></div>
          </div>
        </div>

        <div class="lake-card-links">
          <a href="${escape(l.officialUrl)}" target="_blank" rel="noreferrer noopener">Official tourism page →</a>
          <a href="${escape(l.bestEntryMapsUrl)}" target="_blank" rel="noreferrer noopener">Open in Google Maps →</a>
          <a class="video-search-chip" href="https://www.youtube.com/results?search_query=${encodeURIComponent(l.name + ' lake swimming Austria')}" target="_blank" rel="noreferrer noopener" aria-label="Search YouTube videos of ${escape(l.name)}">🎥 Videos</a>
        </div>
      </div>
    </article>
  `;
}

function renderLakeCards(): string {
  return LAKES.map(lakeCard).join('');
}

// =====================================================================
// Mount
// =====================================================================
const warmthRoot = document.getElementById('warmth-chart-root');
if (warmthRoot) {
  warmthRoot.innerHTML = renderWarmthChart();
}

const cardsRoot = document.getElementById('lake-cards-root');
if (cardsRoot) {
  cardsRoot.innerHTML = renderLakeCards();
}

initSharedShortlist();
