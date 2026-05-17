// Water-activities page bootstrap.
//
// Avital's ask, relayed 2026-05-16 23:41: "Are there rafting/on lake activity options?"
//
// Context: They rafted the Tara River in Montenegro 2024 (loved it) and
// kayaked on Skadar Lake (capsized — also loved it). So they're comfortable
// with light adventure and want to know what's on the menu in the
// Salzburg + Salzkammergut + Berchtesgaden region.
//
// Page answers: yes — rafting on Salzach + Saalach, kayak/SUP on every
// Salzkammergut lake, electric boats on Königssee + Wolfgangsee, salt-mine
// brine-lake boat as a quirky bonus. Per-option price, operator link, drive
// time from each base, modesty + booking lead time, TL;DR line.
//
// Pattern matches page-lake-swimming.ts (same agent, same trip): card
// renderer + chart, all data inline so trip-data.ts stays untouched.

// Module guard — keeps top-level names from colliding with other page
// scripts that also define `escape()`, `regionLabel()`, etc.
export {};

import { initSharedShortlist, pickButtonOverlay } from './shortlist-shared.js';

interface WaterOption {
  id: string;
  name: string;
  type: 'rafting' | 'kayak' | 'sup' | 'sailing' | 'electric-boat' | 'paddle-boat' | 'specialty';
  where: string; // "Saalach River, Lofer" / "Hallstättersee, Obertraun"
  region: 'salzkammergut' | 'berchtesgaden' | 'salzburg-area' | 'bavaria';
  difficulty: 'beginner' | 'family' | 'intermediate' | 'experienced';
  difficultyNote: string; // human-readable
  duration: string; // "Full-day rafting 4-5 hr" / "Hourly SUP rental"
  priceEur: string; // "€59pp" / "€18/hr"
  priceNis: string; // "≈₪240" / "≈₪73/hr"
  operator: string;
  operatorUrl: string;
  bookingLead: string; // "24-48 hr advance" / "Walk-up OK"
  bestDayFit: string; // "Mon Jul 27 (Lofer day)" / "Any Hallstatt afternoon"
  driveFromBases: {
    obertraun: string;
    berchtesgaden: string;
    stWolfgang: string;
    salzburg: string;
  };
  modesty: string;
  tldr: string;
  verified: string; // ISO date
  sourceUrl?: string;
}

