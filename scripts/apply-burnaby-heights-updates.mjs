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
const park = parks.find((entry) => entry.slug === 'burnaby-heights-park');

if (!park) {
  throw new Error('Burnaby Heights Park record not found');
}

const seoTitle = 'Burnaby Heights Park | Burnaby Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Burnaby Heights Park in Burnaby, including the official fenced year-round off-leash enclosure at 3877 Eton Street, neighbourhood-park context, and Burnaby’s current dog rules.';
const intro =
  '<p>Burnaby Heights Park is one of Burnaby&apos;s official dog off-leash areas, with a <strong>fenced enclosure</strong> at <strong>3877 Eton Street</strong> and <strong>year-round access</strong> in a compact North Burnaby neighbourhood setting.</p>';
const body =
  '<p>Burnaby&apos;s current dog off-leash page confirms Burnaby Heights Park as an official off-leash site and provides the specific details missing from the older thin copy. The city lists the address as <strong>3877 Eton Street</strong> and describes the dog area as a <strong>fenced enclosure with access year-round</strong>. That makes this a straightforward neighbourhood option rather than a large destination trail park.</p><p>The surrounding park context also helps position it more accurately. Burnaby Heights Park sits in a residential part of North Burnaby and functions as a local green space rather than a dog-only facility. For visitors, that means the value here is convenience, enclosed off-leash access, and easy repeat use, not a big multi-kilometre walking network or expansive open meadow.</p><p>Burnaby&apos;s standard off-leash rules still matter. The city says dogs must be <strong>leashed before entering and after leaving</strong> the off-leash area, owners must <strong>keep a leash in hand</strong> while dogs are off leash, and Burnaby allows a maximum of <strong>2 dogs per person</strong>. The city also says aggressive dogs must be removed immediately and handlers are responsible for any damage or injury caused by their dog.</p><p>The practical summary is simple: Burnaby Heights Park is a legitimate, city-recognized fenced off-leash stop that works best for local daily use. It does not need inflated prose about scenic views or large trails. The official value is that it is fenced, legal, year-round, and clearly identified by the city as part of Burnaby&apos;s designated off-leash network.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas and Burnaby Animal Control Bylaw No. 7035. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Burnaby Heights Park | Burnaby Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'burnaby', 'fenced', 'year-round', 'north-burnaby'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Burnaby Heights Park | Burnaby Dog Off-Leash Area',
  'Park type': 'Park',
  Description:
    '<p>Burnaby Heights Park is an official Burnaby dog off-leash site with a fenced year-round enclosure at 3877 Eton Street in a compact North Burnaby neighbourhood park setting.</p>',
  'Street Address': '3877 Eton Street',
  latitude: '49.2817',
  longitude: '-123.0163',
  'Surface type': 'Grass within fenced enclosure',
  Size: 'Neighbourhood fenced off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely within or near enclosure - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Expected at site - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk year-round',
  'Seasonal Restrictions': 'Year-round access; check posted notices on arrival',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=3877+Eton+Street+Burnaby+BC',
  Tags: 'off-leash,burnaby,fenced,year-round,north-burnaby',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'burnaby-heights-park', {
  'Park Header': 'Burnaby Heights Park | Burnaby Dog Off-Leash Area',
  'Park type': 'Park',
  Description:
    '<p>Burnaby Heights Park is an official Burnaby dog off-leash site with a fenced year-round enclosure at 3877 Eton Street in a compact North Burnaby neighbourhood park setting.</p>',
  'Street Address': '3877 Eton Street',
  latitude: '49.2817',
  longitude: '-123.0163',
  'Surface type': 'Grass within fenced enclosure',
  Size: 'Neighbourhood fenced off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely within or near enclosure - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Expected at site - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk year-round',
  'Seasonal Restrictions': 'Year-round access; check posted notices on arrival',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=3877+Eton+Street+Burnaby+BC',
  Tags: 'off-leash,burnaby,fenced,year-round,north-burnaby',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Burnaby Heights Park,/dog-parks/burnaby-heights-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/burnaby-heights-park/"') ||
    row.join(',').includes(',/dog-parks/burnaby-heights-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Burnaby Heights Park record and refreshed backlog files.');
