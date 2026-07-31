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
const park = parks.find((entry) => entry.slug === 'yellow-point-park-ladysmith');

if (!park) {
  throw new Error('Yellow Point Park record not found');
}

const seoTitle = 'Yellow Point Park | North Oyster Park Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Yellow Point Park in North Oyster, including the current RDN park classification, trail-and-picnic setting, and the fact that it is not an official off-leash dog park.';
const intro =
  '<p>Yellow Point Park is a community park in <strong>North Oyster</strong> managed by the <strong>Regional District of Nanaimo</strong>, with trails, open meadow space, and picnic-oriented day-use character rather than an official off-leash dog-park setup.</p>';
const body =
  '<p>The main correction for this page is that <strong>Yellow Point Park is not presented by the RDN as an official off-leash dog park</strong>. The current RDN park page describes Yellow Point Park as a community park in the Yellow Point area with a <strong>loop trail</strong>, <strong>open meadow</strong>, and <strong>picnic area</strong>. That is materially different from the older thin copy that implied dogs could use the site for off-leash activity.</p><p>The page also needs a location correction. Yellow Point Park is not a Ladysmith city park. It sits in the <strong>North Oyster / Yellow Point</strong> area under RDN management, which is a more accurate civic context for the page. Treating it as a Ladysmith dog park was a classification shortcut, not a source-backed description of what the site actually is.</p><p>Yellow Point Park also has a broader local identity that improves the page without inventing dog amenities. Community material tied to the Yellow Point Ecological Society describes the area as a small protected natural space with meadow and forest habitat, local stewardship activity, and a quiet walking environment. That fits the RDN description of a low-key community trail and picnic park much better than the prior off-leash framing.</p><p>For dog owners, the practical takeaway is straightforward: this page should be treated as a <strong>general park-rules page</strong>, not as a recommendation for legal off-leash use. Unless posted signage says otherwise, visitors should not assume Yellow Point Park functions as a designated off-leash area. Correcting that point improves trust far more than adding more generic dog-park prose to a page built on the wrong premise.</p>';
const notes =
  '<p>Primary source: https://www.rdn.bc.ca/yellow-point-park. Supporting source: https://yellowpointecologicalsociety.wordpress.com/yellow-point-park/. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Yellow Point Park | North Oyster Park Rules',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-rules', 'north-oyster', 'yellow-point', 'community-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Yellow Point Park | North Oyster Park Rules',
  'Park type': 'Community park',
  Description:
    '<p>Yellow Point Park is an RDN community park in North Oyster with trails, meadow space, and picnic use, but it is not an official off-leash dog park.</p>',
  'Street Address': 'Yellow Point Road area, North Oyster',
  'Surface type': 'Natural trails, meadow, and parkland',
  Size: 'Small community park',
  'Water source available': 'No city-confirmed dog water source',
  Benches: 'Picnic area seating',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No confirmed dog dispensers',
  'Parking Available': 'Yes - park access parking available',
  'Washrooms nearby': 'No confirmed washrooms',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check posted RDN park signage',
  'Park Website or Source': 'https://www.rdn.bc.ca/yellow-point-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Yellow+Point+Park+North+Oyster+BC',
  Tags: 'park-rules,north-oyster,yellow-point,community-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'yellow-point-park-ladysmith', {
  'Park Header': 'Yellow Point Park | North Oyster Park Rules',
  'Park type': 'Community park',
  Description:
    '<p>Yellow Point Park is an RDN community park in North Oyster with trails, meadow space, and picnic use, but it is not an official off-leash dog park.</p>',
  'Street Address': 'Yellow Point Road area, North Oyster',
  'Surface type': 'Natural trails, meadow, and parkland',
  Size: 'Small community park',
  'Water source available': 'No city-confirmed dog water source',
  Benches: 'Picnic area seating',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No confirmed dog dispensers',
  'Parking Available': 'Yes - park access parking available',
  'Washrooms nearby': 'No confirmed washrooms',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check posted RDN park signage',
  'Park Website or Source': 'https://www.rdn.bc.ca/yellow-point-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Yellow+Point+Park+North+Oyster+BC',
  Tags: 'park-rules,north-oyster,yellow-point,community-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Yellow Point Park,/dog-parks/yellow-point-park-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/yellow-point-park-ladysmith/"') ||
    row.join(',').includes(',/dog-parks/yellow-point-park-ladysmith/,'),
);

rebuildBacklogSummary();

console.log('Updated Yellow Point Park record and refreshed backlog files.');
