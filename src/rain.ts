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
import { RAIN_BASES as BASES, rainKey, type RainBase, type RainPick } from './rain-data.js';
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
    row.appendChild(
      el('p', 'bp-why', `⚠ unresolvable rainy-day entry: ${esc(p.id ?? p.name ?? '?')}`),
    );
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
    p.dryness === 'dry' ? el('span', 'bt bt-dry', 'indoors') : el('span', 'bt bt-wet', 'fine wet'),
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

  // ❤️ (Jul 23, Avital): heart it here and it lands on favorites.html.
  const key = rainKey(p);
  row.setAttribute('data-id', key);
  row.appendChild(heartButton(key));

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

  wrap.appendChild(
    el(
      'p',
      'save-note',
      'Tap ❤️ on anything → <a href="favorites.html">Our picks</a> · <span id="fav-status"></span>',
    ),
  );

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
