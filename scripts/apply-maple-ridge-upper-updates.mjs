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
  const line = '  "maple-ridge-upper-park": "/images/dog-parks/maple-ridge-upper-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "maple-grove-park": "/images/dog-parks/maple-grove-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "maple-ridge-upper-park");
  if (!park) throw new Error("Maple Ridge Upper Park record not found.");

  const seoTitle = "Maple Ridge Upper Park Dog Off-Leash Area | Maple Ridge, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Maple Ridge Upper Park, covering the current Maple Ridge Park dog off-leash area, agility course, off-leash trail loop, misting station, and the south parking lot closure that began June 11, 2026 with overflow parking on 132 Avenue.";
  const intro = "<p>Maple Ridge Upper Park is the dog off-leash area within Maple Ridge Park. The current City pages place it inside the larger Maple Ridge Park site and describe a substantial urban dog area with open grass, a dog off-leash trail loop, an agility course and a misting station for dogs.</p>";
  const body = "<p>This page needed a full reset because the current City of Maple Ridge sources are much stronger than the thin record they replace. Maple Ridge's current dogs-in-parks page still lists Maple Ridge Upper Park among the City's official off-leash dog parks, and the current Maple Ridge Park facility page now gives meaningful detail about the broader park and the dog area itself. The City page for Maple Ridge Park was last updated on July 7, 2026 and includes a dog off-leash feature image plus the park's full amenities list.</p><p>The most important current trip-planning detail is that the south parking lot at 232 Street has been temporarily closed for construction and drainage improvements starting June 11, 2026. The City says a temporary overflow parking lot with more than 100 stalls is available north of the park on 132 Avenue. That is exactly the kind of practical current-use information thin pages usually miss. The park page also gives the current park address as 13180 232 Street / 23280 132 Avenue and lists amenities that matter to dog owners and mixed-use visitors, including drinking water, washrooms, trails, parking, open green space and the off-leash dog park.</p><p>Maple Ridge's dog-park survey material and the current Maple Ridge Park page together add useful context about how the off-leash area functions. The dogs-in-parks page says the City was considering expansion of the Maple Ridge Upper dog off-leash park by including the remaining field area, while the current facility page's dog-off leash feature image is captioned as a dog-off leash area with exciting obstacles for dogs. The feature information also supports on-site details such as the agility course, the off-leash path loop, the misting station for dogs and the large open green area. This is a stronger, more specific page because it now reflects what Maple Ridge actually publishes rather than carrying generic claims forward.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks and https://www.mapleridge.ca/art-parks-rec/recreation-facilities/maple-ridge-park. These sources support Maple Ridge Upper Park's current status as an official off-leash dog park within Maple Ridge Park, the July 7, 2026 Maple Ridge Park update, the June 11, 2026 south parking lot closure and overflow parking lot, and the current dog-area features including the agility course, off-leash trail loop and misting station.</p>";

  park.title = "Maple Ridge Upper Park Dog Off-Leash Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Maple Ridge"],
    Province: ["British Columbia"],
    Tags: ["off-leash", "agility-course", "trail-loop", "parking-closure-2026"]
  };

  Object.assign(park.raw, {
    "Park Name": "Maple Ridge Upper Park",
    "Park Header": "Maple Ridge Upper Park Dog Off-Leash Area",
    "Description": body,
    "Street Address": "13180 232 Street / 23280 132 Avenue",
    "latitude": "",
    "longitude": "",
    "City": "Maple Ridge",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and off-leash trail loop",
    "Size": "Large urban dog park area within Maple Ridge Park",
    "Water source available": "Yes - drinking water and dog misting station",
    "Benches": "Yes",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - temporary overflow lot north of the park on 132 Avenue while south lot is closed",
    "Washrooms nearby": "Yes",
    "Operating hours": "",
    "Seasonal Restrictions": "South parking lot at 232 Street temporarily closed starting June 11, 2026 for construction and drainage improvements",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/recreation-facilities/maple-ridge-park",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=13180+232+Street+Maple+Ridge+BC",
    "Tags": "off-leash,agility-course,trail-loop,parking-closure-2026",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "maple-ridge-upper-park");
  if (!targetRow) throw new Error("Maple Ridge Upper CSV row not found.");
  const updates = {
    "Park Name": "Maple Ridge Upper Park",
    "Park Header": "Maple Ridge Upper Park Dog Off-Leash Area",
    "Description": "<p>This page needed a full reset because the current City of Maple Ridge sources are much stronger than the thin record they replace. Maple Ridge's current dogs-in-parks page still lists Maple Ridge Upper Park among the City's official off-leash dog parks, and the current Maple Ridge Park facility page now gives meaningful detail about the broader park and the dog area itself. The City page for Maple Ridge Park was last updated on July 7, 2026 and includes a dog off-leash feature image plus the park's full amenities list.</p><p>The most important current trip-planning detail is that the south parking lot at 232 Street has been temporarily closed for construction and drainage improvements starting June 11, 2026. The City says a temporary overflow parking lot with more than 100 stalls is available north of the park on 132 Avenue. That is exactly the kind of practical current-use information thin pages usually miss. The park page also gives the current park address as 13180 232 Street / 23280 132 Avenue and lists amenities that matter to dog owners and mixed-use visitors, including drinking water, washrooms, trails, parking, open green space and the off-leash dog park.</p><p>Maple Ridge's dog-park survey material and the current Maple Ridge Park page together add useful context about how the off-leash area functions. The dogs-in-parks page says the City was considering expansion of the Maple Ridge Upper dog off-leash park by including the remaining field area, while the current facility page's dog-off leash feature image is captioned as a dog-off leash area with exciting obstacles for dogs. The feature information also supports on-site details such as the agility course, the off-leash path loop, the misting station for dogs and the large open green area. This is a stronger, more specific page because it now reflects what Maple Ridge actually publishes rather than carrying generic claims forward.</p>",
    "Street Address": "13180 232 Street / 23280 132 Avenue",
    "latitude": "",
    "longitude": "",
    "City": "Maple Ridge",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and off-leash trail loop",
    "Size": "Large urban dog park area within Maple Ridge Park",
    "Water source available": "Yes - drinking water and dog misting station",
    "Benches": "Yes",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - temporary overflow lot north of the park on 132 Avenue while south lot is closed",
    "Washrooms nearby": "Yes",
    "Operating hours": "",
    "Seasonal Restrictions": "South parking lot at 232 Street temporarily closed starting June 11, 2026 for construction and drainage improvements",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/recreation-facilities/maple-ridge-park",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=13180+232+Street+Maple+Ridge+BC",
    "Tags": "off-leash,agility-course,trail-loop,parking-closure-2026",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks and https://www.mapleridge.ca/art-parks-rec/recreation-facilities/maple-ridge-park. These sources support Maple Ridge Upper Park's current status as an official off-leash dog park within Maple Ridge Park, the July 7, 2026 Maple Ridge Park update, the June 11, 2026 south parking lot closure and overflow parking lot, and the current dog-area features including the agility course, off-leash trail loop and misting station.</p>",
    "Intro Paragraph": "<p>Maple Ridge Upper Park is the dog off-leash area within Maple Ridge Park. The current City pages place it inside the larger Maple Ridge Park site and describe a substantial urban dog area with open grass, a dog off-leash trail loop, an agility course and a misting station for dogs.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Maple Ridge Upper Park Dog Off-Leash Area | Maple Ridge, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Maple Ridge Upper Park, covering the current Maple Ridge Park dog off-leash area, agility course, off-leash trail loop, misting station, and the south parking lot closure that began June 11, 2026 with overflow parking on 132 Avenue.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/maple-ridge-upper-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/maple-ridge-upper-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Maple Ridge Upper Park and refreshed backlog files.");
