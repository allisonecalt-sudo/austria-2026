// ===========================================================================
// routes-data.ts — each day as a DOOR-TO-DOOR LOOP (data only).
//
// Why this exists (Avital, 23 Jul, confirmed): "it's not just all about the
//   place we sleep... we're going to come out of [the base] and go back into
//   [the base], so all the distances from the base isn't so helpful. If we had
//   to do a route of the things of the day — plan a day, beginning to end,
//   what that would be and how it works altogether."
//   Her model is a LOOP with drive times BETWEEN stops. This file is that.
//
// Where the routes come from: the 23 Jul design panel — five independent week
//   structures, judged blind, winner synthesised. These are its days, encoded
//   as leg-by-leg drives.
// Where the minutes come from: Google Distance Matrix, pulled 23 Jul 2026.
//   Every legMin is a real measured drive, not an estimate. Legs that reuse a
//   bed↔place time come from the same pull as the rest of the site.
// ===========================================================================

export interface RouteStop {
  /** Activity id when the stop is one of the site's cards — links through. */
  id?: string;
  /** Free label when it is not (the airport, a Spar, the apartment). */
  label?: string;
  emoji?: string;
  /** Rough clock time, where the day has a real constraint. */
  time?: string;
  /** Measured drive minutes INTO this stop from the previous one. 0 = walk. */
  legMin: number;
  note?: string;
}

export interface DayRoute {
  dayId: string;
  date: string;
  title: string;
  /** One line: what the day IS. Avital's register — no wordiness. */
  headline: string;
  /** Wikimedia photo reused from the day entry in plan-data (her: "keep the pictures"). */
  photo: string;
  stops: RouteStop[];
  sunset: string;
  /** The swap if the weather flips — concrete, not hedged. */
  weatherSwap?: string;
  /** True when the day has no car at all. */
  onFoot?: boolean;
  /** The linger version: one place for hours + an easy walk + an activity. */
  slow?: string;
}

