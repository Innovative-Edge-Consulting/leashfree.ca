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
const park = parks.find((entry) => entry.slug === 'duggan-park-kelowna');
if (!park) throw new Error('Duggan Park Kelowna record not found');

const seoTitle = 'Duggan Park | Kelowna Small Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Duggan Park in Kelowna, including the official 1494 Bernard Avenue location, fenced small-dogs-only off-leash status, gravel-and-grass surface, and nearby seasonal washrooms.';
const intro =
  '<p>Duggan Park is one of Kelowna&apos;s official dog off-leash sites, but with a narrower purpose than the older thin page suggested: it is a <strong>small-dogs-only fenced park</strong> at <strong>1494 Bernard Avenue</strong>.</p>';
const body =
  '<p>Kelowna&apos;s current dog park page makes Duggan Park much more specific than the older generic copy. The city lists Duggan as a <strong>fenced dog park for small dogs only</strong>, located at <strong>1494 Bernard Avenue</strong>. That matters because the old page treated it like a general neighbourhood off-leash site, when Kelowna&apos;s current source explicitly frames it as a more specialized space intended for smaller dogs.</p><p>The city also lists useful physical details that improve the page materially. Kelowna says the park has a mix of <strong>gravel and grass</strong> surfaces, along with <strong>benches</strong>, <strong>waste bins</strong>, and a <strong>dog bag dispenser</strong>. The site works best as a compact local option for small-dog owners rather than as a large destination dog park.</p><p>The broader park page adds one practical seasonal note. Kelowna says washrooms are available <strong>nearby in Ben Lee Park during the summer</strong>. That is a more precise and honest description than claiming Duggan itself has full standalone amenities year-round. For visitors, it means the dog area is convenient but modest, with some support facilities depending on season and nearby park operations.</p><p>The practical summary is simple: Duggan Park is a legitimate official Kelowna dog park, but it should be described accurately as a <strong>small-dogs-only fenced off-leash site</strong>. That is the value of the page: not inflated prose about open space, but a clear explanation of who the park is actually designed for and what visitors can expect when they arrive.</p>';
const notes =
  '<p>Primary source: https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/dog-parks. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Duggan Park | Kelowna Small Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'kelowna', 'small-dogs-only', 'fenced', 'neighbourhood-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Duggan Park | Kelowna Small Dog Off-Leash Area',
  Description:
    '<p>Duggan Park is an official Kelowna dog park at 1494 Bernard Avenue, designed specifically as a fenced off-leash area for small dogs only.</p>',
  'Park type': 'Leash Free',
  'Street Address': '1494 Bernard Avenue',
  latitude: '49.8817',
  longitude: '-119.4686',
  'Surface type': 'Gravel and grass',
  Size: 'Small neighbourhood fenced park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Limited',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Street or nearby park access - verify on arrival',
  'Washrooms nearby': 'Yes - nearby in Ben Lee Park during summer',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Nearby washrooms are seasonal',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/dog-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1494+Bernard+Avenue+Kelowna+BC',
  Tags: 'off-leash,kelowna,small-dogs-only,fenced,neighbourhood-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'duggan-park-kelowna', {
  'Park Header': 'Duggan Park | Kelowna Small Dog Off-Leash Area',
  Description:
    '<p>Duggan Park is an official Kelowna dog park at 1494 Bernard Avenue, designed specifically as a fenced off-leash area for small dogs only.</p>',
  'Park type': 'Leash Free',
  'Street Address': '1494 Bernard Avenue',
  latitude: '49.8817',
  longitude: '-119.4686',
  'Surface type': 'Gravel and grass',
  Size: 'Small neighbourhood fenced park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Limited',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Street or nearby park access - verify on arrival',
  'Washrooms nearby': 'Yes - nearby in Ben Lee Park during summer',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Nearby washrooms are seasonal',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/dog-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1494+Bernard+Avenue+Kelowna+BC',
  Tags: 'off-leash,kelowna,small-dogs-only,fenced,neighbourhood-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Duggan Park,/dog-parks/duggan-park-kelowna/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/duggan-park-kelowna/"') ||
    row.join(',').includes(',/dog-parks/duggan-park-kelowna/,'),
);

rebuildBacklogSummary();

console.log('Updated Duggan Park Kelowna record and refreshed backlog files.');
