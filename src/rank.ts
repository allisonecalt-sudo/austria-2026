// ===========================================================================
// rank.ts — renders rank.html: the CHOOSING tool.
//
// What: two boards — MUST-DOS (the lifetime-memory pool) and BEST SUNSETS.
//   Each person (Allison / Avital toggle) taps 0–3 hearts per item; votes
//   save LIVE to Supabase austria_2026_state (keys rank_<who>, sunset_<who>)
//   so both phones see the combined order — no schema changes, tandem rule
//   satisfied (Claude reads the same keys between sessions).
// Why hearts not drag-ranking: one-thumb mobile, no fiddling, ties allowed.
// ===========================================================================

import { BUILD_STAMP, MUST_DO_IDS, SITES, SUNSETS, byId } from './plan-data.js';
import { getState, setState } from './supabase.js';
import { mountNotes } from './notes.js';
import { mountNav } from './nav.js';

type Who = 'allison' | 'avital';
type Votes = Record<string, number>;

const state: {
  who: Who;
  votes: Record<Who, Votes>; // must-do hearts per person
  sun: Record<Who, Votes>; // sunset hearts per person
} = {
  who: (localStorage.getItem('rank_who') as Who) || 'allison',
  votes: { allison: {}, avital: {} },
  sun: { allison: {}, avital: {} },
};

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

let saveTimer: number | undefined;
function queueSave(kind: 'votes' | 'sun'): void {
  const status = document.getElementById('save-status');
  if (status) status.textContent = 'saving…';
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    const key = kind === 'votes' ? `rank_${state.who}` : `sunset_${state.who}`;
    const value = kind === 'votes' ? state.votes[state.who] : state.sun[state.who];
    setState(key, value)
      .then(() => {
        if (status) status.textContent = `✓ saved for ${state.who}`;
      })
      .catch(() => {
        if (status) status.textContent = '⚠ save failed — check connection, tap a heart to retry';
      });
  }, 500);
}

function heartRow(current: number, onSet: (n: number) => void): HTMLElement {
  const box = el('div', 'hearts');
  for (let i = 1; i <= 3; i++) {
    const b = el('button', i <= current ? 'on' : undefined, '❤️');
    b.setAttribute('aria-label', `${i} heart${i > 1 ? 's' : ''}`);
    b.addEventListener('click', () => onSet(current === i ? 0 : i));
    box.appendChild(b);
  }
  return box;
}

function combined(kind: 'votes' | 'sun', id: string): { a: number; v: number; total: number } {
  const store = kind === 'votes' ? state.votes : state.sun;
  const a = store.allison[id] ?? 0;
  const v = store.avital[id] ?? 0;
  return { a, v, total: a + v };
}

function renderBoards(): void {
  renderBoard('votes', 'board-must', MUST_DO_IDS);
  renderBoard(
    'sun',
    'board-sun',
    SUNSETS.map((s) => s.id),
  );
}

function renderBoard(kind: 'votes' | 'sun', mountId: string, ids: string[]): void {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  mount.innerHTML = '';

  const sorted = [...ids].sort((x, y) => combined(kind, y).total - combined(kind, x).total);

  sorted.forEach((id, i) => {
    const row = el('article', 'rk');
    row.id = id;
    const scores = combined(kind, id);

    row.appendChild(el('div', 'pos', scores.total > 0 ? `${i + 1}` : '·'));

    const img = el('div', 'img');
    let name = '';
    let drive = '';
    let sub = '';
    if (kind === 'votes') {
      const a = byId.get(id);
      if (!a) return;
      img.style.backgroundImage = `url('${a.photo}')`;
      name = `${a.emoji} ${a.name}`;
      drive = a.drive;
      sub = a.what;
    } else {
      const s = SUNSETS.find((x) => x.id === id);
      if (!s) return;
      img.style.backgroundImage = `url('${s.photo}')`;
      name = `🌅 ${s.name}`;
      drive = `${s.drive} · ${s.night} · ${s.time}`;
      sub = s.why;
    }
    row.appendChild(img);

    const mid = el('div', 'mid');
    mid.appendChild(el('h3', undefined, esc(name)));
    mid.appendChild(el('p', 'drive', esc(drive)));
    mid.appendChild(
      el(
        'p',
        'combined',
        `${esc(sub)}<br>Allison ${'❤️'.repeat(scores.a) || '—'} · Avital ${'❤️'.repeat(scores.v) || '—'}`,
      ),
    );
    // Her ask (Jul 17): must-do rows clickable → full info, like the plan cards.
    if (kind === 'votes') {
      const a = byId.get(id);
      if (a) {
        const more = el('div', 'rk-more');
        more.appendChild(el('p', undefined, esc(a.more)));
        const links = el('p', undefined, '');
        const nav = el('a', 'btn go', '📍 Navigate');
        (nav as HTMLAnchorElement).href = a.maps;
        (nav as HTMLAnchorElement).target = '_blank';
        (nav as HTMLAnchorElement).rel = 'noopener';
        nav.addEventListener('click', (e) => e.stopPropagation());
        links.appendChild(nav);
        const siteUrl = SITES[id];
        if (siteUrl) {
          const site = el('a', 'btn', '↗ Website');
          (site as HTMLAnchorElement).href = siteUrl;
          (site as HTMLAnchorElement).target = '_blank';
          (site as HTMLAnchorElement).rel = 'noopener';
          site.addEventListener('click', (e) => e.stopPropagation());
          links.appendChild(document.createTextNode(' '));
          links.appendChild(site);
        }
        more.appendChild(links);
        mid.appendChild(more);
        mid.appendChild(el('p', 'rk-hint', 'tap for full info ▾'));
        row.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('.hearts, a')) return;
          row.classList.toggle('open');
          const hint = row.querySelector('.rk-hint');
          if (hint)
            hint.textContent = row.classList.contains('open')
              ? 'tap to close ▴'
              : 'tap for full info ▾';
        });
        row.style.cursor = 'pointer';
      }
    }
    row.appendChild(mid);

    const store = kind === 'votes' ? state.votes : state.sun;
    row.appendChild(
      heartRow(store[state.who][id] ?? 0, (n) => {
        store[state.who][id] = n;
        queueSave(kind);
        renderBoards();
      }),
    );
    mount.appendChild(row);
  });
}

