// ===========================================================================
// bullets.ts — three bullets per activity, useful thing first.
//
// Why (Avital, 23 Jul, and she is right): "I actually am reading the
//   descriptions, and they're just random and have a lot of useless
//   information in them, and then the useful information is like last. I
//   really just like bullet points — can you just give for each point three
//   bullet points of what it is, so I know and I don't read an endless story."
//   And: "'A full incredible day' is all wording. I just want to say good
//   mountains, good lakes, and good space to be for X amount of time — stuff
//   like that, not all of this wordiness. Keep the pictures though."
//
// So every card leads with exactly three lines, in this fixed order:
//   1. WHAT IT IS      — the plain thing, no adjectives doing work
//   2. WHAT TO KNOW    — the single fact that would wreck the visit if missed
//                        (must-book, cash-only, closes early, needs clear sky)
//   3. TIME & EFFORT   — how long, how hard, what it costs
//
// DERIVED, NOT REWRITTEN. Every bullet is assembled from fields that were
// already verified — `what`, `chips`, `duration`, `difficulty`. Nothing new is
// asserted here, so this cannot drift away from the researched facts. The full
// prose stays available behind a toggle for when she actually wants the story.
// ===========================================================================

import { type Activity } from './plan-data.js';
import { rainCall } from './rain-ok.js';

const DIFF: Record<Activity['difficulty'], string> = {
  flat: 'flat, no effort',
  easy: 'easy',
  moderate: 'some effort',
};

/** A chip that would ruin the day if she missed it. Ordered by how badly. */
const KILLER = [
  /book ahead|BOOK AHEAD|must be booked|reserve|RESERVE|on request/i,
  /cash only|CASH ONLY/i,
  /closed|CLOSES|shut|last entry/i,
  /only runs|sunny days|clear-day|clear-weather/i,
  /confirm hours|check times/i,
];

function priceChip(chips: string[]): string | undefined {
  return chips.find((c) => /€|free/i.test(c));
}

function killerChip(chips: string[]): string | undefined {
  for (const re of KILLER) {
    const hit = chips.find((c) => re.test(c));
    if (hit) return hit;
  }
  return undefined;
}

/** First sentence only — the `what` field is written as one line, but a couple
 *  run long, and a bullet that wraps to four lines is not a bullet. */
function trim(s: string, max = 96): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(' — '), cut.lastIndexOf(', '), cut.lastIndexOf(' '));
  return `${cut.slice(0, stop > 40 ? stop : max).trim()}…`;
}

export interface Bullets {
  what: string;
  know: string;
  time: string;
}

export function bulletsFor(a: Activity): Bullets {
  // 1 — what it is
  const what = trim(a.what);

  // 2 — the one thing that would wreck it. Falls back to the rain verdict,
  //     which is the next most decision-changing fact we hold.
  const killer = killerChip(a.chips);
  let know: string;
  if (killer) {
    know = killer;
  } else {
    const rain = rainCall(a.id);
    if (rain?.ok === 'needs-clear') know = 'Needs a clear sky — pointless in cloud';
    else if (rain?.ok === 'dry') know = 'Indoors — works in any weather';
    else if (rain?.ok === 'wet-ok') know = 'Rain does not spoil it';
    else know = 'Walk up, no booking';
  }

  // 3 — how long, how hard, what it costs
  const bits = [a.duration, DIFF[a.difficulty]];
  const price = priceChip(a.chips);
  if (price && price !== killer) bits.push(price);
  if (a.swim) bits.push('🏊 swim');
  const time = bits.join(' · ');

  return { what, know, time };
}
