import fs from "node:fs";

const parksJsonPath = "src/data/generated/parks.json";
const parkCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const overridesPath = "src/data/dog-park-image-overrides.js";
const backlogCsvPath = "reports/thin-page-backlog.csv";
const reviewQueueCsvPath = "reports/content-review-queue.csv";
const backlogSummaryPath = "reports/thin-page-backlog-summary.md";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
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

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  const line = '  "albion-fairgrounds-maple-ridge": "/images/dog-parks/albion-fairgrounds-maple-ridge-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "alexander-park-victoria": "/images/dog-parks/alexander-park-victoria-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "albion-fairgrounds-maple-ridge");
  if (!park) throw new Error("Albion Fairgrounds record not found.");

  const seoTitle = "Albion Fairgrounds Dog Park | Maple Ridge, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Albion Fairgrounds in Maple Ridge, including the Jim Robson Way location, off-leash dog park status, drinking water, washrooms, parking, walking trails, and the completed 2024–2025 dog-area improvements such as lighting, seating, drainage, shade trees, and a cooling misting feature.";
  const intro = "<p>Albion Fairgrounds is one of Maple Ridge's official off-leash dog park locations and part of a larger fairgrounds and recreation site on Jim Robson Way. The city's current facility page lists the fairgrounds as a public-use site with an off-leash dog park, open green space, drinking water, parking, washrooms, and walking trails.</p>";
  const body = "<p>This page needed a factual rebuild because the older version reduced Albion Fairgrounds to a generic big grassy dog park. Maple Ridge's current facility page gives a stronger and more useful picture. Albion Fairgrounds is a broader recreation complex at 23588 Jim Robson Way with public-use buildings, covered picnic areas, benches, open green space, portable and permanent washrooms, drinking water, parking, and walking and horse-trail access. The city explicitly lists an off-leash dog park among the site amenities, which confirms the park's current municipal status.</p><p>The dog-park improvement project page adds the details that actually improve trip planning. Maple Ridge says the Albion Fairgrounds dog off-leash area improvement project was completed in January 2025 after a series of 2024 upgrades. The city identifies lighting installed in February 2024, a dog cooling misting feature added in May 2024, additional seating for both the small and large dog areas, drainage and surfacing work to help keep feet and paws dry, and shade-tree planting completed through late 2024. The same page also notes that the earlier concept plan was revised to exclude a walking loop and agility features for the time being, which is exactly the kind of specificity that helps prevent us from overstating amenities.</p><p>This update replaces filler with what Maple Ridge actually publishes now: official off-leash status, the broader fairgrounds context, and the recent completed improvements that shape the current visitor experience. That includes the current mix of open green space, water, seating, washrooms, parking, and a dog area that has been actively upgraded rather than left as a stale legacy listing.</p>";
  const notes = "<p>Primary sources reviewed on August 17, 2026: https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks ; https://www.mapleridge.ca/art-parks-rec/recreation-facilities/albion-fairgrounds ; and https://www.mapleridge.ca/your-government/city-projects/albion-fairgrounds-dog-leash-area-improvements . These sources support Albion Fairgrounds' official off-leash status, the Jim Robson Way location, current amenity list, and the completed January 2025 off-leash-area improvements including lighting, drainage and surfacing work, a dog cooling misting feature, additional seating, and shade trees.</p>";

  park.title = "Albion Fairgrounds Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Maple Ridge"],
    Province: ["British Columbia"],
    Tags: ["off-leash", "fairgrounds", "misting-feature", "shade-trees"]
  };

  Object.assign(park.raw, {
    "Park Name": "Albion Fairgrounds",
    "Park Header": "Albion Fairgrounds Dog Park",
    "Description": body,
    "Street Address": "23588 Jim Robson Way",
    "latitude": "",
    "longitude": "",
    "City": "Maple Ridge",
    "Province": "British Columbia",
    "Postal Code": "V2W 1B8",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Yes - city improvement page references small and large dog areas",
    "Surface type": "Open green space with improved drainage and surfacing",
    "Size": "Large off-leash area within the fairgrounds complex",
    "Water source available": "Yes - drinking water and dog cooling misting feature",
    "Benches": "Yes",
    "Shaded area": "Yes - shade trees planted as part of improvements",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes",
    "Washrooms nearby": "Yes",
    "Operating hours": "",
    "Seasonal Restrictions": "Follow posted site rules and any city project or event notices",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/recreation-facilities/albion-fairgrounds",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=23588+Jim+Robson+Way+Maple+Ridge+BC",
    "Tags": "off-leash,fairgrounds,misting-feature,shade-trees",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "albion-fairgrounds-maple-ridge");
  if (!targetRow) throw new Error("Albion Fairgrounds CSV row not found.");
  const updates = {
    "Park Name": "Albion Fairgrounds",
    "Park Header": "Albion Fairgrounds Dog Park",
    "Description": "<p>This page needed a factual rebuild because the older version reduced Albion Fairgrounds to a generic big grassy dog park. Maple Ridge's current facility page gives a stronger and more useful picture. Albion Fairgrounds is a broader recreation complex at 23588 Jim Robson Way with public-use buildings, covered picnic areas, benches, open green space, portable and permanent washrooms, drinking water, parking, and walking and horse-trail access. The city explicitly lists an off-leash dog park among the site amenities, which confirms the park's current municipal status.</p><p>The dog-park improvement project page adds the details that actually improve trip planning. Maple Ridge says the Albion Fairgrounds dog off-leash area improvement project was completed in January 2025 after a series of 2024 upgrades. The city identifies lighting installed in February 2024, a dog cooling misting feature added in May 2024, additional seating for both the small and large dog areas, drainage and surfacing work to help keep feet and paws dry, and shade-tree planting completed through late 2024. The same page also notes that the earlier concept plan was revised to exclude a walking loop and agility features for the time being, which is exactly the kind of specificity that helps prevent us from overstating amenities.</p><p>This update replaces filler with what Maple Ridge actually publishes now: official off-leash status, the broader fairgrounds context, and the recent completed improvements that shape the current visitor experience. That includes the current mix of open green space, water, seating, washrooms, parking, and a dog area that has been actively upgraded rather than left as a stale legacy listing.</p>",
    "Street Address": "23588 Jim Robson Way",
    "latitude": "",
    "longitude": "",
    "City": "Maple Ridge",
    "Province": "British Columbia",
    "Postal Code": "V2W 1B8",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Yes - city improvement page references small and large dog areas",
    "Surface type": "Open green space with improved drainage and surfacing",
    "Size": "Large off-leash area within the fairgrounds complex",
    "Water source available": "Yes - drinking water and dog cooling misting feature",
    "Benches": "Yes",
    "Shaded area": "Yes - shade trees planted as part of improvements",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes",
    "Washrooms nearby": "Yes",
    "Operating hours": "",
    "Seasonal Restrictions": "Follow posted site rules and any city project or event notices",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/recreation-facilities/albion-fairgrounds",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=23588+Jim+Robson+Way+Maple+Ridge+BC",
    "Tags": "off-leash,fairgrounds,misting-feature,shade-trees",
    "Notes / Comments": "<p>Primary sources reviewed on August 17, 2026: https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks ; https://www.mapleridge.ca/art-parks-rec/recreation-facilities/albion-fairgrounds ; and https://www.mapleridge.ca/your-government/city-projects/albion-fairgrounds-dog-leash-area-improvements . These sources support Albion Fairgrounds' official off-leash status, the Jim Robson Way location, current amenity list, and the completed January 2025 off-leash-area improvements including lighting, drainage and surfacing work, a dog cooling misting feature, additional seating, and shade trees.</p>",
    "Intro Paragraph": "<p>Albion Fairgrounds is one of Maple Ridge's official off-leash dog park locations and part of a larger fairgrounds and recreation site on Jim Robson Way. The city's current facility page lists the fairgrounds as a public-use site with an off-leash dog park, open green space, drinking water, parking, washrooms, and walking trails.</p>",
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Albion Fairgrounds Dog Park | Maple Ridge, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Albion Fairgrounds in Maple Ridge, including the Jim Robson Way location, off-leash dog park status, drinking water, washrooms, parking, walking trails, and the completed 2024–2025 dog-area improvements such as lighting, seating, drainage, shade trees, and a cooling misting feature.",
    "Updated On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  };
  for (const [field, value] of Object.entries(updates)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }
  fs.writeFileSync(parkCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/albion-fairgrounds-maple-ridge/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/albion-fairgrounds-maple-ridge/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Albion Fairgrounds and refreshed backlog files.");
