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
const park = parks.find((entry) => entry.slug === 'carmel-park-chilliwack');

if (!park) {
  throw new Error('Carmel Park record not found');
}

const seoTitle = 'Carmel Park | Chilliwack Dog-Friendly Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Carmel Park in Chilliwack, including current City of Chilliwack park classification, neighbourhood amenities, and off-leash listing context.';
const intro =
  '<p>Carmel Park is a <strong>sub-neighbourhood park</strong> in Chilliwack with open grass, playground access, and picnic-table amenities in a small residential park setting.</p>';
const body =
  '<p>The current City of Chilliwack material does <strong>not</strong> identify Carmel Park as an official off-leash dog area. That is the key factual correction for this page. The city&apos;s off-leash listings name locations such as Vedder Park, Island 22, Fairfield Park, Jinkerson Park, Sheffield Dog Off Leash Area, No. 3 Road Dog Off Leash Area, and the Vedder North Dyke Trail off-leash zone. Carmel Park does not appear on that list, so the old leash-free positioning was not supported by the city&apos;s current public information as of <strong>Thursday, July 30, 2026</strong>.</p><p>What the city does show is that Carmel Park belongs to the regular neighbourhood parks network. In the Chilliwack parks system it appears under <strong>Sub Neighbourhood Park</strong> and is associated with amenities such as <strong>playground 5-12</strong>, <strong>open grass area</strong>, and <strong>picnic tables</strong>. That is a much more accurate description of how the space functions for visitors than calling it a dog park.</p><p>For local dog owners, that means Carmel Park may still be useful as a nearby green space for a short leashed walk or pause in the neighbourhood, but it should not be presented as a confirmed off-leash destination. If someone specifically wants a source-backed off-leash outing in Chilliwack, the city&apos;s dedicated off-leash page is the correct reference point and points them to the actual approved locations.</p><p>Because the city pages reviewed here focus on classification and amenities rather than a full standalone park profile, some on-site details such as bench placement, exact entrance access, and any posted local restrictions should still be verified when visiting. The important quality improvement is that the page now matches the city&apos;s current categorization instead of making unsupported off-leash claims.</p>';
const notes =
  '<p>Primary sources: https://www.chilliwack.com/main/page.cfm?id=1754 and https://www.chilliwack.com/main/page.cfm?id=2579. Reviewed on July 30, 2026. This page was corrected because Carmel Park is not listed by the City of Chilliwack as an official off-leash dog area.</p>';

Object.assign(park, {
  title: 'Carmel Park | Chilliwack Dog-Friendly Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['dog-friendly', 'neighbourhood-park', 'chilliwack', 'carmel-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Carmel Park | Chilliwack Dog-Friendly Park',
  Description:
    '<p>Carmel Park is a small Chilliwack neighbourhood park with open grass, playground, and picnic-table amenities, but it is not listed by the city as an official off-leash dog area.</p>',
  'Park type': 'Sub neighbourhood park',
  'Street Address': 'Westview Avenue area - verify exact access on arrival',
  latitude: '49.17333',
  longitude: '-121.97104',
  'Surface type': 'Grass and neighbourhood park surfaces',
  Size: 'Small neighbourhood park',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=1754',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Carmel+Park+Chilliwack+BC',
  Tags: 'dog-friendly,neighbourhood-park,chilliwack,carmel-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'carmel-park-chilliwack', {
  'Park Header': 'Carmel Park | Chilliwack Dog-Friendly Park',
  Description:
    '<p>Carmel Park is a small Chilliwack neighbourhood park with open grass, playground, and picnic-table amenities, but it is not listed by the city as an official off-leash dog area.</p>',
  'Park type': 'Sub neighbourhood park',
  'Street Address': 'Westview Avenue area - verify exact access on arrival',
  latitude: '49.17333',
  longitude: '-121.97104',
  'Surface type': 'Grass and neighbourhood park surfaces',
  Size: 'Small neighbourhood park',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dispensers noted',
  'Parking Available': 'Street parking likely - verify on arrival',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=1754',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Carmel+Park+Chilliwack+BC',
  Tags: 'dog-friendly,neighbourhood-park,chilliwack,carmel-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Carmel Park,/dog-parks/carmel-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/carmel-park-chilliwack/"') || row.join(',').includes(',/dog-parks/carmel-park-chilliwack/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 592 pages in the current working queue.', 'This backlog contains 591 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 231 |', '| T2-high-value-expansion | 230 |');
summary = summary.replace('| Dog Parks | 419 |', '| Dog Parks | 418 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Carmel Park record and refreshed backlog files.');
