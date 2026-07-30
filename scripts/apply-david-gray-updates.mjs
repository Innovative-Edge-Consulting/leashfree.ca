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
const park = parks.find((entry) => entry.slug === 'david-gray-park-burnaby');

if (!park) {
  throw new Error('David Gray Park record not found');
}

const seoTitle = 'David Gray Park | Burnaby Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to David Gray Park in Burnaby, including the official 7480 McKay Avenue address, fenced off-leash enclosure, separate small-dog area, year-round access, and Burnaby off-leash rules.';
const intro =
  '<p>David Gray Park is one of Burnaby&apos;s official dog off-leash areas, with a <strong>fenced enclosure</strong> at <strong>7480 McKay Avenue</strong> and a <strong>separate area for small dogs only</strong>.</p>';
const body =
  '<p>The City of Burnaby currently lists David Gray Park as an official off-leash site, which immediately gives this page more value than the old generic version. Burnaby&apos;s dog off-leash page confirms the park address as <strong>7480 McKay Avenue</strong> and describes the site as a <strong>fenced enclosure</strong> with <strong>separate area for small dogs only</strong>. That is a stronger and more precise description than the earlier copy, which missed one of the park&apos;s most useful differentiators for owners of smaller dogs.</p><p>The city also confirms that access is available <strong>year-round</strong>. Unlike Burnaby&apos;s trail-style off-leash sites, David Gray reads as a more contained neighbourhood option designed for a straightforward fenced play session rather than a longer roaming walk. That makes it especially practical for quick visits, controlled social time, and owners who prefer a defined boundary instead of a broader open-area format.</p><p>Burnaby&apos;s current dog off-leash page also links each site to an official off-leash area map, which is important because the city expects dogs to stay within the designated off-leash space. Outside those boundaries, dogs must be leashed. The city notes that dogs on-leash are welcome in Burnaby&apos;s parks and green spaces, with some exceptions, but off-leash freedom is limited to the listed approved sites.</p><p>For users, the practical summary is simple: David Gray Park is a city-recognized, fenced, year-round Burnaby off-leash area with a small-dog section. That combination makes it one of the more approachable choices for owners who want a controlled neighbourhood park setting instead of a large natural trail network.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas and https://bylaws.burnaby.ca/en/permalink/bylaw14770. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'David Gray Park | Burnaby Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'fenced', 'small-dog-area', 'burnaby'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'David Gray Park | Burnaby Dog Off-Leash Area',
  Description:
    '<p>David Gray Park is an official Burnaby dog off-leash site at 7480 McKay Avenue with a fenced enclosure, a separate small-dog area, and year-round access.</p>',
  'Park type': 'Park',
  'Street Address': '7480 McKay Avenue',
  latitude: '49.2129',
  longitude: '-122.9876',
  'Surface type': 'Grass within fenced off-leash enclosures',
  Size: 'Neighbourhood fenced off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover around site - verify on arrival',
  'Waste bins': 'Expected at site - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=7480+McKay+Avenue+Burnaby+BC',
  Tags: 'off-leash,fenced,small-dog-area,burnaby',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'david-gray-park-burnaby', {
  'Park Header': 'David Gray Park | Burnaby Dog Off-Leash Area',
  Description:
    '<p>David Gray Park is an official Burnaby dog off-leash site at 7480 McKay Avenue with a fenced enclosure, a separate small-dog area, and year-round access.</p>',
  'Park type': 'Park',
  'Street Address': '7480 McKay Avenue',
  latitude: '49.2129',
  longitude: '-122.9876',
  'Surface type': 'Grass within fenced off-leash enclosures',
  Size: 'Neighbourhood fenced off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover around site - verify on arrival',
  'Waste bins': 'Expected at site - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=7480+McKay+Avenue+Burnaby+BC',
  Tags: 'off-leash,fenced,small-dog-area,burnaby',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,David Gray Park,/dog-parks/david-gray-park-burnaby/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/david-gray-park-burnaby/"') || row.join(',').includes(',/dog-parks/david-gray-park-burnaby/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 591 pages in the current working queue.', 'This backlog contains 590 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 230 |', '| T2-high-value-expansion | 229 |');
summary = summary.replace('| Dog Parks | 418 |', '| Dog Parks | 417 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated David Gray Park record and refreshed backlog files.');
