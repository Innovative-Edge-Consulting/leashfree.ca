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
  const line = '  "paisley-dog-park": "/images/dog-parks/paisley-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "park-n-bark-off-leash-dog-area": "/images/dog-parks/park-n-bark-off-leash-dog-area-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${line}${anchor}`));
}

function getContent() {
  const seoTitle = "Paisley Dog Park | Edmonton, AB | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to Paisley Dog Park in southwest Edmonton, including the City of Edmonton's current developer-established off-leash designation, Brookfield's fenced park description, and the neighbourhood pathway connections around Paisley.";
  const intro =
    "<p>Paisley Dog Park is best understood as a <strong>developer-established fenced off-leash area</strong> in southwest Edmonton's <strong>Paisley neighbourhood</strong>. The City of Edmonton currently identifies Paisley as one of the neighbourhoods where developers created new off-leash access, and Brookfield Residential describes the community's dog park as a <strong>fenced-in off-leash park</strong>.</p>";
  const body =
    "<p>The old Paisley page claimed more detail than the current primary sources support. What Edmonton clearly confirms is that Paisley is part of the city's off-leash network and that it was one of the <strong>developer-established off-leash areas</strong> created in a higher-need part of the city. The current City of Edmonton off-leash page says developers helped establish off-leash areas in <strong>Paisley, Manning Village, and The Orchards</strong>, and the city's Dogs in Open Spaces Strategy highlights Paisley again as one of the newer <strong>fenced off-leash areas</strong> added through developer participation.</p><p>The developer's own current community material adds the practical neighbourhood context. Brookfield Residential describes Paisley as a community for people and their pets and says the neighbourhood includes a <strong>fenced-in off-leash park</strong>. Brookfield also says a <strong>network of pathways and a pedestrian corridor</strong> connect residents to the <strong>Village Park, playground, and dog park</strong>. Those are useful location and access details because they explain how the dog park fits into the overall neighbourhood design without pretending the developer or city publish a full amenity checklist.</p><p>What the sources do <strong>not</strong> currently support is the old page's stronger claims about a separate small-dog area, exact size, operating hours, or a detailed onsite amenity list. For Edmonton users, the broader city rules still apply: license your dog, keep vaccinations current, leash dogs when entering and leaving off-leash boundaries, keep dogs under control and in sight, clean up after them, and remember that Edmonton's parks are shared-use spaces where wildlife may be present. The city also states that vicious dogs are not allowed in off-leash areas.</p><p>This update improves the page by removing unsupported specifics and replacing them with Edmonton's actual current framing: fenced developer-established neighbourhood dog park, part of the city's off-leash network, connected by local pathways, and governed by Edmonton's current off-leash rules.</p>";
  const notes =
    "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites for Edmonton's current off-leash rules and the statement that developers established off-leash areas in Paisley, Manning Village, and The Orchards; https://www.edmonton.ca/projects_plans/parks_recreation/dogs-in-open-spaces for the strategy note that Paisley was one of the fenced off-leash areas established by developers; and https://www.brookfieldresidential.com/new-homes/alberta/edmonton-and-area/edmonton/paisley plus Brookfield's Edmonton community hub for the current fenced-in dog park description and the pathway connection to Village Park, playground, and the dog park. These sources support the page as a fenced neighbourhood off-leash park but do not currently support the older page's more specific amenity claims.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Paisley Dog Park | Edmonton";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Edmonton"],
    Province: ["Alberta"],
    Tags: ["off-leash", "fenced", "developer-established", "southwest-edmonton", "paisley"],
  };

  Object.assign(park.raw, {
    "Park Name": "Paisley Dog Park",
    "Park Header": "Paisley Dog Park | Edmonton",
    "Description": body,
    "Street Address": "Paisley neighbourhood, southwest Edmonton",
    "latitude": "",
    "longitude": "",
    "City": "Edmonton",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "Neighbourhood off-leash park",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Minimal to some young tree cover",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Verify posted onsite signage and current City of Edmonton guidance",
    "Seasonal Restrictions": "Follow current Edmonton off-leash rules and posted boundaries",
    "Park Website or Source": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Paisley+Dog+Park+Edmonton+AB",
    "Tags": "off-leash,fenced,developer-established,southwest-edmonton,paisley",
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
  const park = parks.find((entry) => entry.slug === "paisley-dog-park");
  if (!park) throw new Error("Paisley record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "paisley-dog-park");
  if (!targetRow) throw new Error("Paisley CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/paisley-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/paisley-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Paisley and refreshed backlog files.");
