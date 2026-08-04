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
const park = parks.find((entry) => entry.slug === 'raven-park-ladysmith');

if (!park) {
  throw new Error('Raven Park record not found');
}

const seoTitle = 'Raven Park | Ladysmith Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Raven Park in Ladysmith, including its neighbourhood green-space role and why it should not be treated as an official off-leash dog park.';
const intro =
  '<p>Raven Park appears to function as a <strong>Ladysmith neighbourhood green space</strong> rather than an officially designated off-leash dog area.</p>';
const body =
  '<p>The main correction on this page is park type. Raven Park should not be described as a leash-free dog park. The older record relied on unsupported generic dog-language, but as of <strong>Tuesday, August 4, 2026</strong>, I did not find a current official Town of Ladysmith source designating Raven Park as a legal off-leash site.</p><p>The more defensible framing is as a standard neighbourhood park. Based on the available local reference trail, Raven Park reads as a small residential green space rather than a specialized destination with published dog infrastructure or a municipal off-leash designation. That puts it in the same correction category as several other Ladysmith records in this backlog: open lawn and residential access do not by themselves make a park leash-free.</p><p>For dog owners, the practical takeaway is simple. Treat Raven Park as a normal public park and follow posted signs on arrival. Unless the Town of Ladysmith explicitly publishes off-leash permission, the site should not be presented as a municipal dog park.</p><p>This rewrite improves trust by removing unsupported off-leash claims and replacing them with a narrower, source-conscious neighbourhood-park description.</p>';
const notes =
  '<p>Primary source context: the Town of Ladysmith parks source previously associated with this record. That source set has not yielded a current, park-specific off-leash designation for Raven Park, so this update stays conservative and removes the false dog-park framing. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Raven Park | Ladysmith Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'ladysmith', 'neighbourhood-park', 'raven-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Raven Park | Ladysmith Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Raven Park is a Ladysmith neighbourhood green space, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': 'Verify exact access on arrival',
  latitude: park.raw.latitude,
  longitude: park.raw.longitude,
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass lawn and neighbourhood park landscape',
  Size: 'Neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street or neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current town notices',
  'Park Website or Source': 'https://www.ladysmith.ca/our-services/parks-recreation/parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Raven+Park+Ladysmith+BC',
  Tags: 'park-guide,ladysmith,neighbourhood-park,raven-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'raven-park-ladysmith', {
  'Park Header': 'Raven Park | Ladysmith Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Raven Park is a Ladysmith neighbourhood green space, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': 'Verify exact access on arrival',
  latitude: park.raw.latitude,
  longitude: park.raw.longitude,
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass lawn and neighbourhood park landscape',
  Size: 'Neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street or neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current town notices',
  'Park Website or Source': 'https://www.ladysmith.ca/our-services/parks-recreation/parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Raven+Park+Ladysmith+BC',
  Tags: 'park-guide,ladysmith,neighbourhood-park,raven-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Raven Park,/dog-parks/raven-park-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/raven-park-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/raven-park-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Raven Park record and refreshed backlog files.');
