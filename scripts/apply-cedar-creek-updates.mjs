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
const park = parks.find((entry) => entry.slug === 'cedar-creek-park-kelowna');

if (!park) {
  throw new Error('Cedar Creek Park record not found');
}

const seoTitle = 'Cedar Creek Park | Kelowna Off-Leash Dog Beach | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Cedar Creek Park in Kelowna, including the City of Kelowna listing at 5200 Lakeshore Rd, 7-hectare off-leash status, dog beach and swim access, trails, boat launch, and limited parking notes.';
const intro =
  '<p>Cedar Creek Park is a City of Kelowna off-leash park at <strong>5200 Lakeshore Rd</strong> with a published area of <strong>7.00 hectares</strong>, lake access, trails, and one of the city&apos;s best-known off-leash dog beach settings.</p>';
const body =
  "<p>The current City of Kelowna listing makes Cedar Creek much stronger than the older thin version of this page. Officially, Cedar Creek Park is a <strong>park</strong> with <strong>off-leash</strong> dog status, not just a narrow beach access point. The city lists a broad amenity set here: <strong>beach area</strong>, <strong>swimming area</strong>, <strong>trails</strong>, and a <strong>boat launch</strong>. That matters because visitors are not choosing between a generic dog park and a generic beach. They are getting a larger mixed-use waterfront park where off-leash dogs are a central part of the experience.</p><p>The city goes further and actively promotes Cedar Creek as the <strong>biggest off-leash dog beach in Kelowna</strong>. Its own description highlights mountain views over Okanagan Lake, a place for dogs to cool off in the water on hot days, picnic tables by the lake, and a <strong>large off-leash field</strong> for exercise and socialization. That combination of shoreline access plus open grassy space is what sets Cedar Creek apart from smaller urban dog areas. It is useful both for dogs that love swimming and for owners who want more room than a fenced neighbourhood run can provide.</p><p>There are also practical details worth keeping in the page because they help people plan real visits. Kelowna&apos;s boat-launch page says the launch at Cedar Creek is only suitable for <strong>small boats</strong> and that parking is <strong>extremely limited</strong>. The city&apos;s beach water-quality page also specifically notes that dogs are permitted at the Cedar Creek Park beach, which is relevant because dogs are not allowed at most city beaches. For summer visitors, Kelowna also includes Cedar Creek in its responsible public alcohol program from <strong>May 15 to September 15, noon to 9 p.m.</strong> in designated areas, so the park can feel busier during peak warm-weather periods.</p>";
const notes =
  '<p>Primary source: https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/cedar-creek-park. Supporting sources: https://www.kelowna.ca/boat-launches, https://www.kelowna.ca/parks-recreation/parks-beaches/water-quality-beaches, https://www.kelowna.ca/parks-recreation/parks-beaches/responsible-alcohol-public-spaces, and https://www.kelowna.ca/parks-recreation/parks-beaches/hidden-gems. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Cedar Creek Park | Kelowna Off-Leash Dog Beach',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'dog-beach', 'lake-swim', 'trails', 'kelowna'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Cedar Creek Park | Kelowna Off-Leash Dog Beach',
  Description:
    '<p>Cedar Creek Park is a large Kelowna off-leash waterfront park with dog beach access, swimming, trails, and a broad lakeside field.</p>',
  'Park type': 'Park',
  latitude: '49.7993',
  longitude: '-119.4978',
  'Surface type': 'Beach shoreline, grass, and park trails',
  Size: '7.00 ha',
  'Water source available': 'Lake access for swim and cool-down',
  Benches: 'Picnic tables available',
  'Shaded area': 'Some shade available - verify on arrival',
  'Waste bins': 'Expected at park - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes, but parking is extremely limited near the boat launch',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Check city signage on arrival',
  'Seasonal Restrictions': 'Check posted rules, water conditions, and city updates',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/cedar-creek-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Cedar+Creek+Park+5200+Lakeshore+Rd+Kelowna+BC',
  Tags: 'off-leash,dog-beach,lake-swim,trails,kelowna',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'cedar-creek-park-kelowna', {
  'Park Header': 'Cedar Creek Park | Kelowna Off-Leash Dog Beach',
  Description:
    '<p>Cedar Creek Park is a large Kelowna off-leash waterfront park with dog beach access, swimming, trails, and a broad lakeside field.</p>',
  'Park type': 'Park',
  latitude: '49.7993',
  longitude: '-119.4978',
  'Surface type': 'Beach shoreline, grass, and park trails',
  Size: '7.00 ha',
  'Water source available': 'Lake access for swim and cool-down',
  Benches: 'Picnic tables available',
  'Shaded area': 'Some shade available - verify on arrival',
  'Waste bins': 'Expected at park - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes, but parking is extremely limited near the boat launch',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Check city signage on arrival',
  'Seasonal Restrictions': 'Check posted rules, water conditions, and city updates',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/cedar-creek-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Cedar+Creek+Park+5200+Lakeshore+Rd+Kelowna+BC',
  Tags: 'off-leash,dog-beach,lake-swim,trails,kelowna',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Cedar Creek Park,/dog-parks/cedar-creek-park-kelowna/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/cedar-creek-park-kelowna/"') || row.join(',').includes(',/dog-parks/cedar-creek-park-kelowna/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 599 pages in the current working queue.', 'This backlog contains 598 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 238 |', '| T2-high-value-expansion | 237 |');
summary = summary.replace('| Dog Parks | 426 |', '| Dog Parks | 425 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Cedar Creek Park record and refreshed backlog files.');
