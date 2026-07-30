import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const parksPath = path.join(root, 'src/data/generated/parks.json');
const parkCsvPath = path.join(
  root,
  'LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv',
);
const backlogPath = path.join(root, 'reports/thin-page-backlog.csv');
const backlogSummaryPath = path.join(root, 'reports/thin-page-backlog-summary.md');
const reviewQueuePath = path.join(root, 'reports/content-review-queue.csv');

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
            const text = String(field);
            const escaped = text.replace(/"/g, '""');
            return /[",\n\r]/.test(text) ? `"${escaped}"` : escaped;
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

function removeCsvRow(csvPath, predicate) {
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const header = rows[0];
  const filtered = [header, ...rows.slice(1).filter((row) => !predicate(row, header))];
  fs.writeFileSync(csvPath, stringifyCsv(filtered));
}

const parks = JSON.parse(fs.readFileSync(parksPath, 'utf8'));
const park = parks.find((entry) => entry.slug === 'queensland-off-leash-area');

if (!park) {
  throw new Error('Queensland Off-Leash Area record not found');
}

const seoTitle = 'Queensland Off-Leash Area | Calgary Areas 1-3 Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Queensland Off-Leash Area in Calgary, covering the City of Calgary’s three mapped Queensland off-leash sites, multi-use rules, pathway leash requirement, and practical visit context for southeast Calgary dog owners.';
const intro =
  '<p>Queensland Off-Leash Area is not a single simple dog park. The City of Calgary currently lists <strong>three separate Queensland off-leash sites</strong> in southeast Calgary: Area 1, Area 2, and Area 3.</p>';
const body =
  "<p>Calgary&apos;s current official off-leash page lists Queensland under the southeast quadrant with <strong>Area 1, Area 2, and Area 3</strong>, and the city still links separate map PDFs for each site. Those map files identify the locations as <strong>QLD-001</strong>, <strong>QLD-002</strong>, and <strong>QLD-003</strong>, which is materially more specific than the older version of this page. This profile has therefore been rewritten as a neighbourhood off-leash system guide rather than pretending there is only one compact park entrance.</p><p>The official city source is also clear on two practical rules that matter for visits: all Calgary off-leash areas are <strong>multi-use areas</strong>, and <strong>dogs are required to be on leash on a paved pathway in an off-leash area</strong>. That means Queensland works best for handlers who want flexible local options for walking and open-space exercise, but who also understand that shared pathways and adjacent park uses are part of the experience. The linked city PDFs show garbage bins and parking-lot symbols on the mapped sites, and the terrain appears to vary from open grass to more treed or pathway-connected sections depending on which Queensland area you choose.</p><p>Because the current official page groups Queensland into three separate mapped sites instead of publishing one clean park-detail page with a single size figure or amenity table, this guide avoids invented claims about acreage and exact feature parity across all three areas. Use it as a practical starting point: Queensland offers multiple southeast Calgary off-leash options, operates under standard Calgary off-leash hours of <strong>5 am to 11 pm</strong>, and is best understood as a cluster of local areas rather than one fenced dog-only destination.</p>";
const notes =
  '<p>Primary source: https://www.calgary.ca/parks/off-leash-locations.html. Supporting official maps reviewed July 29, 2026: https://www.calgary.ca/content/dam/www/corporate-communications/locations/queensland-off-leash-area1.pdf, https://www.calgary.ca/content/dam/www/corporate-communications/locations/queensland-off-leash-area2.pdf, and https://www.calgary.ca/content/dam/www/corporate-communications/locations/queensland-off-leash-area3.pdf. Coordinates below are an approximate profile centroid for mapping support because the city currently publishes Queensland as three separate mapped areas rather than one single point.</p>';

Object.assign(park, {
  title: 'Queensland Off-Leash Area | Calgary Areas 1-3 Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['multi-area', 'off-leash', 'southeast-calgary', 'grass-and-pathways'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Queensland Off-Leash Area | Calgary Areas 1-3 Guide',
  Description:
    '<p>Queensland Off-Leash Area is a three-site Calgary off-leash cluster, with the City of Calgary currently listing Areas 1, 2, and 3 in southeast Calgary.</p>',
  'Street Address': 'Queensland, Areas 1-3, southeast Calgary',
  latitude: '50.9443',
  longitude: '-114.0125',
  'Surface type': 'Grass, open parkland, and paved pathway connections',
  Size: 'Multiple city-mapped areas - verify each site on arrival',
  'Water source available': 'Unknown - bring your own water',
  Benches: 'Varies by area',
  'Shaded area': 'Varies by area',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Parking-lot symbols appear on city maps; verify nearest access point on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': '5:00 AM to 11:00 PM',
  'Seasonal Restrictions': 'Standard Calgary park and off-leash rules apply',
  'Park Website or Source': 'https://www.calgary.ca/parks/off-leash-locations.html',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Queensland+Off-Leash+Area+Calgary',
  Tags: 'multi-area, off-leash, southeast-calgary, grass-and-pathways',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'queensland-off-leash-area', {
  'Park Header': 'Queensland Off-Leash Area | Calgary Areas 1-3 Guide',
  Description:
    '<p>Queensland Off-Leash Area is a three-site Calgary off-leash cluster, with the City of Calgary currently listing Areas 1, 2, and 3 in southeast Calgary.</p>',
  'Street Address': 'Queensland, Areas 1-3, southeast Calgary',
  latitude: '50.9443',
  longitude: '-114.0125',
  'Surface type': 'Grass, open parkland, and paved pathway connections',
  Size: 'Multiple city-mapped areas - verify each site on arrival',
  'Water source available': 'Unknown - bring your own water',
  Benches: 'Varies by area',
  'Shaded area': 'Varies by area',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Parking-lot symbols appear on city maps; verify nearest access point on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': '5:00 AM to 11:00 PM',
  'Seasonal Restrictions': 'Standard Calgary park and off-leash rules apply',
  'Park Website or Source': 'https://www.calgary.ca/parks/off-leash-locations.html',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Queensland+Off-Leash+Area+Calgary',
  Tags: 'multi-area, off-leash, southeast-calgary, grass-and-pathways',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Queensland Off-Leash Area,/dog-parks/queensland-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/queensland-off-leash-area/"') || row.join(',').includes(',/dog-parks/queensland-off-leash-area/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 604 pages in the current working queue.', 'This backlog contains 603 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 243 |', '| T2-high-value-expansion | 242 |');
summary = summary.replace('| Dog Parks | 431 |', '| Dog Parks | 430 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Queensland Off-Leash Area record and refreshed backlog files.');
