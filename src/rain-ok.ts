// ===========================================================================
// rain-ok.ts — does each activity still work when it rains?
//
// Why (Allison, Jul 23): "rainy days also just have rainy day option, like
//   keep all the cool ideas but have rainy day option."
//   The rainy-day PAGE was the wrong shape on its own — it replaced the good
//   ideas with a different, smaller world. This keeps every idea in place and
//   just answers, per idea: does the rain ruin it?
//
// Three answers, and the honest reason for each:
//   dry         — you are genuinely indoors or under cover.
//   wet-ok      — outdoors, but the rain does not ruin it. Gorges, waterfalls
//                 and covered boats are BETTER wet.
//   needs-clear — the view or the water IS the product. Rain wastes the money.
//
// WHERE EACH CALL COMES FROM (no guessing dressed as fact):
//   • researched  — the classification already verified in rain-data.ts.
//   • flagged     — the activity's own verified chips say so ("clear-day pick",
//                   "clear-weather day only", "sunny days").
//   • inferred    — my call from what the activity IS (a summit gondola sells
//                   a view; a gorge boardwalk sells water). Marked as such so
//                   she can overrule it, rather than trusting it blindly.
// ===========================================================================

export type RainVerdict = 'dry' | 'wet-ok' | 'needs-clear';
export type RainBasis = 'researched' | 'flagged' | 'inferred';

export interface RainCall {
  ok: RainVerdict;
  basis: RainBasis;
  why: string;
}

