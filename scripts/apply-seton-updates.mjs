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
const park = parks.find((entry) => entry.slug === 'seton-off-leash-area');

if (!park) {
  throw new Error('Seton Off-Leash Area record not found');
}

const seoTitle = 'Seton Off-Leash Area | Calgary Dog Park Guide | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Seton Off-Leash Area in Calgary, covering its status on the City of Calgary off-leash list, standard off-leash rules, pathway leash requirement, and neighbourhood context near Seton’s expanding park system.';
const intro =
  '<p>Seton Off-Leash Area is one of the City of Calgary&apos;s listed southeast off-leash locations, serving the fast-growing Seton area within Calgary&apos;s larger developing parks and pathway network.</p>';
const body =
  "<p>The current City of Calgary off-leash page lists <strong>Seton</strong> in the southeast quadrant, which confirms this page should be treated as a real municipal off-leash location rather than a generic neighbourhood green space. Calgary&apos;s official off-leash guidance also applies here: off-leash areas are <strong>multi-use areas</strong>, and <strong>dogs are required to be on leash on a paved pathway in an off-leash area</strong>. That is especially important in Seton, where newer residential development and ongoing park buildout mean shared paths and mixed public use are part of the expected experience.</p><p>Calgary&apos;s broader Seton park planning context matters too. The city has an active Seton Regional Park project, which confirms the surrounding area is still evolving as a major public-space node in southeast Calgary. Because the city source available here is a system listing rather than a detailed park-facility page, this guide keeps the claims conservative and avoids inventing exact amenities that are not clearly published in the reviewed source set. It is more accurate to describe Seton as a practical local off-leash option in a newer suburban setting than to overstate special features.</p><p>Use the page as a planning guide rather than a promise of every on-site detail. The official Calgary source supports the off-leash designation and standard hours of <strong>5 am to 11 pm</strong>. For everything else, especially parking convenience, shade, and exact surface conditions, confirm with signage when you arrive because neighbourhood infrastructure in Seton can change as the area continues to develop.</p>";
const notes =
  '<p>Primary source: https://www.calgary.ca/parks/off-leash-locations.html. Supporting neighbourhood context source: the City of Calgary&apos;s Seton Regional Park project page, which confirms active long-term park development in Seton. Coordinates below are approximate and provided for map support because the reviewed city source set did not publish a direct park-detail page with a single definitive coordinate pin.</p>';

Object.assign(park, {
  title: 'Seton Off-Leash Area | Calgary Dog Park Guide',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'seton', 'southeast-calgary', 'developing-neighbourhood'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Seton Off-Leash Area | Calgary Dog Park Guide',
  Description:
    '<p>Seton Off-Leash Area is one of Calgary&apos;s listed southeast off-leash locations, serving a newer suburban neighbourhood with shared multi-use park space.</p>',
  latitude: '50.8806',
  longitude: '-113.9588',
  'Surface type': 'Grass and shared pathway-connected parkland',
  Size: 'Unknown - verify on arrival',
  'Water source available': 'Unknown - bring your own water',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Limited',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Unknown - verify on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': '5:00 AM to 11:00 PM',
  'Seasonal Restrictions': 'Standard Calgary off-leash rules apply',
  'Park Website or Source': 'https://www.calgary.ca/parks/off-leash-locations.html',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Seton+Off-Leash+Area+Calgary',
  Tags: 'off-leash, seton, southeast-calgary, developing-neighbourhood',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'seton-off-leash-area', {
  'Park Header': 'Seton Off-Leash Area | Calgary Dog Park Guide',
  Description:
    '<p>Seton Off-Leash Area is one of Calgary&apos;s listed southeast off-leash locations, serving a newer suburban neighbourhood with shared multi-use park space.</p>',
  latitude: '50.8806',
  longitude: '-113.9588',
  'Surface type': 'Grass and shared pathway-connected parkland',
  Size: 'Unknown - verify on arrival',
  'Water source available': 'Unknown - bring your own water',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Limited',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Unknown - verify on arrival',
  'Washrooms nearby': 'Unknown',
  'Operating hours': '5:00 AM to 11:00 PM',
  'Seasonal Restrictions': 'Standard Calgary off-leash rules apply',
  'Park Website or Source': 'https://www.calgary.ca/parks/off-leash-locations.html',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Seton+Off-Leash+Area+Calgary',
  Tags: 'off-leash, seton, southeast-calgary, developing-neighbourhood',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-29',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Seton Off-Leash Area,/dog-parks/seton-off-leash-area/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/seton-off-leash-area/"') || row.join(',').includes(',/dog-parks/seton-off-leash-area/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 603 pages in the current working queue.', 'This backlog contains 602 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 242 |', '| T2-high-value-expansion | 241 |');
summary = summary.replace('| Dog Parks | 430 |', '| Dog Parks | 429 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Seton Off-Leash Area record and refreshed backlog files.');
