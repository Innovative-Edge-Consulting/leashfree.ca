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
  const line = '  "sheffield-dog-off-leash-area": "/images/dog-parks/sheffield-dog-off-leash-area-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "shaughnessy": "/images/dog-parks/shaughnessy-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "sheffield-dog-off-leash-area");
  if (!park) throw new Error("Sheffield record not found.");

  const seoTitle = "Sheffield Dog Off-Leash Area | Chilliwack, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Sheffield Dog Off-Leash Area in Chilliwack, including the 7215 Sheffield Way location, separated small and large dog sections, square-metre sizing, benches, gravel access path, drinking water amenity, and the July 28 to 30, 2026 maintenance closure notice.";
  const intro = "<p>Sheffield Dog Off-Leash Area is an official City of Chilliwack dog park at 7215 Sheffield Way. The city's current park page describes two separated play areas for different dog sizes, benches in each section, and a gravel walking path linking the site between Webb Avenue and Gordon Drive.</p>";
  const body = "<p>This page needed a factual rebuild because the old copy reduced Sheffield to a generic grassy fenced lot. Chilliwack's current park page is much more specific. The city says Sheffield Dog Off-Leash Area has two separated spaces for different dog sizes: a 2,300 square metre small-dog area and a 3,800 square metre larger-dog area. Together, the site totals 6,100 square metres, or a little over half a hectare, which is a much more useful description than a vague \"medium\" label.</p><p>The city also publishes practical layout details that matter on arrival. There are benches in each area of the park, and a gravel walking path runs along the edge of the property, connecting the neighbourhood and allowing pedestrians to walk between Webb Avenue and Gordon Drive. Chilliwack's current amenities index also classifies Sheffield as a dog off-leash park with drinking water, which is stronger and more current than the older page's unsupported \"No\" field for water.</p><p>There is also current maintenance context. The City of Chilliwack posted that Sheffield Dog Park was temporarily closed for maintenance from July 28 to July 30, 2026. That short closure is already in the past as of Sunday, August 16, 2026, but it is still useful evidence that the municipality actively maintains the site. This update replaces generic filler with the city's current facts: exact location, separated small and large dog sections, square-metre sizing, benches, edge-path connection, and the recent maintenance notice.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://www.chilliwack.com/main/page.cfm?id=2579 ; https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=185 ; https://www.chilliwack.com/main/page.cfm?backTo=%26dowhat%3DlocationView%26plID%3D33&dowhat=amenityView&id=1754&paID=26&plID=33 ; and https://www.chilliwack.com/main/page.cfm?id=6 . These sources support Sheffield's official off-leash status, the 7215 Sheffield Way map location, the separated 2,300 square metre small-dog area and 3,800 square metre larger-dog area, benches, gravel path connection, drinking water amenity, and the July 28 to July 30, 2026 maintenance closure notice.</p>";

  park.title = "Sheffield Dog Off-Leash Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Chilliwack"],
    Province: ["British Columbia"],
    Tags: ["off-leash", "separate-dog-areas", "gravel-path", "drinking-water"]
  };

  Object.assign(park.raw, {
    "Park Name": "Sheffield Dog Off Leash Area",
    "Park Header": "Sheffield Dog Off-Leash Area",
    "Description": body,
    "Street Address": "7215 Sheffield Way",
    "latitude": "",
    "longitude": "",
    "City": "Chilliwack",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Yes",
    "Surface type": "Grass with gravel access path",
    "Size": "6,100 square metres total",
    "Water source available": "Yes",
    "Benches": "Yes - benches in each area",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Temporary maintenance closures may occur",
    "Park Website or Source": "https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=185",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=7215+Sheffield+Way+Chilliwack+BC",
    "Tags": "off-leash,separate-dog-areas,gravel-path,drinking-water",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "sheffield-dog-off-leash-area");
  if (!targetRow) throw new Error("Sheffield CSV row not found.");
  const updates = {
    "Park Name": "Sheffield Dog Off Leash Area",
    "Park Header": "Sheffield Dog Off-Leash Area",
    "Description": "<p>This page needed a factual rebuild because the old copy reduced Sheffield to a generic grassy fenced lot. Chilliwack's current park page is much more specific. The city says Sheffield Dog Off-Leash Area has two separated spaces for different dog sizes: a 2,300 square metre small-dog area and a 3,800 square metre larger-dog area. Together, the site totals 6,100 square metres, or a little over half a hectare, which is a much more useful description than a vague \"medium\" label.</p><p>The city also publishes practical layout details that matter on arrival. There are benches in each area of the park, and a gravel walking path runs along the edge of the property, connecting the neighbourhood and allowing pedestrians to walk between Webb Avenue and Gordon Drive. Chilliwack's current amenities index also classifies Sheffield as a dog off-leash park with drinking water, which is stronger and more current than the older page's unsupported \"No\" field for water.</p><p>There is also current maintenance context. The City of Chilliwack posted that Sheffield Dog Park was temporarily closed for maintenance from July 28 to July 30, 2026. That short closure is already in the past as of Sunday, August 16, 2026, but it is still useful evidence that the municipality actively maintains the site. This update replaces generic filler with the city's current facts: exact location, separated small and large dog sections, square-metre sizing, benches, edge-path connection, and the recent maintenance notice.</p>",
    "Street Address": "7215 Sheffield Way",
    "latitude": "",
    "longitude": "",
    "City": "Chilliwack",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Yes",
    "Surface type": "Grass with gravel access path",
    "Size": "6,100 square metres total",
    "Water source available": "Yes",
    "Benches": "Yes - benches in each area",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Temporary maintenance closures may occur",
    "Park Website or Source": "https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=185",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=7215+Sheffield+Way+Chilliwack+BC",
    "Tags": "off-leash,separate-dog-areas,gravel-path,drinking-water",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://www.chilliwack.com/main/page.cfm?id=2579 ; https://www.chilliwack.com/main/page.cfm?dowhat=locationView&id=1754&plID=185 ; https://www.chilliwack.com/main/page.cfm?backTo=%26dowhat%3DlocationView%26plID%3D33&dowhat=amenityView&id=1754&paID=26&plID=33 ; and https://www.chilliwack.com/main/page.cfm?id=6 . These sources support Sheffield's official off-leash status, the 7215 Sheffield Way map location, the separated 2,300 square metre small-dog area and 3,800 square metre larger-dog area, benches, gravel path connection, drinking water amenity, and the July 28 to July 30, 2026 maintenance closure notice.</p>",
    "Intro Paragraph": "<p>Sheffield Dog Off-Leash Area is an official City of Chilliwack dog park at 7215 Sheffield Way. The city's current park page describes two separated play areas for different dog sizes, benches in each section, and a gravel walking path linking the site between Webb Avenue and Gordon Drive.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Sheffield Dog Off-Leash Area | Chilliwack, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Sheffield Dog Off-Leash Area in Chilliwack, including the 7215 Sheffield Way location, separated small and large dog sections, square-metre sizing, benches, gravel access path, drinking water amenity, and the July 28 to 30, 2026 maintenance closure notice.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/sheffield-dog-off-leash-area/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/sheffield-dog-off-leash-area/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Sheffield and refreshed backlog files.");
