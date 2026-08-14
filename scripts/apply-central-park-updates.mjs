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
const park = parks.find((entry) => entry.slug === 'central-park');
if (!park) throw new Error('Central Park record not found');

const seoTitle = 'Central Park Off-Leash Area | Burlington';
const metaDescription =
  'Source-backed guide to Central Park in Burlington, including the official 2299 New Street location, current Burlington leash-free rules, on-site washrooms, parking, and major park-context amenities.';
const intro =
  '<p>Central Park is one of Burlington&apos;s officially listed <strong>leash-free parks</strong>. The key improvement for this page is accuracy: the city confirms the location and the off-leash designation, but the current municipal sources do not support several of the old specific claims about enclosure size and fence specifications.</p>';
const body =
  '<p>The current City of Burlington leash-free parks page specifically includes <strong>Central Park</strong> in the city&apos;s list of local leash-free areas. That is the most important fact to preserve. The park itself is located at <strong>2299 New Street</strong> and is one of Burlington&apos;s best-known urban civic parks near downtown.</p><p>What makes this page stronger for search is practical park context tied to the official site, not filler. Burlington&apos;s current city pages show that Central Park also has features and nearby amenities that matter for a visit, including <strong>washrooms</strong>, <strong>parking</strong>, a <strong>community garden</strong>, the <strong>Central Park Bandshell</strong>, and other major recreation uses such as the cricket pitch and surrounding civic park facilities. That helps users understand they are visiting an off-leash area within a larger urban multi-use park rather than a stand-alone dog-only facility.</p><p>The city&apos;s leash-free rules are the real differentiator here. Burlington says dog owners should <strong>always carry a leash</strong>, <strong>always stay with their dog</strong>, <strong>pick up and dispose of waste</strong>, and keep a <strong>maximum of two dogs off leash at one time</strong>. The city also says dogs must be licensed, under control, and that unleashed dogs are only permitted in designated leash-free parks and private property.</p><p>Current service notes also add value. Burlington&apos;s winter 2025/26 park-amenity update lists <strong>Central Park washrooms</strong> among the park washrooms maintained through the winter season, which is useful trip-planning information. As of <strong>Friday, August 14, 2026</strong>, this page is more useful because it focuses on the current official listing, the city&apos;s actual leash-free rules, and verified park-context amenities instead of unsupported dimensional claims.</p>';
const notes =
  '<p>Primary sources: https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx for Burlington&apos;s current official list of leash-free parks and the citywide leash-free rules; https://www.burlington.ca/en/community-supports/community-gardens.aspx for Central Park community-garden details including parking and washrooms; https://www.burlington.ca/en/news/seasonal-changes-to-park-amenities-winter-2025-26.aspx for the current winter washroom note that includes Central Park; https://www.burlington.ca/en/parks-facilities-and-rentals/amphitheatres.aspx for the Central Park Bandshell; and https://mapcarta.com/W26015348 as a coordinate reference. Reviewed on Friday, August 14, 2026.</p>';

Object.assign(park, {
  title: seoTitle,
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Burlington'],
    Province: ['Ontario'],
    Tags: ['off-leash', 'burlington', 'urban-park', 'washrooms', 'bandshell'],
  },
});

Object.assign(park.raw, {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Central Park is an official Burlington leash-free park at 2299 New Street, with current city-backed off-leash rules and broader park amenities that include washrooms and parking.</p>',
  'Street Address': '2299 New Street',
  latitude: '43.33727',
  longitude: '-79.79173',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7R 1J4',
  Fenced: 'Verify exact boundary treatment on arrival',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Grass park setting',
  Size: 'Leash-free area within larger urban park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - mature park tree cover in sections',
  'Waste bins': 'Yes - follow city waste-disposal rules',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow Burlington leash-free area rules and any posted seasonal notices',
  'Park Website or Source': 'https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/2299+New+St,+Burlington,+ON+L7R+1J4',
  Tags: 'off-leash,burlington,urban-park,washrooms,bandshell',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'central-park', {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Central Park is an official Burlington leash-free park at 2299 New Street, with current city-backed off-leash rules and broader park amenities that include washrooms and parking.</p>',
  'Street Address': '2299 New Street',
  latitude: '43.33727',
  longitude: '-79.79173',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7R 1J4',
  Fenced: 'Verify exact boundary treatment on arrival',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Grass park setting',
  Size: 'Leash-free area within larger urban park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - mature park tree cover in sections',
  'Waste bins': 'Yes - follow city waste-disposal rules',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow Burlington leash-free area rules and any posted seasonal notices',
  'Park Website or Source': 'https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/2299+New+St,+Burlington,+ON+L7R+1J4',
  Tags: 'off-leash,burlington,urban-park,washrooms,bandshell',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/central-park/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/central-park/';
});

rebuildBacklogSummary();

console.log('Updated Central Park record and refreshed backlog files.');