export const RAIN_OK: Record<string, RainCall> = {
  // ---- researched: already verified on the rainy-day page -----------------
  ebensee: {
    ok: 'dry',
    basis: 'researched',
    why: 'The memorial tunnel and its exhibition are inside the mountain. 8°C in there — layers.',
  },
  'tauern-spa': {
    ok: 'dry',
    basis: 'researched',
    why: 'Warm indoor and outdoor pools. Rain genuinely improves it.',
  },
  chiemsee: {
    ok: 'dry',
    basis: 'researched',
    why: 'Covered lake steamer plus a palace interior — most of the day is under a roof.',
  },
  'sigmund-thun': {
    ok: 'wet-ok',
    basis: 'researched',
    why: 'A gorge boardwalk. More water is the point; you get damp either way.',
  },
  'krimml-apc': {
    ok: 'wet-ok',
    basis: 'researched',
    why: 'Austria’s highest waterfall runs harder in rain. Bring a shell, not an umbrella.',
  },
  'grundlsee-3lakes': {
    ok: 'wet-ok',
    basis: 'researched',
    why: 'Boats do the moving and the Toplitzsee is fjord-dark anyway — atmospheric wet.',
  },
  hellbrunn: {
    ok: 'wet-ok',
    basis: 'researched',
    why: 'Trick-fountain gardens. You were going to get soaked on purpose regardless.',
  },

  // ---- flagged: the activity's own verified chips say so ------------------
  grossglockner: {
    ok: 'needs-clear',
    basis: 'flagged',
    why: 'Its own note says "clear-weather day only" — in cloud you pay €45 to drive through grey.',
  },
  krippenstein: {
    ok: 'needs-clear',
    basis: 'flagged',
    why: 'Its own note says "clear-day pick". 5 Fingers hangs over a view; no view, no point.',
  },
  'gosausee-boats': {
    ok: 'needs-clear',
    basis: 'flagged',
    why: 'Hire is "10:00–18:00, sunny days" — they do not run it in weather.',
  },
  'hallstatt-sup': {
    ok: 'needs-clear',
    basis: 'flagged',
    why: 'The whole idea is glassy morning water. Rain and wind take it away.',
  },
  'wolfgangsee-eboat': {
    ok: 'needs-clear',
    basis: 'flagged',
    why: 'Open boat, "fair weather" only, and the point is swimming off it.',
  },
  'strandbad-zell': {
    ok: 'needs-clear',
    basis: 'flagged',
    why: 'A lake lido. Nobody swims off a deck in the rain by choice.',
  },
  langbathsee: {
    ok: 'needs-clear',
    basis: 'flagged',
    why: 'A quiet swim lake — pleasant grey, but you are going for the water.',
  },

  // ---- inferred: my call, from what the thing actually sells --------------
  kitzsteinhorn: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'A €52 glacier lift. In cloud you reach 3,029 m and see the inside of a cloud.',
  },
  schmittenhoehe: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'Sold entirely as "the easiest big view". No view, nothing left.',
  },
  gosaukammbahn: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'Cable car to a plateau facing the Dachstein wall — the wall is the product.',
  },
  katrin: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'Ridge paths over the Salzkammergut. Cloud erases exactly what you came up for.',
  },
  untersberg: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: '8.5 minutes to 1,776 m — for the panorama over Salzburg, not the cabin.',
  },
  mooserboden: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'Turquoise reservoirs ringed by glaciers. Grey sky, grey water.',
  },
  schafberg: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: '€61 for the three-lakes panorama. Check the summit webcam before you book.',
  },
  rossfeld: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'A ridge road you drive for the sunset over two countries.',
  },
  baumzipfelweg: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'A treetop walkway — the canopy is half the shelter, and wet forest is lovely.',
  },
  golling: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'A waterfall. Fifteen minutes of forest path and it runs harder in rain.',
  },
  'hintersee-ramsau': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'The Zauberwald moss path is at its best damp. Skip the rowboat, keep the walk.',
  },
  koenigssee: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'The boats are enclosed and the cliffs stay dramatic. The Obersee walk is flat and short.',
  },
  gosausee: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Flat gravel loop. You lose the mirror reflection but keep the lake and the quiet.',
  },
  hallstatt: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'A village with cafés and awnings — and rain is what finally clears the tour buses.',
  },
  mauthausen: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Mostly outdoors on uneven ground, but there are indoor rooms and it is not a view day.',
  },
  'salzburg-jewish-walk': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'A flat city walk. An umbrella handles it, and the Stolpersteine are underfoot anyway.',
  },
  'jewish-ischl': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Flat spa-town streets with cafés, and the grocery stop is there regardless.',
  },
  mirabell: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Forty-five free minutes. Wet flowers are fine; just do not plan the day around it.',
  },
  moenchsberg: {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'Stone stairs to a viewpoint over the old town — slippery, and the view is the reason.',
  },
  'eagles-nest': {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'The bus road closes in bad weather and the summit is famous for being in cloud.',
  },
  'zell-cruise': {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'A sunset cruise. Without the sunset it is a boat in the rain.',
  },
  almsee: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'A flat mirror-lake loop, and silence is the point. Rain only makes it emptier.',
  },

  // ---- added 2026-07-23 with the research sweep ---------------------------
  'frost-rafting': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'You are getting wet anyway. Only a storm stops it — ring them, not the forecast.',
  },
  'taxenbach-rafting': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Same: rain is irrelevant on a raft. High water can change the grade, so ask.',
  },
  'out2-rafting': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Rain does not matter in a wetsuit, and the office is a walk away in Zell.',
  },
  'lofer-basecamp': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Rafting in the rain is just rafting. Motion next door is shut Mondays; this is not.',
  },
  'pathfinder-kayak': {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'An open kayak or a SUP board in rain is miserable, and there is no shelter on the lake.',
  },
  'hallstattersee-boat': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'A scheduled boat with cover. Grey lake, warm inside — one of the better wet-day moves.',
  },
  'strandbad-untersee': {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'A lakeside lido. The diving tower is no fun in the rain.',
  },
  'parkbad-goisern': {
    ok: 'needs-clear',
    basis: 'inferred',
    why: 'An outdoor village pool — it stays open, but you would not want to be in it wet and cold.',
  },
  liechtensteinklamm: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'A gorge. More water is the whole attraction, and the walkway is the walkway.',
  },
  kitzlochklamm: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Better in rain, not worse — that is what a klamm is for.',
  },
  seisenbergklamm: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Wooden walkway over green water; rain suits it. Steps get slick, so take care.',
  },
  'dachstein-icecave': {
    ok: 'dry',
    basis: 'inferred',
    why: 'You are inside a mountain. Completely weatherproof — though the cable car can shut in storms.',
  },
  'salzwelten-altaussee': {
    ok: 'dry',
    basis: 'inferred',
    why: 'Underground, flat and warm-coated. The classic Salzkammergut wet-day answer.',
  },
  'pinzgauer-bahn': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'You are in a dry carriage watching a valley. Rain costs you a little of the view, not the day.',
  },
  taurachbahn: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'A covered steam train. Rain is atmospheric here rather than ruinous.',
  },
  'hallstatt-by-train': {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Train and ferry are both covered, and rain is what finally empties Hallstatt.',
  },
  'attersee-bahn-schiff': {
    ok: 'needs-clear',
    basis: 'researched',
    why: 'Verified: sailings are cancelled for weather, and the day’s timetable only goes up at 17:00 the night before.',
  },
  hohensalzburg: {
    ok: 'wet-ok',
    basis: 'inferred',
    why: 'Plenty of indoor rooms and a funicular. You lose the panorama, you keep the fortress.',
  },
  kaiservilla: {
    ok: 'dry',
    basis: 'inferred',
    why: 'Entry is a 45-minute indoor guided tour — the best wet-weather insurance near bed one.',
  },
  'fortress-concert': {
    ok: 'dry',
    basis: 'inferred',
    why: 'Indoors in a stone hall. Rain only takes the view during the free hour beforehand.',
  },
  'eurothermen-ischl': {
    ok: 'dry',
    basis: 'inferred',
    why: 'Thermal pools open to midnight. Rain is the reason to go.',
  },
};

const LABELS: Record<RainVerdict, { icon: string; short: string }> = {
  dry: { icon: '☂', short: 'indoors' },
  'wet-ok': { icon: '💧', short: 'fine wet' },
  'needs-clear': { icon: '☀️', short: 'needs clear' },
};

export function rainLabel(v: RainVerdict): { icon: string; short: string } {
  return LABELS[v];
}

/** Does this survive a wet day? Unknown ids are NOT claimed either way. */
export function worksInRain(id: string): boolean {
  const call = RAIN_OK[id];
  return call ? call.ok !== 'needs-clear' : false;
}

export function rainCall(id: string): RainCall | undefined {
  return RAIN_OK[id];
}
