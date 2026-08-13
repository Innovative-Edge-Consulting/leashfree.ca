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
      if (char === '\r' && next === '\n') i += 1;
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
  if (keyIndex === -1) throw new Error(`CSV field not found: ${keyField}`);
  const row = rows.find((entry, index) => index > 0 && entry[keyIndex] === keyValue);
  if (!row) throw new Error(`CSV row not found for ${keyField}=${keyValue}`);
  for (const [field, value] of Object.entries(updates)) {
    const index = header.indexOf(field);
    if (index === -1) throw new Error(`CSV field not found: ${field}`);
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

function rebuildBacklogSummary() {
  const rows = parseCsv(fs.readFileSync(backlogPath, 'utf8'));
  const headers = rows[0];
  const bodyRows = rows
    .slice(1)
    .filter((row) => row.some((value) => value !== ''))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
  const countBy = (field) =>
    [...bodyRows.reduce((map, row) => {
      const key = row[field] || '';
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map()).entries()].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy('tier').map(([key, count]) => `| ${key} | ${count} |`).join('\n');
  const sectionRows = countBy('contentType').map(([key, count]) => `| ${key} | ${count} |`).join('\n');
  const topRows = bodyRows
    .slice(0, 50)
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === 'true' ? 'yes' : 'no'} |`,
    )
    .join('\n');

  const summary = `# Thin Page Improvement Backlog

Generated from \`reports/content-health.json\` on 2026-07-22.

This backlog contains ${bodyRows.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.

## Backlog counts

| Tier | Pages |
| --- | ---: |
${tierRows}

| Content type | Pages |
| --- | ---: |
${sectionRows}

## Prioritization

- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.
- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.
- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.
- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.

Do not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.

## First 50 pages

| # | Tier | Type | Page | Score | Words | Missing source |
| ---: | --- | --- | --- | ---: | ---: | --- |
${topRows}
`;
  fs.writeFileSync(backlogSummaryPath, summary);
}

const parks = JSON.parse(fs.readFileSync(parksPath, 'utf8'));
const park = parks.find((entry) => entry.slug === 'bowmont-park');
if (!park) throw new Error('Bowmont Park record not found');

const seoTitle = 'Bowmont Park Off-Leash Areas | Calgary';
const metaDescription =
  'Source-backed guide to Bowmont Park in Calgary, including the official park address, hours, designated off-leash areas, the fenced site near Silver Springs Gate, trail and river-valley setting, and current Calgary off-leash rules.';
const intro =
  '<p>Bowmont Park is one of Calgary&apos;s largest natural environment parks, and the city officially identifies it as a site with <strong>designated off-leash areas</strong> rather than a single stand-alone dog run. That distinction matters because this is a large multi-use river-valley park with several park functions layered together.</p>';
const body =
  '<p>The current City of Calgary park page confirms the key basics visitors need first: <strong>Bowmont Park</strong> is at <strong>85 St. N.W. &amp; 48 Ave. N.W.</strong>, covers about <strong>164 hectares</strong>, and is open daily from <strong>5 a.m. to 11 p.m.</strong>. The same official page lists <strong>designated off-leash areas</strong> among the park features alongside hiking trails, picnic tables, playgrounds, a soccer field, and a baseball diamond.</p><p>Calgary&apos;s off-leash locations page adds an important structural detail: <strong>Bowmont Park has one fenced site</strong>. The Bowmont management-plan page explains that fenced area more clearly. The city says there is a <strong>new fenced off-leash area at the park entrance off Silver Springs Gate N.W.</strong> with benches, trail improvements, and natural area restoration, while revised off-leash boundaries create a broader off-leash corridor through the park. That means visitors should expect a mix of fenced and unfenced off-leash space, not a single uniform enclosure.</p><p>The rules matter here because Bowmont is a multi-use natural park. Calgary states that <strong>dogs are required to be on-leash on a paved pathway in an off-leash area</strong>, and dogs in off-leash areas must remain under their owner&apos;s control. The city also notes that if posted signs and a listed off-leash area ever differ, the posted sign is considered correct.</p><p>The current park page also notes active site context: a section of the off-leash area near the <strong>Silver Springs entrance</strong> remains closed to allow plants to establish, with a detour in place and updated off-leash boundary signage being installed. This page is therefore stronger than the original thin version because it now reflects Bowmont as Calgary describes it today: a very large natural river-valley park with official off-leash areas, one fenced site, and boundary signage and restoration work that can affect how visitors use the space.</p>';
const notes =
  '<p>Primary sources: https://www.calgary.ca/parks/bowmont-park.html?redirect=%2Fbowmontpark for the official address, area, hours, park features, and current notice about the Silver Springs entrance off-leash section closure and signage; https://www.calgary.ca/parks/off-leash-locations.html for Calgary&apos;s official listing of Bowmont Park as an off-leash area with one fenced site; https://www.calgary.ca/planning/parks-rec/bowmont-park.html?redirect=%2Fbowmontpark for the management-plan detail about the fenced off-leash area at Silver Springs Gate N.W. and revised off-leash boundaries; and https://mapcarta.com/W18982310 as a coordinate reference. Reviewed on Thursday, August 13, 2026.</p>';

Object.assign(park, {
  title: seoTitle,
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ['Calgary'],
    Province: ['Alberta'],
    Tags: ['off-leash', 'calgary', 'natural-park', 'fenced-site', 'silver-springs-gate'],
  },
});

