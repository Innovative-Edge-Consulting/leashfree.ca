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
const park = parks.find((entry) => entry.slug === 'barber-park-chilliwack');

if (!park) {
  throw new Error('Barber Park record not found');
}

const seoTitle = 'Barber Park | Chilliwack Dog-Friendly Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Barber Park in Chilliwack at 45795 Henley Avenue, including current City of Chilliwack park classification, amenities, and off-leash listing context.';
const intro =
  '<p>Barber Park is a <strong>sub-neighbourhood park</strong> in Chilliwack at <strong>45795 Henley Avenue</strong>, with open grass, picnic-table access, and playground amenities in a residential setting.</p>';
const body =
  '<p>The current City of Chilliwack material does <strong>not</strong> identify Barber Park as an official dog off-leash area. That is the most important correction to make on this page. The city&apos;s dedicated off-leash page lists other locations such as Vedder Park, Island 22, Fairfield Park, Jinkerson Park, Sheffield Dog Off Leash Area, No. 3 Road Dog Off Leash Area, and the Vedder North Dyke Trail off-leash zone. Barber Park does not appear on that list, so the old leash-free positioning was not supported by the city&apos;s current public information as of <strong>July 30, 2026</strong>.</p><p>What the city does show is that Barber Park is part of the regular parks network rather than the off-leash system. In the Chilliwack parks listings, Barber appears under <strong>Sub Neighbourhood Park</strong> and is associated with amenities such as <strong>playground 5-12</strong>, <strong>open grass area</strong>, and <strong>picnic tables</strong>. That gives visitors a more accurate expectation: this is a small community green space that may work for a short dog walk on leash, not a confirmed off-leash destination.</p><p>The city&apos;s earlier <strong>June 8, 2015</strong> ribbon-cutting notice adds a bit of useful background. It confirms the municipal address of <strong>45795 Henley Avenue</strong> and explains that the park was updated after consultation with nearby residents so the playground would better reflect community needs and current Canadian Standards Association requirements. That history fits the city&apos;s current classification of Barber Park as a neighbourhood-serving public space.</p><p>For dog owners, the practical takeaway is straightforward. Barber Park may still be a convenient local stop for a leashed stroll or short break in an open grassy setting, but if you want a city-confirmed off-leash outing in Chilliwack, you should use one of the locations named on the official off-leash page instead.</p>';
const notes =
  '<p>Primary sources: https://www.chilliwack.com/main/page.cfm?id=1754 and https://www.chilliwack.com/main/page.cfm?id=2579. Supporting source: https://www.chilliwack.com/main/page.cfm?id=37&prid=323&prshow=details. Reviewed on July 30, 2026. This page was corrected because Barber Park is not listed by the City of Chilliwack as an official off-leash dog area.</p>';

Object.assign(park, {
  title: 'Barber Park | Chilliwack Dog-Friendly Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['dog-friendly', 'neighbourhood-park', 'chilliwack', 'barber-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Barber Park | Chilliwack Dog-Friendly Park',
  Description:
    '<p>Barber Park is a small Chilliwack neighbourhood park at 45795 Henley Avenue with open grass, playground, and picnic-table amenities, but it is not listed by the city as an official off-leash dog area.</p>',
  'Park type': 'Sub neighbourhood park',
  'Street Address': '45795 Henley Avenue',
  latitude: '49.18994',
  longitude: '-121.95318',
  'Surface type': 'Grass and neighbourhood park surfaces',
  Size: 'Small neighbourhood park',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dispensers noted',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=1754',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=45795+Henley+Avenue+Chilliwack+BC',
  Tags: 'dog-friendly,neighbourhood-park,chilliwack,barber-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'barber-park-chilliwack', {
  'Park Header': 'Barber Park | Chilliwack Dog-Friendly Park',
  Description:
    '<p>Barber Park is a small Chilliwack neighbourhood park at 45795 Henley Avenue with open grass, playground, and picnic-table amenities, but it is not listed by the city as an official off-leash dog area.</p>',
  'Park type': 'Sub neighbourhood park',
  'Street Address': '45795 Henley Avenue',
  latitude: '49.18994',
  longitude: '-121.95318',
  'Surface type': 'Grass and neighbourhood park surfaces',
  Size: 'Small neighbourhood park',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some tree cover',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dispensers noted',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?id=1754',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=45795+Henley+Avenue+Chilliwack+BC',
  Tags: 'dog-friendly,neighbourhood-park,chilliwack,barber-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Barber Park,/dog-parks/barber-park-chilliwack/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/barber-park-chilliwack/"') || row.join(',').includes(',/dog-parks/barber-park-chilliwack/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 593 pages in the current working queue.', 'This backlog contains 592 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 232 |', '| T2-high-value-expansion | 231 |');
summary = summary.replace('| Dog Parks | 420 |', '| Dog Parks | 419 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Barber Park record and refreshed backlog files.');
