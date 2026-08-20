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
  return `${rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    )
    .join("\n")}\n`;
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  const line = '  "high-park": "/images/dog-parks/high-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "hidden-valley-park": "/images/dog-parks/hidden-valley-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${line}${anchor}`));
}

function getContent() {
  const seoTitle = "High Park Dogs Off-Leash Area | Toronto, ON | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to High Park's dogs off-leash area in Toronto, including the two current off-leash locations, the 8.5-acre off-leash area and trail network, 2026 fencing and restoration work, and current citywide off-leash rules.";
  const intro =
    "<p>High Park has one of Toronto's best-documented dogs off-leash setups. The City currently says dogs off-leash areas are located <strong>along the east side of Colborne Lodge Drive north of Centre Road</strong> and <strong>near the east edge of Allotment Lane</strong>, with <strong>Allotment Lane itself remaining on-leash only</strong>.</p>";
  const body =
    "<p>The current City of Toronto High Park pages give this route much stronger factual footing than the older generic copy. Toronto's main High Park page now identifies the exact dogs off-leash locations inside the park instead of describing the whole park as one undifferentiated dog space. That distinction matters because High Park is a mixed-use destination park with sensitive habitat, paved routes, natural-surface trails, gardens, and heavy pedestrian traffic.</p><p>The city's dedicated off-leash improvement page adds the key scale and management context. It describes the <strong>High Park Off-Leash Area (OLA)</strong> as <strong>8.5 acres</strong> of <strong>open area and designated trails</strong>, both <strong>natural and paved</strong>, under a canopy of mature trees. The same page explains why the city has been actively modifying the area: it sits next to <strong>Environmentally Significant Areas</strong> including rare Black Oak Savannah, and older fencing and gate conditions allowed dogs and people to enter sensitive natural areas, contributing to erosion and vegetation loss.</p><p>Toronto's current work program is also worth keeping on the page because it directly affects the visiting experience in <strong>2026</strong>. The High Park OLA improvement page says <strong>Phase 3 is upcoming in 2026</strong>, following earlier phases of fencing, gate changes, invasive-species work, and restoration planting. The June 16, 2026 project update also says licensed staff and contractors would be treating Dog-Strangling Vine with pesticides in <strong>June and July 2026</strong>, with posted warning signs and temporary avoidance areas. Even where those exact treatment windows have passed, the broader project remains active in 2026 and visitors should expect restoration-related fencing, trail changes, and posted notices.</p><p>The citywide Toronto rules still apply inside the OLA. Dogs using off-leash areas must be <strong>licensed and vaccinated</strong>. Dogs that are aggressive, dogs in heat, dogs under a Dangerous Dog Order, and pit bulls as defined by the provincial act are not permitted. Owners must follow signs and boundaries, scoop waste, keep dogs attended, and remember that off-leash access does not extend into on-leash sections of the park just because they are nearby.</p><p>This update improves the page by replacing vague claims with Toronto's current mapped off-leash locations, the official 8.5-acre OLA description, and the active 2026 restoration and fencing context.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/beaches-gardens-attractions/high-park/ for the two current off-leash area locations and the note that Allotment Lane itself is on-leash only; https://www.toronto.ca/city-government/planning-development/construction-new-facilities/park-facility-projects/high-park-off-leash-area-improvements/ for the 8.5-acre OLA description and the active 2026 fencing/restoration project; https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/ for Toronto's current off-leash rules; and Toronto facility listings confirming High Park at 1873 Bloor St W.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "High Park Dogs Off-Leash Area | Toronto";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Toronto"],
    Province: ["Ontario"],
    Tags: ["off-leash", "high-park", "toronto", "trails", "mature-trees"],
  };

  Object.assign(park.raw, {
    "Park Name": "High Park",
    "Park Header": "High Park Dogs Off-Leash Area | Toronto",
    "Description": body,
    "Street Address": "1873 Bloor St W",
    "latitude": "43.6465479",
    "longitude": "-79.4636903",
    "City": "Toronto",
    "Province": "Ontario",
    "Postal Code": "",
    "Fenced": "Partial - active fencing and gate work continues in 2026",
    "Separate Small Dog Area": "No separate small-dog area confirmed on current city pages",
    "Surface type": "Grass, natural trails, paved trails",
    "Size": "8.5-acre off-leash area",
    "Water source available": "Unknown - verify on arrival",
    "Benches": "Unknown - verify on arrival",
    "Shaded area": "Yes - mature tree canopy",
    "Waste bins": "Yes - citywide off-leash waste receptacle support",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - verify current restrictions onsite",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Verify posted park hours on arrival",
    "Seasonal Restrictions": "Active 2026 fencing, restoration, and occasional trail-management notices may affect access",
    "Park Website or Source": "https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/beaches-gardens-attractions/high-park/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=1873+Bloor+St+W+Toronto+ON",
    "Tags": "off-leash,high-park,toronto,trails,mature-trees",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    "Media": "",
    "Reviewed On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  });
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "high-park");
  if (!park) throw new Error("High Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "high-park");
  if (!targetRow) throw new Error("High Park CSV row not found.");
  const park = { raw: {} };
  applyParkFields(park);
  for (const [field, value] of Object.entries(park.raw)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }
  fs.writeFileSync(parkCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/high-park/")];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));
  const bodyRows = filtered
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  const countBy = (field) =>
    [...bodyRows.reduce((map, row) => {
      const key = row[field] || "";
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map()).entries()].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = bodyRows
    .slice(0, 50)
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`,
    )
    .join("\n");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/high-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated High Park and refreshed backlog files.");
