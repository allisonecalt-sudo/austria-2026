// ===========================================================================
// certified.ts — renders certified.html: products with a REAL hechsher that
//   are sold in ordinary Austrian supermarkets (Billa/Spar/Hofer/Interspar/
//   MPreis). Extracted from Misrachi Austria's 2023 kosher guide, filtered to
//   (a) a major hechsher and (b) mainstream-store availability.
// This is PATH 1 — her normal standard. shop.html is the ingredient fallback.
// ===========================================================================

interface Cert {
  cat: string;
  brand: string;
  name: string;
  auth: string;
  stamp: boolean; // only kosher WITH the imprinted symbol on that pack
  store: string;
}

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

const CERTS: Cert[] = [
  {
    cat: 'Plant milk & dairy-alt',
    brand: '',
    name: 'Coconut Cuisine in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Plant milk & dairy-alt',
    brand: '',
    name: 'Creamy Caramel Dessert in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Plant milk & dairy-alt',
    brand: '',
    name: 'Kokosnuss Original Kokosmilch in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Plant milk & dairy-alt',
    brand: '',
    name: 'Rice Cuisine in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Plant milk & dairy-alt',
    brand: '',
    name: 'Simply Vanille Dessert in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Plant milk & dairy-alt',
    brand: '',
    name: 'Single Soya Cream in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Plant milk & dairy-alt',
    brand: '',
    name: 'Soja Joghurt Limette Zitrone in a cup',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar, Hofer',
  },
  {
    cat: 'Plant milk & dairy-alt',
    brand: '',
    name: 'Soya Choco Geschmack in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Choco Krispies',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Choco Krispies Chocos',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Corn Flakes',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Crunchy Nut',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Day Vita',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Fruit Loops',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: 'Nature Valley',
    name: 'Müsliriegel',
    auth: 'OU',
    stamp: true,
    store: 'Billa, DM',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Oger Mampf',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Rice Krispies',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Rice Krispies Multi-grain',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: 'Nestle',
    name: 'Shreddies',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, M-Preis',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Smacks',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Special K Classic',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'W.K Kellog No Added Sugar Crunchy Müsli, different varieties',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Side Dishes',
    name: 'Kichererbsen pasta gluten-free',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Everest',
    name: 'Indischer Basmatireis weiß',
    auth: 'Star-K',
    stamp: false,
    store: 'Billa, Billa Plus, Metro und M-Preis',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Everest',
    name: 'Premium Bio Basmati Reis',
    auth: 'Star-K',
    stamp: false,
    store: 'Billa, Billa Plus, Metro und M-Preis',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Barilla',
    name: 'Pasta, different varieties',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Garofalo',
    name: 'Rigatoni',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Side Dishes',
    name: 'Rote Linsen pasta gluten-free',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Side Dishes',
    name: 'Yellow Lentil spaghetti gluten-free',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Curry Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Fiery Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'HP BBQ Sweet & Spicy',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Hot Chili Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Jalapeno Chili Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Light Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Mayonnaise',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Maximarkt und Billa plus',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Mayonnaise Einfach lecker',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Billa',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Worcester Sauce',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa und MPreis',
  },
  { cat: 'Oil', brand: 'Carapelli', name: 'Olivenöl', auth: 'OU', stamp: true, store: 'Billa' },
  {
    cat: 'Oil',
    brand: 'Sasso',
    name: 'Olivenöl (also Extra Vergine)',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Frozen',
    brand: 'Mccain',
    name: 'Frites 1-2-3 Original',
    auth: 'KLBD',
    stamp: false,
    store: 'Interspar',
  },
  {
    cat: 'Frozen',
    brand: 'Side Dishes',
    name: 'Frites Curly',
    auth: 'KLBD',
    stamp: false,
    store: 'Interspar',
  },
  {
    cat: 'Snacks',
    brand: 'Eat Real',
    name: 'Hummus Chips',
    auth: 'KLBD',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Snacks',
    brand: 'Eat Real',
    name: 'Lentil Chips',
    auth: 'KLBD',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Snacks',
    brand: 'Mccain',
    name: 'Smiles Kartoffelchips',
    auth: 'KLBD',
    stamp: false,
    store: 'Interspar',
  },
  {
    cat: 'Snacks',
    brand: 'Balconi',
    name: 'Snack al latte',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Billa plus',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Wrigleys',
    name: 'Airwaves Gum Cherry Menthol',
    auth: 'KLBD, ORD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Wrigleys',
    name: 'Airwaves Gum Menthol and Eucalyptus',
    auth: 'KLBD, ORD',
    stamp: false,
    store: 'Billa, Spar',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Almond Dream',
    name: 'Choco ice vegan',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Pepperidge Farm',
    name: 'Chocolate Chunk Cookies Dark Chocolate Brownie',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Interspar',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Pepperidge Farm',
    name: 'Chocolate Chunk Cookies White Chocolate Macadamia',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Interspar',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Waffers And Cookies',
    name: 'Quadratini Waffeln Dark Chocolate',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'M-Preis, Billa plus Direkt',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Waffers And Cookies',
    name: 'Schokolade Knuspino',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Ice cream',
    brand: 'Snickers',
    name: 'Ice Cream',
    auth: 'KLBD - Chalav Stam ICE CREAM',
    stamp: true,
    store: 'Billa plus, Penny Markt',
  },
  {
    cat: 'Ice cream',
    brand: 'Almond Dream',
    name: 'Toffee Ice',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Drinks',
    brand: 'Vita',
    name: 'Coco Coconut Water',
    auth: 'Star-K',
    stamp: true,
    store: 'Spar, Interspar',
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Apfel / Apple / Pomme',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Other',
    brand: "D'Arbo Darbo",
    name: 'Attention: Not Wald- Fichten- & Tannenhonig)',
    auth: 'OU',
    stamp: false,
    store: 'Spar, Billa',
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Brazil Nut / Noix de Brésil',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Other',
    brand: 'Roobar',
    name: 'Cacao Nibs',
    auth: 'KLBD',
    stamp: true,
    store: 'Libro, Spar',
  },
  {
    cat: 'Other',
    brand: 'Roobar',
    name: 'Chia Coconut - Riegel',
    auth: 'KLBD',
    stamp: true,
    store: 'Libro, Spar',
  },
  {
    cat: 'Other',
    brand: 'Manner',
    name: 'Cocos',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Cranberry / Canneberges',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Other',
    brand: 'The Jelly Bean Factory',
    name: 'Fruit Cocktail',
    auth: 'OU',
    stamp: true,
    store: 'Hofer',
  },
  { cat: 'Other', brand: 'Taste Of Nature', name: 'Goji', auth: 'OU', stamp: true, store: 'Billa' },
  {
    cat: 'Other',
    brand: 'The Jelly Bean Factory',
    name: 'Gourmet Beans',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Other',
    brand: 'Loacker',
    name: 'Gran Pasticceria Classic Waffeln Cremkakao',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
  },
  {
    cat: 'Other',
    brand: 'Loacker',
    name: 'Gran Pasticceria Classic Waffeln Napolitaner',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
  },
  {
    cat: 'Other',
    brand: 'Loacker',
    name: 'Gran Pasticceria Classic Waffeln Vanille',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Gran Pasticceria Coconut White',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Interspar, Eurospar',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Gran Pasticceria Noisette',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Gran Pasticceria Tortina Dark Noir',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'M-Preis, Billa plus Direkt',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Gran Pasticceria Tortina White',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
  },
  {
    cat: 'Other',
    brand: "Bertie Bott'S Beans",
    name: 'Harry Potter, different varieties',
    auth: 'OU',
    stamp: true,
    store: 'Hofer',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Haselnuss Knuspino',
    auth: 'OU - Pat Akum',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Haselnuss Mignon',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Roobar',
    name: 'Hemp & Chia',
    auth: 'KLBD',
    stamp: true,
    store: 'Libro, Spar',
  },
  {
    cat: 'Other',
    brand: "D'Arbo Darbo",
    name: 'Himbeere, Kirsche, Waldbeeren, Tropic, Hagebutte-Acerola)',
    auth: 'OU',
    stamp: false,
    store: 'Spar, Billa',
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Kokosnuss / Coconut / Noix de coco',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Other',
    brand: 'Balconi',
    name: 'Merendina Milchschnitte',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Billa plus',
  },
  {
    cat: 'Other',
    brand: 'Balconi',
    name: 'Mix Max',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Original Neapolitaner ("Mannerschnitten")',
    auth: 'OU - Pat Akum',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Quadratini Waffeln Napolitaner',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'M-Preis, Billa plus Direkt',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Quadratini Waffeln Vanille',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'M-Preis, Billa plus Direkt',
  },
  {
    cat: 'Other',
    brand: 'Spreads And Jam',
    name: 'SPREADS AND JAM',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Other',
    brand: 'Pepperidge Farm',
    name: 'Soft Baked Chunk',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Interspar',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Vanille',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Vanille Knuspino',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Eat Real',
    name: 'Veggie Straws (different varieties)',
    auth: 'KLBD',
    stamp: true,
    store: 'Billa',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Vollkorn',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'WAFFERS AND COOKIES',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Zarties Creamy Nougat',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Zarties Milky Vanilla',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Zitrone',
    auth: 'OU - Pat Akum',
    stamp: false,
    store: 'Billa, Spar, etc.',
  },
  {
    cat: 'Other',
    brand: "D'Arbo Darbo",
    name: 'container sizes',
    auth: 'OU',
    stamp: false,
    store: 'Spar, Billa',
  },
  {
    cat: 'Other',
    brand: 'Balconi',
    name: 'rollino Haselnuss',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Billa plus',
  },
];

