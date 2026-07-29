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
  if (source.includes('"nelson": "/images/cities/city-nelson-hero.png"')) return;
  const anchor = '  "medicine-hat": "/images/cities/city-medicine-hat-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "nelson": "/images/cities/city-nelson-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "nelson");
  if (!city) throw new Error("Nelson city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, the City of Nelson does not appear to publish a simple one-page list of dedicated off-leash dog parks. What it does publish clearly is the city's dog-licensing requirements, domestic-animal rules, animal-control contacts, park restrictions such as the dog-free rule inside Rotary Lakeside Park, and official dog-use maps for downtown leash routes and waterfront dog-use areas.</p>";
  const about = "<p>Nelson's official material is more useful for rules and access context than for marketing-style park descriptions, so this city guide should follow that structure. The City of Nelson says all dogs in the city must be licensed, with current online licence pricing of $30 per year for spayed or neutered dogs and $70 per year for dogs that are not spayed or neutered. The domestic-animal rules page also says no more than two dogs or two cats may be kept in a residential zone, dogs may not be tied to public buildings, posts, signs, trees, or poles on public places, and owners must prevent noise disturbances and clean up dog waste on streets, lanes, pathways, parks, and other public property. That is already a stronger factual base than the older generic city copy.</p><p>The park-access side matters just as much in Nelson because the city distinguishes between places where dogs are broadly allowed and places where they are restricted. The official parks page says Rotary Lakeside Park itself is a dog-free zone, while dogs on leash are allowed on the perimeter walkways of the playing fields. The city's maps page also publishes a Downtown Dog Leash Map and a Waterfront Dog Use Areas map, which indicates the city manages dog access through mapped corridors and usage zones rather than through a large inventory of clearly branded dog parks. If you are using Nelson's waterfront or downtown areas with a dog, those city maps are more authoritative than generic online descriptions. For complaints or enforcement issues, the city lists Domestic Animal Control at 250-505-5666, while general city contact remains City Hall at 250-352-5511. Parks staff are listed at 250-352-8238 for park-related questions.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Nelson's hills, stairs, and pathways can become icy quickly, so traction matters more here than at flatter city-park systems.</li><li><strong>Spring:</strong> Shoulder-season moisture can make wooded and waterfront routes muddy, so expect softer footing and more cleanup afterward.</li><li><strong>Summer:</strong> Lakeside access gets busier, which makes it more important to respect the city's dog-free and leash-only zones around Rotary Lakeside Park.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer walks, but wet leaves on steeper paths can reduce traction for both dogs and handlers.</li></ul>";
  const parkRules = "<p><strong>License every dog in the city:</strong> Nelson says all dogs must be licensed, and the city's current pet-licence page lists both pricing and purchase options.</p><p><strong>Respect the household cap:</strong> the domestic-animals page says no more than two dogs or two cats may be kept in a residential zone in the city.</p><p><strong>Do not assume all parks are dog-access parks:</strong> Nelson says Rotary Lakeside Park itself is dog-free, with leashed dogs allowed only on the perimeter walkways of the playing fields.</p><p><strong>Use the official dog-use maps:</strong> the city publishes a Downtown Dog Leash Map and a Waterfront Dog Use Areas map, and those documents are the best guide to route-specific expectations.</p><p><strong>Clean up and control behaviour:</strong> owners must prevent waste on public property and avoid nuisance behaviour such as excessive barking or howling.</p>";
  const etiquette = "<p><strong>1. Treat Nelson as a rules-and-route city, not a clearly signed dog-park network.</strong></p><p>The city publishes maps and restrictions more clearly than it publishes a branded list of off-leash parks, so route awareness matters.</p><p><strong>2. Double-check the waterfront before you unclip anything.</strong></p><p>Nelson's official material specifically distinguishes Lakeside restrictions from other waterfront dog-use areas.</p><p><strong>3. Keep expectations realistic in a compact mountain city.</strong></p><p>Nelson's terrain, stairways, and narrower public spaces reward dogs with solid leash manners and recall.</p><p><strong>4. Keep licensing current and visible.</strong></p><p>The city is explicit that dogs must be licensed, and that requirement belongs in everyday use, not just enforcement situations.</p><p><strong>5. Do not build your visit around unsupported online park claims.</strong></p><p>Where city material is vague, the safer approach is to rely on posted signage and official maps instead of third-party summaries.</p>";
  const faqs = "<p><strong>1. Does Nelson publish an official list of dedicated off-leash dog parks?</strong></p><p>Not clearly. As of Wednesday, July 29, 2026, the city publicly provides dog rules, licence information, park restrictions, and dog-use maps, but not a simple official inventory page of dog parks.</p><p><strong>2. Do dogs need a city licence in Nelson?</strong></p><p>Yes. The City of Nelson says all dogs must be licensed within the city.</p><p><strong>3. How much does a Nelson dog licence cost?</strong></p><p>The city's current pet-licence page lists $30 per year for spayed or neutered dogs and $70 per year for dogs that are not spayed or neutered.</p><p><strong>4. Are dogs allowed in Rotary Lakeside Park?</strong></p><p>Not in the park itself. The city's parks page says Lakeside Park is a dog-free zone, although leashed dogs are permitted on the perimeter walkways of the playing fields.</p><p><strong>5. How many dogs can a household keep in Nelson?</strong></p><p>The domestic-animals page says no more than two dogs or two cats may be kept in a residential zone in the city.</p><p><strong>6. Who handles animal-control concerns in Nelson?</strong></p><p>The city lists Domestic Animal Control at 250-505-5666, and City Hall at 250-352-5511 for general contact.</p>";
  const metaDescription = "Source-backed guide to Nelson dog rules and dog-friendly access, covering city licensing, official dog-use maps, Rotary Lakeside Park restrictions, residential dog limits, and current animal-control contacts.";

  city.seoTitle = "Nelson Dog Rules and Dog-Friendly Access | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["British Columbia"],
    "Province Page": ["https://leashfree.ca/british-columbia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.nelson.ca/415/Maps",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "nelson");
  if (!targetRow) throw new Error("Nelson city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Nelson Dog Rules and Dog-Friendly Access | LeashFree.ca",
    "Meta Description": "Source-backed guide to Nelson dog rules and dog-friendly access, covering city licensing, official dog-use maps, Rotary Lakeside Park restrictions, residential dog limits, and current animal-control contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, the City of Nelson does not appear to publish a simple one-page list of dedicated off-leash dog parks. What it does publish clearly is the city's dog-licensing requirements, domestic-animal rules, animal-control contacts, park restrictions such as the dog-free rule inside Rotary Lakeside Park, and official dog-use maps for downtown leash routes and waterfront dog-use areas.</p>",
    "About Section": "<p>Nelson's official material is more useful for rules and access context than for marketing-style park descriptions, so this city guide should follow that structure. The City of Nelson says all dogs in the city must be licensed, with current online licence pricing of $30 per year for spayed or neutered dogs and $70 per year for dogs that are not spayed or neutered. The domestic-animal rules page also says no more than two dogs or two cats may be kept in a residential zone, dogs may not be tied to public buildings, posts, signs, trees, or poles on public places, and owners must prevent noise disturbances and clean up dog waste on streets, lanes, pathways, parks, and other public property. That is already a stronger factual base than the older generic city copy.</p><p>The park-access side matters just as much in Nelson because the city distinguishes between places where dogs are broadly allowed and places where they are restricted. The official parks page says Rotary Lakeside Park itself is a dog-free zone, while dogs on leash are allowed on the perimeter walkways of the playing fields. The city's maps page also publishes a Downtown Dog Leash Map and a Waterfront Dog Use Areas map, which indicates the city manages dog access through mapped corridors and usage zones rather than through a large inventory of clearly branded dog parks. If you are using Nelson's waterfront or downtown areas with a dog, those city maps are more authoritative than generic online descriptions. For complaints or enforcement issues, the city lists Domestic Animal Control at 250-505-5666, while general city contact remains City Hall at 250-352-5511. Parks staff are listed at 250-352-8238 for park-related questions.</p>",
    "Featured Park 1": "",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Nelson's hills, stairs, and pathways can become icy quickly, so traction matters more here than at flatter city-park systems.</li><li><strong>Spring:</strong> Shoulder-season moisture can make wooded and waterfront routes muddy, so expect softer footing and more cleanup afterward.</li><li><strong>Summer:</strong> Lakeside access gets busier, which makes it more important to respect the city's dog-free and leash-only zones around Rotary Lakeside Park.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer walks, but wet leaves on steeper paths can reduce traction for both dogs and handlers.</li></ul>",
    "Park Rules": "<p><strong>License every dog in the city:</strong> Nelson says all dogs must be licensed, and the city's current pet-licence page lists both pricing and purchase options.</p><p><strong>Respect the household cap:</strong> the domestic-animals page says no more than two dogs or two cats may be kept in a residential zone in the city.</p><p><strong>Do not assume all parks are dog-access parks:</strong> Nelson says Rotary Lakeside Park itself is dog-free, with leashed dogs allowed only on the perimeter walkways of the playing fields.</p><p><strong>Use the official dog-use maps:</strong> the city publishes a Downtown Dog Leash Map and a Waterfront Dog Use Areas map, and those documents are the best guide to route-specific expectations.</p><p><strong>Clean up and control behaviour:</strong> owners must prevent waste on public property and avoid nuisance behaviour such as excessive barking or howling.</p>",
    "City Website": "https://www.nelson.ca/415/Maps",
    "Province Page": "https://leashfree.ca/british-columbia-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Treat Nelson as a rules-and-route city, not a clearly signed dog-park network.</strong></p><p>The city publishes maps and restrictions more clearly than it publishes a branded list of off-leash parks, so route awareness matters.</p><p><strong>2. Double-check the waterfront before you unclip anything.</strong></p><p>Nelson's official material specifically distinguishes Lakeside restrictions from other waterfront dog-use areas.</p><p><strong>3. Keep expectations realistic in a compact mountain city.</strong></p><p>Nelson's terrain, stairways, and narrower public spaces reward dogs with solid leash manners and recall.</p><p><strong>4. Keep licensing current and visible.</strong></p><p>The city is explicit that dogs must be licensed, and that requirement belongs in everyday use, not just enforcement situations.</p><p><strong>5. Do not build your visit around unsupported online park claims.</strong></p><p>Where city material is vague, the safer approach is to rely on posted signage and official maps instead of third-party summaries.</p>",
    "Dog Park FAQs": "<p><strong>1. Does Nelson publish an official list of dedicated off-leash dog parks?</strong></p><p>Not clearly. As of Wednesday, July 29, 2026, the city publicly provides dog rules, licence information, park restrictions, and dog-use maps, but not a simple official inventory page of dog parks.</p><p><strong>2. Do dogs need a city licence in Nelson?</strong></p><p>Yes. The City of Nelson says all dogs must be licensed within the city.</p><p><strong>3. How much does a Nelson dog licence cost?</strong></p><p>The city's current pet-licence page lists $30 per year for spayed or neutered dogs and $70 per year for dogs that are not spayed or neutered.</p><p><strong>4. Are dogs allowed in Rotary Lakeside Park?</strong></p><p>Not in the park itself. The city's parks page says Lakeside Park is a dog-free zone, although leashed dogs are permitted on the perimeter walkways of the playing fields.</p><p><strong>5. How many dogs can a household keep in Nelson?</strong></p><p>The domestic-animals page says no more than two dogs or two cats may be kept in a residential zone in the city.</p><p><strong>6. Who handles animal-control concerns in Nelson?</strong></p><p>The city lists Domestic Animal Control at 250-505-5666, and City Hall at 250-352-5511 for general contact.</p>",
    "Nearby Cities": "",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/nelson/")];
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

console.log("Updated Nelson city page and refreshed backlog files.");
