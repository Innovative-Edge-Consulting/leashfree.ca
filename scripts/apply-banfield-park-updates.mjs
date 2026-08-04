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
const park = parks.find((entry) => entry.slug === 'banfield-park-victoria');

if (!park) {
  throw new Error('Banfield Park record not found');
}

const seoTitle = 'Banfield Park | Victoria Leash-Optional Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Banfield Park in Victoria, including its Vic West waterfront setting, seasonal leash-optional hours, and the on-leash restrictions around the dock and marine park.';
const intro =
  '<p>Banfield Park is a <strong>Victoria West waterfront park</strong> with a designated <strong>leash-optional area</strong>, but its dog rules are more specific than the older generic page suggested.</p>';
const body =
  '<p>The City of Victoria currently lists <strong>Banfield Park</strong> as one of its designated leash-optional dog areas, but the park does not operate like a simple always-off-leash lawn. The city&apos;s dog-rules page says the leash-optional area sits <strong>between the basketball court and the Victoria West Community Centre parking lot</strong>. That geographic detail matters because it makes clear that not every part of Banfield Park is treated the same way.</p><p>Victoria also publishes <strong>seasonal time windows</strong> for off-leash use at Banfield. From <strong>April 1 to September 30</strong>, dogs may be off leash from <strong>6 a.m. to 9 a.m.</strong> and <strong>5 p.m. to 10 p.m.</strong>. From <strong>October 1 to March 31</strong>, the leash-optional area runs from <strong>6 a.m. to 10 p.m.</strong>. Those posted time rules are the key improvement over the old page, which treated the site like a general off-leash park without schedule limits.</p><p>The city also adds an important restriction that changes how visitors should use the waterfront portion of the park. Victoria says the <strong>dock and the Victoria West Marine Park are on-leash areas only</strong>. That means Banfield is best understood as a mixed-rule waterfront park: one part has designated leash-optional access during posted hours, while the dock and marine edge remain on-leash spaces. Users need that distinction to avoid accidental non-compliance.</p><p>The practical value of Banfield Park is still strong. It gives Victoria West dog owners a neighbourhood off-leash option in a scenic Gorge Waterway setting, but it should be described with the city&apos;s actual seasonal timing and boundary rules rather than broad filler about shoreline freedom.</p>';
const notes =
  '<p>Primary sources: City of Victoria park directory and City of Victoria dogs-in-parks guidance page. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Banfield Park | Victoria Leash-Optional Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['leash-optional', 'victoria', 'victoria-west', 'waterfront', 'banfield-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Banfield Park | Victoria Leash-Optional Area',
  'Park type': 'Park',
  Description:
    '<p>Banfield Park is a Victoria West waterfront park with a designated leash-optional dog area, but the dock and Victoria West Marine Park remain on-leash only.</p>',
  'Street Address': '521 Craigflower Road',
  latitude: '48.4280',
  longitude: '-123.3903',
  'Surface type': 'Grass lawn, waterfront path, and shared urban park landscape',
  Size: 'Neighbourhood waterfront park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes - verify exact placement on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - city says leash-optional areas include a trash bin',
  'Bag Dispensers': 'Yes - city says leash-optional areas include biodegradable dog bags',
  'Parking Available': 'Nearby community-centre or street access - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Apr 1-Sep 30: 6am-9am and 5pm-10pm; Oct 1-Mar 31: 6am-10pm',
  'Seasonal Restrictions': 'Dock and Victoria West Marine Park are on-leash only',
  'Park Website or Source': 'https://www.victoria.ca/parks-recreation/parks-trails/our-parks/banfield-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=521+Craigflower+Road+Victoria+BC',
  Tags: 'leash-optional,victoria,victoria-west,waterfront,banfield-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'banfield-park-victoria', {
  'Park Header': 'Banfield Park | Victoria Leash-Optional Area',
  'Park type': 'Park',
  Description:
    '<p>Banfield Park is a Victoria West waterfront park with a designated leash-optional dog area, but the dock and Victoria West Marine Park remain on-leash only.</p>',
  'Street Address': '521 Craigflower Road',
  latitude: '48.4280',
  longitude: '-123.3903',
  'Surface type': 'Grass lawn, waterfront path, and shared urban park landscape',
  Size: 'Neighbourhood waterfront park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes - verify exact placement on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - city says leash-optional areas include a trash bin',
  'Bag Dispensers': 'Yes - city says leash-optional areas include biodegradable dog bags',
  'Parking Available': 'Nearby community-centre or street access - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Apr 1-Sep 30: 6am-9am and 5pm-10pm; Oct 1-Mar 31: 6am-10pm',
  'Seasonal Restrictions': 'Dock and Victoria West Marine Park are on-leash only',
  'Park Website or Source': 'https://www.victoria.ca/parks-recreation/parks-trails/our-parks/banfield-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=521+Craigflower+Road+Victoria+BC',
  Tags: 'leash-optional,victoria,victoria-west,waterfront,banfield-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Banfield Park,/dog-parks/banfield-park-victoria/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/banfield-park-victoria/"') ||
    row.join(',').includes(',/dog-parks/banfield-park-victoria/,'),
);

rebuildBacklogSummary();

console.log('Updated Banfield Park record and refreshed backlog files.');
