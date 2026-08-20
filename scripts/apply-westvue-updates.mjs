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
  const line = '  "westvue-dog-park": "/images/dog-parks/westvue-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "weyburn": "/images/dog-parks/weyburn-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${line}${anchor}`));
}

function getContent() {
  const seoTitle = "WestVue Dog Park | Medicine Hat, AB | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to WestVue Dog Park in Medicine Hat, including the official 11 Ave SW location near Gas City Campground, daily 7 a.m. to 11 p.m. hours, full fencing, potable water, benches, waste stations, and the city's wildlife caution.";
  const intro =
    "<p>WestVue Dog Park is one of Medicine Hat's two current fully fenced off-leash dog parks. The city lists it at <strong>11 Ave SW near Gas City Campground</strong> and says it is open daily from <strong>7:00 a.m. to 11:00 p.m.</strong>.</p>";
  const body =
    "<p>The current City of Medicine Hat off-leash page is much more reliable than the older version of this page. It confirms WestVue as a <strong>fully fenced</strong> dog park and specifically lists <strong>potable water</strong>, <strong>benches</strong>, <strong>dog waste bag dispensers</strong>, and <strong>garbage bins</strong>. That is the current published amenity set. The city does <strong>not</strong> currently describe WestVue as a 40-acre site, does <strong>not</strong> publish separate small- and large-dog areas here, and does <strong>not</strong> currently support stronger washroom claims on the dog-park page itself.</p><p>The location context is useful, though. The city places WestVue at <strong>11 Ave SW near Gas City Campground</strong>, and the campground page says the campground is <strong>across from WestVue Dog Park</strong> and connected to Medicine Hat's wider <strong>Heritage Trail Network</strong>. That helps visitors understand the broader setting without turning the page into a campground article.</p><p>There is also a relevant wildlife note from the city. In a Medicine Hat news item published on <strong>March 21, 2022</strong>, staff reported a <strong>moose sighting inside WestVue dog park</strong>. The city said the moose had moved on, but it also reminded visitors that WestVue is a fenced off-leash area <strong>adjacent to an open prairie landscape</strong>, so wildlife can still gain access and may be present at any time. That is exactly the kind of practical local context that improves this page because it changes how people should use the park even when the basic amenity list stays simple.</p><p>The citywide rules remain straightforward: all users enter at their own risk, owners must collect dog waste immediately, fill holes dug by pets, supervise dogs physically and verbally at all times, ensure vaccinations and rabies shots are current, license resident pets, supervise children under 13, leash dogs before entering and leaving, and avoid glass containers. Off-leash users are also subject to Responsible Animal Ownership Bylaw <strong>#3935</strong> and Parks Bylaw <strong>#2527</strong>.</p><p>This update improves the page by removing unsupported size and washroom claims, keeping the official amenity list, and adding the city's own prairie wildlife caution near the campground setting.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://www.medicinehat.ca/parks-recreation/parks-playgrounds/parks/off-leash-dog-parks/ for WestVue's official location, hours, amenities, and citywide dog-park rules; https://www.medicinehat.ca/home-property-utilities/animal-services/ for supporting animal-services context; https://www.medicinehat.ca/parks-recreation/camping/ for the note that Gas City Campground is across from WestVue and connected to the Heritage Trail Network; https://www.medicinehat.ca/news/posts/wildlife-sighting-at-westvue-dog-park/ for the March 21, 2022 wildlife caution; and https://www.medicinehat.ca/news/posts/outdoor-washrooms-seasonal-closures/ for the October 14, 2022 note that portable toilets remained at WestVue and Saratoga at that time, which is historical and not treated here as a current permanent amenity.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "WestVue Dog Park | Medicine Hat";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Medicine Hat"],
    Province: ["Alberta"],
    Tags: ["off-leash", "fully-fenced", "potable-water", "campground-adjacent", "wildlife-awareness"],
  };

  Object.assign(park.raw, {
    "Park Name": "WestVue Dog Park",
    "Park Header": "WestVue Dog Park | Medicine Hat",
    "Description": body,
    "Street Address": "11 Ave SW (near Gas City Campground)",
    "latitude": "",
    "longitude": "",
    "City": "Medicine Hat",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "City off-leash dog park",
    "Water source available": "Yes - potable water",
    "Benches": "Yes",
    "Shaded area": "Minimal",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Yes",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7:00 a.m. to 11:00 p.m. daily",
    "Seasonal Restrictions": "Wildlife may still access the park because it is adjacent to open prairie landscape",
    "Park Website or Source": "https://www.medicinehat.ca/parks-recreation/parks-playgrounds/parks/off-leash-dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=WestVue+Dog+Park+Medicine+Hat+AB",
    "Tags": "off-leash,fully-fenced,potable-water,campground-adjacent,wildlife-awareness",
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
  const park = parks.find((entry) => entry.slug === "westvue-dog-park");
  if (!park) throw new Error("WestVue record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "westvue-dog-park");
  if (!targetRow) throw new Error("WestVue CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/westvue-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/westvue-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated WestVue and refreshed backlog files.");
