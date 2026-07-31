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
const park = parks.find((entry) => entry.slug === 'woodsworth-park');

if (!park) {
  throw new Error('Woodsworth Park record not found');
}

const seoTitle = 'Woodsworth Park | Winnipeg Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Woodsworth Park in Winnipeg, including the official 1850 Hekla Avenue off-leash location, access north of the parking lot, city hours, and a current 2026 athletic-field treatment notice nearby.';
const intro =
  '<p>Woodsworth Park is one of Winnipeg&apos;s official off-leash areas, located at <strong>1850 Hekla Avenue</strong> with the dog area set <strong>north of the parking lot</strong> in a broad open park setting.</p>';
const body =
  '<p>Winnipeg&apos;s current off-leash areas page confirms Woodsworth Park as an official city-recognized off-leash site and gives clearer location detail than the older thin page. The city lists the off-leash area at <strong>1850 Hekla Avenue</strong> and specifies that it sits <strong>north of the parking lot</strong>. That matters because it helps visitors distinguish the dog area from the rest of the park rather than treating the whole site as automatically off leash.</p><p>The city&apos;s current rules page also sets the baseline expectations for using Winnipeg off-leash spaces. Winnipeg says dogs must be under control, handlers must clean up after them, and dog owners are responsible for the behaviour of their animals. The city also lists standard park access hours for off-leash areas as <strong>7 a.m. to 11 p.m.</strong>, which is more useful than the vague older copy about a peaceful neighbourhood setting.</p><p>There is also a current city notice relevant to this park. Winnipeg&apos;s pesticide notice for <strong>2026 ground squirrel management</strong> lists <strong>Woodsworth athletic fields</strong> among the sites scheduled for treatment between <strong>April 7, 2026 and October 30, 2026</strong>, weather permitting. That notice is not specific to the off-leash area itself, but it is still relevant context because Woodsworth is a larger municipal park and visitors should expect city signage or temporary activity around treated field areas during the posted period.</p><p>For users, the practical summary is straightforward: Woodsworth Park is a legitimate official Winnipeg off-leash stop with a simple open layout and easy parking reference point, but it should still be approached as a managed city park with posted rules, defined off-leash boundaries, and current municipal maintenance notices that may affect nearby sections of the site.</p>';
const notes =
  '<p>Primary sources: https://legacy.winnipeg.ca/publicworks/parksopenspace/OffLeashAreas/default.stm and https://legacy.winnipeg.ca/cms/animal/other/park.stm. Supporting source: https://legacy.winnipeg.ca/publicworks/insectcontrol/pesticides/2026GroundSquirrels.stm. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Woodsworth Park | Winnipeg Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'winnipeg', 'open-area', 'hekla-avenue'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Woodsworth Park | Winnipeg Off-Leash Area',
  'Park type': 'Leash Free',
  Description:
    '<p>Woodsworth Park is an official Winnipeg off-leash area at 1850 Hekla Avenue, located north of the parking lot in a broad open municipal park setting.</p>',
  'Street Address': '1850 Hekla Avenue',
  'Surface type': 'Open grass and natural park terrain',
  Size: 'Large open off-leash area',
  'Water source available': 'No city-confirmed water source',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Limited',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': '7 a.m. to 11 p.m.',
  'Seasonal Restrictions': 'Check posted city notices and nearby athletic-field treatment signage',
  'Park Website or Source': 'https://legacy.winnipeg.ca/publicworks/parksopenspace/OffLeashAreas/default.stm',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1850+Hekla+Avenue+Winnipeg+MB',
  Tags: 'off-leash,winnipeg,open-area,hekla-avenue',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'woodsworth-park', {
  'Park Header': 'Woodsworth Park | Winnipeg Off-Leash Area',
  'Park type': 'Leash Free',
  Description:
    '<p>Woodsworth Park is an official Winnipeg off-leash area at 1850 Hekla Avenue, located north of the parking lot in a broad open municipal park setting.</p>',
  'Street Address': '1850 Hekla Avenue',
  'Surface type': 'Open grass and natural park terrain',
  Size: 'Large open off-leash area',
  'Water source available': 'No city-confirmed water source',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Limited',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': '7 a.m. to 11 p.m.',
  'Seasonal Restrictions': 'Check posted city notices and nearby athletic-field treatment signage',
  'Park Website or Source': 'https://legacy.winnipeg.ca/publicworks/parksopenspace/OffLeashAreas/default.stm',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1850+Hekla+Avenue+Winnipeg+MB',
  Tags: 'off-leash,winnipeg,open-area,hekla-avenue',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Woodsworth Park,/dog-parks/woodsworth-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/woodsworth-park/"') ||
    row.join(',').includes(',/dog-parks/woodsworth-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Woodsworth Park record and refreshed backlog files.');
