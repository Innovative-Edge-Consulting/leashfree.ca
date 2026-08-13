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
const park = parks.find((entry) => entry.slug === 'north-whitby-off-leash-dog-park');
if (!park) throw new Error('North Whitby record not found');

const seoTitle = 'Cochrane Street North Off-Leash Dog Park | Whitby';
const metaDescription =
  'Source-backed guide to Whitby’s Cochrane Street North off-leash dog park in Heber Down Conservation Area, including fenced areas, separate small-dog section, seasonal hours, and conservation-area parking rules.';
const intro =
  '<p>The page previously called North Whitby Off-Leash Dog Park is best updated as Whitby&apos;s official <strong>Cochrane Street North off-leash dog park</strong>, located within <strong>Heber Down Conservation Area</strong> at the south end of <strong>Cochrane St. N.</strong>, south of Winchester Road West.</p>';
const body =
  '<p>Whitby&apos;s current off-leash dog parks page is more precise than the old generic listing. The town says there are <strong>two off-leash parks</strong> in Whitby, and this northern site is officially the <strong>Cochrane Street North off-leash dog park</strong>. It is located within <strong>Heber Down Conservation Area</strong>, not at the old placeholder address on Taunton Road East.</p><p>The current town page also confirms the key layout details dog owners need. Both Whitby off-leash parks have <strong>fenced perimeters</strong> and <strong>separate fenced areas for small dogs</strong>. That makes the old record incomplete rather than entirely wrong, but the official naming and conservation-area context are the important improvements.</p><p>There is also a practical access rule that belongs on the page. To use the Cochrane Street North off-leash dog park and trail, visitors must either <strong>pay for parking at the conservation area pay-and-display machine</strong> or use an <strong>annual pass</strong> that covers parking and general admission to Central Lake Ontario Conservation Areas. That is current trip-planning information, not a small detail.</p><p>Whitby also publishes the current operating hours: <strong>April 1 to September 30 from 6 a.m. to 10 p.m.</strong>, and <strong>October 1 to March 31 from 6 a.m. to 8 p.m.</strong>. Dog handlers must leash dogs before entering and exiting, keep no more than <strong>three dogs per handler</strong>, and follow the town&apos;s posted code of conduct. This update improves the page by replacing a vague north-Whitby label with the official Cochrane Street North conservation-area profile.</p>';
const notes =
  '<p>Primary source: https://www.whitby.ca/explore-and-enjoy/parks-and-recreation/off-leash-dog-parks/ for the official Cochrane Street North off-leash dog park name, Heber Down Conservation Area location, fenced perimeters, separate small-dog area, seasonal hours, parking-payment requirement or annual pass, and handler code of conduct. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: 'Cochrane Street North Off-Leash Dog Park | Whitby',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Whitby'],
    Province: ['Ontario'],
    Tags: ['off-leash', 'whitby', 'heber-down-conservation-area', 'fenced', 'small-dog-area'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Cochrane Street North Off-Leash Dog Park | Whitby',
  'Park type': 'Leash Free',
  Description:
    '<p>Cochrane Street North is Whitby&apos;s official northern off-leash dog park within Heber Down Conservation Area, with fenced areas, a separate small-dog section, and conservation-area parking rules.</p>',
  'Street Address': 'Cochrane St. N., south of Winchester Rd. W.',
  latitude: '43.9398929',
  longitude: '-78.9791492',
  City: 'Whitby',
  Province: 'Ontario',
  'Postal Code': '',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'Yes',
  'Surface type': 'Grass',
  Size: 'Fenced conservation-area dog park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - paid conservation-area parking or annual pass required',
  'Washrooms nearby': 'Verify conservation-area facilities on arrival',
  'Operating hours': 'April 1 to September 30: 6 a.m. to 10 p.m.; October 1 to March 31: 6 a.m. to 8 p.m.',
  'Seasonal Restrictions': 'Follow posted off-leash rules and conservation-area access conditions',
  'Park Website or Source': 'https://www.whitby.ca/explore-and-enjoy/parks-and-recreation/off-leash-dog-parks/',
  'Google Maps Link': 'https://www.google.com/maps/place/North+Whitby+Off-Leash+Dog+Park/',
  Tags: 'off-leash,whitby,heber-down-conservation-area,fenced,small-dog-area',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'north-whitby-off-leash-dog-park', {
  'Park Header': 'Cochrane Street North Off-Leash Dog Park | Whitby',
  'Park type': 'Leash Free',
  Description:
    '<p>Cochrane Street North is Whitby&apos;s official northern off-leash dog park within Heber Down Conservation Area, with fenced areas, a separate small-dog section, and conservation-area parking rules.</p>',
  'Street Address': 'Cochrane St. N., south of Winchester Rd. W.',
  latitude: '43.9398929',
  longitude: '-78.9791492',
  City: 'Whitby',
  Province: 'Ontario',
  'Postal Code': '',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'Yes',
  'Surface type': 'Grass',
  Size: 'Fenced conservation-area dog park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - paid conservation-area parking or annual pass required',
  'Washrooms nearby': 'Verify conservation-area facilities on arrival',
  'Operating hours': 'April 1 to September 30: 6 a.m. to 10 p.m.; October 1 to March 31: 6 a.m. to 8 p.m.',
  'Seasonal Restrictions': 'Follow posted off-leash rules and conservation-area access conditions',
  'Park Website or Source': 'https://www.whitby.ca/explore-and-enjoy/parks-and-recreation/off-leash-dog-parks/',
  'Google Maps Link': 'https://www.google.com/maps/place/North+Whitby+Off-Leash+Dog+Park/',
  Tags: 'off-leash,whitby,heber-down-conservation-area,fenced,small-dog-area',
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
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/north-whitby-off-leash-dog-park/';
  },
);

removeCsvRow(
  reviewQueuePath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/north-whitby-off-leash-dog-park/';
  },
);

rebuildBacklogSummary();

console.log('Updated North Whitby record and refreshed backlog files.');
