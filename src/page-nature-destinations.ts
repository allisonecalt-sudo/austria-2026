// Nature-destinations page bootstrap.
// Renders NATURE_DESTINATIONS from trip-data.ts into region-grouped cards.
// Allison (2026-05-16 21:22): "the gaol isnt to make an itnerary the goals
// is to give ootpitons like lake bled can be in ther lik top 15 places
// natrue to go". Card design rationale in NATURE_MENU_DESIGN.md.

import {
  NATURE_DESTINATIONS,
  type NatureDestination,
  type NatureRegion,
  type NatureType,
} from './trip-data.js';
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';

interface RegionSpec {
  key: NatureRegion;
  label: string;
  blurb: string;
}

const REGIONS: RegionSpec[] = [
  {
    key: 'salzkammergut',
    label: 'Salzkammergut lakes',
    blurb:
      'The lake-district anchor — everything here is within 65 min of Obertraun. Painted villages, mirror lakes, the cog railway, the glacier viewing platform.',
  },
  {
    key: 'berchtesgaden',
    label: 'Berchtesgaden / Bavaria',
    blurb:
      'Just over the German border, dense cluster within ~30 km. The Königssee peak day lives here; Hintersee and Almbachklamm are the swap-ins.',
  },
  {
    key: 'hohe-tauern',
    label: 'Hohe Tauern / Pongau',
    blurb:
      'Bigger drives, bigger drama. Werfen ice cave is locked. The other three are full-day commitments — most-rewarding if Allison-Avital want one big "drive day".',
  },
];

const TYPE_ICON: Record<NatureType, string> = {
  lake: '🏞️',
  gorge: '🏞️',
  waterfall: '💧',
  peak: '⛰️',
  cave: '🕳️',
  village: '🏘️',
  road: '🛣️',
  platform: '🪜',
  meadow: '🌾',
  valley: '🌲',
};

const TYPE_LABEL: Record<NatureType, string> = {
  lake: 'Lake',
  gorge: 'Gorge',
  waterfall: 'Waterfall',
  peak: 'Peak',
  cave: 'Cave',
  village: 'Village',
  road: 'Scenic road',
  platform: 'Viewpoint',
  meadow: 'Alpine meadow',
  valley: 'Valley',
};

function sunsetStars(n: 1 | 2 | 3): string {
  return '🌅'.repeat(n);
}

function walkBadge(walk: NatureDestination['walk']): string {
  return walk === 'walk' ? '🚶 walk' : '🥾 easy hike';
}

function bestTimeLabel(t: NatureDestination['bestTime']): string {
  switch (t) {
    case 'sunset':
      return 'sunset';
    case 'sunrise':
      return 'sunrise';
    case 'golden':
      return 'golden hour';
    case 'midday':
      return 'midday';
    case 'anytime':
      return 'anytime';
    default:
      return 'anytime';
  }
}

function avitalFitBadge(fit: NatureDestination['avitalFitNote']): string {
  if (!fit) return '';
  const colour =
    fit === 'good fit' || fit === 'easy walk-friendly'
      ? 'background:#e6f4ea; color:#1e7e34; border:1px solid #c3e6cb;'
      : fit === 'mixed — see notes'
        ? 'background:#fff3cd; color:#856404; border:1px solid #ffeeba;'
        : 'background:#f8d7da; color:#721c24; border:1px solid #f5c6cb;';
  const icon =
    fit === 'good fit' || fit === 'easy walk-friendly'
      ? '✅'
      : fit === 'mixed — see notes'
        ? '⚠️'
        : '⛔';
  return `<span class="chip" style="${colour}" title="Fit for Avital's adventure profile (walks long, no strenuous hikes, no rope climbs)">${icon} <strong>Avital:</strong> ${escape(fit)}</span>`;
}

function verifBadge(v: NatureDestination['verificationStatus']): string {
  if (!v || v === 'verified') return '';
  const label = v === 'unverified' ? 'Verify before going' : 'Partial — verify on arrival';
  const colour =
    v === 'unverified'
      ? 'background:#fff3cd; color:#856404; border:1px solid #ffeeba;'
      : 'background:#e2e3e5; color:#383d41; border:1px solid #d6d8db;';
  return `<span class="chip" style="${colour}" title="Data not fully verified — call ahead or check official site before going">⚠️ ${escape(label)}</span>`;
}

