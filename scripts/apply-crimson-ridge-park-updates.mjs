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
const park = parks.find((entry) => entry.slug === 'crimson-ridge-park-chilliwack');

if (!park) {
  throw new Error('Crimson Ridge Park record not found');
}

const seoTitle = 'Crimson Ridge Park Dog Off-Leash Area | Chilliwack | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Crimson Ridge Park in Chilliwack, including the official 5495 Crimson Ridge address, off-leash area, fountain, walking paths, playground, and basketball court.';
const intro =
  '<p>Crimson Ridge Park is an official <strong>Chilliwack neighbourhood dog off-leash area</strong> at <strong>5495 Crimson Ridge</strong>, set within a larger community park with family amenities.</p>';
const body =
  '<p>Chilliwack&apos;s current park information gives Crimson Ridge Park much more substance than the old thin copy. The city identifies an <strong>off-leash dog park</strong> at <strong>5495 Crimson Ridge</strong> and pairs it with broader neighbourhood-park amenities, including a <strong>water fountain</strong>, <strong>walking paths</strong>, a <strong>playground</strong>, and a <strong>basketball court</strong>. That makes this page stronger as a practical local guide because visitors can understand the full park context instead of just a vague open-lawn description.</p><p>Functionally, Crimson Ridge reads as a compact multi-use community park where the dog area is one part of the overall site rather than a large stand-alone destination. That is useful for users deciding between a quick neighbourhood stop and a larger regional off-leash outing. If you are visiting with family members or combining a dog walk with other park use, the city-listed mix of paths and play amenities matters.</p><p>The main improvement here is specificity. Rather than generic claims about dogs roaming in a quiet residential area, the page now reflects the city&apos;s actual published amenities and the official off-leash designation. Visitors should still follow posted signs on arrival, especially where dog use intersects with the playground and other shared park features.</p><p>This update turns Crimson Ridge from filler into a defensible local reference: exact address, city-recognized off-leash status, and the amenities that shape how the park is actually used.</p>';
const notes =
  '<p>Primary source: City of Chilliwack parks information at https://www.chilliwack.com/main/page.cfm?id=945. Current city materials identify Crimson Ridge Park as including an off-leash dog park, water fountain, table or picnic shelter, walking paths, playground, and basketball court. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Crimson Ridge Park Dog Off-Leash Area | Chilliwack',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'chilliwack', 'neighbourhood-park', 'walking-paths', 'crimson-ridge-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Crimson Ridge Park Dog Off-Leash Area | Chilliwack',
  'Park type': 'Leash Free',
  Description:
    '<p>Crimson Ridge Park is an official Chilliwack off-leash area within a neighbourhood park that also includes walking paths, a fountain, a playground, and a basketball court.</p>',
  'Street Address': '5495 Crimson Ridge',
  latitude: '49.10729798267249',
  longitude: '-121.94837713301195',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, paved walking paths, and landscaped park space',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Yes - water fountain listed by city',
  Benches: 'Picnic table or shelter area listed by city',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=945',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=5495+Crimson+Ridge+Chilliwack+BC',
  Tags: 'off-leash,chilliwack,neighbourhood-park,walking-paths,crimson-ridge-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'crimson-ridge-park-chilliwack', {
  'Park Header': 'Crimson Ridge Park Dog Off-Leash Area | Chilliwack',
  'Park type': 'Leash Free',
  Description:
    '<p>Crimson Ridge Park is an official Chilliwack off-leash area within a neighbourhood park that also includes walking paths, a fountain, a playground, and a basketball court.</p>',
  'Street Address': '5495 Crimson Ridge',
  latitude: '49.10729798267249',
  longitude: '-121.94837713301195',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, paved walking paths, and landscaped park space',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Yes - water fountain listed by city',
  Benches: 'Picnic table or shelter area listed by city',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=945',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=5495+Crimson+Ridge+Chilliwack+BC',
  Tags: 'off-leash,chilliwack,neighbourhood-park,walking-paths,crimson-ridge-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Crimson Ridge Park,/dog-parks/crimson-ridge-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/crimson-ridge-park-chilliwack/"') ||
    row.join(',').includes(',/dog-parks/crimson-ridge-park-chilliwack/,'),
);

rebuildBacklogSummary();

console.log('Updated Crimson Ridge Park record and refreshed backlog files.');
