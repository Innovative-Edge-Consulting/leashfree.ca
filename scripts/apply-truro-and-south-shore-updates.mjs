import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const citiesPath = path.join(root, 'src/data/generated/cities.json');
const parksPath = path.join(root, 'src/data/generated/parks.json');
const overridesPath = path.join(root, 'src/data/dog-park-image-overrides.js');
const cityCsvPath = path.join(
  root,
  'LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv',
);
const parkCsvPath = path.join(
  root,
  'LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv',
);
const backlogPath = path.join(root, 'reports/thin-page-backlog.csv');
const backlogSummaryPath = path.join(root, 'reports/thin-page-backlog-summary.md');

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function stringifyCsv(rows) {
  return (
    rows
      .map((row) =>
        row
          .map((field = '') => {
            const needsQuotes = /[",\n\r]/.test(field);
            const escaped = String(field).replace(/"/g, '""');
            return needsQuotes ? `"${escaped}"` : escaped;
          })
          .join(','),
      )
      .join('\n') + '\n'
  );
}

function updateCsvRow(csvPath, keyField, keyValue, updates) {
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const header = rows[0];
  const keyIndex = header.indexOf(keyField);

  if (keyIndex === -1) {
    throw new Error(`CSV field not found: ${keyField}`);
  }

  const row = rows.find((entry, index) => index > 0 && entry[keyIndex] === keyValue);

  if (!row) {
    throw new Error(`CSV row not found for ${keyField}=${keyValue}`);
  }

  for (const [field, value] of Object.entries(updates)) {
    const index = header.indexOf(field);
    if (index === -1) {
      throw new Error(`CSV field not found: ${field}`);
    }
    row[index] = value;
  }

  fs.writeFileSync(csvPath, stringifyCsv(rows));
}

const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const parks = JSON.parse(fs.readFileSync(parksPath, 'utf8'));

const truro = cities.find((entry) => entry.slug === 'truro');
if (!truro) {
  throw new Error('Truro city record not found');
}

const southShore = parks.find((entry) => entry.slug === 'south-shore-vet-dog-zone');
if (!southShore) {
  throw new Error('South Shore Vet Dog Zone park record not found');
}

const truroSeoTitle = 'Truro Dog Park and Dog Licence Rules | LeashFree.ca';
const truroMetaDescription =
  'Source-backed Truro guide covering the shared Truro-Bible Hill Off-Leash Dog Park on Marshland Drive, official park rules, current Town of Truro dog licensing requirements, and the SPCA contact for dog complaints.';
const truroIntro =
  '<p>Truro’s main off-leash option is a shared Truro and Bible Hill facility on Marshland Drive, with published rules that are more specific than the old generic page suggested.</p>';
const truroAbout =
  "<p>The Truro-Bible Hill Off-Leash Dog Park is officially presented by the Town of Truro Department of Parks, Recreation and Culture together with the Village of Bible Hill. The two municipal pages align on the essentials: the park is on Marshland Drive, includes a small-dog area within the larger off-leash space, and is a free public facility with more than a hectare of fenced-in property that includes grassy play areas, trees, and water. The Town of Truro page gives the clearest location reference by listing the park at 514 Marshland Drive, while the Bible Hill page places it near the Colchester Legion Stadium.</p><p>The published rules are also clear and useful for visitors. Both official pages say children under 12 are not permitted in the park at any time, even with parental supervision. They also say dogs must be legally licensed and vaccinated, must wear a visible dog licence, and that one handler may bring no more than two dogs. Separate from the park page, the Town of Truro’s dog-licensing page says Town residents who own a dog must buy a Town of Truro dog licence, that the licence is valid for the lifetime of the dog, and that the fee is $25 with a $25 replacement cost. For enforcement, the Town’s complaint page says Truro does not handle dog-related complaints directly and tells residents to contact the SPCA Bylaw Enforcement Officer at 902-893-7968 for stray or dangerous dog concerns.</p>";
const truroSeasonalTips =
  '<ul><li><strong>Winter:</strong> the park remains usable, but fenced entries and packed snow can change traction quickly.</li><li><strong>Spring:</strong> grassy sections can soften during thaw, so towels and paw cleanup are worth planning for.</li><li><strong>Summer:</strong> the park’s size and open use make early or later visits easier when heat builds.</li><li><strong>Fall:</strong> cooler weather usually makes longer off-leash sessions more comfortable, especially for high-energy dogs.</li></ul>';
const truroParkRules =
  '<p><strong>Official shared facility:</strong> the park is jointly presented by the Town of Truro and the Village of Bible Hill.</p><p><strong>Location:</strong> the Town of Truro lists the park at 514 Marshland Drive.</p><p><strong>Children:</strong> official rules say children under 12 are not permitted in the park at any time, even with parental supervision.</p><p><strong>Licensing and vaccination:</strong> dogs must be legally licensed and vaccinated and must wear a visible dog licence.</p><p><strong>Handler limit:</strong> one handler may bring a maximum of two dogs.</p><p><strong>Complaints:</strong> the Town of Truro directs stray or dangerous dog complaints to the SPCA Bylaw Enforcement Officer at 902-893-7968.</p>';
const truroEtiquette =
  '<p><strong>1. Arrive ready for posted rules, not assumptions.</strong></p><p>This park has a published age restriction, licensing requirement, and two-dog-per-handler limit, so it should be treated as a structured municipal facility.</p><p><strong>2. Use the small-dog area intentionally.</strong></p><p>The official pages confirm a dedicated smaller area within the larger park, which makes calmer introductions easier for timid dogs.</p><p><strong>3. Keep proof of licensing current.</strong></p><p>The park rules require a visible dog licence, and Town of Truro residents are expected to maintain the town-issued tag for the life of the dog.</p><p><strong>4. Don’t misread “water” as a guaranteed drinking station.</strong></p><p>The official park pages say the property includes water, but they do not publish a detailed amenity list, so bring your own drinking water when certainty matters.</p><p><strong>5. Use the correct complaint channel.</strong></p><p>The Town says dog-related complaints go to the SPCA Bylaw Enforcement Officer rather than through Truro’s normal municipal complaint handling.</p>';
const truroFaqs =
  '<p><strong>1. Is there an official off-leash dog park in Truro?</strong></p><p>Yes. The Town of Truro and the Village of Bible Hill both publish the Truro-Bible Hill Off-Leash Dog Park as the area’s shared public off-leash facility.</p><p><strong>2. Where is the park located?</strong></p><p>The Town of Truro lists the park at 514 Marshland Drive.</p><p><strong>3. Does the park have a small-dog area?</strong></p><p>Yes. Both official pages say the park includes a small-dog area within the boundaries of the larger park.</p><p><strong>4. Can children go inside the off-leash area?</strong></p><p>No. The official rules say children under 12 are not permitted in the park at any time, even with parental supervision.</p><p><strong>5. Do dogs need to be licensed?</strong></p><p>Yes. The park rules say dogs must be legally licensed and vaccinated and must wear a visible dog licence.</p><p><strong>6. Who handles dog complaints in Truro?</strong></p><p>The Town says dog-related complaints, including stray or dangerous dog concerns, should be directed to the SPCA Bylaw Enforcement Officer at 902-893-7968.</p>';

Object.assign(truro, {
  seoTitle: truroSeoTitle,
  metaDescription: truroMetaDescription,
  description: truroMetaDescription,
  body: truroAbout,
  references: {
    ...(truro.references || {}),
    'Featured Park 1': ['truro-bible-hill-off-leash-dog-park'],
    'Featured Park 2': [],
    'Featured Park 3': [],
    'Province Page': ['https://leashfree.ca/nova-scotia-dog-parks'],
  },
});

Object.assign(truro.raw, {
  'SEO Title Tag': truroSeoTitle,
  'Meta Description': truroMetaDescription,
  'Hero Image': '',
  'Intro Paragraph': truroIntro,
  'About Section': truroAbout,
  'Featured Park 1': 'truro-bible-hill-off-leash-dog-park',
  'Featured Park 2': '',
  'Featured Park 3': '',
  'Seasonal Tips': truroSeasonalTips,
  'Park Rules': truroParkRules,
  'City Website': 'https://truro.ca/truro-bible-hill-off-leash-dog-park.html',
  'Province Page': 'https://leashfree.ca/nova-scotia-dog-parks',
  'Dog Park Etiquettes': truroEtiquette,
  'Dog Park FAQs': truroFaqs,
  'Nearby Cities': '',
  'Reviewed On': '2026-07-29',
  'Updated On': 'Wed Jul 29 2026 23:50:00 GMT+0000 (Coordinated Universal Time)',
});

const southShoreSeoTitle = 'South Shore Vet Dog Zone | Bridgewater Dog Park | LeashFree.ca';
const southShoreMetaDescription =
  'Source-backed profile for South Shore Vet Dog Zone in Bridgewater, covering its fenced off-leash setting within Generations Active Park, July 6, 2017 opening date, and the town’s published leash rule for other parks.';
const southShoreIntro =
  '<p>South Shore Vet Dog Zone is Bridgewater’s published fenced off-leash dog-park area, located within the broader Generations Active Park project.</p>';
const southShoreBody =
  "<p>The Town of Bridgewater identifies South Shore Vet Dog Zone as the fenced-in off-leash exception within its wider parks system. On the town’s Parks and Trails page, Bridgewater asks visitors to keep pets on leash in town parks except within this fenced area, which makes the dog zone the clearest official off-leash destination in the municipality.</p><p>The town’s dedicated page adds the historical context that the old profile lacked. Bridgewater says the dog park grew out of the Generations Active Park master plan on the west side of Glen Allan Drive, with the leash-free dog park identified as a high-priority project during public consultation. The town also says the South Shore Vet Dog Zone officially opened to the public on July 6, 2017 after several years of design, site preparation, and fundraising support.</p>";

Object.assign(southShore, {
  title: 'South Shore Vet Dog Zone',
  seoTitle: southShoreSeoTitle,
  metaDescription: southShoreMetaDescription,
  description: southShoreIntro,
  body: southShoreBody,
  references: {
    ...(southShore.references || {}),
    Tags: ['leash-free', 'fenced'],
  },
});

Object.assign(southShore.raw, {
  'Park Header': 'South Shore Vet Dog Zone',
  Description: '<p>Fenced municipal off-leash dog park in Bridgewater tied to the Generations Active Park project.</p>',
  'Separate Small Dog Area': 'Unknown',
  'Surface type': 'grass, natural',
  Size: 'More than 1 hectare',
  'Water source available': 'Unknown',
  Benches: 'Unknown',
  'Shaded area': 'Unknown',
  'Waste bins': 'Unknown',
  'Bag Dispensers': 'Unknown',
  'Parking Available': 'Unknown',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Unknown',
  Tags: 'leash-free, fenced',
  'Notes / Comments':
    '<p>Town of Bridgewater says this fenced dog park grew out of the Generations Active Park master plan and officially opened to the public on July 6, 2017.</p>',
  'Intro Paragraph': southShoreIntro,
  'Reviewed On': '2026-07-29',
  'Meta Title': southShoreSeoTitle,
  'Meta Description': southShoreMetaDescription,
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');
fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

let overrides = fs.readFileSync(overridesPath, 'utf8');
if (!overrides.includes('"truro": "/images/cities/city-truro-hero.png"')) {
  overrides = overrides.replace(
    /(const originalCityHeroImages = \{\n)/,
    '$1  "truro": "/images/cities/city-truro-hero.png",\n',
  );
  fs.writeFileSync(overridesPath, overrides);
}

updateCsvRow(cityCsvPath, 'Slug', 'truro', {
  'SEO Title Tag': truroSeoTitle,
  'Meta Description': truroMetaDescription,
  'Hero Image': '',
  'Intro Paragraph': truroIntro,
  'About Section': truroAbout,
  'Featured Park 1': 'truro-bible-hill-off-leash-dog-park',
  'Featured Park 2': '',
  'Featured Park 3': '',
  'Seasonal Tips': truroSeasonalTips,
  'Park Rules': truroParkRules,
  'City Website': 'https://truro.ca/truro-bible-hill-off-leash-dog-park.html',
  'Province Page': 'https://leashfree.ca/nova-scotia-dog-parks',
  'Dog Park Etiquettes': truroEtiquette,
  'Dog Park FAQs': truroFaqs,
  'Nearby Cities': '',
  'Reviewed On': '2026-07-29',
  'Updated On': 'Wed Jul 29 2026 23:50:00 GMT+0000 (Coordinated Universal Time)',
});

updateCsvRow(parkCsvPath, 'slug', 'south-shore-vet-dog-zone', {
  'Park Header': 'South Shore Vet Dog Zone',
  Description: '<p>Fenced municipal off-leash dog park in Bridgewater tied to the Generations Active Park project.</p>',
  'Separate Small Dog Area': 'Unknown',
  'Surface type': 'grass, natural',
  Size: 'More than 1 hectare',
  'Water source available': 'Unknown',
  Benches: 'Unknown',
  'Shaded area': 'Unknown',
  'Waste bins': 'Unknown',
  'Bag Dispensers': 'Unknown',
  'Parking Available': 'Unknown',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Unknown',
  Tags: 'leash-free, fenced',
  'Notes / Comments':
    '<p>Town of Bridgewater says this fenced dog park grew out of the Generations Active Park master plan and officially opened to the public on July 6, 2017.</p>',
  'Intro Paragraph': southShoreIntro,
  'Reviewed On': '2026-07-29',
  'Meta Title': southShoreSeoTitle,
  'Meta Description': southShoreMetaDescription,
});

const backlogLines = fs.readFileSync(backlogPath, 'utf8').trimEnd().split(/\r?\n/);
const header = backlogLines[0];
const filtered = [
  header,
  ...backlogLines.slice(1).filter(
    (line) =>
      !line.includes(',City Pages,Truro,/dog-parks/truro/,') &&
      !line.includes(',Dog Parks,South Shore Vet Dog Zone,/dog-parks/south-shore-vet-dog-zone/,'),
  ),
];
fs.writeFileSync(backlogPath, filtered.join('\n') + '\n');

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 610 pages in the current working queue.', 'This backlog contains 608 pages in the current working queue.');
summary = summary.replace('| T3-standard-expansion | 363 |', '| T3-standard-expansion | 362 |');
summary = summary.replace('| T1-source-research | 4 |', '| T1-source-research | 3 |');
summary = summary.replace('| Dog Parks | 435 |', '| Dog Parks | 434 |');
summary = summary.replace('| City Pages | 8 |', '| City Pages | 7 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Truro city page, cleaned South Shore Vet Dog Zone, and refreshed backlog files.');
