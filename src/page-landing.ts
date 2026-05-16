import { TRIP } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bindLanding(): void {
  // Cost bindings — used in the CTA strip
  const totalEur = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-eur"]');
  totalEur.forEach((el) => (el.textContent = TRIP.totalCostEur.toLocaleString('en-US')));
  const totalNis = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-nis"]');
  totalNis.forEach((el) => (el.textContent = TRIP.totalCostNis.toLocaleString('en-US')));
  const ceiling = document.querySelectorAll<HTMLSpanElement>('[data-bind="ceiling"]');
  ceiling.forEach((el) => (el.textContent = TRIP.ceilingEur.toLocaleString('en-US')));

  // Day strip — moment 5
  const strip = document.querySelector<HTMLDivElement>('#day-strip');
  if (strip) {
    strip.innerHTML = TRIP.days
      .map((d, i) => {
        const isPeak = !!d.tarabridgeMoment;
        return `
          <a class="day-strip-card" href="itinerary.html#${escapeHtml(d.id)}">
            <img class="day-strip-photo" loading="lazy" src="${escapeHtml(d.hero.src)}" alt="${escapeHtml(d.hero.alt)}" />
            <div class="day-strip-body">
              <div class="day-strip-eyebrow">Day ${i + 1} · ${escapeHtml(d.dateLabel)}</div>
              <div class="day-strip-title">${escapeHtml(d.headline)}</div>
              <div class="day-strip-foot">
                <span>☀ ${escapeHtml(d.sunset.time)}</span>
                ${isPeak ? '<span class="peak">⭐ Peak</span>' : '<span></span>'}
              </div>
            </div>
          </a>`;
      })
      .join('');
  }

  // Nav style switch — when hero is on-screen, nav is translucent over
  // the photo; off-screen, nav becomes solid on the cream background.
  const nav = document.querySelector<HTMLElement>('#top-nav');
  const hero = document.querySelector<HTMLElement>('#m-hero');
  if (nav && hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) {
            nav.classList.toggle('nav--overlay', entry.isIntersecting);
            nav.classList.toggle('nav--solid', !entry.isIntersecting);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(hero);
  }
}

bindLanding();
initNotesWidget();
