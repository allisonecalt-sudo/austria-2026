// Rental-car page bootstrap.
// V2 (2026-05-17): sortable comparison table + PureTech-engine filter.
// Notes widget + chat-plan popup stay loaded as on every other page.
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';

initNotesWidget();
initChatPlanPopup();

// -----------------------------------------------------------------
// PureTech filter — hides cards with data-puretech="true" when checked.
// -----------------------------------------------------------------
function initPureTechFilter(): void {
  const checkbox = document.getElementById('rental-car-puretech-filter-input');
  if (!(checkbox instanceof HTMLInputElement)) return;

  const apply = (): void => {
    const hide = checkbox.checked;
    const cards = document.querySelectorAll<HTMLElement>('.alt-card[data-puretech]');
    cards.forEach((card) => {
      const isPureTech = card.dataset.puretech === 'true';
      card.classList.toggle('rental-car-hidden-by-filter', hide && isPureTech);
    });
    const rows = document.querySelectorAll<HTMLTableRowElement>(
      '#rental-car-comparison tbody tr[data-puretech]',
    );
    rows.forEach((row) => {
      const isPureTech = row.dataset.puretech === 'true';
      row.style.display = hide && isPureTech ? 'none' : '';
    });
  };

  checkbox.addEventListener('change', apply);
  apply();
}

// -----------------------------------------------------------------
// Sortable comparison table — click a th[data-sort] to sort.
// Numeric sorts on data-{price,ncap,boot,counter}; string on data-name;
// boolean on data-puretech.
// -----------------------------------------------------------------
type SortKey = 'name' | 'price' | 'ncap' | 'boot' | 'puretech' | 'counter';
type SortDir = 'ascending' | 'descending';

function sortTable(table: HTMLTableElement, key: SortKey, dir: SortDir): void {
  const tbody = table.tBodies[0];
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('tr'));

  const valueOf = (row: HTMLTableRowElement): number | string => {
    if (key === 'name') return row.dataset.name ?? '';
    if (key === 'puretech') {
      // true sorts after false ascending; treat true=1, false=0
      return row.dataset.puretech === 'true' ? 1 : 0;
    }
    const raw = row.dataset[key];
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  };

  rows.sort((a, b) => {
    const va = valueOf(a);
    const vb = valueOf(b);
    if (typeof va === 'string' && typeof vb === 'string') {
      return dir === 'ascending' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    const na = Number(va);
    const nb = Number(vb);
    return dir === 'ascending' ? na - nb : nb - na;
  });

  rows.forEach((row) => tbody.appendChild(row));
}

function initSortableComparison(): void {
  const table = document.getElementById('rental-car-comparison');
  if (!(table instanceof HTMLTableElement)) return;

  const headers = table.querySelectorAll<HTMLTableCellElement>('th[data-sort]');
  headers.forEach((th) => {
    const handleSort = (): void => {
      const key = th.dataset.sort as SortKey | undefined;
      if (!key) return;
      const current = th.getAttribute('aria-sort');
      const next: SortDir = current === 'ascending' ? 'descending' : 'ascending';
      headers.forEach((other) => other.setAttribute('aria-sort', 'none'));
      th.setAttribute('aria-sort', next);
      sortTable(table, key, next);
    };
    th.addEventListener('click', handleSort);
    th.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSort();
      }
    });
  });

  // Default sort: price ascending.
  const defaultHeader = table.querySelector<HTMLTableCellElement>('th[data-sort="price"]');
  if (defaultHeader) {
    sortTable(table, 'price', 'ascending');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initPureTechFilter();
  initSortableComparison();
});
// If DOMContentLoaded already fired (script loaded late), run immediately.
if (document.readyState !== 'loading') {
  initPureTechFilter();
  initSortableComparison();
}
