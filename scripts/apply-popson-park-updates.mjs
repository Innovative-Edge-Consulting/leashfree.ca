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
const park = parks.find((entry) => entry.slug === 'popson-park-off-leash-area');

if (!park) {
  throw new Error('Popson Park record not found');
}

const seoTitle = 'Popson Park Off-Leash Area | Lethbridge | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Popson Park in Lethbridge, including the signed off-leash zone, more than 50 acres of river valley parkland, 2 km of limestone pathways, river access, and on-site safety notes.';
const intro =
  '<p>Popson Park is one of Lethbridge&apos;s destination-style dog parks, with a <strong>signed off-leash section</strong> inside a <strong>50+ acre river valley park</strong> featuring limestone pathways, river access, and broad natural coulee scenery.</p>';
const body =
  '<p>Lethbridge&apos;s current dog-park information makes Popson Park much more specific than the old thin copy. The city describes Popson as a <strong>large river valley park of more than 50 acres</strong> with about <strong>2 kilometres of limestone pathways</strong>, which immediately positions it as a walking and exploration destination rather than a simple neighbourhood field.</p><p>The off-leash detail is also more precise than generic \"dogs can roam\" language. The city notes that the designated off-leash section is <strong>signed from the boat launch to the picnic shelter</strong>. That matters because it gives visitors a real orientation cue inside a larger multi-use park and helps prevent the common mistake of assuming the whole park operates under the same dog rules.</p><p>Popson&apos;s appeal comes from variety. The city highlights <strong>river access</strong>, <strong>benches</strong>, <strong>dog-waste bags</strong>, and <strong>waste bins</strong>, so the site works for longer outings where people combine trail walking, open-space roaming, and time near the Oldman River. At the same time, Lethbridge includes an important caution: the <strong>road leading into Popson is close to the off-leash area</strong>. That makes recall and handler attention especially important here compared with more enclosed parks.</p><p>This update improves the page by replacing generic river-trail wording with the city&apos;s actual facts: official signed off-leash boundaries, 50-plus-acre scale, 2 km of limestone pathways, river access, practical amenities, and the road-adjacency safety warning.</p>';
const notes =
  '<p>Primary source: https://www.lethbridge.ca/Things-To-Do/Parks/Pages/Dog-Parks.aspx. Current city materials describe Popson Park as a 50+ acre river valley park with 2 km of limestone pathways, river access, benches, dog-waste bags, waste bins, and a signed off-leash section running from the boat launch to the picnic shelter. The city also notes that the access road is close to the off-leash area. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Popson Park Off-Leash Area | Lethbridge',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'lethbridge', 'river-valley', 'limestone-pathways', 'popson-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Popson Park Off-Leash Area | Lethbridge',
  'Park type': 'Leash Free',
  Description:
    '<p>Popson Park is a large Lethbridge river valley dog park with a signed off-leash section, 2 km of limestone pathways, river access, and destination-style walking terrain.</p>',
  'Street Address': '880 River Ridge Road West',
  latitude: '49.6624',
  longitude: '-112.8831',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Limestone pathways, grassland, natural river valley terrain',
  Size: '50+ acres',
  'Water source available': 'Yes - river access',
  Benches: 'Yes',
  'Shaded area': 'Minimal to moderate natural cover',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes - dog-waste bags provided',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.lethbridge.ca/Things-To-Do/Parks/Pages/Dog-Parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=880+River+Ridge+Road+West+Lethbridge+AB',
  Tags: 'off-leash,lethbridge,river-valley,limestone-pathways,popson-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'popson-park-off-leash-area', {
  'Park Header': 'Popson Park Off-Leash Area | Lethbridge',
  'Park type': 'Leash Free',
  Description:
    '<p>Popson Park is a large Lethbridge river valley dog park with a signed off-leash section, 2 km of limestone pathways, river access, and destination-style walking terrain.</p>',
  'Street Address': '880 River Ridge Road West',
  latitude: '49.6624',
  longitude: '-112.8831',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Limestone pathways, grassland, natural river valley terrain',
  Size: '50+ acres',
  'Water source available': 'Yes - river access',
  Benches: 'Yes',
  'Shaded area': 'Minimal to moderate natural cover',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes - dog-waste bags provided',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.lethbridge.ca/Things-To-Do/Parks/Pages/Dog-Parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=880+River+Ridge+Road+West+Lethbridge+AB',
  Tags: 'off-leash,lethbridge,river-valley,limestone-pathways,popson-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Popson Park Off-Leash Area,/dog-parks/popson-park-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/popson-park-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/popson-park-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Popson Park record and refreshed backlog files.');
