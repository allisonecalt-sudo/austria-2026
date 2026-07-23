// ===========================================================================
// add-verified-extras.mjs — one-shot insert of the 20 researched additions.
//
// Source: the 2026-07-23 research workflow (4 lanes -> 63 candidates -> every
// one adversarially fact-checked by an independent agent; 63/63 survived, and
// the corrections that came back are folded into the copy below).
//
// Why they are being added: Avital asked for trains and water sports/rafting,
// and Allison asked "is everything we would want to see there?". The audit
// found four real holes in the original 36:
//   • no rafting or river water sports at all
//   • no scenic train other than the Schafbergbahn
//   • NO GORGE, in a region famous for them
//   • nothing walkable for Shabbat — all 36 needed a car
//
// Photos: new entries get a coloured category tile (inline SVG data URI), not
// a stock photo. Guessing a Wikimedia filename would render a broken box and
// pretending an unrelated photo is the place would be worse than an honest
// tile. Where the exact place already has a verified photo in the file, that
// photo is reused.
// ===========================================================================

import fs from 'node:fs';

const FILE = 'src/plan-data.ts';
const CRLF = fs.readFileSync(FILE, 'utf8').includes('\r\n');

/** Honest category tile — an icon, never a fake photograph of the place. */
const tile = (emoji, bg) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="${bg}"/><text x="200" y="128" font-size="86" text-anchor="middle">${emoji}</text></svg>`,
  )}`;

const WATER = tile('🚣', '#dfeaf2');
const TRAIN = tile('🚂', '#ece6da');
const GORGE = tile('🏞', '#e2ece4');
const UNDER = tile('🧂', '#e9e4ef');
const SWIM = tile('🏊', '#dfeef0');
const CULT = tile('🏰', '#f0e8dc');

