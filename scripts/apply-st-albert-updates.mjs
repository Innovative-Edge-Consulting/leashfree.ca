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
  if (source.includes('"st-albert": "/images/cities/city-st-albert-hero.png"')) return;
  const anchor = '  "guelph": "/images/cities/city-guelph-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "st-albert": "/images/cities/city-st-albert-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "st-albert");
  if (!city) throw new Error("St. Albert city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, St. Albert is one of the clearer Alberta municipalities for off-leash research because the city explicitly separates fully fenced dog parks, open off-leash sites, and seasonal boarded-rink spaces. That matters because a good city page should explain the system residents actually use rather than implying every off-leash option works the same way.</p>";
  const about = "<p>St. Albert's current off-leash program is broader than two fenced dog parks. The city's off-leash locations page says St. Albert has three different types of designated off-leash areas and specifically identifies two larger, fully fenced off-leash dog parks: Dodger Dog Park and Lacombe Lake Dog Park. The same page says Lacombe Lake Dog Park includes a small-dog area for dogs weighing 11 kilograms, or 25 pounds, and under. Beyond those two fenced parks, St. Albert also designates open off-leash sites in parks across the city, available when they are not in use for organized sporting activities scheduled and authorized by the city, plus boarded outdoor rinks that are used for dog off-leash activity from spring to fall. The city also notes that the Salisbury Park off-leash area is closed during the Sturgeon Heights Reservoir Replacement and Decommissioning project, and that some alternate nearby locations should be used instead. That level of detail is useful because it tells owners that St. Albert's off-leash network is not just a couple of fenced runs.</p><p>The operating rules are also unusually explicit. St. Albert's responsible dog ownership guidance says the city is an on-leash community unless you are inside one of the city's two dog parks or another designated off-leash area. The same page says all dogs must be leashed on or within one metre of trails, including trails in an off-leash area, and dog owners or walkers must always carry a leash even when using off-leash space. The city's licensing page adds that all dogs six months or older residing in St. Albert for more than 14 days must be licensed. As of July 29, 2026, published annual licence fees are $40 for a spayed or neutered dog and $73 for a dog that is not spayed or neutered, with late fees after January 31 and reduced rates for new owners after September 30. For off-leash planning, that means St. Albert owners need to think about site type, trail boundaries, and licence compliance together rather than treating the city's dog spaces as unrestricted parkland.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> St. Albert's open sites and trail-adjacent areas can stay icy, and boarded rinks shift back to skating use, so site type matters by season.</li><li><strong>Spring:</strong> Rink-based off-leash spaces reopen for dogs from spring to fall, but thaw conditions can create mud at open sites.</li><li><strong>Summer:</strong> Larger fenced parks like Dodger and Lacombe Lake handle routine exercise better than exposed shared fields during hotter periods.</li><li><strong>Fall:</strong> Shoulder-season use is good for open sites and rinks, but organized sports can still affect some off-leash site availability.</li></ul>";
  const parkRules = "<p><strong>Stay on leash except in designated areas:</strong> St. Albert says it is an on-leash community unless you are in one of the city's dog parks or other designated off-leash areas.</p><p><strong>Respect trail boundaries:</strong> all dogs must be leashed on or within one metre of trails, including trails in an off-leash area.</p><p><strong>Carry a leash at all times:</strong> owners and walkers must always carry a leash, even in off-leash spaces.</p><p><strong>License eligible dogs:</strong> the city requires licensing for dogs six months or older residing in St. Albert for more than 14 days.</p><p><strong>Use open sites only when sport bookings allow it:</strong> designated off-leash sites in parks are available only when organized sporting activities are not scheduled and authorized by the city.</p>";
  const etiquette = "<p><strong>1. Choose the correct St. Albert format.</strong></p><p>Some dogs need a fenced park like Dodger or Lacombe Lake, while others can handle open off-leash sites only if recall is dependable.</p><p><strong>2. Do not treat trails as off-leash corridors.</strong></p><p>St. Albert is explicit that dogs must be leashed on or within one metre of trails, even inside an off-leash area.</p><p><strong>3. Carry the leash, not just the collar.</strong></p><p>The city's guidance requires owners to carry a leash at all times, which matters when a dog gets overstimulated or another park user needs space.</p><p><strong>4. Check the site status before heading out.</strong></p><p>St. Albert currently notes closures and temporary rink limitations on its official pages, so a stale assumption can waste a trip.</p><p><strong>5. Match off-leash expectations to organized sport use.</strong></p><p>Open off-leash sites are not guaranteed all day; they depend on whether scheduled sporting activity is taking place.</p>";
  const faqs = "<p><strong>1. How many dedicated off-leash dog parks does St. Albert list?</strong></p><p>As of July 29, 2026, the city lists two larger fully fenced off-leash dog parks: Dodger Dog Park and Lacombe Lake Dog Park.</p><p><strong>2. Does St. Albert offer more than fenced dog parks?</strong></p><p>Yes. The city also lists designated open off-leash sites and boarded outdoor rinks used for off-leash dog activity from spring to fall.</p><p><strong>3. Is there a small-dog area in St. Albert?</strong></p><p>Yes. The city says Lacombe Lake Dog Park includes a small-dog area for dogs weighing 11 kilograms, or 25 pounds, and under.</p><p><strong>4. When does a St. Albert dog need a licence?</strong></p><p>Dogs six months or older living in St. Albert for more than 14 days must be licensed.</p><p><strong>5. What are the current annual St. Albert dog licence fees?</strong></p><p>As of July 29, 2026, the city lists $40 per year for a spayed or neutered dog and $73 per year for a dog that is not spayed or neutered.</p><p><strong>6. Who should residents contact about off-leash areas or animal-control issues?</strong></p><p>St. Albert lists Recreation & Parks at 780-418-6088 for off-leash area questions and Municipal Enforcement's 24/7 animal-control complaint line at 780-458-7700.</p>";
  const metaDescription = "Source-backed guide to St. Albert dog parks and off-leash rules, covering fenced parks, open off-leash sites, seasonal rink spaces, trail leash boundaries, dog licensing, and city contacts.";

  city.seoTitle = "St. Albert Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Alberta"],
    "Featured Park 1": ["dodger-dog-park"],
    "Featured Park 2": ["lacombe-lake-dog-park"],
    "Province Page": ["https://leashfree.ca/alberta-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "dodger-dog-park",
    "Featured Park 2": "lacombe-lake-dog-park",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://stalbert.ca/city/maps/dogs/areas/",
    "Province Page": "https://leashfree.ca/alberta-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Edmonton, Spruce Grove, Stony Plain",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "st-albert");
  if (!targetRow) throw new Error("St. Albert city CSV row not found.");
  const updates = {
    "SEO Title Tag": "St. Albert Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to St. Albert dog parks and off-leash rules, covering fenced parks, open off-leash sites, seasonal rink spaces, trail leash boundaries, dog licensing, and city contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, St. Albert is one of the clearer Alberta municipalities for off-leash research because the city explicitly separates fully fenced dog parks, open off-leash sites, and seasonal boarded-rink spaces. That matters because a good city page should explain the system residents actually use rather than implying every off-leash option works the same way.</p>",
    "About Section": "<p>St. Albert's current off-leash program is broader than two fenced dog parks. The city's off-leash locations page says St. Albert has three different types of designated off-leash areas and specifically identifies two larger, fully fenced off-leash dog parks: Dodger Dog Park and Lacombe Lake Dog Park. The same page says Lacombe Lake Dog Park includes a small-dog area for dogs weighing 11 kilograms, or 25 pounds, and under. Beyond those two fenced parks, St. Albert also designates open off-leash sites in parks across the city, available when they are not in use for organized sporting activities scheduled and authorized by the city, plus boarded outdoor rinks that are used for dog off-leash activity from spring to fall. The city also notes that the Salisbury Park off-leash area is closed during the Sturgeon Heights Reservoir Replacement and Decommissioning project, and that some alternate nearby locations should be used instead. That level of detail is useful because it tells owners that St. Albert's off-leash network is not just a couple of fenced runs.</p><p>The operating rules are also unusually explicit. St. Albert's responsible dog ownership guidance says the city is an on-leash community unless you are inside one of the city's two dog parks or another designated off-leash area. The same page says all dogs must be leashed on or within one metre of trails, including trails in an off-leash area, and dog owners or walkers must always carry a leash even when using off-leash space. The city's licensing page adds that all dogs six months or older residing in St. Albert for more than 14 days must be licensed. As of July 29, 2026, published annual licence fees are $40 for a spayed or neutered dog and $73 for a dog that is not spayed or neutered, with late fees after January 31 and reduced rates for new owners after September 30. For off-leash planning, that means St. Albert owners need to think about site type, trail boundaries, and licence compliance together rather than treating the city's dog spaces as unrestricted parkland.</p>",
    "Featured Park 1": "dodger-dog-park",
    "Featured Park 2": "lacombe-lake-dog-park",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> St. Albert's open sites and trail-adjacent areas can stay icy, and boarded rinks shift back to skating use, so site type matters by season.</li><li><strong>Spring:</strong> Rink-based off-leash spaces reopen for dogs from spring to fall, but thaw conditions can create mud at open sites.</li><li><strong>Summer:</strong> Larger fenced parks like Dodger and Lacombe Lake handle routine exercise better than exposed shared fields during hotter periods.</li><li><strong>Fall:</strong> Shoulder-season use is good for open sites and rinks, but organized sports can still affect some off-leash site availability.</li></ul>",
    "Park Rules": "<p><strong>Stay on leash except in designated areas:</strong> St. Albert says it is an on-leash community unless you are in one of the city's dog parks or other designated off-leash areas.</p><p><strong>Respect trail boundaries:</strong> all dogs must be leashed on or within one metre of trails, including trails in an off-leash area.</p><p><strong>Carry a leash at all times:</strong> owners and walkers must always carry a leash, even in off-leash spaces.</p><p><strong>License eligible dogs:</strong> the city requires licensing for dogs six months or older residing in St. Albert for more than 14 days.</p><p><strong>Use open sites only when sport bookings allow it:</strong> designated off-leash sites in parks are available only when organized sporting activities are not scheduled and authorized by the city.</p>",
    "City Website": "https://stalbert.ca/city/maps/dogs/areas/",
    "Province Page": "https://leashfree.ca/alberta-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Choose the correct St. Albert format.</strong></p><p>Some dogs need a fenced park like Dodger or Lacombe Lake, while others can handle open off-leash sites only if recall is dependable.</p><p><strong>2. Do not treat trails as off-leash corridors.</strong></p><p>St. Albert is explicit that dogs must be leashed on or within one metre of trails, even inside an off-leash area.</p><p><strong>3. Carry the leash, not just the collar.</strong></p><p>The city's guidance requires owners to carry a leash at all times, which matters when a dog gets overstimulated or another park user needs space.</p><p><strong>4. Check the site status before heading out.</strong></p><p>St. Albert currently notes closures and temporary rink limitations on its official pages, so a stale assumption can waste a trip.</p><p><strong>5. Match off-leash expectations to organized sport use.</strong></p><p>Open off-leash sites are not guaranteed all day; they depend on whether scheduled sporting activity is taking place.</p>",
    "Dog Park FAQs": "<p><strong>1. How many dedicated off-leash dog parks does St. Albert list?</strong></p><p>As of July 29, 2026, the city lists two larger fully fenced off-leash dog parks: Dodger Dog Park and Lacombe Lake Dog Park.</p><p><strong>2. Does St. Albert offer more than fenced dog parks?</strong></p><p>Yes. The city also lists designated open off-leash sites and boarded outdoor rinks used for off-leash dog activity from spring to fall.</p><p><strong>3. Is there a small-dog area in St. Albert?</strong></p><p>Yes. The city says Lacombe Lake Dog Park includes a small-dog area for dogs weighing 11 kilograms, or 25 pounds, and under.</p><p><strong>4. When does a St. Albert dog need a licence?</strong></p><p>Dogs six months or older living in St. Albert for more than 14 days must be licensed.</p><p><strong>5. What are the current annual St. Albert dog licence fees?</strong></p><p>As of July 29, 2026, the city lists $40 per year for a spayed or neutered dog and $73 per year for a dog that is not spayed or neutered.</p><p><strong>6. Who should residents contact about off-leash areas or animal-control issues?</strong></p><p>St. Albert lists Recreation & Parks at 780-418-6088 for off-leash area questions and Municipal Enforcement's 24/7 animal-control complaint line at 780-458-7700.</p>",
    "Nearby Cities": "Edmonton, Spruce Grove, Stony Plain",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/st-albert/")];
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
console.log("Updated St. Albert city page and refreshed backlog files.");
