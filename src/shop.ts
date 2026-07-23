// ===========================================================================
// shop.ts — renders shop.html: "Shop by sight". A visual grid of common
//   Austrian products that are kosher, grouped by category, with a real
//   self-hosted photo, the actual ingredients, and a clear label of HOW it's
//   kosher: certified (by which authority, and whether Misrachi lists it) or
//   kosher-by-ingredient (clean label). Images live in public/products/.
// ===========================================================================

// cert  = has a hechsher (authority named in `misrachi`)
// ingr  = kosher by reading the label, no bishul-akum problem
// disp  = bishul akum is arguable here (she does NOT rely on bishul-akum leniencies)
// needs = cooked by them and it counts — needs a hechsher
type Status = 'cert' | 'ingr' | 'disp' | 'needs';
interface Product {
  slug: string;
  name: string;
  cat: string;
  status: Status;
  why: string;
  misrachi: string; // certifying authority per Misrachi Austria's guide; '' if not listed
  ingredients: string; // German ingredient text (best-effort, from Open Food Facts)
  leniency: string; // WHAT this item leans on: a named leniency, or 'none needed' and why
  ingredientsEn: string; // plain-English translation of the German list (Gil's request)
}

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

const PRODUCTS: Product[] = [
  {
    slug: 'alpro-oat',
    name: 'Alpro Oat / Barista',
    cat: 'Milk & plant milk',
    status: 'ingr',
    misrachi: '',
    why: 'Plant, no milk. NOT on Misrachi list - Alpro Oat/Barista is not among the listed varieties',
    ingredients: '',
    leniency: 'None needed - plant, no milk at all. (Also KLBD-certified.)',
    ingredientsEn: '',
  },
  {
    slug: 'alpro-soja',
    name: 'Alpro Soja Natur',
    cat: 'Milk & plant milk',
    status: 'ingr',
    misrachi: '',
    why: 'Plant, no milk. Plain Soja Drink Natur is NOT confirmed on the Misrachi list',
    ingredients: '',
    leniency: 'None needed - plant, no milk at all. (Also KLBD-certified.)',
    ingredientsEn: '',
  },
  {
    slug: 'nom-milch',
    name: 'NÖM Vollmilch',
    cat: 'Milk & plant milk',
    status: 'cert',
    misrachi: 'Rabbi A. Katz, Yerushalayim - CHALAV STAM (expired 31.07.2023)',
    why: 'Listed by name: NOEM Vollmilch 3,5% Fett laenger frisch 1 Liter. Sold at BILLA + SPAR',
    ingredients: '',
    leniency:
      'CHALAV STAM - EU dairy is government-policed, so it counts as watched (Rav Moshe; OU applies it to the EU).',
    ingredientsEn: '',
  },
  {
    slug: 'joya-oat',
    name: 'Joya Oat drink',
    cat: 'Milk & plant milk',
    status: 'ingr',
    misrachi: '',
    why: 'Austrian plant milk',
    ingredients: 'Haferbasis 99,5% (Wasser, _Vollkornhafer_ 11,5%), Sonnenblumenöl, Salz.',
    leniency: 'None needed - plant, no milk.',
    ingredientsEn: 'Oat base 99.5% (water, wholegrain oats 11.5%), sunflower oil, salt.',
  },
  {
    slug: 'alpro-yogurt',
    name: 'Alpro Soja Joghurt Natur',
    cat: 'Yogurt',
    status: 'ingr',
    misrachi: '',
    why: 'Plant, no milk. BUT has natuerliches Aroma + ascorbyl palmitate (E304) - check the tub for a VEGAN MARK, which settles both',
    ingredients:
      'Wasser, geschälte SOJABOHNEN (10,7%), Calcium (Tricalciumcitrat), Stabilisator (Pektine), Säureregulatoren (Natriumcitrate, Citronensäure), natürliches Aroma, Meersalz, Antioxidationsmittel (stark tocopherolhaltige Extrakte, Fettsäureester der Ascorbinsäure), Vitamine (B12, B6, D2), Joghurtkulturen (S. thermophilus, L. bulgaricus). Kann SPUREN VON SCHALENFRÜCHTEN enthalten.',
    leniency: 'None needed - plant, no milk.',
    ingredientsEn:
      'Water, hulled soybeans (10.7%), calcium (tricalcium citrate), stabiliser (pectin), acidity regulators (sodium citrates, citric acid), NATURAL FLAVOURING, sea salt, antioxidants (tocopherol-rich extracts, ASCORBYL PALMITATE), vitamins (B12, B6, D2), yogurt cultures. May contain traces of nuts.',
  },
  {
    slug: 'nom-naturjoghurt',
    name: 'NÖM Naturjoghurt',
    cat: 'Yogurt',
    status: 'cert',
    misrachi: 'Rabbi A. Katz, Yerushalayim - CHALAV STAM (expired 31.07.2023)',
    why: 'Listed by exact SKU: NOEM Joghurt Natur 1% Fett loeffelfest 250g. Sold at BILLA + SPAR',
    ingredients: 'Joghurt 1 % Fett, aus pasteurisierter Milch',
    leniency: 'CHALAV STAM. Plus: yogurt is set by culture, not rennet - so no cheese question.',
    ingredientsEn: 'Yogurt 1% fat, from pasteurised milk.',
  },
  {
    slug: 'olz-toast',
    name: 'Ölz Sandwich Toast',
    cat: 'Bread',
    status: 'ingr',
    misrachi: '',
    why: 'Baked bread = pas palter, which you accept - V-Label vegan',
    ingredients:
      'Weizenmehl, Wasser, Weizensauerteig, Rapsöl, Hefe, Zucker, Speisesalz, Säureregulator (Natriumacetat), Ascorbinsäure',
    leniency:
      'PAS PALTER - commercially baked bread (the decree was aimed at a non-Jew home-baking).',
    ingredientsEn: '',
  },
  {
    slug: 'wasa-roggen',
    name: 'Wasa Vollkorn Roggen',
    cat: 'Crackers',
    status: 'ingr',
    misrachi: '',
    why: 'Rye + yeast + salt - baked, so pas palter',
    ingredients: 'Vollkornroggenmehl, Hefe, Salz.',
    leniency: 'PAS PALTER, extended to pat habaah bkisnin (Gil).',
    ingredientsEn: 'Wholegrain rye flour, yeast, salt.',
  },
  {
    slug: 'reiswaffeln',
    name: 'Rice cakes (Reiswaffeln)',
    cat: 'Crackers',
    status: 'ingr',
    misrachi: '',
    why: 'Rice + salt',
    ingredients: '98,7% Bio Reis, Bio Sesam, 0,3% Speisesalz.',
    leniency: 'None needed - puffed rice + salt, nothing cooked by them that counts.',
    ingredientsEn: '98.7% organic rice, organic sesame, 0.3% salt.',
  },
  {
    slug: 'soletti',
    name: 'Soletti sticks',
    cat: 'Crackers',
    status: 'ingr',
    misrachi: '',
    why: 'Baked wheat sticks = pas palter - read for palm/animal fat',
    ingredients: '',
    leniency: 'PAS PALTER, extended to pat habaah bkisnin (Gil).',
    ingredientsEn: '',
  },
  {
    slug: 'barilla-spaghetti',
    name: 'Barilla Spaghetti',
    cat: 'Pasta & grains',
    status: 'ingr',
    misrachi: '',
    why: 'Durum wheat + water',
    ingredients: 'Semoule de BLÉ dur. Peut contenir des traces de SOJA et de MOUTARDE.',
    leniency: 'None needed - it is raw. YOU cook it, so bishul akum never starts.',
    ingredientsEn: 'Durum wheat semolina. May contain traces of soy and mustard.',
  },
  {
    slug: 'barilla-penne',
    name: 'Barilla Penne',
    cat: 'Pasta & grains',
    status: 'ingr',
    misrachi: '',
    why: 'Durum wheat + water',
    ingredients: 'Vollkorn-Hartweizengrieß, Wasser',
    leniency: 'None needed - it is raw. YOU cook it, so bishul akum never starts.',
    ingredientsEn: 'Wholegrain durum wheat semolina, water.',
  },
  {
    slug: 'koelln-oats',
    name: 'Kölln Haferflocken',
    cat: 'Pasta & grains',
    status: 'ingr',
    misrachi: '',
    why: 'Plain oats',
    ingredients: 'Vollkorn-Haferflocken',
    leniency: 'None needed - oats are exempt anyway, and you cook them.',
    ingredientsEn: 'Wholegrain rolled oats.',
  },
  {
    slug: 'kellys-chips',
    name: "Kelly's Chips Classic",
    cat: 'Snacks & chips',
    status: 'ingr',
    misrachi: '',
    why: 'Gil: ok according to most - potato, oil, salt',
    ingredients: 'Kartoffeln, Sonnenblumenöl, Salz',
    leniency: 'BISHUL AKUM leniency: a snack is not "kings-table" food. Gil: ok according to most.',
    ingredientsEn: 'Potatoes, sunflower oil, salt.',
  },
  {
    slug: 'kellys-popcorn',
    name: "Kelly's Popcorn",
    cat: 'Snacks & chips',
    status: 'ingr',
    misrachi: '',
    why: 'Gil: ok according to most - corn, oil, salt',
    ingredients: '84% Mais, 14% Palmöl, Speisesalz.',
    leniency: 'BISHUL AKUM leniency: a snack is not "kings-table" food. Gil: ok according to most.',
    ingredientsEn: '84% corn, 14% palm oil, salt.',
  },
  {
    slug: 'milka-alpenmilch',
    name: 'Milka Alpenmilch',
    cat: 'Chocolate',
    status: 'ingr',
    misrachi: '',
    why: 'Dairy - chalav stam. Contains Suessmolkenpulver (whey) - Gil: fine under chalav stam',
    ingredients:
      'Zucker, Kakaobutter, Kakaomasse, MAGERMILCHPULVER, Süssmolkenpulver (aus MILCH), BUTTERREINFETT, Emulgator (SOJALECITHINE), HASELNUSSMASSE, Aroma, Kakao: 33%',
    leniency:
      'CHALAV STAM - and that also covers the Suessmolkenpulver (whey). Gil: whey is fine if chalav stam is fine.',
    ingredientsEn: '',
  },
  {
    slug: 'lindt-70',
    name: 'Lindt Excellence 70%',
    cat: 'Chocolate',
    status: 'ingr',
    misrachi: '',
    why: 'Dark, usually pareve — read',
    ingredients: 'Kakaomasse, Zucker, Kakaobutter, Vanille',
    leniency: 'None needed - dark chocolate, pareve ingredients, not a cooked dish.',
    ingredientsEn: 'Cocoa mass, sugar, cocoa butter, vanilla.',
  },
  {
    slug: 'kelloggs-cornflakes',
    name: "Kellogg's Corn Flakes",
    cat: 'Cereal',
    status: 'cert',
    misrachi: 'Manchester Beth Din - only with the imprinted stamp',
    why: 'Listed by name in the Misrachi guide',
    ingredients:
      'corn, sugar, aroma of malt of barley, salt, vitamins and minerals : vitamin b3/pp, vitamin b6, vitamin b2, vitamin b1, vitamin b9, vitamin d, vitamin b12, iron,',
    leniency: 'None needed - it is CERTIFIED (Manchester Beth Din), with the stamp on the pack.',
    ingredientsEn:
      'Corn, sugar, barley malt flavouring, salt, vitamins and minerals (B3, B6, B2, B1, folic acid, D, B12, iron).',
  },
  {
    slug: 'bertolli-oil',
    name: 'Extra-virgin olive oil',
    cat: 'Oils',
    status: 'ingr',
    misrachi: '',
    why: 'Extra-virgin ONLY. Buy Natives Olivenoel extra - not the refined grade, not infused. OU-certified Olivenoel also exists at Billa',
    ingredients: 'olijfolie',
    leniency:
      'None needed per OU/cRc/OK Kosher: cold-pressed, single ingredient, never enters a refinery. NOTE: Star-K and KLBD do NOT join - they want a hechsher on all oils.',
    ingredientsEn: 'Olive oil.',
  },
  {
    slug: 'darbo-marille',
    name: 'Apricot jam (Marille)',
    cat: 'Spreads & jam',
    status: 'ingr',
    misrachi: '',
    why: 'Fruit + sugar + pectin',
    ingredients: '',
    leniency: 'None needed - fruit is edible raw, so cooking it does not trigger bishul akum.',
    ingredientsEn: '',
  },
  {
    slug: 'bonduelle-erbsen',
    name: 'Bonduelle Erbsen (peas)',
    cat: 'Canned',
    status: 'cert',
    misrachi: 'Rabbi N. Rotenberg, Vienna (expired 31.12.2023)',
    why: 'Listed by name: Bonduelle peas',
    ingredients: 'Palerbsen sehr fein, Wasser, Zucker, Salz.',
    leniency: 'None needed - it is CERTIFIED (Rabbi Rotenberg, Vienna, via Misrachi).',
    ingredientsEn: 'Garden peas (extra fine), water, sugar, salt.',
  },
  {
    slug: 'mutti-passata',
    name: 'Mutti Passata (tomatoes)',
    cat: 'Canned',
    status: 'ingr',
    misrachi: '',
    why: 'Tomato + basil',
    ingredients: 'Pomodoro 99,5 %, sale.',
    leniency: 'None needed - tomatoes are edible raw, so no bishul akum.',
    ingredientsEn: 'Tomato 99.5%, salt.',
  },
  {
    slug: 'olives',
    name: 'Green olives',
    cat: 'Canned',
    status: 'ingr',
    misrachi: '',
    why: 'Olives + brine — watch Weinessig',
    ingredients:
      "49% olives vertes, eau, 8% ail, sel, correcteur d'acidité: acide lactique; antioxydants: acide citrique, acide ascorbique. Traces éventuelles d'amandes.",
    leniency: 'None needed - olives are cured, not cooked. Just check the brine is not Weinessig.',
    ingredientsEn:
      '49% green olives, water, 8% garlic, salt, acidity regulator: lactic acid; antioxidants: citric acid, ascorbic acid. May contain traces of almonds.',
  },
  {
    slug: 'rio-mare-tuna',
    name: 'Rio Mare Thunfisch',
    cat: 'Fish & tuna',
    status: 'ingr',
    misrachi: '',
    why: 'Gil: room to be lenient - steamed first, not kings-table, made industrially. Still read the can',
    ingredients: '',
    leniency:
      'BISHUL AKUM leniency, three grounds together (Gil): steamed first + not "kings-table" + made industrially. Note: industrial alone would NOT be enough.',
    ingredientsEn: '',
  },
  {
    slug: 'thunfisch-natur',
    name: 'Thunfisch in water',
    cat: 'Fish & tuna',
    status: 'ingr',
    misrachi: '',
    why: 'Gil: room to be lenient - steamed first, not kings-table, made industrially. Still read the can',
    ingredients: '',
    leniency:
      'BISHUL AKUM leniency, three grounds together (Gil): steamed + not "kings-table" + industrial.',
    ingredientsEn: '',
  },
  {
    slug: 'raeucherlachs',
    name: 'Smoked salmon / trout (Raeucherlachs)',
    cat: 'Fish & tuna',
    status: 'ingr',
    misrachi: '',
    why: 'Gil: ok - cold-smoked, never actually cooked. Kosher species (fins + scales)',
    ingredients: '',
    leniency:
      'None needed - cold-smoked, never actually cooked, so bishul akum never starts. Gil: ok.',
    ingredientsEn: '',
  },
  {
    slug: 'rauch-orange',
    name: 'Rauch Happy Day Orange',
    cat: 'Drinks',
    status: 'ingr',
    misrachi: '',
    why: 'Single-fruit juice — no grape',
    ingredients: 'Orangensaft 100%',
    leniency: 'None needed - juice, not a cooked dish. Single fruit, so no grape either.',
    ingredientsEn: 'Orange juice 100%.',
  },
  {
    slug: 'rauch-apfel',
    name: 'Rauch Happy Day Apfel',
    cat: 'Drinks',
    status: 'ingr',
    misrachi: '',
    why: 'Apple juice — no grape',
    ingredients: '100% Jus de pomme à base de concentré',
    leniency: 'None needed - juice, not a cooked dish. Apple, so no grape.',
    ingredientsEn: '100% apple juice from concentrate.',
  },
  {
    slug: 'voeslauer',
    name: 'Vöslauer water',
    cat: 'Drinks',
    status: 'ingr',
    misrachi: '',
    why: 'Just water',
    ingredients: 'Natürliches Mineralwasser',
    leniency: 'None needed - it is water.',
    ingredientsEn: 'Natural mineral water.',
  },
  {
    slug: 'mccain-frites',
    name: 'McCain 1·2·3 Frites',
    cat: 'Frozen',
    status: 'ingr',
    misrachi: '',
    why: 'Potato + sunflower oil, vegan. Gil: partially cooked + you finish it = ok. BONUS: McCain Frites 1-2-3 is KLBD-certified at Interspar',
    ingredients: 'Kartoffeln (96%), Sonnenblumenöl (4%).',
    leniency:
      'BISHUL AKUM, settled by Gil: "If something is partially cooked and you finish the cooking it is ok from bishul akum." The factory par-fries, you finish it.',
    ingredientsEn: '',
  },
  {
    slug: 'iglo-erbsen',
    name: 'Frozen peas',
    cat: 'Frozen',
    status: 'ingr',
    misrachi: '',
    why: 'Just peas',
    ingredients: 'Erbsen',
    leniency: 'None needed - peas are edible raw, so blanching does not trigger bishul akum.',
    ingredientsEn: 'Peas.',
  },
];

