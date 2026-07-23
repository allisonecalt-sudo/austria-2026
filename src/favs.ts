// ===========================================================================
// favs.ts — the ❤️ layer. One heart, one meaning, every page.
//
// What this is: a tiny shared store so a heart tapped ANYWHERE on the site
//   (plan / bases / rain / rank) lands in one place, and favorites.html can
//   show only the things they actually chose.
// Why it exists: Avital's ask (Allison, Jul 23 2026) — "you heart something
//   and it goes to a separate favorite, same view of location but just only
//   the things we chose."
// Decided:
//   • Two people, two stores — `fav_allison` / `fav_avital` in
//     austria_2026_state. Never merged on write, so you can always see WHO
//     wanted it. Merged only on read, for the favorites view.
//   • The 0–3 hearts already on rank.html COUNT. Anything with ≥1 rank or
//     sunset heart is a favorite too — no vote gets orphaned, no second
//     mental model ("why is my ranked thing not in favorites?").
//   • Who-am-I reuses rank.html's `rank_who` localStorage key, so picking
//     "Avital" on the rank page carries to every other page.
//   • Tandem rule: everything lives in Supabase, nothing in localStorage
//     except which of the two people this phone is.
// Built: 2026-07-23. Links: favorites.ts (the view) · rank.ts (0–3 hearts) ·
//   supabase.ts (getState/setState) · plan-data.ts (the activities).
// ===========================================================================

import { getState, setState } from './supabase.js';

export type Who = 'allison' | 'avital';

/** id -> true. Object, not array, so a double-tap can't create duplicates. */
export type FavMap = Record<string, true>;
type Votes = Record<string, number>;

interface FavState {
  who: Who;
  fav: Record<Who, FavMap>;
  /** rank.html's 0–3 hearts, read-only here — ≥1 counts as a favorite. */
  rank: Record<Who, Votes>;
  sunset: Record<Who, Votes>;
  loaded: boolean;
}

const state: FavState = {
  who: (localStorage.getItem('rank_who') as Who) || 'allison',
  fav: { allison: {}, avital: {} },
  rank: { allison: {}, avital: {} },
  sunset: { allison: {}, avital: {} },
  loaded: false,
};

export function who(): Who {
  return state.who;
}

export function setWho(w: Who): void {
  state.who = w;
  localStorage.setItem('rank_who', w);
}

/** Load every heart source. Safe to call on every page; failures degrade to
 *  "nothing hearted yet" rather than breaking the page (fail-loud is the
 *  banner in the UI, not a blank screen). */
export async function loadFavs(): Promise<void> {
  const [fa, fv, ra, rv, sa, sv] = await Promise.all([
    getState<FavMap>('fav_allison').catch(() => null),
    getState<FavMap>('fav_avital').catch(() => null),
    getState<Votes>('rank_allison').catch(() => null),
    getState<Votes>('rank_avital').catch(() => null),
    getState<Votes>('sunset_allison').catch(() => null),
    getState<Votes>('sunset_avital').catch(() => null),
  ]);
  state.fav.allison = fa ?? {};
  state.fav.avital = fv ?? {};
  state.rank.allison = ra ?? {};
  state.rank.avital = rv ?? {};
  state.sunset.allison = sa ?? {};
  state.sunset.avital = sv ?? {};
  state.loaded = true;
}

export function isLoaded(): boolean {
  return state.loaded;
}

/** Did THIS person heart it — by tapping a heart anywhere, or by ranking it? */
export function isFav(id: string, w: Who = state.who): boolean {
  if (state.fav[w][id]) return true;
  if ((state.rank[w][id] ?? 0) > 0) return true;
  if ((state.sunset[w][id] ?? 0) > 0) return true;
  return false;
}

/** Who wants it — used to show "Allison ❤️ · Avital ❤️" on the picks page. */
export function favBy(id: string): { allison: boolean; avital: boolean; both: boolean } {
  const a = isFav(id, 'allison');
  const v = isFav(id, 'avital');
  return { allison: a, avital: v, both: a && v };
}

/** Every id either of them wants. Order is not meaningful — callers group. */
export function allFavIds(): string[] {
  const out = new Set<string>();
  for (const w of ['allison', 'avital'] as Who[]) {
    for (const id of Object.keys(state.fav[w])) out.add(id);
    for (const [id, n] of Object.entries(state.rank[w])) if (n > 0) out.add(id);
    for (const [id, n] of Object.entries(state.sunset[w])) if (n > 0) out.add(id);
  }
  return [...out];
}

/** Combined heart weight — both-of-us outranks one-of-us, 3 hearts outranks 1.
 *  Used to sort the picks page so the strongest wants sit at the top. */
export function favWeight(id: string): number {
  let n = 0;
  for (const w of ['allison', 'avital'] as Who[]) {
    const rank = Math.max(state.rank[w][id] ?? 0, state.sunset[w][id] ?? 0);
    if (rank > 0) n += rank;
    else if (state.fav[w][id]) n += 1;
  }
  return n;
}

let saveTimer: number | undefined;
let onSaveStatus: ((msg: string) => void) | undefined;

/** Page tells favs where to print "saving… / ✓ saved / ⚠ save failed". */
export function setSaveStatusSink(fn: (msg: string) => void): void {
  onSaveStatus = fn;
}

function queueSave(): void {
  onSaveStatus?.('saving…');
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    setState(`fav_${state.who}`, state.fav[state.who])
      .then(() => onSaveStatus?.(`✓ saved for ${state.who}`))
      .catch(() => onSaveStatus?.('⚠ save failed — tap the heart again'));
  }, 400);
}

/** Toggle for the CURRENT person. Returns the new on/off state.
 *  Un-hearting something that was ranked on rank.html also clears the rank
 *  heart locally so the card doesn't lie — but the rank page owns that value,
 *  so we only clear our own `fav` entry and let the rank vote stand. */
export function toggleFav(id: string): boolean {
  const w = state.who;
  const wasRanked = (state.rank[w][id] ?? 0) > 0 || (state.sunset[w][id] ?? 0) > 0;
  if (state.fav[w][id]) {
    delete state.fav[w][id];
    queueSave();
    return wasRanked; // still shows as hearted via the rank vote — honest.
  }
  state.fav[w][id] = true;
  queueSave();
  return true;
}

/** The heart button used on plan / bases / rain cards.
 *  `after` re-renders whatever list the caller owns. */
export function heartButton(id: string, after?: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = isFav(id) ? 'fav on' : 'fav';
  b.type = 'button';
  b.innerHTML = '❤️';
  b.title = 'Add to Our picks';
  b.setAttribute('aria-label', `Heart this — adds it to Our picks for ${state.who}`);
  b.setAttribute('aria-pressed', String(isFav(id)));
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const on = toggleFav(id);
    b.className = on ? 'fav on' : 'fav';
    b.setAttribute('aria-pressed', String(on));
    after?.();
  });
  return b;
}

/** The "I am: Allison / Avital" toggle — same control as rank.html, so a
 *  heart is never saved to the wrong person just because you started here. */
export function whoBar(onSwitch: () => void): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'who';
  bar.innerHTML = '<span>I am:</span>';
  const mk = (w: Who, label: string): HTMLButtonElement => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    if (state.who === w) btn.className = 'on';
    btn.addEventListener('click', () => {
      setWho(w);
      bar.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      btn.classList.add('on');
      onSwitch();
    });
    return btn;
  };
  bar.appendChild(mk('allison', 'Allison'));
  bar.appendChild(mk('avital', 'Avital'));
  return bar;
}
