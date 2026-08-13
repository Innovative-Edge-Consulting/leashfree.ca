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
const park = parks.find((entry) => entry.slug === 'king-george-park-cornwall');
if (!park) throw new Error('King George Park record not found');

const seoTitle = 'King George Park | Cornwall Park Rules for Dog Owners';
const metaDescription =
  'Source-backed Cornwall park guide for King George Park, a neighbourhood park at Seventh and York with a softball diamond and seasonal outdoor rink lighting. Dogs are not permitted here under current City of Cornwall park rules.';
const intro =
  '<p>King George Park is a <strong>neighbourhood park in Cornwall, Ontario</strong> at <strong>Seventh Street and York Street</strong>, but it is <strong>not an off-leash dog park</strong> and is <strong>not one of the City of Cornwall parks where dogs are permitted</strong> under the current animal rules.</p>';
const body =
  '<p>This page needed a factual reset. The old record presented King George Park as a dog-friendly green space, but the City of Cornwall&apos;s current <strong>Animals and Wildlife</strong> page says <strong>dogs are not allowed in City parks</strong> except for a short list that includes <strong>Guindon Park roadways and Trillium Picnic area</strong>, <strong>Boals Drain Linear Park</strong>, the <strong>Cedar Rapids corridor</strong>, and <strong>Lamoureux Park</strong>. <strong>King George Park is not on that list</strong>.</p><p>The city&apos;s park pages show what King George Park actually is. Cornwall lists it in the <strong>Neighbourhood Parks</strong> inventory at <strong>Seventh and York St</strong>. The city&apos;s sports and winter recreation pages also show that the park supports a <strong>community softball diamond</strong> and a <strong>seasonal outdoor rink</strong>, with <strong>lights on from 5 p.m. to 10 p.m.</strong> during rink season.</p><p>That makes this a useful correction page rather than a destination recommendation for dog owners. If you are planning a dog outing in Cornwall, King George Park should not be treated as a legal off-leash or general dog-walking park based on the city&apos;s current rules. The better use of this profile is to prevent bad trip planning and to direct visitors toward locations the city explicitly allows for dogs.</p><p>This update improves the page by removing unsupported dog-park language and replacing it with the city&apos;s actual classification: neighbourhood park, softball and winter-rink use, and no current dog access permission under the published rules.</p>';
const notes =
  '<p>Primary sources: https://www.cornwall.ca/en/property-environment/animals-and-wildlife/ for the current City of Cornwall rule that dogs are not allowed in City parks except for a short published list that does not include King George Park; https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/neighbourhood-parks/ for King George Park at Seventh and York St in the city&apos;s neighbourhood parks inventory; and https://www.cornwall.ca/en/recreation-community-supports/recreation-and-sports/arenas-and-skating/outdoor-rinks/ for King George Park&apos;s seasonal outdoor rink lighting from 5 p.m. to 10 p.m. The city&apos;s sports fields and baseball diamonds page also lists King George Park as a community softball diamond. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: 'King George Park | Cornwall Park Rules for Dog Owners',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Cornwall'],
    Province: ['Ontario'],
    Tags: ['cornwall', 'neighbourhood-park', 'softball-diamond', 'outdoor-rink', 'dogs-not-permitted'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'King George Park | Cornwall Park Rules for Dog Owners',
  'Park type': 'Neighbourhood Park - dogs not permitted',
  Description:
    '<p>King George Park is a Cornwall neighbourhood park at Seventh and York with a softball diamond and seasonal outdoor rink lighting, but it is not a dog park and dogs are not permitted here under the city&apos;s current published park rules.</p>',
  'Street Address': 'Seventh Street and York Street',
  latitude: '45.0252662',
  longitude: '-74.7365935',
  City: 'Cornwall',
  Province: 'Ontario',
  'Postal Code': '',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass sports field',
  Size: 'Neighbourhood park',
  'Water source available': 'No public dog amenity confirmed',
  Benches: 'Verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'No public dog amenity confirmed',
  'Parking Available': 'Street access nearby - verify on arrival',
  'Washrooms nearby': 'No public washrooms confirmed',
  'Operating hours': 'Outdoor rink lights run from 5 p.m. to 10 p.m. during rink season',
  'Seasonal Restrictions': 'Dogs not permitted under current City of Cornwall park rules',
  'Park Website or Source': 'https://www.cornwall.ca/en/property-environment/animals-and-wildlife/',
  'Google Maps Link': 'https://www.google.com/maps/place/King+George+Park/',
  Tags: 'cornwall,neighbourhood-park,softball-diamond,outdoor-rink,dogs-not-permitted',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'king-george-park-cornwall', {
  'Park Header': 'King George Park | Cornwall Park Rules for Dog Owners',
  'Park type': 'Neighbourhood Park - dogs not permitted',
  Description:
    '<p>King George Park is a Cornwall neighbourhood park at Seventh and York with a softball diamond and seasonal outdoor rink lighting, but it is not a dog park and dogs are not permitted here under the city&apos;s current published park rules.</p>',
  'Street Address': 'Seventh Street and York Street',
  latitude: '45.0252662',
  longitude: '-74.7365935',
  City: 'Cornwall',
  Province: 'Ontario',
  'Postal Code': '',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass sports field',
  Size: 'Neighbourhood park',
  'Water source available': 'No public dog amenity confirmed',
  Benches: 'Verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'No public dog amenity confirmed',
  'Parking Available': 'Street access nearby - verify on arrival',
  'Washrooms nearby': 'No public washrooms confirmed',
  'Operating hours': 'Outdoor rink lights run from 5 p.m. to 10 p.m. during rink season',
  'Seasonal Restrictions': 'Dogs not permitted under current City of Cornwall park rules',
  'Park Website or Source': 'https://www.cornwall.ca/en/property-environment/animals-and-wildlife/',
  'Google Maps Link': 'https://www.google.com/maps/place/King+George+Park/',
  Tags: 'cornwall,neighbourhood-park,softball-diamond,outdoor-rink,dogs-not-permitted',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/king-george-park-cornwall/';
  },
);

removeCsvRow(
  reviewQueuePath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/king-george-park-cornwall/';
  },
);

rebuildBacklogSummary();

console.log('Updated King George Park record and refreshed backlog files.');