// This page is the INGREDIENT-BASED path only. Certified products live on
// certified.html — except where a certified item is so common it belongs here
// too (kept via ALSO_HERE below).
const ALSO_HERE = new Set(['nom-naturjoghurt', 'nom-milch']);
const INGREDIENT_BASED = PRODUCTS.filter((p) => p.status !== 'cert' || ALSO_HERE.has(p.slug));

// group into categories, preserving first-seen order
const cats: string[] = [];
const byCat = new Map<string, Product[]>();
for (const p of INGREDIENT_BASED) {
  if (!byCat.has(p.cat)) {
    byCat.set(p.cat, []);
    cats.push(p.cat);
  }
  byCat.get(p.cat)?.push(p);
}

const TAG_LABEL: Record<Status, string> = {
  cert: 'Certified ✡️',
  ingr: 'By ingredient',
  disp: 'Bishul akum — disputed',
  needs: 'Needs a hechsher',
};

function card(p: Product): string {
  const tag = `<span class="tag ${p.status}">${TAG_LABEL[p.status]}</span>`;
  const misr = p.misrachi
    ? `<div class="misr">✓ Misrachi Austria — <b>${esc(p.misrachi)}</b></div>`
    : '';
  const ing = p.ingredients
    ? `<div class="ing"><span class="zt">Zutaten (German)</span> ${esc(p.ingredients)}${
        p.ingredientsEn
          ? `<span class="en"><span class="zt">In English</span> ${esc(p.ingredientsEn)}</span>`
          : ''
      }</div>`
    : `<div class="ing muted"><span class="zt">Zutaten</span> check the pack</div>`;
  const len = p.leniency
    ? `<div class="len"><span class="zt">Leaning on</span> ${esc(p.leniency)}</div>`
    : '';
  return `<div class="prod">
    <div class="ph"><img src="products/${esc(p.slug)}.jpg" alt="${esc(p.name)}" loading="lazy" /></div>
    <div class="body">
      ${tag}
      <span class="name">${esc(p.name)}</span>
      ${misr}
      <span class="why">${esc(p.why)}</span>
      ${len}
      ${ing}
    </div>
  </div>`;
}

