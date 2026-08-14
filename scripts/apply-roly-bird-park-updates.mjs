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
const park = parks.find((entry) => entry.slug === 'roly-bird-park');
if (!park) throw new Error('Roly Bird Park record not found');

const seoTitle = 'Roly Bird Park Off-Leash Area | Burlington';
const metaDescription =
  'Source-backed guide to Roly Bird Park in Burlington, including the official 2203 Industrial Street location, current Burlington leash-free rules, and the city’s cherry-tree twinning detail for the park.';
const intro =
  '<p>Roly Bird Park is one of Burlington&apos;s officially listed <strong>leash-free parks</strong>. The current city sources validate the off-leash status, but they do not support several of the older detailed amenity claims, so this update keeps the page factual and current.</p>';
const body =
  '<p>The current Burlington leash-free parks page specifically includes <strong>Roly Bird Park</strong> in the city&apos;s list of official leash-free areas. The park is located at <strong>2203 Industrial Street</strong> in Burlington, which is the core location fact users need first.</p><p>The page is stronger when it stays anchored to verified local details instead of carrying forward unsupported specifics. Burlington&apos;s current city sources do not clearly publish the old page&apos;s detailed claims about exact dog-area surface, double-gating, or full amenity layout, so those claims have been removed rather than repeated without evidence.</p><p>There is, however, one useful local detail the city does publish: Burlington&apos;s twinning page notes that the city presented a <strong>cherry tree to Itabashi</strong> for planting in <strong>Roly Bird Park</strong> in <strong>2009</strong> to mark the 20th anniversary of the twinning relationship. That gives this page a real piece of place-specific context instead of generic dog-park language.</p><p>The most important visit rules come from Burlington&apos;s leash-free guidance. The city says dog owners should <strong>always carry a leash</strong>, <strong>always stay with their dog</strong>, <strong>pick up and dispose of waste</strong>, and keep a <strong>maximum of two dogs off leash at one time</strong>. Dogs must also be licensed, vaccinated, and under control. As of <strong>Friday, August 14, 2026</strong>, this page is now aligned with Burlington&apos;s actual published information rather than assumptions.</p>';
const notes =
  '<p>Primary sources: https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx for Burlington&apos;s current official leash-free park list and citywide off-leash rules; https://www.burlington.ca/en/your-city/burlington-s-twinning-relationships.aspx for the city&apos;s published note that a cherry tree was presented to Itabashi for planting in Roly Bird Park in 2009; and the City of Burlington address listing for the 2203 Industrial Street park location. Reviewed on Friday, August 14, 2026.</p>';

Object.assign(park, {
  title: seoTitle,
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Burlington'],
    Province: ['Ontario'],
    Tags: ['off-leash', 'burlington', 'urban-park', 'itabashi', 'cherry-tree'],
  },
});

Object.assign(park.raw, {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Roly Bird Park is an official Burlington leash-free park at 2203 Industrial Street, with current city-backed off-leash rules and verified local park context tied to Burlington’s twinning history.</p>',
  'Street Address': '2203 Industrial Street',
  latitude: '43.34606',
  longitude: '-79.81991',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7P 1A1',
  Fenced: 'Verify exact boundary treatment on arrival',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Verify on arrival',
  Size: 'Leash-free area within larger park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - mature trees visible in park setting',
  'Waste bins': 'Yes - follow city waste-disposal rules',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Verify on arrival',
  'Washrooms nearby': 'No public washrooms confirmed in current source set',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow Burlington leash-free area rules and any posted temporary notices',
  'Park Website or Source': 'https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/2203+Industrial+St,+Burlington,+ON+L7P+1A1',
  Tags: 'off-leash,burlington,urban-park,itabashi,cherry-tree',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'roly-bird-park', {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Roly Bird Park is an official Burlington leash-free park at 2203 Industrial Street, with current city-backed off-leash rules and verified local park context tied to Burlington’s twinning history.</p>',
  'Street Address': '2203 Industrial Street',
  latitude: '43.34606',
  longitude: '-79.81991',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7P 1A1',
  Fenced: 'Verify exact boundary treatment on arrival',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Verify on arrival',
  Size: 'Leash-free area within larger park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - mature trees visible in park setting',
  'Waste bins': 'Yes - follow city waste-disposal rules',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Verify on arrival',
  'Washrooms nearby': 'No public washrooms confirmed in current source set',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow Burlington leash-free area rules and any posted temporary notices',
  'Park Website or Source': 'https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/2203+Industrial+St,+Burlington,+ON+L7P+1A1',
  Tags: 'off-leash,burlington,urban-park,itabashi,cherry-tree',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/roly-bird-park/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/roly-bird-park/';
});

rebuildBacklogSummary();

console.log('Updated Roly Bird Park record and refreshed backlog files.');
