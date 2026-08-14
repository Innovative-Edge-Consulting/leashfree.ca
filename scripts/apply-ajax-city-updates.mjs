import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const citiesPath = path.join(root, 'src/data/generated/cities.json');
const cityCsvPath = path.join(
  root,
  'LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv',
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

const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const city = cities.find((entry) => entry.slug === 'ajax');
if (!city) throw new Error('Ajax city record not found');

const seoTitle = 'Ajax Dog Parks and Off-Leash Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Ajax dog parks and off-leash rules, covering the Town’s current designated off-leash areas, waterfront and conservation options, and the official leash rule that applies everywhere else.';
const intro =
  '<p>As of <strong>Friday, August 14, 2026</strong>, Ajax should be treated as a town with a <strong>published network of designated off-leash areas</strong>, not a city of uniformly fenced dog parks. The Town&apos;s current park pages support a guide built around those named locations plus the rule that dogs must stay on leash everywhere else.</p>';
const about =
  '<p>The strongest current source is the Town of Ajax parks and trails page. It says Ajax has <strong>designated off-leash dog areas</strong> and then lists five named locations: <strong>Ajax Waterfront</strong>, <strong>Audley Recreation Centre</strong>, <strong>Greenwood Conservation Area</strong>, <strong>Lions Park</strong>, and <strong>Rotary Park</strong>. One part of the same page refers to <strong>four designated off-leash dog areas</strong>, so the cleanest way to stay accurate is to follow the Town&apos;s current named-location list rather than repeat an uncertain count without context.</p><p>That matters because the existing city guide is materially wrong. It currently describes Ajax as a cluster of fenced dog parks and names places like Miller&apos;s Creek Community Park and Hermitage Park as if they are official off-leash sites. The Town&apos;s current pages do not support those claims. Instead, the official network mixes formats: community-style access at <strong>Audley Recreation Centre</strong>, waterfront-oriented options at <strong>Ajax Waterfront</strong> and <strong>Rotary Park</strong>, and a larger natural setting at <strong>Greenwood Conservation Area</strong>.</p><p>The Town&apos;s current facility and park pages also give useful context for the official sites already in LeashFree.ca. Audley Recreation Centre lists the dog park feature in the recreation-centre context, Ajax Waterfront and Rotary Park tie into the broader waterfront system, and Greenwood is part of the TRCA-managed conservation landscape. Those distinctions are better for search than generic dog-park padding because they help a visitor choose the right kind of outing.</p><p>The Town&apos;s rule pages are also clear on the basics. Ajax says dogs are <strong>not permitted to run at large</strong>, and that <strong>dogs are required to be leashed at all times except in designated off-leash areas</strong>. The Town also publishes the pet-waste rule: <strong>Pet owners are required to pick up after their pets</strong> on all Town property and in public spaces. This page is therefore stronger when it works as a verified orientation guide to Ajax&apos;s current named off-leash locations and the rules that govern them.</p>';
const seasonalTips =
  '<ul><li><strong>Winter:</strong> waterfront and trail-based off-leash areas can be icy or wind-exposed, especially near the lake.</li><li><strong>Spring:</strong> expect mud in natural areas such as Greenwood and trail connectors near the waterfront.</li><li><strong>Summer:</strong> Ajax Waterfront and Rotary give better lake-adjacent options, but bring water and verify which areas are actually designated off leash before unclipping.</li><li><strong>Fall:</strong> cooler weather is ideal for longer walks, but leaf cover can hide wet ground and uneven trail edges.</li></ul>';
const parkRules =
  '<p><strong>Keep dogs leashed outside designated off-leash areas:</strong> the Town of Ajax says dogs are required to be leashed at all times except in designated off-leash areas.</p><p><strong>Do not let dogs run at large:</strong> Ajax&apos;s animal-services guidance says dogs are not permitted to run at large.</p><p><strong>Pick up after your dog:</strong> the Town&apos;s pet-waste program states that pet owners are required to pick up after their pets in all public spaces and on Town property.</p><p><strong>Use the current named-location list, not old assumptions:</strong> Ajax&apos;s current parks page names Ajax Waterfront, Audley Recreation Centre, Greenwood Conservation Area, Lions Park, and Rotary Park as designated off-leash locations.</p><p><strong>Verify signs on arrival:</strong> because the Town&apos;s own page currently contains a count/list mismatch, posted signage and the specific facility page for your destination should be treated as the operational source on the day of your visit.</p>';
const etiquette =
  '<p><strong>1. Choose the park format that fits your dog.</strong></p><p>Ajax does not read like one uniform dog-park system. Greenwood is more natural and trail-oriented, while Audley is a recreation-centre location and the waterfront options suit dogs that handle busier shared-use environments well.</p><p><strong>2. Do not assume every Ajax dog page is official.</strong></p><p>The quality problem in the old guide was treating unofficial or weakly supported locations as if the Town had designated them.</p><p><strong>3. Leash before you move between spaces.</strong></p><p>Ajax&apos;s core rule is simple: dogs must be leashed except in designated off-leash areas.</p><p><strong>4. Treat the waterfront as a shared-use environment.</strong></p><p>Busy trails and public spaces need stronger recall and better handler attention than a single-purpose fenced run.</p><p><strong>5. Bring your own waste bags anyway.</strong></p><p>The Town publishes the cleanup requirement, so owners should arrive prepared rather than assume supplies are always stocked on site.</p>';
const faqs =
  '<p><strong>1. How many official off-leash areas does Ajax currently publish?</strong></p><p>Ajax&apos;s current parks page says there are four designated off-leash areas, but the same page currently lists five named locations. The safest interpretation is to follow the Town&apos;s named-location list and verify posted signage on arrival.</p><p><strong>2. Which locations does the Town currently name?</strong></p><p>The current Ajax page names Ajax Waterfront, Audley Recreation Centre, Greenwood Conservation Area, Lions Park, and Rotary Park.</p><p><strong>3. Can dogs be off leash anywhere else in Ajax parks?</strong></p><p>No. Ajax says dogs are required to be leashed at all times except in designated off-leash areas.</p><p><strong>4. Does Ajax publish a pet-waste rule?</strong></p><p>Yes. The Town says pet owners are required to pick up after their pets on Town property and in public spaces.</p><p><strong>5. Are all Ajax off-leash areas fenced dog parks?</strong></p><p>No. The official system includes mixed environments, including waterfront and conservation-area style locations, not just small fenced runs.</p><p><strong>6. Which Ajax destinations already have park pages in LeashFree.ca?</strong></p><p>The current official network in the site includes Ajax Waterfront Park, Audley Recreation Centre Off-Leash Area, Greenwood Conservation Area, Lions Park, and Rotary Park.</p>';

Object.assign(city, {
  title: 'Ajax',
  seoTitle,
  metaDescription,
  description: metaDescription,
  body: about,
  media: [],
  references: {
    Province: ['Ontario'],
    'Featured Park 1': ['ajax-waterfront-park'],
    'Featured Park 2': ['audley-recreation-centre'],
    'Featured Park 3': ['greenwood-conservation-area'],
    'Province Page': ['https://leashfree.ca/ontario-dog-parks'],
  },
});

Object.assign(city.raw, {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Hero Image': '',
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': 'ajax-waterfront-park',
  'Featured Park 2': 'audley-recreation-centre',
  'Featured Park 3': 'greenwood-conservation-area',
  'Seasonal Tips': seasonalTips,
  'Park Rules': parkRules,
  'City Website': 'https://www.ajax.ca/en/play/parks-and-trails.aspx',
  'Province Page': 'https://leashfree.ca/ontario-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'Pickering, Whitby, Courtice',
  'Reviewed On': '2026-08-14',
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');

updateCsvRow(cityCsvPath, 'Slug', 'ajax', {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Hero Image': '',
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': 'ajax-waterfront-park',
  'Featured Park 2': 'audley-recreation-centre',
  'Featured Park 3': 'greenwood-conservation-area',
  'Seasonal Tips': seasonalTips,
  'Park Rules': parkRules,
  'City Website': 'https://www.ajax.ca/en/play/parks-and-trails.aspx',
  'Province Page': 'https://leashfree.ca/ontario-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'Pickering, Whitby, Courtice',
  'Reviewed On': '2026-08-14',
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/ajax/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/ajax/';
});

rebuildBacklogSummary();

console.log('Updated Ajax city page and refreshed backlog files.');
