/**
 * nav-coordinator.ts — Cross-component "mobile nav is open" signal.
 *
 * Problem (2026-05-17, Allison reported 4+ times):
 *   .nav-mobile.is-open lives at z-index 2147483642 (max int) but underlying
 *   fixed overlays (.map-sidebar @ 1500, .place-drawer @ 1500, .fab @ 9999)
 *   stayed VISIBLE + SCROLLABLE behind the slide-over, making the menu feel
 *   "behind the page" even though z-order said otherwise. Z-bumping alone
 *   can't fix it — the other overlays have to retract.
 *
 * The hamburger handler is inline JS in every .html page (not modifiable
 * without touching markup), but it DOES toggle `document.body.classList
 * .nav-mobile-open`. We piggyback on that class change via MutationObserver
 * and re-broadcast as DOM CustomEvents that any page-*.ts module can listen
 * for.
 *
 * Events dispatched on `window`:
 *   - `nav-mobile-opened`  (when body.nav-mobile-open is added)
 *   - `nav-mobile-closed`  (when removed)
 *
 * Auto-initializes on import. Idempotent — safe to import from multiple
 * page modules; the observer is installed once per document.
 *
 * CSS-side (in styles.css):
 *   - .fab is hidden via `body.nav-mobile-open .fab { visibility: hidden }`
 *   - body scroll-lock via `body.nav-mobile-open { overflow:hidden;
 *     position:fixed; width:100% }` (iOS Safari needs all three)
 */

const OBSERVER_FLAG = '__navCoordinatorInstalled' as const;

interface WindowWithFlag extends Window {
  [OBSERVER_FLAG]?: boolean;
}

export const NAV_OPENED_EVENT = 'nav-mobile-opened';
export const NAV_CLOSED_EVENT = 'nav-mobile-closed';

function installNavObserver(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const w = window as WindowWithFlag;
  if (w[OBSERVER_FLAG]) return;
  w[OBSERVER_FLAG] = true;

  let lastState = document.body.classList.contains('nav-mobile-open');

  const observer = new MutationObserver(() => {
    const nowOpen = document.body.classList.contains('nav-mobile-open');
    if (nowOpen === lastState) return;
    lastState = nowOpen;
    window.dispatchEvent(new CustomEvent(nowOpen ? NAV_OPENED_EVENT : NAV_CLOSED_EVENT));
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installNavObserver, { once: true });
  } else {
    installNavObserver();
  }
}
