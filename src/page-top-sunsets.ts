// Top-5 Sunsets — hero page bootstrap.
// Pulls the highest-sunset-rating entries from NATURE_DESTINATIONS and renders
// them as full-bleed visual cards with: exact sunset time for the trip night,
// where-you-stand-from viewpoint, drive times from each candidate base, last
// transport return, and what to pair before. Plus an honorable-mentions strip
// and a 7-night sunset-time tape.
//
// Allison + Avital verbatim (Montenegro v2 context):
//   "we love love love sunsets, amazing sunsets are huge"
//
// Photos: each card uses a place-matched golden-hour Wikimedia image — NOT
// generic alpine. Verified via Wikimedia file names + descriptions 2026-05-16.

import { NATURE_DESTINATIONS, type NatureDestination } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { initSharedShortlist, pickButtonOverlay } from './shortlist-shared.js';

// =====================================================================
// Per-pick metadata — the trip-night context not in NATURE_DESTINATIONS
// =====================================================================
interface SunsetPick {
  id: string;
  rank: number;
  tagline: string; // Allison-voice one-liner
  tldr: string; // Avital-scan line at the top of the card
  tripNight: string; // e.g. "Tue Jul 28"
  tripNightDayId: string; // matches days[].id in trip-data for anchor
  sunsetTime: string; // HH:MM IDT/local — from itinerary anchors
  whereYouWatch: string; // specific viewpoint, not generic
  whyThisOne: string; // "Tara-Bridge tier" / "on the boat" / etc.
  practical: string; // parking / last-boat / last-bus / how late
  pairsWithBefore: string; // what to do BEFORE so you're there on time
  driveFromBases: {
    obertraun: string;
    berchtesgaden: string;
    stWolfgang: string;
    salzburg: string;
  };
  // Place-matched WOW golden-hour photo, verified Wikimedia 2026-05-16.
  heroPhoto: { src: string; alt: string; credit: string; sourceUrl: string };
  sunsetTimeSource: string;
}

