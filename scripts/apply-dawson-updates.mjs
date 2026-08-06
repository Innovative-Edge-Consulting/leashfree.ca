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
const park = parks.find((entry) => entry.slug === 'dawson-park-off-leash-area');
if (!park) throw new Error('Dawson record not found');

const seoTitle = 'Dawson Park Off-Leash Area | Edmonton | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Dawson Park Off-Leash Area in Edmonton, including its North Saskatchewan River valley setting, shared-use trail environment, and the construction impact running from August 1 to September 30, 2026.';
const intro =
  '<p>Dawson Park Off-Leash Area is one of Edmonton&apos;s official <strong>river valley dog off-leash sites</strong>, set beside the <strong>North Saskatchewan River</strong> with open grass, paved shared-use paths, and current 2026 construction impacts visitors should check before going.</p>';
const body =
  '<p>The City of Edmonton currently lists <strong>Dawson Park Off-Leash Area</strong> as one of its official dog off-leash sites, which makes this a real municipal off-leash location rather than a generic riverside park page. The city&apos;s dog-park system also makes clear that these areas are shared public spaces where dogs must remain under control and owners are responsible for following posted rules.</p><p>Dawson&apos;s main value is its <strong>river valley setting</strong>. Edmonton places the site in <strong>Dawson Park</strong> along the <strong>North Saskatchewan River</strong>, which is more useful and accurate than vague filler about &quot;tranquil trails.&quot; Visitors should expect a mixed-use park environment with grass, paved pathways, river-valley views, and other trail users rather than a dedicated fenced enclosure.</p><p>The page also needs current access context. Edmonton&apos;s active dog-park notice says that a <strong>portion of the Dawson Park off-leash site is closed for construction from August 1, 2026 through September 30, 2026</strong>. As of <strong>Thursday, August 6, 2026</strong>, that advisory is current. It affects trip planning directly and belongs on the page more than generic prose does.</p><p>This update improves the page by replacing thin copy with what the city actually publishes: official Edmonton off-leash status, North Saskatchewan River valley location, shared-use park context, and the live August 1 to September 30, 2026 construction impact.</p>';
const notes =
  '<p>Primary sources: https://www.edmonton.ca/activities_parks_recreation/parks_dog_off_leash for official Edmonton dog off-leash site status and the current notice that a portion of Dawson Park off-leash site is closed for construction from August 1, 2026 to September 30, 2026; and https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/dawson-park for Dawson Park&apos;s official river valley location along the North Saskatchewan River. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Dawson Park Off-Leash Area | Edmonton',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'edmonton', 'dawson-park', 'river-valley', 'construction-advisory'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Dawson Park Off-Leash Area | Edmonton',
  'Park type': 'Leash Free',
  Description:
    '<p>Dawson Park Off-Leash Area is an official Edmonton river valley off-leash site along the North Saskatchewan River, with open park terrain, shared-use trails, and a current August 1 to September 30, 2026 construction impact.</p>',
  'Street Address': '10298 89 Street NW',
  latitude: '53.5539',
  longitude: '-113.4646',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, natural river valley terrain, and paved shared-use paths',
  Size: 'Large river valley off-leash site',
  'Water source available': 'North Saskatchewan River access nearby - use caution',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current park access during construction',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'A portion of the site is closed for construction from 2026-08-01 through 2026-09-30',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_dog_off_leash',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=10298+89+Street+NW+Edmonton+AB',
  Tags: 'off-leash,edmonton,dawson-park,river-valley,construction-advisory',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'dawson-park-off-leash-area', {
  'Park Header': 'Dawson Park Off-Leash Area | Edmonton',
  'Park type': 'Leash Free',
  Description:
    '<p>Dawson Park Off-Leash Area is an official Edmonton river valley off-leash site along the North Saskatchewan River, with open park terrain, shared-use trails, and a current August 1 to September 30, 2026 construction impact.</p>',
  'Street Address': '10298 89 Street NW',
  latitude: '53.5539',
  longitude: '-113.4646',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, natural river valley terrain, and paved shared-use paths',
  Size: 'Large river valley off-leash site',
  'Water source available': 'North Saskatchewan River access nearby - use caution',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current park access during construction',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'A portion of the site is closed for construction from 2026-08-01 through 2026-09-30',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_dog_off_leash',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=10298+89+Street+NW+Edmonton+AB',
  Tags: 'off-leash,edmonton,dawson-park,river-valley,construction-advisory',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Dawson Park Off-Leash Area,/dog-parks/dawson-park-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/dawson-park-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/dawson-park-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Dawson record and refreshed backlog files.');
