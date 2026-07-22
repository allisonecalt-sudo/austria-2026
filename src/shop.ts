// ===========================================================================
// shop.ts — renders shop.html: "Shop by sight". A visual grid of common
//   Austrian products that are kosher, grouped by category, with a real
//   self-hosted photo, the actual ingredients, and a clear label of HOW it's
//   kosher: certified (by which authority, and whether Misrachi lists it) or
//   kosher-by-ingredient (clean label). Images live in public/products/.
// ===========================================================================

type Status = 'cert' | 'ingr';
interface Product {
  slug: string;
  name: string;
  cat: string;
  status: Status;
  why: string;
  misrachi: string; // certifying authority per Misrachi Austria's guide; '' if not listed
  ingredients: string; // German ingredient text (best-effort, from Open Food Facts)
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
    status: 'cert',
    misrachi: 'KLBD (Alpro range)',
    why: 'Plant, no milk',
    ingredients: '',
  },
  {
    slug: 'alpro-soja',
    name: 'Alpro Soja Natur',
    cat: 'Milk & plant milk',
    status: 'cert',
    misrachi: 'KLBD (Alpro range)',
    why: 'Plant, no milk',
    ingredients: '',
  },
  {
    slug: 'nom-milch',
    name: 'NÖM Vollmilch',
    cat: 'Milk & plant milk',
    status: 'cert',
    misrachi: 'On Misrachi list (NÖM)',
    why: 'Plain milk — chalav stam',
    ingredients: '',
  },
  {
    slug: 'joya-oat',
    name: 'Joya Oat drink',
    cat: 'Milk & plant milk',
    status: 'ingr',
    misrachi: '',
    why: 'Austrian plant milk',
    ingredients: 'Haferbasis 99,5% (Wasser, _Vollkornhafer_ 11,5%), Sonnenblumenöl, Salz.',
  },
  {
    slug: 'alpro-yogurt',
    name: 'Alpro Soja Joghurt Natur',
    cat: 'Yogurt',
    status: 'cert',
    misrachi: 'KLBD (Alpro range)',
    why: 'Plant yogurt, no milk',
    ingredients:
      'Wasser, geschälte SOJABOHNEN (10,7%), Calcium (Tricalciumcitrat), Stabilisator (Pektine), Säureregulatoren (Natriumcitrate, Citronensäure), natürliches Aroma, Meersalz, Antioxidationsmittel (stark tocopherolhaltige Extrakte, Fettsäureester der Ascorbinsäure), Vitamine (B12, B6, D2), Joghurtkulturen (S. thermophilus, L. bulgaricus). Kann SPUREN VON SCHALENFRÜCHTEN enthalten.',
  },
  {
    slug: 'nom-naturjoghurt',
    name: 'NÖM Naturjoghurt',
    cat: 'Yogurt',
    status: 'cert',
    misrachi: 'On Misrachi list (NÖM)',
    why: 'Plain dairy yogurt — chalav stam',
    ingredients: '',
  },
  {
    slug: 'olz-toast',
    name: 'Ölz Sandwich Toast',
    cat: 'Bread',
    status: 'ingr',
    misrachi: '',
    why: 'Ölz toast line is V-Label vegan',
    ingredients:
      'Weizenmehl, Wasser, Weizensauerteig, Rapsöl, Hefe, Zucker, Speisesalz, Säureregulator (Natriumacetat), Ascorbinsäure',
  },
  {
    slug: 'wasa-roggen',
    name: 'Wasa Vollkorn Roggen',
    cat: 'Crackers',
    status: 'ingr',
    misrachi: '',
    why: 'Rye + yeast + salt',
    ingredients: 'Vollkornroggenmehl, Hefe, Salz.',
  },
  {
    slug: 'reiswaffeln',
    name: 'Rice cakes (Reiswaffeln)',
    cat: 'Crackers',
    status: 'ingr',
    misrachi: '',
    why: 'Rice + salt',
    ingredients: '98,7% Bio Reis, Bio Sesam, 0,3% Speisesalz.',
  },
  {
    slug: 'soletti',
    name: 'Soletti sticks',
    cat: 'Crackers',
    status: 'ingr',
    misrachi: '',
    why: 'Wheat sticks — read for palm/animal fat',
    ingredients: '',
  },
  {
    slug: 'barilla-spaghetti',
    name: 'Barilla Spaghetti',
    cat: 'Pasta & grains',
    status: 'ingr',
    misrachi: '',
    why: 'Durum wheat + water',
    ingredients: 'Semoule de BLÉ dur. Peut contenir des traces de SOJA et de MOUTARDE.',
  },
  {
    slug: 'barilla-penne',
    name: 'Barilla Penne',
    cat: 'Pasta & grains',
    status: 'ingr',
    misrachi: '',
    why: 'Durum wheat + water',
    ingredients: 'Vollkorn-Hartweizengrieß, Wasser',
  },
  {
    slug: 'koelln-oats',
    name: 'Kölln Haferflocken',
    cat: 'Pasta & grains',
    status: 'ingr',
    misrachi: '',
    why: 'Plain oats',
    ingredients: 'Vollkorn-Haferflocken',
  },
  {
    slug: 'kellys-chips',
    name: "Kelly's Chips Classic",
    cat: 'Snacks & chips',
    status: 'ingr',
    misrachi: '',
    why: 'Potato + oil + salt, V-Label',
    ingredients: 'Kartoffeln, Sonnenblumenöl, Salz',
  },
  {
    slug: 'kellys-popcorn',
    name: "Kelly's Popcorn",
    cat: 'Snacks & chips',
    status: 'ingr',
    misrachi: '',
    why: 'Corn + oil + salt',
    ingredients: '84% Mais, 14% Palmöl, Speisesalz.',
  },
  {
    slug: 'milka-alpenmilch',
    name: 'Milka Alpenmilch',
    cat: 'Chocolate',
    status: 'ingr',
    misrachi: '',
    why: 'Dairy — chalav stam',
    ingredients:
      'Zucker, Kakaobutter, Kakaomasse, MAGERMILCHPULVER, Süssmolkenpulver (aus MILCH), BUTTERREINFETT, Emulgator (SOJALECITHINE), HASELNUSSMASSE, Aroma, Kakao: 33%',
  },
  {
    slug: 'lindt-70',
    name: 'Lindt Excellence 70%',
    cat: 'Chocolate',
    status: 'ingr',
    misrachi: '',
    why: 'Dark, usually pareve — read',
    ingredients: 'Kakaomasse, Zucker, Kakaobutter, Vanille',
  },
  {
    slug: 'kelloggs-cornflakes',
    name: "Kellogg's Corn Flakes",
    cat: 'Cereal',
    status: 'cert',
    misrachi: 'Manchester Beth Din',
    why: 'Corn, malt, sugar — with the stamp',
    ingredients:
      'corn, sugar, aroma of malt of barley, salt, vitamins and minerals : vitamin b3/pp, vitamin b6, vitamin b2, vitamin b1, vitamin b9, vitamin d, vitamin b12, iron,',
  },
  {
    slug: 'bertolli-oil',
    name: 'Extra-virgin olive oil',
    cat: 'Oils',
    status: 'ingr',
    misrachi: '',
    why: 'Single-ingredient EVOO',
    ingredients: 'olijfolie',
  },
  {
    slug: 'darbo-marille',
    name: 'Apricot jam (Marille)',
    cat: 'Spreads & jam',
    status: 'ingr',
    misrachi: '',
    why: 'Fruit + sugar + pectin',
    ingredients: '',
  },
  {
    slug: 'bonduelle-erbsen',
    name: 'Bonduelle Erbsen (peas)',
    cat: 'Canned',
    status: 'cert',
    misrachi: 'Rabbi Rotenberg, Vienna',
    why: 'Peas + water + salt',
    ingredients: 'Palerbsen sehr fein, Wasser, Zucker, Salz.',
  },
  {
    slug: 'mutti-passata',
    name: 'Mutti Passata (tomatoes)',
    cat: 'Canned',
    status: 'ingr',
    misrachi: '',
    why: 'Tomato + basil',
    ingredients: 'Pomodoro 99,5 %, sale.',
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
  },
  {
    slug: 'rio-mare-tuna',
    name: 'Rio Mare Thunfisch',
    cat: 'Fish & tuna',
    status: 'ingr',
    misrachi: '',
    why: 'Tuna = kosher fish; canned = read it, certified is better',
    ingredients: '',
  },
  {
    slug: 'thunfisch-natur',
    name: 'Thunfisch in water',
    cat: 'Fish & tuna',
    status: 'ingr',
    misrachi: '',
    why: 'Tuna in water; canned fish — read it, certified is better',
    ingredients: '',
  },
  {
    slug: 'rauch-orange',
    name: 'Rauch Happy Day Orange',
    cat: 'Drinks',
    status: 'ingr',
    misrachi: '',
    why: 'Single-fruit juice — no grape',
    ingredients: 'Orangensaft 100%',
  },
  {
    slug: 'rauch-apfel',
    name: 'Rauch Happy Day Apfel',
    cat: 'Drinks',
    status: 'ingr',
    misrachi: '',
    why: 'Apple juice — no grape',
    ingredients: '100% Jus de pomme à base de concentré',
  },
  {
    slug: 'voeslauer',
    name: 'Vöslauer water',
    cat: 'Drinks',
    status: 'ingr',
    misrachi: '',
    why: 'Just water',
    ingredients: 'Natürliches Mineralwasser',
  },
  {
    slug: 'mccain-frites',
    name: 'McCain 1·2·3 Frites',
    cat: 'Frozen',
    status: 'ingr',
    misrachi: '',
    why: 'Potato + sunflower oil, vegan',
    ingredients: 'Kartoffeln (96%), Sonnenblumenöl (4%).',
  },
  {
    slug: 'iglo-erbsen',
    name: 'Frozen peas',
    cat: 'Frozen',
    status: 'ingr',
    misrachi: '',
    why: 'Just peas',
    ingredients: 'Erbsen',
  },
];

