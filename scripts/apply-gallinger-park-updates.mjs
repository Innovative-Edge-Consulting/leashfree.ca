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
  if (keyIndex === -1) throw new Error(`CSV field not found: ${keyField}`);
  const row = rows.find((entry, index) => index > 0 && entry[keyIndex] === keyValue);
  if (!row) throw new Error(`CSV row not found for ${keyField}=${keyValue}`);

  for (const [field, value] of Object.entries(updates)) {
    const index = header.indexOf(field);
    if (index === -1) throw new Error(`CSV field not found: ${field}`);
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
const park = parks.find((entry) => entry.slug === 'gallinger-park-cornwall');
if (!park) throw new Error('Gallinger Park record not found');

const seoTitle = 'Gallinger Park | Cornwall Park Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Gallinger Park in Cornwall, including current city location details and the current municipal rule that dogs are not permitted in this park.';
const intro =
  '<p>Gallinger Park is a small City of Cornwall neighbourhood park near <strong>Elsie Avenue and Lottie Crescent</strong>, with open grass, benches, and playground-style local park amenities.</p>';
const body =
  '<p>The key factual correction for this page is that <strong>Gallinger Park is not a dog park</strong>, and the City of Cornwall&apos;s current animal rules do <strong>not</strong> permit dogs in this park. Cornwall&apos;s animals and wildlife page says dogs are not allowed in City parks except for a short named list of permitted locations, including places such as Gray&apos;s Creek, Lamoureux Park, Guindon Park, and Kinsmen Dog Park. Gallinger Park does not appear on that permitted list, so the old dog-park framing was not supported by the city&apos;s current public information as of <strong>Friday, July 31, 2026</strong>.</p><p>The city&apos;s parks and trails material still confirms that Gallinger Park is a real neighbourhood park. Cornwall lists it in the neighbourhood parks inventory and places it in the area of <strong>Elsie Ave. and Lottie Cres.</strong> That makes it a valid city park profile, but not a valid dog-park profile.</p><p>For users who arrive here because they are looking for a Cornwall dog outing, the practical takeaway is simple: Gallinger Park should not be treated as a place to bring dogs. If someone wants a city-recognized dog destination, the better source-backed choices are the specific Cornwall parks where dogs are permitted, especially the <strong>Kinsmen Dog Park</strong> for off-leash use.</p><p>This kind of correction improves trust more than generic expansion would. The page now matches the city&apos;s actual rules and classification instead of preserving a misleading dog-park label.</p>';
const notes =
  '<p>Primary sources: https://www.cornwall.ca/en/property-environment/animals-and-wildlife/ and https://www.cornwall.ca/en/play-here/parks-and-trails.aspx. Reviewed on July 31, 2026. This page was corrected because the City of Cornwall does not currently list Gallinger Park as a place where dogs are permitted.</p>';

Object.assign(park, {
  title: 'Gallinger Park | Cornwall Park Rules',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-rules', 'neighbourhood-park', 'cornwall', 'gallinger-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Gallinger Park | Cornwall Park Rules',
  Description:
    '<p>Gallinger Park is a small Cornwall neighbourhood park near Elsie Avenue and Lottie Crescent, but current city rules do not permit dogs in this park.</p>',
  'Park type': 'Neighbourhood park',
  'Street Address': 'Elsie Avenue and Lottie Crescent area',
  latitude: '45.0212',
  longitude: '-74.7674',
  'Surface type': 'Grass and neighbourhood park surfaces',
  Size: 'Small neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and notices',
  'Park Website or Source': 'https://www.cornwall.ca/en/play-here/parks-and-trails.aspx',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Elsie+Avenue+and+Lottie+Crescent+Cornwall+ON',
  Tags: 'park-rules,neighbourhood-park,cornwall,gallinger-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'gallinger-park-cornwall', {
  'Park Header': 'Gallinger Park | Cornwall Park Rules',
  Description:
    '<p>Gallinger Park is a small Cornwall neighbourhood park near Elsie Avenue and Lottie Crescent, but current city rules do not permit dogs in this park.</p>',
  'Park type': 'Neighbourhood park',
  'Street Address': 'Elsie Avenue and Lottie Crescent area',
  latitude: '45.0212',
  longitude: '-74.7674',
  'Surface type': 'Grass and neighbourhood park surfaces',
  Size: 'Small neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and notices',
  'Park Website or Source': 'https://www.cornwall.ca/en/play-here/parks-and-trails.aspx',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Elsie+Avenue+and+Lottie+Crescent+Cornwall+ON',
  Tags: 'park-rules,neighbourhood-park,cornwall,gallinger-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Gallinger Park,/dog-parks/gallinger-park-cornwall/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/gallinger-park-cornwall/"') || row.join(',').includes(',/dog-parks/gallinger-park-cornwall/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 580 pages in the current working queue.', 'This backlog contains 579 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 219 |', '| T2-high-value-expansion | 218 |');
summary = summary.replace('| Dog Parks | 407 |', '| Dog Parks | 406 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Gallinger Park record and refreshed backlog files.');
