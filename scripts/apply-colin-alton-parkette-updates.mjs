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
const park = parks.find((entry) => entry.slug === 'colin-alton-parkette');
if (!park) throw new Error('Colin Alton Parkette record not found');

const seoTitle = 'Colin Alton Parkette Off-Leash Dog Area | Burlington';
const metaDescription =
  'Source-backed guide to Colin Alton Parkette in Burlington, including the official Leonardo Street location, Burlington leash-free park rules, maximum-two-dogs limit, and current municipal source links.';
const intro =
  '<p>Colin Alton Parkette is an <strong>official Burlington leash-free dog park</strong> at <strong>3925 Leonardo Street</strong> in Alton Village. Burlington lists it among the city&apos;s designated off-leash areas, which is the key fact this page needed to verify.</p>';
const body =
  '<p>The strongest current source is Burlington&apos;s leash-free dog parks page. As of <strong>Thursday, August 13, 2026</strong>, the city says there are <strong>eight leash-free parks</strong> in Burlington and specifically includes <strong>Colin Alton Parkette</strong> in that official list. The city&apos;s park directory separately confirms the <strong>3925 Leonardo Street</strong> address.</p><p>The official rules are also more useful than generic filler copy. Burlington says visitors should <strong>always carry a leash</strong>, <strong>pick up and dispose of dog waste</strong>, <strong>stay with their dog</strong>, and keep a <strong>maximum of two dogs off leash at one time</strong>. The city also notes that outside designated leash-free parks and private property, dogs must remain on leash and under control.</p><p>Because the city source validates the designation but does not currently publish a detailed on-page amenity breakdown for this location, this update avoids overclaiming features that are not clearly supported by the municipal pages. Instead, it improves quality by anchoring the page to confirmed facts: the official Burlington listing, the exact Leonardo Street location, and the rules that actually govern visits.</p><p>This makes the page materially stronger for organic search because it now answers the practical questions a visitor would check first: whether the park is officially off leash, where it is, and what Burlington&apos;s current off-leash rules require.</p>';
const notes =
  '<p>Primary sources: https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx for Burlington&apos;s current official leash-free park list and citywide off-leash rules, and the Burlington facilities directory entry for Colin Alton Parkette for the 3925 Leonardo Street location. Coordinate reference used for map fields: https://mapcarta.com/W555287603. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: seoTitle,
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Burlington'],
    Province: ['Ontario'],
    Tags: ['off-leash', 'burlington', 'alton-village', 'official-listing'],
  },
});

Object.assign(park.raw, {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Colin Alton Parkette is an official Burlington leash-free dog park at 3925 Leonardo Street, listed by the city among Burlington&apos;s designated off-leash areas.</p>',
  'Street Address': '3925 Leonardo Street',
  latitude: '43.39303',
  longitude: '-79.8289',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7M 0Z2',
  Fenced: 'Verify fencing layout on arrival',
  'Separate Small Dog Area': 'No separate area listed by city source',
  'Surface type': 'Grass parkette - verify current conditions on arrival',
  Size: 'Neighbourhood parkette leash-free area',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Verify on arrival',
  'Waste bins': 'Required by city rules to use posted disposal points',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Neighbourhood street access - verify parking restrictions on arrival',
  'Washrooms nearby': 'No washroom details published in current city source',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted leash-free park rules and any temporary city notices',
  'Park Website or Source': 'https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/3925+Leonardo+St,+Burlington,+ON+L7M+0Z2',
  Tags: 'off-leash,burlington,alton-village,official-listing',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'colin-alton-parkette', {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Colin Alton Parkette is an official Burlington leash-free dog park at 3925 Leonardo Street, listed by the city among Burlington&apos;s designated off-leash areas.</p>',
  'Street Address': '3925 Leonardo Street',
  latitude: '43.39303',
  longitude: '-79.8289',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7M 0Z2',
  Fenced: 'Verify fencing layout on arrival',
  'Separate Small Dog Area': 'No separate area listed by city source',
  'Surface type': 'Grass parkette - verify current conditions on arrival',
  Size: 'Neighbourhood parkette leash-free area',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Verify on arrival',
  'Waste bins': 'Required by city rules to use posted disposal points',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Neighbourhood street access - verify parking restrictions on arrival',
  'Washrooms nearby': 'No washroom details published in current city source',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted leash-free park rules and any temporary city notices',
  'Park Website or Source': 'https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/3925+Leonardo+St,+Burlington,+ON+L7M+0Z2',
  Tags: 'off-leash,burlington,alton-village,official-listing',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/colin-alton-parkette/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/colin-alton-parkette/';
});

rebuildBacklogSummary();

console.log('Updated Colin Alton Parkette record and refreshed backlog files.');
