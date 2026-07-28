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
  if (source.includes('"hamilton": "/images/cities/city-hamilton-hero.png"')) return;
  const anchor = '  "halton-hills-dog-parks": "/images/cities/city-halton-hills-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "hamilton": "/images/cities/city-hamilton-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "hamilton");
  if (!city) throw new Error("Hamilton city record not found.");

  const intro = "<p>Hamilton’s official dog-park system is broader and more specific than the thin page suggested. As of Tuesday, July 28, 2026, the City of Hamilton clearly distinguishes between fenced dog parks and unfenced free running areas, and it ties both types of off-leash access to current licensing, rabies-tag, leash-transition, and trail-use rules.</p>";
  const about = "<p>The current City of Hamilton dog-parks page says there are two types of off-leash areas in the city. Dog parks are fenced areas where dogs can exercise off leash. Free running areas are unfenced off-leash areas that include city-owned parkland and public open spaces. That distinction matters because Hamilton is not presenting every dog outing as a standard fenced enclosure. Instead, it operates a mixed off-leash network where some spaces are enclosed and others depend more heavily on handler control and site awareness.</p><p>The city also publishes the rule framework that should anchor any Hamilton city guide. Hamilton says these off-leash areas are used at your own risk, dogs must stay on leash until they are inside the off-leash area, and dogs must wear valid rabies and dog licence tags. The city says dogs are not allowed in these areas without an adult human being and may not bother or chase people. Separate city pages add the wider ownership context: all dogs in Hamilton must be licensed before they are three months old and licences must be renewed every year; Animal Services handles dog-at-large and animal-control response at 905-574-3433, 24 hours a day, 7 days a week; and on regular walking trails and in parks, owners are expected to use a leash less than 2 metres or 6 feet long and keep dogs under control unless they are in a designated off-leash space.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Hamilton’s mix of fenced and unfenced off-leash spaces means icy footing and visibility matter more than usual in colder months.</li><li><strong>Spring:</strong> Wet turf and muddy park edges are common, especially in larger open spaces and trail-adjacent areas.</li><li><strong>Summer:</strong> Use cooler morning or evening windows when possible, especially in more open unfenced running areas with less shade.</li><li><strong>Fall:</strong> Hamilton’s parks and trails stay active in cooler weather, so be more deliberate about leash transitions at the boundary of off-leash areas.</li></ul>";
  const parkRules = "<p><strong>Understand the two off-leash formats:</strong> Hamilton says the city has both fenced dog parks and unfenced free running areas.</p><p><strong>Leash dogs until you are inside the off-leash area:</strong> the city explicitly requires leash use before entering the designated off-leash space.</p><p><strong>Carry valid tags:</strong> Hamilton says dogs using these areas must wear valid rabies and dog licence tags.</p><p><strong>Do not use off-leash areas without adult supervision:</strong> the city says dogs are not allowed in the park without an adult human being and may not bother or chase people.</p><p><strong>Use regular parks and trails differently:</strong> Hamilton’s pet-etiquette page says dogs on walking trails and in parks must generally be on a leash less than 2 m / 6 ft long and under control.</p>";
  const etiquette = "<p><strong>1. Match your expectations to the type of space.</strong></p><p>Hamilton’s official system includes both fenced dog parks and unfenced free running areas, so the right behaviour depends on which type of off-leash site you are using.</p><p><strong>2. Treat leash transitions as part of the rule set.</strong></p><p>The city specifically says dogs stay on leash until they are inside the off-leash area, which is where many avoidable conflicts start.</p><p><strong>3. Do not rely on off-leash access for everyday trail use.</strong></p><p>Hamilton’s pet-etiquette guidance is clear that dogs on ordinary walking trails and in parks are expected to remain leashed and under control.</p><p><strong>4. Keep tags and identification current.</strong></p><p>Hamilton ties off-leash access to valid rabies and dog licence tags, so the administrative side of ownership matters here.</p><p><strong>5. Be more conservative in unfenced running areas.</strong></p><p>Because some Hamilton off-leash spaces are unfenced, dogs without reliable recall or calm behaviour around people are a poorer fit for those locations.</p>";
  const faqs = "<p><strong>1. What types of off-leash dog areas does Hamilton officially publish?</strong></p><p>Hamilton says there are two types: fenced dog parks and unfenced free running areas.</p><p><strong>2. Do I need to leash my dog before entering an off-leash area?</strong></p><p>Yes. The city says dogs must stay on leash until they are in the designated off-leash area.</p><p><strong>3. Do Hamilton dogs need tags to use off-leash areas?</strong></p><p>Yes. The city says dogs must be wearing valid rabies and dog licence tags.</p><p><strong>4. What is the standard leash rule on regular trails and in parks?</strong></p><p>Hamilton’s pet-etiquette page says dogs should be on a leash less than 2 m / 6 ft long and under control unless they are in a designated off-leash space.</p><p><strong>5. Who should I call for a dog at large or other animal-control issue?</strong></p><p>Hamilton Animal Services lists 905-574-3433 for animal-control response 24 hours a day, 7 days a week.</p><p><strong>6. What bylaw governs responsible dog ownership in Hamilton?</strong></p><p>The city points dog owners to Responsible Animal Ownership By-law No. 12-031.</p>";
  const metaDescription = "Official-source guide to dog parks and free running areas in Hamilton, Ontario, covering fenced versus unfenced off-leash spaces, licence and rabies tag rules, leash requirements, trail etiquette, and Hamilton Animal Services contact information.";

  city.seoTitle = "Dog Parks and Free Running Areas in Hamilton, Ontario | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Ontario"],
    "Province Page": ["https://leashfree.ca/ontario-dog-parks"]
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
    "City Website": "https://www.hamilton.ca/home-neighbourhood/animals-pets/dogs/dog-parks-and-free-running-areas",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Burlington, Grimsby, Oakville",
    "Updated On": "Tue Jul 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "hamilton");
  if (!targetRow) throw new Error("Hamilton city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks and Free Running Areas in Hamilton, Ontario | LeashFree.ca",
    "Meta Description": "Official-source guide to dog parks and free running areas in Hamilton, Ontario, covering fenced versus unfenced off-leash spaces, licence and rabies tag rules, leash requirements, trail etiquette, and Hamilton Animal Services contact information.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Hamilton’s official dog-park system is broader and more specific than the thin page suggested. As of Tuesday, July 28, 2026, the City of Hamilton clearly distinguishes between fenced dog parks and unfenced free running areas, and it ties both types of off-leash access to current licensing, rabies-tag, leash-transition, and trail-use rules.</p>",
    "About Section": "<p>The current City of Hamilton dog-parks page says there are two types of off-leash areas in the city. Dog parks are fenced areas where dogs can exercise off leash. Free running areas are unfenced off-leash areas that include city-owned parkland and public open spaces. That distinction matters because Hamilton is not presenting every dog outing as a standard fenced enclosure. Instead, it operates a mixed off-leash network where some spaces are enclosed and others depend more heavily on handler control and site awareness.</p><p>The city also publishes the rule framework that should anchor any Hamilton city guide. Hamilton says these off-leash areas are used at your own risk, dogs must stay on leash until they are inside the off-leash area, and dogs must wear valid rabies and dog licence tags. The city says dogs are not allowed in these areas without an adult human being and may not bother or chase people. Separate city pages add the wider ownership context: all dogs in Hamilton must be licensed before they are three months old and licences must be renewed every year; Animal Services handles dog-at-large and animal-control response at 905-574-3433, 24 hours a day, 7 days a week; and on regular walking trails and in parks, owners are expected to use a leash less than 2 metres or 6 feet long and keep dogs under control unless they are in a designated off-leash space.</p>",
    "Featured Park 1": "",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Hamilton’s mix of fenced and unfenced off-leash spaces means icy footing and visibility matter more than usual in colder months.</li><li><strong>Spring:</strong> Wet turf and muddy park edges are common, especially in larger open spaces and trail-adjacent areas.</li><li><strong>Summer:</strong> Use cooler morning or evening windows when possible, especially in more open unfenced running areas with less shade.</li><li><strong>Fall:</strong> Hamilton’s parks and trails stay active in cooler weather, so be more deliberate about leash transitions at the boundary of off-leash areas.</li></ul>",
    "Park Rules": "<p><strong>Understand the two off-leash formats:</strong> Hamilton says the city has both fenced dog parks and unfenced free running areas.</p><p><strong>Leash dogs until you are inside the off-leash area:</strong> the city explicitly requires leash use before entering the designated off-leash space.</p><p><strong>Carry valid tags:</strong> Hamilton says dogs using these areas must wear valid rabies and dog licence tags.</p><p><strong>Do not use off-leash areas without adult supervision:</strong> the city says dogs are not allowed in the park without an adult human being and may not bother or chase people.</p><p><strong>Use regular parks and trails differently:</strong> Hamilton’s pet-etiquette page says dogs on walking trails and in parks must generally be on a leash less than 2 m / 6 ft long and under control.</p>",
    "City Website": "https://www.hamilton.ca/home-neighbourhood/animals-pets/dogs/dog-parks-and-free-running-areas",
    "Dog Park Etiquettes": "<p><strong>1. Match your expectations to the type of space.</strong></p><p>Hamilton’s official system includes both fenced dog parks and unfenced free running areas, so the right behaviour depends on which type of off-leash site you are using.</p><p><strong>2. Treat leash transitions as part of the rule set.</strong></p><p>The city specifically says dogs stay on leash until they are inside the off-leash area, which is where many avoidable conflicts start.</p><p><strong>3. Do not rely on off-leash access for everyday trail use.</strong></p><p>Hamilton’s pet-etiquette guidance is clear that dogs on ordinary walking trails and in parks are expected to remain leashed and under control.</p><p><strong>4. Keep tags and identification current.</strong></p><p>Hamilton ties off-leash access to valid rabies and dog licence tags, so the administrative side of ownership matters here.</p><p><strong>5. Be more conservative in unfenced running areas.</strong></p><p>Because some Hamilton off-leash spaces are unfenced, dogs without reliable recall or calm behaviour around people are a poorer fit for those locations.</p>",
    "Dog Park FAQs": "<p><strong>1. What types of off-leash dog areas does Hamilton officially publish?</strong></p><p>Hamilton says there are two types: fenced dog parks and unfenced free running areas.</p><p><strong>2. Do I need to leash my dog before entering an off-leash area?</strong></p><p>Yes. The city says dogs must stay on leash until they are in the designated off-leash area.</p><p><strong>3. Do Hamilton dogs need tags to use off-leash areas?</strong></p><p>Yes. The city says dogs must be wearing valid rabies and dog licence tags.</p><p><strong>4. What is the standard leash rule on regular trails and in parks?</strong></p><p>Hamilton’s pet-etiquette page says dogs should be on a leash less than 2 m / 6 ft long and under control unless they are in a designated off-leash space.</p><p><strong>5. Who should I call for a dog at large or other animal-control issue?</strong></p><p>Hamilton Animal Services lists 905-574-3433 for animal-control response 24 hours a day, 7 days a week.</p><p><strong>6. What bylaw governs responsible dog ownership in Hamilton?</strong></p><p>The city points dog owners to Responsible Animal Ownership By-law No. 12-031.</p>",
    "Nearby Cities": "Burlington, Grimsby, Oakville",
    "Updated On": "Tue Jul 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 19:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/hamilton/")];
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

console.log("Updated Hamilton city page and refreshed backlog files.");
