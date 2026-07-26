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

  const intro = "<p>Belleville's official parks and trails material points dog owners to East Zwick's Park for the city's designated off-leash amenity. The City of Belleville's facilities directory lists East Zwick's Park with an off leash dog park, trail access, seasonal washrooms, and posted hours of 6 a.m. to dusk.</p>";
  const about = "<p>Belleville's current public information gives dog owners a clearer picture than the old generic copy. On the city's facilities site, East Zwick's Park is identified as the municipal park with an off leash dog park amenity. The city's Trails and Paths page also highlights an off-leash dog park at East Zwick's Park along the Zwick's Park Trail, which connects waterfront green space, picnic areas, sports fields, and rest areas.</p><p>The city's animal-control rules add the operating framework around that park access. Belleville requires dogs to be licensed, prohibits dogs from running at large, and requires owners to keep the dog tag securely fixed on the dog except in the limited hunting exception stated in the bylaw. The city's dog-tag and rates pages confirm that dogs over three months old must be registered and show the 2026 licence fees, which means dog owners can check both compliance requirements and the main off-leash location from official city sources before heading out.</p>";
  const seasonalTips = "<p>- Winter: East Zwick's remains part of Belleville's waterfront park system, so wind exposure and icy surfaces can change how comfortable a visit feels even when the park is open.<br>- Spring: Thaw and rain can soften grassy sections and trail edges around Zwick's Park, so expect mud near entries and along connecting paths.<br>- Summer: Early morning or evening visits are usually more comfortable because the posted park hours begin at 6 a.m. and run until dusk.<br>- Fall: Cooler temperatures are good for longer walks on the Zwick's Park Trail, but shorter daylight still matters because the listed park hours end at dusk.</p>";
  const parkRules = "<p><strong>Use the designated off-leash area only:</strong> Belleville's trail guidance says dogs should stay on leash except in designated off-leash areas, and East Zwick's Park is the city location specifically listed with that amenity.</p><p><strong>Licensing is required:</strong> Belleville requires dog licensing, and the city says all dogs over three months old must be registered and have a valid dog tag.</p><p><strong>No running at large:</strong> the animal-control bylaw states that no owner shall cause or permit a dog to run at large, so control outside the designated off-leash area still matters.</p><p><strong>Waste and shared-use etiquette still apply:</strong> the city trail guidance tells users to dispose of pet waste properly and keep dogs leashed outside designated off-leash spaces.</p>";
  const etiquette = "<p><strong>1. Treat East Zwick's as the confirmed city off-leash option.</strong></p><p>The city's current facilities and trails pages explicitly identify East Zwick's Park with an off-leash dog park amenity, so it is the safest official starting point for Belleville dog owners.</p><p><strong>2. Use the trail network responsibly.</strong></p><p>Zwick's Park connects to a well-used trail loop, so leash your dog before leaving the designated off-leash area and be ready for walkers and cyclists nearby.</p><p><strong>3. Keep tags current and visible.</strong></p><p>Belleville's bylaw requires the dog tag to stay securely fixed on the dog, which makes compliance easy to check before you leave home.</p><p><strong>4. Plan around dusk, not late-night assumptions.</strong></p><p>The city lists East Zwick's Park hours as 6 a.m. to dusk, so avoid relying on informal after-hours use.</p><p><strong>5. Clean up every time.</strong></p><p>The city's trail safety guidance specifically calls for proper pet-waste disposal, which is basic etiquette and part of keeping shared park space usable.</p>";
  const faqs = "<p><strong>1. Where is Belleville's official off-leash dog park amenity?</strong></p><p>The City of Belleville's facilities directory lists an off leash dog park at East Zwick's Park, 11 Bay Bridge Rd.</p><p><strong>2. What hours does East Zwick's Park list?</strong></p><p>The city's park details page lists the hours as 6 a.m. to dusk.</p><p><strong>3. Do dogs need a city licence in Belleville?</strong></p><p>Yes. Belleville says all dogs over the age of three months must be registered with the city and have a valid dog tag.</p><p><strong>4. What are Belleville's 2026 dog-tag fees?</strong></p><p>The city's 2026 rates list $50 for an intact dog tag, $30 for a spayed or neutered dog tag, and discounted senior rates of $40 and $20 respectively for owners 65 and older.</p><p><strong>5. Can dogs be off leash on Belleville trails in general?</strong></p><p>No. The city says dogs should be kept on leash except in designated off-leash areas.</p><p><strong>6. Who handles animal-control complaints?</strong></p><p>The city says animal control is overseen by Pierce Animal Control Services, with complaints and inquiries accepted through the live answering service listed on Belleville's bylaw page.</p>";
  const metaDescription = "Find Belleville dog park rules, East Zwick's Park hours, and current dog-licensing details from official city sources. This Belleville guide focuses on the city's confirmed off-leash park access and owner requirements.";

  city.seoTitle = "Dog Parks in Belleville, Ontario | Off-Leash Guide";
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
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
    "SEO Title Tag": "Dog Parks in Belleville, Ontario | Off-Leash Guide",
    "Meta Description": "Find Belleville dog park rules, East Zwick's Park hours, and current dog-licensing details from official city sources. This Belleville guide focuses on the city's confirmed off-leash park access and owner requirements.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Belleville's official parks and trails material points dog owners to East Zwick's Park for the city's designated off-leash amenity. The City of Belleville's facilities directory lists East Zwick's Park with an off leash dog park, trail access, seasonal washrooms, and posted hours of 6 a.m. to dusk.</p>",
    "About Section": "<p>Belleville's current public information gives dog owners a clearer picture than the old generic copy. On the city's facilities site, East Zwick's Park is identified as the municipal park with an off leash dog park amenity. The city's Trails and Paths page also highlights an off-leash dog park at East Zwick's Park along the Zwick's Park Trail, which connects waterfront green space, picnic areas, sports fields, and rest areas.</p><p>The city's animal-control rules add the operating framework around that park access. Belleville requires dogs to be licensed, prohibits dogs from running at large, and requires owners to keep the dog tag securely fixed on the dog except in the limited hunting exception stated in the bylaw. The city's dog-tag and rates pages confirm that dogs over three months old must be registered and show the 2026 licence fees, which means dog owners can check both compliance requirements and the main off-leash location from official city sources before heading out.</p>",
    "Featured Park 1": "east-zwicks-centennial-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<p>- Winter: East Zwick's remains part of Belleville's waterfront park system, so wind exposure and icy surfaces can change how comfortable a visit feels even when the park is open.<br>- Spring: Thaw and rain can soften grassy sections and trail edges around Zwick's Park, so expect mud near entries and along connecting paths.<br>- Summer: Early morning or evening visits are usually more comfortable because the posted park hours begin at 6 a.m. and run until dusk.<br>- Fall: Cooler temperatures are good for longer walks on the Zwick's Park Trail, but shorter daylight still matters because the listed park hours end at dusk.</p>",
    "Park Rules": "<p><strong>Use the designated off-leash area only:</strong> Belleville's trail guidance says dogs should stay on leash except in designated off-leash areas, and East Zwick's Park is the city location specifically listed with that amenity.</p><p><strong>Licensing is required:</strong> Belleville requires dog licensing, and the city says all dogs over three months old must be registered and have a valid dog tag.</p><p><strong>No running at large:</strong> the animal-control bylaw states that no owner shall cause or permit a dog to run at large, so control outside the designated off-leash area still matters.</p><p><strong>Waste and shared-use etiquette still apply:</strong> the city trail guidance tells users to dispose of pet waste properly and keep dogs leashed outside designated off-leash spaces.</p>",
    "City Website": "https://facilities.belleville.ca/Home/Detail?CloseMap=true&FacilityTypeIds=30762&Id=6f161e33-f632-4c8e-b548-771a95049210&Keywords=zwicks&ScrollTo=scroll-map-list-container",
    "Dog Park Etiquettes": "<p><strong>1. Treat East Zwick's as the confirmed city off-leash option.</strong></p><p>The city's current facilities and trails pages explicitly identify East Zwick's Park with an off-leash dog park amenity, so it is the safest official starting point for Belleville dog owners.</p><p><strong>2. Use the trail network responsibly.</strong></p><p>Zwick's Park connects to a well-used trail loop, so leash your dog before leaving the designated off-leash area and be ready for walkers and cyclists nearby.</p><p><strong>3. Keep tags current and visible.</strong></p><p>Belleville's bylaw requires the dog tag to stay securely fixed on the dog, which makes compliance easy to check before you leave home.</p><p><strong>4. Plan around dusk, not late-night assumptions.</strong></p><p>The city lists East Zwick's Park hours as 6 a.m. to dusk, so avoid relying on informal after-hours use.</p><p><strong>5. Clean up every time.</strong></p><p>The city's trail safety guidance specifically calls for proper pet-waste disposal, which is basic etiquette and part of keeping shared park space usable.</p>",
    "Dog Park FAQs": "<p><strong>1. Where is Belleville's official off-leash dog park amenity?</strong></p><p>The City of Belleville's facilities directory lists an off leash dog park at East Zwick's Park, 11 Bay Bridge Rd.</p><p><strong>2. What hours does East Zwick's Park list?</strong></p><p>The city's park details page lists the hours as 6 a.m. to dusk.</p><p><strong>3. Do dogs need a city licence in Belleville?</strong></p><p>Yes. Belleville says all dogs over the age of three months must be registered with the city and have a valid dog tag.</p><p><strong>4. What are Belleville's 2026 dog-tag fees?</strong></p><p>The city's 2026 rates list $50 for an intact dog tag, $30 for a spayed or neutered dog tag, and discounted senior rates of $40 and $20 respectively for owners 65 and older.</p><p><strong>5. Can dogs be off leash on Belleville trails in general?</strong></p><p>No. The city says dogs should be kept on leash except in designated off-leash areas.</p><p><strong>6. Who handles animal-control complaints?</strong></p><p>The city says animal control is overseen by Pierce Animal Control Services, with complaints and inquiries accepted through the live answering service listed on Belleville's bylaw page.</p>",
    "Nearby Cities": "Quinte West, Prince Edward County",
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

updateOverridesFile();
updateCitiesJson();
updateCityCsv();
updateBacklogFiles();

console.log("Updated Belleville city page and refreshed backlog files.");
