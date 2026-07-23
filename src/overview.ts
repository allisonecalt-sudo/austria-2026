// ===========================================================================
// overview.ts — renders overview.html: THE MAP IN YOUR HEAD.
//
// Why (Allison, 23 Jul): "create an overview page... this is what you want to
//   do, this is what you're going to see... which things are close to which
//   areas, which things are far, which could be done together, which are must
//   sees in each area. Kind of like mapping us through these mountains —
//   what's going on, where we are going, and how all the different areas mix
//   together."
//
// So this page answers four questions and nothing else:
//   1. What SHAPE is this week, really?
//   2. What is each bed the gateway to?
//   3. What naturally goes together?
//   4. What is too far to bother with?
//
// THE ONE STRUCTURAL FACT it exists to teach: this looks like four bases but
// it is THREE REGIONS. Bad Goisern and Gosau are 20 minutes apart — the same
// larder, two different beds. Zell is the outlier, 1h45 from Bad Goisern, and
// that hop happens twice. Understanding that is most of understanding the week.
//
// Every number here is measured, not felt: drive times from the Google
// Distance Matrix pull on 2026-07-23, straight-line neighbours from geocoding
// the same day. The reach counts are computed live from that same table, so
// they cannot drift away from the rest of the site.
// ===========================================================================

import { byId } from './plan-data.js';
import { TABLE_ROWS } from './table-data.js';
import { mountNav } from './nav.js';
import { focusMap, mountMap } from './map.js';

interface Region {
  key: string;
  name: string;
  beds: string;
  nights: string;
  /** Index into fromBase for the bed that represents this region. */
  baseIndex: number;
  /** What this place actually IS, in her words not a brochure's. */
  character: string;
  gateway: string;
  mustSee: string[];
  /** The honest catch about basing here. */
  catch: string;
}

const REGIONS: Region[] = [
  {
    key: 'salzkammergut',
    name: 'The Salzkammergut',
    beds: 'Bad Goisern · then Gosau',
    nights: 'Fri 24–Sun 26, then Tue 28–Thu 30',
    baseIndex: 0,
    character:
      'Lakes between soft green mountains, salt towns, and water everywhere you look. This is the postcard Austria and it is where you sleep four of your seven nights — in two different beds twenty minutes apart, which is why it does not feel like one place.',
    gateway:
      'The Hallstättersee and the Dachstein. Everything here is a lake, a lift onto the Dachstein, or something underground.',
    mustSee: ['krippenstein', 'gosausee', 'hallstatt-by-train', 'hallstattersee-boat'],
    catch:
      'Bad Goisern and Gosau share almost the same list — nine things sit within fifteen minutes of both. Do not save something for Gosau that you could have done from Goisern; save the GOSAUSEE for Gosau, because that is the one thing Gosau genuinely owns.',
  },
  {
    key: 'pinzgau',
    name: 'Zell am See & the Hohe Tauern',
    beds: 'der Sonnberg, Zell am See',
    nights: 'Sun 26–Tue 28',
    baseIndex: 1,
    character:
      'High alpine. Glaciers, a big dark lake with a town wrapped around it, and the road up to 2,504 m. Everything is either on the lake or straight up.',
    gateway:
      'The glacier (Kitzsteinhorn), the Grossglockner road, and all four rafting operators. The only white water on the trip is here.',
    mustSee: ['zell-cruise', 'kitzsteinhorn', 'frost-rafting', 'grossglockner'],
    catch:
      'It is the outlier. 1h45 from Bad Goisern and 1h26 from Gosau — the longest hop of the week, and you do it twice. The upside is that once you are there you barely drive: ten things are inside twenty minutes, and the sunset cruise is a three-minute walk. Treat Zell as a self-contained pocket, not a base to explore from.',
  },
  {
    key: 'salzburg',
    name: 'Salzburg & Berchtesgaden',
    beds: 'Wals, by the airport',
    nights: 'Thu 30–Fri 31',
    baseIndex: 3,
    character:
      'The city, and the German lakes just over the border. One night, and it is really the airport night — but it happens to sit fifteen minutes from a great city and fifty from the best boat ride of the week.',
    gateway:
      'Königssee and the Obersee (Germany), the Salzburg old town, and the fortress concert. Also the ice cave and the falconry castle, both about half an hour south.',
    mustSee: ['koenigssee', 'rossfeld', 'hohensalzburg', 'fortress-concert'],
    catch:
      'Only fifteen things sit within forty-five minutes — but fifty-four are within ninety. It looks thin and is actually the widest-reaching bed of the trip. The real constraint is that you have one night and a 05:30 alarm.',
  },
];

