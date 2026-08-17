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
  const line = '  "audley-recreation-centre": "/images/dog-parks/audley-recreation-centre-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "apollo-crater-park": "/images/dog-parks/apollo-crater-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "audley-recreation-centre");
  if (!park) throw new Error("Audley record not found.");

  const seoTitle = "Audley Recreation Centre Off-Leash Area | Ajax, ON | LeashFree.ca";
  const metaDescription = "Source-backed guide to the Audley Recreation Centre off-leash area in Ajax, including the current Audley Road location, the off-leash site west of the baseball fields, and the Town of Ajax's current leash-free park network context.";
  const intro = "<p>Audley Recreation Centre is one of Ajax's current designated off-leash dog park locations. The Town of Ajax's current parks pages place the off-leash area west of the baseball fields, and current service mapping identifies it as the Audley Off-Leash Dog Park at the Audley Recreation Centre on Audley Road.</p>";
  const body = "<p>This page needed a factual rebuild because the old version was mostly generic and pointed to the wrong kind of source page. Ajax's current outdoor pages clearly still treat Audley Recreation Centre as one of the town's designated off-leash locations. The most useful current description is straightforward: the off-leash area is west of the baseball fields at Audley Recreation Centre, which gives dog owners a practical on-site reference instead of vague copy about a general grassy area.</p><p>The town's current waste and pet-service mapping also helps tighten the location details. Ajax lists the site as the <strong>Audley Off-Leash Dog Park</strong> at <strong>Audley Recreation Centre, 2001 Audley Road</strong>, while the recreation centre itself is commonly listed at <strong>1955 Audley Road North</strong>. The best way to present that without over-claiming is to anchor the page to the recreation centre complex and the off-leash area's position west of the baseball fields, rather than pretending the town publishes a detailed stand-alone facility profile for the dog park itself.</p><p>Ajax's broader leash-free network context is also worth preserving. The town's current parks pages say Ajax has designated off-leash areas at the bottom of Hermitage Park, Greenwood Conservation Area, the Anglers Parking Area on Westney Road, Audley Recreation Centre, and Mulberry Meadows Neighbourhood Park. The same source currently says there are four designated off-leash areas while listing five, so this page now reflects the town's published location details conservatively instead of padding the entry with unsupported amenities or rules. This update improves the page by replacing filler with what Ajax actually publishes now: current off-leash status, clear placement west of the baseball fields, and the current Audley Road location context.</p>";
  const notes = "<p>Primary sources reviewed on August 17, 2026: https://www.ajax.ca/en/play-and-discover/parks-trails-and-conservation-areas.aspx ; https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/ ; and https://ajax.ca/life-in-ajax/town-services/garbage-recycling/ . These sources support Audley Recreation Centre's continued status as one of Ajax's designated off-leash areas, its placement west of the baseball fields, and the current Audley Road address context used by the town's service mapping.</p>";

  park.title = "Audley Recreation Centre Off-Leash Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Ajax"],
    Province: ["Ontario"],
    Tags: ["off-leash", "sports-fields", "audley-road", "ajax-network"]
  };

  Object.assign(park.raw, {
    "Park Name": "Audley Recreation Centre Off-Leash Area",
    "Park Header": "Audley Recreation Centre Off-Leash Area",
    "Description": body,
    "Street Address": "Audley Recreation Centre, west of the baseball fields",
    "latitude": "",
    "longitude": "",
    "City": "Ajax",
    "Province": "Ontario",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "Neighbourhood off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - at the recreation centre complex",
    "Washrooms nearby": "Yes - recreation centre complex",
    "Operating hours": "",
    "Seasonal Restrictions": "Follow posted town signage and current recreation-centre site access",
    "Park Website or Source": "https://www.ajax.ca/en/play-and-discover/parks-trails-and-conservation-areas.aspx",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Audley+Off-Leash+Dog+Park+Ajax+ON",
    "Tags": "off-leash,sports-fields,audley-road,ajax-network",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "audley-recreation-centre");
  if (!targetRow) throw new Error("Audley CSV row not found.");
  const updates = {
    "Park Name": "Audley Recreation Centre Off-Leash Area",
    "Park Header": "Audley Recreation Centre Off-Leash Area",
    "Description": "<p>This page needed a factual rebuild because the old version was mostly generic and pointed to the wrong kind of source page. Ajax's current outdoor pages clearly still treat Audley Recreation Centre as one of the town's designated off-leash locations. The most useful current description is straightforward: the off-leash area is west of the baseball fields at Audley Recreation Centre, which gives dog owners a practical on-site reference instead of vague copy about a general grassy area.</p><p>The town's current waste and pet-service mapping also helps tighten the location details. Ajax lists the site as the <strong>Audley Off-Leash Dog Park</strong> at <strong>Audley Recreation Centre, 2001 Audley Road</strong>, while the recreation centre itself is commonly listed at <strong>1955 Audley Road North</strong>. The best way to present that without over-claiming is to anchor the page to the recreation centre complex and the off-leash area's position west of the baseball fields, rather than pretending the town publishes a detailed stand-alone facility profile for the dog park itself.</p><p>Ajax's broader leash-free network context is also worth preserving. The town's current parks pages say Ajax has designated off-leash areas at the bottom of Hermitage Park, Greenwood Conservation Area, the Anglers Parking Area on Westney Road, Audley Recreation Centre, and Mulberry Meadows Neighbourhood Park. The same source currently says there are four designated off-leash areas while listing five, so this page now reflects the town's published location details conservatively instead of padding the entry with unsupported amenities or rules. This update improves the page by replacing filler with what Ajax actually publishes now: current off-leash status, clear placement west of the baseball fields, and the current Audley Road location context.</p>",
    "Street Address": "Audley Recreation Centre, west of the baseball fields",
    "latitude": "",
    "longitude": "",
    "City": "Ajax",
    "Province": "Ontario",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "Neighbourhood off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - at the recreation centre complex",
    "Washrooms nearby": "Yes - recreation centre complex",
    "Operating hours": "",
    "Seasonal Restrictions": "Follow posted town signage and current recreation-centre site access",
    "Park Website or Source": "https://www.ajax.ca/en/play-and-discover/parks-trails-and-conservation-areas.aspx",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Audley+Off-Leash+Dog+Park+Ajax+ON",
    "Tags": "off-leash,sports-fields,audley-road,ajax-network",
    "Notes / Comments": "<p>Primary sources reviewed on August 17, 2026: https://www.ajax.ca/en/play-and-discover/parks-trails-and-conservation-areas.aspx ; https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/ ; and https://ajax.ca/life-in-ajax/town-services/garbage-recycling/ . These sources support Audley Recreation Centre's continued status as one of Ajax's designated off-leash areas, its placement west of the baseball fields, and the current Audley Road address context used by the town's service mapping.</p>",
    "Intro Paragraph": "<p>Audley Recreation Centre is one of Ajax's current designated off-leash dog park locations. The Town of Ajax's current parks pages place the off-leash area west of the baseball fields, and current service mapping identifies it as the Audley Off-Leash Dog Park at the Audley Recreation Centre on Audley Road.</p>",
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Audley Recreation Centre Off-Leash Area | Ajax, ON | LeashFree.ca",
    "Meta Description": "Source-backed guide to the Audley Recreation Centre off-leash area in Ajax, including the current Audley Road location, the off-leash site west of the baseball fields, and the Town of Ajax's current leash-free park network context.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/audley-recreation-centre/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/audley-recreation-centre/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Audley and refreshed backlog files.");
