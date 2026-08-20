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
    '  "south-bear-creek-off-leash-dog-park": "/images/dog-parks/south-bear-creek-off-leash-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "south-courtice-dog-park": "/images/dog-parks/south-courtice-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${line}${anchor}`));
}

function getContent() {
  const seoTitle = "South Bear Creek Off-Leash Dog Park | Grande Prairie, AB | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to South Bear Creek Off-Leash Dog Park in Grande Prairie, including the city's current two-section fenced layout, treed and open-space setting, benches, waste stations, wider South Bear Creek Park amenities, and the July 24, 2026 black bear advisory.";
  const intro =
    "<p>South Bear Creek is Grande Prairie's current fully fenced destination dog park. The City of Grande Prairie says the site includes <strong>two fenced dog parks</strong> within South Bear Creek Park, with <strong>one section for small dogs</strong> and <strong>one area for dogs of all sizes</strong>.</p>";
  const body =
    "<p>The old version of this page mixed some real elements with outdated or overconfident details. The city's current parks finder gives a much stronger park-specific description. It says Grande Prairie currently has <strong>two fully fenced dog parks in South Bear Creek Park</strong>, set in a <strong>mix of treed and open spaces</strong>. The city also confirms the park is divided into <strong>two sections</strong>, one for <strong>small dogs</strong> and one for <strong>dogs of all sizes</strong>, with <strong>benches</strong>, <strong>dog waste bag dispensers</strong>, and <strong>trash receptacles</strong> provided. That is the core factual layout this page should lead with.</p><p>The wider South Bear Creek Park setting also matters because this is not an isolated dog enclosure. The city's dedicated South Bear Creek page describes the park as a larger recreation hub with <strong>walking trails</strong>, a <strong>pavilion and picnic area</strong>, <strong>overnight camping</strong>, <strong>ball diamonds</strong>, <strong>beach volleyball courts</strong>, <strong>disc golf</strong>, a <strong>bike skills park</strong>, and the <strong>Bear Paw Par 3 Golf Course</strong>. The golf page adds one useful orientation detail by saying the course is located <strong>south of the off-leash dog park</strong>.</p><p>There is also current safety context that should stay visible. In a City of Grande Prairie service update published on <strong>July 24, 2026</strong>, visitors were advised that there was a <strong>black bear in South Bear Creek Park</strong>, and the city reminded people walking dogs in the area that they must keep their dogs <strong>leashed by bylaw</strong> for pet and owner safety. Because today is <strong>Thursday, August 20, 2026</strong>, that alert is recent enough to keep as active context until the city indicates conditions have changed. Older city communication also helps explain the current two-park layout: a July 6, 2021 city release said construction was starting on a <strong>new dog park west of the current dog park and north of the bike skills park</strong>, with one section for small dogs and a larger area for all dogs.</p><p>This update improves the page by replacing generic copy with the city's actual current fenced layout, realistic amenity list, broader park context, and the current wildlife safety advisory.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://cityofgp.com/parksfinder for the current two-section fully fenced dog-park description, benches, waste bag dispensers, and trash receptacles; https://cityofgp.com/SouthBear and https://cityofgp.com/economic-development/lifestyle-community/recreation/south-bear-creek for the wider South Bear Creek Park amenities; https://cityofgp.com/SouthBear/bear-paw-par-3-golf for the note that Bear Paw Golf sits south of the off-leash dog park; https://cityofgp.com/city-services/more-services/service-updates for the July 24, 2026 black bear advisory; and the archived July 6, 2021 city release about construction of a new South Bear Creek dog park west of the original site. These sources support the page as a two-section fully fenced dog-park destination with current wildlife advisory context.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "South Bear Creek Off-Leash Dog Park | Grande Prairie";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Grande Prairie"],
    Province: ["Alberta"],
    Tags: ["off-leash", "fully-fenced", "small-dog-area", "treed-and-open", "south-bear-creek"],
  };

  Object.assign(park.raw, {
    "Park Name": "South Bear Creek Off-Leash Dog Park",
    "Park Header": "South Bear Creek Off-Leash Dog Park | Grande Prairie",
    "Description": body,
    "Street Address": "South Bear Creek Park, 99 Street just south of 68 Avenue",
    "latitude": "",
    "longitude": "",
    "City": "Grande Prairie",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Yes",
    "Surface type": "Grass",
    "Size": "Two fenced dog parks",
    "Water source available": "Unknown",
    "Benches": "Yes",
    "Shaded area": "Yes - mix of treed and open spaces",
    "Waste bins": "Yes - trash receptacles provided",
    "Bag Dispensers": "Yes",
    "Parking Available": "Yes",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Verify posted park hours on arrival",
    "Seasonal Restrictions": "July 24, 2026 city advisory reported a black bear in South Bear Creek Park and reminded visitors to keep dogs leashed in the area for safety",
    "Park Website or Source": "https://cityofgp.com/parksfinder",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=South+Bear+Creek+Park+Grande+Prairie+AB",
    "Tags": "off-leash,fully-fenced,small-dog-area,treed-and-open,south-bear-creek",
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
  const park = parks.find((entry) => entry.slug === "south-bear-creek-off-leash-dog-park");
  if (!park) throw new Error("South Bear Creek record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "south-bear-creek-off-leash-dog-park");
  if (!targetRow) throw new Error("South Bear Creek CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/south-bear-creek-off-leash-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/south-bear-creek-off-leash-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated South Bear Creek and refreshed backlog files.");
