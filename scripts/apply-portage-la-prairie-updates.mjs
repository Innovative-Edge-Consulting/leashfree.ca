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
  if (source.includes('"portage-la-prairie": "/images/cities/city-portage-la-prairie-hero.png"')) return;
  const updated = source.replace(
    '  "prince-albert": "/images/dog-parks/prince-albert-original.png",\n',
    '  "prince-albert": "/images/dog-parks/prince-albert-original.png",\n  "portage-la-prairie": "/images/cities/city-portage-la-prairie-hero.png",\n'
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "portage-la-prairie");
  if (!city) throw new Error("Portage la Prairie city record not found.");

  const intro = "<p>Portage la Prairie is a good example of a city page that needed source cleanup more than generic expansion. The City of Portage la Prairie publishes current licensing, animal-control, and bylaw details, while Manitoba's provincial parks guidance confirms that the fenced area at Yellow Quill Provincial Park is a designated off-leash area. That gives this page a stronger factual base than the older copy it replaces.</p>";
  const about = "<p>The previous Portage la Prairie page made several specific amenity claims about a city off-leash park in the north end, but the current official source set points in a different direction. The City of Portage la Prairie's current animal-services pages clearly explain that animal control is regulated by Animal Control By-Law 21-8721 and that dogs over six months old kept within city limits must hold a city-issued licence. The city also says proof of current rabies vaccination is required for licensing, and its current pet-licence page says licences are free when registered between January and March.</p><p>For the actual off-leash destination, the strongest current official source is provincial rather than municipal. Manitoba's current Paws in Parks guidance lists Yellow Quill Provincial Park as an off-leash area and specifically says the fenced-in area of Yellow Quill Provincial Park is designated for off-leash use. The provincial park regulation also makes the baseline rule clear: animals in provincial parks must otherwise be on a leash, harness, or under direct physical control unless they are in a posted off-leash area or trail. That means Portage dog owners should think in two layers: city licensing and animal-control compliance inside Portage la Prairie, plus provincial off-leash boundary rules when using Yellow Quill.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Open prairie exposure can mean harder wind and packed snow at Yellow Quill, so shorter sessions and paw protection may matter.</li><li><strong>Spring:</strong> Thaw conditions can soften grass and entrances around fenced off-leash areas, so expect mud and bring towels.</li><li><strong>Summer:</strong> Bring your own water and plan for limited natural shade in a more open Manitoba park setting.</li><li><strong>Fall:</strong> Cooler temperatures are often ideal for longer off-leash exercise, but shorter daylight makes earlier visits easier.</li></ul>";
  const parkRules = "<p><strong>City licensing still applies:</strong> Portage la Prairie says dogs over six months old kept within city limits must have a city-issued licence, and proof of current rabies vaccination is required when registering.</p><p><strong>Watch the registration timing:</strong> the city's current pet-licence page says licences are free if completed between January and March, with later fees set by the current fees and charges schedule.</p><p><strong>Use only the designated off-leash boundary at Yellow Quill:</strong> Manitoba's current parks guidance says the fenced-in area of Yellow Quill Provincial Park is the designated off-leash area.</p><p><strong>Assume leash control everywhere else:</strong> Manitoba's park regulation says animals in provincial parks must otherwise be on a leash, harness, or under direct physical control unless the area is specifically designated off leash.</p><p><strong>Expect enforcement for city rule breaches:</strong> Portage la Prairie's current FAQ lists common bylaw fines including unlicensed pets, animals at large, failure to remove defecation, and failure to control or leash a dog, starting at $130 for a first offence.</p>";
  const etiquette = "<p><strong>1. Treat this as a city-plus-province visit.</strong></p><p>Portage la Prairie governs licensing and local animal-control compliance, but the off-leash destination itself is best supported by Manitoba provincial park guidance.</p><p><strong>2. Keep licensing current before relying on the park.</strong></p><p>The city requires dogs over six months old to be licensed and asks for proof of current rabies vaccination when owners register.</p><p><strong>3. Stay inside the posted off-leash boundary.</strong></p><p>Manitoba's current wording is specific to the fenced-in area at Yellow Quill, not the whole park.</p><p><strong>4. Carry a leash even in the off-leash area.</strong></p><p>Manitoba's Paws in Parks guidance says owners should supervise dogs at all times, keep voice control, and have a leash in hand in designated off-leash areas.</p><p><strong>5. Plan for a relatively open prairie park environment.</strong></p><p>Yellow Quill is not a heavily urbanized dog-run setting, so weather, wind, shade, and footing can matter more than on small city enclosures.</p>";
  const faqs = "<p><strong>1. Does Portage la Prairie currently publish city dog-licensing rules?</strong></p><p>Yes. The city says dogs over six months old kept within city limits must have a city-issued licence, and proof of current rabies vaccination is required when registering.</p><p><strong>2. Are Portage pet licences ever free?</strong></p><p>Yes. The city's current pet-licence page says licences are free if registered between January and March.</p><p><strong>3. What is the strongest current official off-leash source for Portage?</strong></p><p>Manitoba's current Paws in Parks page, which lists Yellow Quill Provincial Park and says the fenced-in area there is designated as an off-leash area.</p><p><strong>4. Can dogs be off leash anywhere else in the provincial park?</strong></p><p>Not by default. Manitoba's park regulation says animals in provincial parks must otherwise be leashed, harnessed, or under direct physical control unless an area is specifically designated off leash.</p><p><strong>5. What city fines should owners be aware of?</strong></p><p>Portage la Prairie's current FAQ lists common fines for unlicensed pets, animals at large, failure to remove defecation, failure to control or leash a dog, and dog attacks, starting at $130 for a first offence.</p><p><strong>6. Which park does this guide feature?</strong></p><p>This guide features Yellowquill Provincial Park Off-Leash Dog Area, the current Portage park record already in LeashFree.ca's database.</p>";
  const metaDescription = "Source-backed guide to dog parks in Portage la Prairie, Manitoba, covering current city licensing rules, common animal-control fines, and the designated off-leash area at Yellow Quill Provincial Park.";

  city.seoTitle = "Dog Parks in Portage la Prairie, Manitoba | Off-Leash Guide";
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
    "Featured Park 1": "yellowquill-provincial-park-off-leash-dog-area",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.city-plap.com/home-property-community/animal-services/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Winnipeg, Brandon, Morden",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "portage-la-prairie");
  if (!targetRow) throw new Error("Portage la Prairie city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Portage la Prairie, Manitoba | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Portage la Prairie, Manitoba, covering current city licensing rules, common animal-control fines, and the designated off-leash area at Yellow Quill Provincial Park.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Portage la Prairie is a good example of a city page that needed source cleanup more than generic expansion. The City of Portage la Prairie publishes current licensing, animal-control, and bylaw details, while Manitoba's provincial parks guidance confirms that the fenced area at Yellow Quill Provincial Park is a designated off-leash area. That gives this page a stronger factual base than the older copy it replaces.</p>",
    "About Section": "<p>The previous Portage la Prairie page made several specific amenity claims about a city off-leash park in the north end, but the current official source set points in a different direction. The City of Portage la Prairie's current animal-services pages clearly explain that animal control is regulated by Animal Control By-Law 21-8721 and that dogs over six months old kept within city limits must hold a city-issued licence. The city also says proof of current rabies vaccination is required for licensing, and its current pet-licence page says licences are free when registered between January and March.</p><p>For the actual off-leash destination, the strongest current official source is provincial rather than municipal. Manitoba's current Paws in Parks guidance lists Yellow Quill Provincial Park as an off-leash area and specifically says the fenced-in area of Yellow Quill Provincial Park is designated for off-leash use. The provincial park regulation also makes the baseline rule clear: animals in provincial parks must otherwise be on a leash, harness, or under direct physical control unless they are in a posted off-leash area or trail. That means Portage dog owners should think in two layers: city licensing and animal-control compliance inside Portage la Prairie, plus provincial off-leash boundary rules when using Yellow Quill.</p>",
    "Featured Park 1": "yellowquill-provincial-park-off-leash-dog-area",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Open prairie exposure can mean harder wind and packed snow at Yellow Quill, so shorter sessions and paw protection may matter.</li><li><strong>Spring:</strong> Thaw conditions can soften grass and entrances around fenced off-leash areas, so expect mud and bring towels.</li><li><strong>Summer:</strong> Bring your own water and plan for limited natural shade in a more open Manitoba park setting.</li><li><strong>Fall:</strong> Cooler temperatures are often ideal for longer off-leash exercise, but shorter daylight makes earlier visits easier.</li></ul>",
    "Park Rules": "<p><strong>City licensing still applies:</strong> Portage la Prairie says dogs over six months old kept within city limits must have a city-issued licence, and proof of current rabies vaccination is required when registering.</p><p><strong>Watch the registration timing:</strong> the city's current pet-licence page says licences are free if completed between January and March, with later fees set by the current fees and charges schedule.</p><p><strong>Use only the designated off-leash boundary at Yellow Quill:</strong> Manitoba's current parks guidance says the fenced-in area of Yellow Quill Provincial Park is the designated off-leash area.</p><p><strong>Assume leash control everywhere else:</strong> Manitoba's park regulation says animals in provincial parks must otherwise be on a leash, harness, or under direct physical control unless the area is specifically designated off leash.</p><p><strong>Expect enforcement for city rule breaches:</strong> Portage la Prairie's current FAQ lists common bylaw fines including unlicensed pets, animals at large, failure to remove defecation, and failure to control or leash a dog, starting at $130 for a first offence.</p>",
    "City Website": "https://www.city-plap.com/home-property-community/animal-services/",
    "Dog Park Etiquettes": "<p><strong>1. Treat this as a city-plus-province visit.</strong></p><p>Portage la Prairie governs licensing and local animal-control compliance, but the off-leash destination itself is best supported by Manitoba provincial park guidance.</p><p><strong>2. Keep licensing current before relying on the park.</strong></p><p>The city requires dogs over six months old to be licensed and asks for proof of current rabies vaccination when owners register.</p><p><strong>3. Stay inside the posted off-leash boundary.</strong></p><p>Manitoba's current wording is specific to the fenced-in area at Yellow Quill, not the whole park.</p><p><strong>4. Carry a leash even in the off-leash area.</strong></p><p>Manitoba's Paws in Parks guidance says owners should supervise dogs at all times, keep voice control, and have a leash in hand in designated off-leash areas.</p><p><strong>5. Plan for a relatively open prairie park environment.</strong></p><p>Yellow Quill is not a heavily urbanized dog-run setting, so weather, wind, shade, and footing can matter more than on small city enclosures.</p>",
    "Dog Park FAQs": "<p><strong>1. Does Portage la Prairie currently publish city dog-licensing rules?</strong></p><p>Yes. The city says dogs over six months old kept within city limits must have a city-issued licence, and proof of current rabies vaccination is required when registering.</p><p><strong>2. Are Portage pet licences ever free?</strong></p><p>Yes. The city's current pet-licence page says licences are free if registered between January and March.</p><p><strong>3. What is the strongest current official off-leash source for Portage?</strong></p><p>Manitoba's current Paws in Parks page, which lists Yellow Quill Provincial Park and says the fenced-in area there is designated as an off-leash area.</p><p><strong>4. Can dogs be off leash anywhere else in the provincial park?</strong></p><p>Not by default. Manitoba's park regulation says animals in provincial parks must otherwise be leashed, harnessed, or under direct physical control unless an area is specifically designated off leash.</p><p><strong>5. What city fines should owners be aware of?</strong></p><p>Portage la Prairie's current FAQ lists common fines for unlicensed pets, animals at large, failure to remove defecation, failure to control or leash a dog, and dog attacks, starting at $130 for a first offence.</p><p><strong>6. Which park does this guide feature?</strong></p><p>This guide features Yellowquill Provincial Park Off-Leash Dog Area, the current Portage park record already in LeashFree.ca's database.</p>",
    "Nearby Cities": "Winnipeg, Brandon, Morden",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/portage-la-prairie/")];
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

console.log("Updated Portage la Prairie city page and refreshed backlog files.");
