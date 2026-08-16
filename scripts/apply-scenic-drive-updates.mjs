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
  const line = '  "scenic-drive-dog-run": "/images/dog-parks/scenic-drive-dog-run-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "snetsinger-park-cornwall": "/images/dog-parks/snetsinger-park-cornwall-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "scenic-drive-dog-run");
  if (!park) throw new Error("Scenic Drive Dog Run record not found.");

  const seoTitle = "Scenic Drive Dog Run | Lethbridge, AB | LeashFree.ca";
  const metaDescription = "Source-backed guide to Scenic Drive Dog Run in Lethbridge, covering the official 1107 6 Street South location, the 2 km limestone pathway loop, steep sections with stairs, benches, waste bins, and current dog-run rules.";
  const intro = "<p>Scenic Drive Dog Run is a City of Lethbridge off-leash dog area on the city's south side at 1107 6 Street South. The current City page describes it as a 2 km limestone pathway loop that heads down and around the coulee for a more workout-oriented visit than a typical flat dog park.</p>";
  const body = "<p>This page needed a factual rebuild because Lethbridge now publishes a dedicated page for Scenic Drive Dog Run with much stronger visitor guidance than the older generic description. The City's current page says the turnoff to the parking lot is shared with Radiology Associates close to 10 Avenue South, and that the off-leash area heads down and around the coulee as a 2 km limestone pathway loop. The same page warns that some sections of the pathways are steep and that stairs have been installed where the grades were hazardous, which is exactly the kind of terrain information dog owners need before visiting.</p><p>The City also publishes several practical amenities and rules. Scenic Drive Dog Run has dog waste bags, garbage bins and benches located throughout the park. Lethbridge's current site-specific rules say dogs may be off leash only in the mapped area, dogs should remain on leash until past the marker signs, handlers must remain in control of their dogs at all times, waste cleanup is required, and users should be respectful, safe and have fun. The broader Lethbridge dog-park etiquette page reinforces that off-leash areas are located within shared park spaces and notes that rattlesnakes may be present in river valley parks from spring to fall, especially west side areas.</p><p>This update replaces weak filler with what the City actually publishes now: the exact location, coulee-loop layout, limestone surface, steep grades and stairs, and the current Lethbridge rules for using the run safely.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/south-parks-and-playgrounds/scenic-drive-dog-run/ and https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/. These sources support the 1107 6 Street South location, shared parking-lot turnoff near 10 Avenue South, 2 km limestone pathway loop, steep sections and stairs, benches, waste bins, and the current dog-run rules.</p>";

  park.title = "Scenic Drive Dog Run";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Lethbridge"],
    Province: ["Alberta"],
    Tags: ["off-leash", "limestone-loop", "coulee-path", "steep-terrain"]
  };

  Object.assign(park.raw, {
    "Park Name": "Scenic Drive Dog Run",
    "Park Header": "Scenic Drive Dog Run",
    "Description": body,
    "Street Address": "1107 6 Street South",
    "latitude": "",
    "longitude": "",
    "City": "Lethbridge",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Limestone pathway loop and grass",
    "Size": "2 km loop",
    "Water source available": "Unknown",
    "Benches": "Yes",
    "Shaded area": "Unknown",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Yes - turnoff shared with Radiology Associates near 10 Avenue South",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Steep sections and stairs; use caution on grades",
    "Park Website or Source": "https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/south-parks-and-playgrounds/scenic-drive-dog-run/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=1107+6+Street+South+Lethbridge+AB",
    "Tags": "off-leash,limestone-loop,coulee-path,steep-terrain",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "scenic-drive-dog-run");
  if (!targetRow) throw new Error("Scenic Drive CSV row not found.");
  const updates = {
    "Park Name": "Scenic Drive Dog Run",
    "Park Header": "Scenic Drive Dog Run",
    "Description": "<p>This page needed a factual rebuild because Lethbridge now publishes a dedicated page for Scenic Drive Dog Run with much stronger visitor guidance than the older generic description. The City's current page says the turnoff to the parking lot is shared with Radiology Associates close to 10 Avenue South, and that the off-leash area heads down and around the coulee as a 2 km limestone pathway loop. The same page warns that some sections of the pathways are steep and that stairs have been installed where the grades were hazardous, which is exactly the kind of terrain information dog owners need before visiting.</p><p>The City also publishes several practical amenities and rules. Scenic Drive Dog Run has dog waste bags, garbage bins and benches located throughout the park. Lethbridge's current site-specific rules say dogs may be off leash only in the mapped area, dogs should remain on leash until past the marker signs, handlers must remain in control of their dogs at all times, waste cleanup is required, and users should be respectful, safe and have fun. The broader Lethbridge dog-park etiquette page reinforces that off-leash areas are located within shared park spaces and notes that rattlesnakes may be present in river valley parks from spring to fall, especially west side areas.</p><p>This update replaces weak filler with what the City actually publishes now: the exact location, coulee-loop layout, limestone surface, steep grades and stairs, and the current Lethbridge rules for using the run safely.</p>",
    "Street Address": "1107 6 Street South",
    "latitude": "",
    "longitude": "",
    "City": "Lethbridge",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Limestone pathway loop and grass",
    "Size": "2 km loop",
    "Water source available": "Unknown",
    "Benches": "Yes",
    "Shaded area": "Unknown",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Yes - turnoff shared with Radiology Associates near 10 Avenue South",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Steep sections and stairs; use caution on grades",
    "Park Website or Source": "https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/south-parks-and-playgrounds/scenic-drive-dog-run/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=1107+6+Street+South+Lethbridge+AB",
    "Tags": "off-leash,limestone-loop,coulee-path,steep-terrain",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/south-parks-and-playgrounds/scenic-drive-dog-run/ and https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/. These sources support the 1107 6 Street South location, shared parking-lot turnoff near 10 Avenue South, 2 km limestone pathway loop, steep sections and stairs, benches, waste bins, and the current dog-run rules.</p>",
    "Intro Paragraph": "<p>Scenic Drive Dog Run is a City of Lethbridge off-leash dog area on the city's south side at 1107 6 Street South. The current City page describes it as a 2 km limestone pathway loop that heads down and around the coulee for a more workout-oriented visit than a typical flat dog park.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Scenic Drive Dog Run | Lethbridge, AB | LeashFree.ca",
    "Meta Description": "Source-backed guide to Scenic Drive Dog Run in Lethbridge, covering the official 1107 6 Street South location, the 2 km limestone pathway loop, steep sections with stairs, benches, waste bins, and current dog-run rules.",
    "Updated On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/scenic-drive-dog-run/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/scenic-drive-dog-run/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Scenic Drive Dog Run and refreshed backlog files.");
