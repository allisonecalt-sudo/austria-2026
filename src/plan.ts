// ===========================================================================
// plan.ts — renders plan.html: the day-by-day OPTIONS MENU.
//
// Goal (Allison, Jul 17): "present options — main goal for us to choose from,
//   with logistics." Every activity card: photo, what-it-is, 🚗 DISTANCE
//   (always), and click-to-expand full logistics (price/hours/caveats) with
//   Navigate + quick-note actions. Choosing itself happens on rank.html.
// Data: src/plan-data.ts (single source of truth). Notes: austria_notes.
// ===========================================================================

import { ACTIVITIES, BUILD_STAMP, DAYS, SITES, byId, type Activity } from './plan-data.js';
import { insertNote } from './supabase.js';
import { heartButton, loadFavs, refreshHearts, setSaveStatusSink } from './favs.js';
import { mountNotes } from './notes.js';
import { rainCall, rainLabel, worksInRain } from './rain-ok.js';
import { bulletsFor } from './bullets.js';
import { SHABBAT_RULE, shabbatCheck } from './shabbat.js';
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

const DIFF_LABEL: Record<Activity['difficulty'], string> = {
  flat: '🚶 flat / no effort',
  easy: '🥾 easy',
  moderate: '⛰️ moderate',
};

function actCard(a: Activity): HTMLElement {
  const card = el('article', 'act');
  card.setAttribute('data-id', a.id);

  const img = el('div', 'img');
  img.style.backgroundImage = `url('${a.photo}')`;
  if (a.star) img.appendChild(el('span', 'star', '⭐ must-do candidate'));
  // ❤️ sits ON the photo, not inside the expand panel — mobile is the main
  // way this is used, so hearting must never cost an extra tap to reveal.
  img.appendChild(heartButton(a.id));
  card.appendChild(img);

  const ct = el('div', 'ct');
  ct.appendChild(el('h3', undefined, `${a.emoji} ${esc(a.name)}`));

  // Three bullets, useful thing first — Avital's ask. The prose still exists,
  // but it now sits behind the tap instead of being the first thing read.
  const b = bulletsFor(a);
  const bl = el('ul', 'bul');
  bl.appendChild(el('li', 'bul-what', esc(b.what)));
  bl.appendChild(el('li', 'bul-know', esc(b.know)));
  bl.appendChild(el('li', 'bul-time', esc(b.time)));
  ct.appendChild(bl);

  ct.appendChild(el('p', 'drive', esc(a.drive)));

  const chips = el('div', 'chips');
  chips.appendChild(el('span', 'chip', esc(DIFF_LABEL[a.difficulty])));
  chips.appendChild(el('span', 'chip', `⏱ ${esc(a.duration)}`));
  if (a.sunset) chips.appendChild(el('span', 'chip', '🌅 sunset spot'));
  if (a.swim) chips.appendChild(el('span', 'chip', '🏊 swim'));
  for (const c of a.chips) {
    const warn = /reserve|closed|weather|call|layers/i.test(c);
    chips.appendChild(el('span', warn ? 'chip warn' : 'chip', esc(c)));
  }
  // Does the rain ruin it? Her ask: keep every idea, just say which survive.
  const rain = rainCall(a.id);
  if (rain) {
    const lab = rainLabel(rain.ok);
    const chip = el('span', `chip rain-${rain.ok}`, `${lab.icon} ${esc(lab.short)}`);
    chip.title = `${rain.why} (${rain.basis})`;
    chips.appendChild(chip);
  }
  ct.appendChild(chips);

  if (rain) card.setAttribute('data-rain', rain.ok);

  // Her correction, Jul 23: "we cant go on boats on shabbat" — and it is not
  // only boats. Every card states what it would require, so nothing on this
  // site can quietly look available between Friday night and Saturday night.
  const shab = shabbatCheck(a.id);
  if (shab) card.setAttribute('data-shabbat', shab.ok ? 'ok' : 'no');

  const more = el('div', 'more');
  more.appendChild(el('p', 'more-lead', 'The detail'));
  more.appendChild(el('p', undefined, esc(a.more)));
  if (rain) {
    const lab = rainLabel(rain.ok);
    more.appendChild(el('p', 'rain-why', `${lab.icon} In rain: ${esc(rain.why)}`));
  }
  if (shab && !shab.ok) {
    more.appendChild(el('p', 'shabbat-why', `🕯️ ${esc(shab.note)}`));
  }
  const row = el('div', 'row');
  const nav = el('a', 'btn go', '📍 Navigate');
  (nav as HTMLAnchorElement).href = a.maps;
  (nav as HTMLAnchorElement).target = '_blank';
  (nav as HTMLAnchorElement).rel = 'noopener';
  nav.addEventListener('click', (e) => e.stopPropagation());
  row.appendChild(nav);

  const siteUrl = SITES[a.id];
  if (siteUrl) {
    const site = el('a', 'btn', '↗ Website');
    (site as HTMLAnchorElement).href = siteUrl;
    (site as HTMLAnchorElement).target = '_blank';
    (site as HTMLAnchorElement).rel = 'noopener';
    site.addEventListener('click', (e) => e.stopPropagation());
    row.appendChild(site);
  }

  const note = el('button', 'btn', '💬 Note this');
  note.addEventListener('click', (e) => {
    e.stopPropagation();
    void quickNote(a, note as HTMLButtonElement);
  });
  row.appendChild(note);

  const rankLink = el('a', 'btn', '⭐ Rank it');
  (rankLink as HTMLAnchorElement).href = `rank.html#${a.id}`;
  rankLink.addEventListener('click', (e) => e.stopPropagation());
  row.appendChild(rankLink);

  more.appendChild(row);
  ct.appendChild(more);
  ct.appendChild(el('p', 'hint', 'tap for the detail ▾'));
  card.appendChild(ct);

  card.addEventListener('click', () => {
    card.classList.toggle('open');
    const hint = card.querySelector('.hint');
    if (hint)
      hint.textContent = card.classList.contains('open')
        ? 'tap to close ▴'
        : 'tap for the detail ▾';
  });
  return card;
}