// v4 sunset re-rank (2026-05-19): re-ranked around the 4 actual bases
// (Salzburg / Zell am See / Gosau / Airport). No summit overnight, so the
// Krippenstein-5fingers sunset is reframed as a day-trip option (descent
// timing now matters), and Schafberg-cog sunset is honorable-mention only
// (cog stops ~19:30, sunset is 20:48 — incompatible without a backup plan).
// Gosausee mirror is the new #1 — 5-min walk from the Gosau apartment, no
// transport dependency, full Dachstein reflection.
//
// Each pick now carries drive times from the v4 bases that actually exist:
// salzburg / zellAmSee / gosau / airport.
const PICKS: SunsetPick[] = [
  {
    id: 'gosausee',
    rank: 1,
    tagline:
      "Dachstein glacier mirrors in the lake from the west shore — 5-min walk from the Gosau apartment. No transport, no last-cable-car anxiety. The 'we're really here' moment of the trip.",
    tldr:
      'Vorderer Gosausee at 20:51 — Dachstein mirror, 5-min walk from base, no transit dependency.',
    tripNight: 'Tue Jul 28',
    tripNightDayId: 'tue-jul-28',
    sunsetTime: '20:51',
    whereYouWatch:
      'WEST shore of Vorderer Gosausee, ~15 min along the flat gravel loop from the parking lot. The Dachstein glacier sits east-southeast — at sunset its face catches alpenglow while the lake holds the reflection. Stand where the gravel path meets the lake edge for the full mirror shot.',
    whyThisOne:
      "5-minute walk from Der Ulmenhof. No drive, no cable car, no last-train back. Full Dachstein-mirror angle, lake quiet after the bus crowds clear ~18:00. The 'we're really here' sunset of the trip and the one that's most weather-resilient.",
    practical:
      'Free parking at Gosausee main lot (P1) if you drive; the village → lakeshore walk is 30 min on the marked path so the car is optional. The flat 1-hour gravel loop is stroller-friendly. Lakeshore stays accessible all night (Gosau is a residential village, not a tourist gate).',
    pairsWithBefore:
      "Move-day arrival from Zell am See in the afternoon → check in at Der Ulmenhof → walk straight to the Gosausee for the loop → west-shore spot by 20:30 → sunset 20:51. The arrival night of base 3 — settle in by watching the lake light up.",
    // Drive labels map to v4 bases via the renderer:
    //   .salzburg → Salzburg base, .stWolfgang → Zell am See base,
    //   .obertraun → Gosau base, .berchtesgaden → Airport base.
    // See `renderPicks()` in this file.
    driveFromBases: {
      salzburg: '80 min',
      stWolfgang: '1h45 (move-day)',
      obertraun: '5 min walk',
      berchtesgaden: '1h20',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
      alt: 'Vorderer Gosausee with the Dachstein massif reflected in still water (July 2012)',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gosausee_Dachstein_July_2012.jpg',
    },
    sunsetTimeSource: 'https://www.timeanddate.com/sun/austria/salzburg?month=7&year=2026',
  },
  {
    id: 'schafbergspitze',
    rank: 2,
    tagline:
      'Schmittenhöhe peak above Zell am See — cable car up to ~2,000m, 360° panorama across the Hohe Tauern + Zeller See far below. The alpine-half sunset.',
    tldr:
      'Schmittenhöhe peak at 20:52 — cable car up from Zell base, panorama across Hohe Tauern.',
    tripNight: 'Mon Jul 27',
    tripNightDayId: 'mon-jul-27',
    sunsetTime: '20:52',
    whereYouWatch:
      "From the Schmittenhöhe peak terrace at ~2,000m above Zell am See — 360° view across the Pinzgau, the Hohe Tauern (Grossglockner + Kitzsteinhorn glacier visible to the south), and the Zeller See directly below to the east. The cable-car-station terrace is the easy spot; a 5-min walk to the Elisabeth-Kapelle gives a slightly higher angle.",
    whyThisOne:
      "It's the natural sunset for the Zell-base half. Schmittenhöhe is right above the apartment — cable car valley station is 5 min from town. Panorama is the strongest alpine view on the trip without needing to drive deep into Hohe Tauern. NOTE: this card replaced the previous Schafbergspitze entry; Schafberg cog stops ~19:30 most evenings, so it's an honorable-mention day-trip from Gosau, not a sunset headliner.",
    practical:
      'Schmittenhöhe cable car summer schedule typically runs first UP ~08:30, last UP ~16:30, last DOWN ~17:00 — sunset rides need a CHECK against the day-of timetable. If the last gondola down is before 21:00 you need a backup descent plan (hike down ~2-3h or pre-book an evening special). Re-verify on schmitten.at.',
    pairsWithBefore:
      'Easy morning at the Aparthotel → late lunch at the Esplanade → cable car up around 16:00 → terrace walk + Elisabeth-Kapelle viewpoint → wait for sunset 20:52 → descent per the day-of timetable.',
    driveFromBases: {
      salzburg: '1h20',
      stWolfgang: '5 min to cable car',
      obertraun: '1h45',
      berchtesgaden: '1h30',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
      alt: 'Alpine peak panorama at golden hour — placeholder for Schmittenhöhe summit view',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Schafberg_1.jpg',
    },
    sunsetTimeSource: 'https://www.timeanddate.com/sun/austria/salzburg?month=7&year=2026',
  },
  {
    id: 'hallstatt-markt',
    rank: 3,
    tagline:
      'The painted-house postcard. Sunset turns the south wall of the village gold from across the lake, then alpenglow lights the Dachstein peaks behind. Day-trip from Gosau base (20 min).',
    tldr: 'The iconic Hallstatt shot at 20:50 — south-wall gold + alpenglow on the Dachstein.',
    tripNight: 'Wed Jul 29',
    tripNightDayId: 'wed-jul-29',
    sunsetTime: '20:50',
    whereYouWatch:
      'The Hallstatt Markt lakeside walkway at the southern end of the village — past the Skywalk funicular base, where the boathouses jut into the lake. Sunset light hits the painted south wall from across the water. For the classic postcard shot, walk 5 min further along the lake-edge promenade toward the Lahn cemetery.',
    whyThisOne:
      "You're standing INSIDE the postcard. Plus alpenglow: the Dachstein peaks east of the village catch pink for ~10 min AFTER the lake-level sunset, doubling the photo window. From Gosau, this is a 20-min drive — close enough to make a real evening of it.",
    practical:
      'Park at the P1 lot (paid, €11/day) and walk the lakeside path in — Hallstatt center is closed to non-resident cars 10:00-17:00 but the lots stay open later. P1 to the lakeside walkway is 12 min flat. Driving back to Gosau after sunset = 20 min, no transit dependency.',
    pairsWithBefore:
      'Pair with a Krippenstein cable-car day-trip earlier (descent by 18:00 to clear timing pressure) → late-afternoon Hallstatt arrival → Markt + Skywalk funicular at 17:00 (€20pp for 360° view) → walk down to the lakeside for sunset at 20:50.',
    driveFromBases: {
      salzburg: '75 min',
      stWolfgang: '~2h (via Bad Ischl)',
      obertraun: '20 min',
      berchtesgaden: '1h05',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Hallstat%2C_Sunset.jpg/1280px-Hallstat%2C_Sunset.jpg',
      alt: 'Hallstatt village at sunset, painted houses and lake-edge glowing gold',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hallstat,_Sunset.jpg',
    },
    sunsetTimeSource: 'https://www.timeanddate.com/sun/austria/salzburg?month=7&year=2026',
  },
  {
    id: 'krippenstein-5fingers',
    rank: 4,
    tagline:
      'Dachstein plateau, 2,063m, 5 Fingers cantilevered platform. Day-trip cable car from Gosau (~25 min drive). Iconic view BUT last gondola down 19:10 — sunset here means committing to descent timing.',
    tldr:
      "5 Fingers platform at 20:48 — day-trip from Gosau, but last gondola down is 19:10. Sunset here = descent risk.",
    tripNight: 'Wed Jul 29 (alt)',
    tripNightDayId: 'wed-jul-29',
    sunsetTime: '20:48',
    whereYouWatch:
      'From the 5 Fingers cantilevered viewing platform — five steel "fingers" jutting straight over the cliff on the Krippenstein plateau, ~15 min easy walk from the upper cable-car station. Omni-view across Hallstättersee (Hallstatt village far below) and the full Dachstein massif behind. Plateau is at 2,063m.',
    whyThisOne:
      'Most-photographed platform on the Dachstein. Day-trip cable car from Gosau (~25 min drive to valley station). Two gondola stages up to the plateau. The catch: this used to be the overnight pick (Lodge am Krippenstein), but the lodge went FULL Jul 29-30 and the day-trip framing means sunset 20:48 conflicts with the last gondola down at 19:10. Better as a mid-day day-trip with descent by 17:30, then Hallstatt for the actual sunset.',
    practical:
      'Cable car summer schedule: first UP 08:40, last UP ~18:45, last DOWN 19:10. Drive ~25 min from Gosau → cable car valley station. Two gondolas up, 15-min walk to 5 Fingers. RE-VERIFY the 2026 timetable before counting on any specific gondola time. If you stay for sunset 20:48, you commit to either: (a) the LAST gondola down at 19:10 (so you watch sunset earlier than the actual time) or (b) an emergency overnight in the lodge if a room frees up. Safer = day-trip with descent by 17:30, pair with Hallstatt sunset.',
    pairsWithBefore:
      'Morning at Gosau apartment → cable car up by 11:00 → 5 Fingers platform + ice cave walk + Welterbespirale viewpoint → descent by 17:30 → drive to Hallstatt for the actual sunset 20:50. Don\'t try to make Krippenstein 5 Fingers the sunset spot itself unless you confirm the 2026 evening gondola schedule.',
    driveFromBases: {
      salzburg: '1h30 (+ cable car)',
      stWolfgang: '2h (+ cable car)',
      obertraun: '25 min to cable car valley station',
      berchtesgaden: '1h25 (+ cable car)',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
      alt: '5 Fingers cantilevered viewing platform on the Dachstein Krippenstein plateau',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:A-Krippenstein-5fingers-2.jpg',
    },
    sunsetTimeSource: 'https://www.timeanddate.com/sun/austria/salzburg?month=7&year=2026',
  },
  {
    id: 'monchsberg-salzburg',
    rank: 5,
    tagline:
      "Mönchsberg ridge above the Salzburg apartment — old town spread below, fortress catching the light. The Shabbat-bracket sunset on Sat Jul 25 + the Thu Jul 30 close-out sunset before the airport hotel.",
    tldr:
      "Mönchsberg ridge at 20:54 — Shabbat-legal walk-up sunset from the Salzburg apartment.",
    tripNight: 'Sat Jul 25',
    tripNightDayId: 'sat-jul-25',
    sunsetTime: '20:54',
    whereYouWatch:
      'Walk up from Toscaninihof (Altstadt-side) or take the Mönchsberg-Aufzug (lift) at Anton-Neumayr-Platz. The ridge runs ~1 km along the top of the Old Town — best viewpoints are at the Museum der Moderne terrace and the Schloss Mönchstein lookout. Old town spreads below, fortress to the east catches the last light, Untersberg silhouette to the west.',
    whyThisOne:
      "Shabbat-legal — no driving, no boats, walk-up from the Linzergasse apartment in 15-20 min. The Salzburg-side sunset that bookends both the Shabbat half (Sat Jul 25) and the trip close-out (Thu Jul 30 if there's time before the airport hotel transfer). Doesn't compete with the lake-level views — different style, equally good.",
    practical:
      'Free walk-up via Toscaninihof or €4.10 round-trip via Mönchsberg-Aufzug lift (runs until 19:00 most days — last lift down may be before sunset, plan for the walk down). The ridge stays open after dusk; gentle paved path lit by streetlights.',
    pairsWithBefore:
      'Sat Jul 25: Shabbat lunch at Chabad → afternoon rest → leisurely walk up the Mönchsberg around 19:00 → sunset on the ridge → walk back to Linzergasse before Havdalah 21:49.',
    driveFromBases: {
      salzburg: '15 min walk',
      stWolfgang: '1h25',
      obertraun: '1h20',
      berchtesgaden: '15 min drive',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
      alt: 'Festung Hohensalzburg above the Salzburg Old Town at golden hour',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Salzburg_-_Festung_Hohensalzburg.JPG',
    },
    sunsetTimeSource: 'https://www.timeanddate.com/sun/austria/salzburg?month=7&year=2026',
  },
];

