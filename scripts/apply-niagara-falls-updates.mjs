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
  if (source.includes('"niagara-falls": "/images/cities/city-niagara-falls-hero.png"')) return;
  const anchor = '  "montreal": "/images/cities/city-montreal-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "niagara-falls": "/images/cities/city-niagara-falls-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "niagara-falls");
  if (!city) throw new Error("Niagara Falls city record not found.");

  const intro = "<p>Niagara Falls is a good case for tightening page claims to match official sources. The City of Niagara Falls now publishes a dedicated off-leash dog parks page that clearly says the city has two off-leash parks, not several. It also publishes current rule language, animal-control enforcement context, dog-licensing fees, and current penalty amounts, which is enough to replace generic copy with something factually grounded.</p>";
  const about = "<p>The previous Niagara Falls page overstated the city-wide off-leash network and named unsupported locations. The current official off-leash dog parks page says Niagara Falls has two off-leash parks: Niagara Falls Dog Park in the north end at Firemen's Park, 2275 Dorchester Road, and Niagara Falls Bark Park in the south end at the Niagara Falls Humane Society, 6025 Chippawa Parkway. The city says both parks are open daily from dawn to dusk all year round, with walking paths maintained in winter, and it reserves the right to close them during maintenance or special events.</p><p>The city's current rule set is also specific. Niagara Falls says all dogs using the parks must have valid licence tags and up-to-date vaccinations such as rabies, and staff or the humane society may inspect tags or health status. The city limits handlers to three dogs, requires verbal control, bars dogs under four months, sick or injured dogs, female dogs in heat, and aggressive dogs, and requires owners to use the designated small or large dog areas based on dog size. Outside the parks, the city's by-law and enforcement pages point residents to Animal Control By-law 2019-35. The current fines page also gives concrete current penalty amounts, including $100 for failing to register or renew a dog, $150 for permitting a dog to run at large, and $150 for keeping more than three dogs over ten weeks of age on a premises.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> The city says walking paths in the dog parks are maintained in winter, but snow and ice can still affect traction and paw comfort.</li><li><strong>Spring:</strong> Wet turf and muddy entries are common during thaw, especially at larger multi-use park settings like Firemen's Park.</li><li><strong>Summer:</strong> Niagara Falls can be humid, so early-morning and evening visits are usually easier on active dogs.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer visits, but shorter daylight matters because the parks operate from dawn to dusk.</li></ul>";
  const parkRules = "<p><strong>Use one of the two official parks:</strong> Niagara Falls currently publishes Niagara Falls Dog Park at Firemen's Park and Niagara Falls Bark Park on Chippawa Parkway.</p><p><strong>Follow the current operating hours:</strong> the city says both off-leash parks are open daily from dawn to dusk, all year round.</p><p><strong>Bring a licensed, vaccinated dog only:</strong> the city says all dogs must have valid licence tags and up-to-date vaccinations such as rabies.</p><p><strong>Keep control and respect the dog limit:</strong> Niagara Falls requires verbal control and allows a maximum of three dogs per owner or handler.</p><p><strong>Know what is prohibited:</strong> the city bars dogs under four months, sick or injured dogs, female dogs in heat, and aggressive dogs, and it also prohibits glass containers, food, toys, smoking, vaping, and alcohol in the parks.</p>";
  const etiquette = "<p><strong>1. Treat Niagara Falls as a two-park system.</strong></p><p>The current city source is explicit that there are two official off-leash parks, one in the north end and one in the south end.</p><p><strong>2. Use the right enclosure for your dog.</strong></p><p>The city instructs owners to use the designated small or large dog areas according to their dog's size.</p><p><strong>3. Keep your dog in sight at all times.</strong></p><p>Niagara Falls emphasizes verbal control and direct supervision rather than casual off-leash use.</p><p><strong>4. Keep transitions clean and controlled.</strong></p><p>Because the city can inspect tags and because dogs must meet health requirements, arrivals and departures should be handled carefully and cleanly.</p><p><strong>5. Expect active enforcement outside the parks too.</strong></p><p>The city publishes current animal-control penalties for unregistered dogs, dogs running at large, feces cleanup failures, and keeping too many dogs on a property.</p>";
  const faqs = "<p><strong>1. How many official off-leash dog parks does Niagara Falls currently publish?</strong></p><p>The city currently says it has two off-leash dog parks.</p><p><strong>2. Where are they?</strong></p><p>The city lists Niagara Falls Dog Park at Firemen's Park, 2275 Dorchester Road, and Niagara Falls Bark Park at 6025 Chippawa Parkway.</p><p><strong>3. What are the current park hours?</strong></p><p>The city says both parks are open daily from dawn to dusk, all year round.</p><p><strong>4. Do dogs need licence tags and vaccinations?</strong></p><p>Yes. Niagara Falls says dogs must have valid licence tags and up-to-date vaccinations, including rabies.</p><p><strong>5. How many dogs can one handler bring?</strong></p><p>The city allows a maximum of three dogs per owner or handler.</p><p><strong>6. What is the current animal-control bylaw reference?</strong></p><p>The city's by-law directory currently lists Animal Control By-law 2019-35.</p>";
  const metaDescription = "Source-backed guide to dog parks in Niagara Falls, Ontario, covering the city's two official off-leash dog parks, current dog-park rules, licensing requirements, operating hours, Animal Control By-law 2019-35, and published penalties.";

  city.seoTitle = "Dog Parks in Niagara Falls, Ontario | Off-Leash Guide";
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
    "Featured Park 1": "niagara-falls-dog-park",
    "Featured Park 2": "niagara-falls-bark-park",
    "Featured Park 3": "firemens-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://niagarafalls.ca/recreation-culture-and-community/parks-trails-and-sports-fields/off-leash-dog-parks/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "St. Catharines, Niagara-on-the-Lake, Welland",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "niagara-falls");
  if (!targetRow) throw new Error("Niagara Falls city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Niagara Falls, Ontario | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Niagara Falls, Ontario, covering the city's two official off-leash dog parks, current dog-park rules, licensing requirements, operating hours, Animal Control By-law 2019-35, and published penalties.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Niagara Falls is a good case for tightening page claims to match official sources. The City of Niagara Falls now publishes a dedicated off-leash dog parks page that clearly says the city has two off-leash parks, not several. It also publishes current rule language, animal-control enforcement context, dog-licensing fees, and current penalty amounts, which is enough to replace generic copy with something factually grounded.</p>",
    "About Section": "<p>The previous Niagara Falls page overstated the city-wide off-leash network and named unsupported locations. The current official off-leash dog parks page says Niagara Falls has two off-leash parks: Niagara Falls Dog Park in the north end at Firemen's Park, 2275 Dorchester Road, and Niagara Falls Bark Park in the south end at the Niagara Falls Humane Society, 6025 Chippawa Parkway. The city says both parks are open daily from dawn to dusk all year round, with walking paths maintained in winter, and it reserves the right to close them during maintenance or special events.</p><p>The city's current rule set is also specific. Niagara Falls says all dogs using the parks must have valid licence tags and up-to-date vaccinations such as rabies, and staff or the humane society may inspect tags or health status. The city limits handlers to three dogs, requires verbal control, bars dogs under four months, sick or injured dogs, female dogs in heat, and aggressive dogs, and requires owners to use the designated small or large dog areas based on dog size. Outside the parks, the city's by-law and enforcement pages point residents to Animal Control By-law 2019-35. The current fines page also gives concrete current penalty amounts, including $100 for failing to register or renew a dog, $150 for permitting a dog to run at large, and $150 for keeping more than three dogs over ten weeks of age on a premises.</p>",
    "Featured Park 1": "niagara-falls-dog-park",
    "Featured Park 2": "niagara-falls-bark-park",
    "Featured Park 3": "firemens-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> The city says walking paths in the dog parks are maintained in winter, but snow and ice can still affect traction and paw comfort.</li><li><strong>Spring:</strong> Wet turf and muddy entries are common during thaw, especially at larger multi-use park settings like Firemen's Park.</li><li><strong>Summer:</strong> Niagara Falls can be humid, so early-morning and evening visits are usually easier on active dogs.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer visits, but shorter daylight matters because the parks operate from dawn to dusk.</li></ul>",
    "Park Rules": "<p><strong>Use one of the two official parks:</strong> Niagara Falls currently publishes Niagara Falls Dog Park at Firemen's Park and Niagara Falls Bark Park on Chippawa Parkway.</p><p><strong>Follow the current operating hours:</strong> the city says both off-leash parks are open daily from dawn to dusk, all year round.</p><p><strong>Bring a licensed, vaccinated dog only:</strong> the city says all dogs must have valid licence tags and up-to-date vaccinations such as rabies.</p><p><strong>Keep control and respect the dog limit:</strong> Niagara Falls requires verbal control and allows a maximum of three dogs per owner or handler.</p><p><strong>Know what is prohibited:</strong> the city bars dogs under four months, sick or injured dogs, female dogs in heat, and aggressive dogs, and it also prohibits glass containers, food, toys, smoking, vaping, and alcohol in the parks.</p>",
    "City Website": "https://niagarafalls.ca/recreation-culture-and-community/parks-trails-and-sports-fields/off-leash-dog-parks/",
    "Dog Park Etiquettes": "<p><strong>1. Treat Niagara Falls as a two-park system.</strong></p><p>The current city source is explicit that there are two official off-leash parks, one in the north end and one in the south end.</p><p><strong>2. Use the right enclosure for your dog.</strong></p><p>The city instructs owners to use the designated small or large dog areas according to their dog's size.</p><p><strong>3. Keep your dog in sight at all times.</strong></p><p>Niagara Falls emphasizes verbal control and direct supervision rather than casual off-leash use.</p><p><strong>4. Keep transitions clean and controlled.</strong></p><p>Because the city can inspect tags and because dogs must meet health requirements, arrivals and departures should be handled carefully and cleanly.</p><p><strong>5. Expect active enforcement outside the parks too.</strong></p><p>The city publishes current animal-control penalties for unregistered dogs, dogs running at large, feces cleanup failures, and keeping too many dogs on a property.</p>",
    "Dog Park FAQs": "<p><strong>1. How many official off-leash dog parks does Niagara Falls currently publish?</strong></p><p>The city currently says it has two off-leash dog parks.</p><p><strong>2. Where are they?</strong></p><p>The city lists Niagara Falls Dog Park at Firemen's Park, 2275 Dorchester Road, and Niagara Falls Bark Park at 6025 Chippawa Parkway.</p><p><strong>3. What are the current park hours?</strong></p><p>The city says both parks are open daily from dawn to dusk, all year round.</p><p><strong>4. Do dogs need licence tags and vaccinations?</strong></p><p>Yes. Niagara Falls says dogs must have valid licence tags and up-to-date vaccinations, including rabies.</p><p><strong>5. How many dogs can one handler bring?</strong></p><p>The city allows a maximum of three dogs per owner or handler.</p><p><strong>6. What is the current animal-control bylaw reference?</strong></p><p>The city's by-law directory currently lists Animal Control By-law 2019-35.</p>",
    "Nearby Cities": "St. Catharines, Niagara-on-the-Lake, Welland",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/niagara-falls/")];
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

console.log("Updated Niagara Falls city page and refreshed backlog files.");
