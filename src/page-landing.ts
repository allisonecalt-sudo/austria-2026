import { TRIP } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 2026-06-08 landing trim: the "shape of it" mini-map moment was cut from
// index.html (it duplicated the 4-base strip; the live map is one tap away on
// the Map page). All the Leaflet preview-map code that lived here was removed
// with it — along with the Leaflet CDN includes in index.html.

function bindLanding(): void {
  // Cost bindings — used in the CTA strip
  const totalEur = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-eur"]');
  totalEur.forEach((el) => (el.textContent = TRIP.totalCostEur.toLocaleString('en-US')));
  const totalNis = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-nis"]');
  totalNis.forEach((el) => (el.textContent = TRIP.totalCostNis.toLocaleString('en-US')));
  const ceiling = document.querySelectorAll<HTMLSpanElement>('[data-bind="ceiling"]');
  ceiling.forEach((el) => (el.textContent = TRIP.ceilingEur.toLocaleString('en-US')));

  // Day strip — moment 5. Each card now shows the BASE pin color in a strip
  // along the top edge so Avital can orient geographically while swiping
  // (Allison 2026-05-17 — IA rethink: "show base pin color per day").
  const strip = document.querySelector<HTMLDivElement>('#day-strip');
  if (strip) {
    // Updated 2026-05-19 for v4 4-base restructure.
    const baseLabel: Record<string, string> = {
      salzburg: 'Salzburg',
      'zell-am-see': 'Zell am See',
      gosau: 'Gosau',
      'salzburg-airport': 'Airport',
      // deprecated 2026-05-19, fallback only
      hallstatt: 'Mountain anchor',
      schafbergspitze: 'Summit',
      'lodge-am-krippenstein': 'Summit',
      airport: 'Airport',
    };
    strip.innerHTML = TRIP.days
      .map((d, i) => {
        const isPeak = !!d.tarabridgeMoment;
        const baseKey = d.sleepWhere;
        return `
          <a class="day-strip-card day-strip-card--${escapeHtml(baseKey)}" href="itinerary.html#${escapeHtml(d.id)}">
            <span class="day-strip-basebar" aria-hidden="true"></span>
            <img class="day-strip-photo" loading="lazy" decoding="async" src="${escapeHtml(d.hero.src)}" alt="${escapeHtml(d.hero.alt)}" />
            <div class="day-strip-body">
              <div class="day-strip-eyebrow">
                Day ${i + 1} · ${escapeHtml(d.dateLabel)}
                <span class="day-strip-basetag day-strip-basetag--${escapeHtml(baseKey)}" title="Sleeping at ${escapeHtml(baseLabel[baseKey] ?? baseKey)}">●&nbsp;${escapeHtml(baseLabel[baseKey] ?? baseKey)}</span>
              </div>
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
initChatPlanPopup();
