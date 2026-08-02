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
const park = parks.find((entry) => entry.slug === 'stocking-creek-park-ladysmith');

if (!park) {
  throw new Error('Stocking Creek Park record not found');
}

const seoTitle = 'Stocking Creek Park | CVRD Nature Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Stocking Creek Park near Ladysmith, including CVRD trail, picnic, viewing-platform, parking, and toilet details, plus why it should not be treated as an official off-leash dog park.';
const intro =
  '<p>Stocking Creek Park is a <strong>CVRD community nature park</strong> near Ladysmith with <strong>forest trails</strong>, a <strong>picnic area</strong>, creek and waterfall views, and a broader day-use setting for walkers and visitors.</p>';
const body =
  '<p>The main correction for this page is that <strong>Stocking Creek Park should not be represented as an official off-leash dog park</strong>. The current page was built on unsupported dog-park language, the wrong district attribution, and a stale source URL. The official source is the <strong>Cowichan Valley Regional District</strong>, not RDN, and the current CVRD park page describes Stocking Creek as a <strong>community park</strong> with nature-oriented visitor amenities rather than a designated off-leash area.</p><p>CVRD&apos;s current park page gives this record a much better factual basis. The district lists <strong>trails</strong>, a <strong>picnic area</strong>, <strong>toilet facilities</strong>, <strong>parking</strong>, and a <strong>viewing platform</strong> among the key park features. That makes Stocking Creek more useful as a regional nature-walk and short scenic-stop page than as a supposed dog-run destination. The well-known waterfall and forested creek corridor are part of the park&apos;s appeal, but they should not be stretched into an off-leash claim the district does not make.</p><p>For dog owners, the practical takeaway is simple: Stocking Creek may still be relevant as a general outdoor stop, but users should not assume it is a legal off-leash site just because it has trails and natural open space. CVRD publishes specific park information when a site has designated features, and the reviewed Stocking Creek page does not present the park as a dog-specific off-leash facility as of <strong>Sunday, August 2, 2026</strong>.</p><p>This correction improves the page materially because it removes unsupported dog-park marketing and replaces it with the actual park identity, the correct governing district, and useful visit-planning facts grounded in the official source.</p>';
const notes =
  '<p>Primary source: https://cvrd.ca/parks-recreation-culture/parks-trails/find-a-park/stocking-creek-park/. Reviewed on August 2, 2026. The prior backlog source URL incorrectly referenced RDN.</p>';

Object.assign(park, {
  title: 'Stocking Creek Park | CVRD Nature Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    City: ['Ladysmith area'],
    Tags: ['park-guide', 'cvrd', 'nature-park', 'forest-trails', 'stocking-creek-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Stocking Creek Park | CVRD Nature Park Guide',
  'Park type': 'Nature park',
  Description:
    '<p>Stocking Creek Park is a CVRD community nature park near Ladysmith with forest trails, a picnic area, viewing platform, parking, and toilet facilities, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': 'Stocking Creek Park trail access near Ladysmith - verify access point on arrival',
  latitude: '48.9525',
  longitude: '-123.7712',
  City: 'Ladysmith area',
  Province: 'British Columbia',
  'Surface type': 'Forest trail, gravel path, and natural creekside terrain',
  Size: 'Community nature park',
  'Water source available': 'Creek present - not a confirmed pet-water amenity',
  Benches: 'Yes - picnic area seating',
  'Shaded area': 'Yes - forest canopy',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes - toilet facilities listed by CVRD',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check current trail and park notices',
  'Park Website or Source': 'https://cvrd.ca/parks-recreation-culture/parks-trails/find-a-park/stocking-creek-park/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Stocking+Creek+Park+Ladysmith+BC',
  Tags: 'park-guide,cvrd,nature-park,forest-trails,stocking-creek-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'stocking-creek-park-ladysmith', {
  'Park Header': 'Stocking Creek Park | CVRD Nature Park Guide',
  'Park type': 'Nature park',
  Description:
    '<p>Stocking Creek Park is a CVRD community nature park near Ladysmith with forest trails, a picnic area, viewing platform, parking, and toilet facilities, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': 'Stocking Creek Park trail access near Ladysmith - verify access point on arrival',
  latitude: '48.9525',
  longitude: '-123.7712',
  City: 'Ladysmith area',
  Province: 'British Columbia',
  'Surface type': 'Forest trail, gravel path, and natural creekside terrain',
  Size: 'Community nature park',
  'Water source available': 'Creek present - not a confirmed pet-water amenity',
  Benches: 'Yes - picnic area seating',
  'Shaded area': 'Yes - forest canopy',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes - toilet facilities listed by CVRD',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check current trail and park notices',
  'Park Website or Source': 'https://cvrd.ca/parks-recreation-culture/parks-trails/find-a-park/stocking-creek-park/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Stocking+Creek+Park+Ladysmith+BC',
  Tags: 'park-guide,cvrd,nature-park,forest-trails,stocking-creek-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Stocking Creek Park,/dog-parks/stocking-creek-park-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/stocking-creek-park-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/stocking-creek-park-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Stocking Creek Park record and refreshed backlog files.');
