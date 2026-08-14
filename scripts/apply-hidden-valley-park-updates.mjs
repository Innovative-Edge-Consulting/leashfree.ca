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
const park = parks.find((entry) => entry.slug === 'hidden-valley-park');
if (!park) throw new Error('Hidden Valley Park record not found');

const seoTitle = 'Hidden Valley Park Off-Leash Area | Burlington';
const metaDescription =
  'Source-backed guide to Hidden Valley Park in Burlington, including the official 1137 Hidden Valley Road location, leash-free status, splash pad, washrooms, parking, Royal Botanical Gardens access, and Burlington off-leash rules.';
const intro =
  '<p>Hidden Valley Park is one of Burlington&apos;s officially listed <strong>leash-free parks</strong>, and the current city sources support it as part of a much larger family-oriented park with natural trails and amenities.</p>';
const body =
  '<p>The current Burlington leash-free parks page confirms that <strong>Hidden Valley Park</strong> is one of the city&apos;s official local leash-free areas. The park is located at <strong>1137 Hidden Valley Road</strong> in Aldershot, and Burlington&apos;s park pages make it clear that this is more than a stand-alone dog run.</p><p>The strongest value on this page comes from combining the city&apos;s park-amenity pages with the leash-free listing. Burlington&apos;s picnic and recreation pages describe Hidden Valley Park as a <strong>tranquil natural forest setting</strong> with <strong>access to the Royal Botanical Gardens</strong>, a <strong>splash pad</strong>, <strong>washrooms</strong>, <strong>parking areas</strong>, and the leash-free dog park. That makes the page more useful for real visit planning and more distinct from commodity dog-park copy.</p><p>Current Burlington pages also show Hidden Valley Park is one of the city&apos;s popular family park destinations. The city highlights the splash pad as open daily in season and lists Hidden Valley as an eligible park for photography bookings, again reinforcing its larger park identity. These details matter because users are not arriving at an isolated fenced enclosure; they are visiting an urban nature park with multiple amenities and uses.</p><p>The leash-free rules themselves are the most important operational details. Burlington says dog owners should <strong>always carry a leash</strong>, <strong>always stay with their dog</strong>, <strong>pick up and dispose of waste</strong>, and keep a <strong>maximum of two dogs off leash at one time</strong>. Dogs must also be licensed, vaccinated, and under control. As of <strong>Friday, August 14, 2026</strong>, that rule set plus the verified amenity context makes this page much stronger than the old unsupported enclosure-description version.</p>';
const notes =
  '<p>Primary sources: https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx for Burlington&apos;s current official leash-free park list and citywide off-leash rules; https://www.burlington.ca/en/parks-facilities-and-rentals/picnics.aspx for Hidden Valley Park&apos;s location, parking, washrooms, splash pad, natural setting, and Royal Botanical Gardens access; https://www.burlington.ca/en/parks-facilities-and-rentals/pools-splash-pads-and-spray-parks.aspx for the Hidden Valley Park splash pad listing; https://www.burlington.ca/en/parks-facilities-and-rentals/photography-in-parks.aspx for current park context; and https://mapcarta.com/W297229348 as a coordinate reference. Reviewed on Friday, August 14, 2026.</p>';

Object.assign(park, {
  title: seoTitle,
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Burlington'],
    Province: ['Ontario'],
    Tags: ['off-leash', 'burlington', 'natural-park', 'splash-pad', 'royal-botanical-gardens'],
  },
});

Object.assign(park.raw, {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Hidden Valley Park is an official Burlington leash-free park within a larger natural family park setting that also includes trails, parking, washrooms, a splash pad, and Royal Botanical Gardens access.</p>',
  'Street Address': '1137 Hidden Valley Road',
  latitude: '43.30344',
  longitude: '-79.86462',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7P 0T5',
  Fenced: 'Verify exact boundary treatment on arrival',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Grass park setting',
  Size: 'Leash-free area within larger natural park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - mature natural tree cover in parts of the park',
  'Waste bins': 'Yes - follow city waste-disposal rules',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow Burlington leash-free area rules and any posted seasonal notices',
  'Park Website or Source': 'https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/1137+Hidden+Valley+Rd,+Burlington,+ON+L7P+0T5',
  Tags: 'off-leash,burlington,natural-park,splash-pad,royal-botanical-gardens',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'hidden-valley-park', {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Hidden Valley Park is an official Burlington leash-free park within a larger natural family park setting that also includes trails, parking, washrooms, a splash pad, and Royal Botanical Gardens access.</p>',
  'Street Address': '1137 Hidden Valley Road',
  latitude: '43.30344',
  longitude: '-79.86462',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7P 0T5',
  Fenced: 'Verify exact boundary treatment on arrival',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Grass park setting',
  Size: 'Leash-free area within larger natural park',
  'Water source available': 'Verify on arrival',
  Benches: 'Verify on arrival',
  'Shaded area': 'Yes - mature natural tree cover in parts of the park',
  'Waste bins': 'Yes - follow city waste-disposal rules',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow Burlington leash-free area rules and any posted seasonal notices',
  'Park Website or Source': 'https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/1137+Hidden+Valley+Rd,+Burlington,+ON+L7P+0T5',
  Tags: 'off-leash,burlington,natural-park,splash-pad,royal-botanical-gardens',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/hidden-valley-park/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/hidden-valley-park/';
});

rebuildBacklogSummary();

console.log('Updated Hidden Valley Park record and refreshed backlog files.');
