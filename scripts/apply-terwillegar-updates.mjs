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

const parks = JSON.parse(fs.readFileSync(parksPath, 'utf8'));
const park = parks.find((entry) => entry.slug === 'terwillegar-off-leash-dog-park');

if (!park) {
  throw new Error('Terwillegar Off-Leash Dog Park record not found');
}

const seoTitle = 'Terwillegar Off-Leash Dog Park | Edmonton Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Terwillegar Off-Leash Dog Park in Edmonton, including the official Rabbit Hill Road location, river valley trails, footbridge access, hours, amenities, and current off-leash rules.';
const intro =
  '<p>Terwillegar Off-Leash Dog Park is Edmonton&apos;s largest river-valley off-leash destination, with expansive natural terrain on the <strong>south bank of the North Saskatchewan River</strong> at <strong>10 Rabbit Hill Road</strong>.</p>';
const body =
  '<p>The City of Edmonton describes Terwillegar Park as a river valley park at the end of Rabbit Hill Road with <strong>numerous multi-use trails</strong> and an <strong>expansive off-leash area</strong>. That official description is more useful than the old thin copy because it tells visitors exactly what kind of outing to expect: a large, unfenced natural area with rolling open space, forested sections, and trail connections rather than a small enclosed run.</p><p>The park&apos;s location on the south bank of the North Saskatchewan River is one of its biggest strengths. The city also highlights the <strong>262-metre Terwillegar Park Footbridge</strong>, which links this side of the river to Jan Reimer Park. For dog owners, that creates a longer walking loop and adds real navigational context. It also comes with one important rule from the footbridge page: <strong>dogs must be leashed on the footbridge</strong> and in Oleskiw River Valley Park, even though the off-leash areas within Terwillegar Park remain unchanged.</p><p>The current city pages also fill in practical details that thin directory pages usually miss. Official park hours are <strong>5am to 11pm</strong>. The listed amenities include <strong>parking</strong>, a <strong>portable toilet</strong>, <strong>walking, hiking and mountain biking trails</strong>, and a <strong>canoe hand launch</strong> near the parking area. Accessibility notes say gravel parking stalls lead to a gravel path, and there is a paved trail from the south edge of the parking lot toward the footbridge.</p><p>Edmonton&apos;s off-leash rules are worth knowing before arrival. The city says dogs must be leashed when entering and leaving off-leash boundaries, owners must keep dogs under control and in sight, wildlife should not be chased, and waste must be cleaned up immediately. The city also requires dogs to be licensed, and vicious dogs are not permitted in off-leash areas. Together, those details turn this page into a source-backed guide that better reflects how Terwillegar is actually used.</p>';
const notes =
  '<p>Primary sources: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/terwillegar-park, https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites, and https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/terwillegar-park-footbridge. Supporting source: https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/pet-licences-for-residents. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Terwillegar Off-Leash Dog Park | Edmonton Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'river-valley', 'trails', 'footbridge', 'edmonton'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Terwillegar Off-Leash Dog Park | Edmonton Dog Park',
  Description:
    '<p>Terwillegar Off-Leash Dog Park is a large natural river-valley off-leash area in Edmonton with trails, footbridge access, and open terrain beside the North Saskatchewan River.</p>',
  'Park type': 'Park',
  'Street Address': '10 Rabbit Hill Road',
  latitude: '53.4794',
  longitude: '-113.5929',
  'Surface type': 'Natural grass, dirt, and multi-use river valley trails',
  Size: 'Very large natural off-leash area',
  'Water source available': 'River access present; potable dog water not confirmed',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Yes - tree cover along parts of the trail system',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Portable toilet',
  'Operating hours': '5am-11pm',
  'Seasonal Restrictions': 'Check posted city notices and trail conditions',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/terwillegar-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=10+Rabbit+Hill+Road+Edmonton+AB',
  Tags: 'off-leash,river-valley,trails,footbridge,edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'terwillegar-off-leash-dog-park', {
  'Park Header': 'Terwillegar Off-Leash Dog Park | Edmonton Dog Park',
  Description:
    '<p>Terwillegar Off-Leash Dog Park is a large natural river-valley off-leash area in Edmonton with trails, footbridge access, and open terrain beside the North Saskatchewan River.</p>',
  'Park type': 'Park',
  'Street Address': '10 Rabbit Hill Road',
  latitude: '53.4794',
  longitude: '-113.5929',
  'Surface type': 'Natural grass, dirt, and multi-use river valley trails',
  Size: 'Very large natural off-leash area',
  'Water source available': 'River access present; potable dog water not confirmed',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Yes - tree cover along parts of the trail system',
  'Waste bins': 'Yes - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Portable toilet',
  'Operating hours': '5am-11pm',
  'Seasonal Restrictions': 'Check posted city notices and trail conditions',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/terwillegar-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=10+Rabbit+Hill+Road+Edmonton+AB',
  Tags: 'off-leash,river-valley,trails,footbridge,edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Terwillegar Off-Leash Dog Park,/dog-parks/terwillegar-off-leash-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/terwillegar-off-leash-dog-park/"') || row.join(',').includes(',/dog-parks/terwillegar-off-leash-dog-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 596 pages in the current working queue.', 'This backlog contains 595 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 235 |', '| T2-high-value-expansion | 234 |');
summary = summary.replace('| Dog Parks | 423 |', '| Dog Parks | 422 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Terwillegar Off-Leash Dog Park record and refreshed backlog files.');
