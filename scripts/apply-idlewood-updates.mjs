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
const park = parks.find((entry) => entry.slug === 'idlewood-park');

if (!park) {
  throw new Error('Idlewood Park record not found');
}

const seoTitle = 'Idlewood Park | Kitchener Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Idlewood Park in Kitchener, including the official 5 Thaler Avenue location, city off-leash rules, parking access, and nearby park amenities.';
const intro =
  '<p>Idlewood Park is one of Kitchener&apos;s official off-leash dog parks, located at <strong>5 Thaler Avenue</strong> in a neighbourhood park setting with open green space and nearby local amenities.</p>';
const body =
  '<p>The City of Kitchener lists Idlewood Park as one of its official off-leash dog parks, which immediately makes this page more useful than the old thin description. The city confirms the address as <strong>5 Thaler Avenue</strong>, so visitors have a reliable starting point instead of a vague neighbourhood reference. Kitchener&apos;s parks page also makes clear that dogs are welcome throughout the city&apos;s parks and trails, but they must remain on leash unless they are inside a designated off-leash area such as Idlewood.</p><p>What the city&apos;s current material adds here is the practical context that directory pages often miss. Idlewood is part of a broader neighbourhood park setting rather than a destination-style fenced run. The same municipal address is also used for the <strong>Idlewood outdoor pool</strong>, where the city notes there is free parking off Thaler Avenue, Grand River Transit route 1 nearby on River Road East, and bike racks at the pool. Those details help visitors understand access and the general layout around the park, even though the dog area itself is a separate use within the park.</p><p>Kitchener&apos;s published off-leash rules are the most important factual upgrade. The city says dogs must be accompanied by a responsible person who is at least 16 years old, must stay within sight and under verbal control, and owners may bring no more than two dogs at one time. All dogs must have a municipal dog licence and current rabies vaccinations with tags worn, waste must be cleaned up, and dogs over seven months must be spayed or neutered. The rules also prohibit aggressive dogs, dogs in heat, puppies under 12 weeks old, sick dogs, food, glass containers, and prong or spike collars.</p><p>There is also recent evidence that Idlewood&apos;s dog space has been an active city project rather than a forgotten listing. The City of Kitchener&apos;s EngageWR park-network updates noted a neighbourhood reopening celebration in September 2024 and referenced the <strong>new off-leash dog area in Idlewood Park</strong>. That does not change the city-wide rules, but it does suggest the current listing reflects a more recent park improvement rather than an outdated legacy amenity.</p>';
const notes =
  '<p>Primary sources: https://www.kitchener.ca/parks-and-trails/dogs-in-parks-and-on-trails/ and https://www.kitchener.ca/Pools. Supporting source: https://www.engagewr.ca/ward2parknetwork/construction-complete-opening-celebration-sept-27. Approximate coordinates added from public mapping context for internal completeness. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Idlewood Park | Kitchener Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'kitchener', 'neighbourhood-park', 'idlewood'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Idlewood Park | Kitchener Dog Park',
  Description:
    '<p>Idlewood Park is an official Kitchener off-leash dog park at 5 Thaler Avenue with neighbourhood-park access, city-wide dog park rules, and nearby parking.</p>',
  'Park type': 'Park',
  'Street Address': '5 Thaler Avenue',
  latitude: '43.4421',
  longitude: '-80.4355',
  'Surface type': 'Open grass and neighbourhood park surfaces; verify exact dog area conditions on arrival',
  Size: 'Neighbourhood off-leash park',
  'Water source available': 'No dedicated dog water confirmed by city',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some mature tree cover in the park',
  'Waste bins': 'Yes - city rules reference designated waste containers',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - free parking off Thaler Avenue',
  'Washrooms nearby': 'Outdoor pool facility is nearby seasonally; verify availability on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'No city-specific Idlewood seasonal restriction noted on the dog-park page',
  'Park Website or Source': 'https://www.kitchener.ca/parks-and-trails/dogs-in-parks-and-on-trails/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=5+Thaler+Avenue+Kitchener+ON',
  Tags: 'off-leash,kitchener,neighbourhood-park,idlewood',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'idlewood-park', {
  'Park Header': 'Idlewood Park | Kitchener Dog Park',
  Description:
    '<p>Idlewood Park is an official Kitchener off-leash dog park at 5 Thaler Avenue with neighbourhood-park access, city-wide dog park rules, and nearby parking.</p>',
  'Park type': 'Park',
  'Street Address': '5 Thaler Avenue',
  latitude: '43.4421',
  longitude: '-80.4355',
  'Surface type': 'Open grass and neighbourhood park surfaces; verify exact dog area conditions on arrival',
  Size: 'Neighbourhood off-leash park',
  'Water source available': 'No dedicated dog water confirmed by city',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some mature tree cover in the park',
  'Waste bins': 'Yes - city rules reference designated waste containers',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - free parking off Thaler Avenue',
  'Washrooms nearby': 'Outdoor pool facility is nearby seasonally; verify availability on arrival',
  'Operating hours': 'Verify posted park hours on arrival',
  'Seasonal Restrictions': 'No city-specific Idlewood seasonal restriction noted on the dog-park page',
  'Park Website or Source': 'https://www.kitchener.ca/parks-and-trails/dogs-in-parks-and-on-trails/',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=5+Thaler+Avenue+Kitchener+ON',
  Tags: 'off-leash,kitchener,neighbourhood-park,idlewood',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Idlewood Park,/dog-parks/idlewood-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/idlewood-park/"') || row.join(',').includes(',/dog-parks/idlewood-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 595 pages in the current working queue.', 'This backlog contains 594 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 234 |', '| T2-high-value-expansion | 233 |');
summary = summary.replace('| Dog Parks | 422 |', '| Dog Parks | 421 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Idlewood Park record and refreshed backlog files.');
