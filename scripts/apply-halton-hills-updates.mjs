import fs from "node:fs";

const citiesPath = "src/data/generated/cities.json";
const parksPath = "src/data/generated/parks.json";
const overridesPath = "src/data/dog-park-image-overrides.js";
const cityCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const backlogCsvPath = "reports/thin-page-backlog.csv";
const backlogSummaryPath = "reports/thin-page-backlog-summary.md";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      value += char;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }
    if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function stringifyCsv(rows) {
  return `${rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

function setRawFields(raw, updates) {
  for (const [key, value] of Object.entries(updates)) {
    raw[key] = value;
  }
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  if (source.includes('"halton-hills-dog-parks": "/images/cities/city-halton-hills-hero.png"')) return;
  const anchor = '  "gimli": "/images/cities/city-gimli-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "halton-hills-dog-parks": "/images/cities/city-halton-hills-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "halton-hills-dog-parks");
  if (!city) throw new Error("Halton Hills city record not found.");

  const intro = "<p>Halton Hills has one of the clearer official municipal dog-park setups in this backlog. The Town of Halton Hills currently publishes three designated leash-free dog parks, gives exact locations and daily hours for each one, and pairs those listings with specific public-use rules, dog-control rules, and local canine-services contacts.</p>";
  const about = "<p>As of Tuesday, July 28, 2026, the Town of Halton Hills lists three official leash-free dog parks: Cedarvale Park leash free area at 181 Main Street South in Georgetown, Prospect Park leash free area at 30 Park Avenue in Acton, and Trafalgar Sports Park leash free area at 11494 Trafalgar Road in Georgetown. The town says all three are open daily from 6 a.m. to 11 p.m. and describes them as well-lit, fenced areas where dogs may run off leash under the supervision and control of their owners.</p><p>The same municipal pages also give the operating context that makes this city page stronger than the old generic version. The Town's Canine Services page says dogs must be kept on leash in public unless they are in a designated off-leash area, and says dog owners in Halton Hills must follow By-law 94-077. It also notes a maximum of three dogs is permitted at one location unless the property is licensed otherwise. Beyond the dog-park listings, the town publishes broader recreation context including more than 30 kilometres of local trails and more than 60 parks, but its trail etiquette page is explicit that pets on regular trails must remain leashed. That distinction matters: Halton Hills supports off-leash use, but only inside its designated leash-free enclosures.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Leash-free areas stay usable, but icy entrances and frozen turf make controlled arrivals and exits more important.</li><li><strong>Spring:</strong> Muddy ground is common in shoulder season, so bring towels and expect wetter footing in fenced grass areas.</li><li><strong>Summer:</strong> The official 6 a.m. to 11 p.m. hours make early and late visits practical during hotter weather.</li><li><strong>Fall:</strong> Halton Hills trails and parks are busy in cooler weather, so keep dogs leashed outside the fenced off-leash zones.</li></ul>";
  const parkRules = "<p><strong>Use off-leash privileges only inside designated enclosures:</strong> the Town says dogs must be kept on leash in public unless they are in a designated off-leash area.</p><p><strong>Follow the posted leash-free park regulations:</strong> users must unleash dogs in the designated area only, clean up after their pet, maintain voice and visual contact at all times, not leave children unattended, and comply with the Dog Owners' Liability Act.</p><p><strong>Respect the official hours:</strong> Cedarvale Park, Prospect Park, and Trafalgar Sports Park are each listed as open daily from 6 a.m. to 11 p.m.</p><p><strong>Know the local bylaw framework:</strong> the Town's Canine Services page says By-law 94-077 regulates the keeping of dogs and other animals within Halton Hills.</p><p><strong>Keep regular trails separate from dog parks:</strong> the Town's trail etiquette guidance says pets on trails must be on leash and cleaned up after.</p>";
  const etiquette = "<p><strong>1. Leash up before you reach the gate.</strong></p><p>Halton Hills explicitly limits off-leash use to designated enclosures, so dogs should arrive and leave under control.</p><p><strong>2. Stay engaged once your dog is inside.</strong></p><p>The Town requires owners to maintain voice and visual contact with their dog at all times.</p><p><strong>3. Treat cleanup as mandatory, not optional.</strong></p><p>Municipal regulations for the leash-free parks and the wider canine-services guidance both require owners to clean up after their pets.</p><p><strong>4. Do not blur trail use with dog-park use.</strong></p><p>Halton Hills has an active trail network, but the official trail etiquette page says pets on those routes must remain leashed.</p><p><strong>5. Use specialty hours only if they fit your dog.</strong></p><p>The Town publishes a Sunday small-dog hour at Cedarvale and a weekly greyhound-only hour at Prospect Park, so those sessions should be respected when planning visits.</p>";
  const faqs = "<p><strong>1. How many official leash-free dog parks does Halton Hills publish?</strong></p><p>Three. The Town lists Cedarvale Park, Prospect Park, and Trafalgar Sports Park as its designated leash-free dog parks.</p><p><strong>2. What hours are the Halton Hills dog parks open?</strong></p><p>The Town lists all three leash-free parks as open daily from 6 a.m. to 11 p.m.</p><p><strong>3. Can I let my dog off leash on Halton Hills trails?</strong></p><p>No. The Town's trail etiquette guidance says pets on regular trails must be on leash. Off-leash use is limited to designated dog-park areas.</p><p><strong>4. What rules apply inside the leash-free parks?</strong></p><p>The Town says users must unleash dogs only in the designated area, clean up after them, maintain voice and visual contact, not leave children unattended, and comply with the Dog Owners' Liability Act.</p><p><strong>5. What bylaw governs dog ownership in Halton Hills?</strong></p><p>The Town's Canine Services page says By-law 94-077 regulates the keeping of dogs and other animals within Halton Hills.</p><p><strong>6. Who handles loose-dog or stray-dog calls?</strong></p><p>The Town directs residents to Omega Canine Control, a 24-hour service at 905-877-6235.</p>";
  const metaDescription = "Official-source guide to dog parks in Halton Hills, Ontario, covering Cedarvale Park, Prospect Park, Trafalgar Sports Park, daily hours, leash rules, trail etiquette, and local canine-services contacts.";

  city.seoTitle = "Dog Parks in Halton Hills, Ontario | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Ontario"],
    "Featured Park 1": ["trafalgar-sports-park"],
    "Featured Park 2": ["cedarvale-park-halton-hills"],
    "Featured Park 3": ["prospect-park-halton-hills"],
    "Province Page": ["https://leashfree.ca/ontario-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "trafalgar-sports-park",
    "Featured Park 2": "cedarvale-park-halton-hills",
    "Featured Park 3": "prospect-park-halton-hills",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.haltonhills.ca/en/explore-and-play/leash-free-dog-parks.aspx",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "",
    "Updated On": "Tue Jul 28 2026 18:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 18:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
  const targetSlugs = [
    "cedarvale-park-halton-hills",
    "prospect-park-halton-hills",
    "trafalgar-sports-park"
  ];

  for (const slug of targetSlugs) {
    const park = parks.find((entry) => entry.slug === slug);
    if (!park) throw new Error(`Park record not found for ${slug}.`);
    if (!park.raw) continue;
    park.raw["Operating hours"] = "6:00 AM – 11:00 PM";
    park.raw["Park Website or Source"] = "https://www.haltonhills.ca/en/explore-and-play/leash-free-dog-parks.aspx";
  }

  fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "halton-hills-dog-parks");
  if (!targetRow) throw new Error("Halton Hills city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Halton Hills, Ontario | LeashFree.ca",
    "Meta Description": "Official-source guide to dog parks in Halton Hills, Ontario, covering Cedarvale Park, Prospect Park, Trafalgar Sports Park, daily hours, leash rules, trail etiquette, and local canine-services contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Halton Hills has one of the clearer official municipal dog-park setups in this backlog. The Town of Halton Hills currently publishes three designated leash-free dog parks, gives exact locations and daily hours for each one, and pairs those listings with specific public-use rules, dog-control rules, and local canine-services contacts.</p>",
    "About Section": "<p>As of Tuesday, July 28, 2026, the Town of Halton Hills lists three official leash-free dog parks: Cedarvale Park leash free area at 181 Main Street South in Georgetown, Prospect Park leash free area at 30 Park Avenue in Acton, and Trafalgar Sports Park leash free area at 11494 Trafalgar Road in Georgetown. The town says all three are open daily from 6 a.m. to 11 p.m. and describes them as well-lit, fenced areas where dogs may run off leash under the supervision and control of their owners.</p><p>The same municipal pages also give the operating context that makes this city page stronger than the old generic version. The Town's Canine Services page says dogs must be kept on leash in public unless they are in a designated off-leash area, and says dog owners in Halton Hills must follow By-law 94-077. It also notes a maximum of three dogs is permitted at one location unless the property is licensed otherwise. Beyond the dog-park listings, the town publishes broader recreation context including more than 30 kilometres of local trails and more than 60 parks, but its trail etiquette page is explicit that pets on regular trails must remain leashed. That distinction matters: Halton Hills supports off-leash use, but only inside its designated leash-free enclosures.</p>",
    "Featured Park 1": "trafalgar-sports-park",
    "Featured Park 2": "cedarvale-park-halton-hills",
    "Featured Park 3": "prospect-park-halton-hills",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Leash-free areas stay usable, but icy entrances and frozen turf make controlled arrivals and exits more important.</li><li><strong>Spring:</strong> Muddy ground is common in shoulder season, so bring towels and expect wetter footing in fenced grass areas.</li><li><strong>Summer:</strong> The official 6 a.m. to 11 p.m. hours make early and late visits practical during hotter weather.</li><li><strong>Fall:</strong> Halton Hills trails and parks are busy in cooler weather, so keep dogs leashed outside the fenced off-leash zones.</li></ul>",
    "Park Rules": "<p><strong>Use off-leash privileges only inside designated enclosures:</strong> the Town says dogs must be kept on leash in public unless they are in a designated off-leash area.</p><p><strong>Follow the posted leash-free park regulations:</strong> users must unleash dogs in the designated area only, clean up after their pet, maintain voice and visual contact at all times, not leave children unattended, and comply with the Dog Owners' Liability Act.</p><p><strong>Respect the official hours:</strong> Cedarvale Park, Prospect Park, and Trafalgar Sports Park are each listed as open daily from 6 a.m. to 11 p.m.</p><p><strong>Know the local bylaw framework:</strong> the Town's Canine Services page says By-law 94-077 regulates the keeping of dogs and other animals within Halton Hills.</p><p><strong>Keep regular trails separate from dog parks:</strong> the Town's trail etiquette guidance says pets on trails must be on leash and cleaned up after.</p>",
    "City Website": "https://www.haltonhills.ca/en/explore-and-play/leash-free-dog-parks.aspx",
    "Dog Park Etiquettes": "<p><strong>1. Leash up before you reach the gate.</strong></p><p>Halton Hills explicitly limits off-leash use to designated enclosures, so dogs should arrive and leave under control.</p><p><strong>2. Stay engaged once your dog is inside.</strong></p><p>The Town requires owners to maintain voice and visual contact with their dog at all times.</p><p><strong>3. Treat cleanup as mandatory, not optional.</strong></p><p>Municipal regulations for the leash-free parks and the wider canine-services guidance both require owners to clean up after their pets.</p><p><strong>4. Do not blur trail use with dog-park use.</strong></p><p>Halton Hills has an active trail network, but the official trail etiquette page says pets on those routes must remain leashed.</p><p><strong>5. Use specialty hours only if they fit your dog.</strong></p><p>The Town publishes a Sunday small-dog hour at Cedarvale and a weekly greyhound-only hour at Prospect Park, so those sessions should be respected when planning visits.</p>",
    "Dog Park FAQs": "<p><strong>1. How many official leash-free dog parks does Halton Hills publish?</strong></p><p>Three. The Town lists Cedarvale Park, Prospect Park, and Trafalgar Sports Park as its designated leash-free dog parks.</p><p><strong>2. What hours are the Halton Hills dog parks open?</strong></p><p>The Town lists all three leash-free parks as open daily from 6 a.m. to 11 p.m.</p><p><strong>3. Can I let my dog off leash on Halton Hills trails?</strong></p><p>No. The Town's trail etiquette guidance says pets on regular trails must be on leash. Off-leash use is limited to designated dog-park areas.</p><p><strong>4. What rules apply inside the leash-free parks?</strong></p><p>The Town says users must unleash dogs only in the designated area, clean up after them, maintain voice and visual contact, not leave children unattended, and comply with the Dog Owners' Liability Act.</p><p><strong>5. What bylaw governs dog ownership in Halton Hills?</strong></p><p>The Town's Canine Services page says By-law 94-077 regulates the keeping of dogs and other animals within Halton Hills.</p><p><strong>6. Who handles loose-dog or stray-dog calls?</strong></p><p>The Town directs residents to Omega Canine Control, a 24-hour service at 905-877-6235.</p>",
    "Nearby Cities": "",
    "Updated On": "Tue Jul 28 2026 18:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 18:00:00 GMT+0000 (Coordinated Universal Time)"
  };

  for (const [field, value] of Object.entries(updates)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }
  fs.writeFileSync(cityCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const pageIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/halton-hills-dog-parks/")];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));

  const bodyRows = filtered.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  const countBy = (field) => [...bodyRows.reduce((map, row) => {
    const key = row[field] || "";
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1]);

  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = bodyRows.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n");

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

updateOverridesFile();
updateCitiesJson();
updateParksJson();
updateCityCsv();
updateBacklogFiles();

console.log("Updated Halton Hills city page and refreshed backlog files.");
