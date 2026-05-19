// search-index.ts — builds a flat, searchable index across every "thing"
// the trip site cares about so the global search overlay (page-search.ts)
// + the recommendations page (page-recommendations.ts) can both consume one
// canonical list. NEW file, owned by Search & Discovery agent 2026-05-17.
//
// Allison 2026-05-17 06:13: "ways to get this site more searchable? And
// interactive like being able to see recomendation easily location easily."
//
// Indexed types:
//   - 'lodging'  — every TRIP.lodgings pick + alt, every BASE_CONFIGS pick +
//                  alt across all 4 base configs, every SUNSET_STAYS entry
//   - 'place'    — every NATURE_DESTINATIONS entry (21+ places)
//   - 'activity' — water-activity hand-curated set (matches
//                  page-water-activities.ts shape but kept inline so this
//                  module doesn't import the page-renderer)
//   - 'sunset'   — every SUNSET_STAYS + the SUNSET-spotted nature picks
//                  (NATURE_DESTINATIONS where sunset === 3)
//   - 'jewish'   — STANDALONE_POIS where category === 'jewish' + Chabad
//   - 'shabbat'  — anchor index entries for the Shabbat page sections
//
// Fail-loud rule: a result without a real link to a real card on a real page
// is NOT indexed. Every entry has `url` pointing to an absolute path + anchor
// that exists in the deployed site.

import {
  NATURE_DESTINATIONS,
  NATURE_COORDS,
  LODGING_COORDS,
  STANDALONE_POIS,
  SUNSET_STAYS,
  TRIP,
  BASE_CONFIGS,
} from './trip-data.js';
import type { NatureDestination, MapPOI, LatLng, Lodging } from './trip-data.js';

// =====================================================================
// Shared item shape — every search result + every recommendation uses it.
// =====================================================================

export type SearchType =
  | 'lodging'
  | 'place'
  | 'activity'
  | 'sunset'
  | 'jewish'
  | 'shabbat';

export interface SearchItem {
  id: string;
  type: SearchType;
  name: string;
  /** 1-line description used in result rows + recommendation cards. */
  description: string;
  /**
   * Where the result opens to. Absolute path so the same item can be
   * opened from any page (e.g. "stay.html#lodging-haus-edelweiss").
   */
  url: string;
  /** Optional photo for richer result rows + recommendation cards. */
  img?: string;
  /** Base / region / city — surfaced as a chip under the name. */
  location?: string;
  /** Mountain / lake / sunset / etc — for grouping + filter chips. */
  category?: string;
  /** Free-form tags for fuzzy match (vibe, type, region, etc). */
  tags: string[];
  /** Lat/lng if map-pin-able. Drives the "📍 See on map" affordance. */
  coords?: LatLng;
  /** Score weight (0-100) for default ordering inside a type group. */
  weight: number;
}

// =====================================================================
// LODGING — TRIP.lodgings primary picks + alts + BASE_CONFIGS lodging
//           across all 4 base configs + SUNSET_STAYS.
// =====================================================================

function lodgingId(name: string): string {
  return (
    'lodging-' +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
  );
}

function lodgingUrl(name: string): string {
  // Stay-page anchors follow the pattern stay.html#base-<key> for base
  // sections + stay.html#<lodgingId> for per-card direct anchors when the
  // renderer wires them. We use the per-card anchor.
  return `stay.html#${lodgingId(name)}`;
}

function pushLodgingPick(
  out: SearchItem[],
  seen: Set<string>,
  name: string,
  opts: {
    url: string;
    img?: string;
    location: string;
    description: string;
    tags: string[];
    weight: number;
  },
): void {
  const id = lodgingId(name);
  if (seen.has(id)) return;
  seen.add(id);
  out.push({
    id,
    type: 'lodging',
    name,
    description: opts.description,
    url: opts.url,
    img: opts.img,
    location: opts.location,
    category: 'Lodging',
    tags: opts.tags,
    coords: LODGING_COORDS[name],
    weight: opts.weight,
  });
}

