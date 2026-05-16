// Sticky day-nav with IntersectionObserver scrollspy.
// Pattern source: bram.us "Smooth Scrolling Sticky ScrollSpy Navigation" (2020).
// Pure JS / no framework — observes each day card hero and highlights the
// matching nav pill via aria-current.

import type { Day } from './trip-data.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface DayNavRenderOptions {
  days: Day[];
  mountSelector: string; // e.g. "#day-nav-mount"
}

export function renderDayNav({ days, mountSelector }: DayNavRenderOptions): void {
  const mount = document.querySelector<HTMLElement>(mountSelector);
  if (!mount) {
    return;
  }
  const pillsHtml = days
    .map((d, i) => {
      // Short label: "Day N" with date underneath.
      const dayN = `Day ${i + 1}`;
      const shortDate = d.dateLabel
        .replace(/^(Friday|Saturday|Sunday|Monday|Tuesday|Wednesday|Thursday) /, '')
        .replace('July ', 'Jul ');
      return `<a class="day-pill" href="#${escapeHtml(d.id)}" data-day-id="${escapeHtml(d.id)}">
        <span class="pill-day">${escapeHtml(dayN)}</span>
        <span class="pill-date">${escapeHtml(shortDate)}</span>
      </a>`;
    })
    .join('');
  mount.innerHTML = `<nav class="day-nav" aria-label="Trip days"><div class="day-nav-inner">${pillsHtml}</div></nav>`;

  attachScrollspy(mount);
}

function attachScrollspy(navContainer: HTMLElement): void {
  const pills = Array.from(navContainer.querySelectorAll<HTMLAnchorElement>('.day-pill'));
  if (pills.length === 0) {
    return;
  }
  const idToPill = new Map<string, HTMLAnchorElement>();
  pills.forEach((p) => {
    const id = p.dataset['dayId'];
    if (id) idToPill.set(id, p);
  });

  let currentActive: HTMLAnchorElement | null = null;
  const setActive = (pill: HTMLAnchorElement | null): void => {
    if (currentActive === pill) return;
    if (currentActive) currentActive.removeAttribute('aria-current');
    if (pill) {
      pill.setAttribute('aria-current', 'true');
      // Scroll the pill into view inside the horizontally scrollable nav.
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    currentActive = pill;
  };

  const days = Array.from(document.querySelectorAll<HTMLElement>('.day[id]'));
  if (days.length === 0) {
    return;
  }

  // Use multiple thresholds so we get smooth handoff between days.
  const observer = new IntersectionObserver(
    (entries) => {
      // Find the entry with the largest intersection ratio that's intersecting.
      let best: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) {
          best = entry;
        }
      }
      if (best) {
        const id = (best.target as HTMLElement).id;
        const pill = idToPill.get(id) ?? null;
        if (pill) setActive(pill);
        return;
      }
      // If nothing visible, fall back to the day closest to viewport top.
      const viewportTop = window.scrollY + 200;
      let closest: HTMLElement | null = null;
      let closestDist = Infinity;
      for (const d of days) {
        const top = d.getBoundingClientRect().top + window.scrollY;
        const dist = Math.abs(top - viewportTop);
        if (dist < closestDist) {
          closest = d;
          closestDist = dist;
        }
      }
      if (closest) {
        const pill = idToPill.get(closest.id) ?? null;
        if (pill) setActive(pill);
      }
    },
    {
      // Root margin so a day is "active" when its hero is in the upper part of the viewport.
      rootMargin: '-30% 0px -55% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    },
  );

  days.forEach((d) => observer.observe(d));

  // Click handler for smooth scroll — let browser handle hashchange but ensure smooth.
  pills.forEach((p) => {
    p.addEventListener('click', (e) => {
      const href = p.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL hash without triggering jump.
      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });
}
