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
  const line = '  "whitby-park-south": "/images/dog-parks/whitby-park-south-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "wiggly-field-off-leash-dog-park": "/images/dog-parks/wiggly-field-off-leash-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "whitby-park-south");
  if (!park) throw new Error("Whitby South park record not found.");

  const seoTitle = "Whitby Off Leash Dog Park South | Whitby, ON | LeashFree.ca";
  const metaDescription = "Source-backed guide to Whitby's Jeffery Street South off-leash dog park, covering its fenced layout, separate small-dog area, seasonal hours, free parking, and handler rules from the Town of Whitby.";
  const intro = "<p>Whitby Off Leash Dog Park South is the Town of Whitby's Jeffery Street South off-leash location. Whitby says it sits at the north end of Jeffery Street, north of Victoria Street West, next to Lynde Shores Conservation Area, and includes free parking for dog-park users during operating hours.</p>";
  const body = "<p>The current Town of Whitby source set makes this a much stronger page than the older local record suggested. Whitby's official off-leash dog parks page identifies the south park as the Jeffery Street South location, not the Garden Street address stored in the stale record. The Town places it at the north end of Jeffery Street South, north of Victoria Street West, beside Lynde Shores Conservation Area. Whitby also says both of its off-leash dog parks have fenced perimeters and separate fenced areas for small dogs, which directly corrects the older page data that claimed there was no small-dog section.</p><p>Whitby publishes usable operating details too. Off-leash dog parks are open from April 1 to September 30 between 6 a.m. and 10 p.m., and from October 1 to March 31 between 6 a.m. and 8 p.m. The Town also notes that this south location has free parking during its hours of operation. The handler rules are clear: dogs must be licensed and vaccinated, leashed before entering and exiting, kept within sight and under verbal control, and limited to a maximum of three dogs per owner or handler. Whitby also says handlers must be at least 16 years old and should not bring dogs that are sick, aggressive, in heat, or younger than four months old.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.whitby.ca/explore-and-enjoy/parks-and-recreation/off-leash-dog-parks/ and https://www.whitby.ca/explore-and-enjoy/whitby-tourism/see-and-do/the-great-outdoors/. These sources support the Jeffery Street South location next to Lynde Shores Conservation Area, free parking during operating hours, fenced perimeter, separate small-dog area, and Whitby's current seasonal hours and handler code of conduct.</p>";

  park.title = "Whitby Off Leash Dog Park South";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Whitby"],
    Province: ["Ontario"],
    Tags: ["leash-free", "fenced", "small-dog-area", "conservation-area"]
  };

  Object.assign(park.raw, {
    "Park Name": "Whitby Off Leash Dog Park South",
    "Park Header": "Whitby Off Leash Dog Park South",
    "Description": body,
    "Street Address": "North end of Jeffery St., north of Victoria St. W., next to Lynde Shores Conservation Area",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Yes",
    "Surface type": "",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - designated containers",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - free during operating hours",
    "Washrooms nearby": "Unknown",
    "Operating hours": "April 1 to September 30: 6 a.m. to 10 p.m.; October 1 to March 31: 6 a.m. to 8 p.m.",
    "Seasonal Restrictions": "Seasonal operating hours published by the Town of Whitby",
    "Park Website or Source": "https://www.whitby.ca/explore-and-enjoy/parks-and-recreation/off-leash-dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Jeffery+Street+South+off+leash+dog+park+Whitby+ON",
    "Tags": "leash-free,fenced,small-dog-area,conservation-area",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "whitby-park-south");
  if (!targetRow) throw new Error("Whitby South park CSV row not found.");

  const updates = {
    "Park Name": "Whitby Off Leash Dog Park South",
    "Park Header": "Whitby Off Leash Dog Park South",
    "Description": "<p>The current Town of Whitby source set makes this a much stronger page than the older local record suggested. Whitby's official off-leash dog parks page identifies the south park as the Jeffery Street South location, not the Garden Street address stored in the stale record. The Town places it at the north end of Jeffery Street South, north of Victoria Street West, beside Lynde Shores Conservation Area. Whitby also says both of its off-leash dog parks have fenced perimeters and separate fenced areas for small dogs, which directly corrects the older page data that claimed there was no small-dog section.</p><p>Whitby publishes usable operating details too. Off-leash dog parks are open from April 1 to September 30 between 6 a.m. and 10 p.m., and from October 1 to March 31 between 6 a.m. and 8 p.m. The Town also notes that this south location has free parking during its hours of operation. The handler rules are clear: dogs must be licensed and vaccinated, leashed before entering and exiting, kept within sight and under verbal control, and limited to a maximum of three dogs per owner or handler. Whitby also says handlers must be at least 16 years old and should not bring dogs that are sick, aggressive, in heat, or younger than four months old.</p>",
    "Street Address": "North end of Jeffery St., north of Victoria St. W., next to Lynde Shores Conservation Area",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Yes",
    "Surface type": "",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - designated containers",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - free during operating hours",
    "Washrooms nearby": "Unknown",
    "Operating hours": "April 1 to September 30: 6 a.m. to 10 p.m.; October 1 to March 31: 6 a.m. to 8 p.m.",
    "Seasonal Restrictions": "Seasonal operating hours published by the Town of Whitby",
    "Park Website or Source": "https://www.whitby.ca/explore-and-enjoy/parks-and-recreation/off-leash-dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Jeffery+Street+South+off+leash+dog+park+Whitby+ON",
    "Tags": "leash-free,fenced,small-dog-area,conservation-area",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.whitby.ca/explore-and-enjoy/parks-and-recreation/off-leash-dog-parks/ and https://www.whitby.ca/explore-and-enjoy/whitby-tourism/see-and-do/the-great-outdoors/. These sources support the Jeffery Street South location next to Lynde Shores Conservation Area, free parking during operating hours, fenced perimeter, separate small-dog area, and Whitby's current seasonal hours and handler code of conduct.</p>",
    "Intro Paragraph": "<p>Whitby Off Leash Dog Park South is the Town of Whitby's Jeffery Street South off-leash location. Whitby says it sits at the north end of Jeffery Street, north of Victoria Street West, next to Lynde Shores Conservation Area, and includes free parking for dog-park users during operating hours.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Whitby Off Leash Dog Park South | Whitby, ON | LeashFree.ca",
    "Meta Description": "Source-backed guide to Whitby's Jeffery Street South off-leash dog park, covering its fenced layout, separate small-dog area, seasonal hours, free parking, and handler rules from the Town of Whitby.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/whitby-park-south/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/whitby-park-south/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Whitby Off Leash Dog Park South and refreshed backlog files.");