// Sold-out detector — covers cases where the `availability` boolean wasn't
// updated but the human-readable price/note text already flags "SOLD OUT" or
// "delisted". Allison 2026-05-17 04:25: "if booking isn't avai ok then don't
// show it." Belt-and-suspenders so a mis-set flag in trip-data.ts can't leak
// a sold-out anchor into the editorial top-picks (the picks-sync section is
// owned by sync-picks.ts and out of scope).
function isSoldOutText(...fields: Array<string | undefined>): boolean {
  for (const f of fields) {
    if (!f) continue;
    const s = f.toLowerCase();
    if (s.includes('sold out')) return true;
    if (s.includes('sold-out')) return true;
    if (s.includes('delisted')) return true;
    if (s.includes('listing appears delisted')) return true;
    if (s.includes('no availability') && s.includes('verified')) return true;
  }
  return false;
}

// Side-channel log: when a sold-out lodging gets scrubbed from the editorial
// pool, record its name so page-recommendations.ts can render a visible
// "auto-substituted from <prev pick>" badge on the next-best card that took
// its slot. Keyed by base label so the substitution attaches to the right
// section. Allison 2026-05-17: visible audit trail, no silent re-ranking.
export interface ScrubbedLodging {
  name: string;
  baseLabel: string;
  reason: string; // human-readable why-scrubbed string
  weight: number; // the slot weight it would have occupied
}
const SCRUBBED_LODGINGS: ScrubbedLodging[] = [];
export function getScrubbedLodgings(): ScrubbedLodging[] {
  // Ensure index is built so the log is populated before callers read it.
  buildIndex();
  return SCRUBBED_LODGINGS.slice();
}

function indexLodgings(): SearchItem[] {
  const out: SearchItem[] = [];
  const seen = new Set<string>();

  // Allison 2026-05-17 09:00: "never show sold out". Treat sold-out as "not
  // in the dataset" for search + recommendations. Listings stay in
  // trip-data.ts for history; renderers just skip them.

  // Pass 1 — TRIP.lodgings primary picks + alts.
  // v4 RESTRUCTURE 2026-05-19: skip archived 'hallstatt' + legacy 'airport'
  // baseKey blocks so search results show only the active 4-base set.
  const ACTIVE_LODGING_KEYS: Lodging['baseKey'][] = [
    'salzburg',
    'zell-am-see',
    'gosau',
    'salzburg-airport',
  ];
  for (const lodging of TRIP.lodgings) {
    if (!ACTIVE_LODGING_KEYS.includes(lodging.baseKey)) continue;
    const baseLabel =
      lodging.baseKey === 'salzburg'
        ? 'Salzburg · Shabbat base'
        : lodging.baseKey === 'zell-am-see'
          ? 'Zell am See · alpine-lake anchor'
          : lodging.baseKey === 'gosau'
            ? 'Gosau · Salzkammergut lakes anchor'
            : 'Airport area';
    const baseTag = lodging.baseKey;
    const pickSoldOut =
      lodging.pickAvailability === 'sold-out' ||
      isSoldOutText(lodging.pickPrice, lodging.pickAvailabilityNote);
    if (!pickSoldOut) {
      pushLodgingPick(out, seen, lodging.pickName, {
        url: lodgingUrl(lodging.pickName),
        img: lodging.pickImg,
        location: baseLabel,
        description: oneLine(lodging.pickWhy),
        tags: [
          baseTag,
          lodging.pickBudgetTier ?? '',
          lodging.pickVibeTag ?? '',
          lodging.pickKitchen ?? '',
          lodging.pickPlatform ?? '',
          'apartment',
          'kitchen',
        ].filter(Boolean) as string[],
        weight: 95, // primary picks rank highest
      });
    } else {
      SCRUBBED_LODGINGS.push({
        name: lodging.pickName,
        baseLabel,
        reason: 'sold-out for trip dates (Booking live)',
        weight: 95,
      });
    }
    for (const alt of lodging.alts) {
      const altSoldOut =
        alt.availability === 'sold-out' ||
        isSoldOutText(alt.pricePerNight, alt.availabilityNote, alt.note);
      if (altSoldOut) {
        SCRUBBED_LODGINGS.push({
          name: alt.name,
          baseLabel,
          reason: 'sold-out for trip dates (Booking live)',
          weight: 70,
        });
        continue;
      }
      pushLodgingPick(out, seen, alt.name, {
        url: lodgingUrl(alt.name),
        img: alt.img,
        location: baseLabel,
        description: oneLine(alt.note),
        tags: [
          baseTag,
          alt.budgetTier ?? '',
          alt.vibeTag ?? '',
          alt.kitchen ?? '',
          alt.platform ?? '',
        ].filter(Boolean) as string[],
        weight: 70,
      });
    }
  }

  // Pass 2 — BASE_CONFIGS lodging picks (Berchtesgaden + Wolfgangsee).
  for (const cfg of BASE_CONFIGS) {
    if (cfg.id === 'obertraun') continue; // dedup with TRIP.lodgings hallstatt
    const baseLabel = `${cfg.label} · ${cfg.id === 'berchtesgaden' ? 'Bavaria' : 'Salzkammergut'}`;
    for (const pick of cfg.lodging) {
      const cfgSoldOut =
        pick.availability === 'sold-out' ||
        isSoldOutText(pick.pricePerNight, pick.availabilityNote, pick.note);
      if (cfgSoldOut) {
        SCRUBBED_LODGINGS.push({
          name: pick.name,
          baseLabel,
          reason: 'sold-out for trip dates (Booking live)',
          weight: 65,
        });
        continue;
      }
      pushLodgingPick(out, seen, pick.name, {
        url: `bases.html#cfg-${cfg.id}`,
        // baseKey reference retained via location label so dedup is by name.
        img: pick.img,
        location: baseLabel,
        description: oneLine(pick.note),
        tags: [
          cfg.id,
          pick.budgetTier ?? '',
          pick.vibeTag ?? '',
          'alt-base',
          'apartment',
        ].filter(Boolean) as string[],
        weight: 65,
      });
    }
  }

  // Pass 3 — SUNSET_STAYS (summit hotels — also indexed as sunset items below).
  for (const stay of SUNSET_STAYS) {
    const stayLocation = `${formatRegion(stay.region)} · ${stay.elevationM ?? '?'} m summit`;
    // SUNSET_STAYS has no `availability` field — use text scan + status only.
    // SunsetStayStatus has no 'sold-out' literal — text scan only.
    const stayUnbookable = isSoldOutText(stay.pricePerNightEur, stay.pricePerNightNote);
    if (stayUnbookable) {
      SCRUBBED_LODGINGS.push({
        name: stay.name,
        baseLabel: stayLocation,
        reason: 'sold-out for trip dates (Booking live)',
        weight: 90,
      });
      continue;
    }
    pushLodgingPick(out, seen, stay.name, {
      url: `stay.html#sunset-${stay.id}`,
      img: stay.img,
      location: stayLocation,
      description: oneLine(stay.pitch),
      tags: [
        stay.region,
        'summit',
        'sunset-stay',
        'splurge',
        stay.status,
      ],
      weight: 90, // summit nights are heavily marketed picks
    });
  }

  return out;
}

