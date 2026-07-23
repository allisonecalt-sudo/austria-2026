// ===========================================================================
// favorites.ts — renders favorites.html: OUR PICKS, as a comparison table.
//
// What this is: everything hearted anywhere on the site, laid out as a table
//   — one row per pick, grouped by the DAY you would do it.
// Why the columns are what they are (Allison, Jul 23 2026, verbatim):
//   "make it a table thing each one - its suggestion/location, distance from
//    place sleeping at night bf, distance from place sleeping night after,
//    top 2 things what makes it unique, why do it, time spent there. and 2
//    things it s near"  →  seven columns, exactly that order.
//   "and keep sunset stuff seperate"  →  sunsets get their own table below.
// Why grouped by day: "the bed before" and "the bed after" only have an
//   answer once you know WHICH DAY you are doing it — Sunday sleeps in
//   Goisern and wakes up in Zell. Grouping by day is what makes those two
//   columns truthful instead of decorative.
// Mobile (her main surface): the table collapses to one stacked card per
//   pick under 760px — labels come from CSS ::before, so there is never a
//   sideways scroll on a phone. Desktop gets the real grid.
// Numbers: src/table-data.ts, generated from Google Distance Matrix +
//   Geocoding on 2026-07-23. "Near" is straight-line and says so.
// ===========================================================================

import { BUILD_STAMP, DAYS, SITES, SUNSETS, byId } from './plan-data.js';
import { RAIN_BY_KEY } from './rain-data.js';
import { BASE_ORDER, TABLE_ROWS } from './table-data.js';
import { allFavIds, favWeight, heartButton, loadFavs, setSaveStatusSink } from './favs.js';
import { mountNotes } from './notes.js';

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

