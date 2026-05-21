// Insert photos: [...] field after viewType (or after the last field-before-closing-brace)
// for each LodgingAlt + BaseConfigLodgingPick whose name matches.
// Idempotent: skips if `photos:` already in the alt block.
import fs from 'node:fs';

const FILE = 'src/trip-data.ts';
let src = fs.readFileSync(FILE, 'utf8');

const SALZBURG = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg/1280px-Salzach_and_M%C3%B6nchsberg_seen_from_Elisabethkai_Salzburg_2023-09-27_01.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Salzburg_-_Festung_Hohensalzburg.JPG/1280px-Salzburg_-_Festung_Hohensalzburg.JPG',
];
const OBERTRAUN = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/A-Krippenstein-5fingers-2.jpg/1280px-A-Krippenstein-5fingers-2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Krippenstein_Dachstein_panorama.jpg/1280px-Krippenstein_Dachstein_panorama.jpg',
];
const HALLSTATT = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg/1280px-Boathouses_in_Hallstatt%2C_Austria_-_2017jpg.jpg',
];
const GOSAU = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dachsteingosau.JPG/1280px-Dachsteingosau.JPG',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gosausee_Dachstein_July_2012.jpg/1280px-Gosausee_Dachstein_July_2012.jpg',
];
const RAMSAU_BERCHTESGADEN = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg/1280px-Nationalpark_Berchtesgaden_K%C3%B6nigssee_St._Bartholom%C3%A4_Watzmann-Ostwand_01.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hintersee_-_Hochkalter.jpg/1280px-Hintersee_-_Hochkalter.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg/1280px-Ramsau_Kirche_mit_Wagendrischelhorn_2.jpg',
];
const ST_WOLFGANG = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG/1280px-St._Wolfgang_im_Salzkammergut_Wolfgangsee_1.JPG',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG/1280px-St._Wolfgang_im_Salzkammergut_-_Ortsansicht.JPG',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Schafberg_1.jpg/1280px-Schafberg_1.jpg',
];
const STROBL = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg/1280px-Strobl_-_Wolfgangsee_-_2019_10_01-10.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Panorama_Wolfgangsee.jpg/1280px-Panorama_Wolfgangsee.jpg',
];
const BAD_GOISERN = HALLSTATT; // same area

// name → photo-pool-name (for the area-portion of the carousel; primary photo
// is whatever `img:` already holds for that block).
const NAME_TO_POOL = {
  // Salzburg
  "Junker's Apartments": SALZBURG,
  Sauerweingut: SALZBURG,
  'Villa Salzburg by Welcome to Salzburg': SALZBURG,
  'Pension Elisabeth — Rooms & Apartments': SALZBURG,
  'Amedeo Zotti Residence Salzburg': SALZBURG,
  // Topside is already a Wikimedia URL (fake-sig replaced), include only the second area photo
  'Salzburg Topside Apartments': SALZBURG,
  // Obertraun / Hallstatt
  'Austrian Apartments (Bad Goisern)': BAD_GOISERN,
  'Ferienhof Osl — Urlaub am Bauernhof (Obertraun)': OBERTRAUN,
  'Haus Steinbrecher Hallstatt': HALLSTATT,
  'Landhaus Lilly (Obertraun) — Liz & Paul B&B': OBERTRAUN,
  'Landhaus Osborne (Obertraun)': OBERTRAUN,
  // Gosau
  'Ferienwohnung Schmaranzer (Gosau)': GOSAU,
  'Haus im Grünen (Gosau)': GOSAU,
  'Mühlradl Apartments Gosau': GOSAU,
  // Bad Goisern
  'Pension Sydler (Bad Goisern)': BAD_GOISERN,
  // Hallstatt village (Weisses Lamm is on lake)
  'Weisses Lamm Holiday Home (Hallstatt)': HALLSTATT,
  // Heritage / Bräugasthof already use Wikimedia hallstatt photo as `img` (fake-sig replaced),
  // include alternate Hallstatt + Obertraun mountain shot as the carousel extras
  'Heritage.Hotel Hallstatt (3 restored historic houses)': [...HALLSTATT, ...OBERTRAUN],
  'Bräugasthof Hallstatt (700-year-old lake-edge inn)': [...HALLSTATT, ...OBERTRAUN],
  // Airport / Salzburg
  'Landhotel Berger (Ainring, just over the German border)': SALZBURG,
  'Hotel Astoria': SALZBURG,
  'Goldgasse Apartments de Luxe': SALZBURG,
  'Rock Salzburg': SALZBURG,
  // BaseConfig — Berchtesgaden / Ramsau
  'Apart Chalet Unterbrandnerlehen (Schönau am Königssee)': RAMSAU_BERCHTESGADEN,
  'Gästehaus Hinterponholz (Ramsau)': RAMSAU_BERCHTESGADEN,
  'Wolf & Schaf Apartments-equivalent — Ferienwohnung da Celia (Berchtesgaden town)':
    RAMSAU_BERCHTESGADEN,
  'Gästehaus Amort (Ramsau)': RAMSAU_BERCHTESGADEN,
  'Grubenlehen (Ramsau)': RAMSAU_BERCHTESGADEN,
  // BaseConfig — St. Wolfgang / Strobl
  'Wolf & Schaf Apartments (St. Wolfgang)': ST_WOLFGANG,
  'Wolfgangsee Appartement (St. Wolfgang)': ST_WOLFGANG,
  'Wolfgangsee Appartements (Strobl, east end of the lake)': STROBL,
  'Appartements Mair (Strobl, 70m² 2-BR)': STROBL,
  'Apartment Sunset am Wolfgangsee (Strobl)': STROBL,
};

let updated = 0;
let skipped = 0;
let notMatched = 0;

for (const [name, pool] of Object.entries(NAME_TO_POOL)) {
  // Find the block that starts with `name: '<name>',` or `name: "<name>",`
  // and ends at the next `},` at the same indent (heuristic: line beginning
  // with `        },`).
  const escName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // The name line is indented at some level. The block-close `},` is at
  // (indent - 2) spaces (one indent step less than fields). Match field-
  // indent, then look for `\n<field-indent reduced by 2>},`.
  const re = new RegExp(
    `(\\n(\\s+)name:\\s*(?:'${escName}'|"${escName}"),(?:[\\s\\S]*?))(\\n(\\s+)\\}\\,?)`,
    'g',
  );
  src = src.replace(re, (_match, body, indent, close, _closeIndent) => {
    if (body.includes('photos:')) {
      skipped++;
      return body + close;
    }
    // Find the listing's `img:` value to use as the primary carousel photo.
    const imgMatch = body.match(/^\s+img:\s*'([^']+)'/m);
    const primary = imgMatch ? imgMatch[1] : null;
    if (!primary) {
      notMatched++;
      return body + close;
    }
    const carouselUrls = [primary];
    for (const p of pool) {
      if (!carouselUrls.includes(p)) carouselUrls.push(p);
      if (carouselUrls.length >= 4) break;
    }
    const photosLines = carouselUrls.map((u) => `${indent}  '${u}',`).join('\n');
    const photosBlock = `\n${indent}photos: [\n${photosLines}\n${indent}],`;
    updated++;
    return body + photosBlock + close;
  });
}

fs.writeFileSync(FILE, src);
console.log(
  `Updated: ${updated}, Skipped (already had photos): ${skipped}, Not matched: ${notMatched}`,
);
