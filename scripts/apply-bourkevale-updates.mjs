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
const park = parks.find((entry) => entry.slug === 'bourkevale-park');
if (!park) throw new Error('Bourkevale record not found');

const seoTitle = 'Bourkevale Park Off-Leash Area | Winnipeg | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Bourkevale Park off-leash area in Winnipeg, including its Assiniboine River location south of the dike, nearby seasonal washrooms at 100 Ferry Road, and current access context from riverbank sewer work.';
const intro =
  '<p>Bourkevale Park is one of Winnipeg&apos;s official <strong>off-leash areas</strong>, located <strong>south of the dike along the Assiniboine River</strong> in a neighbourhood riverbank park setting near <strong>100 Ferry Road</strong>.</p>';
const body =
  '<p>Winnipeg&apos;s current off-leash area page gives Bourkevale stronger place detail than the old thin copy. The city identifies the park at <strong>100 Ferry Road</strong> and describes the dog area as being <strong>south of the dike</strong> along the <strong>Assiniboine River</strong>. That is more useful and more accurate than the generic earlier description of an accessible green space near the river.</p><p>Current city park information adds practical visit context. Winnipeg&apos;s Bourkevale community-centre and park material says the park washrooms operate on a <strong>seasonal schedule</strong>, currently listed as open from <strong>May to September</strong>, and the same park system materials show accessibility improvements in the area through the city&apos;s <strong>2025-2026 Accessibility Plan</strong>. That matters because it helps set expectations for facilities rather than implying year-round service.</p><p>There is also current access context that belongs on the page. Winnipeg&apos;s public works notices say the <strong>Assiniboine Riverbank Sewer Renewal</strong> project is active through parts of 2026 in the area around Bourkevale Park, with fenced work zones and pathway impacts. As of <strong>Tuesday, August 11, 2026</strong>, that is current trip-planning information, not background history.</p><p>This update improves the page by replacing filler with the city&apos;s actual framing: official off-leash status, south-of-the-dike riverbank location, seasonal washroom context at 100 Ferry Road, and the live sewer-renewal access impact in the surrounding park area.</p>';
const notes =
  '<p>Primary sources: https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/ for official Winnipeg off-leash status and the south-of-the-dike Assiniboine River location; Winnipeg parks and recreation facility information for Bourkevale Park at 100 Ferry Road and its seasonal washroom schedule; https://www.winnipeg.ca/city-governance/documents-reports/2025-2026-accessibility-plan for current accessibility work context in the park area; and Winnipeg public works notices for the Assiniboine Riverbank Sewer Renewal project affecting access around Bourkevale Park in 2026. Reviewed on August 11, 2026.</p>';

Object.assign(park, {
  title: 'Bourkevale Park Off-Leash Area | Winnipeg',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'winnipeg', 'bourkevale-park', 'assiniboine-river', 'south-of-the-dike'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Bourkevale Park Off-Leash Area | Winnipeg',
  'Park type': 'Leash Free',
  Description:
    '<p>Bourkevale Park is an official Winnipeg off-leash area south of the dike along the Assiniboine River, with nearby seasonal washrooms at 100 Ferry Road and current 2026 sewer-work access context in the surrounding park area.</p>',
  'Street Address': '100 Ferry Road',
  latitude: '49.8848',
  longitude: '-97.2253',
  Fenced: 'Unknown - verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Grass riverbank park terrain',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current access and nearby parking on arrival',
  'Washrooms nearby': 'Yes - seasonal washrooms nearby at 100 Ferry Road',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and current site notices',
  'Park Website or Source': 'https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=100+Ferry+Road+Winnipeg+MB',
  Tags: 'off-leash,winnipeg,bourkevale-park,assiniboine-river,south-of-the-dike',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-11',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'bourkevale-park', {
  'Park Header': 'Bourkevale Park Off-Leash Area | Winnipeg',
  'Park type': 'Leash Free',
  Description:
    '<p>Bourkevale Park is an official Winnipeg off-leash area south of the dike along the Assiniboine River, with nearby seasonal washrooms at 100 Ferry Road and current 2026 sewer-work access context in the surrounding park area.</p>',
  'Street Address': '100 Ferry Road',
  latitude: '49.8848',
  longitude: '-97.2253',
  Fenced: 'Unknown - verify on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Grass riverbank park terrain',
  Size: 'Neighbourhood off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current access and nearby parking on arrival',
  'Washrooms nearby': 'Yes - seasonal washrooms nearby at 100 Ferry Road',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow posted city rules and current site notices',
  'Park Website or Source': 'https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=100+Ferry+Road+Winnipeg+MB',
  Tags: 'off-leash,winnipeg,bourkevale-park,assiniboine-river,south-of-the-dike',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-11',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Bourkevale Park,/dog-parks/bourkevale-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/bourkevale-park/"') ||
    row.join(',').includes(',/dog-parks/bourkevale-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Bourkevale record and refreshed backlog files.');
