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
const park = parks.find((entry) => entry.slug === 'charleswood-dog-park');
if (!park) throw new Error('Charleswood record not found');

const seoTitle = 'Charleswood Dog Park | Winnipeg | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Charleswood Dog Park in Winnipeg, including its official off-leash status, regional scale, Haney Street access, and recent accessible path, curb cut, and gate improvements.';
const intro =
  '<p>Charleswood Dog Park is one of Winnipeg&apos;s larger <strong>official off-leash areas</strong>, accessed from <strong>3890 Haney Street</strong> with open grass, treed edges, and recent accessibility improvements.</p>';
const body =
  '<p>Winnipeg&apos;s current off-leash area page confirms that <strong>Charleswood Dog Park</strong> is part of the city&apos;s official dog-park network. That alone makes this a legitimate municipal park page, but the city now provides stronger context than the old generic copy ever did.</p><p>Recent City of Winnipeg planning material is particularly useful here. In the city&apos;s <strong>2025-2026 Accessibility Plan</strong>, Winnipeg reports that <strong>Charleswood Off-leash Dog Park (3890 Haney St.)</strong> received an <strong>accessible path from the road into the dog park</strong>, including a <strong>curb cut and new gate</strong>. That is practical trip-planning information for visitors who need a clearer, easier entrance route.</p><p>The city also treats Charleswood as one of its <strong>larger regional off-leash destinations</strong>. Winnipeg&apos;s current public engagement material for newer dog parks explicitly contrasts neighbourhood-scale sites with the much larger <strong>regional sites like Charleswood Dog Park and Maple Grove Park</strong>. That is a stronger and more defensible description than vague filler about &quot;beloved forested trails.&quot;</p><p>This update improves the page by grounding it in what Winnipeg actually publishes: official off-leash status, Haney Street access, regional scale within the city&apos;s network, and the recent accessible path, curb cut, and gate work. Those are the details that make the page materially more useful without over-claiming unsupported amenities.</p>';
const notes =
  '<p>Primary sources: https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/ for official off-leash status; https://www.winnipeg.ca/city-governance/documents-reports/2025-2026-accessibility-plan for the current note that Charleswood Off-leash Dog Park at 3890 Haney Street received an accessible path from the road into the park, including a curb cut and new gate; and https://engage.winnipeg.ca/bridgwater-trails-off-leash-dog-area for current City of Winnipeg engagement material describing Charleswood Dog Park as one of the larger regional off-leash sites. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Charleswood Dog Park | Winnipeg',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'winnipeg', 'charleswood', 'regional-dog-park', 'accessible-entry'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Charleswood Dog Park | Winnipeg',
  'Park type': 'Leash Free',
  Description:
    '<p>Charleswood Dog Park is an official Winnipeg off-leash area with Haney Street access, open natural terrain, and recent accessible path, curb cut, and gate improvements.</p>',
  'Street Address': '3890 Haney Street',
  latitude: '49.8652',
  longitude: '-97.3017',
  Fenced: 'Unknown - verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Open grass, treed edges, and park paths',
  Size: 'Large regional off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover around portions of the park',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current on-site access or nearby parking on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and seasonal notices',
  'Park Website or Source': 'https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=3890+Haney+Street+Winnipeg+MB',
  Tags: 'off-leash,winnipeg,charleswood,regional-dog-park,accessible-entry',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'charleswood-dog-park', {
  'Park Header': 'Charleswood Dog Park | Winnipeg',
  'Park type': 'Leash Free',
  Description:
    '<p>Charleswood Dog Park is an official Winnipeg off-leash area with Haney Street access, open natural terrain, and recent accessible path, curb cut, and gate improvements.</p>',
  'Street Address': '3890 Haney Street',
  latitude: '49.8652',
  longitude: '-97.3017',
  Fenced: 'Unknown - verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Open grass, treed edges, and park paths',
  Size: 'Large regional off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover around portions of the park',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current on-site access or nearby parking on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and seasonal notices',
  'Park Website or Source': 'https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=3890+Haney+Street+Winnipeg+MB',
  Tags: 'off-leash,winnipeg,charleswood,regional-dog-park,accessible-entry',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Charleswood Dog Park,/dog-parks/charleswood-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/charleswood-dog-park/"') ||
    row.join(',').includes(',/dog-parks/charleswood-dog-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Charleswood record and refreshed backlog files.');
