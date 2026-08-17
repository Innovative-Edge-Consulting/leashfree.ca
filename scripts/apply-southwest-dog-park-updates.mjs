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
  const line = '  "southwest-dog-park-saskatoon": "/images/dog-parks/southwest-dog-park-saskatoon-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "south-courtice-dog-park": "/images/dog-parks/south-courtice-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "southwest-dog-park-saskatoon");
  if (!park) throw new Error("Southwest Dog Park record not found.");

  const seoTitle = "Southwest Dog Park | Saskatoon, SK | LeashFree.ca";
  const metaDescription = "Source-backed guide to Southwest Dog Park in Saskatoon, including the off-Valley Road location north of Cedar Villa Road, current city dog-park rules, naturalized open-space setting, and the park’s status as one of Saskatoon’s approved sites for permitted commercial dog walkers.";
  const intro = "<p>Southwest Dog Park is one of the City of Saskatoon's official off-leash dog parks. Current city material places it north of Cedar Villa Road, with older City of Saskatoon notices also describing it as off Valley Road by the landfill, which gives visitors a clearer location reference than the previous generic stub.</p>";
  const body = "<p>This page needed a factual rebuild because the old version made specific claims about fencing, address, hours, and amenities that are not supported by the city's current public dog-park material. Saskatoon's current dog parks page describes the city's off-leash network more broadly: dog parks are naturalized spaces where dogs may be off leash while under the control of their owner, a valid city dog licence is required, and owners should ensure vaccinations are up to date before visiting. That broader framing is a better fit for Southwest Dog Park than pretending the city publishes a detailed facility sheet when it does not.</p><p>The strongest current practical detail for Southwest comes from Saskatoon's commercial dog walker rules. The city currently allows permitted commercial dog walkers to bring up to eight dogs only at Chief Whitecap, Hampton, Southwest, and Sutherland Beach. That matters because it distinguishes Southwest from the rest of Saskatoon's system and suggests it is one of the city's established higher-capacity off-leash destinations rather than a tiny neighbourhood enclosure. Historical city news releases continue to help with wayfinding: the city has described Southwest as north of Cedar Villa Road and, in earlier notices, off Valley Road by the landfill.</p><p>The current Saskatoon dog-park rules are also more useful than generic filler. Dogs should stay leashed on entry and exit, owners should keep them within sight and under control at all times, waste must be picked up, dogs that become a nuisance must be leashed and removed, and wildlife can be present in these naturalized shared spaces. This update improves the page by replacing unsupported specifics with what the City of Saskatoon actually publishes now: official off-leash status, location guidance tied to Cedar Villa Road and Valley Road, the city's current behaviour and licensing rules, and Southwest's inclusion in the small group of parks approved for permitted commercial dog walking.</p>";
  const notes = "<p>Primary sources reviewed on August 17, 2026: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks ; https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks/commercial-dog-walker ; https://www.saskatoon.ca/news-releases/upgrades-and-reminders-saskatoons-dog-parks ; https://www.saskatoon.ca/news-releases?items_per_page=50&page=73&wbdisable=true ; and https://www.saskatoon.ca/news-releases?combine=&field_release_type_value=All&items_per_page=5&page=595&service=All . These sources support Southwest's official off-leash status, the north of Cedar Villa Road and off Valley Road location references, the citywide dog-park rules, and Southwest's current inclusion in the list of parks where permitted commercial dog walkers may bring up to eight dogs.</p>";

  park.title = "Southwest Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Saskatoon"],
    Province: ["Saskatchewan"],
    Tags: ["off-leash", "naturalized", "commercial-dog-walker", "cedar-villa-road"]
  };

  Object.assign(park.raw, {
    "Park Name": "Southwest Dog Park",
    "Park Header": "Southwest Dog Park",
    "Description": body,
    "Street Address": "North of Cedar Villa Road, off Valley Road",
    "latitude": "",
    "longitude": "",
    "City": "Saskatoon",
    "Province": "Saskatchewan",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Naturalized grassland and dirt paths",
    "Size": "Naturalized off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Naturalized shared space with possible wildlife presence",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Southwest+Dog+Park+Saskatoon+SK",
    "Tags": "off-leash,naturalized,commercial-dog-walker,cedar-villa-road",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "southwest-dog-park-saskatoon");
  if (!targetRow) throw new Error("Southwest Dog Park CSV row not found.");
  const updates = {
    "Park Name": "Southwest Dog Park",
    "Park Header": "Southwest Dog Park",
    "Description": "<p>This page needed a factual rebuild because the old version made specific claims about fencing, address, hours, and amenities that are not supported by the city's current public dog-park material. Saskatoon's current dog parks page describes the city's off-leash network more broadly: dog parks are naturalized spaces where dogs may be off leash while under the control of their owner, a valid city dog licence is required, and owners should ensure vaccinations are up to date before visiting. That broader framing is a better fit for Southwest Dog Park than pretending the city publishes a detailed facility sheet when it does not.</p><p>The strongest current practical detail for Southwest comes from Saskatoon's commercial dog walker rules. The city currently allows permitted commercial dog walkers to bring up to eight dogs only at Chief Whitecap, Hampton, Southwest, and Sutherland Beach. That matters because it distinguishes Southwest from the rest of Saskatoon's system and suggests it is one of the city's established higher-capacity off-leash destinations rather than a tiny neighbourhood enclosure. Historical city news releases continue to help with wayfinding: the city has described Southwest as north of Cedar Villa Road and, in earlier notices, off Valley Road by the landfill.</p><p>The current Saskatoon dog-park rules are also more useful than generic filler. Dogs should stay leashed on entry and exit, owners should keep them within sight and under control at all times, waste must be picked up, dogs that become a nuisance must be leashed and removed, and wildlife can be present in these naturalized shared spaces. This update improves the page by replacing unsupported specifics with what the City of Saskatoon actually publishes now: official off-leash status, location guidance tied to Cedar Villa Road and Valley Road, the city's current behaviour and licensing rules, and Southwest's inclusion in the small group of parks approved for permitted commercial dog walking.</p>",
    "Street Address": "North of Cedar Villa Road, off Valley Road",
    "latitude": "",
    "longitude": "",
    "City": "Saskatoon",
    "Province": "Saskatchewan",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Naturalized grassland and dirt paths",
    "Size": "Naturalized off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Naturalized shared space with possible wildlife presence",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Southwest+Dog+Park+Saskatoon+SK",
    "Tags": "off-leash,naturalized,commercial-dog-walker,cedar-villa-road",
    "Notes / Comments": "<p>Primary sources reviewed on August 17, 2026: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks ; https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks/commercial-dog-walker ; https://www.saskatoon.ca/news-releases/upgrades-and-reminders-saskatoons-dog-parks ; https://www.saskatoon.ca/news-releases?items_per_page=50&page=73&wbdisable=true ; and https://www.saskatoon.ca/news-releases?combine=&field_release_type_value=All&items_per_page=5&page=595&service=All . These sources support Southwest's official off-leash status, the north of Cedar Villa Road and off Valley Road location references, the citywide dog-park rules, and Southwest's current inclusion in the list of parks where permitted commercial dog walkers may bring up to eight dogs.</p>",
    "Intro Paragraph": "<p>Southwest Dog Park is one of the City of Saskatoon's official off-leash dog parks. Current city material places it north of Cedar Villa Road, with older City of Saskatoon notices also describing it as off Valley Road by the landfill, which gives visitors a clearer location reference than the previous generic stub.</p>",
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Southwest Dog Park | Saskatoon, SK | LeashFree.ca",
    "Meta Description": "Source-backed guide to Southwest Dog Park in Saskatoon, including the off-Valley Road location north of Cedar Villa Road, current city dog-park rules, naturalized open-space setting, and the park’s status as one of Saskatoon’s approved sites for permitted commercial dog walkers.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/southwest-dog-park-saskatoon/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/southwest-dog-park-saskatoon/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Southwest Dog Park and refreshed backlog files.");
