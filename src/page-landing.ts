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
  const totalEur = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-eur"]');
  totalEur.forEach((el) => (el.textContent = TRIP.totalCostEur.toLocaleString('en-US')));
  const totalNis = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-nis"]');
  totalNis.forEach((el) => (el.textContent = TRIP.totalCostNis.toLocaleString('en-US')));
  const ceiling = document.querySelectorAll<HTMLSpanElement>('[data-bind="ceiling"]');
  ceiling.forEach((el) => (el.textContent = TRIP.ceilingEur.toLocaleString('en-US')));

  const peakSpot = document.querySelector<HTMLHeadingElement>('[data-bind="peak-spot"]');
  if (peakSpot) peakSpot.textContent = TRIP.peakMoment.spot;
  const peakDesc = document.querySelector<HTMLParagraphElement>('[data-bind="peak-desc"]');
  if (peakDesc) peakDesc.textContent = TRIP.peakMoment.description;

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

  const picks = document.querySelector<HTMLDivElement>('#pick-row');
  if (picks) {
    const baseLabel: Record<string, string> = {
      salzburg: 'Salzburg · Shabbat',
      hallstatt: 'Obertraun · Lakes',
      airport: 'Airport-side · Final night',
    };
    picks.innerHTML = TRIP.lodgings
      .map((l) => {
        return `
          <a class="pick-mini" href="${escapeHtml(l.pickUrl)}" target="_blank" rel="noreferrer noopener">
            <img loading="lazy" src="${escapeHtml(l.pickImg)}" alt="${escapeHtml(l.pickName)}" />
            <div class="pick-mini-body">
              <div class="pick-mini-eyebrow">${escapeHtml(baseLabel[l.baseKey] ?? l.baseKey)}</div>
              <div class="pick-mini-title">${escapeHtml(l.pickName)}</div>
              <div class="pick-mini-meta">${escapeHtml(l.pickReview.split('·')[0]?.trim() ?? '')} · <strong>${escapeHtml(l.pickPrice)}</strong></div>
            </div>
          </a>`;
      })
      .join('');
  }

  const skipList = document.querySelector<HTMLUListElement>('#skip-list');
  if (skipList) {
    skipList.innerHTML = TRIP.skipList
      .map((s) => `<li><strong>${escapeHtml(s.item)}</strong> — ${escapeHtml(s.reason)}</li>`)
      .join('');
  }
}

bindLanding();
initNotesWidget();
