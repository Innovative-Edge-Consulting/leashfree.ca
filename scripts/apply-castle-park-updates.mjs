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
const park = parks.find((entry) => entry.slug === 'castle-park');

if (!park) {
  throw new Error('Castle Park record not found');
}

const seoTitle = 'Castle Park | Port Coquitlam Off-Leash Dog Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Castle Park in Port Coquitlam, including the official 2252 Castle Crescent address, unfenced off-leash area status, park amenities, and current dog park rules.';
const intro =
  '<p>Castle Park is a <strong>Port Coquitlam</strong> park at <strong>2252 Castle Crescent</strong> with an <strong>unfenced off-leash dog area</strong>, walking trails, playground, splash park, washroom, and picnic amenities.</p>';
const body =
  '<p>The biggest quality fix on this page is geographic: Castle Park is in <strong>Port Coquitlam</strong>, not Coquitlam. The City of Port Coquitlam&apos;s current off-leash page lists <strong>Castle Park Off-Leash Dog Area</strong> at <strong>2252 Castle Crescent</strong>, and the city&apos;s parks directory uses the same address. That corrects both the municipality and the old local context on the existing LeashFree.ca record.</p><p>The second important correction is the type of off-leash experience. Port Coquitlam identifies Castle Park as an <strong>off-leash area</strong>, and the park directory specifically describes it as an <strong>unfenced off leash dog area</strong>. That means the older description of a small fenced gravel dog park was inaccurate. Users should expect a broader open grass park setting where reliable recall and voice control matter more than they would in a fenced enclosure.</p><p>The city&apos;s park directory also makes this page more useful by filling in the surrounding amenities. Castle Park is a large park of <strong>108,499 square metres</strong> and includes a <strong>playground</strong>, <strong>splash park</strong>, <strong>public washroom</strong>, <strong>reservable picnic shelter</strong>, <strong>walking trails</strong>, a <strong>dog waste bag station</strong>, and a <strong>dog waste bin</strong>. That combination makes it a more flexible destination than a single-purpose dog run, especially for households trying to combine dog time with a family park visit.</p><p>Port Coquitlam&apos;s dog rules add the operating expectations missing from the old thin copy. Owners must <strong>stay in the area</strong>, <strong>have a leash on hand</strong>, <strong>keep dogs under firm voice and visual control</strong>, and bring no more than <strong>three dogs per owner</strong>. Dogs must be at least <strong>four months old</strong>, licensed, up to date on vaccinations, and removed if they act aggressively. Those are exactly the kinds of practical facts that make the page more trustworthy for local users.</p>';
const notes =
  '<p>Primary sources: https://www.portcoquitlam.ca/services/pets-wildlife/dogs/leash-dog-areas and https://www.portcoquitlam.ca/recreation-parks/parks-trails/parks-directory/castle-park. Reviewed on July 30, 2026. This page was corrected because the original record used the wrong municipality and incorrectly described the park as a fenced gravel dog area.</p>';

Object.assign(park, {
  title: 'Castle Park | Port Coquitlam Off-Leash Dog Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    City: ['Port Coquitlam'],
    Province: ['British Columbia'],
    Tags: ['off-leash', 'unfenced', 'family-park', 'port-coquitlam'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Castle Park | Port Coquitlam Off-Leash Dog Area',
  Description:
    '<p>Castle Park is an official Port Coquitlam off-leash dog area at 2252 Castle Crescent, featuring an unfenced grass park setting with trails, family amenities, and on-site dog waste stations.</p>',
  'Park type': 'Park',
  'Street Address': '2252 Castle Crescent',
  latitude: '49.23283796225187',
  longitude: '-122.77630166490995',
  City: 'Port Coquitlam',
  Province: 'British Columbia',
  'Postal Code': 'V3C 5X8',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Open grass park with walking paths',
  Size: '108,499 m²',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely in general park areas - verify on arrival',
  'Shaded area': 'Yes - mature trees throughout park',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.portcoquitlam.ca/services/pets-wildlife/dogs/leash-dog-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=2252+Castle+Crescent+Port+Coquitlam+BC',
  Tags: 'off-leash,unfenced,family-park,port-coquitlam',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'castle-park', {
  'Park Header': 'Castle Park | Port Coquitlam Off-Leash Dog Area',
  Description:
    '<p>Castle Park is an official Port Coquitlam off-leash dog area at 2252 Castle Crescent, featuring an unfenced grass park setting with trails, family amenities, and on-site dog waste stations.</p>',
  'Park type': 'Park',
  'Street Address': '2252 Castle Crescent',
  latitude: '49.23283796225187',
  longitude: '-122.77630166490995',
  City: 'Port Coquitlam',
  Province: 'British Columbia',
  'Postal Code': 'V3C 5X8',
  Fenced: 'No',
  'Separate Small Dog Area': 'No',
  'Surface type': 'Open grass park with walking paths',
  Size: '108,499 m²',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely in general park areas - verify on arrival',
  'Shaded area': 'Yes - mature trees throughout park',
  'Waste bins': 'Yes',
  'Bag Dispensers': 'Yes',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted city rules and seasonal notices',
  'Park Website or Source': 'https://www.portcoquitlam.ca/services/pets-wildlife/dogs/leash-dog-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=2252+Castle+Crescent+Port+Coquitlam+BC',
  Tags: 'off-leash,unfenced,family-park,port-coquitlam',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Castle Park,/dog-parks/castle-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/castle-park/"') || row.join(',').includes(',/dog-parks/castle-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 589 pages in the current working queue.', 'This backlog contains 588 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 228 |', '| T2-high-value-expansion | 227 |');
summary = summary.replace('| Dog Parks | 416 |', '| Dog Parks | 415 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Castle Park record and refreshed backlog files.');
