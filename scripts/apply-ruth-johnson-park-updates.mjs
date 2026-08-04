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
const park = parks.find((entry) => entry.slug === 'ruth-johnson-park');

if (!park) {
  throw new Error('Ruth Johnson Park record not found');
}

const seoTitle = 'Ruth Johnson Park Off-Leash Dog Park | White Rock | LeashFree.ca';
const metaDescription =
  'Source-backed guide to White Rock’s fenced off-leash dog park at Ruth Johnson Park, including the 14600 North Bluff Road location, Centennial park context, trails, sports amenities, and current stair-repair note.';
const intro =
  '<p>Ruth Johnson Park is home to <strong>White Rock&apos;s official fenced off-leash dog park</strong> at <strong>14600 North Bluff Road</strong>, inside the larger <strong>Centennial and Ruth Johnson Park</strong> recreation complex.</p>';
const body =
  '<p>White Rock&apos;s current parks and dogs pages make Ruth Johnson Park much more specific than the old thin copy. The city states that dogs may go <strong>off leash only in the off-leash dog park located in Ruth Johnson Park</strong>, which is the most important correction to preserve: this is White Rock&apos;s designated legal off-leash destination, not a vague trail network with off-leash use throughout the park.</p><p>The broader park context also matters. White Rock&apos;s facility page for <strong>Centennial and Ruth Johnson Park</strong> lists <strong>playing fields</strong>, a <strong>track</strong>, <strong>baseball diamond</strong>, <strong>lacrosse box</strong>, <strong>tennis courts</strong>, an <strong>all-abilities playground</strong>, and <strong>walking trails throughout Ruth Johnson Park</strong>. That means the dog park sits inside a larger multi-use civic recreation area rather than operating as an isolated stand-alone dog facility.</p><p>White Rock has also published important recent park-status context. The city&apos;s project updates note past storm damage in Ruth Johnson Park and Coldicutt Ravine, and Council approved a <strong>stair replacement contract on May 11, 2026</strong> for a section in the southeastern area of the park. For visitors, that means the dog park remains the correct off-leash destination, but trail access or surrounding park circulation can still be affected by infrastructure work or closure signage in parts of the larger park.</p><p>This update improves the page by replacing unsupported \"forested off-leash trails\" language with the city&apos;s actual framing: fenced off-leash dog park, exact North Bluff Road location, Centennial recreation-complex context, and current park-access notes.</p>';
const notes =
  '<p>Primary sources: https://www.whiterockcity.ca/Parks-Trails/Dogs for the city’s rule that off-leash use is only in the off-leash dog park at Ruth Johnson Park; https://www.whiterockcity.ca/facilities/facility/details/Centennial-and-Ruth-Johnson-Park-24 for facility details; https://www.whiterockcity.ca/842/Park-Projects-Updates for Ruth Johnson Park and Coldicutt Ravine project context; and https://www.whiterockcity.ca/m/newsflash/Home/Detail/5115 for the May 11, 2026 Council summary approving stair replacement work. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Ruth Johnson Park Off-Leash Dog Park | White Rock',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'white-rock', 'fenced', 'centennial-park', 'ruth-johnson-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Ruth Johnson Park Off-Leash Dog Park | White Rock',
  'Park type': 'Leash Free',
  Description:
    '<p>Ruth Johnson Park is White Rock&apos;s official fenced off-leash dog park, set within the larger Centennial and Ruth Johnson Park recreation complex at 14600 North Bluff Road.</p>',
  'Street Address': '14600 North Bluff Road',
  latitude: park.raw.latitude,
  longitude: park.raw.longitude,
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass dog park within a larger sports and trails complex',
  Size: 'Large fenced city dog park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - park complex access',
  'Washrooms nearby': 'Verify at park complex on arrival',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Follow posted park signage and closure notices',
  'Park Website or Source': 'https://www.whiterockcity.ca/facilities/facility/details/Centennial-and-Ruth-Johnson-Park-24',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=14600+North+Bluff+Road+White+Rock+BC',
  Tags: 'off-leash,white-rock,fenced,centennial-park,ruth-johnson-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'ruth-johnson-park', {
  'Park Header': 'Ruth Johnson Park Off-Leash Dog Park | White Rock',
  'Park type': 'Leash Free',
  Description:
    '<p>Ruth Johnson Park is White Rock&apos;s official fenced off-leash dog park, set within the larger Centennial and Ruth Johnson Park recreation complex at 14600 North Bluff Road.</p>',
  'Street Address': '14600 North Bluff Road',
  latitude: park.raw.latitude,
  longitude: park.raw.longitude,
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass dog park within a larger sports and trails complex',
  Size: 'Large fenced city dog park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - park complex access',
  'Washrooms nearby': 'Verify at park complex on arrival',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Follow posted park signage and closure notices',
  'Park Website or Source': 'https://www.whiterockcity.ca/facilities/facility/details/Centennial-and-Ruth-Johnson-Park-24',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=14600+North+Bluff+Road+White+Rock+BC',
  Tags: 'off-leash,white-rock,fenced,centennial-park,ruth-johnson-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Ruth Johnson Park,/dog-parks/ruth-johnson-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/ruth-johnson-park/"') ||
    row.join(',').includes(',/dog-parks/ruth-johnson-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Ruth Johnson Park record and refreshed backlog files.');
