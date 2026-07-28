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
  if (source.includes('"swift-current": "/images/cities/city-swift-current-hero.png"')) return;
  const anchor = '  "selkirk": "/images/cities/city-selkirk-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const finalSource = source.replace(
    anchor,
    `${anchor}  "swift-current": "/images/cities/city-swift-current-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, finalSource);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "swift-current");
  if (!city) throw new Error("Swift Current city record not found.");

  const intro = "<p>Swift Current has a much stronger official source set than the older LeashFree.ca copy suggested. The city publishes a dedicated off-leash dog park page, current licensing requirements, leash rules, and dog-owner FAQs. That makes it possible to replace generic claims with city-backed detail about where the park is, how it is funded, and what owners must do before using it.</p>";
  const about = "<p>The previous Swift Current page was directionally right that the city has a fenced dog park, but several details were either unsupported or too vague. Swift Current's current off-leash dog park page says the park is on the east side of Highway 4 at the end of Hillcrest Drive. The same page describes it as a large, safe outdoor space where dogs can roam, run, and play, and it notes that the park exists through the support of donors, volunteers, and the City of Swift Current. That is a more defensible description than the older copy's unsupported location and amenity claims.</p><p>The city's animal-licensing and animal-control material is also current and specific. Swift Current says all dogs and cats over six months of age must be licensed by February 28 each year, and all animals must wear their current licence when off the owner's property. The city also says dogs must be kept on a leash no longer than two metres when off private property, except at the off-leash park. Its current dog-owner FAQ confirms the Swift Current off-leash park is a large, fenced-in location at the foot of Hillcrest Drive east of Highway 4, and it also notes that owners may possess up to three dogs over six months old. The city bylaw index currently lists Animal Control Bylaw No. 3 - 2024, which is the current bylaw reference point for this page.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Swift Current winters can mean hard-packed snow, exposed wind, and icy entrances, so shorter visits and paw protection may matter.</li><li><strong>Spring:</strong> Snowmelt can soften grassy sections and create muddy gate areas in large fenced parks.</li><li><strong>Summer:</strong> Open prairie sun can heat the park quickly, so early-morning or evening visits are safer for many dogs.</li><li><strong>Fall:</strong> Cooler temperatures are often ideal for longer off-leash sessions, especially in a larger open run.</li></ul>";
  const parkRules = "<p><strong>License dogs on time:</strong> Swift Current says dogs over six months old must be licensed by February 28 each year, and animals must wear their current licence when off the owner's property.</p><p><strong>Use the leash-free park for off-leash exercise:</strong> the city says dogs otherwise must be on a leash not exceeding two metres when off private property.</p><p><strong>Stay in control and clean up:</strong> Swift Current says owners must keep animals under control at all times and remove defecation from public or private property other than their own.</p><p><strong>Respect the city's possession limit:</strong> the current city rules say no person may possess or harbour more than three dogs over six months old.</p><p><strong>Expect impoundment costs if dogs run at large:</strong> Swift Current's dog-owner FAQ says dogs found running at large within city limits may be impounded at the Swift Current SPCA at the owner's expense.</p>";
  const etiquette = "<p><strong>1. Use the confirmed city location.</strong></p><p>Swift Current publishes a dedicated off-leash dog park page, so there is no need to rely on vague directions or unofficial park claims.</p><p><strong>2. Treat licensing as a hard prerequisite.</strong></p><p>The city requires annual licensing by February 28 for dogs over six months old and says pets must wear current tags off the owner's property.</p><p><strong>3. Keep leash discipline outside the enclosure.</strong></p><p>Swift Current's rule is explicit: outside the off-leash setting, dogs must be on a leash not exceeding two metres.</p><p><strong>4. Plan for a large, open prairie park.</strong></p><p>The official page describes a large outdoor dog park, which usually means weather, wind, and sun exposure can shape visit quality.</p><p><strong>5. Remember the park is community-supported.</strong></p><p>The city says the park depends on donors, volunteers, and community support, so respectful use and cleanup directly matter.</p>";
  const faqs = "<p><strong>1. Where does Swift Current say the off-leash dog park is located?</strong></p><p>The city says it is on the east side of Highway 4 at the end of Hillcrest Drive.</p><p><strong>2. Is the Swift Current park officially fenced?</strong></p><p>Yes. The city's dog-owner FAQ describes it as a large, fenced-in off-leash dog park.</p><p><strong>3. Do dogs need a city licence in Swift Current?</strong></p><p>Yes. The city says dogs over six months old must be licensed by February 28 each year and must wear their current licence when off the owner's property.</p><p><strong>4. What is the normal leash rule outside the dog park?</strong></p><p>Swift Current says dogs must be kept on a leash not exceeding two metres when off private property.</p><p><strong>5. How many dogs can someone possess in Swift Current?</strong></p><p>The city says no person may possess or harbour more than three dogs over the age of six months.</p><p><strong>6. What is the current animal-control bylaw reference?</strong></p><p>The city's bylaw index currently lists Animal Control Bylaw No. 3 - 2024.</p>";
  const metaDescription = "Source-backed guide to dog parks in Swift Current, Saskatchewan, covering the city's official off-leash dog park, current dog licensing rules, leash requirements, and Animal Control Bylaw No. 3 - 2024.";

  city.seoTitle = "Dog Parks in Swift Current, Saskatchewan | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Saskatchewan"],
    "Province Page": ["https://leashfree.ca/saskatchewan-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "swift-current-off-leash-dog-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.swiftcurrent.ca/i-want-to/find/off-leash-dog-park",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Moose Jaw, Medicine Hat, Regina",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "swift-current");
  if (!targetRow) throw new Error("Swift Current city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Swift Current, Saskatchewan | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Swift Current, Saskatchewan, covering the city's official off-leash dog park, current dog licensing rules, leash requirements, and Animal Control Bylaw No. 3 - 2024.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Swift Current has a much stronger official source set than the older LeashFree.ca copy suggested. The city publishes a dedicated off-leash dog park page, current licensing requirements, leash rules, and dog-owner FAQs. That makes it possible to replace generic claims with city-backed detail about where the park is, how it is funded, and what owners must do before using it.</p>",
    "About Section": "<p>The previous Swift Current page was directionally right that the city has a fenced dog park, but several details were either unsupported or too vague. Swift Current's current off-leash dog park page says the park is on the east side of Highway 4 at the end of Hillcrest Drive. The same page describes it as a large, safe outdoor space where dogs can roam, run, and play, and it notes that the park exists through the support of donors, volunteers, and the City of Swift Current. That is a more defensible description than the older copy's unsupported location and amenity claims.</p><p>The city's animal-licensing and animal-control material is also current and specific. Swift Current says all dogs and cats over six months of age must be licensed by February 28 each year, and all animals must wear their current licence when off the owner's property. The city also says dogs must be kept on a leash no longer than two metres when off private property, except at the off-leash park. Its current dog-owner FAQ confirms the Swift Current off-leash park is a large, fenced-in location at the foot of Hillcrest Drive east of Highway 4, and it also notes that owners may possess up to three dogs over six months old. The city bylaw index currently lists Animal Control Bylaw No. 3 - 2024, which is the current bylaw reference point for this page.</p>",
    "Featured Park 1": "swift-current-off-leash-dog-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Swift Current winters can mean hard-packed snow, exposed wind, and icy entrances, so shorter visits and paw protection may matter.</li><li><strong>Spring:</strong> Snowmelt can soften grassy sections and create muddy gate areas in large fenced parks.</li><li><strong>Summer:</strong> Open prairie sun can heat the park quickly, so early-morning or evening visits are safer for many dogs.</li><li><strong>Fall:</strong> Cooler temperatures are often ideal for longer off-leash sessions, especially in a larger open run.</li></ul>",
    "Park Rules": "<p><strong>License dogs on time:</strong> Swift Current says dogs over six months old must be licensed by February 28 each year, and animals must wear their current licence when off the owner's property.</p><p><strong>Use the leash-free park for off-leash exercise:</strong> the city says dogs otherwise must be on a leash not exceeding two metres when off private property.</p><p><strong>Stay in control and clean up:</strong> Swift Current says owners must keep animals under control at all times and remove defecation from public or private property other than their own.</p><p><strong>Respect the city's possession limit:</strong> the current city rules say no person may possess or harbour more than three dogs over six months old.</p><p><strong>Expect impoundment costs if dogs run at large:</strong> Swift Current's dog-owner FAQ says dogs found running at large within city limits may be impounded at the Swift Current SPCA at the owner's expense.</p>",
    "City Website": "https://www.swiftcurrent.ca/i-want-to/find/off-leash-dog-park",
    "Dog Park Etiquettes": "<p><strong>1. Use the confirmed city location.</strong></p><p>Swift Current publishes a dedicated off-leash dog park page, so there is no need to rely on vague directions or unofficial park claims.</p><p><strong>2. Treat licensing as a hard prerequisite.</strong></p><p>The city requires annual licensing by February 28 for dogs over six months old and says pets must wear current tags off the owner's property.</p><p><strong>3. Keep leash discipline outside the enclosure.</strong></p><p>Swift Current's rule is explicit: outside the off-leash setting, dogs must be on a leash not exceeding two metres.</p><p><strong>4. Plan for a large, open prairie park.</strong></p><p>The official page describes a large outdoor dog park, which usually means weather, wind, and sun exposure can shape visit quality.</p><p><strong>5. Remember the park is community-supported.</strong></p><p>The city says the park depends on donors, volunteers, and community support, so respectful use and cleanup directly matter.</p>",
    "Dog Park FAQs": "<p><strong>1. Where does Swift Current say the off-leash dog park is located?</strong></p><p>The city says it is on the east side of Highway 4 at the end of Hillcrest Drive.</p><p><strong>2. Is the Swift Current park officially fenced?</strong></p><p>Yes. The city's dog-owner FAQ describes it as a large, fenced-in off-leash dog park.</p><p><strong>3. Do dogs need a city licence in Swift Current?</strong></p><p>Yes. The city says dogs over six months old must be licensed by February 28 each year and must wear their current licence when off the owner's property.</p><p><strong>4. What is the normal leash rule outside the dog park?</strong></p><p>Swift Current says dogs must be kept on a leash not exceeding two metres when off private property.</p><p><strong>5. How many dogs can someone possess in Swift Current?</strong></p><p>The city says no person may possess or harbour more than three dogs over the age of six months.</p><p><strong>6. What is the current animal-control bylaw reference?</strong></p><p>The city's bylaw index currently lists Animal Control Bylaw No. 3 - 2024.</p>",
    "Nearby Cities": "Moose Jaw, Medicine Hat, Regina",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/swift-current/")];
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

console.log("Updated Swift Current city page and refreshed backlog files.");
