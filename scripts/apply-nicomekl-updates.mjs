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
const park = parks.find((entry) => entry.slug === 'nicomekl-dog-area');

if (!park) {
  throw new Error('Nicomekl Dog Off-Leash Area record not found');
}

const seoTitle = 'Nicomekl Dog Off-Leash Area | Surrey Dog Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Nicomekl Dog Off-Leash Area in Surrey, including the official 3435 150 Street location, fenced one-acre layout, pathway-only access, no on-site parking, and the current city-source mismatch about a separate small-dog area.';
const intro =
  '<p>Nicomekl Dog Off-Leash Area is one of Surrey&apos;s designated dog parks, with about <strong>1 acre of fenced open space</strong> at <strong>3435 150 Street</strong> and access from the <strong>multi-use pathway</strong> through Nicomekl Riverfront Park.</p>';
const body =
  '<p>Surrey&apos;s current dog off-leash directory confirms Nicomekl as an official designated off-leash area in South Surrey. The city lists the address as <strong>3435 150 Street</strong> and says Surrey parks generally require dogs to stay on leash except in designated off-leash areas. The standard city-wide operating rule is <strong>dawn until dusk</strong>, which is a more reliable guide than the older generic wording about wide-open trail space.</p><p>The Nicomekl Riverfront Park page adds the important site-specific detail that makes this page genuinely useful. Surrey says the dog park includes <strong>around 1 acre of fenced open space</strong> and is <strong>accessible from the multi-use pathway</strong> connecting to Barbara Creek Park and the Rosemary Heights West and King George Corridor neighbourhoods. The city also says there is <strong>no parking at the dog park</strong> and that <strong>walking to the dog park is encouraged</strong>. That means this is not a drive-up destination in the same way as some larger Surrey off-leash parks.</p><p>There is one source discrepancy worth making explicit rather than hiding. Surrey&apos;s current dog off-leash areas directory still lists Nicomekl as having <strong>no separate area for small dogs</strong>. But Surrey&apos;s Nicomekl Riverfront Park page says the current shared area is for dogs of different sizes and that a <strong>new separate area for small dogs will begin construction soon</strong>. A separate public project update page also says the Nicomekl Dog Off-Leash Area is complete and describes it as one shared area for dogs of different sizes. Taken together, the safest source-backed interpretation on <strong>Friday, July 31, 2026</strong> is that Nicomekl is open and usable, but visitors should <strong>verify on site</strong> whether the small-dog component has actually been added yet.</p><p>For users, the practical summary is straightforward: Nicomekl is a legitimate official Surrey dog park with a simple fenced layout, but its access conditions matter. Expect to arrive on foot via the trail network, not by direct parking; treat the area as a shared off-leash space unless current on-site signage shows the small-dog addition is now active; and follow Surrey&apos;s standard off-leash rules because dogs outside designated areas remain subject to enforcement under the city&apos;s bylaw.</p>';
const notes =
  '<p>Primary sources: https://www.surrey.ca/parks-recreation/parks/park-features-amenities/dog-off-leash-areas and https://www.surrey.ca/parks-recreation/parks/nicomekl-riverfront-park. Supporting source: https://engage.surrey.ca/nicomekl-riverfront-park. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Nicomekl Dog Off-Leash Area | Surrey Dog Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'surrey', 'fenced', 'path-access', 'south-surrey'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Nicomekl Dog Off-Leash Area | Surrey Dog Park Guide',
  'Park type': 'Leash Free',
  Description:
    '<p>Nicomekl Dog Off-Leash Area is an official Surrey dog park with about 1 acre of fenced open space, pathway access at 3435 150 Street, no on-site parking, and current city-source inconsistency about whether a separate small-dog area is active yet.</p>',
  'Street Address': '3435 150 Street',
  'Surface type': 'Fenced open grass and natural park surface',
  Size: 'About 1 acre',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Limited to moderate depending on edge planting',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'No',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Check current project and on-site signage for small-dog-area status',
  'Park Website or Source': 'https://www.surrey.ca/parks-recreation/parks/nicomekl-riverfront-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=3435+150+Street+Surrey+BC',
  Tags: 'off-leash,surrey,fenced,path-access,south-surrey',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'nicomekl-dog-area', {
  'Park Header': 'Nicomekl Dog Off-Leash Area | Surrey Dog Park Guide',
  'Park type': 'Leash Free',
  Description:
    '<p>Nicomekl Dog Off-Leash Area is an official Surrey dog park with about 1 acre of fenced open space, pathway access at 3435 150 Street, no on-site parking, and current city-source inconsistency about whether a separate small-dog area is active yet.</p>',
  'Street Address': '3435 150 Street',
  'Surface type': 'Fenced open grass and natural park surface',
  Size: 'About 1 acre',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Limited to moderate depending on edge planting',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'No',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Check current project and on-site signage for small-dog-area status',
  'Park Website or Source': 'https://www.surrey.ca/parks-recreation/parks/nicomekl-riverfront-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=3435+150+Street+Surrey+BC',
  Tags: 'off-leash,surrey,fenced,path-access,south-surrey',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Nicomekl Dog Off-Leash Area,/dog-parks/nicomekl-dog-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/nicomekl-dog-area/"') ||
    row.join(',').includes(',/dog-parks/nicomekl-dog-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Nicomekl Dog Off-Leash Area record and refreshed backlog files.');
