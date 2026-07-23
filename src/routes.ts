// ===========================================================================
// routes.ts — renders routes.html: THE WEEK, DOOR TO DOOR.
//
// Two halves, both Avital's (23 Jul, confirmed):
//
// 1. THE DAY LOOPS — "plan a day, beginning to end, what that would be and how
//    it works altogether." Each day from routes-data.ts, drawn as a chain of
//    stops with the MEASURED drive minutes BETWEEN them — not from the bed.
//
// 2. THE ROUTE BUILDER — "I want to choose this, choose this, choose this, and
//    then you could dynamically plan what that route would be."
//    Tick places → nearest-neighbour ordering from that day's start bed to its
//    end bed → estimated legs → one tap opens the whole chain in Google Maps.
//    HONESTY RULE: builder legs are ESTIMATES (straight-line km × an alpine
//    road factor) and say so on every leg. The Google Maps handoff is where
//    the real routing happens — we order the stops, Maps drives them.
//    The factor (1.8 min per straight-line km, floor 8 min) was calibrated
//    against measured pairs: Goisern→Zell 1.87, Gosau→Königssee 1.74,
//    Goisern→Hallstatt 2.0, Zell→FROST 1.53.
// ===========================================================================

import { byId } from './plan-data.js';
import { BASE_ORDER, TABLE_ROWS } from './table-data.js';
import { DAY_ROUTES, totalDrive, type DayRoute } from './routes-data.js';
import { allFavIds, isFav, loadFavs } from './favs.js';
import { getDayPlan, loadAllDayPlans, toggleInDay } from './dayplan.js';
import { mountNav } from './nav.js';
import { mountNotes } from './notes.js';

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

