// page-search.ts — global search overlay + bottom-left search pill, loaded
// on every page that includes the standard nav. NEW file, owned by Search &
// Discovery agent 2026-05-17.
//
// Allison 2026-05-17 06:13: "wondering on ways to get this site more
// searchable? And interactive like being able to see recomendation easily
// location easily."
//
// What this does:
//   - Mounts a "🔍 Search" pill at bottom-LEFT (the 💬 notes fab owns
//     bottom-right). z-index below the notes modal so the notes modal
//     still wins if both open.
//   - Wires Cmd/Ctrl+/ as the keyboard shortcut (Cmd+K belongs to the
//     notes widget per notes-widget.ts).
//   - Renders a full-screen overlay on phones, a centered modal on
//     desktop. Search input at the top, results grouped by type below.
//   - Each result row: type icon · name · location chip · 1-line
//     description · "Open →" link. Click anywhere on the row to navigate.
//   - Keyboard nav: ArrowDown/ArrowUp to move selection, Enter to open,
//     Esc to close. Tab cycles inside the overlay (focus trap).
//   - On open, restores last query (sessionStorage) so reopening picks
//     up where Avital left off.
//   - On close, returns focus to the trigger.
//
// Accessibility:
//   - role="dialog" aria-modal="true" on the overlay
//   - aria-live="polite" on the result-count line for screen readers
//   - data-search-skip on the floating pill so it doesn't appear on the
//     notes.html / login screens that already have their own search box.
//
// CSS lives in styles.css under the .search-overlay-* / .search-pill-*
// selectors (appended in the same commit as this file).

import {
  search,
  groupByType,
  typeLabel,
  typeIcon,
  type SearchHit,
  type SearchType,
} from './search-index.js';

const QUERY_STORAGE_KEY = 'austria-search-last-query';

// 2026-06-08 reconcile: the 15 archived deep-dive pages were DELETED (site =
// current only). Search entries that pointed at those pages are repointed to
// the live page that now holds the content; the dead #anchor is dropped.
const ARCHIVED_PAGE_HOME: Record<string, string> = {
  'trip-options.html': 'itinerary.html',
  'trip-summary.html': 'itinerary.html',
  'krippenstein.html': 'itinerary.html',
  'bases.html': 'stay.html',
  'shabbat.html': 'logistics.html',
  'friday-salzburg.html': 'logistics.html',
  'sundays-closed.html': 'logistics.html',
  'weather-plan-c.html': 'logistics.html',
  'nature-destinations.html': 'activities.html',
  'top-sunsets.html': 'activities.html',
  'lake-swimming.html': 'activities.html',
  'water-activities.html': 'activities.html',
  'jewish-sights.html': 'activities.html',
  'recommendations.html': 'activities.html',
  'schafbergspitze.html': 'activities.html',
  // 2026-06-08 structure simplification: the five logistics deep-dives were
  // folded into logistics.html as collapsible sections; repoint to the anchor.
  'rental-car.html': 'logistics.html#fold-rental-car',
  'driving-austria.html': 'logistics.html#fold-driving',
  'packing.html': 'logistics.html#fold-packing',
  'pre-trip.html': 'logistics.html#fold-pretrip',
  'cafes.html': 'logistics.html#fold-cafes',
};

function resolveSearchUrl(url: string): string {
  // Only touch bare relative page URLs (no scheme, no leading slash, no ../).
  if (/^(https?:|\/|\.\.\/|archive\/)/.test(url)) return url;
  const page = url.split('#')[0];
  return ARCHIVED_PAGE_HOME[page] ?? url;
}

// =====================================================================
// Floating pill — triggers the overlay. Mounted bottom-LEFT to avoid the
// notes fab (bottom-RIGHT). z-index just below the notes fab.
// =====================================================================

function buildPill(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'search-pill';
  btn.setAttribute('aria-label', 'Search the trip (Cmd/Ctrl+/)');
  btn.innerHTML =
    '<span aria-hidden="true">🔍</span><span class="search-pill__label">Search</span>';
  return btn;
}

