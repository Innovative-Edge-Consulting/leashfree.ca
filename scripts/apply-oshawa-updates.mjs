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
  if (source.includes('"oshawa": "/images/cities/city-oshawa-hero.png"')) return;
  const anchor = '  "niagara-falls": "/images/cities/city-niagara-falls-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "oshawa": "/images/cities/city-oshawa-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "oshawa");
  if (!city) throw new Error("Oshawa city record not found.");

  const intro = "<p>Oshawa's current off-leash system is narrower and more specific than the generic page copy this guide started with. The City of Oshawa now publishes two official off-leash parks, not a broad network of similar fenced sites, and the city distinguishes clearly between a large natural trail-based area and a much smaller enclosed neighbourhood park.</p>";
  const about = "<p>The City of Oshawa currently lists two official off-leash parks: Clare Ford off-leash dog park and Cordova Valley Park off-leash area. Clare Ford is the current official name for the city's former Harmony Valley Park off-leash dog park, renamed in June 2025. The city says that site includes a 10-hectare off-leash area within more than 60 hectares of passive recreation space, but only the trails in the southern part of Harmony Valley Park are off-leash. That distinction matters because the park is not a fully enclosed single-purpose dog run. The trails are unpaved, not maintained, and the city warns they can be steep and slippery.</p><p>Oshawa's second official site is structurally different. Cordova Valley Park is a 0.29-hectare fully enclosed off-leash area with a mix of mulch and grass surfaces and a separate enclosed space for small or vulnerable dogs. Together, those two official park formats give owners a real choice between a larger naturalized trail setting and a smaller fenced urban enclosure. The city's animal-services material adds the compliance layer that older thin copy usually misses: dogs using the parks are expected to be licensed and vaccinated, handlers are limited to four dogs, and Oshawa's current pet-licence program requires valid rabies vaccination for licensing, with different annual and lifetime licence pricing depending on sterilization and microchip status.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Cordova Valley may be the simpler option because the city says it is not winter maintained, while Clare Ford's unpaved south-trail network can become slippery and more technical to navigate.</li><li><strong>Spring:</strong> Expect mud and softer footing at Clare Ford because the off-leash section is trail-based natural terrain rather than a hard-surfaced enclosure.</li><li><strong>Summer:</strong> Use the larger Clare Ford off-leash area for longer walks, but keep track of where the designated off-leash boundary ends because only the southern trails are off-leash.</li><li><strong>Fall:</strong> Leaf cover can hide uneven ground on Clare Ford's trails, while Cordova remains the more predictable fenced option for short visits.</li></ul>";
  const parkRules = "<p><strong>Leash at transitions:</strong> Oshawa requires dogs to be leashed while entering and exiting the off-leash areas, and the city says dogs should never be loose in the parking lot at Clare Ford.</p><p><strong>Stay inside the designated off-leash footprint:</strong> at Clare Ford, only the trails in the southern part of Harmony Valley Park are off-leash; outside that area, dogs must be on leash.</p><p><strong>Maintain control and supervision:</strong> the city says dogs must remain in view and under voice control, and one person may handle no more than four dogs.</p><p><strong>Meet the health and licensing baseline:</strong> dogs must have a current pet licence and current vaccinations to use the parks.</p><p><strong>Respect park-specific restrictions:</strong> Oshawa bars dogs in heat, sick dogs, and aggressive dogs from Clare Ford, and Cordova's posted rules also prohibit puppies under four months, choke or prong collars, food, beverages, glass containers, smoking, and vaping.</p>";
  const etiquette = "<p><strong>1. Pick the right park type for your dog.</strong></p><p>Oshawa does not offer two interchangeable dog parks. Clare Ford is a large natural trail system, while Cordova is a compact enclosed area with a separate small- or vulnerable-dog section.</p><p><strong>2. Do not treat Clare Ford like a fully fenced off-leash field.</strong></p><p>The city explicitly limits off-leash use to the southern trails of Harmony Valley Park and warns that the trail surface is unpaved, steep in places, and not maintained.</p><p><strong>3. Use Cordova when you need enclosure and shorter sessions.</strong></p><p>Its 0.29-hectare fenced layout and separate smaller-dog space make it the more controlled choice for dogs that do not do well in a large open trail environment.</p><p><strong>4. Keep your licensing current before park visits.</strong></p><p>Oshawa's licensing page ties park compliance back to valid rabies vaccination, and lifetime licences require a microchip.</p><p><strong>5. Stay disciplined about dog count and transitions.</strong></p><p>The city sets a four-dog limit per person and still expects dogs to be leashed while entering, exiting, and moving through parking areas.</p>";
  const faqs = "<p><strong>1. How many official off-leash dog parks does Oshawa currently list?</strong></p><p>The City of Oshawa currently lists two: Clare Ford off-leash dog park and Cordova Valley Park off-leash area.</p><p><strong>2. Is Harmony Valley still an Oshawa dog park?</strong></p><p>Yes, but the city renamed the site Clare Ford off-leash dog park in June 2025. It remains within Harmony Valley Park.</p><p><strong>3. Are both Oshawa dog parks fully fenced?</strong></p><p>No. Cordova Valley is fully enclosed, but Clare Ford is a large trail-based off-leash area where only the southern trails are designated off leash.</p><p><strong>4. Does Oshawa have a separate space for small dogs?</strong></p><p>Yes. Cordova Valley includes a separate enclosed area for small or vulnerable dogs.</p><p><strong>5. Do dogs need a city licence to use Oshawa off-leash parks?</strong></p><p>Yes. Oshawa's posted off-leash rules say dogs need a current pet licence and current vaccinations.</p><p><strong>6. What does Oshawa charge for dog licences?</strong></p><p>As of Tuesday, July 28, 2026, Oshawa lists annual licences at $25 for spayed or neutered dogs and $50 for unaltered dogs, while lifetime licences with a microchip are $40 for spayed or neutered dogs and $60 for unaltered dogs.</p>";
  const metaDescription = "Source-backed guide to dog parks in Oshawa, Ontario, covering Clare Ford's renamed Harmony Valley off-leash trails, Cordova Valley's fenced small-dog area, current licensing requirements, and posted park rules.";

  city.seoTitle = "Dog Parks in Oshawa, Ontario | Off-Leash Guide";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Ontario"],
    "Featured Park 1": ["oshawa-harmony-valley-park"],
    "Province Page": ["https://leashfree.ca/ontario-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "oshawa-harmony-valley-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.oshawa.ca/living-here/animal-services/off-leash-parks/",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Ajax, Pickering, Whitby, Courtice",
    "Updated On": "Tue Jul 28 2026 16:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 16:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "oshawa");
  if (!targetRow) throw new Error("Oshawa city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks in Oshawa, Ontario | Off-Leash Guide",
    "Meta Description": "Source-backed guide to dog parks in Oshawa, Ontario, covering Clare Ford's renamed Harmony Valley off-leash trails, Cordova Valley's fenced small-dog area, current licensing requirements, and posted park rules.",
    "Hero Image": "",
    "Intro Paragraph": "<p>Oshawa's current off-leash system is narrower and more specific than the generic page copy this guide started with. The City of Oshawa now publishes two official off-leash parks, not a broad network of similar fenced sites, and the city distinguishes clearly between a large natural trail-based area and a much smaller enclosed neighbourhood park.</p>",
    "About Section": "<p>The City of Oshawa currently lists two official off-leash parks: Clare Ford off-leash dog park and Cordova Valley Park off-leash area. Clare Ford is the current official name for the city's former Harmony Valley Park off-leash dog park, renamed in June 2025. The city says that site includes a 10-hectare off-leash area within more than 60 hectares of passive recreation space, but only the trails in the southern part of Harmony Valley Park are off-leash. That distinction matters because the park is not a fully enclosed single-purpose dog run. The trails are unpaved, not maintained, and the city warns they can be steep and slippery.</p><p>Oshawa's second official site is structurally different. Cordova Valley Park is a 0.29-hectare fully enclosed off-leash area with a mix of mulch and grass surfaces and a separate enclosed space for small or vulnerable dogs. Together, those two official park formats give owners a real choice between a larger naturalized trail setting and a smaller fenced urban enclosure. The city's animal-services material adds the compliance layer that older thin copy usually misses: dogs using the parks are expected to be licensed and vaccinated, handlers are limited to four dogs, and Oshawa's current pet-licence program requires valid rabies vaccination for licensing, with different annual and lifetime licence pricing depending on sterilization and microchip status.</p>",
    "Featured Park 1": "oshawa-harmony-valley-park",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Cordova Valley may be the simpler option because the city says it is not winter maintained, while Clare Ford's unpaved south-trail network can become slippery and more technical to navigate.</li><li><strong>Spring:</strong> Expect mud and softer footing at Clare Ford because the off-leash section is trail-based natural terrain rather than a hard-surfaced enclosure.</li><li><strong>Summer:</strong> Use the larger Clare Ford off-leash area for longer walks, but keep track of where the designated off-leash boundary ends because only the southern trails are off-leash.</li><li><strong>Fall:</strong> Leaf cover can hide uneven ground on Clare Ford's trails, while Cordova remains the more predictable fenced option for short visits.</li></ul>",
    "Park Rules": "<p><strong>Leash at transitions:</strong> Oshawa requires dogs to be leashed while entering and exiting the off-leash areas, and the city says dogs should never be loose in the parking lot at Clare Ford.</p><p><strong>Stay inside the designated off-leash footprint:</strong> at Clare Ford, only the trails in the southern part of Harmony Valley Park are off-leash; outside that area, dogs must be on leash.</p><p><strong>Maintain control and supervision:</strong> the city says dogs must remain in view and under voice control, and one person may handle no more than four dogs.</p><p><strong>Meet the health and licensing baseline:</strong> dogs must have a current pet licence and current vaccinations to use the parks.</p><p><strong>Respect park-specific restrictions:</strong> Oshawa bars dogs in heat, sick dogs, and aggressive dogs from Clare Ford, and Cordova's posted rules also prohibit puppies under four months, choke or prong collars, food, beverages, glass containers, smoking, and vaping.</p>",
    "City Website": "https://www.oshawa.ca/living-here/animal-services/off-leash-parks/",
    "Dog Park Etiquettes": "<p><strong>1. Pick the right park type for your dog.</strong></p><p>Oshawa does not offer two interchangeable dog parks. Clare Ford is a large natural trail system, while Cordova is a compact enclosed area with a separate small- or vulnerable-dog section.</p><p><strong>2. Do not treat Clare Ford like a fully fenced off-leash field.</strong></p><p>The city explicitly limits off-leash use to the southern trails of Harmony Valley Park and warns that the trail surface is unpaved, steep in places, and not maintained.</p><p><strong>3. Use Cordova when you need enclosure and shorter sessions.</strong></p><p>Its 0.29-hectare fenced layout and separate smaller-dog space make it the more controlled choice for dogs that do not do well in a large open trail environment.</p><p><strong>4. Keep your licensing current before park visits.</strong></p><p>Oshawa's licensing page ties park compliance back to valid rabies vaccination, and lifetime licences require a microchip.</p><p><strong>5. Stay disciplined about dog count and transitions.</strong></p><p>The city sets a four-dog limit per person and still expects dogs to be leashed while entering, exiting, and moving through parking areas.</p>",
    "Dog Park FAQs": "<p><strong>1. How many official off-leash dog parks does Oshawa currently list?</strong></p><p>The City of Oshawa currently lists two: Clare Ford off-leash dog park and Cordova Valley Park off-leash area.</p><p><strong>2. Is Harmony Valley still an Oshawa dog park?</strong></p><p>Yes, but the city renamed the site Clare Ford off-leash dog park in June 2025. It remains within Harmony Valley Park.</p><p><strong>3. Are both Oshawa dog parks fully fenced?</strong></p><p>No. Cordova Valley is fully enclosed, but Clare Ford is a large trail-based off-leash area where only the southern trails are designated off leash.</p><p><strong>4. Does Oshawa have a separate space for small dogs?</strong></p><p>Yes. Cordova Valley includes a separate enclosed area for small or vulnerable dogs.</p><p><strong>5. Do dogs need a city licence to use Oshawa off-leash parks?</strong></p><p>Yes. Oshawa's posted off-leash rules say dogs need a current pet licence and current vaccinations.</p><p><strong>6. What does Oshawa charge for dog licences?</strong></p><p>As of Tuesday, July 28, 2026, Oshawa lists annual licences at $25 for spayed or neutered dogs and $50 for unaltered dogs, while lifetime licences with a microchip are $40 for spayed or neutered dogs and $60 for unaltered dogs.</p>",
    "Nearby Cities": "Ajax, Pickering, Whitby, Courtice",
    "Updated On": "Tue Jul 28 2026 16:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Tue Jul 28 2026 16:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/oshawa/")];
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

console.log("Updated Oshawa city page and refreshed backlog files.");
