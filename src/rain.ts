// ===========================================================================
// rain.ts — renders rain.html: WHAT TO DO WHEN IT RAINS, per base.
//
// Why (Allison, Jul 23): "make a great rainy day page for each area."
// Shape: same four beds as bases.html, but the question is different —
//   not "what's best" but "what still works wet." Two honest categories:
//   DRY (you are genuinely indoors) and WET-OK (outdoors, but rain does not
//   ruin it — gorges, waterfalls and covered boats are BETTER in rain).
//
// Sourcing, three tiers, and the page says which is which:
//   • places already in plan-data.ts → verified Jul 17 2026, times reused.
//   • new places → drive times measured via Google Maps 2026-07-23.
//   • hours/prices I could NOT confirm for 2026 → marked "confirm hours".
// Known closure: Salzwelten HALLSTATT is shut for renovation into summer
//   2026 — Altaussee is the working mine. Do not send her to a closed door.
// ===========================================================================

import { BUILD_STAMP, SITES, byId } from './plan-data.js';
import { mountNotes } from './notes.js';

type Dryness = 'dry' | 'wet-ok';

interface RainPick {
  /** plan-data id — name / maps / website reused from there when present. */
  id?: string;
  /** For places not in plan-data: name + maps link supplied here. */
  name?: string;
  maps?: string;
  site?: string;
  emoji?: string;
  /** Drive minutes from THIS base. 0 = you do not leave the apartment. */
  min: number;
  dryness: Dryness;
  why: string;
  /** True when 2026 hours/prices are NOT confirmed — say so, never fake it. */
  check?: boolean;
}

interface RainBase {
  n: number;
  name: string;
  dates: string;
  /** The one-line honest read on this base in bad weather. */
  verdict: string;
  picks: RainPick[];
}

