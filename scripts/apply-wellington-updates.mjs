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
const park = parks.find((entry) => entry.slug === 'wellington-off-leash-area');
if (!park) throw new Error('Wellington record not found');

const seoTitle = 'Wellington Off-Leash Area | Edmonton | LeashFree.ca';
const metaDescription =
  'Conservative, source-backed guide to Wellington Off-Leash Area in Edmonton, including the official neighbourhood location at 13440 132 Street NW and Edmonton’s current off-leash rules.';
const intro =
  '<p>Wellington Off-Leash Area is a <strong>north Edmonton neighbourhood off-leash site</strong> around <strong>13440 132 Street NW</strong>, best treated as a simple local dog area within Edmonton&apos;s official off-leash network.</p>';
const body =
  '<p>This page needed a more careful rewrite because Edmonton&apos;s current off-leash material clearly confirms the <strong>official citywide off-leash network</strong> but does not provide a richly detailed text profile for every neighbourhood site. As of <strong>Tuesday, August 4, 2026</strong>, Wellington remains a recognized off-leash area in the network, but the city&apos;s current public text does not spell out a long amenity list for this location.</p><p>What can be stated confidently is the overall use case. Wellington reads as a <strong>local residential off-leash area</strong> rather than a destination park. The current location data around <strong>13440 132 Street NW</strong> supports a modest neighbourhood setting with open grass and everyday walking access rather than a heavily programmed multi-zone facility.</p><p>For visitors, the practical value is convenience. This is the kind of site that serves nearby residents who want a quick off-leash outing without travelling to a larger river valley or destination dog park. Because the city does not currently publish a detailed park-by-park feature list here, finer amenities such as benches, bins, or water should be <strong>verified on arrival</strong> rather than assumed.</p><p>This update improves the page by replacing unsupported filler with the strongest currently defensible mix of official status, exact neighbourhood location, and Edmonton&apos;s standard off-leash rules framework.</p>';
const notes =
  '<p>Primary source: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites for official City of Edmonton off-leash rules and network confirmation. This update stays conservative on site-specific amenities because the current city text view does not publish a detailed Wellington profile. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Wellington Off-Leash Area | Edmonton',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'edmonton', 'neighbourhood-site', 'north-edmonton', 'wellington'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Wellington Off-Leash Area | Edmonton',
  'Park type': 'Leash Free',
  Description:
    '<p>Wellington Off-Leash Area is an official Edmonton neighbourhood dog area around 13440 132 Street NW, with finer amenities best verified on arrival.</p>',
  'Street Address': '13440 132 Street NW',
  latitude: '53.5965',
  longitude: '-113.5612',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Open grass field and neighbourhood park landscape',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Minimal to moderate tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=13440+132+Street+NW+Edmonton+AB',
  Tags: 'off-leash,edmonton,neighbourhood-site,north-edmonton,wellington',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'wellington-off-leash-area', {
  'Park Header': 'Wellington Off-Leash Area | Edmonton',
  'Park type': 'Leash Free',
  Description:
    '<p>Wellington Off-Leash Area is an official Edmonton neighbourhood dog area around 13440 132 Street NW, with finer amenities best verified on arrival.</p>',
  'Street Address': '13440 132 Street NW',
  latitude: '53.5965',
  longitude: '-113.5612',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Open grass field and neighbourhood park landscape',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Minimal to moderate tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=13440+132+Street+NW+Edmonton+AB',
  Tags: 'off-leash,edmonton,neighbourhood-site,north-edmonton,wellington',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Wellington Off-Leash Area,/dog-parks/wellington-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/wellington-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/wellington-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Wellington record and refreshed backlog files.');
