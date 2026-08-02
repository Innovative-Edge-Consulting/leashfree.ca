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
const park = parks.find((entry) => entry.slug === 'diana-princess-of-wales-park-ladysmith');
if (!park) throw new Error('Diana, Princess of Wales Park record not found');

const seoTitle = 'Diana, Princess of Wales Park | Saltair Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Diana, Princess of Wales Park in Saltair, including the current CVRD park classification, easy walking trail, bench, parking, and the fact that it is not an official off-leash dog park.';
const intro =
  '<p>Diana, Princess of Wales Park is a small wilderness park in <strong>Saltair</strong> managed by the <strong>Cowichan Valley Regional District</strong>, with an easy walking trail, a bench, and a quiet forest-and-coast setting.</p>';
const body =
  '<p>The key correction for this page is that <strong>Diana, Princess of Wales Park is not an official off-leash dog park</strong>. The current CVRD park page describes it as a <strong>wilderness park</strong> in Saltair with an <strong>easy walking trail</strong>, a <strong>bench</strong>, and <strong>parking</strong>. That is materially different from the older thin page, which treated it as a Ladysmith dog-play destination.</p><p>The location also needed correction. This park is not a Ladysmith municipal dog park. It is part of the <strong>Saltair</strong> park system under CVRD management, and the current public park page frames it as a simple nature-walk stop rather than a place with designated off-leash amenities or dog-specific infrastructure.</p><p>The current official description is enough to improve the page without inventing features. CVRD positions the park as a low-key forested walking area, which fits a trail-and-rest-stop use case much better than a dog-park classification. For visitors, the practical value is a short, quiet walking environment rather than a legal off-leash destination.</p><p>For dog owners, the useful takeaway is straightforward: this page should be treated as a <strong>general park guide</strong>, not as a recommendation for official off-leash use. Correcting the classification improves trust because it replaces a weak dog-park assumption with the park&apos;s actual public identity and governance.</p>';
const notes =
  '<p>Primary source: https://www.cvrd.ca/159/Diana-Princess-of-Wales-Park. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Diana, Princess of Wales Park | Saltair Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'saltair', 'cvrd', 'wilderness-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Diana, Princess of Wales Park | Saltair Park Guide',
  Description:
    '<p>Diana, Princess of Wales Park is a CVRD wilderness park in Saltair with an easy walking trail, bench, and parking, but it is not an official off-leash dog park.</p>',
  'Park type': 'Wilderness park',
  'Street Address': 'Saltair, BC',
  latitude: '48.9508',
  longitude: '-123.7852',
  'Surface type': 'Natural forest trail and park surface',
  Size: 'Small wilderness park',
  'Water source available': 'No confirmed dog water source',
  Benches: 'Yes',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No confirmed dog dispensers',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'No confirmed washrooms',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted CVRD park notices',
  'Park Website or Source': 'https://www.cvrd.ca/159/Diana-Princess-of-Wales-Park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Diana+Princess+of+Wales+Park+Saltair+BC',
  Tags: 'park-guide,saltair,cvrd,wilderness-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'diana-princess-of-wales-park-ladysmith', {
  'Park Header': 'Diana, Princess of Wales Park | Saltair Park Guide',
  Description:
    '<p>Diana, Princess of Wales Park is a CVRD wilderness park in Saltair with an easy walking trail, bench, and parking, but it is not an official off-leash dog park.</p>',
  'Park type': 'Wilderness park',
  'Street Address': 'Saltair, BC',
  latitude: '48.9508',
  longitude: '-123.7852',
  'Surface type': 'Natural forest trail and park surface',
  Size: 'Small wilderness park',
  'Water source available': 'No confirmed dog water source',
  Benches: 'Yes',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No confirmed dog dispensers',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'No confirmed washrooms',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted CVRD park notices',
  'Park Website or Source': 'https://www.cvrd.ca/159/Diana-Princess-of-Wales-Park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Diana+Princess+of+Wales+Park+Saltair+BC',
  Tags: 'park-guide,saltair,cvrd,wilderness-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Diana, Princess of Wales Park,/dog-parks/diana-princess-of-wales-park-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/diana-princess-of-wales-park-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/diana-princess-of-wales-park-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Diana, Princess of Wales Park record and refreshed backlog files.');
