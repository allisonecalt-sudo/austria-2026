// ===========================================================================
// trip.ts — THE single data module for the Austria 2026 brochure.
//
// What this is: every fact the brochure renders — trip meta, bases, days,
//   the open decision, practical notes, costs. Zero facts are hardcoded in
//   index.html or main.ts; they all flow from here (spec rule A7).
// Why it exists: the contradicting-numbers problem (4 vs 5 bases, 3 "current
//   picks") was the trust-killer in the old site. ONE source of truth per fact.
// What's decided: facts mined 2026-06-10 from the old src/trip-data.ts +
//   the PRIVATE austria-bookings-2026.md (status only — never conf#/PIN/payment).
// What's next: Allison walkthrough → corrections → propagate to NC template.
// Links: spec projects/travel-system/trip-site-rebuild-2026-06-10.md ·
//   private bookings projects/budget-app/austria-bookings-2026.md.
// PRIVACY: this file is PUBLIC (GitHub Pages). No confirmation numbers, PINs,
//   payment instructions, license numbers, or full street addresses with codes.
// ===========================================================================

export interface TripMeta {
  name: string;
  subtitle: string;
  dateRange: string;
  travelers: string;
  nights: number;
  baseCount: number;
  basesBooked: number;
  statusLine: string;
  heroPhoto: Photo;
}

export interface Photo {
  /** Working image URL (verified-stable Wikimedia/Unsplash). */
  src: string;
  /** Label shown under/over the photo — every photo has a JOB (spec rule A8). */
  label: string;
  /** Alt text for screen readers / fail-loud if the image 404s. */
  alt: string;
  /** Source credit + (where possible) a clickable link for Avital's autonomy. */
  credit: string;
}

// --- Place links (spec rule A9b — pins + websites always reachable) ----------
// Every named place carries TWO standing links in one predictable spot:
//   📍 Navigate → Google Maps · ↗ Website → official/booking page.
// `maps` is always present (derivable from the exact place name). `website` is
// OPTIONAL — if no trustworthy URL exists for a place, it is OMITTED (never
// invented; the omission is reported, not faked). Mined from the archive
// trip-data.ts where it existed; otherwise a verified official site.
export interface PlaceLinks {
  /** Exact "place name, town" used to build the Google Maps search URL. */
  query: string;
  /** Real official / booking URL, or undefined when none is trustworthy. */
  website?: string;
}

/** Build a Google Maps search URL from an exact place query (spec A9b). */
export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Icon-coded one-line block on a day card (spec B3). */
export type BlockIcon = 'drive' | 'activity' | 'sunset' | 'food' | 'stay' | 'time';

export interface DayBlock {
  icon: BlockIcon;
  /** The scannable one-liner (label-style, ≤ ~12 words). */
  line: string;
  /** Drive distance shown ON the line — "· 25 min from base" (spec rule, DELTA 4). */
  driveFromBase?: string;
  /** Optional tap-to-expand detail (recommendation, not order). */
  detail?: string;
  /** A named place → gets 📍 Navigate + ↗ Website as the LAST line of its detail. */
  place?: { name: string; links: PlaceLinks };
}

// --- Day-shape options (spec rule, DELTA 3) ---------------------------------
// On the two free days, instead of a bare "pick one" list, offer 2–3 FULLY
// FORMED day shapes. Each shape = a complete scheduled mini-plan: morning →
// afternoon → sunset close, every stop a named place with its drive time from
// base. Calm, suggestive, pickable — concrete schedule, never a mood label.
export interface ShapeStop {
  /** Part of day: "Morning" / "Afternoon" / "Sunset". */
  when: string;
  /** The named place. */
  place: string;
  /** Drive time from base, e.g. "25 min from base" (or "" for in-town). */
  drive: string;
  /** One-line what-you-do. */
  line: string;
  /** Tap-to-expand detail + (last line) the place links. */
  detail?: string;
  links?: PlaceLinks;
}

export interface DayShape {
  /** Concrete shape name — "The glacier day", not a mood ("the chill day"). */
  name: string;
  /** ≤14-word one-line summary of the shape. */
  summary: string;
  /** Morning → afternoon → sunset stops. */
  stops: ShapeStop[];
}

export interface Day {
  id: string;
  /** "Fri Jul 24" — short, for the heading. */
  dateLabel: string;
  dayOfWeek: string;
  /** Short title — one idea for the day. */
  title: string;
  /** Logistics string that rides in the heading: drive time / move note. */
  logistics: string;
  /** The single fixed-slot labeled photo for the day. */
  photo: Photo;
  /** ≤50-word TLDR — what the day is about. */
  tldr: string;
  /** 3–5 icon-coded blocks. */
  blocks: DayBlock[];
  /** Free-day day-shape options (DELTA 3) — renders instead of bare pick-one. */
  shapes?: DayShape[];
  /** Sleep base id (links day → base). */
  baseId: BaseId;
}

export type BaseId = 'first-leg' | 'zell' | 'gosau' | 'airport';

export type BaseStatus = 'booked' | 'open';