function mins(m: number): string {
  if (m <= 0) return 'walk';
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

/** near / mid / far, so distance reads as a colour before it reads as a number. */
function band(m: number): string {
  if (m <= 20) return 'near';
  if (m <= 60) return 'mid';
  return 'far';
}

// --- which bed each night ---------------------------------------------------
// Index into BASE_ORDER: 0 Bad Goisern · 1 Zell am See · 2 Gosau · 3 Wals.
// -1 = not a bed (the airport, on arrival and departure day).
interface DayBeds {
  before: number;
  after: number;
}

const BEDS: Record<string, DayBeds> = {
  fri24: { before: -1, after: 0 }, // land 07:50 → sleep Bad Goisern
  shabbat: { before: 0, after: 0 },
  sun26: { before: 0, after: 1 }, // Goisern → Zell
  mon27: { before: 1, after: 1 },
  tue28: { before: 1, after: 2 }, // Zell → Gosau
  wed29: { before: 2, after: 2 },
  thu30: { before: 2, after: 3 }, // Gosau → Wals
  fri31: { before: 3, after: -1 }, // fly home
};

function bedLabel(i: number): string {
  return i < 0 ? 'the airport' : BASE_ORDER[i].name;
}

function td(label: string, className: string, content: string | HTMLElement): HTMLElement {
  const cell = el('td', className);
  cell.setAttribute('data-label', label);
  if (typeof content === 'string') cell.innerHTML = content;
  else cell.appendChild(content);
  return cell;
}

function activityRow(id: string, beds: DayBeds, rerender: () => void): HTMLElement | null {
  const a = byId.get(id);
  const t = TABLE_ROWS[id];
  if (!a) return null;

  const tr = el('tr', 'trow');
  tr.setAttribute('data-id', id);

  // 1 — suggestion / location
  const what = el('div', 'cell-what');
  const link = el('a', 'row-name', `${a.emoji} ${esc(a.name)}`);
  (link as HTMLAnchorElement).href = a.maps;
  (link as HTMLAnchorElement).target = '_blank';
  (link as HTMLAnchorElement).rel = 'noopener';
  what.appendChild(link);
  what.appendChild(el('p', 'row-what', esc(a.what)));
  const links = el('p', 'row-links');
  const site = SITES[id];
  if (site) {
    const web = el('a', undefined, '↗ Website');
    (web as HTMLAnchorElement).href = site;
    (web as HTMLAnchorElement).target = '_blank';
    (web as HTMLAnchorElement).rel = 'noopener';
    links.appendChild(web);
    links.appendChild(document.createTextNode(' · '));
  }
  const full = el('a', undefined, '↗ Full logistics');
  (full as HTMLAnchorElement).href = `plan.html#${id}`;
  links.appendChild(full);
  what.appendChild(links);
  tr.appendChild(td('Suggestion', 'c-what', what));

  // 2 + 3 — from last night's bed, on to tonight's bed
  const from = beds.before >= 0 && t ? t.fromBase[beds.before] : null;
  const to = beds.after >= 0 && t ? t.fromBase[beds.after] : null;
  tr.appendChild(
    td(
      `🚗 from ${bedLabel(beds.before)}`,
      'c-drive',
      from === null
        ? '<span class="dim">from the airport</span>'
        : `<span class="pill ${band(from)}">${esc(mins(from))}</span>`,
    ),
  );
  tr.appendChild(
    td(
      `🚗 on to ${bedLabel(beds.after)}`,
      'c-drive',
      to === null
        ? '<span class="dim">then home</span>'
        : `<span class="pill ${band(to)}">${esc(mins(to))}</span>`,
    ),
  );

  // 4 — top 2 that make it unique
  const uniq = el('ul', 'row-uniq');
  for (const u of t?.unique ?? []) uniq.appendChild(el('li', undefined, esc(u)));
  tr.appendChild(td('What makes it unique', 'c-uniq', uniq));

  // 5 — why do it
  tr.appendChild(td('Why do it', 'c-why', esc(t?.why ?? a.what)));

  // 6 — time spent there
  const hours = a.chips.filter((c) => /open|daily|closed|book|reserve|\d\d[:.]\d\d/i.test(c));
  tr.appendChild(
    td(
      'Time there',
      'c-time',
      `<b>${esc(a.duration)}</b>${hours.length ? `<span class="hrs">${esc(hours.join(' · '))}</span>` : ''}`,
    ),
  );

  // 7 — 2 things it's near
  const nearList = el('ul', 'row-near');
  for (const n of t?.near ?? []) {
    const other = byId.get(n.id);
    if (!other) continue;
    const li = el('li');
    const na = el('a', undefined, `${other.emoji} ${esc(other.name)}`);
    (na as HTMLAnchorElement).href = `plan.html#${n.id}`;
    li.appendChild(na);
    li.appendChild(el('span', 'km', ` ${n.km} km`));
    nearList.appendChild(li);
  }
  tr.appendChild(td('Near it', 'c-near', nearList));

  tr.appendChild(td('', 'c-heart', heartButton(id, rerender)));
  return tr;
}

function tableShell(headers: string[]): { scroller: HTMLElement; body: HTMLElement } {
  const table = el('table', 'ptable');
  const thead = el('thead');
  const hr = el('tr');
  for (const h of headers) hr.appendChild(el('th', undefined, h));
  thead.appendChild(hr);
  table.appendChild(thead);
  const body = el('tbody');
  table.appendChild(body);
  const scroller = el('div', 'tscroll');
  scroller.appendChild(table);
  return { scroller, body };
}

function sectionHead(kicker: string, title: string, sub: string): HTMLElement {
  const head = el('header', 'dsec-head');
  head.appendChild(el('p', 'dsec-date', esc(kicker)));
  head.appendChild(el('h2', undefined, esc(title)));
  head.appendChild(el('p', 'dsec-beds', sub));
  return head;
}

function daySection(
  dayId: string,
  title: string,
  date: string,
  ids: string[],
  rerender: () => void,
): HTMLElement | null {
  if (ids.length === 0) return null;
  const beds = BEDS[dayId] ?? { before: -1, after: -1 };
  const sec = el('section', 'dsec');
  sec.id = `day-${dayId}`;
  sec.appendChild(
    sectionHead(
      date,
      title,
      `🛏 slept in <b>${esc(bedLabel(beds.before))}</b> → sleeping in <b>${esc(bedLabel(beds.after))}</b>`,
    ),
  );

  const { scroller, body } = tableShell([
    'Suggestion',
    `🚗 from ${bedLabel(beds.before)}`,
    `🚗 on to ${bedLabel(beds.after)}`,
    'What makes it unique',
    'Why do it',
    'Time there',
    'Near it',
    '',
  ]);
  let n = 0;
  for (const id of ids) {
    const row = activityRow(id, beds, rerender);
    if (row) {
      body.appendChild(row);
      n++;
    }
  }
  if (n === 0) return null;
  sec.appendChild(scroller);
  return sec;
}

/** Sunsets get their own table — her ask: "keep sunset stuff seperate". */
function sunsetSection(ids: string[], rerender: () => void): HTMLElement | null {
  if (ids.length === 0) return null;
  const sec = el('section', 'dsec');
  sec.appendChild(
    sectionHead(
      'kept separate',
      '🌅 Sunsets you chose',
      'One a night — these are spots, not day plans.',
    ),
  );
  const { scroller, body } = tableShell([
    'Spot',
    'Which night',
    'Time',
    'Why there',
    '🚗 from bed',
    '',
  ]);
  for (const id of ids) {
    const s = SUNSETS.find((x) => x.id === id);
    if (!s) continue;
    const tr = el('tr', 'trow');
    tr.setAttribute('data-id', id);
    tr.appendChild(td('Spot', 'c-what', `<span class="row-name">🌅 ${esc(s.name)}</span>`));
    tr.appendChild(td('Which night', 'c-drive', `<b>${esc(s.night)}</b>`));
    tr.appendChild(td('Time', 'c-time', `<b>${esc(s.time)}</b>`));
    tr.appendChild(td('Why there', 'c-why', esc(s.why)));
    tr.appendChild(td('🚗 from bed', 'c-drive', esc(s.drive)));
    tr.appendChild(td('', 'c-heart', heartButton(id, rerender)));
    body.appendChild(tr);
  }
  sec.appendChild(scroller);
  return sec;
}

function rainSection(ids: string[], rerender: () => void): HTMLElement | null {
  if (ids.length === 0) return null;
  const sec = el('section', 'dsec');
  sec.appendChild(
    sectionHead(
      'wet weather',
      '☂ Rainy-day picks',
      'Hearted on the rainy-day list — these live only there.',
    ),
  );
  const { scroller, body } = tableShell([
    'Suggestion',
    'Base',
    '🚗 from it',
    'Why do it',
    'Dry?',
    '',
  ]);
  for (const id of ids) {
    const hit = RAIN_BY_KEY.get(id);
    if (!hit) continue;
    const { pick: p, baseName } = hit;
    const tr = el('tr', 'trow');
    tr.setAttribute('data-id', id);
    const name = `${p.emoji ?? '•'} ${esc(p.name ?? id)}`;
    tr.appendChild(
      td(
        'Suggestion',
        'c-what',
        p.maps
          ? `<a class="row-name" href="${p.maps}" target="_blank" rel="noopener">${name}</a>`
          : `<span class="row-name">${name}</span>`,
      ),
    );
    tr.appendChild(td('Base', 'c-drive', esc(baseName)));
    tr.appendChild(
      td('🚗 from it', 'c-drive', `<span class="pill ${band(p.min)}">${esc(mins(p.min))}</span>`),
    );
    tr.appendChild(td('Why do it', 'c-why', esc(p.why)));
    tr.appendChild(
      td('Dry?', 'c-time', p.dryness === 'dry' ? '☂ <b>indoors</b>' : '💧 <b>fine wet</b>'),
    );
    tr.appendChild(td('', 'c-heart', heartButton(id, rerender)));
    body.appendChild(tr);
  }
  sec.appendChild(scroller);
  return sec;
}

function renderPicks(): void {
  const mount = document.getElementById('fav-body');
  if (!mount) return;
  mount.innerHTML = '';
  const rerender = (): void => renderPicks();

  const ids = allFavIds();
  if (ids.length === 0) {
    mount.appendChild(
      el(
        'div',
        'fav-empty',
        `<p class="fav-empty-big">Nothing hearted yet.</p>
         <p>Tap ❤️ on any card — on <a href="plan.html">The Plan</a>, <a href="bases.html">From your bed</a>,
         <a href="rain.html">Rainy day</a> or <a href="rank.html">Rank it</a> — and it shows up here as a row
         you can compare: how far from last night's bed, how far on to tonight's, what makes it worth it,
         and what else is right there.</p>`,
      ),
    );
    return;
  }

  const sunsetIds = ids.filter((id) => SUNSETS.some((s) => s.id === id));
  const rainIds = ids.filter((id) => !byId.has(id) && RAIN_BY_KEY.has(id));
  const actIds = ids.filter((id) => byId.has(id));
  const unknown = ids.filter(
    (id) => !byId.has(id) && !RAIN_BY_KEY.has(id) && !SUNSETS.some((s) => s.id === id),
  );

  mount.appendChild(el('p', 'fav-count', `${ids.length} picked · strongest first inside each day`));

  // Each activity shows on the FIRST day it is offered, so the before/after
  // beds are the real ones for that day.
  const placed = new Set<string>();
  for (const day of DAYS) {
    const mine = day.activityIds
      .filter((id) => actIds.includes(id) && !placed.has(id))
      .sort((x, y) => favWeight(y) - favWeight(x));
    mine.forEach((id) => placed.add(id));
    const sec = daySection(day.id, day.title, day.date, mine, rerender);
    if (sec) mount.appendChild(sec);
  }

  const orphans = actIds
    .filter((id) => !placed.has(id))
    .sort((x, y) => favWeight(y) - favWeight(x));
  if (orphans.length > 0) {
    const sec = el('section', 'dsec');
    sec.appendChild(
      sectionHead(
        'no fixed day',
        'Anywhere in the week',
        'Hearted but not tied to a day — distances are from the two nearest beds.',
      ),
    );
    const { scroller, body } = tableShell([
      'Suggestion',
      '🚗 nearest bed',
      '🚗 next nearest',
      'What makes it unique',
      'Why do it',
      'Time there',
      'Near it',
      '',
    ]);
    for (const id of orphans) {
      const t = TABLE_ROWS[id];
      if (!t) continue;
      const order = t.fromBase
        .map((m, i) => ({ m, i }))
        .sort((a, b) => a.m - b.m)
        .slice(0, 2);
      const row = activityRow(id, { before: order[0].i, after: order[1].i }, rerender);
      if (row) body.appendChild(row);
    }
    sec.appendChild(scroller);
    mount.appendChild(sec);
  }

  const rain = rainSection(rainIds, rerender);
  if (rain) mount.appendChild(rain);

  const sun = sunsetSection(sunsetIds, rerender);
  if (sun) mount.appendChild(sun);

  // Fail loud — a heart we cannot resolve is shown, never silently dropped.
  if (unknown.length > 0) {
    mount.appendChild(
      el(
        'div',
        'fav-empty',
        `<p class="fav-empty-big">⚠ ${unknown.length} hearted item${unknown.length > 1 ? 's' : ''} could not be matched</p>
         <p>${unknown.map(esc).join(', ')} — tell Claude rather than ignoring it.</p>`,
      ),
    );
  }
}

function renderShell(): void {
  const root = document.getElementById('favorites');
  if (!root) return;

  const wrap = el('div', 'bwrap');
  const intro = el('header', 'bintro');
  intro.appendChild(el('p', 'bkick', 'only what you hearted · one row each · grouped by day'));
  intro.appendChild(el('h1', undefined, 'Our picks ❤️'));
  intro.appendChild(
    el(
      'p',
      undefined,
      'Every pick as a row you can compare — how far from where you slept, how far on to where you sleep next, the two things that make it unique, why do it, how long it takes, and what else is right there.',
    ),
  );
  wrap.appendChild(intro);
  wrap.appendChild(el('p', 'save-note', '<span id="fav-status"></span>'));

  const body = el('div');
  body.id = 'fav-body';
  wrap.appendChild(body);
  root.appendChild(wrap);

  const foot = document.getElementById('fav-foot');
  if (foot) {
    foot.innerHTML = `drive times: Google Distance Matrix, pulled 23 Jul 2026, from each booked bed · “near” is straight-line · built ${BUILD_STAMP} · <a href="bases.html">every option per base →</a>`;
  }
}

async function main(): Promise<void> {
  renderShell();
  setSaveStatusSink((msg) => {
    const s = document.getElementById('fav-status');
    if (s) s.textContent = msg;
  });
  const body = document.getElementById('fav-body');
  if (body) body.innerHTML = '<p class="fav-count">loading your hearts…</p>';
  await loadFavs();
  renderPicks();
  if (window.location.hash) {
    document
      .querySelector(`[data-id="${window.location.hash.slice(1)}"]`)
      ?.scrollIntoView({ block: 'center' });
  }
  mountNotes();
}

void main();
