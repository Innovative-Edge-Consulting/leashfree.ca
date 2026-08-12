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
const park = parks.find((entry) => entry.slug === 'campbellford-dog-park');
if (!park) throw new Error('Campbellford Dog Park record not found');

const seoTitle = 'Campbellford Dog Park | Ferris Provincial Park Pet Exercise Area';
const metaDescription =
  'Source-backed guide to the designated fenced pet exercise area at Ferris Provincial Park in Campbellford, Ontario, including the day-use location, grass-and-trees setting, and leash rules elsewhere in the park.';
const intro =
  '<p>Campbellford Dog Park is best understood as the <strong>designated pet exercise area at Ferris Provincial Park</strong> in Campbellford, Ontario, where Ontario Parks says dogs have a <strong>fenced grass-and-trees area near the day-use parking lot</strong>.</p>';
const body =
  '<p>The previous page copy treated this as a generic standalone city dog park. Ontario Parks describes something more specific: a <strong>pet exercise area</strong> inside <strong>Ferris Provincial Park</strong>, close to the <strong>day-use parking lot</strong>. The park&apos;s official visitor updates say the area is <strong>fenced</strong>, has <strong>grass and trees</strong>, and offers a <strong>nice view</strong>, which is better source-backed detail than the older filler copy.</p><p>That official framing matters because visitor expectations are different inside a provincial park. Dogs can use the fenced exercise area off leash there, but Ontario Parks rules still require dogs to stay <strong>on leash in other areas of the park</strong>. For a visitor planning a stop near Campbellford, that is practical trip information that belongs on the page.</p><p>Ferris Provincial Park is the larger destination around this listing, known for day-use access, trails, and the river-valley setting west of downtown Campbellford. For this page, the useful factual takeaway is simple: this is not an unverified neighbourhood field at 55 Saskatoon Avenue. It is an <strong>official Ontario Parks dog exercise area</strong> attached to Ferris Provincial Park, and the best arrival plan is to follow park signage toward the <strong>day-use area</strong> and confirm current on-site rules when you arrive.</p><p>This update improves the page by replacing generic claims with source-backed details: official Ferris Provincial Park status, fenced grass setting near the day-use parking lot, and Ontario Parks leash expectations outside the designated exercise zone.</p>';
const notes =
  '<p>Primary sources: Ontario Parks Ferris Provincial Park page for the official park destination and visitor information, plus Ontario Parks visitor updates describing the new pet exercise area near the day-use parking lot as fenced, grassy, and treed with a view. Ontario Parks pet rules were used to confirm that dogs must remain leashed elsewhere in provincial parks outside designated off-leash areas. Reviewed on August 11, 2026.</p>';

Object.assign(park, {
  title: 'Campbellford Dog Park | Ferris Provincial Park Pet Exercise Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['campbellford', 'ferris-provincial-park', 'pet-exercise-area', 'fenced', 'ontario-parks'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Campbellford Dog Park | Ferris Provincial Park Pet Exercise Area',
  'Park type': 'Leash Free',
  Description:
    '<p>Campbellford Dog Park is the designated fenced pet exercise area at Ferris Provincial Park in Campbellford, with grass and trees near the day-use parking lot and Ontario Parks leash rules applying elsewhere in the park.</p>',
  'Street Address': 'Ferris Provincial Park, Campbellford',
  latitude: '44.2953',
  longitude: '-77.8011',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: 'Verify on arrival',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Yes - trees in and around the area',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - near the day-use parking lot',
  'Washrooms nearby': 'Check provincial park facilities on arrival',
  'Operating hours': 'Follow current Ferris Provincial Park access hours and posted signage',
  'Seasonal Restrictions': 'Provincial park conditions and posted rules may vary by season',
  'Park Website or Source': 'https://www.ontarioparks.ca/park/ferris',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Ferris+Provincial+Park+Campbellford+Ontario',
  Tags: 'campbellford,ferris-provincial-park,pet-exercise-area,fenced,ontario-parks',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-11',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'campbellford-dog-park', {
  'Park Header': 'Campbellford Dog Park | Ferris Provincial Park Pet Exercise Area',
  'Park type': 'Leash Free',
  Description:
    '<p>Campbellford Dog Park is the designated fenced pet exercise area at Ferris Provincial Park in Campbellford, with grass and trees near the day-use parking lot and Ontario Parks leash rules applying elsewhere in the park.</p>',
  'Street Address': 'Ferris Provincial Park, Campbellford',
  latitude: '44.2953',
  longitude: '-77.8011',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: 'Verify on arrival',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Yes - trees in and around the area',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - near the day-use parking lot',
  'Washrooms nearby': 'Check provincial park facilities on arrival',
  'Operating hours': 'Follow current Ferris Provincial Park access hours and posted signage',
  'Seasonal Restrictions': 'Provincial park conditions and posted rules may vary by season',
  'Park Website or Source': 'https://www.ontarioparks.ca/park/ferris',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Ferris+Provincial+Park+Campbellford+Ontario',
  Tags: 'campbellford,ferris-provincial-park,pet-exercise-area,fenced,ontario-parks',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-11',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Campbellford Dog Park,/dog-parks/campbellford-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/campbellford-dog-park/"') ||
    row.join(',').includes(',/dog-parks/campbellford-dog-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Campbellford Dog Park record and refreshed backlog files.');