export interface Base {
  id: BaseId;
  /** Public-facing name (no street address with codes). */
  name: string;
  town: string;
  nights: number;
  dateLabel: string;
  status: BaseStatus;
  /** Short scannable chips (beds · kitchen · drive). */
  chips: string[];
  /** ≤50-word what-it-is. */
  blurb: string;
  photo: Photo;
  /** 📍 Navigate + ↗ Website for the lodging itself (spec A9b). */
  links: PlaceLinks;
  /** Drive leg from the PREVIOUS node → this base ("~1h20"), for the ribbon. */
  legFromPrev?: string;
  /** Short ribbon label (the node caption under the dot). */
  ribbonLabel: string;
}

// --- On-trip kit (spec rule A9b, DELTA 2) -----------------------------------
// One collapsible list, grouped by base: every place of the trip, one line each
// — name · 📍 · ↗ — so mid-trip nothing needs hunting.
export interface KitPlace {
  name: string;
  links: PlaceLinks;
}
export interface KitGroup {
  base: string;
  places: KitPlace[];
}

export interface OpenDecision {
  /** Ask-framed headline (spec rule A9). */
  ask: string;
  leaning: string;
  options: { name: string; note: string; recommended: boolean }[];
  freshness: string;
}

export interface PracticalNote {
  label: string;
  body: string;
}

export interface Costs {
  headline: string;
  approx: string;
  basis: string;
  perPerson: { who: string; amount: string; note: string }[];
}

export interface TripData {
  meta: TripMeta;
  bases: Base[];
  days: Day[];
  openDecision: OpenDecision;
  practical: PracticalNote[];
  costs: Costs;
  /** Every place of the trip, grouped by base — the On-trip kit (DELTA 2). */
  kit: KitGroup[];
}

// --- Verified-stable photo URLs (mined from old trip-data.ts IMG pool) -------
const P = {
  gosausee: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
    label: 'Vorderer Gosausee — the Dachstein mirror lake',
    alt: 'Vorderer Gosausee with the Dachstein massif reflected in the still water',
    credit: 'Wikimedia / Roman Klementschitz, CC BY-SA 3.0',
  },
  salzburgRiver: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
    label: 'Salzach river + Mönchsberg, Salzburg old town',
    alt: 'The Salzach river running through Salzburg beneath the Mönchsberg',
    credit: 'Wikimedia / Aconcagua, CC BY-SA 4.0',
  },
  salzburgFortress: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
    label: 'Hohensalzburg fortress above the old town',
    alt: 'Hohensalzburg fortress on the Festungsberg above Salzburg',
    credit: 'Wikimedia / Andrew Bossi, CC BY-SA 4.0',
  },
  zellAmSee: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Zell_am_See_CC.JPG/1280px-Zell_am_See_CC.JPG',
    label: 'Zell am See — the alpine lake town',
    alt: 'Zell am See lake town with the Hohe Tauern peaks rising behind',
    credit: 'Wikimedia / BestZeller, CC BY-SA 3.0',
  },
  alpineSunset: {
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85',
    label: 'Alpine peaks at golden hour',
    alt: 'High-alpine peaks glowing at golden hour',
    credit: 'Unsplash',
  },
  hallstattLake: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
    label: 'Hallstatt lakeside boathouses',
    alt: 'Hallstatt village boathouses along the lake at the foot of alpine slopes',
    credit: 'Wikimedia / Jorge Royan, CC BY-SA 4.0',
  },
  werfen: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Werfen_-_Burg_Hohenwerfen_%281%29.JPG/1280px-Werfen_-_Burg_Hohenwerfen_%281%29.JPG',
    label: 'Hohenwerfen castle, on the drive back to Salzburg',
    alt: 'Hohenwerfen castle perched on a rocky crag above the Salzach valley near Werfen',
    credit: 'Wikimedia / C.Stadler / Bwag, CC BY-SA 4.0',
  },
} as const satisfies Record<string, Photo>;

