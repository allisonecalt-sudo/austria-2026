// ===========================================================================
// bases-data.ts — the four beds + their ranked picks (data only).
//
// What: extracted from bases.ts on 2026-07-23 so more than one page can group
//   activities BY WHERE YOU SLEEP. bases.html renders the full top-10 lists;
//   favorites.html reuses the same grouping to show only what was hearted.
// Why: Avital's ask (Jul 23) — "you heart something and it goes to a separate
//   favorite, same view of location but just only the things we chose."
// Decided: location = the bed you sleep in, not the day. Same four bases,
//   same order, same verified drive minutes — one source, two views.
// Next: nothing pending; add a base here if lodging changes.
// Links: bases.ts (full view) · favorites.ts (hearted view) · plan-data.ts.
// ===========================================================================

export interface Pick {
  /** plan-data activity id — name, maps + website are read from there. */
  id: string;
  /** Verified drive minutes from THIS base (0 = walkable). */
  min: number;
  /** Why it earns the spot from this bed specifically. */
  why: string;
}

export interface Base {
  n: number;
  name: string;
  lodging: string;
  dates: string;
  /** The honest usable-time note — two nights is rarely two days. */
  reality: string;
  picks: Pick[];
}

export const BASES: Base[] = [
  {
    n: 1,
    name: 'Bad Goisern',
    lodging: 'Ferienwohnung Glücksmomente',
    dates: 'Fri 24 → Sun 26 · 2 nights',
    reality:
      'The Shabbat base — you really only drive Friday afternoon and Sunday morning. Treat this as a short list, not a menu of ten.',
    picks: [
      {
        id: 'grundlsee-3lakes',
        min: 25,
        why: 'A wooden boat up the cliff-walled Toplitzsee to where the Traun is born from the rock. Sitting the whole way, and almost nobody knows it.',
      },
      {
        id: 'hallstatt-sup',
        min: 9,
        why: 'Your May postcard-dream, and the closest thing on this list. Glassy morning water from the north shore, Hallstatt’s crowds 8 km away across the lake.',
      },
      {
        id: 'schafberg',
        min: 35,
        why: 'A 130-year-old steam cog railway pushes you to 1,783 m and the three-lakes view. Reserve online — you pick your downhill slot when you book.',
      },
      {
        id: 'wolfgangsee-eboat',
        min: 29,
        why: 'A little red electric boat with a sun canopy and a swim ladder — swim off it mid-lake. No reservation; go at 10:00. Pairs with the Schafberg.',
      },
      {
        id: 'hallstatt',
        min: 20,
        why: 'Before 09:30 or after 17:00, then see it from a small electric boat — the photo everyone wants, without the crush.',
      },
      {
        id: 'krippenstein',
        min: 25,
        why: 'Gondola to 2,109 m, easy 20-minute stroll, then a platform hanging over a 400 m drop. Clear-day pick — cloud kills it.',
      },
      {
        id: 'gosausee',
        min: 30,
        why: 'Reachable now, but you will be sleeping 14 minutes from it on Tuesday. Save it for Gosau.',
      },
      {
        id: 'ebensee',
        min: 25,
        why: 'You walk into the actual Gedenkstollen the prisoners dug. 8°C inside even in July — bring layers. Closed Mondays.',
      },
      {
        id: 'jewish-ischl',
        min: 15,
        why: 'The Pins of Remembrance route through the old imperial spa town — and your Friday grocery stop is here anyway.',
      },
      {
        id: 'katrin',
        min: 20,
        why: 'Bad Ischl’s own small, uncrowded lift — up in 15 minutes to gentle ridge paths over the whole lake-dotted Salzkammergut.',
      },
    ],
  },
  {
    n: 2,
    name: 'Zell am See',
    lodging: 'der Sonnberg Alpinlodges',
    dates: 'Sun 26 → Tue 28 · 2 nights',
    reality:
      'Sunday evening, all of Monday, Tuesday morning. The densest base of the trip — nine of these ten are inside 40 minutes.',
    picks: [
      {
        id: 'kitzsteinhorn',
        min: 15,
        why: 'Three lifts do all the climbing to 3,029 m — real glacier, snow you can touch in July, platform into the Hohe Tauern. 0–5°C up top.',
      },
      {
        id: 'zell-cruise',
        min: 0,
        why: 'Gold light from the water — your Montenegro boat-evening, Austrian edition. Monday is the night it runs.',
      },
      {
        id: 'grossglockner',
        min: 25,
        why: '36 hairpins to 2,400 m and the Pasterze glacier — the car does 100% of the climbing. Check the webcam that morning; clear weather or skip it.',
      },
      {
        id: 'mooserboden',
        min: 20,
        why: 'Shuttle buses and Europe’s largest open inclined lift carry you to two turquoise reservoirs at 2,040 m, then you walk flat along the dam crowns.',
      },
      {
        id: 'krimml-apc',
        min: 70,
        why: 'Austria’s tallest waterfall, 380 m — and the pass where Jewish survivors walked over the Alps toward a ship to Israel. Nature and memory in the same steps.',
      },
      {
        id: 'strandbad-zell',
        min: 5,
        why: 'Lawns, decks, ~21°C water, mountains all around. The slow shoulder of every Zell day — an hour here resets everything.',
      },
      {
        id: 'sigmund-thun',
        min: 12,
        why: '320 m of boardwalk hung over roaring glacier water, ending at a calm lake loop. About an hour, and cool on a hot afternoon.',
      },
      {
        id: 'schmittenhoehe',
        min: 8,
        why: 'Zell’s own mountain — 1,965 m, thirty 3,000 m peaks on the horizon, wide gravel strolls. The lowest-effort big view of the week.',
      },
      {
        id: 'tauern-spa',
        min: 11,
        why: 'Warm panoramic pools facing the Kitzsteinhorn, open till 21:00. Swimsuit pools; just skip the separate sauna wing. Perfect after a glacier day.',
      },
      {
        id: 'baumzipfelweg',
        min: 40,
        why: 'Europe’s highest treetop trail — 1 km of gentle ramps, zero steps, out to a 200 m suspension bridge.',
      },
    ],
  },
  {
    n: 3,
    name: 'Gosau',
    lodging: 'Transylvania Villa & Spa',
    dates: 'Tue 28 → Thu 30 · 2 nights',
    reality:
      'Same lake country as Bad Goisern — you already had two days of this list from 20 minutes away. Below is only what GOSAU ITSELF owns; for everything else (Hallstatt, the train+ferry, the salt mine, the ice cave, the SUP shore), look back at the Bad Goisern list — it all still applies from here, a few minutes further.',
    picks: [
      {
        id: 'gosausee',
        min: 15,
        why: 'The reason to sleep here. Flat gravel loop inside the Dachstein reflection — go after 17:00 when the buses leave.',
      },
      {
        id: 'gosausee-boats',
        min: 15,
        why: 'The same lake, but ON it — e-boat €26/h, SUP €17/h, walk-up, last hire 18:00.',
      },
      {
        id: 'gosaukammbahn',
        min: 9,
        why: 'Nine minutes from the bed: the little cable car to the plateau facing the Dachstein wall.',
      },
      {
        id: 'krippenstein',
        min: 24,
        why: 'The 5 Fingers platform — the clear-morning pick, and Wednesday is forecast the clearest day.',
      },
      {
        id: 'hallstatt',
        min: 21,
        why: 'Evening move: carry supper, arrive 19:30 when the buses are gone, eat on the lakefront.',
      },
    ],
  },
  {
    n: 4,
    name: 'Wals — by Salzburg airport',
    lodging: 'Best Western Hotel am Walserberg',
    dates: 'Thu 30 → Fri 31 · 1 night',
    reality:
      'One afternoon and one evening, and the car goes back at 06:30. Realistically you get one big thing plus a sunset — so the top three are the whole decision.',
    picks: [
      {
        id: 'koenigssee',
        min: 30,
        why: 'Silent electric boats under the Watzmann since 1909, the trumpet echo off the cliff wall, the red onion-dome chapel, then a flat 15-minute walk to the Obersee. Be at the dock before 10:30.',
      },
      {
        id: 'rossfeld',
        min: 30,
        why: 'Drive to a 1,560 m ridge, park, step out — the sun goes down over two countries. Zero walking, and 24 minutes from the Königssee, so it closes that day perfectly.',
      },
      {
        id: 'hintersee-ramsau',
        min: 36,
        why: 'The stillest water of the trip — the Hochkalter mirrored, rowboats for about €10, and the enchanted-forest boulder path. All flat, all quiet.',
      },
      {
        id: 'untersberg',
        min: 10,
        why: 'Practically next door: 8.5 minutes up the rock face to 1,776 m and ridge views over the whole Salzburg basin. Best value for a half-empty afternoon.',
      },
      {
        id: 'moenchsberg',
        min: 15,
        why: 'Free stone stairs (or a €3 lift) to a wooded ridge above the old town — fortress one end, river and domes below. Best as the city goes gold.',
      },
      {
        id: 'salzburg-jewish-walk',
        min: 15,
        why: 'Judengasse, the Marko Feingold bridge, and the Stolpersteine clustered around Linzergasse. Flat, free, at your pace. Inside the synagogue needs an email ahead.',
      },
      {
        id: 'chiemsee',
        min: 42,
        why: 'A steamer to Ludwig II’s unfinished Versailles, then a car-free nuns’ island. The gentlest big-water day — but it needs a full day you do not really have.',
      },
      {
        id: 'hellbrunn',
        min: 15,
        why: 'A 400-year-old garden built to soak the guests, and it still works — spraying stone seats, grottos, a water-powered puppet theatre. The laugh-out-loud option.',
      },
      {
        id: 'golling',
        min: 25,
        why: 'Fifteen minutes of easy forest path to a fairy-tale double drop. Maximum wow per step, about an hour all in.',
      },
      {
        id: 'mirabell',
        min: 15,
        why: 'Free, flat, 45 minutes: parterre flowers, the dwarf garden, and the exact framed fortress view everyone knows. Pairs with anything in town.',
      },
    ],
  },
];
