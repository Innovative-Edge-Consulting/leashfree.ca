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
const city = cities.find((entry) => entry.slug === 'quinte-west');

if (!city) {
  throw new Error('Quinte West city record not found');
}

const seoTitle = 'Quinte West Dog Park and Dog Licence Rules | LeashFree.ca';
const metaDescription =
  'Source-backed guide to Quinte West dog parks and dog licence rules, covering Hanna Park and the Kinsmen Community Dog Park, current park rules, annual tag fees, and animal-control requirements.';
const intro =
  '<p>Quinte West has one clearly identified municipal off-leash destination at Hanna Park, where the Kinsmen Community Dog Park operates under city-posted rules and annual dog-licensing requirements.</p>';
const about =
  "<p>Quinte West's current parks pages are more specific than the old draft. The city identifies Hanna Park at 169 Creswell Drive as a 42-acre park with trails, tennis courts, a playground, and the Kinsmen Community Dog Park. The same city page describes the dog park as a fully enclosed off-leash dog park located in Hanna Park just off Dufferin Avenue. The official park directory also lists both Hanna Park and Kinsmen Community Dog Park at the same site, which is a better factual basis than the older copy claiming a separate Quinte West Dog Park in Bain Park. For users, the practical takeaway is straightforward: Quinte West's named municipal off-leash offering is the Kinsmen Community Dog Park at Hanna Park, not a broader citywide network of separate dog parks.</p><p>The city also publishes useful operating rules and licensing detail. Hanna Park is listed as open daily from dusk to dawn, with free vehicle parking available throughout the park. The dog-park rules on the Hanna Park page say all dogs must be licenced, puppies under five months are not allowed, female dogs in heat are not allowed, handlers must have a leash, dogs must be on leash when entering and exiting, and a maximum of two dogs per handler is permitted. Quinte West's animals and pets page adds the citywide licensing requirements: dog licences must be purchased annually for each dog, must be purchased no later than July 1 each year, and refusal to buy a dog licence may result in a $75 penalty. The current fee table published by the city lists $25 for an annual dog licence if purchased before July 1, $37.50 after July 1, $5 for a replacement tag, and $100 for recovery of a dog from an animal shelter. The same page says Quinte West allows no more than three dogs in an urban area and no more than five dogs in a rural area, and directs animal-control complaints such as stray dogs, off-leash animals, lost pets, injured animals, dog bites, and nuisance complaints to Animal Control at 613-966-4483.</p>";
const seasonalTips =
  '<ul><li><strong>Winter:</strong> Hanna Park remains a useful dog-walking destination, but short daylight and icy footing matter more because the park is posted as open from dusk to dawn rather than with fixed daytime service windows.</li><li><strong>Spring:</strong> muddy conditions can show up around the off-leash area and wooded trails, so this is the season to bring towels and keep entry and exit leash handling tidy.</li><li><strong>Summer:</strong> the city has previously scheduled summer maintenance closures at the dog park, so it is worth checking Quinte West notices before heading over.</li><li><strong>Fall:</strong> cooler temperatures make Hanna Park easier for longer visits, especially if you want to combine the dog park with the surrounding trail network.</li></ul>';
const etiquette =
  '<p><strong>1. Treat Hanna Park as the main municipal off-leash destination.</strong></p><p>The official city pages point to Hanna Park and the Kinsmen Community Dog Park, not to a larger network of separate city dog parks.</p><p><strong>2. Bring a leash and use it at the gate.</strong></p><p>Quinte West specifically says dogs must be on leash when entering and exiting the dog park.</p><p><strong>3. Keep the numbers manageable.</strong></p><p>The posted dog-park rules allow a maximum of two dogs per handler.</p><p><strong>4. Stay current on dog licensing.</strong></p><p>The city requires annual dog licences and ties those fees directly to animal control and leash-free dog park services.</p><p><strong>5. Do not assume every dog is eligible.</strong></p><p>The city says puppies under five months and female dogs in heat are not allowed in the dog park.</p>';
