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
const park = parks.find((entry) => entry.slug === 'burnaby-fraser-foreshore-park');

if (!park) {
  throw new Error('Burnaby Fraser Foreshore Park record not found');
}

const seoTitle = 'Burnaby Fraser Foreshore Park | Burnaby Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Burnaby Fraser Foreshore Park, including the official off-leash lawn and Byrne Creek dike trail, year-round dawn-to-dusk access, current partial closure near the picnic area, and Burnaby’s shoreline dog restrictions.';
const intro =
  '<p>Burnaby Fraser Foreshore Park is one of Burnaby&apos;s official off-leash sites, with a <strong>large open lawn</strong> and an <strong>off-leash trail along the Byrne Creek dike</strong> in a working-river park setting.</p>';
const body =
  '<p>Burnaby&apos;s current dog off-leash page gives much better detail than the older generic profile. The city says Burnaby Fraser Foreshore Park includes an <strong>open off-leash area and trail with year-round access</strong>. Specifically, the official park page says the off-leash area is the <strong>open lawn between the main paved trail and Mountbatten Street, and between Byrne Road and Byrne Creek</strong>, while the off-leash trail runs <strong>along the Byrne Creek dike</strong>. That is more useful than simply calling it a big riverside dog park because it tells visitors exactly where off-leash use is actually intended.</p><p>The park itself is also more complex than the old page suggested. Burnaby describes Fraser Foreshore as a riverside park with <strong>accessible paved paths</strong>, <strong>lookout piers</strong>, a <strong>playground</strong>, <strong>volleyball courts</strong>, an <strong>outdoor fitness circuit</strong>, picnic areas, and washrooms. The official park address is <strong>7751 Fraser Park Drive</strong>, while the dog off-leash directory also uses <strong>7255 Mountbatten Street</strong> as the access address for the off-leash map. That distinction is useful because the park is long and linear, and arrival point matters.</p><p>There is also a current site condition that improves the timeliness of this page. As of <strong>Friday, July 31, 2026</strong>, Burnaby says the <strong>picnic area and nearby portion of the trail are partially closed until the fall</strong> because of hazardous trees that cannot yet be removed during bird nesting season. The city says trail users can detour onto the dike trail or Mountbatten Street for the affected section, and that an alternate picnic area has been set up next to the pier. For dog owners, that does not eliminate the off-leash site, but it does mean some usual circulation routes and nearby amenities are currently affected.</p><p>Burnaby&apos;s rule set matters here as well because this is a shoreline park. The city says dogs must be <strong>leashed outside designated off-leash areas</strong>, and it specifically says dogs are <strong>not allowed on beaches and nearby picnic areas</strong> at shoreline and lake parks including Burnaby Fraser Foreshore Park. That means the best way to use this site is to stay within the mapped off-leash lawn and dike trail sections, leash up outside those boundaries, and avoid treating the whole waterfront park as unrestricted dog space.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas and https://www.burnaby.ca/explore-outdoors/parks/burnaby-fraser-foreshore-park. Supporting source: https://www.burnaby.ca/explore-outdoors/picnic-sites. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Burnaby Fraser Foreshore Park | Burnaby Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'burnaby', 'riverside', 'dike-trail', 'year-round'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Burnaby Fraser Foreshore Park | Burnaby Dog Off-Leash Area',
  'Park type': 'Park',
  Description:
    '<p>Burnaby Fraser Foreshore Park is an official Burnaby off-leash site with a large lawn area and Byrne Creek dike trail, plus current partial closures near the picnic area and trail because of hazardous tree work.</p>',
  'Street Address': '7751 Fraser Park Drive',
  latitude: '49.1928',
  longitude: '-122.9782',
  'Surface type': 'Grass lawn, dike trail, and paved park paths',
  Size: 'Large linear riverside park with mapped off-leash sections',
  'Water source available': 'No dedicated dog water source confirmed; shoreline access is restricted',
  Benches: 'Yes',
  'Shaded area': 'Partial',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - lot at the foot of Byrne Road via Fraser Park Drive',
  'Washrooms nearby': 'Yes - washrooms beside the playground',
  'Operating hours': 'Dawn to dusk year-round',
  'Seasonal Restrictions': 'Current partial closure of picnic area and nearby trail until fall; check posted notices',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/parks/burnaby-fraser-foreshore-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=7751+Fraser+Park+Drive+Burnaby+BC',
  Tags: 'off-leash,burnaby,riverside,dike-trail,year-round',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'burnaby-fraser-foreshore-park', {
  'Park Header': 'Burnaby Fraser Foreshore Park | Burnaby Dog Off-Leash Area',
  'Park type': 'Park',
  Description:
    '<p>Burnaby Fraser Foreshore Park is an official Burnaby off-leash site with a large lawn area and Byrne Creek dike trail, plus current partial closures near the picnic area and trail because of hazardous tree work.</p>',
  'Street Address': '7751 Fraser Park Drive',
  latitude: '49.1928',
  longitude: '-122.9782',
  'Surface type': 'Grass lawn, dike trail, and paved park paths',
  Size: 'Large linear riverside park with mapped off-leash sections',
  'Water source available': 'No dedicated dog water source confirmed; shoreline access is restricted',
  Benches: 'Yes',
  'Shaded area': 'Partial',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - lot at the foot of Byrne Road via Fraser Park Drive',
  'Washrooms nearby': 'Yes - washrooms beside the playground',
  'Operating hours': 'Dawn to dusk year-round',
  'Seasonal Restrictions': 'Current partial closure of picnic area and nearby trail until fall; check posted notices',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/parks/burnaby-fraser-foreshore-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=7751+Fraser+Park+Drive+Burnaby+BC',
  Tags: 'off-leash,burnaby,riverside,dike-trail,year-round',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Burnaby Fraser Foreshore Park,/dog-parks/burnaby-fraser-foreshore-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/burnaby-fraser-foreshore-park/"') ||
    row.join(',').includes(',/dog-parks/burnaby-fraser-foreshore-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Burnaby Fraser Foreshore Park record and refreshed backlog files.');
