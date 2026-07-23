// ===========================================================================
// shabbat.ts — which activities are simply not available on Shabbat, and why.
//
// Why this exists: Allison, Jul 23 — "we cant go on boats on shabbat."
//   She was right, and the mistake was bigger than the boat. This file had
//   put the Bad Goisern Parkbad on the Shabbat day and called it "the Shabbat
//   answer" — but it charges €8.70 at the gate, which is handling money.
//   Flagging one boat would have been a symptom patch. So instead the site
//   now checks EVERY activity against the constraints that actually bind
//   between candle-lighting Friday and Havdalah on Saturday night.
//
// WHAT THIS DOES AND DOESN'T DECIDE:
//   It reports FACTS about each activity — does it need the car, does it cost
//   money at the door, is it a boat. It does NOT rule on halacha. Whether
//   swimming is fine, whether something prepaid is fine, whether carrying
//   applies here — that is hers and her rav's, not the app's. The app's job
//   is to make sure she is never shown an option without being told what it
//   would require of her.
//
// Shabbat this trip: Fri 24 July, candles 20:32 → Sat 25 July, ends ~21:45,
// in Bad Goisern. One of the latest Shabbatot of the year.
// ===========================================================================

import { byId } from './plan-data.js';

export type ShabbatIssue = 'driving' | 'money' | 'boat';

const ISSUE_TEXT: Record<ShabbatIssue, string> = {
  driving: 'needs the car',
  money: 'costs money at the door',
  boat: 'is a boat',
};

/** Does the drive string describe something you can genuinely walk to?
 *
 *  FAIL SAFE: an explicit drive time wins over any later "on foot". Several
 *  entries read like "🚗 15 min · 8 km from Wals · then on foot" — the walking
 *  happens AFTER the drive. An earlier version matched the words "on foot" and
 *  cleared Mirabell for Shabbat when it is a 15-minute drive away. Getting this
 *  wrong in the permissive direction tells her something is fine when it isn't,
 *  so any stated driving time counts as needing the car, full stop. */
function needsCar(drive: string): boolean {
  const explicitMinutes = drive.match(/🚗\s*(\d+)\s*(min|h)/i);
  if (explicitMinutes && Number(explicitMinutes[1]) > 0) return true;
  if (/🚗\s*\d+h/i.test(drive)) return true;

  const d = drive.toLowerCase();
  // "🚗 0 — on foot from the apartment" / "a 500 m walk" — genuinely walkable.
  if (/🚗\s*0\b/.test(drive)) return false;
  if (d.includes('a 500 m walk') || d.includes('walk from the apartment')) return false;
  return true;
}

function costsMoney(chips: string[], more: string): boolean {
  const hay = `${chips.join(' ')} ${more}`;
  if (/free entry|free\b/i.test(chips.join(' ')) && !/€/.test(chips.join(' '))) return false;
  return /€\s?\d|\d+\s?€|cash only/i.test(hay);
}

function isBoat(id: string, name: string, what: string): boolean {
  const hay = `${id} ${name} ${what}`.toLowerCase();
  return /boat|ferry|schiff|cruise|raft|kayak|canoe|sup|paddle|steamer|gondel/.test(hay);
}

export interface ShabbatCheck {
  ok: boolean;
  issues: ShabbatIssue[];
  /** Plain sentence naming what it would require. */
  note: string;
}

/** What would this activity require of you on Shabbat? */
export function shabbatCheck(id: string): ShabbatCheck | null {
  const a = byId.get(id);
  if (!a) return null;

  const issues: ShabbatIssue[] = [];
  if (needsCar(a.drive)) issues.push('driving');
  if (costsMoney(a.chips, a.more)) issues.push('money');
  if (isBoat(a.id, a.name, a.what)) issues.push('boat');

  if (issues.length === 0) {
    return { ok: true, issues, note: 'Walkable, and nothing to pay at the door.' };
  }
  return {
    ok: false,
    issues,
    note: `Not on Shabbat — it ${issues.map((i) => ISSUE_TEXT[i]).join(', and it ')}.`,
  };
}

/** The honest summary for the Shabbat day header. */
export const SHABBAT_RULE =
  'Fri 20:32 → Sat ~21:45. No driving, no boats, nothing to pay at a gate — which rules out ' +
  'almost everything else on this site, because nearly all of it is one of those three.';
