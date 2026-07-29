import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const citiesPath = path.join(root, 'src/data/generated/cities.json');
const overridesPath = path.join(root, 'src/data/dog-park-image-overrides.js');
const csvPath = path.join(
  root,
  'LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv',
);
const backlogPath = path.join(root, 'reports/thin-page-backlog.csv');
const backlogSummaryPath = path.join(root, 'reports/thin-page-backlog-summary.md');

const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const city = cities.find((entry) => entry.slug === 'bridgewater');

if (!city) {
  throw new Error('Bridgewater city record not found');
}

const seoTitle = 'Bridgewater Dog Park and Dog Licence Rules | LeashFree.ca';
const metaDescription =
  'Source-backed Bridgewater guide covering South Shore Vet Dog Zone, the town-wide on-leash rule for other parks, annual dog registration by April 1, current dog-tag fees, and by-law enforcement contacts.';
const intro =
  '<p>Bridgewater has one named municipal off-leash destination at South Shore Vet Dog Zone, while the town asks pet owners to keep dogs on leash in its other parks and trails.</p>';
const about =
  "<p>Bridgewater's dog-access setup is narrower and more specific than the old page suggested. The Town of Bridgewater's Parks and Trails page says park users are asked to keep pets on a leash everywhere except the fenced-in area at the South Shore Vet Dog Zone. That single line is important because it gives the city page a clear municipal rule: off-leash use belongs inside one fenced dog-park area, not across the town's broader park network.</p><p>The dedicated dog-park page adds useful factual context. The town says the South Shore Vet Dog Zone officially opened to the public on July 6, 2017, after several years of planning and site work tied to the Generations Active Park master plan. Bridgewater also publishes the ownership side of responsible dog use through its dog-licensing page. The town says all dogs must be registered annually by April 1, with licence fees of $10 for spayed or neutered dogs and $30 for unspayed or unneutered dogs. The same page says keeping a dog licence current helps avoid a fine of over $220 for an unregistered dog. For enforcement, Bridgewater's FAQ page says residents with dog-bylaw complaints can call 902-527-0063 to reach the Bridgewater Police Department contact responsible for those concerns, while the town's contact page lists Dog License/Tag inquiries at 902-543-4651.</p>";
const seasonalTips =
  '<ul><li><strong>Winter:</strong> fenced dog-park visits are still practical, but icy entrances and snow-packed ground can change footing quickly.</li><li><strong>Spring:</strong> Bridgewater dog registrations are due by April 1, so spring is the right time to confirm tags before heavier park use.</li><li><strong>Summer:</strong> the broader Generations Active Park area can be busier, so controlled entry and exit from the fenced zone matters more.</li><li><strong>Fall:</strong> cooler weather usually makes longer off-leash exercise easier, but shorter daylight can compress evening visits.</li></ul>';
const parkRules =
  '<p><strong>Town-wide leash baseline:</strong> Bridgewater asks pet owners to keep dogs on leash in town parks, except within the fenced-in area at South Shore Vet Dog Zone.</p><p><strong>Official off-leash site:</strong> the town identifies South Shore Vet Dog Zone as the municipal fenced dog-park area tied to Generations Active Park.</p><p><strong>Licensing requirement:</strong> Bridgewater says all dogs must be registered annually by April 1.</p><p><strong>Published dog-tag fees:</strong> the town lists $10 for spayed or neutered dogs and $30 for unspayed or unneutered dogs.</p><p><strong>Enforcement context:</strong> the town says an unregistered dog can lead to a fine of over $220, and dog-bylaw complaints can be directed to the Bridgewater Police Department contact at 902-527-0063.</p>';
const etiquette =
  '<p><strong>1. Treat South Shore Vet Dog Zone as the off-leash exception.</strong></p><p>Bridgewater’s own parks page makes clear that other town parks still follow an on-leash expectation.</p><p><strong>2. Keep registration current before park season gets busy.</strong></p><p>The town requires annual dog registration by April 1, so licensing should be handled early rather than after a problem arises.</p><p><strong>3. Use the broader park setting calmly.</strong></p><p>The dog zone grew out of the Generations Active Park plan, so entry, exit, and parking behaviour still affect other park users nearby.</p><p><strong>4. Don’t overstate amenities that the town does not publish.</strong></p><p>The official pages are strong on history and rules but lighter on detailed amenity lists, so visitors should confirm posted signage on arrival.</p><p><strong>5. Know who to call when there is a problem.</strong></p><p>Bridgewater separates dog-tag inquiries from dog-bylaw complaints, and using the correct contact helps resolve issues faster.</p>';
