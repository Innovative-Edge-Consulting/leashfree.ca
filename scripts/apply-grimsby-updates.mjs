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
  if (source.includes('"grimsby": "/images/cities/city-grimsby-hero.png"')) return;
  const anchor = '  "gatineau": "/images/dog-parks/gatineau-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "grimsby": "/images/cities/city-grimsby-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "grimsby");
  if (!city) throw new Error("Grimsby city record not found.");

  const intro = "<p>Grimsby is a good example of why these city guides need source validation. The current town website clearly says Grimsby has three leash-free dog parks, publishes current dog-park rules, and ties those parks back to the town's active animal-services and parks framework. That is a much better foundation than the older LeashFree.ca copy, which incorrectly collapsed Grimsby into a single Casablanca dog park.</p>";
  const about = "<p>The previous Grimsby page is no longer defensible as written. The Town of Grimsby's current leash-free dog parks page says the town has three leash-free dog parks available to residents: Steve McDonnell Leash-Free Dog Park, Southward Park Leash-Free Dog Park, and Oakes Road Dog Run. That same official page also sets the current park-wide rule framework, including valid licence tags, up-to-date vaccinations and rabies shots, 7 a.m. to 9 p.m. operating hours, leash-on entry and exit, cleanup obligations, and exclusion of puppies under four months, dogs in heat, sick dogs, and aggressive dogs.</p><p>The town's animal-services page adds the city-wide ownership context. Grimsby says no more than three dogs over the age of 10 weeks can be kept on any premises unless grandfathered under the bylaw. It also says all dogs must be licensed each year and must be leashed at all times unless they are on their own property or at a designated leash-free dog park. The town currently points residents to Animal Control By-law 10-06 and says the Humane Society of Greater Niagara provides animal-control services for Grimsby. Together, those sources make the current Grimsby page much clearer: this is a town with a real three-park off-leash network, but access still sits inside an active municipal licensing and animal-control system.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Wind off Lake Ontario and icy gate areas can make winter visits less comfortable even when the parks remain open.</li><li><strong>Spring:</strong> Turf and entrance areas may be muddy during thaw, especially at larger sports-park settings.</li><li><strong>Summer:</strong> Grimsby's open fenced parks are easiest on dogs in the cooler morning or evening hours.</li><li><strong>Fall:</strong> Cooler temperatures are ideal for longer sessions, but earlier sunsets matter because the official park-wide rule set gives fixed evening hours.</li></ul>";
  const parkRules = "<p><strong>Use one of the town's three designated parks:</strong> Grimsby currently lists Steve McDonnell, Southward Park, and Oakes Road Dog Run as its leash-free dog parks.</p><p><strong>Handle licensing and vaccinations first:</strong> the town says all dogs must have valid licence tags and up-to-date vaccinations and rabies shots to use the dog parks.</p><p><strong>Follow the published dog-park hours:</strong> the current leash-free dog parks page says the parks are open from 7 a.m. to 9 p.m.</p><p><strong>Leash dogs at the boundary:</strong> Grimsby says dogs must be leashed when entering and exiting the park.</p><p><strong>Know the exclusions:</strong> the town says no puppies under four months, female dogs in heat, sick dogs, or aggressive dogs are allowed, and dogs that must be leashed and muzzled by law must remain so in the off-leash area.</p>";
  const etiquette = "<p><strong>1. Treat Grimsby as a three-park network, not a one-park city.</strong></p><p>The current official town page lists three separate leash-free dog parks, so owners have real options if one park feels crowded or unsuitable.</p><p><strong>2. Keep your dog under verbal control.</strong></p><p>Grimsby's published rules specifically emphasize that owners should have verbal control and confidence that their dog's behaviour suits a leash-free setting.</p><p><strong>3. Leash up at transitions.</strong></p><p>The town explicitly requires dogs to be leashed when entering and leaving the park, which is often where conflicts happen.</p><p><strong>4. Be conservative with children and vulnerable dogs.</strong></p><p>Grimsby says children must be supervised at all times and advises that these sites are not suitable for young children.</p><p><strong>5. Respect the municipal ownership limits too.</strong></p><p>The town's animal-services page says no more than three dogs over the age of 10 weeks can be kept on any premises unless grandfathered under the bylaw.</p>";
  const faqs = "<p><strong>1. How many leash-free dog parks does Grimsby currently publish?</strong></p><p>The Town of Grimsby currently says it has three leash-free dog parks.</p><p><strong>2. Which parks are they?</strong></p><p>The town lists Steve McDonnell Leash-Free Dog Park, Southward Park Leash-Free Dog Park, and Oakes Road Dog Run.</p><p><strong>3. Do dogs need tags and vaccinations?</strong></p><p>Yes. The town says dogs using the parks must have valid licence tags and up-to-date vaccinations and rabies shots.</p><p><strong>4. What hours does Grimsby publish for its leash-free parks?</strong></p><p>The current dedicated leash-free dog parks page says the parks are open from 7 a.m. to 9 p.m.</p><p><strong>5. What is the normal leash rule outside the designated parks?</strong></p><p>Grimsby says dogs must be leashed at all times unless they are on their own property or at a designated leash-free dog park.</p><p><strong>6. What is the current animal-control bylaw reference?</strong></p><p>The town's bylaw pages currently list Animal Control By-law 10-06.</p>";
  const metaDescription = "Source-backed guide to dog parks in Grimsby, Ontario, covering the town's three official leash-free dog parks, current licensing and vaccination rules, published dog-park hours, and Animal Control By-law 10-06.";

  city.seoTitle = "Dog Parks in Grimsby, Ontario | Off-Leash Guide";
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
    "Featured Park 1": "steve-mcdonnell",
    "Featured Park 2": "southward-community-park",
    "Featured Park 3": "oakes-road-dog-run",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/leash-free-dog-parks/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "St. Catharines, Hamilton, Burlington",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "grimsby");
  if (!targetRow) throw new Error("Grimsby city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Grimsby, Ontario | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Grimsby, Ontario, covering the town's three official leash-free dog parks, current licensing and vaccination rules, published dog-park hours, and Animal Control By-law 10-06.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Grimsby is a good example of why these city guides need source validation. The current town website clearly says Grimsby has three leash-free dog parks, publishes current dog-park rules, and ties those parks back to the town's active animal-services and parks framework. That is a much better foundation than the older LeashFree.ca copy, which incorrectly collapsed Grimsby into a single Casablanca dog park.</p>",
    "About Section": "<p>The previous Grimsby page is no longer defensible as written. The Town of Grimsby's current leash-free dog parks page says the town has three leash-free dog parks available to residents: Steve McDonnell Leash-Free Dog Park, Southward Park Leash-Free Dog Park, and Oakes Road Dog Run. That same official page also sets the current park-wide rule framework, including valid licence tags, up-to-date vaccinations and rabies shots, 7 a.m. to 9 p.m. operating hours, leash-on entry and exit, cleanup obligations, and exclusion of puppies under four months, dogs in heat, sick dogs, and aggressive dogs.</p><p>The town's animal-services page adds the city-wide ownership context. Grimsby says no more than three dogs over the age of 10 weeks can be kept on any premises unless grandfathered under the bylaw. It also says all dogs must be licensed each year and must be leashed at all times unless they are on their own property or at a designated leash-free dog park. The town currently points residents to Animal Control By-law 10-06 and says the Humane Society of Greater Niagara provides animal-control services for Grimsby. Together, those sources make the current Grimsby page much clearer: this is a town with a real three-park off-leash network, but access still sits inside an active municipal licensing and animal-control system.</p>",
    "Featured Park 1": "steve-mcdonnell",
    "Featured Park 2": "southward-community-park",
    "Featured Park 3": "oakes-road-dog-run",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Wind off Lake Ontario and icy gate areas can make winter visits less comfortable even when the parks remain open.</li><li><strong>Spring:</strong> Turf and entrance areas may be muddy during thaw, especially at larger sports-park settings.</li><li><strong>Summer:</strong> Grimsby's open fenced parks are easiest on dogs in the cooler morning or evening hours.</li><li><strong>Fall:</strong> Cooler temperatures are ideal for longer sessions, but earlier sunsets matter because the official park-wide rule set gives fixed evening hours.</li></ul>",
    "Park Rules": "<p><strong>Use one of the town's three designated parks:</strong> Grimsby currently lists Steve McDonnell, Southward Park, and Oakes Road Dog Run as its leash-free dog parks.</p><p><strong>Handle licensing and vaccinations first:</strong> the town says all dogs must have valid licence tags and up-to-date vaccinations and rabies shots to use the dog parks.</p><p><strong>Follow the published dog-park hours:</strong> the current leash-free dog parks page says the parks are open from 7 a.m. to 9 p.m.</p><p><strong>Leash dogs at the boundary:</strong> Grimsby says dogs must be leashed when entering and exiting the park.</p><p><strong>Know the exclusions:</strong> the town says no puppies under four months, female dogs in heat, sick dogs, or aggressive dogs are allowed, and dogs that must be leashed and muzzled by law must remain so in the off-leash area.</p>",
    "City Website": "https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/leash-free-dog-parks/",
    "Dog Park Etiquettes": "<p><strong>1. Treat Grimsby as a three-park network, not a one-park city.</strong></p><p>The current official town page lists three separate leash-free dog parks, so owners have real options if one park feels crowded or unsuitable.</p><p><strong>2. Keep your dog under verbal control.</strong></p><p>Grimsby's published rules specifically emphasize that owners should have verbal control and confidence that their dog's behaviour suits a leash-free setting.</p><p><strong>3. Leash up at transitions.</strong></p><p>The town explicitly requires dogs to be leashed when entering and leaving the park, which is often where conflicts happen.</p><p><strong>4. Be conservative with children and vulnerable dogs.</strong></p><p>Grimsby says children must be supervised at all times and advises that these sites are not suitable for young children.</p><p><strong>5. Respect the municipal ownership limits too.</strong></p><p>The town's animal-services page says no more than three dogs over the age of 10 weeks can be kept on any premises unless grandfathered under the bylaw.</p>",
    "Dog Park FAQs": "<p><strong>1. How many leash-free dog parks does Grimsby currently publish?</strong></p><p>The Town of Grimsby currently says it has three leash-free dog parks.</p><p><strong>2. Which parks are they?</strong></p><p>The town lists Steve McDonnell Leash-Free Dog Park, Southward Park Leash-Free Dog Park, and Oakes Road Dog Run.</p><p><strong>3. Do dogs need tags and vaccinations?</strong></p><p>Yes. The town says dogs using the parks must have valid licence tags and up-to-date vaccinations and rabies shots.</p><p><strong>4. What hours does Grimsby publish for its leash-free parks?</strong></p><p>The current dedicated leash-free dog parks page says the parks are open from 7 a.m. to 9 p.m.</p><p><strong>5. What is the normal leash rule outside the designated parks?</strong></p><p>Grimsby says dogs must be leashed at all times unless they are on their own property or at a designated leash-free dog park.</p><p><strong>6. What is the current animal-control bylaw reference?</strong></p><p>The town's bylaw pages currently list Animal Control By-law 10-06.</p>",
    "Nearby Cities": "St. Catharines, Hamilton, Burlington",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/grimsby/")];
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

console.log("Updated Grimsby city page and refreshed backlog files.");
