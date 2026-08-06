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
  return rows
    .map((row) =>
      row
        .map((field = '') => {
          const text = String(field);
          const escaped = text.replace(/"/g, '""');
          return /[",\n\r]/.test(text) ? `"${escaped}"` : escaped;
        })
        .join(','),
    )
    .join('\n') + '\n';
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
const park = parks.find((entry) => entry.slug === 'jinkerson-dog-park');
if (!park) throw new Error('Jinkerson record not found');

const seoTitle = 'Jinkerson Park Dog Off-Leash Area | Chilliwack | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Jinkerson Park in Chilliwack, including the big- and small-dog off-leash areas, Promontory location, pump track, MUGA, playgrounds, trails, outdoor fitness, and drinking fountain.';
const intro =
  '<p>Jinkerson Park is one of Chilliwack&apos;s official <strong>dog off-leash parks</strong>, with <strong>separate big- and small-dog areas</strong> inside a larger Promontory neighbourhood park that also includes trails, playgrounds, a pump track, and a multi-use game area.</p>';
const body =
  '<p>The City of Chilliwack&apos;s current off-leash page clearly confirms that <strong>Jinkerson Park</strong> is one of the municipality&apos;s designated dog off-leash locations. That makes this a legitimate city-backed destination rather than just a generic fenced lawn.</p><p>The current park profile adds the specific detail that was missing from the old thin copy. Chilliwack says Jinkerson Park is located in the <strong>Promontory neighbourhood</strong> and includes roughly <strong>600 metres of walking trails</strong>, <strong>outdoor fitness equipment</strong>, <strong>multiple playgrounds</strong>, a <strong>MUGA</strong>, a <strong>pump track</strong>, <strong>off-leash dog areas for big and small dogs</strong>, and a <strong>drinking fountain</strong>. That combination matters because it frames Jinkerson as a true multi-use neighbourhood destination rather than an isolated dog-only parcel.</p><p>The city&apos;s 2024 project announcements add useful context. Chilliwack publicly noted the addition of the <strong>Jinkerson Park pump track</strong>, the <strong>new MUGA</strong>, and the newer <strong>dog off-leash area</strong> improvements. A city press release on <strong>May 17, 2024</strong> also confirmed that both Jinkerson Park and Fairfield Park now feature <strong>dedicated large-dog and small-dog areas</strong>. That helps set a more accurate expectation for visitors with smaller or less confident dogs.</p><p>This update improves the page by replacing vague copy with the city&apos;s actual park profile: official off-leash status, split dog areas, Promontory location, 600 metres of trails, playgrounds, outdoor fitness, MUGA, pump track, and drinking fountain. That is what makes the page useful for real trip planning.</p>';
const notes =
  '<p>Primary sources: https://www.chilliwack.com/main/page.cfm?id=2579 for the city&apos;s official off-leash list, https://www.chilliwack.com/main/page.cfm?backTo=%26dowhat%3DamenityView%26paID%3D51%26plID%3D91&dowhat=locationView&id=1754&plID=67 for the current Jinkerson Park profile, and the City of Chilliwack press release dated May 17, 2024 confirming new big-dog and small-dog areas at Jinkerson Park. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Jinkerson Park Dog Off-Leash Area | Chilliwack',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'chilliwack', 'promontory', 'big-and-small-dog-areas', 'jinkerson-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Jinkerson Park Dog Off-Leash Area | Chilliwack',
  'Park type': 'Leash Free',
  Description:
    '<p>Jinkerson Park is an official Chilliwack off-leash destination in Promontory with separate big- and small-dog areas, 600 metres of trails, a pump track, MUGA, outdoor fitness equipment, and a drinking fountain.</p>',
  'Street Address': '5869 Jinkerson Road',
  latitude: '49.1125',
  longitude: '-121.8848',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'Yes',
  'Surface type': 'Grass dog areas and surrounding park trails',
  Size: 'Neighbourhood off-leash area within larger multi-use park',
  'Water source available': 'Yes - drinking fountain listed by city',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Neighbourhood or park access - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=2579',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=5869+Jinkerson+Road+Chilliwack+BC',
  Tags: 'off-leash,chilliwack,promontory,big-and-small-dog-areas,jinkerson-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'jinkerson-dog-park', {
  'Park Header': 'Jinkerson Park Dog Off-Leash Area | Chilliwack',
  'Park type': 'Leash Free',
  Description:
    '<p>Jinkerson Park is an official Chilliwack off-leash destination in Promontory with separate big- and small-dog areas, 600 metres of trails, a pump track, MUGA, outdoor fitness equipment, and a drinking fountain.</p>',
  'Street Address': '5869 Jinkerson Road',
  latitude: '49.1125',
  longitude: '-121.8848',
  Fenced: 'Yes',
  'Separate Small Dog Area': 'Yes',
  'Surface type': 'Grass dog areas and surrounding park trails',
  Size: 'Neighbourhood off-leash area within larger multi-use park',
  'Water source available': 'Yes - drinking fountain listed by city',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Neighbourhood or park access - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=2579',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=5869+Jinkerson+Road+Chilliwack+BC',
  Tags: 'off-leash,chilliwack,promontory,big-and-small-dog-areas,jinkerson-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Jinkerson Dog Park,/dog-parks/jinkerson-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/jinkerson-dog-park/"') ||
    row.join(',').includes(',/dog-parks/jinkerson-dog-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Jinkerson record and refreshed backlog files.');