// =====================================================================
// NATURE DESTINATIONS — 21+ places with photos + coords.
// =====================================================================

function indexNature(): SearchItem[] {
  return NATURE_DESTINATIONS.map((d: NatureDestination): SearchItem => {
    const tags = [
      d.region,
      d.type,
      d.walk,
      d.country === 'AT' ? 'austria' : d.country === 'DE' ? 'germany' : 'slovenia',
      d.bestTime,
      d.hiddenGem ? 'hidden-gem' : '',
      d.sunset === 3 ? 'sunset-top' : d.sunset === 2 ? 'sunset-good' : '',
      d.lockedDay ? 'locked' : '',
    ].filter(Boolean) as string[];
    return {
      id: `place-${d.id}`,
      type: 'place',
      name: d.name,
      description: oneLine(d.feature),
      url: `nature-destinations.html#${encodeURIComponent(d.id)}`,
      img: d.hero.src,
      location: formatRegion(d.region),
      category: capitalize(d.type),
      tags,
      coords: NATURE_COORDS[d.id],
      // Weight: sunset 3 + locked = top, easy-walk + hidden-gem = mid+
      weight:
        50 +
        (d.sunset === 3 ? 25 : d.sunset === 2 ? 10 : 0) +
        (d.lockedDay ? 10 : 0) +
        (d.walk === 'walk' ? 5 : 0) +
        (d.hiddenGem ? 5 : 0),
    };
  });
}

// =====================================================================
// WATER ACTIVITIES — hand-curated set matching page-water-activities.ts
// (kept inline rather than importing the page module to avoid a side-effect
// import — page-water-activities.ts calls initNotesWidget() on load).
// =====================================================================

interface IndexedActivity {
  id: string;
  name: string;
  where: string;
  region: string;
  blurb: string;
  url: string;
  img?: string;
  tags: string[];
  weight: number;
  coords?: LatLng;
}

