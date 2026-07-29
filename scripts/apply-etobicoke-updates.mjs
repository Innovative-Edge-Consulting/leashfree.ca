import fs from "node:fs";

const citiesPath = "src/data/generated/cities.json";
const overridesPath = "src/data/dog-park-image-overrides.js";
const cityCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const backlogCsvPath = "reports/thin-page-backlog.csv";
const backlogSummaryPath = "reports/thin-page-backlog-summary.md";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
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
  for (const [key, value] of Object.entries(updates)) raw[key] = value;
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  if (source.includes('"etobicoke": "/images/cities/city-etobicoke-hero.png"')) return;
  const anchor = '  "estevan": "/images/dog-parks/estevan-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "etobicoke": "/images/cities/city-etobicoke-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "etobicoke");
  if (!city) throw new Error("Etobicoke city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, Etobicoke dog-park guidance is best treated as Toronto guidance applied to Etobicoke's local designated off-leash areas. The City of Toronto clearly publishes current licensing rules, off-leash rules, and responsible-dog-ownership standards, while its off-leash map is currently marked down for maintenance, which means this page should stay factual about rules and use representative Etobicoke sites conservatively instead of claiming a live official count.</p>";
  const about = "<p>Because Etobicoke is part of Toronto, the strongest city page is one built from Toronto's current animal rules rather than from recycled neighbourhood summaries. The City of Toronto says all dogs and cats owned in Toronto must be licensed and wear a tag, and the licence must be renewed every year. As of July 29, 2026, Toronto's published licence fees are $25 for a spayed or neutered dog and $60 for a dog that is not spayed or neutered, with discounts and special cases listed separately by the city. The same current licensing material says failure to license a dog or cat each year may result in a $240 ticket or a maximum fine of $5,000. For Etobicoke owners, the city also lists Toronto Animal Services West at 146 The East Mall as an in-person licensing location.</p><p>Toronto's current dog-access rules are equally important because they define what Etobicoke visitors should actually do in parks. The city's responsible-dog-ownership page says dogs must be leashed in public unless they are in an officially designated dogs off-leash area, including in parks, school yards, beaches, sidewalks, and roadways. Leashes should be no longer than two metres. The off-leash rules page adds that dogs using designated off-leash areas must be vaccinated and licensed, dogs cannot be left unattended, and some dogs are prohibited from using these areas, including aggressive dogs with a history of biting, female dogs in heat, dogs under dangerous-dog orders, and pitbulls as defined by Ontario's Dog Owners' Liability Act. That ruleset is more useful than generic copy because it tells Etobicoke users exactly how to handle entry, supervision, and compliance whether they are heading to larger waterfront sites like Humber Bay Park West and Marie Curtis Park or more neighbourhood-scale areas such as Grand Avenue Park and Zorra Park. For maintenance or incident reporting, Toronto directs users to 311, while animal-enforcement and assistance issues route through Toronto Animal Services.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Toronto's Etobicoke waterfront and ravine-edge areas can be windier and icier than inland neighbourhood parks, so traction matters.</li><li><strong>Spring:</strong> Thaw conditions can leave softer ground and muddier access in larger naturalized spaces.</li><li><strong>Summer:</strong> Beaches and waterfront parks attract heavier use, so earlier visits usually make off-leash control easier.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer outings, but damp leaves can reduce footing in shaded areas.</li></ul>";
  const parkRules = "<p><strong>License and tag your dog:</strong> Toronto says all dogs must be licensed, wear a tag, and renew annually.</p><p><strong>Keep dogs leashed outside designated off-leash areas:</strong> the city says public parks, school yards, beaches, sidewalks, and roadways are on-leash unless the space is officially designated for off-leash use.</p><p><strong>Use a proper leash:</strong> Toronto says leashes should be no longer than two metres.</p><p><strong>Meet the off-leash entry standard:</strong> dogs using off-leash areas must be vaccinated and licensed.</p><p><strong>Do not bring prohibited dogs into off-leash areas:</strong> the city excludes aggressive dogs with a history of biting, female dogs in heat, dogs under dangerous-dog orders, and pitbulls as defined by provincial law.</p>";
  const etiquette = "<p><strong>1. Treat Etobicoke as Toronto first.</strong></p><p>The local geography changes, but the governing rules come from the City of Toronto, so those rules should drive your visit.</p><p><strong>2. Keep the leash transition disciplined.</strong></p><p>Toronto is explicit that dogs are on leash in public unless they are inside an officially designated off-leash area.</p><p><strong>3. Do not use the city map downtime as a reason to improvise.</strong></p><p>If signage is unclear on arrival, default to on-leash behaviour until the designated area is obvious.</p><p><strong>4. Match your dog to the site type.</strong></p><p>Etobicoke includes large waterfront and trail-adjacent spaces as well as compact neighbourhood runs, and not every dog handles both equally well.</p><p><strong>5. Use 311 when there is a real site issue.</strong></p><p>Toronto explicitly routes maintenance and incident reporting through 311, which is more useful than guessing who manages a given local area.</p>";
  const faqs = "<p><strong>1. Do Etobicoke dogs need a Toronto licence?</strong></p><p>Yes. Etobicoke is part of Toronto, and the city says all dogs and cats owned in Toronto must be licensed and wear a tag.</p><p><strong>2. What are the current Toronto dog-licence fees?</strong></p><p>As of July 29, 2026, Toronto lists $25 for a spayed or neutered dog and $60 for a dog that is not spayed or neutered.</p><p><strong>3. Can dogs be off leash in Etobicoke parks generally?</strong></p><p>No. Toronto says dogs must be leashed in public unless they are in an officially designated dogs off-leash area.</p><p><strong>4. What leash length does Toronto expect?</strong></p><p>The city's responsible-dog-ownership page says leashes should be no more than two metres long.</p><p><strong>5. Who should Etobicoke users contact about off-leash area maintenance or incidents?</strong></p><p>Toronto directs users to 311 for maintenance or incident reporting related to off-leash areas.</p><p><strong>6. Where is the west Toronto Animal Services in-person licensing location?</strong></p><p>The city lists Toronto Animal Services West at 146 The East Mall.</p>";
  const metaDescription = "Source-backed guide to Etobicoke dog parks and Toronto off-leash rules, covering current licensing fees, leash requirements, designated off-leash use, prohibited dogs, and Toronto Animal Services contacts.";

  city.seoTitle = "Etobicoke Dog Parks and Toronto Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Ontario"],
    "Featured Park 1": ["humber-bay-park-west-etobicoke"],
    "Featured Park 2": ["marie-curtis-park-etobicoke"],
    "Featured Park 3": ["grand-avenue-park"],
    "Province Page": ["https://leashfree.ca/ontario-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "humber-bay-park-west-etobicoke",
    "Featured Park 2": "marie-curtis-park-etobicoke",
    "Featured Park 3": "grand-avenue-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dog-off-leash-areas/",
    "Province Page": "https://leashfree.ca/ontario-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Toronto, Mississauga, Oakville",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "etobicoke");
  if (!targetRow) throw new Error("Etobicoke city CSV row not found.");
  const updates = {
    "SEO Title Tag": "Etobicoke Dog Parks and Toronto Off-Leash Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to Etobicoke dog parks and Toronto off-leash rules, covering current licensing fees, leash requirements, designated off-leash use, prohibited dogs, and Toronto Animal Services contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, Etobicoke dog-park guidance is best treated as Toronto guidance applied to Etobicoke's local designated off-leash areas. The City of Toronto clearly publishes current licensing rules, off-leash rules, and responsible-dog-ownership standards, while its off-leash map is currently marked down for maintenance, which means this page should stay factual about rules and use representative Etobicoke sites conservatively instead of claiming a live official count.</p>",
    "About Section": "<p>Because Etobicoke is part of Toronto, the strongest city page is one built from Toronto's current animal rules rather than from recycled neighbourhood summaries. The City of Toronto says all dogs and cats owned in Toronto must be licensed and wear a tag, and the licence must be renewed every year. As of July 29, 2026, Toronto's published licence fees are $25 for a spayed or neutered dog and $60 for a dog that is not spayed or neutered, with discounts and special cases listed separately by the city. The same current licensing material says failure to license a dog or cat each year may result in a $240 ticket or a maximum fine of $5,000. For Etobicoke owners, the city also lists Toronto Animal Services West at 146 The East Mall as an in-person licensing location.</p><p>Toronto's current dog-access rules are equally important because they define what Etobicoke visitors should actually do in parks. The city's responsible-dog-ownership page says dogs must be leashed in public unless they are in an officially designated dogs off-leash area, including in parks, school yards, beaches, sidewalks, and roadways. Leashes should be no longer than two metres. The off-leash rules page adds that dogs using designated off-leash areas must be vaccinated and licensed, dogs cannot be left unattended, and some dogs are prohibited from using these areas, including aggressive dogs with a history of biting, female dogs in heat, dogs under dangerous-dog orders, and pitbulls as defined by Ontario's Dog Owners' Liability Act. That ruleset is more useful than generic copy because it tells Etobicoke users exactly how to handle entry, supervision, and compliance whether they are heading to larger waterfront sites like Humber Bay Park West and Marie Curtis Park or more neighbourhood-scale areas such as Grand Avenue Park and Zorra Park. For maintenance or incident reporting, Toronto directs users to 311, while animal-enforcement and assistance issues route through Toronto Animal Services.</p>",
    "Featured Park 1": "humber-bay-park-west-etobicoke",
    "Featured Park 2": "marie-curtis-park-etobicoke",
    "Featured Park 3": "grand-avenue-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Toronto's Etobicoke waterfront and ravine-edge areas can be windier and icier than inland neighbourhood parks, so traction matters.</li><li><strong>Spring:</strong> Thaw conditions can leave softer ground and muddier access in larger naturalized spaces.</li><li><strong>Summer:</strong> Beaches and waterfront parks attract heavier use, so earlier visits usually make off-leash control easier.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer outings, but damp leaves can reduce footing in shaded areas.</li></ul>",
    "Park Rules": "<p><strong>License and tag your dog:</strong> Toronto says all dogs must be licensed, wear a tag, and renew annually.</p><p><strong>Keep dogs leashed outside designated off-leash areas:</strong> the city says public parks, school yards, beaches, sidewalks, and roadways are on-leash unless the space is officially designated for off-leash use.</p><p><strong>Use a proper leash:</strong> Toronto says leashes should be no longer than two metres.</p><p><strong>Meet the off-leash entry standard:</strong> dogs using off-leash areas must be vaccinated and licensed.</p><p><strong>Do not bring prohibited dogs into off-leash areas:</strong> the city excludes aggressive dogs with a history of biting, female dogs in heat, dogs under dangerous-dog orders, and pitbulls as defined by provincial law.</p>",
    "City Website": "https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dog-off-leash-areas/",
    "Province Page": "https://leashfree.ca/ontario-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Treat Etobicoke as Toronto first.</strong></p><p>The local geography changes, but the governing rules come from the City of Toronto, so those rules should drive your visit.</p><p><strong>2. Keep the leash transition disciplined.</strong></p><p>Toronto is explicit that dogs are on leash in public unless they are inside an officially designated off-leash area.</p><p><strong>3. Do not use the city map downtime as a reason to improvise.</strong></p><p>If signage is unclear on arrival, default to on-leash behaviour until the designated area is obvious.</p><p><strong>4. Match your dog to the site type.</strong></p><p>Etobicoke includes large waterfront and trail-adjacent spaces as well as compact neighbourhood runs, and not every dog handles both equally well.</p><p><strong>5. Use 311 when there is a real site issue.</strong></p><p>Toronto explicitly routes maintenance and incident reporting through 311, which is more useful than guessing who manages a given local area.</p>",
    "Dog Park FAQs": "<p><strong>1. Do Etobicoke dogs need a Toronto licence?</strong></p><p>Yes. Etobicoke is part of Toronto, and the city says all dogs and cats owned in Toronto must be licensed and wear a tag.</p><p><strong>2. What are the current Toronto dog-licence fees?</strong></p><p>As of July 29, 2026, Toronto lists $25 for a spayed or neutered dog and $60 for a dog that is not spayed or neutered.</p><p><strong>3. Can dogs be off leash in Etobicoke parks generally?</strong></p><p>No. Toronto says dogs must be leashed in public unless they are in an officially designated dogs off-leash area.</p><p><strong>4. What leash length does Toronto expect?</strong></p><p>The city's responsible-dog-ownership page says leashes should be no more than two metres long.</p><p><strong>5. Who should Etobicoke users contact about off-leash area maintenance or incidents?</strong></p><p>Toronto directs users to 311 for maintenance or incident reporting related to off-leash areas.</p><p><strong>6. Where is the west Toronto Animal Services in-person licensing location?</strong></p><p>The city lists Toronto Animal Services West at 146 The East Mall.</p>",
    "Nearby Cities": "Toronto, Mississauga, Oakville",
    "Updated On": "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/etobicoke/")];
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
updateCityCsv();
updateBacklogFiles();
console.log("Updated Etobicoke city page and refreshed backlog files.");