async function quickNote(a: Activity, btn: HTMLButtonElement): Promise<void> {
  const who = window.prompt(`Who is this from? (allison / avital)`, 'avital');
  if (who === null) return;
  const text = window.prompt(`Note on “${a.name}” — swap idea, yes please, skip it, anything:`);
  if (text === null || text.trim() === '') return;
  btn.disabled = true;
  btn.textContent = 'saving…';
  try {
    await insertNote({
      option: 'general',
      activity_id: a.id,
      note_text: text.trim(),
      author: who.trim().toLowerCase() || 'avital',
    });
    btn.textContent = '✓ saved';
  } catch {
    btn.textContent = 'failed — try again';
    btn.disabled = false;
    return;
  }
  window.setTimeout(() => {
    btn.textContent = '💬 Note this';
    btn.disabled = false;
  }, 2000);
}

function render(): void {
  const root = document.getElementById('plan');
  if (!root) return;

  const hero = el('header', 'plan-hero');
  hero.style.backgroundImage = `url('${byId.get('gosausee')?.photo ?? ''}')`;
  const ht = el('div', 'ht');
  ht.appendChild(el('p', 'kick', 'You + Avital · Fri Jul 24 → Fri Jul 31 · options, not orders'));
  ht.appendChild(el('h1', undefined, 'The Plan — choose your week 🏔️'));
  ht.appendChild(
    el(
      'p',
      undefined,
      'Every day is a menu. Tap any card for the logistics — distance, price, hours, honest caveats — then tap ❤️ on anything you want and it lands on Our picks. Built on what you two love: one anchor a day, water, quiet, the lifts do the climbing, a sunset every night.',
    ),
  );
  hero.appendChild(ht);
  root.appendChild(hero);

  const savebar = el('div', 'wrap savebar');
  savebar.appendChild(
    el(
      'p',
      'save-note',
      'Tap ❤️ on anything → <a href="favorites.html">Our picks</a> · <span id="fav-status"></span>',
    ),
  );
  root.appendChild(savebar);

  // ☂ filter — keeps every idea on the page and just narrows to what survives
  // a wet day. Deep-linked from the hub when today's forecast is wet.
  const filter = el('div', 'wrap rainfilter');
  const all = el('button', 'rfbtn on', 'All options');
  const wet = el('button', 'rfbtn', '☂ Works in the rain');
  const count = el('span', 'rfcount');
  const apply = (rainOnly: boolean): void => {
    let shown = 0;
    document.querySelectorAll<HTMLElement>('.act').forEach((c) => {
      const id = c.getAttribute('data-id') ?? '';
      const keep = !rainOnly || worksInRain(id);
      c.style.display = keep ? '' : 'none';
      if (keep) shown++;
    });
    // Hide a day that has nothing left, so she isn't scrolling empty headers.
    document.querySelectorAll<HTMLElement>('.day').forEach((d) => {
      const any = d.querySelector('.act:not([style*="display: none"])');
      d.style.display = d.querySelector('.act') && !any ? 'none' : '';
    });
    all.classList.toggle('on', !rainOnly);
    wet.classList.toggle('on', rainOnly);
    count.textContent = rainOnly ? `${shown} still work wet` : '';
  };
  all.addEventListener('click', () => apply(false));
  wet.addEventListener('click', () => apply(true));
  filter.appendChild(all);
  filter.appendChild(wet);
  filter.appendChild(count);
  root.appendChild(filter);
  // Applied after the cards render, at the end of render().
  window.setTimeout(
    () => apply(new URLSearchParams(window.location.search).get('rain') === '1'),
    0,
  );

  // Day-jump bar — her spec (Jul 20): clear + simple, easy to move around.
  const jump = el('div', 'plan-nav jump');
  for (const day of DAYS) {
    const a = el('a', undefined, esc(day.date.replace(' Jul ', ' ')));
    (a as HTMLAnchorElement).href = `#${day.id}`;
    jump.appendChild(a);
  }
  root.appendChild(jump);

  const wrap = el('div', 'wrap');
  for (const day of DAYS) {
    const sec = el('section', 'day');
    sec.id = day.id;
    const head = el('div', 'day-head');
    head.appendChild(el('p', 'date', esc(day.date)));
    head.appendChild(el('h2', undefined, esc(day.title)));
    head.appendChild(el('p', 'kick', esc(day.kicker)));
    sec.appendChild(head);
    sec.appendChild(el('p', 'day-intro', esc(day.intro)));
    if (day.note) sec.appendChild(el('p', 'day-note', esc(day.note)));

    // Shabbat binds three ways at once — say so where she will actually see it,
    // instead of leaving her to work out which cards are even possible.
    if (day.id === 'shabbat') {
      sec.appendChild(el('p', 'shabbat-rule', `🕯️ ${esc(SHABBAT_RULE)}`));
    }

    if (day.activityIds.length > 0) {
      const grid = el('div', 'acts');
      for (const id of day.activityIds) {
        const a = byId.get(id);
        if (a) grid.appendChild(actCard(a));
      }
      sec.appendChild(grid);
    }
    wrap.appendChild(sec);
  }
  root.appendChild(wrap);

  const foot = document.getElementById('plan-foot');
  if (foot) {
    foot.innerHTML = `${ACTIVITIES.length} options · every one verified open for late July 2026 · built ${BUILD_STAMP} · <a href="favorites.html">see Our picks ❤️ →</a>`;
  }

  mountNotes();
}

