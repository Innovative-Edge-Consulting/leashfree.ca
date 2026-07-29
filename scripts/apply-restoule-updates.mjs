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
const city = cities.find((entry) => entry.slug === 'restoule');

if (!city) {
  throw new Error('Restoule city record not found');
}

const seoTitle = 'Restoule Dog Beach and Provincial Park Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Restoule dog access, covering Restoule Provincial Park’s fenced leash-free pet exercise area, dog-friendly beach access, trail rules, and 2026 operating dates.';
const intro =
  '<p>Restoule is best treated as a dog-friendly provincial-park destination rather than a municipal dog-park town, because the most relevant public dog access is concentrated inside Restoule Provincial Park.</p>';
const about =
  "<p>The strongest factual base for Restoule is Ontario Parks, not a town-operated dog park system. Ontario Parks currently lists Restoule Provincial Park as having both a dog beach and a pet exercise area, which is more specific than the old draft suggesting only informal wilderness access. The current Restoule Provincial Park page lists one dog beach and one pet exercise area among the park's facilities, while the activities page says Bells Point Beach is the park's pet friendly exercise area and swim spot. The facilities page adds the detail that Restoule's pet exercise area is adjacent to Kettle Campground and Angel's Point trails, is leash-free, is fenced in, and includes water access and nearby picnic benches. That means Restoule is not just a place where dogs are tolerated on trails; it is a place with a designated, official off-leash dog area inside the provincial park.</p><p>Ontario Parks also publishes the operating context and dog rules this page should rely on. As of July 29, 2026, Restoule Provincial Park's 2026 operating dates are May 8, 2026 to October 13, 2026 for day use and camping. Ontario Parks' dogs-at-parks guidance says dogs are welcome at all Ontario Parks and permitted on campsites, park roads, and most hiking trails, but are not allowed at regular beaches and swimming areas unless the area is a designated dog beach. Outside designated off-leash areas, dogs must be on a leash no longer than 2 metres, and Ontario Parks says violations may result in a minimum fine of $95.00. For Restoule, the practical result is straightforward: use the designated fenced pet exercise area and dog beach for off-leash or swimming access, keep dogs leashed elsewhere in the park unless signage says otherwise, and plan trips around the park's seasonal operating window rather than assuming year-round staffed access.</p>";
const seasonalTips =
  '<ul><li><strong>Spring:</strong> the park opens for the 2026 season on May 8, so early-season trips should be planned around official opening dates and changing trail conditions.</li><li><strong>Summer:</strong> this is the easiest season to use the fenced pet exercise area and designated dog beach, but dogs still need to stay out of regular swimming beaches.</li><li><strong>Fall:</strong> Restoule stays open through October 13, 2026, which makes early fall one of the better windows for quieter trail visits with a dog.</li><li><strong>Off-season:</strong> do not assume full park services outside the operating season, even if some access points remain physically reachable.</li></ul>';
const etiquette =
  '<p><strong>1. Treat Restoule as a designated-access park, not free-for-all wilderness.</strong></p><p>Ontario Parks gives this location an actual pet exercise area and dog beach, so there is no reason to improvise at regular swimming beaches.</p><p><strong>2. Use the leash-free area for off-leash time.</strong></p><p>The official fenced pet exercise area is where off-leash freedom is clearly supported.</p><p><strong>3. Keep dogs leashed on ordinary trails and roads.</strong></p><p>Ontario Parks says dogs must be on a leash no longer than 2 metres unless they are in a designated off-leash area.</p><p><strong>4. Respect the beach distinction.</strong></p><p>Dogs are not allowed at regular beaches and swimming areas unless the area is a designated dog beach.</p><p><strong>5. Plan around the operating season.</strong></p><p>Restoule is seasonal, so trip timing matters more here than it does for an urban dog park.</p>';
