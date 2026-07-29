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
const city = cities.find((entry) => entry.slug === 'sydney');

if (!city) {
  throw new Error('Sydney city record not found');
}

const seoTitle = 'Sydney Dog Parks and CBRM Off-Leash Rules | LeashFree.ca';
const metaDescription =
  'Source-backed Sydney guide covering the official CBRM off-leash dog parks at Rotary Park and Open Hearth Park, plus current off-leash area rules and dog-tag requirements.';
const intro =
  '<p>Sydney has two municipality-listed off-leash dog parks within the Cape Breton Regional Municipality system: Rotary Park at 361 Rotary Drive and Open Hearth Off-Leash Dog Park at 190 Ferry Street.</p>';
const about =
  "<p>Sydney's dog-park picture is more concrete than the old generic copy suggested. Cape Breton Regional Municipality currently lists two Sydney off-leash locations on its Parks, Trails &amp; Green Spaces page: Rotary Park at 361 Rotary Drive and Open Hearth Off-Leash Dog Park at 190 Ferry Street. That matters because it shifts this page from vague references to community green space into named, municipality-published off-leash sites with actual addresses inside Sydney.</p><p>CBRM also publishes the operating rules for these off-leash areas on the same page. Dogs are allowed off leash only where signage is posted in designated CBRM park areas. The municipality says dogs must have current CBRM tags, handlers must carry a leash, dogs must come when called and stay within sight, and owners are responsible for damages or injuries caused by a dog in their care. CBRM also says aggressive dogs, female dogs in heat, and puppies under three months old are not permitted in off-leash areas, and waste must be picked up immediately. For broader legal context, CBRM's by-law index currently lists D-400 Dog By-law with a separate Dog Tags Fee schedule, which reinforces that dog licensing and control rules remain active beyond the park gate.</p>";
const seasonalTips =
  '<ul><li><strong>Winter:</strong> Sydney off-leash visits can mean icy footing and exposed coastal wind, especially in larger open park areas.</li><li><strong>Spring:</strong> thaw and rain can soften grass and trail edges, so expect muddier entry points at off-leash sites.</li><li><strong>Summer:</strong> Open Hearth Park sees broader community activity in warm weather, so recall and calm leash transitions matter more.</li><li><strong>Fall:</strong> cooler temperatures are often better for longer runs, but shorter daylight makes it worth visiting earlier.</li></ul>';
const parkRules =
  '<p><strong>Official Sydney off-leash sites:</strong> CBRM lists Rotary Park, 361 Rotary Drive, and Open Hearth Off-Leash Dog Park, 190 Ferry Street.</p><p><strong>Where off-leash use is allowed:</strong> only where signage is posted in designated CBRM park areas.</p><p><strong>Handler requirements:</strong> dogs must have current CBRM tags, owners must carry a leash, dogs must come when called, and dogs must remain within sight.</p><p><strong>Prohibited in off-leash areas:</strong> aggressive dogs, female dogs in heat, and puppies under three months old.</p><p><strong>Clean-up and liability:</strong> owners must pick up waste immediately and are responsible for damage or injuries caused by a dog in their care.</p>';
const etiquette =
  '<p><strong>1. Use the named off-leash sites, not assumptions.</strong></p><p>CBRM identifies specific Sydney locations for off-leash use, so dogs should stay leashed outside posted off-leash zones.</p><p><strong>2. Treat recall as mandatory.</strong></p><p>The municipality explicitly says your dog must come when called and remain within sight.</p><p><strong>3. Carry a leash every time.</strong></p><p>That is part of the published off-leash area rules, not just a courtesy suggestion.</p><p><strong>4. Avoid high-conflict visits.</strong></p><p>CBRM bars aggressive dogs, dogs in heat, and puppies under three months old from off-leash areas.</p><p><strong>5. Expect shared public space around the park edges.</strong></p><p>Open Hearth and Rotary Park are part of the wider community park system, so calm entry and exit behaviour matters.</p>';
const faqs =
  '<p><strong>1. Does Sydney have official off-leash dog parks?</strong></p><p>Yes. CBRM currently lists Rotary Park and Open Hearth Off-Leash Dog Park in Sydney.</p><p><strong>2. Where are Sydney’s off-leash dog parks?</strong></p><p>CBRM lists Rotary Park at 361 Rotary Drive and Open Hearth Off-Leash Dog Park at 190 Ferry Street.</p><p><strong>3. Can dogs be off leash anywhere in Sydney parks?</strong></p><p>No. CBRM says dogs are allowed off leash only where signage is posted in designated park areas.</p><p><strong>4. Do dogs need tags to use Sydney off-leash areas?</strong></p><p>Yes. CBRM’s off-leash rules say dogs must have current CBRM tags.</p><p><strong>5. What control standard applies inside the off-leash areas?</strong></p><p>Handlers must carry a leash, keep dogs within sight, and ensure dogs come when called.</p><p><strong>6. What dogs are not allowed in Sydney’s off-leash areas?</strong></p><p>CBRM says aggressive dogs, female dogs in heat, and puppies under three months old are not permitted.</p>';

Object.assign(city, {
  seoTitle,
  metaDescription,
  description: metaDescription,
  body: about,
  references: {
    ...(city.references || {}),
    'Featured Park 1': ['rotary-park-off-leash-area-sydney'],
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
  'Featured Park 1': 'rotary-park-off-leash-area-sydney',
  'Featured Park 2': '',
  'Featured Park 3': '',
  'Seasonal Tips': seasonalTips,
  'Park Rules': parkRules,
  'City Website': 'https://cbrm.ns.ca/parks-recreation/parks-trails-green-spaces/',
  'Province Page': 'https://leashfree.ca/nova-scotia-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'North Sydney, Glace Bay, New Waterford',
  'Reviewed On': '2026-07-29',
  'Updated On': 'Wed Jul 29 2026 22:30:00 GMT+0000 (Coordinated Universal Time)',
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');

let overrides = fs.readFileSync(overridesPath, 'utf8');
if (!overrides.includes('"sydney": "/images/cities/city-sydney-hero.png"')) {
  overrides = overrides.replace(
    /(const cityImageOverrides = \{\n)/,
    '$1  "sydney": "/images/cities/city-sydney-hero.png",\n',
  );
  fs.writeFileSync(overridesPath, overrides);
}

let csv = fs.readFileSync(csvPath, 'utf8');
csv = csv.replace(/Off-Leash Dog Parks in Sydney, NS/g, 'Sydney Dog Parks and CBRM Off-Leash Rules | LeashFree.ca');
csv = csv.replace(
  /Explore off-leash dog parks in Sydney, Nova Scotia\. Find the best spaces for your dog to run, play, and socialize safely\./g,
  'Source-backed Sydney guide covering the official CBRM off-leash dog parks at Rotary Park and Open Hearth Park, plus current off-leash area rules and dog-tag requirements.',
);
fs.writeFileSync(csvPath, csv);

const backlogLines = fs.readFileSync(backlogPath, 'utf8').trimEnd().split(/\r?\n/);
const header = backlogLines[0];
const filtered = [header, ...backlogLines.slice(1).filter((line) => !line.includes(',City Pages,Sydney,/dog-parks/sydney/,'))];
fs.writeFileSync(backlogPath, filtered.join('\n') + '\n');

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 612 pages in the current working queue.', 'This backlog contains 611 pages in the current working queue.');
summary = summary.replace('| T1-source-research | 6 |', '| T1-source-research | 5 |');
summary = summary.replace('| City Pages | 10 |', '| City Pages | 9 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Sydney city page and refreshed backlog files.');
