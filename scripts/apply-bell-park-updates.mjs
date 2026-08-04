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

function rebuildBacklogSummary() {
  const rows = parseCsv(fs.readFileSync(backlogPath, 'utf8'));
  const headers = rows[0];
  const bodyRows = rows
    .slice(1)
    .filter((row) => row.some((value) => value !== ''))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));

  const countBy = (field) =>
    [...bodyRows.reduce((map, row) => {
      const key = row[field] || '';
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map()).entries()].sort((a, b) => b[1] - a[1]);

  const tierRows = countBy('tier')
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join('\n');
  const sectionRows = countBy('contentType')
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join('\n');
  const topRows = bodyRows
    .slice(0, 50)
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === 'true' ? 'yes' : 'no'} |`,
    )
    .join('\n');

  const summary = `# Thin Page Improvement Backlog

Generated from \`reports/content-health.json\` on 2026-07-22.

This backlog contains ${bodyRows.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.

## Backlog counts

| Tier | Pages |
| --- | ---: |
${tierRows}

| Content type | Pages |
| --- | ---: |
${sectionRows}

## Prioritization

- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.
- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.
- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.
- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.

Do not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.

## First 50 pages

| # | Tier | Type | Page | Score | Words | Missing source |
| ---: | --- | --- | --- | ---: | ---: | --- |
${topRows}
`;

  fs.writeFileSync(backlogSummaryPath, summary);
}

const parks = JSON.parse(fs.readFileSync(parksPath, 'utf8'));
const park = parks.find((entry) => entry.slug === 'bell-park-burnaby');

if (!park) {
  throw new Error('Bell Park record not found');
}

const seoTitle = 'Bell Park Dog Off-Leash Area | Burnaby | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Bell Park in Burnaby, including the official 3551 Bell Avenue address, partial enclosure, year-round access, and Eastlake neighbourhood setting.';
const intro =
  '<p>Bell Park is one of Burnaby&apos;s official dog off-leash areas, with a <strong>partial enclosure</strong> at <strong>3551 Bell Avenue</strong> in the <strong>Eastlake</strong> neighbourhood.</p>';
const body =
  '<p>Burnaby&apos;s current dog off-leash page makes Bell Park more specific than the old thin copy suggested. The city lists <strong>Bell Park</strong> as an official off-leash site at <strong>3551 Bell Avenue</strong> and describes the dog area as a <strong>partially enclosed</strong> space with <strong>year-round access</strong>. That matters because it sets a more accurate expectation than treating the site like either a fully fenced run or a vague open lawn.</p><p>The Burnaby page also provides a practical local landmark: Bell Park is <strong>adjacent to a fully enclosed basketball court</strong>. That kind of reference is useful on smaller neighbourhood sites because it helps visitors orient themselves quickly once they arrive. The city also identifies the location as part of <strong>Eastlake Park</strong>, which clarifies the broader neighbourhood context around the dog area.</p><p>Compared with Burnaby&apos;s larger trail-style off-leash destinations, Bell Park reads as a more compact neighbourhood option. The value is convenience and city-recognized off-leash use in a simple local setting rather than a long natural walk or a large multi-zone park. Visitors should still treat the space as a designated off-leash area within the city&apos;s published network and keep dogs within the intended area rather than assuming the full surrounding park is off leash.</p><p>The update improves this page by replacing generic filler with the city&apos;s actual description: official site, exact address, partial enclosure, year-round access, and a useful on-site landmark. That is what helps the page function as a real local guide.</p>';
const notes =
  '<p>Primary source: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Bell Park Dog Off-Leash Area | Burnaby',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'burnaby', 'eastlake', 'partial-enclosure', 'bell-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Bell Park Dog Off-Leash Area | Burnaby',
  'Park type': 'Leash Free',
  Description:
    '<p>Bell Park is an official Burnaby dog off-leash area at 3551 Bell Avenue with a partial enclosure, year-round access, and a location beside a fully enclosed basketball court.</p>',
  'Street Address': '3551 Bell Avenue',
  latitude: '49.2250',
  longitude: '-122.9736',
  Fenced: 'Partial',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass neighbourhood park surface',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or nearby park access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=3551+Bell+Avenue+Burnaby+BC',
  Tags: 'off-leash,burnaby,eastlake,partial-enclosure,bell-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'bell-park-burnaby', {
  'Park Header': 'Bell Park Dog Off-Leash Area | Burnaby',
  'Park type': 'Leash Free',
  Description:
    '<p>Bell Park is an official Burnaby dog off-leash area at 3551 Bell Avenue with a partial enclosure, year-round access, and a location beside a fully enclosed basketball court.</p>',
  'Street Address': '3551 Bell Avenue',
  latitude: '49.2250',
  longitude: '-122.9736',
  Fenced: 'Partial',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass neighbourhood park surface',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or nearby park access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=3551+Bell+Avenue+Burnaby+BC',
  Tags: 'off-leash,burnaby,eastlake,partial-enclosure,bell-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Bell Park,/dog-parks/bell-park-burnaby/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/bell-park-burnaby/"') ||
    row.join(',').includes(',/dog-parks/bell-park-burnaby/,'),
);

rebuildBacklogSummary();

console.log('Updated Bell Park record and refreshed backlog files.');
