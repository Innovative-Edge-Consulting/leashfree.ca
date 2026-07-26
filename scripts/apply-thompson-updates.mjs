import fs from "node:fs";

const citiesPath = "src/data/generated/cities.json";
const parksPath = "src/data/generated/parks.json";
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
  if (source.includes('"thompson": "/images/cities/city-thompson-hero.png"')) return;
  const updated = source.replace(
    '  "stouffville": "/images/cities/city-stouffville-hero.png",\n',
    '  "stouffville": "/images/cities/city-stouffville-hero.png",\n  "thompson": "/images/cities/city-thompson-hero.png",\n'
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "baffin-dog-park");
  if (!park) return;

  park.city = "Thompson";
  park.province = "Manitoba";
  park.address = "Baffin Crescent";
  park.lat = 55.7434;
  park.lng = -97.8578;

  fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "thompson");
  if (!city) throw new Error("Thompson city record not found.");

  const intro = "<p>Thompson’s official parks list currently names one city off-leash site: Baffin Dog Park. The City of Thompson lists it in its Parks &amp; Trails directory as a grassed park, and the city’s animal-control bylaw sets the rules that apply whenever dogs use a designated off-leash dog park.</p>";
  const about = "<p>For dog owners in Thompson, the key local fact is that the city has an officially designated off-leash area rather than a broad network of separate dog parks. The City of Thompson’s parks directory includes Baffin Dog Park in its municipal park inventory, and the animal-control bylaw defines an off-leash dog park as an area designated by the city where dogs are not required to be restrained by leashes.</p><p>That same bylaw gives a much clearer picture of expected behaviour than the old generic page copy did. Owners must stay present with their dogs in view, keep dogs under control by verbal command, carry a leash, remove dogs that behave aggressively, fill in holes, and clean up excrement immediately. Thompson also requires dogs to be licensed, to wear their current licence tag when off the owner’s property, and to have rabies vaccination kept current. The city’s Pets &amp; Animals page confirms that dogs and cats over four months old must be registered and shows the current 2026 registration fees.</p>";
  const seasonalTips = "<p>- Winter: Thompson’s off-leash use continues through long northern winters, but ice, packed snow, and extreme temperatures mean visits are usually shorter and more deliberate.<br>- Spring: Thaw can soften grassed surfaces and create muddy spots around entrances and high-traffic routes.<br>- Summer: Bring water even if your dog only needs a short run, and keep wildlife awareness in mind in Thompson’s northern setting.<br>- Fall: Cooler weather is often ideal for active dogs, but shorter daylight makes it smart to go earlier since the city does not advertise late-night lighting for the park.</p>";
  const parkRules = "<p><strong>City designation matters:</strong> dogs may be off leash only in an area designated by the City of Thompson as an off-leash dog park.</p><p><strong>Owner responsibilities in the off-leash park:</strong> the bylaw requires owners to be present with their dog in view, maintain control by verbal command, have a leash available, remove aggressive dogs immediately, repair holes dug by dogs, and clean up waste right away.</p><p><strong>Licensing and vaccinations:</strong> Thompson requires dog licensing, current dog tags when the dog is off the owner’s property, and rabies vaccination kept current. The city’s 2026 pet-registration page lists fees and explains how to file the licence form with proof of rabies vaccination.</p>";
  const etiquette = "<p><strong>1. Stay inside the city’s off-leash rules.</strong></p><p>Thompson’s bylaw is explicit that off-leash privileges apply only in designated off-leash dog parks.</p><p><strong>2. Use voice control honestly.</strong></p><p>If your dog does not reliably respond to verbal command, the bylaw says the dog must be leashed and removed from the park.</p><p><strong>3. Do not wait too long to intervene.</strong></p><p>Owners must remove a dog immediately if it acts in a dangerous or aggressive manner toward people or other dogs.</p><p><strong>4. Leave the surface better than you found it.</strong></p><p>Thompson specifically requires owners to remedy harm caused by the dog, including filling holes and cleaning up excrement immediately.</p><p><strong>5. Keep paperwork current.</strong></p><p>Licensing and rabies compliance are not optional extras in Thompson; they are part of the city’s animal-control framework.</p>";
  const faqs = "<p><strong>1. Does Thompson have an official off-leash dog park?</strong></p><p>Yes. The City of Thompson’s parks directory lists Baffin Dog Park as part of the city park system.</p><p><strong>2. What does the city call an off-leash dog park?</strong></p><p>Thompson’s animal-control bylaw defines it as an area designated by the City of Thompson where dogs are not required to be restrained by leashes.</p><p><strong>3. Do I need to stay with my dog in the off-leash park?</strong></p><p>Yes. Owners must be present and have the dog within view at all times.</p><p><strong>4. What if my dog is not under verbal control?</strong></p><p>The bylaw says the dog must be leashed and removed from the park if control cannot be maintained.</p><p><strong>5. Does Thompson require dog licences?</strong></p><p>Yes. The city requires dogs more than four months old to be registered, and licensed dogs must wear their current tag when off the owner’s property.</p><p><strong>6. Are rabies vaccinations required?</strong></p><p>Yes. Thompson requires dogs to be vaccinated against rabies, with repeat vaccination intervals of no more than three years.</p>";
  const metaDescription = "Find Thompson dog park rules, licensing fees, and official city guidance for Baffin Dog Park. This source-backed guide covers Thompson’s designated off-leash dog-park option and current owner requirements.";

  city.seoTitle = "Dog Parks in Thompson, Manitoba | Off-Leash Guide";
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
    "Featured Park 1": "baffin-dog-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.thompson.ca/p/parks-trails",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "The Pas, Flin Flon",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "thompson");
  if (!targetRow) throw new Error("Thompson city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Thompson, Manitoba | Off-Leash Guide",
    "Meta Description": "Find Thompson dog park rules, licensing fees, and official city guidance for Baffin Dog Park. This source-backed guide covers Thompson’s designated off-leash dog-park option and current owner requirements.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Thompson’s official parks list currently names one city off-leash site: Baffin Dog Park. The City of Thompson lists it in its Parks &amp; Trails directory as a grassed park, and the city’s animal-control bylaw sets the rules that apply whenever dogs use a designated off-leash dog park.</p>",
    "About Section": "<p>For dog owners in Thompson, the key local fact is that the city has an officially designated off-leash area rather than a broad network of separate dog parks. The City of Thompson’s parks directory includes Baffin Dog Park in its municipal park inventory, and the animal-control bylaw defines an off-leash dog park as an area designated by the city where dogs are not required to be restrained by leashes.</p><p>That same bylaw gives a much clearer picture of expected behaviour than the old generic page copy did. Owners must stay present with their dogs in view, keep dogs under control by verbal command, carry a leash, remove dogs that behave aggressively, fill in holes, and clean up excrement immediately. Thompson also requires dogs to be licensed, to wear their current licence tag when off the owner’s property, and to have rabies vaccination kept current. The city’s Pets &amp; Animals page confirms that dogs and cats over four months old must be registered and shows the current 2026 registration fees.</p>",
    "Featured Park 1": "baffin-dog-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<p>- Winter: Thompson’s off-leash use continues through long northern winters, but ice, packed snow, and extreme temperatures mean visits are usually shorter and more deliberate.<br>- Spring: Thaw can soften grassed surfaces and create muddy spots around entrances and high-traffic routes.<br>- Summer: Bring water even if your dog only needs a short run, and keep wildlife awareness in mind in Thompson’s northern setting.<br>- Fall: Cooler weather is often ideal for active dogs, but shorter daylight makes it smart to go earlier since the city does not advertise late-night lighting for the park.</p>",
    "Park Rules": "<p><strong>City designation matters:</strong> dogs may be off leash only in an area designated by the City of Thompson as an off-leash dog park.</p><p><strong>Owner responsibilities in the off-leash park:</strong> the bylaw requires owners to be present with their dog in view, maintain control by verbal command, have a leash available, remove aggressive dogs immediately, repair holes dug by dogs, and clean up waste right away.</p><p><strong>Licensing and vaccinations:</strong> Thompson requires dog licensing, current dog tags when the dog is off the owner’s property, and rabies vaccination kept current. The city’s 2026 pet-registration page lists fees and explains how to file the licence form with proof of rabies vaccination.</p>",
    "City Website": "https://www.thompson.ca/p/parks-trails",
    "Dog Park Etiquettes": "<p><strong>1. Stay inside the city’s off-leash rules.</strong></p><p>Thompson’s bylaw is explicit that off-leash privileges apply only in designated off-leash dog parks.</p><p><strong>2. Use voice control honestly.</strong></p><p>If your dog does not reliably respond to verbal command, the bylaw says the dog must be leashed and removed from the park.</p><p><strong>3. Do not wait too long to intervene.</strong></p><p>Owners must remove a dog immediately if it acts in a dangerous or aggressive manner toward people or other dogs.</p><p><strong>4. Leave the surface better than you found it.</strong></p><p>Thompson specifically requires owners to remedy harm caused by the dog, including filling holes and cleaning up excrement immediately.</p><p><strong>5. Keep paperwork current.</strong></p><p>Licensing and rabies compliance are not optional extras in Thompson; they are part of the city’s animal-control framework.</p>",
    "Dog Park FAQs": "<p><strong>1. Does Thompson have an official off-leash dog park?</strong></p><p>Yes. The City of Thompson’s parks directory lists Baffin Dog Park as part of the city park system.</p><p><strong>2. What does the city call an off-leash dog park?</strong></p><p>Thompson’s animal-control bylaw defines it as an area designated by the City of Thompson where dogs are not required to be restrained by leashes.</p><p><strong>3. Do I need to stay with my dog in the off-leash park?</strong></p><p>Yes. Owners must be present and have the dog within view at all times.</p><p><strong>4. What if my dog is not under verbal control?</strong></p><p>The bylaw says the dog must be leashed and removed from the park if control cannot be maintained.</p><p><strong>5. Does Thompson require dog licences?</strong></p><p>Yes. The city requires dogs more than four months old to be registered, and licensed dogs must wear their current tag when off the owner’s property.</p><p><strong>6. Are rabies vaccinations required?</strong></p><p>Yes. Thompson requires dogs to be vaccinated against rabies, with repeat vaccination intervals of no more than three years.</p>",
    "Nearby Cities": "The Pas, Flin Flon",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/thompson/")];
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
updateParksJson();
updateCitiesJson();
updateCityCsv();
updateBacklogFiles();

console.log("Updated Thompson city page, normalized Baffin Dog Park linkage, and refreshed backlog files.");
