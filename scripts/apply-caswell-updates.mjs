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
const park = parks.find((entry) => entry.slug === 'caswell-mayfair-dog-park');
if (!park) throw new Error('Caswell record not found');

const seoTitle = 'Caswell (Mayfair) Dog Park | Saskatoon | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Caswell (Mayfair) Dog Park in Saskatoon, including its official off-leash status, 2014 opening, Mayfair Outdoor Pool location, and current City licensing rules.';
const intro =
  '<p>Caswell (Mayfair) Dog Park is one of Saskatoon&apos;s official <strong>off-leash dog parks</strong>, located <strong>next to Mayfair Outdoor Pool</strong> in the Caswell Hill and Mayfair area.</p>';
const body =
  '<p>Saskatoon&apos;s current dog-park page confirms that <strong>Caswell (Mayfair) Dog Park</strong> is part of the city&apos;s official off-leash system, so this is a legitimate municipal dog-park page rather than a generic neighbourhood green space.</p><p>The city&apos;s own news releases give the useful location context the old stub was missing. In <strong>April 2014</strong>, Saskatoon announced that <strong>Caswell</strong> was scheduled to open that summer <strong>next to the Mayfair Pool</strong>. Later city releases in <strong>October 2014</strong> and <strong>June 2015</strong> continued listing Caswell as one of Saskatoon&apos;s active dog parks and again placed it beside <strong>Mayfair Outdoor Pool</strong>. That makes the pool the clearest public landmark for locating the park.</p><p>The current city rules matter here too. Saskatoon requires dogs using the dog parks to have a <strong>valid City of Saskatoon pet licence</strong>, and owners must keep dogs <strong>within eyesight and under control</strong>. The city&apos;s commercial dog walker rules are also useful for trip planning: permits for walking <strong>five to eight dogs</strong> apply only at Chief Whitecap, Hampton, Southwest, and Sutherland Beach, which means Caswell is <strong>not</strong> one of the city&apos;s approved high-volume commercial walker parks.</p><p>This update improves the page by replacing thin filler with the city&apos;s actual facts: official Saskatoon status, the 2014 opening context, location next to Mayfair Outdoor Pool, and current licence and control rules. That is enough to make the page materially more trustworthy without inventing unsupported amenities.</p>';
const notes =
  '<p>Primary sources: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks for official dog-park status and current licence/control rules; https://www.saskatoon.ca/news-releases/city-saskatoon-dog-parks-gearing-spring dated April 21, 2014 for Caswell&apos;s planned summer 2014 opening next to Mayfair Pool; https://www.saskatoon.ca/news-releases/city-dog-parks-host-scoop-poop-event-all-dog-parks-saturday-october-4-2014 and https://www.saskatoon.ca/news-releases/enjoy-city-saskatoons-newest-dog-park dated June 9, 2015 for continued active status next to Mayfair Outdoor Pool; and https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks/commercial-dog-walker for the current list of approved 5-8 dog commercial-walker parks, which does not include Caswell. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Caswell (Mayfair) Dog Park | Saskatoon',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'saskatoon', 'caswell', 'mayfair', 'urban-dog-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Caswell (Mayfair) Dog Park | Saskatoon',
  'Park type': 'Leash Free',
  Description:
    '<p>Caswell (Mayfair) Dog Park is an official Saskatoon off-leash park next to Mayfair Outdoor Pool, with current City licensing and under-control rules for visitors.</p>',
  'Street Address': '28th Street West and Avenue F North, next to Mayfair Outdoor Pool',
  latitude: '52.1395',
  longitude: '-106.6692',
  Fenced: 'Unknown - verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Grass and urban park terrain',
  Size: 'Urban neighbourhood dog park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some mature tree cover nearby',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking in the surrounding neighbourhood',
  'Washrooms nearby': 'Mayfair Outdoor Pool washrooms may be seasonal - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=28th+Street+West+and+Avenue+F+North+Saskatoon+SK',
  Tags: 'off-leash,saskatoon,caswell,mayfair,urban-dog-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'caswell-mayfair-dog-park', {
  'Park Header': 'Caswell (Mayfair) Dog Park | Saskatoon',
  'Park type': 'Leash Free',
  Description:
    '<p>Caswell (Mayfair) Dog Park is an official Saskatoon off-leash park next to Mayfair Outdoor Pool, with current City licensing and under-control rules for visitors.</p>',
  'Street Address': '28th Street West and Avenue F North, next to Mayfair Outdoor Pool',
  latitude: '52.1395',
  longitude: '-106.6692',
  Fenced: 'Unknown - verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Grass and urban park terrain',
  Size: 'Urban neighbourhood dog park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some mature tree cover nearby',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street parking in the surrounding neighbourhood',
  'Washrooms nearby': 'Mayfair Outdoor Pool washrooms may be seasonal - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=28th+Street+West+and+Avenue+F+North+Saskatoon+SK',
  Tags: 'off-leash,saskatoon,caswell,mayfair,urban-dog-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Caswell (Mayfair) Dog Park,/dog-parks/caswell-mayfair-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/caswell-mayfair-dog-park/"') ||
    row.join(',').includes(',/dog-parks/caswell-mayfair-dog-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Caswell record and refreshed backlog files.');
