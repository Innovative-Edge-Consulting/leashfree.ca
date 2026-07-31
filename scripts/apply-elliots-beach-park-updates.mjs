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

const parks = JSON.parse(fs.readFileSync(parksPath, 'utf8'));
const park = parks.find((entry) => entry.slug === 'elliots-beach-park-ladysmith');
if (!park) throw new Error('Elliots Beach Park record not found');

const seoTitle = 'Elliots Beach Park | North Oyster Beach Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Elliots Beach Park in North Oyster, including the official CVRD address, beach amenities, and the correction that this is not an official Ladysmith dog off-leash park.';
const intro =
  '<p>Elliots Beach Park is a <strong>Cowichan Valley Regional District beach park</strong> in <strong>North Oyster</strong>, with shoreline access, picnic space, and a small waterfront day-use setting at <strong>11846 Elliot Way</strong>.</p>';
const body =
  '<p>The most important correction on this page is geographic and categorical: <strong>Elliots Beach Park is not a Town of Ladysmith dog park</strong>. The official page is published by the <strong>Cowichan Valley Regional District</strong>, which identifies the site as a beach park in <strong>North Oyster</strong>, across from Ladysmith Harbour. That means the earlier LeashFree.ca record was using the wrong municipality and incorrectly presenting the site as a leash-free park in Ladysmith.</p><p>The CVRD&apos;s current park page describes Elliots Beach Park as a beach destination with amenities such as a <strong>picnic area</strong>, <strong>parking</strong>, <strong>toilet facilities</strong>, an <strong>accessible ramp to the beach</strong>, a <strong>kayak launch area</strong>, and <strong>snorkeling</strong> access. It gives the current address as <strong>11846 Elliot Way, North Oyster</strong> and describes a small parking area for roughly <strong>3 to 7 vehicles</strong>. Those are useful factual details for a beach guide, but they do not support the old dog-park framing.</p><p>Just as important, the Town of Ladysmith&apos;s own dog off-leash page does <strong>not</strong> list Elliots Beach Park among its official off-leash locations. Ladysmith&apos;s designated off-leash areas are the Davis Road Dog Park, the fenced Transfer Beach area, Gourlay-Janes Park, Holland Creek Trail, and the Heart Lake &amp; Stocking Lake loops. Elliots Beach Park is not on that list because it is not a Ladysmith municipal park in the first place.</p><p>For users arriving here because they want a dog outing, the practical takeaway is that this page should not be treated as evidence of an official off-leash dog destination. It is more accurately a regional beach park guide. If someone specifically wants a source-backed off-leash outing in or near Ladysmith, the official Town of Ladysmith dog off-leash page is the correct reference instead.</p>';
const notes =
  '<p>Primary sources: https://www.cvrd.bc.ca/parks/elliots-beach-park/ and https://www.ladysmith.ca/parks-recreation-culture/dog-off-leash-parks-trails. Reviewed on July 30, 2026. This page was corrected because Elliots Beach Park is a CVRD beach park in North Oyster and is not listed by the Town of Ladysmith as an official off-leash dog park.</p>';

Object.assign(park, {
  title: 'Elliots Beach Park | North Oyster Beach Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    City: ['North Oyster'],
    Province: ['British Columbia'],
    Tags: ['beach-park', 'waterfront', 'cvrd', 'elliots-beach-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Elliots Beach Park | North Oyster Beach Guide',
  Description:
    '<p>Elliots Beach Park is a CVRD beach park at 11846 Elliot Way in North Oyster with picnic space, parking, toilet facilities, and accessible beach access, but it is not an official Ladysmith dog off-leash park.</p>',
  'Park type': 'Beach park',
  'Street Address': '11846 Elliot Way',
  latitude: '48.9887',
  longitude: '-123.7622',
  City: 'North Oyster',
  Province: 'British Columbia',
  'Postal Code': '',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Beach, sand, gravel, rocky shoreline',
  Size: 'Small beach day-use park',
  'Water source available': 'Ocean access',
  Benches: 'Limited picnic seating',
  'Shaded area': 'Partial',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog dispensers confirmed',
  'Parking Available': 'Yes - small lot for 3 to 7 vehicles',
  'Washrooms nearby': 'Yes - toilet facilities',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted regional park and shoreline notices',
  'Park Website or Source': 'https://www.cvrd.bc.ca/parks/elliots-beach-park/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=11846+Elliot+Way+North+Oyster+BC',
  Tags: 'beach-park,waterfront,cvrd,elliots-beach-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'elliots-beach-park-ladysmith', {
  'Park Header': 'Elliots Beach Park | North Oyster Beach Guide',
  Description:
    '<p>Elliots Beach Park is a CVRD beach park at 11846 Elliot Way in North Oyster with picnic space, parking, toilet facilities, and accessible beach access, but it is not an official Ladysmith dog off-leash park.</p>',
  'Park type': 'Beach park',
  'Street Address': '11846 Elliot Way',
  latitude: '48.9887',
  longitude: '-123.7622',
  City: 'North Oyster',
  Province: 'British Columbia',
  'Postal Code': '',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Beach, sand, gravel, rocky shoreline',
  Size: 'Small beach day-use park',
  'Water source available': 'Ocean access',
  Benches: 'Limited picnic seating',
  'Shaded area': 'Partial',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No official dog dispensers confirmed',
  'Parking Available': 'Yes - small lot for 3 to 7 vehicles',
  'Washrooms nearby': 'Yes - toilet facilities',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted regional park and shoreline notices',
  'Park Website or Source': 'https://www.cvrd.bc.ca/parks/elliots-beach-park/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=11846+Elliot+Way+North+Oyster+BC',
  Tags: 'beach-park,waterfront,cvrd,elliots-beach-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Elliots Beach Park,/dog-parks/elliots-beach-park-ladysmith/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/elliots-beach-park-ladysmith/"') || row.join(',').includes(',/dog-parks/elliots-beach-park-ladysmith/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 581 pages in the current working queue.', 'This backlog contains 580 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 220 |', '| T2-high-value-expansion | 219 |');
summary = summary.replace('| Dog Parks | 408 |', '| Dog Parks | 407 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Elliots Beach Park record and refreshed backlog files.');
