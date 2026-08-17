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
  const line = '  "three-mile-bend-recreation-area": "/images/dog-parks/three-mile-bend-recreation-area-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "townsend-park-chilliwack": "/images/dog-parks/townsend-park-chilliwack-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "three-mile-bend-recreation-area");
  if (!park) throw new Error("Three Mile Bend record not found.");

  const seoTitle = "Three Mile Bend Recreation Area | Red Deer, AB | LeashFree.ca";
  const metaDescription = "Source-backed guide to Three Mile Bend Recreation Area in Red Deer, including the 76 Street access from Riverside Drive, 55-hectare natural setting, canoe ponds, boardwalk, picnic area, trails, fenced off-leash entry rules, and recent maintenance closure context.";
  const intro = "<p>Three Mile Bend Recreation Area is one of Red Deer's official off-leash dog destinations and part of a much larger natural recreation area on the North Bank Trail beside the Red Deer River. The city's current off-leash page says the site covers 55 hectares and is accessed from 76 Street via Riverside Drive.</p>";
  const body = "<p>This page needed a factual rebuild because the old version mixed accurate scenic themes with unsupported amenity details and rigid field claims. Red Deer's current dedicated off-leash page is much stronger. The city describes Three Mile Bend as a 55 hectare natural area that supports multiple outdoor uses, not just dog walking, and places it on the North Bank Trail adjacent to the Red Deer River. The same page lists canoeing ponds, a canoe and kayak boardwalk, picnic area, remote control car track, freestyle ski jump, off-leash dog area, and trails, which gives visitors a more realistic sense of the broader setting.</p><p>The current dog-use rules are also more specific than the old stub. Red Deer says dogs must have a current licence, must not chase wildlife, must interact well with other dogs and owners, and must come immediately when called. Owners must keep dogs on leash until inside the fenced area, have a leash in possession at all times, and keep the dog within sight and under verbal control. The city also asks owners to keep vaccinations up to date, clean up after their dogs, fill any holes dogs dig, and remove dogs if there are signs of aggression. Those rules are especially relevant here because Three Mile Bend is a large natural area with water, trails, and mixed recreational use.</p><p>Recent city notices add useful maintenance context. Red Deer temporarily closed Three Mile Bend on October 7 and 8, 2024 for park maintenance, announced temporary wetland restoration work beginning November 26, 2024, and posted temporary trail closures in December 2024 for overhead powerline branch clearing. Those dates are now in the past as of Monday, August 17, 2026, but they show the area is actively managed and that temporary access disruptions can happen. This update replaces weak filler with the city's current facts: the 76 Street access, 55 hectare scale, multi-use natural setting, fenced-entry leash rule, and the practical dog park requirements Red Deer publishes now.</p>";
  const notes = "<p>Primary sources reviewed on August 17, 2026: https://www.reddeer.ca/recreation-and-culture/outdoor-recreation/year-round-activities/off-leash-dog-parks/ ; https://secure.reddeer.ca/recreation-and-culture/outdoor-recreation/year-round-activities/off-leash-dog-parks/three-mile-bend-recreation-area---off-leash-park/ ; https://www.reddeer.ca/city-government/policies/pets-in-public-facilities-and-public-spaces/ ; https://www.reddeer.ca/whats-happening/news-room/news-archive/2024-news-archive/october-2024-news-archive/temporary-park-closure-at-three-mile-bend.html ; https://www.reddeer.ca/whats-happening/news-room/news-archive/2024-news-archive/november-2024-news-archive/temporary-wetland-restoration-construction-at-three-mile-bend.html ; and https://www.reddeer.ca/whats-happening/news-room/news-archive/2024-news-archive/december-2024-news-archive/trail-closures-at-three-mile-bend.html . These sources support the 55 hectare natural area description, 76 Street access from Riverside Drive, the listed site features, current dog-park requirements, and the 2024 closure and maintenance notices.</p>";

  park.title = "Three Mile Bend Recreation Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Red Deer"],
    Province: ["Alberta"],
    Tags: ["off-leash", "natural-area", "red-deer-river", "canoe-ponds"]
  };

  Object.assign(park.raw, {
    "Park Name": "Three Mile Bend Recreation Area",
    "Park Header": "Three Mile Bend Recreation Area",
    "Description": body,
    "Street Address": "76 Street, accessed from Riverside Drive",
    "latitude": "",
    "longitude": "",
    "City": "Red Deer",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes - dogs stay leashed until inside the fenced area",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Natural trails, grass, and pond-side recreation area",
    "Size": "55 hectares",
    "Water source available": "Yes - ponds and nearby river setting",
    "Benches": "Unknown",
    "Shaded area": "Yes - natural tree cover in parts of the area",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Temporary maintenance or trail closures may occur",
    "Park Website or Source": "https://secure.reddeer.ca/recreation-and-culture/outdoor-recreation/year-round-activities/off-leash-dog-parks/three-mile-bend-recreation-area---off-leash-park/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Three+Mile+Bend+Recreation+Area+Red+Deer+AB",
    "Tags": "off-leash,natural-area,red-deer-river,canoe-ponds",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "three-mile-bend-recreation-area");
  if (!targetRow) throw new Error("Three Mile Bend CSV row not found.");
  const updates = {
    "Park Name": "Three Mile Bend Recreation Area",
    "Park Header": "Three Mile Bend Recreation Area",
    "Description": "<p>This page needed a factual rebuild because the old version mixed accurate scenic themes with unsupported amenity details and rigid field claims. Red Deer's current dedicated off-leash page is much stronger. The city describes Three Mile Bend as a 55 hectare natural area that supports multiple outdoor uses, not just dog walking, and places it on the North Bank Trail adjacent to the Red Deer River. The same page lists canoeing ponds, a canoe and kayak boardwalk, picnic area, remote control car track, freestyle ski jump, off-leash dog area, and trails, which gives visitors a more realistic sense of the broader setting.</p><p>The current dog-use rules are also more specific than the old stub. Red Deer says dogs must have a current licence, must not chase wildlife, must interact well with other dogs and owners, and must come immediately when called. Owners must keep dogs on leash until inside the fenced area, have a leash in possession at all times, and keep the dog within sight and under verbal control. The city also asks owners to keep vaccinations up to date, clean up after their dogs, fill any holes dogs dig, and remove dogs if there are signs of aggression. Those rules are especially relevant here because Three Mile Bend is a large natural area with water, trails, and mixed recreational use.</p><p>Recent city notices add useful maintenance context. Red Deer temporarily closed Three Mile Bend on October 7 and 8, 2024 for park maintenance, announced temporary wetland restoration work beginning November 26, 2024, and posted temporary trail closures in December 2024 for overhead powerline branch clearing. Those dates are now in the past as of Monday, August 17, 2026, but they show the area is actively managed and that temporary access disruptions can happen. This update replaces weak filler with the city's current facts: the 76 Street access, 55 hectare scale, multi-use natural setting, fenced-entry leash rule, and the practical dog park requirements Red Deer publishes now.</p>",
    "Street Address": "76 Street, accessed from Riverside Drive",
    "latitude": "",
    "longitude": "",
    "City": "Red Deer",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes - dogs stay leashed until inside the fenced area",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Natural trails, grass, and pond-side recreation area",
    "Size": "55 hectares",
    "Water source available": "Yes - ponds and nearby river setting",
    "Benches": "Unknown",
    "Shaded area": "Yes - natural tree cover in parts of the area",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Temporary maintenance or trail closures may occur",
    "Park Website or Source": "https://secure.reddeer.ca/recreation-and-culture/outdoor-recreation/year-round-activities/off-leash-dog-parks/three-mile-bend-recreation-area---off-leash-park/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Three+Mile+Bend+Recreation+Area+Red+Deer+AB",
    "Tags": "off-leash,natural-area,red-deer-river,canoe-ponds",
    "Notes / Comments": "<p>Primary sources reviewed on August 17, 2026: https://www.reddeer.ca/recreation-and-culture/outdoor-recreation/year-round-activities/off-leash-dog-parks/ ; https://secure.reddeer.ca/recreation-and-culture/outdoor-recreation/year-round-activities/off-leash-dog-parks/three-mile-bend-recreation-area---off-leash-park/ ; https://www.reddeer.ca/city-government/policies/pets-in-public-facilities-and-public-spaces/ ; https://www.reddeer.ca/whats-happening/news-room/news-archive/2024-news-archive/october-2024-news-archive/temporary-park-closure-at-three-mile-bend.html ; https://www.reddeer.ca/whats-happening/news-room/news-archive/2024-news-archive/november-2024-news-archive/temporary-wetland-restoration-construction-at-three-mile-bend.html ; and https://www.reddeer.ca/whats-happening/news-room/news-archive/2024-news-archive/december-2024-news-archive/trail-closures-at-three-mile-bend.html . These sources support the 55 hectare natural area description, 76 Street access from Riverside Drive, the listed site features, current dog-park requirements, and the 2024 closure and maintenance notices.</p>",
    "Intro Paragraph": "<p>Three Mile Bend Recreation Area is one of Red Deer's official off-leash dog destinations and part of a much larger natural recreation area on the North Bank Trail beside the Red Deer River. The city's current off-leash page says the site covers 55 hectares and is accessed from 76 Street via Riverside Drive.</p>",
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Three Mile Bend Recreation Area | Red Deer, AB | LeashFree.ca",
    "Meta Description": "Source-backed guide to Three Mile Bend Recreation Area in Red Deer, including the 76 Street access from Riverside Drive, 55-hectare natural setting, canoe ponds, boardwalk, picnic area, trails, fenced off-leash entry rules, and recent maintenance closure context.",
    "Updated On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/three-mile-bend-recreation-area/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/three-mile-bend-recreation-area/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Three Mile Bend and refreshed backlog files.");
