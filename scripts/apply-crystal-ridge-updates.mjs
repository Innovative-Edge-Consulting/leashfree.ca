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
  const line =
    '  "crystal-ridge-neighbourhood-off-leash-area": "/images/dog-parks/crystal-ridge-neighbourhood-off-leash-area-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "crimson-ridge-park-chilliwack": "/images/dog-parks/crimson-ridge-park-chilliwack-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function getContent() {
  const seoTitle = "Crystal Ridge Neighbourhood Off-Leash Area | Grande Prairie, AB | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to Crystal Ridge Neighbourhood Off-Leash Area in Grande Prairie, including the city's current neighbourhood off-leash framing, not-fully-fenced status, dog waste stations, and older city access references for the Crystal Ridge and Lakeland areas.";
  const intro =
    "<p>Crystal Ridge is part of Grande Prairie's current <strong>Neighbourhood Off-Leash Areas</strong> network. The city now groups <strong>Crystal Ridge (Lakeland)</strong> together as a designated neighbourhood green-space area for off-leash use rather than a fully fenced destination dog park.</p>";
  const body =
    "<p>The current City of Grande Prairie parks finder is the most important source for this page because it explains how the city now describes these spaces. Rather than presenting Crystal Ridge as a single highly equipped dog park, the city groups <strong>Crystal Ridge (Lakeland)</strong> with Royal Oaks under its <strong>Neighbourhood Off-Leash Areas</strong>. It says these are designated green-space areas where residents can take dogs off leash, with <strong>litter receptacles</strong> and <strong>dog waste bag dispensers</strong> provided for public use.</p><p>The most important practical detail is that these neighbourhood areas are <strong>not fully fenced</strong>. The city specifically asks residents to ensure their dogs remain safely in the area at all times while off leash. That matters more than generic filler about amenities because it tells visitors what kind of site this actually is: an open neighbourhood green space that depends on reliable recall and active handler supervision, not a contained exercise pen.</p><p>Older City of Grande Prairie enforcement notices add useful location context. In those city notices, the Crystal Ridge off-leash area appears as two neighbourhood access patterns: <strong>Crystal Ridge West</strong>, described as directly east of 98 Street with access from 120 Avenue, 121 Avenue, and 123 Avenue, and <strong>Crystal Ridge Northeast</strong>, described along Lakeland Drive just north of 123 Avenue with access from Lakeland Drive, 125 Avenue, and 126 Avenue. Those older references help explain why the current parks finder now uses the broader <strong>Crystal Ridge (Lakeland)</strong> label instead of a single precise park-style address.</p><p>This is the right people-first treatment for the page. Instead of pretending the city publishes more than it does, the update keeps the page aligned with the city's current wording: designated neighbourhood off-leash green space, not fully fenced, dog waste support provided, and location context that is better understood as a Crystal Ridge / Lakeland area than one tightly bounded facility.</p>";
  const notes =
    "<p>Primary sources reviewed on Monday, August 17, 2026: https://cityofgp.com/parksfinder for the current City of Grande Prairie description of Neighbourhood Off-Leash Areas in Crystal Ridge (Lakeland) and Royal Oaks, including litter receptacles, dog waste bag dispensers, and the note that these areas are not fully fenced; https://cityofgp.com/petlicence and https://cityofgp.com/city-government/bylaws-policies-procedures/bylaws/animals-and-responsible-pet-ownership for current licensing and bylaw context; and older City of Grande Prairie enforcement pages that identified Crystal Ridge West and Crystal Ridge Northeast access patterns within the broader Crystal Ridge / Lakeland off-leash area. These sources support the current neighbourhood-area framing and the older location context without overstating the site as a single fenced dog park.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Crystal Ridge Neighbourhood Off-Leash Area | Grande Prairie";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Grande Prairie"],
    Province: ["Alberta"],
    Tags: ["off-leash", "neighbourhood-area", "not-fully-fenced", "bag-dispensers", "lakeland"],
  };

  Object.assign(park.raw, {
    "Park Name": "Crystal Ridge Neighbourhood Off-Leash Area",
    "Park Header": "Crystal Ridge Neighbourhood Off-Leash Area | Grande Prairie",
    "Description": body,
    "Street Address": "Crystal Ridge / Lakeland neighbourhood area, Grande Prairie",
    "latitude": "",
    "longitude": "",
    "City": "Grande Prairie",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "No - not fully fenced",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "Neighbourhood green-space off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Minimal to some tree cover",
    "Waste bins": "Yes - litter receptacles provided",
    "Bag Dispensers": "Yes",
    "Parking Available": "Street access nearby - verify exact access point on arrival",
    "Washrooms nearby": "No public washrooms confirmed",
    "Operating hours": "Check posted park signage on arrival",
    "Seasonal Restrictions": "Not fully fenced; keep dogs safely within the designated area",
    "Park Website or Source": "https://cityofgp.com/parksfinder",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Crystal+Ridge+Lakeland+Grande+Prairie+AB+off+leash+area",
    "Tags": "off-leash,neighbourhood-area,not-fully-fenced,bag-dispensers,lakeland",
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
  const park = parks.find((entry) => entry.slug === "crystal-ridge-neighbourhood-off-leash-area");
  if (!park) throw new Error("Crystal Ridge record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "crystal-ridge-neighbourhood-off-leash-area");
  if (!targetRow) throw new Error("Crystal Ridge CSV row not found.");

  const park = { raw: {} };
  applyParkFields(park);
  const updates = park.raw;
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
  const filtered = [
    headers,
    ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/crystal-ridge-neighbourhood-off-leash-area/"),
  ];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));

  const bodyRows = filtered
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  const countBy = (field) =>
    [...bodyRows
      .reduce((map, row) => {
        const key = row[field] || "";
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map())
      .entries()].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier")
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join("\n");
  const sectionRows = countBy("contentType")
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join("\n");
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
  const filtered = [
    headers,
    ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/crystal-ridge-neighbourhood-off-leash-area/"),
  ];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Crystal Ridge and refreshed backlog files.");
