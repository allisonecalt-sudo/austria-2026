// Entry script for /trip-options.html — the journey of how the trip got here.
//
// REWRITTEN 2026-05-19 by sweep agent. The previous version rendered 3
// trip-shape options (Apt-Jezero / Splurge / Quiet-Gems), each with a
// LOCKED Schafbergspitze summit night and Best Western Walserberg airport
// hotel. The trip restructured on Mon May 18 (Avital's counter-proposal)
// to Salzburg → Zell am See → Gosau → Airport — no summit overnight.
//
// Instead of menu-picking among hypothetical shapes, this page now tells
// the honest narrative of every shape we considered: original 3-anchor +
// summit; Schafbergspitze rejected (3.6★); Krippenstein pivot; Krippenstein
// full; Avital's structural counter-proposal; current 2+2+2+1. Each beat
// links to the decisions-log artifact that captured the call.
//
// Live lodging totals come from TRIP.lodgings so the cost line stays true
// to the current pick stack without us re-typing prices into a JSON blob.

import { TRIP } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { initSharedShortlist } from './shortlist-shared.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// The journey — chronological beats. Each beat = a shape we considered.
// ---------------------------------------------------------------------------

interface JourneyBeat {
  id: string;
  badge: string;
  status: 'archived' | 'pivot' | 'current';
  shape: string; // headline structure
  when: string; // approximate date / version label
  what: string; // 2-3 sentence explanation
  whyChanged: string; // why this shape moved
  artifactLink?: { href: string; label: string };
}

const BEATS: JourneyBeat[] = [
  {
    id: 'v1-3anchor-summit',
    badge: 'v1',
    status: 'archived',
    shape: 'Salzburg (2N) → 3-night mountain anchor (3N) → Schafbergspitze summit (1N) → Airport (1N)',
    when: 'Through 2026-05-17 ~14:00',
    what:
      'The original shape. Three competing 3-night mountain-anchor options (Obertraun / Berchtesgaden / St. Wolfgang) feeding into one locked Wed-night sleep on the Schafberg summit, then an airport hotel for the Friday flight. Obertraun was the lean — closest to Hallstatt + Gosausee + Krippenstein, lowest drives.',
    whyChanged:
      'Schafbergspitze rejected after the Review-Audit pass: 3.6★ Google with 1,012 reviews, multiple persistent rude-staff complaints. The summit experience itself is iconic but the hotel was a bad pick.',
    artifactLink: { href: 'schafbergspitze.html', label: 'schafbergspitze.html (archive page)' },
  },
  {
    id: 'v2-krippenstein-pivot',
    badge: 'v2',
    status: 'archived',
    shape: 'Salzburg (2N) → Obertraun (3N) → Lodge am Krippenstein summit (1N) → Airport (1N)',
    when: '2026-05-17 ~15:00',
    what:
      "Schafbergspitze swap to Lodge am Krippenstein — same valley as Obertraun (5-min drive to cable car), 9.2★ Booking, 339 reviews, ~2,063m on the Dachstein plateau. Cantilevered 5 Fingers viewing platform as the sunset spot. Verified prices €112-€353 live.",
    whyChanged:
      "Allison: \"after all this we need review checker to check places logisitcs s all that o feverything so this doesnt happen agian.\" Then the Lodge went FULL for Jul 29-30 on the Mon May 18 live availability recheck.",
    artifactLink: { href: 'krippenstein.html', label: 'krippenstein.html (decisions log)' },
  },
  {
    id: 'v3-5option-hub',
    badge: 'v3',
    status: 'archived',
    shape: 'Salzburg (2N) → Obertraun (3N) → 1 of 5 Wed-night sunset stays → Airport (1N)',
    when: '2026-05-17 ~16:50',
    what:
      'When Krippenstein-availability got shaky, the page reframed as a 5-option comparison hub for Wed night: Lodge am Krippenstein + Post am See Traunkirchen (9.3/1054) + Seehotel Brandauer\'s Villen Strobl (9.2/558) + Scalaria Sunset Wing (9.0/1260) + Seehotel am Hallstättersee (8.8/3749). All 4 alternates verified available Jul 29-30 at the time. Allison: "I have no time to coordinate this so just put it all in and make it organized and we\'ll deal with it later."',
    whyChanged:
      'Avital pushed back on the whole summit-overnight premise. Voice note Sun May 17 23:25: "the cog place is specific but not so practical. Seems like we can get other beautiful sunsets not staying there." Plus Lodge am Krippenstein confirmed FULL Jul 29-30 on Mon May 18 ~12:14 recheck.',
    artifactLink: { href: 'krippenstein.html', label: 'krippenstein.html (5-option archive)' },
  },
  {
    id: 'v4-avital-restructure',
    badge: 'v4 · current',
    status: 'current',
    shape: 'Salzburg (2N) → Zell am See (2N) → Gosau (2N) → Salzburg airport-side (1N)',
    when: 'Accepted 2026-05-18 ~12:21 · shipped 2026-05-19',
    what:
      'The clean Avital-counter-proposal shape. 2 nights Salzburg (Shabbat). 2 nights Zell am See for the alpine-lake half (Pinzgau + Schmittenhöhe + Kitzsteinhorn glacier + Krimml falls). 2 nights Gosau for the Salzkammergut-lakes half (Vorderer Gosausee at the door, Hallstatt 20 min, Krippenstein cable car as day-trip). 1 night near Salzburg airport — return the rental car Thursday evening per Avital\'s logistics ("not have to worry about returning the car in the morning"). Schafberg cog + Krippenstein cable car retained as day-trip options from Gosau, just not as overnight bases.',
    whyChanged:
      'Current shape. Bases booked / pending-book. No further restructure planned unless something gets re-flagged on a verification pass.',
    artifactLink: { href: 'bases.html', label: 'bases.html (live 4-base detail)' },
  },
];

