import fs from "node:fs";

const citiesPath = "src/data/generated/cities.json";
const overridesPath = "src/data/dog-park-image-overrides.js";
const cityCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const backlogCsvPath = "reports/thin-page-backlog.csv";
const reviewQueueCsvPath = "reports/content-review-queue.csv";
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
  if (source.includes('"belleville": "/images/cities/city-belleville-hero.png"')) return;
  const updated = source.replace(
    '  "battleford": "/images/dog-parks/battleford-original.png",\n',
    '  "battleford": "/images/dog-parks/battleford-original.png",\n  "belleville": "/images/cities/city-belleville-hero.png",\n'
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "belleville");
  if (!city) throw new Error("Belleville city record not found.");

  const intro = "<p>As of Friday, August 14, 2026, Belleville's strongest official dog-park guidance still centers on East Zwick's Park rather than a broad network of named off-leash sites. The city's facilities directory lists East Zwick's Park with an off leash dog park, seasonal washrooms, trail access, and posted hours from 6 a.m. to dusk, which gives this page a much firmer source base than the old generic city draft.</p>";
  const about = "<p>Belleville's current public information is narrow but usable. On the city's facilities site, East Zwick's Park at 11 Bay Bridge Road is identified as the municipal park with an off leash dog park amenity. The city's Trails and Paths page also places that off-leash amenity along the Zwick's Park Trail, a waterfront route with green space, sports fields, picnic areas, and rest stops nearby. That means the city guide should stay disciplined: treat Belleville as a city with one clearly documented off-leash park access point instead of padding the page with unsupported extra locations.</p><p>The city adds clear ownership rules around that park use. Belleville's animal-control pages say dogs over three months old must be registered, dog tags must stay securely fixed on the dog, and owners cannot let dogs run at large outside permitted spaces. The trails guidance also says dogs should remain on leash except in designated off-leash areas and that owners must clean up after them. The current city rates page keeps the licensing side practical with 2026 fees of $50 for intact dogs, $30 for spayed or neutered dogs, and reduced senior rates of $40 and $20. That combination of one confirmed off-leash park plus straightforward licensing and leash rules is the real local value of the Belleville page.</p>";
  const seasonalTips = "<p>- Winter: East Zwick's sits in Belleville's waterfront park system, so wind, ice, and exposed paved sections can change footing even when the park remains open.<br>- Spring: thaw and rain can soften grassy sections and trail edges around Zwick's Park, especially near the waterfront route.<br>- Summer: the listed 6 a.m. to dusk hours make early morning and evening visits the most practical warm-weather windows.<br>- Fall: cooler temperatures are strong for longer trail walks, but dusk arrives earlier, so plan around the posted closing time rather than informal after-hours use.</p>";
  const parkRules = "<p><strong>Use the designated off-leash amenity only:</strong> Belleville's trail guidance says dogs should stay on leash except in designated off-leash areas, and East Zwick's Park is the city location currently identified with that amenity.</p><p><strong>Keep dogs licensed and tagged:</strong> Belleville says dogs over three months old must be registered and have a valid dog tag securely fixed on the dog.</p><p><strong>Do not let dogs run at large outside permitted areas:</strong> the city's animal-control rules prohibit owners from allowing a dog to run at large.</p><p><strong>Clean up and manage shared trail use:</strong> the trails guidance tells users to dispose of pet waste properly and keep dogs leashed outside the designated off-leash space.</p>";
  const etiquette = "<p><strong>1. Treat Belleville as a one-site city unless the municipality publishes more.</strong></p><p>East Zwick's Park is the clearly documented municipal off-leash location, so this page should stay anchored to that source instead of inflating the city with unverified park claims.</p><p><strong>2. Use the off-leash area, then leash up for the trail system.</strong></p><p>Zwick's Park connects to a busy waterfront trail network, so transition back to leash control before moving into shared walking space.</p><p><strong>3. Do not treat city licensing as optional admin.</strong></p><p>Belleville requires registration for dogs over three months old, and the tag must stay attached to the dog.</p><p><strong>4. Plan around posted hours.</strong></p><p>The facilities page lists East Zwick's Park hours as 6 a.m. to dusk, which is more reliable than assuming late-night access.</p><p><strong>5. Keep the page factual and local.</strong></p><p>The real quality gain here is precision: one confirmed site, current fees, and clear leash expectations.</p>";
  const faqs = "<p><strong>1. Where is Belleville's official off-leash dog park amenity?</strong></p><p>The City of Belleville's facilities directory lists an off leash dog park at East Zwick's Park, 11 Bay Bridge Rd.</p><p><strong>2. What hours does East Zwick's Park list?</strong></p><p>The current park details page lists the hours as 6 a.m. to dusk.</p><p><strong>3. Do dogs need a city licence in Belleville?</strong></p><p>Yes. Belleville says dogs over the age of three months must be registered with the city and have a valid dog tag.</p><p><strong>4. What are Belleville's current 2026 dog-tag fees?</strong></p><p>As of Friday, August 14, 2026, the city rates page lists $50 for an intact dog tag, $30 for a spayed or neutered dog tag, and senior rates of $40 and $20 respectively for owners aged 65 and older.</p><p><strong>5. Can dogs be off leash on Belleville trails in general?</strong></p><p>No. The city says dogs should be kept on leash except in designated off-leash areas.</p><p><strong>6. What is the safest way to describe Belleville's off-leash system?</strong></p><p>Based on current city sources, Belleville is best described as a city with one clearly documented municipal off-leash park amenity at East Zwick's Park.</p>";
  const metaDescription = "Source-backed guide to Belleville dog parks and off-leash rules, covering East Zwick's Park hours, current 2026 dog-tag fees, trail etiquette, and the city's documented leash requirements.";

  city.seoTitle = "Belleville Dog Parks and Off-Leash Rules | LeashFree.ca";
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
    "Featured Park 1": "east-zwicks-centennial-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://facilities.belleville.ca/Home/Detail?CloseMap=true&FacilityTypeIds=30762&Id=6f161e33-f632-4c8e-b548-771a95049210&Keywords=zwicks&ScrollTo=scroll-map-list-container",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Quinte West, Prince Edward County",
    "Updated On": "Fri Aug 14 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Fri Aug 14 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "belleville");
  if (!targetRow) throw new Error("Belleville city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Belleville Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to Belleville dog parks and off-leash rules, covering East Zwick's Park hours, current 2026 dog-tag fees, trail etiquette, and the city's documented leash requirements.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Friday, August 14, 2026, Belleville's strongest official dog-park guidance still centers on East Zwick's Park rather than a broad network of named off-leash sites. The city's facilities directory lists East Zwick's Park with an off leash dog park, seasonal washrooms, trail access, and posted hours from 6 a.m. to dusk, which gives this page a much firmer source base than the old generic city draft.</p>",
    "About Section": "<p>Belleville's current public information is narrow but usable. On the city's facilities site, East Zwick's Park at 11 Bay Bridge Road is identified as the municipal park with an off leash dog park amenity. The city's Trails and Paths page also places that off-leash amenity along the Zwick's Park Trail, a waterfront route with green space, sports fields, picnic areas, and rest stops nearby. That means the city guide should stay disciplined: treat Belleville as a city with one clearly documented off-leash park access point instead of padding the page with unsupported extra locations.</p><p>The city adds clear ownership rules around that park use. Belleville's animal-control pages say dogs over three months old must be registered, dog tags must stay securely fixed on the dog, and owners cannot let dogs run at large outside permitted spaces. The trails guidance also says dogs should remain on leash except in designated off-leash areas and that owners must clean up after them. The current city rates page keeps the licensing side practical with 2026 fees of $50 for intact dogs, $30 for spayed or neutered dogs, and reduced senior rates of $40 and $20. That combination of one confirmed off-leash park plus straightforward licensing and leash rules is the real local value of the Belleville page.</p>",
    "Featured Park 1": "east-zwicks-centennial-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<p>- Winter: East Zwick's sits in Belleville's waterfront park system, so wind, ice, and exposed paved sections can change footing even when the park remains open.<br>- Spring: thaw and rain can soften grassy sections and trail edges around Zwick's Park, especially near the waterfront route.<br>- Summer: the listed 6 a.m. to dusk hours make early morning and evening visits the most practical warm-weather windows.<br>- Fall: cooler temperatures are strong for longer trail walks, but dusk arrives earlier, so plan around the posted closing time rather than informal after-hours use.</p>",
    "Park Rules": "<p><strong>Use the designated off-leash amenity only:</strong> Belleville's trail guidance says dogs should stay on leash except in designated off-leash areas, and East Zwick's Park is the city location currently identified with that amenity.</p><p><strong>Keep dogs licensed and tagged:</strong> Belleville says dogs over three months old must be registered and have a valid dog tag securely fixed on the dog.</p><p><strong>Do not let dogs run at large outside permitted areas:</strong> the city's animal-control rules prohibit owners from allowing a dog to run at large.</p><p><strong>Clean up and manage shared trail use:</strong> the trails guidance tells users to dispose of pet waste properly and keep dogs leashed outside the designated off-leash space.</p>",
    "City Website": "https://facilities.belleville.ca/Home/Detail?CloseMap=true&FacilityTypeIds=30762&Id=6f161e33-f632-4c8e-b548-771a95049210&Keywords=zwicks&ScrollTo=scroll-map-list-container",
    "Dog Park Etiquettes": "<p><strong>1. Treat Belleville as a one-site city unless the municipality publishes more.</strong></p><p>East Zwick's Park is the clearly documented municipal off-leash location, so this page should stay anchored to that source instead of inflating the city with unverified park claims.</p><p><strong>2. Use the off-leash area, then leash up for the trail system.</strong></p><p>Zwick's Park connects to a busy waterfront trail network, so transition back to leash control before moving into shared walking space.</p><p><strong>3. Do not treat city licensing as optional admin.</strong></p><p>Belleville requires registration for dogs over three months old, and the tag must stay attached to the dog.</p><p><strong>4. Plan around posted hours.</strong></p><p>The facilities page lists East Zwick's Park hours as 6 a.m. to dusk, which is more reliable than assuming late-night access.</p><p><strong>5. Keep the page factual and local.</strong></p><p>The real quality gain here is precision: one confirmed site, current fees, and clear leash expectations.</p>",
    "Dog Park FAQs": "<p><strong>1. Where is Belleville's official off-leash dog park amenity?</strong></p><p>The City of Belleville's facilities directory lists an off leash dog park at East Zwick's Park, 11 Bay Bridge Rd.</p><p><strong>2. What hours does East Zwick's Park list?</strong></p><p>The current park details page lists the hours as 6 a.m. to dusk.</p><p><strong>3. Do dogs need a city licence in Belleville?</strong></p><p>Yes. Belleville says dogs over the age of three months must be registered with the city and have a valid dog tag.</p><p><strong>4. What are Belleville's current 2026 dog-tag fees?</strong></p><p>As of Friday, August 14, 2026, the city rates page lists $50 for an intact dog tag, $30 for a spayed or neutered dog tag, and senior rates of $40 and $20 respectively for owners aged 65 and older.</p><p><strong>5. Can dogs be off leash on Belleville trails in general?</strong></p><p>No. The city says dogs should be kept on leash except in designated off-leash areas.</p><p><strong>6. What is the safest way to describe Belleville's off-leash system?</strong></p><p>Based on current city sources, Belleville is best described as a city with one clearly documented municipal off-leash park amenity at East Zwick's Park.</p>",
    "Nearby Cities": "Quinte West, Prince Edward County",
    "Updated On": "Fri Aug 14 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Fri Aug 14 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/belleville/")];
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

function updateReviewQueue() {
  const rows = parseCsv(fs.readFileSync(reviewQueueCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/belleville/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateCitiesJson();
updateCityCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Belleville city page and refreshed backlog files.");
