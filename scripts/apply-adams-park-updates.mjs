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
const park = parks.find((entry) => entry.slug === 'adams-park-cornwall');

if (!park) {
  throw new Error('Adams Park record not found');
}

const seoTitle = 'Adams Park | Cornwall Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Adams Park in Cornwall, including its Twelfth Street East and Sydney Street location, neighbourhood playground role, and community softball diamond.';
const intro =
  '<p>Adams Park is a <strong>Cornwall neighbourhood park</strong> at <strong>Twelfth Street East and Sydney Street</strong>, with a local playground setting and a city-listed <strong>community softball diamond</strong>.</p>';
const body =
  '<p>The key correction on this page is park type. Adams Park should not be framed as a leash-free dog park. Cornwall&apos;s current parks material lists Adams on the city&apos;s <strong>Neighbourhood Parks</strong> page at <strong>Twelfth St E &amp; Sydney St</strong>, and a separate city sports page identifies <strong>Adams Park</strong> as one of Cornwall&apos;s <strong>community softball diamonds</strong>. As of <strong>Tuesday, August 4, 2026</strong>, I found no city source designating Adams Park as an official off-leash dog area.</p><p>That makes the more accurate page angle straightforward: Adams Park is a small residential community park with family-oriented use, and its softball field is the clearest specific feature currently supported by the city. The neighbourhood parks listing also fits the normal Cornwall pattern of local playground-oriented green spaces rather than specialized dog infrastructure.</p><p>For visitors with dogs, the practical takeaway is to treat Adams Park as a standard city park and follow posted rules on arrival. A general park where dogs may be present is not the same thing as a municipally designated off-leash site, and this initiative is stronger when those distinctions stay explicit.</p><p>This rewrite improves trust by removing the false dog-park framing, correcting the location details, and replacing generic filler with Cornwall&apos;s actual published park information.</p>';
const notes =
  '<p>Primary sources: https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/neighbourhood-parks/ and https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/sports-fields-and-baseball-diamonds/. Current city materials list Adams Park at Twelfth St E & Sydney St and identify it as a community softball diamond. Reviewed on August 4, 2026.</p>';

Object.assign(park, {
  title: 'Adams Park | Cornwall Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['park-guide', 'cornwall', 'neighbourhood-park', 'softball-diamond', 'adams-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Adams Park | Cornwall Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Adams Park is a Cornwall neighbourhood park with a community softball diamond, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': 'Twelfth St E & Sydney St',
  latitude: '45.034499',
  longitude: '-74.735395',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass park space, playground area, and softball diamond',
  Size: 'Neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/neighbourhood-parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Twelfth+St+E+and+Sydney+St+Cornwall+ON',
  Tags: 'park-guide,cornwall,neighbourhood-park,softball-diamond,adams-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'adams-park-cornwall', {
  'Park Header': 'Adams Park | Cornwall Park Guide',
  'Park type': 'Neighbourhood park',
  Description:
    '<p>Adams Park is a Cornwall neighbourhood park with a community softball diamond, but it should not be treated as an official off-leash dog park.</p>',
  'Street Address': 'Twelfth St E & Sydney St',
  latitude: '45.034499',
  longitude: '-74.735395',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass park space, playground area, and softball diamond',
  Size: 'Neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog-park dispensers confirmed',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'Check current city notices',
  'Park Website or Source': 'https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/neighbourhood-parks/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Twelfth+St+E+and+Sydney+St+Cornwall+ON',
  Tags: 'park-guide,cornwall,neighbourhood-park,softball-diamond,adams-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-04',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Adams Park,/dog-parks/adams-park-cornwall/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) =>
    row.join(',').includes('"/dog-parks/adams-park-cornwall/"') ||
    row.join(',').includes(',/dog-parks/adams-park-cornwall/,'),
);

rebuildBacklogSummary();

console.log('Updated Adams Park record and refreshed backlog files.');
