// ===========================================================================
// certified.ts — renders certified.html: products with a REAL hechsher that
//   are sold in ordinary Austrian supermarkets (Billa/Spar/Hofer/Interspar/
//   MPreis). Extracted from Misrachi Austria's 2023 kosher guide, filtered to
//   (a) a major hechsher and (b) mainstream-store availability.
// This is PATH 1 — her normal standard. shop.html is the ingredient fallback.
// ===========================================================================

interface Cert {
  cat: string;
  brand?: string;
  name: string;
  auth: string;
  stamp: boolean; // only kosher WITH the imprinted symbol on that pack
  store?: string;
  page?: number; // page in the Misrachi PDF where this entry actually appears
  img?: string; // self-hosted product photo slug, if we found one
}

// Misrachi Austria's 2023 guide. #page=N jumps straight to the entry.
const PDF =
  'https://www.misrachi.at/images/pdf/kosherguide/Kosher%20Guide%20English%202023-06-15.pdf';

function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

const CERTS: Cert[] = [
  {
    cat: 'Plant milk & dairy-alt',
    name: 'Coconut Cuisine in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
    page: 18,
    img: 'coconut-cuisine-in-a-tetra-pak',
  },
  {
    cat: 'Plant milk & dairy-alt',
    name: 'Creamy Caramel Dessert in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
    page: 18,
    img: 'creamy-caramel-dessert-in-a-tetra-pak',
  },
  {
    cat: 'Plant milk & dairy-alt',
    name: 'Kokosnuss Original Kokosmilch in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
    page: 18,
    img: 'kokosnuss-original-kokosmilch-in-a-tetra-pak',
  },
  {
    cat: 'Plant milk & dairy-alt',
    name: 'Rice Cuisine in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
    page: 19,
    img: 'rice-cuisine-in-a-tetra-pak',
  },
  {
    cat: 'Plant milk & dairy-alt',
    name: 'Simply Vanille Dessert in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
    page: 19,
    img: 'simply-vanille-dessert-in-a-tetra-pak',
  },
  {
    cat: 'Plant milk & dairy-alt',
    name: 'Single Soya Cream in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
    page: 19,
    img: 'single-soya-cream-in-a-tetra-pak',
  },
  {
    cat: 'Plant milk & dairy-alt',
    name: 'Soja Joghurt Limette Zitrone in a cup',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar, Hofer',
    page: 20,
    img: 'soja-joghurt-limette-zitrone-in-a-cup',
  },
  {
    cat: 'Plant milk & dairy-alt',
    name: 'Soya Choco Geschmack in a Tetra Pak',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, Spar',
    page: 20,
    img: 'soya-choco-geschmack-in-a-tetra-pak',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Choco Krispies',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 46,
    img: 'kellogg-s-choco-krispies',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Choco Krispies Chocos',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 46,
    img: 'kellogg-s-choco-krispies-chocos',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Corn Flakes',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 46,
    img: 'kellogg-s-corn-flakes',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Crunchy Nut',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 46,
    img: 'kellogg-s-crunchy-nut',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Day Vita',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 46,
    img: 'kellogg-s-day-vita',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Fruit Loops',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 46,
    img: 'kellogg-s-fruit-loops',
  },
  {
    cat: 'Cereal',
    brand: 'Nature Valley',
    name: 'Müsliriegel',
    auth: 'OU',
    stamp: true,
    store: 'Billa, DM',
    page: 111,
    img: 'nature-valley-m-sliriegel',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Oger Mampf',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 47,
    img: 'kellogg-s-oger-mampf',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Rice Krispies',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 47,
    img: 'kellogg-s-rice-krispies',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Rice Krispies Multi-grain',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 47,
    img: 'kellogg-s-rice-krispies-multi-grain',
  },
  {
    cat: 'Cereal',
    brand: 'Nestle',
    name: 'Shreddies',
    auth: 'KLBD',
    stamp: false,
    store: 'Billa, M-Preis',
    page: 50,
    img: 'nestle-shreddies',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Smacks',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 47,
    img: 'kellogg-s-smacks',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'Special K Classic',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 47,
    img: 'kellogg-s-special-k-classic',
  },
  {
    cat: 'Cereal',
    brand: "Kellogg'S",
    name: 'W.K Kellog No Added Sugar Crunchy Müsli, different varieties',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 47,
  },
  {
    cat: 'Pasta & rice',
    brand: 'Side Dishes',
    name: 'Kichererbsen pasta gluten-free',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 100,
    img: 'side-dishes-kichererbsen-pasta-gluten-free',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Everest',
    name: 'Indischer Basmatireis weiß',
    auth: 'Star-K',
    stamp: false,
    store: 'Billa, Billa Plus, Metro und M-Preis',
    page: 97,
    img: 'everest-indischer-basmatireis-wei',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Everest',
    name: 'Premium Bio Basmati Reis',
    auth: 'Star-K',
    stamp: false,
    store: 'Billa, Billa Plus, Metro und M-Preis',
    page: 97,
    img: 'everest-premium-bio-basmati-reis',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Barilla',
    name: 'Pasta, different varieties',
    auth: 'Manchester Beth Din',
    stamp: true,
    store: 'Spar, Billa',
    page: 95,
  },
  {
    cat: 'Pasta & rice',
    brand: 'Garofalo',
    name: 'Rigatoni',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 97,
    img: 'garofalo-rigatoni',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Side Dishes',
    name: 'Rote Linsen pasta gluten-free',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 100,
    img: 'side-dishes-rote-linsen-pasta-gluten-free',
  },
  {
    cat: 'Pasta & rice',
    brand: 'Side Dishes',
    name: 'Yellow Lentil spaghetti gluten-free',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 100,
    img: 'side-dishes-yellow-lentil-spaghetti-gluten-free',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Curry Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
    page: 89,
    img: 'heinz-curry-ketchup',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Fiery Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
    page: 89,
    img: 'heinz-fiery-ketchup',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'HP BBQ Sweet & Spicy',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
    page: 90,
    img: 'heinz-hp-bbq-sweet-spicy',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Hot Chili Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
    page: 89,
    img: 'heinz-hot-chili-ketchup',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Jalapeno Chili Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
    page: 90,
    img: 'heinz-jalapeno-chili-ketchup',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Light Ketchup',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa plus',
    page: 90,
    img: 'heinz-light-ketchup',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Mayonnaise',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Maximarkt und Billa plus',
    page: 90,
    img: 'heinz-mayonnaise',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Mayonnaise Einfach lecker',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Billa',
    page: 90,
    img: 'heinz-mayonnaise-einfach-lecker',
  },
  {
    cat: 'Sauces & condiments',
    brand: 'Heinz',
    name: 'Worcester Sauce',
    auth: 'Manchester Beth Din',
    stamp: false,
    store: 'Metro, Billa und MPreis',
    page: 91,
    img: 'heinz-worcester-sauce',
  },
  {
    cat: 'Oil',
    brand: 'Carapelli',
    name: 'Olivenöl',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 81,
    img: 'carapelli-oliven-l',
  },
  {
    cat: 'Oil',
    brand: 'Sasso',
    name: 'Olivenöl (also Extra Vergine)',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 85,
  },
  {
    cat: 'Frozen',
    brand: 'Mccain',
    name: 'Frites 1-2-3 Original',
    auth: 'KLBD',
    stamp: false,
    store: 'Interspar',
    page: 98,
    img: 'mccain-frites-1-2-3-original',
  },
  {
    cat: 'Frozen',
    brand: 'Side Dishes',
    name: 'Frites Curly',
    auth: 'KLBD',
    stamp: false,
    store: 'Interspar',
    page: 99,
    img: 'side-dishes-frites-curly',
  },
  {
    cat: 'Snacks',
    brand: 'Eat Real',
    name: 'Hummus Chips',
    auth: 'KLBD',
    stamp: true,
    store: 'Billa',
    page: 108,
    img: 'eat-real-hummus-chips',
  },
  {
    cat: 'Snacks',
    brand: 'Eat Real',
    name: 'Lentil Chips',
    auth: 'KLBD',
    stamp: true,
    store: 'Billa',
    page: 108,
    img: 'eat-real-lentil-chips',
  },
  {
    cat: 'Snacks',
    brand: 'Mccain',
    name: 'Smiles Kartoffelchips',
    auth: 'KLBD',
    stamp: false,
    store: 'Interspar',
    page: 111,
    img: 'mccain-smiles-kartoffelchips',
  },
  {
    cat: 'Snacks',
    brand: 'Balconi',
    name: 'Snack al latte',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Billa plus',
    page: 128,
    img: 'balconi-snack-al-latte',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Wrigleys',
    name: 'Airwaves Gum Cherry Menthol',
    auth: 'KLBD, ORD',
    stamp: false,
    store: 'Billa, Spar',
    page: 51,
    img: 'wrigleys-airwaves-gum-cherry-menthol',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Wrigleys',
    name: 'Airwaves Gum Menthol and Eucalyptus',
    auth: 'KLBD, ORD',
    stamp: false,
    store: 'Billa, Spar',
    page: 51,
    img: 'wrigleys-airwaves-gum-menthol-and-eucalyptus',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Almond Dream',
    name: 'Choco ice vegan',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 66,
    img: 'almond-dream-choco-ice-vegan',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Pepperidge Farm',
    name: 'Chocolate Chunk Cookies Dark Chocolate Brownie',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Interspar',
    page: 0,
    img: 'pepperidge-farm-chocolate-chunk-cookies-dark-cho',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Pepperidge Farm',
    name: 'Chocolate Chunk Cookies White Chocolate Macadamia',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Interspar',
    page: 136,
    img: 'pepperidge-farm-chocolate-chunk-cookies-white-ch',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Waffers And Cookies',
    name: 'Quadratini Waffeln Dark Chocolate',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'M-Preis, Billa plus Direkt',
    page: 133,
    img: 'waffers-and-cookies-quadratini-waffeln-dark-choc',
  },
  {
    cat: 'Sweets & chocolate',
    brand: 'Waffers And Cookies',
    name: 'Schokolade Knuspino',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 134,
    img: 'waffers-and-cookies-schokolade-knuspino',
  },
  {
    cat: 'Ice cream',
    brand: 'Snickers',
    name: 'Ice Cream',
    auth: 'KLBD - Chalav Stam ICE CREAM',
    stamp: true,
    store: 'Billa plus, Penny Markt',
    page: 0,
    img: 'snickers-ice-cream',
  },
  {
    cat: 'Ice cream',
    brand: 'Almond Dream',
    name: 'Toffee Ice',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 123,
    img: 'almond-dream-toffee-ice',
  },
  {
    cat: 'Drinks',
    brand: 'Vita',
    name: 'Coco Coconut Water',
    auth: 'Star-K',
    stamp: true,
    store: 'Spar, Interspar',
    page: 40,
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Apfel / Apple / Pomme',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 114,
    img: 'taste-of-nature-apfel-apple-pomme',
  },
  {
    cat: 'Other',
    brand: "D'Arbo Darbo",
    name: 'Attention: Not Wald- Fichten- & Tannenhonig)',
    auth: 'OU',
    stamp: false,
    store: 'Spar, Billa',
    page: 120,
    img: 'd-arbo-darbo-attention-not-wald-fichten-tannenho',
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Brazil Nut / Noix de Brésil',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 115,
    img: 'taste-of-nature-brazil-nut-noix-de-br-sil',
  },
  {
    cat: 'Other',
    brand: 'Roobar',
    name: 'Cacao Nibs',
    auth: 'KLBD',
    stamp: true,
    store: 'Libro, Spar',
    page: 112,
    img: 'roobar-cacao-nibs',
  },
  {
    cat: 'Other',
    brand: 'Roobar',
    name: 'Chia Coconut - Riegel',
    auth: 'KLBD',
    stamp: true,
    store: 'Libro, Spar',
    page: 112,
    img: 'roobar-chia-coconut-riegel',
  },
  {
    cat: 'Other',
    brand: 'Manner',
    name: 'Cocos',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 133,
    img: 'manner-cocos',
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Cranberry / Canneberges',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 115,
    img: 'taste-of-nature-cranberry-canneberges',
  },
  {
    cat: 'Other',
    brand: 'The Jelly Bean Factory',
    name: 'Fruit Cocktail',
    auth: 'OU',
    stamp: true,
    store: 'Hofer',
    page: 0,
    img: 'the-jelly-bean-factory-fruit-cocktail',
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Goji',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 116,
    img: 'taste-of-nature-goji',
  },
  {
    cat: 'Other',
    brand: 'The Jelly Bean Factory',
    name: 'Gourmet Beans',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 126,
    img: 'the-jelly-bean-factory-gourmet-beans',
  },
  {
    cat: 'Other',
    brand: 'Loacker',
    name: 'Gran Pasticceria Classic Waffeln Cremkakao',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
    page: 131,
    img: 'loacker-gran-pasticceria-classic-waffeln-cremkak',
  },
  {
    cat: 'Other',
    brand: 'Loacker',
    name: 'Gran Pasticceria Classic Waffeln Napolitaner',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
    page: 131,
    img: 'loacker-gran-pasticceria-classic-waffeln-napolit',
  },
  {
    cat: 'Other',
    brand: 'Loacker',
    name: 'Gran Pasticceria Classic Waffeln Vanille',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
    page: 131,
    img: 'loacker-gran-pasticceria-classic-waffeln-vanille',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Gran Pasticceria Coconut White',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Interspar, Eurospar',
    page: 132,
    img: 'waffers-and-cookies-gran-pasticceria-coconut-whi',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Gran Pasticceria Noisette',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
    page: 132,
    img: 'waffers-and-cookies-gran-pasticceria-noisette',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Gran Pasticceria Tortina Dark Noir',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'M-Preis, Billa plus Direkt',
    page: 132,
    img: 'waffers-and-cookies-gran-pasticceria-tortina-dar',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Gran Pasticceria Tortina White',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
    page: 133,
    img: 'waffers-and-cookies-gran-pasticceria-tortina-whi',
  },
  {
    cat: 'Other',
    brand: "Bertie Bott'S Beans",
    name: 'Harry Potter, different varieties',
    auth: 'OU',
    stamp: true,
    store: 'Hofer',
    page: 123,
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Haselnuss Knuspino',
    auth: 'OU - Pat Akum',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 134,
    img: 'waffers-and-cookies-haselnuss-knuspino',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Haselnuss Mignon',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 134,
    img: 'waffers-and-cookies-haselnuss-mignon',
  },
  {
    cat: 'Other',
    brand: 'Roobar',
    name: 'Hemp & Chia',
    auth: 'KLBD',
    stamp: true,
    store: 'Libro, Spar',
    page: 112,
    img: 'roobar-hemp-chia',
  },
  {
    cat: 'Other',
    brand: "D'Arbo Darbo",
    name: 'Himbeere, Kirsche, Waldbeeren, Tropic, Hagebutte-Acerola)',
    auth: 'OU',
    stamp: false,
    store: 'Spar, Billa',
    page: 120,
    img: 'd-arbo-darbo-himbeere-kirsche-waldbeeren-tropic-',
  },
  {
    cat: 'Other',
    brand: 'Taste Of Nature',
    name: 'Kokosnuss / Coconut / Noix de coco',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 116,
    img: 'taste-of-nature-kokosnuss-coconut-noix-de-coco',
  },
  {
    cat: 'Other',
    brand: 'Balconi',
    name: 'Merendina Milchschnitte',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Billa plus',
    page: 128,
    img: 'balconi-merendina-milchschnitte',
  },
  {
    cat: 'Other',
    brand: 'Balconi',
    name: 'Mix Max',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Billa',
    page: 128,
    img: 'balconi-mix-max',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Original Neapolitaner ("Mannerschnitten")',
    auth: 'OU - Pat Akum',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 134,
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Quadratini Waffeln Napolitaner',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'M-Preis, Billa plus Direkt',
    page: 133,
    img: 'waffers-and-cookies-quadratini-waffeln-napolitan',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Quadratini Waffeln Vanille',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'M-Preis, Billa plus Direkt',
    page: 133,
    img: 'waffers-and-cookies-quadratini-waffeln-vanille',
  },
  {
    cat: 'Other',
    brand: 'Spreads And Jam',
    name: 'SPREADS AND JAM',
    auth: 'OU',
    stamp: true,
    store: 'Billa',
    page: 121,
  },
  {
    cat: 'Other',
    brand: 'Pepperidge Farm',
    name: 'Soft Baked Chunk',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Interspar',
    page: 136,
    img: 'pepperidge-farm-soft-baked-chunk',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Vanille',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 134,
    img: 'waffers-and-cookies-vanille',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Vanille Knuspino',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 134,
    img: 'waffers-and-cookies-vanille-knuspino',
  },
  {
    cat: 'Other',
    brand: 'Eat Real',
    name: 'Veggie Straws (different varieties)',
    auth: 'KLBD',
    stamp: true,
    store: 'Billa',
    page: 108,
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Vollkorn',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 135,
    img: 'waffers-and-cookies-vollkorn',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'WAFFERS AND COOKIES',
    auth: 'OU - Chalav Stam',
    stamp: false,
    store: 'Billa, Interspar, Eurospar, M-Preis',
    page: 132,
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Zarties Creamy Nougat',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 135,
    img: 'waffers-and-cookies-zarties-creamy-nougat',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Zarties Milky Vanilla',
    auth: 'OU - Pat Akum - Chalav Stam',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 135,
    img: 'waffers-and-cookies-zarties-milky-vanilla',
  },
  {
    cat: 'Other',
    brand: 'Waffers And Cookies',
    name: 'Zitrone',
    auth: 'OU - Pat Akum',
    stamp: false,
    store: 'Billa, Spar, etc.',
    page: 135,
    img: 'waffers-and-cookies-zitrone',
  },
  {
    cat: 'Other',
    brand: "D'Arbo Darbo",
    name: 'container sizes',
    auth: 'OU',
    stamp: false,
    store: 'Spar, Billa',
    page: 120,
    img: 'd-arbo-darbo-container-sizes',
  },
  {
    cat: 'Other',
    brand: 'Balconi',
    name: 'rollino Haselnuss',
    auth: 'OU - Chalav Stam',
    stamp: true,
    store: 'Billa plus',
    page: 128,
    img: 'balconi-rollino-haselnuss',
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
function render(q: string): void {
  const needle = q.trim().toLowerCase();
  const match = (c: Cert): boolean =>
    !needle ||
    [c.name, c.brand ?? '', c.auth, c.store ?? '', c.cat].join(' ').toLowerCase().includes(needle);
  let shown = 0;
  if (!host) return;
  host.innerHTML = cats
    .map((cat) => {
      const items = (byCat.get(cat) ?? []).filter(match);
      if (!items.length) return '';
      shown += items.length;
      return `<section class="cgroup">
        <h2>${esc(cat)} <span style="color:var(--ink-faint);font-size:14px">${items.length}</span></h2>
        <div class="clist">
          ${items
            .map(
              (c) => `<div class="citem${c.img ? ' has-img' : ''}">
              ${
                c.img
                  ? `<span class="cph"><img src="certified/${esc(c.img)}.jpg" alt="${esc(c.name)}" loading="lazy" /></span>`
                  : ''
              }
              <span class="cmain">
                ${c.brand ? `<span class="cb">${esc(c.brand)}</span><br />` : ''}
                <span class="cn">${esc(c.name)}</span>
                ${c.stamp ? '<span class="stamp">needs the stamp</span>' : ''}
                ${c.store ? `<span class="cs">📍 ${esc(c.store)}</span>` : ''}
                ${
                  c.page
                    ? `<a class="csrc" href="${PDF}#page=${c.page}" target="_blank" rel="noopener">📄 See it in Misrachi's guide — p.${c.page} →</a>`
                    : ''
                }
              </span>
              <span class="ca">${esc(c.auth)}</span>
            </div>`,
            )
            .join('')}
        </div>
      </section>`;
    })
    .join('');

  const countEl = document.getElementById('count');
  if (countEl) {
    countEl.textContent = needle
      ? `${shown} of ${CERTS.length} products match “${q.trim()}”`
      : `${CERTS.length} certified products`;
  }
  if (needle && shown === 0) {
    host.innerHTML =
      '<p class="noresult">Nothing matches that. Try a brand (Kellogg, Alpro, Heinz), a food (ketchup, oil, rice), a store (Billa, Spar), or an agency (OU, KLBD).</p>';
  }
}

const qEl = document.getElementById('q');
if (qEl instanceof HTMLInputElement) {
  qEl.addEventListener('input', () => render(qEl.value));
}
render('');

export {}; // isolate module scope
