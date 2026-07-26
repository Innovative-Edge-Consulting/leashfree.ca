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
  if (source.includes('"yarmouth": "/images/cities/city-yarmouth-hero.png"')) return;
  const updated = source.replace(
    '  "warman": "/images/cities/city-warman-hero.png",\n',
    '  "warman": "/images/cities/city-warman-hero.png",\n  "yarmouth": "/images/cities/city-yarmouth-hero.png",\n'
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "yarmouth");
  if (!city) throw new Error("Yarmouth city record not found.");

  const intro = "<p>Yarmouth’s off-leash scene is simple and specific: the town’s main public option is Yarmouth Dog Park at 2 Clements Avenue, beside the Broad Brook Trail behind the Mariners ball field. The official Yarmouth &amp; Acadian Shores listing says the park has two separate enclosures, grass surface, and dawn-to-dusk access.</p>";
  const about = "<p>For local dog owners, Yarmouth is less about a large multi-park network and more about one established fenced destination. The regional tourism listing places Yarmouth Dog Park between South East Street and Forest Street alongside the Broad Brook Trail, with separate enclosures that make it easier to manage different play styles. Visitors should bring their own water, and the listing notes that the park is not accessible to people with mobility issues.</p><p>Town-level dog rules still matter before and after you reach the gate. Nova Scotia’s official summary offence schedule for the Town of Yarmouth shows active dog-bylaw enforcement for unregistered dogs, missing tags, dogs running at large, failing to remove feces, and bringing dogs into prohibited areas. The province’s 211 directory also identifies the Town of Yarmouth as the local contact for dog licensing and dog-bylaw enforcement.</p>";
  const seasonalTips = "<p>- Winter: Dawn-to-dusk access continues, but coastal wind, icy footing, and packed snow can make the grass surface uneven.<br>- Spring: Expect muddy patches around entry points and worn routes as thaw sets in beside the trail corridor.<br>- Summer: Bring your own water because the official listing says visitors need to supply it themselves.<br>- Fall: Cooler temperatures usually make the park more comfortable for longer off-leash exercise, but shorter daylight matters because the park is listed as dawn to dusk rather than late evening.</p>";
  const parkRules = "<p><strong>Off-leash use:</strong> keep off-leash activity inside the designated dog-park enclosure at 2 Clements Avenue.</p><p><strong>Town bylaw context:</strong> Yarmouth enforces dog registration and tag requirements, prohibits dogs running at large, and tickets owners who fail to remove dog feces or permit dogs in areas where dogs are prohibited.</p><p><strong>Visit prep:</strong> bring your own water, supervise your dog closely, and be prepared for a simple grass-surface park without broad accessibility features.</p>";
  const etiquette = "<p><strong>1. Treat the park as a contained off-leash space, not a free-run extension of the trail.</strong></p><p>The official listing places the park alongside Broad Brook Trail, so leash control matters before entering and after leaving the fenced area.</p><p><strong>2. Bring water every time.</strong></p><p>The tourism listing explicitly says visitors need to bring their own water.</p><p><strong>3. Pick up waste immediately.</strong></p><p>That is both basic park etiquette and a bylaw-enforced responsibility in the Town of Yarmouth.</p><p><strong>4. Match your visit to your dog’s comfort level.</strong></p><p>The two-enclosure layout helps, but this is still a shared community park and not a private training yard.</p><p><strong>5. Keep expectations realistic.</strong></p><p>Yarmouth Dog Park is a useful local amenity, but it is a simple grass off-leash park rather than a heavily serviced urban dog-park complex.</p>";
  const faqs = "<p><strong>1. How many public off-leash dog parks are currently highlighted for Yarmouth?</strong></p><p>The main source-backed public listing for Yarmouth points to one named facility: Yarmouth Dog Park at 2 Clements Avenue.</p><p><strong>2. Where is Yarmouth Dog Park located?</strong></p><p>The official Yarmouth &amp; Acadian Shores listing places it beside the Broad Brook Trail, behind the Mariners ball field, between South East Street and Forest Street.</p><p><strong>3. Is the park fenced?</strong></p><p>The listing describes two separate enclosures, which supports it as a fenced off-leash setup.</p><p><strong>4. What hours does it keep?</strong></p><p>The official listing shows dawn-to-dusk hours every day.</p><p><strong>5. Is water available on site?</strong></p><p>No water supply is promised. Visitors are told to bring their own.</p><p><strong>6. Do dog licences and tags matter in Yarmouth?</strong></p><p>Yes. Town-level bylaw enforcement listed by Nova Scotia includes offences for unregistered dogs and dogs not wearing required tags.</p>";
  const metaDescription = "Find Yarmouth Dog Park details, dawn-to-dusk hours, Broad Brook Trail location, and Town of Yarmouth dog-bylaw context. This guide covers the town’s main source-backed off-leash option.";

  city.seoTitle = "Dog Parks in Yarmouth, Nova Scotia | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Nova Scotia"],
    "Province Page": ["https://leashfree.ca/nova-scotia-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.yarmouthandacadianshores.com/en/things-to-do/yarmouth-dog-park/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Shelburne, Digby",
    "Updated On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "yarmouth");
  if (!targetRow) throw new Error("Yarmouth city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Yarmouth, Nova Scotia | Off-Leash Guide",
    "Meta Description": "Find Yarmouth Dog Park details, dawn-to-dusk hours, Broad Brook Trail location, and Town of Yarmouth dog-bylaw context. This guide covers the town’s main source-backed off-leash option.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Yarmouth’s off-leash scene is simple and specific: the town’s main public option is Yarmouth Dog Park at 2 Clements Avenue, beside the Broad Brook Trail behind the Mariners ball field. The official Yarmouth &amp; Acadian Shores listing says the park has two separate enclosures, grass surface, and dawn-to-dusk access.</p>",
    "About Section": "<p>For local dog owners, Yarmouth is less about a large multi-park network and more about one established fenced destination. The regional tourism listing places Yarmouth Dog Park between South East Street and Forest Street alongside the Broad Brook Trail, with separate enclosures that make it easier to manage different play styles. Visitors should bring their own water, and the listing notes that the park is not accessible to people with mobility issues.</p><p>Town-level dog rules still matter before and after you reach the gate. Nova Scotia’s official summary offence schedule for the Town of Yarmouth shows active dog-bylaw enforcement for unregistered dogs, missing tags, dogs running at large, failing to remove feces, and bringing dogs into prohibited areas. The province’s 211 directory also identifies the Town of Yarmouth as the local contact for dog licensing and dog-bylaw enforcement.</p>",
    "Featured Park 1": "",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<p>- Winter: Dawn-to-dusk access continues, but coastal wind, icy footing, and packed snow can make the grass surface uneven.<br>- Spring: Expect muddy patches around entry points and worn routes as thaw sets in beside the trail corridor.<br>- Summer: Bring your own water because the official listing says visitors need to supply it themselves.<br>- Fall: Cooler temperatures usually make the park more comfortable for longer off-leash exercise, but shorter daylight matters because the park is listed as dawn to dusk rather than late evening.</p>",
    "Park Rules": "<p><strong>Off-leash use:</strong> keep off-leash activity inside the designated dog-park enclosure at 2 Clements Avenue.</p><p><strong>Town bylaw context:</strong> Yarmouth enforces dog registration and tag requirements, prohibits dogs running at large, and tickets owners who fail to remove dog feces or permit dogs in areas where dogs are prohibited.</p><p><strong>Visit prep:</strong> bring your own water, supervise your dog closely, and be prepared for a simple grass-surface park without broad accessibility features.</p>",
    "City Website": "https://www.yarmouthandacadianshores.com/en/things-to-do/yarmouth-dog-park/",
    "Dog Park Etiquettes": "<p><strong>1. Treat the park as a contained off-leash space, not a free-run extension of the trail.</strong></p><p>The official listing places the park alongside Broad Brook Trail, so leash control matters before entering and after leaving the fenced area.</p><p><strong>2. Bring water every time.</strong></p><p>The tourism listing explicitly says visitors need to bring their own water.</p><p><strong>3. Pick up waste immediately.</strong></p><p>That is both basic park etiquette and a bylaw-enforced responsibility in the Town of Yarmouth.</p><p><strong>4. Match your visit to your dog’s comfort level.</strong></p><p>The two-enclosure layout helps, but this is still a shared community park and not a private training yard.</p><p><strong>5. Keep expectations realistic.</strong></p><p>Yarmouth Dog Park is a useful local amenity, but it is a simple grass off-leash park rather than a heavily serviced urban dog-park complex.</p>",
    "Dog Park FAQs": "<p><strong>1. How many public off-leash dog parks are currently highlighted for Yarmouth?</strong></p><p>The main source-backed public listing for Yarmouth points to one named facility: Yarmouth Dog Park at 2 Clements Avenue.</p><p><strong>2. Where is Yarmouth Dog Park located?</strong></p><p>The official Yarmouth &amp; Acadian Shores listing places it beside the Broad Brook Trail, behind the Mariners ball field, between South East Street and Forest Street.</p><p><strong>3. Is the park fenced?</strong></p><p>The listing describes two separate enclosures, which supports it as a fenced off-leash setup.</p><p><strong>4. What hours does it keep?</strong></p><p>The official listing shows dawn-to-dusk hours every day.</p><p><strong>5. Is water available on site?</strong></p><p>No water supply is promised. Visitors are told to bring their own.</p><p><strong>6. Do dog licences and tags matter in Yarmouth?</strong></p><p>Yes. Town-level bylaw enforcement listed by Nova Scotia includes offences for unregistered dogs and dogs not wearing required tags.</p>",
    "Nearby Cities": "Shelburne, Digby",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/yarmouth/")];
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

console.log("Updated Yarmouth city page, backlog CSV, and backlog summary.");