function mins(m: number): string {
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

// --- 1. the day loops --------------------------------------------------------

function stopRow(s: DayRoute['stops'][number], onFoot: boolean): HTMLElement {
  const li = el('li', 'rstop');

  if (s.legMin > 0) {
    li.appendChild(el('span', 'rleg2', `🚗 ${mins(s.legMin)}`));
  } else if (!onFoot) {
    li.appendChild(el('span', 'rleg2 walkleg', '·'));
  } else {
    li.appendChild(el('span', 'rleg2 walkleg', '🚶'));
  }

  const body = el('div', 'rstop-body');
  const a = s.id ? byId.get(s.id) : undefined;
  if (a && s.id) {
    // ⭐ = a lifetime pick. On a trailhead, deciding, this is the one
    // signal that must survive a two-second glance.
    const link = el('a', 'rstop-name', `${a.star ? '⭐ ' : ''}${a.emoji} ${a.name}`);
    link.href = `plan.html#${s.id}`;
    body.appendChild(link);
  } else {
    body.appendChild(el('span', 'rstop-name', `${s.emoji ?? '•'} ${s.label ?? ''}`));
  }
  if (s.time) body.appendChild(el('span', 'rstop-time', s.time));
  if (s.note) body.appendChild(el('p', 'rstop-note', s.note));
  li.appendChild(body);
  return li;
}

function daySection(day: DayRoute): HTMLElement {
  const total = totalDrive(day);
  const sec = el('section', 'rday');
  sec.id = day.dayId;

  // Her: "a few pictures... I wouldn't overdo it." One per day, the day's own.
  const head = el('button', 'rday-head');
  head.type = 'button';
  head.style.backgroundImage = `linear-gradient(rgba(20,20,18,.35), rgba(20,20,18,.62)), url('${day.photo}')`;
  head.setAttribute('aria-expanded', 'false');
  head.innerHTML =
    `<span class="rday-date">${esc(day.date)}</span>` +
    `<span class="rday-title">${esc(day.title)}</span>` +
    `<span class="rday-line">${esc(day.headline)}</span>` +
    `<span class="rday-total">${day.onFoot ? 'no car' : `🚗 ${mins(total)} total`} <i>▾</i></span>`;
  head.addEventListener('click', () => {
    const open = sec.classList.toggle('open');
    head.setAttribute('aria-expanded', String(open));
  });
  sec.appendChild(head);

  const body = el('div', 'rday-body');
  const list = el('ol', 'rstops');
  for (const s of day.stops) list.appendChild(stopRow(s, Boolean(day.onFoot)));
  body.appendChild(list);

  // Her ask: every day carries its own way back to the FULL menu — the route
  // is a suggestion, the options are the pool it came from.
  const more = el('a', 'rmore');
  more.href = `plan.html#${day.dayId}`;
  more.textContent = `➕ All the options for ${day.date} — swap anything`;
  body.appendChild(more);

  body.appendChild(el('p', 'rsunset', `🌅 ${day.sunset}`));
  if (day.slow) body.appendChild(el('p', 'rslow', `🐢 The slow version: ${day.slow}`));
  if (day.weatherSwap) body.appendChild(el('p', 'rswap', `🔄 The swap: ${day.weatherSwap}`));
  sec.appendChild(body);
  return sec;
}

// --- 2. the route builder ----------------------------------------------------

const R = 6371;
const rad = (d: number): number => (d * Math.PI) / 180;
function km(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLa = rad(bLat - aLat);
  const dLo = rad(bLng - aLng);
  const h =
    Math.sin(dLa / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Estimated drive minutes from straight-line km. Calibrated on measured pairs;
 *  always labelled as an estimate in the UI. */
function estMin(distKm: number): number {
  return Math.max(8, Math.round(distKm * 1.8));
}

// Start/end bed per day, matching the itinerary.
const DAY_BEDS: { dayId: string; label: string; start: number; end: number }[] = [
  { dayId: 'sun26', label: 'Sun 26 · Goisern → Zell', start: 0, end: 1 },
  { dayId: 'mon27', label: 'Mon 27 · Zell', start: 1, end: 1 },
  { dayId: 'tue28', label: 'Tue 28 · Zell → Gosau', start: 1, end: 2 },
  { dayId: 'wed29', label: 'Wed 29 · Gosau', start: 2, end: 2 },
  { dayId: 'thu30', label: 'Thu 30 · Gosau → Wals', start: 2, end: 3 },
];

interface Chosen {
  id: string;
  lat: number;
  lng: number;
}

const builder = {
  day: DAY_BEDS[0],
  chosen: new Set<string>(),
};

function rbStatus(msg: string): void {
  const n = document.getElementById('rb-status');
  if (n) n.textContent = msg;
}

function orderStops(chosen: Chosen[]): Chosen[] {
  // Nearest-neighbour from the start bed; end bed pulls the tail into shape.
  const start = BASE_ORDER[builder.day.start];
  const remaining = [...chosen];
  const ordered: Chosen[] = [];
  let cur = { lat: start.lat, lng: start.lng };
  while (remaining.length > 0) {
    let bi = 0;
    let bd = Infinity;
    remaining.forEach((c, i) => {
      const d = km(cur.lat, cur.lng, c.lat, c.lng);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    const next = remaining.splice(bi, 1)[0];
    ordered.push(next);
    cur = next;
  }
  return ordered;
}

function renderBuilderResult(): void {
  const mount = document.getElementById('rb-result');
  if (!mount) return;
  mount.innerHTML = '';

  const chosen: Chosen[] = [...builder.chosen]
    .map((id) => {
      const t = TABLE_ROWS[id];
      return t && t.lat !== null && t.lng !== null ? { id, lat: t.lat, lng: t.lng } : null;
    })
    .filter((c): c is Chosen => c !== null);

  if (chosen.length === 0) {
    mount.appendChild(el('p', 'rb-empty', 'Tick a few places above and the route appears here.'));
    return;
  }

  const start = BASE_ORDER[builder.day.start];
  const end = BASE_ORDER[builder.day.end];
  const ordered = orderStops(chosen);

  const list = el('ol', 'rstops rb-stops');
  let cur = { lat: start.lat, lng: start.lng };
  let totalEst = 0;

  const bedRow = (label: string): HTMLElement => {
    const li = el('li', 'rstop');
    li.appendChild(el('span', 'rleg2 walkleg', '🛏'));
    const b = el('div', 'rstop-body');
    b.appendChild(el('span', 'rstop-name', label));
    li.appendChild(b);
    return li;
  };
  list.appendChild(bedRow(start.name));

  for (const c of ordered) {
    const d = km(cur.lat, cur.lng, c.lat, c.lng);
    const m = estMin(d);
    totalEst += m;
    const li = el('li', 'rstop');
    li.appendChild(el('span', 'rleg2 estleg', `≈ ${m} min`));
    const body = el('div', 'rstop-body');
    const a = byId.get(c.id);
    const link = el('a', 'rstop-name', a ? `${a.emoji} ${a.name}` : c.id);
    link.href = `plan.html#${c.id}`;
    body.appendChild(link);
    body.appendChild(el('span', 'rstop-time', `${d.toFixed(1)} km straight-line`));
    li.appendChild(body);
    list.appendChild(li);
    cur = c;
  }

  const dEnd = km(cur.lat, cur.lng, end.lat, end.lng);
  const mEnd = estMin(dEnd);
  totalEst += mEnd;
  const endLi = bedRow(end.name);
  (endLi.querySelector('.rleg2') as HTMLElement).textContent = `≈ ${mEnd} min`;
  (endLi.querySelector('.rleg2') as HTMLElement).className = 'rleg2 estleg';
  list.appendChild(endLi);
  mount.appendChild(list);

  mount.appendChild(
    el(
      'p',
      'rb-total',
      `≈ ${mins(totalEst)} of driving, in this order. These are estimates from straight-line distance — the real route is one tap away:`,
    ),
  );

  // The handoff: Google Maps does the actual driving directions.
  const url =
    'https://www.google.com/maps/dir/?api=1' +
    `&origin=${start.lat},${start.lng}` +
    `&destination=${end.lat},${end.lng}` +
    `&waypoints=${ordered.map((c) => `${c.lat},${c.lng}`).join('|')}` +
    '&travelmode=driving';
  const go = el('a', 'rb-go', '🧭 Open this route in Google Maps');
  go.href = url;
  go.target = '_blank';
  go.rel = 'noopener';
  mount.appendChild(go);

  if (ordered.length > 9) {
    mount.appendChild(
      el(
        'p',
        'rb-warn',
        'Google Maps takes at most ~9 stops in one link — trim the list or split the day.',
      ),
    );
  }
}

async function renderBuilder(): Promise<void> {
  const root = document.getElementById('rb');
  if (!root) return;
  root.innerHTML = '';

  root.appendChild(el('h2', 'rb-h', 'Make a day'));
  root.appendChild(
    el(
      'p',
      'rb-sub',
      'Pick the day, tick places — the list SAVES as you go, shared to both phones. It orders itself into a loop from that morning’s bed to that night’s bed. You can also add from the map: tap any dot, pick the day.',
    ),
  );
  const status = el('p', 'save-note');
  status.id = 'rb-status';
  root.appendChild(status);

  // Day selector — switching loads that day's SAVED plan.
  const daysBar = el('div', 'rb-days');
  for (const d of DAY_BEDS) {
    const b = el('button', 'rb-day' + (builder.day.dayId === d.dayId ? ' on' : ''), d.label);
    b.type = 'button';
    b.addEventListener('click', () => {
      builder.day = d;
      void renderBuilder();
    });
    daysBar.appendChild(b);
  }
  root.appendChild(daysBar);

  // The saved plan for this day. Hearts only pre-fill a day nobody touched yet
  // (and without saving), so a deliberate empty stays empty.
  const saved = await getDayPlan(builder.day.dayId);
  builder.chosen = new Set(saved);
  if (saved.length === 0) {
    for (const id of allFavIds()) if (byId.has(id) && isFav(id)) builder.chosen.add(id);
    rbStatus(
      saved.length === 0 && builder.chosen.size > 0
        ? 'started from your ❤️ picks — tick anything to save it as this day'
        : '',
    );
  } else {
    rbStatus('this day is saved — both phones see it');
  }

  // Choices, sorted by distance from the day's start bed. First 12 visible.
  const startIdx = builder.day.start;
  const rows = Object.values(TABLE_ROWS)
    .filter((r) => r.lat !== null && byId.has(r.id))
    .sort((a, b) => a.fromBase[startIdx] - b.fromBase[startIdx]);

  const makeChoice = (r: (typeof rows)[number]): HTMLElement => {
    const a = byId.get(r.id);
    const lab = el('label', 'rb-choice');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = builder.chosen.has(r.id);
    cb.addEventListener('change', () => {
      if (cb.checked) builder.chosen.add(r.id);
      else builder.chosen.delete(r.id);
      // Every tick SAVES to the shared day plan — both phones, and Claude,
      // see the same Tuesday. This is the "make a day" she asked for.
      toggleInDay(builder.day.dayId, r.id, rbStatus);
      renderBuilderResult();
    });
    lab.appendChild(cb);
    lab.appendChild(el('span', 'rb-cname', a ? `${a.emoji} ${a.name}` : r.id));
    lab.appendChild(el('span', 'rb-cmin', `${r.fromBase[startIdx]} min out`));
    return lab;
  };

  const near = el('div', 'rb-choices');
  rows.slice(0, 12).forEach((r) => near.appendChild(makeChoice(r)));
  root.appendChild(near);

  const rest = el('details', 'rb-more');
  rest.appendChild(el('summary', undefined, `everything else (${rows.length - 12})`));
  const restBox = el('div', 'rb-choices');
  rows.slice(12).forEach((r) => restBox.appendChild(makeChoice(r)));
  rest.appendChild(restBox);
  root.appendChild(rest);

  const result = el('div');
  result.id = 'rb-result';
  root.appendChild(result);
  renderBuilderResult();
}

// --- page --------------------------------------------------------------------

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

const DAY_DATE: Record<string, string> = {
  fri24: '2026-07-24',
  shabbat: '2026-07-25',
  sun26: '2026-07-26',
  mon27: '2026-07-27',
  tue28: '2026-07-28',
  wed29: '2026-07-29',
  thu30: '2026-07-30',
  fri31: '2026-07-31',
};

async function main(): Promise<void> {
  mountNav();

  const root = document.getElementById('routes');
  if (root) {
    const head = el('header', 'rhead');
    head.appendChild(el('p', 'rkick', 'each day, door to door'));
    head.appendChild(el('h1', undefined, 'The Week'));
    head.appendChild(
      el(
        'p',
        'rlede',
        'Every day as a loop: out of the bed, stop by stop with the real drive time between each, back to a bed. Tap a day to open it — today opens itself.',
      ),
    );
    root.appendChild(head);

    const today = todayISO();
    for (const day of DAY_ROUTES) {
      const sec = daySection(day);
      if (DAY_DATE[day.dayId] === today) sec.classList.add('open');
      root.appendChild(sec);
    }

    // A day named in the URL (from the Don't-miss strip) opens and wins.
    const wanted = window.location.hash.slice(1);
    if (wanted) {
      const target = document.getElementById(wanted);
      if (target && target.classList.contains('rday')) {
        root.querySelectorAll('.rday.open').forEach((d) => d.classList.remove('open'));
        target.classList.add('open');
        requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
      }
    }

    // If nothing matched (pre-trip), open the first day so the page shows its shape.
    if (!root.querySelector('.rday.open')) root.querySelector('.rday')?.classList.add('open');

    // By Wednesday, today sits below five days already lived — bring it up.
    requestAnimationFrame(() => {
      const openDay = root.querySelector('.rday.open');
      if (openDay && DAY_DATE[openDay.id] === today) openDay.scrollIntoView({ block: 'start' });
    });
  }

  await loadFavs().catch(() => undefined);
  await loadAllDayPlans().catch(() => undefined);
  // Hearts seed the CURRENT day only when it has no saved plan yet — a
  // starting point, not an overwrite. Nothing saves until someone ticks.
  const saved = await getDayPlan(builder.day.dayId);
  if (saved.length === 0) {
    for (const id of allFavIds()) if (byId.has(id) && isFav(id)) builder.chosen.add(id);
  }
  await renderBuilder();

  const foot = document.getElementById('routes-foot');
  if (foot) {
    foot.innerHTML =
      'Leg times in the day loops are measured (Google, 23 Jul) · builder legs are estimates and say so · <a href="overview.html">the map →</a>';
  }
  mountNotes();
}

void main();
