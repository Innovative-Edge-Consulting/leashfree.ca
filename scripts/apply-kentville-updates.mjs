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
const city = cities.find((entry) => entry.slug === 'kentville');

if (!city) {
  throw new Error('Kentville city record not found');
}

const seoTitle = 'Kentville Dog Park and Dog Tag Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Kentville dog access, covering Marshview Dog Park, leashed dogs on town trails, annual $15 dog tags, and current animal-control rules.';
const intro =
  '<p>Kentville has one official off-leash destination at Marshview Dog Park, while the rest of the town’s parks and trails remain dog-friendly on leash.</p>';
const about =
  "<p>Kentville's current dog-access setup is clear on the town's own pages. Marshview Dog Park is the official off-leash site, located at 19 Main Street and described by the town as a safe, enclosed environment for off-leash play. The town says the park is divided into two sections: small dogs 35 pounds and under, and larger dogs over 35 pounds. Kentville also publishes daily operating hours of 6 a.m. to 9 p.m. and notes that Marshview Dog Park officially opened for public use on July 7, 2023. That gives this page a much firmer factual base than generic copy about a fenced dog park somewhere in town.</p><p>The rest of Kentville's dog access is governed by its animal-control and parks pages. Kentville says dogs must be kept on a leash when off their property and must be registered each year in April at Town Hall. The town's permits and licences page says dog tags cost $15 and are renewable every April. Kentville's parks and trails page adds that leashed dogs are allowed in all parks and on all trails, and owners are required to clean up after their pets. On enforcement, the town says all complaints or inquiries concerning animals should be reported to Animal Control through the Waterville SPCA, while Kentville Police Service handles broader by-law enforcement and after-hours complaints related to public safety. Together, these pages support a stronger Kentville guide: one designated off-leash dog park for free running, and a wider network of shared-use parks and trails where dogs are welcome only on leash.</p>";
const seasonalTips =
  '<ul><li><strong>Winter:</strong> Kentville’s trail system stays useful in colder months, but icy footing matters more on shared-use routes outside the fenced dog park.</li><li><strong>Spring:</strong> annual dog-tag renewal happens in April, making this the right time to confirm registration before heavier park use.</li><li><strong>Summer:</strong> Marshview Dog Park is open daily from 6 a.m. to 9 p.m., but owners still need to bring water and avoid overheating during longer visits.</li><li><strong>Fall:</strong> cooler temperatures make Kentville’s parks and trails especially good for longer leashed walks outside the dog park.</li></ul>';
const etiquette =
  '<p><strong>1. Use Marshview for off-leash time.</strong></p><p>Kentville’s official off-leash access is concentrated in Marshview Dog Park, not spread across the town’s other green spaces.</p><p><strong>2. Pick the correct side of the park.</strong></p><p>The town separates dogs by size, with one side for dogs 35 pounds and under and another for larger dogs.</p><p><strong>3. Keep dogs leashed everywhere else.</strong></p><p>Kentville says dogs must be on leash when off their property, even though leashed dogs are welcome on town trails and in parks.</p><p><strong>4. Renew tags on time.</strong></p><p>The town requires annual registration each April, so licensing should be treated as a routine part of dog ownership in Kentville.</p><p><strong>5. Respect the shared-use trail system.</strong></p><p>Kentville’s parks and trails are multi-use public spaces, so off-leash assumptions outside Marshview are not justified.</p>';
const faqs =
  '<p><strong>1. Does Kentville have an official dog park?</strong></p><p>Yes. The Town of Kentville identifies Marshview Dog Park as its designated off-leash dog park.</p><p><strong>2. Where is Kentville’s dog park?</strong></p><p>The town lists Marshview Dog Park at 19 Main Street, Kentville, Nova Scotia.</p><p><strong>3. What are Marshview Dog Park’s hours?</strong></p><p>As of July 29, 2026, Kentville says Marshview Dog Park is open daily from 6 a.m. to 9 p.m.</p><p><strong>4. Are dogs allowed on Kentville trails?</strong></p><p>Yes. Kentville says leashed dogs are allowed in all parks and on all trails, and owners must clean up after them.</p><p><strong>5. How much does a Kentville dog tag cost?</strong></p><p>Kentville says dog tags cost $15 and are renewable every April.</p><p><strong>6. Who handles animal complaints in Kentville?</strong></p><p>The town says all complaints or inquiries concerning animals should be reported to Animal Control through the Waterville SPCA.</p>';

Object.assign(city, {
  seoTitle,
  metaDescription,
  description: metaDescription,
  body: about,
  references: {
    ...(city.references || {}),
    'Featured Park 1': ['marshview-dog-park'],
    'Featured Park 2': [],
    'Featured Park 3': [],
    'Province Page': ['https://leashfree.ca/nova-scotia-dog-parks'],
  },
});

Object.assign(city.raw, {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': 'marshview-dog-park',
  'Featured Park 2': '',
  'Featured Park 3': '',
  'Seasonal Tips': seasonalTips,
  'City Website': 'https://kentville.ca/dogpark',
  'Province Page': 'https://leashfree.ca/nova-scotia-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'New Minas, Wolfville, Berwick',
  'Reviewed On': '2026-07-29',
  'Updated On': 'Wed Jul 29 2026 22:00:00 GMT+0000 (Coordinated Universal Time)',
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');

let overrides = fs.readFileSync(overridesPath, 'utf8');
if (!overrides.includes('"kentville": "/images/cities/city-kentville-hero.png"')) {
  overrides = overrides.replace(
    /(const cityImageOverrides = \{\n)/,
    '$1  "kentville": "/images/cities/city-kentville-hero.png",\n',
  );
  fs.writeFileSync(overridesPath, overrides);
}

let csv = fs.readFileSync(csvPath, 'utf8');
csv = csv.replace(/Off-Leash Dog Park in Kentville, NS/g, 'Kentville Dog Park and Dog Tag Rules | LeashFree.ca');
csv = csv.replace(
  /Discover Kentville's off-leash dog park located at 250 Park Street\. A secure and welcoming space for dogs to run, play, and socialize freely\./g,
  'Source-backed guide to Kentville dog access, covering Marshview Dog Park, leashed dogs on town trails, annual $15 dog tags, and current animal-control rules.',
);
fs.writeFileSync(csvPath, csv);

const backlogLines = fs.readFileSync(backlogPath, 'utf8').trimEnd().split(/\r?\n/);
const header = backlogLines[0];
const filtered = [header, ...backlogLines.slice(1).filter((line) => !line.includes(',City Pages,Kentville,/dog-parks/kentville/,'))];
fs.writeFileSync(backlogPath, filtered.join('\n') + '\n');

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 613 pages in the current working queue.', 'This backlog contains 612 pages in the current working queue.');
summary = summary.replace('| T1-source-research | 7 |', '| T1-source-research | 6 |');
summary = summary.replace('| City Pages | 11 |', '| City Pages | 10 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Kentville city page and refreshed backlog files.');
