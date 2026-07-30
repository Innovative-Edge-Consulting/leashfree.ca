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
const park = parks.find((entry) => entry.slug === 'apollo-crater-park');

if (!park) {
  throw new Error('Apollo Crater Park record not found');
}

const seoTitle = 'Apollo Crater Park | Off-Leash Dog Park in Ottawa | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Apollo Crater Park in Ottawa, including the current 600 Apollo Way location, off-leash designation context, Ottawa park hours, and practical visit notes based on official rules and open-data-backed listings.';
const intro =
  '<p>Apollo Crater Park is an off-leash Ottawa park in Orléans, with current open-data-backed listings placing it at 600 Apollo Way in Cumberland and Ottawa&apos;s citywide dog-park rules applying on site.</p>';
const body =
  "<p>The strongest current source set available for this page supports Apollo Crater Park as an <strong>off-leash park</strong>, not just a casual dog-friendly green space. Ottawa&apos;s official dog-park program explains that designated parks may allow dogs off leash, provided they remain under the handler&apos;s control, and that dogs are prohibited within five metres of children&apos;s play areas and pools. While the City of Ottawa&apos;s interactive dog-park map was not directly readable in this environment, current open-data-backed dog-park listings for Ottawa identify <strong>Apollo Crater Park at 600 Apollo Way</strong> with an off-leash designation in Cumberland/Orléans.</p><p>Those same current listings describe Apollo Crater Park as an <strong>unfenced</strong> off-leash park with <strong>no water access</strong>. They also place the park at roughly <strong>37,190 square metres</strong>, which is much larger than the older draft suggested. Because this specific park data is coming through City-of-Ottawa open-data-backed listings rather than a directly readable municipal park detail page, this guide avoids over-claiming unsupported amenities such as dedicated parking, washrooms, or separate small-dog areas.</p><p>Ottawa&apos;s official parks guidance is clearer on hours than the prior version of this page. City parks are generally open daily from <strong>5 am to 11 pm unless otherwise posted</strong>, so the earlier unsourced 24-hour claim has been removed. For a practical visit, treat Apollo Crater Park as a simple open off-leash field in a suburban setting: good for exercise and recall work if your dog is reliable in unfenced spaces, but worth double-checking on posted signage when you arrive.</p>";
const notes =
  '<p>Official Ottawa rule sources used for this refresh: https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/dogs-parks and https://ottawa.ca/en/recreation-and-parks/facilities-and-rentals/parks-and-green-space. Current park-specific designation and location details were cross-checked against open-data-backed listings that state their facility data comes from the City of Ottawa Open Data portal. Because the city&apos;s interactive map was not directly readable in this environment, park-specific amenity claims were kept conservative.</p>';

Object.assign(park, {
  title: 'Apollo Crater Park | Off-Leash Dog Park in Ottawa',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'unfenced', 'ottawa', 'orleans'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Apollo Crater Park | Off-Leash Dog Park in Ottawa',
  Description:
    '<p>Apollo Crater Park is an off-leash Ottawa park in Orléans, with current open-data-backed listings placing it at 600 Apollo Way in Cumberland.</p>',
  'Street Address': '600 Apollo Way',
  latitude: '45.323',
  longitude: '-75.6585',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: '37,190 m²',
  'Water source available': 'No',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Limited',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Unknown - verify on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': '5 am to 11 pm unless otherwise posted',
  'Seasonal Restrictions': 'Check posted signage and City of Ottawa updates',
  'Park Website or Source': 'https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/dogs-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Apollo+Crater+Park+600+Apollo+Way+Ottawa+ON',
  Tags: 'off-leash, unfenced, ottawa, orleans',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'apollo-crater-park', {
  'Park Header': 'Apollo Crater Park | Off-Leash Dog Park in Ottawa',
  Description:
    '<p>Apollo Crater Park is an off-leash Ottawa park in Orléans, with current open-data-backed listings placing it at 600 Apollo Way in Cumberland.</p>',
  'Street Address': '600 Apollo Way',
  latitude: '45.323',
  longitude: '-75.6585',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Grass',
  Size: '37,190 m²',
  'Water source available': 'No',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Limited',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Unknown - verify on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': '5 am to 11 pm unless otherwise posted',
  'Seasonal Restrictions': 'Check posted signage and City of Ottawa updates',
  'Park Website or Source': 'https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/dogs-parks',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Apollo+Crater+Park+600+Apollo+Way+Ottawa+ON',
  Tags: 'off-leash, unfenced, ottawa, orleans',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Apollo Crater Park,/dog-parks/apollo-crater-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/apollo-crater-park/"') || row.join(',').includes(',/dog-parks/apollo-crater-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 605 pages in the current working queue.', 'This backlog contains 604 pages in the current working queue.');
summary = summary.replace('| T1-source-research | 1 |', '| T1-source-research | 0 |');
summary = summary.replace('| Dog Parks | 432 |', '| Dog Parks | 431 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Apollo Crater Park record and refreshed backlog files.');
