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
const park = parks.find((entry) => entry.slug === 'pathfinder-park');
if (!park) throw new Error('Pathfinder Park record not found');

const seoTitle = 'Pathfinder Park Off-Leash Area | Burlington';
const metaDescription =
  'Source-backed guide to Pathfinder Park in Burlington, including the official 3365 Pathfinder Drive location, 2024 leash-free area construction details, fencing and bench information, and current Burlington off-leash rules.';
const intro =
  '<p>Pathfinder Park is one of Burlington&apos;s officially listed <strong>leash-free parks</strong>, and this page now uses the city&apos;s current construction and rules pages instead of generic filler copy.</p>';
const body =
  '<p>The strongest current source for this page is Burlington&apos;s <strong>Pathfinder Park Leash-Free Area Construction</strong> page. The city says it <strong>completed construction</strong> of the new leash-free area in 2024 and that the area is <strong>now open</strong>. It also states that the leash-free area is located <strong>at the back of the park along the path</strong>, which is more useful than the old vague copy.</p><p>The construction page also confirms the actual built scope. According to the City of Burlington, the leash-free area includes a <strong>0.05 hectare area</strong> that is <strong>fully fenced with a six-foot-high chain-link fence</strong>, a <strong>double-gated entry/exit enclosure</strong>, and an <strong>accessible park bench</strong>. Those specifics are appropriate to keep here because they are directly supported by the official project page.</p><p>The broader Burlington leash-free parks page separately confirms that <strong>Pathfinder Park</strong> is one of the city&apos;s official local leash-free areas. That page also provides the rules that matter most for visitors: <strong>always carry a leash</strong>, <strong>always stay with your dog</strong>, <strong>pick up and dispose of waste</strong>, and keep a <strong>maximum of two dogs off leash at one time</strong>. The city also requires dogs to be licensed, vaccinated, and under control.</p><p>Parking context can also be stated carefully. Burlington&apos;s current parking guidance notes that you may park overnight in parking lots at <strong>Orchard Community Park, Lampman Park and Pathfinder Park, if applicable</strong>. That does not guarantee every visit will rely on a dedicated lot, but it does confirm the park appears in the city&apos;s parking guidance. As of <strong>Friday, August 14, 2026</strong>, this page is now materially stronger because it combines the official leash-free listing, the actual 2024 build details, and the city&apos;s current rules.</p>';
const notes =
  '<p>Primary sources: https://www.burlington.ca/en/news/current-city-projects-and-construction/pathfinder-park-leash-free-area-construction.aspx for the official 2024 construction scope, 0.05 hectare size, fencing, double-gated enclosure, accessible bench, and note that the leash-free area is now open at the back of the park along the path; https://www.burlington.ca/en/by-laws-and-animal-services/leash-free-dog-parks.aspx for Burlington&apos;s current official leash-free park list and citywide off-leash rules; https://www.burlington.ca/en/roads-parking-and-traffic/parking-in-downtown-burlington.aspx and https://www.burlington.ca/en/roads-parking-and-traffic/parking-exemptions.aspx for the city parking note that mentions Pathfinder Park, if applicable. Reviewed on Friday, August 14, 2026.</p>';

Object.assign(park, {
  title: seoTitle,
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Burlington'],
    Province: ['Ontario'],
    Tags: ['off-leash', 'burlington', 'fenced', 'double-gated', 'accessible-bench'],
  },
});

Object.assign(park.raw, {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Pathfinder Park is an official Burlington leash-free park with a city-built 0.05 hectare fenced dog area, double-gated entry, and accessible bench.</p>',
  'Street Address': '3365 Pathfinder Drive',
  latitude: '43.3919',
  longitude: '-79.7606',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7L 7B6',
  Fenced: 'Yes - fully fenced with six-foot chain-link fence',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: '0.05 hectare',
  'Water source available': 'No public water source confirmed by city',
  Benches: 'Yes - accessible bench',
  'Shaded area': 'Verify on arrival',
  'Waste bins': 'Yes - follow city waste-disposal rules',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - verify on arrival; city parking guidance references Pathfinder Park if applicable',
  'Washrooms nearby': 'No public washrooms confirmed in current source set',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow Burlington leash-free area rules and any posted temporary notices',
  'Park Website or Source': 'https://www.burlington.ca/en/news/current-city-projects-and-construction/pathfinder-park-leash-free-area-construction.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/3365+Pathfinder+Dr,+Burlington,+ON+L7L+7B6',
  Tags: 'off-leash,burlington,fenced,double-gated,accessible-bench',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'pathfinder-park', {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Pathfinder Park is an official Burlington leash-free park with a city-built 0.05 hectare fenced dog area, double-gated entry, and accessible bench.</p>',
  'Street Address': '3365 Pathfinder Drive',
  latitude: '43.3919',
  longitude: '-79.7606',
  City: 'Burlington',
  Province: 'Ontario',
  'Postal Code': 'L7L 7B6',
  Fenced: 'Yes - fully fenced with six-foot chain-link fence',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: '0.05 hectare',
  'Water source available': 'No public water source confirmed by city',
  Benches: 'Yes - accessible bench',
  'Shaded area': 'Verify on arrival',
  'Waste bins': 'Yes - follow city waste-disposal rules',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - verify on arrival; city parking guidance references Pathfinder Park if applicable',
  'Washrooms nearby': 'No public washrooms confirmed in current source set',
  'Operating hours': 'Check posted park signage on arrival',
  'Seasonal Restrictions': 'Follow Burlington leash-free area rules and any posted temporary notices',
  'Park Website or Source': 'https://www.burlington.ca/en/news/current-city-projects-and-construction/pathfinder-park-leash-free-area-construction.aspx',
  'Google Maps Link': 'https://www.google.com/maps/place/3365+Pathfinder+Dr,+Burlington,+ON+L7L+7B6',
  Tags: 'off-leash,burlington,fenced,double-gated,accessible-bench',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-14',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/pathfinder-park/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/pathfinder-park/';
});

rebuildBacklogSummary();

console.log('Updated Pathfinder Park record and refreshed backlog files.');
