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
const park = parks.find((entry) => entry.slug === 'gourlay-janes-park');
if (!park) throw new Error('Gourlay-Janes Park record not found');

const seoTitle = 'Gourlay-Janes Park | Ladysmith Dog Off-Leash Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Gourlay-Janes Park in Ladysmith, including the official 397 Chemainus Road address, waterfront trails, and current Town of Ladysmith off-leash designation.';
const intro =
  '<p>Gourlay-Janes Park is one of Ladysmith&apos;s official dog off-leash parks, with <strong>forested trails</strong>, <strong>waterfront access</strong>, and a scenic shoreline setting at <strong>397 Chemainus Road</strong>.</p>';
const body =
  '<p>The Town of Ladysmith currently identifies Gourlay-Janes Park as an official off-leash location on two separate municipal pages, which makes this a strong source-backed dog park profile. On the town&apos;s off-leash page, <strong>Gourlay Janes Park on Chemainus Road</strong> appears in the list of designated dog off-leash parks. On the town&apos;s parks directory, the listing goes further and says plainly that <strong>dogs are allowed at this park off-leash</strong>. That double confirmation is more useful than the older thin copy and removes ambiguity about whether this is merely dog-friendly or actually approved for off-leash use.</p><p>The parks directory adds more concrete context about the setting. The town gives the official address as <strong>397 Chemainus Road</strong> and describes Gourlay-Janes Park as a <strong>mostly forested park</strong> with <strong>trails that lead to a beautiful open space along the waterfront</strong>. It also lists amenities including <strong>benches</strong>, <strong>bird viewing</strong>, <strong>fishing</strong>, <strong>flora and fauna viewing</strong>, <strong>parking</strong>, <strong>scenic viewpoint/lookout</strong>, <strong>swimming</strong>, and <strong>waterfront access</strong>. That makes the park notably different from a simple fenced grass enclosure.</p><p>For dog owners, the practical value is the combination of natural terrain and shoreline character. Ladysmith&apos;s off-leash network includes more structured spaces such as the fenced Davis Road Dog Park and the bounded Transfer Beach off-leash area, but Gourlay-Janes offers a more exploratory coastal walk with forest cover and oceanfront scenery. That means it may be a better fit for dogs and handlers who enjoy longer meandering outings rather than only short enclosed play sessions.</p><p>The town&apos;s general off-leash rules still apply. Dogs are only allowed off-leash in designated places, owners are expected to keep control of their dogs, carry a leash, and clean up after them, and the town restricts dogs in certain other locations such as playgrounds and the cemetery. Within that framework, Gourlay-Janes stands out as one of Ladysmith&apos;s most scenic official off-leash destinations.</p>';
const notes =
  '<p>Primary sources: https://www.ladysmith.ca/parks-recreation-culture/dog-off-leash-parks-trails and https://www.ladysmith.ca/parks-recreation-culture/parks. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Gourlay-Janes Park | Ladysmith Dog Off-Leash Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'waterfront', 'forest-trails', 'ladysmith'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Gourlay-Janes Park | Ladysmith Dog Off-Leash Park',
  Description:
    '<p>Gourlay-Janes Park is an official Ladysmith off-leash park at 397 Chemainus Road with forested trails, waterfront access, and scenic shoreline viewpoints.</p>',
  'Park type': 'Park',
  'Street Address': '397 Chemainus Road',
  latitude: '48.9985',
  longitude: '-123.8094',
  'Surface type': 'Natural trails, forest floor, and waterfront shoreline',
  Size: 'Forested waterfront park',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Yes',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'No town-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Check posted town rules and shoreline conditions',
  'Park Website or Source': 'https://www.ladysmith.ca/parks-recreation-culture/parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=397+Chemainus+Road+Ladysmith+BC',
  Tags: 'off-leash,waterfront,forest-trails,ladysmith',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'gourlay-janes-park', {
  'Park Header': 'Gourlay-Janes Park | Ladysmith Dog Off-Leash Park',
  Description:
    '<p>Gourlay-Janes Park is an official Ladysmith off-leash park at 397 Chemainus Road with forested trails, waterfront access, and scenic shoreline viewpoints.</p>',
  'Park type': 'Park',
  'Street Address': '397 Chemainus Road',
  latitude: '48.9985',
  longitude: '-123.8094',
  'Surface type': 'Natural trails, forest floor, and waterfront shoreline',
  Size: 'Forested waterfront park',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Yes',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'No town-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Check posted town rules and shoreline conditions',
  'Park Website or Source': 'https://www.ladysmith.ca/parks-recreation-culture/parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=397+Chemainus+Road+Ladysmith+BC',
  Tags: 'off-leash,waterfront,forest-trails,ladysmith',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Gourlay-Janes Park,/dog-parks/gourlay-janes-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/gourlay-janes-park/"') || row.join(',').includes(',/dog-parks/gourlay-janes-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 584 pages in the current working queue.', 'This backlog contains 583 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 223 |', '| T2-high-value-expansion | 222 |');
summary = summary.replace('| Dog Parks | 411 |', '| Dog Parks | 410 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Gourlay-Janes Park record and refreshed backlog files.');