const host = document.getElementById('shop');

function render(q: string): void {
  if (!host) return;
  const needle = q.trim().toLowerCase();
  const match = (p: Product): boolean =>
    !needle ||
    [p.name, p.cat, p.why, p.leniency, p.ingredients, p.ingredientsEn, p.misrachi]
      .join(' ')
      .toLowerCase()
      .includes(needle);
  let shown = 0;
  host.innerHTML = cats
    .map((c) => {
      const items = (byCat.get(c) ?? []).filter(match);
      if (!items.length) return '';
      shown += items.length;
      return `<section class="cat">
      <h2>${esc(c)}</h2>
      <div class="grid">${items.map(card).join('')}</div>
    </section>`;
    })
    .join('');

  const countEl = document.getElementById('count');
  if (countEl) {
    countEl.textContent = needle
      ? `${shown} of ${INGREDIENT_BASED.length} match “${q.trim()}”`
      : `${INGREDIENT_BASED.length} products — searchable by name or ingredient`;
  }
  if (needle && shown === 0) {
    host.innerHTML =
      '<p class="noresult">Nothing matches. Try an ingredient (Molke, Aroma, Zucker), a food (chips, oat, tuna), or a reason (chalav stam, pas palter).</p>';
  }
}

const qEl = document.getElementById('q');
if (qEl instanceof HTMLInputElement) {
  qEl.addEventListener('input', () => render(qEl.value));
}
render('');

export {}; // isolate module scope (no imports/exports otherwise)
