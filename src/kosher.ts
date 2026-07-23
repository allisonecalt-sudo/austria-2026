// ===========================================================================
// kosher.ts — renders kosher.html: the Kosher-by-Ingredient field guide.
//
// What: a self-catering kosher field guide for the Austria trip. Two paths —
//   (1) CERTIFIED: the hechshers Misrachi Austria accepts + a curated set of
//   certified products in Billa/Spar (© Misrachi, summarized + linked, not
//   reproduced); (2) INGREDIENTS: traffic-light triage — hard stops, a German
//   label lookup (search + filter), an always-fine grab list, and every aisle
//   with real products + the why. All data is static (no Supabase, no PII).
// Why: Allison + Avital keep kosher; the rural Salzkammergut has no local
//   hechsher, so this is the pre-plan + in-aisle reference.
// ===========================================================================

type Flag = 'go' | 'read' | 'stop';
type ItemStatus = 'go' | 'read-label' | 'stop';
type Verdict = 'mostly-green' | 'read-the-label' | 'mostly-avoid';

interface GlossTerm {
  de: string;
  en: string;
  f: Flag;
}
interface GrabItem {
  n: string;
  de: string;
  w: string;
}
interface Cert {
  name: string;
  auth: string;
  where: string;
}
interface HardStop {
  title: string;
  he: string;
  d: string;
}
interface AisleItem {
  name: string;
  status: ItemStatus;
  why: string;
  whereFound: string;
}
interface Aisle {
  category: string;
  verdict: Verdict;
  theWhy: string;
  special: string;
  items: AisleItem[];
}

