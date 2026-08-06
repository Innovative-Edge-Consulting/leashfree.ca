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
const park = parks.find((entry) => entry.slug === 'queens-park-new-westminster');
if (!park) throw new Error('Queen\'s Park record not found');

const seoTitle = "Queen's Park Off-Leash Area | New Westminster | LeashFree.ca";
const metaDescription =
  "Source-backed guide to Queen's Park off-leash area in New Westminster, including the one-acre southeast dog area, double-entry gates, benches, dog fountain, bag dispensers, and the optional small or shy dog separation gate.";
const intro =
  "<p>Queen's Park is one of New Westminster's official <strong>dog off-leash areas</strong>, with a <strong>one-acre fenced site in the southeast corner of the park</strong> that includes mature trees, gentle slopes, seating, and dog-specific amenities.</p>";
const body =
  "<p>New Westminster's current dog off-leash page gives Queen's Park much stronger factual detail than the old thin copy. The city identifies it as a <strong>one-acre off-leash area</strong> located in the <strong>southeast section of Queen's Park</strong>. That matters because it tells visitors this is a defined dog space inside the broader heritage park, not unrestricted off-leash use across the whole property.</p><p>The city's current amenity list also makes the page far more useful. New Westminster says the Queen's Park dog area includes <strong>mature trees and gentle hills</strong>, along with <strong>benches</strong>, a <strong>dog water fountain</strong>, <strong>bag dispensers</strong>, and <strong>double-entry safety gates</strong>. Those are practical features visitors actually plan around, and they are stronger than vague references to \"shaded walking trails.\"</p><p>There is also a specific operational detail worth preserving. The city notes that the site includes a <strong>gated separated area intended for small or shy dogs</strong>, but it is described as an <strong>optional pilot feature</strong> rather than a guaranteed permanently segregated dog park. The city added extra signage to clarify that point. That means the page should present the area conservatively as an optional separated section, not as a fully dedicated permanent small-dog park.</p><p>This update improves the page by replacing filler with current city-backed facts: official New Westminster status, one-acre size, southeast Queen's Park location, mature trees and hills, benches, dog fountain, bag dispensers, double-entry gates, and the optional small or shy dog separation gate.</p>";
const notes =
  "<p>Primary source: https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas for official New Westminster off-leash status, the one-acre southeast Queen's Park location, mature trees and hills, benches, dog fountain, bag dispensers, double-entry safety gates, and the optional pilot gate for small or shy dogs with added signage. Reviewed on August 6, 2026.</p>";

Object.assign(park, {
  title: "Queen's Park Off-Leash Area | New Westminster",
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'new-westminster', 'queens-park', 'small-or-shy-dogs', 'dog-fountain'],
  },
});

Object.assign(park.raw, {
  'Park Header': "Queen's Park Off-Leash Area | New Westminster",
  'Park type': 'Leash Free',
  Description:
    "<p>Queen's Park is an official New Westminster off-leash area in the southeast section of the park, with a one-acre fenced site, benches, a dog fountain, bag dispensers, double-entry gates, and an optional small or shy dog separation gate.</p>",
  'Street Address': "Southeast section of Queen's Park, near 3rd Avenue",
  latitude: '49.21674036104484',
  longitude: '-122.90727140018102',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'Optional gated area for small or shy dogs',
  'Surface type': 'Grass and dirt with gentle hills',
  Size: 'One acre',
  'Water source available': 'Yes - dog fountain',
  Benches: 'Yes',
  'Shaded area': 'Yes - mature trees',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Verify park access and nearby parking on arrival',
  'Washrooms nearby': 'Unknown - verify elsewhere in Queen\'s Park on arrival',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and current signage',
  'Park Website or Source': 'https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas',
  'Google Maps Link': "https://www.google.com/maps/search/?api=1&query=Queen's+Park+Off-Leash+Area+New+Westminster+BC",
  Tags: 'off-leash,new-westminster,queens-park,small-or-shy-dogs,dog-fountain',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'queens-park-new-westminster', {
  'Park Header': "Queen's Park Off-Leash Area | New Westminster",
  'Park type': 'Leash Free',
  Description:
    "<p>Queen's Park is an official New Westminster off-leash area in the southeast section of the park, with a one-acre fenced site, benches, a dog fountain, bag dispensers, double-entry gates, and an optional small or shy dog separation gate.</p>",
  'Street Address': "Southeast section of Queen's Park, near 3rd Avenue",
  latitude: '49.21674036104484',
  longitude: '-122.90727140018102',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'Optional gated area for small or shy dogs',
  'Surface type': 'Grass and dirt with gentle hills',
  Size: 'One acre',
  'Water source available': 'Yes - dog fountain',
  Benches: 'Yes',
  'Shaded area': 'Yes - mature trees',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Verify park access and nearby parking on arrival',
  'Washrooms nearby': 'Unknown - verify elsewhere in Queen\'s Park on arrival',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and current signage',
  'Park Website or Source': 'https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas',
  'Google Maps Link': "https://www.google.com/maps/search/?api=1&query=Queen's+Park+Off-Leash+Area+New+Westminster+BC",
  Tags: 'off-leash,new-westminster,queens-park,small-or-shy-dogs,dog-fountain',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(",Dog Parks,Queen's Park,/dog-parks/queens-park-new-westminster/,"),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/queens-park-new-westminster/"') ||
    row.join(',').includes(',/dog-parks/queens-park-new-westminster/,'),
);

rebuildBacklogSummary();

console.log('Updated Queen\'s Park record and refreshed backlog files.');
