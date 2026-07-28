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
  for (const [key, value] of Object.entries(updates)) raw[key] = value;
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  if (source.includes('"regina": "/images/cities/city-regina-hero.png"')) return;
  const anchor = '  "moose-jaw": "/images/cities/city-moose-jaw-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "regina": "/images/cities/city-regina-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "regina");
  if (!city) throw new Error("Regina city record not found.");

  const intro = "<p>Regina has enough current official material to support a stronger city guide than the generic page copy it had before. The City of Regina publishes a current dog parks page, a one-page off-leash rules PDF, a current cat and dog licences page, and the current Animal Bylaw page. That gives this guide a defensible source base for how many off-leash areas the city operates, how the system is split between year-round and seasonal spaces, and what owners are expected to do before using them.</p>";
  const about = "<p>The City of Regina currently says it operates five year-round off-leash dog parks and eight seasonal off-leash areas, for a total of 13 designated off-leash spaces across the city. The permanent parks are Cathy Lauritsen Memorial, Ross Industrial, Mount Pleasant, Māmowimīwēyitamōwin, and Horizon Station. That official breakdown is more precise than the older copy this page started with, and it matters because Regina mixes different park types: Cathy Lauritsen is only partially fenced and bordered by Wascana Creek, while Ross Industrial, Mount Pleasant, Māmowimīwēyitamōwin, and Horizon Station are fully fenced. Mount Pleasant and Māmowimīwēyitamōwin also have separate small-dog areas, limited to dogs that are 25 pounds or less and no more than 18 inches tall.</p><p>Regina's current rules and licensing pages add practical details this city guide should carry. The off-leash rules PDF says dog parks are use-at-your-own-risk spaces, owners and handlers must supervise and maintain voice control at all times, dogs must have a current licence and be vaccinated, dogs must be at least four months old, and dogs must be leashed while entering and exiting the park. The city also says non-sterilized female dogs in heat and dangerous animals are prohibited, and all year-round dog parks are open from 6 a.m. to 11 p.m. On the licensing side, Regina says dogs must wear their licence tags at all times, annual dog licences cost $25 for sterilized dogs or puppies under six months and $100 otherwise, replacement tags cost $5, and as of Tuesday, July 28, 2026, in-person licensing services are handled at Old Fire Hall #1, 1646 11th Avenue.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Regina's five permanent parks remain the core option when seasonal rink areas are closed for ice preparation, and the city says the year-round parks operate from 6 a.m. to 11 p.m.</li><li><strong>Spring:</strong> Cathy Lauritsen needs more caution during runoff because it is bordered by Wascana Creek and only partially fenced.</li><li><strong>Summer:</strong> Seasonal rink-based off-leash areas are available from May 1 to September 30, which materially expands your options beyond the five permanent parks.</li><li><strong>Fall:</strong> Seasonal areas stay open through September 30, then outdoor rinks are locked from early to mid-November as crews prepare for the ice season.</li></ul>";
  const parkRules = "<p><strong>Leash at transitions:</strong> Regina's off-leash rules require dogs to be leashed while entering and exiting the park and while coming to and from parked cars.</p><p><strong>Maintain supervision and voice control:</strong> owners and handlers must supervise and have voice control of their dogs at all times.</p><p><strong>Meet the entry baseline:</strong> dogs must have a current licence, be vaccinated, and be at least four months old.</p><p><strong>Know the small-dog limits:</strong> Mount Pleasant and Māmowimīwēyitamōwin reserve their small-dog areas for dogs 25 pounds or less and no more than 18 inches tall.</p><p><strong>Use the seasonal system correctly:</strong> Regina's seasonal rink-based off-leash areas operate from May 1 to September 30, with school-day hours of 4 to 11 p.m. and non-school-day hours of 6 a.m. to 11 p.m.</p>";
  const etiquette = "<p><strong>1. Choose the right park format.</strong></p><p>Regina is not one-size-fits-all. Cathy Lauritsen is a larger naturalized option with creek exposure, while several other city parks are fully fenced.</p><p><strong>2. Treat Cathy Lauritsen differently from the fenced parks.</strong></p><p>The city explicitly notes that it is only partially fenced and bordered by Wascana Creek, and it warns owners to stay off the ice during winter because of thin-ice concerns.</p><p><strong>3. Use the small-dog areas by the posted size limits.</strong></p><p>Regina does not leave this vague: Mount Pleasant and Māmowimīwēyitamōwin set both a weight and height cap for the small-dog sections.</p><p><strong>4. Keep your licence current and visible.</strong></p><p>The city says dogs must wear their licence tags at all times, not just at home or during enforcement issues.</p><p><strong>5. Remember that seasonal rinks are temporary, not permanent parks.</strong></p><p>Those eight sites only function as off-leash areas from May through September and then return to their rink role later in the year.</p>";
  const faqs = "<p><strong>1. How many official off-leash areas does Regina currently operate?</strong></p><p>The City of Regina currently says it operates five year-round dog parks and eight seasonal off-leash areas, for a total of 13 designated off-leash spaces.</p><p><strong>2. Which Regina parks have small-dog areas?</strong></p><p>Mount Pleasant and Māmowimīwēyitamōwin both have separate small-dog areas.</p><p><strong>3. What qualifies as a small dog in those areas?</strong></p><p>The city says dogs must be 25 pounds or less and no more than 18 inches tall.</p><p><strong>4. Do dogs need a city licence to use Regina dog parks?</strong></p><p>Yes. Regina's posted rules say dogs must have a current licence and be vaccinated, and the licensing page says dogs must wear their licence tags at all times.</p><p><strong>5. When are Regina's permanent dog parks open?</strong></p><p>The city says all year-round dog parks are open from 6 a.m. to 11 p.m.</p><p><strong>6. When are the seasonal rink-based off-leash areas available?</strong></p><p>Regina says they operate from May 1 to September 30 each year, unless noted otherwise.</p>";
  const metaDescription = "Source-backed guide to dog parks in Regina, Saskatchewan, covering the city's five year-round parks, eight seasonal rink-based off-leash areas, small-dog rules, licensing requirements, and current posted hours.";

  city.seoTitle = "Dog Parks in Regina, Saskatchewan | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Saskatchewan"],
    "Featured Park 1": ["cathy-lauritsen-memorial-off-leash-dog-park"],
    "Featured Park 2": ["mount-pleasant-off-leash-dog-park"],
    "Featured Park 3": ["mamowimiweyitamowin-park-off-leash-area"],
    "Province Page": ["https://leashfree.ca/saskatchewan-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "cathy-lauritsen-memorial-off-leash-dog-park",
    "Featured Park 2": "mount-pleasant-off-leash-dog-park",
    "Featured Park 3": "mamowimiweyitamowin-park-off-leash-area",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.regina.ca/parks-recreation-culture/parks/dog-parks/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Moose Jaw, Weyburn, Saskatoon",
    "Updated On": "Tue Jul 28 2026 15:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 15:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "regina");
  if (!targetRow) throw new Error("Regina city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Regina, Saskatchewan | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Regina, Saskatchewan, covering the city's five year-round parks, eight seasonal rink-based off-leash areas, small-dog rules, licensing requirements, and current posted hours.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Regina has enough current official material to support a stronger city guide than the generic page copy it had before. The City of Regina publishes a current dog parks page, a one-page off-leash rules PDF, a current cat and dog licences page, and the current Animal Bylaw page. That gives this guide a defensible source base for how many off-leash areas the city operates, how the system is split between year-round and seasonal spaces, and what owners are expected to do before using them.</p>",
    "About Section": "<p>The City of Regina currently says it operates five year-round off-leash dog parks and eight seasonal off-leash areas, for a total of 13 designated off-leash spaces across the city. The permanent parks are Cathy Lauritsen Memorial, Ross Industrial, Mount Pleasant, Māmowimīwēyitamōwin, and Horizon Station. That official breakdown is more precise than the older copy this page started with, and it matters because Regina mixes different park types: Cathy Lauritsen is only partially fenced and bordered by Wascana Creek, while Ross Industrial, Mount Pleasant, Māmowimīwēyitamōwin, and Horizon Station are fully fenced. Mount Pleasant and Māmowimīwēyitamōwin also have separate small-dog areas, limited to dogs that are 25 pounds or less and no more than 18 inches tall.</p><p>Regina's current rules and licensing pages add practical details this city guide should carry. The off-leash rules PDF says dog parks are use-at-your-own-risk spaces, owners and handlers must supervise and maintain voice control at all times, dogs must have a current licence and be vaccinated, dogs must be at least four months old, and dogs must be leashed while entering and exiting the park. The city also says non-sterilized female dogs in heat and dangerous animals are prohibited, and all year-round dog parks are open from 6 a.m. to 11 p.m. On the licensing side, Regina says dogs must wear their licence tags at all times, annual dog licences cost $25 for sterilized dogs or puppies under six months and $100 otherwise, replacement tags cost $5, and as of Tuesday, July 28, 2026, in-person licensing services are handled at Old Fire Hall #1, 1646 11th Avenue.</p>",
    "Featured Park 1": "cathy-lauritsen-memorial-off-leash-dog-park",
    "Featured Park 2": "mount-pleasant-off-leash-dog-park",
    "Featured Park 3": "mamowimiweyitamowin-park-off-leash-area",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Regina's five permanent parks remain the core option when seasonal rink areas are closed for ice preparation, and the city says the year-round parks operate from 6 a.m. to 11 p.m.</li><li><strong>Spring:</strong> Cathy Lauritsen needs more caution during runoff because it is bordered by Wascana Creek and only partially fenced.</li><li><strong>Summer:</strong> Seasonal rink-based off-leash areas are available from May 1 to September 30, which materially expands your options beyond the five permanent parks.</li><li><strong>Fall:</strong> Seasonal areas stay open through September 30, then outdoor rinks are locked from early to mid-November as crews prepare for the ice season.</li></ul>",
    "Park Rules": "<p><strong>Leash at transitions:</strong> Regina's off-leash rules require dogs to be leashed while entering and exiting the park and while coming to and from parked cars.</p><p><strong>Maintain supervision and voice control:</strong> owners and handlers must supervise and have voice control of their dogs at all times.</p><p><strong>Meet the entry baseline:</strong> dogs must have a current licence, be vaccinated, and be at least four months old.</p><p><strong>Know the small-dog limits:</strong> Mount Pleasant and Māmowimīwēyitamōwin reserve their small-dog areas for dogs 25 pounds or less and no more than 18 inches tall.</p><p><strong>Use the seasonal system correctly:</strong> Regina's seasonal rink-based off-leash areas operate from May 1 to September 30, with school-day hours of 4 to 11 p.m. and non-school-day hours of 6 a.m. to 11 p.m.</p>",
    "City Website": "https://www.regina.ca/parks-recreation-culture/parks/dog-parks/",
    "Dog Park Etiquettes": "<p><strong>1. Choose the right park format.</strong></p><p>Regina is not one-size-fits-all. Cathy Lauritsen is a larger naturalized option with creek exposure, while several other city parks are fully fenced.</p><p><strong>2. Treat Cathy Lauritsen differently from the fenced parks.</strong></p><p>The city explicitly notes that it is only partially fenced and bordered by Wascana Creek, and it warns owners to stay off the ice during winter because of thin-ice concerns.</p><p><strong>3. Use the small-dog areas by the posted size limits.</strong></p><p>Regina does not leave this vague: Mount Pleasant and Māmowimīwēyitamōwin set both a weight and height cap for the small-dog sections.</p><p><strong>4. Keep your licence current and visible.</strong></p><p>The city says dogs must wear their licence tags at all times, not just at home or during enforcement issues.</p><p><strong>5. Remember that seasonal rinks are temporary, not permanent parks.</strong></p><p>Those eight sites only function as off-leash areas from May through September and then return to their rink role later in the year.</p>",
    "Dog Park FAQs": "<p><strong>1. How many official off-leash areas does Regina currently operate?</strong></p><p>The City of Regina currently says it operates five year-round dog parks and eight seasonal off-leash areas, for a total of 13 designated off-leash spaces.</p><p><strong>2. Which Regina parks have small-dog areas?</strong></p><p>Mount Pleasant and Māmowimīwēyitamōwin both have separate small-dog areas.</p><p><strong>3. What qualifies as a small dog in those areas?</strong></p><p>The city says dogs must be 25 pounds or less and no more than 18 inches tall.</p><p><strong>4. Do dogs need a city licence to use Regina dog parks?</strong></p><p>Yes. Regina's posted rules say dogs must have a current licence and be vaccinated, and the licensing page says dogs must wear their licence tags at all times.</p><p><strong>5. When are Regina's permanent dog parks open?</strong></p><p>The city says all year-round dog parks are open from 6 a.m. to 11 p.m.</p><p><strong>6. When are the seasonal rink-based off-leash areas available?</strong></p><p>Regina says they operate from May 1 to September 30 each year, unless noted otherwise.</p>",
    "Nearby Cities": "Moose Jaw, Weyburn, Saskatoon",
    "Updated On": "Tue Jul 28 2026 15:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 15:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/regina/")];
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

console.log("Updated Regina city page and refreshed backlog files.");
