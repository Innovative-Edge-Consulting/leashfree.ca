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
const park = parks.find((entry) => entry.slug === 'ellison-dog-park-kelowna');

if (!park) {
  throw new Error('Ellison Dog Park record not found');
}

const seoTitle = 'Ellison Dog Park | Kelowna Off-Leash Dog Park | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Ellison Dog Park in Kelowna, including the City of Kelowna listing at 4720 Old Vernon Rd, off-leash status, 7.02-hectare size, trail access, and current off-leash rules.';
const intro =
  '<p>Ellison Dog Park is a City of Kelowna off-leash park at <strong>4720 Old Vernon Rd</strong>, where the current official listing shows <strong>trails</strong>, <strong>off-leash dog status</strong>, and a published area of <strong>7.02 hectares</strong>.</p>';
const body =
  "<p>The official City of Kelowna park page gives this profile much stronger footing than the older placeholder copy. The city identifies Ellison Dog Park as a <strong>park</strong>, not just a generic fenced run, and places it at <strong>4720 Old Vernon Rd</strong> in the Ellison area near the airport. It also confirms one of the main reasons this park stands out in Kelowna&apos;s network: the site is large by local standards at <strong>7.02 ha</strong> and specifically lists <strong>trails</strong> as an amenity, which suggests a broader exercise setting than a small neighbourhood enclosure.</p><p>Kelowna&apos;s main dog parks page separately includes the site in the city&apos;s off-leash network, although that overview uses the name <strong>Ellison Fields Dog Park</strong> and lists <strong>4680 Old Vernon Road</strong>. Rather than hide that inconsistency, this guide should acknowledge it. For page-level accuracy, the park-specific city listing is the stronger source, so it is the primary reference here. The location naming variation is still useful for searchers because local residents may encounter either version.</p><p>The city&apos;s published off-leash rules also add practical value that the old page lacked. Handlers must keep dogs under control and in view, leash dogs when entering and exiting the off-leash area, remove dogs at the first sign of aggression, and keep no more than two dogs per handler. Kelowna also requires visible dog licences and expects owners to pick up waste immediately. Those rules make this page more useful than generic prose because they help visitors prepare for an actual trip instead of just reading a thin summary.</p>";
const notes =
  '<p>Primary source: https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/ellison-dog-park. Supporting source: https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks. The supporting source currently uses the name Ellison Fields Dog Park and lists 4680 Old Vernon Road, while the park-specific listing uses Ellison Dog Park at 4720 Old Vernon Rd. Reviewed on July 30, 2026.</p>';

Object.assign(park, {
  title: 'Ellison Dog Park | Kelowna Off-Leash Dog Park',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['off-leash', 'trails', 'large-park', 'kelowna'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Ellison Dog Park | Kelowna Off-Leash Dog Park',
  Description:
    '<p>Ellison Dog Park is a large off-leash City of Kelowna park with trail access in the Ellison area near the airport.</p>',
  'Street Address': '4720 Old Vernon Rd',
  'Park type': 'Park',
  latitude: '49.94892',
  longitude: '-119.37025',
  'Surface type': 'Grass and trail surfaces - verify on arrival',
  Size: '7.02 ha',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some shade may be available - verify on arrival',
  'Waste bins': 'Expected at city park - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - verify exact access on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Check city signage on arrival',
  'Seasonal Restrictions': 'Check posted rules and city updates',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/ellison-dog-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Ellison+Dog+Park+4720+Old+Vernon+Rd+Kelowna+BC',
  Tags: 'off-leash,trails,large-park,kelowna',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'ellison-dog-park-kelowna', {
  'Park Header': 'Ellison Dog Park | Kelowna Off-Leash Dog Park',
  Description:
    '<p>Ellison Dog Park is a large off-leash City of Kelowna park with trail access in the Ellison area near the airport.</p>',
  'Street Address': '4720 Old Vernon Rd',
  'Park type': 'Park',
  latitude: '49.94892',
  longitude: '-119.37025',
  'Surface type': 'Grass and trail surfaces - verify on arrival',
  Size: '7.02 ha',
  'Water source available': 'Unknown - verify on arrival',
  Benches: 'Unknown - verify on arrival',
  'Shaded area': 'Some shade may be available - verify on arrival',
  'Waste bins': 'Expected at city park - verify on arrival',
  'Bag Dispensers': 'Unknown - verify on arrival',
  'Parking Available': 'Yes - verify exact access on arrival',
  'Washrooms nearby': 'Unknown - verify on arrival',
  'Operating hours': 'Check city signage on arrival',
  'Seasonal Restrictions': 'Check posted rules and city updates',
  'Park Website or Source': 'https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/ellison-dog-park',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=Ellison+Dog+Park+4720+Old+Vernon+Rd+Kelowna+BC',
  Tags: 'off-leash,trails,large-park,kelowna',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Ellison Dog Park,/dog-parks/ellison-dog-park-kelowna/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/ellison-dog-park-kelowna/"') || row.join(',').includes(',/dog-parks/ellison-dog-park-kelowna/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 601 pages in the current working queue.', 'This backlog contains 600 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 240 |', '| T2-high-value-expansion | 239 |');
summary = summary.replace('| Dog Parks | 428 |', '| Dog Parks | 427 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Ellison Dog Park record and refreshed backlog files.');