// =====================================================================
// Overlay — full-screen on phone, modal on desktop.
// =====================================================================

interface OverlayRefs {
  root: HTMLDivElement;
  input: HTMLInputElement;
  count: HTMLDivElement;
  results: HTMLDivElement;
  closeBtn: HTMLButtonElement;
}

function buildOverlay(): OverlayRefs {
  const root = document.createElement('div');
  root.className = 'search-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Search the Austria 2026 trip site');
  root.innerHTML = `
    <div class="search-overlay__panel">
      <div class="search-overlay__header">
        <label class="search-overlay__input-wrap">
          <span aria-hidden="true" class="search-overlay__icon">🔍</span>
          <input
            type="search"
            class="search-overlay__input"
            placeholder="Search lodgings, places, sunsets, activities…"
            autocomplete="off"
            spellcheck="false"
            aria-controls="search-overlay-results"
          />
        </label>
        <button type="button" class="search-overlay__close" aria-label="Close search">✕</button>
      </div>
      <div class="search-overlay__count" aria-live="polite" role="status"></div>
      <div class="search-overlay__results" id="search-overlay-results" role="listbox"></div>
      <div class="search-overlay__footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
        <span><kbd>Enter</kbd> open</span>
        <span><kbd>Esc</kbd> close</span>
        <span class="search-overlay__footer-spacer"></span>
        <a href="activities.html" class="search-overlay__rec-link">⭐ See recommendations →</a>
      </div>
    </div>
  `;
  return {
    root,
    input: root.querySelector('.search-overlay__input') as HTMLInputElement,
    count: root.querySelector('.search-overlay__count') as HTMLDivElement,
    results: root.querySelector('.search-overlay__results') as HTMLDivElement,
    closeBtn: root.querySelector('.search-overlay__close') as HTMLButtonElement,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderGroup(type: SearchType, hits: SearchHit[]): string {
  const rows = hits
    .map((h, i) => {
      const item = h.item;
      const loc = item.location
        ? `<span class="search-row__loc">${escapeHtml(item.location)}</span>`
        : '';
      const cat = item.category
        ? `<span class="search-row__cat">${escapeHtml(item.category)}</span>`
        : '';
      const img = item.img
        ? `<img class="search-row__img" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />`
        : '<div class="search-row__img search-row__img--placeholder">' +
          typeIcon(item.type) +
          '</div>';
      return `
        <a
          class="search-row"
          href="${escapeHtml(resolveSearchUrl(item.url))}"
          role="option"
          tabindex="-1"
          data-row-index="${i}"
          data-row-type="${type}"
        >
          ${img}
          <div class="search-row__body">
            <div class="search-row__top">
              <span class="search-row__icon" aria-hidden="true">${typeIcon(item.type)}</span>
              <span class="search-row__name">${escapeHtml(item.name)}</span>
              ${cat}
            </div>
            <div class="search-row__desc">${escapeHtml(item.description)}</div>
            <div class="search-row__meta">${loc}<span class="search-row__open">Open →</span></div>
          </div>
        </a>
      `;
    })
    .join('');
  return `
    <section class="search-group" data-search-group="${type}">
      <h3 class="search-group__title">
        <span aria-hidden="true">${typeIcon(type)}</span> ${escapeHtml(typeLabel(type))}
        <span class="search-group__count">${hits.length}</span>
      </h3>
      <div class="search-group__rows">${rows}</div>
    </section>
  `;
}

function render(refs: OverlayRefs, query: string): void {
  const hits = search(query, 80);
  refs.count.textContent =
    hits.length === 0
      ? `No matches for "${query}". Try "sunset", "rafting", "Hallstatt", "kosher", "summit".`
      : `${hits.length} ${hits.length === 1 ? 'match' : 'matches'}${query ? ` for "${query}"` : ' (browse everything)'}`;
  const grouped = groupByType(hits);
  if (grouped.size === 0) {
    refs.results.innerHTML =
      '<div class="search-empty">No matches. Try fewer or different words.</div>';
    return;
  }
  const html = [...grouped.entries()].map(([t, h]) => renderGroup(t, h)).join('');
  refs.results.innerHTML = html;
}

// =====================================================================
// Keyboard nav — flat row index across all groups.
// =====================================================================

function rowsArray(refs: OverlayRefs): HTMLAnchorElement[] {
  return Array.from(refs.results.querySelectorAll<HTMLAnchorElement>('.search-row'));
}

function setActiveRow(rows: HTMLAnchorElement[], idx: number): void {
  rows.forEach((r, i) => {
    const active = i === idx;
    r.classList.toggle('search-row--active', active);
    if (active) {
      r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

// =====================================================================
// Mount + open/close lifecycle.
// =====================================================================

let activeRowIdx = 0;
let triggerEl: HTMLElement | null = null;

export function initSearch(): void {
  if (document.querySelector('.search-pill')) return; // mount-once guard
  // Some pages opt out (notes.html — already has its own widgets).
  if (document.body.dataset.searchSkip === 'true') return;

  const pill = buildPill();
  pill.style.zIndex = '99998'; // just under notes fab (99999)
  document.body.appendChild(pill);

  const refs = buildOverlay();
  refs.root.style.zIndex = '99997'; // overlay sits BELOW notes modal so a note
  // can still be left from within search.
  document.body.appendChild(refs.root);

  const open = (): void => {
    triggerEl = (document.activeElement as HTMLElement) ?? null;
    refs.root.classList.add('search-overlay--open');
    document.body.classList.add('search-overlay-open');
    // Restore last query so repeat opens are cheap.
    const last = sessionStorage.getItem(QUERY_STORAGE_KEY) ?? '';
    refs.input.value = last;
    render(refs, last);
    activeRowIdx = 0;
    setTimeout(() => {
      refs.input.focus();
      refs.input.select();
    }, 20);
  };
  const close = (): void => {
    refs.root.classList.remove('search-overlay--open');
    document.body.classList.remove('search-overlay-open');
    if (triggerEl && typeof triggerEl.focus === 'function') {
      triggerEl.focus();
    }
  };

  pill.addEventListener('click', open);
  refs.closeBtn.addEventListener('click', close);

  // Click outside the panel closes.
  refs.root.addEventListener('click', (e) => {
    if (e.target === refs.root) close();
  });

  // Input typing → re-render.
  refs.input.addEventListener('input', () => {
    const q = refs.input.value;
    sessionStorage.setItem(QUERY_STORAGE_KEY, q);
    render(refs, q);
    activeRowIdx = 0;
  });

  // Keyboard nav inside the overlay.
  refs.root.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    const rows = rowsArray(refs);
    if (rows.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeRowIdx = Math.min(activeRowIdx + 1, rows.length - 1);
      setActiveRow(rows, activeRowIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeRowIdx = Math.max(activeRowIdx - 1, 0);
      setActiveRow(rows, activeRowIdx);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const row = rows[activeRowIdx];
      if (row) {
        window.location.href = row.href;
      }
    } else if (e.key === 'Tab') {
      // Focus trap — input ↔ close button.
      const focusables: HTMLElement[] = [refs.input, refs.closeBtn];
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? focusables.indexOf(active) : -1;
      if (idx === -1) return;
      e.preventDefault();
      const next = (idx + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
      focusables[next].focus();
    }
  });

  // Global keyboard shortcut Cmd/Ctrl + /. Avoid Cmd+K (notes widget).
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      if (refs.root.classList.contains('search-overlay--open')) close();
      else open();
    }
  });

  // Hash trigger — landing on any page with #search opens the overlay.
  if (window.location.hash === '#search') open();
}

// Auto-init on import.
initSearch();
