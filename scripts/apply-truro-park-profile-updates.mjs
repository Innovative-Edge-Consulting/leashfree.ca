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

const parks = JSON.parse(fs.readFileSync(parksPath, 'utf8'));
const park = parks.find((entry) => entry.slug === 'truro-bible-hill-off-leash-dog-park');

if (!park) {
  throw new Error('Truro-Bible Hill Off-Leash Dog Park record not found');
}

const seoTitle = 'Truro-Bible Hill Off-Leash Dog Park | Truro Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed profile for Truro-Bible Hill Off-Leash Dog Park, covering the official 514 Marshland Drive location, small-dog area, more-than-one-hectare fenced layout, published rules, and Town of Truro licensing context.';
const intro =
  '<p>Truro-Bible Hill Off-Leash Dog Park is the shared public off-leash facility published by the Town of Truro and the Village of Bible Hill.</p>';
const body =
  "<p>The official Truro and Bible Hill pages describe this as a shared off-leash park on Marshland Drive, with the Town of Truro listing the address as 514 Marshland Drive. The municipal pages agree that the park includes a small-dog area within the larger off-leash space and that the free public facility contains more than a hectare of fenced-in property with grassy play areas, trees, and water.</p><p>The rules are more specific than the previous profile suggested. Both official sources say children under 12 are not permitted in the park at any time, even with parental supervision. They also say all dogs must be legally licensed and vaccinated, must wear a visible dog licence, and that one handler is limited to a maximum of two dogs. The Town of Truro’s dog-licensing page adds the town-wide ownership requirement for residents: a Town of Truro dog licence is required, valid for the lifetime of the dog, and costs $25, with a $25 replacement cost.</p>";
const notes =
  '<p>Official municipal sources say the park is located at 514 Marshland Drive, includes a small-dog area, contains more than a hectare of fenced property, and is open seven days a week.</p>';

Object.assign(park, {
  title: 'Truro-Bible Hill Off-Leash Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['leash-free', 'fenced', 'small-dog-area', 'water'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Truro-Bible Hill Off-Leash Dog Park',
  Description:
    '<p>Official shared off-leash dog park in Truro and Bible Hill with a fenced layout, small-dog area, and more than one hectare of space.</p>',
  'Separate Small Dog Area': 'Yes',
  'Surface type': 'grass, natural',
  Size: 'More than 1 hectare',
  'Water source available': 'Yes',
  Benches: 'Unknown',
  'Shaded area': 'Unknown',
  'Waste bins': 'Unknown',
  'Bag Dispensers': 'Unknown',
  'Parking Available': 'Unknown',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Open seven days a week',
  'Seasonal Restrictions': 'Unknown',
  Tags: 'leash-free, fenced, small-dog-area, water',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'truro-bible-hill-off-leash-dog-park', {
  'Park Header': 'Truro-Bible Hill Off-Leash Dog Park',
  Description:
    '<p>Official shared off-leash dog park in Truro and Bible Hill with a fenced layout, small-dog area, and more than one hectare of space.</p>',
  'Separate Small Dog Area': 'Yes',
  'Surface type': 'grass, natural',
  Size: 'More than 1 hectare',
  'Water source available': 'Yes',
  Benches: 'Unknown',
  'Shaded area': 'Unknown',
  'Waste bins': 'Unknown',
  'Bag Dispensers': 'Unknown',
  'Parking Available': 'Unknown',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Open seven days a week',
  'Seasonal Restrictions': 'Unknown',
  Tags: 'leash-free, fenced, small-dog-area, water',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

const backlogLines = fs.readFileSync(backlogPath, 'utf8').trimEnd().split(/\r?\n/);
const header = backlogLines[0];
const filtered = [
  header,
  ...backlogLines
    .slice(1)
    .filter((line) => !line.includes(',Dog Parks,Truro-Bible Hill Off-Leash Dog Park,/dog-parks/truro-bible-hill-off-leash-dog-park/,')),
];
fs.writeFileSync(backlogPath, filtered.join('\n') + '\n');

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 608 pages in the current working queue.', 'This backlog contains 607 pages in the current working queue.');
summary = summary.replace('| T3-standard-expansion | 362 |', '| T3-standard-expansion | 361 |');
summary = summary.replace('| Dog Parks | 434 |', '| Dog Parks | 433 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Truro-Bible Hill Off-Leash Dog Park and refreshed backlog files.');
