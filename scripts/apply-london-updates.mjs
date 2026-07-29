import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const citiesPath = path.join(root, 'src/data/generated/cities.json');
const csvPath = path.join(
  root,
  'LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv',
);
const backlogPath = path.join(root, 'reports/thin-page-backlog.csv');
const backlogSummaryPath = path.join(root, 'reports/thin-page-backlog-summary.md');

const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const city = cities.find((entry) => entry.slug === 'london');

if (!city) {
  throw new Error('London city record not found');
}

const seoTitle = 'London Dog Parks and Official Off-Leash Rules | LeashFree.ca';
const metaDescription =
  "Source-backed London guide covering the City's five official off-leash dog parks, published hours, core use rules, and examples including Greenway Park, Campbell Memorial Park, and Stoney Creek Meadow.";
const intro =
  "<p>London publishes a stronger off-leash framework than the old page suggested: the City says it maintains five official off-leash dog parks, keeps them open year-round, and applies one shared ruleset across the system.</p>";
const about =
  "<p>The City of London's parks section says London is home to more than 500 parks, green spaces, sports fields, trails, and natural areas, and it treats off-leash dog parks as one specific activity within that broader system. The city's dedicated off-leash dog parks page is the key source for this route because it says London maintains five official off-leash parks, that all off-leash areas are equipped with signs or are fenced off, that four off-leash areas have a fenced area for smaller dogs, and that these facilities are open year-round from 6 a.m. until 10 p.m. or dusk.</p><p>The current city park directory adds location context without forcing generic park copy. It explicitly marks Greenway Park at 50 Greenside Avenue and Stoney Creek Meadow at 1343 Adelaide Street North as parks that include an off-leash dog park amenity. The dedicated off-leash page also identifies Campbell Memorial Park Dog Off-Leash Area at 380 Dundas Street East, noting that it is accessed by foot from Dundas Street. That gives this city guide enough evidence to focus on the official system, shared rules, and verified park examples instead of overstating amenities that the City does not consistently publish for every site in one place.</p>";
const seasonalTips =
  '<ul><li><strong>Winter:</strong> London says the off-leash parks stay open year-round, but snow and ice can change footing at gates, trails, and parking areas.</li><li><strong>Spring:</strong> thaw conditions can make grassy and trail-based sections softer, so controlled entry and exit matter more.</li><li><strong>Summer:</strong> the official system runs from 6 a.m. to 10 p.m. or dusk, so earlier visits are the better choice on hotter days.</li><li><strong>Fall:</strong> cooler temperatures make longer exercise easier, but dusk comes earlier, which matters because some sites follow the 10 p.m. or dusk wording.</li></ul>';
const parkRules =
  "<p><strong>Official system size:</strong> the City says it maintains five off-leash dog parks in London.</p><p><strong>Hours:</strong> the City says the off-leash areas are open year-round from 6 a.m. to 10 p.m. or dusk.</p><p><strong>Park design:</strong> all off-leash areas are equipped with signs or are fenced off, and four have a fenced area for smaller dogs.</p><p><strong>Health and identification:</strong> the City says dogs must have up-to-date vaccinations and licence tags are required.</p><p><strong>Handling expectations:</strong> users are told to leash dogs while entering and exiting, keep dogs within sight and under verbal control, and clean up after them.</p><p><strong>Restricted use:</strong> the City says no puppies under four months, female dogs in heat, sick dogs, or aggressive dogs are allowed, and no glass containers, food, or toys should be brought into the off-leash areas.</p>";
const etiquette =
  '<p><strong>1. Treat London’s dog parks as a regulated city system, not a casual open field.</strong></p><p>The official page publishes one shared ruleset across the network, so the default should be compliance first, not improvisation.</p><p><strong>2. Leash before the gate, not after a problem starts.</strong></p><p>London explicitly tells users to leash dogs while entering and exiting, which is where many avoidable conflicts start.</p><p><strong>3. Bring your own judgment even when a park is familiar.</strong></p><p>The City confirms five official sites, but published amenity detail varies by location, so verify signage and conditions when you arrive.</p><p><strong>4. Use small-dog areas intentionally where they exist.</strong></p><p>The City says four off-leash areas have a fenced area for smaller dogs, which is useful for calmer introductions and size separation.</p><p><strong>5. Respect the hour window and shared-use setting.</strong></p><p>London’s system is open year-round, but that does not remove the need to manage noise, cleanup, and wildlife interactions responsibly.</p>';
