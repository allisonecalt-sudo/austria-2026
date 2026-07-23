// ===========================================================================
// favorites.ts — renders favorites.html: OUR PICKS.
//
// What this is: the same by-where-you-sleep view as bases.html, filtered down
//   to only the things you two actually hearted. Nothing else.
// Why it exists: Avital's ask (Allison, Jul 23 2026) — "you heart something
//   and it goes to a separate favorite, same view of location but just only
//   the things we chose."
// Decided:
//   • Grouping = the four beds (bases-data.ts), same order as bases.html.
//   • A pick that sits in TWO bases' lists (Goisern and Gosau overlap) is
//     filed under the base it is CLOSEST to — shown once, not twice.
//   • Hearted things that belong to no base list get an "Anywhere" section
//     rather than vanishing (fail-loud: never silently drop a choice).
//   • Sunset hearts from rank.html get their own section — they are spots,
//     not day activities.
//   • Sorted by combined heart weight: both-of-you and 3-heart wants first.
// Built: 2026-07-23. Links: favs.ts (the store) · bases-data.ts (the beds) ·
//   plan-data.ts (the facts) · rank.html (0–3 hearts).
// ===========================================================================

import { BUILD_STAMP, SITES, SUNSETS, byId } from './plan-data.js';
import { BASES, type Pick } from './bases-data.js';
import { RAIN_BY_KEY } from './rain-data.js';
import {
  allFavIds,
  favBy,
  favWeight,
  heartButton,
  loadFavs,
  setSaveStatusSink,
  whoBar,
} from './favs.js';
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

function driveLabel(min: number): string {
  if (min === 0) return 'walk';
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
}

function band(min: number): string {
  if (min <= 15) return 'near';
  if (min <= 45) return 'mid';
  return 'far';
}

/** "Allison ❤️ · Avital ❤️" — who wanted this, always visible. */
function wantedBy(id: string): HTMLElement {
  const f = favBy(id);
  const tag = el('span', 'bp-tags');
  if (f.both) {
    tag.appendChild(el('span', 'bt bt-both', '❤️ both of you'));
  } else if (f.allison) {
    tag.appendChild(el('span', 'bt bt-one', '❤️ Allison'));
  } else if (f.avital) {
    tag.appendChild(el('span', 'bt bt-one', '❤️ Avital'));
  }
  return tag;
}

// --- Which base does a hearted activity belong to? --------------------------
// A pick can appear on more than one base list (Goisern and Gosau are 30 min
// apart and share the Salzkammergut). Show it once, under the closest bed.
interface Placed {
  baseIndex: number;
  pick: Pick;
}

function placeById(): Map<string, Placed> {
  const home = new Map<string, Placed>();
  BASES.forEach((b, bi) => {
    for (const p of b.picks) {
      const current = home.get(p.id);
      if (!current || p.min < current.pick.min) {
        home.set(p.id, { baseIndex: bi, pick: p });
      }
    }
  });
  return home;
}

function pickRow(
  id: string,
  min: number | null,
  why: string | null,
  rerender: () => void,
): HTMLElement {
  const a = byId.get(id);
  const row = el('li', 'bp');
  if (!a) {
    row.appendChild(el('p', 'bp-why', `⚠ unknown activity id: ${esc(id)}`));
    return row;
  }

  const head = el('div', 'bp-head');
  const link = el('a', 'bp-name', `${a.emoji} ${esc(a.name)}`);
  (link as HTMLAnchorElement).href = a.maps;
  (link as HTMLAnchorElement).target = '_blank';
  (link as HTMLAnchorElement).rel = 'noopener';
  head.appendChild(link);
  head.appendChild(wantedBy(id));
  row.appendChild(head);

  if (min !== null) {
    row.appendChild(el('span', `bp-drive bp-${band(min)}`, `🚗 ${esc(driveLabel(min))}`));
  } else {
    // No base list = no measured minutes from a bed. Use the verified string
    // from plan-data rather than inventing a number.
    row.appendChild(el('span', 'bp-drive bp-mid', esc(a.drive)));
  }

  row.appendChild(el('p', 'bp-why', esc(why ?? a.what)));

  // ⏱ timing, always — hours/duration live in plan-data's chips + duration.
  const timing = el('p', 'bp-when', `⏱ ${esc(a.duration)}`);
  const hours = a.chips.filter((c) => /\d|open|daily|closed|book|reserve/i.test(c));
  if (hours.length > 0) timing.innerHTML += ` · ${esc(hours.join(' · '))}`;
  row.appendChild(timing);

  const links = el('p', 'bp-links');
  const site = SITES[id];
  if (site) {
    const web = el('a', undefined, '↗ Website');
    (web as HTMLAnchorElement).href = site;
    (web as HTMLAnchorElement).target = '_blank';
    (web as HTMLAnchorElement).rel = 'noopener';
    links.appendChild(web);
    links.appendChild(document.createTextNode(' '));
  }
  const plan = el('a', undefined, '↗ Full logistics');
  (plan as HTMLAnchorElement).href = `plan.html#${id}`;
  links.appendChild(plan);
  row.appendChild(links);

  row.appendChild(heartButton(id, rerender));
  return row;
}

