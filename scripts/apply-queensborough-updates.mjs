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
const park = parks.find((entry) => entry.slug === 'queensborough-new-westminster');

if (!park) {
  throw new Error('Queensborough record not found');
}

const seoTitle = 'Queensborough Dog Off-Leash Area | New Westminster | LeashFree.ca';
const metaDescription =
  'Source-backed guide to the Queensborough off-leash area in New Westminster, including its Ryall Park location, 2018 relocation, 933-square-metre size, fencing, gates, fountain, and city rules.';
const intro =
  '<p>The Queensborough dog off-leash area is one of New Westminster&apos;s official fenced dog parks, located in <strong>Ryall Park</strong> between the <strong>Boro All Wheel Park</strong> and <strong>Ewen Avenue</strong>.</p>';
const body =
  '<p>New Westminster&apos;s current off-leash page gives Queensborough much stronger detail than the older thin record used. The city says the current Queensborough dog off-leash area is located in <strong>Ryall Park</strong>, specifically between the <strong>Boro All Wheel Park</strong> and <strong>Ewen Avenue</strong>. It also says the facility was <strong>relocated there in 2018</strong> to create a better experience for dogs and owners. That historical detail matters because it clarifies that the present layout is a deliberately improved municipal site, not just an older leftover enclosure.</p><p>The city also publishes unusually practical amenity detail. New Westminster lists the off-leash area size as <strong>933 square metres</strong> and says it supports <strong>dogs of all sizes</strong>. It confirms <strong>wood-chip and grass</strong> surfacing, <strong>double safety gates</strong>, a <strong>drinking fountain</strong>, <strong>waste receptacles</strong>, and <strong>bag-recycling dispensers</strong>. That is a better and more precise picture than the old page&apos;s vague gravel-only description.</p><p>The rule context comes from the same city source. New Westminster says dogs must be accompanied by and under the control of their owner, off-leash use is permitted <strong>within the fenced area only</strong>, owners must <strong>pick up after dogs</strong> and <strong>fill any holes they dig</strong>, and smoking is prohibited in or within 15 metres of the fenced area. The city also says aggressive dogs must be muzzled and removed if they show aggression, and vicious dogs are not permitted within the fenced area. Those specifics materially improve the quality and usefulness of the page.</p><p>The practical summary is straightforward: Queensborough is a legitimate, city-managed New Westminster off-leash area with fencing, safety gates, mixed surfacing, and better published amenity detail than many other municipal pages provide. It works best as a contained neighbourhood dog park within the broader Ryall Park setting.</p>';
const notes =
  '<p>Primary source: https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas. Reviewed on August 2, 2026.</p>';

Object.assign(park, {
  title: 'Queensborough Dog Off-Leash Area | New Westminster',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'new-westminster', 'queensborough', 'ryall-park', 'fenced'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Queensborough Dog Off-Leash Area | New Westminster',
  'Park type': 'Leash Free',
  Description:
    '<p>Queensborough is an official fenced New Westminster off-leash area in Ryall Park, relocated in 2018 and equipped with double safety gates, a drinking fountain, waste receptacles, and bag-recycling dispensers.</p>',
  'Street Address': 'Ryall Park, between Boro All Wheel Park and Ewen Avenue',
  latitude: '49.1873',
  longitude: '-122.9428',
  'Surface type': 'Wood chips and grass',
  Size: '933 square metres',
  'Water source available': 'Yes - drinking fountain',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Yes - waste receptacles',
  'Bag Dispensers': 'Yes - bag-recycling dispensers',
  'Parking Available': 'Nearby park access - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city notices and park rules',
  'Park Website or Source': 'https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Ryall+Park+Ewen+Avenue+New+Westminster+BC',
  Tags: 'off-leash,new-westminster,queensborough,ryall-park,fenced',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'queensborough-new-westminster', {
  'Park Header': 'Queensborough Dog Off-Leash Area | New Westminster',
  'Park type': 'Leash Free',
  Description:
    '<p>Queensborough is an official fenced New Westminster off-leash area in Ryall Park, relocated in 2018 and equipped with double safety gates, a drinking fountain, waste receptacles, and bag-recycling dispensers.</p>',
  'Street Address': 'Ryall Park, between Boro All Wheel Park and Ewen Avenue',
  latitude: '49.1873',
  longitude: '-122.9428',
  'Surface type': 'Wood chips and grass',
  Size: '933 square metres',
  'Water source available': 'Yes - drinking fountain',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Yes - waste receptacles',
  'Bag Dispensers': 'Yes - bag-recycling dispensers',
  'Parking Available': 'Nearby park access - verify on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city notices and park rules',
  'Park Website or Source': 'https://www.newwestcity.ca/parks-and-recreation/parks/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Ryall+Park+Ewen+Avenue+New+Westminster+BC',
  Tags: 'off-leash,new-westminster,queensborough,ryall-park,fenced',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-02',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Queensborough,/dog-parks/queensborough-new-westminster/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/queensborough-new-westminster/"') ||
    row.join(',').includes(',/dog-parks/queensborough-new-westminster/,'),
);

rebuildBacklogSummary();

console.log('Updated Queensborough record and refreshed backlog files.');