// =====================================================================
// Rafting options (whitewater)
// =====================================================================
const RAFTING: WaterOption[] = [
  {
    id: 'saalach-lofer-classic',
    name: 'Saalach River — Lofer classic raft',
    type: 'rafting',
    where: 'Saalach River, Lofer (Salzburg–Bavaria border)',
    region: 'salzburg-area',
    difficulty: 'family',
    difficultyNote:
      'Class II-III. The "wow without scary" tier — Montenegro Tara was harder. From age 6 on most family runs, age 12 on the sportier middle section.',
    duration: '3-4 hr total · ~2 hr on the water',
    priceEur: '€55-65pp',
    priceNis: '≈₪225-265pp',
    operator: 'Motion Center Lofer (Outdo / family-operator hub since 1984)',
    operatorUrl: 'https://www.motion-center.at/en/rafting/',
    bookingLead: '24-48 hr in advance — book online, English-speaking staff.',
    bestDayFit:
      'Mon Jul 27 morning (if Lofer day is in the plan) OR Sat Jul 25 afternoon if you base near Salzburg. ~75 min drive from Salzburg.',
    driveFromBases: {
      obertraun: '110 min',
      berchtesgaden: '40 min',
      stWolfgang: '85 min',
      salzburg: '75 min',
    },
    modesty:
      'Wetsuit + splash jacket + helmet + lifevest provided — covers everything. Wear shvimkleid or leggings + long-sleeve rash guard underneath. Co-ed but you are layered head-to-toe — less skin showing than at a regular beach.',
    tldr: 'Tara-level fun, easier rapids, family-friendly, ~₪240pp. The default rafting pick.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.motion-center.at/en/',
  },
  {
    id: 'saalach-lofer-sport',
    name: 'Saalach River — Sport / advanced raft',
    type: 'rafting',
    where: 'Saalach River, Lofer (middle gorge)',
    region: 'salzburg-area',
    difficulty: 'intermediate',
    difficultyNote:
      'Class III-IV in higher water (June + after rain). This is the "more like the Tara" version — bigger waves, faster runs. Min age 14-16 depending on water level.',
    duration: '4-5 hr total · ~2.5 hr on the water',
    priceEur: '€69-79pp',
    priceNis: '≈₪280-325pp',
    operator: 'Crocodile Sports Lofer (also: Adventure Center Lofer)',
    operatorUrl: 'https://www.crocodile-sports.com/en/rafting/',
    bookingLead: '48 hr in advance — water-level dependent, they confirm day-of.',
    bestDayFit:
      'Same Lofer-day fit as the classic. Pick this one only if late July water is still fast — by late July rivers usually drop and the classic is the better-value run.',
    driveFromBases: {
      obertraun: '110 min',
      berchtesgaden: '40 min',
      stWolfgang: '85 min',
      salzburg: '75 min',
    },
    modesty:
      'Same wetsuit + helmet + jacket kit as the classic. Co-ed boat (typically 6-8 people + guide). Layered fully.',
    tldr: 'Closest match to the Tara intensity. ~₪300pp. Verify water level July-week with the operator.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.crocodile-sports.com/en/',
  },
  {
    id: 'salzach-schwarzach',
    name: 'Salzach River — beginner / scenic raft',
    type: 'rafting',
    where: 'Salzach River, Schwarzach im Pongau (south of Salzburg)',
    region: 'salzburg-area',
    difficulty: 'beginner',
    difficultyNote:
      'Class II — gentle rapids, mostly scenic float through the Salzach gorge. Good for "we want to be on a raft but not work hard." Age 6+.',
    duration: '3 hr total · ~2 hr float',
    priceEur: '€49-55pp',
    priceNis: '≈₪200-225pp',
    operator: 'Outdoor Leadership (Schwarzach base)',
    operatorUrl: 'https://www.outdoor-leadership.com/raften/salzach.html',
    bookingLead: '24-48 hr advance.',
    bestDayFit:
      'If you skip Lofer entirely. Schwarzach is ~70 min south of Salzburg on the way to/from Grossglockner — could pair with a Pongau day. Less obvious fit than the Lofer raft.',
    driveFromBases: {
      obertraun: '90 min',
      berchtesgaden: '95 min',
      stWolfgang: '95 min',
      salzburg: '70 min',
    },
    modesty:
      'Wetsuit + lifevest. Same modest-friendly layered kit as the other rafts. Scenic float = less splashing = even more covered.',
    tldr: 'If you want the raft experience without intensity — the Salzach scenic float. ~₪215pp.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.outdoor-leadership.com/',
  },
];

