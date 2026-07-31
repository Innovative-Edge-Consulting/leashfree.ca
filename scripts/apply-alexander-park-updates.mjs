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
const park = parks.find((entry) => entry.slug === 'alexander-park-victoria');

if (!park) {
  throw new Error('Alexander Park record not found');
}

const seoTitle = 'Alexander Park | Victoria Leash-Optional Dog Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Alexander Park in Victoria, including the official 1325 Bay Street address, Fernwood location, leash-optional status, play equipment, and current off-leash hours.';
const intro =
  '<p>Alexander Park is a small <strong>Fernwood</strong> neighbourhood park in Victoria at <strong>1325 Bay Street</strong>, with <strong>play equipment</strong> and a designated <strong>leash-optional area</strong> for dogs.</p>';
const body =
  '<p>The City of Victoria currently lists Alexander Park as one of its parks with a designated <strong>leash-optional area</strong>, which is the most important fact to ground this page in current municipal information. On the city&apos;s park directory, Alexander Park appears in the <strong>Fernwood</strong> neighbourhood and is identified with two main amenities: <strong>play equipment</strong> and <strong>leash optional areas</strong>. The city&apos;s dedicated Alexander Park page also confirms the current address as <strong>1325 Bay St, Victoria, BC</strong>.</p><p>Victoria&apos;s broader dogs-in-parks rules explain the operating framework around that designation. The city says all dogs must be on leash except in designated leash-optional areas, and reminds owners to keep control of their dog, pick up after them, prevent unwanted jumping or rushing, and leash dogs outside the posted off-leash zone. For Alexander Park specifically, Victoria Animal Control currently publishes the leash-optional hours as <strong>daily from 6:00 a.m. to 10:00 a.m.</strong> and <strong>4:00 p.m. to 10:00 p.m.</strong>, with the off-leash use limited to <strong>a portion of the park</strong> rather than the entire site.</p><p>That distinction matters because Alexander Park is a mixed-use neighbourhood space, not just a dog enclosure. Families and local residents also use the playground and surrounding green space, so visitors should expect a more compact urban park setting than a large destination off-leash field or trail system. The park&apos;s appeal is convenience: it gives nearby Victoria dog owners a local off-leash option in a residential area without requiring a longer drive to one of the city&apos;s larger waterfront or multi-use parks.</p><p>There is also recent evidence that the city continues to invest in this park. In <strong>October 2025</strong>, the City of Victoria promoted a public tree-planting event at Alexander Park, noting that twelve new trees would be planted there as part of Tree Appreciation Day. That does not change the dog rules directly, but it supports the picture of Alexander Park as an actively maintained local green space rather than a neglected leftover lot. For visitors, the practical takeaway is simple: this is a legitimate city-recognized leash-optional park, but the off-leash privilege is time-limited and confined to the posted area.</p>';
const notes =
  '<p>Primary sources: https://www.victoria.ca/parks-recreation/our-parks, https://www.victoria.ca/parks-recreation/parks-trails/our-parks/alexander-park, and https://www.victoria.ca/parks-recreation/our-parks/dogs-parks. Supporting source for current published leash-optional hours: https://www.vacs.ca/leash-optional-parks/city-victoria. Additional city context: https://www.victoria.ca/city-government/news/plant-trees-city. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Alexander Park | Victoria Leash-Optional Dog Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['leash-optional', 'fernwood', 'victoria', 'neighbourhood-park'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Alexander Park | Victoria Leash-Optional Dog Area',
  Description:
    '<p>Alexander Park is a Fernwood neighbourhood park in Victoria with play equipment and a designated leash-optional dog area that operates during posted daily off-leash time windows.</p>',
  'Park type': 'Park',
  'Street Address': '1325 Bay Street',
  latitude: '48.4340805',
  longitude: '-123.3436044',
  'Surface type': 'Grass',
  Size: 'Small neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely in park areas - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - city says leash-optional parks have trash bins',
  'Bag Dispensers': 'Yes - city says leash-optional parks have bag dispensers',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Daily 6:00 a.m. to 10:00 a.m. and 4:00 p.m. to 10:00 p.m.',
  'Seasonal Restrictions': 'Off-leash use limited to posted leash-optional area only',
  'Park Website or Source': 'https://www.victoria.ca/parks-recreation/parks-trails/our-parks/alexander-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1325+Bay+Street+Victoria+BC',
  Tags: 'leash-optional,fernwood,victoria,neighbourhood-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'alexander-park-victoria', {
  'Park Header': 'Alexander Park | Victoria Leash-Optional Dog Area',
  Description:
    '<p>Alexander Park is a Fernwood neighbourhood park in Victoria with play equipment and a designated leash-optional dog area that operates during posted daily off-leash time windows.</p>',
  'Park type': 'Park',
  'Street Address': '1325 Bay Street',
  latitude: '48.4340805',
  longitude: '-123.3436044',
  'Surface type': 'Grass',
  Size: 'Small neighbourhood park',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely in park areas - verify on arrival',
  'Shaded area': 'Some mature tree cover',
  'Waste bins': 'Yes - city says leash-optional parks have trash bins',
  'Bag Dispensers': 'Yes - city says leash-optional parks have bag dispensers',
  'Parking Available': 'Street parking',
  'Washrooms nearby': 'No city-confirmed washrooms noted',
  'Operating hours': 'Daily 6:00 a.m. to 10:00 a.m. and 4:00 p.m. to 10:00 p.m.',
  'Seasonal Restrictions': 'Off-leash use limited to posted leash-optional area only',
  'Park Website or Source': 'https://www.victoria.ca/parks-recreation/parks-trails/our-parks/alexander-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1325+Bay+Street+Victoria+BC',
  Tags: 'leash-optional,fernwood,victoria,neighbourhood-park',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Alexander Park,/dog-parks/alexander-park-victoria/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/alexander-park-victoria/"') || row.join(',').includes(',/dog-parks/alexander-park-victoria/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 586 pages in the current working queue.', 'This backlog contains 585 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 225 |', '| T2-high-value-expansion | 224 |');
summary = summary.replace('| Dog Parks | 413 |', '| Dog Parks | 412 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Alexander Park record and refreshed backlog files.');
