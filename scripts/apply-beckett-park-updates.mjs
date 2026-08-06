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
const park = parks.find((entry) => entry.slug === 'beckett-park-maple-ridge');
if (!park) throw new Error('Beckett Park record not found');

const seoTitle = 'Beckett Park Dog Off-Leash Area | Maple Ridge | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Beckett Park in Maple Ridge, including the official 11683 223 Street off-leash area, playground, pump track, bike skills park, sport courts, drinking water, benches, and picnic tables.';
const intro =
  '<p>Beckett Park is one of Maple Ridge&apos;s official <strong>dog off-leash parks</strong>, located at <strong>11683 223 Street</strong> within a broader neighbourhood park that also includes family and bike-oriented amenities.</p>';
const body =
  '<p>Maple Ridge&apos;s current dog-park information confirms that <strong>Beckett Park</strong> is one of the city&apos;s official off-leash locations. That gives this page a much firmer footing than the old stub, which described it only as a quiet grassy neighbourhood space.</p><p>The city&apos;s current Beckett Park page adds the real context that was missing. Maple Ridge identifies the park address as <strong>11683 223 Street</strong> and lists features including an <strong>off-leash dog park</strong>, <strong>playground</strong>, <strong>pump track</strong>, <strong>bike skills park</strong>, <strong>sport courts</strong>, <strong>drinking water</strong>, <strong>benches</strong>, and <strong>picnic tables</strong>. That matters because Beckett is not just a small isolated dog run; it sits inside a newer, more active neighbourhood recreation park.</p><p>The city also describes Beckett as one of Maple Ridge&apos;s <strong>newer parks</strong>. That is useful framing because the surrounding amenities make it a better fit for short family park visits than for a rugged destination walk. Visitors can expect an urban park setting with dog use integrated into a broader community recreation space.</p><p>This update improves the page by replacing filler with current city-backed facts: official off-leash status, the 11683 223 Street location, and the broader mix of playground, pump track, bike skills park, sport courts, drinking water, benches, and picnic tables that shape the actual visit experience.</p>';
const notes =
  '<p>Primary sources: https://www.mapleridge.ca/1502/Dog-Parks for official Maple Ridge off-leash status and https://www.mapleridge.ca/Facilities/Facility/Details/Beckett-Park-51 for the current Beckett Park address and amenities including the off-leash dog park, playground, pump track, bike skills park, sport courts, drinking water, benches, and picnic tables. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Beckett Park Dog Off-Leash Area | Maple Ridge',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'maple-ridge', 'beckett-park', 'pump-track', 'bike-skills-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Beckett Park Dog Off-Leash Area | Maple Ridge',
  'Park type': 'Leash Free',
  Description:
    '<p>Beckett Park is an official Maple Ridge off-leash park at 11683 223 Street, with a broader family park setting that includes a playground, pump track, bike skills park, sport courts, drinking water, benches, and picnic tables.</p>',
  'Street Address': '11683 223 Street',
  latitude: '49.2343',
  longitude: '-122.5279',
  Fenced: 'Unknown - verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Grass off-leash area within a broader urban park',
  Size: 'Neighbourhood off-leash area within larger park',
  'Water source available': 'Yes - drinking water in the park',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current park access on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and notices',
  'Park Website or Source': 'https://www.mapleridge.ca/1502/Dog-Parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=11683+223+Street+Maple+Ridge+BC',
  Tags: 'off-leash,maple-ridge,beckett-park,pump-track,bike-skills-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'beckett-park-maple-ridge', {
  'Park Header': 'Beckett Park Dog Off-Leash Area | Maple Ridge',
  'Park type': 'Leash Free',
  Description:
    '<p>Beckett Park is an official Maple Ridge off-leash park at 11683 223 Street, with a broader family park setting that includes a playground, pump track, bike skills park, sport courts, drinking water, benches, and picnic tables.</p>',
  'Street Address': '11683 223 Street',
  latitude: '49.2343',
  longitude: '-122.5279',
  Fenced: 'Unknown - verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Grass off-leash area within a broader urban park',
  Size: 'Neighbourhood off-leash area within larger park',
  'Water source available': 'Yes - drinking water in the park',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current park access on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and notices',
  'Park Website or Source': 'https://www.mapleridge.ca/1502/Dog-Parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=11683+223+Street+Maple+Ridge+BC',
  Tags: 'off-leash,maple-ridge,beckett-park,pump-track,bike-skills-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Beckett Park,/dog-parks/beckett-park-maple-ridge/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/beckett-park-maple-ridge/"') ||
    row.join(',').includes(',/dog-parks/beckett-park-maple-ridge/,'),
);

rebuildBacklogSummary();

console.log('Updated Beckett Park record and refreshed backlog files.');
