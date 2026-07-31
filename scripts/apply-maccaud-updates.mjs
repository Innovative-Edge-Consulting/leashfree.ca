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
const park = parks.find((entry) => entry.slug === 'maccaud-park');

if (!park) {
  throw new Error('Maccaud Park record not found');
}

const seoTitle = 'Maccaud Park | White Rock Park Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Maccaud Park in White Rock, including current park details, Kent Street location, Poetry in Motion context, and White Rock’s rule that dogs are on-leash in most parks with off-leash use only at Ruth Johnson Park.';
const intro =
  '<p>Maccaud Park is a small White Rock neighbourhood park at <strong>1475 Kent Street</strong>, known as part of the city&apos;s <strong>Poetry in Motion</strong> walking route rather than as an official off-leash dog park.</p>';
const body =
  '<p>The key correction for this page is that <strong>Maccaud Park is not White Rock&apos;s off-leash dog park</strong>. White Rock&apos;s current dogs page says dogs in the city must be <strong>leashed and licenced</strong>, that dogs are <strong>allowed on-leash in most parks year-round</strong>, and that dogs can go <strong>off-leash only in the off-leash dog park located in Ruth Johnson Park</strong>. That means the older Maccaud dog-park framing was not supported by the city&apos;s current public guidance as of <strong>Friday, July 31, 2026</strong>.</p><p>The park itself is still a legitimate White Rock park and worth identifying accurately. White Rock&apos;s parks and trails page lists <strong>Maccaud Park at 1475 Kent Street</strong>. The city&apos;s current Poetry in Motion page also places Maccaud Park directly on a local culture-and-walking route that connects <strong>Maccaud Park</strong>, <strong>Dr. R.J. Allan Hogg Rotary Park</strong>, and <strong>historic Five Corners</strong> through poetry installations from local writers. That gives the park a clearer civic identity than a generic thin stub ever did.</p><p>For dog owners, the practical takeaway is simple. Maccaud Park can be treated as a normal White Rock park where dogs are generally expected to be <strong>on leash</strong>, unless posted signage says otherwise. If someone arrives here specifically looking for legal off-leash space in White Rock, the correct city-backed destination is <strong>Ruth Johnson Park</strong>, where White Rock maintains its fenced off-leash dog park.</p><p>This correction improves trust more than adding generic dog-park prose would. It replaces an inaccurate off-leash claim with a source-backed explanation of what Maccaud Park actually is, how it fits into White Rock&apos;s park system, and where dog owners should go instead when they need official off-leash access.</p>';
const notes =
  '<p>Primary sources: https://www.whiterockcity.ca/799/Dogs-in-White-Rock, https://www.whiterockcity.ca/398/Parks-Trails, and https://www.whiterockcity.ca/1167/Poetry-in-Motion. Supporting source: https://www.whiterockcity.ca/1106/Off-Leash-Dog-Park. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Maccaud Park | White Rock Park Rules',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-rules', 'white-rock', 'kent-street', 'poetry-in-motion'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Maccaud Park | White Rock Park Rules',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Maccaud Park is a small White Rock neighbourhood park on Kent Street where dogs are generally on-leash; White Rock&apos;s official off-leash dog park is at Ruth Johnson Park.</p>',
  'Street Address': '1475 Kent Street',
  latitude: '49.0287',
  longitude: '-122.8018',
  'Surface type': 'Grass, paved walking paths, and landscaped park space',
  Size: 'Small neighbourhood park',
  'Water source available': 'No city-confirmed dog water source',
  Benches: 'Yes',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check posted city park signage',
  'Park Website or Source': 'https://www.whiterockcity.ca/398/Parks-Trails',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1475+Kent+Street+White+Rock+BC',
  Tags: 'park-rules,white-rock,kent-street,poetry-in-motion',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'maccaud-park', {
  'Park Header': 'Maccaud Park | White Rock Park Rules',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Maccaud Park is a small White Rock neighbourhood park on Kent Street where dogs are generally on-leash; White Rock&apos;s official off-leash dog park is at Ruth Johnson Park.</p>',
  'Street Address': '1475 Kent Street',
  latitude: '49.0287',
  longitude: '-122.8018',
  'Surface type': 'Grass, paved walking paths, and landscaped park space',
  Size: 'Small neighbourhood park',
  'Water source available': 'No city-confirmed dog water source',
  Benches: 'Yes',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dog dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check posted city park signage',
  'Park Website or Source': 'https://www.whiterockcity.ca/398/Parks-Trails',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1475+Kent+Street+White+Rock+BC',
  Tags: 'park-rules,white-rock,kent-street,poetry-in-motion',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Maccaud Park,/dog-parks/maccaud-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/maccaud-park/"') ||
    row.join(',').includes(',/dog-parks/maccaud-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Maccaud Park record and refreshed backlog files.');
