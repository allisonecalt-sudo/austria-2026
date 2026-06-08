import { TRIP } from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';

// --- Static binds (used by index.html landing card; costs.html hardcodes its
//     figures, so these no-op here but keep the homepage in sync). ---
const eurEls = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-eur"]');
eurEls.forEach((el) => (el.textContent = `€${TRIP.totalCostEur.toLocaleString('en-US')}`));

const nisEls = document.querySelectorAll<HTMLSpanElement>('[data-bind="total-nis"]');
nisEls.forEach((el) => (el.textContent = `₪${TRIP.totalCostNis.toLocaleString('en-US')}`));

const ceilEls = document.querySelectorAll<HTMLSpanElement>('[data-bind="ceiling"]');
ceilEls.forEach((el) => (el.textContent = `€${TRIP.ceilingEur.toLocaleString('en-US')}`));

// --- Live EUR→ILS + USD→ILS conversion (client-side, no backend) ---------
// Frankfurter.app is a free, no-key, CORS-enabled ECB rate feed. On load we
// fetch today's EUR→ILS and USD→ILS, show an honest "rates as of <date>" line,
// and re-render the hero ₪ total off the live EUR rate. If anything fails
// (offline, API down, malformed payload, timeout) we fall back to a clearly
// labelled "approx." hardcoded rate so the page NEVER shows NaN/blank/crash.

const FALLBACK_EUR_ILS = 3.97; // matches the static ₪ figures + footer
const FALLBACK_USD_ILS = 3.67;
const FETCH_TIMEOUT_MS = 6000;

function fmtRate(n: number): string {
  return n.toFixed(2);
}

function fmtNis(n: number): string {
  return `₪${Math.round(n).toLocaleString('en-US')}`;
}

// Pull a single ILS rate from a frankfurter.app /latest response. Returns null
// if the shape isn't what we expect (so the caller can fall back).
function readIlsRate(payload: unknown): number | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const rates = (payload as { rates?: unknown }).rates;
  if (typeof rates !== 'object' || rates === null) return null;
  const ils = (rates as { ILS?: unknown }).ILS;
  return typeof ils === 'number' && Number.isFinite(ils) && ils > 0 ? ils : null;
}

async function fetchRate(from: 'EUR' | 'USD'): Promise<number | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=ILS`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return readIlsRate(data);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

function renderFxLine(eurIls: number, usdIls: number, live: boolean, dateLabel: string): void {
  const el = document.querySelector<HTMLElement>('[data-fx-line]');
  if (!el) return;
  const tag = live ? '(live)' : '(approx. — rate feed unavailable)';
  el.textContent = `Rates as of ${dateLabel}: €1 = ₪${fmtRate(eurIls)} · $1 = ₪${fmtRate(
    usdIls,
  )} ${tag}`;
}

// Re-render the hero ₪ total off the live EUR rate. Static breakdown figures
// stay anchored at ₪3.97 (disclosed in the footer); this just keeps the
// headline honest to today's rate.
function renderLiveHeroTotal(eurIls: number): void {
  const heroNum = document.querySelector<HTMLElement>('#hero-total-num');
  if (!heroNum) return;
  const liveNis = TRIP.totalCostEur * eurIls;
  if (!Number.isFinite(liveNis) || liveNis <= 0) return;
  heroNum.textContent = fmtNis(liveNis);
}

async function initFx(): Promise<void> {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const [eur, usd] = await Promise.all([fetchRate('EUR'), fetchRate('USD')]);

  if (eur !== null && usd !== null) {
    renderFxLine(eur, usd, true, today);
    renderLiveHeroTotal(eur);
  } else {
    // Partial or total failure → fall back, clearly labelled. Use whichever
    // live rate we did get; fall back only the missing one.
    const eurIls = eur ?? FALLBACK_EUR_ILS;
    const usdIls = usd ?? FALLBACK_USD_ILS;
    const fullyLive = eur !== null && usd !== null;
    renderFxLine(eurIls, usdIls, fullyLive, today);
    if (eur !== null) renderLiveHeroTotal(eur);
  }
}

void initFx();

initNotesWidget();
initChatPlanPopup();
