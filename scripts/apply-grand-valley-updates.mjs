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
  const line = '  "grand-valley-park-pickering": "/images/dog-parks/grand-valley-park-pickering-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "gourlay-janes-park": "/images/dog-parks/gourlay-janes-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function getContent() {
  const seoTitle = "Grand Valley Park Leash Free Area | Pickering, ON | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to Grand Valley Park in Pickering, including its two fenced leash-free areas, Third Concession Road location west of Valley Farm Road, Seaton Hiking Trail south trailhead context, and the current access note via Valley Farm Road during road work.";
  const intro =
    "<p>Grand Valley Park is one of Pickering's three official designated leash-free areas. The city currently describes <strong>two fenced off-leash areas</strong> inside the park and places the site on <strong>Third Concession Road west of Valley Farm Road</strong>, where it also serves as the <strong>south trailhead for the Seaton Hiking Trail</strong>.</p>";
  const body =
    "<p>The previous page was directionally close but too generic, and some of its structured fields were clearly wrong. Pickering's current leash-free areas page gives a much better park-specific description. It says Grand Valley has <strong>two designated leash-free areas</strong> within the park. The <strong>main leash-free area</strong> is the <strong>gated and fenced area west of the parking lot at the bottom of the hill</strong>, and that is the primary enclosure used by most visitors. The city also identifies a <strong>smaller gated and fenced area adjacent to the parking lot</strong> for visitors with mobility issues or for those with small dogs. That layout detail is the core fact this page should lead with.</p><p>The wider park setting matters too. Pickering's trails page identifies Grand Valley Park as a <strong>main access point with parking</strong> for the <strong>Seaton Hiking Trail</strong>, which helps explain why the city emphasizes leashing dogs while walking from the parking area into the main enclosure. The leash-free page also calls out a <strong>dog waste diversion station adjacent to the parking area</strong>, and the citywide rules require dogs to be licensed and tagged, limit handlers to <strong>three dogs</strong>, require an owner or handler aged <strong>16 or older</strong> to supervise, and instruct owners to remove dogs at the first sign of aggression or unsafe play.</p><p>There is also a useful current access notice. In a City of Pickering notice published on <strong>January 25, 2024</strong>, the city said Third Concession Road between Clearside Court and Valley Farm Road would be closed for reconstruction until <strong>Fall 2026</strong>, but it specifically noted that <strong>access to Grand Valley Park Leash Free Area remains open via Valley Farm Road</strong>. Because today is <strong>Monday, August 17, 2026</strong>, that road-work period is still relevant and should remain part of the page until the city says otherwise.</p><p>This update improves the page by replacing filler with Pickering's actual park layout, trailhead context, current access routing, and official leash-free rules.</p>";
  const notes =
    "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.pickering.ca/parks-recreation-culture/parks-and-trails/leash-free-areas/ for Grand Valley's official two-area layout, parking-area waste station, and current leash-free rules; https://www.pickering.ca/parks-recreation-culture/parks-and-trails/trails/ for the Seaton Hiking Trail south trailhead and parking context; and https://www.pickering.ca/news/posts/notice-of-extension-third-concession-road-between-clearside-court-to-valley-farm-road/ for the January 25, 2024 notice that access to Grand Valley Park Leash Free Area remains open via Valley Farm Road during Third Concession road work expected through Fall 2026.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Grand Valley Park Leash Free Area | Pickering";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Pickering"],
    Province: ["Ontario"],
    Tags: ["off-leash", "fully-fenced", "two-areas", "seaton-hiking-trail", "valley-farm-road"],
  };

  Object.assign(park.raw, {
    "Park Name": "Grand Valley Park",
    "Park Header": "Grand Valley Park Leash Free Area | Pickering",
    "Description": body,
    "Street Address": "Third Concession Road west of Valley Farm Road",
    "latitude": "",
    "longitude": "",
    "City": "Pickering",
    "Province": "Ontario",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Yes - smaller fenced area by parking lot also supports mobility access",
    "Surface type": "Grass",
    "Size": "Large main fenced area plus smaller fenced area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes - valley and trail-edge tree cover nearby",
    "Waste bins": "Yes - waste diversion station adjacent to parking area",
    "Bag Dispensers": "Yes - biodegradable bags provided in city leash-free areas",
    "Parking Available": "Yes",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Verify posted park hours on arrival",
    "Seasonal Restrictions": "Current city notice says access remains via Valley Farm Road during Third Concession road work expected through Fall 2026",
    "Park Website or Source": "https://www.pickering.ca/parks-recreation-culture/parks-and-trails/leash-free-areas/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Grand+Valley+Park+Third+Concession+Road+Pickering+ON",
    "Tags": "off-leash,fully-fenced,two-areas,seaton-hiking-trail,valley-farm-road",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  });
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "grand-valley-park-pickering");
  if (!park) throw new Error("Grand Valley record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "grand-valley-park-pickering");
  if (!targetRow) throw new Error("Grand Valley CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/grand-valley-park-pickering/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/grand-valley-park-pickering/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Grand Valley and refreshed backlog files.");