const NEW = [
  // ---- WATER + RAFTING ---------------------------------------------------
  {
    id: 'frost-rafting',
    name: 'FROST family rafting — the Salzach',
    emoji: '🚣',
    what: 'A gentle guided raft float — 5 km, only ~45 min actually on the water, grade 2+ maximum.',
    more: 'The scenic float, not a workout: small waves, a guide doing the steering, age 6 and up, about 2 hours door to door from the Frost Camp on the Salzach. €55 pp on FROST’s current published price list (the list carries no year stamp — reconfirm when you book). MUST BE BOOKED DIRECT: it runs ON REQUEST only, is sold on no platform at all (CheckYeti lists only their white-water tour), and needs 24 hours’ notice. There is no published minimum group size, so ask outright whether it will run for two people. Email info@frostrafting.at. Sat-nav to Hauserdorfstraße 2, 5662 — NOT “Taxenbach”, which is how the booking sites file them.',
    drive: '🚗 11 min · 9.5 km from Zell am See',
    duration: '~2h total, 45 min on the river',
    difficulty: 'easy',
    chips: ['€55 pp', 'BOOK AHEAD — on request only', 'age 6+', 'season to 15 Sept'],
    photo: WATER,
    swim: true,
    star: true,
    maps: 'Frost Rafting Hauserdorfstraße 2 Bruck an der Großglocknerstraße',
  },
  {
    id: 'taxenbach-rafting',
    name: 'Rafting Center Taxenbach',
    emoji: '🛶',
    what: 'The bigger Salzach run — grade 3/4, about 2 hours on the river out of 4 door to door.',
    more: 'Four departures a day: 09:00, 10:00, 13:00 and 14:00. €64 adult (€54 for 12–15). BOOK DIRECT on +43 664 4025149 — the Adventure Service resale is €68.50, i.e. MORE expensive, not less. Ignore the €48 you will see advertised on their own homepage; that is a stale teaser. 19 minutes from the Zell bed.',
    drive: '🚗 19 min · 18 km from Zell am See',
    duration: '~4h total, ~2h on the river',
    difficulty: 'moderate',
    chips: ['€64 adult', 'book direct — resale costs more', '09:00 · 10:00 · 13:00 · 14:00'],
    photo: WATER,
    swim: true,
    maps: 'Rafting Center Taxenbach',
  },
  {
    id: 'out2-rafting',
    name: 'OUT2 rafting — from Zell town centre',
    emoji: '🚣',
    what: '11 km of grade 3–4 water, starting from an office you can walk to from the Zell apartment.',
    more: 'Franz-Josef-Straße 7, in the middle of Zell — no drive at all. €65 adult, €60 under 15 (CheckYeti from €60). Age 10 with an adult. Two slots: 09:00–13:00 and 14:00–18:00 — the German page says 18:30, so do not schedule anything tight afterwards. Budget about 5 hours door to door. Book ahead.',
    drive: '🚗 0 — in Zell am See itself',
    duration: '~5h door to door',
    difficulty: 'moderate',
    chips: ['€65 adult', 'walkable from the Zell bed', 'book ahead', 'age 10+'],
    photo: WATER,
    swim: true,
    maps: 'OUT2 Zell am See Franz-Josef-Straße 7',
  },
  {
    id: 'lofer-basecamp',
    name: 'Base Camp Lofer — Panorama raft',
    emoji: '🚣',
    what: 'Their easiest raft: 11 km of grade II water that crosses into Bavaria mid-river.',
    more: '€74 adult, age 6 and up, about 3 hours. Daily 09:00–19:00, season to end September. Their price list is still headed “Preisliste 2025”, so expect a small rise. Book DIRECT — CheckYeti adds €7–14 pp. NOTE for Monday 27 July: the other Lofer operator (Motion) is CLOSED MONDAYS across rafting, canoe and canyoning; Base Camp and FROST are open.',
    drive: '🚗 36 min · 40 km from Zell am See',
    duration: '~3h',
    difficulty: 'easy',
    chips: ['€74 adult', 'age 6+', 'book direct — cheapest channel'],
    photo: WATER,
    swim: true,
    maps: 'Base Camp Lofer Hallenstein 25',
  },
  {
    id: 'pathfinder-kayak',
    name: 'Kayak, canoe or SUP on the Hallstättersee',
    emoji: '🛶',
    what: 'Your own boat delivered to the Gosaumühle car park, on the quiet end of the Hallstatt lake.',
    more: 'Single kayak €40 day / €30 half · double €60/€45 · canoe €60/€45 · SUP €35/€25. Half-days are 09:00–13:00 or 13:00–17:00 and the CHECK-IN WINDOWS ARE FIXED (09:00–10:00 or 13:00–14:00). Life jackets come with kayaks and canoes but NOT with the SUP. MUST be booked at least a day ahead, best by phone on +43 664 25 27 059 — and the office is only open Mon–Fri 09:00–12:00, so a Saturday or Sunday boat means calling Friday morning at the latest.',
    drive: '🚗 9 min · 7 km from Bad Goisern',
    duration: 'half day',
    difficulty: 'easy',
    chips: [
      'SUP €25 half-day · kayak €30',
      'BOOK ≥1 day ahead — office Mon–Fri 09–12',
      'fixed check-in window',
    ],
    photo: WATER,
    swim: true,
    maps: 'Gosaumühle Hallstättersee',
  },
  {
    id: 'hallstattersee-boat',
    name: 'Lake boat from your own Bad Goisern shore',
    emoji: '⛴',
    what: 'The scheduled Hallstättersee boat calls at Untersee and Steeg — Bad Goisern’s own lakefront.',
    more: 'THE FIND: the northern route only runs 18 July – 16 August, and your week lands inside it. Boards Untersee 10:40 and 16:40, Steeg 11:20 and 17:25. The northern fare is published nowhere — pay on board, CASH ONLY, no bikes. (For reference the southern round trip from Hallstatt Markt is €18 adult, departing 11:00/13:00/14:00/15:00/16:00 — there is no 10:00.) A boat on the lake you are sleeping beside, without driving anywhere.',
    drive: '🚗 8 min · 5 km to the Untersee pier',
    duration: '~1–2h',
    difficulty: 'flat',
    chips: ['CASH ONLY — fare unpublished', 'only runs 18 Jul – 16 Aug', 'Untersee 10:40 · 16:40'],
    photo: WATER,
    star: true,
    maps: 'Schifffahrt Hallstättersee Untersee Bad Goisern',
  },
  {
    id: 'strandbad-untersee',
    name: 'Strandbad Untersee',
    emoji: '🏊',
    what: 'Free lakeside lido with a jetty, floating raft, trampoline and a 3 m diving tower.',
    more: 'Entry is free; PARKING is €2.20/hour or €11 a day — the English page still says parking is free and it is not. Buffet open May to mid-September, roughly 09:00–22:00. There is a separate FKK section at the back; the main beach is ordinary. Eight minutes from the Bad Goisern bed.',
    drive: '🚗 8 min · 5 km from Bad Goisern',
    duration: '2–4h',
    difficulty: 'flat',
    chips: ['free entry · parking €11/day', 'diving tower + trampoline'],
    photo: SWIM,
    swim: true,
    maps: 'Strandbad Untersee Bad Goisern',
  },
  {
    id: 'parkbad-goisern',
    name: 'Parkbad Bad Goisern — the Shabbat answer',
    emoji: '🏊',
    what: 'The village pool, walkable from the apartment — the one thing on this whole list that needs no car.',
    more: 'THE GAP THIS FILLS: every one of the original 36 ideas needed the car, and on Saturday 25 July you are not driving. This is a 500 m walk. €8.70, open 09:00–19:00. And on that same Saturday the HALLSTÄTTERSEE SWIM MARATHON is happening about 3 km along the shore at Strandbad Untersee — also walkable: swims start 09:30 (5 km), 10:00 (2.1 km) and 10:30 (the 7 km crossing from Obertraun); the first 7 km finishers arrive around 12:30, the course closes 15:30, prizes at 16:00. Spectator price is not published — the lido may charge its usual entry.',
    drive: '🚗 0 — a 500 m walk from the apartment',
    duration: '2–4h',
    difficulty: 'flat',
    chips: ['€8.70', 'WALKABLE — works on Shabbat', '09:00–19:00'],
    photo: SWIM,
    swim: true,
    star: true,
    maps: 'Parkbad Bad Goisern Auskei-Weg 1',
  },

  // ---- GORGES (the 36 had none) ------------------------------------------
  {
    id: 'liechtensteinklamm',
    name: 'Liechtensteinklamm',
    emoji: '🏞',
    what: 'The famous deep gorge — a walkway pinned to sheer rock above roaring water.',
    more: 'The best-placed of the three gorges for your week: it sits on the Zell → Gosau drive on Tuesday 28th, so it costs you almost no extra driving. €16 at the gate, €15 online, open 09:00–18:00. IMPORTANT: queues run up to an hour between 10:00 and 14:30 — and that applies to online-ticket holders TOO, so go before 10:00 or after 14:30.',
    drive: '🚗 44 min from Zell — and it is ON the Tuesday drive to Gosau',
    duration: '~1.5h',
    difficulty: 'easy',
    chips: ['€16 gate · €15 online', 'go before 10:00 or after 14:30', 'on the Tuesday drive'],
    photo: GORGE,
    star: true,
    maps: 'Liechtensteinklamm St. Johann im Pongau',
  },
  {
    id: 'kitzlochklamm',
    name: 'Kitzlochklamm',
    emoji: '🏞',
    what: 'A short, dramatic gorge walk 20 minutes from Zell — boardwalks, tunnels and spray.',
    more: '€11 adult, CASH ONLY. Open 08:00–18:00 but LAST ENTRY IS 17:00. About an hour and a half. The nearest gorge to the Zell bed and the easiest one to slot into a half-day. Better in rain, not worse.',
    drive: '🚗 22 min · 19 km from Zell am See',
    duration: '~1.5h',
    difficulty: 'easy',
    chips: ['€11 — CASH ONLY', 'last entry 17:00', 'better in rain'],
    photo: GORGE,
    maps: 'Kitzlochklamm Taxenbach',
  },
  {
    id: 'seisenbergklamm',
    name: 'Seisenbergklamm, Weißbach',
    emoji: '🏞',
    what: 'The cheapest and shortest of the three gorges — about an hour of wooden walkway over green water.',
    more: '€9 adult, €5 child, and free with a Salzburger Saalachtal or SalzburgerLand card. HONEST CAVEAT: it is often sold as “gentle”, and it is not quite — about 300 steps and 80 m of climb. Still easy, but not flat.',
    drive: '🚗 27 min · 28 km from Zell am See',
    duration: '~1h',
    difficulty: 'easy',
    chips: ['€9 adult', '~300 steps — not flat', 'free with a Saalachtal card'],
    photo: GORGE,
    maps: 'Seisenbergklamm Weißbach bei Lofer',
  },

  // ---- UNDERGROUND (Salzwelten Hallstatt is shut) ------------------------
  {
    id: 'dachstein-icecave',
    name: 'Dachstein Giant Ice Cave + Mammut Cave',
    emoji: '🧊',
    what: 'Two enormous guided caves inside the Dachstein — real ice formations underground, in July.',
    more: 'The replacement for the closed Hallstatt salt mine. €50.20 adult covers the cable car (section 1) and BOTH guided tours; 50 minutes per cave, a 15–20 minute walk from the middle station, so about 3.5–4 hours in total. Cold underground — take a jacket. Run by Dachstein Tourismus AG.',
    drive: '🚗 37 min · 25 km from Bad Goisern (39 min from Gosau)',
    duration: '3.5–4h',
    difficulty: 'moderate',
    chips: ['€50.20 incl. cable car + both caves', 'cold — take a jacket', 'works in rain'],
    photo: UNDER,
    maps: 'Dachstein Rieseneishöhle Obertraun',
  },
  {
    id: 'salzwelten-altaussee',
    name: 'Salzwelten Altaussee salt mine',
    emoji: '🧂',
    what: 'The working salt mine — flat, warm coats, wooden slides, and the Monuments Men chambers.',
    more: 'This is the mine that is actually OPEN (Salzwelten Hallstatt is shut for renovation into summer 2026). €27, daily 09:00–16:00 until 13 September, about 90 minutes, and it is FLAT inside. The chambers where the Nazis stored looted art are part of the tour. Note: the underground salt lake belongs to the Hallein mine, not this one. 26 minutes from the Bad Goisern bed — an ideal wet-day answer.',
    drive: '🚗 26 min · 22 km from Bad Goisern',
    duration: '~1.5h',
    difficulty: 'flat',
    chips: ['€27', 'daily 09:00–16:00', 'flat inside', 'the one that is OPEN'],
    photo: UNDER,
    star: true,
    maps: 'Salzwelten Altaussee',
  },

  // ---- TRAINS (Avital's ask) --------------------------------------------
  {
    id: 'pinzgauer-bahn',
    name: 'Pinzgauer Lokalbahn — Zell to Mittersill',
    emoji: '🚂',
    what: 'A narrow-gauge valley railway leaving from the platform in Zell — 47 minutes up the Pinzgau.',
    more: 'Hourly at :02 every day, roughly 05:02 to 22:02. The extra :32 departures are MON–FRI ONLY, not weekends. €12.80 is the full Zell–Krimml fare; Mittersill costs less. If you ride at the weekend the WEEKEND TICKET is €25 for up to three people, unlimited Saturday and Sunday. Trains now terminate at Mittersill — Krimml is a replacement bus indefinitely after 2021 flood damage, with no reopening date. Bikes must be booked by 14:00 the day before and cannot go on the bus.',
    drive: '🚗 0 — the station is in Zell am See',
    duration: '~2–3h return',
    difficulty: 'flat',
    chips: ['€12.80 full line · €25 weekend for 3', 'hourly at :02', 'Krimml section is a bus'],
    photo: TRAIN,
    maps: 'Bahnhof Zell am See Pinzgauer Lokalbahn',
  },
  {
    id: 'taurachbahn',
    name: 'Taurachbahn steam train, Mauterndorf',
    emoji: '🚂',
    what: 'A genuine narrow-gauge steam train through the Lungau — and it runs Fri, Sat and Sun.',
    more: 'Departures 10:00 and 14:00 from Mauterndorf, returning 12:20 and 16:20. €25 return, €18 single, under-15s half price, 20% off with a Lungau Card. About 1h15 from Zell. TWO HONEST CAVEATS: it is volunteer-run, so there is no obligation to operate on any given day, and if the steam locomotive fails a diesel substitutes with no refund. Its Fri/Sat/Sun schedule means it does NOT clash with your Thursday in Germany.',
    drive: '🚗 1h35 · 120 km from Zell am See',
    duration: '~2.5h + the drive',
    difficulty: 'flat',
    chips: ['€25 return', 'Fri · Sat · Sun only', 'volunteer-run — may not operate'],
    photo: TRAIN,
    maps: 'Taurachbahn Mauterndorf',
  },
  {
    id: 'hallstatt-by-train',
    name: 'Hallstatt by train + ferry — no car, no parking',
    emoji: '⛴',
    what: 'The classic car-free arrival: 12 minutes by train from Bad Goisern, then the ferry across to the village.',
    more: 'Bad Goisern 10:13 → Hallstatt station 10:25, no change, calling at Steeg-Gosau. The ferry meets every train, crosses in 10–15 minutes, and costs €4 single / €8 return — CASH ONLY. You arrive at the postcard end of the village instead of fighting for a parking space. ⚠️ A special timetable (Sonderfahrplan) is in force 11 July – 3 August 2026: these are real trains, not buses, but the times are altered and ÖBB says connections are not guaranteed — re-check the day before.',
    drive: '🚗 1 min — the station is in Bad Goisern',
    duration: '~4h with the village',
    difficulty: 'flat',
    chips: ['ferry €8 return — CASH ONLY', 'special timetable 11 Jul – 3 Aug', 'no parking needed'],
    photo: TRAIN,
    star: true,
    maps: 'Bahnhof Bad Goisern',
  },
  {
    id: 'attersee-bahn-schiff',
    name: '“Bahn & Schiff” — Attersee train + cruise',
    emoji: '🚂',
    what: 'One ticket covering the little Atterseebahn and a cruise on Austria’s largest lake.',
    more: 'Round trip South €36.30 adult, North €27.30. High season 4 July – 13 September, daily. From Vöcklamarkt: North departs 09:34 / 10:34 / 14:34 / 15:34, South 08:34 / 10:34 / 13:34–13:38. North is about 3 hours door to door, South about 4. ⚠️ Sailings get cancelled for weather and the day’s timetable is only posted from 17:00 the evening before — check then, not in the morning.',
    drive: '🚗 1h05 · 59 km from Bad Goisern',
    duration: '3–4h + the drive',
    difficulty: 'flat',
    chips: [
      '€36.30 south · €27.30 north',
      'daily 4 Jul – 13 Sept',
      'weather cancellations — check 17:00 the night before',
    ],
    photo: TRAIN,
    maps: 'Bahnhof Vöcklamarkt Atterseebahn',
  },

  // ---- OTHER REAL GAPS ---------------------------------------------------
  {
    id: 'hohensalzburg',
    name: 'Hohensalzburg fortress',
    emoji: '🏰',
    what: 'The great white fortress over Salzburg — funicular up, ramparts, and the whole city below.',
    more: 'The one thing every visitor to Salzburg is assumed to have seen, and it was missing from the list. All-inclusive with the funicular €19.20; basic with funicular €15.50; €14.50 if you walk up. ⚠️ THE TRAP: the fortress CLOSES AT 20:00 even though the funicular runs until 21:30, and ticket sales stop an hour before the indoor areas close. Plan around 20:00, not 21:30. Fifteen minutes from the Wals bed.',
    drive: '🚗 15 min · 7 km from Wals',
    duration: '~2–3h',
    difficulty: 'easy',
    chips: ['€19.20 all-in with funicular', 'CLOSES 20:00 — not 21:30'],
    photo: CULT,
    maps: 'Festung Hohensalzburg Salzburg',
  },
  {
    id: 'kaiservilla',
    name: 'Kaiservilla, Bad Ischl',
    emoji: '🏰',
    what: 'Franz Joseph’s summer villa — entry is by 45-minute guided tour only, plus a big park.',
    more: 'Twelve minutes from the Bad Goisern bed, and the best bad-weather insurance for that half of the trip. Daily 09:30–17:00, tours 09:45–16:45. Park alone €6.70 · park + villa €24 · + Marmorschlössl €30 · park + Marmorschlössl €12.70. Note the Marmorschlössl in 2026 houses a contemporary art show, not the standing photography collection.',
    drive: '🚗 12 min · 10 km from Bad Goisern',
    duration: '~2h',
    difficulty: 'flat',
    chips: ['park + villa €24', 'guided tour only', 'good wet-weather answer'],
    photo: CULT,
    maps: 'Kaiservilla Bad Ischl',
  },
  {
    id: 'eurothermen-ischl',
    name: 'EurothermenResort Bad Ischl — warm water at night',
    emoji: '♨️',
    what: 'Thermal pools open until midnight — the only genuinely late option in the Salzkammergut.',
    more: 'Fifteen minutes from the Bad Goisern bed and open to midnight, with swimming ending 23:30. From €34 for a day ticket or €31.50 for four hours — pricing is dynamic, so “from” is doing real work there. The sauna world is textile-free; the pool hall is not, so you can stay in a swimsuit and skip the sauna side entirely.',
    drive: '🚗 12 min · 10 km from Bad Goisern',
    duration: '2–4h evening',
    difficulty: 'flat',
    chips: ['from €34 day · €31.50 for 4h', 'open to midnight', 'pool hall is swimsuit'],
    photo: SWIM,
    swim: true,
    maps: 'EurothermenResort Bad Ischl',
  },
];

