// Render a single Day card. Pure DOM (no innerHTML in user input — only static strings).

import type { Day } from './trip-data.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderDayCard(day: Day): string {
  const tiers = day.tiers
    .map(
      (t) => `
    <div class="tier ${t.level}">
      <h4>${escapeHtml(t.label)}</h4>
      <p>${escapeHtml(t.plan)}</p>
    </div>`,
    )
    .join('');

  const timeline = day.timeline
    .map(
      (row) => `
    <div class="row"><div class="when">${escapeHtml(row.when)}</div><div>${escapeHtml(row.text)}</div></div>`,
    )
    .join('');

  return `
  <article class="day" id="${escapeHtml(day.id)}">
    <div class="day-header">
      <div>
        <div class="day-title">${escapeHtml(day.dateLabel)} · ${escapeHtml(day.title)}</div>
      </div>
      <div class="day-meta">
        <span class="badge">🚗 ${escapeHtml(day.driveMinutes)}</span>
        <span class="badge">👟 ${escapeHtml(day.walkingDifficulty)}</span>
        <span class="badge sunset">☀️ ${escapeHtml(day.sunsetBadge)}</span>
      </div>
    </div>
    <img class="day-img" loading="lazy" src="${escapeHtml(day.imgUrl)}" alt="${escapeHtml(day.imgAlt)}" />
    <div class="day-body">
      <div class="tiers">${tiers}</div>
      <div class="timeline">${timeline}</div>
    </div>
    <div class="day-foot">
      <div class="pair"><strong>Sleep:</strong> ${escapeHtml(day.sleepWhere)} · ${escapeHtml(day.sleepCostEur)}</div>
      <div class="pair"><strong>Kosher:</strong> ${escapeHtml(day.kosherFood)}</div>
      <div class="montenegro-line">${escapeHtml(day.whyMontenegro)}</div>
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
