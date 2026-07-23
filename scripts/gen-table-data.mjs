// ===========================================================================
// gen-table-data.mjs — generates src/table-data.ts.
//
// What this is: the build step behind the comparison TABLE on favorites.html.
// Why it exists: Allison, Jul 23 2026 — "make it a table thing each one -
//   its suggestion/location, distance from place sleeping at night bf,
//   distance from place sleeping night after, top 2 things what makes it
//   unique, why do it, time spent there. and 2 things it's near."
// Where the numbers come from:
//   • DRIVE MINUTES — Google Maps Distance Matrix API, pulled 2026-07-23,
//     driving mode, from each of the four booked beds. Not estimated.
//   • COORDINATES — Google Maps Geocoding API, same day. Used ONLY to work
//     out the two nearest other stops (great-circle), which is then labelled
//     as straight-line so nobody reads it as a drive time.
//   • unique[] / why — condensed from the verified copy already in
//     plan-data.ts (what / more / chips). No new claims are introduced here.
// Run: node scripts/gen-table-data.mjs   (re-run if bases or activities move)
// ===========================================================================

import fs from 'node:fs';

/** The four booked beds, in trip order. */
const BASES = [
  { key: 'goisern', name: 'Bad Goisern', lat: 47.6408, lng: 13.6183 },
  { key: 'zell', name: 'Zell am See', lat: 47.3232, lng: 12.7942 },
  { key: 'gosau', name: 'Gosau', lat: 47.5847, lng: 13.5347 },
  { key: 'wals', name: 'Wals', lat: 47.7833, lng: 12.9667 },
];

// Drive minutes from each base, in BASES order [goisern, zell, gosau, wals].
// Google Distance Matrix, driving, 2026-07-23.
const M = {
  mauthausen: [103, 170, 120, 104],
  ebensee: [25, 127, 42, 70],
  'salzburg-jewish-walk': [67, 83, 58, 19],
  'jewish-ischl': [12, 114, 29, 58],
  'krimml-apc': [156, 60, 137, 126],
  kitzsteinhorn: [107, 12, 88, 77],
  schmittenhoehe: [109, 4, 90, 74],
  mooserboden: [118, 22, 100, 88],
  'zell-cruise': [106, 3, 87, 73],
  'strandbad-zell': [107, 2, 88, 71],
  'sigmund-thun': [111, 15, 93, 81],
  baumzipfelweg: [138, 36, 119, 97],
  grossglockner: [113, 24, 95, 83],
  gosausee: [33, 100, 15, 65],
  'gosausee-boats': [33, 100, 15, 65],
  krippenstein: [22, 109, 24, 74],
  hallstatt: [18, 106, 21, 70],
  gosaukammbahn: [27, 94, 9, 59],
  langbathsee: [37, 139, 54, 82],
  almsee: [74, 154, 91, 87],
  schafberg: [28, 118, 45, 57],
  katrin: [14, 116, 31, 62],
  koenigssee: [87, 78, 68, 33],
  rossfeld: [81, 86, 62, 35],
  'hintersee-ramsau': [97, 67, 78, 36],
  chiemsee: [108, 101, 90, 45],
  'eagles-nest': [78, 81, 60, 29],
  'grundlsee-3lakes': [25, 123, 38, 88],
  'tauern-spa': [107, 11, 89, 77],
  'wolfgangsee-eboat': [30, 103, 47, 41],
  'hallstatt-sup': [9, 96, 11, 61],
  untersberg: [65, 71, 46, 10],
  hellbrunn: [67, 72, 48, 13],
  moenchsberg: [77, 88, 66, 21],
  mirabell: [64, 85, 60, 17],
  golling: [56, 65, 37, 25],
};

