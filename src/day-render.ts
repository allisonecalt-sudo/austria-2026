// Render a single Day card. v3.1 layout (2026-05-15 evening):
// Thinner shape — no hour-by-hour blocks.
//
//   hero photo (with sunset badge floating top-right)
//   day label + serif title
//   "The plan" — one general-idea paragraph
//   anchors list (short, named times only)
//   meta chips (drive / sleep)
//   Plan B — collapsed <details> one-liner
//   Distinctive sunset block at the end (gold tint)
//
// Per Allison 2026-05-15 18:45: "we dont need every day fully plan mor elike
// gernal idea and opiton". Drop minute-by-minute scheduling; keep the spine
// + a one-line alternate.

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
      <div class="anchors-label">The few times that matter</div>
      <ul class="anchors-list">${rows}</ul>
    </div>`;
}

function renderPlanBLine(planB: string | undefined): string {
  if (!planB) return '';
  return `
    <details class="planb-toggle">
      <summary><span class="planb-badge">Plan B</span> <span class="planb-hint">if the day asks for less</span></summary>
      <p class="planb-body">${escapeHtml(planB)}</p>
    </details>`;
}

function renderDriveChip(day: Day): string {
  const parts: string[] = [];
  if (day.driveFrom) {
    parts.push(
      `<a href="${escapeHtml(day.driveFrom.mapsUrl)}" target="_blank" rel="noreferrer noopener">from ${escapeHtml(day.driveFrom.place)} · ${day.driveFrom.minutes} min</a>`,
    );
  }
  if (day.driveTo) {
    parts.push(
      `<a href="${escapeHtml(day.driveTo.mapsUrl)}" target="_blank" rel="noreferrer noopener">to ${escapeHtml(day.driveTo.place)} · ${day.driveTo.minutes} min</a>`,
    );
  }
  if (!parts.length) {
    return `<span class="chip"><strong>Drive</strong> none</span>`;
  }
  return `<span class="chip"><strong>Drive</strong> ${parts.join(' · ')}</span>`;
}

function renderSleepChip(day: Day): string {
  const map: Record<string, string> = {
    salzburg: 'Salzburg (Linzergasse)',
    hallstatt: 'Obertraun (Hallstatt area)',
    airport: 'Salzburg airport-side',
  };
  const where = map[day.sleepWhere] ?? day.sleepWhere;
  return `<span class="chip"><strong>Sleep</strong> ${escapeHtml(where)}</span>`;
}

function renderSunsetBlock(day: Day): string {
  const spotLink = day.sunset.mapsUrl
    ? `<div class="sunset-place">📍 <a href="${escapeHtml(day.sunset.mapsUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(day.sunset.place)}</a></div>`
    : `<div class="sunset-place">📍 ${escapeHtml(day.sunset.place)}</div>`;
  return `
    <div class="sunset-block">
      <div class="sunset-label">☀ Sunset · ${escapeHtml(day.sunset.time)}</div>
      <div class="sunset-spot">${escapeHtml(day.sunset.place)}</div>
      ${spotLink}
    </div>`;
}

export function renderDayCard(day: Day, index: number): string {
  const peakBadge = day.tarabridgeMoment
    ? `<div class="day-hero-badge peak" title="Peak moment">⭐ Tara-Bridge moment</div>`
    : `<div class="day-hero-badge">☀ Sunset ${escapeHtml(day.sunset.time)}</div>`;

  return `
  <article class="day" id="${escapeHtml(day.id)}">
    <div class="day-hero">
      <img loading="lazy" decoding="async" src="${escapeHtml(day.hero.src)}" alt="${escapeHtml(day.hero.alt)}" />
      ${peakBadge}
    </div>
    <header class="day-header">
      <div class="day-label">Day ${index + 1} · ${escapeHtml(day.dateLabel)}</div>
      <h2 class="day-title">${escapeHtml(day.headline)}</h2>
    </header>
    <div class="day-body">
      <p class="day-idea">${escapeHtml(day.generalIdea)}</p>
      ${renderAnchors(day.anchors)}
      <div class="day-meta">
        ${renderDriveChip(day)}
        ${renderSleepChip(day)}
      </div>
      ${renderPlanBLine(day.planB)}
    </div>
    ${renderSunsetBlock(day)}
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
