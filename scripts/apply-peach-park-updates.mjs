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
  return rows
    .map((row) =>
      row
        .map((field = '') => {
          const text = String(field);
          const escaped = text.replace(/"/g, '""');
          return /[",\n\r]/.test(text) ? `"${escaped}"` : escaped;
        })
        .join(','),
    )
    .join('\n') + '\n';
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
const park = parks.find((entry) => entry.slug === 'peach-park-chilliwack');
if (!park) throw new Error('Peach Park record not found');

const seoTitle = 'Peach Park Trail Access Guide | Chilliwack | LeashFree.ca';
const metaDescription =
  'Conservative guide to Peach Park in Chilliwack as a Vedder Rotary Trail and Blueway access point with parking, washrooms, picnic space, playground, and riverfront park context.';
const intro =
  '<p>Peach Park should not be treated as an official Chilliwack off-leash dog park. The better-supported description is a <strong>riverfront neighbourhood park and Vedder Rotary Trail access point</strong> with parking, washrooms, and picnic amenities.</p>';
const body =
  '<p>This page needed a classification correction rather than more generic dog-park copy. Chilliwack&apos;s current official <strong>dog off-leash park list</strong> does <strong>not</strong> include <strong>Peach Park</strong>, so the old fenced leash-free framing was not supported by the city&apos;s current off-leash information.</p><p>What the city does publish is still useful. Chilliwack lists Peach Park as a regular park location and highlights amenities including <strong>parking</strong>, <strong>washrooms</strong>, <strong>picnic tables</strong>, an <strong>all-ages playground</strong>, and direct access to the <strong>Vedder Rotary Trail</strong>. The city also identifies Peach Park as a <strong>Blueway access point</strong>, which makes the site more of a riverfront recreation and trail-entry destination than a dedicated dog park.</p><p>That broader park framing fits other recent city material as well. Chilliwack&apos;s 2025 annual reporting highlights Peach Park as part of local public-space improvements and gathering places in the Vedder area. That reinforces the idea that Peach Park is a multi-use neighbourhood and trail-access park, not a specialized off-leash enclosure.</p><p>This update improves the page by removing unsupported leash-free claims and replacing them with the city&apos;s actual park context: riverfront location, Vedder Rotary Trail access, Blueway relevance, parking, washrooms, picnic space, and family-oriented amenities. Visitors with dogs should rely on posted on-site signage and current city rules rather than assuming off-leash use.</p>';
const notes =
  '<p>Primary sources: Chilliwack&apos;s current official dog off-leash park list, which does not include Peach Park; the City of Chilliwack Peach Park facility page listing parking, washrooms, picnic tables, and trail access; and current city material identifying Peach Park as a Blueway access point and part of broader community-space improvements. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Peach Park Trail Access Guide | Chilliwack',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['chilliwack', 'peach-park', 'vedder-rotary-trail', 'blueway-access', 'not-official-off-leash'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Peach Park Trail Access Guide | Chilliwack',
  'Park type': 'Park / Trail Access',
  Description:
    '<p>Peach Park is better treated as a Chilliwack riverfront park and Vedder Rotary Trail access point rather than an official off-leash dog park.</p>',
  'Street Address': 'Vedder Rotary Trail access at Peach Road area',
  latitude: '49.10752273652283',
  longitude: '-121.98682929568284',
  Fenced: 'No city-confirmed fenced dog park',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Paved access, grass, riverfront park, and trail connections',
  Size: 'Neighbourhood park and trail access point',
  'Water source available': 'River access nearby - use caution',
  Benches: 'Picnic seating available',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Likely in the broader park - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow current city rules and posted notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=945',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Peach+Park+Chilliwack+BC',
  Tags: 'chilliwack,peach-park,vedder-rotary-trail,blueway-access,not-official-off-leash',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'peach-park-chilliwack', {
  'Park Header': 'Peach Park Trail Access Guide | Chilliwack',
  'Park type': 'Park / Trail Access',
  Description:
    '<p>Peach Park is better treated as a Chilliwack riverfront park and Vedder Rotary Trail access point rather than an official off-leash dog park.</p>',
  'Street Address': 'Vedder Rotary Trail access at Peach Road area',
  latitude: '49.10752273652283',
  longitude: '-121.98682929568284',
  Fenced: 'No city-confirmed fenced dog park',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Paved access, grass, riverfront park, and trail connections',
  Size: 'Neighbourhood park and trail access point',
  'Water source available': 'River access nearby - use caution',
  Benches: 'Picnic seating available',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Likely in the broader park - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow current city rules and posted notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=945',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Peach+Park+Chilliwack+BC',
  Tags: 'chilliwack,peach-park,vedder-rotary-trail,blueway-access,not-official-off-leash',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Peach Park,/dog-parks/peach-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/peach-park-chilliwack/"') ||
    row.join(',').includes(',/dog-parks/peach-park-chilliwack/,'),
);

rebuildBacklogSummary();

console.log('Updated Peach Park record and refreshed backlog files.');
