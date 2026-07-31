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
const park = parks.find((entry) => entry.slug === 'callingwood-park-off-leash-area');
if (!park) throw new Error('Callingwood Park Off-Leash Area record not found');

const seoTitle = 'Callingwood Park Off-Leash Area | Edmonton Dog Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Callingwood Park Off-Leash Area in Edmonton, including the official 17740 69 Avenue location, natural tree-stand off-leash area, 5 a.m. to 11 p.m. park hours, pavilion washrooms, and surrounding park amenities.';
const intro =
  '<p>Callingwood Park is one of Edmonton&apos;s official off-leash locations, with a <strong>dog area in a natural tree stand</strong> inside a larger west-Edmonton community park at <strong>17740 69 Avenue</strong>.</p>';
const body =
  '<p>Edmonton&apos;s current Callingwood Park page confirms that this is a real designated off-leash location and gives much stronger context than the older thin copy. The city lists the park at <strong>17740 69 Avenue</strong> and includes an <strong>off-leash area located in a natural tree stand</strong> as one of the main amenities. That matters because it positions Callingwood differently from Edmonton&apos;s wide-open corridor sites: this is an off-leash area inside a busy neighbourhood park with more surrounding activity and more nearby services.</p><p>The broader park page adds useful practical detail. Edmonton lists <strong>park hours from 5 a.m. to 11 p.m.</strong> and says the <strong>pavilion is open from 9 a.m. to 9 p.m.</strong>. The city also confirms nearby washrooms at the Callingwood Pavilion, plus a larger amenity mix that includes <strong>baseball diamonds</strong>, <strong>sports fields</strong>, a <strong>spray park</strong>, a <strong>skate park</strong>, picnic sites, and nearby facilities such as the arena, library, and YMCA. For users, that means this is a shared-use municipal park with a designated dog component, not a dog-only destination.</p><p>Edmonton&apos;s city-wide off-leash rules still apply. The city says dogs may only be loose on private property or in a designated off-leash area, must be <strong>leashed when entering and leaving</strong> off-leash boundaries, must remain <strong>in sight and under control</strong>, and must not chase wildlife. Those rules matter more at Callingwood because the site sits inside a high-use family and recreation park where dogs, sports users, children, and general park visitors are all close together.</p><p>The practical summary is straightforward: Callingwood works best as a convenient west-Edmonton off-leash stop for everyday exercise, especially for owners who value nearby amenities and a treed setting more than large wilderness-scale space. The reason to use this page is not to describe it as generic wide-open parkland, but to make clear that it is an official designated dog area inside one of Edmonton&apos;s busiest neighbourhood recreation parks.</p>';
const notes =
  '<p>Primary sources: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/callingwood-park and https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Callingwood Park Off-Leash Area | Edmonton Dog Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'edmonton', 'treed', 'neighbourhood-park', 'west-edmonton'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Callingwood Park Off-Leash Area | Edmonton Dog Park Guide',
  Description:
    '<p>Callingwood Park is an official Edmonton off-leash site at 17740 69 Avenue, with the dog area located in a natural tree stand inside a larger community recreation park.</p>',
  'Park type': 'Leash Free',
  'Street Address': '17740 69 Avenue',
  latitude: '53.5048',
  longitude: '-113.6264',
  'Surface type': 'Natural treed area and parkland surface',
  Size: 'Neighbourhood off-leash area within larger park',
  'Water source available': 'No city-confirmed dog water source',
  Benches: 'Likely in surrounding park areas - verify exact dog-area seating on arrival',
  'Shaded area': 'Yes - natural tree stand',
  'Waste bins': 'Expected in broader park - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes - Callingwood Pavilion washrooms',
  'Operating hours': 'Park 5 a.m. to 11 p.m.; pavilion 9 a.m. to 9 p.m.',
  'Seasonal Restrictions': 'Check posted city notices and wildlife conditions',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/callingwood-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=17740+69+Avenue+Edmonton+AB',
  Tags: 'off-leash,edmonton,treed,neighbourhood-park,west-edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'callingwood-park-off-leash-area', {
  'Park Header': 'Callingwood Park Off-Leash Area | Edmonton Dog Park Guide',
  Description:
    '<p>Callingwood Park is an official Edmonton off-leash site at 17740 69 Avenue, with the dog area located in a natural tree stand inside a larger community recreation park.</p>',
  'Park type': 'Leash Free',
  'Street Address': '17740 69 Avenue',
  latitude: '53.5048',
  longitude: '-113.6264',
  'Surface type': 'Natural treed area and parkland surface',
  Size: 'Neighbourhood off-leash area within larger park',
  'Water source available': 'No city-confirmed dog water source',
  Benches: 'Likely in surrounding park areas - verify exact dog-area seating on arrival',
  'Shaded area': 'Yes - natural tree stand',
  'Waste bins': 'Expected in broader park - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes - Callingwood Pavilion washrooms',
  'Operating hours': 'Park 5 a.m. to 11 p.m.; pavilion 9 a.m. to 9 p.m.',
  'Seasonal Restrictions': 'Check posted city notices and wildlife conditions',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/callingwood-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=17740+69+Avenue+Edmonton+AB',
  Tags: 'off-leash,edmonton,treed,neighbourhood-park,west-edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Callingwood Park Off-Leash Area,/dog-parks/callingwood-park-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/callingwood-park-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/callingwood-park-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Callingwood Park Off-Leash Area record and refreshed backlog files.');
