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
const city = cities.find((entry) => entry.slug === 'pickering');
if (!city) throw new Error('Pickering city record not found');

const seoTitle = 'Pickering Dog Parks and Off-Leash Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Pickering dog parks and off-leash rules, covering the City’s three designated leash-free areas, Grand Valley’s two fenced sections, current licensing requirements, and leash-free area rules.';
const intro =
  '<p>As of <strong>Friday, August 14, 2026</strong>, Pickering should be treated as a city with <strong>three designated leash-free areas</strong>, not a city with only one dog park. The City&apos;s current parks and animal-services pages support a much more specific guide than the old Grand Valley-only summary.</p>';
const about =
  '<p>The strongest current source is Pickering&apos;s leash-free areas page. The City says Pickering currently has <strong>three designated Leash Free Areas</strong>: <strong>Dunmoore Park</strong>, <strong>Balsdon Park</strong>, and <strong>Grand Valley Park</strong>. All locations are described as <strong>fully fenced</strong>, which is a major correction from the old city guide that focused only on Grand Valley and treated it as the city&apos;s sole option.</p><p>Each site is different. Dunmoore Park has <strong>two areas</strong>, including one for small dogs and another for all dogs, plus the city&apos;s <strong>Canine Activity Area</strong> with 10 skill-and-engagement stations. Balsdon Park is the <strong>smallest</strong> of the three and is tucked into a subdivision near Liverpool Road with <strong>no set parking lot</strong>, so users need to park on nearby streets. Grand Valley Park also has <strong>two designated leash-free areas</strong> within the park: the main fenced area west of the parking lot at the bottom of the hill, and a smaller fenced area beside the parking lot for users with mobility issues or smaller dogs.</p><p>The rule layer is also stronger than the previous draft. Pickering requires <strong>up-to-date dog licensing</strong> to use leash-free areas, says dogs should be wearing their licence tags, and limits each owner or handler to <strong>a maximum of three dogs</strong> in both leashed and leash-free areas. The City also says handlers must be <strong>16 or older</strong>, must supervise their dogs at all times, and must comply with the Responsible Pet Ownership By-law whether on or off leash.</p><p>Pickering&apos;s animal-services pages also make the broader city rules clear. Dogs must be <strong>leashed when off the owner&apos;s property</strong> unless they are in one of the City&apos;s designated leash-free areas, and owners must <strong>immediately remove and dispose of excrement</strong> left by their animal within the city. On top of that, Pickering requires dogs and cats to be <strong>licensed annually</strong>, with current published fees that vary by sterilization and microchip status. This city guide is therefore more useful when it works as a verified orientation page to three distinct leash-free options, not as a generic one-park summary.</p>';
const seasonalTips =
  '<ul><li><strong>Winter:</strong> fenced parks remain accessible, but Grand Valley&apos;s hill and path approach can be icier than flatter neighbourhood sites.</li><li><strong>Spring:</strong> mud is more likely at Grand Valley and Dunmoore, especially around access paths and activity areas.</li><li><strong>Summer:</strong> Dunmoore is the best fit for dogs that enjoy training-style interaction, while Grand Valley gives more room and Balsdon stays simpler and smaller.</li><li><strong>Fall:</strong> cooler weather is ideal for longer sessions, but leaf cover can hide wet ground and make downhill sections less predictable.</li></ul>';
const parkRules =
  '<p><strong>Keep dog licences current:</strong> Pickering says up-to-date licensing is required to use the leash-free areas and dogs should wear their licence tags.</p><p><strong>Respect the three-dog limit:</strong> the City allows a maximum of three dogs per owner or handler in both leashed and leash-free areas.</p><p><strong>Supervise continuously:</strong> a handler aged 16 or older must be present and supervising at all times.</p><p><strong>Leash before transitions:</strong> Pickering instructs owners to attach a dog&apos;s leash before letting the dog out of the car and to leash the dog again before leaving the park.</p><p><strong>Remove problem dogs and clean up immediately:</strong> the City tells owners to remove dogs showing aggression or overly rough play and says owners must immediately remove and dispose of excrement left by their animal within the city.</p>';
