// Entry script for /itinerary.html — the 7-day spine, glanceable cards.
// v4 (2026-05-16): collapsed-by-default day cards with expand-all controls
// + hash-deep-link auto-open.

import { TRIP } from './trip-data.js';
import { renderDayCard, attachImageLoadHandlers, attachExpandAllControls } from './day-render.js';
import { renderDayNav } from './day-nav.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';

function render(): void {
  const why = document.querySelector<HTMLParagraphElement>('[data-bind="why"]');
  if (why) why.textContent = TRIP.whyThisPlan;

  const peakDay = document.querySelector<HTMLSpanElement>('[data-bind="peak-day"]');
  if (peakDay) peakDay.textContent = TRIP.peakMoment.day;
  const peakSpot = document.querySelector<HTMLHeadingElement>('[data-bind="peak-spot"]');
  if (peakSpot) peakSpot.textContent = TRIP.peakMoment.spot;
  const peakDesc = document.querySelector<HTMLParagraphElement>('[data-bind="peak-desc"]');
  if (peakDesc) peakDesc.textContent = TRIP.peakMoment.description;

  renderDayNav({ days: TRIP.days, mountSelector: '#day-nav-mount' });

  const container = document.querySelector<HTMLDivElement>('#days');
  if (container) {
    container.innerHTML = TRIP.days.map((d, i) => renderDayCard(d, i)).join('');
    attachImageLoadHandlers(container);

    // If URL has a hash (#tue-jul-28 etc), force-open that day's disclosure.
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        const details = target.querySelector<HTMLDetailsElement>('.day-disclose');
        if (details) details.open = true;
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }

  attachExpandAllControls();
}

render();
initNotesWidget();
initChatPlanPopup();