// =====================================================================
// Honorable mentions — sunset-2 alternates from NATURE_DESTINATIONS
// =====================================================================
interface HonorableMention {
  id: string;
  name: string;
  oneLine: string;
}

const HONORABLE_MENTIONS: HonorableMention[] = [
  {
    id: 'zeller-see-esplanade',
    name: 'Zeller See Esplanade (Zell am See town level)',
    oneLine:
      'Walk-from-base sunset on the Zell apartment night — lakeshore promenade, ~5 min from the Aparthotel. Default for the Sun Jul 26 arrival evening.',
  },
  {
    id: 'kitzsteinhorn-glacier',
    name: 'Kitzsteinhorn glacier (Kaprun, day-trip from Zell)',
    oneLine:
      '3,029m alpine sunset platform if the cable-car evening schedule cooperates — re-verify last-down timing before committing. 25 min drive from the Zell base.',
  },
  {
    id: 'schafberg-cog-daytrip',
    name: 'Schafberg summit · day-trip cog (no overnight)',
    oneLine:
      'Beautiful 1,732m panorama with 13 Salzkammergut lakes in one sweep — day-trip from Gosau (~50 min drive to St. Wolfgang valley station). Cog usually stops ~19:30 — sunset 20:48 means you watch the light go before descent, NOT the actual sun-touch-horizon moment.',
  },
  {
    id: 'attersee',
    name: 'Attersee (Nußdorf esplanade)',
    oneLine:
      "Austria's biggest entirely-domestic lake. West-shore villages have horizon-clear sunsets — no mountain blocking. From Gosau ~1h, from Zell ~1h45.",
  },
  {
    id: 'gosausee-east-shore',
    name: 'Vorderer Gosausee — east shore (alt angle)',
    oneLine:
      'Same lake as the #1 pick but from the opposite shore — different reflection geometry. 10-min loop swap if the west shore feels too crowded.',
  },
  {
    id: 'mirabell-gardens',
    name: 'Mirabell Gardens (Salzburg, Shabbat-legal walk)',
    oneLine:
      'Backup Salzburg sunset if the Mönchsberg ridge climb feels long — gardens are 5 min from the apartment, fortress visible from the rose garden.',
  },
  {
    id: 'salzach-elisabethkai',
    name: 'Salzach river bank (Elisabethkai)',
    oneLine:
      'Shabbat-legal sunset — no climbing, just the river bank with the Festung lit behind. Closest to the apartment.',
  },
];