export const TRIP: TripData = {
  meta: {
    name: 'Austria',
    subtitle: 'Lakes, peaks, and a sunset every night',
    dateRange: 'Fri Jul 24 – Fri Jul 31, 2026',
    travelers: 'Allison + Avital',
    nights: 7,
    baseCount: 4,
    basesBooked: 3,
    statusLine: '3 of 4 bases booked · first leg still to pick',
    heroPhoto: P.gosausee,
  },

  bases: [
    {
      id: 'first-leg',
      name: 'First-leg apartment',
      town: 'leaning Bad Goisern (Salzkammergut)',
      nights: 2,
      dateLabel: 'Fri Jul 24 – Sun Jul 26',
      status: 'open',
      chips: ['Shabbat base', 'leaning Glücksmomente', '3 free-cancel options'],
      blurb:
        'The first-leg / Shabbat stay — the trip’s one open decision. Leaning Glücksmomente in Bad Goisern (cookable kitchenette, physical-key entry, Shabbat-safe). Two other free-cancel options held in Salzburg.',
      photo: P.hallstattLake,
      ribbonLabel: 'Shabbat base',
      links: { query: 'Glücksmomente Bad Goisern Salzkammergut' },
    },
    {
      id: 'zell',
      name: 'der Sonnberg Alpinlodges',
      town: 'Zell am See',
      nights: 2,
      dateLabel: 'Sun Jul 26 – Tue Jul 28',
      status: 'booked',
      chips: ['Sleeps 4', 'Kitchenette · no oven', 'Private sauna · lake view', '~15-min walk to lake'],
      blurb:
        'The alpine-lake half of the week. Two-bedroom apartment up the hill above town, lake-and-mountain view, private sauna and balcony. Kitchenette (no oven — matters for kosher cooking). Self check-in.',
      photo: P.zellAmSee,
      ribbonLabel: 'Zell am See',
      legFromPrev: '~1h20',
      links: {
        query: 'der Sonnberg Alpinlodges Zell am See',
        website: 'https://www.booking.com/hotel/at/der-sonnberg-alpinlodges.html',
      },
    },
    {
      id: 'gosau',
      name: 'Transylvania Villa & Spa',
      town: 'Gosau (Dachstein West)',
      nights: 2,
      dateLabel: 'Tue Jul 28 – Thu Jul 30',
      status: 'booked',
      chips: ['Sleeps up to 6', 'Full kitchen WITH oven', 'Sauna + spa', '~14 min to Gosausee'],
      blurb:
        'The Salzkammergut-lakes half. Superior two-bedroom apartment with a full kitchen and oven (kosher-cook friendly), Finnish sauna and infrared spa. Stairs only to the 2nd floor. Walking distance to the mirror lake.',
      photo: P.gosausee,
      ribbonLabel: 'Gosau',
      legFromPrev: '~1h45',
      links: {
        query: 'Transylvania Villa & Spa Gosau',
        website: 'https://www.booking.com/hotel/at/transylvania-villa-spa.html',
      },
    },
    {
      id: 'airport',
      name: 'Best Western Hotel am Walserberg',
      town: 'Wals (by Salzburg airport)',
      nights: 1,
      dateLabel: 'Thu Jul 30 – Fri Jul 31',
      status: 'booked',
      chips: ['Twin room', '~5 km / ~10 min to SZG', 'Paid in full', '24-hr reception'],
      blurb:
        'The one pre-flight night, ~10 minutes from Salzburg airport for the early Friday departure. Standard twin room, sauna + breakfast, no in-room kitchen (fine — last night, no Shabbat). Pack earplugs; it’s near a motorway.',
      photo: P.salzburgFortress,
      ribbonLabel: 'Airport side',
      legFromPrev: '~1h20',
      links: {
        query: 'Best Western Hotel am Walserberg Wals Salzburg',
        website: 'https://www.booking.com/hotel/at/servus-europa-salzburg-am-walserberg.html',
      },
    },
  ],

  days: [
    {
      id: 'fri-jul-24',
      dateLabel: 'Fri Jul 24',
      dayOfWeek: 'Friday',
      title: 'Land at Salzburg, settle in for Shabbat',
      logistics: 'Land SZG 07:50 · airport → base ~15–65 min',
      photo: P.salzburgRiver,
      tldr: 'Land 07:50 on LY5193, pick up the rental car, drop bags at the first-leg apartment, Spar run for Shabbat groceries, nap. The whole day is built around being settled before candle-lighting at 20:35.',
      blocks: [
        { icon: 'time', line: 'Land SZG 07:50 (LY5193) → collect rental car' },
        {
          icon: 'drive',
          line: 'Drive to the first-leg base',
          driveFromBase: '15–65 min from airport',
          detail:
            'If the Salzburg city option is picked: ~15 min, apartment on Linzergasse, Chabad a 3-minute walk. If Glücksmomente (Bad Goisern): ~65 min into the Salzkammergut.',
        },
        {
          icon: 'food',
          line: 'Spar groceries done by ~11:00, then nap',
          detail: 'Stock the Shabbat food before the shops close early on Friday. Nearest Spar/Eurospar to the chosen base.',
          place: { name: 'Spar supermarket (nearest the base)', links: { query: 'Spar supermarket Bad Goisern' } },
        },
        {
          icon: 'sunset',
          line: 'Candle-lighting 20:35 · settled and unwound',
          detail:
            'Plan B if jet lag is mild: skip the nap, slow walk into the Altstadt for coffee in a square before Shabbat prep.',
        },
      ],
      baseId: 'first-leg',
    },
    {
      id: 'sat-jul-25',
      dateLabel: 'Sat Jul 25',
      dayOfWeek: 'Saturday',
      title: 'Shabbat — walking only',
      logistics: 'No driving · on foot all day',
      photo: P.salzburgFortress,
      tldr: 'Shul, a long kiddush lunch, a deep nap, then a late-afternoon walk. Sunset on the river, Havdalah at 21:49. A slow, recover-from-the-flight day.',
      blocks: [
        {
          icon: 'time',
          line: 'Shacharit at Chabad ~09:30, long lunch, nap',
          detail: 'Chabad of Salzburg (Linzergasse) if the city option wins — WhatsApp Chani in advance for meals. On foot only.',
          place: { name: 'Chabad of Salzburg', links: { query: 'Chabad Salzburg Linzergasse', website: 'https://www.chabadsalzburg.com/' } },
        },
        {
          icon: 'activity',
          line: 'Late-afternoon walk (Shabbat-legal)',
          driveFromBase: 'on foot from base',
          detail:
            'If in Salzburg: walk up the Mönchsberg via the stone stairs (no money, no lift), ridge walk along the top of the old town. Plan B: stay close — Mirabell Gardens bench, river walk both ways.',
          place: { name: 'Mönchsberg ridge walk, Salzburg', links: { query: 'Mönchsberg Salzburg' } },
        },
        {
          icon: 'sunset',
          line: 'Sunset from the Salzach river bank · 20:54',
          place: { name: 'Salzach riverbank (Elisabethkai)', links: { query: 'Elisabethkai Salzburg' } },
        },
        { icon: 'time', line: 'Havdalah 21:49' },
      ],
      baseId: 'first-leg',
    },
    {
      id: 'sun-jul-26',
      dateLabel: 'Sun Jul 26',
      dayOfWeek: 'Sunday',
      title: 'Move south to Zell am See',
      logistics: 'Move day · ~1h20 drive (~90 km)',
      photo: P.zellAmSee,
      tldr: 'Slow morning, pack out after Havdalah, drive south to the alpine lake. Check in at der Sonnberg Alpinlodges (2 nights), walk down to the Zeller See shore, sunset on the Esplanade.',
      blocks: [
        { icon: 'drive', line: 'Salzburg → Zell am See (Salzach valley B311)', driveFromBase: '~1h20 to base' },
        {
          icon: 'stay',
          line: 'Check in der Sonnberg Alpinlodges 17:00–18:00 (self check-in)',
          detail: 'Up the hill above town, ~1.1 km / ~15-min walk down to the lake (uphill back). Private sauna + lake-view balcony.',
          place: {
            name: 'der Sonnberg Alpinlodges',
            links: { query: 'der Sonnberg Alpinlodges Zell am See', website: 'https://www.booking.com/hotel/at/der-sonnberg-alpinlodges.html' },
          },
        },
        {
          icon: 'activity',
          line: 'Walk down to the Zeller See shore',
          driveFromBase: '~15-min walk from base',
          detail:
            'The lake sits right at the foot of the Schmittenhöhe and the Hohe Tauern peaks — a different feel from the lush Salzkammergut lakes. Lake walk along the Esplanade promenade. Plan B if Shabbat tired the legs: long balcony afternoon, sunset from the window.',
          place: { name: 'Zeller See Esplanade promenade', links: { query: 'Esplanade Zell am See lakeshore' } },
        },
        { icon: 'sunset', line: 'Sunset from the Esplanade promenade · 20:53' },
      ],
      baseId: 'zell',
    },
    {
      id: 'mon-jul-27',
      dateLabel: 'Mon Jul 27',
      dayOfWeek: 'Monday',
      title: 'A full day from Zell am See',
      logistics: 'Base day · a day from here could look like…',
      photo: P.alpineSunset,
      tldr: 'A whole free day at the alpine base. Three shapes a day could take — a glacier, a waterfall, or an easy lake day — each fully planned below. Every one ends with a swim and sunset back on the Zeller See.',
      blocks: [{ icon: 'sunset', line: 'However the day goes — sunset on the Esplanade · 20:52', place: { name: 'Zeller See Esplanade promenade', links: { query: 'Esplanade Zell am See lakeshore' } } }],
      shapes: [
        {
          name: 'The glacier day',
          summary: 'Snow in July at 3,029 m, then the lake in the evening.',
          stops: [
            {
              when: 'Morning',
              place: 'Kitzsteinhorn glacier, Kaprun',
              drive: '25 min from base',
              line: 'Gondola up to the Gipfelwelt 3.000 — snow, ice arena, 360° Hohe Tauern view',
              detail: 'Drive to Kaprun, ride the glacier gondola to 3,029 m. Cold even in July — bring layers. The Top of Salzburg platform + ice tunnel are the highlights. Easy: it is almost all lift, very little walking.',
              links: { query: 'Kitzsteinhorn Kaprun glacier', website: 'https://www.kitzsteinhorn.at/en/summer/kitzsteinhorn' },
            },
            {
              when: 'Afternoon',
              place: 'Kaprun village / back to Zell',
              drive: '25 min back to base',
              line: 'Lunch in Kaprun, drive back, slow café hour on the Esplanade',
              detail: 'Come down off the glacier for a warm lunch, drive back to Zell, decompress with coffee by the lake.',
              links: { query: 'Kaprun village center' },
            },
            {
              when: 'Sunset',
              place: 'Strandbad Zell am See + Esplanade',
              drive: 'in town',
              line: 'Evening swim from the lido, sunset on the lake · 20:52',
              detail: 'Warm-evening swim from the Strandbad lake lido, then sunset right on the Esplanade.',
              links: { query: 'Strandbad Zell am See', website: 'https://www.zellamsee-kaprun.com/en' },
            },
          ],
        },
        {
          name: 'The waterfall day',
          summary: "Austria's tallest falls in the morning, lake swim to close.",
          stops: [
            {
              when: 'Morning',
              place: 'Krimml Waterfalls',
              drive: '~1h10 from base',
              line: "Walk up the three-tier trail beside Austria's tallest falls (380 m)",
              detail: 'Drive ~1h10 west into the Hohe Tauern. The graded WasserWunderWelt path climbs alongside all three tiers — go as high as energy allows and turn back; the first tier alone is worth it. Easy underfoot, just uphill.',
              links: { query: 'Krimml Waterfalls', website: 'https://www.wasserfaelle-krimml.at/en/' },
            },
            {
              when: 'Afternoon',
              place: 'Drive back via the Pinzgau valley',
              drive: '~1h10 back to base',
              line: 'Scenic valley drive back to Zell, late lunch in town',
              detail: 'The Salzach-valley return is gentle and pretty. Late lunch on the Esplanade when you are back.',
              links: { query: 'Zell am See town center' },
            },
            {
              when: 'Sunset',
              place: 'Strandbad Zell am See + Esplanade',
              drive: 'in town',
              line: 'Swim + sunset on the Zeller See · 20:52',
              detail: 'Cool off in the lake after the drive, then sunset on the promenade.',
              links: { query: 'Strandbad Zell am See', website: 'https://www.zellamsee-kaprun.com/en' },
            },
          ],
        },
        {
          name: 'The easy lake day',
          summary: 'A cable-car peek and the lake — almost no driving.',
          stops: [
            {
              when: 'Morning',
              place: 'Schmittenhöhe cable car',
              drive: '~10 min from base',
              line: 'Ride to the 1,965 m panorama deck for the 30-peaks view',
              detail: 'The Schmitten valley station is minutes from the lodge. Porsche-design cabins to a near-2,000 m deck with an easy summit stroll. A half-day at most — perfect for a low-key day.',
              links: { query: 'Schmittenhöhebahn Zell am See', website: 'https://www.schmitten.at/en/Summer-on-the-mountain/Open-facilities-and-highlights' },
            },
            {
              when: 'Afternoon',
              place: 'Zeller See Esplanade + Strandbad',
              drive: 'in town',
              line: 'Lake-loop walk or swim, café on the promenade',
              detail: 'Back down by lunch. Walk the lakeshore, swim from the Strandbad, café and a book in the afternoon.',
              links: { query: 'Strandbad Zell am See', website: 'https://www.zellamsee-kaprun.com/en' },
            },
            {
              when: 'Sunset',
              place: 'Esplanade promenade',
              drive: 'in town',
              line: 'Sunset right out the door · 20:52',
              detail: 'No driving needed — the sunset is a short walk from the lodge.',
              links: { query: 'Esplanade Zell am See lakeshore' },
            },
          ],
        },
      ],
      baseId: 'zell',
    },
    {
      id: 'tue-jul-28',
      dateLabel: 'Tue Jul 28',
      dayOfWeek: 'Tuesday',
      title: 'Move to Gosau — the Vorderer Gosausee mirror lake',
      logistics: 'Move day · ~1h45 drive (~100 km, via Bad Ischl)',
      photo: P.gosausee,
      tldr: 'Pack out, drive northeast to Gosau with a Bad Ischl coffee stop. Check in at Transylvania Villa & Spa (2 nights, full kitchen). Walk to the Vorderer Gosausee — Dachstein mirrored in the water — for a lakeside picnic and sunset. The trip’s “we’re really here” moment.',
      blocks: [
        { icon: 'drive', line: 'Zell am See → Gosau (Tauern A10 + B166)', driveFromBase: '~1h45 to base' },
        {
          icon: 'food',
          line: 'Bad Ischl mid-route — Spar restock + café break ~11:30',
          driveFromBase: 'on the route',
          detail: 'Bad Ischl is the natural halfway stop — Spar restock for the Gosau kitchen + a café break.',
          place: { name: 'Bad Ischl town center', links: { query: 'Bad Ischl town center' } },
        },
        {
          icon: 'stay',
          line: 'Check in Transylvania Villa & Spa 16:00–21:00',
          detail: 'Full kitchen WITH oven, Finnish sauna + infrared spa, key-card self check-in. Walking distance to the Gosausee.',
          place: {
            name: 'Transylvania Villa & Spa, Gosau',
            links: { query: 'Transylvania Villa & Spa Gosau', website: 'https://www.booking.com/hotel/at/transylvania-villa-spa.html' },
          },
        },
        {
          icon: 'activity',
          line: 'Easy 1-hour gravel loop around the Gosausee',
          driveFromBase: '~14 min from base',
          detail:
            'One of the most-photographed lakes in Austria — the Dachstein glacier mirrors in the water, and the loop is nearly empty after the day-tripper buses leave. Lakeside picnic. Plan B: skip the loop, walk to the lake just for sunset.',
          place: {
            name: 'Vorderer Gosausee',
            links: { query: 'Vorderer Gosausee Dachstein', website: 'https://www.gosausee.com/' },
          },
        },
        { icon: 'sunset', line: 'Sunset on the mirror lake · 20:51' },
      ],
      baseId: 'gosau',
    },
    {
      id: 'wed-jul-29',
      dateLabel: 'Wed Jul 29',
      dayOfWeek: 'Wednesday',
      title: 'A full day from Gosau',
      logistics: 'Base day · a day from here could look like…',
      photo: P.hallstattLake,
      tldr: 'The free Salzkammergut day — almost everything in the cluster is under 25 minutes from Gosau. Three shapes a day could take, each fully planned below. All of them end at a mirror-lake or lakeside sunset.',
      blocks: [{ icon: 'sunset', line: 'However the day goes — sunset at the Gosausee or a Hallstatt viewpoint · 20:50', place: { name: 'Vorderer Gosausee', links: { query: 'Vorderer Gosausee Dachstein', website: 'https://www.gosausee.com/' } } }],
      shapes: [
        {
          name: 'The Hallstatt day',
          summary: 'The famous village + its Skywalk, then lakeside coffee.',
          stops: [
            {
              when: 'Morning',
              place: 'Hallstatt Markt + Skywalk',
              drive: '~20 min from base',
              line: 'Funicular up to the Skywalk for the 360° view over the lake',
              detail: 'Arrive early before the buses. The Salzbergbahn funicular lifts you to the Skywalk "Welterbeblick" viewing platform above the village. Lakeside promenade walk after.',
              links: { query: 'Hallstatt Skywalk Welterbeblick', website: 'https://www.hallstatt.net/' },
            },
            {
              when: 'Afternoon',
              place: 'Hallstatt lakeshore promenade',
              drive: '~20 min from base',
              line: 'Slow lakeside walk + café, browse the village lanes',
              detail: 'The classic boathouse-lined promenade. A coffee by the water, then drive back toward Gosau mid-afternoon.',
              links: { query: 'Hallstatt lakeside promenade' },
            },
            {
              when: 'Sunset',
              place: 'Vorderer Gosausee',
              drive: '~14 min from base',
              line: 'Back to the mirror lake for the Dachstein sunset · 20:50',
              detail: 'Close the day where it is quietest — the Gosausee after the day-trippers have gone.',
              links: { query: 'Vorderer Gosausee Dachstein', website: 'https://www.gosausee.com/' },
            },
          ],
        },
        {
          name: 'The Krippenstein day',
          summary: 'Gondolas to the 5 Fingers platform, the iconic photo.',
          stops: [
            {
              when: 'Morning',
              place: 'Dachstein Krippenstein, Obertraun',
              drive: '~25 min from base',
              line: 'Gondolas to 2,109 m for the 5 Fingers cantilevered platform',
              detail: 'Drive to Obertraun, ride two gondola stages up to Krippenstein. The 5 Fingers platform juts out over a 400 m drop — the famous shot. Easy walk from the gondola top. Bring a layer; it is cool up high.',
              links: { query: 'Dachstein Krippenstein 5 Fingers Obertraun', website: 'https://www.dachstein-salzkammergut.com/en/summer/above-ground/5fingers' },
            },
            {
              when: 'Afternoon',
              place: 'Obertraun lakeshore / drive back',
              drive: '~25 min back to base',
              line: 'Lakeshore stop at Obertraun, then back toward Gosau',
              detail: 'Come down, a quiet lakeshore break at the Hallstättersee south end, then the short drive back.',
              links: { query: 'Obertraun Hallstättersee lakeshore' },
            },
            {
              when: 'Sunset',
              place: 'Vorderer Gosausee',
              drive: '~14 min from base',
              line: 'Mirror-lake sunset to close · 20:50',
              detail: 'The Gosausee again for the still-water Dachstein reflection at golden hour.',
              links: { query: 'Vorderer Gosausee Dachstein', website: 'https://www.gosausee.com/' },
            },
          ],
        },
        {
          name: 'The easy Gosau day',
          summary: 'Stay close — a deeper lake walk and village pace.',
          stops: [
            {
              when: 'Morning',
              place: 'Hinterer Gosausee trail',
              drive: '~14 min from base',
              line: 'Walk on past the front lake toward the back-of-valley view',
              detail: 'From the Vorderer Gosausee, the gentle valley track continues toward the Hinterer Gosausee under the Dachstein. Go as far as feels good and turn back — no summit needed. Longer but flat-ish.',
              links: { query: 'Hinterer Gosausee Dachstein trail' },
            },
            {
              when: 'Afternoon',
              place: 'Gosau village',
              drive: 'in village',
              line: 'Balcony coffee at the apartment, café in Gosau',
              detail: 'A slow afternoon — the Transylvania spa/sauna, balcony coffee, a café in the village.',
              links: { query: 'Gosau village center' },
            },
            {
              when: 'Sunset',
              place: 'Vorderer Gosausee',
              drive: '~14 min from base',
              line: 'A second, quieter mirror-lake sunset · 20:50',
              detail: 'Walk back down to the front lake just for the sunset.',
              links: { query: 'Vorderer Gosausee Dachstein', website: 'https://www.gosausee.com/' },
            },
          ],
        },
      ],
      baseId: 'gosau',
    },
    {
      id: 'thu-jul-30',
      dateLabel: 'Thu Jul 30',
      dayOfWeek: 'Thursday',
      title: 'Morning Gosau → drive to the airport side',
      logistics: 'Move day · ~1h20 drive (~75 km)',
      photo: P.werfen,
      tldr: 'Slow Gosau morning, optional last Hallstatt coffee, then drive to the Salzburg airport area. Check in at Best Western am Walserberg. Open afternoon: lazy day, a Mönchsberg sunset, or the Eisriesenwelt ice cave at Werfen. Keep the car for the morning airport drop.',
      blocks: [
        { icon: 'drive', line: 'Gosau → Salzburg airport area (B166 + A1)', driveFromBase: '~1h20 to base' },
        {
          icon: 'stay',
          line: 'Check in Best Western am Walserberg ~13:00',
          detail: '~5 km / ~10 min from Salzburg airport. 24-hour reception, sauna + breakfast. Pack earplugs — near a motorway.',
          place: {
            name: 'Best Western Hotel am Walserberg',
            links: { query: 'Best Western Hotel am Walserberg Wals Salzburg', website: 'https://www.booking.com/hotel/at/servus-europa-salzburg-am-walserberg.html' },
          },
        },
        {
          icon: 'activity',
          line: 'Open afternoon — Mönchsberg sunset or the ice cave',
          driveFromBase: '~10–45 min from base',
          detail:
            'Lazy day at the hotel / Mönchsberg ridge sunset from Toscaninihof (~10 min) / Eisriesenwelt ice cave at Werfen (~45 min — world’s largest, 75-min underground tour — book the night before, July sells out).',
          place: {
            name: 'Eisriesenwelt ice cave, Werfen',
            links: { query: 'Eisriesenwelt Werfen ice cave', website: 'https://www.eisriesenwelt.at/en/' },
          },
        },
        {
          icon: 'drive',
          line: 'Keep the rental car overnight',
          detail: 'The Alamo booking runs through Friday morning, so you drive yourselves to the airport and drop it there — no Thursday-night return, no taxi.',
        },
        {
          icon: 'sunset',
          line: 'Sunset from the Mönchsberg ridge · 20:47',
          driveFromBase: '~10 min from base',
          place: { name: 'Mönchsberg ridge, Salzburg', links: { query: 'Mönchsberg Salzburg Toscaninihof' } },
        },
      ],
      baseId: 'airport',
    },
    {
      id: 'fri-jul-31',
      dateLabel: 'Fri Jul 31',
      dayOfWeek: 'Friday',
      title: 'Fly home',
      logistics: 'Departure day · ~10 min to SZG',
      photo: P.alpineSunset,
      tldr: 'Early wake, drive the ~5 km to Salzburg airport, drop the rental car at 06:30. Board LY5194 at 08:55, land TLV 13:25 — a full Friday afternoon to settle before Shabbat.',
      blocks: [
        { icon: 'time', line: 'Wake 05:30 · drive to SZG + drop car 06:30', driveFromBase: '~10 min from base' },
        { icon: 'time', line: 'Depart SZG 08:55 (LY5194)' },
        { icon: 'time', line: 'Land TLV 13:25 — home before Shabbat' },
      ],
      baseId: 'airport',
    },
  ],

  openDecision: {
    ask: 'Still to pick: Base 1 — the first-leg / Shabbat stay',
    leaning: 'Leaning Glücksmomente (Bad Goisern) — cookable kitchenette, physical-key entry (Shabbat-safe), ~65 min from the airport, near Hallstatt + Gosau.',
    options: [
      { name: 'Glücksmomente — Bad Goisern', note: 'Salzkammergut, not Salzburg · stovetop + microwave · physical key · 2 nights', recommended: true },
      { name: 'Amedeo Zotti Residence — Salzburg', note: 'Schallmoos · stovetop · physical-key entry · ~26 min to Chabad', recommended: false },
      { name: 'Master Linzergasse — Salzburg', note: 'Old-town edge · ~3 min to Chabad · no-cooking policy (fridge + kettle only)', recommended: false },
    ],
    freshness: 'All three are free-cancel — pick one and cancel the other two before the cancellation windows. Re-verify before booking.',
  },

  practical: [
    {
      label: 'Kosher / Shabbat',
      body: 'Shabbat is spent at the first-leg base (Fri–Sun). Chabad Salzburg on Linzergasse if the city option wins; WhatsApp Chani in advance. Two of the four bases have a cookable kitchen — Gosau has a full oven, Zell a stovetop kitchenette (no oven). Candle-lighting Fri 20:35, Havdalah Sat 21:49.',
    },
    {
      label: 'Flights',
      body: 'Out: LY5193 lands SZG Fri Jul 24 at 07:50. Home: LY5194 departs SZG Fri Jul 31 at 08:55, lands TLV 13:25. Booked — details on file.',
    },
    {
      label: 'Car',
      body: 'Alamo Suzuki Vitara, picked up at the airport on arrival and kept through the final Friday morning so you self-drive to the airport drop. Booked — details on file.',
    },
    {
      label: 'Rhythm',
      body: 'Four bases, three moves. Two anchor halves: alpine lake (Zell) then the Salzkammergut lakes (Gosau). Apartments with kitchens, picnics on rocks, and a named sunset spot every single night.',
    },
  ],

  costs: {
    headline: '₪16,023 all-in',
    approx: '≈ €4,036 · 7 nights · 2 people',
    basis: 'Based on the current first-leg lean (Glücksmomente). Three of four bases booked; the total shifts a little if another first-leg option is picked.',
    perPerson: [
      { who: 'Allison', amount: '₪7,644', note: 'net of the $50 baggage settle' },
      { who: 'Avital', amount: '~₪8,379', note: 'estimated — finalizes with her flight share' },
    ],
  },

  // The On-trip kit (spec A9b, DELTA 2): every place of the trip, grouped by
  // base, each as name · 📍 · ↗ — so mid-trip nothing needs hunting. Websites
  // omitted only where no trustworthy URL exists (public spaces / viewpoints).
  kit: [
    {
      base: 'Base 1 — Shabbat (leaning Bad Goisern)',
      places: [
        { name: 'Glücksmomente apartment (leaning pick)', links: { query: 'Glücksmomente Bad Goisern Salzkammergut' } },
        { name: 'Spar supermarket (nearest the base)', links: { query: 'Spar supermarket Bad Goisern' } },
        { name: 'Chabad of Salzburg', links: { query: 'Chabad Salzburg Linzergasse', website: 'https://www.chabadsalzburg.com/' } },
        { name: 'Mönchsberg ridge walk, Salzburg', links: { query: 'Mönchsberg Salzburg' } },
        { name: 'Salzach riverbank (Elisabethkai)', links: { query: 'Elisabethkai Salzburg' } },
      ],
    },
    {
      base: 'Base 2 — Zell am See',
      places: [
        { name: 'der Sonnberg Alpinlodges', links: { query: 'der Sonnberg Alpinlodges Zell am See', website: 'https://www.booking.com/hotel/at/der-sonnberg-alpinlodges.html' } },
        { name: 'Zeller See Esplanade promenade', links: { query: 'Esplanade Zell am See lakeshore' } },
        { name: 'Strandbad Zell am See (lake lido)', links: { query: 'Strandbad Zell am See', website: 'https://www.zellamsee-kaprun.com/en' } },
        { name: 'Schmittenhöhe cable car', links: { query: 'Schmittenhöhebahn Zell am See', website: 'https://www.schmitten.at/en/Summer-on-the-mountain/Open-facilities-and-highlights' } },
        { name: 'Kitzsteinhorn glacier, Kaprun', links: { query: 'Kitzsteinhorn Kaprun glacier', website: 'https://www.kitzsteinhorn.at/en/summer/kitzsteinhorn' } },
        { name: 'Krimml Waterfalls', links: { query: 'Krimml Waterfalls', website: 'https://www.wasserfaelle-krimml.at/en/' } },
      ],
    },
    {
      base: 'Base 3 — Gosau',
      places: [
        { name: 'Transylvania Villa & Spa, Gosau', links: { query: 'Transylvania Villa & Spa Gosau', website: 'https://www.booking.com/hotel/at/transylvania-villa-spa.html' } },
        { name: 'Vorderer Gosausee', links: { query: 'Vorderer Gosausee Dachstein', website: 'https://www.gosausee.com/' } },
        { name: 'Hallstatt Markt + Skywalk', links: { query: 'Hallstatt Skywalk Welterbeblick', website: 'https://www.hallstatt.net/' } },
        { name: 'Dachstein Krippenstein — 5 Fingers', links: { query: 'Dachstein Krippenstein 5 Fingers Obertraun', website: 'https://www.dachstein-salzkammergut.com/en/summer/above-ground/5fingers' } },
        { name: 'Hinterer Gosausee trail', links: { query: 'Hinterer Gosausee Dachstein trail' } },
        { name: 'Bad Ischl (mid-route stop)', links: { query: 'Bad Ischl town center' } },
      ],
    },
    {
      base: 'Base 4 — Airport side',
      places: [
        { name: 'Best Western Hotel am Walserberg', links: { query: 'Best Western Hotel am Walserberg Wals Salzburg', website: 'https://www.booking.com/hotel/at/servus-europa-salzburg-am-walserberg.html' } },
        { name: 'Eisriesenwelt ice cave, Werfen', links: { query: 'Eisriesenwelt Werfen ice cave', website: 'https://www.eisriesenwelt.at/en/' } },
        { name: 'Mönchsberg ridge sunset (Toscaninihof)', links: { query: 'Mönchsberg Salzburg Toscaninihof' } },
        { name: 'Salzburg Airport (W. A. Mozart)', links: { query: 'Salzburg Airport', website: 'https://www.salzburg-airport.com/en/' } },
      ],
    },
  ],
};
