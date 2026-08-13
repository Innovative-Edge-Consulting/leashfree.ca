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
const park = parks.find((entry) => entry.slug === 'barnet-marine-park-burnaby');
if (!park) throw new Error('Barnet Marine Park record not found');

const seoTitle = 'Barnet Marine Park Off-Leash Area | Burnaby';
const metaDescription =
  'Source-backed guide to Barnet Marine Park in Burnaby, including the designated year-round off-leash area, leash-required zones elsewhere in the park, no-dogs beach rule, parking restrictions, accessible washrooms, and waterfront trail setting.';
const intro =
  '<p>Barnet Marine Park is a <strong>Burnaby waterfront park at 8181 Barnet Rd</strong> with a <strong>designated dog off-leash area</strong>, but dogs must stay <strong>leashed everywhere else in the park</strong> and are <strong>not allowed on the beach</strong>.</p>';
const body =
  '<p>The old page got the general setting right but it overstated access by implying dogs could freely use the shoreline. Burnaby&apos;s current park page is more precise: Barnet Marine Park has a <strong>designated dog off-leash area</strong>, and the city asks visitors to keep dogs <strong>leashed everywhere else in the park</strong>. The city also states clearly that <strong>dogs aren&apos;t allowed on the beach for sanitary reasons</strong>.</p><p>Burnaby&apos;s dedicated off-leash areas page adds the timing and use rules that belong on the profile. The city says seasonal time restrictions on the trail and open area have been lifted, and Barnet Marine Park&apos;s off-leash area is now open <strong>year-round from dawn until dusk</strong>. That page also confirms the address as <strong>8181 Barnet Rd</strong>.</p><p>The broader park page gives strong visitor context beyond the dog area. Barnet Marine Park sits on <strong>Burrard Inlet</strong> with ocean and mountain views, a shoreline walk, fishing access, canoe and kayak beach access, and trails that are either <strong>paved or crushed limestone</strong>. It also notes that <strong>accessible washrooms are located in the concession building and are open year-round</strong>.</p><p>There is also current access information worth preserving. As of <strong>Thursday, August 13, 2026</strong>, Burnaby says traffic control is in effect from <strong>May through September between 11 am and 4 pm</strong>, and parking restrictions apply from <strong>May 1 to September 30</strong> on weekends and holidays at multiple lots because Barnet Marine Park is one of Burnaby&apos;s busiest summer destinations. This update improves the page by replacing generic beach-access wording with the city&apos;s actual off-leash rules and trip-planning details.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/parks/barnet-marine-park for the designated off-leash area, leash-required zones elsewhere in the park, no-dogs beach rule, paved and crushed-limestone trails, year-round accessible washrooms in the concession building, parking restrictions, traffic-control notices, and address; and https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas for the year-round dawn-to-dusk off-leash timing and Barnet Marine Park off-leash listing. Reviewed on August 13, 2026.</p>';

Object.assign(park, {
  title: 'Barnet Marine Park Off-Leash Area | Burnaby',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Burnaby'],
    Province: ['British Columbia'],
    Tags: ['off-leash', 'burnaby', 'waterfront', 'burrard-inlet', 'dogs-not-on-beach'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Barnet Marine Park Off-Leash Area | Burnaby',
  'Park type': 'Leash Free',
  Description:
    '<p>Barnet Marine Park is a Burnaby waterfront park with a designated off-leash area open year-round from dawn to dusk, while dogs must stay leashed elsewhere in the park and are not allowed on the beach.</p>',
  'Street Address': '8181 Barnet Rd',
  latitude: '49.3009',
  longitude: '-122.9493',
  City: 'Burnaby',
  Province: 'British Columbia',
  'Postal Code': 'V5A 3G8',
  Fenced: 'Designated area - verify exact enclosure on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Grass, paved and crushed-limestone trail setting',
  Size: 'Designated off-leash area within larger waterfront park',
  'Water source available': 'Verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Yes - use designated bins',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - seasonal restrictions apply',
  'Washrooms nearby': 'Yes - accessible washrooms in concession building',
  'Operating hours': 'Off-leash area year-round from dawn to dusk; park opens at 7 am and closes at dusk October-April, variable closing May-September',
  'Seasonal Restrictions': 'Dogs not allowed on beach; parking and traffic controls apply May through September',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://maps.google.com/?q=Barnet+Marine+Park,+Burnaby,+BC',
  Tags: 'off-leash,burnaby,waterfront,burrard-inlet,dogs-not-on-beach',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'barnet-marine-park-burnaby', {
  'Park Header': 'Barnet Marine Park Off-Leash Area | Burnaby',
  'Park type': 'Leash Free',
  Description:
    '<p>Barnet Marine Park is a Burnaby waterfront park with a designated off-leash area open year-round from dawn to dusk, while dogs must stay leashed elsewhere in the park and are not allowed on the beach.</p>',
  'Street Address': '8181 Barnet Rd',
  latitude: '49.3009',
  longitude: '-122.9493',
  City: 'Burnaby',
  Province: 'British Columbia',
  'Postal Code': 'V5A 3G8',
  Fenced: 'Designated area - verify exact enclosure on arrival',
  'Separate Small Dog Area': 'No city-confirmed separate area',
  'Surface type': 'Grass, paved and crushed-limestone trail setting',
  Size: 'Designated off-leash area within larger waterfront park',
  'Water source available': 'Verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Yes - use designated bins',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - seasonal restrictions apply',
  'Washrooms nearby': 'Yes - accessible washrooms in concession building',
  'Operating hours': 'Off-leash area year-round from dawn to dusk; park opens at 7 am and closes at dusk October-April, variable closing May-September',
  'Seasonal Restrictions': 'Dogs not allowed on beach; parking and traffic controls apply May through September',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://maps.google.com/?q=Barnet+Marine+Park,+Burnaby,+BC',
  Tags: 'off-leash,burnaby,waterfront,burrard-inlet,dogs-not-on-beach',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/barnet-marine-park-burnaby/';
  },
);

removeCsvRow(
  reviewQueuePath,
  (row, header) => {
    const routeIndex = header.indexOf('route');
    return routeIndex !== -1 && row[routeIndex] === '/dog-parks/barnet-marine-park-burnaby/';
  },
);

rebuildBacklogSummary();

console.log('Updated Barnet Marine Park record and refreshed backlog files.');
