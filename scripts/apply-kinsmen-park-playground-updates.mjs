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
const park = parks.find((entry) => entry.slug === 'kinsmen-park-playground-ladysmith');

if (!park) {
  throw new Error('Kinsmen Park & Playground record not found');
}

const seoTitle = 'Kinsmen Park & Playground | Ladysmith Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Kinsmen Park & Playground in Ladysmith, including its community playground role, neighbourhood park setting, and why it should not be treated as an official off-leash dog park.';
const intro =
  '<p>Kinsmen Park &amp; Playground is a <strong>Ladysmith neighbourhood family park</strong> centered on a large community playground, open grass space, and day-use park seating rather than any official off-leash dog function.</p>';
const body =
  '<p>The main correction for this page is that <strong>Kinsmen Park &amp; Playground should not be described as a leash-free dog park</strong>. The current Town of Ladysmith parks source does not present it as an official off-leash site, and the older record relied on unsupported amenity claims such as dog-space designations, bag dispensers, and off-leash use. For users arriving from dog-related search, that distinction matters because a family playground park should not be marketed as a legal dog-running area without clear municipal backing.</p><p>The stronger factual framing is community recreation. Ladysmith&apos;s current parks source places this site in the town&apos;s park system, and local Kinsmen history ties the playground to <strong>Brown Drive Park</strong> and a long-standing community-build effort by the <strong>Ladysmith Kinsmen Club</strong>. That gives the page a real civic story: this is a neighbourhood park associated with children&apos;s play, community volunteering, and local family use, not a dog-specific destination.</p><p>That broader identity also helps with the right user expectation. A park built around a playground, neighbourhood open space, and passive family use may still be useful for a short leashed walk around the edges, but visitors should not assume that open lawn equals permitted off-leash activity. Unless the Town of Ladysmith explicitly designates a dog area, this page should stay conservative and avoid claiming dog-park status that the official source does not support as of <strong>Sunday, August 2, 2026</strong>.</p><p>This update improves trust because it replaces filler off-leash copy with the actual park role and local context. That is a better long-term content asset than expanding the wrong premise.</p>';
const notes =
  '<p>Primary source: https://www.ladysmith.ca/our-services/parks-recreation/parks/. Supporting local context from Ladysmith Kinsmen Club material about Brown Drive Park / Kinsmen Park and community playground history. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Kinsmen Park & Playground | Ladysmith Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'ladysmith', 'playground', 'family-park', 'kinsmen-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Kinsmen Park & Playground | Ladysmith Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Kinsmen Park &amp; Playground is a Ladysmith family park centered on a community playground and neighbourhood green space, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': '6th Avenue and Methuen Street',
  latitude: '48.9924',
  longitude: '-123.8360',
  'Surface type': 'Grass lawn and playground surface',
  Size: 'Neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street or nearby park access - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check current town notices',
  'Park Website or Source': 'https://www.ladysmith.ca/our-services/parks-recreation/parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=6th+Avenue+and+Methuen+Street+Ladysmith+BC',
  Tags: 'park-guide,ladysmith,playground,family-park,kinsmen-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'kinsmen-park-playground-ladysmith', {
  'Park Header': 'Kinsmen Park & Playground | Ladysmith Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Kinsmen Park &amp; Playground is a Ladysmith family park centered on a community playground and neighbourhood green space, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': '6th Avenue and Methuen Street',
  latitude: '48.9924',
  longitude: '-123.8360',
  'Surface type': 'Grass lawn and playground surface',
  Size: 'Neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street or nearby park access - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check current town notices',
  'Park Website or Source': 'https://www.ladysmith.ca/our-services/parks-recreation/parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=6th+Avenue+and+Methuen+Street+Ladysmith+BC',
  Tags: 'park-guide,ladysmith,playground,family-park,kinsmen-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Kinsmen Park & Playground,/dog-parks/kinsmen-park-playground-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/kinsmen-park-playground-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/kinsmen-park-playground-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Kinsmen Park & Playground record and refreshed backlog files.');
