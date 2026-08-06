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
const park = parks.find((entry) => entry.slug === 'silverwood-dog-park');
if (!park) throw new Error('Silverwood record not found');

const seoTitle = 'Silverwood Dog Park | Saskatoon | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Silverwood Dog Park in Saskatoon, including its official off-leash status, naturalized setting beside Silverwood Golf Course, shared asphalt pathway, and 2026 north-entrance construction impacts.';
const intro =
  '<p>Silverwood Dog Park is one of Saskatoon&apos;s official <strong>naturalized off-leash dog parks</strong>, located beside the <strong>northeast edge of Silverwood Golf Course</strong> with a shared asphalt pathway running through the site.</p>';
const body =
  '<p>Saskatoon&apos;s current dog-park page confirms that <strong>Silverwood Dog Park</strong> is one of the city&apos;s official off-leash areas rather than an informal open space. The city describes its dog parks as naturalized places where dogs may be off leash while remaining under the control of their owner, and a <strong>valid dog licence</strong> is required for access.</p><p>The city&apos;s older park-opening information adds a location detail that is genuinely useful for this page: Silverwood sits <strong>adjacent to the northeast edge of Silverwood Golf Course</strong>. That framing is more accurate than the old generic copy because it explains the park&apos;s open, naturalized character without inventing amenities the city does not actually list.</p><p>Silverwood also has a specific circulation feature that matters to visitors. Saskatoon announced that <strong>new shared-pathway signs and centre-line markings</strong> were being installed in <strong>spring 2024</strong> because the park includes an <strong>asphalt pathway shared by pedestrians, cyclists, dogs, and their owners</strong>. That means visitors should expect mixed use and follow the posted markings rather than treating the full paved path as a free-run zone.</p><p>There is also current access context that belongs on the page. The city says that during the <strong>2026 construction season</strong>, work tied to the <strong>Biosolids Pipeline Corridor Project</strong> affects parts of Silverwood Dog Park, including the <strong>north entrance</strong>, with fencing, directional signage, and detours in place while drilling and trenching work proceeds. As of <strong>August 6, 2026</strong>, that is current trip-planning information, not historical background.</p><p>This update replaces vague filler with source-backed details that help a real visitor: official Saskatoon status, golf-course-adjacent setting, shared asphalt pathway operations, valid-licence requirement, and the live 2026 construction impact at the north entrance.</p>';
const notes =
  '<p>Primary sources: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks for official dog-park status, 2024 shared-pathway signage and markings, licensing requirements, and the current 2026 construction notice; https://www.saskatoon.ca/services-residents/power-water-sewer/wastewater/biosolids-pipeline-corridor-project for project-specific construction details affecting the north entrance during the 2026 season; and the City of Saskatoon news release dated November 29, 2017 confirming Silverwood as adjacent to the northeast edge of Silverwood Golf Course. Reviewed on August 6, 2026.</p>';

Object.assign(park, {
  title: 'Silverwood Dog Park | Saskatoon',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'saskatoon', 'silverwood-dog-park', 'shared-pathway', 'construction-advisory'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Silverwood Dog Park | Saskatoon',
  'Park type': 'Leash Free',
  Description:
    '<p>Silverwood Dog Park is an official Saskatoon off-leash area beside Silverwood Golf Course with a shared asphalt pathway and a current 2026 north-entrance construction advisory.</p>',
  'Street Address': 'Adjacent to the northeast edge of Silverwood Golf Course, Saskatoon',
  latitude: '52.1693',
  longitude: '-106.6563',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Naturalized grass and dirt with a shared asphalt pathway',
  Size: 'Large naturalized dog park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current access and detours on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted detours and construction signage during the 2026 season',
  'Park Website or Source': 'https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Silverwood+Dog+Park+Saskatoon+SK',
  Tags: 'off-leash,saskatoon,silverwood-dog-park,shared-pathway,construction-advisory',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'silverwood-dog-park', {
  'Park Header': 'Silverwood Dog Park | Saskatoon',
  'Park type': 'Leash Free',
  Description:
    '<p>Silverwood Dog Park is an official Saskatoon off-leash area beside Silverwood Golf Course with a shared asphalt pathway and a current 2026 north-entrance construction advisory.</p>',
  'Street Address': 'Adjacent to the northeast edge of Silverwood Golf Course, Saskatoon',
  latitude: '52.1693',
  longitude: '-106.6563',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Naturalized grass and dirt with a shared asphalt pathway',
  Size: 'Large naturalized dog park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Verify current access and detours on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Follow posted detours and construction signage during the 2026 season',
  'Park Website or Source': 'https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Silverwood+Dog+Park+Saskatoon+SK',
  Tags: 'off-leash,saskatoon,silverwood-dog-park,shared-pathway,construction-advisory',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-06',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Silverwood Dog Park,/dog-parks/silverwood-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/silverwood-dog-park/"') ||
    row.join(',').includes(',/dog-parks/silverwood-dog-park/,'),
);

rebuildBacklogSummary();

console.log('Updated Silverwood record and refreshed backlog files.');
