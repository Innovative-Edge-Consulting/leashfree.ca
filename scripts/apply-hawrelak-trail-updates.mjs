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
const park = parks.find((entry) => entry.slug === 'hawrelak-trail-off-leash-area');
if (!park) throw new Error('Hawrelak record not found');

const seoTitle = 'William Hawrelak Park | Edmonton Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to William Hawrelak Park in Edmonton, including its reopened lakefront amenities, promenade and pavilion upgrades, and Edmonton’s current rule that dogs on Hawrelak trails must remain on leash.';
const intro =
  '<p>William Hawrelak Park is a major <strong>Edmonton lakefront park</strong> where dogs are permitted on <strong>trails while on leash</strong>, but it should not be treated as an official off-leash dog area.</p>';
const body =
  '<p>The key correction for this page is that <strong>Hawrelak Trail is not an off-leash site</strong>. Edmonton&apos;s current William Hawrelak Park page says <strong>dogs are allowed on Hawrelak trails on leash</strong>. That is a materially different rule from a designated off-leash area, and it means the older record&apos;s leash-free framing was not supported by the city as of <strong>Tuesday, August 4, 2026</strong>.</p><p>The park itself is still one of Edmonton&apos;s most significant urban recreation spaces. The city&apos;s current material emphasizes the reopened <strong>lakefront setting</strong>, updated <strong>promenade</strong>, <strong>new playground</strong>, improved <strong>washroom facilities</strong>, picnic areas, and a modernized <strong>Heritage Amphitheatre / pavilion zone</strong>. That broader civic role is what gives Hawrelak value as a destination park guide, not any unsupported off-leash claim.</p><p>For dog owners, the practical takeaway is simple: Hawrelak remains useful for scenic walks, but dogs should be expected to stay <strong>on leash on the trails</strong> unless Edmonton posts something more specific on site. Users looking for legal off-leash access should rely on the city&apos;s designated off-leash network rather than assume Hawrelak qualifies.</p><p>This rewrite improves trust by removing the false off-leash framing and replacing it with a more accurate major-park guide built around Edmonton&apos;s current rules and park reopening details.</p>';
const notes =
  '<p>Primary sources: the City of Edmonton William Hawrelak Park page for current park amenities and the statement that dogs are allowed on Hawrelak trails on leash, plus the City of Edmonton off-leash sites page for official off-leash network context. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'William Hawrelak Park | Edmonton Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'edmonton', 'lakefront-park', 'on-leash-trails', 'hawrelak-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'William Hawrelak Park | Edmonton Park Guide',
  'Park type': 'Major city park',
  Description:
    '<p>William Hawrelak Park is a major Edmonton lakefront park where dogs are allowed on trails on leash, but it should not be treated as an official off-leash dog area.</p>',
  'Street Address': '9330 Groat Road NW',
  latitude: '53.5298',
  longitude: '-113.5448',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Paved promenade, lawn, and shared park trails',
  Size: 'Major destination park',
  'Water source available': 'Natural lake setting',
  Benches: 'Yes',
  'Shaded area': 'Yes - mature tree cover',
  'Waste bins': 'Yes - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow current city notices and posted rules',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/william-hawrelak-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=9330+Groat+Road+NW+Edmonton+AB',
  Tags: 'park-guide,edmonton,lakefront-park,on-leash-trails,hawrelak-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'hawrelak-trail-off-leash-area', {
  'Park Header': 'William Hawrelak Park | Edmonton Park Guide',
  'Park type': 'Major city park',
  Description:
    '<p>William Hawrelak Park is a major Edmonton lakefront park where dogs are allowed on trails on leash, but it should not be treated as an official off-leash dog area.</p>',
  'Street Address': '9330 Groat Road NW',
  latitude: '53.5298',
  longitude: '-113.5448',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Paved promenade, lawn, and shared park trails',
  Size: 'Major destination park',
  'Water source available': 'Natural lake setting',
  Benches: 'Yes',
  'Shaded area': 'Yes - mature tree cover',
  'Waste bins': 'Yes - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow current city notices and posted rules',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/william-hawrelak-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=9330+Groat+Road+NW+Edmonton+AB',
  Tags: 'park-guide,edmonton,lakefront-park,on-leash-trails,hawrelak-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Hawrelak Trail Off-Leash Area,/dog-parks/hawrelak-trail-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/hawrelak-trail-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/hawrelak-trail-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Hawrelak record and refreshed backlog files.');
