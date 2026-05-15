// Entry script for /itinerary.html — the single concrete 7-day spine.

import { TRIP } from './trip-data.js';
import { renderDayCard, attachImageLoadHandlers } from './day-render.js';
import { initNotesWidget } from './notes-widget.js';

function render(): void {
  const intro = document.querySelector<HTMLParagraphElement>('[data-bind="intro"]');
  if (intro) intro.textContent = TRIP.intro;

  const why = document.querySelector<HTMLParagraphElement>('[data-bind="why"]');
  if (why) why.textContent = TRIP.whyThisPlan;

  const anchor = document.querySelector<HTMLParagraphElement>('[data-bind="anchor"]');
  if (anchor) anchor.textContent = TRIP.natureAnchor;

  const peakDay = document.querySelector<HTMLSpanElement>('[data-bind="peak-day"]');
  if (peakDay) peakDay.textContent = TRIP.peakMoment.day;
  const peakSpot = document.querySelector<HTMLHeadingElement>('[data-bind="peak-spot"]');
  if (peakSpot) peakSpot.textContent = TRIP.peakMoment.spot;
  const peakDesc = document.querySelector<HTMLParagraphElement>('[data-bind="peak-desc"]');
  if (peakDesc) peakDesc.textContent = TRIP.peakMoment.description;

  const container = document.querySelector<HTMLDivElement>('#days');
  if (container) {
    container.innerHTML = TRIP.days.map(renderDayCard).join('');
    attachImageLoadHandlers(container);
  }
}

render();
initNotesWidget();
