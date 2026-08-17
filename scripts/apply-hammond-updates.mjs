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
  const line = '  "hammond-dog-off-leash-area": "/images/dog-parks/hammond-dog-off-leash-area-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "hampton-dog-park-saskatoon": "/images/dog-parks/hampton-dog-park-saskatoon-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "hammond-dog-off-leash-area");
  if (!park) throw new Error("Hammond record not found.");

  const seoTitle = "Hammond Dog Off-Leash Area | Maple Ridge, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Hammond Dog Off-Leash Area in Maple Ridge, covering its current official status, the city’s note that it was developed under the Golden Ears Bridge in 2018, and Maple Ridge’s current leash, waste, and licensing rules for off-leash parks.";
  const intro = "<p>Hammond Dog Off-Leash Area is one of Maple Ridge's current official dog off-leash parks. The city's current dog-park page specifically notes that the Hammond off-leash area was developed under the Golden Ears Bridge in 2018, which is the clearest current description of the site and its setting.</p>";
  const body = "<p>This page needed a factual rebuild because the older version made several unsupported claims about fencing, exact address, and park amenities. Maple Ridge's current public material supports a narrower but still useful page. The city's dogs-in-parks page lists Hammond Dog Off-Leash Area as one of the municipality's active off-leash parks and says the site was developed under the Golden Ears Bridge in 2018. That under-bridge setting is the most concrete current detail the city publishes about this park, and it is more reliable than repeating inherited fields that are not supported by a current municipal facility page.</p><p>The same Maple Ridge source is also useful for context. It explains that dogs must remain on leash in park areas unless they are in designated and signed off-leash zones, and it notes that owners are required to pick up after their pets and dispose of waste responsibly. Maple Ridge's animal control page reinforces the same rule citywide: dogs are not allowed to run off leash unless they are in one of the city's dog off-leash parks. Together, those pages are enough to confirm Hammond as a legitimate official destination without inventing unsupported features.</p><p>The current dogs-in-parks page also helps distinguish Hammond Dog Off-Leash Area from other Hammond-related planning in Maple Ridge. In the 2020 survey summary, the city separately mentioned exploring the opportunity for a future dog off-leash park at Hammond Stadium Park, which shows that the existing Hammond Dog Off-Leash Area and future Hammond-area planning should not be treated as the same site. This update improves the page by replacing generic filler with the city's current facts: official off-leash status, the Golden Ears Bridge setting, and the current Maple Ridge rules for leash use, licensing, and waste responsibility.</p>";
  const notes = "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks and https://www.mapleridge.ca/resident-services/animal-control . These sources support Hammond Dog Off-Leash Area's current official status, the city's statement that it was developed under the Golden Ears Bridge in 2018, and Maple Ridge's current leash and responsible-dog-ownership rules.</p>";

  park.title = "Hammond Dog Off-Leash Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Maple Ridge"],
    Province: ["British Columbia"],
    Tags: ["off-leash", "golden-ears-bridge", "official-city-park", "hammond"]
  };

  Object.assign(park.raw, {
    "Park Name": "Hammond Dog Off‑Leash Area",
    "Park Header": "Hammond Dog Off-Leash Area",
    "Description": body,
    "Street Address": "Under the Golden Ears Bridge in Hammond, Maple Ridge",
    "latitude": "",
    "longitude": "",
    "City": "Maple Ridge",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Unknown - verify on arrival",
    "Size": "Official neighbourhood off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes - under-bridge setting",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Follow posted city off-leash signs and site conditions",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Hammond+Dog+Off-Leash+Area+Maple+Ridge+BC",
    "Tags": "off-leash,golden-ears-bridge,official-city-park,hammond",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "hammond-dog-off-leash-area");
  if (!targetRow) throw new Error("Hammond CSV row not found.");
  const updates = {
    "Park Name": "Hammond Dog Off‑Leash Area",
    "Park Header": "Hammond Dog Off-Leash Area",
    "Description": "<p>This page needed a factual rebuild because the older version made several unsupported claims about fencing, exact address, and park amenities. Maple Ridge's current public material supports a narrower but still useful page. The city's dogs-in-parks page lists Hammond Dog Off-Leash Area as one of the municipality's active off-leash parks and says the site was developed under the Golden Ears Bridge in 2018. That under-bridge setting is the most concrete current detail the city publishes about this park, and it is more reliable than repeating inherited fields that are not supported by a current municipal facility page.</p><p>The same Maple Ridge source is also useful for context. It explains that dogs must remain on leash in park areas unless they are in designated and signed off-leash zones, and it notes that owners are required to pick up after their pets and dispose of waste responsibly. Maple Ridge's animal control page reinforces the same rule citywide: dogs are not allowed to run off leash unless they are in one of the city's dog off-leash parks. Together, those pages are enough to confirm Hammond as a legitimate official destination without inventing unsupported features.</p><p>The current dogs-in-parks page also helps distinguish Hammond Dog Off-Leash Area from other Hammond-related planning in Maple Ridge. In the 2020 survey summary, the city separately mentioned exploring the opportunity for a future dog off-leash park at Hammond Stadium Park, which shows that the existing Hammond Dog Off-Leash Area and future Hammond-area planning should not be treated as the same site. This update improves the page by replacing generic filler with the city's current facts: official off-leash status, the Golden Ears Bridge setting, and the current Maple Ridge rules for leash use, licensing, and waste responsibility.</p>",
    "Street Address": "Under the Golden Ears Bridge in Hammond, Maple Ridge",
    "latitude": "",
    "longitude": "",
    "City": "Maple Ridge",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Unknown - verify on arrival",
    "Size": "Official neighbourhood off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes - under-bridge setting",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Follow posted city off-leash signs and site conditions",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Hammond+Dog+Off-Leash+Area+Maple+Ridge+BC",
    "Tags": "off-leash,golden-ears-bridge,official-city-park,hammond",
    "Notes / Comments": "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks and https://www.mapleridge.ca/resident-services/animal-control . These sources support Hammond Dog Off-Leash Area's current official status, the city's statement that it was developed under the Golden Ears Bridge in 2018, and Maple Ridge's current leash and responsible-dog-ownership rules.</p>",
    "Intro Paragraph": "<p>Hammond Dog Off-Leash Area is one of Maple Ridge's current official dog off-leash parks. The city's current dog-park page specifically notes that the Hammond off-leash area was developed under the Golden Ears Bridge in 2018, which is the clearest current description of the site and its setting.</p>",
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Hammond Dog Off-Leash Area | Maple Ridge, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Hammond Dog Off-Leash Area in Maple Ridge, covering its current official status, the city’s note that it was developed under the Golden Ears Bridge in 2018, and Maple Ridge’s current leash, waste, and licensing rules for off-leash parks.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/hammond-dog-off-leash-area/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/hammond-dog-off-leash-area/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Hammond and refreshed backlog files.");
