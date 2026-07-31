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

  if (keyIndex === -1) {
    throw new Error(`CSV field not found: ${keyField}`);
  }

  const row = rows.find((entry, index) => index > 0 && entry[keyIndex] === keyValue);

  if (!row) {
    throw new Error(`CSV row not found for ${keyField}=${keyValue}`);
  }

  for (const [field, value] of Object.entries(updates)) {
    const index = header.indexOf(field);
    if (index === -1) {
      throw new Error(`CSV field not found: ${field}`);
    }
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

  const tierRows = countBy('tier')
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join('\n');
  const sectionRows = countBy('contentType')
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join('\n');
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
const park = parks.find((entry) => entry.slug === 'hermitage-park-off-leash-area');

if (!park) {
  throw new Error('Hermitage Park Off-Leash Area record not found');
}

const seoTitle = 'Hermitage Park Off-Leash Area | Edmonton Dog Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Hermitage Park Off-Leash Area in Edmonton, including official location, large natural setting, parking, washrooms, picnic amenities, and current July 2026 project activity within the off-leash area.';
const intro =
  '<p>Hermitage Park is one of Edmonton&apos;s major official off-leash destinations, combining a <strong>large natural dog area</strong> with <strong>walking trails</strong>, <strong>parking</strong>, <strong>washrooms</strong>, and a broader riverside-style park setting.</p>';
const body =
  '<p>Edmonton&apos;s current park and off-leash pages give Hermitage much stronger factual support than the older thin profile. The city lists Hermitage Park at <strong>2115 Hermitage Road</strong> in northeast Edmonton and describes it as a park with <strong>natural trails</strong>, a <strong>large off-leash dog area</strong>, and <strong>picnic sites</strong>. The broader River Valley Parks listing also highlights Hermitage specifically as an off-leash destination with <strong>parking</strong>, <strong>portable toilets throughout the park</strong>, and <strong>walking and cycling trails</strong>.</p><p>The main park page adds useful operational detail. Edmonton lists park access from <strong>5 a.m. to 11 p.m.</strong> and washrooms from <strong>9 a.m. to 9 p.m.</strong>. It also confirms extra amenities that matter to visitors using the park beyond the dog area, including <strong>fishing</strong>, <strong>boating access for personal non-motorized craft</strong>, and an accessible gravel path to the dock and fishpond. For site planning, the city says Hermitage has <strong>one reservable picnic site</strong> and <strong>24 drop-in picnic tables</strong>, which reinforces that this is a multi-use river valley park where dog owners are sharing space with anglers, paddlers, walkers, and family groups.</p><p>There is also a current project note tied directly to the off-leash area. On the City of Edmonton&apos;s off-leash projects update, last updated <strong>July 10, 2026</strong>, Hermitage Off-Leash Area is listed with ongoing landscape enhancement work around <strong>Kennedale Stormwater Management Facility #5</strong> inside the off-leash area. The city says work includes <strong>tree planting</strong>, <strong>emergent planting</strong>, and installation of a <strong>small section of chain-link fence</strong>, with temporary fencing around the work site to prevent public access. That means Hermitage remains a legitimate official destination, but not every section should be assumed fully open while project fencing is active.</p><p>As with other Edmonton off-leash areas, the city&apos;s general rules still matter. Dogs must be leashed when entering or leaving off-leash boundaries, owners are responsible for their dog&apos;s behaviour, wildlife must not be chased, and all Edmonton parks are shared-use. Hermitage&apos;s scale and mixed recreation setting make those rules especially important because the dog area sits inside a larger park that attracts non-dog visitors throughout the day.</p>';
const notes =
  '<p>Primary sources: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/hermitage-park and https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites. Supporting source: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/river-valley-parks. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Hermitage Park Off-Leash Area | Edmonton Dog Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'edmonton', 'trails', 'picnic', 'river-valley'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Hermitage Park Off-Leash Area | Edmonton Dog Park Guide',
  Description:
    '<p>Hermitage Park is an official Edmonton off-leash destination with a large natural dog area, walking trails, parking, washrooms, picnic amenities, and current city-posted project activity within part of the off-leash area.</p>',
  'Park type': 'Leash Free',
  'Street Address': '2115 Hermitage Road NW',
  latitude: '53.5906',
  longitude: '-113.3779',
  'Surface type': 'Grass, gravel paths, and natural trails',
  Size: 'Large',
  'Water source available': 'No city-confirmed dog water station; natural water features present but not a dedicated dog amenity',
  Benches: 'Yes - picnic tables and seating in broader park',
  'Shaded area': 'Yes',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes - washrooms and portable toilets in park',
  'Operating hours': 'Park access 5 a.m. to 11 p.m.; washrooms 9 a.m. to 9 p.m.',
  'Seasonal Restrictions': 'Check city project notices for temporary fenced work areas inside the off-leash area',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/hermitage-park',
  'Google Maps Link': 'https://maps.google.com/?q=Hermitage+Park,+Edmonton,+AB',
  Tags: 'off-leash,edmonton,trails,picnic,river-valley',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'hermitage-park-off-leash-area', {
  'Park Header': 'Hermitage Park Off-Leash Area | Edmonton Dog Park Guide',
  Description:
    '<p>Hermitage Park is an official Edmonton off-leash destination with a large natural dog area, walking trails, parking, washrooms, picnic amenities, and current city-posted project activity within part of the off-leash area.</p>',
  'Park type': 'Leash Free',
  'Street Address': '2115 Hermitage Road NW',
  latitude: '53.5906',
  longitude: '-113.3779',
  'Surface type': 'Grass, gravel paths, and natural trails',
  Size: 'Large',
  'Water source available': 'No city-confirmed dog water station; natural water features present but not a dedicated dog amenity',
  Benches: 'Yes - picnic tables and seating in broader park',
  'Shaded area': 'Yes',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes - washrooms and portable toilets in park',
  'Operating hours': 'Park access 5 a.m. to 11 p.m.; washrooms 9 a.m. to 9 p.m.',
  'Seasonal Restrictions': 'Check city project notices for temporary fenced work areas inside the off-leash area',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/hermitage-park',
  'Google Maps Link': 'https://maps.google.com/?q=Hermitage+Park,+Edmonton,+AB',
  Tags: 'off-leash,edmonton,trails,picnic,river-valley',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Hermitage Park Off-Leash Area,/dog-parks/hermitage-park-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/hermitage-park-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/hermitage-park-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Hermitage Park Off-Leash Area record and refreshed backlog files.');