const faqs =
  '<p><strong>1. Does Bridgewater have an official dog park?</strong></p><p>Yes. The Town of Bridgewater identifies the fenced-in South Shore Vet Dog Zone as its designated off-leash dog-park area.</p><p><strong>2. Can dogs be off leash in other Bridgewater parks?</strong></p><p>No. The town’s Parks and Trails page asks park users to keep pets on a leash except within the fenced area at South Shore Vet Dog Zone.</p><p><strong>3. When did South Shore Vet Dog Zone open?</strong></p><p>Bridgewater says the park officially opened to the public on July 6, 2017.</p><p><strong>4. When are Bridgewater dog registrations due?</strong></p><p>The town says all dogs must be registered annually by April 1.</p><p><strong>5. What are the current Bridgewater dog-licence fees?</strong></p><p>Bridgewater lists $10 for spayed or neutered dogs and $30 for unspayed or unneutered dogs.</p><p><strong>6. Who handles dog-bylaw complaints in Bridgewater?</strong></p><p>The town’s FAQ page says residents can call 902-527-0063 to reach the Bridgewater Police Department contact responsible for dog-bylaw concerns.</p>';

Object.assign(city, {
  seoTitle,
  metaDescription,
  description: metaDescription,
  body: about,
  references: {
    ...(city.references || {}),
    'Featured Park 1': ['south-shore-vet-dog-zone'],
    'Featured Park 2': [],
    'Featured Park 3': [],
    'Province Page': ['https://leashfree.ca/nova-scotia-dog-parks'],
  },
});

Object.assign(city.raw, {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Hero Image': '',
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': 'south-shore-vet-dog-zone',
  'Featured Park 2': '',
  'Featured Park 3': '',
  'Seasonal Tips': seasonalTips,
  'Park Rules': parkRules,
  'City Website': 'https://www.bridgewater.ca/facilities/parks-and-trails/south-shore-vet-dog-zone',
  'Province Page': 'https://leashfree.ca/nova-scotia-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'Lunenburg, Mahone Bay, Liverpool',
  'Reviewed On': '2026-07-29',
  'Updated On': 'Wed Jul 29 2026 23:10:00 GMT+0000 (Coordinated Universal Time)',
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');

let overrides = fs.readFileSync(overridesPath, 'utf8');
if (!overrides.includes('"bridgewater": "/images/cities/city-bridgewater-hero.png"')) {
  overrides = overrides.replace(
    /(const originalCityHeroImages = \{\n)/,
    '$1  "bridgewater": "/images/cities/city-bridgewater-hero.png",\n',
  );
  fs.writeFileSync(overridesPath, overrides);
}

let csv = fs.readFileSync(csvPath, 'utf8');
csv = csv.replace(/Off-Leash Dog Park in Bridgewater, NS/g, 'Bridgewater Dog Park and Dog Licence Rules | LeashFree.ca');
csv = csv.replace(
  /Visit Bridgewater’s fully fenced South Shore Vet Dog Zone for off-leash dog fun\. Safe, clean, and community-supported dog park in Generations Active Park\./g,
  'Source-backed Bridgewater guide covering South Shore Vet Dog Zone, the town-wide on-leash rule for other parks, annual dog registration by April 1, current dog-tag fees, and by-law enforcement contacts.',
);
fs.writeFileSync(csvPath, csv);

const backlogLines = fs.readFileSync(backlogPath, 'utf8').trimEnd().split(/\r?\n/);
const header = backlogLines[0];
const filtered = [header, ...backlogLines.slice(1).filter((line) => !line.includes(',City Pages,Bridgewater,/dog-parks/bridgewater/,'))];
fs.writeFileSync(backlogPath, filtered.join('\n') + '\n');

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 611 pages in the current working queue.', 'This backlog contains 610 pages in the current working queue.');
summary = summary.replace('| T1-source-research | 5 |', '| T1-source-research | 4 |');
summary = summary.replace('| City Pages | 9 |', '| City Pages | 8 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Bridgewater city page and refreshed backlog files.');
