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
const park = parks.find((entry) => entry.slug === 'dogwood-park');
if (!park) throw new Error('Dogwood Park record not found');

const seoTitle = 'Dogwood Park | White Rock Dog Rules and Off-Leash Alternative';
const metaDescription =
  'Source-backed White Rock dog rules page clarifying that the city’s current off-leash dog park is in Ruth Johnson Park and that dogs in most other White Rock parks must remain leashed.';
const intro =
  '<p>This legacy Dogwood Park page should <strong>not be treated as a verified White Rock off-leash dog park</strong>. White Rock&apos;s current dog rules say the city&apos;s <strong>off-leash dog park is in Ruth Johnson Park</strong>, while dogs in most other city parks must remain <strong>on leash</strong>.</p>';
const body =
  '<p>The old Dogwood Park listing is not supported by White Rock&apos;s current dog guidance. The city&apos;s <strong>Dogs in White Rock</strong> page says the City&apos;s off-leash dog park is located in <strong>Ruth Johnson Park</strong>. The same page also says <strong>dogs are allowed on-leash in most parks year-round</strong>, which is a very different claim from the old off-leash Dogwood copy.</p><p>White Rock repeats that same point in other current public information. The city&apos;s off-leash dog park page directs dog owners to <strong>Ruth Johnson Park at 14600 North Bluff Road</strong>, describing a large, treed and fenced off-leash area. Older city news and FAQ material also refer to <strong>the White Rock off-leash dog park</strong> in Ruth Johnson Park, rather than describing multiple city off-leash parks.</p><p>Because of that evidence, this route is best treated as a correction page rather than a destination recommendation. If you&apos;re planning an off-leash outing in White Rock, the official city-backed choice is <strong>Ruth Johnson Park</strong>. If you&apos;re visiting other White Rock parks, the current city rule is to keep dogs <strong>leashed</strong>, and additional waterfront restrictions apply on the promenade, pier, and beach.</p><p>This update improves the page by removing unsupported off-leash claims and replacing them with White Rock&apos;s current dog rules and the correct official off-leash alternative.</p>';
const notes =
  '<p>Primary sources: https://www.whiterockcity.ca/799/Dogs-in-White-Rock for the current City of White Rock statement that dogs are allowed on-leash in most parks and that dogs can go off-leash in the off-leash dog park located in Ruth Johnson Park; https://www.whiterockcity.ca/1106/Off-Leash-Dog-Park for the official White Rock off-leash dog park page naming Ruth Johnson Park at 14600 North Bluff Road; and White Rock city news/FAQ material confirming that the White Rock off-leash dog park is in Ruth Johnson Park. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: 'Dogwood Park | White Rock Dog Rules and Off-Leash Alternative',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['White Rock'],
    Province: ['British Columbia'],
    Tags: ['white-rock', 'on-leash', 'ruth-johnson-park', 'off-leash-alternative', 'rules-correction'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Dogwood Park | White Rock Dog Rules and Off-Leash Alternative',
  'Park type': 'Rules note - off-leash claim not verified',
  Description:
    '<p>This legacy Dogwood Park page is not supported as a verified White Rock off-leash park. White Rock&apos;s current dog guidance points dog owners to the off-leash dog park in Ruth Johnson Park and requires leashes in most other parks.</p>',
  'Street Address': 'White Rock, BC',
  latitude: '49.0386643',
  longitude: '-122.8488615',
  City: 'White Rock',
  Province: 'British Columbia',
  'Postal Code': '',
  Fenced: 'No verified off-leash enclosure for this record',
  'Separate Small Dog Area': 'No verified separate area',
  'Surface type': 'Verify on arrival',
  Size: 'Unverified legacy record',
  'Water source available': 'Unknown',
  Benches: 'Unknown',
  'Shaded area': 'Unknown',
  'Waste bins': 'Unknown',
  'Bag Dispensers': 'Unknown',
  'Parking Available': 'Verify on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Follow White Rock park hours and posted rules',
  'Seasonal Restrictions': 'Dogs are leashed in most parks; official off-leash area is Ruth Johnson Park',
  'Park Website or Source': 'https://www.whiterockcity.ca/799/Dogs-in-White-Rock',
  'Google Maps Link': 'https://www.google.com/maps/place/Dogwood+Park/',
  Tags: 'white-rock,on-leash,ruth-johnson-park,off-leash-alternative,rules-correction',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'dogwood-park', {
  'Park Header': 'Dogwood Park | White Rock Dog Rules and Off-Leash Alternative',
  'Park type': 'Rules note - off-leash claim not verified',
  Description:
    '<p>This legacy Dogwood Park page is not supported as a verified White Rock off-leash park. White Rock&apos;s current dog guidance points dog owners to the off-leash dog park in Ruth Johnson Park and requires leashes in most other parks.</p>',
  'Street Address': 'White Rock, BC',
  latitude: '49.0386643',
  longitude: '-122.8488615',
  City: 'White Rock',
  Province: 'British Columbia',
  'Postal Code': '',
  Fenced: 'No verified off-leash enclosure for this record',
  'Separate Small Dog Area': 'No verified separate area',
  'Surface type': 'Verify on arrival',
  Size: 'Unverified legacy record',
  'Water source available': 'Unknown',
  Benches: 'Unknown',
  'Shaded area': 'Unknown',
  'Waste bins': 'Unknown',
  'Bag Dispensers': 'Unknown',
  'Parking Available': 'Verify on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Follow White Rock park hours and posted rules',
  'Seasonal Restrictions': 'Dogs are leashed in most parks; official off-leash area is Ruth Johnson Park',
  'Park Website or Source': 'https://www.whiterockcity.ca/799/Dogs-in-White-Rock',
  'Google Maps Link': 'https://www.google.com/maps/place/Dogwood+Park/',
  Tags: 'white-rock,on-leash,ruth-johnson-park,off-leash-alternative,rules-correction',
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
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/dogwood-park/';
  },
);

removeCsvRow(
  reviewQueuePath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/dogwood-park/';
  },
);

rebuildBacklogSummary();

console.log('Updated Dogwood Park record and refreshed backlog files.');
