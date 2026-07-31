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
const park = parks.find((entry) => entry.slug === 'townsend-park-chilliwack');

if (!park) {
  throw new Error('Townsend Park record not found');
}

const seoTitle = 'Townsend Park | Chilliwack Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Townsend Park in Chilliwack, including current city park details, sports and trail amenities, and the fact that it is not listed as an official off-leash dog park.';
const intro =
  '<p>Townsend Park is one of Chilliwack&apos;s major community parks, with <strong>sports fields</strong>, a <strong>walking path</strong>, and a broad central green that supports events and everyday family recreation.</p>';
const body =
  '<p>The key correction for this page is that <strong>Townsend Park is not listed by the City of Chilliwack as an official off-leash dog park</strong>. Chilliwack&apos;s current off-leash dog areas page identifies the city&apos;s designated off-leash locations, and Townsend Park does not appear on that official list as of <strong>Friday, July 31, 2026</strong>. That means the older copy describing \"some off-leash dog activities\" was not supported by the city&apos;s current public information.</p><p>The park itself is still a major civic space and deserves a factual page. Chilliwack&apos;s current parks page describes Townsend Park as a large community park with <strong>baseball diamonds</strong>, <strong>walking pathways</strong>, <strong>picnic and open lawn space</strong>, and broader event-friendly park infrastructure. It sits in central Chilliwack and functions more as a family sports and gatherings park than as a dog-specific destination.</p><p>That broader park identity matters because users arriving here from dog search results need a practical answer, not filler. Townsend Park may still be useful as a general city park, but it should not be represented as one of Chilliwack&apos;s legal off-leash destinations unless the city explicitly adds it to the official off-leash list. For off-leash use, the city-backed approach is to use one of the actual designated dog areas rather than assuming a large open sports park allows the same thing.</p><p>This correction improves trust because it replaces an unsupported dog-park claim with the city&apos;s actual park classification and a clearer explanation of how the site is used. That is a better result than expanding the wrong premise with more generic copy.</p>';
const notes =
  '<p>Primary sources: https://www.chilliwack.com/main/page.cfm?id=945 and the City of Chilliwack off-leash dog areas page. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Townsend Park | Chilliwack Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'chilliwack', 'sports-park', 'townsend-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Townsend Park | Chilliwack Park Guide',
  'Park type': 'Community park',
  Description:
    '<p>Townsend Park is a major Chilliwack community sports park with walking paths and large open lawn space, but it is not listed by the city as an official off-leash dog park.</p>',
  'Street Address': '45130 Wolfe Road',
  latitude: '49.1636',
  longitude: '-121.9589',
  'Surface type': 'Grass sports fields, paved walking paths, and landscaped park space',
  Size: 'Large community park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Park washrooms may be available seasonally - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check posted city notices for events and field use',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=945',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=45130+Wolfe+Road+Chilliwack+BC',
  Tags: 'park-guide,chilliwack,sports-park,townsend-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'townsend-park-chilliwack', {
  'Park Header': 'Townsend Park | Chilliwack Park Guide',
  'Park type': 'Community park',
  Description:
    '<p>Townsend Park is a major Chilliwack community sports park with walking paths and large open lawn space, but it is not listed by the city as an official off-leash dog park.</p>',
  'Street Address': '45130 Wolfe Road',
  latitude: '49.1636',
  longitude: '-121.9589',
  'Surface type': 'Grass sports fields, paved walking paths, and landscaped park space',
  Size: 'Large community park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Park washrooms may be available seasonally - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check posted city notices for events and field use',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=945',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=45130+Wolfe+Road+Chilliwack+BC',
  Tags: 'park-guide,chilliwack,sports-park,townsend-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Townsend Park,/dog-parks/townsend-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/townsend-park-chilliwack/"') ||
    row.join(',').includes(',/dog-parks/townsend-park-chilliwack/,'),
);

rebuildBacklogSummary();

console.log('Updated Townsend Park record and refreshed backlog files.');
