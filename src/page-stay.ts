// Entry script for /stay.html — real Booking.com lodging listings per base.

import { TRIP, type BudgetTier, type LodgingPlatform } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tierBadge(tier?: BudgetTier): string {
  if (!tier) return '';
  const map: Record<BudgetTier, string> = {
    lean: '💰 Lean',
    standard: '💰💰 Standard',
    splurge: '💰💰💰 Mid-high',
  };
  return `<span class="chip" title="Budget tier">${map[tier]}</span>`;
}

function platformBadge(p?: LodgingPlatform): string {
  if (!p) return '';
  return `<span class="chip">${p === 'booking' ? 'Booking.com' : 'Airbnb'}</span>`;
}

function walkBadge(min?: number): string {
  if (min === undefined) return '';
  return `<span class="chip" title="Walk to Chabad Salzburg">🚶 ${min} min to Chabad</span>`;
}

function driveBadge(min?: number): string {
  if (min === undefined) return '';
  return `<span class="chip" title="Drive to airport terminal">🚗 ${min} min to SZG</span>`;
}

function chipRow(chips: string[]): string {
  const non = chips.filter(Boolean);
  if (non.length === 0) return '';
  return `<div class="day-meta" style="margin-top:0.6rem;">${non.join('')}</div>`;
}

function renderLodging(l: (typeof TRIP.lodgings)[number]): string {
  const altCards = l.alts
    .map(
      (a) => `
      <a class="alt-card" href="${escapeHtml(a.url)}" target="_blank" rel="noreferrer noopener">
        <img class="alt-img" loading="lazy" src="${escapeHtml(a.img)}" alt="${escapeHtml(a.name)}" />
        <div class="alt-body">
          <div class="alt-name">${escapeHtml(a.name)}</div>
          <div class="alt-meta">${escapeHtml(a.review)} · <strong>${escapeHtml(a.pricePerNight)}</strong></div>
          <p class="alt-note">${escapeHtml(a.note)}</p>
          ${chipRow([
            tierBadge(a.budgetTier),
            platformBadge(a.platform),
            walkBadge(a.walkToChabadMin),
            driveBadge(a.driveToAirportMin),
          ])}
          <div class="alt-cta">View on Booking.com →</div>
        </div>
      </a>`,
    )
    .join('');

  return `
    <section class="lodging">
      <div class="lodging-head">
        <div class="lodging-tag">${escapeHtml(l.baseKey.toUpperCase())}</div>
        <h2>${escapeHtml(l.nights)}</h2>
        <p class="lodging-area">${escapeHtml(l.area)}</p>
      </div>

      <a class="pick-card" href="${escapeHtml(l.pickUrl)}" target="_blank" rel="noreferrer noopener">
        <img class="pick-img" loading="lazy" src="${escapeHtml(l.pickImg)}" alt="${escapeHtml(l.pickName)}" />
        <div class="pick-body">
          <div class="pick-tag">Allison's pick</div>
          <h3>${escapeHtml(l.pickName)}</h3>
          <div class="pick-meta">${escapeHtml(l.pickReview)} · <strong>${escapeHtml(l.pickPrice)}</strong></div>
          <p class="pick-why">${escapeHtml(l.pickWhy)}</p>
          ${chipRow([
            tierBadge(l.pickBudgetTier),
            platformBadge(l.pickPlatform),
            walkBadge(l.pickWalkToChabadMin),
            driveBadge(l.pickDriveToAirportMin),
          ])}
          <div class="pick-cta">View on Booking.com →</div>
        </div>
      </a>

      <div class="alts">
        <div class="alts-label">Backup options</div>
        <div class="alts-grid">${altCards}</div>
      </div>
    </section>`;
}

function render(): void {
  const root = document.querySelector<HTMLDivElement>('#lodgings');
  if (root) {
    root.innerHTML = TRIP.lodgings.map(renderLodging).join('');
  }
}

render();
initNotesWidget();