/** Combinations the geography makes obvious — computed pairs, hand-picked for
 *  the ones that are genuinely worth doing together rather than merely near. */
const PAIRS: { a: string; b: string; why: string }[] = [
  {
    a: 'gosausee',
    b: 'gosausee-boats',
    why: 'Same lake, same evening. Be on the water by 16:30 (last hire 18:00), then sit on the shore for the sunset. One place, no second drive.',
  },
  {
    a: 'krippenstein',
    b: 'dachstein-icecave',
    why: '1.8 km apart on the same mountain, same cable car. If you want a full Dachstein day, this is it.',
  },
  {
    a: 'hallstatt-by-train',
    b: 'hallstatt-sup',
    why: '3 km apart on the same lake. Paddle the quiet north shore in the morning, take the train and ferry into the village at dusk.',
  },
  {
    a: 'zell-cruise',
    b: 'strandbad-zell',
    why: 'Both a two-minute walk from the Zell bed. Swim in the afternoon, board the boat at eight.',
  },
  {
    a: 'kitzsteinhorn',
    b: 'sigmund-thun',
    why: '2.2 km apart. Glacier in the morning, cool gorge boardwalk after — and the spa is 1 km from the glacier lift.',
  },
  {
    a: 'jewish-ischl',
    b: 'kaiservilla',
    why: '300 m apart in Bad Ischl, and the Eurotherme is the same distance again. Your grocery stop is already here.',
  },
  {
    a: 'salzburg-jewish-walk',
    b: 'hohensalzburg',
    why: '600 m apart. Walk the Stolpersteine, then up to the fortress — the concert is in that same building.',
  },
  {
    a: 'rossfeld',
    b: 'eagles-nest',
    why: '3.9 km apart above Berchtesgaden. Both on the way back from Königssee.',
  },
  {
    a: 'taxenbach-rafting',
    b: 'kitzlochklamm',
    why: '700 m apart. Raft in the morning, walk the gorge after — same car park, basically.',
  },
];

const FAR: { id: string; why: string }[] = [
  {
    id: 'mauthausen',
    why: 'Nearest bed is 1h43 away, and it needs three hours on site plus a quiet drive afterwards. It wants a whole day this week does not have. Ebensee — 25 minutes from Bad Goisern, and you walk into the tunnel itself — is the version that fits.',
  },
  {
    id: 'taurachbahn',
    why: 'The steam train runs Friday, Saturday and Sunday only. Your Friday is arrival, Saturday is Shabbat, Sunday is the transfer to Zell. It does not fit this week, and pretending otherwise would waste your time.',
  },
];

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function name(id: string): string {
  const a = byId.get(id);
  return a ? `${a.emoji} ${a.name}` : id;
}

/** Live counts from the same drive matrix the rest of the site uses. */
function reach(baseIndex: number): { near: number; mid: number; wide: number } {
  const rows = Object.values(TABLE_ROWS);
  return {
    near: rows.filter((r) => r.fromBase[baseIndex] <= 20).length,
    mid: rows.filter((r) => r.fromBase[baseIndex] <= 45).length,
    wide: rows.filter((r) => r.fromBase[baseIndex] <= 90).length,
  };
}

