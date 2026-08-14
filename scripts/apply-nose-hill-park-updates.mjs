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
const park = parks.find((entry) => entry.slug === 'nose-hill-park');
if (!park) throw new Error('Nose Hill Park record not found');

const seoTitle = 'Nose Hill Park Off-Leash Areas | Calgary';
const metaDescription =
  'Source-backed guide to Nose Hill Park in Calgary, including the official address, 1129-hectare park size, dedicated off-leash areas, current washroom locations, and Calgary’s paved-pathway leash rule.';
const intro =
  '<p>Nose Hill Park is an official Calgary park with <strong>dedicated off-leash areas</strong> inside one of the city&apos;s largest natural parks. That is more precise and more useful than calling it a single leash-free dog park.</p>';
const body =
  '<p>The current City of Calgary park page confirms the key facts visitors need first. <strong>Nose Hill Park</strong> is at <strong>6465 14 St. N.W.</strong>, covers about <strong>1129 hectares</strong>, and is open daily from <strong>5 a.m. to 11 p.m.</strong>. Calgary describes it as a major natural park with hiking trails, native grassland, wildlife, washrooms, and <strong>designated off-leash areas</strong>.</p><p>This matters because Nose Hill is not a small fenced dog enclosure. Calgary notes that the park covers <strong>over 11 square kilometres</strong> and contains one of the most significant remaining examples of <strong>rough fescue grassland</strong> on the Canadian prairies. That gives this page stronger local value: visitors are using off-leash space within a sensitive natural grassland landscape, not just a standard neighbourhood dog park.</p><p>Calgary&apos;s official off-leash locations page also provides the most important rule for this page: <strong>dogs are required to be on leash on a paved pathway in an off-leash area</strong>. That rule is repeated across Calgary&apos;s off-leash guidance and is especially relevant at Nose Hill because the park is large, multi-use, and heavily used by walkers and other visitors.</p><p>The city&apos;s current public washroom listing adds practical information that the old thin page did not have. As of <strong>Friday, August 14, 2026</strong>, Nose Hill has a <strong>year-round washroom at 8102 Shaganappi Tr. N.W.</strong> and <strong>seasonal pit toilets</strong> at <strong>4617 14th St. N.W.</strong>, <strong>8447 14th St. N.W.</strong>, and <strong>2908 John Laurie Blvd. N.W.</strong>. That makes the page more useful for actual trip planning and more aligned with Google&apos;s people-first guidance.</p><p>This update improves the page by replacing generic skyline-and-Rockies copy with verifiable local facts: official address, park size, dedicated off-leash status, grassland context, current washroom locations, and the paved-pathway leash rule.</p>';
const notes =
  '<p>Primary sources: https://www.calgary.ca/parks/nose-hill-park.html for the official park address, area, hours, park features, and natural grassland context; https://www.calgary.ca/parks/off-leash-locations.html for Calgary&apos;s official listing of Nose Hill Park as an off-leash location and the paved-pathway leash reminder; https://www.calgary.ca/parks/public-washrooms.html for current Nose Hill washroom locations and operating status; and https://mapcarta.com/W490372623 as a coordinate reference for the off-leash area. Reviewed on Friday, August 14, 2026.</p>';

Object.assign(park, {
  title: seoTitle,
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Calgary'],
    Province: ['Alberta'],
    Tags: ['off-leash', 'calgary', 'grassland', 'large-natural-park', 'washrooms'],
  },
});

Object.assign(park.raw, {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Nose Hill Park is a major Calgary natural park with dedicated off-leash areas, prairie grassland trails, multiple access points, and current public washroom information published by the city.</p>',
  'Street Address': '6465 14 St. N.W.',
  latitude: '51.11332',
  longitude: '-114.11436',
  City: 'Calgary',
  Province: 'Alberta',
  'Postal Code': '',
  Fenced: 'No - natural multi-use off-leash areas',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Natural grassland and dirt trails',
  Size: '1129 hectares park area',
  'Water source available': 'No public dog water source confirmed by city',
  Benches: 'Verify on arrival',
  'Shaded area': 'Limited natural shade in parts of the park',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Multiple access points and parking areas - verify preferred entrance on arrival',
  'Washrooms nearby': 'Yes - one year-round washroom and multiple seasonal pit toilets',
  'Operating hours': '5:00 AM – 11:00 PM',
  'Seasonal Restrictions': 'Dogs must be on leash on paved pathways within off-leash areas',
  'Park Website or Source': 'https://www.calgary.ca/parks/nose-hill-park.html',
  'Google Maps Link': 'https://www.google.com/maps/place/Nose+Hill+Park/',
  Tags: 'off-leash,calgary,grassland,large-natural-park,washrooms',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'nose-hill-park', {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Nose Hill Park is a major Calgary natural park with dedicated off-leash areas, prairie grassland trails, multiple access points, and current public washroom information published by the city.</p>',
  'Street Address': '6465 14 St. N.W.',
  latitude: '51.11332',
  longitude: '-114.11436',
  City: 'Calgary',
  Province: 'Alberta',
  'Postal Code': '',
  Fenced: 'No - natural multi-use off-leash areas',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Natural grassland and dirt trails',
  Size: '1129 hectares park area',
  'Water source available': 'No public dog water source confirmed by city',
  Benches: 'Verify on arrival',
  'Shaded area': 'Limited natural shade in parts of the park',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Multiple access points and parking areas - verify preferred entrance on arrival',
  'Washrooms nearby': 'Yes - one year-round washroom and multiple seasonal pit toilets',
  'Operating hours': '5:00 AM – 11:00 PM',
  'Seasonal Restrictions': 'Dogs must be on leash on paved pathways within off-leash areas',
  'Park Website or Source': 'https://www.calgary.ca/parks/nose-hill-park.html',
  'Google Maps Link': 'https://www.google.com/maps/place/Nose+Hill+Park/',
  Tags: 'off-leash,calgary,grassland,large-natural-park,washrooms',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/nose-hill-park/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/nose-hill-park/';
});

rebuildBacklogSummary();

console.log('Updated Nose Hill Park record and refreshed backlog files.');
