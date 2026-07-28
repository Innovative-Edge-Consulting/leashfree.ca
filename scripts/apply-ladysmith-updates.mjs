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
  if (source.includes('"ladysmith": "/images/cities/city-ladysmith-hero.png"')) return;
  const anchor = '  "laval": "/images/dog-parks/laval-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "ladysmith": "/images/cities/city-ladysmith-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "ladysmith");
  if (!city) throw new Error("Ladysmith city record not found.");

  const intro = "<p>Ladysmith has enough current municipal material to support a much tighter city guide than the generic page copy it had before. The Town of Ladysmith publishes a dedicated dog off-leash parks and trails page, a current dog licences page, a current FAQ PDF, and an updated consolidated dog licensing and control bylaw. That gives this page a defensible source base for both where dogs can be off-leash and the actual rules owners need to follow.</p>";
  const about = "<p>The Town of Ladysmith currently says it provides five dog off-leash areas, including one fenced dog park and a mix of unfenced shoreline, park, and trail spaces. On the town's current dog off-leash page, the fenced option is Davis Road Dog Park, while Transfer Beach above deKoninck Way, Gourlay Janes Park on Chemainus Road, Holland Creek Trail, and the Heart Lake and Stocking Lake loops are also listed as places where dogs may exercise off-leash. The town is explicit that off-leash access only applies within designated areas and that, outside those areas and private property, dogs must be on leash in the Town of Ladysmith.</p><p>The current town guidance also adds rules that make this page materially stronger. Ladysmith says dogs in off-leash areas must remain under the owner's control, owners must carry a leash at all times, and dogs must be leashed before entering and when leaving the off-leash area. The town also requires current licence tags and up-to-date vaccinations, bans female dogs in heat and puppies under four months from off-leash parks, and limits off-leash use to a maximum of two dogs per person. Separately, the current dog licences page says all dogs over six months of age must be licensed, no more than three dogs over four months may be kept in a household, and restricted dogs must be leashed on a leash no longer than six feet and muzzled when off their own property.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Ladysmith's waterfront and forested trail network can stay accessible, but wet roots, mud, and slippery boardwalk or shoreline surfaces are common after rain.</li><li><strong>Spring:</strong> Holland Creek and the Davis Road approach are good options for longer exploratory walks, but soft trail sections are more likely during spring runoff.</li><li><strong>Summer:</strong> Transfer Beach and the marine walk corridor are easier for shorter outings near town amenities, while longer trail loops need extra water for your dog.</li><li><strong>Fall:</strong> Holland Creek is especially scenic during salmon season, but leaf cover and damp trail edges can reduce footing on steeper sections.</li></ul>";
  const parkRules = "<p><strong>Use only the published off-leash network:</strong> Ladysmith says dogs may be off-leash only in designated off-leash areas and on private property with permission.</p><p><strong>Carry a leash and use it at transitions:</strong> the town requires owners to carry a leash at all times and says dogs must be on leash before entering and after leaving the off-leash area.</p><p><strong>Keep control and sight lines:</strong> Ladysmith says dogs must remain under the owner's control and in sight at all times.</p><p><strong>Meet the licensing and vaccination baseline:</strong> current licence tags and up-to-date vaccinations are required for off-leash use.</p><p><strong>Know the restricted areas:</strong> dogs are not allowed on playgrounds, sports fields, cemeteries, or Transfer Beach below deKoninck Way, and the town says leashed or off-leash dogs are not permitted in those spaces.</p>";
  const etiquette = "<p><strong>1. Treat Ladysmith as a mixed off-leash system.</strong></p><p>The town's network is not just one fenced enclosure. It combines a fenced dog park with shoreline, park, and trail-based off-leash spaces that demand better recall.</p><p><strong>2. Respect the boundary at Transfer Beach.</strong></p><p>The town distinguishes the off-leash area above deKoninck Way from the no-dog area below it, so the waterfront rules change depending on where you are standing.</p><p><strong>3. Bring a leash even when your destination is off-leash.</strong></p><p>Ladysmith requires owners to carry a leash at all times and to leash dogs when entering and leaving the off-leash area.</p><p><strong>4. Do not bring dogs that are a poor fit for group use.</strong></p><p>The town excludes female dogs in heat, puppies under four months, and dogs that are not under effective control.</p><p><strong>5. Keep the trail context in mind.</strong></p><p>On Holland Creek and the Heart Lake and Stocking Lake loops, off-leash freedom still requires close supervision because these are linear trail environments rather than contained fields.</p>";
  const faqs = "<p><strong>1. How many off-leash areas does Ladysmith currently publish?</strong></p><p>The Town of Ladysmith says it provides five dog off-leash areas.</p><p><strong>2. Is there a fenced dog park in Ladysmith?</strong></p><p>Yes. The town lists Davis Road Dog Park as the fenced off-leash park.</p><p><strong>3. Where else can dogs be off-leash?</strong></p><p>The town also lists Transfer Beach above deKoninck Way, Gourlay Janes Park, Holland Creek Trail, and the Heart Lake and Stocking Lake loops.</p><p><strong>4. Do dogs need a licence in Ladysmith?</strong></p><p>Yes. The town says all dogs over six months of age must be licensed and must wear their current tag on the collar.</p><p><strong>5. How many dogs can one person bring into an off-leash area?</strong></p><p>The town limits off-leash areas to a maximum of two dogs per person.</p><p><strong>6. Are dogs allowed everywhere at Transfer Beach?</strong></p><p>No. The town's off-leash page says the off-leash area is above deKoninck Way, while Transfer Beach below deKoninck Way is listed as a no-dogs-allowed area.</p>";
  const metaDescription = "Source-backed guide to dog parks in Ladysmith, British Columbia, covering the town's five off-leash areas, current licence rules, leash requirements, and restricted areas such as playgrounds, sports fields, and parts of Transfer Beach.";

  city.seoTitle = "Dog Parks in Ladysmith, British Columbia | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["British Columbia"],
    "Featured Park 1": ["ladysmith-leash-free-dog-park"],
    "Featured Park 2": ["transfer-beach-park"],
    "Featured Park 3": ["holland-creek-trail-head-ladysmith"],
    "Province Page": ["https://leashfree.ca/british-columbia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "ladysmith-leash-free-dog-park",
    "Featured Park 2": "transfer-beach-park",
    "Featured Park 3": "holland-creek-trail-head-ladysmith",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.ladysmith.ca/parks-recreation-culture/dog-off-leash-parks-trails",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Chemainus, Duncan, Nanaimo",
    "Updated On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Mon Jul 27 2026 14:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "ladysmith");
  if (!targetRow) throw new Error("Ladysmith city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Ladysmith, British Columbia | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Ladysmith, British Columbia, covering the town's five off-leash areas, current licence rules, leash requirements, and restricted areas such as playgrounds, sports fields, and parts of Transfer Beach.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Ladysmith has enough current municipal material to support a much tighter city guide than the generic page copy it had before. The Town of Ladysmith publishes a dedicated dog off-leash parks and trails page, a current dog licences page, a current FAQ PDF, and an updated consolidated dog licensing and control bylaw. That gives this page a defensible source base for both where dogs can be off-leash and the actual rules owners need to follow.</p>",
    "About Section": "<p>The Town of Ladysmith currently says it provides five dog off-leash areas, including one fenced dog park and a mix of unfenced shoreline, park, and trail spaces. On the town's current dog off-leash page, the fenced option is Davis Road Dog Park, while Transfer Beach above deKoninck Way, Gourlay Janes Park on Chemainus Road, Holland Creek Trail, and the Heart Lake and Stocking Lake loops are also listed as places where dogs may exercise off-leash. The town is explicit that off-leash access only applies within designated areas and that, outside those areas and private property, dogs must be on leash in the Town of Ladysmith.</p><p>The current town guidance also adds rules that make this page materially stronger. Ladysmith says dogs in off-leash areas must remain under the owner's control, owners must carry a leash at all times, and dogs must be leashed before entering and when leaving the off-leash area. The town also requires current licence tags and up-to-date vaccinations, bans female dogs in heat and puppies under four months from off-leash parks, and limits off-leash use to a maximum of two dogs per person. Separately, the current dog licences page says all dogs over six months of age must be licensed, no more than three dogs over four months may be kept in a household, and restricted dogs must be leashed on a leash no longer than six feet and muzzled when off their own property.</p>",
    "Featured Park 1": "ladysmith-leash-free-dog-park",
    "Featured Park 2": "transfer-beach-park",
    "Featured Park 3": "holland-creek-trail-head-ladysmith",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Ladysmith's waterfront and forested trail network can stay accessible, but wet roots, mud, and slippery boardwalk or shoreline surfaces are common after rain.</li><li><strong>Spring:</strong> Holland Creek and the Davis Road approach are good options for longer exploratory walks, but soft trail sections are more likely during spring runoff.</li><li><strong>Summer:</strong> Transfer Beach and the marine walk corridor are easier for shorter outings near town amenities, while longer trail loops need extra water for your dog.</li><li><strong>Fall:</strong> Holland Creek is especially scenic during salmon season, but leaf cover and damp trail edges can reduce footing on steeper sections.</li></ul>",
    "Park Rules": "<p><strong>Use only the published off-leash network:</strong> Ladysmith says dogs may be off-leash only in designated off-leash areas and on private property with permission.</p><p><strong>Carry a leash and use it at transitions:</strong> the town requires owners to carry a leash at all times and says dogs must be on leash before entering and after leaving the off-leash area.</p><p><strong>Keep control and sight lines:</strong> Ladysmith says dogs must remain under the owner's control and in sight at all times.</p><p><strong>Meet the licensing and vaccination baseline:</strong> current licence tags and up-to-date vaccinations are required for off-leash use.</p><p><strong>Know the restricted areas:</strong> dogs are not allowed on playgrounds, sports fields, cemeteries, or Transfer Beach below deKoninck Way, and the town says leashed or off-leash dogs are not permitted in those spaces.</p>",
    "City Website": "https://www.ladysmith.ca/parks-recreation-culture/dog-off-leash-parks-trails",
    "Dog Park Etiquettes": "<p><strong>1. Treat Ladysmith as a mixed off-leash system.</strong></p><p>The town's network is not just one fenced enclosure. It combines a fenced dog park with shoreline, park, and trail-based off-leash spaces that demand better recall.</p><p><strong>2. Respect the boundary at Transfer Beach.</strong></p><p>The town distinguishes the off-leash area above deKoninck Way from the no-dog area below it, so the waterfront rules change depending on where you are standing.</p><p><strong>3. Bring a leash even when your destination is off-leash.</strong></p><p>Ladysmith requires owners to carry a leash at all times and to leash dogs when entering and leaving the off-leash area.</p><p><strong>4. Do not bring dogs that are a poor fit for group use.</strong></p><p>The town excludes female dogs in heat, puppies under four months, and dogs that are not under effective control.</p><p><strong>5. Keep the trail context in mind.</strong></p><p>On Holland Creek and the Heart Lake and Stocking Lake loops, off-leash freedom still requires close supervision because these are linear trail environments rather than contained fields.</p>",
    "Dog Park FAQs": "<p><strong>1. How many off-leash areas does Ladysmith currently publish?</strong></p><p>The Town of Ladysmith says it provides five dog off-leash areas.</p><p><strong>2. Is there a fenced dog park in Ladysmith?</strong></p><p>Yes. The town lists Davis Road Dog Park as the fenced off-leash park.</p><p><strong>3. Where else can dogs be off-leash?</strong></p><p>The town also lists Transfer Beach above deKoninck Way, Gourlay Janes Park, Holland Creek Trail, and the Heart Lake and Stocking Lake loops.</p><p><strong>4. Do dogs need a licence in Ladysmith?</strong></p><p>Yes. The town says all dogs over six months of age must be licensed and must wear their current tag on the collar.</p><p><strong>5. How many dogs can one person bring into an off-leash area?</strong></p><p>The town limits off-leash areas to a maximum of two dogs per person.</p><p><strong>6. Are dogs allowed everywhere at Transfer Beach?</strong></p><p>No. The town's off-leash page says the off-leash area is above deKoninck Way, while Transfer Beach below deKoninck Way is listed as a no-dogs-allowed area.</p>",
    "Nearby Cities": "Chemainus, Duncan, Nanaimo",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/ladysmith/")];
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

console.log("Updated Ladysmith city page and refreshed backlog files.");
