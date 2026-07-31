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
const park = parks.find((entry) => entry.slug === 'willingdon-heights-park-burnaby');

if (!park) {
  throw new Error('Willingdon Heights Park record not found');
}

const seoTitle = 'Willingdon Heights Park | Burnaby Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Willingdon Heights Park in Burnaby, including the official 1491 Carleton Avenue address, fenced year-round off-leash enclosure, and current agility-course construction note.';
const intro =
  '<p>Willingdon Heights Park is one of Burnaby&apos;s official dog off-leash areas, with a <strong>fenced enclosure</strong> at <strong>1491 Carleton Avenue</strong> and <strong>year-round access</strong> in a busy neighbourhood park setting.</p>';
const body =
  '<p>Burnaby&apos;s current dog off-leash page confirms Willingdon Heights Park as an official off-leash site and gives the specific details missing from the older thin copy. The city lists the address as <strong>1491 Carleton Avenue</strong> and describes the dog area as a <strong>fenced enclosure with access year-round</strong>. Burnaby also notes that the park <strong>remains open while the on-site agility course is being completed</strong>, which is a useful current-status detail for visitors planning a trip.</p><p>The surrounding park context also matters here. Burnaby&apos;s Willingdon Community Centre page places the community centre within Willingdon Heights Park and highlights nearby family amenities including a <strong>children&apos;s playground</strong>, <strong>zipline</strong>, and <strong>wading pool</strong>. That makes this off-leash site part of a broader community park rather than a standalone dog-only destination, which is useful for households trying to combine dog time with other park activities.</p><p>There is also recent evidence that the park continues to receive upgrades. Burnaby&apos;s <strong>Day of Play</strong> event page for <strong>June 27, 2026</strong> says the city was officially opening <strong>two new basketball courts</strong> and a new <strong>court mural</strong> at Willingdon Heights Park. While that event is now past, it helps confirm that this is an active, improved neighbourhood park with continuing municipal investment around the same period as the off-leash agility work.</p><p>The city&apos;s standard off-leash rules apply here as well. Dogs must be leashed before and after entering the off-leash area, owners must keep a leash in hand while dogs are off-leash, aggressive dogs must be removed immediately, and Burnaby allows a <strong>maximum of two dogs per person</strong>. For users, the practical summary is simple: Willingdon Heights Park is a legitimate year-round Burnaby off-leash stop with a fenced enclosure in a well-used community park setting, and it currently remains usable while site improvements continue.</p>';
const notes =
  '<p>Primary sources: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas and https://www.burnaby.ca/recreation-and-arts/recreation-facilities/willingdon-community-centre. Supporting source: https://www.burnaby.ca/recreation-and-arts/events/day-play. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Willingdon Heights Park | Burnaby Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'fenced', 'year-round', 'burnaby'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Willingdon Heights Park | Burnaby Dog Off-Leash Area',
  Description:
    '<p>Willingdon Heights Park is an official Burnaby dog off-leash site at 1491 Carleton Avenue with a fenced year-round enclosure and current agility-course improvements in progress.</p>',
  'Park type': 'Park',
  'Street Address': '1491 Carleton Avenue',
  latitude: '49.2807',
  longitude: '-123.0045',
  'Surface type': 'Grass within fenced enclosure',
  Size: 'Neighbourhood fenced off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely in surrounding park areas - verify exact dog-area seating on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Expected at site - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes - community centre washrooms nearby',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access; check posted notices for agility work',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1491+Carleton+Avenue+Burnaby+BC',
  Tags: 'off-leash,fenced,year-round,burnaby',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'willingdon-heights-park-burnaby', {
  'Park Header': 'Willingdon Heights Park | Burnaby Dog Off-Leash Area',
  Description:
    '<p>Willingdon Heights Park is an official Burnaby dog off-leash site at 1491 Carleton Avenue with a fenced year-round enclosure and current agility-course improvements in progress.</p>',
  'Park type': 'Park',
  'Street Address': '1491 Carleton Avenue',
  latitude: '49.2807',
  longitude: '-123.0045',
  'Surface type': 'Grass within fenced enclosure',
  Size: 'Neighbourhood fenced off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Likely in surrounding park areas - verify exact dog-area seating on arrival',
  'Shaded area': 'Some tree cover - verify on arrival',
  'Waste bins': 'Expected at site - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Yes - community centre washrooms nearby',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Year-round access; check posted notices for agility work',
  'Park Website or Source': 'https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=1491+Carleton+Avenue+Burnaby+BC',
  Tags: 'off-leash,fenced,year-round,burnaby',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Willingdon Heights Park,/dog-parks/willingdon-heights-park-burnaby/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/willingdon-heights-park-burnaby/"') || row.join(',').includes(',/dog-parks/willingdon-heights-park-burnaby/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 587 pages in the current working queue.', 'This backlog contains 586 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 226 |', '| T2-high-value-expansion | 225 |');
summary = summary.replace('| Dog Parks | 414 |', '| Dog Parks | 413 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Willingdon Heights Park record and refreshed backlog files.');
