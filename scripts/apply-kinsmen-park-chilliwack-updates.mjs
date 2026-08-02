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
const park = parks.find((entry) => entry.slug === 'kinsmen-park-chilliwack');

if (!park) {
  throw new Error('Kinsmen Park record not found');
}

const seoTitle = 'Kinsmen Park on Portage | Chilliwack Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Kinsmen Park on Portage in Chilliwack, including current city park amenities and confirmation that it is not listed as an official off-leash dog park.';
const intro =
  '<p>Kinsmen Park on Portage is a Chilliwack neighbourhood park with <strong>open grass</strong>, a <strong>looping paved path</strong>, <strong>playground space</strong>, <strong>tennis courts</strong>, and local day-use amenities.</p>';
const body =
  '<p>The main correction for this page is simple: <strong>Kinsmen Park on Portage is not listed by the City of Chilliwack as an official dog off-leash area</strong>. Chilliwack&apos;s current off-leash page names the designated locations where dogs can legally run off leash, including <strong>Vedder Park</strong>, <strong>Island 22</strong>, <strong>Cultus Lake</strong>, <strong>Sheffield Dog Off Leash Area</strong>, <strong>Vedder North Dyke Trail</strong>, <strong>Fairfield Park</strong>, <strong>Jinkerson Park</strong>, and <strong>No. 3 Road Dog Off Leash Area</strong>. Kinsmen does not appear on that official list as of <strong>Sunday, August 2, 2026</strong>.</p><p>The park itself is still real and useful, just misclassified in the older record. Chilliwack&apos;s parks inventory identifies <strong>Kinsmen Park on Portage</strong> as a <strong>neighbourhood park</strong> in the urban core. The city&apos;s current park listings and amenity pages show the site has <strong>open grass area</strong>, <strong>playground features for ages 2-5 and 5-12</strong>, <strong>tennis courts</strong>, <strong>washrooms</strong>, and a <strong>drinking water source</strong>. That gives this page a stronger factual base as a general park guide than as an invented dog-park profile.</p><p>For dog owners, the practical takeaway is that Kinsmen should be treated as a regular municipal park unless the city officially adds it to the off-leash program later. A leashed walk may still fit the broader park setting, but off-leash use should be directed to one of Chilliwack&apos;s named dog areas instead of assumed here because of open lawn space.</p><p>This update improves trust by removing unsupported off-leash claims and replacing them with the city&apos;s actual classification and amenity footprint. That is a more useful result than expanding thin dog-park copy around the wrong premise.</p>';
const notes =
  '<p>Primary sources: https://www.chilliwack.com/main/page.cfm?dowhat=typeView&id=1754&ptID=1, https://www.chilliwack.com/main/page.cfm?id=2579, and related City of Chilliwack park amenity pages for open grass area, playgrounds, tennis, washrooms, and drinking water. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Kinsmen Park on Portage | Chilliwack Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'chilliwack', 'neighbourhood-park', 'kinsmen-park-on-portage'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Kinsmen Park on Portage | Chilliwack Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Kinsmen Park on Portage is a Chilliwack neighbourhood park with open grass, playgrounds, tennis courts, washrooms, and a paved walking loop, but it is not listed by the city as an official off-leash dog park.</p>',
  'Street Address': '46490 Portage Avenue',
  latitude: '49.1866',
  longitude: '-121.9319',
  'Surface type': 'Grass lawn, paved walking path, and hard-surface tennis courts',
  Size: 'Neighbourhood park',
  'Water source available': 'Yes',
  Benches: 'Yes - verify exact placement on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking or nearby access - verify on arrival',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check posted city notices and field conditions',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?dowhat=typeView&id=1754&ptID=1',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=46490+Portage+Avenue+Chilliwack+BC',
  Tags: 'park-guide,chilliwack,neighbourhood-park,kinsmen-park-on-portage',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'kinsmen-park-chilliwack', {
  'Park Header': 'Kinsmen Park on Portage | Chilliwack Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Kinsmen Park on Portage is a Chilliwack neighbourhood park with open grass, playgrounds, tennis courts, washrooms, and a paved walking loop, but it is not listed by the city as an official off-leash dog park.</p>',
  'Street Address': '46490 Portage Avenue',
  latitude: '49.1866',
  longitude: '-121.9319',
  'Surface type': 'Grass lawn, paved walking path, and hard-surface tennis courts',
  Size: 'Neighbourhood park',
  'Water source available': 'Yes',
  Benches: 'Yes - verify exact placement on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking or nearby access - verify on arrival',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check posted city notices and field conditions',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?dowhat=typeView&id=1754&ptID=1',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=46490+Portage+Avenue+Chilliwack+BC',
  Tags: 'park-guide,chilliwack,neighbourhood-park,kinsmen-park-on-portage',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Kinsmen Park,/dog-parks/kinsmen-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/kinsmen-park-chilliwack/"') ||
    row.join(',').includes(',/dog-parks/kinsmen-park-chilliwack/,'),
);

rebuildBacklogSummary();

console.log('Updated Kinsmen Park Chilliwack record and refreshed backlog files.');