// =====================================================================
// Kayak / SUP rentals by lake
// =====================================================================
const PADDLE: WaterOption[] = [
  {
    id: 'hallstattersee-sup-obertraun',
    name: 'Hallstättersee — SUP + kayak rental',
    type: 'sup',
    where: 'Obertraun shore (your home-base lake if you stay in Obertraun)',
    region: 'salzkammergut',
    difficulty: 'beginner',
    difficultyNote:
      'Flat alpine lake, calm mornings + evenings, can get small wind chop midday. SUP is forgiving — easy to relearn balance in 10 min if you have not paddled in a while.',
    duration: '€15-22/hr · half-day €35-50 · full-day €60-80',
    priceEur: '€15-22/hr',
    priceNis: '≈₪60-90/hr',
    operator: 'Strandbad Obertraun rental kiosk + Hallstatt Boats',
    operatorUrl: 'https://www.obertraun.net/obertraun-en-US/active-holiday/water-sports/',
    bookingLead: 'Walk-up OK on weekdays · weekend = call ahead.',
    bestDayFit:
      'Any Hallstatt-area evening — sunset paddle on the lake with the church reflected is the Instagram moment. Mornings (8-10 AM) = glassy mirror water.',
    driveFromBases: {
      obertraun: '0 min',
      berchtesgaden: '95 min',
      stWolfgang: '40 min',
      salzburg: '75 min',
    },
    modesty:
      'Lifevest provided. Wear shvimkleid + long-sleeve rash guard. SUP balance with full coverage is totally normal — no one cares what you wear. Quieter corners = south end of the lake toward Obertraun-Untersee.',
    tldr: 'Cheap, walk-up, sunset paddle on the trip postcard lake. The default if you base in Obertraun.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.obertraun.net/',
  },
  {
    id: 'wolfgangsee-sup-strobl',
    name: 'Wolfgangsee — SUP + kayak rental',
    type: 'sup',
    where: 'Strobl / St. Wolfgang shore',
    region: 'salzkammergut',
    difficulty: 'beginner',
    difficultyNote:
      'Calm alpine lake, popular SUP scene. Sailing scene also lives here if you ever want a half-day sailing lesson (separate operators).',
    duration: '€15-20/hr SUP · €18-25/hr single kayak · €25-35/hr double kayak',
    priceEur: '€15-25/hr',
    priceNis: '≈₪60-100/hr',
    operator: 'Strandbad Strobl rental + StandUp! Schule St. Gilgen',
    operatorUrl: 'https://www.wolfgangsee.salzkammergut.at/en/things-to-do/sports.html',
    bookingLead: 'Walk-up OK midweek · weekends call.',
    bestDayFit:
      'If you base in St. Wolfgang — walk out the door. From Obertraun = 40 min drive, less of a fit unless you are already doing the Schafbergbahn.',
    driveFromBases: {
      obertraun: '40 min',
      berchtesgaden: '80 min',
      stWolfgang: '0-5 min',
      salzburg: '50 min',
    },
    modesty:
      'Same lifevest + shvimkleid + rash guard combo. Wolfgangsee is more touristy than Hallstättersee but the modesty culture is unchanged at Austrian lakes — no one notices.',
    tldr: 'Default if you base at Wolfgangsee. Bigger sailing scene if you want to try that too.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.wolfgangsee.salzkammergut.at/',
  },
  {
    id: 'attersee-sup-sail',
    name: 'Attersee — SUP, kayak, sailing',
    type: 'sailing',
    where: 'Attersee shore (Seewalchen + Unterach + Weyregg)',
    region: 'salzkammergut',
    difficulty: 'family',
    difficultyNote:
      'Biggest sailing scene in the region — multiple schools offer half-day intro sails. SUP + kayak rental at most Strandbäder around the lake. Open water = can be windier than Hallstättersee, more interesting for sailing, slightly more work for SUP.',
    duration: 'SUP €18-22/hr · kayak €20-30/hr · half-day sailing intro €70-90pp',
    priceEur: '€18-90pp',
    priceNis: '≈₪75-370pp',
    operator: 'Strandbad Seewalchen kiosk · Segelschule Attersee · multiple operators',
    operatorUrl: 'https://attersee-attergau.salzkammergut.at/en/activities/sports-and-health.html',
    bookingLead: 'Walk-up SUP/kayak. Sailing lesson = 48 hr advance.',
    bestDayFit:
      'Pair with the Attersee swim day (warmest lake = best paddle when you want to fall in). 55 min from Obertraun, 25 min from St. Wolfgang.',
    driveFromBases: {
      obertraun: '55 min',
      berchtesgaden: '90 min',
      stWolfgang: '25 min',
      salzburg: '55 min',
    },
    modesty:
      'Sailing lessons run in pairs/groups — wear shvimkleid + rash guard + leggings. Lifevest required. Sailing schools are matter-of-fact, focus is on the boat not the bodies.',
    tldr: 'Warmest lake, biggest scene. SUP for an hour, OR commit to a half-day intro sail (~₪350pp).',
    verified: '2026-05-16',
    sourceUrl: 'https://attersee-attergau.salzkammergut.at/',
  },
  {
    id: 'gosausee-kayak',
    name: 'Vorderer Gosausee — single/double kayak rental',
    type: 'kayak',
    where: 'Gosausee trailhead café (near Gosau village)',
    region: 'salzkammergut',
    difficulty: 'beginner',
    difficultyNote:
      'Small alpine lake, no motorboats (nature reserve), glacier reflection straight ahead. Cold water (~16-18°C) — kayak keeps you dry but if you tip you are in glacial melt.',
    duration: '€15-20/hr single · €25-30/hr double · usually 1-2 hr is enough for the whole lake',
    priceEur: '€15-30/hr',
    priceNis: '≈₪60-125/hr',
    operator: 'Gasthof Gosausee café rental kiosk (lakeside)',
    operatorUrl:
      'https://dachstein.salzkammergut.at/en/visitor-information/our-lakes/lake-gosau.html',
    bookingLead: 'Walk-up. Closed in bad weather.',
    bestDayFit:
      'If you do the Gosausee sunset spot (locked Day-3 trip plan moment) — get there 2 hr earlier and kayak in afternoon, dry off, stay for sunset. 30 min from Obertraun.',
    driveFromBases: {
      obertraun: '30 min',
      berchtesgaden: '110 min',
      stWolfgang: '55 min',
      salzburg: '85 min',
    },
    modesty:
      'Kayak = covered seating, lifevest. Most modest of the paddle options because you sit IN the boat. Walk-up at a small alpine café — almost no scene to worry about.',
    tldr: 'Kayak with the glacier in your reflection. Tiny operator, hour or two is plenty.',
    verified: '2026-05-16',
    sourceUrl: 'https://dachstein.salzkammergut.at/',
  },
  {
    id: 'mondsee-sup-sail',
    name: 'Mondsee — SUP + kayak + small sailing',
    type: 'sup',
    where: 'Alpenseebad Mondsee (the big lido)',
    region: 'salzkammergut',
    difficulty: 'family',
    difficultyNote:
      'Family-pool energy lake. Rental kiosk at the Strandbad. Smaller sailing scene than Attersee.',
    duration: '€14-20/hr SUP · €18-28/hr kayak',
    priceEur: '€14-28/hr',
    priceNis: '≈₪60-115/hr',
    operator: 'Alpenseebad Mondsee rental kiosk + Segelschule Mondsee',
    operatorUrl:
      'https://mondsee.salzkammergut.at/en/oesterreich-poi/detail/201982/alpine-beach-mondsee.html',
    bookingLead: 'Walk-up.',
    bestDayFit:
      'Combine with Mondsee swim + Sound of Music church visit. 35 min from Salzburg = best as a Salzburg-side combo, less obvious from Obertraun.',
    driveFromBases: {
      obertraun: '70 min',
      berchtesgaden: '85 min',
      stWolfgang: '25 min',
      salzburg: '35 min',
    },
    modesty: 'Big public Strandbad, family scene, shvimkleid invisible. Lifevest provided.',
    tldr: 'Easiest combo day: SoM church + lake swim + 1 hr SUP. €14/hr = cheapest of the lot.',
    verified: '2026-05-16',
    sourceUrl: 'https://mondsee.salzkammergut.at/',
  },
];