// Geocoded 2026-07-23 — used only for the "2 things it's near" column.
const C = {
  mauthausen: [48.2571254, 14.5001374],
  ebensee: [47.8132908, 13.7717451],
  'salzburg-jewish-walk': [47.7998615, 13.0460812],
  'jewish-ischl': [47.7123805, 13.6209459],
  'krimml-apc': [47.2035611, 12.1716395],
  kitzsteinhorn: [47.273843, 12.7574626],
  schmittenhoehe: [47.3264048, 12.7724777],
  mooserboden: [47.2163407, 12.7261712],
  'zell-cruise': [47.3201129, 12.7967788],
  'strandbad-zell': [47.3263389, 12.799928],
  'sigmund-thun': [47.2591422, 12.7385896],
  baumzipfelweg: [47.3662112, 12.5089172],
  grossglockner: [47.1594824, 12.8075269],
  gosausee: [47.5286719, 13.5064417],
  'gosausee-boats': [47.5286719, 13.5064417],
  krippenstein: [47.548288, 13.705221],
  hallstatt: [47.5623837, 13.6490284],
  gosaukammbahn: [47.5331268, 13.4967187],
  langbathsee: [47.8347615, 13.681417],
  almsee: [47.7570226, 13.9530159],
  schafberg: [47.7398845, 13.4394756],
  katrin: [47.6987528, 13.6071583],
  koenigssee: [47.5541796, 12.9783744],
  rossfeld: [47.6267652, 13.092202],
  'hintersee-ramsau': [47.6065077, 12.8537124],
  chiemsee: [47.8602998, 12.3662207],
  'eagles-nest': [47.6316551, 13.0402601],
  'grundlsee-3lakes': [47.6235513, 13.8306613],
  'tauern-spa': [47.2828123, 12.7598775],
  'wolfgangsee-eboat': [47.7653955, 13.3679359],
  'hallstatt-sup': [47.59047, 13.65458],
  untersberg: [47.7257159, 13.0421916],
  hellbrunn: [47.7621308, 13.0601303],
  moenchsberg: [47.7991057, 13.0386007],
  mirabell: [47.8045848, 13.0423103],
  golling: [47.6012, 13.1368446],
};