// authority key
const auths = [...new Set(CERTS.map((c) => c.auth))].sort();
const keyEl = document.getElementById('authkey');
if (keyEl) {
  keyEl.innerHTML = auths
    .map(
      (a) =>
        `<span class="authchip">${esc(a)} <b>${CERTS.filter((c) => c.auth === a).length}</b></span>`,
    )
    .join('');
}

// group by category, preserving data order
const cats: string[] = [];
const byCat = new Map<string, Cert[]>();
for (const c of CERTS) {
  if (!byCat.has(c.cat)) {
    byCat.set(c.cat, []);
    cats.push(c.cat);
  }
  byCat.get(c.cat)?.push(c);
}

const host = document.getElementById('certified');
if (host) {
  host.innerHTML = cats
    .map((cat) => {
      const items = byCat.get(cat) ?? [];
      return `<section class="cgroup">
        <h2>${esc(cat)} <span style="color:var(--ink-faint);font-size:14px">${items.length}</span></h2>
        <div class="clist">
          ${items
            .map(
              (c) => `<div class="citem">
              <span>
                ${c.brand ? `<span class="cb">${esc(c.brand)}</span><br />` : ''}
                <span class="cn">${esc(c.name)}</span>
                ${c.stamp ? '<span class="stamp">needs the stamp</span>' : ''}
              </span>
              <span class="ca">${esc(c.auth)}</span>
              <span class="cs">📍 ${esc(c.store)}</span>
            </div>`,
            )
            .join('')}
        </div>
      </section>`;
    })
    .join('');
}

export {}; // isolate module scope
