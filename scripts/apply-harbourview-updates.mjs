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
const park = parks.find((entry) => entry.slug === 'harbourview-park');

if (!park) {
  throw new Error('Harbourview Park record not found');
}

const seoTitle = 'Harbourview Park | Ladysmith Park Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Harbourview Park in Ladysmith, including official address, amenities, and the current Town rule that dogs are not allowed there except registered service dogs.';
const intro =
  '<p>Harbourview Park is a <strong>Ladysmith viewpoint park</strong> at <strong>533 Louise Road</strong> with open green space, a playground, and wide ocean-and-mountain views above the harbour.</p>';
const body =
  '<p>The key factual correction for this page is simple: <strong>Harbourview Park is not an off-leash dog park</strong>, and the Town of Ladysmith&apos;s current parks page says <strong>dogs are not allowed at this park</strong> except for registered service dogs. That means the older leash-free positioning on LeashFree.ca was incorrect as of <strong>Thursday, July 30, 2026</strong>.</p><p>The Town&apos;s current parks inventory gives Harbourview Park a much clearer identity. It places the park at <strong>533 Louise Road</strong> and describes it as a local green space with a <strong>playground</strong>, <strong>rest area</strong>, <strong>parking</strong>, and <strong>scenic viewpoint/lookout</strong>. The town also highlights the setting directly, noting the park&apos;s open space and its ocean and mountain views above Ladysmith Harbour.</p><p>The Town&apos;s dedicated dog off-leash page reinforces the same conclusion from a different angle. It lists Ladysmith&apos;s official dog off-leash areas as the <strong>Davis Road Dog Park</strong>, the fenced off-leash area at <strong>Transfer Beach</strong>, <strong>Gourlay-Janes Park</strong>, <strong>Holland Creek Trail</strong>, and the <strong>Heart Lake &amp; Stocking Lake loops</strong>. Harbourview Park does not appear on that list, and the general town rule says dogs must stay on leash except in designated off-leash areas.</p><p>For users arriving here because they want a dog outing, the practical takeaway is that Harbourview Park should not be treated as a dog destination at all. It is better understood as a scenic municipal park for views and family park use, while actual Ladysmith dog exercise options should be chosen from the town&apos;s official off-leash list instead.</p>';
const notes =
  '<p>Primary sources: https://www.ladysmith.ca/parks-recreation-culture/parks and https://www.ladysmith.ca/parks-recreation-culture/dog-off-leash-parks-trails. Reviewed on July 30, 2026. This page was corrected because the Town of Ladysmith currently says dogs are not allowed at Harbourview Park except registered service dogs.</p>';

Object.assign(park, {
  title: 'Harbourview Park | Ladysmith Park Rules',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-rules', 'scenic-viewpoint', 'ladysmith', 'harbourview-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Harbourview Park | Ladysmith Park Rules',
  Description:
    '<p>Harbourview Park is a scenic Ladysmith park at 533 Louise Road with open grass, a playground, and harbour views, but the Town says dogs are not allowed there except registered service dogs.</p>',
  'Park type': 'Scenic park / viewpoint park',
  'Street Address': '533 Louise Road',
  latitude: '48.99893747836667',
  longitude: '-123.80080625007106',
  'Surface type': 'Grass, paved park paths, playground surfacing',
  Size: 'Neighbourhood scenic park',
  'Water source available': 'No',
  Benches: 'Yes',
  'Shaded area': 'Partial',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'No',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Dawn to Dusk',
  'Seasonal Restrictions': 'Check posted town rules on arrival',
  'Park Website or Source': 'https://www.ladysmith.ca/parks-recreation-culture/parks',
  'Google Maps Link': 'https://maps.app.goo.gl/QhkMHvebY8AG53576',
  Tags: 'park-rules,scenic-viewpoint,ladysmith,harbourview-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'harbourview-park', {
  'Park Header': 'Harbourview Park | Ladysmith Park Rules',
  Description:
    '<p>Harbourview Park is a scenic Ladysmith park at 533 Louise Road with open grass, a playground, and harbour views, but the Town says dogs are not allowed there except registered service dogs.</p>',
  'Park type': 'Scenic park / viewpoint park',
  'Street Address': '533 Louise Road',
  latitude: '48.99893747836667',
  longitude: '-123.80080625007106',
  'Surface type': 'Grass, paved park paths, playground surfacing',
  Size: 'Neighbourhood scenic park',
  'Water source available': 'No',
  Benches: 'Yes',
  'Shaded area': 'Partial',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'No',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Dawn to Dusk',
  'Seasonal Restrictions': 'Check posted town rules on arrival',
  'Park Website or Source': 'https://www.ladysmith.ca/parks-recreation-culture/parks',
  'Google Maps Link': 'https://maps.app.goo.gl/QhkMHvebY8AG53576',
  Tags: 'park-rules,scenic-viewpoint,ladysmith,harbourview-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Harbourview Park,/dog-parks/harbourview-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/harbourview-park/"') || row.join(',').includes(',/dog-parks/harbourview-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 590 pages in the current working queue.', 'This backlog contains 589 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 229 |', '| T2-high-value-expansion | 228 |');
summary = summary.replace('| Dog Parks | 417 |', '| Dog Parks | 416 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Harbourview Park record and refreshed backlog files.');
