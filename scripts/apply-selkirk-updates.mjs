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
  if (source.includes('"selkirk": "/images/cities/city-selkirk-hero.png"')) return;
  const updated = source.replace(
    '  "quebec-city": "/images/cities/city-quebec-city-hero.png",\n',
    '  "quebec-city": "/images/cities/city-quebec-city-hero.png",\n  "selkirk": "/images/cities/city-selkirk-hero.png",\n'
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "selkirk");
  if (!city) throw new Error("Selkirk city record not found.");

  const intro = "<p>Selkirk's official dog-park guidance is unusually specific: the City says the only off-leash area within Selkirk is the Dog Park in Selkirk Park. The city's park page describes it as a 1.75-acre enclosure with a four-foot chain-link fence, while the domestic-animal pages confirm that a valid Selkirk dog licence tag is required to access it.</p>";
  const about = "<p>The old Selkirk page leaned on generic assumptions about trails and public amenities. The official city sources are better and more precise. Selkirk Park is the city's designated off-leash location, and the city describes the dog park as a 1.75-acre fenced space with trees, open room to run, benches, waste bags, and garbage cans. The broader Selkirk Park page also places the dog park inside a larger park setting that includes trails, seasonal washrooms, and other recreation facilities.</p><p>Selkirk's domestic-animal guidance also makes the regulatory side clear. Dogs in the city must be leashed unless they are on the owner's property, on private property with consent, or in a city-designated off-leash area. The city explicitly says the only off-leash area within Selkirk is the Dog Park in Selkirk Park. Dog owners must license dogs over four months old, renew the licence every year, provide current proof of rabies vaccination, and ensure the dog wears its valid licence tag when off the owner's property. Selkirk currently provides those dog licences free of charge to city residents.</p>";
  const seasonalTips = "<p>- Winter: Selkirk promotes dog licensing year-round and specifically notes winter lost-pet risk, so cold-weather visits should be shorter and paired with visible tags and good recall.<br>- Spring: Thaw can soften natural surfaces inside Selkirk Park, so expect mud near entries and along any connecting trail segments.<br>- Summer: The dog park sits within a larger park with seasonal washrooms and other summer amenities nearby, which makes earlier or later visits practical on hotter days.<br>- Fall: Cooler temperatures are usually better for longer off-leash sessions, but shorter daylight still matters because the city does not present the dog park as a lit late-night facility.</p>";
  const parkRules = "<p><strong>Use the designated area only:</strong> Selkirk says the only off-leash area in the city is the Dog Park in Selkirk Park.</p><p><strong>Dog licences are mandatory:</strong> all dogs over four months old must be licensed annually, proof of current rabies vaccination is required, and Selkirk says access to the dog park requires a valid dog licence tag.</p><p><strong>Follow the posted dog-park rules:</strong> the city requires visible licence and ID tags, dogs under handler control and in view, handlers carrying a leash, cleanup of waste and holes, and removal or muzzling of aggressive dogs.</p><p><strong>Know the use limits:</strong> female dogs in heat are prohibited, handlers are limited to three dogs, and children under 14 must be accompanied by an adult.</p>";
  const etiquette = "<p><strong>1. Start with the city's one confirmed off-leash site.</strong></p><p>Selkirk is explicit that the only city off-leash area is the Dog Park in Selkirk Park, so avoid treating other trails or open grass as informal off-leash space.</p><p><strong>2. Arrive with licence tag and leash.</strong></p><p>The city requires a valid dog licence tag for access and says handlers must have possession of the dog leash at all times.</p><p><strong>3. Keep visual and voice control honest.</strong></p><p>Selkirk's rules require dogs to stay under the control and in view of their handler at all times.</p><p><strong>4. Leave the surface clean.</strong></p><p>The posted rules specifically require handlers to scoop waste and fill any holes dug by dogs under their control.</p><p><strong>5. Be conservative around conflict triggers.</strong></p><p>Selkirk's posted rules discourage fetch when other dogs are nearby and require handlers to remove or muzzle dogs showing aggressive tendencies.</p>";
  const faqs = "<p><strong>1. Where is Selkirk's official off-leash dog area?</strong></p><p>The City of Selkirk says the only off-leash area within the city is the Dog Park in Selkirk Park.</p><p><strong>2. How large is the Selkirk dog park?</strong></p><p>The city's dog-park page describes it as a 1.75-acre dog park enclosed by a four-foot-high chain-link fence.</p><p><strong>3. Do I need a dog licence to use it?</strong></p><p>Yes. Selkirk says all dogs over four months old must be licensed, and a valid dog licence tag is required to access the dog park.</p><p><strong>4. How much does a Selkirk dog licence cost?</strong></p><p>The city says dog licences are free for city residents, but they still must be renewed every year.</p><p><strong>5. What documents are required for licensing?</strong></p><p>Current proof of rabies vaccination is required when applying or renewing.</p><p><strong>6. What are some of the main posted dog-park rules?</strong></p><p>Dogs must wear visible licence and ID tags, handlers must keep dogs in view and under control, handlers may bring up to three dogs, and female dogs in heat are prohibited.</p>";
  const metaDescription = "Find Selkirk dog park rules, licence requirements, and official city guidance for the Selkirk Park off-leash area. This source-backed Selkirk guide covers access, fencing, and current owner requirements.";

  city.seoTitle = "Dog Parks in Selkirk, Manitoba | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Manitoba"],
    "Province Page": ["https://leashfree.ca/manitoba-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "dog-park-at-selkirk-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.myselkirk.ca/parksandpathways/selkirk-park/dog-park/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Winnipeg, St. Clements",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "selkirk");
  if (!targetRow) throw new Error("Selkirk city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Selkirk, Manitoba | Off-Leash Guide",
    "Meta Description": "Find Selkirk dog park rules, licence requirements, and official city guidance for the Selkirk Park off-leash area. This source-backed Selkirk guide covers access, fencing, and current owner requirements.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Selkirk's official dog-park guidance is unusually specific: the City says the only off-leash area within Selkirk is the Dog Park in Selkirk Park. The city's park page describes it as a 1.75-acre enclosure with a four-foot chain-link fence, while the domestic-animal pages confirm that a valid Selkirk dog licence tag is required to access it.</p>",
    "About Section": "<p>The old Selkirk page leaned on generic assumptions about trails and public amenities. The official city sources are better and more precise. Selkirk Park is the city's designated off-leash location, and the city describes the dog park as a 1.75-acre fenced space with trees, open room to run, benches, waste bags, and garbage cans. The broader Selkirk Park page also places the dog park inside a larger park setting that includes trails, seasonal washrooms, and other recreation facilities.</p><p>Selkirk's domestic-animal guidance also makes the regulatory side clear. Dogs in the city must be leashed unless they are on the owner's property, on private property with consent, or in a city-designated off-leash area. The city explicitly says the only off-leash area within Selkirk is the Dog Park in Selkirk Park. Dog owners must license dogs over four months old, renew the licence every year, provide current proof of rabies vaccination, and ensure the dog wears its valid licence tag when off the owner's property. Selkirk currently provides those dog licences free of charge to city residents.</p>",
    "Featured Park 1": "dog-park-at-selkirk-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<p>- Winter: Selkirk promotes dog licensing year-round and specifically notes winter lost-pet risk, so cold-weather visits should be shorter and paired with visible tags and good recall.<br>- Spring: Thaw can soften natural surfaces inside Selkirk Park, so expect mud near entries and along any connecting trail segments.<br>- Summer: The dog park sits within a larger park with seasonal washrooms and other summer amenities nearby, which makes earlier or later visits practical on hotter days.<br>- Fall: Cooler temperatures are usually better for longer off-leash sessions, but shorter daylight still matters because the city does not present the dog park as a lit late-night facility.</p>",
    "Park Rules": "<p><strong>Use the designated area only:</strong> Selkirk says the only off-leash area in the city is the Dog Park in Selkirk Park.</p><p><strong>Dog licences are mandatory:</strong> all dogs over four months old must be licensed annually, proof of current rabies vaccination is required, and Selkirk says access to the dog park requires a valid dog licence tag.</p><p><strong>Follow the posted dog-park rules:</strong> the city requires visible licence and ID tags, dogs under handler control and in view, handlers carrying a leash, cleanup of waste and holes, and removal or muzzling of aggressive dogs.</p><p><strong>Know the use limits:</strong> female dogs in heat are prohibited, handlers are limited to three dogs, and children under 14 must be accompanied by an adult.</p>",
    "City Website": "https://www.myselkirk.ca/parksandpathways/selkirk-park/dog-park/",
    "Dog Park Etiquettes": "<p><strong>1. Start with the city's one confirmed off-leash site.</strong></p><p>Selkirk is explicit that the only city off-leash area is the Dog Park in Selkirk Park, so avoid treating other trails or open grass as informal off-leash space.</p><p><strong>2. Arrive with licence tag and leash.</strong></p><p>The city requires a valid dog licence tag for access and says handlers must have possession of the dog leash at all times.</p><p><strong>3. Keep visual and voice control honest.</strong></p><p>Selkirk's rules require dogs to stay under the control and in view of their handler at all times.</p><p><strong>4. Leave the surface clean.</strong></p><p>The posted rules specifically require handlers to scoop waste and fill any holes dug by dogs under their control.</p><p><strong>5. Be conservative around conflict triggers.</strong></p><p>Selkirk's posted rules discourage fetch when other dogs are nearby and require handlers to remove or muzzle dogs showing aggressive tendencies.</p>",
    "Dog Park FAQs": "<p><strong>1. Where is Selkirk's official off-leash dog area?</strong></p><p>The City of Selkirk says the only off-leash area within the city is the Dog Park in Selkirk Park.</p><p><strong>2. How large is the Selkirk dog park?</strong></p><p>The city's dog-park page describes it as a 1.75-acre dog park enclosed by a four-foot-high chain-link fence.</p><p><strong>3. Do I need a dog licence to use it?</strong></p><p>Yes. Selkirk says all dogs over four months old must be licensed, and a valid dog licence tag is required to access the dog park.</p><p><strong>4. How much does a Selkirk dog licence cost?</strong></p><p>The city says dog licences are free for city residents, but they still must be renewed every year.</p><p><strong>5. What documents are required for licensing?</strong></p><p>Current proof of rabies vaccination is required when applying or renewing.</p><p><strong>6. What are some of the main posted dog-park rules?</strong></p><p>Dogs must wear visible licence and ID tags, handlers must keep dogs in view and under control, handlers may bring up to three dogs, and female dogs in heat are prohibited.</p>",
    "Nearby Cities": "Winnipeg, St. Clements",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/selkirk/")];
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

console.log("Updated Selkirk city page and refreshed backlog files.");