// Top-2 "what makes it unique" + the one-line "why do it".
// Condensed from the verified plan-data copy — nothing new is asserted.
const T = {
  mauthausen: {
    u: ['The quarry and its “Stairs of Death”', 'The Room of Names — free entry, audio guide'],
    w: 'The one unmissable act of remembrance on this trip, and the reason Friday exists.',
  },
  ebensee: {
    u: ['You walk INTO the tunnel prisoners dug', '8°C inside, in July'],
    w: 'The heaviest history of the week is 25 minutes from your first bed — no day lost to it.',
  },
  'salzburg-jewish-walk': {
    u: ['Stolpersteine set into the pavement', 'The Marko Feingold bridge + a living shul'],
    w: 'Flat, free and self-paced — the meaningful option on a day with no energy for a drive.',
  },
  'jewish-ischl': {
    u: ['The Pins of Remembrance route', 'An imperial spa town that had a real community'],
    w: 'An hour of meaning attached to a stop you are making anyway for groceries.',
  },
  'krimml-apc': {
    u: ['Austria’s highest waterfall, 380 m', 'The 1947 Jewish exodus over the Krimmler Tauern'],
    w: 'Water and Jewish history in one walk — uphill but easy, and worth the drive from Zell.',
  },
  kitzsteinhorn: {
    u: ['Real glacier snow underfoot in July', 'Platform straight into the Hohe Tauern'],
    w: '3,029 m without a single step of climbing — three lifts do all of it.',
  },
  schmittenhoehe: {
    u: ['The easiest big view of the trip', 'Zell’s own mountain, gondola from town'],
    w: 'When you want the panorama but not the glacier day, this is the 36-euro version.',
  },
  mooserboden: {
    u: ['Two turquoise reservoirs at 2,040 m', 'Buses + funicular do the climbing'],
    w: 'Flat dam walks with glaciers on three sides — big scenery, no effort.',
  },
  'zell-cruise': {
    u: ['Gold light FROM the water', 'Monday evening is the window'],
    w: 'Your Montenegro boat-evening, Austrian edition — the likeliest lifetime memory of the week.',
  },
  'strandbad-zell': {
    u: ['Swim off decks into open lake', 'A 2-minute walk from the Zell bed'],
    w: 'The cheapest good hour of the trip, and the reason to keep a suit in the day bag.',
  },
  'sigmund-thun': {
    u: ['Boardwalk hung over glacier water', 'Ends at a small reservoir loop'],
    w: 'An hour, €3.50, and cool air — the perfect filler on a hot Zell afternoon.',
  },
  baumzipfelweg: {
    u: ['A path through the treetops', 'The “Golden Gate of the Alps” suspension bridge'],
    w: 'Ramps, no steps — the walk that feels adventurous without being one.',
  },
  grossglockner: {
    u: ['Austria’s great alpine road, 2,504 m', 'Marmots and glacier views from the car'],
    w: 'The whole day happens through the windscreen — and it ends right at your Zell bed.',
  },
  gosausee: {
    u: ['The Dachstein doubled in still water', 'Flat 1-hour gravel circle'],
    w: 'The trip’s postcard, and you sleep 15 minutes away — go once the buses leave.',
  },
  'gosausee-boats': {
    u: ['Float inside the Dachstein reflection', 'E-boat €26/h · SUP €17/h, walk-up'],
    w: 'You are going to the lake anyway; this puts you ON the mirror instead of beside it.',
  },
  krippenstein: {
    u: ['5 Fingers hangs over a 400 m drop', 'Gondola to 2,109 m, then an easy stroll'],
    w: 'The most dramatic photo of the week — but only book it on a clear morning.',
  },
  hallstatt: {
    u: ['A 7,000-year-old salt village on the lake', 'See it from a small electric boat'],
    w: 'The place everyone comes for — do it before 09:30 or after 17:00 and it is yours.',
  },
  gosaukammbahn: {
    u: ['Cable car above your own lake', 'Green plateau facing the Dachstein wall'],
    w: 'Nine minutes from the Gosau bed — the low-effort half-day when you want a mountain.',
  },
  langbathsee: {
    u: ['A forest lake almost nobody is at', 'Flat 1-hour shore loop, swimmable'],
    w: 'The quiet, free alternative when Hallstatt feels like too many people.',
  },
  almsee: {
    u: ['The quietest water of the trip', 'Herons, a 1h45 flat loop, no crowds'],
    w: 'If a day needs to be about nothing at all, this is where you spend it.',
  },
  schafberg: {
    u: ['A 130-year-old steam cog railway', 'Three lakes from 1,783 m'],
    w: 'The romance option — but RESERVE, and pick your downhill slot when you book.',
  },
  katrin: {
    u: ['Bad Ischl’s own small, uncrowded lift', 'Gentle ridge paths over the Salzkammergut'],
    w: 'Fifteen minutes from the first bed, and the local one rather than the famous one.',
  },
  koenigssee: {
    u: ['Silent electric boats + the echo trumpet', 'Flat 15-min walk to the Obersee mirror'],
    w: 'The signature day. Be at the dock by 10:30 — queues and the calmest water are both then.',
  },
  rossfeld: {
    u: ['Drive to 1,560 m — zero walking', 'Sunset over two countries'],
    w: 'The best sunset of the trip costs €9.50 and no steps, 30 minutes from the last bed.',
  },
  'hintersee-ramsau': {
    u: ['The stillest water of the trip', 'The mossy “enchanted forest” boulder path'],
    w: 'Rowboats, flat paths and Germany’s most-photographed church view, all in one stop.',
  },
  chiemsee: {
    u: ['Steamer to Ludwig II’s unfinished Versailles', 'A car-free nuns’ island'],
    w: 'The gentlest big day — but it needs a whole day, so only if one frees up.',
  },
  'eagles-nest': {
    u: [
      'Special bus + a brass elevator into the rock',
      'Hitler’s mountaintop house, now a viewpoint',
    ],
    w: 'Heavy history with huge views — entirely your call whether you want it this week.',
  },
  'grundlsee-3lakes': {
    u: ['A WOODEN boat up the fjord-like Toplitzsee', 'A hidden third lake at the end'],
    w: 'Sitting the whole way, 25 minutes from the first bed, and almost nobody knows it.',
  },
  'tauern-spa': {
    u: ['Panoramic warm pools facing the glacier', 'Open to 21:00, evening rate ~€25.50'],
    w: 'The cozy-evening upgrade, 11 minutes from the Zell bed — perfect after a wet day.',
  },
  'wolfgangsee-eboat': {
    u: ['A red e-boat with a sun canopy', 'Swim ladder — swim off it mid-lake'],
    w: 'No reservation, go at 10:00, and it pairs with the Schafberg on the same day.',
  },
  'hallstatt-sup': {
    u: ['Glassy morning water on the north shore', 'Hallstatt’s crowds 8 km away across the lake'],
    w: 'Your May postcard-dream, nine minutes from the first bed — mornings are glass.',
  },
  untersberg: {
    u: ['1,776 m in 8.5 minutes', 'The big cliff face over Salzburg'],
    w: 'Ten minutes from the last bed — an alpine morning without leaving the airport hour.',
  },
  hellbrunn: {
    u: ['Booby-trapped 400-year-old water gardens', 'A water-powered puppet theatre'],
    w: 'The laugh-out-loud stop — shaded, silly, and 13 minutes from the last bed.',
  },
  moenchsberg: {
    u: ['Free stone stairs (or a €3 lift)', 'Fortress one end, river and domes below'],
    w: 'Salzburg going gold from above, for free — best in the last hour of light.',
  },
  mirabell: {
    u: ['The exact framed fortress view', 'The Sound of Music steps + dwarf garden'],
    w: 'Free, flat, 45 minutes — the one that fits into any leftover gap.',
  },
  golling: {
    u: ['A fairy-tale double drop', '15 minutes of easy forest path'],
    w: 'Maximum wow per step of anything on this list — about an hour, all in.',
  },
};

