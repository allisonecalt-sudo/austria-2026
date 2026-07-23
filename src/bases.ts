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
import { heartButton, isFav, loadFavs, setSaveStatusSink, whoBar } from './favs.js';
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

function pickRow(p: Pick, rank: number): HTMLElement {
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

  const drive = el('span', `bp-drive bp-${band(p.min)}`, `🚗 ${esc(driveLabel(p.min))}`);
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
  b.picks.forEach((p, i) => list.appendChild(pickRow(p, i + 1)));
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

  // Hearts save per person — ask who is holding the phone before saving.
  wrap.appendChild(whoBar(() => refreshHearts()));
  wrap.appendChild(
    el(
      'p',
      'save-note',
      '❤️ saves to <a href="favorites.html">Our picks</a> · <span id="fav-status"></span>',
    ),
  );

  // Show the one thing that matters, dropdown the rest (her cards rule).
  const caveat = el('details', 'bcaveat');
  caveat.innerHTML = `
    <summary>Ranked by Claude — no hearts saved yet<span aria-hidden="true">＋</span></summary>
    <div class="bcaveat-body">
      <p>The hearts on <a href="rank.html">Rank it ⭐</a> are still empty, so this order is Claude's: the must-do flags, what made the committed week, and your bias to water, boats and sunsets over climbs. Tap hearts and this can be re-sorted to match.</p>
      <p><b>Goisern and Gosau overlap</b> — 30 minutes apart, so their lists share the Salzkammergut. The real split: Wolfgangsee, Grundlsee and Ebensee are closer to Goisern; the Gosausee and Dachstein belong to Gosau.</p>
      <p><b>Mauthausen is on no list</b> — 1h40 from Goisern, just past the line. It is the Friday arrival anchor, driven from the airport rather than from a bed.</p>
      <p>Drive times are the verified ones from the plan, measured from each base. Nothing is estimated.</p>
    </div>
  `;
  wrap.appendChild(caveat);

  BASES.forEach((b) => wrap.appendChild(baseSection(b)));

  root.appendChild(wrap);

  const foot = document.getElementById('bases-foot');
  if (foot) {
    foot.innerHTML = `ranked by Claude until your hearts say otherwise · built ${BUILD_STAMP} · <a href="plan.html">all options →</a>`;
  }

  mountNotes();
}

/** Paint first, colour the hearts when Supabase answers. */
function refreshHearts(): void {
  document.querySelectorAll<HTMLElement>('.bp[data-id]').forEach((row) => {
    const id = row.getAttribute('data-id');
    const btn = row.querySelector<HTMLButtonElement>('button.fav');
    if (!id || !btn) return;
    const on = isFav(id);
    btn.className = on ? 'fav on' : 'fav';
    btn.setAttribute('aria-pressed', String(on));
  });
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
