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
const park = parks.find((entry) => entry.slug === 'pearson-park-chilliwack');

if (!park) {
  throw new Error('Pearson Park record not found');
}

const seoTitle = 'Pearson Park | Chilliwack Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Pearson Park in Chilliwack, including its Urban Core sub-neighbourhood park classification and why it should not be treated as an official off-leash dog park.';
const intro =
  '<p>Pearson Park is a small <strong>Urban Core sub-neighbourhood park</strong> in Chilliwack, serving nearby residents as a modest local green space rather than an official dog off-leash destination.</p>';
const body =
  '<p>The main correction for this page is that <strong>Pearson Park is not listed by the City of Chilliwack as an official dog off-leash area</strong>. Chilliwack&apos;s current dog off-leash page identifies the designated city locations where dogs can legally run off leash, and Pearson Park does not appear on that list as of <strong>Sunday, August 2, 2026</strong>. That means the older dog-park framing was not supported by the city&apos;s current public information.</p><p>The city&apos;s current parks inventory still gives Pearson Park a valid civic role. Chilliwack classifies it as a <strong>sub-neighbourhood park</strong> in the <strong>Urban Core</strong>, which is a more accurate and useful description than the old generic off-leash copy. That classification suggests a small local park intended for nearby day-to-day neighbourhood use rather than a destination recreation space or a designated animal facility.</p><p>For visitors, the practical takeaway is straightforward: Pearson Park may still be relevant as a quiet neighbourhood green space, but it should not be marketed as a legal leash-free area. Users specifically looking for off-leash access in Chilliwack should use one of the city&apos;s named designated dog areas instead of assuming that a small residential park allows the same activity.</p><p>This update improves trust because it removes unsupported off-leash claims and replaces them with the city&apos;s actual park classification. That is a better result than expanding thin copy around the wrong premise.</p>';
const notes =
  '<p>Primary sources: City of Chilliwack parks inventory and the current City of Chilliwack dog off-leash areas page. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Pearson Park | Chilliwack Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'chilliwack', 'urban-core', 'sub-neighbourhood-park', 'pearson-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Pearson Park | Chilliwack Park Guide',
  'Park type': 'Sub-neighbourhood park',
  Description:
    '<p>Pearson Park is a small Urban Core neighbourhood green space in Chilliwack, but it is not listed by the city as an official off-leash dog park.</p>',
  'Street Address': '46480 Hurndall Crescent',
  latitude: '49.1715',
  longitude: '-121.9374',
  'Surface type': 'Grass lawn and neighbourhood park landscape',
  Size: 'Small sub-neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=945',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=46480+Hurndall+Crescent+Chilliwack+BC',
  Tags: 'park-guide,chilliwack,urban-core,sub-neighbourhood-park,pearson-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'pearson-park-chilliwack', {
  'Park Header': 'Pearson Park | Chilliwack Park Guide',
  'Park type': 'Sub-neighbourhood park',
  Description:
    '<p>Pearson Park is a small Urban Core neighbourhood green space in Chilliwack, but it is not listed by the city as an official off-leash dog park.</p>',
  'Street Address': '46480 Hurndall Crescent',
  latitude: '49.1715',
  longitude: '-121.9374',
  'Surface type': 'Grass lawn and neighbourhood park landscape',
  Size: 'Small sub-neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=945',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=46480+Hurndall+Crescent+Chilliwack+BC',
  Tags: 'park-guide,chilliwack,urban-core,sub-neighbourhood-park,pearson-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Pearson Park,/dog-parks/pearson-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/pearson-park-chilliwack/"') ||
    row.join(',').includes(',/dog-parks/pearson-park-chilliwack/,'),
);

rebuildBacklogSummary();

console.log('Updated Pearson Park record and refreshed backlog files.');
