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
  if (source.includes('"burnaby": "/images/cities/city-burnaby-hero.png"')) return;
  const anchor = '  "belleville": "/images/cities/city-belleville-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "burnaby": "/images/cities/city-burnaby-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "burnaby");
  if (!city) throw new Error("Burnaby city record not found.");

  const intro = "<p>Burnaby’s official dog guidance is more specific than the thin page suggested. As of Wednesday, July 29, 2026, the City of Burnaby says dogs must stay leashed unless they are in a designated off-leash area, requires licensing for every Burnaby dog over four months old, and publishes a city-managed network of off-leash sites that are generally open from dawn to dusk unless otherwise noted.</p>";
  const about = "<p>Burnaby’s current off-leash guidance is strong enough that this city page should rely on it directly instead of generic assumptions. The city’s Dog Off-leash Areas page says Burnaby parks and green spaces welcome dogs on leash in most places, but off-leash use belongs only in designated areas. It also says that, unless otherwise noted, Burnaby’s dog off-leash areas are open from dawn to dusk. That single page is already more precise than the old city copy because it identifies specific site formats: Confederation Park has a fenced enclosure for all dogs, a separate fenced enclosure for small dogs, and an off-leash loop trail north of Penzance Drive; Burnaby Fraser Foreshore Park combines an open area with an off-leash trail on the Byrne Creek dike; Barnet Marine Park allows off-leash activity year-round from dawn to dusk in its designated area; and Robert Burnaby Park has a long off-leash area that extends along the BC Hydro right of way to a larger open section in the north-central area of the park.</p><p>The city also publishes the ownership and enforcement context that belongs in a stronger Burnaby guide. Burnaby’s dog-licence page says every Burnaby dog over the age of four months must have a valid annual licence, the city-issued tag must remain fastened to the dog’s collar at all times, and Burnaby allows up to three dogs per household. The animal control page says the city handles barking dogs, dog bites and attacks, stray-animal assistance, and other related issues through its Animal Control Office at 604-294-7944, seven days a week from 9 a.m. to 5 p.m. Meanwhile, the off-leash page adds the practical in-park rules: your dog must be leashed before and after using an off-leash area, you must keep a leash in hand while your dog is off leash, aggressive dogs must be removed immediately, you are responsible for damage or injury caused by your dog, and the city sets a maximum of two dogs per person in off-leash areas. Burnaby’s broader park etiquette page also adds two useful guardrails: keep dogs on the trail in sensitive spaces and clean up waste immediately using the red dog-waste bins provided in off-leash areas.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Burnaby’s off-leash network stays usable through the colder months, but steeper forested trails can get slick and muddy faster than fenced enclosures.</li><li><strong>Spring:</strong> Wet ground is common on trail-based sites like Robert Burnaby Park and Burnaby Fraser Foreshore, so expect softer footing.</li><li><strong>Summer:</strong> Popular waterfront and open-space parks can get busy, so earlier or later visits often make control easier.</li><li><strong>Fall:</strong> Cooler weather is excellent for longer outings, but trail leaves and damp grades can reduce traction in natural off-leash sections.</li></ul>";
  const parkRules = "<p><strong>Use off-leash access only in designated areas:</strong> Burnaby says dogs must stay leashed unless they are in a designated off-leash area.</p><p><strong>Follow the city’s transition rules:</strong> dogs must be leashed before and after using an off-leash area, and handlers must keep a leash in hand while their dog is off leash.</p><p><strong>Respect Burnaby’s capacity rule:</strong> the city sets a maximum of two dogs per person in off-leash areas.</p><p><strong>Keep licensing current:</strong> every Burnaby dog over four months old must have a valid licence, and the city says the licence tag must remain attached to the collar at all times.</p><p><strong>Use sensitive trail areas carefully:</strong> Burnaby asks owners to keep dogs on the trail and out of posted restricted areas, beaches, and environmentally sensitive habitats where dogs are not permitted.</p>";
  const etiquette = "<p><strong>1. Match the park type to your dog.</strong></p><p>Burnaby has both enclosed and trail-based off-leash sites, so a dog that does well in a fenced run may not be the right fit for a long open trail system.</p><p><strong>2. Treat the leash transition as part of the visit.</strong></p><p>The city specifically requires dogs to be leashed before and after using the off-leash area, which is where many avoidable conflicts happen.</p><p><strong>3. Keep a closer eye on shoreline and habitat edges.</strong></p><p>Burnaby’s parks guidance is unusually explicit about beaches, sensitive habitat, and staying on trail, so free-roaming off-trail behaviour is a poor fit here.</p><p><strong>4. Don’t overload yourself.</strong></p><p>Burnaby caps off-leash handling at two dogs per person, which is a practical control rule, not just a technical one.</p><p><strong>5. Keep the admin side current.</strong></p><p>Burnaby expects dogs over four months old to be licensed and tagged, and that requirement is part of normal public-park use.</p>";
  const faqs = "<p><strong>1. Are dogs allowed off leash anywhere in Burnaby parks?</strong></p><p>No. Burnaby says dogs must stay leashed unless they are in a designated off-leash area.</p><p><strong>2. What are the usual hours for Burnaby off-leash areas?</strong></p><p>Unless otherwise noted, the city says its dog off-leash areas are open from dawn to dusk.</p><p><strong>3. Does Burnaby have both fenced and trail-based off-leash options?</strong></p><p>Yes. Confederation Park includes fenced enclosures and an off-leash loop trail, while places like Burnaby Fraser Foreshore and Robert Burnaby Park include more open trail-style access.</p><p><strong>4. Do Burnaby dogs need a licence?</strong></p><p>Yes. The city says every Burnaby dog over four months old must have a valid licence and wear the city tag on its collar.</p><p><strong>5. How many dogs can one person handle in a Burnaby off-leash area?</strong></p><p>Burnaby’s off-leash rules set a maximum of two dogs per person.</p><p><strong>6. Who handles dog complaints or animal-control issues in Burnaby?</strong></p><p>The City of Burnaby Animal Control Office lists 604-294-7944 and says it handles barking dogs, dog bites and attacks, stray-animal assistance, and related issues seven days a week from 9 a.m. to 5 p.m.</p>";
  const metaDescription = "Official-source guide to Burnaby dog off-leash areas, covering fenced and trail-based sites, dawn-to-dusk access, Burnaby dog-licensing rules for dogs over 4 months, the two-dogs-per-person off-leash rule, and animal-control contacts.";

  city.seoTitle = "Burnaby Dog Off-Leash Areas | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["British Columbia"],
    "Province Page": ["https://leashfree.ca/british-columbia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "confederation-park-burnaby",
    "Featured Park 2": "burnaby-fraser-foreshore-park",
    "Featured Park 3": "robert-burnaby-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "New Westminster, Coquitlam, Vancouver",
    "Updated On": "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "burnaby");
  if (!targetRow) throw new Error("Burnaby city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Burnaby Dog Off-Leash Areas | LeashFree.ca",
    "Meta Description": "Official-source guide to Burnaby dog off-leash areas, covering fenced and trail-based sites, dawn-to-dusk access, Burnaby dog-licensing rules for dogs over 4 months, the two-dogs-per-person off-leash rule, and animal-control contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Burnaby’s official dog guidance is more specific than the thin page suggested. As of Wednesday, July 29, 2026, the City of Burnaby says dogs must stay leashed unless they are in a designated off-leash area, requires licensing for every Burnaby dog over four months old, and publishes a city-managed network of off-leash sites that are generally open from dawn to dusk unless otherwise noted.</p>",
    "About Section": "<p>Burnaby’s current off-leash guidance is strong enough that this city page should rely on it directly instead of generic assumptions. The city’s Dog Off-leash Areas page says Burnaby parks and green spaces welcome dogs on leash in most places, but off-leash use belongs only in designated areas. It also says that, unless otherwise noted, Burnaby’s dog off-leash areas are open from dawn to dusk. That single page is already more precise than the old city copy because it identifies specific site formats: Confederation Park has a fenced enclosure for all dogs, a separate fenced enclosure for small dogs, and an off-leash loop trail north of Penzance Drive; Burnaby Fraser Foreshore Park combines an open area with an off-leash trail on the Byrne Creek dike; Barnet Marine Park allows off-leash activity year-round from dawn to dusk in its designated area; and Robert Burnaby Park has a long off-leash area that extends along the BC Hydro right of way to a larger open section in the north-central area of the park.</p><p>The city also publishes the ownership and enforcement context that belongs in a stronger Burnaby guide. Burnaby’s dog-licence page says every Burnaby dog over the age of four months must have a valid annual licence, the city-issued tag must remain fastened to the dog’s collar at all times, and Burnaby allows up to three dogs per household. The animal control page says the city handles barking dogs, dog bites and attacks, stray-animal assistance, and other related issues through its Animal Control Office at 604-294-7944, seven days a week from 9 a.m. to 5 p.m. Meanwhile, the off-leash page adds the practical in-park rules: your dog must be leashed before and after using an off-leash area, you must keep a leash in hand while your dog is off leash, aggressive dogs must be removed immediately, you are responsible for damage or injury caused by your dog, and the city sets a maximum of two dogs per person in off-leash areas. Burnaby’s broader park etiquette page also adds two useful guardrails: keep dogs on the trail in sensitive spaces and clean up waste immediately using the red dog-waste bins provided in off-leash areas.</p>",
    "Featured Park 1": "confederation-park-burnaby",
    "Featured Park 2": "burnaby-fraser-foreshore-park",
    "Featured Park 3": "robert-burnaby-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Burnaby’s off-leash network stays usable through the colder months, but steeper forested trails can get slick and muddy faster than fenced enclosures.</li><li><strong>Spring:</strong> Wet ground is common on trail-based sites like Robert Burnaby Park and Burnaby Fraser Foreshore, so expect softer footing.</li><li><strong>Summer:</strong> Popular waterfront and open-space parks can get busy, so earlier or later visits often make control easier.</li><li><strong>Fall:</strong> Cooler weather is excellent for longer outings, but trail leaves and damp grades can reduce traction in natural off-leash sections.</li></ul>",
    "Park Rules": "<p><strong>Use off-leash access only in designated areas:</strong> Burnaby says dogs must stay leashed unless they are in a designated off-leash area.</p><p><strong>Follow the city’s transition rules:</strong> dogs must be leashed before and after using an off-leash area, and handlers must keep a leash in hand while their dog is off leash.</p><p><strong>Respect Burnaby’s capacity rule:</strong> the city sets a maximum of two dogs per person in off-leash areas.</p><p><strong>Keep licensing current:</strong> every Burnaby dog over four months old must have a valid licence, and the city says the licence tag must remain attached to the collar at all times.</p><p><strong>Use sensitive trail areas carefully:</strong> Burnaby asks owners to keep dogs on the trail and out of posted restricted areas, beaches, and environmentally sensitive habitats where dogs are not permitted.</p>",
    "City Website": "https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas",
    "Dog Park Etiquettes": "<p><strong>1. Match the park type to your dog.</strong></p><p>Burnaby has both enclosed and trail-based off-leash sites, so a dog that does well in a fenced run may not be the right fit for a long open trail system.</p><p><strong>2. Treat the leash transition as part of the visit.</strong></p><p>The city specifically requires dogs to be leashed before and after using the off-leash area, which is where many avoidable conflicts happen.</p><p><strong>3. Keep a closer eye on shoreline and habitat edges.</strong></p><p>Burnaby’s parks guidance is unusually explicit about beaches, sensitive habitat, and staying on trail, so free-roaming off-trail behaviour is a poor fit here.</p><p><strong>4. Don’t overload yourself.</strong></p><p>Burnaby caps off-leash handling at two dogs per person, which is a practical control rule, not just a technical one.</p><p><strong>5. Keep the admin side current.</strong></p><p>Burnaby expects dogs over four months old to be licensed and tagged, and that requirement is part of normal public-park use.</p>",
    "Dog Park FAQs": "<p><strong>1. Are dogs allowed off leash anywhere in Burnaby parks?</strong></p><p>No. Burnaby says dogs must stay leashed unless they are in a designated off-leash area.</p><p><strong>2. What are the usual hours for Burnaby off-leash areas?</strong></p><p>Unless otherwise noted, the city says its dog off-leash areas are open from dawn to dusk.</p><p><strong>3. Does Burnaby have both fenced and trail-based off-leash options?</strong></p><p>Yes. Confederation Park includes fenced enclosures and an off-leash loop trail, while places like Burnaby Fraser Foreshore and Robert Burnaby Park include more open trail-style access.</p><p><strong>4. Do Burnaby dogs need a licence?</strong></p><p>Yes. The city says every Burnaby dog over four months old must have a valid licence and wear the city tag on its collar.</p><p><strong>5. How many dogs can one person handle in a Burnaby off-leash area?</strong></p><p>Burnaby’s off-leash rules set a maximum of two dogs per person.</p><p><strong>6. Who handles dog complaints or animal-control issues in Burnaby?</strong></p><p>The City of Burnaby Animal Control Office lists 604-294-7944 and says it handles barking dogs, dog bites and attacks, stray-animal assistance, and related issues seven days a week from 9 a.m. to 5 p.m.</p>",
    "Nearby Cities": "New Westminster, Coquitlam, Vancouver",
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
  const pageIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/burnaby/")];
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

console.log("Updated Burnaby city page and refreshed backlog files.");
