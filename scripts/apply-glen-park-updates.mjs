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
const park = parks.find((entry) => entry.slug === 'glen-park');

if (!park) {
  throw new Error('Glen Park record not found');
}

const seoTitle = 'Glen Park | Coquitlam Dog Off-Leash Area | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Glen Park in Coquitlam, including official off-leash access details, fenced natural setting, separate large and small dog sections, and current 2026 park upgrade plans.';
const intro =
  '<p>Glen Park is one of Coquitlam&apos;s official dog off-leash sites, with a <strong>fenced natural area</strong>, <strong>separate sections for large and small dogs</strong>, and park access from <strong>Westwood or Pipeline</strong>.</p>';
const body =
  '<p>Coquitlam&apos;s current off-leash page confirms Glen Park as an official dog off-leash location and fills in several details missing from the older thin profile. The city lists the off-leash area at <strong>149 Westwood Street</strong> and describes it as a <strong>fenced natural area with large trees</strong> and <strong>separate sections for large or small dogs</strong>. The city also notes that the site can be accessed from either <strong>Westwood</strong> or <strong>Pipeline</strong> streets, with parking available off Westwood Street.</p><p>The city&apos;s broader facilities page adds useful park context around the dog area. Glen Park as a whole is listed at <strong>1149 Westwood Street</strong> and includes features such as <strong>picnic areas</strong>, a <strong>playground</strong>, <strong>trails</strong>, and a <strong>baseball/softball diamond</strong>. The park description positions it as an active green space in Coquitlam&apos;s City Centre, with seating, trails, an open grass area, and a fenced dog park that serves as a regular neighbourhood meeting place.</p><p>Operating rules are clearer now as well. The official off-leash page says the area is open <strong>daily from dawn to dusk</strong>, and allows a <strong>maximum of three dogs per person</strong>. Coquitlam&apos;s general off-leash guidance also says owners must maintain control of their dogs at all times, avoid disturbing wildlife or sensitive habitat, and not bring dogs that are defined as aggressive or vicious under the city bylaw.</p><p>There is also current project activity that makes this page more timely. As of <strong>June 2, 2026</strong>, Coquitlam says the Glen Park off-leash area is being <strong>relocated and upgraded</strong> as part of a larger park improvements project. The city&apos;s current plan adds <strong>lighting</strong>, <strong>drinking water</strong>, <strong>seating</strong>, <strong>agility features</strong>, and <strong>shade</strong>, while keeping the existing off-leash area open until the new one is ready. For users, that means Glen Park is already a legitimate off-leash stop and may become an even stronger option once the current improvement phase is completed.</p>';
const notes =
  '<p>Primary sources: https://www.coquitlam.ca/527/Leashed-Off-Leash-Dog-Areas and https://www.coquitlam.ca/Facilities/Facility/Details/Glen-Park-40. Supporting source: https://www.coquitlam.ca/m/newsflash/Home/Detail/1967. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Glen Park | Coquitlam Dog Off-Leash Area',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'fenced', 'small-dog-area', 'coquitlam'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Glen Park | Coquitlam Dog Off-Leash Area',
  Description:
    '<p>Glen Park is an official Coquitlam off-leash site with a fenced natural dog area, separate sections for large and small dogs, and current city-planned upgrades including lighting and drinking water.</p>',
  'Park type': 'Park',
  'Street Address': '149 Westwood Street',
  latitude: '49.2816',
  longitude: '-122.7924',
  'Surface type': 'Natural fenced area with grass and woodchip surfaces',
  Size: 'Neighbourhood fenced off-leash area within larger park',
  'Water source available': 'City-planned drinking water upgrade; verify current availability on arrival',
  Benches: 'Some seating in park areas; verify exact dog-area seating on arrival',
  'Shaded area': 'Yes - large mature trees',
  'Waste bins': 'Expected at park - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - parking off Westwood Street',
  'Washrooms nearby': 'No city-confirmed washroom in current off-leash listing',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Check posted construction notices and city updates',
  'Park Website or Source': 'https://www.coquitlam.ca/527/Leashed-Off-Leash-Dog-Areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=149+Westwood+Street+Coquitlam+BC',
  Tags: 'off-leash,fenced,small-dog-area,coquitlam',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'glen-park', {
  'Park Header': 'Glen Park | Coquitlam Dog Off-Leash Area',
  Description:
    '<p>Glen Park is an official Coquitlam off-leash site with a fenced natural dog area, separate sections for large and small dogs, and current city-planned upgrades including lighting and drinking water.</p>',
  'Park type': 'Park',
  'Street Address': '149 Westwood Street',
  latitude: '49.2816',
  longitude: '-122.7924',
  'Surface type': 'Natural fenced area with grass and woodchip surfaces',
  Size: 'Neighbourhood fenced off-leash area within larger park',
  'Water source available': 'City-planned drinking water upgrade; verify current availability on arrival',
  Benches: 'Some seating in park areas; verify exact dog-area seating on arrival',
  'Shaded area': 'Yes - large mature trees',
  'Waste bins': 'Expected at park - verify exact placement on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - parking off Westwood Street',
  'Washrooms nearby': 'No city-confirmed washroom in current off-leash listing',
  'Operating hours': 'Dawn to dusk',
  'Seasonal Restrictions': 'Check posted construction notices and city updates',
  'Park Website or Source': 'https://www.coquitlam.ca/527/Leashed-Off-Leash-Dog-Areas',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=149+Westwood+Street+Coquitlam+BC',
  Tags: 'off-leash,fenced,small-dog-area,coquitlam',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Glen Park,/dog-parks/glen-park/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/glen-park/"') || row.join(',').includes(',/dog-parks/glen-park/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 588 pages in the current working queue.', 'This backlog contains 587 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 227 |', '| T2-high-value-expansion | 226 |');
summary = summary.replace('| Dog Parks | 415 |', '| Dog Parks | 414 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Glen Park record and refreshed backlog files.');