// =====================================================================
// Specialty — electric boats, paddle boats, salt-mine brine boat
// =====================================================================
const SPECIALTY: WaterOption[] = [
  {
    id: 'konigssee-electric-boat',
    name: 'Königssee — electric boat to St. Bartholomä',
    type: 'electric-boat',
    where: 'Königssee, Schönau (Berchtesgaden NP)',
    region: 'berchtesgaden',
    difficulty: 'beginner',
    difficultyNote:
      'Already on the trip itinerary as the "Tara-Bridge-tier moment" — silent electric boats only since 1909, no motorboats allowed in the national park. This is the iconic Königssee experience.',
    duration:
      '50 min one-way to St. Bartholomä · ~2 hr round-trip with stop · 4 hr if you go to Salet (far end)',
    priceEur: 'Adults €23 (St. Bartholomä) / €26 (Salet) · kids ~half',
    priceNis: '≈₪95-110pp',
    operator: 'Bayerische Seenschifffahrt (official park operator since 1909)',
    operatorUrl: 'https://www.seenschifffahrt.de/koenigssee/',
    bookingLead: 'Walk-up OK but arrive before 09:00 in peak summer or wait 1+ hr. No online tix.',
    bestDayFit: 'Already locked Day-3 (Berchtesgaden day). Combine with Malerwinkel cove swim.',
    driveFromBases: {
      obertraun: '90 min',
      berchtesgaden: '10 min',
      stWolfgang: '85 min',
      salzburg: '35 min',
    },
    modesty:
      'Passive boat ride. Wear anything modest. The guide does the classic trumpet-echo demonstration mid-lake — old-school tourism, sweet.',
    tldr: 'Already on the itinerary. ₪100pp. The trip-postcard moment. Arrive early.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.seenschifffahrt.de/',
  },
  {
    id: 'wolfgangsee-electric-tour',
    name: 'Wolfgangsee — Schafberg-line classic ferry',
    type: 'electric-boat',
    where: 'Wolfgangsee (St. Gilgen ↔ Strobl ↔ St. Wolfgang)',
    region: 'salzkammergut',
    difficulty: 'beginner',
    difficultyNote:
      'Modern hybrid-electric ferries since 2019. Casual hop-on-hop-off — use it like a water taxi between the three Wolfgangsee villages instead of driving the lakeshore road.',
    duration: '40 min full lake transit · day pass = unlimited hops',
    priceEur: 'One-way €11-14 · day pass €18-22',
    priceNis: '≈₪45-90',
    operator: 'WTG Wolfgangsee Schifffahrt',
    operatorUrl: 'https://www.5schaetze.at/en/services/shipping/',
    bookingLead: 'Walk-up at the dock.',
    bestDayFit:
      'If you base in St. Wolfgang or do the Schafbergbahn day. Use the ferry to skip the lakeshore drive both ways.',
    driveFromBases: {
      obertraun: '40 min to dock',
      berchtesgaden: '80 min to dock',
      stWolfgang: '0-5 min to dock',
      salzburg: '50 min to dock',
    },
    modesty: 'Public ferry, wear anything.',
    tldr: 'Use as a water-taxi between Wolfgangsee villages — €18 day pass. Beats driving the lake road.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.5schaetze.at/',
  },
  {
    id: 'hintersee-paddleboat',
    name: 'Hintersee Ramsau — rowboat / paddle boat',
    type: 'paddle-boat',
    where: 'Hintersee, Ramsau bei Berchtesgaden',
    region: 'bavaria',
    difficulty: 'beginner',
    difficultyNote:
      'Tiny glacial mirror lake, no motors allowed (national park). Rowboats + small pedal boats. The lake is small enough you can circle it in 30-45 min.',
    duration: '€10-14 per boat per hour (whole boat, not per person)',
    priceEur: '€10-14/hr per boat',
    priceNis: '≈₪40-60/hr per boat',
    operator: 'Hintersee Bootsverleih (lakeside kiosk at the parking)',
    operatorUrl: 'https://www.berchtesgaden.de/hintersee',
    bookingLead: 'Walk-up. Weather-dependent.',
    bestDayFit:
      'Hintersee sunset day (already a planned moment). Row out into the middle, sit, watch the mirror reflection of the Reiteralpe.',
    driveFromBases: {
      obertraun: '105 min',
      berchtesgaden: '20 min',
      stWolfgang: '100 min',
      salzburg: '50 min',
    },
    modesty:
      'Just sit in the boat. No special wear needed. The quietest water activity of the trip — no audience.',
    tldr: 'Row the two of you into the mirror reflection. ₪50/hr total. Sunset = obvious move.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.berchtesgaden.de/',
  },
  {
    id: 'hallstatt-salt-mine-brine',
    name: 'Hallstatt salt mine — underground brine-lake boat',
    type: 'specialty',
    where: 'Salzwelten Hallstatt (above Hallstatt village, funicular access)',
    region: 'salzkammergut',
    difficulty: 'beginner',
    difficultyNote:
      'Quirky bonus: as part of the 90-min salt mine tour, you sit on a raft and glide across an underground brine lake lit by colored lights. Not a "water sport" but a unique on-water moment.',
    duration: 'Salt mine tour 90 min total · brine raft is ~5 min of that',
    priceEur: 'Adults €40 incl. funicular (€34 mine only)',
    priceNis: '≈₪165pp',
    operator: 'Salzwelten Hallstatt',
    operatorUrl: 'https://www.salzwelten.at/en/hallstatt/',
    bookingLead: 'Book online — slots fill in peak summer.',
    bestDayFit:
      'Rainy-day backup or any morning before lake activities. Pairs naturally with a Hallstatt village day.',
    driveFromBases: {
      obertraun: '10 min',
      berchtesgaden: '95 min',
      stWolfgang: '40 min',
      salzburg: '75 min',
    },
    modesty:
      'Tour group, fully dressed (it is 8°C inside the mine — bring a sweater). They give you protective jumpsuits over your clothes for the slides.',
    tldr: 'Underground brine-lake raft as part of the salt mine tour. Weird, fun, weather-proof. ₪165pp.',
    verified: '2026-05-16',
    sourceUrl: 'https://www.salzwelten.at/',
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

function typeLabel(t: WaterOption['type']): string {
  if (t === 'rafting') return '🚣 Rafting';
  if (t === 'kayak') return '🛶 Kayak';
  if (t === 'sup') return '🏄 SUP';
  if (t === 'sailing') return '⛵ Sailing';
  if (t === 'electric-boat') return '🚤 Electric boat';
  if (t === 'paddle-boat') return '🚣 Paddle boat';
  return '✨ Specialty';
}

function difficultyLabel(d: WaterOption['difficulty']): string {
  if (d === 'beginner') return '🟢 Beginner-friendly';
  if (d === 'family') return '🟢 Family / easy';
  if (d === 'intermediate') return '🟡 Intermediate';
  return '🔴 Experienced';
}

function regionLabel(r: WaterOption['region']): string {
  if (r === 'salzkammergut') return 'Salzkammergut · AT';
  if (r === 'berchtesgaden') return 'Berchtesgaden · DE';
  if (r === 'salzburg-area') return 'Salzburg / Lofer · AT';
  return 'Bavaria · DE';
}

function optionCard(o: WaterOption): string {
  const pickBtn = pickButtonOverlay(o.id, 'water', o.name);
  return `
    <article class="water-card" id="water-${o.id}" data-pick-card-id="${o.id}" data-pick-card-type="water">
      ${pickBtn}
      <div class="water-card-head">
        <div class="water-card-head-row">
          <span class="water-type-pill">${typeLabel(o.type)}</span>
          <span class="water-difficulty-pill water-diff-${o.difficulty}">${difficultyLabel(o.difficulty)}</span>
          <span class="water-region-pill">${escape(regionLabel(o.region))}</span>
        </div>
        <h3 class="water-card-name">${escape(o.name)}</h3>
        <p class="water-card-where">${escape(o.where)}</p>
      </div>

      <div class="water-card-body">
        <div class="water-card-tldr"><strong>TL;DR</strong> · ${escape(o.tldr)}</div>

        <div class="water-grid">
          <div class="water-cell">
            <div class="water-cell-label">Price</div>
            <div class="water-cell-value">${escape(o.priceEur)}<br /><span class="water-cell-nis">${escape(o.priceNis)}</span></div>
          </div>
          <div class="water-cell">
            <div class="water-cell-label">Duration</div>
            <div class="water-cell-value">${escape(o.duration)}</div>
          </div>
          <div class="water-cell">
            <div class="water-cell-label">Skill needed</div>
            <div class="water-cell-value">${escape(o.difficultyNote)}</div>
          </div>
          <div class="water-cell">
            <div class="water-cell-label">Booking lead time</div>
            <div class="water-cell-value">${escape(o.bookingLead)}</div>
          </div>
        </div>

        <div class="water-section">
          <div class="water-section-label">Best day fit</div>
          <p>${escape(o.bestDayFit)}</p>
        </div>

        <div class="water-section water-section-modesty">
          <div class="water-section-label">Modesty / what you wear</div>
          <p>${escape(o.modesty)}</p>
        </div>

        <div class="water-drive-grid">
          <div class="water-drive-label">Drive from base</div>
          <div class="water-drive-cells">
            <div class="water-drive-cell"><strong>Obertraun</strong><span>${escape(o.driveFromBases.obertraun)}</span></div>
            <div class="water-drive-cell"><strong>Berchtesgaden</strong><span>${escape(o.driveFromBases.berchtesgaden)}</span></div>
            <div class="water-drive-cell"><strong>St. Wolfgang</strong><span>${escape(o.driveFromBases.stWolfgang)}</span></div>
            <div class="water-drive-cell"><strong>Salzburg</strong><span>${escape(o.driveFromBases.salzburg)}</span></div>
          </div>
        </div>

        <div class="water-card-links">
          <strong>Operator:</strong> ${escape(o.operator)}
          · <a href="${escape(o.operatorUrl)}" target="_blank" rel="noreferrer noopener">Book / info →</a>
        </div>
      </div>
    </article>
  `;
}

function renderRafting(): string {
  return RAFTING.map(optionCard).join('');
}
function renderPaddle(): string {
  return PADDLE.map(optionCard).join('');
}
function renderSpecialty(): string {
  return SPECIALTY.map(optionCard).join('');
}

// =====================================================================
// Mount
// =====================================================================
const raftingRoot = document.getElementById('water-rafting-root');
if (raftingRoot) {
  raftingRoot.innerHTML = renderRafting();
}

const paddleRoot = document.getElementById('water-paddle-root');
if (paddleRoot) {
  paddleRoot.innerHTML = renderPaddle();
}

const specialtyRoot = document.getElementById('water-specialty-root');
if (specialtyRoot) {
  specialtyRoot.innerHTML = renderSpecialty();
}

initSharedShortlist();
