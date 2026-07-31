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
const park = parks.find((entry) => entry.slug === 'bearspaw-off-leash-area');

if (!park) {
  throw new Error('Bearspaw Off-Leash Area record not found');
}

const seoTitle = 'Bearspaw Off-Leash Area | Edmonton Dog Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Bearspaw Off-Leash Area in Edmonton, including official off-leash status, open corridor setting, city rules, and current July 2026 reclamation work affecting the Bearspaw and Keheewin sites.';
const intro =
  '<p>Bearspaw Off-Leash Area is one of Edmonton&apos;s official designated off-leash sites, serving southwest Edmonton with an <strong>open utility-corridor setting</strong>, <strong>shared-use park access</strong>, and current city-managed reclamation work that owners should check before visiting.</p>';
const body =
  '<p>Edmonton&apos;s current off-leash sites page confirms Bearspaw as an official designated off-leash area rather than an informal dog walking space. That matters because Edmonton&apos;s rules are boundary-based: dogs may be loose only inside designated off-leash areas, and the city says dogs must be leashed when entering or leaving posted off-leash boundaries. For Bearspaw users, the practical takeaway is simple: treat the site as part of Edmonton&apos;s regulated off-leash network, not as a general neighbourhood green space where off-leash use is assumed everywhere.</p><p>The setting is different from Edmonton&apos;s large ravine or river-valley parks. Bearspaw functions more like a broad neighbourhood off-leash corridor, with open sightlines and a simpler layout than destination parks such as Terwillegar or Hermitage. That makes it useful for local exercise, recall practice, and shorter everyday visits, but it also means owners should expect shared use and fewer destination-style amenities than at some of Edmonton&apos;s flagship sites.</p><p>There is also a current operations note that improves this page materially. On <strong>July 10, 2026</strong>, the City of Edmonton posted an update that the <strong>Bearspaw and Keheewin off-leash areas remain closed while EPCOR completes stormwater rehabilitation work</strong>, with the city then carrying out reclamation before reopening. That is the kind of time-sensitive factual detail a thin evergreen profile usually misses. If you are planning a visit, Bearspaw should be treated as an official site with current project risk, and it is worth checking the city&apos;s latest off-leash notices before you go.</p><p>Edmonton&apos;s broader off-leash rules still apply once the area is open. The city says owners are responsible for their dog&apos;s behaviour, dogs must remain in sight, wildlife must not be chased, and all Edmonton parks are shared-use environments. The same municipal guidance also says dogs are not allowed on playgrounds, sports fields, or golf courses, and Edmonton&apos;s Responsible Pet Ownership page says dogs are not allowed to be loose unless they are on private property or in a designated off-leash area. For Bearspaw, that means the value of the site comes from having legitimate designated access in southwest Edmonton, but only within the limits and notices the city currently posts.</p>';
const notes =
  '<p>Primary source: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites. Supporting source: https://www.edmonton.ca/residential_neighbours/service-updates/parks-capital-projects-construction. Reviewed on July 31, 2026.</p>';

Object.assign(park, {
  title: 'Bearspaw Off-Leash Area | Edmonton Dog Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'edmonton', 'open-area', 'southwest-edmonton'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Bearspaw Off-Leash Area | Edmonton Dog Park Guide',
  Description:
    '<p>Bearspaw Off-Leash Area is an official Edmonton off-leash site in southwest Edmonton, currently subject to city-posted closure and reclamation updates tied to Bearspaw and Keheewin stormwater rehabilitation work.</p>',
  'Park type': 'Leash Free',
  'Street Address': '110 Street NW & 18 Avenue NW',
  latitude: '53.4357',
  longitude: '-113.5123',
  'Surface type': 'Open grass and natural utility-corridor terrain',
  Size: 'Neighbourhood off-leash corridor',
  'Water source available': 'No city-confirmed water source',
  Benches: 'Limited',
  'Shaded area': 'Limited to moderate depending on exact segment',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Street parking nearby',
  'Washrooms nearby': 'No city-confirmed washroom in current listing',
  'Operating hours': '5 a.m. to 11 p.m.',
  'Seasonal Restrictions': 'Check current city closure and reclamation notices before visiting',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites',
  'Google Maps Link': 'https://maps.google.com/?q=Bearspaw+Off-Leash+Area,+Edmonton,+AB',
  Tags: 'off-leash,edmonton,open-area,southwest-edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'bearspaw-off-leash-area', {
  'Park Header': 'Bearspaw Off-Leash Area | Edmonton Dog Park Guide',
  Description:
    '<p>Bearspaw Off-Leash Area is an official Edmonton off-leash site in southwest Edmonton, currently subject to city-posted closure and reclamation updates tied to Bearspaw and Keheewin stormwater rehabilitation work.</p>',
  'Park type': 'Leash Free',
  'Street Address': '110 Street NW & 18 Avenue NW',
  latitude: '53.4357',
  longitude: '-113.5123',
  'Surface type': 'Open grass and natural utility-corridor terrain',
  Size: 'Neighbourhood off-leash corridor',
  'Water source available': 'No city-confirmed water source',
  Benches: 'Limited',
  'Shaded area': 'Limited to moderate depending on exact segment',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Street parking nearby',
  'Washrooms nearby': 'No city-confirmed washroom in current listing',
  'Operating hours': '5 a.m. to 11 p.m.',
  'Seasonal Restrictions': 'Check current city closure and reclamation notices before visiting',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites',
  'Google Maps Link': 'https://maps.google.com/?q=Bearspaw+Off-Leash+Area,+Edmonton,+AB',
  Tags: 'off-leash,edmonton,open-area,southwest-edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-31',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Bearspaw Off-Leash Area,/dog-parks/bearspaw-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/bearspaw-off-leash-area/"') ||
    row.join(',').includes(',/dog-parks/bearspaw-off-leash-area/,'),
);

rebuildBacklogSummary();

console.log('Updated Bearspaw Off-Leash Area record and refreshed backlog files.');
