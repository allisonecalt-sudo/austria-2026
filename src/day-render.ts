// Render a single Day card. v3 layout:
//   hero photo (with sunset badge floating top-right)
//   day label + serif title + 1-2 sentence summary
//   meta chip strip (sunset spot / drive / sleep / walk)
//   Plan A — always expanded
//   Plan B — collapsed <details>
//   Distinctive sunset block at the end (gold tint)

import type { Day, DayPlan } from './trip-data.js';
import { mapsLink, directionsLink } from './links.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderBlocks(plan: DayPlan): string {
  return plan.blocks
    .map(
      (b) => `
      <div class="block">
        <div class="block-time">${escapeHtml(b.time)}</div>
        <div class="block-what">${escapeHtml(b.what)}</div>
      </div>`,
    )
    .join('');
}

function renderPlanA(plan: DayPlan): string {
  return `
    <div class="plan-block plan-a-block">
      <div class="plan-head">
        <span class="plan-badge">${escapeHtml(plan.label)}</span>
        <h4 class="plan-headline">${escapeHtml(plan.headline)}</h4>
        <span class="plan-energy">${escapeHtml(plan.energy)}</span>
      </div>
      <div class="blocks">${renderBlocks(plan)}</div>
    </div>`;
}

function renderPlanB(plan: DayPlan): string {
  return `
    <details class="plan-b-toggle plan-b-block">
      <summary>Show ${escapeHtml(plan.label)} — ${escapeHtml(plan.headline)}</summary>
      <div class="plan-b-inner">
        <div class="plan-head">
          <span class="plan-badge">${escapeHtml(plan.label)}</span>
          <h4 class="plan-headline">${escapeHtml(plan.headline)}</h4>
          <span class="plan-energy">${escapeHtml(plan.energy)}</span>
        </div>
        <div class="blocks">${renderBlocks(plan)}</div>
      </div>
    </details>`;
}

function renderDriveChip(day: Day): string {
  if (day.driveFrom && day.driveTo && day.driveSummary.toLowerCase() !== 'no driving — shabbat.') {
    const href = directionsLink(day.driveFrom, day.driveTo);
    return `<span class="chip"><strong>Drive</strong> <a href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">${escapeHtml(day.driveSummary)}</a></span>`;
  }
  return `<span class="chip"><strong>Drive</strong> ${escapeHtml(day.driveSummary)}</span>`;
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
  const spotLink = day.sunsetMapsQuery
    ? `<div class="sunset-place">📍 <a href="${escapeHtml(mapsLink(day.sunsetMapsQuery))}" target="_blank" rel="noreferrer noopener">${escapeHtml(day.sunsetSpot)}</a></div>`
    : `<div class="sunset-place">📍 ${escapeHtml(day.sunsetSpot)}</div>`;
  return `
    <div class="sunset-block">
      <div class="sunset-label">☀ Sunset · ${escapeHtml(day.sunsetTime)}</div>
      <div class="sunset-spot">${escapeHtml(describeSunset(day))}</div>
      ${spotLink}
    </div>`;
}

// Generate a one-line sunset description from the day metadata. Mostly the spot
// name carries it; for the Königssee day we lean into "Tara Bridge moment."
function describeSunset(day: Day): string {
  if (day.tarabridgeMoment) {
    return day.sunsetSpot;
  }
  return day.sunsetSpot;
}

export function renderDayCard(day: Day, index: number): string {
  const peakBadge = day.tarabridgeMoment
    ? `<div class="day-hero-badge peak" title="Peak moment">⭐ Tara-Bridge moment</div>`
    : `<div class="day-hero-badge">☀ Sunset ${escapeHtml(day.sunsetTime)}</div>`;

  const summary = day.summary
    ? `<p class="day-summary">${escapeHtml(day.summary)}</p>`
    : '';

  return `
  <article class="day" id="${escapeHtml(day.id)}">
    <div class="day-hero">
      <img loading="lazy" decoding="async" src="${escapeHtml(day.imgUrl)}" alt="${escapeHtml(day.imgAlt)}" />
      ${peakBadge}
    </div>
    <header class="day-header">
      <div class="day-label">Day ${index + 1} · ${escapeHtml(day.dateLabel)}</div>
      <h2 class="day-title">${escapeHtml(day.title)}</h2>
      ${summary}
    </header>
    <div class="day-meta">
      ${renderDriveChip(day)}
      ${renderSleepChip(day)}
      <span class="chip"><strong>Walking</strong> ${escapeHtml(day.walkingNote)}</span>
    </div>
    ${renderPlanA(day.planA)}
    ${renderPlanB(day.planB)}
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
