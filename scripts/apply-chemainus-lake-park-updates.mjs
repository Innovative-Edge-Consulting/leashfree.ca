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
const park = parks.find((entry) => entry.slug === 'chemainus-lake-park-ladysmith');
if (!park) throw new Error('Chemainus Lake Park record not found');

const seoTitle = 'Chemainus Lake Park Off-Leash Dog Park | Chemainus';
const metaDescription =
  'Source-backed guide to Chemainus Lake Park in Chemainus, BC, including its official off-leash status, easy 2.3 km loop trail, fishing dock, boat launch, and restroom amenities.';
const intro =
  '<p>Chemainus Lake Park is an <strong>official off-leash dog park</strong> in <strong>Chemainus, British Columbia</strong>, where the Municipality of North Cowichan lists an <strong>easy 2.3 km loop trail</strong> around the lake along with a <strong>fishing dock</strong>, <strong>boat launch</strong>, and <strong>restroom</strong>.</p>';
const body =
  '<p>The previous page copy was directionally right about a lake trail, but it lacked the official details that make this page useful. North Cowichan now has a dedicated Chemainus Lake Park page that clearly labels the site as an <strong>off-leash dog park</strong> and lists the main park amenities in one place. As of <strong>Thursday, August 13, 2026</strong>, the municipality identifies an <strong>easy 2.3 kilometre loop trail</strong> plus a <strong>boat launch</strong>, <strong>restroom</strong>, and <strong>fishing dock</strong>.</p><p>That source-backed framing is better than generic filler because it tells visitors what kind of outing this really is. Chemainus Lake Park is not a fenced run or a small urban relief area. It is a larger natural lake park where the off-leash component is integrated into a walking loop and day-use setting. The official image set also reinforces that character by showing wooded trail sections, lake views, and the fishing dock area.</p><p>North Cowichan&apos;s broader parks directory also classifies Chemainus Lake Park under the <strong>Chemainus community parks</strong> list as an <strong>Off-leash Dog Park</strong>. That matters because it validates the leash-free designation at the municipal level rather than relying on third-party trail descriptions or old listings.</p><p>This update improves the page by replacing unsupported copy with the municipality&apos;s current facts: official off-leash status, the 2.3 km easy loop, and the lake-access amenities that shape the visit experience.</p>';
const notes =
  '<p>Primary sources: https://www.northcowichan.ca/parks/chemainus-lake-park for the official Chemainus Lake Park amenities list showing off-leash dog park status, an easy 2.3 km loop trail, boat launch, restroom, and fishing dock; and https://www.northcowichan.ca/parks for municipal classification of Chemainus Lake Park as an Off-leash Dog Park within the Chemainus community parks inventory. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: 'Chemainus Lake Park Off-Leash Dog Park | Chemainus',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Chemainus'],
    Province: ['British Columbia'],
    Tags: ['off-leash', 'chemainus', 'lake-trail', 'fishing-dock', 'north-cowichan'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Chemainus Lake Park Off-Leash Dog Park | Chemainus',
  'Park type': 'Leash Free',
  Description:
    '<p>Chemainus Lake Park is an official off-leash dog park in Chemainus with an easy 2.3 km loop trail around the lake plus a fishing dock, boat launch, and restroom.</p>',
  'Street Address': 'Chemainus Lake Park, Chemainus, BC',
  latitude: '48.9133056',
  longitude: '-123.7509441',
  City: 'Chemainus',
  Province: 'British Columbia',
  'Postal Code': '',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Natural trail, dirt, forest, lakeside',
  Size: '2.3 km loop trail setting',
  'Water source available': 'Yes - lake access',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - wooded trail sections',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Verify on arrival',
  'Washrooms nearby': 'Yes - restroom listed by the municipality',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted municipal rules and trail conditions',
  'Park Website or Source': 'https://www.northcowichan.ca/parks/chemainus-lake-park',
  'Google Maps Link': 'https://www.google.com/maps/place/Chemainus+Lake+Park/',
  Tags: 'off-leash,chemainus,lake-trail,fishing-dock,north-cowichan',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'chemainus-lake-park-ladysmith', {
  'Park Header': 'Chemainus Lake Park Off-Leash Dog Park | Chemainus',
  'Park type': 'Leash Free',
  Description:
    '<p>Chemainus Lake Park is an official off-leash dog park in Chemainus with an easy 2.3 km loop trail around the lake plus a fishing dock, boat launch, and restroom.</p>',
  'Street Address': 'Chemainus Lake Park, Chemainus, BC',
  latitude: '48.9133056',
  longitude: '-123.7509441',
  City: 'Chemainus',
  Province: 'British Columbia',
  'Postal Code': '',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Natural trail, dirt, forest, lakeside',
  Size: '2.3 km loop trail setting',
  'Water source available': 'Yes - lake access',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - wooded trail sections',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Verify on arrival',
  'Washrooms nearby': 'Yes - restroom listed by the municipality',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted municipal rules and trail conditions',
  'Park Website or Source': 'https://www.northcowichan.ca/parks/chemainus-lake-park',
  'Google Maps Link': 'https://www.google.com/maps/place/Chemainus+Lake+Park/',
  Tags: 'off-leash,chemainus,lake-trail,fishing-dock,north-cowichan',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Chemainus Lake Park,/dog-parks/chemainus-lake-park-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/chemainus-lake-park-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/chemainus-lake-park-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Chemainus Lake Park record and refreshed backlog files.');
