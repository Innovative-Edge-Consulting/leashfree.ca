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
  if (source.includes('"medicine-hat": "/images/cities/city-medicine-hat-hero.png"')) return;
  const anchor = '  "milton": "/images/cities/city-milton-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "medicine-hat": "/images/cities/city-medicine-hat-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "medicine-hat");
  if (!city) throw new Error("Medicine Hat city record not found.");

  const intro = "<p>Medicine Hat's current off-leash picture is more specific than the generic copy this page started with. The City of Medicine Hat currently says it maintains two fully fenced dog parks, Saratoga and WestVue, and also identifies designated off-leash trails for dog owners who want more than a fenced run.</p>";
  const about = "<p>The City of Medicine Hat currently says it has two fully fenced dog parks, plus designated off-leash trails. The fenced parks are Saratoga Dog Park at 1205 Factory Street SE and WestVue Dog Park near Gas City Campground on 11 Avenue SW. The city publishes the core amenities for each site rather than leaving owners to guess. Saratoga is the more feature-heavy fenced park, with potable water, agility and balance structures, benches, dog-waste bag dispensers, garbage bins, and shade structures. WestVue is also fully fenced and includes potable water, benches, dog-waste bag dispensers, and garbage bins.</p><p>The city also gives this page a much stronger compliance base than the old draft had. Medicine Hat says both fenced dog parks are open daily from 7:00 a.m. to 11:00 p.m. Its posted off-leash rules say owners must supervise and maintain physical and verbal control, dogs must have up-to-date vaccinations and rabies shots, and all resident pets must be licensed. The broader Animal Services page adds that the city maintains both the fenced dog parks and designated off-leash trails, while the pet-licence page confirms annual dog licensing is required under the Responsible Animal Ownership Bylaw and lists the current fee structure.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> The fenced parks remain the most straightforward option because their hours stay clear at 7:00 a.m. to 11:00 p.m., while trail footing in environmental-reserve areas can be more variable.</li><li><strong>Spring:</strong> Use extra caution on off-leash trails and reserve edges when thaw makes surfaces softer and increases conflict with other trail users.</li><li><strong>Summer:</strong> Saratoga is the stronger warm-weather fenced option because the city lists both potable water and shade structures there.</li><li><strong>Fall:</strong> WestVue and Saratoga remain dependable short-visit options when earlier sunsets make longer trail sessions less practical.</li></ul>";
  const parkRules = "<p><strong>Know the published hours:</strong> Medicine Hat says Saratoga and WestVue dog parks are open daily from 7:00 a.m. to 11:00 p.m.</p><p><strong>Leash before entering and leaving:</strong> the city's posted rules require handlers to leash dogs before entering and after leaving the off-leash park.</p><p><strong>Maintain physical and verbal control:</strong> owners must stay in the park to supervise and control their dogs at all times.</p><p><strong>Meet the health and licensing baseline:</strong> all dogs must have up-to-date vaccinations and rabies shots, and all City of Medicine Hat resident pets must be licensed.</p><p><strong>Respect broader park restrictions:</strong> dogs are not allowed on sports fields, play structures, school grounds, swimming areas or spray parks, golf courses, or cemeteries, whether on or off leash.</p>";
  const etiquette = "<p><strong>1. Pick the fenced park that matches your visit style.</strong></p><p>Saratoga is the better amenity-driven stop if you want shade and agility features, while WestVue is the simpler fenced option for a straightforward run.</p><p><strong>2. Treat the off-leash trails differently from the fenced parks.</strong></p><p>The city warns that environmental-reserve areas can back onto homes and include leisure trails, which increases the risk of conflict with other users.</p><p><strong>3. Do not assume every open greenspace is fair game.</strong></p><p>Medicine Hat specifically prohibits dogs from sports fields, play structures, school grounds, swim areas, golf courses, and cemeteries.</p><p><strong>4. Keep your licence and vaccinations current before visiting.</strong></p><p>The city's off-leash rules and licensing page both make those requirements explicit instead of treating them as optional best practice.</p><p><strong>5. Use the park as a shared space, not a drop-off area.</strong></p><p>Medicine Hat requires owners to remain present in the park and maintain physical and verbal control at all times.</p>";
  const faqs = "<p><strong>1. How many fenced off-leash dog parks does Medicine Hat currently list?</strong></p><p>The City of Medicine Hat currently lists two fully fenced dog parks: Saratoga and WestVue.</p><p><strong>2. Are there off-leash options beyond the two fenced parks?</strong></p><p>Yes. The city also says it maintains designated off-leash trails, but owners should still keep dogs under control and respect shared trail use.</p><p><strong>3. What are the hours for Saratoga and WestVue?</strong></p><p>The city says both parks are open daily from 7:00 a.m. to 11:00 p.m.</p><p><strong>4. Does Medicine Hat require a dog licence for off-leash park use?</strong></p><p>Yes. The city says resident pets must be licensed, and its pet-licence page states that all dogs are required to be licensed annually.</p><p><strong>5. What does Medicine Hat currently charge for dog licences?</strong></p><p>As of Tuesday, July 28, 2026, Medicine Hat lists annual dog licences at $15 for dogs aged three to six months, $15 for spayed or neutered dogs, and $50 for intact dogs. It also lists $150 for a fixed lifetime licence, $80 for a fixed lifetime licence with microchip, and $5 for replacement tags.</p><p><strong>6. Which fenced park has more amenities?</strong></p><p>Saratoga has the longer published amenity list, including potable water, agility and balance structures, benches, waste-bag dispensers, garbage bins, and shade structures.</p>";
  const metaDescription = "Source-backed guide to dog parks in Medicine Hat, Alberta, covering Saratoga and WestVue dog parks, designated off-leash trails, posted hours, licensing fees, and current city rules.";

  city.seoTitle = "Dog Parks in Medicine Hat, Alberta | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Alberta"],
    "Featured Park 1": ["saratoga-dog-park"],
    "Featured Park 2": ["westvue-dog-park"],
    "Province Page": ["https://leashfree.ca/alberta-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "saratoga-dog-park",
    "Featured Park 2": "westvue-dog-park",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.medicinehat.ca/parks-recreation/parks-playgrounds/parks/off-leash-dog-parks/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "",
    "Updated On": "Tue Jul 28 2026 16:30:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 16:30:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "medicine-hat");
  if (!targetRow) throw new Error("Medicine Hat city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Medicine Hat, Alberta | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Medicine Hat, Alberta, covering Saratoga and WestVue dog parks, designated off-leash trails, posted hours, licensing fees, and current city rules.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Medicine Hat's current off-leash picture is more specific than the generic copy this page started with. The City of Medicine Hat currently says it maintains two fully fenced dog parks, Saratoga and WestVue, and also identifies designated off-leash trails for dog owners who want more than a fenced run.</p>",
    "About Section": "<p>The City of Medicine Hat currently says it has two fully fenced dog parks, plus designated off-leash trails. The fenced parks are Saratoga Dog Park at 1205 Factory Street SE and WestVue Dog Park near Gas City Campground on 11 Avenue SW. The city publishes the core amenities for each site rather than leaving owners to guess. Saratoga is the more feature-heavy fenced park, with potable water, agility and balance structures, benches, dog-waste bag dispensers, garbage bins, and shade structures. WestVue is also fully fenced and includes potable water, benches, dog-waste bag dispensers, and garbage bins.</p><p>The city also gives this page a much stronger compliance base than the old draft had. Medicine Hat says both fenced dog parks are open daily from 7:00 a.m. to 11:00 p.m. Its posted off-leash rules say owners must supervise and maintain physical and verbal control, dogs must have up-to-date vaccinations and rabies shots, and all resident pets must be licensed. The broader Animal Services page adds that the city maintains both the fenced dog parks and designated off-leash trails, while the pet-licence page confirms annual dog licensing is required under the Responsible Animal Ownership Bylaw and lists the current fee structure.</p>",
    "Featured Park 1": "saratoga-dog-park",
    "Featured Park 2": "westvue-dog-park",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> The fenced parks remain the most straightforward option because their hours stay clear at 7:00 a.m. to 11:00 p.m., while trail footing in environmental-reserve areas can be more variable.</li><li><strong>Spring:</strong> Use extra caution on off-leash trails and reserve edges when thaw makes surfaces softer and increases conflict with other trail users.</li><li><strong>Summer:</strong> Saratoga is the stronger warm-weather fenced option because the city lists both potable water and shade structures there.</li><li><strong>Fall:</strong> WestVue and Saratoga remain dependable short-visit options when earlier sunsets make longer trail sessions less practical.</li></ul>",
    "Park Rules": "<p><strong>Know the published hours:</strong> Medicine Hat says Saratoga and WestVue dog parks are open daily from 7:00 a.m. to 11:00 p.m.</p><p><strong>Leash before entering and leaving:</strong> the city's posted rules require handlers to leash dogs before entering and after leaving the off-leash park.</p><p><strong>Maintain physical and verbal control:</strong> owners must stay in the park to supervise and control their dogs at all times.</p><p><strong>Meet the health and licensing baseline:</strong> all dogs must have up-to-date vaccinations and rabies shots, and all City of Medicine Hat resident pets must be licensed.</p><p><strong>Respect broader park restrictions:</strong> dogs are not allowed on sports fields, play structures, school grounds, swimming areas or spray parks, golf courses, or cemeteries, whether on or off leash.</p>",
    "City Website": "https://www.medicinehat.ca/parks-recreation/parks-playgrounds/parks/off-leash-dog-parks/",
    "Dog Park Etiquettes": "<p><strong>1. Pick the fenced park that matches your visit style.</strong></p><p>Saratoga is the better amenity-driven stop if you want shade and agility features, while WestVue is the simpler fenced option for a straightforward run.</p><p><strong>2. Treat the off-leash trails differently from the fenced parks.</strong></p><p>The city warns that environmental-reserve areas can back onto homes and include leisure trails, which increases the risk of conflict with other users.</p><p><strong>3. Do not assume every open greenspace is fair game.</strong></p><p>Medicine Hat specifically prohibits dogs from sports fields, play structures, school grounds, swim areas, golf courses, and cemeteries.</p><p><strong>4. Keep your licence and vaccinations current before visiting.</strong></p><p>The city's off-leash rules and licensing page both make those requirements explicit instead of treating them as optional best practice.</p><p><strong>5. Use the park as a shared space, not a drop-off area.</strong></p><p>Medicine Hat requires owners to remain present in the park and maintain physical and verbal control at all times.</p>",
    "Dog Park FAQs": "<p><strong>1. How many fenced off-leash dog parks does Medicine Hat currently list?</strong></p><p>The City of Medicine Hat currently lists two fully fenced dog parks: Saratoga and WestVue.</p><p><strong>2. Are there off-leash options beyond the two fenced parks?</strong></p><p>Yes. The city also says it maintains designated off-leash trails, but owners should still keep dogs under control and respect shared trail use.</p><p><strong>3. What are the hours for Saratoga and WestVue?</strong></p><p>The city says both parks are open daily from 7:00 a.m. to 11:00 p.m.</p><p><strong>4. Does Medicine Hat require a dog licence for off-leash park use?</strong></p><p>Yes. The city says resident pets must be licensed, and its pet-licence page states that all dogs are required to be licensed annually.</p><p><strong>5. What does Medicine Hat currently charge for dog licences?</strong></p><p>As of Tuesday, July 28, 2026, Medicine Hat lists annual dog licences at $15 for dogs aged three to six months, $15 for spayed or neutered dogs, and $50 for intact dogs. It also lists $150 for a fixed lifetime licence, $80 for a fixed lifetime licence with microchip, and $5 for replacement tags.</p><p><strong>6. Which fenced park has more amenities?</strong></p><p>Saratoga has the longer published amenity list, including potable water, agility and balance structures, benches, waste-bag dispensers, garbage bins, and shade structures.</p>",
    "Nearby Cities": "",
    "Updated On": "Tue Jul 28 2026 16:30:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 16:30:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/medicine-hat/")];
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

console.log("Updated Medicine Hat city page and refreshed backlog files.");
