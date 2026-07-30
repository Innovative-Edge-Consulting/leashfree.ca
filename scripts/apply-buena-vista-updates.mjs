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
const park = parks.find((entry) => entry.slug === 'buena-vista-park-off-leash-dog-park');

if (!park) {
  throw new Error('Buena Vista Park Off-Leash Dog Park record not found');
}

const seoTitle = 'Buena Vista Park Off-Leash Dog Park | Edmonton Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Buena Vista Park Off-Leash Dog Park in Edmonton, including official park hours, washroom hours, accessible amenities, multi-use trails, and current City of Edmonton off-leash rules.';
const intro =
  '<p>Buena Vista Park is a City of Edmonton river valley park with a <strong>large off-leash area</strong>, multi-use trails, and official park hours of <strong>5am to 11pm</strong>.</p>';
const body =
  "<p>The official City of Edmonton page gives Buena Vista Park much stronger structure than the old generic summary. The park sits at <strong>13210 Buena Vista Road</strong> on the north bank of the river beside Sir Wilfrid Laurier Park and Hawrelak Park. The city specifically describes it as home to a <strong>large off-leash area</strong> and <strong>numerous multi-use trails</strong>, which is a more accurate picture than treating it like a simple field-only dog run. This is a larger river valley setting where off-leash space and trail access work together.</p><p>The city also publishes practical details that are useful for trip planning. Buena Vista Park hours are listed as <strong>5am to 11pm</strong>, with <strong>washrooms open 9am to 9pm</strong>. Accessibility details are stronger than many other off-leash pages too: the city notes <strong>accessible parking stalls</strong>, <strong>wide gravel and paved paths</strong>, and <strong>accessible washrooms near the off-leash meadow</strong>. For dog owners who need a site with easier navigation and facilities, that is materially more useful than generic prose about scenic trails.</p><p>Edmonton&apos;s current off-leash rules add the missing behavioural expectations. Dogs must be on leash when entering or leaving off-leash boundaries, owners must keep dogs under control and in sight at all times, wildlife must not be chased, and owners are expected to clean up after their dogs. The city also tells visitors to license their dogs and keep vaccinations and deworming current before using off-leash areas. Those source-backed rules are what make the page practically useful instead of just descriptive.</p>";
const notes =
  '<p>Primary source: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/buena-vista-park. Supporting sources: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites, https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/river-valley-parks, and https://www.edmonton.ca/projects_plans/parks_recreation/dogs-in-open-spaces. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Buena Vista Park Off-Leash Dog Park | Edmonton Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'river-valley', 'trails', 'accessible', 'edmonton'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Buena Vista Park Off-Leash Dog Park | Edmonton Dog Park',
  Description:
    '<p>Buena Vista Park is a major Edmonton river valley off-leash destination with open meadow space, multi-use trails, and accessible park amenities.</p>',
  'Street Address': '13210 Buena Vista Road',
  'Park type': 'Park',
  latitude: '53.51367',
  longitude: '-113.54772',
  'Surface type': 'Grass meadow, wide gravel paths, and paved paths',
  Size: 'Large off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Yes - some tree cover and surrounding parkland',
  'Waste bins': 'Expected at main park areas - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes, including accessible parking stalls',
  'Washrooms nearby': 'Yes - amenity building washrooms',
  'Operating hours': '5am to 11pm',
  'Seasonal Restrictions': 'Check trail conditions, wildlife activity, and posted city notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/buena-vista-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=13210+Buena+Vista+Road+Edmonton+AB',
  Tags: 'off-leash,river-valley,trails,accessible,edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'buena-vista-park-off-leash-dog-park', {
  'Park Header': 'Buena Vista Park Off-Leash Dog Park | Edmonton Dog Park',
  Description:
    '<p>Buena Vista Park is a major Edmonton river valley off-leash destination with open meadow space, multi-use trails, and accessible park amenities.</p>',
  'Street Address': '13210 Buena Vista Road',
  'Park type': 'Park',
  latitude: '53.51367',
  longitude: '-113.54772',
  'Surface type': 'Grass meadow, wide gravel paths, and paved paths',
  Size: 'Large off-leash area',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Yes',
  'Shaded area': 'Yes - some tree cover and surrounding parkland',
  'Waste bins': 'Expected at main park areas - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes, including accessible parking stalls',
  'Washrooms nearby': 'Yes - amenity building washrooms',
  'Operating hours': '5am to 11pm',
  'Seasonal Restrictions': 'Check trail conditions, wildlife activity, and posted city notices',
  'Park Website or Source': 'https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/buena-vista-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=13210+Buena+Vista+Road+Edmonton+AB',
  Tags: 'off-leash,river-valley,trails,accessible,edmonton',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Buena Vista Park Off-Leash Dog Park,/dog-parks/buena-vista-park-off-leash-dog-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/buena-vista-park-off-leash-dog-park/"') || row.join(',').includes(',/dog-parks/buena-vista-park-off-leash-dog-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 598 pages in the current working queue.', 'This backlog contains 597 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 237 |', '| T2-high-value-expansion | 236 |');
summary = summary.replace('| Dog Parks | 425 |', '| Dog Parks | 424 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Buena Vista Park Off-Leash Dog Park record and refreshed backlog files.');