// --- render each entry in the file's existing style -------------------------
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

function render(a) {
  const lines = [
    '  {',
    `    id: '${a.id}',`,
    `    name: '${esc(a.name)}',`,
    `    emoji: '${a.emoji}',`,
    `    what: '${esc(a.what)}',`,
    `    more: '${esc(a.more)}',`,
    `    drive: '${esc(a.drive)}',`,
    `    duration: '${esc(a.duration)}',`,
    `    difficulty: '${a.difficulty}',`,
    `    chips: [${a.chips.map((c) => `'${esc(c)}'`).join(', ')}],`,
    `    photo: '${a.photo}',`,
  ];
  if (a.swim) lines.push('    swim: true,');
  if (a.sunset) lines.push('    sunset: true,');
  if (a.star) lines.push('    star: true,');
  lines.push(`    maps: G('${esc(a.maps)}'),`);
  lines.push('  },');
  return lines.join('\n');
}

let src = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

if (src.includes("id: 'frost-rafting'")) {
  console.log('already added — nothing to do');
  process.exit(0);
}

const marker = '];\n\nexport const byId';
if (!src.includes(marker)) {
  console.error('✗ could not find the end of ACTIVITIES');
  process.exit(1);
}

const block =
  '\n  // ---- ADDED 2026-07-23 from the verified research sweep ------------------\n' +
  '  // 4 lanes → 63 candidates → every one adversarially fact-checked, 63/63\n' +
  '  // survived. Fills the four real holes in the original 36: no rafting, no\n' +
  '  // train but the Schafberg, NO GORGE at all, and nothing walkable for Shabbat.\n' +
  NEW.map(render).join('\n') +
  '\n';

src = src.replace(marker, block + marker);
fs.writeFileSync(FILE, CRLF ? src.replace(/\n/g, '\r\n') : src);
console.log(`✓ added ${NEW.length} verified activities to ${FILE}`);
