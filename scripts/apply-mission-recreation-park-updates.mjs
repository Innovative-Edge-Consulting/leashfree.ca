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
const park = parks.find((entry) => entry.slug === 'mission-recreation-park-kelowna');
if (!park) throw new Error('Mission Recreation Park record not found');

const seoTitle = 'Mission Recreation Park Off-Leash Area | Kelowna';
const metaDescription =
  'Source-backed guide to Mission Recreation Park in Kelowna, including the park-wide 4105 Gordon Dr setting, the designated off-leash location at 375 Gordon Drive, Mission Creek Greenway trail links, sports fields, and 2026 park upgrades.';
const intro =
  '<p>Mission Recreation Park is a <strong>major Kelowna recreation park</strong> at <strong>4105 Gordon Dr</strong>, and the City of Kelowna also lists a <strong>designated off-leash dog location at 375 Gordon Drive</strong> within the broader park and greenway area.</p>';
const body =
  '<p>The old page overstated the dog-area layout and treated the whole site like a single fenced dog park. Kelowna&apos;s current park pages describe something broader and more useful. The main Mission Recreation Park listing identifies the park at <strong>4105 Gordon Dr</strong>, gives it a total area of <strong>44.40 hectares</strong>, and lists its dog status as <strong>on-leash and off-leash</strong>. The city says the park features <strong>13 sports fields</strong>, <strong>trails</strong>, a <strong>playground</strong>, <strong>community gardens</strong>, and links to the <strong>Mission Creek Greenway</strong>.</p><p>The city&apos;s dedicated dog parks page adds the detail dog owners actually need for arrival planning: <strong>Mission Recreation Park is an off-leash location at 375 Gordon Drive</strong>. That is a stronger and more precise instruction than the old generic statement about a large fully fenced area, especially because the official park page describes the site more generally as having an <strong>off-leash dog area</strong> within a much larger recreation park.</p><p>Kelowna also publishes the current rule set for off-leash use. As of <strong>Thursday, August 13, 2026</strong>, the city requires handlers to keep leashes no longer than <strong>two metres</strong> outside off-leash play, carry the leash at all times, limit use to <strong>two dogs per handler</strong>, stay at least <strong>10 metres from playgrounds</strong> when dogs are on leash, and leash dogs when entering and exiting the off-leash area.</p><p>There is also live park-development context worth keeping on the page. Kelowna&apos;s 2026 parks project update says work at Mission Recreation Park includes <strong>pathways</strong>, a <strong>modular washroom</strong> in the southeast corner, <strong>plaza space</strong>, and a <strong>playground</strong>, with construction continuing into <strong>2027</strong>. This update improves the page by replacing generic filler with the city&apos;s actual framing: large recreation park, designated off-leash location, greenway linkage, and current project work.</p>';
const notes =
  '<p>Primary sources: https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/mission-recreation-park for the official Mission Recreation Park address, 44.40-hectare park size, on-leash and off-leash dog status, 13 sports fields, Mission Creek Greenway trail link, playground, community gardens, and future park plans; https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks for the designated off-leash location at 375 Gordon Drive and the current Kelowna off-leash rules; and https://www.kelowna.ca/our-community/news-events/news/18-parks-projects-coming-soon-near-you for the 2026-2027 pathway, modular washroom, plaza, and playground work in Mission Recreation Park. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: 'Mission Recreation Park Off-Leash Area | Kelowna',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Kelowna'],
    Province: ['British Columbia'],
    Tags: ['off-leash', 'kelowna', 'mission-creek-greenway', 'sports-fields', 'designated-location'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Mission Recreation Park Off-Leash Area | Kelowna',
  'Park type': 'Leash Free',
  Description:
    '<p>Mission Recreation Park is a large Kelowna recreation park with a designated off-leash dog location at 375 Gordon Drive, broader park access from 4105 Gordon Dr, Mission Creek Greenway trail links, and active 2026-2027 park improvements.</p>',
  'Street Address': '375 Gordon Drive',
  latitude: '49.8253',
  longitude: '-119.4596',
  City: 'Kelowna',
  Province: 'British Columbia',
  'Postal Code': 'V1W 4Z1',
  Fenced: 'Official off-leash area confirmed; exact enclosure type verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate small-dog zone',
  'Surface type': 'Grass park and trail setting',
  Size: 'Designated off-leash area within a 44.40 ha recreation park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Verify nearest access and parking on arrival',
  'Washrooms nearby': 'Yes - park improvements include modular washroom work',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted dog rules and active construction routing',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks',
  'Google Maps Link': 'https://maps.google.com/?q=Mission+Recreation+Park,+Kelowna,+BC',
  Tags: 'off-leash,kelowna,mission-creek-greenway,sports-fields,designated-location',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'mission-recreation-park-kelowna', {
  'Park Header': 'Mission Recreation Park Off-Leash Area | Kelowna',
  'Park type': 'Leash Free',
  Description:
    '<p>Mission Recreation Park is a large Kelowna recreation park with a designated off-leash dog location at 375 Gordon Drive, broader park access from 4105 Gordon Dr, Mission Creek Greenway trail links, and active 2026-2027 park improvements.</p>',
  'Street Address': '375 Gordon Drive',
  latitude: '49.8253',
  longitude: '-119.4596',
  City: 'Kelowna',
  Province: 'British Columbia',
  'Postal Code': 'V1W 4Z1',
  Fenced: 'Official off-leash area confirmed; exact enclosure type verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate small-dog zone',
  'Surface type': 'Grass park and trail setting',
  Size: 'Designated off-leash area within a 44.40 ha recreation park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Verify nearest access and parking on arrival',
  'Washrooms nearby': 'Yes - park improvements include modular washroom work',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted dog rules and active construction routing',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks',
  'Google Maps Link': 'https://maps.google.com/?q=Mission+Recreation+Park,+Kelowna,+BC',
  Tags: 'off-leash,kelowna,mission-creek-greenway,sports-fields,designated-location',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/mission-recreation-park-kelowna/';
  },
);

removeCsvRow(
  reviewQueuePath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/mission-recreation-park-kelowna/';
  },
);

rebuildBacklogSummary();

console.log('Updated Mission Recreation Park record and refreshed backlog files.');
