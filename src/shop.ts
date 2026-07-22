// ===========================================================================
// shop.ts — renders shop.html: "Shop by sight". A super-simple visual grid of
//   common Austrian products that are kosher (certified) or kosher-by-
//   ingredient, grouped by category, with real self-hosted product photos.
// Data is static; images live in public/products/<slug>.jpg.
// ===========================================================================

type Status = 'cert' | 'ingr';
interface Product {
  slug: string;
  name: string;
  cat: string;
  status: Status;
  why: string;
}

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// order preserved from the data array
const PRODUCTS: Product[] = [
  {
    slug: 'alpro-oat',
    name: 'Alpro Oat / Barista',
    cat: 'Milk & plant milk',
    status: 'ingr',
    why: 'Plant, no milk — read tub',
  },
  {
    slug: 'olz-toast',
    name: 'Ölz Sandwich Toast',
    cat: 'Bread',
    status: 'ingr',
    why: 'Ölz toast line is V-Label vegan',
  },
  {
    slug: 'wasa-roggen',
    name: 'Wasa Vollkorn Roggen',
    cat: 'Crackers',
    status: 'ingr',
    why: 'Rye + yeast + salt only',
  },
  {
    slug: 'reiswaffeln',
    name: 'Rice cakes (Reiswaffeln)',
    cat: 'Crackers',
    status: 'ingr',
    why: 'Rice + salt',
  },
  {
    slug: 'barilla-spaghetti',
    name: 'Barilla Spaghetti',
    cat: 'Pasta & grains',
    status: 'ingr',
    why: 'Durum wheat + water',
  },
  {
    slug: 'barilla-penne',
    name: 'Barilla Penne',
    cat: 'Pasta & grains',
    status: 'ingr',
    why: 'Durum wheat + water',
  },
  {
    slug: 'kellys-chips',
    name: "Kelly's Chips Classic",
    cat: 'Snacks & chips',
    status: 'ingr',
    why: 'Potato + oil + salt, V-Label',
  },
  {
    slug: 'kellys-popcorn',
    name: "Kelly's Popcorn",
    cat: 'Snacks & chips',
    status: 'ingr',
    why: 'Corn + oil + salt',
  },
  {
    slug: 'milka-alpenmilch',
    name: 'Milka Alpenmilch',
    cat: 'Chocolate',
    status: 'ingr',
    why: 'Dairy — chalav stam',
  },
  {
    slug: 'lindt-70',
    name: 'Lindt Excellence 70%',
    cat: 'Chocolate',
    status: 'ingr',
    why: 'Dark, usually pareve — read',
  },
  {
    slug: 'kelloggs-cornflakes',
    name: "Kellogg's Corn Flakes",
    cat: 'Cereal',
    status: 'cert',
    why: 'Manchester Beth Din — with stamp',
  },
  {
    slug: 'bertolli-oil',
    name: 'Extra-virgin olive oil',
    cat: 'Oils',
    status: 'ingr',
    why: 'Single-ingredient EVOO',
  },
  {
    slug: 'bonduelle-erbsen',
    name: 'Bonduelle Erbsen (peas)',
    cat: 'Canned',
    status: 'cert',
    why: 'Rabbi Rotenberg, Vienna (Misrachi)',
  },
  {
    slug: 'mutti-passata',
    name: 'Mutti Passata (tomatoes)',
    cat: 'Canned',
    status: 'ingr',
    why: 'Tomato + basil',
  },
  {
    slug: 'rauch-orange',
    name: 'Rauch Happy Day Orange',
    cat: 'Drinks',
    status: 'ingr',
    why: 'Single-fruit juice — no grape',
  },
  { slug: 'voeslauer', name: 'Vöslauer water', cat: 'Drinks', status: 'ingr', why: 'Just water' },
  {
    slug: 'mccain-frites',
    name: 'McCain 1·2·3 Frites',
    cat: 'Frozen',
    status: 'ingr',
    why: 'Potato + sunflower oil, vegan',
  },
  { slug: 'iglo-erbsen', name: 'Frozen peas', cat: 'Frozen', status: 'ingr', why: 'Just peas' },
];

const TAG_LABEL: Record<Status, string> = { cert: 'Certified', ingr: 'By ingredient' };

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
  return `<div class="prod">
    <div class="ph"><img src="products/${esc(p.slug)}.jpg" alt="${esc(p.name)}" loading="lazy" /></div>
    <div class="body">
      <span class="tag ${p.status}">${TAG_LABEL[p.status]}</span>
      <span class="name">${esc(p.name)}</span>
      <span class="why">${esc(p.why)}</span>
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
