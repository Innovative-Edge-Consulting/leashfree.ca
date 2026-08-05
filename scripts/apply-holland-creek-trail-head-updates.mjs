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
    .map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === 'true' ? 'yes' : 'no'} |`)
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
const park = parks.find((entry) => entry.slug === 'holland-creek-trail-head-ladysmith');
if (!park) throw new Error('Holland Creek Trail Head record not found');

const seoTitle = 'Holland Creek Trail | Ladysmith Trail Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Holland Creek Trail in Ladysmith, including its creekside forest route, multiple trailheads, Crystal Falls and Colliery Dams highlights, and the current expectation that dogs remain on leash.';
const intro =
  '<p>Holland Creek Trail is a <strong>Ladysmith creekside forest trail</strong> with multiple trailheads, waterfalls, and dam viewpoints, but it should not be treated as an official off-leash dog area.</p>';
const body =
  '<p>The key correction for this page is trail use. Holland Creek Trail is a legitimate and popular Ladysmith walking route, but the older record&apos;s leash-free framing was not supported by the strongest available current sources. Recent trail references consistently describe Holland Creek as a multi-access community trail where <strong>dogs are allowed but generally expected to remain on leash</strong>.</p><p>The trail itself is stronger than the old copy suggested. Tourism Cowichan describes Holland Creek Trail as a route of roughly <strong>5.8 kilometres</strong> along both sides of the creek, with highlights including <strong>Crystal Falls</strong> and the <strong>Colliery Dams</strong>. Access is commonly described from <strong>Dogwood Drive</strong>, <strong>6th Avenue and Methuen Street</strong>, <strong>Davis Road Park</strong>, and <strong>Mackie Road</strong>, which makes it more useful as a town trail network than a single-point dog park destination.</p><p>For dog owners, the practical takeaway is to treat Holland Creek as a scenic on-leash outing rather than a place for legal off-leash roaming. That matches the trail-oriented nature of the route, the varied grades and stairs, and the broader public use by walkers, families, and hikers.</p><p>This update improves trust by removing the unsupported off-leash claim and replacing it with a more accurate trail guide built around current tourism and trail-network information.</p>';
const notes =
  '<p>Primary sources: Tourism Cowichan&apos;s Holland Creek Trail page for route length, highlights, and access points; Trailforks and AllTrails for current public trail usage context, both of which describe dog access as permitted but not as an official off-leash designation. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Holland Creek Trail | Ladysmith Trail Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['trail-guide', 'ladysmith', 'creekside-trail', 'on-leash-dogs', 'holland-creek-trail'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Holland Creek Trail | Ladysmith Trail Guide',
  'Park type': 'Trail guide',
  Description:
    '<p>Holland Creek Trail is a Ladysmith creekside forest trail with multiple access points and dogs generally expected on leash, not an official off-leash dog park.</p>',
  'Street Address': 'Dogwood Drive / Methuen Street / Davis Road / Mackie Road access points',
  latitude: park.raw.latitude,
  longitude: park.raw.longitude,
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Dirt path, gravel, boardwalk, stairs, and forest trail',
  Size: 'Approx. 5.8 km trail network',
  'Water source available': 'Natural creek access only',
  Benches: 'Some benches along the route',
  'Shaded area': 'Yes - heavy forest canopy',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - multiple trailhead parking areas',
  'Washrooms nearby': 'Trailhead washrooms reported at some access points',
  'Operating hours': 'Verify trail access and posted park hours on arrival',
  'Seasonal Restrictions': 'Check current trail notices and closures',
  'Park Website or Source': 'https://www.tourismcowichan.com/things-to-do/holland-creek-trail/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Holland+Creek+Trail+Ladysmith+BC',
  Tags: 'trail-guide,ladysmith,creekside-trail,on-leash-dogs,holland-creek-trail',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'holland-creek-trail-head-ladysmith', {
  'Park Header': 'Holland Creek Trail | Ladysmith Trail Guide',
  'Park type': 'Trail guide',
  Description:
    '<p>Holland Creek Trail is a Ladysmith creekside forest trail with multiple access points and dogs generally expected on leash, not an official off-leash dog park.</p>',
  'Street Address': 'Dogwood Drive / Methuen Street / Davis Road / Mackie Road access points',
  latitude: park.raw.latitude,
  longitude: park.raw.longitude,
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Dirt path, gravel, boardwalk, stairs, and forest trail',
  Size: 'Approx. 5.8 km trail network',
  'Water source available': 'Natural creek access only',
  Benches: 'Some benches along the route',
  'Shaded area': 'Yes - heavy forest canopy',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - multiple trailhead parking areas',
  'Washrooms nearby': 'Trailhead washrooms reported at some access points',
  'Operating hours': 'Verify trail access and posted park hours on arrival',
  'Seasonal Restrictions': 'Check current trail notices and closures',
  'Park Website or Source': 'https://www.tourismcowichan.com/things-to-do/holland-creek-trail/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Holland+Creek+Trail+Ladysmith+BC',
  Tags: 'trail-guide,ladysmith,creekside-trail,on-leash-dogs,holland-creek-trail',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Holland Creek Trail Head,/dog-parks/holland-creek-trail-head-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/holland-creek-trail-head-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/holland-creek-trail-head-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Holland Creek Trail Head record and refreshed backlog files.');
