// ===========================================================================
// claude-itinerary.ts — renders claude.html: CLAUDE'S PICK, the committed week.
//
// What: the opinionated itinerary. plan.html presents the menu; THIS page is
//   what Claude would actually book — her spec (Jul 20): "smart busy, full of
//   adventure." Every day: anchor + water + bonus + a named sunset, sequenced
//   so nothing fights geography and nothing exceeds Avital's easy ceiling.
// Why separate: options are for choosing; this is decision-support — the
//   default week if they never finish hearting. Swap rules included (weather).
// Data: enriched from plan-data.ts (photos, sites, maps) — no duplicate facts.
// ===========================================================================

import { BUILD_STAMP, SITES, byId } from './plan-data.js';
import { mountNotes } from './notes.js';

interface Step {
  t: string; // time-of-day label
  text: string; // what you do, plain words
  actId?: string; // link to plan-data activity for maps/site buttons
}

interface CDay {
  date: string;
  title: string;
  why: string; // why I chose THIS shape for you two
  photoActId: string;
  steps: Step[];
  sunset: string;
  swap: string; // the weather / energy escape hatch
}

const WEEK: CDay[] = [
  {
    date: 'Fri Jul 24',
    title: 'Land → Mauthausen → Shabbat',
    why: 'You asked for meaningful and Jewish — this is the realest version of it, done FIRST so it frames the whole week. The drive home passes your grocery stop, and candles are late (20:32): the big day fits with hours to spare.',
    photoActId: 'mauthausen',
    steps: [
      { t: '07:50', text: 'Land Salzburg. Passport, bags, Alamo — realistically rolling ~09:45.' },
      { t: '09:45', text: 'Drive east 1h45 on the A1.', actId: 'mauthausen' },
      { t: '11:30', text: 'Mauthausen Memorial — ~3 hours with the audio guide. Free. Heavy and worth it.', actId: 'mauthausen' },
      { t: '14:30', text: 'Drive south 1h40 — decompress; the road turns beautiful past Gmunden.' },
      { t: '16:15', text: 'Spar Bad Ischl: fresh basics (~40 min). Shops are CLOSED Sat + Sun — this stop is sacred.' },
      { t: '17:15', text: 'Bad Goisern: unpack, freezer-load, shower, breathe.' },
      { t: '20:32', text: '🕯️ Candle-lighting. Quietest Shabbat of your year begins.' },
    ],
    sunset: 'From the apartment / riverside stroll (~20:50) — no driving needed, Shabbat has begun.',
    swap: 'Flight lands 45+ min late? Swap Mauthausen → Ebensee (25 min from home, open till 17:00) and keep everything else identical.',
  },
  {
    date: 'Sat Jul 25',
    title: 'Shabbat — the deep breath',
    why: 'One day of genuinely nothing is what makes six days of adventure possible. Bad Goisern is green, silent, and yours.',
    photoActId: 'gosausee',
    steps: [
      { t: 'morning', text: 'Sleep. Daven. Long lunch from the frozen-food stash.' },
      { t: 'afternoon', text: 'Riverside walk along the Traun — flat, shaded, walking-distance.' },
      { t: '20:50', text: 'Valley sunset from the fields at the village edge.' },
      { t: '21:45', text: 'Havdalah → pack the day-bag for Sunday, book nothing, sleep early-ish.' },
    ],
    sunset: 'Bad Goisern valley gold, on foot.',
    swap: 'None needed. This day is the anchor for all the others.',
  },
  {
    date: 'Sun Jul 26',
    title: 'Steam train up, boat across, new lake home',
    why: 'You said go BIG Sunday. This is big the way you two do big: a 130-year-old steam engine does the climbing, a ferry does the crossing, the lake does the swimming — and you still make Zell by check-in with a sunset waiting.',
    photoActId: 'schafberg',
    steps: [
      { t: '08:15', text: 'Leave Goisern → 35 min to St. Wolfgang.' },
      { t: '09:00', text: 'SchafbergBahn steam train up (RESERVED seats — book by Wed!). Three lakes at your feet.', actId: 'schafberg' },
      { t: '11:30', text: 'Back down → rent a little e-boat in St. Gilgen (€35/h, swim ladder — no reservation) OR ferry hop + Strandbad swim + picnic.', actId: 'wolfgangsee-eboat' },
      { t: '15:00', text: 'Drive 1h15 to Zell am See, check in der Sonnberg (17:00–18:00 window).' },
      { t: '18:30', text: 'Walk down to the lake — first look at your new water.' },
      { t: '20:53', text: '🌅 Esplanade sunset — peaks going pink over the Zeller See.', actId: 'strandbad-zell' },
    ],
    sunset: 'Zeller See Esplanade, 20:53.',
    swap: 'Crystal-clear forecast + itchy right foot? Swap the whole day for the Grossglockner glacier road (1h45 to the entrance from Goisern, ends 25 min from Zell). Train day then slides to a Wolfgangsee stop on Tuesday.',
  },
  {
    date: 'Mon Jul 27',
    title: 'Glacier morning, gorge noon, boat-sunset night',
    why: 'The trip’s biggest wow-density day and everything is within 15 minutes of your bed: 3,000 m of glacier by gondola, a boardwalk gorge for the hot hours, open-lake swimming, and gold light from a boat deck. Smart-busy at its purest.',
    photoActId: 'kitzsteinhorn',
    steps: [
      { t: '08:30', text: 'Kitzsteinhorn lifts up to 3,029 m — July snow, Top of Salzburg platform. Layers ON.', actId: 'kitzsteinhorn' },
      { t: '12:30', text: 'Down to the valley → Sigmund-Thun gorge boardwalk + Klammsee loop (~1h, cool mist).', actId: 'sigmund-thun' },
      { t: '15:30', text: 'Strandbad Zell: swim, lawn, nap. The slow shoulder.', actId: 'strandbad-zell' },
      { t: '19:45', text: '⛵ Board the sunset cruise at the Esplanade pier.', actId: 'zell-cruise' },
      { t: '20:53', text: '🌅 Sunset FROM the water. Your Montenegro evening, upgraded.' },
    ],
    sunset: 'On the Zeller See, from the boat.',
    swap: 'Clouds on the peak? Flip the day: Krimml Falls + the 1947 Jewish exodus memorial (1h10 out) — mist, thunder, and meaning — then back for the swim + cruise unchanged.',
  },
  {
    date: 'Tue Jul 28',
    title: 'High dams → imperial town → the mirror lake',
    why: 'A move day that never feels like one. Turquoise reservoirs in the morning (buses + lift do everything), the grocery-and-history stop in Bad Ischl, and by golden hour you’re standing at the stillest water in Austria — 14 minutes from your new bed.',
    photoActId: 'mooserboden',
    steps: [
      { t: '08:45', text: 'Mooserboden high dams (20 min away): bus + inclined lift to 2,040 m, flat dam-crown walks between glaciers.', actId: 'mooserboden' },
      { t: '12:30', text: 'Pack out of Zell → drive toward Gosau via Bad Ischl.' },
      { t: '13:45', text: 'Bad Ischl: Spar restock + the 30-min “Jewish Ischl” pins walk + a river café stop.', actId: 'jewish-ischl' },
      { t: '16:00', text: 'Check in Transylvania Villa, Gosau. Unload the cooler.' },
      { t: '17:00', text: '🛶 One hour in an e-boat or on a SUP ON the Gosausee (rentals till 18:00) — float inside the reflection.', actId: 'gosausee-boats' },
      { t: '18:30', text: '🪞 Then the shore loop — the Dachstein doubled in still water, buses gone, nearly alone.', actId: 'gosausee' },
      { t: '20:51', text: '🌅 Sunset at the lake. The “we’re really here” moment.' },
    ],
    sunset: 'Vorderer Gosausee, 20:51.',
    swap: 'Want a softer morning? Skip Mooserboden, long breakfast + last Strandbad swim, everything else holds.',
  },
  {
    date: 'Wed Jul 29',
    title: '5 Fingers at opening, quiet-lake noon, Hallstatt after the buses',
    why: 'The crowd-outsmarting day: the sky platform when it’s empty, a silent forest lake while everyone else queues in Hallstatt, and Hallstatt itself only when the day-trippers drain away — seen from your own little electric boat.',
    photoActId: 'krippenstein',
    steps: [
      { t: '08:15', text: 'Krippenstein gondola at opening (30 min away) → easy stroll to 5 Fingers, platform to yourselves.', actId: 'krippenstein' },
      { t: '12:00', text: 'Down → Langbathsee (45 min): flat shore loop, swim, picnic, naps in the grass.', actId: 'langbathsee' },
      { t: '16:30', text: 'Hallstatt as the buses leave: market square, swan harbor, rent the little e-boat (~€25/h).', actId: 'hallstatt' },
      { t: '20:30', text: '🌅 West-shore pullouts — Hallstatt’s lights come on across the water.', actId: 'hallstatt' },
    ],
    sunset: 'Hallstättersee west shore, ~20:50.',
    swap: 'Cloud ceiling low? Two great flips: the Grundlsee 3-Lakes wooden-boat tour to the hidden Kammersee (25 min, ~€35, magic in any weather) — or the Bavaria mirror trio (Hintersee + Zauberwald + Ramsau church). Hallstatt-evening survives either way.',
  },
  {
    date: 'Thu Jul 30',
    title: 'The Königssee signature day',
    why: 'The single best match between a place and you two that I found in 73 researched options: silent boats, an echo that answers, a chapel out of a storybook, a mirror lake at the end of a flat path — then a sunset you literally drive to. Protect this one.',
    photoActId: 'koenigssee',
    steps: [
      { t: '08:15', text: 'Check out Gosau → 1h06 to Schönau. Luggage rides along — zero backtracking.' },
      { t: '09:45', text: 'Silent electric boat down the Königssee — trumpet echo at the cliff wall.', actId: 'koenigssee' },
      { t: '11:00', text: 'St. Bartholomä chapel stop → boat on to Salet.' },
      { t: '12:00', text: 'Flat 15-min walk to the Obersee: the stillest water of the trip, Röthbach falls on the far cliff. Picnic here.', actId: 'koenigssee' },
      { t: '16:00', text: 'Last boat back (CALL AHEAD for the exact last-Salet time) → Hintersee + Zauberwald golden-hour stop, 15 min away.', actId: 'hintersee-ramsau' },
      { t: '19:45', text: 'Rossfeld panorama road: drive to the ridge (€9.50), step out.', actId: 'rossfeld' },
      { t: '20:45', text: '🌅 Sunset over two countries. Then 30 min down to the Wals hotel.' },
    ],
    sunset: 'Rossfeld ridge, ~20:45 — zero walking.',
    swap: 'Rain on the fjord? Chiemsee islands day instead (steamer + palace + car-free nuns’ island, 42 min from Wals) — gentler, still all-boat.',
  },
  {
    date: 'Fri Jul 31',
    title: 'Home',
    why: 'Boring by design — the only day of the trip where boring is the win.',
    photoActId: 'koenigssee',
    steps: [
      { t: '05:30', text: 'Wake. Checkout works from 06:00.' },
      { t: '06:30', text: 'Key-drop the car (photograph it first).' },
      { t: '09:55', text: 'LY5194 → TLV 13:25. Home with the afternoon to reset for Shabbat.' },
    ],
    sunset: 'At home, in Jerusalem. 💙',
    swap: 'None. Set two alarms.',
  },
];