function destinationCard(d: NatureDestination, byId: Map<string, NatureDestination>): string {
  const lockedBadge = d.lockedDay
    ? `<div class="day-hero-badge peak" title="Already in the v1 itinerary">✓ Locked · ${escape(d.lockedDay)}</div>`
    : d.hiddenGem
      ? `<div class="day-hero-badge hidden-gem-badge" title="Hidden gem — off the beaten path">💎 Hidden gem</div>`
      : '';
  const typeBadge = `<div class="day-hero-badge" style="left:1rem; right:auto; background: rgba(20,26,30,0.72);">${TYPE_ICON[d.type]} ${escape(TYPE_LABEL[d.type])}</div>`;

  const pairsHtml = d.pairsWith
    .map((id) => {
      const target = byId.get(id);
      if (!target) return '';
      return `<a href="#${id}" class="chip" style="text-decoration:none;"><strong>↔</strong> ${escape(target.name)}</a>`;
    })
    .filter(Boolean)
    .join('');

  const pairsBlock = pairsHtml
    ? `<div class="day-meta" style="margin-top: 0.8rem;"><span class="chip" style="background:transparent; border:none; padding-left:0; padding-right:0; color: var(--ink-soft); font-weight:600; letter-spacing:0.04em;">Pairs with</span>${pairsHtml}</div>`
    : '';

  const caveat = d.caveat
    ? `<p style="font-size:0.88rem; color:var(--ink-soft); margin-top:0.7rem; padding:0.55rem 0.75rem; background:var(--cream); border-left:3px solid var(--gold-sun); border-radius:6px;"><strong>Heads-up:</strong> ${escape(d.caveat)}</p>`
    : '';

  // Walking-from-parking block (Avital trust rule: she wants to know if she
  // has to walk in from the car park before she sees the actual destination).
  const walkFromParking =
    d.walkFromParkingMin != null
      ? `<p style="font-size:0.9rem; color:var(--ink-soft); margin-bottom:0.7rem; line-height:1.5;"><strong style="color:var(--green-deep);">From parking:</strong> ${
          d.walkFromParkingMin === 0
            ? 'Drive-up — no walk in.'
            : `${d.walkFromParkingMin}-min walk in.`
        }${d.walkFromParkingNote ? ` ${escape(d.walkFromParkingNote)}` : ''}</p>`
      : '';

  // Accessibility + Avital-fit chips row.
  const accessibilityNote = d.accessibilityNote
    ? `<p style="font-size:0.88rem; color:var(--ink-soft); margin-bottom:0.7rem; line-height:1.5;"><strong style="color:var(--green-deep);">Access:</strong> ${escape(d.accessibilityNote)}</p>`
    : '';

  // Hours / season / price compact row.
  const hoursPrice: string[] = [];
  if (d.openingHours)
    hoursPrice.push(
      `<span class="chip" title="Opening hours">⏰ ${escape(d.openingHours)}</span>`,
    );
  if (d.seasonNote)
    hoursPrice.push(
      `<span class="chip" title="Season note">📅 ${escape(d.seasonNote)}</span>`,
    );
  if (d.priceEur != null)
    hoursPrice.push(
      `<span class="chip" title="Per-person cost">💶 ${
        d.priceEur === 0 ? 'Free' : `€${d.priceEur}pp`
      }${d.priceNote ? ` · ${escape(d.priceNote)}` : ''}</span>`,
    );

  const hoursPriceBlock = hoursPrice.length
    ? `<div class="day-meta" style="margin-top:0.7rem;">${hoursPrice.join('')}</div>`
    : '';

  // Fit + verification chips above the existing sunset/walk/best chips.
  const fitChips: string[] = [];
  const fitBadge = avitalFitBadge(d.avitalFitNote);
  if (fitBadge) fitChips.push(fitBadge);
  const vBadge = verifBadge(d.verificationStatus);
  if (vBadge) fitChips.push(vBadge);
  const fitChipsBlock = fitChips.length
    ? `<div class="day-meta" style="margin-bottom:0.7rem;">${fitChips.join('')}</div>`
    : '';

  // Source link — prefer explicit sourceUrl, fall back to links.official.
  const sourceHref = d.sourceUrl ?? d.links.official;
  const sourceLink = sourceHref
    ? `<a href="${escape(sourceHref)}" target="_blank" rel="noreferrer noopener">Source →</a>`
    : '';

  return `
    <article class="alt-card" id="${d.id}" style="display:block; padding:0;">
      <div style="position:relative;">
        <img class="alt-img" src="${escape(d.hero.src)}" alt="${escape(d.hero.alt)}" loading="lazy" />
        ${typeBadge}
        ${lockedBadge}
      </div>
      <div class="alt-body" style="padding:1.2rem 1.3rem 1.4rem;">
        <div class="eyebrow" style="margin-bottom:0.45rem;">
          ${escape(d.country === 'AT' ? 'Austria' : 'Germany')} ·
          ${escape(TYPE_LABEL[d.type])}
        </div>
        <h3 class="alt-name" style="font-size:1.3rem; margin-bottom:0.55rem;">${escape(d.name)}</h3>

        <div class="day-meta" style="margin-bottom:0.8rem;">
          <span class="chip" title="Sunset rating 1-3">${sunsetStars(d.sunset)}</span>
          <span class="chip">${escape(walkBadge(d.walk))}</span>
          <span class="chip"><strong>Best:</strong> ${escape(bestTimeLabel(d.bestTime))}</span>
        </div>

        ${fitChipsBlock}

        <p class="alt-note" style="margin-bottom:0.7rem;">${escape(d.feature)}</p>

        <p style="font-size:0.9rem; color:var(--ink-soft); margin-bottom:0.8rem; line-height:1.5;">
          <strong style="color:var(--green-deep);">Walk:</strong> ${escape(d.walkNote)}
        </p>

        ${walkFromParking}
        ${accessibilityNote}

        <div class="day-meta">
          <a href="${escape(d.links.mapsFromSalzburg)}" target="_blank" rel="noreferrer noopener" class="chip">
            🚗 <strong>Salzburg</strong> ${d.fromSalzburgMin}min
          </a>
          <a href="${escape(d.links.mapsFromHallstatt)}" target="_blank" rel="noreferrer noopener" class="chip">
            🚗 <strong>Hallstatt</strong> ${d.fromHallstattMin}min
          </a>
        </div>

        ${hoursPriceBlock}

        ${pairsBlock}

        ${caveat}

        <div style="margin-top:0.9rem; display:flex; gap:1rem; flex-wrap:wrap; font-size:0.92rem;">
          ${sourceLink}
          ${
            d.links.official && d.links.official !== d.sourceUrl
              ? `<a href="${escape(d.links.official)}" target="_blank" rel="noreferrer noopener">Official site →</a>`
              : ''
          }
          <a href="${escape(d.links.wikipedia)}" target="_blank" rel="noreferrer noopener">Wikipedia →</a>
        </div>
      </div>
    </article>
  `;
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function regionSection(spec: RegionSpec, byId: Map<string, NatureDestination>): string {
  const dests = NATURE_DESTINATIONS.filter((d) => d.region === spec.key);
  if (dests.length === 0) return '';

  const cards = dests.map((d) => destinationCard(d, byId)).join('');
  return `
    <section class="section" id="region-${spec.key}">
      <div class="eyebrow">Region · ${dests.length} ${dests.length === 1 ? 'spot' : 'spots'}</div>
      <h2>${escape(spec.label)}</h2>
      <p class="lead-block">${escape(spec.blurb)}</p>
      <div class="alts-grid">
        ${cards}
      </div>
    </section>
  `;
}

// Hidden-gems section — surfaces the 2026-05-16 additions as a separate
// curated block above the regional groupings, so Allison + Avital see the
// off-the-beaten-path picks first. Cards still also appear in their region
// sections below (so nothing is hidden from the regional view).
function hiddenGemsSection(byId: Map<string, NatureDestination>): string {
  const gems = NATURE_DESTINATIONS.filter((d) => d.hiddenGem);
  if (gems.length === 0) return '';

  const cards = gems.map((d) => destinationCard(d, byId)).join('');
  return `
    <section class="section" id="region-hidden-gems">
      <div class="eyebrow">Hidden gems · ${gems.length} off-the-beaten-path picks</div>
      <h2>💎 Hidden gems we found</h2>
      <p class="lead-block">
        Beyond the headliners. Sourced from German-language travel blogs, photography guides
        (Sunset Obsession, Moon Honey Travel), and SalzburgerLand tourism's
        lesser-known-viewpoints lists. Each is drive-accessible, walks-only,
        Avital-mobility friendly, and verified stunning in real photos. Same cards
        also live in their region sections below.
      </p>
      <div class="alts-grid">
        ${cards}
      </div>
    </section>
  `;
}

function renderPage(): void {
  const root = document.getElementById('nature-root');
  if (!root) return;

  const byId: Map<string, NatureDestination> = new Map(
    NATURE_DESTINATIONS.map((d) => [d.id, d] as [string, NatureDestination]),
  );
  const html = hiddenGemsSection(byId) + REGIONS.map((r) => regionSection(r, byId)).join('');
  root.innerHTML = html;
}

renderPage();
initNotesWidget();
initChatPlanPopup();
