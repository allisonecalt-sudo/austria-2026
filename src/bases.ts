// ===========================================================================
// bases.ts — renders bases.html: WHAT'S NEAR TONIGHT'S BED.
//
// What: the trip sliced by where you sleep instead of by day. Four beds, a
//   ranked top 10 each, nothing further than ~1.5h drive from that bed.
// Why (Allison, Jul 23): "by area make a list of top places to see, the ones
//   we will want most, each 1.5 hrs from sleeping... top 10."
// Data: names / maps / websites come from plan-data.ts (single source of
//   truth). The only new facts here are (a) minutes from THIS base, lifted
//   from the verified `drive` strings in plan-data, and (b) the why-from-here
//   line. Nothing is estimated.
// Ranking: no hearts exist yet (austria_2026_state is empty), so the order is
//   Claude's, from the `star` lifetime flags + the committed itinerary + her
//   bias to water/boats/sunsets over climbs. Hearts on rank.html outrank it.
// ===========================================================================

import { BUILD_STAMP, SITES, byId } from './plan-data.js';
import { BASES, type Base, type Pick } from './bases-data.js';
import { TABLE_ROWS } from './table-data.js';
import { heartButton, loadFavs, refreshHearts, setSaveStatusSink } from './favs.js';
import { mountNotes } from './notes.js';
import { mountNav } from './nav.js';

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

/** "walk" · "25 min" · "1h10" — never a bare number. */
function driveLabel(min: number): string {
  if (min === 0) return 'walk';
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
}

/** Distance band — under 15 / 15–45 / over 45, so "close" reads at a glance. */
function band(min: number): string {
  if (min <= 15) return 'near';
  if (min <= 45) return 'mid';
  return 'far';
}

/** bed number (1..4) -> index in the measured fromBase arrays. */
const BED_INDEX: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3 };

function pickRow(p: Pick, rank: number, bedIdx: number): HTMLElement {
  const a = byId.get(p.id);
  const row = el('li', 'bp');
  if (!a) {
    // Fail loud (spec A11): a broken id shows itself, never a silent gap.
    row.appendChild(el('p', 'bp-why', `⚠ unknown activity id: ${esc(p.id)}`));
    return row;
  }

  row.appendChild(el('span', 'bp-rank', String(rank)));

  const head = el('div', 'bp-head');
  const link = el('a', 'bp-name', `${a.emoji} ${esc(a.name)}`);
  (link as HTMLAnchorElement).href = a.maps;
  (link as HTMLAnchorElement).target = '_blank';
  (link as HTMLAnchorElement).rel = 'noopener';
  head.appendChild(link);

  const tags = el('span', 'bp-tags');
  if (a.star) tags.appendChild(el('span', 'bt bt-star', '★ lifetime'));
  if (a.swim) tags.appendChild(el('span', 'bt bt-water', 'water'));
  if (a.sunset) tags.appendChild(el('span', 'bt bt-sunset', 'sunset'));
  if (a.jewish) tags.appendChild(el('span', 'bt bt-mean', 'meaningful'));
  head.appendChild(tags);
  row.appendChild(head);

  // AUDIT FIX (23 Jul): 24 of 35 hand-typed minutes disagreed with the
  // measured table under a footer claiming "nothing is estimated". The
  // measured number wins; the typed one is only the fallback.
  const measured = TABLE_ROWS[p.id]?.fromBase?.[bedIdx];
  const minutes = typeof measured === 'number' ? measured : p.min;
  const drive = el('span', `bp-drive bp-${band(minutes)}`, `🚗 ${esc(driveLabel(minutes))}`);
  row.appendChild(drive);

  row.appendChild(el('p', 'bp-why', esc(p.why)));

  const site = SITES[p.id];
  if (site) {
    const links = el('p', 'bp-links');
    const web = el('a', undefined, '↗ Website');
    (web as HTMLAnchorElement).href = site;
    (web as HTMLAnchorElement).target = '_blank';
    (web as HTMLAnchorElement).rel = 'noopener';
    links.appendChild(web);
    row.appendChild(links);
  }

  // ❤️ (Jul 23, Avital): heart it here and it lands on favorites.html.
  row.setAttribute('data-id', p.id);
  row.appendChild(heartButton(p.id));

  return row;
}

function baseSection(b: Base): HTMLElement {
  const sec = el('section', 'bbase');

  const head = el('div', 'bbase-head');
  head.appendChild(el('span', 'bbase-num', String(b.n)));
  const ht = el('div', 'bbase-ht');
  ht.appendChild(el('h2', undefined, esc(b.name)));
  ht.appendChild(el('p', 'bbase-lodging', `${esc(b.lodging)} · ${esc(b.dates)}`));
  head.appendChild(ht);
  sec.appendChild(head);

  sec.appendChild(el('p', 'bbase-reality', esc(b.reality)));

  const list = el('ol', 'bpicks');
  b.picks.forEach((p, i) => list.appendChild(pickRow(p, i + 1, BED_INDEX[b.n] ?? 0)));
  sec.appendChild(list);

  return sec;
}

function render(): void {
  const root = document.getElementById('bases');
  if (!root) return;

  const wrap = el('div', 'bwrap');

  const intro = el('header', 'bintro');
  intro.appendChild(el('p', 'bkick', 'four beds · nothing over ~1.5 hours away'));
  intro.appendChild(el('h1', undefined, 'From tonight’s bed'));
  intro.appendChild(
    el(
      'p',
      undefined,
      'The trip sliced by where you sleep instead of by day — so you can pick what to do from wherever you wake up. Tap a name to navigate.',
    ),
  );
  wrap.appendChild(intro);

  wrap.appendChild(
    el(
      'p',
      'save-note',
      'Tap ❤️ on anything → <a href="favorites.html">Our picks</a> · <span id="fav-status"></span>',
    ),
  );

  // Show the one thing that matters, dropdown the rest (her cards rule).
  const caveat = el('details', 'bcaveat');
  caveat.innerHTML = `
    <summary>How this list is ranked<span aria-hidden="true">＋</span></summary>
    <div class="bcaveat-body">
      <p>The order is Claude's: the must-do flags, what made the committed week, and your bias to water, boats and sunsets over climbs. Tap ❤️ on any row to collect it on <a href="favorites.html">Our picks</a> — that page is where your choices live.</p>
      <p><b>Goisern and Gosau are the same lake country</b>, 20 minutes apart — so Gosau's list below only shows what Gosau itself owns, and points back here for the rest.</p>
      <p><b>Mauthausen is on no list</b> — 1h40 from Goisern, just past the line. It is the Friday arrival anchor, driven from the airport rather than from a bed.</p>
      <p>Drive times are the verified ones from the plan, measured from each base. Nothing is estimated.</p>
    </div>
  `;
  wrap.appendChild(caveat);

  BASES.forEach((b) => wrap.appendChild(baseSection(b)));

  root.appendChild(wrap);

  const foot = document.getElementById('bases-foot');
  if (foot) {
    foot.innerHTML = `❤️ collects on <a href="favorites.html">Our picks</a> · built ${BUILD_STAMP} · <a href="plan.html">all options →</a>`;
  }

  mountNotes();
}

async function main(): Promise<void> {
  render();
  setSaveStatusSink((msg) => {
    const s = document.getElementById('fav-status');
    if (s) s.textContent = msg;
  });
  await loadFavs();
  refreshHearts();
}

void main();

mountNav();
