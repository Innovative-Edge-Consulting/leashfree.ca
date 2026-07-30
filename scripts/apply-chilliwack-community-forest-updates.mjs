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
const park = parks.find((entry) => entry.slug === 'chilliwack-community-forest');

if (!park) {
  throw new Error('Chilliwack Community Forest record not found');
}

const seoTitle = 'Chilliwack Community Forest | Chilliwack Dog-Friendly Trails | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Chilliwack Community Forest at 51642 Allan Road, including trail details, amenities, accessibility improvements, and the current City of Chilliwack off-leash listing context.';
const intro =
  '<p>Chilliwack Community Forest is a <strong>100-acre city-owned forest property</strong> at <strong>51642 Allan Road</strong> with multi-use trails, viewpoints, picnic amenities, and forest access for walkers, runners, and cyclists.</p>';
const body =
  '<p>The current City of Chilliwack page does <strong>not</strong> describe Chilliwack Community Forest as an official off-leash dog area. That matters because the old version of this page incorrectly presented it as a leash-free dog park. The city&apos;s dedicated off-leash page instead lists other locations such as Vedder Park, Island 22, Fairfield Park, Jinkerson Park, Sheffield Dog Off Leash Area, No. 3 Road Dog Off Leash Area, and the Vedder North Dyke Trail off-leash zone. Based on the city&apos;s current public information, Community Forest should be treated as a dog-friendly trail destination that needs on-site rule verification, not as a confirmed off-leash park.</p><p>What the official Community Forest page does confirm is that this is a substantial recreational forest developed in partnership with the <strong>Chilliwack Parks Society</strong> and the <strong>Fraser Valley Mountain Bike Association</strong>. The city says the site opened access to <strong>100 acres of City-owned forest property</strong> and includes <strong>picnic facilities</strong>, an <strong>outhouse</strong>, and a <strong>multi-use trail system</strong> for hiking, biking, and running. Phase one includes a <strong>2.5-kilometre beginner trail loop</strong> plus several moderate trail loops.</p><p>The city adds useful trail-quality detail missing from the old thin profile. The shorter loop has <strong>interpretive signage</strong>, <strong>resting benches at scenic viewpoints</strong>, and an average grade of less than <strong>5%</strong>. The moderate trails reach grades of up to <strong>9%</strong> and provide multiple looping options. That makes this page more useful for dog owners who are trying to judge whether the setting is a casual walk, a conditioning trail, or a more varied forest outing.</p><p>There is also recent evidence that the site continues to receive municipal investment. On <strong>June 4, 2025</strong>, the City of Chilliwack announced accessible parking enhancements at Chilliwack Community Forest as part of a broader parks accessibility project. That supports the city&apos;s current positioning of the site as an active public trail and recreation area. For leash-free visitors, the practical takeaway is straightforward: if you want a confirmed off-leash outing in Chilliwack, use one of the city&apos;s listed off-leash areas. If you want a scenic forest trail network, Community Forest is the stronger fit.</p>';
const notes =
  '<p>Primary sources: https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=183 and https://www.chilliwack.com/main/page.cfm?id=2579. Supporting sources: https://www.chilliwack.com/main/page.cfm?id=3173 and https://www.chilliwack.com/main/page.cfm?id=37&prID=591&prshow=details. Reviewed on July 30, 2026. This page was corrected because the current City of Chilliwack sources do not list Community Forest as an official off-leash dog area.</p>';

Object.assign(park, {
  title: 'Chilliwack Community Forest | Chilliwack Dog-Friendly Trails',
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    ...(park.references || {}),
    Tags: ['dog-friendly', 'forest-trails', 'chilliwack', 'community-forest'],
  },
});

Object.assign(park.raw, {
  'Park Header': 'Chilliwack Community Forest | Chilliwack Dog-Friendly Trails',
  Description:
    '<p>Chilliwack Community Forest is a 100-acre city forest at 51642 Allan Road with multi-use trails, viewpoints, picnic amenities, and current source-backed clarification that it is not listed by the city as an official off-leash dog area.</p>',
  'Park type': 'Park / trail network',
  'Street Address': '51642 Allan Road',
  latitude: '49.0794',
  longitude: '-121.8543',
  'Surface type': 'Natural forest trails',
  Size: '100 acres',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Yes - resting benches at scenic viewpoints',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dispensers noted',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Outhouse',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted trail and weather conditions',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=183',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=51642+Allan+Road+Chilliwack+BC',
  Tags: 'dog-friendly,forest-trails,chilliwack,community-forest',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'chilliwack-community-forest', {
  'Park Header': 'Chilliwack Community Forest | Chilliwack Dog-Friendly Trails',
  Description:
    '<p>Chilliwack Community Forest is a 100-acre city forest at 51642 Allan Road with multi-use trails, viewpoints, picnic amenities, and current source-backed clarification that it is not listed by the city as an official off-leash dog area.</p>',
  'Park type': 'Park / trail network',
  'Street Address': '51642 Allan Road',
  latitude: '49.0794',
  longitude: '-121.8543',
  'Surface type': 'Natural forest trails',
  Size: '100 acres',
  'Water source available': 'No city-confirmed drinking water noted',
  Benches: 'Yes - resting benches at scenic viewpoints',
  'Shaded area': 'Yes',
  'Waste bins': 'Unknown - verify on arrival',
  'Bag Dispensers': 'No city-confirmed dispensers noted',
  'Parking Available': 'Yes',
  'Washrooms nearby': 'Outhouse',
  'Operating hours': 'Verify posted hours on arrival',
  'Seasonal Restrictions': 'Check posted trail and weather conditions',
  'Park Website or Source': 'https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=183',
  'Google Maps Link': 'https://www.google.com/maps/search/?api=1&query=51642+Allan+Road+Chilliwack+BC',
  Tags: 'dog-friendly,forest-trails,chilliwack,community-forest',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-07-30',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(
  backlogPath,
  (row) => row.join(',').includes(',Dog Parks,Chilliwack Community Forest,/dog-parks/chilliwack-community-forest/,'),
);

removeCsvRow(
  reviewQueuePath,
  (row) => row.join(',').includes('"/dog-parks/chilliwack-community-forest/"') || row.join(',').includes(',/dog-parks/chilliwack-community-forest/,'),
);

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 594 pages in the current working queue.', 'This backlog contains 593 pages in the current working queue.');
summary = summary.replace('| T2-high-value-expansion | 233 |', '| T2-high-value-expansion | 232 |');
summary = summary.replace('| Dog Parks | 421 |', '| Dog Parks | 420 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Chilliwack Community Forest record and refreshed backlog files.');