interface ShapeMeta {
  totalLodgingEur: number;
  baseCount: number;
  moveCount: number;
  baseNames: string[];
}

function liveShape(): ShapeMeta {
  const active: Array<'salzburg' | 'zell-am-see' | 'gosau' | 'salzburg-airport'> = [
    'salzburg',
    'zell-am-see',
    'gosau',
    'salzburg-airport',
  ];
  const lodgings = TRIP.lodgings.filter((l) =>
    active.includes(l.baseKey as (typeof active)[number]),
  );
  // Pull numeric total out of each pickPrice "€396 (2N)" / "€176 (1N)" string.
  let total = 0;
  for (const l of lodgings) {
    const match = /€\s*([0-9][0-9,]*)/.exec(l.pickPrice);
    if (match) {
      total += parseInt(match[1].replace(/,/g, ''), 10);
    }
  }
  return {
    totalLodgingEur: total,
    baseCount: lodgings.length,
    moveCount: Math.max(0, lodgings.length - 1),
    baseNames: lodgings.map((l) => l.area),
  };
}

function statusChip(s: JourneyBeat['status']): string {
  if (s === 'current') return '<span class="chip chip-recommended">⭐ Current shape</span>';
  if (s === 'pivot') return '<span class="chip chip-warn">↻ Pivot</span>';
  return '<span class="chip">📁 Archived</span>';
}

function renderBeat(b: JourneyBeat): string {
  const link = b.artifactLink
    ? `<a class="alt-cta" href="${escapeHtml(b.artifactLink.href)}">${escapeHtml(b.artifactLink.label)} →</a>`
    : '';
  return `
    <article class="trip-option-card trip-option-card--${b.status === 'current' ? 'current' : 'archived'}" id="beat-${escapeHtml(b.id)}">
      <div class="trip-option-card__body" style="padding: 1.4rem;">
        <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.6rem;">
          <span class="chip"><strong>${escapeHtml(b.badge)}</strong></span>
          ${statusChip(b.status)}
          <span style="font-size:0.88rem; color: var(--ink-soft);">${escapeHtml(b.when)}</span>
        </div>
        <h2 class="trip-option-card__title" style="font-size: 1.2rem; margin: 0 0 0.5rem 0;">
          ${escapeHtml(b.shape)}
        </h2>
        <p class="trip-option-card__tldr">${escapeHtml(b.what)}</p>
        <h3 class="trip-option-card__section-h" style="font-size: 0.95rem;">Why it changed</h3>
        <p class="trip-option-card__why">${escapeHtml(b.whyChanged)}</p>
        ${link}
      </div>
    </article>`;
}

function renderTimeline(): string {
  const meta = liveShape();
  const beatsHtml = BEATS.map(renderBeat).join('');
  return `
    <section class="section">
      <h2 style="margin-top:0;">How the trip shape evolved</h2>
      <p class="lead-block">
        Honest narrative of every shape we tried before landing on the current 4-base plan.
        Each beat below = a structure we genuinely considered and either shipped or moved away
        from. The decisions-log pages (linked) preserve the deep detail.
      </p>
      <div class="trip-option-cards" style="display:grid; gap:1.2rem;">${beatsHtml}</div>
    </section>

    <section class="section">
      <h2>Current shape · at a glance</h2>
      <table class="costs">
        <tbody>
          <tr>
            <td><strong>Bases</strong></td>
            <td>${meta.baseCount} (Salzburg → Zell am See → Gosau → Airport)</td>
          </tr>
          <tr>
            <td><strong>Moves</strong></td>
            <td>${meta.moveCount}</td>
          </tr>
          <tr>
            <td><strong>Nights</strong></td>
            <td>7 (2 + 2 + 2 + 1)</td>
          </tr>
          <tr>
            <td><strong>Lodging total · 2 people · 7 nights</strong></td>
            <td>≈ €${meta.totalLodgingEur.toLocaleString()} (live picks)</td>
          </tr>
          <tr>
            <td><strong>Summit overnight</strong></td>
            <td>None — Schafberg cog + Krippenstein cable car are day-trips from Gosau</td>
          </tr>
        </tbody>
      </table>
    </section>`;
}

// =====================================================================
// Render
// =====================================================================

function render(): void {
  const root = document.querySelector<HTMLElement>('#trip-options-root');
  if (root) {
    root.innerHTML = renderTimeline();
  }
  const compare = document.querySelector<HTMLElement>('#trip-options-compare');
  if (compare) {
    // Clear the old shape-compare table — the v4 page is a timeline, not a comparator.
    compare.innerHTML = '';
  }
}

render();
initNotesWidget();
initChatPlanPopup();
initSharedShortlist();
