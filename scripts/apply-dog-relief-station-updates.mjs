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
const park = parks.find((entry) => entry.slug === 'dog-relief-station-new-westminster');
if (!park) throw new Error('Dog Relief Station record not found');

const seoTitle = 'Downtown Dog Relief Station | New Westminster | LeashFree.ca';
const metaDescription =
  'Source-backed guide to the Downtown Dog Relief Station in New Westminster, including the Begbie and Columbia Streets location, fenced relief-station design, and the city distinction that it is for quick downtown breaks rather than a full exercise park.';
const intro =
  '<p>The Downtown Dog Relief Station is a <strong>small fenced downtown dog stop</strong> at the corner of <strong>Begbie and Columbia Streets</strong> in New Westminster, intended for quick relief breaks rather than a full exercise park visit.</p>';
const body =
  '<p>New Westminster&apos;s current off-leash page still includes the <strong>Downtown Dog Relief Station</strong> in its city dog-area system, but the city&apos;s own detailed description shows why this page needs more careful framing than a normal park profile. The site is described as a convenient option for people walking dogs in the downtown core, not as a large social exercise field.</p><p>The city&apos;s dedicated Dog Relief Station page is concise but specific: the station sits at the corner of <strong>Begbie and Columbia Streets</strong> and exists to help keep <strong>Columbia Street sidewalks clean</strong>. That is the most important trip-planning fact for the page because it explains the site&apos;s purpose clearly.</p><p>New Westminster&apos;s original launch announcement adds the detail the old thin copy was missing. When the city installed the site in <strong>July 2016</strong>, it described the relief station as being built within part of an existing garden bed and featuring <strong>fences</strong>, a <strong>bag dispenser</strong>, and <strong>artificial turf specifically designed for dogs to do their business</strong>. The same city notice also stated that, unlike larger off-leash dog areas where dogs socialize and exercise, the <strong>dog relief station is not an off-leash exercise area</strong> and was designed specifically for relief use.</p><p>This update improves the page by replacing generic off-leash filler with the city&apos;s actual positioning: a small fenced downtown dog relief stop at Begbie and Columbia, intended for quick breaks and sidewalk cleanliness rather than as a destination dog park.</p>';
const notes =
  '<p>Primary sources: https://www.newwestcity.ca/parks-and-recreation/parks/off-leash-dog-areas and https://www.newwestcity.ca/parks-and-recreation/parks/off-leash-dog-areas/sb_expander_articles/1089.php for the current Downtown Dog Relief Station listing and location at Begbie and Columbia Streets; and https://www.newwestcity.ca/2016/07/22/july-22-2016.php for the city&apos;s original launch notice describing the site as a fenced relief station with a bag dispenser and artificial turf, and specifically distinguishing it from larger off-leash exercise areas. Reviewed on August 11, 2026.</p>';

Object.assign(park, {
  title: 'Downtown Dog Relief Station | New Westminster',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['new-westminster', 'downtown', 'dog-relief-station', 'quick-break-stop', 'fenced'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Downtown Dog Relief Station | New Westminster',
  'Park type': 'Dog Relief Station',
  Description:
    '<p>The Downtown Dog Relief Station is a fenced New Westminster dog stop at Begbie and Columbia Streets, intended for quick downtown relief breaks rather than a full exercise park visit.</p>',
  'Street Address': 'Corner of Begbie Street and Columbia Street',
  latitude: '49.20195325424884',
  longitude: '-122.910132100181',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Artificial turf relief surface within a compact fenced area',
  Size: 'Small downtown relief station',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'No city-confirmed benches inside the station',
  'Shaded area': 'Minimal',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Downtown street parking nearby',
  'Washrooms nearby': 'Unknown - verify nearby downtown facilities',
  'Operating hours': 'Check posted city signage on arrival',
  'Seasonal Restrictions': 'Follow current city rules and site signage',
  'Park Website or Source': 'https://www.newwestcity.ca/parks-and-recreation/parks/off-leash-dog-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Begbie+Street+and+Columbia+Street+New+Westminster+BC',
  Tags: 'new-westminster,downtown,dog-relief-station,quick-break-stop,fenced',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-11',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'dog-relief-station-new-westminster', {
  'Park Header': 'Downtown Dog Relief Station | New Westminster',
  'Park type': 'Dog Relief Station',
  Description:
    '<p>The Downtown Dog Relief Station is a fenced New Westminster dog stop at Begbie and Columbia Streets, intended for quick downtown relief breaks rather than a full exercise park visit.</p>',
  'Street Address': 'Corner of Begbie Street and Columbia Street',
  latitude: '49.20195325424884',
  longitude: '-122.910132100181',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Artificial turf relief surface within a compact fenced area',
  Size: 'Small downtown relief station',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'No city-confirmed benches inside the station',
  'Shaded area': 'Minimal',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Downtown street parking nearby',
  'Washrooms nearby': 'Unknown - verify nearby downtown facilities',
  'Operating hours': 'Check posted city signage on arrival',
  'Seasonal Restrictions': 'Follow current city rules and site signage',
  'Park Website or Source': 'https://www.newwestcity.ca/parks-and-recreation/parks/off-leash-dog-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Begbie+Street+and+Columbia+Street+New+Westminster+BC',
  Tags: 'new-westminster,downtown,dog-relief-station,quick-break-stop,fenced',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-11',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Dog Relief Station,/dog-parks/dog-relief-station-new-westminster/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/dog-relief-station-new-westminster/"') ||
    row.join(',').includes(',/dog-parks/dog-relief-station-new-westminster/,'),
);

rebuildBacklogSummary();

console.log('Updated Dog Relief Station record and refreshed backlog files.');