const etiquette =
  '<p><strong>1. Match the site to your dog.</strong></p><p>Dunmoore is the most structured option, Balsdon is the smallest, and Grand Valley gives the most separation between its main and smaller fenced sections.</p><p><strong>2. Do not treat Grand Valley as the whole Pickering system.</strong></p><p>The old city guide understated the network. Pickering now clearly publishes three designated leash-free areas.</p><p><strong>3. Use Balsdon only if street-access parking works for you.</strong></p><p>The City specifically says Balsdon has no set parking lot, which changes how practical it is for some visits.</p><p><strong>4. Keep transitions calm at Grand Valley.</strong></p><p>The City specifically tells owners to leash dogs before leaving the car and notes that the main fenced area is down the hill from the parking lot.</p><p><strong>5. Keep tags current before you go.</strong></p><p>Pickering ties leash-free access directly to current licensing, so this is an actual entry requirement, not background admin.</p>';
const faqs =
  '<p><strong>1. How many official leash-free areas does Pickering currently list?</strong></p><p>As of Friday, August 14, 2026, the City of Pickering says it has three designated leash-free areas: Dunmoore Park, Balsdon Park, and Grand Valley Park.</p><p><strong>2. Does Grand Valley Park have more than one fenced area?</strong></p><p>Yes. The City says there are two designated leash-free areas within Grand Valley Park: a main fenced area west of the parking lot and a smaller fenced area beside the lot.</p><p><strong>3. Which Pickering site has a small-dog area or accessible alternative?</strong></p><p>Dunmoore has a small-dog area, and Grand Valley&apos;s smaller fenced area is positioned for users with mobility issues or those with smaller dogs.</p><p><strong>4. Do dogs need a city licence to use Pickering leash-free areas?</strong></p><p>Yes. The City says up-to-date licensing is required and dogs should wear their licence tags.</p><p><strong>5. What are Pickering&apos;s current annual dog-licence fees?</strong></p><p>The City currently lists annual dog and cat licence fees effective January 15, 2025, ranging from $23 for sterilized and microchipped pets to $54 for unsterilized pets, with replacement tags at $6.50 and service-animal fees waived with proof.</p><p><strong>6. Can dogs be off leash elsewhere in Pickering?</strong></p><p>No. Pickering&apos;s Responsible Pet Ownership By-law says dogs must be leashed when off the owner&apos;s property except in the City&apos;s designated leash-free areas.</p>';

Object.assign(city, {
  title: 'Pickering',
  seoTitle,
  metaDescription,
  description: metaDescription,
  body: about,
  media: [],
  references: {
    Province: ['Ontario'],
    'Featured Park 1': ['grand-valley-park-pickering'],
    'Featured Park 2': ['dunmoore-park-pickering'],
    'Featured Park 3': ['balsdon-park'],
    'Province Page': ['https://leashfree.ca/ontario-dog-parks'],
  },
});

Object.assign(city.raw, {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Hero Image': '',
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': 'grand-valley-park-pickering',
  'Featured Park 2': 'dunmoore-park-pickering',
  'Featured Park 3': 'balsdon-park',
  'Seasonal Tips': seasonalTips,
  'Park Rules': parkRules,
  'City Website': 'https://www.pickering.ca/parks-recreation-culture/parks-and-trails/leash-free-areas/',
  'Province Page': 'https://leashfree.ca/ontario-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'Ajax, Whitby, Markham',
  'Reviewed On': '2026-08-14',
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');

updateCsvRow(cityCsvPath, 'Slug', 'pickering', {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Hero Image': '',
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': 'grand-valley-park-pickering',
  'Featured Park 2': 'dunmoore-park-pickering',
  'Featured Park 3': 'balsdon-park',
  'Seasonal Tips': seasonalTips,
  'Park Rules': parkRules,
  'City Website': 'https://www.pickering.ca/parks-recreation-culture/parks-and-trails/leash-free-areas/',
  'Province Page': 'https://leashfree.ca/ontario-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'Ajax, Whitby, Markham',
  'Reviewed On': '2026-08-14',
});

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/pickering/';
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf('route');
  return routeIndex !== -1 && row[routeIndex] === '/dog-parks/pickering/';
});

rebuildBacklogSummary();

console.log('Updated Pickering city page and refreshed backlog files.');