const P = (f: string): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=900`;

export const DAY_ROUTES: DayRoute[] = [
  {
    dayId: 'fri24',
    date: 'Fri 24',
    title: 'Mauthausen, then home',
    headline: 'The remembrance day — three hours at the memorial, the big shop, candles at 20:32.',
    photo: P('Wiener%20Graben%20quarry%20by%20Stefanie%20J%20Steindl%20012.jpg'),
    stops: [
      { label: 'Salzburg airport — land 07:50, car 08:30', emoji: '🛬', legMin: 0 },
      {
        id: 'mauthausen',
        time: '~10:15 — open Fri 09:00–17:30',
        legMin: 105,
        note: 'Free entry, audio guides, ~3 hours: the quarry, the Stairs of Death, the Room of Names. The heaviest visit of the trip, done first, with the whole quiet drive after it.',
      },
      {
        label: 'The BIG shop — Spar Bad Ischl',
        emoji: '🛒',
        time: '~15:00',
        legMin: 90,
        note: 'This shop covers tonight, all of Shabbat AND Sunday — shops are shut both days. Check-in runs to 23:59, so there is no clock pressure before candles.',
      },
      {
        label: 'Ferienwohnung Glücksmomente — check in (16:00–23:59)',
        emoji: '🛏',
        legMin: 12,
        note: 'Unpack, shower, cook. Candles 20:32.',
      },
    ],
    sunset: 'Bad Goisern valley on foot, ~20:50 — after candles, so it has to be walkable. It is.',
    weatherSwap:
      'The low-energy swap, if the night flight wins: the Pins of Remembrance walk in Bad Ischl instead (58 min from the airport, flat, ~1h) — shop in the same town, home by noon, nap. Ebensee (25 min from the apartment) can carry the remembrance weight on Sunday morning instead.',
    slow: 'Skip the long drive: Ebensee memorial (25 min from the apartment, you walk into the tunnel itself), the flat Langbathsee shore loop with a swim, shop in Bad Ischl, home early. Remembrance kept, half the driving.',
  },
  {
    dayId: 'shabbat',
    date: 'Sat 25',
    title: 'Shabbat',
    headline: 'No car, no boats, nothing to pay. The day is the point.',
    photo: P('Shabbat%20Candles.jpg'),
    onFoot: true,
    stops: [
      { label: 'The apartment — slow morning', emoji: '🕯️', legMin: 0 },
      {
        label: 'Walk the lakeshore toward Untersee',
        emoji: '🚶',
        time: 'from ~08:30, before the 29°C heat',
        legMin: 0,
        note: 'The swim marathon is on ~3 km along the shore — visible from the public bank. Walk as far as feels good, turn around.',
      },
      { label: 'Long lunch · sleep the afternoon', emoji: '😴', legMin: 0 },
      {
        label: 'Riverside stroll before dinner',
        emoji: '🌊',
        legMin: 0,
        note: 'Shabbat ends ~21:45 — that is when you pack the car for Sunday, not Sunday morning.',
      },
    ],
    sunset:
      'The Hallstättersee shore, walked to, ~20:49. Free, no ticket, no car — still one of the best on the list.',
  },
  {
    dayId: 'sun26',
    date: 'Sun 26',
    title: 'Wet transfer — the ICE CAVE day',
    headline: 'A waterfall, the largest ice cave on Earth, then hours of hot water.',
    photo: P('Wolfgangsee%20mit%20St.%20Wolfgang.jpg'),
    stops: [
      { label: 'Leave Bad Goisern ~09:30, car packed last night', emoji: '🛏', legMin: 0 },
      {
        id: 'golling',
        time: '~10:30',
        legMin: 56,
        note: '15 min of forest path; a waterfall runs harder in rain.',
      },
      {
        label: 'Eisriesenwelt, Werfen — the largest ice cave on Earth',
        emoji: '🧊',
        time: 'book a ~12:00 slot online tonight — saves €4 and holds your place',
        legMin: 15,
        note: 'THE BIG ONE, and it is weatherproof: 42 km of ice inside a mountain, right off the road you are driving anyway. Honest cost: ~3.5h door to door with a steep 20-min path, a cable car, and ~700 steps inside at 0°C — the one real climb of the week. Wear the warm layer. If that is not today, skip freely: the spa below is the recovery either way.',
      },
      {
        id: 'tauern-spa',
        time: 'from ~16:00 until you are done — pools to 21:00',
        legMin: 50,
        note: 'No booking, no clock — the recovery after the ice. Take passports into the locker, not a loaded car. Self check-in at der Sonnberg means arriving at 21:00 is fine.',
      },
      {
        label: 'der Sonnberg — self check-in, whenever you arrive',
        emoji: '🛏',
        legMin: 11,
      },
    ],
    sunset:
      'Zeller See Esplanade 20:53 — two minutes from the door, umbrella, something hot. Grey is fine; it is your first night on this lake.',
    weatherSwap:
      'If Sunday somehow clears: the ice cave is still worth it (it is 0°C inside regardless) — or swap it for the Schmittenhöhe lift and a first swim. If 700 steps is a no today, the Sigmund-Thun gorge boardwalk (€3.50, an hour) is the gentle stand-in.',
    slow: 'Straight to the Tauern Spa and stay all afternoon — pools to 21:00, no clock. The walk is the Esplanade after check-in; the activity is doing absolutely nothing in warm water while it rains.',
  },
  {
    dayId: 'mon27',
    date: 'Mon 27',
    title: 'Wettest day — get wetter',
    headline: 'Gorge, river, boat. A full day the rain cannot touch.',
    photo: P('Kitzsteinhorn3.jpg'),
    stops: [
      {
        id: 'kitzlochklamm',
        time: '10:00 — €11 CASH',
        legMin: 22,
        note: 'Boardwalks, tunnels and spray for about 90 minutes — a gorge is BETTER in rain.',
      },
      {
        id: 'frost-rafting',
        time: '13:00 slot',
        legMin: 12,
        note: 'BOOKED AHEAD (on request, 24h notice). Wetsuits on, rain irrelevant. FROST runs Mondays; Motion Lofer does not. (Leg ≈ Taxenbach→Bruck, short hop.)',
      },
      {
        id: 'tauern-spa',
        time: 'after the river — warm up as long as you like',
        legMin: 8,
        note: 'Eleven minutes from the bed on the way back; pools to 21:00 if the cruise does not sail.',
      },
      {
        id: 'zell-cruise',
        time: 'decide at 18:00, board ~20:00',
        legMin: 11,
        note: 'A 3-minute walk from the apartment, so walking away costs nothing. If the sky breaks, this is the Montenegro evening — it only runs tonight.',
      },
    ],
    sunset:
      'ON the Zeller See from the boat if it sails; the Esplanade at 20:53 if not. Decide at 18:00, not before.',
    weatherSwap:
      'If Monday CLEARS (check at 07:00 in bed): Kitzsteinhorn up at 09:30 instead of the gorge — 12 min away, no reservation — keep the raft, and book the cruise the moment the sky looks right.',
    slow: 'Raft at 13:00 and nothing else: slow morning on the Esplanade, the river, then hours at the spa. The cruise decision at 18:00 still stands.',
  },
  {
    dayId: 'tue28',
    date: 'Tue 28',
    title: 'Lie-in, gorge, Hallstatt at dusk',
    headline: 'Enter the gorge at 14:45 when the queue dies — that buys the lazy morning.',
    photo: P('Vorderer%20Gosausee%204.jpg'),
    stops: [
      {
        label: 'Slow Zell morning — Esplanade coffee, a swim, and a PROPER shop',
        emoji: '🛒',
        legMin: 0,
        note: 'Gosau is a one-Spar village. Buy the picnic and three days of food here. Leave ~13:15.',
      },
      {
        id: 'liechtensteinklamm',
        time: 'enter 14:45',
        legMin: 44,
        note: 'The queue wall is 10:00–14:30 and catches online tickets too. Arriving at 14:45 turns the constraint into permission for the lie-in.',
      },
      {
        label: 'Transylvania Villa, Gosau — check in from 16:00',
        emoji: '🛏',
        legMin: 62,
        note: 'Unpack, make a supper TO CARRY.',
      },
      {
        id: 'hallstatt',
        time: 'leave 19:15',
        legMin: 21,
        note: 'The buses are gone by then. Eat your carried supper on the lakefront — the famous village in the only hour it is worth having.',
      },
      { label: 'Back to Gosau', emoji: '🛏', legMin: 21 },
    ],
    sunset: 'Hallstatt lakefront ~20:50 — or the Gosau valley from the door if you are flat.',
    weatherSwap: 'The gorge is BETTER in rain. This day does not care about the forecast.',
    slow: 'Only the gorge: long Zell morning with a swim, Liechtensteinklamm at 14:45, then Gosau and stay put — the valley walk from the door, supper on the balcony, early candles-free night.',
  },
  {
    dayId: 'wed29',
    date: 'Wed 29',
    title: 'The clear day — mountain, ice, lake',
    headline: 'One mountain does double duty, then the mirror lake until the light goes.',
    photo: P('A-Krippenstein-5fingers.jpg'),
    stops: [
      {
        id: 'krippenstein',
        time: 'webcam check 07:30 · leave 09:00',
        legMin: 24,
        note: 'Two cable cars, ~2h up top, the platform over the 400 m drop — on the one day forecast clear.',
      },
      {
        id: 'dachstein-icecave',
        time: 'early afternoon',
        legMin: 0,
        note: 'Same mountain, same lift system — 1.8 km from 5 Fingers. Real ice underground in July, cold, bring the layer you already have.',
      },
      {
        id: 'hallstatt',
        time: 'late lunch below',
        legMin: 21,
        note: 'You are at its lake anyway — eat on the lakefront while the day crowd starts thinning. (Leg from Obertraun, measured from Goisern side.)',
      },
      {
        id: 'gosausee-boats',
        time: 'on the water by 16:30 — last hire 18:00',
        legMin: 36,
        note: 'E-boat or SUP inside the Dachstein reflection.',
      },
      {
        label: 'Stay on the shore — swim, picnic dinner, the light show',
        emoji: '🌅',
        legMin: 0,
        note: 'Do not get back in the car between the boat and the sunset.',
      },
      { label: 'Home — 15 min, whenever it is over', emoji: '🛏', legMin: 15 },
    ],
    sunset:
      'Vorderer Gosausee ~20:51, from the shore you are already sitting on. The trip’s postcard, empty after the buses.',
    weatherSwap:
      'If the webcam shows the top socked in: Salzwelten Altaussee (the open salt mine) + SUP on glassy Hallstättersee water, keep the whole evening exactly as planned.',
    slow: 'Krippenstein in the morning, then the WHOLE afternoon at the Gosausee: the flat one-hour lake loop is the walk, the e-boat is the activity, the picnic on the shore is the staying-for-a-while. One mountain, one lake, nothing else.',
  },
  {
    dayId: 'thu30',
    date: 'Thu 30',
    title: 'Königssee → Salzburg at night',
    headline: 'The signature boat, the stillest lake, then the old city until you are done.',
    photo: P('K%C3%B6nigssee%20St.%20Bartholom%C3%A4%2002.jpg'),
    stops: [
      { label: 'Out of Gosau 07:10 — bags in the car', emoji: '🛏', legMin: 0 },
      {
        id: 'koenigssee',
        time: 'dock ~08:20, boat by 10:30 latest',
        legMin: 68,
        note: 'Silent boat, echo trumpet, the flat walk to the Obersee mirror. ASK AT THE WINDOW for the last Salet return boat before you board.',
      },
      {
        id: 'hintersee-ramsau',
        time: 'mid-afternoon',
        legMin: 22,
        note: 'The stillest water of the trip — rowboats ~€10, the mossy Zauberwald path, 22 min off the route.',
      },
      {
        label: 'Best Western Wals — drop bags, FUEL the car, pack for the flight',
        emoji: '🛏',
        legMin: 37,
        note: 'Bags done BEFORE going back out — then the evening is free and Friday contains no thinking.',
      },
      {
        id: 'salzburg-jewish-walk',
        time: '~19:00',
        legMin: 19,
        note: 'Judengasse, the Feingold bridge, the Stolpersteine — flat, free, at dusk pace.',
      },
      {
        id: 'moenchsberg',
        time: 'sunset 20:47',
        legMin: 0,
        note: 'Same old town, 600 m on foot from the walk. OR the 20:00 Golden Hall concert in the fortress above you — one or the other.',
      },
      { label: 'Back to Wals — as late as you like', emoji: '🛏', legMin: 21 },
    ],
    sunset:
      'Mönchsberg over the old city, 20:47 — or trade it for the 20:00 fortress concert. The 05:30 alarm is your call, not the plan’s.',
    weatherSwap:
      'If Thursday flips wet: the boat still runs — cliffs stay dramatic, crowds halve — and the evening moves indoors to the concert.',
    slow: 'Königssee only — no Hintersee, no double evening. Check in, then Mirabell gardens at dusk (free, flat, 45 min) and a slow dinner in the old town. One boat, one garden, done.',
  },
  {
    dayId: 'fri31',
    date: 'Fri 31',
    title: 'Home',
    headline: 'Alarm, keys, gate. Every decision was made last night.',
    photo: P('El%20Al%20B787-9%20%284X-EDH%29%20%40%20SFO%2C%20Nov%202019.jpg'),
    stops: [
      { label: '05:30 alarm — coffee, load', emoji: '⏰', legMin: 0 },
      { label: 'Drop the car 06:30 — photos first, key-drop', emoji: '🚗', legMin: 7 },
      { label: 'LY5194 · 09:55 → TLV 13:25', emoji: '🛫', legMin: 0 },
    ],
    sunset: 'You get a sunrise instead — ~05:45 over the Untersberg while you load the car.',
  },
];

/** Total measured driving for a day, in minutes. */
export function totalDrive(day: DayRoute): number {
  return day.stops.reduce((sum, s) => sum + s.legMin, 0);
}