/** Land on the thing the link named — Avital's bug, confirmed: "when I go to
 *  the open this, it just goes to the same page. I want it to be the specific
 *  place." Cards carry data-id (an activity can appear on several days, so a
 *  native id would collide); this finds the FIRST match, opens it, scrolls to
 *  it and flashes it so the eye lands where the link pointed. */
function landOnHash(): void {
  const id = window.location.hash.slice(1);
  if (!id) return;
  // A day anchor (fri24, tue28...) — the section has a real id, let it work.
  const day = document.getElementById(id);
  if (day && day.classList.contains('day')) {
    day.scrollIntoView({ block: 'start' });
    return;
  }
  const card = document.querySelector<HTMLElement>(`.act[data-id="${CSS.escape(id)}"]`);
  if (!card) return;
  card.classList.add('open');
  const hint = card.querySelector('.hint');
  if (hint) hint.textContent = 'tap to close \u25b4';
  card.scrollIntoView({ block: 'center' });
  card.classList.add('flash');
  window.setTimeout(() => card.classList.remove('flash'), 2400);
}

async function main(): Promise<void> {
  render();
  landOnHash();
  window.addEventListener('hashchange', landOnHash);
  setSaveStatusSink((msg) => {
    const s = document.getElementById('fav-status');
    if (s) s.textContent = msg;
  });
  await loadFavs();
  refreshHearts();
}

void main();

mountNav();