const faqs =
  '<p><strong>1. Is there an official off-leash dog area in Restoule?</strong></p><p>Yes. Ontario Parks lists a pet exercise area at Restoule Provincial Park, and the facilities page says it is leash-free and fenced in.</p><p><strong>2. Does Restoule have a dog beach?</strong></p><p>Yes. Ontario Parks lists one dog beach at Restoule Provincial Park, and the activities page identifies Bells Point Beach as the pet friendly exercise area and swim spot.</p><p><strong>3. Are dogs allowed on Restoule trails?</strong></p><p>Yes. Ontario Parks says dogs are permitted on most hiking trails, but they must be leashed outside designated off-leash areas.</p><p><strong>4. What leash length does Ontario Parks require?</strong></p><p>Ontario Parks says dogs must be on a leash no longer than 2 metres unless in a designated off-leash area.</p><p><strong>5. What are Restoule Provincial Park’s 2026 operating dates?</strong></p><p>As of July 29, 2026, Ontario Parks lists Restoule Provincial Park as open from May 8, 2026 to October 13, 2026 for day use and camping.</p><p><strong>6. Is there a penalty for ignoring Ontario Parks dog rules?</strong></p><p>Yes. Ontario Parks says violations of its dog rules may result in a minimum fine of $95.00.</p>';

Object.assign(city, {
  seoTitle,
  metaDescription,
  description: metaDescription,
  body: about,
  references: {
    ...(city.references || {}),
    'Featured Park 1': ['restoule-provincial-park'],
    'Featured Park 2': [],
    'Featured Park 3': [],
    'Province Page': ['https://leashfree.ca/ontario-dog-parks'],
  },
});

Object.assign(city.raw, {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': 'restoule-provincial-park',
  'Featured Park 2': '',
  'Featured Park 3': '',
  'Seasonal Tips': seasonalTips,
  'City Website': 'https://www.ontarioparks.ca/park/restoule',
  'Province Page': 'https://leashfree.ca/ontario-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'Sundridge, South River, North Bay',
  'Reviewed On': '2026-07-29',
  'Updated On': 'Wed Jul 29 2026 21:00:00 GMT+0000 (Coordinated Universal Time)',
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');

let overrides = fs.readFileSync(overridesPath, 'utf8');
if (!overrides.includes('"restoule": "/images/cities/city-restoule-hero.png"')) {
  overrides = overrides.replace(
    /(const cityImageOverrides = \{\n)/,
    '$1  "restoule": "/images/cities/city-restoule-hero.png",\n',
  );
  fs.writeFileSync(overridesPath, overrides);
}

let csv = fs.readFileSync(csvPath, 'utf8');
csv = csv.replace(
  /Dog-Friendly Spaces in Restoule Ontario \| LeashFree\.ca/g,
  'Restoule Dog Beach and Provincial Park Rules | LeashFree.ca',
);
csv = csv.replace(
  /Explore dog-friendly spaces in Restoule, Ontario\. While thereâ€™s no fenced dog park, discover off-leash-friendly trails and nature areas in and around Restoule Provincial Park\./g,
  'Source-backed guide to Restoule dog access, covering Restoule Provincial Park’s fenced leash-free pet exercise area, dog-friendly beach access, trail rules, and 2026 operating dates.',
);
fs.writeFileSync(csvPath, csv);

const backlogLines = fs.readFileSync(backlogPath, 'utf8').trimEnd().split(/\r?\n/);
const header = backlogLines[0];
const filtered = [header, ...backlogLines.slice(1).filter((line) => !line.includes(',City Pages,Restoule,/dog-parks/restoule/,'))];
fs.writeFileSync(backlogPath, filtered.join('\n') + '\n');

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 614 pages in the current working queue.', 'This backlog contains 613 pages in the current working queue.');
summary = summary.replace('| T1-source-research | 8 |', '| T1-source-research | 7 |');
summary = summary.replace('| City Pages | 12 |', '| City Pages | 11 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Restoule city page and refreshed backlog files.');
