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
const park = parks.find((entry) => entry.slug === 'klarvatten-off-leash-area');

if (!park) {
  throw new Error('Klarvatten record not found');
}

const seoTitle = 'Klarvatten Off-Leash Area | Edmonton | LeashFree.ca';
const metaDescription =
  'Conservative, source-backed guide to Klarvatten Off-Leash Area in Edmonton, including official city rules, north Edmonton neighbourhood context, and on-arrival verification notes for exact boundaries and amenities.';
const intro =
  '<p>Klarvatten Off-Leash Area is a <strong>north Edmonton neighbourhood off-leash site</strong> in the city&apos;s designated dog-area network, generally identified around <strong>Klarvatten Road / 17335 85 Street NW</strong>.</p>';
const body =
  '<p>This page needed a more careful rewrite because Edmonton&apos;s current off-leash resource is strong on <strong>citywide rules and official designation</strong> but light on text-only site profiles for some neighbourhood locations. As of <strong>Tuesday, August 4, 2026</strong>, the City of Edmonton&apos;s off-leash page confirms the broader municipal off-leash network and the rules that apply across it, but I could not verify a detailed stand-alone descriptive profile for Klarvatten in the text version of the city material.</p><p>What appears consistent across recent local listings is the basic physical setup: Klarvatten is treated as an <strong>unfenced neighbourhood off-leash field</strong> in north Edmonton, with a broad open-grass layout that is better suited to simple running, walking, and recall-based play than to fenced-corridor containment. Multiple recent secondary references also place it near <strong>Klarvatten Road NW</strong> and mention <strong>waste disposal bins</strong>, but those amenity details should still be confirmed on arrival because the city source available in text view does not currently spell them out park-by-park.</p><p>For visitors, the practical value of this update is clearer expectation-setting. Klarvatten reads as a low-infrastructure local off-leash option rather than a destination park with a long published amenity list. Users should arrive expecting open space, follow Edmonton&apos;s off-leash rules closely, and verify posted boundaries before unclipping a leash.</p><p>This update improves the page by removing unsupported filler and replacing it with the strongest currently defensible mix of official city rules, neighbourhood context, and clearly labeled on-site verification guidance.</p>';
const notes =
  '<p>Primary source: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites for official City of Edmonton off-leash rules and network confirmation. Secondary context cross-checked on August 4, 2026, from recent Edmonton dog-park roundups at Durapaw and WoofCrate, which consistently describe Klarvatten as an unfenced open field near Klarvatten Road with waste bins. Treat exact amenities and boundaries as verify-on-arrival details unless confirmed by current city signage.</p>';

Object.assign(park, {
  title: 'Klarvatten Off-Leash Area | Edmonton',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'edmonton', 'north-edmonton', 'open-field', 'klarvatten'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Klarvatten Off-Leash Area | Edmonton',
  'Park type': 'Leash Free',
  Description:
    '<p>Klarvatten Off-Leash Area is a north Edmonton neighbourhood dog area best treated as an unfenced open-field off-leash site with exact boundaries to verify on arrival.</p>',
  'Street Address': '17335 85 Street NW',
  latitude: '53.6272',
  longitude: '-113.4738',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Open grass field and neighbourhood park landscape',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Minimal to moderate tree cover',
  'Waste bins': 'Reported by recent local listings - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=17335+85+Street+NW+Edmonton+AB',
  Tags: 'off-leash,edmonton,north-edmonton,open-field,klarvatten',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'klarvatten-off-leash-area', {
  'Park Header': 'Klarvatten Off-Leash Area | Edmonton',
  'Park type': 'Leash Free',
  Description:
    '<p>Klarvatten Off-Leash Area is a north Edmonton neighbourhood dog area best treated as an unfenced open-field off-leash site with exact boundaries to verify on arrival.</p>',
  'Street Address': '17335 85 Street NW',
  latitude: '53.6272',
  longitude: '-113.4738',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Open grass field and neighbourhood park landscape',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Minimal to moderate tree cover',
  'Waste bins': 'Reported by recent local listings - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=17335+85+Street+NW+Edmonton+AB',
  Tags: 'off-leash,edmonton,north-edmonton,open-field,klarvatten',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Klarvatten Off-Leash Area,/dog-parks/klarvatten-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/klarvatten-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/klarvatten-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Klarvatten record and refreshed backlog files.');