// =====================================================================
// 7-night sunset chart — pulled from itinerary anchors
// =====================================================================
interface TripNightSunset {
  day: string;
  time: string;
  place: string;
  note?: string;
}

const TRIP_SUNSETS: TripNightSunset[] = [
  {
    day: 'Fri Jul 24',
    time: '20:55',
    place: 'Apartment / Chabad table (Salzburg)',
    note: "Candle-lighting 20:35 — you're inside for Shabbat by then.",
  },
  {
    day: 'Sat Jul 25',
    time: '20:54',
    place: 'Mönchsberg ridge above Salzburg',
    note: 'Pick #5 — Shabbat-legal walk-up. Havdalah 21:49.',
  },
  {
    day: 'Sun Jul 26',
    time: '20:53',
    place: 'Zeller See Esplanade (Zell am See arrival)',
    note: 'Honorable mention — walk-from-base, default arrival evening.',
  },
  {
    day: 'Mon Jul 27',
    time: '20:52',
    place: 'Schmittenhöhe peak above Zell am See',
    note: 'Pick #2 — alpine-half headliner. Re-verify evening gondola schedule.',
  },
  {
    day: 'Tue Jul 28',
    time: '20:51',
    place: 'Vorderer Gosausee — Dachstein mirror (Gosau arrival)',
    note: 'Pick #1 — 5-min walk from Der Ulmenhof, no transit dependency.',
  },
  {
    day: 'Wed Jul 29',
    time: '20:50',
    place: 'Hallstatt Markt lakeside walkway',
    note: 'Pick #3 — day-trip from Gosau (20 min). Pair with Krippenstein cable-car earlier in the day.',
  },
  {
    day: 'Thu Jul 30',
    time: '20:48',
    place: 'Salzburg airport hotel area / Mönchsberg if Thu afternoon stays open',
    note: 'Move-day to airport hotel + car drop. Quiet sunset by default.',
  },
];

