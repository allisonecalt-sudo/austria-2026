// ===========================================================================
// nav.ts — the ONE site navigation, rendered into every page.
//
// Why this exists (Allison, Jul 23 2026): "the navigation bar at the moment
//   has collapsed everything and at the most granular level but there's like
//   two levels that we want to be able to see so there should be drop downs
//   that as an example it can be like itinerary or places we go in and then
//   within that there's the parts that relate to that then there is kosher
//   and then within kosher the list of things... instead of it just being one
//   big ball with everything... and then groceries and shopping list you can
//   just put it as a simple thing."
//
// Reorganised again 23 Jul 23:30, her ask: "the navigation for location
// travel needs two dropdowns — not all in one." Six top items now:
//   🏔 · 🔁 Week · Plan ▾ (choosing: options, pictures, picks, rank)
//   · Places ▾ (orientation: map, beds, rain, info, brochure, archive)
//   · Food ▾ · 🛒. Split by the QUESTION being asked, not by content type:
// Plan = "what should we do?", Places = "where are we / what's here?".
//
// It also removes a real duplication: the nav used to be hand-copied into
// twelve HTML files, which is how three different versions of it ended up
// live at once. One module, one source of truth, imported by every page.
//
// Mobile first: top-level items are 44px tall and always visible; the menus
// open on tap (not hover), close on outside-tap / Escape, and are keyboard
// reachable. Nothing here depends on a pointer.
// ===========================================================================

interface NavLink {
  href: string;
  label: string;
}

interface NavItem {
  href?: string;
  label: string;
  children?: NavLink[];
}

const ITEMS: NavItem[] = [
  { href: 'hub.html', label: '🏔' },
  { href: 'routes.html', label: '🔁 Week' },
  {
    label: 'Plan',
    children: [
      { href: 'plan.html', label: '🗺 The Plan — all the options' },
      { href: 'gallery.html', label: '📸 Wow — just the pictures' },
      { href: 'favorites.html', label: '❤️ Our picks — what you chose' },
      { href: 'rank.html', label: '⭐ Rank it' },
    ],
  },
  {
    label: 'Places',
    children: [
      { href: 'overview.html', label: '🧭 Where you are — the map' },
      { href: 'bases.html', label: '🛏 From your bed' },
      { href: 'rain.html', label: '☂ Rainy day' },
      { href: 'info.html', label: '🔑 Trip info — bookings, car, flights' },
      { href: 'index.html', label: '📖 The brochure' },
      { href: 'claude.html', label: '📦 Archive — the pre-forecast week' },
    ],
  },
  {
    label: 'Food',
    children: [
      { href: 'certified.html', label: '✅ Certified — the easy path' },
      { href: 'kosher.html', label: '✡️ Field guide — reading a label' },
      { href: 'shop.html', label: '🔍 By ingredient — photo grid' },
      { href: 'groceries.html', label: '🛒 Shopping list' },
    ],
  },
  { href: 'groceries.html', label: '🛒' },
];

function currentPage(): string {
  const last = window.location.pathname.split('/').pop() ?? '';
  return last === '' ? 'index.html' : last;
}

/** Mount the site nav. Call once, from each page's entry module. */
export function mountNav(): void {
  const host = document.getElementById('sitenav');
  if (!host) return;

  const here = currentPage();
  host.className = 'sitenav';
  host.setAttribute('aria-label', 'Site');
  host.innerHTML = '';

  const bar = document.createElement('div');
  bar.className = 'sitenav-bar';

  const closeAll = (except?: HTMLElement): void => {
    bar.querySelectorAll<HTMLElement>('.navgroup.open').forEach((g) => {
      if (g !== except) {
        g.classList.remove('open');
        g.querySelector('button')?.setAttribute('aria-expanded', 'false');
      }
    });
  };

  for (const item of ITEMS) {
    if (item.href) {
      const a = document.createElement('a');
      a.className = 'navtop' + (item.href === here ? ' active' : '');
      a.href = item.href;
      a.textContent = item.label;
      if (item.href === here) a.setAttribute('aria-current', 'page');
      bar.appendChild(a);
      continue;
    }

    const group = document.createElement('div');
    group.className = 'navgroup';
    const owns = (item.children ?? []).some((c) => c.href === here);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'navtop navtop-btn' + (owns ? ' active' : '');
    btn.innerHTML = `${item.label} <span class="caret" aria-hidden="true">▾</span>`;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = group.classList.contains('open');
      closeAll();
      if (!isOpen) {
        group.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    group.appendChild(btn);

    const menu = document.createElement('div');
    menu.className = 'navmenu';
    for (const child of item.children ?? []) {
      const a = document.createElement('a');
      a.href = child.href;
      a.textContent = child.label;
      if (child.href === here) {
        a.className = 'active';
        a.setAttribute('aria-current', 'page');
      }
      menu.appendChild(a);
    }
    group.appendChild(menu);
    bar.appendChild(group);
  }

  host.appendChild(bar);

  document.addEventListener('click', () => closeAll());
  document.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Escape') closeAll();
  });
}

/** Register the service worker so the app keeps working with no signal.
 *  Mounted from here because every page already imports the nav — one place,
 *  no per-page wiring to forget. Failure is non-fatal and silent by design:
 *  the site works fine without it, it just won't survive going offline. */
function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  // Dev server serves from '/', the deployed site from '/austria-2026/'.
  const base = window.location.pathname.includes('/austria-2026/') ? '/austria-2026/' : '/';
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
      /* offline support unavailable — the app still works online */
    });
  });
}

registerServiceWorker();
