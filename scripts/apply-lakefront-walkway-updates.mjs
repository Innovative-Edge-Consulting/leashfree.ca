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
  const line = '  "lakefront-walkway-dog-park-nelson": "/images/dog-parks/lakefront-walkway-dog-park-nelson-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "lac-beauchamp-north-off-leash-area": "/images/dog-parks/lac-beauchamp-north-off-leash-area-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "lakefront-walkway-dog-park-nelson");
  if (!park) throw new Error("Lakefront Walkway park record not found.");

  const seoTitle = "Lakefront Walkway Dog Park | Nelson, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Nelson's waterfront dog walk area, covering the Lakeside Drive setting, city dog-use mapping, Lakeside Park restrictions, and current waterfront pathway context.";
  const intro = "<p>This Nelson record is best understood as the city's waterfront dog walk area along Lakeside Drive rather than a conventional enclosed dog park. The City of Nelson's maps page publishes a <em>Waterfront Dog Use Areas</em> map, and City advisories refer to the lakeside dog walk and waterfront pathway along the lakeshore.</p>";
  const body = "<p>The most important quality improvement on this page is to stop overstating features that the City of Nelson does not currently publish on the reviewed source set. The older record described a designated off-leash section near the Prestige Lakeside Resort with detailed amenity claims, but Nelson's current public pages instead support a narrower description: the City publishes a dedicated <em>Waterfront Dog Use Areas</em> map, a separate downtown dog leash map, and multiple City notices that refer to the lakeside dog walk or dog park along the waterfront. Those notices place the route along Lakeside Drive and reference access near the Prestige Lakeside Resort, the west entrance by the airport, and the 900 block waterfront multi-use path zone.</p><p>The official sources also clarify what this area is not. Nelson's parks page and domestic-animals page both say Lakeside Park itself is a dog-free zone, except that dogs on leashes are permitted on the perimeter walkways of the playing fields. That means a useful page for visitors should distinguish the recognized waterfront dog walk area from Lakeside Park proper instead of blending them together. Current City news also shows the waterfront path remains an active civic-maintenance corridor: a February 2026 public works update mentions trail maintenance at the lakeside dog walk and waterfront pathway, while the City's active transportation page identifies the 900 block of Lakeside Drive between the Prestige Lakeside Resort and Chahko Mika Mall as a waterfront pathway upgrade area. Together, these sources support a practical waterfront dog-walk guide, but not a hard claim about fencing, water fountains, benches, bag dispensers, or exact off-leash boundaries unless those are verified on posted signage.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.nelson.ca/415/Maps, https://www.nelson.ca/320/Parks, https://nelson.ca/157/Domestic-Animals, https://nelson.ca/802/Active-Transportation, and https://www.nelson.ca/CivicAlerts.aspx?AID=991&ARC=1546. These sources support the existence of City-mapped waterfront dog-use areas, the lakeside dog walk and waterfront pathway references, the rule that Lakeside Park itself is dog-free except for leashed perimeter playing-field walkways, and the 900 block Lakeside Drive waterfront-path context. Specific amenity claims were intentionally removed where the reviewed official sources did not publish them.</p>";

  park.title = "Lakefront Walkway Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Nelson"],
    Province: ["British Columbia"],
    Tags: ["waterfront", "dog-walk", "lakeside-drive", "nelson"]
  };

  Object.assign(park.raw, {
    "Park Name": "Lakefront Walkway Dog Park",
    "Park Header": "Lakefront Walkway Dog Park",
    "Description": body,
    "Street Address": "Waterfront path along Lakeside Drive near the Prestige Lakeside Resort",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "No published dedicated small-dog area in reviewed official sources",
    "Surface type": "Waterfront multi-use path and shoreline edge",
    "Size": "Linear waterfront dog-walk area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Partial",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Biodegradable dog waste bags referenced in City advisory",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Lakeside Park itself is dog-free except for leashed perimeter playing-field walkways; verify posted waterfront dog-use signage on arrival",
    "Park Website or Source": "https://www.nelson.ca/415/Maps",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Prestige+Lakeside+Resort+Nelson+BC",
    "Tags": "waterfront,dog-walk,lakeside-drive,nelson",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "lakefront-walkway-dog-park-nelson");
  if (!targetRow) throw new Error("Lakefront Walkway park CSV row not found.");

  const updates = {
    "Park Name": "Lakefront Walkway Dog Park",
    "Park Header": "Lakefront Walkway Dog Park",
    "Description": "<p>The most important quality improvement on this page is to stop overstating features that the City of Nelson does not currently publish on the reviewed source set. The older record described a designated off-leash section near the Prestige Lakeside Resort with detailed amenity claims, but Nelson's current public pages instead support a narrower description: the City publishes a dedicated <em>Waterfront Dog Use Areas</em> map, a separate downtown dog leash map, and multiple City notices that refer to the lakeside dog walk or dog park along the waterfront. Those notices place the route along Lakeside Drive and reference access near the Prestige Lakeside Resort, the west entrance by the airport, and the 900 block waterfront multi-use path zone.</p><p>The official sources also clarify what this area is not. Nelson's parks page and domestic-animals page both say Lakeside Park itself is a dog-free zone, except that dogs on leashes are permitted on the perimeter walkways of the playing fields. That means a useful page for visitors should distinguish the recognized waterfront dog walk area from Lakeside Park proper instead of blending them together. Current City news also shows the waterfront path remains an active civic-maintenance corridor: a February 2026 public works update mentions trail maintenance at the lakeside dog walk and waterfront pathway, while the City's active transportation page identifies the 900 block of Lakeside Drive between the Prestige Lakeside Resort and Chahko Mika Mall as a waterfront pathway upgrade area. Together, these sources support a practical waterfront dog-walk guide, but not a hard claim about fencing, water fountains, benches, bag dispensers, or exact off-leash boundaries unless those are verified on posted signage.</p>",
    "Street Address": "Waterfront path along Lakeside Drive near the Prestige Lakeside Resort",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "No published dedicated small-dog area in reviewed official sources",
    "Surface type": "Waterfront multi-use path and shoreline edge",
    "Size": "Linear waterfront dog-walk area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Partial",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Biodegradable dog waste bags referenced in City advisory",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Lakeside Park itself is dog-free except for leashed perimeter playing-field walkways; verify posted waterfront dog-use signage on arrival",
    "Park Website or Source": "https://www.nelson.ca/415/Maps",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Prestige+Lakeside+Resort+Nelson+BC",
    "Tags": "waterfront,dog-walk,lakeside-drive,nelson",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.nelson.ca/415/Maps, https://www.nelson.ca/320/Parks, https://nelson.ca/157/Domestic-Animals, https://nelson.ca/802/Active-Transportation, and https://www.nelson.ca/CivicAlerts.aspx?AID=991&ARC=1546. These sources support the existence of City-mapped waterfront dog-use areas, the lakeside dog walk and waterfront pathway references, the rule that Lakeside Park itself is dog-free except for leashed perimeter playing-field walkways, and the 900 block Lakeside Drive waterfront-path context. Specific amenity claims were intentionally removed where the reviewed official sources did not publish them.</p>",
    "Intro Paragraph": "<p>This Nelson record is best understood as the city's waterfront dog walk area along Lakeside Drive rather than a conventional enclosed dog park. The City of Nelson's maps page publishes a <em>Waterfront Dog Use Areas</em> map, and City advisories refer to the lakeside dog walk and waterfront pathway along the lakeshore.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Lakefront Walkway Dog Park | Nelson, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Nelson's waterfront dog walk area, covering the Lakeside Drive setting, city dog-use mapping, Lakeside Park restrictions, and current waterfront pathway context.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/lakefront-walkway-dog-park-nelson/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/lakefront-walkway-dog-park-nelson/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Lakefront Walkway Dog Park and refreshed backlog files.");