// =====================================================================
// Render helpers
// =====================================================================
function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pickCard(p: SunsetPick, dest: NatureDestination | undefined): string {
  const natureLink = dest ? `nature-destinations.html#${p.id}` : 'nature-destinations.html';
  const regionLabel = dest
    ? dest.region === 'berchtesgaden'
      ? 'Berchtesgaden · DE'
      : dest.region === 'salzkammergut'
        ? 'Salzkammergut · AT'
        : 'Hohe Tauern · AT'
    : '';

  const sunsetLabel = dest?.name ?? p.id;
  const pickBtnHtml = pickButtonOverlay(p.id, 'sunset', sunsetLabel);

  return `
    <article class="sunset-card" id="sunset-${p.id}" data-pick-card-id="${p.id}" data-pick-card-type="sunset">
      <div class="sunset-card-photo">
        <img
          src="${escape(p.heroPhoto.src)}"
          alt="${escape(p.heroPhoto.alt)}"
          loading="lazy"
        />
        ${pickBtnHtml}
        <div class="sunset-card-rank">#${p.rank}</div>
        <div class="sunset-card-region">${escape(regionLabel)}</div>
        <div class="sunset-card-verified">Verified 2026-05-16</div>
        <div class="sunset-card-photo-credit">
          <a href="${escape(p.heroPhoto.sourceUrl)}" target="_blank" rel="noreferrer noopener"
            >Photo: ${escape(p.heroPhoto.credit)}</a
          >
        </div>
      </div>

      <div class="sunset-card-body">
        <div class="sunset-card-tldr"><strong>TL;DR</strong> · ${escape(p.tldr)}</div>

        <h2 class="sunset-card-name">${escape(dest?.name ?? p.id)}</h2>

        <p class="sunset-card-tagline">${escape(p.tagline)}</p>

        <div class="sunset-card-meta">
          <div class="sunset-time-block">
            <div class="sunset-time-label">Sunset · ${escape(p.tripNight)}</div>
            <div class="sunset-time-value">${escape(p.sunsetTime)}</div>
            <a
              class="sunset-time-source"
              href="${escape(p.sunsetTimeSource)}"
              target="_blank"
              rel="noreferrer noopener"
              >timeanddate.com →</a
            >
          </div>
          <div class="sunset-why-block">
            <div class="sunset-section-label">Why this one</div>
            <p>${escape(p.whyThisOne)}</p>
          </div>
        </div>

        <div class="sunset-section">
          <div class="sunset-section-label">Where you watch FROM</div>
          <p>${escape(p.whereYouWatch)}</p>
        </div>

        <div class="sunset-section">
          <div class="sunset-section-label">Practical · parking · last return</div>
          <p>${escape(p.practical)}</p>
        </div>

        <div class="sunset-section">
          <div class="sunset-section-label">Pairs with · what to do BEFORE</div>
          <p>${escape(p.pairsWithBefore)}</p>
        </div>

        <div class="sunset-drive-grid">
          <div class="sunset-drive-label">Drive from base (v4 bases)</div>
          <div class="sunset-drive-cells">
            <div class="sunset-drive-cell">
              <strong>Salzburg</strong><span>${escape(p.driveFromBases.salzburg)}</span>
            </div>
            <div class="sunset-drive-cell">
              <strong>Zell am See</strong><span>${escape(p.driveFromBases.stWolfgang)}</span>
            </div>
            <div class="sunset-drive-cell">
              <strong>Gosau</strong><span>${escape(p.driveFromBases.obertraun)}</span>
            </div>
            <div class="sunset-drive-cell">
              <strong>Airport</strong><span>${escape(p.driveFromBases.berchtesgaden)}</span>
            </div>
          </div>
        </div>

        <div class="sunset-card-links">
          <a href="${escape(natureLink)}">Full entry on Nature →</a>
          ${
            dest?.links.official
              ? `<a href="${escape(dest.links.official)}" target="_blank" rel="noreferrer noopener"
                  >Official site →</a
                >`
              : ''
          }
          ${
            dest
              ? `<a href="${escape(dest.links.wikipedia)}" target="_blank" rel="noreferrer noopener"
                  >Wikipedia →</a
                >`
              : ''
          }
          <a href="itinerary.html#${escape(p.tripNightDayId)}">Itinerary · ${escape(p.tripNight)} →</a>
          <a class="video-search-chip" href="https://www.youtube.com/results?search_query=${encodeURIComponent((dest?.name ?? p.id) + ' sunset Austria')}" target="_blank" rel="noreferrer noopener" aria-label="Search YouTube videos of ${escape(dest?.name ?? p.id)}">🎥 Videos</a>
        </div>
      </div>
    </article>
  `;
}

