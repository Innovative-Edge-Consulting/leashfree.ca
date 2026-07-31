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
const park = parks.find((entry) => entry.slug === 'robert-burnaby-park');

if (!park) {
  throw new Error('Robert Burnaby Park record not found');
}

const seoTitle = 'Robert Burnaby Park | Burnaby Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Robert Burnaby Park in Burnaby, including the official hydro-corridor off-leash trail and lawn area west of Ramsay Creek, year-round dawn-to-dusk access, parking, washrooms, and current 2026 ecosystem restoration work.';
const intro =
  '<p>Robert Burnaby Park is one of Burnaby&apos;s official dog off-leash sites, with a <strong>long hydro-corridor trail</strong> and a <strong>large lawn area west of Ramsay Creek</strong> inside one of the city&apos;s most natural neighbourhood parks.</p>';
const body =
  '<p>Burnaby&apos;s current dog off-leash directory gives Robert Burnaby Park much clearer structure than the older thin page. The city says the designated off-leash site is the <strong>trail and open area in the hydro corridor and the lawn area west of Ramsay Creek</strong>, with <strong>year-round access</strong>. That is more precise than simply describing the park as wooded and adventurous because it tells visitors where off-leash use is actually intended and where it is not.</p><p>The main park page also adds stronger general park context. Burnaby describes Robert Burnaby Park as a large park south of Burnaby Lake with <strong>winding creekside trails</strong>, <strong>grassy play areas</strong>, <strong>tennis and pickleball courts</strong>, a <strong>playground and picnic area</strong>, an <strong>outdoor swimming pool</strong>, a <strong>baseball diamond</strong>, and a <strong>disc golf course</strong>. The city lists the park address as <strong>8155 Wedgewood Street</strong> and says there are <strong>4 parking lots in the park</strong> plus street parking around the perimeter, which makes arrival much easier than a vague trail-only description.</p><p>There is also a current operations note that materially improves this page. As of <strong>Friday, July 31, 2026</strong>, Burnaby says city crews are conducting <strong>ecosystem restoration and trail maintenance</strong> in Robert Burnaby Park. The city says visitors may continue using sanctioned trails while work is ongoing, but must stay on trail and keep out of restoration areas protected by fencing and signage. The current park page explains that unsanctioned trails are being closed and native vegetation is being planted to protect sensitive streamside habitat. That matters for dog owners because it means the park remains open, but off-leash and trail use should stay disciplined within the legal areas rather than drifting into restoration zones.</p><p>Burnaby also makes the park&apos;s dog restrictions explicit. The city says leashed dogs are welcome throughout the park, but dogs are <strong>not permitted</strong> in environmentally sensitive areas such as watercourses, in the <strong>playground and picnic area</strong>, or anywhere signs say dogs are not permitted. Combined with Burnaby&apos;s standard off-leash rules—dogs leashed before and after using the off-leash area, maximum <strong>2 dogs per person</strong>, and removal of aggressive dogs—the right way to use Robert Burnaby Park is to enjoy the hydro corridor and Ramsay Creek lawn section as the official off-leash zone while respecting the creek habitat and family-use areas around it.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas and https://www.burnaby.ca/explore-outdoors/parks/robert-burnaby-park. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Robert Burnaby Park | Burnaby Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'burnaby', 'hydro-corridor', 'ramsay-creek', 'year-round'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Robert Burnaby Park | Burnaby Dog Off-Leash Area',
  'Park type': 'Park',
  Description:
    '<p>Robert Burnaby Park is an official Burnaby off-leash site with a long hydro-corridor trail, a lawn area west of Ramsay Creek, and active ecosystem restoration work that requires visitors to stay on sanctioned trails and out of fenced restoration areas.</p>',
  'Street Address': '8155 Wedgewood Street',
  'Surface type': 'Grass lawn, hydro corridor trail, and natural park trails',
  Size: 'Large',
  'Water source available': 'No dedicated dog water source confirmed',
  Benches: 'Yes',
  'Shaded area': 'Yes',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - 4 parking lots plus perimeter street parking',
  'Washrooms nearby': 'Yes - wheelchair accessible washrooms available',
  'Operating hours': 'Dawn to dusk year-round',
  'Seasonal Restrictions': 'Check current restoration fencing and trail-maintenance notices',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/parks/robert-burnaby-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=8155+Wedgewood+Street+Burnaby+BC',
  Tags: 'off-leash,burnaby,hydro-corridor,ramsay-creek,year-round',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'robert-burnaby-park', {
  'Park Header': 'Robert Burnaby Park | Burnaby Dog Off-Leash Area',
  'Park type': 'Park',
  Description:
    '<p>Robert Burnaby Park is an official Burnaby off-leash site with a long hydro-corridor trail, a lawn area west of Ramsay Creek, and active ecosystem restoration work that requires visitors to stay on sanctioned trails and out of fenced restoration areas.</p>',
  'Street Address': '8155 Wedgewood Street',
  'Surface type': 'Grass lawn, hydro corridor trail, and natural park trails',
  Size: 'Large',
  'Water source available': 'No dedicated dog water source confirmed',
  Benches: 'Yes',
  'Shaded area': 'Yes',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - 4 parking lots plus perimeter street parking',
  'Washrooms nearby': 'Yes - wheelchair accessible washrooms available',
  'Operating hours': 'Dawn to dusk year-round',
  'Seasonal Restrictions': 'Check current restoration fencing and trail-maintenance notices',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/parks/robert-burnaby-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=8155+Wedgewood+Street+Burnaby+BC',
  Tags: 'off-leash,burnaby,hydro-corridor,ramsay-creek,year-round',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Robert Burnaby Park,/dog-parks/robert-burnaby-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/robert-burnaby-park/"') ||
    row.join(',').includes(',/dog-parks/robert-burnaby-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Robert Burnaby Park record and refreshed backlog files.');
