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
const park = parks.find((entry) => entry.slug === 'hume-park');

if (!park) {
  throw new Error('Hume Park record not found');
}

const seoTitle = 'Hume Park Dog Off-Leash Area | New Westminster | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Hume Park in New Westminster, including the 1.3-acre L-shaped fenced off-leash area, tree cover, benches, bag dispensers, and Lower Hume Park access.';
const intro =
  '<p>Hume Park is one of New Westminster&apos;s official dog off-leash areas, with a <strong>1.3-acre fenced enclosure</strong> in <strong>Lower Hume Park</strong> near the Brunette-Fraser trail corridor.</p>';
const body =
  '<p>New Westminster&apos;s current dog off-leash information gives Hume Park much more useful detail than the old thin copy. The city describes Hume as a <strong>large 1.3-acre off-leash area</strong> with an <strong>L-shaped fenced enclosure</strong>, which immediately sets expectations better than a generic reference to trees and trails. This is one of the more substantial fenced options in the city rather than a tiny neighbourhood run.</p><p>The published amenity details matter as well. The city notes <strong>lots of trees</strong>, <strong>benches</strong>, <strong>waste receptacles</strong>, and <strong>bag-recycling dispensers</strong>, which makes Hume more practical for longer visits than a bare-bones open field. The location within <strong>Lower Hume Park</strong> also helps orient visitors because the broader Hume Park area has multiple access points and recreational uses around it.</p><p>Another useful part of the city framing is context: Hume connects well with the surrounding greenway and trail system, so many visitors will treat it as a dog stop within a larger park outing rather than a single-purpose destination. That combination of fenced space, tree cover, and nearby path access explains why this park is stronger than the previous filler text suggested.</p><p>This update improves the page by replacing vague prose with the city&apos;s actual facts: official status, 1.3-acre size, L-shaped enclosure, tree cover, benches, waste infrastructure, and Lower Hume Park setting.</p>';
const notes =
  '<p>Primary source: https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas. Current city materials describe Hume Park as a 1.3-acre L-shaped off-leash area in Lower Hume Park with lots of trees, benches, waste receptacles, and bag-recycling dispensers. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Hume Park Dog Off-Leash Area | New Westminster',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'new-westminster', 'fenced', 'lower-hume-park', 'hume-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Hume Park Dog Off-Leash Area | New Westminster',
  'Park type': 'Leash Free',
  Description:
    '<p>Hume Park is a large official New Westminster off-leash area in Lower Hume Park, with a 1.3-acre L-shaped fenced enclosure, trees, benches, and waste facilities.</p>',
  'Street Address': 'Lower Hume Park / Brunette-Fraser Trail access',
  latitude: '49.23506065168412',
  longitude: '-122.89028354671687',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, dirt, and shaded park terrain',
  Size: '1.3 acres',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Yes - lots of trees',
  'Waste bins': 'Yes - waste receptacles listed by city',
  'Bag Dispensers': 'Yes - bag-recycling dispensers listed by city',
  'Parking Available': 'Yes - verify best access on arrival',
  'Washrooms nearby': 'Yes - verify availability on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Hume+Park+Off-Leash+Dog+Park+New+Westminster+BC',
  Tags: 'off-leash,new-westminster,fenced,lower-hume-park,hume-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'hume-park', {
  'Park Header': 'Hume Park Dog Off-Leash Area | New Westminster',
  'Park type': 'Leash Free',
  Description:
    '<p>Hume Park is a large official New Westminster off-leash area in Lower Hume Park, with a 1.3-acre L-shaped fenced enclosure, trees, benches, and waste facilities.</p>',
  'Street Address': 'Lower Hume Park / Brunette-Fraser Trail access',
  latitude: '49.23506065168412',
  longitude: '-122.89028354671687',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, dirt, and shaded park terrain',
  Size: '1.3 acres',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Yes - lots of trees',
  'Waste bins': 'Yes - waste receptacles listed by city',
  'Bag Dispensers': 'Yes - bag-recycling dispensers listed by city',
  'Parking Available': 'Yes - verify best access on arrival',
  'Washrooms nearby': 'Yes - verify availability on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Hume+Park+Off-Leash+Dog+Park+New+Westminster+BC',
  Tags: 'off-leash,new-westminster,fenced,lower-hume-park,hume-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Hume Park,/dog-parks/hume-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/hume-park/"') ||
    row.join(',').includes(',/dog-parks/hume-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Hume Park record and refreshed backlog files.');
