// Render a single Day card. Hour-by-hour blocks for Plan A + Plan B.
// v2 — replaces tier-based rendering. Single concrete spine, no mood menus.

import type { Day, DayPlan } from './trip-data.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPlan(plan: DayPlan, kind: 'a' | 'b'): string {
  const rows = plan.blocks
    .map(
      (b) => `
      <div class="block">
        <div class="block-time">${escapeHtml(b.time)}</div>
        <div class="block-what">${escapeHtml(b.what)}</div>
      </div>`,
    )
    .join('');
  return `
    <div class="plan plan-${kind}">
      <div class="plan-head">
        <span class="plan-letter">${escapeHtml(plan.label)}</span>
        <h4>${escapeHtml(plan.headline)}</h4>
        <span class="plan-energy">${escapeHtml(plan.energy)}</span>
      </div>
      <div class="blocks">${rows}</div>
    </div>`;
}

export function renderDayCard(day: Day): string {
  const tara = day.tarabridgeMoment
    ? `<div class="tara-flag">⭐ Tara-Bridge moment — ${escapeHtml(day.tarabridgeMoment)}</div>`
    : '';

  return `
  <article class="day" id="${escapeHtml(day.id)}">
    <div class="day-header">
      <div>
        <div class="day-date">${escapeHtml(day.dateLabel)}</div>
        <div class="day-title">${escapeHtml(day.title)}</div>
      </div>
      <div class="day-meta">
        <span class="badge sunset">☀️ Sunset ${escapeHtml(day.sunsetTime)}</span>
        <span class="badge">🚗 ${escapeHtml(day.driveSummary)}</span>
      </div>
    </div>
    <img class="day-img" loading="lazy" src="${escapeHtml(day.imgUrl)}" alt="${escapeHtml(day.imgAlt)}" />
    <div class="day-body">
      ${tara}
      <div class="day-meta-row">
        <div><strong>Sunset spot:</strong> ${escapeHtml(day.sunsetSpot)}</div>
        <div><strong>Walking:</strong> ${escapeHtml(day.walkingNote)}</div>
        <div><strong>Meals:</strong> ${escapeHtml(day.meals)}</div>
      </div>
      <div class="plans">
        ${renderPlan(day.planA, 'a')}
        ${renderPlan(day.planB, 'b')}
      </div>
    </div>
  </article>`;
}

export function attachImageLoadHandlers(root: HTMLElement): void {
  const imgs = root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]');
  imgs.forEach((img) => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
    }
  });
}