// --- derive the two nearest other stops (straight line) ---------------------
const R = 6371;
const rad = (d) => (d * Math.PI) / 180;
function km(a, b) {
  const [la1, lo1] = a;
  const [la2, lo2] = b;
  const dLa = rad(la2 - la1);
  const dLo = rad(lo2 - lo1);
  const h =
    Math.sin(dLa / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const ids = Object.keys(M);
const near = {};
for (const id of ids) {
  near[id] = ids
    .filter((o) => o !== id)
    .map((o) => ({ id: o, km: km(C[id], C[o]) }))
    // Same-spot duplicates (the Gosausee boats sit ON the Gosausee) are kept —
    // "you are already there" is exactly the useful answer.
    .sort((a, b) => a.km - b.km)
    .slice(0, 2)
    .map((n) => ({ id: n.id, km: Math.round(n.km * 10) / 10 }));
}

// --- emit -------------------------------------------------------------------
const rows = ids.map((id) => ({
  id,
  fromBase: M[id],
  unique: T[id]?.u ?? [],
  why: T[id]?.w ?? '',
  near: near[id],
}));

const missing = rows.filter((r) => r.unique.length === 0).map((r) => r.id);
if (missing.length) console.warn('⚠ no unique/why text for:', missing.join(', '));

const out = `// GENERATED by scripts/gen-table-data.mjs — do not hand-edit.
// Drive minutes: Google Distance Matrix (driving), pulled 2026-07-23, from each
// booked bed. "near" is STRAIGHT-LINE km from Google geocoding, same day — it
// answers "what else is right there", not "how long is the drive".
// Regenerate with: node scripts/gen-table-data.mjs

export interface TableBase {
  key: string;
  name: string;
}

export interface NearRef {
  id: string;
  km: number;
}

export interface TableRow {
  id: string;
  /** Drive minutes from each base, in BASE_ORDER order. */
  fromBase: number[];
  /** Top 2 things that make it unique. */
  unique: string[];
  /** One line: why do it. */
  why: string;
  /** The two closest other stops, straight-line. */
  near: NearRef[];
}

export const BASE_ORDER: TableBase[] = ${JSON.stringify(
  BASES.map((b) => ({ key: b.key, name: b.name })),
  null,
  2,
)};

export const TABLE_ROWS: Record<string, TableRow> = ${JSON.stringify(
  Object.fromEntries(rows.map((r) => [r.id, r])),
  null,
  2,
)};
`;

fs.writeFileSync('src/table-data.ts', out);
console.log(`✓ src/table-data.ts — ${rows.length} rows`);