const NUMBERS = [
  ['7', 'named sunsets'],
  ['4', 'boats'],
  ['4', 'cable cars & lifts'],
  ['2', 'memorial visits'],
  ['5', 'swims possible'],
  ['0', 'strenuous climbs'],
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

function render(): void {
  const root = document.getElementById('claude');
  if (!root) return;

  const hero = el('header', 'plan-hero');
  hero.style.backgroundImage = `url('${byId.get('koenigssee')?.photo ?? ''}')`;
  const ht = el('div', 'ht');
  ht.appendChild(el('p', 'kick', 'my committed pick · smart-busy · full of adventure · nothing strenuous'));
  ht.appendChild(el('h1', undefined, "Claude's Itinerary 💙"));
  ht.appendChild(
    el(
      'p',
      undefined,
      'If you two never touch the rank page, run THIS. Every day has an anchor, water, a bonus, and a named sunset — sequenced so nothing fights geography. Each day carries its own weather escape-hatch. Disagree anywhere? Heart it differently on Rank it — your hearts outrank me.',
    ),
  );
  hero.appendChild(ht);
  root.appendChild(hero);

  const wrap = el('div', 'wrap');

  const nums = el('div', 'cnums');
  for (const [n, label] of NUMBERS) {
    const b = el('div', 'cnum');
    b.appendChild(el('div', 'n', esc(n)));
    b.appendChild(el('div', 'l', esc(label)));
    nums.appendChild(b);
  }
  wrap.appendChild(nums);

  for (const day of WEEK) {
    const sec = el('section', 'day');
    const head = el('div', 'day-head');
    head.appendChild(el('p', 'date', esc(day.date)));
    head.appendChild(el('h2', undefined, esc(day.title)));
    sec.appendChild(head);

    const card = el('article', 'cday');
    const img = el('div', 'cday-img');
    img.style.backgroundImage = `url('${byId.get(day.photoActId)?.photo ?? ''}')`;
    card.appendChild(img);

    const body = el('div', 'cday-body');
    body.appendChild(el('p', 'cday-why', `<b>Why this shape:</b> ${esc(day.why)}`));

    const tl = el('ul', 'tl');
    for (const s of day.steps) {
      const li = el('li');
      li.appendChild(el('span', 't', esc(s.t)));
      const span = el('span', undefined, esc(s.text));
      if (s.actId) {
        const a = byId.get(s.actId);
        const site = SITES[s.actId];
        if (a) {
          const nav = el('a', 'mini', '📍');
          (nav as HTMLAnchorElement).href = a.maps;
          (nav as HTMLAnchorElement).target = '_blank';
          (nav as HTMLAnchorElement).rel = 'noopener';
          (nav as HTMLAnchorElement).title = 'Navigate';
          span.appendChild(document.createTextNode(' '));
          span.appendChild(nav);
        }
        if (site) {
          const s2 = el('a', 'mini', '↗');
          (s2 as HTMLAnchorElement).href = site;
          (s2 as HTMLAnchorElement).target = '_blank';
          (s2 as HTMLAnchorElement).rel = 'noopener';
          (s2 as HTMLAnchorElement).title = 'Website';
          span.appendChild(document.createTextNode(' '));
          span.appendChild(s2);
        }
      }
      li.appendChild(span);
      tl.appendChild(li);
    }
    body.appendChild(tl);
    body.appendChild(el('p', 'cday-sunset', `🌅 <b>Sunset:</b> ${esc(day.sunset)}`));
    body.appendChild(el('p', 'cday-swap', `🔄 <b>Escape hatch:</b> ${esc(day.swap)}`));
    card.appendChild(body);
    sec.appendChild(card);
    wrap.appendChild(sec);
  }

  const outro = el('p', 'day-note');
  outro.innerHTML =
    'Before Friday: ① reserve the Schafberg train (by Wed) · ② one WhatsApp to Avital re: exact El Al times · ③ ask the Goisern host about the freezer · ④ I check the weather Wednesday and re-point the clear-day picks. Everything else is walk-up. 💙';
  wrap.appendChild(outro);

  root.appendChild(wrap);

  const foot = document.getElementById('claude-foot');
  if (foot) {
    foot.innerHTML = `my pick, your veto — hearts on <a href="rank.html">Rank it</a> outrank me · built ${BUILD_STAMP} · <a href="plan.html">all options →</a>`;
  }

  mountNotes();
}

render();
