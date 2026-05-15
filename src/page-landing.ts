import { OPTIONS, SKIP_LIST } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';

function bindLanding(): void {
  // Option cards
  const aCost = document.querySelector<HTMLSpanElement>('[data-bind="a-cost"]');
  if (aCost) aCost.textContent = `€${OPTIONS.A.costSummaryEur.toLocaleString('en-US')}`;
  const bCost = document.querySelector<HTMLSpanElement>('[data-bind="b-cost"]');
  if (bCost) bCost.textContent = `€${OPTIONS.B.costSummaryEur.toLocaleString('en-US')}`;

  const aTagline = document.querySelector<HTMLParagraphElement>('[data-bind="a-tagline"]');
  if (aTagline) aTagline.textContent = OPTIONS.A.tagline;
  const bTagline = document.querySelector<HTMLParagraphElement>('[data-bind="b-tagline"]');
  if (bTagline) bTagline.textContent = OPTIONS.B.tagline;

  // Skip list
  const skipList = document.querySelector<HTMLUListElement>('#skip-list');
  if (skipList) {
    skipList.innerHTML = SKIP_LIST.map(
      (s) =>
        `<li><strong>${escapeHtml(s.item)}</strong> — ${escapeHtml(s.reason)}</li>`,
    ).join('');
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

bindLanding();
initNotesWidget();