function renderPicks(): string {
  const byId: Map<string, NatureDestination> = new Map(
    NATURE_DESTINATIONS.map((d) => [d.id, d] as [string, NatureDestination]),
  );
  return PICKS.map((p) => pickCard(p, byId.get(p.id))).join('');
}

function renderHonorableMentions(): string {
  const items = HONORABLE_MENTIONS.map(
    (m) => `
      <li class="honorable-item">
        <div class="honorable-name">${escape(m.name)}</div>
        <div class="honorable-line">${escape(m.oneLine)}</div>
      </li>
    `,
  ).join('');

  return `
    <div class="eyebrow">Honorable mentions · 6 alternates</div>
    <h2>Other sunset spots worth knowing</h2>
    <p class="lead-block">
      Not Tara-Bridge tier but still worth the detour — especially if weather, tiredness, or kosher
      timing rules out the top 5 on a given night. The Obertraun-dock + Mönchsberg-ridge picks are
      the "no plan required" defaults already built into the
      <a href="itinerary.html">Itinerary</a>.
    </p>
    <ul class="honorable-list">${items}</ul>
  `;
}

function renderSunsetTape(): string {
  const rows = TRIP_SUNSETS.map(
    (t) => `
      <div class="tape-row">
        <div class="tape-day">${escape(t.day)}</div>
        <div class="tape-time">${escape(t.time)}</div>
        <div class="tape-place">${escape(t.place)}</div>
        <div class="tape-note">${t.note ? escape(t.note) : ''}</div>
      </div>
    `,
  ).join('');

  return `
    <div class="eyebrow">7-night sunset tape</div>
    <h2>Every sunset on the trip — at a glance</h2>
    <p class="lead-block">
      The exact sunset time and the planned spot for every night Fri Jul 24 → Thu Jul 30. Times
      from <a href="https://www.timeanddate.com/sun/austria/salzburg" target="_blank" rel="noreferrer noopener"
        >timeanddate.com (Salzburg)</a
      > — Berchtesgaden times are within ~1 min of Salzburg, so this chart applies for both.
    </p>
    <div class="sunset-tape">
      <div class="tape-row tape-head">
        <div class="tape-day">Day</div>
        <div class="tape-time">Sunset</div>
        <div class="tape-place">Where</div>
        <div class="tape-note">Note</div>
      </div>
      ${rows}
    </div>
  `;
}

function renderPage(): void {
  const root = document.getElementById('sunsets-root');
  if (root) root.innerHTML = renderPicks();

  const honorable = document.getElementById('honorable-mentions');
  if (honorable) honorable.innerHTML = renderHonorableMentions();

  const tape = document.getElementById('sunset-tape');
  if (tape) tape.innerHTML = renderSunsetTape();
}

renderPage();
initNotesWidget();
initChatPlanPopup();
initSharedShortlist();
