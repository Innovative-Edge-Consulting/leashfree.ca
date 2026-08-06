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
      if (char === '\r' && next === '\n') i += 1;
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
  const tierRows = countBy('tier').map(([key, count]) => `| ${key} | ${count} |`).join('\n');
  const sectionRows = countBy('contentType').map(([key, count]) => `| ${key} | ${count} |`).join('\n');
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
const park = parks.find((entry) => entry.slug === 'morgan-crossing-dog-park');
if (!park) throw new Error('Morgan Crossing record not found');

const seoTitle = 'Morgan Crossing Pet-Friendly Shopping Area | South Surrey | LeashFree.ca';
const metaDescription =
  'Conservative guide to Morgan Crossing in South Surrey as a pet-friendly outdoor shopping area, not an official Surrey off-leash dog park. Includes address context and current classification notes.';
const intro =
  '<p>Morgan Crossing should not be treated as an official Surrey off-leash dog park. The better-supported description is a <strong>pet-friendly outdoor shopping area</strong> at <strong>15765 Croydon Drive</strong> in South Surrey.</p>';
const body =
  '<p>This page needed a classification correction more than it needed more generic prose. Surrey&apos;s current official off-leash information does <strong>not</strong> list <strong>Morgan Crossing</strong> among the city&apos;s designated dog off-leash parks, so the old framing as a municipal leash-free dog park was not well supported.</p><p>What can be supported more conservatively is the location itself. The address used on the existing record, <strong>15765 Croydon Drive</strong>, matches <strong>The Shops at Morgan Crossing</strong> in South Surrey. Third-party commercial listings for the shopping centre also describe the property as offering <strong>dog-friendly amenities</strong>. That is a materially different claim from an official city-run off-leash park.</p><p>Because the current evidence points to a pet-friendly retail environment rather than a designated public dog park, the safest improvement is to rewrite this page as a <strong>South Surrey pet-friendly stop guide</strong>. Visitors can reasonably expect an open-air shopping district where leashed dogs may accompany owners in outdoor common areas, but they should <strong>not</strong> assume there is a city-designated fenced off-leash enclosure unless signage on site clearly says so.</p><p>This update improves the page by removing unsupported off-leash claims and replacing them with a narrower, factual description: Morgan Crossing is best understood as a pet-friendly shopping-area stop in South Surrey, not as one of Surrey&apos;s official dog-park destinations.</p>';
const notes =
  '<p>Primary sources: Surrey&apos;s current official off-leash information, which does not list Morgan Crossing as a designated city dog park; and current commercial listings for The Shops at Morgan Crossing at 15765 Croydon Drive describing the property as having dog-friendly amenities. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Morgan Crossing Pet-Friendly Shopping Area | South Surrey',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['pet-friendly', 'south-surrey', 'morgan-crossing', 'shopping-area', 'not-official-off-leash'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Morgan Crossing Pet-Friendly Shopping Area | South Surrey',
  'Park type': 'Pet Friendly Area',
  Description:
    '<p>Morgan Crossing is better treated as a pet-friendly outdoor shopping area in South Surrey rather than an official Surrey off-leash dog park.</p>',
  'Street Address': '15765 Croydon Drive',
  latitude: '49.05125162712466',
  longitude: '-122.78528964001167',
  Fenced: 'No official city-confirmed fenced dog park',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Outdoor retail walkways and landscaped common areas',
  Size: 'Shopping district',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Common-area seating likely',
  'Shaded area': 'Some landscaping and covered retail edges',
  'Waste bins': 'Likely in common areas',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - shopping-centre parking',
  'Washrooms nearby': 'Retail area amenities may be available - verify on arrival',
  'Operating hours': 'Check current shopping-centre hours',
  'Seasonal Restrictions': 'Follow current on-site rules and tenant policies',
  'Park Website or Source': 'https://www.surrey.ca',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=15765+Croydon+Drive+Surrey+BC',
  Tags: 'pet-friendly,south-surrey,morgan-crossing,shopping-area,not-official-off-leash',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'morgan-crossing-dog-park', {
  'Park Header': 'Morgan Crossing Pet-Friendly Shopping Area | South Surrey',
  'Park type': 'Pet Friendly Area',
  Description:
    '<p>Morgan Crossing is better treated as a pet-friendly outdoor shopping area in South Surrey rather than an official Surrey off-leash dog park.</p>',
  'Street Address': '15765 Croydon Drive',
  latitude: '49.05125162712466',
  longitude: '-122.78528964001167',
  Fenced: 'No official city-confirmed fenced dog park',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Outdoor retail walkways and landscaped common areas',
  Size: 'Shopping district',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Common-area seating likely',
  'Shaded area': 'Some landscaping and covered retail edges',
  'Waste bins': 'Likely in common areas',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - shopping-centre parking',
  'Washrooms nearby': 'Retail area amenities may be available - verify on arrival',
  'Operating hours': 'Check current shopping-centre hours',
  'Seasonal Restrictions': 'Follow current on-site rules and tenant policies',
  'Park Website or Source': 'https://www.surrey.ca',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=15765+Croydon+Drive+Surrey+BC',
  Tags: 'pet-friendly,south-surrey,morgan-crossing,shopping-area,not-official-off-leash',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Morgan Crossing Dog Park,/dog-parks/morgan-crossing-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/morgan-crossing-dog-park/"') ||
    row.join(',').includes(',/dog-parks/morgan-crossing-dog-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Morgan Crossing record and refreshed backlog files.');
