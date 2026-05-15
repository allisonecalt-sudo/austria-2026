import { TRIP } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';

const eurEls = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-eur"]');
eurEls.forEach((el) => (el.textContent = `€${TRIP.totalCostEur.toLocaleString('en-US')}`));

const nisEls = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-nis"]');
nisEls.forEach((el) => (el.textContent = `₪${TRIP.totalCostNis.toLocaleString('en-US')}`));

const ceilEls = document.querySelectorAll<HTMLSpanElement>('[data-bind="ceiling"]');
ceilEls.forEach((el) => (el.textContent = `€${TRIP.ceilingEur.toLocaleString('en-US')}`));

initNotesWidget();
