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
  if (source.includes('"grande-prairie": "/images/cities/city-grande-prairie-hero.png"')) return;
  const anchor = '  "gatineau": "/images/dog-parks/gatineau-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "grande-prairie": "/images/cities/city-grande-prairie-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "grande-prairie");
  if (!city) throw new Error("Grande Prairie city record not found.");

  const intro = "<p>Grande Prairie already has enough official material to support a factual city guide. The City of Grande Prairie publishes a dedicated dog parks page, an interactive parks finder, licensing requirements, and its Animals and Responsible Pet Ownership Bylaw. That lets this page move away from generic off-leash language and toward a clearer explanation of how the city's dog-park network is actually organized.</p>";
  const about = "<p>The previous Grande Prairie page mixed real park names with unsupported details and even referenced Crystal Lake instead of the city's current Crystal Ridge and Lakeland neighbourhood off-leash areas. The current City of Grande Prairie dog parks page says the city has one fully fenced off-leash dog park and three neighbourhood off-leash areas. The city's parks finder adds useful context: South Bear Creek Park is the fenced destination, with treed and open space divided into one section for small dogs and one section for dogs of all sizes, while the neighbourhood off-leash areas are grouped under Crystal Ridge (Lakeland) and Royal Oaks and are not fully fenced.</p><p>The city also publishes current owner requirements. Grande Prairie says all cats and dogs must be licensed by the age of three months and must wear their current animal licence tag when off the owner's property. Outside designated off-leash areas, dogs must be on a leash no longer than two metres. Even in an off-leash area, owners must keep dogs under control, within sight, and responsive to voice or sound commands. The city's Animals and Responsible Pet Ownership Bylaw C-1226 remains the governing bylaw reference, and the licensing page also notes that properties within the city are only allowed to keep four animals at a time unless an exemption is approved.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Grande Prairie winters are long and cold, so packed snow, ice, and reduced daylight can affect footing in both fenced and unfenced off-leash areas.</li><li><strong>Spring:</strong> Thaw conditions can leave neighbourhood off-leash greenspaces muddy, especially around wetland edges in the Lakeland and Crystal Ridge area.</li><li><strong>Summer:</strong> Early-morning or evening visits are usually easier on active dogs, particularly at the larger South Bear Creek enclosure.</li><li><strong>Fall:</strong> Cooler temperatures are ideal for longer walks, but shorter days make it worth planning visits before dusk.</li></ul>";
  const parkRules = "<p><strong>Understand the city layout first:</strong> Grande Prairie currently describes one fenced dog-park destination at South Bear Creek plus neighbourhood off-leash areas in Royal Oaks and Crystal Ridge/Lakeland.</p><p><strong>Treat Royal Oaks and Crystal Ridge-Lakeland as unfenced spaces:</strong> the city says these neighbourhood areas are not fully fenced, so dogs need reliable recall before going off leash there.</p><p><strong>License your dog and keep the tag on:</strong> Grande Prairie requires cats and dogs to be licensed by three months of age and says they must wear the current licence tag when off the owner's property.</p><p><strong>Follow the leash rule outside designated areas:</strong> the city says dogs must be on a leash not more than two metres long unless they are in a designated off-leash area.</p><p><strong>Keep control and stay out of prohibited places:</strong> Grande Prairie says dogs in off-leash areas must remain within sight and under voice or sound control, and animals are prohibited on school grounds, playgrounds, athletic fields, and bodies of water.</p>";
  const etiquette = "<p><strong>1. Read South Bear Creek correctly.</strong></p><p>The city treats South Bear Creek as its fenced off-leash destination, but the parks finder notes that the space is divided into two sections rather than being one undifferentiated field.</p><p><strong>2. Do not assume every Grande Prairie off-leash area is fenced.</strong></p><p>The city explicitly says the neighbourhood areas in Royal Oaks and Crystal Ridge-Lakeland are not fully fenced.</p><p><strong>3. Use recall as a real standard, not a suggestion.</strong></p><p>Grande Prairie defines control in off-leash areas as the dog being within the owner's sight and responding to voice or sound commands.</p><p><strong>4. Keep transitions legal outside the off-leash zone.</strong></p><p>Once you leave the designated area, the city's leash rule returns and the leash must be no longer than two metres.</p><p><strong>5. Keep the wider bylaw in mind.</strong></p><p>The same city pages that promote dog parks also point owners to licensing, prohibited areas, and the four-animal property limit under Bylaw C-1226.</p>";
  const faqs = "<p><strong>1. How does Grande Prairie currently describe its off-leash network?</strong></p><p>The city says it has one fully fenced off-leash dog park and three neighbourhood off-leash areas.</p><p><strong>2. Where is the fenced dog park?</strong></p><p>The city's parks finder says the fenced dog-park destination is in South Bear Creek Park.</p><p><strong>3. Are the neighbourhood areas fenced?</strong></p><p>No. The city says the Royal Oaks and Crystal Ridge-Lakeland neighbourhood off-leash areas are not fully fenced.</p><p><strong>4. Do dogs need a licence in Grande Prairie?</strong></p><p>Yes. The city says cats and dogs must be licensed by three months of age and must wear the current licence tag when off the owner's property.</p><p><strong>5. What is the leash rule outside designated off-leash areas?</strong></p><p>Grande Prairie says dogs must be on a leash not more than two metres long unless they are in a designated off-leash area.</p><p><strong>6. What bylaw governs these rules?</strong></p><p>The city points owners to the Animals and Responsible Pet Ownership Bylaw C-1226, last amended June 6, 2019.</p>";
  const metaDescription = "Source-backed guide to dog parks in Grande Prairie, Alberta, covering South Bear Creek, the Royal Oaks and Crystal Ridge-Lakeland neighbourhood off-leash areas, current licensing requirements, leash rules, and Bylaw C-1226.";

  city.seoTitle = "Dog Parks in Grande Prairie, Alberta | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Alberta"],
    "Province Page": ["https://leashfree.ca/alberta-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "south-bear-creek-off-leash-dog-park",
    "Featured Park 2": "royal-oaks-neighbourhood-off-leash-area",
    "Featured Park 3": "lakeland-neighbourhood-off-leash-area",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://cityofgp.com/economic-development/lifestyle-community/outdoor-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Sexsmith, Beaverlodge, Valleyview",
    "Updated On": "Sun Jul 26 2026 13:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 13:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "grande-prairie");
  if (!targetRow) throw new Error("Grande Prairie city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Grande Prairie, Alberta | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Grande Prairie, Alberta, covering South Bear Creek, the Royal Oaks and Crystal Ridge-Lakeland neighbourhood off-leash areas, current licensing requirements, leash rules, and Bylaw C-1226.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Grande Prairie already has enough official material to support a factual city guide. The City of Grande Prairie publishes a dedicated dog parks page, an interactive parks finder, licensing requirements, and its Animals and Responsible Pet Ownership Bylaw. That lets this page move away from generic off-leash language and toward a clearer explanation of how the city's dog-park network is actually organized.</p>",
    "About Section": "<p>The previous Grande Prairie page mixed real park names with unsupported details and even referenced Crystal Lake instead of the city's current Crystal Ridge and Lakeland neighbourhood off-leash areas. The current City of Grande Prairie dog parks page says the city has one fully fenced off-leash dog park and three neighbourhood off-leash areas. The city's parks finder adds useful context: South Bear Creek Park is the fenced destination, with treed and open space divided into one section for small dogs and one section for dogs of all sizes, while the neighbourhood off-leash areas are grouped under Crystal Ridge (Lakeland) and Royal Oaks and are not fully fenced.</p><p>The city also publishes current owner requirements. Grande Prairie says all cats and dogs must be licensed by the age of three months and must wear their current animal licence tag when off the owner's property. Outside designated off-leash areas, dogs must be on a leash no longer than two metres. Even in an off-leash area, owners must keep dogs under control, within sight, and responsive to voice or sound commands. The city's Animals and Responsible Pet Ownership Bylaw C-1226 remains the governing bylaw reference, and the licensing page also notes that properties within the city are only allowed to keep four animals at a time unless an exemption is approved.</p>",
    "Featured Park 1": "south-bear-creek-off-leash-dog-park",
    "Featured Park 2": "royal-oaks-neighbourhood-off-leash-area",
    "Featured Park 3": "lakeland-neighbourhood-off-leash-area",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Grande Prairie winters are long and cold, so packed snow, ice, and reduced daylight can affect footing in both fenced and unfenced off-leash areas.</li><li><strong>Spring:</strong> Thaw conditions can leave neighbourhood off-leash greenspaces muddy, especially around wetland edges in the Lakeland and Crystal Ridge area.</li><li><strong>Summer:</strong> Early-morning or evening visits are usually easier on active dogs, particularly at the larger South Bear Creek enclosure.</li><li><strong>Fall:</strong> Cooler temperatures are ideal for longer walks, but shorter days make it worth planning visits before dusk.</li></ul>",
    "Park Rules": "<p><strong>Understand the city layout first:</strong> Grande Prairie currently describes one fenced dog-park destination at South Bear Creek plus neighbourhood off-leash areas in Royal Oaks and Crystal Ridge/Lakeland.</p><p><strong>Treat Royal Oaks and Crystal Ridge-Lakeland as unfenced spaces:</strong> the city says these neighbourhood areas are not fully fenced, so dogs need reliable recall before going off leash there.</p><p><strong>License your dog and keep the tag on:</strong> Grande Prairie requires cats and dogs to be licensed by three months of age and says they must wear the current licence tag when off the owner's property.</p><p><strong>Follow the leash rule outside designated areas:</strong> the city says dogs must be on a leash not more than two metres long unless they are in a designated off-leash area.</p><p><strong>Keep control and stay out of prohibited places:</strong> Grande Prairie says dogs in off-leash areas must remain within sight and under voice or sound control, and animals are prohibited on school grounds, playgrounds, athletic fields, and bodies of water.</p>",
    "City Website": "https://cityofgp.com/economic-development/lifestyle-community/outdoor-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Read South Bear Creek correctly.</strong></p><p>The city treats South Bear Creek as its fenced off-leash destination, but the parks finder notes that the space is divided into two sections rather than being one undifferentiated field.</p><p><strong>2. Do not assume every Grande Prairie off-leash area is fenced.</strong></p><p>The city explicitly says the neighbourhood areas in Royal Oaks and Crystal Ridge-Lakeland are not fully fenced.</p><p><strong>3. Use recall as a real standard, not a suggestion.</strong></p><p>Grande Prairie defines control in off-leash areas as the dog being within the owner's sight and responding to voice or sound commands.</p><p><strong>4. Keep transitions legal outside the off-leash zone.</strong></p><p>Once you leave the designated area, the city's leash rule returns and the leash must be no longer than two metres.</p><p><strong>5. Keep the wider bylaw in mind.</strong></p><p>The same city pages that promote dog parks also point owners to licensing, prohibited areas, and the four-animal property limit under Bylaw C-1226.</p>",
    "Dog Park FAQs": "<p><strong>1. How does Grande Prairie currently describe its off-leash network?</strong></p><p>The city says it has one fully fenced off-leash dog park and three neighbourhood off-leash areas.</p><p><strong>2. Where is the fenced dog park?</strong></p><p>The city's parks finder says the fenced dog-park destination is in South Bear Creek Park.</p><p><strong>3. Are the neighbourhood areas fenced?</strong></p><p>No. The city says the Royal Oaks and Crystal Ridge-Lakeland neighbourhood off-leash areas are not fully fenced.</p><p><strong>4. Do dogs need a licence in Grande Prairie?</strong></p><p>Yes. The city says cats and dogs must be licensed by three months of age and must wear the current licence tag when off the owner's property.</p><p><strong>5. What is the leash rule outside designated off-leash areas?</strong></p><p>Grande Prairie says dogs must be on a leash not more than two metres long unless they are in a designated off-leash area.</p><p><strong>6. What bylaw governs these rules?</strong></p><p>The city points owners to the Animals and Responsible Pet Ownership Bylaw C-1226, last amended June 6, 2019.</p>",
    "Nearby Cities": "Sexsmith, Beaverlodge, Valleyview",
    "Updated On": "Sun Jul 26 2026 13:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 13:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/grande-prairie/")];
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

console.log("Updated Grande Prairie city page and refreshed backlog files.");