const WATER_ACTIVITIES: IndexedActivity[] = [
  {
    id: 'saalach-lofer-classic',
    name: 'Saalach River rafting — Lofer classic',
    where: 'Saalach River, Lofer',
    region: 'salzburg-area',
    blurb: 'Tara-tier whitewater rafting on the Austrian-Bavarian border. Family-friendly Class II-III, ~€55-65pp.',
    url: 'water-activities.html#saalach-lofer-classic',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Saalach_River_Lofer.jpg/1280px-Saalach_River_Lofer.jpg',
    tags: ['rafting', 'whitewater', 'family', 'salzburg-area', 'lofer'],
    weight: 92,
  },
  {
    id: 'konigssee-electric-boat',
    name: 'Königssee silent electric boat',
    where: 'Königssee, Schönau am Königssee',
    region: 'berchtesgaden',
    blurb: 'The trip\'s peak moment — silent boat to St. Bartholomä, returning at sunset.',
    url: 'water-activities.html#konigssee-electric-boat',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
    tags: ['boat', 'electric-boat', 'berchtesgaden', 'sunset', 'locked', 'peak'],
    weight: 100,
    coords: { lat: 47.5536, lng: 12.9847 },
  },
  {
    id: 'hallstattersee-kayak-sup',
    name: 'Hallstättersee — kayak + SUP rental',
    where: 'Hallstättersee, Obertraun + Hallstatt',
    region: 'salzkammergut',
    blurb: 'Glassy mountain-lake paddling. ~€18/hr SUP, €25/hr double kayak. Walk-up rentals at the lakefront.',
    url: 'water-activities.html#hallstattersee-kayak-sup',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
    tags: ['kayak', 'sup', 'paddleboard', 'salzkammergut', 'hallstatt', 'lake'],
    weight: 88,
    coords: { lat: 47.5622, lng: 13.6493 },
  },
  {
    id: 'wolfgangsee-electric-boat',
    name: 'Wolfgangsee electric boat + lake cruise',
    where: 'Wolfgangsee, St. Wolfgang',
    region: 'salzkammergut',
    blurb: 'Hop-on hop-off electric ferry between St. Wolfgang, St. Gilgen, Strobl. ~€16 day pass.',
    url: 'water-activities.html#wolfgangsee-electric-boat',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
    tags: ['boat', 'electric-boat', 'salzkammergut', 'wolfgangsee', 'family'],
    weight: 80,
    coords: { lat: 47.7397, lng: 13.4475 },
  },
  {
    id: 'attersee-sailing',
    name: 'Attersee sailing + electric boat',
    where: 'Attersee, Nußdorf am Attersee',
    region: 'salzkammergut',
    blurb: 'Largest entirely-Austrian lake. Quietest sails of the trip. Boat rentals ~€30/hr at Nußdorf.',
    url: 'water-activities.html#attersee-sailing',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Attersee_am_Attersee%2C_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg/1280px-Attersee_am_Attersee%2C_zicht_op_der_Attersee_foto3_2017-08-11_17.16.jpg',
    tags: ['sailing', 'boat', 'salzkammergut', 'attersee', 'lake', 'quiet'],
    weight: 75,
    coords: { lat: 47.8467, lng: 13.5197 },
  },
  {
    id: 'hintersee-paddle',
    name: 'Hintersee electric boat + paddle boats',
    where: 'Hintersee, Ramsau bei Berchtesgaden',
    region: 'berchtesgaden',
    blurb: 'Mirror lake paddle boats + small electric boats. ~€10/hr. Painters\' lake — same view as Caspar David Friedrich studied.',
    url: 'water-activities.html#hintersee-paddle',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
    tags: ['paddle-boat', 'electric-boat', 'berchtesgaden', 'hintersee', 'mirror', 'quiet'],
    weight: 78,
    coords: { lat: 47.6, lng: 12.85 },
  },
];

function indexActivities(): SearchItem[] {
  return WATER_ACTIVITIES.map((a): SearchItem => ({
    id: `activity-${a.id}`,
    type: 'activity',
    name: a.name,
    description: a.blurb,
    url: a.url,
    img: a.img,
    location: a.where,
    category: 'Water activity',
    tags: a.tags,
    coords: a.coords,
    weight: a.weight,
  }));
}

// =====================================================================
// SUNSETS — top-sunset NATURE_DESTINATIONS (sunset === 3) + SUNSET_STAYS.
// =====================================================================

