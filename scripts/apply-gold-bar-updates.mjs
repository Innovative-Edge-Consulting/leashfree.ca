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
const park = parks.find((entry) => entry.slug === 'gold-bar-park-off-leash-area');
if (!park) throw new Error('Gold Bar record not found');

const seoTitle = 'Gold Bar Park Off-Leash Area | Edmonton | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Gold Bar Park Off-Leash Area in Edmonton, including official off-leash status, Gold Bar Park amenities, paved access, picnic infrastructure, and washroom availability near the pavilion.';
const intro =
  '<p>Gold Bar Park Off-Leash Area is one of Edmonton&apos;s official <strong>river valley dog off-leash sites</strong>, accessed through <strong>Gold Bar Park at 10955 50 Street NW</strong> with trails, picnic infrastructure, paved routes, and seasonal washroom access near the pavilion.</p>';
const body =
  '<p>The City of Edmonton currently lists <strong>Gold Bar Park Off-Leash Area</strong> as one of its official dog off-leash sites, which makes this a legitimate municipal off-leash page rather than a generic trail description. Edmonton&apos;s off-leash system also treats these sites as shared public environments, so visitors should expect dogs, walkers, cyclists, and other park users in the same broader river valley setting.</p><p>Gold Bar is stronger than the old thin stub because the city publishes real supporting park details. Edmonton&apos;s <strong>Gold Bar Park</strong> page identifies the park at <strong>10955 50 Street NW</strong> and notes amenities including <strong>trails</strong>, a <strong>picnic shelter or pavilion</strong>, <strong>picnic tables</strong>, and <strong>washrooms</strong>. That is materially more useful for trip planning than vague claims about &quot;expansive trails and off-leash freedom.&quot;</p><p>The city also documents practical access features. Edmonton&apos;s accessibility guidance for Gold Bar Park highlights a <strong>paved path from parking to the washroom and main park area</strong>, with the washroom itself marked as <strong>partially accessible</strong>. That does not mean the full off-leash terrain is barrier-free, but it does give visitors a clearer expectation for the main approach and core park facilities.</p><p>This update improves the page by grounding it in Edmonton&apos;s published facts: official off-leash status, Gold Bar Park location, trails, pavilion and picnic amenities, washroom availability, and paved access from parking into the main park area.</p>';
const notes =
  '<p>Primary sources: https://www.edmonton.ca/activities_parks_recreation/parks_dog_off_leash for official Edmonton dog off-leash site status; https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/gold-bar-park for the current Gold Bar Park address and amenities including trails, picnic shelter or pavilion, picnic tables, and washrooms; and Edmonton&apos;s current park accessibility information for Gold Bar Park noting a paved path from parking to the washroom and main park area, with partially accessible washrooms. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Gold Bar Park Off-Leash Area | Edmonton',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'edmonton', 'gold-bar-park', 'river-valley', 'paved-access'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Gold Bar Park Off-Leash Area | Edmonton',
  'Park type': 'Leash Free',
  Description:
    '<p>Gold Bar Park Off-Leash Area is an official Edmonton river valley off-leash site with trails, picnic infrastructure, paved park access, and washrooms near the pavilion area.</p>',
  'Street Address': '10955 50 Street NW',
  latitude: '53.5497',
  longitude: '-113.4082',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, natural river valley terrain, and paved park paths',
  Size: 'Large river valley off-leash site',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Picnic seating available in the broader park',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - park access parking available',
  'Washrooms nearby': 'Yes - washrooms near pavilion area',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_dog_off_leash',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=10955+50+Street+NW+Edmonton+AB',
  Tags: 'off-leash,edmonton,gold-bar-park,river-valley,paved-access',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'gold-bar-park-off-leash-area', {
  'Park Header': 'Gold Bar Park Off-Leash Area | Edmonton',
  'Park type': 'Leash Free',
  Description:
    '<p>Gold Bar Park Off-Leash Area is an official Edmonton river valley off-leash site with trails, picnic infrastructure, paved park access, and washrooms near the pavilion area.</p>',
  'Street Address': '10955 50 Street NW',
  latitude: '53.5497',
  longitude: '-113.4082',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, natural river valley terrain, and paved park paths',
  Size: 'Large river valley off-leash site',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Picnic seating available in the broader park',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - park access parking available',
  'Washrooms nearby': 'Yes - washrooms near pavilion area',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_dog_off_leash',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=10955+50+Street+NW+Edmonton+AB',
  Tags: 'off-leash,edmonton,gold-bar-park,river-valley,paved-access',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Gold Bar Park Off-Leash Area,/dog-parks/gold-bar-park-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/gold-bar-park-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/gold-bar-park-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Gold Bar record and refreshed backlog files.');