Object.assign(park.raw, {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Bowmont Park is a large Calgary natural environment park with official designated off-leash areas, including one fenced site, within a broader multi-use river-valley park landscape.</p>',
  'Street Address': '85 St. N.W. & 48 Ave. N.W.',
  latitude: '51.09886',
  longitude: '-114.19193',
  City: 'Calgary',
  Province: 'Alberta',
  'Postal Code': 'T3B 2B9',
  Fenced: 'Partially - one fenced off-leash site',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Natural grassland, dirt trails, and river-valley terrain',
  Size: '164 hectares park area',
  'Water source available': 'Natural river access in park setting - verify current safe access points on arrival',
  Benches: 'Yes - benches listed at fenced off-leash site',
  'Shaded area': 'Yes - natural tree cover in sections',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - park access points available; verify preferred entrance on arrival',
  'Washrooms nearby': 'Verify on arrival',
  'Operating hours': '5:00 AM – 11:00 PM',
  'Seasonal Restrictions': 'Follow posted off-leash boundary signs; dogs must be on leash on paved pathways',
  'Park Website or Source': 'https://www.calgary.ca/parks/bowmont-park.html?redirect=%2Fbowmontpark',
  'Google Maps Link': 'https://www.google.com/maps/place/Bowmont+Park/',
  Tags: 'off-leash,calgary,natural-park,fenced-site,silver-springs-gate',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + '\n');

updateCsvRow(parkCsvPath, 'slug', 'bowmont-park', {
  'Park Header': seoTitle,
  'Park type': 'Leash Free',
  Description:
    '<p>Bowmont Park is a large Calgary natural environment park with official designated off-leash areas, including one fenced site, within a broader multi-use river-valley park landscape.</p>',
  'Street Address': '85 St. N.W. & 48 Ave. N.W.',
  latitude: '51.09886',
  longitude: '-114.19193',
  City: 'Calgary',
  Province: 'Alberta',
  'Postal Code': 'T3B 2B9',
  Fenced: 'Partially - one fenced off-leash site',
  'Separate Small Dog Area': 'No separate small-dog area confirmed in city sources',
  'Surface type': 'Natural grassland, dirt trails, and river-valley terrain',
  Size: '164 hectares park area',
  'Water source available': 'Natural river access in park setting - verify current safe access points on arrival',
  Benches: 'Yes - benches listed at fenced off-leash site',
  'Shaded area': 'Yes - natural tree cover in sections',
  'Waste bins': 'Verify on arrival',
  'Bag Dispensers': 'Verify on arrival',
  'Parking Available': 'Yes - park access points available; verify preferred entrance on arrival',
  'Washrooms nearby': 'Verify on arrival',
  'Operating hours': '5:00 AM – 11:00 PM',
  'Seasonal Restrictions': 'Follow posted off-leash boundary signs; dogs must be on leash on paved pathways',
  'Park Website or Source': 'https://www.calgary.ca/parks/bowmont-park.html?redirect=%2Fbowmontpark',
  'Google Maps Link': 'https://www.google.com/maps/place/Bowmont+Park/',
  Tags: 'off-leash,calgary,natural-park,fenced-site,silver-springs-gate',
  'Notes / Comments': notes,
  'Intro Paragraph': intro,
  'Reviewed On': '2026-08-13',
  'Meta Title': seoTitle,
  'Meta Description': metaDescription,
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/bowmont-park/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/bowmont-park/';
});

rebuildBacklogSummary();

console.log('Updated Bowmont Park record and refreshed backlog files.');
