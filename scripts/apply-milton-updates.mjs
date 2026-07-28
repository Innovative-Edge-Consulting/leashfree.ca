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
  if (source.includes('"milton": "/images/cities/city-milton-hero.png"')) return;
  const anchor = '  "martensville": "/images/dog-parks/martensville-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "milton": "/images/cities/city-milton-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "milton");
  if (!city) throw new Error("Milton city record not found.");

  const intro = "<p>Milton has enough current official material to support a much tighter city guide than the page has now. The Town of Milton publishes a dog parks page, responsible pet ownership page, dog licensing page, and current by-law references. That is enough to confirm the current off-leash network and replace generic claims with a more defensible summary of how Milton actually handles dog parks and public-space dog rules.</p>";
  const about = "<p>The current Milton page is too generic and implies a broader park network than the town currently publishes. The Town of Milton's current dog parks and responsible pet ownership pages say Milton has two off-leash dog parks run by Leash Free Milton: Cedar Hedge Park West and Sunny Mount Park. The same pages also make the rule structure clearer than the old copy did. Dogs must be leashed when entering and leaving the fenced off-leash area, and each dog must be accompanied by a responsible person who knows where it is at all times. Inside the park, the town tells owners to handle dogs responsibly, avoid situations where other dogs feel threatened or defensive, and leave glass containers at home.</p><p>Milton also publishes town-wide ownership rules that matter outside the fence line. The responsible pet ownership page says dogs and cats in public spaces must be kept on a leash and under the owner's care and control, and the leash should not exceed 2.1 metres. The dog licensing page says dog owners are required to license their dog annually through the Town of Milton, including through the current DocuPet system. Milton also notes extra restrictions for dogs with muzzle orders and for pit bulls, which must be leashed, muzzled, and handled by someone able to control them at all times.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Milton's fenced parks remain usable in winter, but packed snow and icy gates can affect footing and entry.</li><li><strong>Spring:</strong> Wet turf and muddy entries are common during thaw, especially in heavily used fenced runs.</li><li><strong>Summer:</strong> Early-morning and evening visits are usually easier on active dogs, especially when fenced grass areas heat up in midday sun.</li><li><strong>Fall:</strong> Cooler temperatures make longer visits easier, but earlier dusk makes it worth arriving before evening light drops.</li></ul>";
  const parkRules = "<p><strong>Treat Milton as a two-park system:</strong> the town currently publishes only Cedar Hedge Park West and Sunny Mount Park as its off-leash dog parks.</p><p><strong>Leash at the gate:</strong> Milton says dogs must be leashed when entering and leaving the fenced off-leash area.</p><p><strong>Keep active supervision:</strong> the town requires each dog to be accompanied by a responsible person who is aware of the dog's whereabouts at all times.</p><p><strong>Follow the posted behaviour rules:</strong> Milton tells owners to handle dogs responsibly, avoid triggering defensive behaviour in other dogs, and keep glass containers out of the park.</p><p><strong>Remember the public-space rules outside the park:</strong> elsewhere in Milton, dogs and cats in public spaces must be leashed and under control, and leashes should not exceed 2.1 metres.</p>";
  const etiquette = "<p><strong>1. Do not overstate the network.</strong></p><p>The current town pages are explicit that Milton publishes two off-leash dog parks, not a larger rotating network.</p><p><strong>2. Keep transitions calm at the gate.</strong></p><p>Because dogs must be leashed while entering and leaving the fenced area, arrivals and departures matter as much as off-leash time inside.</p><p><strong>3. Supervision is the standard, not a courtesy.</strong></p><p>Milton requires a responsible person to know the dog's whereabouts at all times.</p><p><strong>4. Take the aggressive-behaviour rule literally.</strong></p><p>If a dog shows persistent aggressive behaviour, the town says it must be leashed and removed immediately under the Animal Control By-law.</p><p><strong>5. Keep special restrictions in mind.</strong></p><p>Milton separately states that dogs with muzzle orders must be muzzled and leashed in the park, and pit bulls must be leashed, muzzled, and controlled by a capable handler.</p>";
  const faqs = "<p><strong>1. How many official off-leash dog parks does Milton currently publish?</strong></p><p>The town currently publishes two off-leash dog parks.</p><p><strong>2. Which parks are they?</strong></p><p>Milton lists Cedar Hedge Park West and Sunny Mount Park.</p><p><strong>3. Do dogs need to be leashed at the entrance?</strong></p><p>Yes. The town says dogs must be leashed when entering and leaving the fenced off-leash area.</p><p><strong>4. What leash rule applies elsewhere in public?</strong></p><p>Milton says dogs and cats in public spaces must be on a leash and under control, and leashes should not exceed 2.1 metres.</p><p><strong>5. Is dog licensing required in Milton?</strong></p><p>Yes. The town says dog owners are required to license their dog annually.</p><p><strong>6. What happens if a dog behaves aggressively?</strong></p><p>The town says dogs showing persistent aggressive behaviour must be leashed and removed immediately as required by the Animal Control By-law.</p>";
  const metaDescription = "Source-backed guide to dog parks in Milton, Ontario, covering Cedar Hedge Park West and Sunny Mount Park, plus current leash-free park rules, annual dog licensing, and Milton's 2.1-metre leash requirement in public spaces.";

  city.seoTitle = "Dog Parks in Milton, Ontario | Off-Leash Guide";
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
    "Featured Park 1": "sunny-mount-park",
    "Featured Park 2": "cedar-hedge-park-west",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.milton.ca/en/arts-and-recreation/dog-parks.aspx",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Oakville, Burlington, Georgetown",
    "Updated On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "milton");
  if (!targetRow) throw new Error("Milton city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Milton, Ontario | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Milton, Ontario, covering Cedar Hedge Park West and Sunny Mount Park, plus current leash-free park rules, annual dog licensing, and Milton's 2.1-metre leash requirement in public spaces.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Milton has enough current official material to support a much tighter city guide than the page has now. The Town of Milton publishes a dog parks page, responsible pet ownership page, dog licensing page, and current by-law references. That is enough to confirm the current off-leash network and replace generic claims with a more defensible summary of how Milton actually handles dog parks and public-space dog rules.</p>",
    "About Section": "<p>The current Milton page is too generic and implies a broader park network than the town currently publishes. The Town of Milton's current dog parks and responsible pet ownership pages say Milton has two off-leash dog parks run by Leash Free Milton: Cedar Hedge Park West and Sunny Mount Park. The same pages also make the rule structure clearer than the old copy did. Dogs must be leashed when entering and leaving the fenced off-leash area, and each dog must be accompanied by a responsible person who knows where it is at all times. Inside the park, the town tells owners to handle dogs responsibly, avoid situations where other dogs feel threatened or defensive, and leave glass containers at home.</p><p>Milton also publishes town-wide ownership rules that matter outside the fence line. The responsible pet ownership page says dogs and cats in public spaces must be kept on a leash and under the owner's care and control, and the leash should not exceed 2.1 metres. The dog licensing page says dog owners are required to license their dog annually through the Town of Milton, including through the current DocuPet system. Milton also notes extra restrictions for dogs with muzzle orders and for pit bulls, which must be leashed, muzzled, and handled by someone able to control them at all times.</p>",
    "Featured Park 1": "sunny-mount-park",
    "Featured Park 2": "cedar-hedge-park-west",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Milton's fenced parks remain usable in winter, but packed snow and icy gates can affect footing and entry.</li><li><strong>Spring:</strong> Wet turf and muddy entries are common during thaw, especially in heavily used fenced runs.</li><li><strong>Summer:</strong> Early-morning and evening visits are usually easier on active dogs, especially when fenced grass areas heat up in midday sun.</li><li><strong>Fall:</strong> Cooler temperatures make longer visits easier, but earlier dusk makes it worth arriving before evening light drops.</li></ul>",
    "Park Rules": "<p><strong>Treat Milton as a two-park system:</strong> the town currently publishes only Cedar Hedge Park West and Sunny Mount Park as its off-leash dog parks.</p><p><strong>Leash at the gate:</strong> Milton says dogs must be leashed when entering and leaving the fenced off-leash area.</p><p><strong>Keep active supervision:</strong> the town requires each dog to be accompanied by a responsible person who is aware of the dog's whereabouts at all times.</p><p><strong>Follow the posted behaviour rules:</strong> Milton tells owners to handle dogs responsibly, avoid triggering defensive behaviour in other dogs, and keep glass containers out of the park.</p><p><strong>Remember the public-space rules outside the park:</strong> elsewhere in Milton, dogs and cats in public spaces must be leashed and under control, and leashes should not exceed 2.1 metres.</p>",
    "City Website": "https://www.milton.ca/en/arts-and-recreation/dog-parks.aspx",
    "Dog Park Etiquettes": "<p><strong>1. Do not overstate the network.</strong></p><p>The current town pages are explicit that Milton publishes two off-leash dog parks, not a larger rotating network.</p><p><strong>2. Keep transitions calm at the gate.</strong></p><p>Because dogs must be leashed while entering and leaving the fenced area, arrivals and departures matter as much as off-leash time inside.</p><p><strong>3. Supervision is the standard, not a courtesy.</strong></p><p>Milton requires a responsible person to know the dog's whereabouts at all times.</p><p><strong>4. Take the aggressive-behaviour rule literally.</strong></p><p>If a dog shows persistent aggressive behaviour, the town says it must be leashed and removed immediately under the Animal Control By-law.</p><p><strong>5. Keep special restrictions in mind.</strong></p><p>Milton separately states that dogs with muzzle orders must be muzzled and leashed in the park, and pit bulls must be leashed, muzzled, and controlled by a capable handler.</p>",
    "Dog Park FAQs": "<p><strong>1. How many official off-leash dog parks does Milton currently publish?</strong></p><p>The town currently publishes two off-leash dog parks.</p><p><strong>2. Which parks are they?</strong></p><p>Milton lists Cedar Hedge Park West and Sunny Mount Park.</p><p><strong>3. Do dogs need to be leashed at the entrance?</strong></p><p>Yes. The town says dogs must be leashed when entering and leaving the fenced off-leash area.</p><p><strong>4. What leash rule applies elsewhere in public?</strong></p><p>Milton says dogs and cats in public spaces must be on a leash and under control, and leashes should not exceed 2.1 metres.</p><p><strong>5. Is dog licensing required in Milton?</strong></p><p>Yes. The town says dog owners are required to license their dog annually.</p><p><strong>6. What happens if a dog behaves aggressively?</strong></p><p>The town says dogs showing persistent aggressive behaviour must be leashed and removed immediately as required by the Animal Control By-law.</p>",
    "Nearby Cities": "Oakville, Burlington, Georgetown",
    "Updated On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/milton/")];
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

console.log("Updated Milton city page and refreshed backlog files.");