function indexSunsets(): SearchItem[] {
  const out: SearchItem[] = [];

  // Top-sunset nature picks
  for (const d of NATURE_DESTINATIONS) {
    if (d.sunset < 3) continue;
    out.push({
      id: `sunset-${d.id}`,
      type: 'sunset',
      name: `${d.name} — sunset`,
      description: `${oneLine(d.feature)} (sunset spot ⭐⭐⭐)`,
      url: `top-sunsets.html#${encodeURIComponent(d.id)}`,
      img: d.hero.src,
      location: formatRegion(d.region),
      category: 'Sunset spot',
      tags: [d.region, 'sunset', 'sunset-top', d.type],
      coords: NATURE_COORDS[d.id],
      weight: 85 + (d.lockedDay ? 10 : 0),
    });
  }

  // Sunset overnight stays (Schafbergspitze + Krippenstein). Skip any that
  // are sold-out — same fail-loud rule the lodging pass applies.
  for (const stay of SUNSET_STAYS) {
    if (isSoldOutText(stay.pricePerNightEur, stay.pricePerNightNote)) {
      continue;
    }
    out.push({
      id: `sunset-stay-${stay.id}`,
      type: 'sunset',
      name: `Sleep at sunset — ${stay.name}`,
      description: oneLine(stay.pitch),
      url: `stay.html#sunset-${stay.id}`,
      img: stay.img,
      location: `${formatRegion(stay.region)} · ${stay.elevationM ?? '?'} m`,
      category: 'Sunset stay',
      tags: [stay.region, 'sunset', 'sunset-stay', 'summit', 'splurge'],
      weight: 95,
    });
  }

  return out;
}

// =====================================================================
// JEWISH SIGHTS — STANDALONE_POIS where category === 'jewish' + Chabad.
// =====================================================================

function indexJewish(): SearchItem[] {
  return STANDALONE_POIS.filter(
    (p: MapPOI) => p.category === 'jewish' || p.category === 'chabad',
  ).map((p: MapPOI): SearchItem => ({
    id: `jewish-${p.id}`,
    type: 'jewish',
    name: p.name,
    description: p.description,
    url: p.link ?? `jewish-sights.html#${p.id}`,
    location: p.category === 'chabad' ? 'Salzburg · Shabbat home' : 'Salzburg',
    category: p.category === 'chabad' ? 'Chabad' : 'Jewish heritage',
    tags: [
      'jewish',
      'heritage',
      p.category,
      p.id === 'mauthausen' ? 'memorial' : '',
    ].filter(Boolean) as string[],
    coords: { lat: p.lat, lng: p.lng },
    weight: p.category === 'chabad' ? 95 : 65,
  }));
}

// =====================================================================
// SHABBAT ANCHORS — pointer index into the shabbat.html sections so users
// searching "candle-lighting", "kosher", "eruv", "Chabad" land on the
// right block.
// =====================================================================

const SHABBAT_ANCHORS: Array<{ id: string; name: string; blurb: string; tags: string[] }> = [
  {
    id: 'shabbat-times',
    name: 'Shabbat times — Salzburg Jul 24-25',
    blurb: 'Candle-lighting 20:35 · Havdalah 21:49 · Plag 18:43 · Hebcal-verified.',
    tags: ['shabbat', 'candle-lighting', 'havdalah', 'hebcal', 'times'],
  },
  {
    id: 'chabad-salzburg',
    name: 'Chabad Salzburg — the primary play',
    blurb: 'Rabbi Menachem + Chani · Linzergasse 76 · meals + davening · 3-min walk from apartment.',
    tags: ['shabbat', 'chabad', 'meals', 'minyan', 'kosher'],
  },
  {
    id: 'ikg',
    name: 'IKG Salzburg synagogue — backup option',
    blurb: 'Official community shul, Lasserstraße 8. Friday-night minyan option.',
    tags: ['shabbat', 'ikg', 'synagogue', 'shul', 'minyan'],
  },
  {
    id: 'kosher',
    name: 'Kosher food in Salzburg — fail-loud truth',
    blurb: 'No kosher restaurants. Self-catering only. Spar + Billa for sealed dairy + produce.',
    tags: ['kosher', 'shabbat', 'food', 'spar', 'billa', 'kashrut'],
  },
  {
    id: 'eruv',
    name: 'No eruv, no mikveh — plan accordingly',
    blurb: 'Salzburg has no eruv. Bring everything Friday afternoon.',
    tags: ['eruv', 'mikveh', 'shabbat', 'halacha'],
  },
  {
    id: 'shabbat-walks',
    name: 'Saturday afternoon — Shabbat-legal walking plan',
    blurb: 'Mönchsberg climb, Mirabell gardens, Salzach riverbank — no money, no lift.',
    tags: ['shabbat', 'walk', 'monchsberg', 'mirabell', 'walking'],
  },
];

