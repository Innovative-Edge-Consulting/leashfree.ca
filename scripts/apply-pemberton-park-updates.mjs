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
const park = parks.find((entry) => entry.slug === 'pemberton-park-victoria');

if (!park) {
  throw new Error('Pemberton Park record not found');
}

const seoTitle = 'Pemberton Park Leash-Optional Area | Victoria | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Pemberton Park in Victoria, including its leash-optional designation, Gonzales neighbourhood setting, mature trees, sports field, washrooms, and current playground replacement context.';
const intro =
  '<p>Pemberton Park is one of Victoria&apos;s official <strong>leash-optional parks</strong>, a larger neighbourhood green space in <strong>Gonzales</strong> with mature trees, open lawns, and shared family recreation areas.</p>';
const body =
  '<p>Victoria&apos;s current parks material makes Pemberton Park more specific than the old filler page suggested. The city lists Pemberton as a <strong>leash-optional park</strong>, which is an important distinction: this is not a fenced dog run, but a broader public park where off-leash use is allowed under the city&apos;s published dogs-in-parks rules. That means visitors should expect a shared environment rather than a dog-only facility.</p><p>The park itself is stronger than the previous copy implied. Victoria describes Pemberton Park as a larger neighbourhood park in <strong>Gonzales</strong> with <strong>open lawn and mature trees</strong>, and the city notes regular use for <strong>soccer and softball</strong>. That combination matters because it frames the site as a multi-use park with room to move, shade, and recreation traffic beyond dog walking.</p><p>The city also identifies practical amenities and current context. <strong>Washrooms</strong> are available on site, and the city has noted a <strong>playground replacement project</strong> at Pemberton, which helps explain the park&apos;s family orientation and why visitors may encounter active improvement work or evolving amenities around the play area.</p><p>This update improves the page by replacing generic off-leash prose with Victoria&apos;s actual framing: official leash-optional status, Gonzales location, large-tree/open-lawn character, sports-field use, and current park amenity context.</p>';
const notes =
  '<p>Primary sources: https://www.victoria.ca/parks-recreation/parks-trails/dogs-in-parks for leash-optional park status, and https://www.victoria.ca/parks-recreation/parks-trails/our-parks/pemberton-park for the park profile. Current city materials describe Pemberton Park as a Gonzales neighbourhood park with mature trees, open lawn, sports-field use, washrooms, and a playground replacement project. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Pemberton Park Leash-Optional Area | Victoria',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['leash-optional', 'victoria', 'gonzales', 'mature-trees', 'pemberton-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Pemberton Park Leash-Optional Area | Victoria',
  'Park type': 'Leash Free',
  Description:
    '<p>Pemberton Park is an official Victoria leash-optional park in Gonzales with mature trees, open lawns, sports-field use, and washrooms.</p>',
  'Street Address': 'Pemberton Road',
  latitude: '48.4248',
  longitude: '-123.3428',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Open lawn, sports field grass, and shaded park landscape',
  Size: 'Neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Yes - mature trees',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Neighbourhood access - verify on arrival',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow Victoria dogs-in-parks rules and posted signs',
  'Park Website or Source': 'https://www.victoria.ca/parks-recreation/parks-trails/our-parks/pemberton-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Pemberton+Park+Victoria+BC',
  Tags: 'leash-optional,victoria,gonzales,mature-trees,pemberton-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'pemberton-park-victoria', {
  'Park Header': 'Pemberton Park Leash-Optional Area | Victoria',
  'Park type': 'Leash Free',
  Description:
    '<p>Pemberton Park is an official Victoria leash-optional park in Gonzales with mature trees, open lawns, sports-field use, and washrooms.</p>',
  'Street Address': 'Pemberton Road',
  latitude: '48.4248',
  longitude: '-123.3428',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Open lawn, sports field grass, and shaded park landscape',
  Size: 'Neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Yes - mature trees',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Neighbourhood access - verify on arrival',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow Victoria dogs-in-parks rules and posted signs',
  'Park Website or Source': 'https://www.victoria.ca/parks-recreation/parks-trails/our-parks/pemberton-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Pemberton+Park+Victoria+BC',
  Tags: 'leash-optional,victoria,gonzales,mature-trees,pemberton-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Pemberton Park,/dog-parks/pemberton-park-victoria/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/pemberton-park-victoria/"') ||
    row.join(',').includes(',/dog-parks/pemberton-park-victoria/,'),
);

rebuildBacklogSummary();

console.log('Updated Pemberton Park record and refreshed backlog files.');
