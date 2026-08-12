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
const park = parks.find((entry) => entry.slug === 'peenaquim-park-off-leash-area');
if (!park) throw new Error('Peenaquim record not found');

const seoTitle = 'Peenaquim Park Off-Leash Area | Lethbridge | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Peenaquim Park Off-Leash Area in Lethbridge, including the one-acre fenced training area, 2 km limestone trail loop, river-valley location, benches, waste bags, and access from Stafford Drive or Scenic Drive North.';
const intro =
  '<p>Peenaquim Park Off-Leash Area is one of Lethbridge&apos;s official <strong>river-valley dog parks</strong>, with both a <strong>one-acre fenced training area</strong> and a larger <strong>2 km limestone trail loop</strong> along the north end of the park.</p>';
const body =
  '<p>Lethbridge&apos;s current dog-park page makes Peenaquim much more useful than the old generic stub. The city says the site is located at the <strong>north end of Peenaquim Park</strong>, at the <strong>base of the coulees</strong>, and that visitors can choose between <strong>a 1 acre fenced area</strong> and a <strong>2 km limestone pathway</strong> along the river&apos;s edge. That split setup is the key fact for the page because it supports both controlled socialization and longer open off-leash walks.</p><p>The city&apos;s dedicated Peenaquim Park page adds the specific context the old copy was missing. Lethbridge says the <strong>enclosed training area near the parking lot</strong> is especially useful for <strong>young dogs</strong> and dogs that are <strong>not yet ready for the open area</strong>. Outside the enclosure, the limestone trails loop around the north end of the park and follow the river. That is a more precise and defensible description than simply calling it the city&apos;s largest dog park.</p><p>The city also confirms practical amenities and access. Dog waste bags, garbage bins, and benches are located throughout the park, and the city says visitors can reach Peenaquim Park from <strong>Stafford Drive</strong> or <strong>Scenic Drive North</strong>. These are real trip-planning details that belong on the page.</p><p>Rules are also clearer than before. Lethbridge says dogs may be off leash only within the signed designated area, owners must keep dogs under control at all times, dogs should remain on leash until they are inside the off-leash zone, and owners must clean up after them. This update replaces filler with the city&apos;s actual framework: fenced training area, open 2 km trail option, river-valley location, amenities, access points, and current off-leash rules.</p>';
const notes =
  '<p>Primary sources: https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/ for official Lethbridge dog-park status and the one-acre fenced area plus 2 km limestone pathway description; and https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/north-parks-and-playgrounds/peenaquim-park/ for the enclosed training area near the parking lot, the loop-trail details, benches, waste bags, garbage bins, and access from Stafford Drive or Scenic Drive North. Reviewed on August 11, 2026.</p>';

Object.assign(park, {
  title: 'Peenaquim Park Off-Leash Area | Lethbridge',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'lethbridge', 'peenaquim-park', 'fenced-training-area', 'limestone-trails'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Peenaquim Park Off-Leash Area | Lethbridge',
  'Park type': 'Leash Free',
  Description:
    '<p>Peenaquim Park Off-Leash Area is an official Lethbridge dog park with a 1 acre fenced training area near the parking lot and a 2 km limestone trail loop along the river valley.</p>',
  'Street Address': 'North end of Peenaquim Park, access from Stafford Drive or Scenic Drive North',
  latitude: '49.7085',
  longitude: '-112.8161',
  Fenced: 'Yes - 1 acre enclosed training area',
  'Separate Small Dog Area': 'No dedicated small-dog area confirmed',
  'Surface type': 'Grass training area and limestone trails',
  Size: '1 acre fenced area plus 2 km trail loop',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Minimal natural shade - verify on arrival',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Yes - near the training area',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and site signage',
  'Park Website or Source': 'https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Peenaquim+Park+Off-Leash+Area+Lethbridge+AB',
  Tags: 'off-leash,lethbridge,peenaquim-park,fenced-training-area,limestone-trails',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-11',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'peenaquim-park-off-leash-area', {
  'Park Header': 'Peenaquim Park Off-Leash Area | Lethbridge',
  'Park type': 'Leash Free',
  Description:
    '<p>Peenaquim Park Off-Leash Area is an official Lethbridge dog park with a 1 acre fenced training area near the parking lot and a 2 km limestone trail loop along the river valley.</p>',
  'Street Address': 'North end of Peenaquim Park, access from Stafford Drive or Scenic Drive North',
  latitude: '49.7085',
  longitude: '-112.8161',
  Fenced: 'Yes - 1 acre enclosed training area',
  'Separate Small Dog Area': 'No dedicated small-dog area confirmed',
  'Surface type': 'Grass training area and limestone trails',
  Size: '1 acre fenced area plus 2 km trail loop',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Minimal natural shade - verify on arrival',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Yes - near the training area',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and site signage',
  'Park Website or Source': 'https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Peenaquim+Park+Off-Leash+Area+Lethbridge+AB',
  Tags: 'off-leash,lethbridge,peenaquim-park,fenced-training-area,limestone-trails',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-11',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Peenaquim Park Off-Leash Area,/dog-parks/peenaquim-park-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/peenaquim-park-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/peenaquim-park-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Peenaquim record and refreshed backlog files.');
