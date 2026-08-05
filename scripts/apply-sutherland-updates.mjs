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
  return rows
    .map((row) =>
      row
        .map((field = '') => {
          const text = String(field);
          const escaped = text.replace(/"/g, '""');
          return /[",\n\r]/.test(text) ? `"${escaped}"` : escaped;
        })
        .join(','),
    )
    .join('\n') + '\n';
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
const park = parks.find((entry) => entry.slug === 'sutherland-off-leash-dog-park');
if (!park) throw new Error('Sutherland record not found');

const seoTitle = 'Sutherland Beach Dog Park | Saskatoon | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Sutherland Beach Dog Park in Saskatoon, including the riverside off-leash setting, access off Central Avenue north of Attridge Drive, water-safety caution, and City dog-park rules.';
const intro =
  '<p>Sutherland Beach Dog Park is one of Saskatoon&apos;s official <strong>naturalized off-leash areas</strong>, accessed <strong>west of Central Avenue just north of Attridge Drive</strong> along the South Saskatchewan River.</p>';
const body =
  '<p>Saskatoon&apos;s current dog-park page gives Sutherland clearer and more useful framing than the old generic stub. The city identifies <strong>Sutherland Beach Dog Park</strong> as one of its official dog parks and specifically flags it as a site with <strong>river access</strong>. That immediately makes it different from a standard open field because the river setting is both part of the appeal and one of the park&apos;s main risk factors.</p><p>The city&apos;s current dog-park guidance now puts that safety issue front and centre. Saskatoon warns that Sutherland Beach is a place where dogs may be off leash near a <strong>large body of water</strong> and advises visitors to exercise an <strong>elevated level of caution</strong> around the South Saskatchewan River. The city also tells owners to keep dogs <strong>within eyesight and under control</strong> at all times in the dog parks, which matters even more at a naturalized riverside site than at a fenced enclosure.</p><p>The page also needs the city&apos;s basic operating context. Saskatoon requires a <strong>valid dog licence</strong> for dog-park use and positions these spaces as naturalized shared environments where wildlife may also be present. The city&apos;s commercial dog walker rules separately confirm that <strong>Sutherland Beach</strong> is one of the approved off-leash areas for permitted walkers, which helps confirm that the name and site are current rather than legacy copy.</p><p>This update improves the page by replacing vague &quot;rustic riverside trails&quot; language with the city&apos;s actual framing: official Sutherland Beach naming, Central Avenue access, river-adjacent off-leash use, water-safety caution, and standard Saskatoon control and licensing rules.</p>';
const notes =
  '<p>Primary sources: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks for official dog-park status, river-access water-safety guidance, and current city rules; and https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks/commercial-dog-walker for the current Sutherland Beach naming in the commercial dog walker program. Supporting historical city releases also consistently place Sutherland Beach west of Central Avenue, north of Attridge Drive. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Sutherland Beach Dog Park | Saskatoon',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'saskatoon', 'sutherland-beach', 'river-access', 'water-safety'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Sutherland Beach Dog Park | Saskatoon',
  'Park type': 'Leash Free',
  Description:
    '<p>Sutherland Beach Dog Park is an official Saskatoon off-leash area with South Saskatchewan River access, natural terrain, and a city-issued water-safety caution.</p>',
  'Street Address': 'West of Central Avenue, north of Attridge Drive',
  latitude: '52.1532',
  longitude: '-106.6151',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Naturalized grass, sand, riverbank, and shared path terrain',
  Size: 'Large naturalized dog park',
  'Water source available': 'Yes - river access',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some natural tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Access via grid road entry off Central Avenue - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Use elevated caution near water and follow posted city notices',
  'Park Website or Source': 'https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Sutherland+Beach+Dog+Park+Saskatoon+SK',
  Tags: 'off-leash,saskatoon,sutherland-beach,river-access,water-safety',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'sutherland-off-leash-dog-park', {
  'Park Header': 'Sutherland Beach Dog Park | Saskatoon',
  'Park type': 'Leash Free',
  Description:
    '<p>Sutherland Beach Dog Park is an official Saskatoon off-leash area with South Saskatchewan River access, natural terrain, and a city-issued water-safety caution.</p>',
  'Street Address': 'West of Central Avenue, north of Attridge Drive',
  latitude: '52.1532',
  longitude: '-106.6151',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Naturalized grass, sand, riverbank, and shared path terrain',
  Size: 'Large naturalized dog park',
  'Water source available': 'Yes - river access',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some natural tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Access via grid road entry off Central Avenue - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Use elevated caution near water and follow posted city notices',
  'Park Website or Source': 'https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Sutherland+Beach+Dog+Park+Saskatoon+SK',
  Tags: 'off-leash,saskatoon,sutherland-beach,river-access,water-safety',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Off-Leash Recreation Area Sutherland,/dog-parks/sutherland-off-leash-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/sutherland-off-leash-dog-park/"') ||
    row.join(',').includes(',/dog-parks/sutherland-off-leash-dog-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Sutherland record and refreshed backlog files.');