const faqs =
  '<p><strong>1. Does Quinte West have an official dog park?</strong></p><p>Yes. The City of Quinte West identifies the Kinsmen Community Dog Park at Hanna Park as its fully enclosed off-leash dog park.</p><p><strong>2. Where is the Quinte West dog park?</strong></p><p>The city lists Hanna Park at 169 Creswell Drive in Trenton and says the dog park is located in Hanna Park just off Dufferin Avenue.</p><p><strong>3. What are the current Quinte West dog licence fees?</strong></p><p>As of July 29, 2026, Quinte West lists $25 before July 1, $37.50 after July 1, $5 for a replacement tag, and $100 for recovery of a dog from an animal shelter.</p><p><strong>4. Do Quinte West dogs need annual licences?</strong></p><p>Yes. The city says dog licences must be purchased annually for each dog and no later than July 1 each year.</p><p><strong>5. How many dogs can one person bring into the dog park?</strong></p><p>Quinte West says a maximum of two dogs per handler is permitted in the dog park.</p><p><strong>6. Who handles animal-control complaints in Quinte West?</strong></p><p>The city directs complaints such as stray dogs, off-leash animals, dog bites, lost pets, and nuisance issues to Animal Control at 613-966-4483.</p>';

Object.assign(city, {
  seoTitle,
  metaDescription,
  description: metaDescription,
  body: about,
  references: {
    ...(city.references || {}),
    'Featured Park 1': ['hanna-park-dog-park-quinte-west'],
    'Featured Park 2': ['kinsmen-dog-park-quinte-west'],
    'Featured Park 3': [],
    'Province Page': ['https://leashfree.ca/ontario-dog-parks'],
  },
});

Object.assign(city.raw, {
  'SEO Title Tag': seoTitle,
  'Meta Description': metaDescription,
  'Intro Paragraph': intro,
  'About Section': about,
  'Featured Park 1': 'hanna-park-dog-park-quinte-west',
  'Featured Park 2': 'kinsmen-dog-park-quinte-west',
  'Featured Park 3': '',
  'Seasonal Tips': seasonalTips,
  'City Website': 'https://quintewest.ca/parks-facilities/parks/hanna-park/',
  'Province Page': 'https://leashfree.ca/ontario-dog-parks',
  'Dog Park Etiquettes': etiquette,
  'Dog Park FAQs': faqs,
  'Nearby Cities': 'Belleville, Brighton, Campbellford',
  'Reviewed On': '2026-07-29',
  'Updated On': 'Wed Jul 29 2026 20:00:00 GMT+0000 (Coordinated Universal Time)',
});

fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2) + '\n');

let overrides = fs.readFileSync(overridesPath, 'utf8');
if (!overrides.includes('"quinte-west": "/images/cities/city-quinte-west-hero.png"')) {
  overrides = overrides.replace(
    /(const cityImageOverrides = \{\n)/,
    '$1  "quinte-west": "/images/cities/city-quinte-west-hero.png",\n',
  );
  fs.writeFileSync(overridesPath, overrides);
}

let csv = fs.readFileSync(csvPath, 'utf8');
csv = csv.replace(
  /Dog Parks in Quinte West Ontario \| LeashFree\.ca/g,
  'Quinte West Dog Park and Dog Licence Rules | LeashFree.ca',
);
csv = csv.replace(
  /Find off-leash dog parks and scenic trails in Quinte West, Ontario\. Enjoy fenced spaces and pet-friendly paths throughout this welcoming community\./g,
  "Source-backed guide to Quinte West dog parks and dog licence rules, covering Hanna Park and the Kinsmen Community Dog Park, current park rules, annual tag fees, and animal-control requirements.",
);
fs.writeFileSync(csvPath, csv);

const backlogLines = fs.readFileSync(backlogPath, 'utf8').trimEnd().split(/\r?\n/);
const header = backlogLines[0];
const filtered = [header, ...backlogLines.slice(1).filter((line) => !line.includes(',City Pages,Quinte West,/dog-parks/quinte-west/,'))];
fs.writeFileSync(backlogPath, filtered.join('\n') + '\n');

let summary = fs.readFileSync(backlogSummaryPath, 'utf8');
summary = summary.replace('This backlog contains 615 pages in the current working queue.', 'This backlog contains 614 pages in the current working queue.');
summary = summary.replace('| T1-source-research | 9 |', '| T1-source-research | 8 |');
summary = summary.replace('| City Pages | 13 |', '| City Pages | 12 |');
summary = summary.replace(/## First 50 pages[\s\S]*$/, '## First 50 pages\n');
fs.writeFileSync(backlogSummaryPath, summary);

console.log('Updated Quinte West city page and refreshed backlog files.');
