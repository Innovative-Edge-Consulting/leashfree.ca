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
const park = parks.find((entry) => entry.slug === 'confederation-park-burnaby');
if (!park) throw new Error('Confederation Park Burnaby record not found');

const seoTitle = 'Confederation Park | Burnaby Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Confederation Park in Burnaby, including the official fenced large- and small-dog enclosures, the 1.3 km off-leash trail north of Penzance Drive, year-round access, and current Burnaby dog rules.';
const intro =
  '<p>Confederation Park is one of Burnaby&apos;s more varied official dog off-leash sites, with <strong>2 fenced enclosures near the tennis courts</strong> and a <strong>1.3 kilometre off-leash loop trail</strong> north of Penzance Drive.</p>';
const body =
  '<p>Burnaby&apos;s current dog off-leash page gives Confederation Park much better structure than the older thin profile. The city says the park includes <strong>2 fenced dog enclosures</strong> near the tennis courts, one for <strong>large dogs</strong> and one for <strong>small dogs</strong>, both with <strong>year-round access</strong>. Burnaby also says there is a <strong>1.3 kilometre loop off-leash trail</strong> in the eastern portion of the park, north of Penzance Drive. That makes Confederation more versatile than a simple fenced run because it combines enclosed social space with a designated walking loop.</p><p>The broader park context matters too. Confederation Park is a busy North Burnaby destination with recreation amenities beyond the dog area, including sports facilities and community-use parkland. For dog owners, that means this is a shared municipal park where off-leash access is clearly designated rather than assumed across the whole site.</p><p>Burnaby&apos;s standard off-leash rules still apply. Dogs must be <strong>leashed before entering and after leaving</strong> the off-leash area, owners must <strong>keep a leash in hand</strong>, Burnaby allows a maximum of <strong>2 dogs per person</strong>, and aggressive dogs must be removed immediately. Those rules matter more at Confederation because the fenced enclosures and loop trail are embedded in a larger active park.</p><p>The practical summary is straightforward: Confederation Park is one of Burnaby&apos;s stronger everyday options because it offers both fenced play space and a city-recognized off-leash trail. The key improvement on this page is specificity: owners need to know that the official off-leash features are the two fenced enclosures and the northern loop trail, not a vague idea of dogs simply being welcome somewhere in the park.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas and Burnaby Animal Control Bylaw No. 7035. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Confederation Park | Burnaby Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'burnaby', 'fenced', 'small-dog-area', 'loop-trail'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Confederation Park | Burnaby Dog Off-Leash Area',
  Description:
    '<p>Confederation Park is an official Burnaby dog off-leash site with separate fenced enclosures for large and small dogs near the tennis courts, plus a 1.3 kilometre off-leash loop trail north of Penzance Drive.</p>',
  'Park type': 'Park',
  'Street Address': '250 Willingdon Avenue',
  latitude: '49.2803',
  longitude: '-123.0135',
  'Surface type': 'Grass, gravel, and loop-trail surface',
  Size: 'Neighbourhood park with fenced enclosures and trail loop',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover - verify exact enclosure shade on arrival',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Dawn to dusk year-round',
  'Seasonal Restrictions': 'Year-round access; check posted park notices on arrival',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=250+Willingdon+Avenue+Burnaby+BC',
  Tags: 'off-leash,burnaby,fenced,small-dog-area,loop-trail',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'confederation-park-burnaby', {
  'Park Header': 'Confederation Park | Burnaby Dog Off-Leash Area',
  Description:
    '<p>Confederation Park is an official Burnaby dog off-leash site with separate fenced enclosures for large and small dogs near the tennis courts, plus a 1.3 kilometre off-leash loop trail north of Penzance Drive.</p>',
  'Park type': 'Park',
  'Street Address': '250 Willingdon Avenue',
  latitude: '49.2803',
  longitude: '-123.0135',
  'Surface type': 'Grass, gravel, and loop-trail surface',
  Size: 'Neighbourhood park with fenced enclosures and trail loop',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover - verify exact enclosure shade on arrival',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Dawn to dusk year-round',
  'Seasonal Restrictions': 'Year-round access; check posted park notices on arrival',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=250+Willingdon+Avenue+Burnaby+BC',
  Tags: 'off-leash,burnaby,fenced,small-dog-area,loop-trail',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Confederation Park,/dog-parks/confederation-park-burnaby/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/confederation-park-burnaby/"') ||
    row.join(',').includes(',/dog-parks/confederation-park-burnaby/,'),
);

rebuildBacklogSummary();

console.log('Updated Confederation Park Burnaby record and refreshed backlog files.');
