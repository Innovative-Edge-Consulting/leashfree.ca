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
  const line = '  "saratoga-dog-park": "/images/dog-parks/saratoga-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "saskatoon": "/images/cities/city-saskatoon-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "saratoga-dog-park");
  if (!park) throw new Error("Saratoga record not found.");

  const seoTitle = "Saratoga Dog Park | Medicine Hat, AB | LeashFree.ca";
  const metaDescription = "Source-backed guide to Saratoga Dog Park in Medicine Hat, including the official 1205 Factory Street SE location, daily 7 a.m. to 11 p.m. hours, fencing, potable water, agility and balance structures, shade structures, benches, waste stations, and current city off-leash rules.";
  const intro = "<p>Saratoga Dog Park is one of Medicine Hat's two current fully fenced off-leash dog parks. The city's current off-leash page lists it at 1205 Factory Street SE and says it is open daily from 7:00 a.m. to 11:00 p.m.</p>";
  const body = "<p>This page needed a factual rebuild because the older version mixed some accurate elements with assumptions the city does not currently publish. Medicine Hat's current off-leash dog parks page is much stronger. It confirms that Saratoga Dog Park is fully fenced and specifically lists potable water, agility and balance structures, benches, dog waste bag dispensers, garbage bins, and shade structures. Those are the details that should anchor this page rather than generic filler about being \"well-equipped.\"</p><p>The city's rules are also clear and useful. Medicine Hat says all persons using the park do so at their own risk, dog waste must be collected immediately, holes must be filled, owners must be in the park to supervise and maintain physical and verbal control of their dogs at all times, dogs must have up-to-date vaccinations and rabies shots, city resident pets must be licensed, children under 13 require supervision, dogs must be leashed before entering and leaving the park, and glass containers are not permitted. Off-leash users are also subject to Responsible Animal Ownership Bylaw #3935 and Parks Bylaw #2527.</p><p>There is also useful recent access context. In a city update published on <strong>May 7, 2026</strong>, Medicine Hat noted that during gas main replacement work on South Railway Street SE, the Seven Persons Creek trail and Saratoga dog park trails would remain open to the public on either side of South Railway Street SE, along with access to the Memorial Arboretum and Saratoga Dog Park. That notice is in the past now, but it helps confirm the park's trail connections and shows the city actively communicates around access near the site. This update replaces unsupported copy with the city's current address, hours, amenity list, rules, and recent access note.</p>";
  const notes = "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.medicinehat.ca/parks-recreation/parks-playgrounds/parks/off-leash-dog-parks/ ; https://www.medicinehat.ca/news/posts/neat-to-know-may-7-2026/ ; and https://www.medicinehat.ca/home-property-utilities/animal-services/ . These sources support Saratoga's official location, hours, listed amenities, current off-leash rules, and the May 7, 2026 notice that Saratoga dog park trails remained open during nearby utility work.</p>";

  park.title = "Saratoga Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Medicine Hat"],
    Province: ["Alberta"],
    Tags: ["off-leash", "fully-fenced", "agility-structures", "shade-structures"]
  };

  Object.assign(park.raw, {
    "Park Name": "Saratoga Dog Park",
    "Park Header": "Saratoga Dog Park",
    "Description": body,
    "Street Address": "1205 Factory St SE",
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
    "Shaded area": "Yes - shade structures",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7:00 a.m. to 11:00 p.m. daily",
    "Seasonal Restrictions": "Follow posted city notices and trail access advisories",
    "Park Website or Source": "https://www.medicinehat.ca/parks-recreation/parks-playgrounds/parks/off-leash-dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=1205+Factory+St+SE+Medicine+Hat+AB",
    "Tags": "off-leash,fully-fenced,agility-structures,shade-structures",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "saratoga-dog-park");
  if (!targetRow) throw new Error("Saratoga CSV row not found.");
  const updates = {
    "Park Name": "Saratoga Dog Park",
    "Park Header": "Saratoga Dog Park",
    "Description": "<p>This page needed a factual rebuild because the older version mixed some accurate elements with assumptions the city does not currently publish. Medicine Hat's current off-leash dog parks page is much stronger. It confirms that Saratoga Dog Park is fully fenced and specifically lists potable water, agility and balance structures, benches, dog waste bag dispensers, garbage bins, and shade structures. Those are the details that should anchor this page rather than generic filler about being \"well-equipped.\"</p><p>The city's rules are also clear and useful. Medicine Hat says all persons using the park do so at their own risk, dog waste must be collected immediately, holes must be filled, owners must be in the park to supervise and maintain physical and verbal control of their dogs at all times, dogs must have up-to-date vaccinations and rabies shots, city resident pets must be licensed, children under 13 require supervision, dogs must be leashed before entering and leaving the park, and glass containers are not permitted. Off-leash users are also subject to Responsible Animal Ownership Bylaw #3935 and Parks Bylaw #2527.</p><p>There is also useful recent access context. In a city update published on <strong>May 7, 2026</strong>, Medicine Hat noted that during gas main replacement work on South Railway Street SE, the Seven Persons Creek trail and Saratoga dog park trails would remain open to the public on either side of South Railway Street SE, along with access to the Memorial Arboretum and Saratoga Dog Park. That notice is in the past now, but it helps confirm the park's trail connections and shows the city actively communicates around access near the site. This update replaces unsupported copy with the city's current address, hours, amenity list, rules, and recent access note.</p>",
    "Street Address": "1205 Factory St SE",
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
    "Shaded area": "Yes - shade structures",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7:00 a.m. to 11:00 p.m. daily",
    "Seasonal Restrictions": "Follow posted city notices and trail access advisories",
    "Park Website or Source": "https://www.medicinehat.ca/parks-recreation/parks-playgrounds/parks/off-leash-dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=1205+Factory+St+SE+Medicine+Hat+AB",
    "Tags": "off-leash,fully-fenced,agility-structures,shade-structures",
    "Notes / Comments": "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.medicinehat.ca/parks-recreation/parks-playgrounds/parks/off-leash-dog-parks/ ; https://www.medicinehat.ca/news/posts/neat-to-know-may-7-2026/ ; and https://www.medicinehat.ca/home-property-utilities/animal-services/ . These sources support Saratoga's official location, hours, listed amenities, current off-leash rules, and the May 7, 2026 notice that Saratoga dog park trails remained open during nearby utility work.</p>",
    "Intro Paragraph": "<p>Saratoga Dog Park is one of Medicine Hat's two current fully fenced off-leash dog parks. The city's current off-leash page lists it at 1205 Factory Street SE and says it is open daily from 7:00 a.m. to 11:00 p.m.</p>",
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Saratoga Dog Park | Medicine Hat, AB | LeashFree.ca",
    "Meta Description": "Source-backed guide to Saratoga Dog Park in Medicine Hat, including the official 1205 Factory Street SE location, daily 7 a.m. to 11 p.m. hours, fencing, potable water, agility and balance structures, shade structures, benches, waste stations, and current city off-leash rules.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/saratoga-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/saratoga-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Saratoga and refreshed backlog files.");
