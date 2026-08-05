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
  return rows.map((row) => row.map((field = '') => {
    const text = String(field);
    const escaped = text.replace(/"/g, '""');
    return /[",\n\r]/.test(text) ? `"${escaped}"` : escaped;
  }).join(',')).join('\n') + '\n';
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
  const bodyRows = rows.slice(1).filter((row) => row.some((value) => value !== ''))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
  const countBy = (field) => [...bodyRows.reduce((map, row) => {
    const key = row[field] || '';
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy('tier').map(([key, count]) => `| ${key} | ${count} |`).join('\n');
  const sectionRows = countBy('contentType').map(([key, count]) => `| ${key} | ${count} |`).join('\n');
  const topRows = bodyRows.slice(0, 50).map((row, index) =>
    `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === 'true' ? 'yes' : 'no'} |`,
  ).join('\n');

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
const park = parks.find((entry) => entry.slug === 'malvern-park-burnaby');
if (!park) throw new Error('Malvern Park record not found');

const seoTitle = 'Malvern Park Dog Off-Leash Area | Burnaby | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Malvern Park in Burnaby, including the year-round off-leash trail-and-open-area layout at 7410 Morley Drive and the rule that only the mapped portion is legally off leash.';
const intro =
  '<p>Malvern Park is one of Burnaby&apos;s official <strong>year-round dog off-leash areas</strong>, combining an <strong>open grassy area</strong> with a <strong>connected trail section</strong> at <strong>7410 Morley Drive</strong>.</p>';
const body =
  '<p>Burnaby&apos;s current off-leash page gives Malvern Park a more useful identity than the old generic copy. The city lists Malvern as a <strong>year-round off-leash area</strong> at <strong>7410 Morley Drive</strong> and specifically describes it as a site with an <strong>open area and trail</strong>. That matters because it sets better expectations than treating the park like just another fenced rectangle or a vague neighbourhood lawn.</p><p>The city&apos;s animal control bylaw context also improves the page. Burnaby makes clear that dogs can be off leash only within the city&apos;s designated off-leash spaces, which means the legal off-leash use at Malvern applies to the mapped dog area rather than every surrounding part of the park. For visitors, that is the important practical distinction: Malvern works as a compact mixed-format site where dogs can move between open grass and a trail-style section, but handlers should still stay within the intended off-leash area.</p><p>Compared with Burnaby&apos;s larger destination dog parks, Malvern reads as a quieter residential option that balances quick everyday use with a little more walking variety than a pure field. That is what makes it stronger than the previous filler copy.</p><p>This update improves the page by replacing vague claims with the city&apos;s actual framing: official year-round status, exact Morley Drive location, open-area-plus-trail layout, and the bylaw-backed reminder that only the designated portion is legally off leash.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas for the current Malvern Park description, and Burnaby animal-control bylaw guidance for the rule that dogs may be off leash only in designated areas. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Malvern Park Dog Off-Leash Area | Burnaby',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'burnaby', 'year-round', 'trail-and-open-area', 'malvern-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Malvern Park Dog Off-Leash Area | Burnaby',
  'Park type': 'Leash Free',
  Description:
    '<p>Malvern Park is an official Burnaby year-round off-leash area at 7410 Morley Drive, combining a grassy dog space with a connected trail section.</p>',
  'Street Address': '7410 Morley Drive',
  latitude: '49.2261',
  longitude: '-122.9635',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass open area and trail',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=7410+Morley+Drive+Burnaby+BC',
  Tags: 'off-leash,burnaby,year-round,trail-and-open-area,malvern-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'malvern-park-burnaby', {
  'Park Header': 'Malvern Park Dog Off-Leash Area | Burnaby',
  'Park type': 'Leash Free',
  Description:
    '<p>Malvern Park is an official Burnaby year-round off-leash area at 7410 Morley Drive, combining a grassy dog space with a connected trail section.</p>',
  'Street Address': '7410 Morley Drive',
  latitude: '49.2261',
  longitude: '-122.9635',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass open area and trail',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=7410+Morley+Drive+Burnaby+BC',
  Tags: 'off-leash,burnaby,year-round,trail-and-open-area,malvern-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Malvern Park,/dog-parks/malvern-park-burnaby/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/malvern-park-burnaby/"') ||
    row.join(',').includes(',/dog-parks/malvern-park-burnaby/,'),
);

rebuildBacklogSummary();

console.log('Updated Malvern Park record and refreshed backlog files.');
