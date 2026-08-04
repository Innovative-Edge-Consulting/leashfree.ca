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
const park = parks.find((entry) => entry.slug === 'blue-heron-park-ladysmith');

if (!park) {
  throw new Error('Blue Heron Park record not found');
}

const seoTitle = 'Blue Heron Park | CVRD Waterfront Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Blue Heron Park in Yellow Point, including the CVRD waterfront location at 13485 Westby Road and why it should not be treated as an official off-leash dog park.';
const intro =
  '<p>Blue Heron Park is a <strong>CVRD waterfront community park</strong> at <strong>13485 Westby Road</strong> in <strong>Yellow Point / North Oyster</strong>, not an officially designated off-leash dog park.</p>';
const body =
  '<p>The main correction on this page is location and park type. Blue Heron Park is not a Ladysmith leash-free area. The current Cowichan Valley Regional District source places it at <strong>13485 Westby Road</strong> in <strong>Yellow Point / North Oyster</strong> and presents it as a community waterfront park rather than a dog-specific destination.</p><p>The CVRD description focuses on general recreation: beach access, shoreline walking, swimming, picnicking, and a group picnic shelter. That is a materially different use case from the old thin copy, which made unsupported claims about off-leash dog access. As of <strong>Tuesday, August 4, 2026</strong>, I found no official designation showing Blue Heron Park as a legal off-leash dog area.</p><p>For visitors, the practical value of this page is now accuracy. Blue Heron Park appears to be a coastal stop for casual waterfront use and day outings, not a municipal dog run. Dog owners should treat it as a standard public park and follow posted rules on site instead of assuming open off-leash permission.</p><p>This rewrite improves trust by removing the false leash-free framing, correcting the municipality, and aligning the page with the official CVRD park description.</p>';
const notes =
  '<p>Primary source: Cowichan Valley Regional District Blue Heron Park page at https://cvrd.ca/parks/blue-heron/. The official page describes a community waterfront park with picnicking, swimming, beach walking, and group picnic shelter access. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Blue Heron Park | CVRD Waterfront Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    City: ['Yellow Point'],
    Province: ['British Columbia'],
    Tags: ['park-guide', 'cvrd', 'waterfront-park', 'yellow-point', 'blue-heron-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Blue Heron Park | CVRD Waterfront Park Guide',
  'Park type': 'Waterfront park',
  Description:
    '<p>Blue Heron Park is a CVRD waterfront community park in Yellow Point, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': '13485 Westby Road',
  latitude: '49.0444785',
  longitude: '-123.7569595',
  City: 'Yellow Point',
  Province: 'British Columbia',
  'Postal Code': '',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, beach, shoreline access, and picnic area',
  Size: 'Community waterfront park',
  'Water source available': 'Natural waterfront access',
  Benches: 'Picnic area and group shelter access',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Park access parking - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Check current CVRD park notices',
  'Park Website or Source': 'https://cvrd.ca/parks/blue-heron/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=13485+Westby+Road+Yellow+Point+BC',
  Tags: 'park-guide,cvrd,waterfront-park,yellow-point,blue-heron-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'blue-heron-park-ladysmith', {
  'Park Header': 'Blue Heron Park | CVRD Waterfront Park Guide',
  'Park type': 'Waterfront park',
  Description:
    '<p>Blue Heron Park is a CVRD waterfront community park in Yellow Point, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': '13485 Westby Road',
  latitude: '49.0444785',
  longitude: '-123.7569595',
  City: 'Yellow Point',
  Province: 'British Columbia',
  'Postal Code': '',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, beach, shoreline access, and picnic area',
  Size: 'Community waterfront park',
  'Water source available': 'Natural waterfront access',
  Benches: 'Picnic area and group shelter access',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Park access parking - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Check current CVRD park notices',
  'Park Website or Source': 'https://cvrd.ca/parks/blue-heron/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=13485+Westby+Road+Yellow+Point+BC',
  Tags: 'park-guide,cvrd,waterfront-park,yellow-point,blue-heron-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Blue Heron Park,/dog-parks/blue-heron-park-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/blue-heron-park-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/blue-heron-park-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Blue Heron Park record and refreshed backlog files.');
