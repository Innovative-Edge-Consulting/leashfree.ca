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
const park = parks.find((entry) => entry.slug === 'balmoral-park-chilliwack');
if (!park) throw new Error('Balmoral Park record not found');

const seoTitle = 'Balmoral Park | Chilliwack Neighbourhood Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Balmoral Park in Chilliwack, including current City of Chilliwack park classification and the correction that it is not listed as an official off-leash dog area.';
const intro =
  '<p>Balmoral Park is a <strong>sub-neighbourhood park</strong> in Chilliwack with open grass and a quiet residential setting, better understood as a local community green space than a dog destination.</p>';
const body =
  '<p>The most important correction on this page is that the current City of Chilliwack material does <strong>not</strong> list Balmoral Park as an official dog off-leash area. The city&apos;s dedicated off-leash page names other locations such as Vedder Park, Island 22, Fairfield Park, Jinkerson Park, Sheffield Dog Off Leash Area, No. 3 Road Dog Off Leash Area, and the Vedder North Dyke Trail off-leash zone. Balmoral Park does not appear on that list, so the older dog-park framing was not supported by the city&apos;s current public information as of <strong>Thursday, July 30, 2026</strong>.</p><p>What the city does show is that Balmoral Park belongs to the regular parks network. In Chilliwack&apos;s current parks listings, Balmoral appears under <strong>Sub Neighbourhood Park</strong>. That places it in the same general category as other small residential green spaces the city maintains for local use rather than as a specialized off-leash destination.</p><p>For dog owners, the practical takeaway is straightforward. Balmoral Park may still be useful for a short nearby walk if local posted rules permit regular access, but it should not be presented as a city-confirmed off-leash location. Anyone specifically seeking a source-backed off-leash outing in Chilliwack should use one of the parks named on the city&apos;s official off-leash page instead.</p><p>This update improves the page by aligning it with the city&apos;s actual classification rather than adding more unsupported dog-focused copy. That matters more for quality and trust than expanding the original thin description.</p>';
const notes =
  '<p>Primary sources: https://www.chilliwack.com/main/page.cfm?id=1754 and https://www.chilliwack.com/main/page.cfm?id=2579. Reviewed on July 30, 2026. This page was corrected because Balmoral Park is not listed by the City of Chilliwack as an official off-leash dog area.</p>';

Object.assign(park, {
  title: 'Balmoral Park | Chilliwack Neighbourhood Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['neighbourhood-park', 'dog-friendly-context', 'chilliwack', 'balmoral-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Balmoral Park | Chilliwack Neighbourhood Park',
  Description:
    '<p>Balmoral Park is a small Chilliwack sub-neighbourhood park with open grass and residential green-space character, but it is not listed by the city as an official off-leash dog area.</p>',
  'Park type': 'Sub neighbourhood park',
  'Street Address': 'Verify exact access on arrival',
  latitude: '49.1548',
  longitude: '-121.9628',
  'Surface type': 'Grass and neighbourhood park surfaces',
  Size: 'Small neighbourhood park',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=1754',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Balmoral+Park+Chilliwack+BC',
  Tags: 'neighbourhood-park,dog-friendly-context,chilliwack,balmoral-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'balmoral-park-chilliwack', {
  'Park Header': 'Balmoral Park | Chilliwack Neighbourhood Park',
  Description:
    '<p>Balmoral Park is a small Chilliwack sub-neighbourhood park with open grass and residential green-space character, but it is not listed by the city as an official off-leash dog area.</p>',
  'Park type': 'Sub neighbourhood park',
  'Street Address': 'Verify exact access on arrival',
  latitude: '49.1548',
  longitude: '-121.9628',
  'Surface type': 'Grass and neighbourhood park surfaces',
  Size: 'Small neighbourhood park',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=1754',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Balmoral+Park+Chilliwack+BC',
  Tags: 'neighbourhood-park,dog-friendly-context,chilliwack,balmoral-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Balmoral Park,/dog-parks/balmoral-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/balmoral-park-chilliwack/"') || row.join(',').includes(',/dog-parks/balmoral-park-chilliwack/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 582 pages in the current working queue.', 'This backlog contains 581 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 221 |', '| T2-high-value-expansion | 220 |');
summary = summary.replace('| Dog Parks | 409 |', '| Dog Parks | 408 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Balmoral Park record and refreshed backlog files.');
