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
  if (source.includes('"gimli": "/images/cities/city-gimli-hero.png"')) return;
  const anchor = '  "gatineau": "/images/dog-parks/gatineau-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "gimli": "/images/cities/city-gimli-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "gimli");
  if (!city) throw new Error("Gimli city record not found.");

  const intro = "<p>As of Saturday, August 15, 2026, Gimli is best handled as a rules-first waterfront dog guide, not a typical dog-park roundup. The Rural Municipality of Gimli clearly publishes leash control, beach restrictions, and animal-control enforcement, but it does not currently publish a strong municipal fact page for a dedicated off-leash dog park.</p>";
  const about = "<p>The reviewed RM of Gimli source set is strongest on rules and public-space boundaries. The municipality's FAQ says all dogs must be leashed when off the owner's property and are not permitted to run at large. The same FAQ also says dogs are not allowed on any public beach in the municipality, though they are permitted on the boardwalk and grass areas as long as they are leashed and owners clean up after them. The municipality's Animal Control page adds that enforcement is regulated by Animal Control By-law #20-0003 and provides direct contact information for the Animal Control Officer.</p><p>What the municipality does publish clearly is the wider recreation setting around dog outings. Gimli's parks and beach pages position the community as a Lake Winnipeg destination with beaches, grassy parks, a boardwalk, harbour areas, and multiple public parks. That matters because it shows where leashed outings fit into the public landscape even when the RM is not publishing a dedicated dog-park amenities sheet. The safest high-trust approach for this city page is to describe Gimli as a municipality with clear leash and beach restrictions and to tell owners to verify any claimed off-leash enclosure directly with the RM before relying on third-party listings.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Gimli's wind exposure off Lake Winnipeg can make shorter leashed walks more practical than long open-area sessions.</li><li><strong>Spring:</strong> Watch for wet ground and softer footing around parks and shoreline-adjacent public spaces.</li><li><strong>Summer:</strong> Remember that public beaches are not dog areas; use leashed boardwalk and grassy routes instead unless the RM confirms a separate off-leash space.</li><li><strong>Fall:</strong> Cooler weather improves walking comfort, but lakeside wind and earlier darkness still matter for visit planning.</li></ul>";
  const parkRules = "<p><strong>Leash dogs off your property:</strong> the RM of Gimli FAQ says all dogs must be leashed when off the owner's property and are not permitted to run at large.</p><p><strong>Do not take dogs onto public beaches:</strong> the same municipal FAQ says dogs are not allowed on any public beach in the municipality.</p><p><strong>Use the boardwalk and grass areas correctly:</strong> dogs are permitted there only if they are leashed and owners clean up after them.</p><p><strong>Know the governing bylaw:</strong> the municipality says animal control is regulated by By-law #20-0003.</p><p><strong>Verify off-leash claims directly:</strong> because the reviewed municipal pages do not currently publish a strong dedicated dog-park fact page, confirm any off-leash enclosure details with the RM or Animal Control Officer before visiting.</p>";
  const etiquette = "<p><strong>1. Treat Gimli first as a leashed public-space municipality.</strong></p><p>The clearest published local rules are about leash control, not about a fully documented dog-park network.</p><p><strong>2. Do not confuse the beach with a dog area.</strong></p><p>The municipality explicitly says dogs are not allowed on any public beach, even though they may be walked on the boardwalk and grass areas while leashed.</p><p><strong>3. Keep cleanup standards high in shared spaces.</strong></p><p>Gimli's allowance for dogs on grass and boardwalk routes is tied directly to leashing and cleaning up after them.</p><p><strong>4. Use municipal contact points when something is unclear.</strong></p><p>The RM publishes Animal Control Officer contact information, which is more reliable than assuming third-party dog-park details are current.</p><p><strong>5. Be conservative with off-leash assumptions.</strong></p><p>If a park feature is not clearly documented by the RM, confirm it before building a trip around it.</p>";
  const faqs = "<p><strong>1. Can I walk my dog off leash in Gimli?</strong></p><p>No. The RM of Gimli FAQ says all dogs must be leashed when off the owner's property and are not allowed to run at large.</p><p><strong>2. Are dogs allowed on Gimli's public beaches?</strong></p><p>No. The municipality says dogs are not allowed on any public beach.</p><p><strong>3. Where can dogs go in public near the waterfront?</strong></p><p>The RM says dogs are permitted on the boardwalk and grass areas if they are leashed and cleaned up after.</p><p><strong>4. What bylaw governs animal control in Gimli?</strong></p><p>The municipality says animal control is regulated by By-law #20-0003.</p><p><strong>5. Does the RM currently publish a strong official dog-park page?</strong></p><p>Not in the reviewed municipal source set. As of Saturday, August 15, 2026, the strongest published material is the leash, beach, and animal-control guidance, so owners should verify any off-leash enclosure details directly with the RM.</p><p><strong>6. Who should I contact if I need to confirm current dog rules?</strong></p><p>The municipality's Animal Control page lists the Animal Control Officer at 204-642-4775.</p>";
  const metaDescription = "Source-backed guide to dog rules and dog-friendly public spaces in Gimli, Manitoba, covering leash requirements, beach restrictions, boardwalk access, Animal Control By-law #20-0003, and current municipal context.";

  city.seoTitle = "Dog Parks and Dog Rules in Gimli, Manitoba | LeashFree.ca";
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
    "Featured Park 1": "",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.gimli.ca/p/animal-control",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "",
    "Updated On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "gimli");
  if (!targetRow) throw new Error("Gimli city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Dog Parks and Dog Rules in Gimli, Manitoba | LeashFree.ca",
    "Meta Description": "Source-backed guide to dog rules and dog-friendly public spaces in Gimli, Manitoba, covering leash requirements, beach restrictions, boardwalk access, Animal Control By-law #20-0003, and current municipal context.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Saturday, August 15, 2026, Gimli is best handled as a rules-first waterfront dog guide, not a typical dog-park roundup. The Rural Municipality of Gimli clearly publishes leash control, beach restrictions, and animal-control enforcement, but it does not currently publish a strong municipal fact page for a dedicated off-leash dog park.</p>",
    "About Section": "<p>The reviewed RM of Gimli source set is strongest on rules and public-space boundaries. The municipality's FAQ says all dogs must be leashed when off the owner's property and are not permitted to run at large. The same FAQ also says dogs are not allowed on any public beach in the municipality, though they are permitted on the boardwalk and grass areas as long as they are leashed and owners clean up after them. The municipality's Animal Control page adds that enforcement is regulated by Animal Control By-law #20-0003 and provides direct contact information for the Animal Control Officer.</p><p>What the municipality does publish clearly is the wider recreation setting around dog outings. Gimli's parks and beach pages position the community as a Lake Winnipeg destination with beaches, grassy parks, a boardwalk, harbour areas, and multiple public parks. That matters because it shows where leashed outings fit into the public landscape even when the RM is not publishing a dedicated dog-park amenities sheet. The safest high-trust approach for this city page is to describe Gimli as a municipality with clear leash and beach restrictions and to tell owners to verify any claimed off-leash enclosure directly with the RM before relying on third-party listings.</p>",
    "Featured Park 1": "",
    "Featured Park 2": "",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Gimli's wind exposure off Lake Winnipeg can make shorter leashed walks more practical than long open-area sessions.</li><li><strong>Spring:</strong> Watch for wet ground and softer footing around parks and shoreline-adjacent public spaces.</li><li><strong>Summer:</strong> Remember that public beaches are not dog areas; use leashed boardwalk and grassy routes instead unless the RM confirms a separate off-leash space.</li><li><strong>Fall:</strong> Cooler weather improves walking comfort, but lakeside wind and earlier darkness still matter for visit planning.</li></ul>",
    "Park Rules": "<p><strong>Leash dogs off your property:</strong> the RM of Gimli FAQ says all dogs must be leashed when off the owner's property and are not permitted to run at large.</p><p><strong>Do not take dogs onto public beaches:</strong> the same municipal FAQ says dogs are not allowed on any public beach in the municipality.</p><p><strong>Use the boardwalk and grass areas correctly:</strong> dogs are permitted there only if they are leashed and owners clean up after them.</p><p><strong>Know the governing bylaw:</strong> the municipality says animal control is regulated by By-law #20-0003.</p><p><strong>Verify off-leash claims directly:</strong> because the reviewed municipal pages do not currently publish a strong dedicated dog-park fact page, confirm any off-leash enclosure details with the RM or Animal Control Officer before visiting.</p>",
    "City Website": "https://www.gimli.ca/p/animal-control",
    "Dog Park Etiquettes": "<p><strong>1. Treat Gimli first as a leashed public-space municipality.</strong></p><p>The clearest published local rules are about leash control, not about a fully documented dog-park network.</p><p><strong>2. Do not confuse the beach with a dog area.</strong></p><p>The municipality explicitly says dogs are not allowed on any public beach, even though they may be walked on the boardwalk and grass areas while leashed.</p><p><strong>3. Keep cleanup standards high in shared spaces.</strong></p><p>Gimli's allowance for dogs on grass and boardwalk routes is tied directly to leashing and cleaning up after them.</p><p><strong>4. Use municipal contact points when something is unclear.</strong></p><p>The RM publishes Animal Control Officer contact information, which is more reliable than assuming third-party dog-park details are current.</p><p><strong>5. Be conservative with off-leash assumptions.</strong></p><p>If a park feature is not clearly documented by the RM, confirm it before building a trip around it.</p>",
    "Dog Park FAQs": "<p><strong>1. Can I walk my dog off leash in Gimli?</strong></p><p>No. The RM of Gimli FAQ says all dogs must be leashed when off the owner's property and are not allowed to run at large.</p><p><strong>2. Are dogs allowed on Gimli's public beaches?</strong></p><p>No. The municipality says dogs are not allowed on any public beach.</p><p><strong>3. Where can dogs go in public near the waterfront?</strong></p><p>The RM says dogs are permitted on the boardwalk and grass areas if they are leashed and cleaned up after.</p><p><strong>4. What bylaw governs animal control in Gimli?</strong></p><p>The municipality says animal control is regulated by By-law #20-0003.</p><p><strong>5. Does the RM currently publish a strong official dog-park page?</strong></p><p>Not in the reviewed municipal source set. As of Saturday, August 15, 2026, the strongest published material is the leash, beach, and animal-control guidance, so owners should verify any off-leash enclosure details directly with the RM.</p><p><strong>6. Who should I contact if I need to confirm current dog rules?</strong></p><p>The municipality's Animal Control page lists the Animal Control Officer at 204-642-4775.</p>",
    "Nearby Cities": "",
    "Updated On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[pageIndex] !== "/dog-parks/gimli/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/gimli/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateCitiesJson();
updateCityCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Gimli city page and refreshed backlog files.");
