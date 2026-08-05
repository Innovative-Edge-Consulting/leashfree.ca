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
  return rows
    .map((row) =>
      row
        .map((field = '') => {
          const text = String(field);
          const escaped = text.replace(/"/g, '""');
          return /[",\n\r]/.test(text) ? `"${escaped}"` : escaped;
        })
        .join(','),
    )
    .join('\n') + '\n';
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
const park = parks.find((entry) => entry.slug === 'transfer-beach-park');
if (!park) throw new Error('Transfer Beach Park record not found');

const seoTitle = 'Transfer Beach Park | Ladysmith Waterfront Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Transfer Beach Park in Ladysmith, including the waterfront promenade, playground and picnic amenities, harbour views, and the need to verify current dog rules on site rather than assume off-leash access.';
const intro =
  '<p>Transfer Beach Park is one of Ladysmith&apos;s signature <strong>waterfront community parks</strong>, with harbour views, picnic lawns, playground space, and shoreline walking areas, but it should not be treated as a clearly verified off-leash dog park.</p>';
const body =
  '<p>The main correction on this page is dog-access certainty. Transfer Beach Park is a real and important Ladysmith waterfront destination, but the older record&apos;s claim of a designated beachside off-leash zone was too strong for the source base. As of <strong>Tuesday, August 4, 2026</strong>, the strongest public-facing sources consistently position Transfer Beach as a major family and event park first, while dog-specific rules are either limited, context-specific, or not published clearly enough to support a confident off-leash designation here.</p><p>What is well supported is the park itself. Regional tourism material and event pages consistently describe <strong>harbour views</strong>, <strong>open lawns</strong>, a <strong>waterfront walkway</strong>, <strong>picnic shelters</strong>, family gathering space, and nearby attractions such as the water play area and playground. That makes Transfer Beach highly useful as a waterfront park guide, even without overstating the dog-access rules.</p><p>For dog owners, the practical takeaway is to treat Transfer Beach Park as a standard public waterfront park and <strong>verify posted rules on arrival</strong>. Some site-specific restrictions may apply around event areas, amphitheatre use, playground zones, or busy seasonal park activity. Unless the Town of Ladysmith explicitly publishes an off-leash designation, this page should not imply that dogs can freely run off leash across the beach and lawn areas.</p><p>This update improves trust by removing unsupported off-leash language and replacing it with a more accurate waterfront-park guide built around the park&apos;s civic role, amenities, and the need for on-site rule verification.</p>';
const notes =
  '<p>Primary source context comes from the Ladysmith-area park and event ecosystem, including public-facing Transfer Beach materials and tourism references that clearly establish the park as a major waterfront gathering space. Those sources do not provide a sufficiently clear current municipal off-leash designation to support the old dog-park framing, so this update keeps the dog guidance conservative. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Transfer Beach Park | Ladysmith Waterfront Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'ladysmith', 'waterfront-park', 'verify-dog-rules', 'transfer-beach-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Transfer Beach Park | Ladysmith Waterfront Park Guide',
  'Park type': 'Waterfront park',
  Description:
    '<p>Transfer Beach Park is a major Ladysmith waterfront park with harbour views, lawns, picnic areas, and family amenities, but current dog rules should be verified on site rather than assumed to be off leash.</p>',
  'Street Address': 'Off Transfer Beach Boulevard',
  latitude: '49.02956135061539',
  longitude: '-123.82552548786344',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass lawn, shoreline edge, paved waterfront path',
  Size: 'Large waterfront community park',
  'Water source available': 'Natural waterfront access',
  Benches: 'Yes',
  'Shaded area': 'Yes - mature tree cover and shelters',
  'Waste bins': 'Yes - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current site signage and event restrictions',
  'Park Website or Source': 'https://www.ladysmith.ca/our-services/parks-recreation/parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Transfer+Beach+Park+Ladysmith+BC',
  Tags: 'park-guide,ladysmith,waterfront-park,verify-dog-rules,transfer-beach-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'transfer-beach-park', {
  'Park Header': 'Transfer Beach Park | Ladysmith Waterfront Park Guide',
  'Park type': 'Waterfront park',
  Description:
    '<p>Transfer Beach Park is a major Ladysmith waterfront park with harbour views, lawns, picnic areas, and family amenities, but current dog rules should be verified on site rather than assumed to be off leash.</p>',
  'Street Address': 'Off Transfer Beach Boulevard',
  latitude: '49.02956135061539',
  longitude: '-123.82552548786344',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass lawn, shoreline edge, paved waterfront path',
  Size: 'Large waterfront community park',
  'Water source available': 'Natural waterfront access',
  Benches: 'Yes',
  'Shaded area': 'Yes - mature tree cover and shelters',
  'Waste bins': 'Yes - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current site signage and event restrictions',
  'Park Website or Source': 'https://www.ladysmith.ca/our-services/parks-recreation/parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Transfer+Beach+Park+Ladysmith+BC',
  Tags: 'park-guide,ladysmith,waterfront-park,verify-dog-rules,transfer-beach-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Transfer Beach Park,/dog-parks/transfer-beach-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/transfer-beach-park/"') ||
    row.join(',').includes(',/dog-parks/transfer-beach-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Transfer Beach Park record and refreshed backlog files.');