const G = (q: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const BASES: RainBase[] = [
  {
    n: 1,
    name: 'Bad Goisern',
    dates: 'Fri 24 → Sun 26',
    verdict:
      'The best-covered base of the trip — a working salt mine, a memorial tunnel and a covered boat are all inside half an hour. A wet day here costs you nothing.',
    picks: [
      {
        id: 'grundlsee-3lakes',
        min: 25,
        dryness: 'wet-ok',
        why: 'Your own plan calls this “magic in any weather” — and it is right. You are sitting the whole way, the cliffs and waterfalls of the Toplitzsee look better wet, and low cloud on the water is the whole mood.',
      },
      {
        name: 'Salzwelten Altaussee — salt mine',
        emoji: '⛏️',
        maps: G('Salzwelten Altaussee'),
        site: 'https://www.salzwelten.at/en/altaussee',
        min: 26,
        dryness: 'dry',
        why: 'Austria’s biggest working salt mine — deep inside the mountain, wooden miners’ slides, the underground salt lake. About 10°C all year, so bring a layer. Weather becomes irrelevant the moment you are in.',
        check: true,
      },
      {
        id: 'ebensee',
        min: 25,
        dryness: 'dry',
        why: 'You walk into the actual tunnel the prisoners dug — entirely inside the mountain. 8°C, so layers either way. Closed Mondays.',
      },
      {
        name: 'Bad Ischl — Kaiservilla + Café Zauner',
        emoji: '☕',
        maps: G('Kaiservilla Bad Ischl'),
        site: 'https://www.kaiservilla.at/',
        min: 12,
        dryness: 'dry',
        why: 'The emperor’s summer villa, seen on an indoor guided tour, then the imperial-era café that made the town famous. The classic Salzkammergut wet-day move — and your grocery stop is right there.',
        check: true,
      },
    ],
  },
  {
    n: 2,
    name: 'Zell am See',
    dates: 'Sun 26 → Tue 28',
    verdict:
      'The isolated one. Everything Salzkammergut is 2 hours away from here, so a wet Zell day has to be solved locally — and the spa is the answer it was built for.',
    picks: [
      {
        id: 'tauern-spa',
        min: 11,
        dryness: 'dry',
        why: 'This is what this place exists for. Indoor and outdoor pools facing the Kitzsteinhorn — being warm in water while it pours is better than the sunny version. Pools to 21:00. Swimsuit pools; just skip the separate sauna wing.',
      },
      {
        id: 'sigmund-thun',
        min: 12,
        dryness: 'wet-ok',
        why: 'A boardwalk bolted above a glacier torrent — you were going to get wet in there anyway, and the gorge is at its loudest and fullest in rain. About an hour, then dry off at the spa.',
      },
      {
        id: 'krimml-apc',
        min: 70,
        dryness: 'wet-ok',
        why: 'Rain makes Austria’s tallest waterfall bigger, not worse. The path is mist-soaked on a sunny day regardless — bring a shell and the falls do not care. The 1947 memorial at the valley head is quiet and yours in bad weather.',
      },
      {
        id: 'kitzsteinhorn',
        min: 15,
        dryness: 'dry',
        why: 'Only worth it if the cloud base is BELOW the summit — then you ride up through the weather into sun, and the ice grotto, cinema lounge and summit galleries are all indoors. Check the webcam first: if it is socked in at the top, the view is the entire point, so save it.',
      },
    ],
  },
  {
    n: 3,
    name: 'Gosau',
    dates: 'Tue 28 → Thu 30',
    verdict:
      'You booked a house with a Finnish sauna, an infrared spa and a full oven. On a wet Gosau day the right answer is genuinely to not get in the car.',
    picks: [
      {
        name: 'Stay in — sauna, spa, and the oven',
        emoji: '🏠',
        maps: G('Transylvania Villa & Spa Gosau'),
        site: 'https://www.booking.com/hotel/at/transylvania-villa-spa.html',
        min: 0,
        dryness: 'dry',
        why: 'Of the four places you sleep, this is the only one with its own sauna and spa — and the only full kitchen with an oven. A rainy day here is not a write-off, it is the reason you booked it. Cook something long.',
      },
      {
        name: 'Salzwelten Altaussee — salt mine',
        emoji: '⛏️',
        maps: G('Salzwelten Altaussee'),
        site: 'https://www.salzwelten.at/en/altaussee',
        min: 39,
        dryness: 'dry',
        why: 'Same mine as from Goisern, 13 minutes further. Underground, ~10°C, entirely weather-proof. Note the Hallstatt mine next door is shut for renovation — this is the one that runs.',
        check: true,
      },
      {
        name: 'Bad Ischl — Kaiservilla + Café Zauner',
        emoji: '☕',
        maps: G('Kaiservilla Bad Ischl'),
        site: 'https://www.kaiservilla.at/',
        min: 29,
        dryness: 'dry',
        why: 'Indoor villa tour, imperial café, covered streets. The obvious wet-day town from Gosau, and it doubles as the restock run.',
        check: true,
      },
      {
        id: 'ebensee',
        min: 42,
        dryness: 'dry',
        why: 'Inside the mountain, 8°C, closed Mondays. Further from here than from Goisern — worth it only if the whole day is written off.',
      },
      {
        id: 'grundlsee-3lakes',
        min: 50,
        dryness: 'wet-ok',
        why: 'Covered boats, better in bad light. Fifty minutes each way from Gosau though — if the rain is Tuesday or Sunday, do it from Goisern instead.',
      },
    ],
  },
  {
    n: 4,
    name: 'Wals — by Salzburg airport',
    dates: 'Thu 30 → Fri 31',
    verdict:
      'The safest base of all in bad weather: you are 17 minutes from a city built for rainy afternoons, and a second salt mine sits 24 minutes the other way.',
    picks: [
      {
        name: 'Haus der Natur',
        emoji: '🦖',
        maps: G('Haus der Natur Museumsplatz Salzburg'),
        site: 'https://www.hausdernatur.at/en',
        min: 17,
        dryness: 'dry',
        why: 'Four floors, two buildings, an aquarium and a hands-on science centre — the single biggest indoor block of time in Salzburg. Plan hours, not minutes. It closes at 17:00, so go early.',
        check: true,
      },
      {
        name: 'Salzbergwerk Berchtesgaden — salt mine',
        emoji: '⛏️',
        maps: G('Salzbergwerk Berchtesgaden'),
        site: 'https://www.salzbergwerk.de/en/',
        min: 24,
        dryness: 'dry',
        why: 'You ride a miners’ train into the mountain, slide down polished wooden slides and cross an underground salt lake by raft. Overalls provided. Completely indifferent to the weather.',
        check: true,
      },
      {
        name: 'DomQuartier — cathedral + Residenz state rooms',
        emoji: '🏛️',
        maps: G('DomQuartier Salzburg'),
        site: 'https://www.domquartier.at/en/',
        min: 15,
        dryness: 'dry',
        why: 'One ticket walks you through the prince-archbishops’ state rooms, the cathedral terraces and the monastery gallery — all connected, all under a roof. Allow about 1.5 hours.',
        check: true,
      },
      {
        name: 'Hohensalzburg fortress',
        emoji: '🏰',
        maps: G('Festung Hohensalzburg'),
        site: 'https://www.salzburg-burgen.at/en/hohensalzburg-fortress/',
        min: 15,
        dryness: 'dry',
        why: 'Austria’s oldest funicular takes 54 seconds to lift you off the wet street, and the fortress interior — state rooms, museums, the marionette collection — is all indoors. The view is a bonus, not the point.',
        check: true,
      },
      {
        id: 'chiemsee',
        min: 42,
        dryness: 'dry',
        why: 'The steamer is covered and the palace tour is indoors — Ludwig II’s hall of mirrors does not need sunshine. The one rainy option here that fills an entire day.',
      },
      {
        id: 'hellbrunn',
        min: 15,
        dryness: 'wet-ok',
        why: 'Honestly funnier in the rain: the whole garden is designed to soak you, so arriving already wet removes the only downside. The palace interior is dry if you want a break.',
      },
    ],
  },
];

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  html?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function driveLabel(min: number): string {
  if (min === 0) return 'stay in';
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
}

function band(min: number): string {
  if (min <= 15) return 'near';
  if (min <= 45) return 'mid';
  return 'far';
}

/** Name / maps / website: from plan-data when the pick names an id. */
function resolve(p: RainPick): { name: string; emoji: string; maps: string; site?: string } | null {
  if (p.id) {
    const a = byId.get(p.id);
    if (!a) return null;
    return { name: a.name, emoji: a.emoji, maps: a.maps, site: SITES[p.id] };
  }
  if (!p.name || !p.maps) return null;
  return { name: p.name, emoji: p.emoji ?? '•', maps: p.maps, site: p.site };
}

function pickRow(p: RainPick): HTMLElement {
  const row = el('li', 'bp');
  const r = resolve(p);
  if (!r) {
    // Fail loud — a broken entry shows itself rather than vanishing.
    row.appendChild(el('p', 'bp-why', `⚠ unresolvable rainy-day entry: ${esc(p.id ?? p.name ?? '?')}`));
    return row;
  }

  row.appendChild(el('span', 'bp-rank', p.dryness === 'dry' ? '☂' : '💧'));

  const head = el('div', 'bp-head');
  const link = el('a', 'bp-name', `${r.emoji} ${esc(r.name)}`);
  (link as HTMLAnchorElement).href = r.maps;
  (link as HTMLAnchorElement).target = '_blank';
  (link as HTMLAnchorElement).rel = 'noopener';
  head.appendChild(link);

  const tags = el('span', 'bp-tags');
  tags.appendChild(
    p.dryness === 'dry'
      ? el('span', 'bt bt-dry', 'indoors')
      : el('span', 'bt bt-wet', 'fine wet'),
  );
  if (p.check) tags.appendChild(el('span', 'bt bt-check', 'confirm hours'));
  head.appendChild(tags);
  row.appendChild(head);

  row.appendChild(el('span', `bp-drive bp-${band(p.min)}`, `🚗 ${esc(driveLabel(p.min))}`));
  row.appendChild(el('p', 'bp-why', esc(p.why)));

  if (r.site) {
    const links = el('p', 'bp-links');
    const web = el('a', undefined, '↗ Website');
    (web as HTMLAnchorElement).href = r.site;
    (web as HTMLAnchorElement).target = '_blank';
    (web as HTMLAnchorElement).rel = 'noopener';
    links.appendChild(web);
    row.appendChild(links);
  }

  return row;
}

function baseSection(b: RainBase): HTMLElement {
  const sec = el('section', 'bbase');

  const head = el('div', 'bbase-head');
  head.appendChild(el('span', 'bbase-num', String(b.n)));
  const ht = el('div', 'bbase-ht');
  ht.appendChild(el('h2', undefined, esc(b.name)));
  ht.appendChild(el('p', 'bbase-lodging', esc(b.dates)));
  head.appendChild(ht);
  sec.appendChild(head);

  sec.appendChild(el('p', 'bbase-reality', esc(b.verdict)));

  const list = el('ol', 'bpicks');
  b.picks.forEach((p) => list.appendChild(pickRow(p)));
  sec.appendChild(list);

  return sec;
}

function render(): void {
  const root = document.getElementById('rain');
  if (!root) return;

  const wrap = el('div', 'bwrap');

  const intro = el('header', 'bintro');
  intro.appendChild(el('p', 'bkick', 'when the forecast turns · one list per base'));
  intro.appendChild(el('h1', 'rain-h1', 'Rainy day'));
  intro.appendChild(
    el(
      'p',
      undefined,
      'What still works when it pours, from wherever you are sleeping. ☂ means genuinely indoors; 💧 means outdoors but the rain does not ruin it — gorges, waterfalls and covered boats are better wet.',
    ),
  );
  wrap.appendChild(intro);

  const caveat = el('details', 'bcaveat');
  caveat.innerHTML = `
    <summary>One closure worth knowing + where these facts came from<span aria-hidden="true">＋</span></summary>
    <div class="bcaveat-body">
      <p><b>The Hallstatt salt mine is shut.</b> Salzwelten Hallstatt is closed for renovation into summer 2026, so it is deliberately not listed — <a href="https://www.salzwelten.at/en/altaussee" target="_blank" rel="noopener">Salzwelten Altaussee</a> is the working mine and is where they shuttle visitors. Check it has actually reopened before driving to Hallstatt for salt.</p>
      <p>Drive times for places already in your plan are the verified ones. New places here were measured on Google Maps on 23 Jul 2026.</p>
      <p>Anything tagged <b>confirm hours</b> means I could not verify its 2026 opening times or price — the link is there, ring or check before you drive. Everything else comes from your own verified plan.</p>
    </div>
  `;
  wrap.appendChild(caveat);

  BASES.forEach((b) => wrap.appendChild(baseSection(b)));

  root.appendChild(wrap);

  const foot = document.getElementById('rain-foot');
  if (foot) {
    foot.innerHTML = `wet-weather fallbacks · built ${BUILD_STAMP} · <a href="bases.html">from your bed →</a>`;
  }

  mountNotes();
}

render();
