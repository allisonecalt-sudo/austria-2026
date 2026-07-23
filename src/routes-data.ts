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
}

const P = (f: string): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=900`;

export const DAY_ROUTES: DayRoute[] = [
  {
    dayId: 'fri24',
    date: 'Fri 24',
    title: 'Land soft',
    headline: 'One stop on the drive in, the big shop, then nothing.',
    photo: P('Bad%20Goisern%20-%20Ortsansicht%20%28a%29.JPG'),
    stops: [
      { label: 'Salzburg airport — land 07:50, car 08:30', emoji: '🛬', legMin: 0 },
      {
        id: 'jewish-ischl',
        time: '~10:00',
        legMin: 58,
        note: 'Flat, free, ~1h. The one meaningful stop, done before the tiredness lands.',
      },
      {
        label: 'The BIG shop — Spar Bad Ischl',
        emoji: '🛒',
        time: 'before 16:00',
        legMin: 0,
        note: 'Same town, no extra drive. This shop covers tonight, all of Shabbat AND Sunday — shops are shut both days.',
      },
      {
        label: 'Ferienwohnung Glücksmomente — check in from 16:00',
        emoji: '🛏',
        legMin: 12,
        note: 'Unpack, shower, cook. Candles 20:32.',
      },
    ],
    sunset: 'Bad Goisern valley on foot, ~20:50 — after candles, so it has to be walkable. It is.',
    weatherSwap:
      'None needed — this day works in any weather. If check-in can happen early, nap first and shop after.',
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
    title: 'Wet transfer, hot water',
    headline: 'A waterfall in the rain, then a spa instead of a waiting room.',
    photo: P('Wolfgangsee%20mit%20St.%20Wolfgang.jpg'),
    stops: [
      { label: 'Leave Bad Goisern ~10:30, car packed last night', emoji: '🛏', legMin: 0 },
      {
        id: 'golling',
        time: '~11:30',
        legMin: 56,
        note: '15 min of forest path; a waterfall runs harder in rain. Back in the car by 12:15.',
      },
      {
        id: 'tauern-spa',
        time: '14:00–17:00',
        legMin: 67,
        note: 'The trick of the day: the spa IS the waiting room for the 17:00 check-in. Take passports into the locker, not a loaded car. The detour costs ~29 min over driving direct — and turns the dead hours into the restful ones.',
      },
      {
        label: 'der Sonnberg — check in 17:00–18:00',
        emoji: '🛏',
        legMin: 11,
        note: 'Cook, early night.',
      },
    ],
    sunset:
      'Zeller See Esplanade 20:53 — two minutes from the door, umbrella, something hot. Grey is fine; it is your first night on this lake.',
    weatherSwap:
      'If Sunday somehow clears, keep the spa anyway — it is not there for the weather, it is there for the check-in gap.',
  },
  {
    dayId: 'mon27',
    date: 'Mon 27',
    title: 'Wettest day — get wetter',
    headline: 'The one plan an 89%-rain day cannot spoil: a river.',
    photo: P('Kitzsteinhorn3.jpg'),
    stops: [
      { label: 'Slow Zell morning', emoji: '☕', legMin: 0 },
      {
        id: 'frost-rafting',
        time: 'late morning / 13:00 slot',
        legMin: 11,
        note: 'BOOKED AHEAD (on request, 24h notice). Once you are in the river, rain stops mattering. FROST runs Mondays; Motion Lofer does not.',
      },
      { label: 'Back to Zell — hot shower, nap', emoji: '🛏', legMin: 11 },
      {
        id: 'zell-cruise',
        time: 'decide at 18:00, board ~20:00',
        legMin: 0,
        note: 'A 3-minute walk, so walking away costs nothing. If the sky breaks, this is the Montenegro evening — it only runs tonight.',
      },
    ],
    sunset:
      'ON the Zeller See from the boat if it sails; the Esplanade at 20:53 if not. Decide at 18:00, not before.',
    weatherSwap:
      'If Monday CLEARS (check at 07:00 in bed): drop the raft, go up Kitzsteinhorn instead — 12 min away, no reservation, decided from bed. And book the cruise the moment the sky looks right.',
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
  },
  {
    dayId: 'wed29',
    date: 'Wed 29',
    title: 'The clear day',
    headline: 'One summit in the morning, one lake all evening. The blank middle is deliberate.',
    photo: P('A-Krippenstein-5fingers.jpg'),
    stops: [
      {
        id: 'krippenstein',
        time: 'leave 09:30, home by 13:00',
        legMin: 24,
        note: 'Check the webcam at 07:30 first. Two cable cars, ~2h up top, the platform over the 400 m drop — on the one day forecast clear.',
      },
      {
        label: 'Gosau — lunch and NOTHING, 13:00–16:00',
        emoji: '😴',
        legMin: 24,
        note: 'The blank is the plan. Do not fill it.',
      },
      {
        id: 'gosausee-boats',
        time: 'on the water by 16:30',
        legMin: 15,
        note: 'Last hire 18:00 — 16:30, not later. E-boat or SUP inside the Dachstein reflection.',
      },
      {
        label: 'Stay on the shore — swim, picnic dinner',
        emoji: '🌅',
        legMin: 0,
        note: 'Do not get back in the car between the boat and the sunset.',
      },
      { label: 'Home', emoji: '🛏', legMin: 15 },
    ],
    sunset:
      'Vorderer Gosausee ~20:51, from the shore you are already sitting on. The trip’s postcard, empty after the buses.',
    weatherSwap:
      'If the webcam shows the top socked in: flip the morning to SUP on glassy Hallstättersee water, keep the evening exactly as planned.',
  },
  {
    dayId: 'thu30',
    date: 'Thu 30',
    title: 'Königssee → the city',
    headline: 'The one early alarm of the week, spent on the best thing on the list.',
    photo: P('K%C3%B6nigssee%20St.%20Bartholom%C3%A4%2002.jpg'),
    stops: [
      { label: 'Out of Gosau 07:10 — bags in the car', emoji: '🛏', legMin: 0 },
      {
        id: 'koenigssee',
        time: 'dock ~08:20, boat by 10:30 latest',
        legMin: 68,
        note: 'Silent boat, echo trumpet, the flat walk to the Obersee mirror. ASK AT THE WINDOW for the last Salet return boat before you board — that number decides your afternoon. Car by ~14:30.',
      },
      {
        id: 'hintersee-ramsau',
        time: 'optional, if ahead of schedule',
        legMin: 22,
        note: 'The stillest water of the trip, 22 min off the route home. Skip without guilt.',
      },
      {
        label: 'Best Western Wals — check in, FUEL the car, pack for the flight',
        emoji: '🛏',
        legMin: 37,
        note: 'Bags done BEFORE going back out. Friday must contain no thinking.',
      },
      {
        id: 'moenchsberg',
        time: 'sunset 20:47',
        legMin: 21,
        note: 'Or the fortress concert at 20:00 (15 min) — one or the other, and a 05:30 alarm outranks both if you are flat.',
      },
      { label: 'Hotel by ~21:30', emoji: '🛏', legMin: 21 },
    ],
    sunset:
      'Mönchsberg over the old city, 20:47 — or trade it for the 20:00 Golden Hall concert. Not both.',
    weatherSwap:
      'Thursday is forecast the second-clearest day. If it flips wet, the boat still runs — the cliffs stay dramatic and the crowds halve.',
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
