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
const park = parks.find((entry) => entry.slug === 'snetsinger-park-cornwall');

if (!park) {
  throw new Error('Snetsinger Park record not found');
}

const seoTitle = 'Snetsinger Park | Cornwall Park Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Snetsinger Park in Cornwall, including current city location details and the current municipal rule that dogs are not permitted in this park.';
const intro =
  '<p>Snetsinger Park is a small Cornwall neighbourhood park in the <strong>Blessed Sacrament Drive</strong> area, with open green space, a simple walking path, and local residential park character.</p>';
const body =
  '<p>The key correction for this page is that <strong>Snetsinger Park is not a dog park</strong>, and Cornwall&apos;s current public rules do <strong>not</strong> list it as a place where dogs are permitted. The City of Cornwall&apos;s animals and wildlife page says dogs are <strong>not permitted in City parks</strong> except for a short list of named exceptions such as <strong>Gray&apos;s Creek</strong>, <strong>Lamoureux Park</strong>, <strong>Guindon Park</strong>, and the <strong>Kinsmen Dog Park</strong>. Snetsinger Park does not appear on that exceptions list as of <strong>Friday, July 31, 2026</strong>.</p><p>The city&apos;s parks and trails inventory still shows Snetsinger Park as a real neighbourhood park, which is useful for correcting the page rather than leaving it vague. Cornwall lists Snetsinger Park in the neighbourhood parks system and places it in the <strong>Blessed Sacrament Drive</strong> area. That is enough to identify it as a small local green space, but not enough to support the old dog-park framing.</p><p>For users reaching this page while looking for somewhere to bring a dog, the practical takeaway is straightforward: Snetsinger Park should not be treated as a legal dog outing location. If someone specifically wants off-leash access in Cornwall, the city-backed option remains <strong>Kinsmen Dog Park</strong>. If they want a permitted general park walk with a dog, they should use one of the city&apos;s named exceptions rather than assuming all neighbourhood parks are dog friendly.</p><p>This kind of correction improves trust more than generic expansion would. It replaces an inaccurate dog-related claim with the current municipal rule, a clearer park identity, and a practical redirect toward places Cornwall actually permits.</p>';
const notes =
  '<p>Primary sources: https://www.cornwall.ca/en/property-environment/animals-and-wildlife/ and https://www.cornwall.ca/en/play-here/parks-and-trails.aspx. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Snetsinger Park | Cornwall Park Rules',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-rules', 'cornwall', 'neighbourhood-park', 'snetsinger-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Snetsinger Park | Cornwall Park Rules',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Snetsinger Park is a small Cornwall neighbourhood park in the Blessed Sacrament Drive area, but current city rules do not permit dogs in this park.</p>',
  'Street Address': 'Blessed Sacrament Drive area',
  latitude: '45.0404',
  longitude: '-74.7638',
  'Surface type': 'Grass and paved neighbourhood park path',
  Size: 'Small neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and notices',
  'Park Website or Source': 'https://www.cornwall.ca/en/play-here/parks-and-trails.aspx',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Blessed+Sacrament+Drive+Cornwall+ON',
  Tags: 'park-rules,cornwall,neighbourhood-park,snetsinger-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'snetsinger-park-cornwall', {
  'Park Header': 'Snetsinger Park | Cornwall Park Rules',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Snetsinger Park is a small Cornwall neighbourhood park in the Blessed Sacrament Drive area, but current city rules do not permit dogs in this park.</p>',
  'Street Address': 'Blessed Sacrament Drive area',
  latitude: '45.0404',
  longitude: '-74.7638',
  'Surface type': 'Grass and paved neighbourhood park path',
  Size: 'Small neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and notices',
  'Park Website or Source': 'https://www.cornwall.ca/en/play-here/parks-and-trails.aspx',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Blessed+Sacrament+Drive+Cornwall+ON',
  Tags: 'park-rules,cornwall,neighbourhood-park,snetsinger-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Snetsinger Park,/dog-parks/snetsinger-park-cornwall/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/snetsinger-park-cornwall/"') ||
    row.join(',').includes(',/dog-parks/snetsinger-park-cornwall/,'),
);

rebuildBacklogSummary();

console.log('Updated Snetsinger Park record and refreshed backlog files.');
