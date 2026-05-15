import { TRIP } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bindLanding(): void {
  const intro = document.querySelector<HTMLParagraphElement>('[data-bind="intro"]');
  if (intro) intro.textContent = TRIP.intro;

  const anchor = document.querySelector<HTMLParagraphElement>('[data-bind="anchor"]');
  if (anchor) anchor.textContent = TRIP.natureAnchor;

  const totalEur = document.querySelector<HTMLSpanElement>('[data-bind="total-eur"]');
  if (totalEur) totalEur.textContent = TRIP.totalCostEur.toLocaleString('en-US');
  const totalNis = document.querySelector<HTMLSpanElement>('[data-bind="total-nis"]');
  if (totalNis) totalNis.textContent = TRIP.totalCostNis.toLocaleString('en-US');
  const ceiling = document.querySelector<HTMLSpanElement>('[data-bind="ceiling"]');
  if (ceiling) ceiling.textContent = TRIP.ceilingEur.toLocaleString('en-US');

  const peakSpot = document.querySelector<HTMLHeadingElement>('[data-bind="peak-spot"]');
  if (peakSpot) peakSpot.textContent = TRIP.peakMoment.spot;
  const peakDesc = document.querySelector<HTMLParagraphElement>('[data-bind="peak-desc"]');
  if (peakDesc) peakDesc.textContent = TRIP.peakMoment.description;

  // Day-at-a-glance list
  const glance = document.querySelector<HTMLOListElement>('#day-glance');
  if (glance) {
    glance.innerHTML = TRIP.days
      .map(
        (d) =>
          `<li><a href="itinerary.html#${escapeHtml(d.id)}"><strong>${escapeHtml(d.dateLabel)}</strong> — ${escapeHtml(d.headline)} <span class="dot">·</span> <span class="muted">sunset ${escapeHtml(d.sunset.time)}</span></a></li>`,
      )
      .join('');
  }

  const skipList = document.querySelector<HTMLUListElement>('#skip-list');
  if (skipList) {
    skipList.innerHTML = TRIP.skipList
      .map(
        (s) =>
          `<li><strong>${escapeHtml(s.item)}</strong> — ${escapeHtml(s.reason)}</li>`,
      )
      .join('');
  }
}

bindLanding();
initNotesWidget();