function indexShabbat(): SearchItem[] {
  return SHABBAT_ANCHORS.map((s): SearchItem => ({
    id: `shabbat-${s.id}`,
    type: 'shabbat',
    name: s.name,
    description: s.blurb,
    url: `shabbat.html#${s.id}`,
    location: 'Salzburg',
    category: 'Shabbat',
    tags: s.tags,
    weight: 75,
  }));
}

// =====================================================================
// PUBLIC API — single flat list, plus utility helpers.
// =====================================================================

let CACHED_INDEX: SearchItem[] | null = null;

export function buildIndex(): SearchItem[] {
  if (CACHED_INDEX) return CACHED_INDEX;
  CACHED_INDEX = [
    ...indexLodgings(),
    ...indexNature(),
    ...indexActivities(),
    ...indexSunsets(),
    ...indexJewish(),
    ...indexShabbat(),
  ];
  return CACHED_INDEX;
}

/**
 * Fuzzy match — case-insensitive substring on name + tags + description +
 * location. Returns scored matches sorted by (score desc, weight desc).
 * Empty query returns the full index sorted by weight.
 */
export interface SearchHit {
  item: SearchItem;
  score: number;
}

export function search(query: string, limit = 60): SearchHit[] {
  const index = buildIndex();
  const q = query.trim().toLowerCase();
  if (!q) {
    return index
      .map((item) => ({ item, score: item.weight }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  const terms = q.split(/\s+/).filter(Boolean);
  const hits: SearchHit[] = [];
  for (const item of index) {
    const hay = [
      item.name,
      item.description,
      item.location ?? '',
      item.category ?? '',
      item.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase();
    let score = 0;
    let matchedAll = true;
    for (const t of terms) {
      if (!hay.includes(t)) {
        matchedAll = false;
        break;
      }
      // Name hits weigh more than tag hits.
      if (item.name.toLowerCase().includes(t)) score += 40;
      else if ((item.location ?? '').toLowerCase().includes(t)) score += 20;
      else score += 10;
    }
    if (!matchedAll) continue;
    score += item.weight * 0.4; // pull in default weight
    hits.push({ item, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

/** Group hits by type — for the section-grouped result view. */
export function groupByType(hits: SearchHit[]): Map<SearchType, SearchHit[]> {
  const out = new Map<SearchType, SearchHit[]>();
  const ORDER: SearchType[] = ['lodging', 'place', 'activity', 'sunset', 'jewish', 'shabbat'];
  for (const t of ORDER) out.set(t, []);
  for (const h of hits) {
    const arr = out.get(h.item.type);
    if (arr) arr.push(h);
  }
  // Drop empty buckets so render skips them.
  for (const [k, v] of out) if (v.length === 0) out.delete(k);
  return out;
}

export function typeLabel(t: SearchType): string {
  switch (t) {
    case 'lodging':
      return 'Sleeping';
    case 'place':
      return 'Places to see';
    case 'activity':
      return 'Activities';
    case 'sunset':
      return 'Sunsets';
    case 'jewish':
      return 'Jewish sights';
    case 'shabbat':
      return 'Shabbat';
  }
}

export function typeIcon(t: SearchType): string {
  switch (t) {
    case 'lodging':
      return '🏠';
    case 'place':
      return '🏞️';
    case 'activity':
      return '🚣';
    case 'sunset':
      return '🌅';
    case 'jewish':
      return '✡';
    case 'shabbat':
      return '🕯️';
  }
}

// =====================================================================
// RECOMMENDATION CURATION — top picks per type.
// =====================================================================

export interface RecommendationGroup {
  title: string;
  blurb: string;
  type: SearchType | 'mixed';
  items: SearchItem[];
}

export function buildRecommendations(): RecommendationGroup[] {
  const index = buildIndex();

  // Top 3 lodgings per base — primary TRIP picks + first 2 alts per base,
  // then the SUNSET_STAYS for the summit slot.
  const lodgingByBase = new Map<string, SearchItem[]>();
  for (const item of index.filter((i) => i.type === 'lodging')) {
    // Use location as proxy for base. Group by the leading word
    // ("Salzburg", "Hallstatt", "Berchtesgaden", "Wolfgangsee", "Airport").
    const key = baseKeyFromLocation(item.location ?? 'Other');
    if (!lodgingByBase.has(key)) lodgingByBase.set(key, []);
    lodgingByBase.get(key)!.push(item);
  }
  // Sort each base by weight desc + take top 3.
  const topLodgings: SearchItem[] = [];
  for (const [, items] of lodgingByBase) {
    items.sort((a, b) => b.weight - a.weight);
    topLodgings.push(...items.slice(0, 3));
  }

  // Top 5 nature picks by weight.
  const topPlaces = index
    .filter((i) => i.type === 'place')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  // Top 3 water activities.
  const topActivities = index
    .filter((i) => i.type === 'activity')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  // Top 3 sunset spots (mix of nature + stays).
  const topSunsets = index
    .filter((i) => i.type === 'sunset')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  // Top 2 Jewish sights (skip Chabad — it's everywhere; prefer one cultural).
  const topJewish = index
    .filter((i) => i.type === 'jewish')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2);

  return [
    {
      title: 'Sleeping picks per base',
      blurb: 'Top 3 per base. Tap any card to open the full listing.',
      type: 'lodging',
      items: topLodgings,
    },
    {
      title: 'Top 5 nature destinations',
      blurb: 'The breathtaking shortlist — sunset-worthy, walk-friendly, locked-day favorites first.',
      type: 'place',
      items: topPlaces,
    },
    {
      title: 'Top 3 water activities',
      blurb: 'Königssee silent boat is the trip\'s peak moment. Other two are off-day options.',
      type: 'activity',
      items: topActivities,
    },
    {
      title: 'Top 3 sunset spots',
      blurb: 'Where the day ends. Includes the Schafbergspitze sleep-at-the-summit pick.',
      type: 'sunset',
      items: topSunsets,
    },
    {
      title: 'Top 2 Jewish sights',
      blurb: 'Walking-distance heritage + the Chabad anchor.',
      type: 'jewish',
      items: topJewish,
    },
  ];
}

// =====================================================================
// Internal helpers.
// =====================================================================

function oneLine(s: string): string {
  // Trim, strip linebreaks, cap at ~140 chars so result rows stay scannable.
  const flat = s.replace(/\s+/g, ' ').trim();
  if (flat.length <= 140) return flat;
  return flat.slice(0, 137).trimEnd() + '…';
}

function formatRegion(r: string): string {
  switch (r) {
    case 'salzkammergut':
      return 'Salzkammergut · Austria';
    case 'berchtesgaden':
      return 'Berchtesgaden · Germany';
    case 'hohe-tauern':
      return 'Hohe Tauern · Austria';
    case 'wolfgangsee':
      return 'Wolfgangsee · Salzkammergut';
    case 'dachstein':
      return 'Dachstein · Austria';
    default:
      return r;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
}

function baseKeyFromLocation(loc: string): string {
  const l = loc.toLowerCase();
  if (l.includes('salzburg') && !l.includes('airport') && !l.includes('summit')) return 'Salzburg';
  if (l.includes('hallstatt') || l.includes('obertraun')) return 'Hallstatt / Obertraun';
  if (l.includes('berchtesgaden') || l.includes('ramsau')) return 'Berchtesgaden';
  if (l.includes('wolfgangsee')) return 'Wolfgangsee';
  if (l.includes('airport')) return 'Airport area';
  if (l.includes('summit') || l.includes('dachstein')) return 'Summit stays';
  return 'Other';
}

// =====================================================================
// Used by page-recommendations.ts → the "📍 See on map" handoff.
// Builds the map.html URL with a #focus=<id> fragment the map listens for.
// =====================================================================

export function mapFocusUrl(item: SearchItem): string | null {
  if (!item.coords) return null;
  // Pin focus key matches NATURE_DESTINATIONS.id / LODGING_COORDS name slug.
  // For lodging, derive name from item.name (since our index id is slugged).
  if (item.type === 'place' || item.type === 'sunset') {
    const idPart = item.id.replace(/^(?:place|sunset)-/, '').replace(/^stay-/, '');
    return `map.html#focus=${encodeURIComponent(idPart)}`;
  }
  // For lodging, focus by name (LODGING_COORDS is keyed by raw name).
  return `map.html#focus-lodging=${encodeURIComponent(item.name)}`;
}
