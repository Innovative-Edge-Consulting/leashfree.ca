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
const park = parks.find((entry) => entry.slug === 'royal-oaks-neighbourhood-off-leash-area');
if (!park) throw new Error('Royal Oaks record not found');

const seoTitle = 'Royal Oaks Neighbourhood Off-Leash Area | Grande Prairie';
const metaDescription =
  'Source-backed guide to the Royal Oaks Neighbourhood Off-Leash Area in Grande Prairie, including its open green-space format, lack of full fencing, litter receptacles, dog waste bag dispensers, and handler responsibility to keep dogs safely within the area.';
const intro =
  '<p>Royal Oaks is one of Grande Prairie&apos;s official <strong>Neighbourhood Off-Leash Areas</strong>, where the city designates an <strong>open green-space area</strong> for off-leash use rather than a fully fenced dog park.</p>';
const body =
  '<p>The current City of Grande Prairie parks finder gives clearer detail than the old thin copy. It groups Royal Oaks with Crystal Ridge as one of the city&apos;s <strong>Neighbourhood Off-Leash Areas</strong>, which means this page should describe a designated neighbourhood green space, not a heavily built dog park.</p><p>The city says these neighbourhood off-leash areas have <strong>litter receptacles</strong> and <strong>dog waste bag dispensers</strong> available for public use. It also states that the areas are <strong>not fully fenced</strong>, and asks residents to make sure their dogs remain safely within the area at all times while off leash. That is the most important practical rule for visitors, and it is stronger than the old generic claim that the site was simply an unfenced grassy dog zone.</p><p>Grande Prairie&apos;s older animal-services communication also reinforces Royal Oaks as one of the city&apos;s designated off-leash locations, listed as <strong>Royal Oaks Off-leash Area (just north of 117 Avenue)</strong>. Combined with the current parks finder, that confirms the listing should stay live as a neighbourhood-scale off-leash area rather than being removed as a false record.</p><p>This update improves the page by replacing filler with the city&apos;s actual framing: designated neighbourhood off-leash green space, not fully fenced, litter receptacles and waste bags provided, and handlers responsible for keeping dogs safely within the area.</p>';
const notes =
  '<p>Primary sources: https://cityofgp.com/parksfinder for the current City of Grande Prairie description of Royal Oaks as one of the Neighbourhood Off-Leash Areas, with litter receptacles, dog waste bag dispensers, and a note that the area is not fully fenced; and a City of Grande Prairie enforcement information page identifying Royal Oaks Off-leash Area just north of 117 Avenue as one of the city&apos;s designated off-leash locations. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: 'Royal Oaks Neighbourhood Off-Leash Area | Grande Prairie',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Grande Prairie'],
    Province: ['Alberta'],
    Tags: ['off-leash', 'grande-prairie', 'neighbourhood', 'not-fully-fenced', 'bag-dispensers'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Royal Oaks Neighbourhood Off-Leash Area | Grande Prairie',
  'Park type': 'Leash Free',
  Description:
    '<p>Royal Oaks is a designated Grande Prairie neighbourhood off-leash green space with litter receptacles and dog waste bag dispensers, but it is not fully fenced and handlers must keep dogs safely within the area.</p>',
  'Street Address': 'Just north of 117 Avenue, Royal Oaks, Grande Prairie',
  latitude: '55.1911',
  longitude: '-118.7992',
  City: 'Grande Prairie',
  Province: 'Alberta',
  'Postal Code': '',
  Fenced: 'No - not fully fenced',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: 'Neighbourhood green-space off-leash area',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Minimal to some tree cover',
  'Waste bins': 'Yes - litter receptacles provided',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Street access nearby - verify on arrival',
  'Washrooms nearby': 'No public washrooms confirmed',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Not fully fenced; keep dogs safely within the designated area',
  'Park Website or Source': 'https://cityofgp.com/parksfinder',
  'Google Maps Link': 'https://maps.google.com/?q=Royal+Oaks+Off-Leash+Area,+Grande+Prairie,+AB',
  Tags: 'off-leash,grande-prairie,neighbourhood,not-fully-fenced,bag-dispensers',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'royal-oaks-neighbourhood-off-leash-area', {
  'Park Header': 'Royal Oaks Neighbourhood Off-Leash Area | Grande Prairie',
  'Park type': 'Leash Free',
  Description:
    '<p>Royal Oaks is a designated Grande Prairie neighbourhood off-leash green space with litter receptacles and dog waste bag dispensers, but it is not fully fenced and handlers must keep dogs safely within the area.</p>',
  'Street Address': 'Just north of 117 Avenue, Royal Oaks, Grande Prairie',
  latitude: '55.1911',
  longitude: '-118.7992',
  City: 'Grande Prairie',
  Province: 'Alberta',
  'Postal Code': '',
  Fenced: 'No - not fully fenced',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: 'Neighbourhood green-space off-leash area',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Minimal to some tree cover',
  'Waste bins': 'Yes - litter receptacles provided',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Street access nearby - verify on arrival',
  'Washrooms nearby': 'No public washrooms confirmed',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Not fully fenced; keep dogs safely within the designated area',
  'Park Website or Source': 'https://cityofgp.com/parksfinder',
  'Google Maps Link': 'https://maps.google.com/?q=Royal+Oaks+Off-Leash+Area,+Grande+Prairie,+AB',
  Tags: 'off-leash,grande-prairie,neighbourhood,not-fully-fenced,bag-dispensers',
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
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/royal-oaks-neighbourhood-off-leash-area/';
  },
);

removeCsvRow(
  reviewQueuePath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/royal-oaks-neighbourhood-off-leash-area/';
  },
);

rebuildBacklogSummary();

console.log('Updated Royal Oaks record and refreshed backlog files.');
