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
const park = parks.find((entry) => entry.slug === 'root-street-park-ladysmith');

if (!park) {
  throw new Error('Root Street Park record not found');
}

const seoTitle = 'Root Street Park | Ladysmith Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Root Street Park in Ladysmith, including its neighbourhood park role and why it should not be treated as an official off-leash dog park.';
const intro =
  '<p>Root Street Park is a small <strong>Ladysmith neighbourhood park</strong> that functions as a local residential green space rather than an officially designated off-leash dog area.</p>';
const body =
  '<p>The main correction for this page is that <strong>Root Street Park should not be described as a leash-free dog park</strong>. The current Town of Ladysmith source set does not designate it as an official off-leash site, and the older record relied on unsupported generic claims about dog play and open off-leash use. As of <strong>Sunday, August 2, 2026</strong>, there is no town-backed evidence that this park is a legal dog-running area.</p><p>The more reliable framing is as a general neighbourhood park. Root Street Park sits within a residential context and reads as a modest local green space rather than a specialized destination facility. That makes it appropriate for a conservative park guide, but not for a dog-park profile that implies municipal off-leash permission.</p><p>For dog owners, the practical takeaway is the same as with several other Ladysmith backlog records: open grass alone does not equal official off-leash status. Unless the Town of Ladysmith explicitly publishes a dog-area designation, users should treat Root Street Park as a standard municipal park and verify rules on arrival.</p><p>This update improves trust by removing unsupported off-leash language and replacing it with a narrower, defensible neighbourhood-park description tied to the available source.</p>';
const notes =
  '<p>Primary source: Town of Ladysmith parks source URL previously used for this record. That town parks page currently returns a 404 when fetched directly, so this update stays conservative and avoids unsupported amenity claims while removing the false off-leash framing. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Root Street Park | Ladysmith Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'ladysmith', 'neighbourhood-park', 'root-street-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Root Street Park | Ladysmith Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Root Street Park is a small Ladysmith neighbourhood green space, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': '420 Root Street',
  latitude: '48.9859',
  longitude: '-123.8159',
  'Surface type': 'Grass lawn and neighbourhood park landscape',
  Size: 'Small neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current town notices',
  'Park Website or Source': 'https://www.ladysmith.ca/our-services/parks-recreation/parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=420+Root+Street+Ladysmith+BC',
  Tags: 'park-guide,ladysmith,neighbourhood-park,root-street-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'root-street-park-ladysmith', {
  'Park Header': 'Root Street Park | Ladysmith Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Root Street Park is a small Ladysmith neighbourhood green space, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': '420 Root Street',
  latitude: '48.9859',
  longitude: '-123.8159',
  'Surface type': 'Grass lawn and neighbourhood park landscape',
  Size: 'Small neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current town notices',
  'Park Website or Source': 'https://www.ladysmith.ca/our-services/parks-recreation/parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=420+Root+Street+Ladysmith+BC',
  Tags: 'park-guide,ladysmith,neighbourhood-park,root-street-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Root Street Park,/dog-parks/root-street-park-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/root-street-park-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/root-street-park-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Root Street Park record and refreshed backlog files.');
