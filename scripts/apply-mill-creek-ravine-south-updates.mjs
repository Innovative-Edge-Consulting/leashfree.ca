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
const park = parks.find((entry) => entry.slug === 'mill-creek-ravine-south-off-leash');

if (!park) {
  throw new Error('Mill Creek Ravine South Off-Leash Area record not found');
}

const seoTitle = 'Mill Creek Ravine South Off-Leash Area | Edmonton Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Mill Creek Ravine South Off-Leash Area in Edmonton, based on the City of Edmonton’s Mill Creek Ravine Park page with park hours, official location, parking access, pathways, and off-leash rules.';
const intro =
  '<p>Mill Creek Ravine South Off-Leash Area is best understood as part of <strong>Mill Creek Ravine Park</strong>, a large City of Edmonton ravine park with a published <strong>off-leash area</strong>, shared pathways, and park hours of <strong>5am to 11pm</strong>.</p>';
const body =
  "<p>The official City of Edmonton source is broader and more useful than the old one-paragraph profile. Rather than treating this as a standalone fenced dog park, the city describes <strong>Mill Creek Ravine Park</strong> as a north-south ravine corridor running from <strong>Connors Road to Argyll Road (63 Avenue)</strong>. The current park page lists an <strong>off-leash area</strong> among its amenities along with <strong>paved and granular shared pathways</strong>, walking and cycling trails, walk-in picnic sites, and parking access near <strong>95A Street and 82 Avenue</strong>. That framing matters because visitors should expect a natural shared-use ravine setting, not a compact enclosed run.</p><p>The city also publishes park hours of <strong>5am to 11pm</strong> and gives an official park location of <strong>9116 68 Avenue NW</strong>. Edmonton&apos;s alphabetical park listing adds a second useful access reference by listing Mill Creek Ravine Park in the Mill Creek Ravine South area at <strong>8323 95A Street NW</strong>. Using both references makes the page more practical: the formal park page helps define the overall site, while the neighbourhood listing and parking note help users understand where people commonly enter the ravine.</p><p>Edmonton&apos;s off-leash guidance adds the missing rules. Dogs must be on leash when entering or leaving off-leash boundaries, owners must keep dogs under control and in sight, and wildlife is present throughout the park system, so dogs should not be allowed to chase animals. The city also tells owners to license their dogs, keep vaccinations and deworming current, and clean up after them. Those are the details that turn this from a thin SEO page into an actual trip-planning resource.</p>";
const notes =
  '<p>Primary source: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/mill-creek-ravine. Supporting source: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites. Additional park listing source: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/neighbourhood-parks-alphabetical-listing. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Mill Creek Ravine South Off-Leash Area | Edmonton Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'ravine-trails', 'shared-use-park', 'edmonton'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Mill Creek Ravine South Off-Leash Area | Edmonton Dog Park',
  Description:
    '<p>Mill Creek Ravine South Off-Leash Area is part of Edmonton&apos;s larger Mill Creek Ravine Park, with natural trails, shared pathways, and broad off-leash walking space.</p>',
  'Street Address': '9116 68 Avenue NW',
  'Park type': 'Park',
  latitude: '53.5049',
  longitude: '-113.4740',
  'Surface type': 'Paved and granular shared pathways, plus natural ravine trails',
  Size: 'Large ravine corridor',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Picnic and rest areas may be available - verify on arrival',
  'Shaded area': 'Yes',
  'Waste bins': 'Expected at major access points - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Parking at 95A Street and 82 Avenue',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': '5am to 11pm',
  'Seasonal Restrictions': 'Check trail conditions, wildlife activity, and posted city notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/mill-creek-ravine',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Mill+Creek+Ravine+Park+9116+68+Avenue+NW+Edmonton+AB',
  Tags: 'off-leash,ravine-trails,shared-use-park,edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'mill-creek-ravine-south-off-leash', {
  'Park Header': 'Mill Creek Ravine South Off-Leash Area | Edmonton Dog Park',
  Description:
    '<p>Mill Creek Ravine South Off-Leash Area is part of Edmonton&apos;s larger Mill Creek Ravine Park, with natural trails, shared pathways, and broad off-leash walking space.</p>',
  'Street Address': '9116 68 Avenue NW',
  'Park type': 'Park',
  latitude: '53.5049',
  longitude: '-113.4740',
  'Surface type': 'Paved and granular shared pathways, plus natural ravine trails',
  Size: 'Large ravine corridor',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Picnic and rest areas may be available - verify on arrival',
  'Shaded area': 'Yes',
  'Waste bins': 'Expected at major access points - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Parking at 95A Street and 82 Avenue',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': '5am to 11pm',
  'Seasonal Restrictions': 'Check trail conditions, wildlife activity, and posted city notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/mill-creek-ravine',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Mill+Creek+Ravine+Park+9116+68+Avenue+NW+Edmonton+AB',
  Tags: 'off-leash,ravine-trails,shared-use-park,edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Mill Creek Ravine South Off-Leash Area,/dog-parks/mill-creek-ravine-south-off-leash/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/mill-creek-ravine-south-off-leash/"') || row.join(',').includes(',/dog-parks/mill-creek-ravine-south-off-leash/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 600 pages in the current working queue.', 'This backlog contains 599 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 239 |', '| T2-high-value-expansion | 238 |');
summary = summary.replace('| Dog Parks | 427 |', '| Dog Parks | 426 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Mill Creek Ravine South Off-Leash Area record and refreshed backlog files.');
