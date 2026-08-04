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
const park = parks.find((entry) => entry.slug === 'taylor-park-burnaby');

if (!park) {
  throw new Error('Taylor Park record not found');
}

const seoTitle = 'Taylor Park Dog Off-Leash Area | Burnaby | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Taylor Park in Burnaby, including the official fenced year-round dog off-leash enclosure, 7599 Mission Avenue address, and broader park amenities.';
const intro =
  '<p>Taylor Park is one of Burnaby&apos;s official dog off-leash locations, with a <strong>fenced enclosure</strong> at <strong>7599 Mission Avenue</strong> inside a larger multi-use community park.</p>';
const body =
  '<p>Burnaby&apos;s current dog off-leash page gives Taylor Park a much stronger factual base than the old thin copy. The city lists <strong>Taylor Park</strong> as an official off-leash location and describes the dog area as a <strong>fenced enclosure</strong> with <strong>year-round access</strong>. That is an important correction because the previous record described it as a small informal dog zone, while the city clearly frames it as a designated off-leash site within Burnaby&apos;s published network.</p><p>The broader Taylor Park page adds helpful context that materially improves the profile. Burnaby describes the park as a larger shared community space with a <strong>family area</strong>, <strong>youth area</strong>, <strong>sports field</strong>, <strong>sports courts</strong>, and a <strong>beginner bike skills course</strong>. The city also lists an <strong>accessible washroom</strong> and says the park operates <strong>dawn to dusk</strong>. That matters because visitors should understand that the dog enclosure sits within a much broader recreation setting rather than as a standalone dog-only property.</p><p>The practical result is a more useful page for planning visits. Dog owners get an official fenced Burnaby site with year-round use, while families or mixed groups also know the surrounding park offers other recreation features. At the same time, Burnaby&apos;s off-leash rules still matter: dogs are expected to remain within the designated off-leash area, and outside that boundary they should be leashed unless otherwise posted.</p><p>The key value of this update is precision. Taylor Park should be described as a real city-managed fenced off-leash enclosure inside a broader Burnaby community park, not just as a vague small local lawn.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas and the City of Burnaby Taylor Park page. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Taylor Park Dog Off-Leash Area | Burnaby',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'burnaby', 'fenced', 'year-round', 'taylor-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Taylor Park Dog Off-Leash Area | Burnaby',
  'Park type': 'Leash Free',
  Description:
    '<p>Taylor Park is an official fenced Burnaby dog off-leash area at 7599 Mission Avenue with year-round access inside a larger community park.</p>',
  'Street Address': '7599 Mission Avenue',
  latitude: '49.1992',
  longitude: '-122.9629',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass within fenced enclosure',
  Size: 'Neighbourhood off-leash enclosure within larger park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Park seating likely - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Nearby park access - verify on arrival',
  'Washrooms nearby': 'Yes - accessible washroom',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/parks/taylor-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=7599+Mission+Avenue+Burnaby+BC',
  Tags: 'off-leash,burnaby,fenced,year-round,taylor-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'taylor-park-burnaby', {
  'Park Header': 'Taylor Park Dog Off-Leash Area | Burnaby',
  'Park type': 'Leash Free',
  Description:
    '<p>Taylor Park is an official fenced Burnaby dog off-leash area at 7599 Mission Avenue with year-round access inside a larger community park.</p>',
  'Street Address': '7599 Mission Avenue',
  latitude: '49.1992',
  longitude: '-122.9629',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass within fenced enclosure',
  Size: 'Neighbourhood off-leash enclosure within larger park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Park seating likely - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Nearby park access - verify on arrival',
  'Washrooms nearby': 'Yes - accessible washroom',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/parks/taylor-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=7599+Mission+Avenue+Burnaby+BC',
  Tags: 'off-leash,burnaby,fenced,year-round,taylor-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Taylor Park,/dog-parks/taylor-park-burnaby/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/taylor-park-burnaby/"') ||
    row.join(',').includes(',/dog-parks/taylor-park-burnaby/,'),
);

rebuildBacklogSummary();

console.log('Updated Taylor Park record and refreshed backlog files.');
