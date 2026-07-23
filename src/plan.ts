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
  ct.appendChild(el('p', 'what', esc(a.what)));
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
  ct.appendChild(chips);

  const more = el('div', 'more');
  more.appendChild(el('p', undefined, esc(a.more)));
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
  ct.appendChild(el('p', 'hint', 'tap card for logistics ▾'));
  card.appendChild(ct);

  card.addEventListener('click', () => {
    card.classList.toggle('open');
    const hint = card.querySelector('.hint');
    if (hint)
      hint.textContent = card.classList.contains('open')
        ? 'tap to close ▴'
        : 'tap card for logistics ▾';
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
