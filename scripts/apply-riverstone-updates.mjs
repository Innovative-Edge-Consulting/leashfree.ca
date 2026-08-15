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

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  const line = '  "riverstone-dog-park": "/images/dog-parks/riverstone-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "ruth-johnson-park": "/images/dog-parks/ruth-johnson-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "riverstone-dog-park");
  if (!park) throw new Error("RiverStone park record not found.");

  const seoTitle = "RiverStone Dog Park | Lethbridge, AB | LeashFree.ca";
  const metaDescription = "Source-backed guide to RiverStone Dog Park in Lethbridge, covering the official 4 RiverGrove Lane West location, fenced layout, small-dog area, water fountain, and current flooding or wet-weather closure caveat.";
  const intro = "<p>RiverStone Dog Park is a City of Lethbridge off-leash park at 4 RiverGrove Lane West. The City says the off-leash area is completely fenced and includes features such as a dedicated small-dog area, water fountain, shaded seating, play equipment and parking.</p>";
  const body = "<p>RiverStone is one of the stronger official park pages in this backlog because the City of Lethbridge publishes both amenities and operating cautions for the site. The current City page places RiverStone Dog Park at 4 RiverGrove Lane West and describes it as a small off-leash park located just off University Drive and RiverGlen Link West. Lethbridge says the off-leash area is completely fenced for safety and comfort and includes shaded picnic tables, a water fountain for people and dogs, a dedicated small-dog area, dog play equipment, limestone trails, a doggie bag dispenser, a garbage receptacle and a parking lot, with additional on-street parking nearby.</p><p>The current page also gives visitors an operational warning that is more useful than generic copy. RiverStone Dog Park sits within a dryland stormwater facility and may flood during heavy rain events. Because of that function, the City says the park may be closed during harsh or wet weather, with closures posted on the City of Lethbridge social media pages. The posted rules are straightforward: owners may exercise dogs without a leash only in the mapped area, dogs should remain leashed until inside the fenced zone, handlers must remain in control of their dogs at all times, owners must clean up after their dogs, and the small-dog area is limited to dogs under 25 pounds (11 kilograms).</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/west-parks-and-playgrounds/riverstone-dog-park/ and https://www.lethbridge.ca/parks-leisure-recreation/leisure-and-recreation-maps/. These sources support the 4 RiverGrove Lane West location, the fully fenced layout, small-dog area, water fountain, parking, trails, wet-weather closure warning, and the current dog-run map and rules.</p>";

  park.title = "RiverStone Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Lethbridge"],
    Province: ["Alberta"],
    Tags: ["off-leash", "fenced", "small-dog-area", "stormwater-facility"]
  };

  Object.assign(park.raw, {
    "Park Name": "RiverStone Dog Park",
    "Park Header": "RiverStone Dog Park",
    "Description": body,
    "Street Address": "4 RiverGrove Lane West",
    "latitude": "",
    "longitude": "",
    "City": "Lethbridge",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes - completely fenced",
    "Separate Small Dog Area": "Yes - for dogs under 25 lbs (11 kg)",
    "Surface type": "Grass and limestone trails",
    "Size": "Small",
    "Water source available": "Yes - water fountain for humans and dogs",
    "Benches": "Yes - shaded picnic tables and benches",
    "Shaded area": "Yes",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Yes - parking lot plus additional on-street parking",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "May flood during heavy rain events and may close in harsh, wet weather; check City of Lethbridge social media for closures",
    "Park Website or Source": "https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/west-parks-and-playgrounds/riverstone-dog-park/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=4+RiverGrove+Lane+West+Lethbridge+AB",
    "Tags": "off-leash,fenced,small-dog-area,stormwater-facility",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "riverstone-dog-park");
  if (!targetRow) throw new Error("RiverStone CSV row not found.");

  const updates = {
    "Park Name": "RiverStone Dog Park",
    "Park Header": "RiverStone Dog Park",
    "Description": "<p>RiverStone is one of the stronger official park pages in this backlog because the City of Lethbridge publishes both amenities and operating cautions for the site. The current City page places RiverStone Dog Park at 4 RiverGrove Lane West and describes it as a small off-leash park located just off University Drive and RiverGlen Link West. Lethbridge says the off-leash area is completely fenced for safety and comfort and includes shaded picnic tables, a water fountain for people and dogs, a dedicated small-dog area, dog play equipment, limestone trails, a doggie bag dispenser, a garbage receptacle and a parking lot, with additional on-street parking nearby.</p><p>The current page also gives visitors an operational warning that is more useful than generic copy. RiverStone Dog Park sits within a dryland stormwater facility and may flood during heavy rain events. Because of that function, the City says the park may be closed during harsh or wet weather, with closures posted on the City of Lethbridge social media pages. The posted rules are straightforward: owners may exercise dogs without a leash only in the mapped area, dogs should remain leashed until inside the fenced zone, handlers must remain in control of their dogs at all times, owners must clean up after their dogs, and the small-dog area is limited to dogs under 25 pounds (11 kilograms).</p>",
    "Street Address": "4 RiverGrove Lane West",
    "latitude": "",
    "longitude": "",
    "City": "Lethbridge",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes - completely fenced",
    "Separate Small Dog Area": "Yes - for dogs under 25 lbs (11 kg)",
    "Surface type": "Grass and limestone trails",
    "Size": "Small",
    "Water source available": "Yes - water fountain for humans and dogs",
    "Benches": "Yes - shaded picnic tables and benches",
    "Shaded area": "Yes",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Yes - parking lot plus additional on-street parking",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "May flood during heavy rain events and may close in harsh, wet weather; check City of Lethbridge social media for closures",
    "Park Website or Source": "https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/west-parks-and-playgrounds/riverstone-dog-park/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=4+RiverGrove+Lane+West+Lethbridge+AB",
    "Tags": "off-leash,fenced,small-dog-area,stormwater-facility",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/west-parks-and-playgrounds/riverstone-dog-park/ and https://www.lethbridge.ca/parks-leisure-recreation/leisure-and-recreation-maps/. These sources support the 4 RiverGrove Lane West location, the fully fenced layout, small-dog area, water fountain, parking, trails, wet-weather closure warning, and the current dog-run map and rules.</p>",
    "Intro Paragraph": "<p>RiverStone Dog Park is a City of Lethbridge off-leash park at 4 RiverGrove Lane West. The City says the off-leash area is completely fenced and includes features such as a dedicated small-dog area, water fountain, shaded seating, play equipment and parking.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "RiverStone Dog Park | Lethbridge, AB | LeashFree.ca",
    "Meta Description": "Source-backed guide to RiverStone Dog Park in Lethbridge, covering the official 4 RiverGrove Lane West location, fenced layout, small-dog area, water fountain, and current flooding or wet-weather closure caveat.",
    "Updated On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/riverstone-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/riverstone-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated RiverStone Dog Park and refreshed backlog files.");