const faqs =
  "<p><strong>1. How many official off-leash dog parks does London maintain?</strong></p><p>The City of London says it maintains five off-leash dog parks.</p><p><strong>2. What hours are London's off-leash parks open?</strong></p><p>The City says the off-leash areas are open year-round from 6 a.m. to 10 p.m. or dusk.</p><p><strong>3. Are London's off-leash parks fenced?</strong></p><p>The City says all off-leash areas are equipped with signs or are fenced off, and four of the five have a fenced area for smaller dogs.</p><p><strong>4. Do dogs need vaccination and licence tags?</strong></p><p>Yes. The City says dogs must have up-to-date vaccinations and licence tags are required.</p><p><strong>5. Which London parks are clearly identified in current City sources?</strong></p><p>The reviewed City pages explicitly identify Greenway Park, Stoney Creek Meadow, and Campbell Memorial Park as locations with official off-leash dog park access.</p><p><strong>6. Why is this guide more conservative than the old page?</strong></p><p>Because the official City sources are strong on system-wide rules, hours, and confirmed locations, but they do not support every older amenity claim that was previously published on this route.</p>";

Object.assign(city, {
  seoTitle,
  metaDescription,
  description: metaDescription,
  body: about,
  references: {
    ...(city.references || {}),
    'Province Page': ['https://leashfree.ca/ontario-dog-parks'],
  },
});

Object.assign(city.raw, {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': '',
  'Featured Park 2': '',
  'Featured Park 3': '',
  'Seasonal Tips': seasonalTips,
  'Park Rules': parkRules,
  'City Website': 'https://london.ca/living-london/parks-facilities/parks/leash-dog-parks',
  'Province Page': 'https://leashfree.ca/ontario-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': '',
  'Reviewed On': '2026-07-29',
  'Updated On': 'Wed Jul 29 2026 23:55:00 GMT+0000 (Coordinated Universal Time)',
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');

function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

function csv(fields) {
  return fields
    .map((value) => {
      const field = value ?? '';
      return /[",\r\n]/.test(field) ? `"${field.replaceAll('"', '""')}"` : field;
    })
    .join(',');
}

const cityCsvRaw = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const cityCsvLines = cityCsvRaw.split(/\r?\n/);
const headers = parseCsvLine(cityCsvLines[0]);
if (!headers.includes('Reviewed On')) headers.push('Reviewed On');
const headerIndex = new Map(headers.map((header, index) => [header, index]));
let updated = false;

const nextCityLines = [csv(headers)];
for (let lineIndex = 1; lineIndex < cityCsvLines.length; lineIndex += 1) {
  const line = cityCsvLines[lineIndex];
  if (!line) continue;
  const values = parseCsvLine(line);
  while (values.length < headers.length) values.push('');

  if (values[headerIndex.get('Slug')] === 'london') {
    const set = (field, value) => {
      values[headerIndex.get(field)] = value;
    };

    set('SEO Title Tag', seoTitle);
    set('Meta Description', metaDescription);
    set('Intro Paragraph', intro);
    set('About Section', about);
    set('Featured Park 1', '');
    set('Featured Park 2', '');
    set('Featured Park 3', '');
    set('Seasonal Tips', seasonalTips);
    set('Park Rules', parkRules);
    set('City Website', 'https://london.ca/living-london/parks-facilities/parks/leash-dog-parks');
    set('Province Page', 'https://leashfree.ca/ontario-dog-parks');
    set('Dog Park Etiquettes', etiquette);
    set('Dog Park FAQs', faqs);
    set('Nearby Cities', '');
    set('Reviewed On', '2026-07-29');
    set('Updated On', 'Wed Jul 29 2026 23:55:00 GMT+0000 (Coordinated Universal Time)');
    updated = true;
  }

  nextCityLines.push(csv(values));
}

if (!updated) {
  throw new Error('London row not found in city CSV.');
}

fs.writeFileSync(csvPath, `${nextCityLines.join('\n')}\n`);

const backlogLines = fs.readFileSync(backlogPath, 'utf8').trimEnd().split(/\r?\n/);
const header = backlogLines[0];
const filtered = [
  header,
  ...backlogLines
    .slice(1)
    .filter((line) => !line.includes(',City Pages,London,/dog-parks/london/,')),
];
fs.writeFileSync(backlogPath, filtered.join('\n') + '\n');

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 607 pages in the current working queue.', 'This backlog contains 606 pages in the current working queue.');
summary = summary.replace('| T1-source-research | 3 |', '| T1-source-research | 2 |');
summary = summary.replace('| City Pages | 7 |', '| City Pages | 6 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated London city page and refreshed backlog files.');
