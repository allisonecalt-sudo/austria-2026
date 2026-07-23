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
// So: TWO levels, three things.
//   🏔 Austria  →  the hub (home)
//   Trip ▾      →  everything about where you go
//   Kosher ▾    →  everything about what you can eat
//   🛒 Shopping →  flat, no menu, because it is one screen
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
  { href: 'hub.html', label: '🏔 Austria' },
  {
    label: 'Trip',
    children: [
      { href: 'plan.html', label: '🗺 The Plan — all the options' },
      { href: 'favorites.html', label: '❤️ Our picks — what you chose' },
      { href: 'bases.html', label: '🛏 From your bed' },
      { href: 'rain.html', label: '☂ Rainy day' },
      { href: 'rank.html', label: '⭐ Rank it' },
      { href: 'claude.html', label: "💙 Claude's pick" },
      { href: 'index.html', label: '📖 The brochure' },
      { href: 'info.html', label: '🔑 Trip info — bookings, car, flights' },
    ],
  },
  {
    label: 'Kosher',
    children: [
      { href: 'certified.html', label: '✅ Certified — the easy path' },
      { href: 'kosher.html', label: '✡️ Field guide — reading a label' },
      { href: 'shop.html', label: '🔍 By ingredient — photo grid' },
    ],
  },
  { href: 'groceries.html', label: '🛒 Shopping' },
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
