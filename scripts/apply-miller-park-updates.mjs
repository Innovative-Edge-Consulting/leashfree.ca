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
const park = parks.find((entry) => entry.slug === 'miller-park');
if (!park) throw new Error('Miller Park record not found');

const seoTitle = 'Miller Park Off-Leash Dog Area | Coquitlam';
const metaDescription =
  'Source-backed guide to Miller Park in Coquitlam, including the open grass off-leash dog area, creek-side nature trail access, ball diamond, playground, washrooms, water fountain, and current field upgrades.';
const intro =
  '<p>Miller Park is an <strong>official Coquitlam off-leash dog park</strong> at <strong>900 Oakview Street</strong>, where the city describes an <strong>open grass off-leash dog area</strong> reached by a <strong>nature trail across the creek</strong> beside playing fields and the ball diamond.</p>';
const body =
  '<p>The current City of Coquitlam facility page gives this park much better factual detail than the old thin listing. Miller Park&apos;s official features include <strong>Dog Off-Leash</strong>, <strong>Baseball / Softball Diamond</strong>, <strong>Playground</strong>, <strong>Trails</strong>, <strong>Washrooms</strong>, and a <strong>Water Fountain</strong>. That immediately makes the page more useful for visit planning.</p><p>The city also explains the layout. <strong>Two grass playing fields are adjacent to Miller Park School</strong>, and <strong>a nature trail across the creek leads to Miller Park</strong>, which Coquitlam describes as a pleasant green space with a <strong>ball diamond</strong> and <strong>open grass off-leash dog area</strong>. That wording is important because it clarifies that the dog space is an open grass section within a larger park, not a separate heavily fenced run.</p><p>There is also current infrastructure context worth preserving. Coquitlam says it is <strong>addressing aging infrastructure at the Miller Park ball diamond</strong> with <strong>replacement backstops and dugouts</strong> as well as work to improve <strong>drainage, irrigation, and landscaping</strong> on the sports field. As of <strong>Thursday, August 13, 2026</strong>, that is relevant site context for visitors.</p><p>This update improves the page by replacing generic forest-trail copy with the city&apos;s actual park description: open grass off-leash area, creek-trail approach, adjacent sports fields, on-site washrooms and water fountain, and the current field-improvement work.</p>';
const notes =
  '<p>Primary source: https://www.coquitlam.ca/facilities/facility/details/millerpark-57 for the official Miller Park address, features list, open grass off-leash area description, creek-side trail access, sports field details, washrooms, water fountain, and current notice about replacement backstops, dugouts, drainage, irrigation, and landscaping work. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: 'Miller Park Off-Leash Dog Area | Coquitlam',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Coquitlam'],
    Province: ['British Columbia'],
    Tags: ['off-leash', 'coquitlam', 'open-grass', 'creek-trail', 'ball-diamond'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Miller Park Off-Leash Dog Area | Coquitlam',
  'Park type': 'Leash Free',
  Description:
    '<p>Miller Park is an official Coquitlam off-leash park with an open grass dog area, a nature trail across the creek, adjacent sports fields, and amenities that include washrooms and a water fountain.</p>',
  'Street Address': '900 Oakview Street',
  latitude: '49.266903',
  longitude: '-122.8718355',
  City: 'Coquitlam',
  Province: 'British Columbia',
  'Postal Code': 'V3J 4T6',
  Fenced: 'Open grass area - verify exact boundaries on arrival',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: 'Open grass dog area within larger park',
  'Water source available': 'Yes - water fountain',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - trees and trail edge',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Verify nearby parking on arrival',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted park and field rules',
  'Park Website or Source': 'https://www.coquitlam.ca/facilities/facility/details/millerpark-57',
  'Google Maps Link': 'https://www.google.com/maps/place/Miller+Park+Offleash+Dog+Park/',
  Tags: 'off-leash,coquitlam,open-grass,creek-trail,ball-diamond',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'miller-park', {
  'Park Header': 'Miller Park Off-Leash Dog Area | Coquitlam',
  'Park type': 'Leash Free',
  Description:
    '<p>Miller Park is an official Coquitlam off-leash park with an open grass dog area, a nature trail across the creek, adjacent sports fields, and amenities that include washrooms and a water fountain.</p>',
  'Street Address': '900 Oakview Street',
  latitude: '49.266903',
  longitude: '-122.8718355',
  City: 'Coquitlam',
  Province: 'British Columbia',
  'Postal Code': 'V3J 4T6',
  Fenced: 'Open grass area - verify exact boundaries on arrival',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: 'Open grass dog area within larger park',
  'Water source available': 'Yes - water fountain',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - trees and trail edge',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Verify nearby parking on arrival',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted park and field rules',
  'Park Website or Source': 'https://www.coquitlam.ca/facilities/facility/details/millerpark-57',
  'Google Maps Link': 'https://www.google.com/maps/place/Miller+Park+Offleash+Dog+Park/',
  Tags: 'off-leash,coquitlam,open-grass,creek-trail,ball-diamond',
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
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/miller-park/';
  },
);

removeCsvRow(
  reviewQueuePath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/miller-park/';
  },
);

rebuildBacklogSummary();

console.log('Updated Miller Park record and refreshed backlog files.');
