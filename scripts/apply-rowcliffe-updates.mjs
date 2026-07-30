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
const park = parks.find((entry) => entry.slug === 'rowcliffe-park-kelowna');

if (!park) {
  throw new Error('Rowcliffe Park record not found');
}

const seoTitle = 'Rowcliffe Park | Kelowna On-Leash and Off-Leash Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Rowcliffe Park in Kelowna, including the City of Kelowna’s 536 Rowcliffe Ave listing, on-leash and off-leash dog status, 0.12-hectare size, and current park plan context.';
const intro =
  '<p>Rowcliffe Park is a small City of Kelowna park at <strong>536 Rowcliffe Ave</strong> where the official city listing currently shows dog status as <strong>on-leash and off-leash</strong>.</p>';
const body =
  "<p>The City of Kelowna&apos;s current park page is more precise than the older version of this profile. It lists Rowcliffe Park at <strong>536 Rowcliffe Ave</strong>, classifies it simply as a <strong>park</strong>, and gives it a published area of <strong>0.12 ha</strong>. Most importantly for this guide, the official dog status is not exclusively off-leash. The city lists Rowcliffe as <strong>on-leash and off-leash</strong>, which means visitors should expect a mixed-use neighbourhood park setting rather than a large dedicated dog-only run.</p><p>The same official source also highlights Rowcliffe&apos;s inclusive playground, which reinforces that this is a compact shared urban park. That context matters because the previous copy leaned too hard on the fenced-dog-run framing without acknowledging that Rowcliffe is a broader public park with multiple uses. Kelowna&apos;s dog parks page separately includes Rowcliffe among the city&apos;s off-leash dog park locations, so there is good official support for dogs being able to go off leash here, but the city&apos;s own wording is still best read as a hybrid on-leash/off-leash space rather than a single-purpose fenced enclosure.</p><p>Kelowna also publishes a Rowcliffe Park Plan document, which adds useful planning context even if the listing page remains the stronger source for active visit details. For practical trip planning, treat Rowcliffe as a small central Kelowna dog stop: useful for short sessions, local walks, and quick exercise, but not a destination for long trail-style outings or large separate amenities.</p>";
const notes =
  '<p>Primary source: https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/rowcliffe-park. Supporting source: https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks. Planning context source: https://www.kelowna.ca/documents/rowcliffe-park-plan. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Rowcliffe Park | Kelowna On-Leash and Off-Leash Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['on-leash-and-off-leash', 'small-park', 'urban', 'kelowna'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Rowcliffe Park | Kelowna On-Leash and Off-Leash Dog Park',
  Description:
    '<p>Rowcliffe Park is a small City of Kelowna park where the official city listing currently shows dog status as both on-leash and off-leash.</p>',
  'Park type': 'Park',
  latitude: '49.8839',
  longitude: '-119.4934',
  'Surface type': 'Unknown - verify on arrival',
  Size: '0.12 ha',
  'Water source available': 'Unknown',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Unknown - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking nearby',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Check city signage on arrival',
  'Seasonal Restrictions': 'Check posted rules and city updates',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/rowcliffe-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Rowcliffe+Park+536+Rowcliffe+Ave+Kelowna+BC',
  Tags: 'on-leash-and-off-leash, small-park, urban, kelowna',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'rowcliffe-park-kelowna', {
  'Park Header': 'Rowcliffe Park | Kelowna On-Leash and Off-Leash Dog Park',
  Description:
    '<p>Rowcliffe Park is a small City of Kelowna park where the official city listing currently shows dog status as both on-leash and off-leash.</p>',
  'Park type': 'Park',
  latitude: '49.8839',
  longitude: '-119.4934',
  'Surface type': 'Unknown - verify on arrival',
  Size: '0.12 ha',
  'Water source available': 'Unknown',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Unknown - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking nearby',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Check city signage on arrival',
  'Seasonal Restrictions': 'Check posted rules and city updates',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/rowcliffe-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Rowcliffe+Park+536+Rowcliffe+Ave+Kelowna+BC',
  Tags: 'on-leash-and-off-leash, small-park, urban, kelowna',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Rowcliffe Park,/dog-parks/rowcliffe-park-kelowna/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/rowcliffe-park-kelowna/"') || row.join(',').includes(',/dog-parks/rowcliffe-park-kelowna/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 602 pages in the current working queue.', 'This backlog contains 601 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 241 |', '| T2-high-value-expansion | 240 |');
summary = summary.replace('| Dog Parks | 429 |', '| Dog Parks | 428 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Rowcliffe Park record and refreshed backlog files.');