// group into categories, preserving first-seen order
const cats: string[] = [];
const byCat = new Map<string, Product[]>();
for (const p of PRODUCTS) {
  if (!byCat.has(p.cat)) {
    byCat.set(p.cat, []);
    cats.push(p.cat);
  }
  byCat.get(p.cat)?.push(p);
}

function card(p: Product): string {
  const tag =
    p.status === 'cert'
      ? '<span class="tag cert">Certified ✡️</span>'
      : '<span class="tag ingr">By ingredient</span>';
  const misr = p.misrachi
    ? `<div class="misr">✓ Misrachi Austria — <b>${esc(p.misrachi)}</b></div>`
    : '';
  const ing = p.ingredients
    ? `<div class="ing"><span class="zt">Zutaten</span> ${esc(p.ingredients)}</div>`
    : `<div class="ing muted"><span class="zt">Zutaten</span> check the pack</div>`;
  return `<div class="prod">
    <div class="ph"><img src="products/${esc(p.slug)}.jpg" alt="${esc(p.name)}" loading="lazy" /></div>
    <div class="body">
      ${tag}
      <span class="name">${esc(p.name)}</span>
      ${misr}
      <span class="why">${esc(p.why)}</span>
      ${ing}
    </div>
  </div>`;
}

const html = cats
  .map((c) => {
    const items = byCat.get(c) ?? [];
    return `<section class="cat">
      <h2>${esc(c)}</h2>
      <div class="grid">${items.map(card).join('')}</div>
    </section>`;
  })
  .join('');

const host = document.getElementById('shop');
if (host) host.innerHTML = html;

export {}; // isolate module scope (no imports/exports otherwise)
