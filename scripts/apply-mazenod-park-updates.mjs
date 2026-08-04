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
const park = parks.find((entry) => entry.slug === 'mazenod-park');

if (!park) {
  throw new Error('Mazenod Park record not found');
}

const seoTitle = 'Mazenod Park Dog Off-Leash Area | Winnipeg | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Mazenod Park in Winnipeg, including the official off-leash retention-pond layout near 2015 Mazenod Road and the city\'s posted hours and rules.';
const intro =
  '<p>Mazenod Park is an official <strong>Winnipeg dog off-leash area</strong> built around a <strong>retention pond</strong> beside <strong>2015 Mazenod Road</strong> in Transcona.</p>';
const body =
  '<p>Winnipeg&apos;s current off-leash directory gives Mazenod Park a more specific identity than the old filler copy. The city places the off-leash area beside <strong>2015 Mazenod Road</strong> and describes it as an <strong>unfenced site around the retention pond</strong>, with the designated area extending along the surrounding pathway edges. That matters because it tells users what kind of park this actually is: not a fenced run, but an open neighbourhood green space where dogs circulate around pond-side walking routes.</p><p>The city also publishes the practical use rules that shape the experience here. Mazenod operates within Winnipeg&apos;s standard off-leash framework, which means handlers need to maintain control, clean up after dogs, and follow the posted dog-area regulations rather than treating the entire surrounding neighbourhood park as unrestricted space. The listed hours are <strong>7:00 a.m. to 11:00 p.m.</strong>, which is another concrete improvement over the generic copy.</p><p>For visitors, the main value of Mazenod Park is openness. If you prefer a simple community off-leash walk around water and lawn rather than a more structured fenced enclosure, this kind of retention-pond layout can work well. The tradeoff is that users should arrive expecting an unfenced shared environment and keep recall standards accordingly.</p><p>This update improves the page by replacing vague neighbourhood claims with the city&apos;s actual description: exact address, pond-centred off-leash layout, official hours, and Winnipeg&apos;s published rules context.</p>';
const notes =
  '<p>Primary source: City of Winnipeg off-leash areas directory at https://legacy.winnipeg.ca/publicworks/parksopenspace/OffLeashAreas/default.stm. Current city materials describe Mazenod as an unfenced off-leash area around the retention pond next to 2015 Mazenod Road and list hours of 7:00 a.m. to 11:00 p.m. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Mazenod Park Dog Off-Leash Area | Winnipeg',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'winnipeg', 'retention-pond', 'transcona', 'mazenod-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Mazenod Park Dog Off-Leash Area | Winnipeg',
  'Park type': 'Leash Free',
  Description:
    '<p>Mazenod Park is an official Winnipeg off-leash area surrounding a retention pond, offering an unfenced neighbourhood dog-walking space near 2015 Mazenod Road.</p>',
  'Street Address': '2015 Mazenod Road',
  latitude: '49.8726',
  longitude: '-97.0652',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, retention pond edge, and shared pathway',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'No dedicated dog fountain confirmed',
  Benches: 'Some park seating may be present - verify on arrival',
  'Shaded area': 'Minimal to moderate tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or nearby neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': '7:00 a.m. to 11:00 p.m.',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://legacy.winnipeg.ca/publicworks/parksopenspace/OffLeashAreas/default.stm',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=2015+Mazenod+Road+Winnipeg+MB',
  Tags: 'off-leash,winnipeg,retention-pond,transcona,mazenod-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'mazenod-park', {
  'Park Header': 'Mazenod Park Dog Off-Leash Area | Winnipeg',
  'Park type': 'Leash Free',
  Description:
    '<p>Mazenod Park is an official Winnipeg off-leash area surrounding a retention pond, offering an unfenced neighbourhood dog-walking space near 2015 Mazenod Road.</p>',
  'Street Address': '2015 Mazenod Road',
  latitude: '49.8726',
  longitude: '-97.0652',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass, retention pond edge, and shared pathway',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'No dedicated dog fountain confirmed',
  Benches: 'Some park seating may be present - verify on arrival',
  'Shaded area': 'Minimal to moderate tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Street or nearby neighbourhood access - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': '7:00 a.m. to 11:00 p.m.',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://legacy.winnipeg.ca/publicworks/parksopenspace/OffLeashAreas/default.stm',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=2015+Mazenod+Road+Winnipeg+MB',
  Tags: 'off-leash,winnipeg,retention-pond,transcona,mazenod-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Mazenod Park,/dog-parks/mazenod-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/mazenod-park/"') ||
    row.join(',').includes(',/dog-parks/mazenod-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Mazenod Park record and refreshed backlog files.');
