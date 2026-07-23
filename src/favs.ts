// ===========================================================================
// favs.ts — the ❤️ layer. One heart, one shared list, every page.
//
// What this is: a tiny shared store so a heart tapped ANYWHERE on the site
//   (plan / bases / rain) lands in one place, and favorites.html can show
//   only the things they actually chose.
// Why it exists: Avital's ask (Allison, Jul 23 2026) — "you heart something
//   and it goes to a separate favorite, same view of location but just only
//   the things we chose."
// Decided:
//   • ONE shared list, no per-person split. Her call, Jul 23: "no allison and
//     avital for hearting and favoriting... just make it without that." A
//     heart means "we want this," not "I want this."
//   • Stored under `fav_shared` in austria_2026_state.
//   • The 0–3 hearts already on rank.html still COUNT — anything either of
//     them ranked ≥1 is a favorite, so no earlier vote is orphaned. Rank
//     stays per-person because it is a comparison tool; this is not.
//   • Tandem rule: state lives in Supabase, nothing important in
//     localStorage — Claude reads the same list between sessions.
// Built: 2026-07-23. Links: favorites.ts (the view) · rank.ts (0–3 hearts) ·
//   supabase.ts (getState/setState) · plan-data.ts (the activities).
// ===========================================================================

import { getState, setState } from './supabase.js';

/** id -> true. Object, not array, so a double-tap can't create duplicates. */
export type FavMap = Record<string, true>;
type Votes = Record<string, number>;

const state: {
  fav: FavMap;
  /** rank.html's 0–3 hearts, read-only here — ≥1 from either counts. */
  ranked: Record<string, number>;
  loaded: boolean;
} = { fav: {}, ranked: {}, loaded: false };

/** Load every heart source. Failures degrade to "nothing hearted yet" rather
 *  than a blank page — the UI says so out loud instead of faking a list. */
export async function loadFavs(): Promise<void> {
  const [shared, ra, rv, sa, sv, la, lv] = await Promise.all([
    getState<FavMap>('fav_shared').catch(() => null),
    getState<Votes>('rank_allison').catch(() => null),
    getState<Votes>('rank_avital').catch(() => null),
    getState<Votes>('sunset_allison').catch(() => null),
    getState<Votes>('sunset_avital').catch(() => null),
    // Legacy per-person heart lists from earlier today — folded in, never
    // dropped, so a heart tapped before this change still shows up.
    getState<FavMap>('fav_allison').catch(() => null),
    getState<FavMap>('fav_avital').catch(() => null),
  ]);

  state.fav = { ...(la ?? {}), ...(lv ?? {}), ...(shared ?? {}) };

  const ranked: Record<string, number> = {};
  for (const src of [ra, rv, sa, sv]) {
    if (!src) continue;
    for (const [id, n] of Object.entries(src)) {
      if (n > 0) ranked[id] = Math.max(ranked[id] ?? 0, n);
    }
  }
  state.ranked = ranked;
  state.loaded = true;
}

export function isLoaded(): boolean {
  return state.loaded;
}

/** Hearted anywhere, or ranked ≥1 on the rank page. */
export function isFav(id: string): boolean {
  return state.fav[id] === true || (state.ranked[id] ?? 0) > 0;
}

/** Every id on the list. Order is not meaningful — callers group and sort. */
export function allFavIds(): string[] {
  const out = new Set<string>(Object.keys(state.fav));
  for (const id of Object.keys(state.ranked)) out.add(id);
  return [...out];
}

/** Heart weight — a 3-heart rank outranks a plain tap, so the strongest
 *  wants float to the top of Our picks. A plain heart is worth 1. */
export function favWeight(id: string): number {
  return Math.max(state.ranked[id] ?? 0, state.fav[id] ? 1 : 0);
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
    setState('fav_shared', state.fav)
      .then(() => onSaveStatus?.('✓ saved'))
      .catch(() => onSaveStatus?.('⚠ save failed — tap the heart again'));
  }, 400);
}

/** Toggle. Returns the new on/off state.
 *  Un-hearting something that was ranked on rank.html leaves the rank vote
 *  alone (that page owns it) — so the heart honestly stays lit and the row
 *  stays on Our picks. Clear it on the rank page if that is what you meant. */
export function toggleFav(id: string): boolean {
  if (state.fav[id]) {
    delete state.fav[id];
    queueSave();
    return isFav(id);
  }
  state.fav[id] = true;
  queueSave();
  return true;
}

/** The heart button used on plan / bases / rain / favorites rows.
 *  44px, thumb-sized, stops the tap from opening the card behind it.
 *  `after` re-renders whatever list the caller owns. */
export function heartButton(id: string, after?: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  const on = isFav(id);
  b.className = on ? 'fav on' : 'fav';
  b.type = 'button';
  b.textContent = '❤️';
  b.title = 'Add to Our picks';
  b.setAttribute('aria-label', 'Heart this — adds it to Our picks');
  b.setAttribute('aria-pressed', String(on));
  const fire = (e: Event): void => {
    e.stopPropagation();
    e.preventDefault();
    const now = toggleFav(id);
    b.className = now ? 'fav on' : 'fav';
    b.setAttribute('aria-pressed', String(now));
    after?.();
  };
  b.addEventListener('click', fire);
  return b;
}

/** Repaint every heart on the page from the loaded list. Pages render first
 *  and call this when Supabase answers, so a slow connection never blocks. */
export function refreshHearts(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-id]').forEach((node) => {
    const id = node.getAttribute('data-id');
    const btn = node.querySelector<HTMLButtonElement>('button.fav');
    if (!id || !btn) return;
    const on = isFav(id);
    btn.className = on ? 'fav on' : 'fav';
    btn.setAttribute('aria-pressed', String(on));
  });
}
