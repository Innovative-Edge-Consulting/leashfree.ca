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
const park = parks.find((entry) => entry.slug === 'fairfield-park-chilliwack');

if (!park) {
  throw new Error('Fairfield Park record not found');
}

const seoTitle = 'Fairfield Park | Chilliwack Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Fairfield Park in Chilliwack, including the official Clare Avenue access point, large and small fenced dog areas, walking paths, washrooms, playground, and sports-field amenities.';
const intro =
  '<p>Fairfield Park is one of Chilliwack&apos;s official dog off-leash locations, with <strong>separate large and small dog areas</strong> inside a larger community park at <strong>46219 Clare Avenue</strong> on Fairfield Island.</p>';
const body =
  '<p>The City of Chilliwack currently lists Fairfield Park on its dedicated dog off-leash page, which confirms this is an officially recognized off-leash destination rather than just a dog-friendly green space. The city&apos;s current off-leash list includes <strong>Fairfield Park</strong> alongside Vedder Park, Island 22, Jinkerson Park, and several other approved dog exercise locations, so the park&apos;s off-leash status is clearly supported by municipal sources as of <strong>Thursday, July 30, 2026</strong>.</p><p>The park directory adds the detail that was missing from the old thin page. Chilliwack describes Fairfield Park as a <strong>mid-sized public park and sporting facility</strong> with an area of <strong>11.4 hectares</strong>. The site is accessed from <strong>Clare Avenue on Fairfield Island</strong>, and the city&apos;s spray zone listing gives the park&apos;s current civic address as <strong>46219 Clare Avenue</strong>. The park also includes a <strong>2-kilometre flat walking trail</strong>, <strong>picnic area</strong>, <strong>playground</strong>, <strong>washrooms</strong>, and <strong>concession</strong>.</p><p>For dog owners, the most useful park-specific fact is that Fairfield has <strong>two dog off-leash areas</strong>: one for <strong>big dogs</strong> and one for <strong>small dogs</strong>. A 2024 City of Chilliwack release about new dog amenities confirms that both Fairfield Park and Jinkerson Park feature dedicated large-dog and small-dog areas. That gives users a better expectation of the setup than the older generic copy and makes the page more practical for owners of smaller or less confident dogs.</p><p>The larger park setting is also part of the value here. Fairfield is not just a fenced dog run tucked into a corner. It is a multi-use community park with <strong>two full-sized multi-sport fields</strong>, <strong>two pee wee diamonds</strong>, and <strong>two midget diamonds</strong>, one of which is lit. That means visitors should expect an active community environment, especially during organized sports seasons, while still having dedicated off-leash spaces for dogs within the park. For many local users, that combination makes Fairfield a convenient everyday stop rather than a destination that requires a special trip.</p>';
const notes =
  '<p>Primary sources: https://www.chilliwack.com/main/page.cfm?id=2579 and https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=42. Supporting sources: https://www.chilliwack.com/main/page.cfm?id=37&prid=573&prshow=details and https://www.chilliwack.com/main/pdfbook/prc/lg/2025FallWinter/HTML/6/. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Fairfield Park | Chilliwack Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'small-dog-area', 'sports-park', 'chilliwack'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Fairfield Park | Chilliwack Dog Off-Leash Area',
  Description:
    '<p>Fairfield Park is an official Chilliwack dog off-leash site at 46219 Clare Avenue with separate large and small dog areas inside a larger community sports park.</p>',
  'Park type': 'Park',
  'Street Address': '46219 Clare Avenue',
  latitude: '49.1245',
  longitude: '-121.9927',
  'Surface type': 'Grass within fenced dog areas and surrounding park paths',
  Size: '11.4 hectares',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely in park areas - verify exact dog-area seating on arrival',
  'Shaded area': 'Some tree cover around park - verify in dog areas on arrival',
  'Waste bins': 'Expected at park - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and field-use activity',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=42',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=46219+Clare+Avenue+Chilliwack+BC',
  Tags: 'off-leash,small-dog-area,sports-park,chilliwack',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'fairfield-park-chilliwack', {
  'Park Header': 'Fairfield Park | Chilliwack Dog Off-Leash Area',
  Description:
    '<p>Fairfield Park is an official Chilliwack dog off-leash site at 46219 Clare Avenue with separate large and small dog areas inside a larger community sports park.</p>',
  'Park type': 'Park',
  'Street Address': '46219 Clare Avenue',
  latitude: '49.1245',
  longitude: '-121.9927',
  'Surface type': 'Grass within fenced dog areas and surrounding park paths',
  Size: '11.4 hectares',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely in park areas - verify exact dog-area seating on arrival',
  'Shaded area': 'Some tree cover around park - verify in dog areas on arrival',
  'Waste bins': 'Expected at park - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and field-use activity',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=42',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=46219+Clare+Avenue+Chilliwack+BC',
  Tags: 'off-leash,small-dog-area,sports-park,chilliwack',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Fairfield Park,/dog-parks/fairfield-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/fairfield-park-chilliwack/"') || row.join(',').includes(',/dog-parks/fairfield-park-chilliwack/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 585 pages in the current working queue.', 'This backlog contains 584 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 224 |', '| T2-high-value-expansion | 223 |');
summary = summary.replace('| Dog Parks | 412 |', '| Dog Parks | 411 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Fairfield Park record and refreshed backlog files.');
