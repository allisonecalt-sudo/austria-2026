import { OPTIONS } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';

const aEur = document.querySelector<HTMLSpanElement>('[data-bind="a-cost-eur"]');
if (aEur) aEur.textContent = `€${OPTIONS.A.costSummaryEur.toLocaleString('en-US')}`;
const aNis = document.querySelector<HTMLSpanElement>('[data-bind="a-cost-nis"]');
if (aNis) aNis.textContent = `₪${OPTIONS.A.costSummaryNis.toLocaleString('en-US')}`;
const bEur = document.querySelector<HTMLSpanElement>('[data-bind="b-cost-eur"]');
if (bEur) bEur.textContent = `€${OPTIONS.B.costSummaryEur.toLocaleString('en-US')}`;
const bNis = document.querySelector<HTMLSpanElement>('[data-bind="b-cost-nis"]');
if (bNis) bNis.textContent = `₪${OPTIONS.B.costSummaryNis.toLocaleString('en-US')}`;

initNotesWidget();
