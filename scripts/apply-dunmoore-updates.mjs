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
const park = parks.find((entry) => entry.slug === 'dunmoore-park-pickering');

if (!park) {
  throw new Error('Dunmoore Park record not found');
}

const seoTitle = 'Dunmoore Park | Pickering Leash-Free Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Dunmoore Park in Pickering, including the city’s fenced leash-free areas, small-dog section, unique canine activity area, seasonal washrooms, and temporary closure dates through August 12, 2026.';
const intro =
  '<p>Dunmoore Park is one of Pickering&apos;s official <strong>fully fenced leash-free areas</strong>, with <strong>two separate dog sections</strong>, a <strong>sand pit</strong>, and the city&apos;s distinctive <strong>canine activity area</strong>.</p>';
const body =
  '<p>Pickering&apos;s current leash-free areas page confirms that Dunmoore Park is one of the city&apos;s three designated leash-free locations, and it is much better equipped than the older thin profile suggested. The city says the site is <strong>fully fenced</strong> and split into <strong>two areas</strong>: one for <strong>small dogs</strong> and another for <strong>all dogs</strong>. That alone makes Dunmoore more structured than a typical open neighbourhood field.</p><p>The city also identifies features that materially improve content quality on this page. Pickering says the larger area includes a <strong>sand pit</strong> and a <strong>one-of-a-kind Canine Activity Area</strong>. On the city&apos;s dedicated canine activity page, Pickering says the space includes <strong>10 individual stations</strong> where dogs and owners can complete simple training-style challenges together, and describes it as the GTA&apos;s first such amenity. That gives Dunmoore a clearer identity than a generic fenced run: it is a municipal leash-free area with both everyday exercise space and a skills-oriented activity zone.</p><p>The broader park listing adds context beyond the dog enclosure. The City of Pickering park directory lists Dunmoore Park with a <strong>parking lot</strong>, <strong>playground equipment</strong>, <strong>soccer field</strong>, <strong>softball diamond</strong>, <strong>outdoor tennis courts</strong>, and <strong>seasonal washrooms</strong>. Pickering&apos;s parks maintenance page says washrooms at Dunmoore are generally open from <strong>early May to Thanksgiving</strong>, from <strong>9 a.m. to 10 p.m.</strong>, weather permitting. That means visitors are using a larger multi-use park setting, not an isolated dog-only parcel.</p><p>This page also needs a current operating note. On <strong>July 24, 2026</strong>, the City of Pickering posted a service announcement saying the <strong>entire Dunmoore dog park will be temporarily closed from July 27, 2026 through August 12, 2026</strong> for installation of new lighting. As of <strong>Friday, July 31, 2026</strong>, that closure is active. So the correct current framing is: Dunmoore is a legitimate, well-equipped official leash-free area, but anyone planning a near-term visit should confirm that the lighting work has been completed before showing up.</p>';
const notes =
  '<p>Primary sources: https://www.pickering.ca/parks-recreation-culture/parks-and-trails/leash-free-areas/ and https://www.pickering.ca/parks-recreation-culture/parks-and-trails/leash-free-areas/canine-activity-area/. Supporting sources: https://apps.pickering.ca/appforms/ParkDetails.aspx?ParkFacilityID=22, https://www.pickering.ca/parks-recreation-culture/parks-and-trails/parks-maintenance/, and https://www.pickering.ca/news/program-cancellations-and-service-disruptions/. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Dunmoore Park | Pickering Leash-Free Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['leash-free', 'fenced', 'small-dog-area', 'canine-activity-area', 'pickering'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Dunmoore Park | Pickering Leash-Free Dog Park',
  Description:
    '<p>Dunmoore Park is an official Pickering leash-free area with separate small-dog and all-dog sections, a sand pit, a 10-station canine activity area, and a current temporary closure for lighting installation through August 12, 2026.</p>',
  'Park type': 'Leash Free',
  'Street Address': 'Whites Road South, Pickering',
  latitude: '43.81098572753578',
  longitude: '-79.11190121694257',
  'Surface type': 'Grass with sand activity area',
  Size: 'Large municipal fenced leash-free area within larger park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Limited',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Yes - park lot available',
  'Washrooms nearby': 'Yes - seasonal washrooms in the larger park',
  'Operating hours': 'Check posted city signage; park washrooms generally 9 a.m. to 10 p.m. in season',
  'Seasonal Restrictions': 'Temporary full dog-park closure July 27, 2026 to August 12, 2026 for lighting installation',
  'Park Website or Source': 'https://www.pickering.ca/parks-recreation-culture/parks-and-trails/leash-free-areas/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Dunmoore+Park+Pickering+ON',
  Tags: 'leash-free,fenced,small-dog-area,canine-activity-area,pickering',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'dunmoore-park-pickering', {
  'Park Header': 'Dunmoore Park | Pickering Leash-Free Dog Park',
  Description:
    '<p>Dunmoore Park is an official Pickering leash-free area with separate small-dog and all-dog sections, a sand pit, a 10-station canine activity area, and a current temporary closure for lighting installation through August 12, 2026.</p>',
  'Park type': 'Leash Free',
  'Street Address': 'Whites Road South, Pickering',
  latitude: '43.81098572753578',
  longitude: '-79.11190121694257',
  'Surface type': 'Grass with sand activity area',
  Size: 'Large municipal fenced leash-free area within larger park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Limited',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Yes - park lot available',
  'Washrooms nearby': 'Yes - seasonal washrooms in the larger park',
  'Operating hours': 'Check posted city signage; park washrooms generally 9 a.m. to 10 p.m. in season',
  'Seasonal Restrictions': 'Temporary full dog-park closure July 27, 2026 to August 12, 2026 for lighting installation',
  'Park Website or Source': 'https://www.pickering.ca/parks-recreation-culture/parks-and-trails/leash-free-areas/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Dunmoore+Park+Pickering+ON',
  Tags: 'leash-free,fenced,small-dog-area,canine-activity-area,pickering',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Dunmoore Park,/dog-parks/dunmoore-park-pickering/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/dunmoore-park-pickering/"') ||
    row.join(',').includes(',/dog-parks/dunmoore-park-pickering/,'),
);

rebuildBacklogSummary();

console.log('Updated Dunmoore Park record and refreshed backlog files.');
