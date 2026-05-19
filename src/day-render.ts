// Day card render — v4 digestibility pass (2026-05-16).
// Goal: glanceable collapsed state, paragraph + plan B + anchors live behind tap.
//
// Collapsed (default): hero photo with title overlay + sunset badge + expand chevron.
// Expanded: photo + "Default" paragraph + "Easier day" alternate + anchors + meta chips.
//
// First card opens by default so Avital sees the pattern.

import type { Day, DayAnchor } from './trip-data.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAnchors(anchors: DayAnchor[]): string {
  if (!anchors.length) return '';
  const rows = anchors
    .map(
      (a) => `
      <li class="anchor-row">
        <span class="anchor-time">${escapeHtml(a.time)}</span>
        <span class="anchor-label">${escapeHtml(a.label)}</span>
      </li>`,
    )
    .join('');
  return `
    <div class="anchors-block">
      <div class="anchors-label">Time-locked beats · the few things tied to a clock</div>
      <ul class="anchors-list">${rows}</ul>
    </div>`;
}

function renderPlanB(planB: string | undefined): string {
  if (!planB) return '';
  return `
    <div class="planb-inline">
      <div class="planb-label">Or instead — softer alternate if energy is low</div>
      <p class="planb-text">${escapeHtml(planB)}</p>
    </div>`;
}

function renderMetaChips(day: Day): string {
  const chips: string[] = [];
  // Updated 2026-05-19 for v4 4-base restructure. Deprecated keys still
  // mapped so any old data renders (fallback chain catches missing too).
  const sleepLabel: Record<string, string> = {
    salzburg: 'Salzburg (Linzergasse)',
    'zell-am-see': 'Zell am See (Aparthotel Zell am See)',
    gosau: 'Gosau (Der Ulmenhof)',
    'salzburg-airport': 'Salzburg airport-side (B&B Villa Verde)',
    // deprecated 2026-05-19, fallback only
    hallstatt: 'Mountain anchor (Obertraun) — archived',
    schafbergspitze: 'Berghotel Schafbergspitze — superseded',
    'lodge-am-krippenstein': 'Lodge am Krippenstein — archived',
    airport: 'Salzburg airport-side (legacy)',
  };
  const where = sleepLabel[day.sleepWhere] ?? day.sleepWhere;

  const driveParts: string[] = [];
  if (day.driveFrom) {
    driveParts.push(
      `<a href="${escapeHtml(day.driveFrom.mapsUrl)}" target="_blank" rel="noreferrer noopener">from ${escapeHtml(day.driveFrom.place)} · ${day.driveFrom.minutes} min</a>`,
    );
  }
  if (day.driveTo) {
    driveParts.push(
      `<a href="${escapeHtml(day.driveTo.mapsUrl)}" target="_blank" rel="noreferrer noopener">to ${escapeHtml(day.driveTo.place)} · ${day.driveTo.minutes} min</a>`,
    );
  }
  if (driveParts.length) {
    chips.push(
      `<span class="chip"><span class="chip-icon">🚗</span> ${driveParts.join(' · ')}</span>`,
    );
  }
  chips.push(`<span class="chip"><span class="chip-icon">🛏</span> ${escapeHtml(where)}</span>`);

  return `<div class="day-meta">${chips.join('')}</div>`;
}

function renderSunsetInline(day: Day): string {
  const link = day.sunset.mapsUrl
    ? `<a href="${escapeHtml(day.sunset.mapsUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(day.sunset.place)}</a>`
    : escapeHtml(day.sunset.place);
  return `
    <div class="sunset-inline">
      <span class="sunset-inline-label">☀ Sunset · ${escapeHtml(day.sunset.time)}</span>
      <span class="sunset-inline-spot">${link}</span>
    </div>`;
}

export function renderDayCard(day: Day, index: number): string {
  const isPeak = !!day.tarabridgeMoment;
  const startOpen = index === 0;
  const openAttr = startOpen ? ' open' : '';

  const peakBadge = isPeak
    ? `<span class="day-pin peak" title="Peak moment of the trip">⭐ Peak moment</span>`
    : '';

  return `
  <article class="day${isPeak ? ' day--peak' : ''}" id="${escapeHtml(day.id)}">
    <details class="day-disclose"${openAttr}>
      <summary class="day-summary-target" aria-label="Toggle ${escapeHtml(day.dateLabel)} details">
        <div class="day-hero">
          <img loading="lazy" decoding="async" src="${escapeHtml(day.hero.src)}" alt="${escapeHtml(day.hero.alt)}" />
          <div class="day-hero-overlay">
            <div class="day-hero-top">
              <span class="day-hero-eyebrow">Day ${index + 1} · ${escapeHtml(day.dateLabel)}</span>
              ${peakBadge}
            </div>
            <h2 class="day-hero-title">${escapeHtml(day.headline)}</h2>
            <div class="day-hero-bottom">
              <span class="day-hero-sunset">☀ Sunset ${escapeHtml(day.sunset.time)}</span>
              <span class="day-hero-chevron" aria-hidden="true">
                <span class="chev-open">Tap for the plan</span>
                <span class="chev-close">Hide</span>
                <svg class="chev-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
          </div>
        </div>
      </summary>
      <div class="day-body">
        <div class="day-block day-block--doing">
          <div class="day-block-label">Options for the day · pick what fits the mood</div>
          <p class="day-idea day-idea--doing">${escapeHtml(day.doingSummary)}</p>
        </div>
        <div class="day-block">
          <div class="day-block-label">Recommended combo · why we'd lean this way</div>
          <p class="day-idea">${escapeHtml(day.generalIdea)}</p>
        </div>
        ${renderPlanB(day.planB)}
        ${renderAnchors(day.anchors)}
        ${renderSunsetInline(day)}
        ${renderMetaChips(day)}
      </div>
    </details>
  </article>`;
}

export function attachImageLoadHandlers(root: HTMLElement): void {
  const imgs = root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]');
  imgs.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
    }
  });
}

export function attachExpandAllControls(): void {
  const expandBtn = document.querySelector<HTMLButtonElement>('#expand-all');
  const collapseBtn = document.querySelector<HTMLButtonElement>('#collapse-all');
  const all = (): NodeListOf<HTMLDetailsElement> =>
    document.querySelectorAll<HTMLDetailsElement>('.day-disclose');
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      all().forEach((d) => (d.open = true));
    });
  }
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      all().forEach((d) => (d.open = false));
    });
  }
}
