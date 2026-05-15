// Entry script for /option-a.html and /option-b.html. Renders all days
// for the option declared in body[data-option].

import { OPTIONS } from './trip-data.js';
import { renderDayCard, attachImageLoadHandlers } from './day-render.js';
import { initNotesWidget } from './notes-widget.js';

function render(): void {
  const optionLetter = document.body.dataset.option;
  if (optionLetter !== 'A' && optionLetter !== 'B') {
    return;
  }
  const option = OPTIONS[optionLetter];

  const titleEl = document.querySelector<HTMLHeadingElement>('[data-bind="option-name"]');
  if (titleEl) titleEl.textContent = option.name;

  const taglineEl = document.querySelector<HTMLParagraphElement>('[data-bind="tagline"]');
  if (taglineEl) taglineEl.textContent = option.tagline;

  const oneLinerEl = document.querySelector<HTMLParagraphElement>('[data-bind="one-liner"]');
  if (oneLinerEl) oneLinerEl.textContent = option.oneLiner;

  const knockoutTitle = document.querySelector<HTMLHeadingElement>('[data-bind="knockout-title"]');
  if (knockoutTitle) knockoutTitle.textContent = option.knockout.title;

  const knockoutBody = document.querySelector<HTMLParagraphElement>('[data-bind="knockout-body"]');
  if (knockoutBody) knockoutBody.textContent = option.knockout.body;

  const costEur = document.querySelector<HTMLSpanElement>('[data-bind="cost-eur"]');
  if (costEur) costEur.textContent = `€${option.costSummaryEur.toLocaleString('en-US')}`;

  const costNis = document.querySelector<HTMLSpanElement>('[data-bind="cost-nis"]');
  if (costNis) costNis.textContent = `₪${option.costSummaryNis.toLocaleString('en-US')}`;

  const recNote = document.querySelector<HTMLParagraphElement>('[data-bind="rec-note"]');
  if (recNote) recNote.textContent = option.recommendationNote;

  const container = document.querySelector<HTMLDivElement>('#days');
  if (container) {
    container.innerHTML = option.days.map(renderDayCard).join('');
    attachImageLoadHandlers(container);
  }
}

render();
initNotesWidget();
