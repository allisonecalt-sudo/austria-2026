// ===========================================================================
// dayplan.ts — the per-day plan you assemble yourself.
//
// Why (Allison, 23 Jul 22:47): "make it so we can make a day — like we click
//   on a spot and then it's like Tuesday, and we can make a list and kind of
//   like a route, and then look it over."
//
// So: every day has a saved LIST. You add to it from the map (tap a dot →
//   pick the day) or from the builder's checkboxes. It saves to Supabase —
//   `dayplan_<dayId>` in austria_2026_state — so both phones see the same
//   plan and Claude can read it between sessions (the tandem rule).
//   Looking it over IS the route builder's ordered view: pick the day, the
//   saved list loads, the loop renders, one tap opens it in Google Maps.
// ===========================================================================

import { getState, setState } from './supabase.js';

export const PLAN_DAYS = [
  { dayId: 'sun26', short: 'Sun', label: 'Sun 26' },
  { dayId: 'mon27', short: 'Mon', label: 'Mon 27' },
  { dayId: 'tue28', short: 'Tue', label: 'Tue 28' },
  { dayId: 'wed29', short: 'Wed', label: 'Wed 29' },
  { dayId: 'thu30', short: 'Thu', label: 'Thu 30' },
] as const;

const cache = new Map<string, string[]>();
const timers = new Map<string, number>();

function key(dayId: string): string {
  return `dayplan_${dayId}`;
}

/** Load a day's saved list. Cached after the first read; empty on any failure
 *  (the UI says "nothing saved yet", it never fakes a plan). */
export async function getDayPlan(dayId: string): Promise<string[]> {
  if (cache.has(dayId)) return cache.get(dayId) ?? [];
  try {
    const v = await getState<string[]>(key(dayId));
    const list = Array.isArray(v) ? v : [];
    cache.set(dayId, list);
    return list;
  } catch {
    cache.set(dayId, []);
    return [];
  }
}

function queueSave(dayId: string, onStatus?: (msg: string) => void): void {
  onStatus?.('saving…');
  window.clearTimeout(timers.get(dayId));
  timers.set(
    dayId,
    window.setTimeout(() => {
      setState(key(dayId), cache.get(dayId) ?? [])
        .then(() => onStatus?.('✓ saved — both phones see this'))
        .catch(() => onStatus?.('⚠ not saved — bad signal, change something to retry'));
    }, 500),
  );
}

/** Add or remove one place on one day. Returns true if it is now IN the plan. */
export function toggleInDay(dayId: string, id: string, onStatus?: (msg: string) => void): boolean {
  // Same wipe-class as favs: a tap before this day's plan has loaded would
  // save a one-entry list over the real one. Load it first, then apply.
  if (!cache.has(dayId)) {
    onStatus?.('loading that day — tap again in a second');
    void getDayPlan(dayId);
    return false;
  }
  const list = cache.get(dayId) ?? [];
  const i = list.indexOf(id);
  if (i >= 0) {
    list.splice(i, 1);
    cache.set(dayId, list);
    queueSave(dayId, onStatus);
    return false;
  }
  list.push(id);
  cache.set(dayId, list);
  queueSave(dayId, onStatus);
  return true;
}

export function isInDay(dayId: string, id: string): boolean {
  return (cache.get(dayId) ?? []).includes(id);
}

/** Warm the cache for all five days — call once per page that uses day plans. */
export async function loadAllDayPlans(): Promise<void> {
  await Promise.all(PLAN_DAYS.map((d) => getDayPlan(d.dayId)));
}
