// Entry script for /itinerary.html — the single concrete 7-day spine.
// v3: sticky day-nav + reigned-in card layout.

import { TRIP } from './trip-data.js';
import { renderDayCard, attachImageLoadHandlers } from './day-render.js';
import { renderDayNav } from './day-nav.js';
import { initNotesWidget } from './notes-widget.js';

function render(): void {
  const why = document.querySelector<HTMLParagraphElement>('[data-bind="why"]');
  if (why) why.textContent = TRIP.whyThisPlan;

  const peakDay = document.querySelector<HTMLSpanElement>('[data-bind="peak-day"]');
  if (peakDay) peakDay.textContent = TRIP.peakMoment.day;
  const peakSpot = document.querySelector<HTMLHeadingElement>('[data-bind="peak-spot"]');
  if (peakSpot) peakSpot.textContent = TRIP.peakMoment.spot;
  const peakDesc = document.querySelector<HTMLParagraphElement>('[data-bind="peak-desc"]');
  if (peakDesc) peakDesc.textContent = TRIP.peakMoment.description;

  // Sticky day-nav (between global nav and content).
  renderDayNav({ days: TRIP.days, mountSelector: '#day-nav-mount' });

  const container = document.querySelector<HTMLDivElement>('#days');
  if (container) {
    container.innerHTML = TRIP.days.map((d, i) => renderDayCard(d, i)).join('');
    attachImageLoadHandlers(container);
  }
}

render();
initNotesWidget();
