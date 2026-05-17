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

const PICKS: SunsetPick[] = [
  {
    id: 'konigssee',
    rank: 1,
    tagline:
      'The silent electric boat returns from St. Bartholomä as the Watzmann east wall goes gold and the lake goes silver. The Tara-Bridge moment of the trip.',
    tldr: 'On the last electric boat back at 20:50 — Watzmann gold, lake silver, no engine sound.',
    tripNight: 'Tue Jul 28',
    tripNightDayId: 'tue-jul-28',
    sunsetTime: '20:50',
    whereYouWatch:
      "ON the last electric boat returning from St. Bartholomä to Schönau. Sit on the LEFT (east) side of the boat — that's where the Watzmann face is. Boat is silent (1909 no-combustion rule), so the sunset arrives with no engine noise. Stay on the boat all the way back.",
    whyThisOne:
      "Tara-Bridge tier. The combination of fjord-shaped lake + silent boat + 2,000m east wall lit head-on by the setting sun is unrepeatable anywhere else. The trip's named peak-moment in trip-data.ts (tarabridgeMoment).",
    practical:
      'Last boat from St. Bartholomä back to Schönau departs ~19:30 (summer 2025 schedule — re-verify with seenschifffahrt.de for 2026). Buy the FULL round-trip-to-Salet ticket €24pp at the dock. Free parking at Schönau lot opens 06:00. Parking gets tight after 09:30 — arrive early.',
    pairsWithBefore:
      'Morning boat at 10:00 to Salet → 20-min flat walk to Obersee → picnic at the back of the fjord → boat back via St. Bartholomä on the late return. The whole day chains naturally to put you on the right boat at the right hour.',
    driveFromBases: {
      obertraun: '90 min',
      berchtesgaden: '10 min',
      stWolfgang: '85 min',
      salzburg: '35 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/St._Bartholom%C3%A4_am_K%C3%B6nigssee_-_Cloudy_Evening_-_panoramio.jpg/1280px-St._Bartholom%C3%A4_am_K%C3%B6nigssee_-_Cloudy_Evening_-_panoramio.jpg',
      alt: 'St. Bartholomä church on the Königssee at evening, Watzmann east wall behind',
      credit: 'Wikimedia Commons / panoramio, CC BY-SA',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:St._Bartholom%C3%A4_am_K%C3%B6nigssee_-_Cloudy_Evening_-_panoramio.jpg',
    },
    sunsetTimeSource: 'https://www.timeanddate.com/sun/germany/berchtesgaden?month=7&year=2026',
  },
  {
    // Pivoted 2026-05-17 from Schafbergspitze → Lodge am Krippenstein. Same trip
    // night, better hotel, same valley as Obertraun base, cantilevered 5 Fingers
    // platform on the same plateau is the actual sunset spot. Full runbook on
    // krippenstein.html. Schafbergspitze.html kept as superseded archive.
    id: 'krippenstein-5fingers',
    rank: 2,
    tagline:
      'Dachstein plateau, 2,063m, 5 Fingers cantilevered viewing deck. Omni-view across Hallstättersee + the full Dachstein massif. Modern lodge, Zirben-pine beds, cards accepted, books online.',
    tldr: 'Lodge am Krippenstein summit night → 5 Fingers platform at 20:48. Same valley as our base.',
    tripNight: 'Wed Jul 29',
    tripNightDayId: 'wed-jul-29',
    sunsetTime: '20:48',
    whereYouWatch:
      'From the 5 Fingers cantilevered viewing platform — five steel "fingers" jutting straight over the cliff on the Krippenstein plateau, ~15 min easy walk from Lodge am Krippenstein. Omni-view across Hallstättersee (the painted village far below) and the full Dachstein massif behind. Plateau is at 2,063m.',
    whyThisOne:
      'Summit + omni-view + zero routing detour. The Dachstein Krippenstein cable car (two gondola stages, every 15 min) does the climbing from a 10-min drive from our Obertraun base. Lodge has 9.2/10 reviews, takes cards, books on Booking.com. The 5 Fingers platform is the photographer-famous spot. Only summit sunset on this trip.',
    practical:
      'OVERNIGHT-GUEST path (your locked plan): cable car summer schedule first UP 08:40, last UP ~18:45, last DOWN 19:10. Drive ~10 min from Obertraun → cable car valley station. Two gondolas up, ~10 min walk to the lodge, drop bag, 15 min walk to 5 Fingers for sunset 20:48. Sleep on Zirben-pine beds at 2,063m, sunrise 05:30 on the Dachstein, first cable car down 08:40. Book on Booking.com or email stay@lodge.at. Full runbook: krippenstein.html.',
    pairsWithBefore:
      'Slow morning at the Obertraun apartment → pack one overnight bag each + kosher dinner → mid-afternoon drive to cable car valley station → cable car up by 16:00-17:00 → check into the lodge → easy plateau walk → 5 Fingers platform by 20:15 → sunset.',
    driveFromBases: {
      obertraun: '10 min to cable car base',
      berchtesgaden: '100 min',
      stWolfgang: '50 min',
      salzburg: '85 min',
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
    id: 'hallstatt-markt',
    rank: 3,
    tagline:
      'The painted-house postcard. Sunset turns the south wall of the village gold from across the lake, then alpenglow lights the Dachstein peaks behind.',
    tldr: 'The iconic Hallstatt shot at 20:51 — south-wall gold + alpenglow on the Dachstein.',
    tripNight: 'Mon Jul 27',
    tripNightDayId: 'mon-jul-27',
    sunsetTime: '20:51',
    whereYouWatch:
      'The Hallstatt Markt lakeside walkway at the southern end of the village — past the Skywalk funicular base, where the boathouses jut into the lake. Sunset light hits the painted south wall from across the water. For the classic postcard shot, walk 5 min further along the lake-edge promenade toward the Lahn cemetery.',
    whyThisOne:
      "You're standing INSIDE the postcard. No drive, no boat — the village itself is the sunset frame. Plus alpenglow: the Dachstein peaks east of the village catch pink for ~10 min AFTER the lake-level sunset, doubling the photo window.",
    practical:
      'Park at the P1 lot (paid, €11/day) and walk the lakeside path in — Hallstatt center is closed to non-resident cars 10:00-17:00 but the lots stay open later. P1 to the lakeside walkway is 12 min flat. Last bus from Hallstatt back to Obertraun is the 542, ~22:00 (driving back to Obertraun is 10 min if you have the rental).',
    pairsWithBefore:
      'Dachstein 5fingers gondolas earlier in the day (10:00 up, 14:00 down) → late-afternoon Hallstatt arrival → Markt + Skywalk funicular at 17:00 (€20pp for 360° view) → walk down to the lakeside for sunset at 20:51.',
    driveFromBases: {
      obertraun: '5 min',
      berchtesgaden: '90 min',
      stWolfgang: '45 min',
      salzburg: '75 min',
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
    id: 'hintersee-ramsau',
    rank: 4,
    tagline:
      'Photographer-famous: tiny tree-islets reflect on glass water, the Hochkalter peak goes alpenglow-pink behind. Five minutes of walking gets you the cover-of-the-magazine angle.',
    tldr: "Mirror lake + tree islets + Hochkalter alpenglow. The photographer's sunset.",
    tripNight: 'Alternate (any night based in Berchtesgaden)',
    tripNightDayId: 'tue-jul-28',
    sunsetTime: '20:50',
    whereYouWatch:
      'NORTH SHORE of the Hintersee, from the small parking lot/lakeside path at Seeklause restaurant. Walk 3 min left along the shore — the tree-islets reflect in the foreground, Hochkalter peak (2,607m) catches alpenglow behind. The PhotoHound-famous angle. NO climb required.',
    whyThisOne:
      "Most-photographed sunset spot in the Bavarian Alps. The combination of glassy mountain lake + tree islets in the foreground + Hochkalter alpenglow behind is what made it photographer-famous. If Königssee is the trip's movie scene, Hintersee is the trip's framed print.",
    practical:
      "Free parking at the north-shore Seeklause lot (~25 spots). Fills on summer weekends — arrive before 18:00. No public transport back after 20:00. If you're based in Berchtesgaden, this is a 15-min drive; from Obertraun it's 105 min (long, not a same-day swap).",
    pairsWithBefore:
      'Afternoon walk in Ramsau village (the painted Bavarian church at Sankt Sebastian is 5 min away) → coffee at Seeklause → 1km flat loop around the lake → settle at the north shore for sunset at 20:50.',
    driveFromBases: {
      obertraun: '105 min',
      berchtesgaden: '15 min',
      stWolfgang: '95 min',
      salzburg: '50 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Hintersee-Hochkalter.jpg/1280px-Hintersee-Hochkalter.jpg',
      alt: 'Hintersee at Ramsau with the Hochkalter peak reflected on glass water',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hintersee-Hochkalter.jpg',
    },
    sunsetTimeSource: 'https://www.timeanddate.com/sun/germany/berchtesgaden?month=7&year=2026',
  },
  {
    id: 'gosausee',
    rank: 5,
    tagline:
      "The Dachstein glacier mirror-reflects in the lake from the west shore. Sunset here is the soft golden version — gentler than the others, but it's the locked Sunday-evening spot.",
    tldr: 'Glacier reflection at 20:53. Locked into Sun Jul 26 — the welcome-to-Hallstatt sunset.',
    tripNight: 'Sun Jul 26',
    tripNightDayId: 'sun-jul-26',
    sunsetTime: '20:53',
    whereYouWatch:
      'WEST shore of Vorderer Gosausee, ~15 min along the flat gravel loop from the parking lot. The Dachstein glacier sits east-southeast — at sunset its face catches alpenglow while the lake holds the reflection. Stand where the gravel path meets the lake edge for the full mirror shot.',
    whyThisOne:
      "Not the strongest WEST-horizon sunset of the five (Hochkalter and Watzmann are bigger walls), but it's the LOCKED Day-3 sunset and the gentlest entry-point — flat gravel loop, stroller-friendly, no last-boat anxiety. The Sunday-evening unwind after Shabbat in Salzburg.",
    practical:
      'Free parking at Gosausee main lot (P1). Lot stays open all night. The lake loop is a flat 1-hour walk — you can be at the west shore in 15 min and back at the car in 15 min after sunset. No transit dependency.',
    pairsWithBefore:
      'Pack out of Salzburg post-Shabbat → coffee + Spar restock in Bad Ischl → arrive Gosausee 18:00 → slow flat loop around the lake → west-shore spot by 20:30 → sunset at 20:53 → 35-min drive on to Obertraun apartment.',
    driveFromBases: {
      obertraun: '35 min',
      berchtesgaden: '95 min',
      stWolfgang: '50 min',
      salzburg: '80 min',
    },
    heroPhoto: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
      alt: 'Vorderer Gosausee with the Dachstein massif reflected in still water (July 2012)',
      credit: 'Wikimedia Commons, CC BY-SA',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gosausee_Dachstein_July_2012.jpg',
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
    id: 'attersee',
    name: 'Attersee (Nußdorf esplanade)',
    oneLine:
      "Austria's biggest entirely-domestic lake. West-shore villages have horizon-clear sunsets — no mountain blocking. Strongest pick if you want the OPEN-water version.",
  },
  {
    id: 'wolfgangsee-village',
    name: 'St. Wolfgang am Wolfgangsee (village level)',
    oneLine:
      'Lakeside promenade sunset — pair with the Schafbergbahn day if you skip the summit cog. Gentler than the summit version.',
  },
  {
    id: 'schafberg-daytrip',
    name: 'Schafberg summit · day-trip cog (no overnight)',
    oneLine:
      'Still a beautiful panorama from 1,783m — 13 Salzkammergut lakes in one sweep. Day-trip only since we pivoted the summit-sleep night to Lodge am Krippenstein. Cog from St. Wolfgang.',
  },
  {
    id: 'grossglockner-road',
    name: 'Grossglockner High Alpine Road pull-offs',
    oneLine:
      'Drive-up overlooks at 2,500m face west into the Hohe Tauern. Best done as part of the full glacier-road day (€46.50 toll).',
  },
  {
    id: 'obertraun-dock',
    name: 'Obertraun dock on Hallstättersee',
    oneLine:
      'The "balcony" sunset — 5 min from the Obertraun apartment, no plan required. Default Plan-B sunset for any tired evening.',
  },
  {
    id: 'monchsberg-ridge',
    name: 'Mönchsberg ridge above Salzburg',
    oneLine:
      'The Salzburg-side sunset — walk up from Toscaninihof at golden hour, ridge-walk along the top of the old town. Built into the Thu Jul 30 evening.',
  },
  {
    id: 'salzach-elisabethkai',
    name: 'Salzach river bank (Elisabethkai)',
    oneLine:
      'Shabbat-legal sunset — no driving, no climbing, just the river bank with the Festung lit behind. The Sat Jul 25 sunset.',
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
    place: 'Apartment / Chabad table',
    note: "Candle-lighting 20:35 — you're inside for Shabbat by then.",
  },
  {
    day: 'Sat Jul 25',
    time: '20:54',
    place: 'Salzach river bank (Elisabethkai)',
    note: 'Havdalah 21:49.',
  },
  {
    day: 'Sun Jul 26',
    time: '20:53',
    place: 'Vorderer Gosausee west shore → Obertraun dock',
    note: 'Pick #5 — locked.',
  },
  {
    day: 'Mon Jul 27',
    time: '20:51',
    place: 'Hallstatt Markt lakeside walkway',
    note: 'Pick #3 — locked.',
  },
  {
    day: 'Tue Jul 28',
    time: '20:50',
    place: 'On the last electric boat from St. Bartholomä',
    note: 'Pick #1 — the Tara-Bridge moment.',
  },
  {
    day: 'Wed Jul 29',
    time: '20:48',
    place: '5 Fingers platform · Lodge am Krippenstein',
    note: 'Pick #2 — book the lodge ahead (pivoted from Schafbergspitze 2026-05-17).',
  },
  { day: 'Thu Jul 30', time: '20:47', place: 'Mönchsberg ridge above Salzburg' },
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
          <div class="sunset-drive-label">Drive from base</div>
          <div class="sunset-drive-cells">
            <div class="sunset-drive-cell">
              <strong>Obertraun</strong><span>${escape(p.driveFromBases.obertraun)}</span>
            </div>
            <div class="sunset-drive-cell">
              <strong>Berchtesgaden</strong><span>${escape(p.driveFromBases.berchtesgaden)}</span>
            </div>
            <div class="sunset-drive-cell">
              <strong>St. Wolfgang</strong><span>${escape(p.driveFromBases.stWolfgang)}</span>
            </div>
            <div class="sunset-drive-cell">
              <strong>Salzburg</strong><span>${escape(p.driveFromBases.salzburg)}</span>
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