function renderShell(): void {
  const root = document.getElementById('rank');
  if (!root) return;

  const hero = el('header', 'plan-hero');
  hero.style.backgroundImage = `url('${byId.get('koenigssee')?.photo ?? ''}')`;
  const ht = el('div', 'ht');
  ht.appendChild(el('p', 'kick', 'the choosing tool · hearts save live, both phones see it'));
  ht.appendChild(el('h1', undefined, 'Rank it ⭐'));
  ht.appendChild(
    el(
      'p',
      undefined,
      'Pick who you are, then give 0–3 hearts to each must-do candidate and sunset spot. The list re-sorts by your combined hearts — and anything with a heart also lands on Our picks.',
    ),
  );
  hero.appendChild(ht);
  root.appendChild(hero);

  const wrap = el('div', 'wrap');

  const who = el('div', 'who', '<span>I am:</span>');
  const btnA = el('button', state.who === 'allison' ? 'on' : undefined, 'Allison');
  const btnV = el('button', state.who === 'avital' ? 'on' : undefined, 'Avital');
  btnA.addEventListener('click', () => switchWho('allison', btnA, btnV));
  btnV.addEventListener('click', () => switchWho('avital', btnV, btnA));
  who.appendChild(btnA);
  who.appendChild(btnV);
  wrap.appendChild(who);
  wrap.appendChild(
    el(
      'p',
      'rank-sub',
      'Tap a heart again to remove it. 3 = “must happen” · 1 = “nice” · 0 = “meh”.',
    ),
  );
  wrap.appendChild(el('p', 'save-note', '<span id="save-status"></span>'));

  const h1 = el('div', 'section-head');
  h1.appendChild(el('h2', undefined, '⭐ Must-dos — the lifetime-memory pool'));
  h1.appendChild(
    el('p', undefined, 'Everything here is verified open, easy-rated, and drive-timed.'),
  );
  wrap.appendChild(h1);
  const must = el('div', 'rank-list');
  must.id = 'board-must';
  wrap.appendChild(must);

  const h2 = el('div', 'section-head');
  h2.appendChild(el('h2', undefined, '🌅 Best sunsets — one every night'));
  h2.appendChild(
    el('p', undefined, 'Rank the golden hours — the top ones get protected in the schedule.'),
  );
  wrap.appendChild(h2);
  const sun = el('div', 'rank-list');
  sun.id = 'board-sun';
  wrap.appendChild(sun);

  root.appendChild(wrap);

  const foot = document.getElementById('rank-foot');
  if (foot) {
    foot.innerHTML = `votes live in the shared trip base (tandem-readable) · built ${BUILD_STAMP} · <a href="plan.html">← back to the plan</a>`;
  }
}

function switchWho(w: Who, on: HTMLButtonElement, off: HTMLButtonElement): void {
  state.who = w;
  localStorage.setItem('rank_who', w);
  on.classList.add('on');
  off.classList.remove('on');
  renderBoards();
}

async function loadVotes(): Promise<void> {
  const [ra, rv, sa, sv] = await Promise.all([
    getState<Votes>('rank_allison').catch(() => null),
    getState<Votes>('rank_avital').catch(() => null),
    getState<Votes>('sunset_allison').catch(() => null),
    getState<Votes>('sunset_avital').catch(() => null),
  ]);
  state.votes.allison = ra ?? {};
  state.votes.avital = rv ?? {};
  state.sun.allison = sa ?? {};
  state.sun.avital = sv ?? {};
}

async function main(): Promise<void> {
  renderShell();
  await loadVotes();
  renderBoards();
  // Deep-link: /rank.html#activity-id scrolls to that row.
  if (window.location.hash) {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'center' });
  }
  mountNotes();
}

void main();

mountNav();