/** A collapsible block — Avital's rule, applied here from the start. */
function block(title: string, sub: string, open = false): { sec: HTMLElement; body: HTMLElement } {
  const sec = el('section', 'ovsec' + (open ? ' open' : ''));
  const btn = el('button', 'ovsec-head');
  btn.type = 'button';
  btn.setAttribute('aria-expanded', String(open));
  btn.innerHTML = `<span class="ovsec-t">${esc(title)}</span><span class="ovsec-s">${esc(sub)}</span><span class="ovsec-c">▾</span>`;
  btn.addEventListener('click', () => {
    const now = sec.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(now));
  });
  sec.appendChild(btn);
  const body = el('div', 'ovsec-body');
  sec.appendChild(body);
  return { sec, body };
}

function render(): void {
  const root = document.getElementById('overview');
  if (!root) return;
  const wrap = el('div', 'ovwrap');

  // ---- the headline fact ---------------------------------------------------
  const head = el('header', 'ovhead');
  head.appendChild(el('p', 'ovkick', 'the map in your head'));
  head.appendChild(el('h1', undefined, 'Where you actually are'));
  head.appendChild(
    el(
      'p',
      'ovlede',
      'It looks like four bases. It is really three regions — and once you see that, the week makes sense.',
    ),
  );
  wrap.appendChild(head);

  // The route, with measured drives between the beds.
  const route = el('div', 'ovroute');
  route.innerHTML = `
    <div class="rnode"><b>Airport</b><span>land 07:50</span></div>
    <div class="rleg">1h07</div>
    <div class="rnode reg1"><b>Bad Goisern</b><span>2 nights</span></div>
    <div class="rleg long">1h45 <em>longest hop</em></div>
    <div class="rnode reg2"><b>Zell am See</b><span>2 nights</span></div>
    <div class="rleg">1h26</div>
    <div class="rnode reg1"><b>Gosau</b><span>2 nights</span></div>
    <div class="rleg">51 min</div>
    <div class="rnode reg3"><b>Wals</b><span>1 night</span></div>
    <div class="rleg">7 min</div>
    <div class="rnode"><b>Airport</b><span>fly 09:55</span></div>`;
  wrap.appendChild(route);

  const keyfact = el('div', 'ovkey');
  keyfact.innerHTML =
    '<b>Bad Goisern and Gosau are 20 minutes apart.</b> Same region, two beds — nine things sit within a quarter of an hour of both. ' +
    'Zell is the odd one out: 1h45 from Goisern, and you make that hop twice. ' +
    'So the week is <b>Salzkammergut → a high-alpine pocket → Salzkammergut again → the city</b>.';
  wrap.appendChild(keyfact);

  // ---- the map ------------------------------------------------------------
  // Her ask: "add a map to this page so you can really visualise where
  // everything is." Plotted from the same table as the drive times, so it can
  // never disagree with them.
  const mapSec = el('section', 'ovmap');
  const mapHost = el('div', 'ovmap-canvas');
  mapHost.id = 'ov-map';
  mapSec.appendChild(mapHost);

  const legend = el('div', 'ovlegend');
  legend.innerHTML =
    '<span><i style="background:#3f5d4e"></i>1 Bad Goisern</span>' +
    '<span><i style="background:#33597a"></i>2 Zell am See</span>' +
    '<span><i style="background:#6b8f78"></i>3 Gosau</span>' +
    '<span><i style="background:#b98a2f"></i>4 Wals</span>';
  mapSec.appendChild(legend);
  mapSec.appendChild(
    el(
      'p',
      'ovmaphint',
      'Every dot is coloured by the bed it is CLOSEST to — so the colours show you what belongs to where. Bigger dots are the lifetime picks. Tap any of them.',
    ),
  );
  wrap.appendChild(mapSec);

  // ---- region by region ----------------------------------------------------
  for (const r of REGIONS) {
    const n = reach(r.baseIndex);
    const { sec, body } = block(r.name, `${r.beds} · ${r.nights}`, r.key === 'salzkammergut');

    body.appendChild(el('p', 'ovchar', r.character));

    const stats = el('div', 'ovstats');
    stats.innerHTML =
      `<span><b>${n.near}</b> within 20 min</span>` +
      `<span><b>${n.mid}</b> within 45 min</span>` +
      `<span><b>${n.wide}</b> within 90 min</span>`;
    body.appendChild(stats);

    body.appendChild(el('p', 'ovgate', `Gateway to — ${r.gateway}`));

    body.appendChild(el('h3', 'ovh3', 'The must-sees here'));
    const ul = el('ul', 'ovlist');
    for (const id of r.mustSee) {
      const a = byId.get(id);
      const li = el('li');
      // Her ask: from a list item, get BOTH the map and the details.
      const mapBtn = el('button', 'ovmapbtn', '🗺');
      mapBtn.type = 'button';
      mapBtn.title = 'Show on the map';
      mapBtn.addEventListener('click', () => {
        document.getElementById('ov-map')?.scrollIntoView({ block: 'center' });
        focusMap(id);
      });
      li.appendChild(mapBtn);
      const link = el('a', undefined, name(id));
      link.href = `plan.html#${id}`;
      li.appendChild(link);
      const t = TABLE_ROWS[id];
      if (t) li.appendChild(el('span', 'ovmin', ` ${t.fromBase[r.baseIndex]} min`));
      if (a) li.appendChild(el('p', 'ovwhat', a.what));
      ul.appendChild(li);
    }
    body.appendChild(ul);

    const c = el('p', 'ovcatch');
    c.innerHTML = `<b>The catch —</b> ${esc(r.catch)}`;
    body.appendChild(c);

    wrap.appendChild(sec);
  }

  // ---- what goes together --------------------------------------------------
  {
    const { sec, body } = block(
      'What goes together',
      `${PAIRS.length} natural pairs, measured not guessed`,
    );
    body.appendChild(
      el(
        'p',
        'ovchar',
        'These sit close enough to each other that doing both costs almost no extra driving. The distances are straight-line between the two places.',
      ),
    );
    const ul = el('ul', 'ovpairs');
    for (const p of PAIRS) {
      const li = el('li');
      const near = TABLE_ROWS[p.a]?.near.find((x) => x.id === p.b);
      li.innerHTML =
        `<span class="ovpair-n">${esc(name(p.a))}<em> + </em>${esc(name(p.b))}` +
        (near ? ` <span class="ovmin">${near.km} km apart</span>` : '') +
        `</span><span class="ovpair-w">${esc(p.why)}</span>`;
      ul.appendChild(li);
    }
    body.appendChild(ul);
    wrap.appendChild(sec);
  }

  // ---- too far -------------------------------------------------------------
  {
    const { sec, body } = block('Too far to bother with', 'the honest list');
    body.appendChild(
      el(
        'p',
        'ovchar',
        'Of all 57 options, only two are genuinely out of reach from every bed. Both are good. Neither fits.',
      ),
    );
    const ul = el('ul', 'ovlist');
    for (const f of FAR) {
      const li = el('li');
      const t = TABLE_ROWS[f.id];
      li.appendChild(el('span', 'ovfar-n', name(f.id)));
      if (t) li.appendChild(el('span', 'ovmin', ` nearest bed ${Math.min(...t.fromBase)} min`));
      li.appendChild(el('p', 'ovwhat', f.why));
      ul.appendChild(li);
    }
    body.appendChild(ul);
    wrap.appendChild(sec);
  }

  root.appendChild(wrap);

  const foot = document.getElementById('ov-foot');
  if (foot) {
    foot.innerHTML =
      'Drive times measured on 23 Jul 2026 from each booked bed · distances between places are straight-line · <a href="plan.html">every option →</a>';
  }
}

mountNav();
render();
mountMap('ov-map');