function sunsetRow(id: string, rerender: () => void): HTMLElement | null {
  const s = SUNSETS.find((x) => x.id === id);
  if (!s) return null;
  const row = el('li', 'bp');

  const head = el('div', 'bp-head');
  head.appendChild(el('span', 'bp-name', `🌅 ${esc(s.name)}`));
  head.appendChild(wantedBy(id));
  row.appendChild(head);

  row.appendChild(el('span', 'bp-drive bp-near', esc(s.drive)));
  row.appendChild(el('p', 'bp-why', esc(s.why)));
  row.appendChild(el('p', 'bp-when', `⏱ ${esc(s.night)} · ${esc(s.time)}`));
  row.appendChild(heartButton(id, rerender));
  return row;
}

/** A hearted rainy-day place that isn't in plan-data (e.g. a museum added
 *  only for the wet list). Rendered from rain-data so no heart is ever lost. */
function rainRow(id: string, rerender: () => void): HTMLElement | null {
  const hit = RAIN_BY_KEY.get(id);
  if (!hit) return null;
  const { pick: p, baseName } = hit;
  const row = el('li', 'bp');

  const head = el('div', 'bp-head');
  const name = `${p.emoji ?? '•'} ${esc(p.name ?? id)}`;
  if (p.maps) {
    const link = el('a', 'bp-name', name);
    (link as HTMLAnchorElement).href = p.maps;
    (link as HTMLAnchorElement).target = '_blank';
    (link as HTMLAnchorElement).rel = 'noopener';
    head.appendChild(link);
  } else {
    head.appendChild(el('span', 'bp-name', name));
  }
  const tags = wantedBy(id);
  tags.appendChild(
    p.dryness === 'dry' ? el('span', 'bt bt-dry', 'indoors') : el('span', 'bt bt-wet', 'fine wet'),
  );
  if (p.check) tags.appendChild(el('span', 'bt bt-check', 'confirm hours'));
  head.appendChild(tags);
  row.appendChild(head);

  row.appendChild(
    el('span', `bp-drive bp-${band(p.min)}`, `🚗 ${esc(driveLabel(p.min))} from ${esc(baseName)}`),
  );
  row.appendChild(el('p', 'bp-why', esc(p.why)));
  if (p.site) {
    const links = el('p', 'bp-links');
    const web = el('a', undefined, '↗ Website');
    (web as HTMLAnchorElement).href = p.site;
    (web as HTMLAnchorElement).target = '_blank';
    (web as HTMLAnchorElement).rel = 'noopener';
    links.appendChild(web);
    row.appendChild(links);
  }
  row.appendChild(heartButton(id, rerender));
  return row;
}

function section(title: string, sub: string, num: string): HTMLElement {
  const sec = el('section', 'bbase');
  const head = el('div', 'bbase-head');
  head.appendChild(el('span', 'bbase-num', num));
  const ht = el('div', 'bbase-ht');
  ht.appendChild(el('h2', undefined, esc(title)));
  if (sub) ht.appendChild(el('p', 'bbase-lodging', esc(sub)));
  head.appendChild(ht);
  sec.appendChild(head);
  return sec;
}

