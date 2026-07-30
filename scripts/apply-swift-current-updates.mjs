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
const park = parks.find((entry) => entry.slug === 'swift-current-off-leash-dog-park');

if (!park) {
  throw new Error('Swift Current Off-Leash Dog Park record not found');
}

const seoTitle = 'Swift Current Off-Leash Dog Park | Swift Current Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Swift Current Off-Leash Dog Park, including the official location east of Highway 4 at the end of Hillcrest Drive, fenced open space, volunteer-supported development, and current city dog-owner rules.';
const intro =
  '<p>Swift Current Off-Leash Dog Park is a large fenced park on the <strong>east side of Highway 4 at the end of Hillcrest Drive</strong>, where dogs can roam, run, and play in a dedicated off-leash space.</p>';
const body =
  "<p>The official City of Swift Current page gives this park more personality and practical value than the old thin profile. The city describes it as a <strong>large, safe outdoor space</strong> on the east side of Highway 4 at the end of Hillcrest Drive, and older city releases further place it <strong>just north of the City Softball Complex</strong>. That gives visitors much better orientation than a vague intersection-only description. The city also makes clear that this is a community-supported site: the park exists thanks to donors, volunteers, and the City, and maintenance plus future development depend on ongoing support.</p><p>That volunteer-backed context matters because it explains why this park may feel more like a community project than a heavily programmed municipal facility. The city encourages residents to help with planning, fundraising, and upkeep through the Swift Current Dog Park Committee. For users, that means the main value proposition is straightforward: a <strong>large fenced-in off-leash area</strong> where dogs of different sizes can run freely year-round in an open prairie-style setting.</p><p>The city&apos;s dog-owner pages also add the practical rules missing from the old version. Dogs must be kept on a leash no longer than <strong>two metres</strong> when they are not on private property or inside the off-leash park. Owners must remove dog waste immediately, and dogs six months or older must be licensed each year. Swift Current&apos;s FAQ also notes that the dog park fee is built into the dog licence structure. Those details are useful because they turn this from a generic park description into a source-backed guide that reflects how the city expects people to use the space.</p>";
const notes =
  '<p>Primary source: https://www.swiftcurrent.ca/i-want-to/find/off-leash-dog-park. Supporting sources: https://www.swiftcurrent.ca/divisions/planning-growth-development/permits-and-licences/animal-licences/frequently-asked-questions-for-dog-owners, https://www.swiftcurrent.ca/divisions/planning-growth-development/permits-and-licences/animal-licences/animal-pest-control, https://www.swiftcurrent.ca/divisions/planning-growth-development/permits-and-licences/animal-licences, and https://www.swiftcurrent.ca/Home/Components/News/News/2260/. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Swift Current Off-Leash Dog Park | Swift Current Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'fenced', 'community-supported', 'swift-current'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Swift Current Off-Leash Dog Park | Swift Current Dog Park',
  Description:
    '<p>Swift Current Off-Leash Dog Park is a large fenced community-supported off-leash space east of Highway 4 at the end of Hillcrest Drive.</p>',
  'Park type': 'Park',
  latitude: '50.2844',
  longitude: '-107.81',
  'Surface type': 'Open grass and prairie-style ground surfaces',
  Size: 'Large fenced area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Minimal - verify on arrival',
  'Waste bins': 'Expected at entrance or main access - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - verify access near Hillcrest Drive entrance',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Year-round access noted by city; verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted rules and city updates',
  'Park Website or Source': 'https://www.swiftcurrent.ca/i-want-to/find/off-leash-dog-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Swift+Current+Off-Leash+Dog+Park+Hillcrest+Drive+Highway+4+Swift+Current+SK',
  Tags: 'off-leash,fenced,community-supported,swift-current',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'swift-current-off-leash-dog-park', {
  'Park Header': 'Swift Current Off-Leash Dog Park | Swift Current Dog Park',
  Description:
    '<p>Swift Current Off-Leash Dog Park is a large fenced community-supported off-leash space east of Highway 4 at the end of Hillcrest Drive.</p>',
  'Park type': 'Park',
  latitude: '50.2844',
  longitude: '-107.81',
  'Surface type': 'Open grass and prairie-style ground surfaces',
  Size: 'Large fenced area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Minimal - verify on arrival',
  'Waste bins': 'Expected at entrance or main access - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - verify access near Hillcrest Drive entrance',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Year-round access noted by city; verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted rules and city updates',
  'Park Website or Source': 'https://www.swiftcurrent.ca/i-want-to/find/off-leash-dog-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Swift+Current+Off-Leash+Dog+Park+Hillcrest+Drive+Highway+4+Swift+Current+SK',
  Tags: 'off-leash,fenced,community-supported,swift-current',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Swift Current Off-Leash Dog Park,/dog-parks/swift-current-off-leash-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/swift-current-off-leash-dog-park/"') || row.join(',').includes(',/dog-parks/swift-current-off-leash-dog-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 597 pages in the current working queue.', 'This backlog contains 596 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 236 |', '| T2-high-value-expansion | 235 |');
summary = summary.replace('| Dog Parks | 424 |', '| Dog Parks | 423 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Swift Current Off-Leash Dog Park record and refreshed backlog files.');
