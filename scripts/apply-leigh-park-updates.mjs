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
      if (char === '\r' && next === '\n') {
        i += 1;
      }
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

  if (keyIndex === -1) {
    throw new Error(`CSV field not found: ${keyField}`);
  }

  const row = rows.find((entry, index) => index > 0 && entry[keyIndex] === keyValue);

  if (!row) {
    throw new Error(`CSV row not found for ${keyField}=${keyValue}`);
  }

  for (const [field, value] of Object.entries(updates)) {
    const index = header.indexOf(field);
    if (index === -1) {
      throw new Error(`CSV field not found: ${field}`);
    }
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

  const tierRows = countBy('tier')
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join('\n');
  const sectionRows = countBy('contentType')
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join('\n');
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
const park = parks.find((entry) => entry.slug === 'leigh-park');

if (!park) {
  throw new Error('Leigh Park record not found');
}

const seoTitle = 'Leigh Park Dog Off-Leash Area | Coquitlam | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Leigh Park in Coquitlam, including the official 1254 Soball Street location, large- and small-dog off-leash use, dawn-to-dusk hours, and nearby park amenities.';
const intro =
  '<p>Leigh Park is one of Coquitlam&apos;s official dog off-leash locations at <strong>1254 Soball Street</strong>, with a designated area for <strong>both large and small dogs</strong> inside a broader passive neighbourhood park.</p>';
const body =
  '<p>Coquitlam&apos;s current off-leash page gives this park a much stronger factual footing than the older thin copy. The city lists <strong>Leigh Park</strong> as one of its designated off-leash locations and identifies the park address as <strong>1254 Soball Street</strong>. The official dog page also makes an important practical point: Leigh has a designated off-leash area for <strong>both large and small dogs</strong>. That is more precise than the generic earlier description and gives dog owners a clearer expectation before they arrive.</p><p>The broader Leigh Park facility page adds context that improves the visit guide materially. Coquitlam describes Leigh as a <strong>passive neighbourhood park</strong> and says it officially opened on <strong>June 15, 2016</strong>. The city also lists other park features including <strong>walking trails</strong>, <strong>picnic area with open lawn spaces</strong>, an <strong>off-road cycling skills course</strong>, and a <strong>little library</strong>. That matters because Leigh is not just a fenced utility stop for dogs; it is part of a wider community park setting that supports longer casual visits.</p><p>The off-leash rules page also confirms the daily access window: <strong>open daily, dawn to dusk</strong>. Coquitlam&apos;s leash bylaw says dogs must be on leash everywhere unless designated by a sign as an off-leash area, and the city emphasizes that owners are responsible for control, cleanup, and licensing. That makes Leigh a good example of a park page that should combine place details with rule clarity rather than relying on filler amenity claims.</p><p>The practical summary is straightforward: Leigh Park is a legitimate, city-listed Coquitlam off-leash destination with designated space for large and small dogs, but it is best understood as one part of a larger neighbourhood park with trails and family-oriented open space around it.</p>';
const notes =
  '<p>Primary sources: https://coquitlam.ca/527/Leashed-Off-Leash-Dog-Areas and https://www.coquitlam.ca/facilities/facility/details/Leigh-Park-49. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Leigh Park Dog Off-Leash Area | Coquitlam',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'coquitlam', 'large-dogs', 'small-dogs', 'leigh-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Leigh Park Dog Off-Leash Area | Coquitlam',
  'Park type': 'Leash Free',
  Description:
    '<p>Leigh Park is an official Coquitlam dog off-leash location at 1254 Soball Street with designated space for both large and small dogs inside a broader neighbourhood park.</p>',
  'Street Address': '1254 Soball Street',
  latitude: '49.2901',
  longitude: '-122.7499',
  'Surface type': 'Designated dog area within a broader park setting - verify exact footing on arrival',
  Size: 'Neighbourhood park with designated off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Park seating likely - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or nearby park access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Open daily, dawn to dusk',
  'Seasonal Restrictions': 'Check posted signs and city notices',
  'Park Website or Source': 'https://www.coquitlam.ca/facilities/facility/details/Leigh-Park-49',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1254+Soball+Street+Coquitlam+BC',
  Tags: 'off-leash,coquitlam,large-dogs,small-dogs,leigh-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'leigh-park', {
  'Park Header': 'Leigh Park Dog Off-Leash Area | Coquitlam',
  'Park type': 'Leash Free',
  Description:
    '<p>Leigh Park is an official Coquitlam dog off-leash location at 1254 Soball Street with designated space for both large and small dogs inside a broader neighbourhood park.</p>',
  'Street Address': '1254 Soball Street',
  latitude: '49.2901',
  longitude: '-122.7499',
  'Surface type': 'Designated dog area within a broader park setting - verify exact footing on arrival',
  Size: 'Neighbourhood park with designated off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Park seating likely - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or nearby park access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Open daily, dawn to dusk',
  'Seasonal Restrictions': 'Check posted signs and city notices',
  'Park Website or Source': 'https://www.coquitlam.ca/facilities/facility/details/Leigh-Park-49',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1254+Soball+Street+Coquitlam+BC',
  Tags: 'off-leash,coquitlam,large-dogs,small-dogs,leigh-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Leigh Park,/dog-parks/leigh-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/leigh-park/"') || row.join(',').includes(',/dog-parks/leigh-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Leigh Park record and refreshed backlog files.');