function renderPicks(): void {
  const mount = document.getElementById('fav-body');
  if (!mount) return;
  mount.innerHTML = '';

  const ids = allFavIds();
  const sunsetIds = ids.filter((id) => SUNSETS.some((s) => s.id === id));
  const actIds = ids.filter((id) => byId.has(id));
  const rainIds = ids.filter((id) => !byId.has(id) && RAIN_BY_KEY.has(id));
  const unknown = ids.filter(
    (id) => !byId.has(id) && !RAIN_BY_KEY.has(id) && !SUNSETS.some((s) => s.id === id),
  );

  if (ids.length === 0) {
    const empty = el('div', 'fav-empty');
    empty.innerHTML = `
      <p class="fav-empty-big">Nothing hearted yet.</p>
      <p>Tap ❤️ on any card — on <a href="plan.html">The Plan</a>, <a href="bases.html">From your bed</a>,
      <a href="rain.html">Rainy day</a> or <a href="rank.html">Rank it</a> — and it lands here, grouped by the
      bed you'll be sleeping in.</p>
      <p class="fav-empty-note">Hearts save for whoever is selected above, so pick your name first.</p>`;
    mount.appendChild(empty);
    return;
  }

  const home = placeById();
  const rerender = (): void => renderPicks();

  // --- by base -------------------------------------------------------------
  const used = new Set<string>();
  BASES.forEach((b, bi) => {
    const mine = actIds
      .filter((id) => home.get(id)?.baseIndex === bi)
      .sort((x, y) => favWeight(y) - favWeight(x));
    if (mine.length === 0) return;

    const sec = section(b.name, `${b.lodging} · ${b.dates}`, String(b.n));
    const list = el('ol', 'bpicks');
    for (const id of mine) {
      used.add(id);
      const p = home.get(id);
      list.appendChild(pickRow(id, p ? p.pick.min : null, p ? p.pick.why : null, rerender));
    }
    sec.appendChild(list);
    mount.appendChild(sec);
  });

  // --- hearted, but on no base's top-10 (never silently dropped) ------------
  const orphans = actIds.filter((id) => !used.has(id)).sort((x, y) => favWeight(y) - favWeight(x));
  if (orphans.length > 0) {
    const sec = section(
      'Anywhere',
      'hearted, but not on any base’s top-10 list — drive time is from the plan',
      '＋',
    );
    const list = el('ol', 'bpicks');
    for (const id of orphans) list.appendChild(pickRow(id, null, null, rerender));
    sec.appendChild(list);
    mount.appendChild(sec);
  }

  // --- sunsets -------------------------------------------------------------
  if (sunsetIds.length > 0) {
    const sec = section('Sunsets you chose', 'from the sunset board on Rank it', '🌅');
    const list = el('ol', 'bpicks');
    for (const id of sunsetIds.sort((x, y) => favWeight(y) - favWeight(x))) {
      const row = sunsetRow(id, rerender);
      if (row) list.appendChild(row);
    }
    sec.appendChild(list);
    mount.appendChild(sec);
  }

  // --- rainy-day-only places (hearted on the wet list) ----------------------
  if (rainIds.length > 0) {
    const sec = section('Rainy-day picks', 'hearted on the wet list — these live only there', '☂');
    const list = el('ol', 'bpicks');
    for (const id of rainIds.sort((x, y) => favWeight(y) - favWeight(x))) {
      const row = rainRow(id, rerender);
      if (row) list.appendChild(row);
    }
    sec.appendChild(list);
    mount.appendChild(sec);
  }

  // --- fail loud on anything we can't resolve ------------------------------
  if (unknown.length > 0) {
    const sec = section(
      '⚠ Unrecognised',
      'hearted ids with no matching activity — tell Claude',
      '!',
    );
    const list = el('ol', 'bpicks');
    for (const id of unknown) {
      const row = el('li', 'bp');
      row.appendChild(el('p', 'bp-why', `⚠ ${esc(id)}`));
      list.appendChild(row);
    }
    sec.appendChild(list);
    mount.appendChild(sec);
  }

  const count = el('p', 'fav-count');
  count.textContent = `${ids.length} picked · ${
    ids.filter((id) => favBy(id).both).length
  } wanted by both of you`;
  mount.insertBefore(count, mount.firstChild);
}

function renderShell(): void {
  const root = document.getElementById('favorites');
  if (!root) return;

  const wrap = el('div', 'bwrap');

  const intro = el('header', 'bintro');
  intro.appendChild(el('p', 'bkick', 'only what you hearted · grouped by where you sleep'));
  intro.appendChild(el('h1', undefined, 'Our picks ❤️'));
  intro.appendChild(
    el(
      'p',
      undefined,
      'Everything either of you hearted anywhere on the site, filtered down and sorted so the strongest wants sit on top. Hearts on Rank it count too. Tap a name to navigate; tap the heart to remove it.',
    ),
  );
  wrap.appendChild(intro);

  wrap.appendChild(whoBar(() => renderPicks()));
  wrap.appendChild(el('p', 'save-note', '<span id="fav-status"></span>'));

  const body = el('div');
  body.id = 'fav-body';
  wrap.appendChild(body);

  root.appendChild(wrap);

  const foot = document.getElementById('fav-foot');
  if (foot) {
    foot.innerHTML = `hearts live in the shared trip base — both phones, and Claude, read the same list · built ${BUILD_STAMP} · <a href="bases.html">every option per base →</a>`;
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
  mountNotes();
}

void main();
