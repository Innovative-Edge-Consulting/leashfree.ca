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
const park = parks.find((entry) => entry.slug === 'edworthy-park');
if (!park) throw new Error('Edworthy Park record not found');

const seoTitle = 'Edworthy Park Off-Leash Areas | Calgary';
const metaDescription =
  'Source-backed guide to Edworthy Park in Calgary, including the official address, hours, two designated off-leash areas, park maps, parking lots, public washroom status, and key on-leash rule for paved pathways.';
const intro =
  '<p>Edworthy Park is an official Calgary park with <strong>two designated off-leash areas</strong>, not a single generic dog run. That matters because the city treats it as a large multi-use Bow River valley park with separate mapped off-leash spaces inside a much broader public park.</p>';
const body =
  '<p>The current City of Calgary park page gives stronger factual detail than the old thin listing. Edworthy Park is located at <strong>5050 Spruce Dr. S.W. (Bow Tr. &amp; Spruce Dr.)</strong>, covers about <strong>169 hectares</strong>, and is open daily from <strong>5 a.m. to 11 p.m.</strong>. The city also confirms that Edworthy includes the natural areas of <strong>Douglas Fir Trail</strong> and <strong>Lawrey Gardens</strong>, which helps explain why this page should describe a broad river-valley park experience rather than a simple fenced dog enclosure.</p><p>Calgary&apos;s off-leash locations page is the key validation source for the dog-use pattern. It lists <strong>Edworthy Park Area 1</strong> and <strong>Area 2</strong>, confirming that there are <strong>two official off-leash areas</strong> here. The park pages also provide separate maps for the <strong>Spruce Dr. off-leash area</strong> and the <strong>Lawrey Gardens off-leash area</strong>, which is more useful than generic prose because it tells visitors there are multiple access patterns and off-leash zones to review before arriving.</p><p>The city also publishes practical site details that are worth preserving. Edworthy Park includes <strong>parking lots</strong>, picnic amenities, pathways, benches, shelters, and public washrooms. As of <strong>Friday, August 14, 2026</strong>, Calgary notes that the <strong>south public washrooms are open</strong> while the <strong>north public washrooms are closed until further notice</strong>. That is the kind of current, visit-planning information that makes the page more competitive and more useful.</p><p>There is one especially important rule for ranking and usability: Calgary states that <strong>dogs are required to be on leash on a paved pathway in an off-leash area</strong>. Because Edworthy is a heavily used multi-use park, that rule is more valuable than generic claims about river access or adventure. This update therefore replaces commodity copy with official location facts, the two-area off-leash structure, current washroom status, and the paved-pathway leash rule.</p>';
const notes =
  '<p>Primary sources: https://www.calgary.ca/parks/edworthy-park.html for the official park address, area, hours, maps, park features, parking lots, and current washroom status; https://www.calgary.ca/parks/off-leash-locations.html for Calgary&apos;s official listing of Edworthy Park Area 1 and Area 2 and the paved-pathway leash reminder; https://www.calgary.ca/parks/lawrey-gardens.html for the Lawrey Gardens off-leash area context within the Edworthy green space; https://www.calgary.ca/parks/douglas-fir-trail.html for the Douglas Fir Trail relationship to Edworthy Park; and https://mapcarta.com/W607550623 as a coordinate reference. Reviewed on Friday, August 14, 2026.</p>';

Object.assign(park, {
  title: seoTitle,
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Calgary'],
    Province: ['Alberta'],
    Tags: ['off-leash', 'calgary', 'two-areas', 'bow-river', 'lawrey-gardens'],
  },
});

Object.assign(park.raw, {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Edworthy Park is a large Calgary Bow River valley park with two official off-leash areas, mapped access points, parking lots, and current public-amenity details published by the city.</p>',
  'Street Address': '5050 Spruce Dr. S.W. (Bow Tr. & Spruce Dr.)',
  latitude: '51.06086',
  longitude: '-114.15146',
  City: 'Calgary',
  Province: 'Alberta',
  'Postal Code': 'T3C 3B2',
  Fenced: 'No fenced dog-only park confirmed; multi-use off-leash areas',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Grass, pathways, dirt and river-valley natural terrain',
  Size: '169 hectares park area',
  'Water source available': 'Natural river setting nearby - verify safe access on arrival',
  Benches: 'Yes',
  'Shaded area': 'Yes - mature tree cover in many sections',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - South Parking Lot and Edworthy North (Lot 84)',
  'Washrooms nearby': 'Yes - south washrooms open, north washrooms closed until further notice',
  'Operating hours': '5:00 AM – 11:00 PM',
  'Seasonal Restrictions': 'Dogs must be on leash on paved pathways within off-leash areas',
  'Park Website or Source': 'https://www.calgary.ca/parks/edworthy-park.html',
  'Google Maps Link': 'https://www.google.com/maps/place/Edworthy+Park/',
  Tags: 'off-leash,calgary,two-areas,bow-river,lawrey-gardens',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'edworthy-park', {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Edworthy Park is a large Calgary Bow River valley park with two official off-leash areas, mapped access points, parking lots, and current public-amenity details published by the city.</p>',
  'Street Address': '5050 Spruce Dr. S.W. (Bow Tr. & Spruce Dr.)',
  latitude: '51.06086',
  longitude: '-114.15146',
  City: 'Calgary',
  Province: 'Alberta',
  'Postal Code': 'T3C 3B2',
  Fenced: 'No fenced dog-only park confirmed; multi-use off-leash areas',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Grass, pathways, dirt and river-valley natural terrain',
  Size: '169 hectares park area',
  'Water source available': 'Natural river setting nearby - verify safe access on arrival',
  Benches: 'Yes',
  'Shaded area': 'Yes - mature tree cover in many sections',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - South Parking Lot and Edworthy North (Lot 84)',
  'Washrooms nearby': 'Yes - south washrooms open, north washrooms closed until further notice',
  'Operating hours': '5:00 AM – 11:00 PM',
  'Seasonal Restrictions': 'Dogs must be on leash on paved pathways within off-leash areas',
  'Park Website or Source': 'https://www.calgary.ca/parks/edworthy-park.html',
  'Google Maps Link': 'https://www.google.com/maps/place/Edworthy+Park/',
  Tags: 'off-leash,calgary,two-areas,bow-river,lawrey-gardens',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/edworthy-park/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/edworthy-park/';
});

rebuildBacklogSummary();

console.log('Updated Edworthy Park record and refreshed backlog files.');
