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
const park = parks.find((entry) => entry.slug === 'rushdale-park');

if (!park) {
  throw new Error('Rushdale Park record not found');
}

const seoTitle = 'Rushdale Park | Dog-Friendly Park in Hamilton, Ontario | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Rushdale Park in Hamilton, including the official 130 Southpark Ave location, current city-program context, and why dog owners should treat it as an on-leash neighbourhood park rather than an off-leash dog park.';
const intro =
  '<p>Rushdale Park is a regular Hamilton neighbourhood park where dogs are welcome on leash, not one of the City of Hamilton&apos;s published off-leash dog parks or free running areas.</p>';
const body =
  "<p>The strongest current City of Hamilton sources place Rushdale Park at <strong>130 Southpark Ave</strong> in Ward 7. Hamilton&apos;s smoke- and vape-free parks list names Rushdale Park at that address, and the city&apos;s current Supie recreation page lists <strong>Rushdale (TB McQuesten)</strong> at the same 130 Southpark Avenue location for Summer Supie programming running from June 29 to August 28, 2026. The city&apos;s outdoor ice page also lists Rushdale Park among Hamilton&apos;s community rink locations, which supports the park&apos;s role as a year-round local recreation space rather than a dog-dedicated facility.</p><p>That distinction matters for dog owners. Hamilton&apos;s official dog-park page publishes fenced dog parks and free running areas separately, and Rushdale Park does not appear on that list in the current source set reviewed on July 29, 2026. This page therefore treats Rushdale Park as a <strong>dog-friendly on-leash park</strong>: useful for neighbourhood walks, short sniff breaks, and general park access with your dog, but not something you should rely on as an official off-leash destination. If you specifically want off-leash play in Hamilton, use the city&apos;s dog park and free running area listings before you go.</p><p>The city does not publish a park-specific amenities page for Rushdale in the source set used here, so this guide avoids claiming unsupported details about fencing, dog amenities, or exact park size. Coordinates below are provided only to improve map placement for this profile and were aligned to the park footprint from a mapping source because Hamilton did not publish lat/long on the pages reviewed.</p>";
const notes =
  '<p>Primary official source used for this refresh: https://www.hamilton.ca/things-do/recreation/programs/outdoor-programs/supie. Supporting official sources: https://www.hamilton.ca/people-programs/public-health/smoking-vaping/smoke-vape-free-spaces, https://www.hamilton.ca/things-do/recreation/programs/outdoor-programs/outdoor-ice, and Hamilton&apos;s dog parks and free running areas page at https://www.hamilton.ca/home-neighbourhood/animals-pets/dogs/dog-parks-and-free-running-areas. Latitude and longitude were added for mapping support because the city sources reviewed did not publish them directly.</p>';

Object.assign(park, {
  title: 'Rushdale Park | Dog-Friendly Park in Hamilton',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['on-leash', 'neighbourhood-park', 'year-round', 'hamilton'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Rushdale Park | Dog-Friendly Park in Hamilton',
  Description:
    '<p>Rushdale Park is a regular Hamilton neighbourhood park where dogs are welcome on leash, not an official off-leash dog park.</p>',
  latitude: '43.20941',
  longitude: '-79.86308',
  'Surface type': 'Grass and paved paths',
  Size: 'Unknown - verify on arrival',
  'Water source available': 'Unknown',
  Benches: 'Unknown',
  'Shaded area': 'Unknown',
  'Waste bins': 'Unknown',
  'Bag Dispensers': 'Unknown',
  'Parking Available': 'Unknown - verify on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Check City of Hamilton park signage',
  'Seasonal Restrictions': 'See City of Hamilton seasonal program and maintenance updates',
  'Park Website or Source': 'https://www.hamilton.ca/things-do/recreation/programs/outdoor-programs/supie',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Rushdale+Park+130+Southpark+Ave+Hamilton+ON',
  Tags: 'on-leash, neighbourhood-park, year-round, hamilton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'rushdale-park', {
  'Park Header': 'Rushdale Park | Dog-Friendly Park in Hamilton',
  Description:
    '<p>Rushdale Park is a regular Hamilton neighbourhood park where dogs are welcome on leash, not an official off-leash dog park.</p>',
  latitude: '43.20941',
  longitude: '-79.86308',
  'Surface type': 'Grass and paved paths',
  Size: 'Unknown - verify on arrival',
  'Water source available': 'Unknown',
  Benches: 'Unknown',
  'Shaded area': 'Unknown',
  'Waste bins': 'Unknown',
  'Bag Dispensers': 'Unknown',
  'Parking Available': 'Unknown - verify on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': 'Check City of Hamilton park signage',
  'Seasonal Restrictions': 'See City of Hamilton seasonal program and maintenance updates',
  'Park Website or Source': 'https://www.hamilton.ca/things-do/recreation/programs/outdoor-programs/supie',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Rushdale+Park+130+Southpark+Ave+Hamilton+ON',
  Tags: 'on-leash, neighbourhood-park, year-round, hamilton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Rushdale Park,/dog-parks/rushdale-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/rushdale-park/"') || row.join(',').includes(',/dog-parks/rushdale-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 606 pages in the current working queue.', 'This backlog contains 605 pages in the current working queue.');
summary = summary.replace('| T1-source-research | 2 |', '| T1-source-research | 1 |');
summary = summary.replace('| Dog Parks | 433 |', '| Dog Parks | 432 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Rushdale Park record and refreshed backlog files.');
