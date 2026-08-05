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
const park = parks.find((entry) => entry.slug === 'centennial-park-white-rock');
if (!park) throw new Error('Centennial Park White Rock record not found');

const seoTitle = 'Centennial Park | White Rock Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Centennial Park in White Rock, including the larger sports-and-play complex at 14600 North Bluff Road and the distinction between the general park and the separate official fenced dog park within the same recreation area.';
const intro =
  '<p>Centennial Park is part of White Rock&apos;s larger <strong>Centennial and Ruth Johnson Park</strong> recreation complex at <strong>14600 North Bluff Road</strong>, but it should not be treated as if the entire park is an off-leash dog area.</p>';
const body =
  '<p>The key correction on this page is scope. White Rock&apos;s current dogs page says dogs may go <strong>off leash only in the off-leash dog park located in Ruth Johnson Park</strong>. That means the older Centennial Park page overstated the rule by implying a broader off-leash designation across the general park.</p><p>The larger park complex is still important and worth describing accurately. White Rock&apos;s facility page for <strong>Centennial and Ruth Johnson Park</strong> lists a broad civic recreation setting with <strong>playing fields</strong>, a <strong>track</strong>, <strong>baseball diamond</strong>, <strong>lacrosse box</strong>, <strong>tennis courts</strong>, an <strong>all-abilities playground</strong>, and <strong>walking trails</strong>. That is the right way to frame Centennial Park: as part of a multi-use community recreation hub rather than as a stand-alone dog park.</p><p>For dog owners, the practical takeaway is simple. The correct city-backed off-leash destination in this complex is the <strong>fenced dog park at Ruth Johnson Park</strong>, not the broader Centennial lawns and recreation fields. Users moving through the larger park should follow posted signage and keep dogs leashed outside the designated dog area.</p><p>This update improves trust by removing duplicate or misleading off-leash framing and replacing it with a more accurate guide to the full Centennial park setting and its relationship to White Rock&apos;s official dog park.</p>';
const notes =
  '<p>Primary sources: https://www.whiterockcity.ca/Parks-Trails/Dogs for the rule that off-leash use is only in the dog park at Ruth Johnson Park, and https://www.whiterockcity.ca/facilities/facility/details/Centennial-and-Ruth-Johnson-Park-24 for the broader park-complex amenities. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Centennial Park | White Rock Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'white-rock', 'centennial-park', 'ruth-johnson-complex', 'dog-rules-clarified'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Centennial Park | White Rock Park Guide',
  'Park type': 'Community recreation park',
  Description:
    '<p>Centennial Park is part of White Rock&apos;s larger Centennial and Ruth Johnson Park recreation complex, while the official fenced off-leash dog park is a separate designated area within the same broader park system.</p>',
  'Street Address': '14600 North Bluff Road',
  latitude: park.raw.latitude,
  longitude: park.raw.longitude,
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Sports fields, lawns, pathways, and recreation facilities',
  Size: 'Large community recreation complex',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Verify at park complex on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted park and dog-area signage',
  'Park Website or Source': 'https://www.whiterockcity.ca/facilities/facility/details/Centennial-and-Ruth-Johnson-Park-24',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=14600+North+Bluff+Road+White+Rock+BC',
  Tags: 'park-guide,white-rock,centennial-park,ruth-johnson-complex,dog-rules-clarified',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'centennial-park-white-rock', {
  'Park Header': 'Centennial Park | White Rock Park Guide',
  'Park type': 'Community recreation park',
  Description:
    '<p>Centennial Park is part of White Rock&apos;s larger Centennial and Ruth Johnson Park recreation complex, while the official fenced off-leash dog park is a separate designated area within the same broader park system.</p>',
  'Street Address': '14600 North Bluff Road',
  latitude: park.raw.latitude,
  longitude: park.raw.longitude,
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Sports fields, lawns, pathways, and recreation facilities',
  Size: 'Large community recreation complex',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Verify at park complex on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted park and dog-area signage',
  'Park Website or Source': 'https://www.whiterockcity.ca/facilities/facility/details/Centennial-and-Ruth-Johnson-Park-24',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=14600+North+Bluff+Road+White+Rock+BC',
  Tags: 'park-guide,white-rock,centennial-park,ruth-johnson-complex,dog-rules-clarified',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Centennial Park,/dog-parks/centennial-park-white-rock/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/centennial-park-white-rock/"') ||
    row.join(',').includes(',/dog-parks/centennial-park-white-rock/,'),
);

rebuildBacklogSummary();

console.log('Updated Centennial Park White Rock record and refreshed backlog files.');