// ---------- helpers ----------
function esc(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
function mount(id: string, html: string): void {
  const node = document.getElementById(id);
  if (node) node.innerHTML = html;
}

// ---------- data: accepted hechshers (Misrachi, guide p.12) ----------
const HECHSHERS: string[] = [
  'OU',
  'OK',
  'Star-K',
  'KOF-K',
  'KLBD',
  'cRc (Chicago)',
  'Manchester Beth Din',
  'Triangle-K',
  'KF-Kosher',
  'KSA',
  'SKA',
  'Kosher Australia',
  'Beth Din Johannesburg',
  'Schomrej HaDat Antwerpen',
  'Rav Weissmandl',
];

// ---------- data: curated certified products (© Misrachi, 2023 ed.) ----------
const CERTLIST: Cert[] = [
  {
    name: 'Alpro plant milks — Coconut, Almond (Mandel), Soya Cuisine, Rice, Kokosmilch',
    auth: 'KLBD',
    where: 'Billa · Spar',
  },
  {
    name: 'Alpro Soja Caramel + Kalzium',
    auth: 'Schomrej HaDat Antwerpen · Parve — only with the imprinted stamp',
    where: 'Spar Gourmet',
  },
  {
    name: "Kellogg's cereals — Corn Flakes, Choco Krispies, Crunchy Nut, Fruit Loops",
    auth: 'Manchester Beth Din — only with the imprinted stamp',
    where: 'Spar · Billa',
  },
  {
    name: 'Bonduelle canned veg — peas, green beans, mushrooms, mixed veg',
    auth: 'Rabbi N. Rotenberg, Vienna',
    where: 'Billa',
  },
];

// ---------- data: the five hard stops ----------
const STOPS: HardStop[] = [
  {
    title: 'Cheese',
    he: 'גבינת עכו״ם',
    d: 'Needs a Jew involved in the make — independent of the rennet. All cheese, even a label reading only “Milch, Salz, Lab.”',
  },
  {
    title: 'Wine & grape',
    he: 'סתם יינם',
    d: 'Wine, grape juice, wine vinegar, balsamic, brandy — and grape sneaking in as a sweetener or color.',
  },
  {
    title: 'Meat & poultry',
    he: 'שחיטה',
    d: 'Needs kosher slaughter. Also watch broths, lard, animal fat hiding in processed foods.',
  },
  {
    title: 'Gelatin',
    he: "ג'לטין",
    d: 'The word “Gelatine” on the label (no E-number in the EU). Almost always pork / non-kosher beef. Not nullified even in tiny amounts.',
  },
  {
    title: 'Carmine',
    he: 'כרמין',
    d: "“Karmin” / “Echtes Karmin” — red dye from insects. In pink/red candy, drinks, fruit yogurt. Can't be nullified (it colors).",
  },
];

// ---------- data: German glossary ----------
const GLOSS: GlossTerm[] = [
  {
    de: 'Gelatine · Speisegelatine',
    en: 'Gelatin — animal (pig/cow) hide & bone. The WORD, no E-number in the EU. Not nullified.',
    f: 'stop',
  },
  { de: 'Schweinegelatine', en: 'Pork gelatin — explicitly pig.', f: 'stop' },
  {
    de: 'Karmin · Echtes Karmin · Cochenille · Karminsäure',
    en: "Carmine (E120) — red dye from insects. Colors, so can't be nullified.",
    f: 'stop',
  },
  {
    de: 'Schweineschmalz · Schweinefett · Speck',
    en: 'Lard / pork fat / bacon fat — non-kosher.',
    f: 'stop',
  },
  {
    de: 'Tierisches Fett · Rindertalg · Talg',
    en: 'Animal fat / beef tallow — meat, needs shechita.',
    f: 'stop',
  },
  {
    de: 'Tierisches Lab',
    en: 'Animal rennet (in cheese) — non-kosher; and cheese is a stop regardless.',
    f: 'stop',
  },
  {
    de: 'Käse · Hartkäse',
    en: 'Cheese / hard cheese — gevinat akum, not usable uncertified even with a clean label.',
    f: 'stop',
  },
  {
    de: 'Wein · Weinessig · Weinbrand · Sekt',
    en: 'Wine / wine vinegar / brandy / sparkling — grape (stam yeinam).',
    f: 'stop',
  },
  {
    de: 'Traubensaft · Traubenmost · Traubenextrakt',
    en: 'Grape juice / must / extract — stam yeinam, even as a sweetener or color.',
    f: 'stop',
  },
  {
    de: 'Balsamico · Aceto Balsamico',
    en: 'Balsamic vinegar — grape must, virtually unverifiable uncertified.',
    f: 'stop',
  },
  {
    de: 'Molke · Molkenpulver · Süßmolke',
    en: 'Whey - dairy. Gil: fine if you rely on chalav stam; its cheese origin is not a separate problem.',
    f: 'go',
  },
  {
    de: 'Milcheiweiß · Magermilchpulver · Milchpulver',
    en: 'Milk protein / milk powder - dairy, fine under chalav stam (Gil confirmed).',
    f: 'go',
  },
  {
    de: 'Aroma · Natürliches Aroma',
    en: 'Flavoring - the black box; the source is not disclosed. Gil did not know the term, so it was re-asked. Treat as unknown for now.',
    f: 'read',
  },
  {
    de: 'Mono- und Diglyceride (E471) · Ester (E472a–f)',
    en: 'Emulsifiers - EU law does NOT require the origin to be declared, so the label will never tell you. Only a V-Label vegan mark or an explicit pflanzlichen Ursprungs statement resolves it. E570/E572/E491-495 are the weaker cases.',
    f: 'read',
  },
  {
    de: 'Speisefettsäuren · Fettsäuren',
    en: '“Edible fatty acids” — the tell-tale root: fat-derived, plant or animal.',
    f: 'read',
  },
  {
    de: 'Natrium-/Calciumstearoyllactylat (E481/E482)',
    en: 'Stearoyl lactylates — stearic acid can be animal. Dough conditioner.',
    f: 'read',
  },
  {
    de: 'Stearinsäure (E570) · Magnesiumstearat (E572)',
    en: 'Stearic acid / magnesium stearate — plant or animal.',
    f: 'read',
  },
  {
    de: 'Glycerin (E422)',
    en: 'Glycerol — animal, vegetable or petroleum; unverifiable from the label.',
    f: 'read',
  },
  {
    de: 'L-Cystein (E920)',
    en: 'Dough conditioner in bakery — from feathers/hair. Prefer bread without it (Bio bread bans it).',
    f: 'read',
  },
  {
    de: 'Schellack (E904)',
    en: 'Shellac glaze on candy/coated fruit. NOTE: OU, Star-K & cRc PERMIT it — an edge case, not a hard stop.',
    f: 'read',
  },
  {
    de: 'Lab · Mikrobielles Lab',
    en: 'Rennet. Microbial/plant is fine as an ingredient — but hard cheese is still gevinat akum.',
    f: 'read',
  },
  { de: 'Farbstoff', en: 'Coloring (generic) — check which one; Karmin is the trap.', f: 'read' },
  {
    de: 'Überzugsmittel · gewachst · mit Wachs',
    en: 'Glazing agent / waxed — a coating on candy, nuts, coated fruit (could be shellac).',
    f: 'read',
  },
  {
    de: 'Vitamin D3 (Cholecalciferol)',
    en: 'Usually lanolin, sometimes fish — widely treated as fine/pareve; strict readers check.',
    f: 'read',
  },
  {
    de: 'Fruchtzubereitung',
    en: '“Fruit preparation” — bundles possible carmine, Aroma and grape juice. On fruit yogurts.',
    f: 'read',
  },
  {
    de: 'Kann Spuren von … enthalten',
    en: 'May contain traces of ... - Gil: an allergy warning, not a kashrut issue, as long as milk is not an actual ingredient. Stop reading these.',
    f: 'go',
  },
  {
    de: 'Bio',
    en: 'Organic — a farming label with NO bearing on kosher status. (Bonus: Bio bans L-Cystein, so a Bio loaf sidesteps that one.)',
    f: 'read',
  },
  { de: 'Zutaten', en: '“Ingredients” — the label heading to find and read.', f: 'go' },
  {
    de: 'vegan · V-Label (Vegan)',
    en: 'The V-Label VEGAN mark is audited and explicitly covers additives, carriers, aromas, enzymes and processing aids - the single most useful mark on a pack. A bare vegan text claim has no EU legal definition, so prefer the V-Label.',
    f: 'go',
  },
  {
    de: 'Sojalecithin · Sonnenblumenlecithin (E322)',
    en: 'Soy/sunflower lecithin — plant, fine. (Kitniyot on Pesach only.)',
    f: 'go',
  },
  {
    de: 'Citronensäure (E330)',
    en: 'Citric acid — fermentation from sugar/corn, not citrus or animal. Fine.',
    f: 'go',
  },
  {
    de: 'Weinsäure · Weinstein · Kaliumbitartrat',
    en: 'Tartaric acid / cream of tartar — grape-origin but ruled KOSHER by OU & cRc. Over-worried.',
    f: 'go',
  },
  {
    de: 'Pektin (E440)',
    en: 'Pectin — from apple/citrus peel. Plant, fine. (Common in pectin-set fruit gums.)',
    f: 'go',
  },
  { de: 'Riboflavin (E101)', en: 'Vitamin B2 — fermentation-derived, fine.', f: 'go' },
  {
    de: 'Kurkuma · Chlorophyll · Beta-Carotin · Paprikaextrakt · Rote Bete · Anthocyane',
    en: 'Plant colorings (E100/E140/E160a/E160c/E162/E163) — fine.',
    f: 'go',
  },
  {
    de: 'Branntweinessig · Apfelessig',
    en: 'Distilled / apple-cider vinegar — NOT grape. The safe vinegar to reach for.',
    f: 'go',
  },
  {
    de: 'bestehend aus raffinierten Olivenölen und nativen Olivenölen',
    en: 'The refined "pure" olive-oil grade - it HAS been through the refinery/deodoriser. Every agency requires a hechsher on this. Not the same as Natives Olivenöl extra.',
    f: 'stop',
  },
  {
    de: 'Oliventresteröl',
    en: 'Olive POMACE oil - hexane-extracted from the leftover solids, then refined. The worst of the olive family; needs certification.',
    f: 'stop',
  },
  {
    de: 'Sonnenblumenöl · Rapsöl · Kürbiskernöl · Leinöl · Kokosöl',
    en: 'Seed/other oils - NONE are on any agency no-hechsher list, because of refining (the deodoriser). Cold-pressed versions look like they should qualify but no agency has said so. Includes the Austrian pumpkin-seed oil.',
    f: 'read',
  },
  {
    de: 'Natives Olivenöl extra',
    en: 'Extra-virgin olive oil - the ONLY oil any agency clears uncertified (OU, cRc, OK Kosher). Cold-pressed, never refined. Star-K and KLBD do not join. Must be pure - not infused/flavoured.',
    f: 'go',
  },
  {
    de: 'Pflanzenöl · Sonnenblumenöl · Rapsöl',
    en: 'Vegetable / sunflower / canola oil — plant, fine.',
    f: 'go',
  },
  {
    de: 'Backhefe · Hefe',
    en: "Baker's yeast — fine. (Hefeextrakt = yeast extract, usually fine but a flavor carrier — read.)",
    f: 'go',
  },
  {
    de: 'Joghurtkulturen · Milchsäurekulturen',
    en: 'Yogurt / lactic cultures — sets yogurt, no rennet. Fine.',
    f: 'go',
  },
  {
    de: 'Johannisbrotkernmehl · Guarkernmehl · Stärke',
    en: 'Locust-bean gum / guar gum / starch — plant thickeners, fine.',
    f: 'go',
  },
  {
    de: 'Milch · Sahne · Rahm · Butter · Naturjoghurt',
    en: 'Dairy — kosher-ingredient and usable under chalav stam. RED only if you require chalav yisrael.',
    f: 'go',
  },
];

// ---------- data: always-fine grab list ----------
const GRAB: GrabItem[] = [
  {
    n: 'Fresh fruit & veg',
    de: 'Obst & Gemüse',
    w: 'Kosher by nature. Inspect leafy greens, broccoli/cauliflower & berries for insects.',
  },
  { n: 'Eggs', de: 'Eier', w: 'Fine — check for blood spots.' },
  {
    n: 'Raw grains, rice, oats',
    de: 'Reis · Haferflocken',
    w: 'Plain, no seasoning; insect-check rice/flour.',
  },
  { n: 'Dried beans & lentils', de: 'Hülsenfrüchte', w: 'Plain, uncertified fine.' },
  { n: 'Plain durum pasta', de: 'Hartweizengrieß', w: 'Semolina + water. Watch “Ei” (egg pasta).' },
  {
    n: 'Sugar & salt',
    de: 'Zucker · Salz',
    w: "On every agency's no-hechsher list (not for Pesach).",
  },
  {
    n: 'Extra-virgin olive oil',
    de: 'Natives Olivenöl extra',
    w: 'Single-ingredient, cold-pressed.',
  },
  { n: 'Pure honey', de: 'Reiner Honig', w: 'Unflavored only.' },
  {
    n: 'Plain coffee & tea',
    de: 'Kaffee · Tee',
    w: 'Unflavored. Flavored versions need a hechsher.',
  },
  { n: 'Nuts (raw)', de: 'Nüsse', w: 'Plain, unroasted/unglazed.' },
];

// ---------- data: aisles (from verified round-2 research) ----------
const AISLES: Aisle[] = [
  {
    category: 'Bread & bakery',
    verdict: 'mostly-green',
    theWhy:
      'This is the single cleanest aisle in the store for an ingredient-based reader: a plain rustic Austrian loaf is literally flour, water, sourdough/yeast, and salt — nothing to worry about, and the two big supermarket own-brands…',
    special:
      "PAS PALTER vs PAS YISRAEL — the rule unique to bread. Bread baked entirely by a non-Jew is either pas palter (from a commercial bakery — the supermarket case) or pas akum (baked privately in a non-Jew's home — essentially never usable).",
    items: [
      {
        name: 'Plain rustic rye / sourdough loaf — e.g. SPAR Natur*pur Bio-Roggen-Vollkornbrot (500g)',
        status: 'go',
        why: 'The cleanest food in the whole supermarket. Verified ingredients: rye wholegrain, water, 24% natural sourdough (rye + water), sea salt, yeast — nothing else.',
        whereFound: 'Spar / Eurospar / Interspar packaged bread shelf;',
      },
      {
        name: 'Bakery-counter rustic breads — Bauernbrot, Roggenbrot, Vollkornbrot, Mischbrot, Landbrot',
        status: 'go',
        why: "Traditional Austrian loaves are rye/wheat/water/sourdough/salt/yeast — the pas palter staple. Caveat vs packaged: loose counter bread often has NO ingredient list, so you can't verify…",
        whereFound: 'In-store bakery counter (Backshop) at…',
      },
      {
        name: 'Ölz Toast & Sandwich range — Sandwich Toast, Riesen Toast, Mehrkorn Toast, Vollkorn Soft Sandwich',
        status: 'go',
        why: 'Ölz states its entire toast & sandwich line is 100% plant-based and carries the V-Label vegan mark.',
        whereFound: 'Billa, Spar, Hofer, Lidl — packaged sliced-bread shelf.',
      },
      {
        name: 'Ölz vegan toast line + any Bio loaf',
        status: 'go',
        why: 'V-Label vegan = audited zero animal ingredients, clears dairy/E920/lard in one glance. (Skip the deli vegan brands here — those are meat-substitutes, not bread.)',
        whereFound: 'Own-brand vegan sections across the chains',
      },
      {
        name: 'Packaged white/soft Toastbrot and sandwich bread (generic / Clever / S-Budget lines)',
        status: 'read-label',
        why: "Soft white bread is where dough conditioners and dairy hide. Scan for Molke/Milcheiweiss (→ makes it dairy), Emulgatoren/E471, and especially L-Cystein/E920 (can be animal, label won't…",
        whereFound: 'Sliced-bread shelf, all chains',
      },
      {
        name: 'Ölz Milchbrötle (mit Butter / mit Rosinen / mit Schokolade) and generic Milchbrötchen / Milchsemmeln',
        status: 'read-label',
        why: 'These ARE dairy by design. Verified (Milchbrötle mit Butter): wheat flour, sugar, whole milk 10%, butter 8%, whole egg, wheat gluten, emulsifiers, yeast, salt, natural flavor, carotene…',
        whereFound: "Billa/Spar sweet-roll shelf; 'Milch'-named rolls",
      },
      {
        name: 'Croissants, Plundergebäck, Kipferl and other pastries (bakery counter)',
        status: 'read-label',
        why: 'Butter versions are dairy (chalav-stam-usable); the watch-items are margarine with undisclosed Aroma, animal-source emulsifiers, and — on glazed or filled sweet pastries — the rare but…',
        whereFound: 'Bakery counter and packaged pastry shelf',
      },
      {
        name: 'Kletzenbrot / Früchtebrot (dried-fruit holiday loaf) and other specialty/regional breads',
        status: 'read-label',
        why: "Rich fruit breads are usually pareve and fine, but they're exactly the category that can carry Aroma, sometimes a spirit/liqueur soak, or animal fat in older recipes — read the list.",
        whereFound: 'Seasonal/specialty bread shelf (more common autumn/winter,…',
      },
    ],
  },
  {
    category: 'Crackers & crispbread',
    verdict: 'mostly-green',
    theWhy:
      'This is one of the easiest aisles on the whole trip. Scandinavian-style crispbread (Knäckebrot) is often just rye/wheat flour + yeast + salt, and plain rice cakes are rice + salt — both fully pareve with nothing to flag.',
    special:
      'Pas/pat is NOT a barrier here: crispbread and crackers are commercial baked goods, and pas palter (bread from a commercial gentile bakery) is widely relied on by MO — most poskim treat crackers/crispbread even more leniently since they generally aren\'t "bread" requiring hamotzi.',
    items: [
      {
        name: 'Wasa Original / Vollkorn Roggen (rye crispbread)',
        status: 'go',
        why: 'Three ingredients only: Roggenvollkornmehl (rye wholegrain flour), Hefe (yeast), Salz. Fully pareve, no flags. The cleanest thing in the aisle.',
        whereFound: 'Spar, Billa, Interspar — Wasa is widely stocked across…',
      },
      {
        name: 'Wasa Roggen Traditionell (sourdough variety)',
        status: 'read-label',
        why: "Base is clean (rye, sourdough, yeast, barley-malt extract = all fine) BUT adds 'Emulgator: Mono- und Diglyceride von Speisefettsäuren' (E471) — the classic yellow plant-OR-animal call.",
        whereFound: 'Spar, Billa, Interspar',
      },
      {
        name: 'Wasa Sesam (sesame crispbread)',
        status: 'go',
        why: "Wheat flour, whole-grain wheat, sesame, yeast, rapeseed oil, sugar, salt — all pareve, no emulsifier. Label says 'kann Spuren von Milch enthalten' (may contain traces of milk);",
        whereFound: 'Spar, Billa',
      },
      {
        name: 'SPAR Reiswaffeln Meersalz / plain rice cakes (own-brand)',
        status: 'go',
        why: 'Ingredients: rice + sea salt (0.2%). Pareve, nothing to flag. Same for SPAR Natur*pur Bio-Reiswaffeln Multikorn (rice, millet, corn, sesame — all plant).',
        whereFound: 'Spar / Eurospar / Interspar',
      },
      {
        name: 'Hofer/Aldi Reiswaffeln + Lidl Reiswaffeln mit Salz (own-brand rice cakes)',
        status: 'go',
        why: "Hofer/Aldi = 50% white + 50% wholegrain rice; Lidl = rice 98.7% + sesame + salt 0.3%. Pareve. Only allergen note is 'may contain traces of sesame' — not a kashrut issue.",
        whereFound: 'Hofer, Lidl',
      },
      {
        name: 'Brandt Zwieback (Markenzwieback)',
        status: 'read-label',
        why: "Contains Süßmolkenpulver (sweet whey powder) + Kondensmagermilch (condensed skim milk) = DAIRY. Usable under chalav stam (fine for most MO) but it is NOT pareve — don't eat with meat.",
        whereFound: 'Spar, Billa, dm — the standard German Zwieback brand,…',
      },
      {
        name: 'Chocolate / yogurt-coated rice cakes (SPAR Reiswaffeln Milchschokolade, Schoko-Reiswaffeln, Jogurt-Reiswaffeln, Verival Bio)',
        status: 'read-label',
        why: 'The rice base is fine, but the milk-chocolate or yogurt coating (Vollmilchpulver / Molkenpulver) makes them DAIRY = chalav stam (fine for most MO, not pareve).',
        whereFound: 'Spar (own-brand + Verival)',
      },
      {
        name: "Cheese-flavored crispbread — Wasa Sandwich Cheese & Chives, Wasa Sandwich Mild Cheese, any 'Käse' Knäckebrot",
        status: 'stop',
        why: 'Contains Käsepulver (cheese powder) — this is real cheese, so gevinas akum applies. Uncertified cheese is a hard stop regardless of how clean the rest of the label reads.',
        whereFound: 'Spar, Billa (also Amazon.de); may be rarer in small rural…',
      },
    ],
  },
  {
    category: 'Pasta, rice & grains',
    verdict: 'mostly-green',
    theWhy:
      'This is the single easiest ingredient-kashrut aisle in an Austrian supermarket: the staples are one or two ingredients you can read in a second.',
    special:
      "Three grain-aisle-specific rules on top of the general flags: (1) INSECT CHECK (bedikat tola'im) — rice, lentils, dried beans, flour, quinoa and grains are classic infestation items; sift/spread on a plate and look before cooking, this is the real practical mitzvah here, not the label.",
    items: [
      {
        name: 'Dry durum pasta — spaghetti/penne/fusilli (Hartweizengrieß + Wasser)',
        status: 'go',
        why: "The classic clean item: ingredient list is literally 'Hartweizengrieß, Wasser' — a single grain plus water, no animal derivatives, no dairy. This is a buy-freely staple.",
        whereFound: 'Spar/Eurospar/Interspar (SPAR Pasta Italiana, S-Budget),…',
      },
      {
        name: 'Egg pasta — Bandnudeln / Eiernudeln / Spätzle (contains Ei/Hühnerei)',
        status: 'go',
        why: "Flags the RED-for-attention word 'Ei/Eier/Hühnerei' — but chicken eggs are kosher, so ingredient-wise these are fine for Modern Orthodox.",
        whereFound: 'Spar (S-Budget Bandnudeln), Hofer, Billa, dm — most…',
      },
      {
        name: 'Fresh chilled filled pasta — Ravioli / Tortellini / Cappelletti (Kühlregal)',
        status: 'stop',
        why: 'Hard stop uncertified: the filling is cheese (gevinas akum — no clean-label workaround) and very often also meat/ham (shechita).',
        whereFound: "Refrigerated section, all chains (Spar, Billa 'Bella…",
      },
      {
        name: 'Plain couscous & bulgur (Hartweizengrieß only)',
        status: 'go',
        why: "Plain couscous is just steamed durum semolina — single ingredient. Verified: S-Budget Couscous = 'Hartweizengrieß';",
        whereFound: 'Spar (S-Budget, Natur*pur Bio), Hofer, Lidl, dm (dmBio),…',
      },
      {
        name: 'Flavored / vegetable couscous (Gemüse-Couscous with Gewürzzubereitung + Aroma)',
        status: 'read-label',
        why: "The seasoning turns a green item yellow. Verified example: SPAR Natur*pur Bio-Gemüse-Couscous = 91% Hartweizengrieß + 6% dried vegetables + a 'Gewürzzubereitung' (spice prep).",
        whereFound: 'Spar (Natur*pur Gemüse-Couscous), plus boxed couscous mixes…',
      },
      {
        name: 'Plain rice — white, basmati, parboiled, Arborio/risotto rice',
        status: 'go',
        why: 'Single ingredient (rice). White, basmati, jasmine, parboiled, and plain risotto rice are all buy-freely. Insect-check the grains and avoid Israeli origin (tithing/shmita).',
        whereFound: 'All chains — Spar (S-Budget, Natur*pur), Hofer, Lidl,…',
      },
      {
        name: 'Risotto mixes & flavored rice pots (Knorr Risotto, boxed rice dinners)',
        status: 'read-label',
        why: "Flavored risotto and boxed rice dinners routinely list 'Hartkäse/Käse' (cheese = gevinas akum, a stop) and/or 'Aroma', whey, milk powder. Many are effectively a stop;",
        whereFound: 'Knorr Risotto range + own-brand rice dinners at Spar,…',
      },
      {
        name: 'Instant noodle / rice pots & cups (Maggi 5-Minuten-Terrine, Asian instant cups)',
        status: 'stop',
        why: "The seasoning is built from meat and dairy. Verified: Maggi 5-Minuten-Terrine Hühner-Nudeltopf lists 6.2% chicken meat + chicken fat (Hühnerfett) + 'natürliches Aroma' and 'may contain…",
        whereFound: 'Snack/instant shelf at Spar, Billa, Hofer, Lidl;',
      },
      {
        name: 'Dried legumes — lentils, chickpeas, beans, split peas (getrocknet)',
        status: 'go',
        why: "Single ingredient (the legume). Buy freely. The real work here is bedikat tola'im — spread and inspect for insects before cooking — and checking origin isn't Israel.",
        whereFound: 'All chains — Spar (Natur*pur Bio-Berglinsen, rote Linsen),…',
      },
      {
        name: 'Canned / jarred cooked legumes (Kichererbsen, Linsen, Bohnen in Wasser)',
        status: 'go',
        why: "Verified clean single-food + water: SPAR Natur*pur Bio-Kichererbsen genussfertig = 'Kichererbsen, Wasser';",
        whereFound: 'Spar (Natur*pur), Hofer, Lidl, Billa canned-goods aisle',
      },
      {
        name: 'Whole grains — oats (Haferflocken), quinoa, polenta/Maisgrieß, millet/Hirse, buckwheat, pearl barley (Graupen)',
        status: 'go',
        why: 'Plain rolled/whole grains are single-ingredient staples — buy freely. Standard insect-check applies (oats and grains can harbor insects) and avoid Israeli origin.',
        whereFound: 'All chains — Spar, Hofer, Lidl, dm (dmBio), Billa;',
      },
      {
        name: "Ready-to-eat 'Express' microwave rice pouches (plain vs flavored)",
        status: 'read-label',
        why: "Two separate issues. Flavored pouches add butter (Butter/Rahm), 'Aroma', or dairy — read the label.",
        whereFound: "Ben's Original Express + own-brand microwave pouches at…",
      },
      {
        name: 'Canned legume soups (Linsensuppe, Bohnensuppe)',
        status: 'read-label',
        why: 'Not the same as plain canned beans — these are composed products that commonly carry meat stock (Fleischbrühe), Speck/bacon, or cream (Rahm/Sahne).',
        whereFound: 'Interspar/Spar (Natur*pur Bio-Linsensuppe), plus…',
      },
    ],
  },
  {
    category: 'Snacks & chips',
    verdict: 'read-the-label',
    theWhy:
      'The core of this aisle is genuinely easy: plain salted potato chips, popcorn, roasted peanuts and pretzel sticks are just potato/corn/nut + vegetable oil + salt, and many carry a V-Label vegan mark that settles it in one glance.',
    special:
      "Two category-specific rules beyond the general flags: (1) PAS — pretzel sticks (Salzstangen) and cracker-snacks are BAKED, so they're mezonot and raise the pas (bread) question; commercial factory pretzels/crackers are pas palter, which Modern Orthodox rely on, so Soletti-type sticks are usable.",
    items: [
      {
        name: "Kelly's Chips Classic Salted / Party Salted (also Rustic)",
        status: 'go',
        why: "Label is Kartoffeln + pflanzliche Öle (Sonnenblume/Raps) + Salz — nothing else. Kelly's markets these as vegan and VeganBlatt lists them as vegan. Cleanest grab in the aisle.",
        whereFound: 'Spar, Billa, Hofer, MPreis, Lidl',
      },
      {
        name: "Kelly's Popcorn gesalzen (Salted)",
        status: 'go',
        why: "Mais + pflanzliche Öle + Salz only. Vegan, no Aroma. (Note: the MICROWAVE 'Butter' popcorn is different — it has Aroma with milk + palm oil + colors, so that one is read-label/dairy.)",
        whereFound: 'Billa, Spar, gurkerl',
      },
      {
        name: "Kelly's Erdnüsse geröstet & gesalzen (roasted salted peanuts)",
        status: 'go',
        why: 'Erdnüsse 95% + Sonnenblumenöl + Salz. Plain roasted-in-oil nut, no Aroma, no glaze — clean.',
        whereFound: 'Interspar, Billa, MPreis',
      },
      {
        name: 'Soletti Salzstangerl (salt pretzel sticks)',
        status: 'go',
        why: "Weizenmehl, Salz, Palm- oder Rapsöl, Hefe, Zucker, Weizenmalz, Natronlauge — all plant. 'May contain traces of milk.' Baked good, so it's the pas/mezonot case — commercial factory…",
        whereFound: 'Spar, Billa, Hofer (Austrian staple, Feldbach)',
      },
      {
        name: 'Tortilla Chips Salted — Chio, plus own-brands Spar S-Budget / Billa Clever / Hofer Snack Day',
        status: 'go',
        why: 'Corn + oil + salt; VeganBlatt lists all four (Chio + the three own-brand salted tortillas) as vegan. Salted-only versions; flavored tortilla (nacho cheese, etc.) flips to read-label.',
        whereFound: 'Spar, Billa, Hofer',
      },
      {
        name: 'dmBio Gemüsechips / Kichererbsen Chips mit Meersalz',
        status: 'go',
        why: 'Vegetable or chickpea flour + Sonnenblumenöl + Meersalz; carries the V-Label (vegan) and is Bio. A confident grab where dm is the store.',
        whereFound: 'dm (dmBio line)',
      },
      {
        name: "Chio Red Paprika / Kelly's Chips Paprika (standard bag)",
        status: 'read-label',
        why: 'Current standard recipe reads plant-based (natürliche Aromen, geräucherter Paprika, Paprikaextrakt as color, Citronensäure) and VeganBlatt lists Chio Red Paprika as vegan — BUT it…',
        whereFound: 'Spar, Billa, Hofer',
      },
      {
        name: "Sour-Cream & Onion chips / Kelly's Popchips Paprika (sour-cream style)",
        status: 'read-label',
        why: 'Verified to contain SAUERRAHMPULVER + SÜSSMOLKENPULVER (sour cream + sweet whey) plus natürliches Aroma — explicitly non-vegan.',
        whereFound: 'Spar, Billa',
      },
      {
        name: "Cheese-flavored chips (Käse-Chips, 'Cheese', Nacho Cheese)",
        status: 'read-label',
        why: 'Käsepulver = dairy (milchig) plus Aroma. Cheese powder also carries the gevinas-akum debate: many MO permit it as a minor processed powder, stricter view avoids it.',
        whereFound: 'Spar, Billa, Hofer',
      },
      {
        name: "Coated / roasted flavored nuts — BBQ, honey-roasted, wasabi, Kelly's Erdnuss Snips (peanut crackers)",
        status: 'read-label',
        why: 'The glaze/coating is where animal words hide: Aroma, Honig, soy-sauce + wheat coating (Snips-type), and sometimes a Schellack (shellac) glaze.',
        whereFound: 'Spar, Billa, Interspar',
      },
      {
        name: 'Bacon / Speck / meat-flavored novelty chips',
        status: 'stop',
        why: "Speck, Schweineschmalz, tierisches Fett or a meat 'Fleischaroma' = pork/animal-derived. Hard skip even with an otherwise clean-looking bag.",
        whereFound: 'occasional seasonal/novelty SKUs',
      },
    ],
  },
  {
    category: 'Chocolate',
    verdict: 'read-the-label',
    theWhy:
      'Plain bars are one of the friendliest aisles: no hechsher needed to read them, and the ingredient lists are short. The whole aisle splits in two — milk chocolate (Milchschokolade/Alpenmilch) is dairy, so it only works if you rely…',
    special:
      'CHALAV STAM is the governing rule for this aisle: any Milchschokolade/Alpenmilch (and its whey/milk-fat) is dairy and usable for the MO majority who rely on chalav stam — a chalav-yisrael-strict traveler should avoid all milk chocolate.',
    items: [
      {
        name: 'Milka Alpenmilch (plain Alpine milk bar)',
        status: 'read-label',
        why: 'Verified list: Zucker, Kakaobutter, Kakaomasse, Magermilchpulver, Süßmolkenpulver (whey), Butterreinfett (milk fat), Sojalecithin, Haselnussmasse, Aroma.',
        whereFound: 'Spar/Billa/Hofer/Lidl — everywhere;',
      },
      {
        name: 'Lindt Excellence dark (70% / 85% / 90% / 99%)',
        status: 'read-label',
        why: 'Ingredient line is pareve: cocoa mass, cocoa butter, sugar, defatted cocoa powder, Bourbon vanilla — no dairy, no red words.',
        whereFound: 'Spar/Interspar/Billa Plus premium chocolate shelf',
      },
      {
        name: 'Lindt milk / Lindor truffles',
        status: 'read-label',
        why: 'Milk chocolate = dairy = chalav-stam-dependent (majority MO OK, chalav-yisrael-strict STOP). Lindor truffles add a soft filling with more milk fat/whey and Aroma — more moving parts…',
        whereFound: 'Spar/Interspar premium shelf',
      },
      {
        name: 'Spar Natur*pur Bio Zartbitter (dark, organic own-brand)',
        status: 'go',
        why: "Several SPAR Natur*pur dark items are labeled explicitly 'milchfrei und vegan' (e.g. the Bio dark baking/eating chocolate, 48–62% cocoa: Kakaomasse, Rohrohrzucker, Kakaobutter,…",
        whereFound: 'Spar/Eurospar/Interspar own-brand aisle',
      },
      {
        name: 'Zotter Labooko VEGAN dark (single-origin: Tanzania 75%, Brasilia 72%, São Tomé 75%)',
        status: 'go',
        why: 'Austrian bean-to-bar (Riegersburg, Styria), organic + fair trade, pure cocoa butter (no palm), carries the V-Label VEGAN mark = audited zero animal ingredients.',
        whereFound: 'Zotter shop/Riegersburg; stocked at Interspar, some Billa…',
      },
      {
        name: 'Zotter hand-scooped / flavored / liqueur pralines',
        status: 'read-label',
        why: "Zotter's signature is wild fillings — many are excellent and vegan, but the range includes alcohol/liqueur (grape-derived = stam yeinam risk), dairy pralines, and exotic add-ins.",
        whereFound: 'Zotter shop + specialty/gift sections',
      },
      {
        name: "Generic dark 'Edelbitter/Zartbitter' bars (Hofer, Lidl, Billa own-brand)",
        status: 'read-label',
        why: "Base is normally pareve (cocoa mass, cocoa butter, sugar, Sojalecithin). Two checks: (1) 'kann Milch enthalten' shared-equipment note — hechsher-resolves, judgment call;",
        whereFound: 'Hofer/Lidl/Billa own-brand chocolate aisle',
      },
    ],
  },
  {
    category: 'Candy & gummies',
    verdict: 'read-the-label',
    theWhy:
      'This is the single highest-risk aisle: the DEFAULT gummy and marshmallow (Haribo, Trolli, standard Mäusespeck) is built on pork/beef Gelatine, and red/pink candies often add Echtes Karmin (E120, cochineal insect) — both are hard…',
    special:
      'Three category-specific hard stops on top of the general list: (1) GELATINE in gummies/marshmallows/some licorice = stop even if it says halal beef gelatin; (2) KARMIN/E120 in red-pink candies = stop;',
    items: [
      {
        name: 'Haribo Goldbären (classic gold-bears) + most standard Haribo (Happy Cola, Phantasia)',
        status: 'stop',
        why: 'Made with animal Gelatine (Haribo states pork gelatin for the standard line; only ~20 of ~150 varieties are gelatin-free). Hard stop, gevinas/shechita-tier problem.',
        whereFound: 'Everywhere — Spar, Billa, Hofer, Lidl, dm',
      },
      {
        name: 'Trolli Glühwürmchen / standard Trolli gummies',
        status: 'stop',
        why: "DOUBLE stop: ingredient list shows both Gelatine AND 'echtes Karmin' (E120 cochineal) plus palm fat. Perfect illustration of the two aisle hazards in one bag.",
        whereFound: 'Austrian retail incl. Gurkerl.at',
      },
      {
        name: 'Standard marshmallows / Mäusespeck / Schaumzucker',
        status: 'stop',
        why: 'Conventional marshmallows are gelatin foam. Unless it explicitly says vegan / Agar / Carrageen, assume Gelatine = stop.',
        whereFound: 'Everywhere',
      },
      {
        name: 'Katjes fruit gums (Grün-Ohr Hase, Katzen, etc.)',
        status: 'read-label',
        why: 'Entire Katjes range is made WITHOUT animal gelatin — plant gelling agents (Pektin, Stärke), carries V-Label vegan. Strong go-candidate;',
        whereFound: 'dm Austria + Spar (permanent assortment)',
      },
      {
        name: 'Katjes Lakritz (Salzige Heringe, Katzen-Pfötchen Softlakritz)',
        status: 'read-label',
        why: 'Vegan, no gelatin — built on Süßholzsaft (licorice extract), Zucker, Glukosesirup, Salmiaksalz. Watch only Aroma and any Schellack/Bienenwachs glaze; licorice itself is fine.',
        whereFound: 'dm / Spar / Kaufland.at',
      },
      {
        name: 'SPAR Veggie Veganer Fruchtgummi (Saure Erdbeeren)',
        status: 'read-label',
        why: "Uses 'pflanzliche Geliermittel wie Stärke und Pektin' instead of gelatin, V-Label vegan (~€1.29). Green lane; last scan for Traubensaft/Aroma.",
        whereFound: 'Spar / Eurospar / Interspar',
      },
      {
        name: 'SPAR Natur*pur Veganer Bio-Fruchtgummi (Saure Pfirsiche)',
        status: 'read-label',
        why: 'Bio, no gelatin, no artificial flavoring — cleaner Aroma profile than most. Still confirm no grape juice on the actual pack.',
        whereFound: 'Spar Austria',
      },
      {
        name: 'Lidl Vemondo vegane Fruchtgummi',
        status: 'read-label',
        why: 'V-Label vegan (externally audited, no animal ingredients). Availability is action-ware not permanent, so may not be on the shelf in summer 2026 — check. Then scan Traubensaft.',
        whereFound: 'Lidl Austria — SEASONAL (Veganuary Jan + summer), not…',
      },
      {
        name: "Haribo 'Naturally Vegan' line (Miami Sauer at Billa; Vegane Bären / Früchtchen)",
        status: 'read-label',
        why: "Reformulated with Pektin, labeled 'Naturally Vegan'. Trust ONLY the explicit vegan label — recipes differ by country, so a German-vegan Haribo may be gelatin in Austria and vice versa.",
        whereFound: 'Billa Austria + haribo.com/at-de/vegan',
      },
      {
        name: "Not Guilty 'Marilyn Mallows' vegan marshmallows",
        status: 'read-label',
        why: 'Bio vegan marshmallow — carrageenan + pea protein, no gelatin. Go-candidate for the marshmallow craving; confirm vegan mark on pack.',
        whereFound: 'dm Austria / Bipa',
      },
      {
        name: 'Plain hard candies / lollipops (sugar, glucose, citric acid, colors)',
        status: 'read-label',
        why: 'Often genuinely clean (Zucker/Glukosesirup/Citronensäure/plant colors). But check three things: Aroma (judgment), red/pink ones for Karmin, and any Schellack glaze or Traubensaft.',
        whereFound: 'All chains',
      },
    ],
  },
  {
    category: 'Cereal & muesli',
    verdict: 'read-the-label',
    theWhy:
      'This is one of the friendliest aisles: NONE of the five hard-stop ingredients (meat, cheese, wine/grape, gelatin, carmine) belong in a normal cereal, so at worst you hit dairy or a yellow emulsifier - never a landmine.',
    special:
      'Barley malt (Gerstenmalz/Gerstenmalzextrakt) in cornflakes and many crunchy mueslis is CHAMETZ - a Passover-only concern, completely irrelevant for a summer trip; it is fine to eat year-round.',
    items: [
      {
        name: 'Kölln Blütenzarte Köllnflocken (100% Vollkorn-Hafer)',
        status: 'go',
        why: 'Single-ingredient product: 100% whole-grain oats, nothing else. The cleanest possible pick - no dairy, no malt, no aroma. German brand, widely stocked in Austria.',
        whereFound: 'Spar/Interspar/Billa (verified via koelln.com +…',
      },
      {
        name: 'Spar S-BUDGET Haferflocken Großblatt (rolled oats)',
        status: 'go',
        why: "Ingredient list reads only 'Haferflocken' (oats) - one ingredient. Cheapest clean staple in the aisle.",
        whereFound: 'Spar / Eurospar / Interspar own-brand (verified on spar.at…',
      },
      {
        name: 'Plain rolled oats, any own-brand (Hofer, Lidl Vemondo, Clever, MPreis)',
        status: 'go',
        why: 'Plain rolled oats are single-ingredient by nature. Confirm the label reads only Haferflocken/oats with nothing added. I verified Spar S-Budget and Kölln specifically;',
        whereFound: 'All chains carry an own-brand plain oat;',
      },
      {
        name: "Kellogg's Corn Flakes (Austrian retail)",
        status: 'go',
        why: 'Ingredients: corn (Mais), sugar, barley malt (Gerstenmalz), salt, plus added vitamins/iron incl. vitamin D. No animal ingredients, no cheese/wine/gelatin.',
        whereFound: 'Confirmed on Austrian shelves: gurkerl.at, MPreis…',
      },
      {
        name: 'Kölln Müsli Knusper Schoko-Karamell (and the Knusper/Schoko crunchy-granola line)',
        status: 'read-label',
        why: 'It is DAIRY, not a stop. Verified ingredient list contains Butter, Vollmilchpulver (whole milk powder), Magermilchpulver (skim milk powder) and Süßmolkenpulver (sweet whey) - all…',
        whereFound: 'Open Food Facts product ;',
      },
      {
        name: 'Seitenbacher gebackenes/Knusper Müsli (honey-baked)',
        status: 'read-label',
        why: "Honey (Honig) is kosher and fine. Watch instead: 'natürliches Aroma,' and note some Seitenbacher varieties include cornflakes made with barley malt (Pesach-only).",
        whereFound: 'seitenbacher.de (brand site); Austrian mainstream-chain…',
      },
      {
        name: 'Plain muesli base / Basismüsli (no chocolate, no yogurt, no dried-fruit glaze)',
        status: 'read-label',
        why: 'Oats + other grains + nuts/seeds is typically clean and often pareve. The only things to scan for are added Molke/Milcheiweiss (dairy) or Aroma slipped into some blends.',
        whereFound: 'Own-brand base mueslis across Spar/Billa/Hofer/Lidl…',
      },
      {
        name: "Chocolate-, caramel-, or yogurt-coated granola / 'Joghurt' muesli (any brand)",
        status: 'read-label',
        why: 'The coating is the issue: chocolate and yogurt coatings carry milk powder/whey = dairy (chalav stam), not pareve.',
        whereFound: 'Category-wide across all chains; read each product',
      },
      {
        name: 'dmBio / Vemondo / Just Veg! / SPAR Veggie muesli & granola carrying the V-Label VEGAN mark',
        status: 'go',
        why: 'The audited vegan mark = zero animal ingredients, which clears every animal question in this aisle at a glance (no dairy, no whey, no carmine, no shellac).',
        whereFound: 'dm (dmBio), Lidl (Vemondo), Hofer (Just Veg!), Spar (SPAR…',
      },
    ],
  },
  {
    category: 'Oils, spreads & jam',
    verdict: 'mostly-green',
    theWhy:
      'This is one of the easiest aisles on the trip: most of it is single-ingredient (pure olive/seed oil, 100% nut butter, honey) or plant-based, so a clean German label really does mean go.',
    special:
      "JAM/SPREAD-SPECIFIC HARD STOP: a fruit spread sweetened with grape juice/grape concentrate (Traubensaft, Traubensaftkonzentrat, Traubensüße, Traubendicksaft) triggers stam yeinam even though the label looks like clean fruit — this is the aisle's hidden trap, so read the sweetener line, not just the…",
    items: [
      {
        name: 'Extra-virgin olive oil — Natives Olivenöl extra (e.g. Ja! Natürlich Bio-Olivenöl nativ extra; SPAR Natur*pur olive oil)',
        status: 'go',
        why: "Single-source, cold-pressed olives, no additives — the label literally reads 'Olivenöl'. Nothing on the red or yellow list appears in true EVOO. Straight go.",
        whereFound: 'Ja! Natürlich at Billa/Billa Plus;',
      },
      {
        name: 'Single-source vegetable oils — Sonnenblumenöl (sunflower), Rapsöl (rapeseed/canola), Maiskeimöl (corn)',
        status: 'go',
        why: "One named plant oil, no additives = fine. Green per the framework (vegetable oils). Just confirm it's ONE oil, not the blended/refined case below.",
        whereFound: 'Own-brand (Spar, Clever, Hofer, Lidl) across all chains',
      },
      {
        name: "Blended, refined, or flavored frying oils — 'Pflanzenöl' mixes, Bratöl, oils listing Aroma / Buttergeschmack / E471 / anti-foam",
        status: 'read-label',
        why: 'This is where certification normally matters for oils. A no-name blend can carry added Aroma, emulsifiers (E471 = plant-OR-animal, yellow), or a butter-flavor note.',
        whereFound: 'Frying-oil shelf, all chains',
      },
      {
        name: 'Butter — süße/gesalzene Butter (e.g. Ja! Natürlich Bio-Butter, Kerrygold, Spar butter)',
        status: 'go',
        why: 'Plain pasteurized cream = chalav stam, which most MO rely on. Go for the two of you. (Stricter chalav-yisrael minority would not use it — note only, not the default bar.)',
        whereFound: 'Every chain',
      },
      {
        name: 'Margarine — Rama and similar (Thea, Sanella, own-brands)',
        status: 'read-label',
        why: "Rama's palm-free and some other variants list Buttermilch or Molke (whey = dairy, and cheese-derived whey is the mild gevinas-akum quibble for the strict), plus natürliches Aroma…",
        whereFound: 'Every chain',
      },
      {
        name: "V-Label VEGAN margarine — SPAR Veggie / Hofer 'Just Veg!' / Lidl 'Vemondo' / Billa 'Vegavita' plant butter",
        status: 'go',
        why: 'The audited vegan mark clears the dairy/Molke question that dogs regular margarine — biggest shortcut here.',
        whereFound: 'SPAR Veggie at Spar; Just Veg! at Hofer; Vemondo at Lidl;',
      },
      {
        name: '100% nut/seed butter — Erdnussmus / Mandelmus (e.g. Rapunzel Erdnussmus fein = 100% peanuts; dmBio Erdnussmus)',
        status: 'go',
        why: 'Sole ingredient is roasted nuts (Rapunzel confirms 100% peanuts, no additives). Nothing to flag. Salt-added is still go.',
        whereFound: 'Rapunzel & dmBio at dm; also Austrian bio shops;',
      },
      {
        name: 'Cheaper/flavored peanut & choc-nut butters — with added Palmfett, Zucker, Aroma',
        status: 'read-label',
        why: 'Added palm fat and sugar are fine (plant), but watch for Aroma (yellow) and, in choc versions, Milchpulver (dairy). Not a stop — just not the clean single-ingredient go. Read it.',
        whereFound: 'Spread shelf, all chains',
      },
      {
        name: 'Darbo Naturrein / Fruchtreich fruit spreads (Austrian, from Tirol)',
        status: 'go',
        why: 'Verified ingredients: fruit, sugar, lemon-juice concentrate, and pectin as gelling agent. Pectin is green (fine). No grape sweetener, no gelatin, no animal input.',
        whereFound: 'Darbo is the ubiquitous Austrian jam brand — every chain…',
      },
      {
        name: "Grape-sweetened / 'ohne Zuckerzusatz' fruit spreads sweetened with Traubensaft or Traubensüße",
        status: 'stop',
        why: "Many sugar-free fruit spreads swap in grape-juice concentrate as the sweetener — that's stam yeinam, a hard stop, hiding in a healthy-looking fruit label. Scan the sweetener line;",
        whereFound: 'Diet/no-added-sugar jam shelf, all chains',
      },
      {
        name: 'Honey — Darbo Honig, local Imker/Blütenhonig',
        status: 'go',
        why: 'Pure honey is kosher by established halacha even though bees are not — no hechsher needed. Go. Only flavored or creamed honeys with added Aroma warrant a glance.',
        whereFound: 'Darbo and local Austrian honey in every chain;',
      },
      {
        name: 'Nutella (Ferrero, Austrian formulation)',
        status: 'read-label',
        why: "Not a stop, but it's DAIRY: Austrian recipe lists Magermilchpulver (skimmed milk powder ~8.7%) plus Molkenpulver (whey). Sojalecithin is green and Vanillin is fine.",
        whereFound: 'Every chain',
      },
      {
        name: 'Own-brand hazelnut-cocoa spreads (Nutella clones — Spar, Clever, Nutoka etc.)',
        status: 'read-label',
        why: 'Same profile as Nutella — milk powder + lecithin + Aroma. Read for Milchpulver/Molke (dairy) and Aroma.',
        whereFound: 'All chains',
      },
    ],
  },
  {
    category: 'Sauces, condiments & vinegar',
    verdict: 'read-the-label',
    theWhy:
      "This aisle is the trip's biggest label-reading minefield because two hard stops hide everywhere: grape (wine vinegar and balsamico) and cheese (in pesto).",
    special:
      'The vinegar fork governs this whole aisle: Weinessig / Weißweinessig / Rotweinessig / Balsamico / Aceto = grape = stam yeinam = STOP even when the product is vegan and cheese-free.',
    items: [
      {
        name: 'SPAR S-BUDGET Tafelessig (5% table vinegar)',
        status: 'go',
        why: 'Ingredients are just Weingeistessig (spirit vinegar) + caramel color. Weingeistessig = distilled-spirit vinegar (Weingeist means ethanol, not grape wine), the good side of the vinegar…',
        whereFound: 'Spar / Eurospar / Interspar',
      },
      {
        name: 'Hengstenberg Apfelessig naturtrüb (apple vinegar)',
        status: 'go',
        why: "Apple vinegar, 5% acidity, labeled vegan. Apfelessig is squarely on the go side of the fork — no grape. Good for dressings and marinades where you'd otherwise reach for balsamic.",
        whereFound: 'Spar, MPreis, gurkerl.at',
      },
      {
        name: 'Weinessig / Weißweinessig / Rotweinessig (e.g. Hengstenberg Weißweinessig, DESPAR Italienischer Weißweinessig)',
        status: 'stop',
        why: 'Wine vinegar = grape = stam yeinam. Hard stop regardless of a clean-looking label. The word Weinessig (with or without Weiß/Rot prefix) is the tell.',
        whereFound: 'Spar and all chains',
      },
      {
        name: 'Aceto Balsamico di Modena IGP (Hofer/Aldi, Rewe, any brand)',
        status: 'stop',
        why: 'Doubly grape: ~55% concentrated grape must (Traubenmost) + ~45% Weinessig (wine vinegar). Balsamico / Aceto / Traubenmost are all red words. Stop.',
        whereFound: 'all chains',
      },
      {
        name: 'Felix Ketchup mild (Austrian, made in Mattersburg)',
        status: 'go',
        why: 'Tomatoes, sugar, modified starch, salt, Säuerungsmittel Essigsäure (acetic acid — spirit-derived) + citric acid, spices, spice extracts. No wine, no Aroma, no animal;',
        whereFound: 'Spar, Billa, Hofer, Lidl',
      },
      {
        name: 'Felix Ketchup ohne Zucker (OSÖTAD, no added sugar)',
        status: 'read-label',
        why: 'Tomato paste, Branntweinessig, starch, salt, spice extracts — good so far — but also lists natürliches Aroma, which is the yellow flag (plant or animal, undisclosed).',
        whereFound: 'Spar, Billa',
      },
      {
        name: "Mautner Markhof Estragon Senf (Austria's classic mustard)",
        status: 'read-label',
        why: 'Wasser, Senfsaat, Weingeistessig (D: Branntweinessig), Zucker, Salz, Gewürze, natürliches Aroma.',
        whereFound: 'Billa, Spar, gurkerl.at',
      },
      {
        name: 'Dijon-style mustard (French, e.g. Maille Dijon)',
        status: 'read-label',
        why: 'Traditional Dijon is acidified with white wine or wine vinegar (Weißwein / Weinessig) = grape. Some EU-market versions swap to Branntweinessig.',
        whereFound: 'Spar, Interspar gourmet shelf',
      },
      {
        name: "Kuner Mayonnaise — Original 80% / Fein 50% / Leicht 25% (Austria's main mayo brand)",
        status: 'stop',
        why: 'All three variants list Weißweinessig (white WINE vinegar) alongside Weingeistessig, plus Aromen.',
        whereFound: 'Spar / Interspar',
      },
      {
        name: 'Thomy Delikatess-Mayonnaise',
        status: 'go',
        why: 'Sunflower oil, egg yolk, Branntweinessig, mustard seed, spices, iodized salt, sugar. Spirit vinegar only — no wine, no Aroma. Egg+oil, clean by ingredient.',
        whereFound: 'Spar, Billa',
      },
      {
        name: 'Vemondo Vegane Salatmayo (Lidl vegan mayo)',
        status: 'go',
        why: 'Rapeseed oil, water, Branntweinessig, sugar, corn starch, mustard (with Branntweinessig), salt, pea protein, thickeners. Vegan + spirit vinegar only, no wine, no Aroma named.',
        whereFound: 'Lidl',
      },
      {
        name: 'dmBio Pesto Verde mit Basilikum & Cashews (vegan)',
        status: 'go',
        why: '54% Basilikum, sunflower oil, cashews, Zitronensaft (lemon juice — not vinegar), sea salt, olive oil, potato flakes, pine nuts, garlic. No cheese, no wine vinegar;',
        whereFound: 'dm (dm-drogerie markt)',
      },
      {
        name: 'Vemondo Pesto Basilico Vegan (Lidl)',
        status: 'stop',
        why: 'Vegan and cheese-free — but the ingredient list includes Weinessig (wine vinegar) = grape = stam yeinam. The proof that a vegan label clears cheese but says nothing about grape. Stop.',
        whereFound: 'Lidl',
      },
      {
        name: 'Standard jarred pesto (Barilla Pesto Genovese, Billa Bio Pesto, Barilla Pesto Rosso non-vegan, etc.)',
        status: 'stop',
        why: 'Regular pesto contains hard cheese — Grana Padano and/or Pecorino (Käse) = gevinas akum, uncertified hard stop.',
        whereFound: 'all chains',
      },
      {
        name: 'Kikkoman Naturally Brewed Soy Sauce (Sojasauce, natürlich gebraut)',
        status: 'go',
        why: 'Four ingredients: water, soybeans, wheat, salt. No wine, no Aroma. The >2% alcohol is a fermentation byproduct, not added wine — not a kashrut problem by ingredient.',
        whereFound: 'Spar, dm, Asian shelf at Interspar',
      },
      {
        name: 'Knorr Gemüse Bouillon vegan (vegetable stock, vegan line)',
        status: 'read-label',
        why: 'Vegetables, salt, starch, corn-germ oil — no meat and no palm fat — but it lists Aroma (flavoring), the yellow judgment flag. The vegan/vegetable version is the one to reach for;',
        whereFound: 'Spar, Billa, Hofer',
      },
      {
        name: 'Meat / chicken stock cubes (Rindsuppe / Hühnersuppe Würfel, Knorr & Maggi meat lines)',
        status: 'stop',
        why: 'Contain actual beef/chicken (shechita issue) plus Aroma. Uncertified meat = hard stop. Always take the explicitly vegan/vegetable cube instead, then read it for Aroma.',
        whereFound: 'all chains',
      },
      {
        name: "Bottled salad dressings & 'Salatkrönung' pourables (Kuner, Kraft, etc.)",
        status: 'read-label',
        why: 'This sub-shelf leans stop: most Austrian bottled dressings are built on Weinessig or Balsamico (grape) and/or Aroma.',
        whereFound: 'Spar, Billa',
      },
      {
        name: 'Worcestershire sauce (Lea & Perrins and lookalikes)',
        status: 'read-label',
        why: 'Contains anchovy/Sardellen (fish — needs its own scrutiny) plus Aroma and sometimes Tamarinde and vinegar of unstated type.',
        whereFound: 'Spar, Interspar',
      },
    ],
  },
  {
    category: 'Canned & jarred',
    verdict: 'read-the-label',
    theWhy:
      'This aisle splits cleanly into two tiers. Plain canned vegetables, tomatoes/passata, beans, corn, and legumes are the single greenest thing in the whole store — the label is almost always just the vegetable + water + salt…',
    special:
      'CANNED FISH is the honest exception in an otherwise easy aisle. Tuna, sardines, and salmon are kosher species (fins + removable scales), and a clean label (fish, oil, salt) has nothing red in it.',
    items: [
      {
        name: 'SPAR Natur*pur Bio-Tomaten-Passata (Zutaten: Tomaten, Meersalz)',
        status: 'go',
        why: 'Just tomatoes + non-iodized sea salt. Nothing red, yellow, or grape. This is the archetype clean go — passata/passierte Tomaten in this aisle is reliably tomato + salt (±…',
        whereFound: 'Spar / Eurospar / Interspar (verified label)',
      },
      {
        name: 'SPAR Vital Passata – passierte Tomaten (Zutaten: Tomaten, Salz, Citronensäure)',
        status: 'go',
        why: 'Tomato, salt, citric acid (E330 — plant-derived acidity regulator, on the GREEN list). Clean go.',
        whereFound: 'Spar (verified label)',
      },
      {
        name: 'SPAR Natur*pur Bio-Kidneybohnen (Zutaten: Kidneybohnen, Wasser, Meersalz)',
        status: 'go',
        why: 'Beans, water, sea salt. The whole legume shelf — Kidneybohnen, Kichererbsen (chickpeas), weiße Bohnen, Linsen — is reliably legume + water + salt. Clean go;',
        whereFound: 'Spar (verified label, Open Food Facts)',
      },
      {
        name: 'Canned corn / Zuckermais and plain canned vegetables (Erbsen, Karotten, grüne Bohnen)',
        status: 'go',
        why: 'Standard sweet-corn/canned-veg formulation is vegetable + water + salt (corn may add Zucker/sugar — green). A go.',
        whereFound: 'All chains (Spar, Billa, Hofer, Lidl) — did NOT pin one…',
      },
      {
        name: 'S-BUDGET Spanische grüne Oliven ohne Kern (Zutaten: Oliven, Wasser, Salz, Milchsäure/lactic acid)',
        status: 'go',
        why: 'Brined in LACTIC ACID (Milchsäure), not vinegar at all — this is the ideal olive. Lactic-acid or plain-brine olives are a clean go. Shows the good case for the whole olive shelf.',
        whereFound: 'Spar S-Budget line (verified label)',
      },
      {
        name: 'SPAR Natur*pur Griechische Bio-Oliven grün entkernt (Zutaten: Oliven, Wasser, Meersalz, spirit vinegar/Branntweinessig, Citronensäure, Milchsäure)',
        status: 'go',
        why: 'The vinegar here is SPIRIT vinegar (Branntweinessig — distilled from alcohol, not grapes), plus citric + lactic acid. Spirit vinegar is on the GREEN list.',
        whereFound: 'Spar (verified label)',
      },
      {
        name: 'DESPAR PREMIUM Olive con Tonno (contains Weinessig / wine vinegar, plus tuna + Sardellen/anchovies)',
        status: 'stop',
        why: "Two problems: WEINESSIG (wine vinegar = stam yeinam) AND uncertified canned tuna + anchovies. A clear stop — and a useful example that stuffed/marinated 'antipasti' olives are where…",
        whereFound: 'Spar (verified label)',
      },
      {
        name: 'Generic Austrian Essiggurken / Gewürzgurken (typical Zutaten: Gurken, Wasser, Branntweinessig, Zucker, Zwiebeln, Speisesalz, Dill, Senfkörner)',
        status: 'read-label',
        why: 'Austrian pickles are almost always BRANNTWEINESSIG (spirit vinegar — green), so the base is usually fine.',
        whereFound: "All chains — Spar 'Kleine Feine Gurken', Kühne, own-brands",
      },
      {
        name: 'Almare Seafood Thunfisch Filets in Sonnenblumenöl (Hofer) — Zutaten: Thunfisch 75%, Sonnenblumenöl, Speisesalz',
        status: 'read-label',
        why: 'The LABEL is spotless — tuna, sunflower oil, salt, nothing red. But per OU/Star-K/COR, canned tuna is where a clean label is NOT enough: species-ID (scales removed before canning) and…',
        whereFound: 'Hofer (Aldi Süd own-brand, verified label)',
      },
      {
        name: 'Hofer Thunfisch Stücke in Gemüse (Almare) — contains Reisweinessig, Tomatenmark, Sojaöl, Guarkernmehl, Gewürzmischung',
        status: 'read-label',
        why: 'A composite tuna product. Reisweinessig (rice vinegar) is NOT grape, so not stam yeinam, and the other listed items are green — but it stacks the canned-fish certification question…',
        whereFound: 'Hofer (verified label)',
      },
      {
        name: 'Hofer Thunfisch Aufstrich (tuna spread) — contains Hühnereieiweiß, gekochte Eier, Weingeistessig, Senf, Gewürze',
        status: 'read-label',
        why: "Weingeistessig is spirit vinegar (green) and egg is pareve, but it's a heavily processed spread carrying the same uncertified-canned-fish question plus egg-processing and undefined…",
        whereFound: 'Hofer (verified label)',
      },
    ],
  },
  {
    category: 'Drinks',
    verdict: 'mostly-green',
    theWhy:
      'Drinks is one of the friendliest aisles: still and sparkling water, plain sodas, single-fruit juice, iced tea and plant milks are almost all fine judged on ingredients alone. The ONE landmine is grape.',
    special:
      'Grape is the entire game in this aisle. Beyond the general red/yellow scan: (1) any UNCERTIFIED grape juice (Traubensaft), grape must (Traubenmost), wine, grenadine or grape-based mixer is stam yeinam — a hard STOP even with an otherwise clean label;',
    items: [
      {
        name: 'Still & sparkling mineral water (Vöslauer, Römerquelle, Gasteiner, Juvina)',
        status: 'go',
        why: "Plain water, flat or carbonated, needs no hechsher. Only watch flavored/'plus' waters with added Aroma or fruit — those become a read-label.",
        whereFound: 'Every chain — Spar, Billa, Hofer, Lidl, MPreis',
      },
      {
        name: 'Plain sodas — cola, clear lemonade, tonic, orange (Fanta/Frucade), Almdudler herbal soda',
        status: 'go',
        why: 'Water, sugar, CO2, citric acid, caramel color (E150) and Aroma. No grape, no animal. Almdudler is even V-Label vegan (alpine-herb extract, beet sugar, citric acid).',
        whereFound: 'Every chain',
      },
      {
        name: "Traubensaft — grape juice (Rauch, Pfanner, any brand; red OR white, incl. 'Bio')",
        status: 'stop',
        why: "Uncertified grape juice is stam yeinam — a HARD STOP regardless of a 100%-clean label. This is the aisle's main trap and it is sold everywhere in Austria.",
        whereFound: 'Juice shelf, every chain',
      },
      {
        name: "Rauch Happy Day Multivitamin / any 'Multivitamin' or 'Mehrfrucht' (multifruit) juice",
        status: 'stop',
        why: 'Verified: the ingredient list includes Traube (grape) inside the Mehrfruchtsaftkonzentrat. Grape as a blend component still triggers stam yeinam.',
        whereFound: 'Juice shelf, every chain (Rauch is the market leader)',
      },
      {
        name: 'Single-fruit juice — Apfelsaft (apple), Orangensaft (orange), Naranci',
        status: 'go',
        why: "One named fruit, water, maybe vitamin C — clean. The moment it becomes 'multi', a nectar blend, or red, drop to read-label and hunt for Traube.",
        whereFound: 'Juice shelf, every chain',
      },
      {
        name: "Red / berry juices — Pfanner Cranberry, 'Rote Früchte', pomegranate, aronia",
        status: 'read-label',
        why: 'Two things to check: (1) Karmin/Cochenille (E120) as red color, and (2) grape juice used as a cheap sweetener/base.',
        whereFound: 'Juice shelf, Spar/Billa/Pfanner range',
      },
      {
        name: 'Oat drink — Vemondo Bio Haferdrink (Lidl), Spar Veggie / dmBio oat',
        status: 'go',
        why: 'Water, oats, rapeseed oil, chicory fiber, calcium, sea salt, vitamins — no Aroma, no animal, nothing grape. Cleanest plant-milk pick.',
        whereFound: 'Lidl (Vemondo, 230+ AT stores); dm; Spar',
      },
      {
        name: 'Almond / soy / coconut drink — Alpro Mandeldrink, Vemondo, Vegavita (Billa)',
        status: 'read-label',
        why: 'Alpro almond = water, almonds, sugar, tricalcium phosphate, sunflower lecithin (E322, plant = green), stabilizers, natürliches Aroma, vitamins. Basically fine;',
        whereFound: 'Billa, Spar, Lidl, dm',
      },
      {
        name: 'Iced tea — Rauch Eistee (Pfirsich/Zitrone), Pfanner Eistee',
        status: 'read-label',
        why: 'Rauch Eistee Pfirsich: black-tea + rosehip infusion, sugar, 1% peach juice, lemon juice, citric acid, Aroma — labeled vegan, no grape, no carmine. Fine;',
        whereFound: 'Every chain',
      },
      {
        name: 'Energy drinks — Red Bull (Austrian) and store-brand equivalents',
        status: 'read-label',
        why: 'Standard Red Bull: synthetic taurine (NOT from bulls), glucuronolactone, caffeine, B-vitamins, sugar — no animal-derived ingredient, so it passes on ingredients (Chabad discusses this…',
        whereFound: 'Every chain + Red Bull is Austrian',
      },
      {
        name: 'Wine, grape juice cocktails, grenadine, sangria, Traubenmost, wine spritzers',
        status: 'stop',
        why: "Anything grape-derived and uncertified = stam yeinam. Grenadine and many 'red' mixers use grape base; Traubenmost is grape must. Beer is a separate, generally-fine topic (plain lager);",
        whereFound: 'Drinks aisle / seasonal',
      },
    ],
  },
  {
    category: 'Frozen',
    verdict: 'mostly-green',
    theWhy:
      "The frozen aisle is your single best friend for self-catering: plain single-vegetable bags, plain frozen fruit, plain fries, and plain skin-on fish fillets are all go on ingredients alone, and they're exactly what you cook from.",
    special:
      'FISH SPECIES is the frozen-aisle-specific rule. Uncertified fish is allowed only if the label names a kosher (fins-and-scales) species — Lachs/salmon, Forelle/trout, Kabeljau/cod, Seelachs & Alaska Seelachs/pollock, Scholle/plaice, Thunfisch/tuna, Hering/herring, Makrele/mackerel.',
    items: [
      {
        name: 'Plain single-veg bags — SPAR Natur*pur Bio-Erbsen / S-BUDGET Erbsen tiefgekühlt (peas), broccoli, green beans, carrots',
        status: 'go',
        why: 'Ingredient list is literally just the vegetable (peas 100%). No sauce, no additive. The workhorse of the whole trip.',
        whereFound: 'Spar / Eurospar / Interspar (SPAR Natur*pur and S-BUDGET…',
      },
      {
        name: 'Plain mixed veg — SPAR Natur*pur Bio-Sommergemüse tiefgekühlt (unseasoned veg mix)',
        status: 'go',
        why: "A plain mix of vegetables with no sauce reads clean = go. The catch is the near-identical bag next to it: 'Buttergemüse' or 'Rahmgemüse' adds butter/cream (see separate row).",
        whereFound: 'Spar Produktwelt',
      },
      {
        name: "Creamed / buttered veg — Iglo Rahm-Blattspinat, Iglo Cremespinat, 'Buttergemüse', 'Rahmgemüse'",
        status: 'read-label',
        why: "Iglo Rahm-Blattspinat lists Sahne (cream), Magermilchpulver, Molkenerzeugnis (whey) = it's dairy.",
        whereFound: 'Iglo (iglo.at) — sold at Billa, Spar, MPreis',
      },
      {
        name: 'Plain frozen fruit / berries — SPAR Natur*pur Bio-Erdbeeren, frozen raspberries, blueberries, mango',
        status: 'go',
        why: 'Cleanest item in the freezer: single fruit, nothing added. Great for yogurt, oatmeal, cooking down into a sauce.',
        whereFound: 'Spar / Billa / Hofer own-brands',
      },
      {
        name: 'Plain potato fries — McCain 1•2•3 Original Frites',
        status: 'go',
        why: 'Austrian label = Kartoffeln 95.5% + Sonnenblumenöl 3.5%. Just potato and sunflower oil. The old worry about fries fried in Rindertalg (beef tallow) does NOT apply to current McCain…',
        whereFound: 'Spar Produktwelt (McCain 1•2•3 Original)',
      },
      {
        name: 'Coated / seasoned potato products — McCain Airfryer Frites, wedges, Rösti, Kroketten',
        status: 'read-label',
        why: 'McCain Airfryer Frites coating = modified starch, rice flour, pea fibre/protein, xanthan, colours turmeric + paprika extract — all plant, so that specific one is fine.',
        whereFound: 'Billa Online Shop (McCain Airfryer Frites)',
      },
      {
        name: 'Plain skin-on fish fillet, kosher species — Iglo Wildlachs Naturfilet (salmon); plain Kabeljau (cod), Forelle (trout), Alaska Seelachs (pollock)',
        status: 'go',
        why: "Salmon, cod, trout, pollock, plaice all have fins-and-scales = kosher species. A plain 'Naturfilet' with skin on lets you verify the fish is what the label says.",
        whereFound: 'Billa Online Shop (Iglo Wildlachs Naturfilet);',
      },
      {
        name: 'Pangasius fillet (and Wels/catfish, Aal/eel, Hai/shark, Garnelen/Meeresfrüchte)',
        status: 'stop',
        why: "Pangasius is a catfish — NO scales — so it is NOT kosher, clean label or not. It's a cheap frozen staple that sits right next to salmon and cod, so it's the most likely trap in this…",
        whereFound: 'Common frozen item across Spar/Hofer/Lidl (sold as…',
      },
      {
        name: 'Breaded / battered fish — Iglo MSC Fischstäbchen (fish fingers), Filegro Backfisch',
        status: 'read-label',
        why: 'Iglo Fischstäbchen read clean: Alaska-Seelachs (pollock) 65%, breadcrumbs (wheat, spices), rapeseed oil, wheat, starch, salt — a named kosher species and no problem additives, no…',
        whereFound: 'openfoodfacts.at + iglo.at (Iglo MSC Fischstäbchen);',
      },
      {
        name: 'Ice cream — Eskimo Cremissimo Vanille (tubs)',
        status: 'read-label',
        why: 'Cremissimo Vanille = entrahmte Milch, Molkenerzeugnis, Magermilchpulver (dairy → chalav stam, fine for most MO) + Aromen (Aroma, judgment) + Farbstoff Carotin (plant colour = fine).',
        whereFound: 'cremissimo.at + MPreis + Billa (Eskimo Cremissimo)',
      },
      {
        name: "Vegan frozen own-brands (V-Label) — Vemondo (Lidl), 'Just Veg!' (Hofer), SPAR Veggie, dmBio TK",
        status: 'read-label',
        why: 'A V-Label VEGAN mark = audited zero animal ingredients, so no gelatin/carmine/dairy/meat/fish to worry about — the biggest shortcut for anything processed/ready-made in the freezer.',
        whereFound: "Lidl (Vemondo), Hofer ('Just Veg!'), Spar (SPAR Veggie), dm…",
      },
      {
        name: 'Frozen cakes / cheesecake / Tiramisu / cheese-topped items (überbacken, gefüllte Teigwaren mit Käse)',
        status: 'stop',
        why: 'Frozen desserts are where Gelatine (mousse, cheesecake), cheese (gevinas akum — an uncertified-cheese hard stop), and sometimes wine/liqueur (Tiramisu) all live.',
        whereFound: 'Spar/Billa/Hofer frozen dessert & ready-meal sections',
      },
    ],
  },
];

// ---------- render: hechshers ----------
mount('hechshers', HECHSHERS.map((h) => `<span class="hechsher">${esc(h)}</span>`).join(''));

// ---------- render: certified list ----------
mount(
  'certlist',
  CERTLIST.map(
    (c) => `<div class="cert">
      <span class="cn">${esc(c.name)}</span>
      <span class="cauth">${esc(c.auth)}</span>
      <span class="cwhere">${esc(c.where)}</span>
    </div>`,
  ).join(''),
);

// ---------- render: hard stops ----------
mount(
  'stops-grid',
  STOPS.map(
    (s) => `<div class="stop-card">
      <div class="t">${esc(s.title)} <span class="he" dir="rtl">${esc(s.he)}</span></div>
      <div class="d">${esc(s.d)}</div>
    </div>`,
  ).join(''),
);

// ---------- render: glossary (search + filter) ----------
const TAG_TEXT: Record<Flag, string> = { go: 'Go', read: 'Read', stop: 'Stop' };
let curFilter: 'all' | Flag = 'all';
let curQ = '';

function renderGloss(): void {
  const q = curQ.trim().toLowerCase();
  const rows = GLOSS.filter((t) => {
    const okF = curFilter === 'all' || t.f === curFilter;
    const okQ = q === '' || (t.de + ' ' + t.en).toLowerCase().includes(q);
    return okF && okQ;
  });
  if (rows.length === 0) {
    mount(
      'gloss',
      '<div class="noresult">No match. Try part of the word — or it may just not be a kashrut flag.</div>',
    );
    return;
  }
  mount(
    'gloss',
    rows
      .map(
        (t) => `<div class="term ${t.f}">
        <span class="bar"></span>
        <span><span class="de" lang="de">${esc(t.de)}</span><span class="en">${esc(t.en)}</span></span>
        <span class="tg">${TAG_TEXT[t.f]}</span>
      </div>`,
      )
      .join(''),
  );
}

const qInput = document.getElementById('q');
if (qInput instanceof HTMLInputElement) {
  qInput.addEventListener('input', () => {
    curQ = qInput.value;
    renderGloss();
  });
}
const fbtns = document.querySelectorAll<HTMLButtonElement>('.fbtn');
fbtns.forEach((b) => {
  b.addEventListener('click', () => {
    const f = b.dataset.f;
    curFilter = f === 'go' || f === 'read' || f === 'stop' ? f : 'all';
    fbtns.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    renderGloss();
  });
});
renderGloss();

// ---------- render: grab list ----------
mount(
  'grabList',
  GRAB.map(
    (g) => `<div class="g">
      <div class="n">${esc(g.n)}</div>
      <div class="de" lang="de">${esc(g.de)}</div>
      <div class="w">${esc(g.w)}</div>
    </div>`,
  ).join(''),
);

// ---------- render: aisles ----------
function chipClass(status: ItemStatus): string {
  return status === 'read-label' ? 'read' : status;
}
function chipLabel(status: ItemStatus): string {
  if (status === 'stop') return 'Stop';
  if (status === 'read-label') return 'Read';
  return 'Go';
}

mount(
  'aisles',
  AISLES.map(
    (a, i) => `<details class="aisle"${i === 0 ? ' open' : ''}>
      <summary>
        <span class="a-stripe ${a.verdict}"></span>
        <span class="a-head">
          <span class="a-title">${esc(a.category)}</span>
          <span class="a-why">${esc(a.theWhy)}</span>
        </span>
        <svg class="a-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
      </summary>
      <div class="a-body">
        ${a.special ? `<div class="special">${esc(a.special)}</div>` : ''}
        <div class="items">
          ${a.items
            .map(
              (it) => `<div class="it">
              <span class="chip ${chipClass(it.status)}">${chipLabel(it.status)}</span>
              <span><span class="in">${esc(it.name)}</span><span class="iw">${esc(it.why)}${
                it.whereFound ? ` <span class="de">· ${esc(it.whereFound)}</span>` : ''
              }</span></span>
            </div>`,
            )
            .join('')}
        </div>
      </div>
    </details>`,
  ).join(''),
);

const statusEl = document.getElementById('aisleStatus');
if (statusEl) statusEl.textContent = `${AISLES.length} aisles.`;

// ---------- data: sourced attributions ----------
// Every entry below was produced by fetching the source page and quoting it,
// then a second agent re-fetched the SAME url to confirm the quote is really
// there. Anything that failed that test is not on this list.
interface Source {
  rule: string;
  who: string;
  why: string;
  url: string;
  caveat?: string;
}

const SOURCES: Source[] = [
  {
    rule: 'Cheese always needs gevinas yisrael',
    who: 'OU Kosher — “Kosher Cheese” (Rabbi Avrohom Gordimer), citing Shulchan Aruch YD 115:2 / Rambam 3:14',
    why: 'The decree is about who MADE it, not what went in: “even if the rennet is derived from kosher sources such as microbial rennet or thistles… only gevinas Yisroel is permitted.” The OU also notes that in mainland Europe animal rennet is still the prevalent practice.',
    url: 'https://oukosher.org/blog/consumer-kosher/kosher-cheese/',
    caveat:
      'cRc holds acid-set cheeses (cream, cottage) were never in the decree — but states that as US custom; no European ruling found.',
  },
  {
    rule: 'Wine & grape products are stam yeinam',
    who: 'Kashrut Division of the London Beth Din (KLBD)',
    why: 'Wine and grape juice handled by non-Jews are rabbinically forbidden, and wine vinegar and balsamic inherit that — including when they appear only as an ingredient or flavouring.',
    url: 'https://kosher.org.uk/kosher-info/kashrut-faqs/',
  },
  {
    rule: 'Gelatin is never nullified',
    who: 'OU Kosher — “The Kosher Status of Gelatin Revisited”',
    why: 'It is the davar hama’amid — the agent that actually sets the product — so bitul (nullification in 1/60) does not apply to it.',
    url: 'https://oukosher.org/blog/consumer-kosher/gelatin-revisited/',
  },
  {
    rule: 'Carmine (E120) is never nullified',
    who: 'cRc — Carmine policy',
    why: 'Because carmine “provides color to the food or beverage it is added to (chazusah), it cannot be batel b’shishim, even when there is a relatively small amount.”',
    url: 'https://consumer.crckosher.org/policies/carmine/',
  },
  {
    rule: 'Chalav stam — and why Austria qualifies',
    who: 'OU Kosher — Halacha Yomis',
    why: 'Rav Moshe Feinstein (Igros Moshe YD 1:47–49) permitted chalav stam only in countries with laws against adulterating milk AND inspectors enforcing them. The OU applies that test abroad.',
    url: 'https://outorah.org/p/168675/',
  },
  {
    rule: 'Pas palter — commercial bakery bread is fine',
    who: 'Star-K — “Pas or Pas Nisht”; Rema at Shulchan Aruch YD 112:2 (Hebrew text verified)',
    why: 'The decree targeted a non-Jew’s HOME baking and the social closeness it breeds — “the essence of the decree is because of intermarriage.” A commercial bakery isn’t that.',
    url: 'https://www.star-k.org/articles/articles/1194/pas-or-pas-nisht-reviewing-the-laws-of-pas-akum/',
  },
  {
    rule: 'Bishul akum needs BOTH conditions',
    who: 'OU Kosher — “Master List of Bishul Akum Status of Foods”',
    why: 'The food must be inedible raw AND oleh al shulchan melachim. “Foods which are edible raw” are exempt — fail either test and the rule doesn’t apply.',
    url: 'https://oukosher.org/blog/consumer-kosher/master-list-of-bishul-akum-status-of-foods/',
  },
  {
    rule: '“May contain traces” is not a kashrut issue',
    who: 'OU Kosher — “Kashrus and Allergens”',
    why: 'Such disclaimers “typically have no bearing on a food’s kosher or pareve status.” Gil said the same.',
    url: 'https://oukosher.org/blog/consumer-kosher/kashrus-and-allergens/',
  },
  {
    rule: 'Shellac (E904) is permitted',
    who: 'cRc — “Kosher Candy” (Rabbi Yisroel Langer), following Rav Moshe Feinstein (Igros Moshe YD 2:24); OU and Star-K agree',
    why: 'The hardened resin is inedible — a waste product of the lac insect, not the insect itself.',
    url: 'https://consumer.crckosher.org/wp-content/uploads/2024/09/Kosher-Candy.pdf',
    caveat: 'This is a US-agency leniency; Israeli kashrus agencies generally do not certify it.',
  },
  {
    rule: 'Tartaric acid & cream of tartar are kosher',
    who: 'cRc (“the cRc and most American hashgachos”), corroborated by OU',
    why: 'Fully-dried wine deposits are treated as “dirt” — non-food — rather than wine. Modern drying achieves what Shulchan Aruch YD 123:16 did with 12 months of air-drying.',
    url: 'https://consumer.crckosher.org/faqs/tartaric-acid-cream-of-tartar/',
  },
  {
    rule: 'Raw staples need no hechsher',
    who: 'Star-K — “Approved Without A Hechsher” (updated June 2025)',
    why: 'Sugar, salt, pure honey, unflavoured coffee & tea, raw rice, oats, dried legumes, baking soda — provided they have no additives.',
    url: 'https://www.star-k.org/articles/kosher-lists/3502/no-hechsher-required/',
    caveat:
      'Conditions attached: not a product of Israel, and grains/rice/flour still get an insect check.',
  },
  {
    rule: 'Extra-virgin olive oil uncertified',
    who: 'OK Kosher — Rabbi Hendel, OK Vaad HaKashrus (Jan 2025)',
    why: 'Extra-virgin/virgin is “pure olive oil that is extracted without heat and does not go through any subsequent processing or refining.” Refined, “light”, pomace and blends are where certification matters.',
    url: 'https://www.ok.org/kosherconnect/the-kashrus-of-vegetable-and-olive-oils/',
    caveat: 'Agencies differ here — two give two answers. Know which one you are following.',
  },
  {
    rule: 'Lecithin, citric acid & pectin are fine',
    who: 'Star-K — Rabbi Tzvi Rosen, “The Secret Ingredient,” Kashrus Kurrents Spring 2012',
    why: 'They appear on the list without a “requires reliable kosher certification” flag — the classic over-worried group.',
    url: 'https://www.star-k.org/articles/kashrus-kurrents/565/the-secret-ingredient/',
  },
  {
    rule: 'V-Label vegan — audited, but not kosher',
    who: 'V-Label International (audits by authorized control bodies; Bio Garantie in Austria)',
    why: 'Certifies the product is “not of animal origin and, at no stage of production and processing” supplemented with animal-origin components. That settles the animal-additive question — and nothing else.',
    url: 'https://www.v-label.com/criteria/',
    caveat: 'Says nothing about dairy equipment, bishul akum, or grape products.',
  },
  {
    rule: 'Fish: fins & scales — buy it skin-on',
    who: 'OU Kosher (Vayikra 11:9); Star-K',
    why: 'OU: “it is generally impossible, even for a ‘maven’, to identify fish without skin.” Star-K treats eating an unverified skinless fillet as a rabbinic prohibition.',
    url: 'https://oukosher.org/blog/consumer-kosher/consumers-faqs-on-kosher-fish/',
  },
  {
    rule: 'Which produce needs insect checking',
    who: 'OU Kosher — “Checking Vegetables for Insect Infestation”',
    why: 'Broccoli and cauliflower are classed as miut hamatzui — infested consistently enough that checking is required. Same for leafy greens (lettuce, spinach, kale, cabbage) and fresh herbs.',
    url: 'https://oukosher.org/blog/consumer-kosher/vegetable-checking/',
  },
];

mount(
  'sources',
  SOURCES.map(
    (s) => `<div class="src">
      <div class="src-rule">${esc(s.rule)}</div>
      <div class="src-who"><span class="src-lbl">Who says it</span> ${esc(s.who)}</div>
      <div class="src-why"><span class="src-lbl">Why</span> ${esc(s.why)}</div>
      ${s.caveat ? `<div class="src-cav"><span class="src-lbl">Caveat</span> ${esc(s.caveat)}</div>` : ''}
      <a class="src-link" href="${esc(s.url)}" target="_blank" rel="noopener">Read the source →</a>
    </div>`,
  ).join(''),
);

export {}; // isolate module scope (no imports/exports otherwise)
