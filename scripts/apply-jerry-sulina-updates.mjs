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
  const line = '  "jerry-sulina-park-maple-ridge": "/images/dog-parks/jerry-sulina-park-maple-ridge-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "jackie-parker-park-off-leash-area": "/images/dog-parks/jackie-parker-park-off-leash-area-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "jerry-sulina-park-maple-ridge");
  if (!park) throw new Error("Jerry Sulina record not found.");

  const seoTitle = "Jerry Sulina Park Dog Park | Maple Ridge, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Jerry Sulina Park in Maple Ridge, including official off-leash status, the current 13180 210 Street location, dyke-trail access, river access, open rural park character, and Maple Ridge’s current leash and waste rules.";
  const intro = "<p>Jerry Sulina Park is one of Maple Ridge's current official off-leash dog parks. The city's current tourism and eco-tourism material describes it as a rural destination with dyke trails, river access, and an off-leash dog park area, making it a better fit for longer natural walks than a typical fenced urban run.</p>";
  const body = "<p>This page needed a factual rebuild because the old version was directionally right about scenery but too vague to be useful. Maple Ridge's current dogs-in-parks page confirms that Jerry Sulina Park is one of the municipality's official off-leash parks, which is the key fact that makes this a legitimate destination. The city also reminds visitors that dogs must remain on leash in park areas unless they are in designated and signed off-leash zones, and that owners are required to pick up after their pets and dispose of waste responsibly.</p><p>For stronger location and visit context, Maple Ridge's current tourism material is useful. The city's Discover Maple Ridge experience listing places Jerry Sulina Park at <strong>13180 210 Street</strong> and describes it as a good starting point for the historic dyke trail system. The same listing says the off-leash area includes <strong>water access</strong> and <strong>tall grass</strong>, with views toward <strong>Golden Ears Mountain</strong>, the <strong>Alouette River</strong>, and surrounding agricultural land. Maple Ridge's eco-tourism page reinforces that description by framing Jerry Sulina Park as a family-friendly green space with <strong>dyke trails</strong>, <strong>river access</strong>, and an off-leash dog park, while also noting that the trails are approachable for beginners.</p><p>This update improves the page by replacing generic filler with what the city currently publishes: official off-leash status, a current location reference, dyke-trail and river-access context, and the broader rural-park character that distinguishes Jerry Sulina Park from Maple Ridge's more compact neighbourhood dog areas.</p>";
  const notes = "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks ; https://discover.mapleridge.ca/experiences/208924 ; https://www.mapleridge.ca/explore-maple-ridge/eco-tourism ; and https://www.mapleridge.ca/resident-services/animal-control . These sources support Jerry Sulina Park's official off-leash status, the 13180 210 Street location reference, dyke trails, river access, water access in the dog area, and Maple Ridge's current leash and waste rules.</p>";

  park.title = "Jerry Sulina Park Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Maple Ridge"],
    Province: ["British Columbia"],
    Tags: ["off-leash", "dyke-trails", "river-access", "golden-ears-views"]
  };

  Object.assign(park.raw, {
    "Park Name": "Jerry Sulina Park",
    "Park Header": "Jerry Sulina Park Dog Park",
    "Description": body,
    "Street Address": "13180 210 Street",
    "latitude": "",
    "longitude": "",
    "City": "Maple Ridge",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Dyke trails, grass, and river-edge natural terrain",
    "Size": "Large rural off-leash area",
    "Water source available": "Yes - water access in dog area",
    "Benches": "Unknown",
    "Shaded area": "Some natural tree cover",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Follow posted off-leash signs and river-edge safety conditions",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=13180+210+Street+Maple+Ridge+BC",
    "Tags": "off-leash,dyke-trails,river-access,golden-ears-views",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "jerry-sulina-park-maple-ridge");
  if (!targetRow) throw new Error("Jerry Sulina CSV row not found.");
  const updates = {
    "Park Name": "Jerry Sulina Park",
    "Park Header": "Jerry Sulina Park Dog Park",
    "Description": "<p>This page needed a factual rebuild because the old version was directionally right about scenery but too vague to be useful. Maple Ridge's current dogs-in-parks page confirms that Jerry Sulina Park is one of the municipality's official off-leash parks, which is the key fact that makes this a legitimate destination. The city also reminds visitors that dogs must remain on leash in park areas unless they are in designated and signed off-leash zones, and that owners are required to pick up after their pets and dispose of waste responsibly.</p><p>For stronger location and visit context, Maple Ridge's current tourism material is useful. The city's Discover Maple Ridge experience listing places Jerry Sulina Park at <strong>13180 210 Street</strong> and describes it as a good starting point for the historic dyke trail system. The same listing says the off-leash area includes <strong>water access</strong> and <strong>tall grass</strong>, with views toward <strong>Golden Ears Mountain</strong>, the <strong>Alouette River</strong>, and surrounding agricultural land. Maple Ridge's eco-tourism page reinforces that description by framing Jerry Sulina Park as a family-friendly green space with <strong>dyke trails</strong>, <strong>river access</strong>, and an off-leash dog park, while also noting that the trails are approachable for beginners.</p><p>This update improves the page by replacing generic filler with what the city currently publishes: official off-leash status, a current location reference, dyke-trail and river-access context, and the broader rural-park character that distinguishes Jerry Sulina Park from Maple Ridge's more compact neighbourhood dog areas.</p>",
    "Street Address": "13180 210 Street",
    "latitude": "",
    "longitude": "",
    "City": "Maple Ridge",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Dyke trails, grass, and river-edge natural terrain",
    "Size": "Large rural off-leash area",
    "Water source available": "Yes - water access in dog area",
    "Benches": "Unknown",
    "Shaded area": "Some natural tree cover",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Follow posted off-leash signs and river-edge safety conditions",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=13180+210+Street+Maple+Ridge+BC",
    "Tags": "off-leash,dyke-trails,river-access,golden-ears-views",
    "Notes / Comments": "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks ; https://discover.mapleridge.ca/experiences/208924 ; https://www.mapleridge.ca/explore-maple-ridge/eco-tourism ; and https://www.mapleridge.ca/resident-services/animal-control . These sources support Jerry Sulina Park's official off-leash status, the 13180 210 Street location reference, dyke trails, river access, water access in the dog area, and Maple Ridge's current leash and waste rules.</p>",
    "Intro Paragraph": "<p>Jerry Sulina Park is one of Maple Ridge's current official off-leash dog parks. The city's current tourism and eco-tourism material describes it as a rural destination with dyke trails, river access, and an off-leash dog park area, making it a better fit for longer natural walks than a typical fenced urban run.</p>",
    "Media": "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Jerry Sulina Park Dog Park | Maple Ridge, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Jerry Sulina Park in Maple Ridge, including official off-leash status, the current 13180 210 Street location, dyke-trail access, river access, open rural park character, and Maple Ridge’s current leash and waste rules.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/jerry-sulina-park-maple-ridge/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/jerry-sulina-park-maple-ridge/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Jerry Sulina and refreshed backlog files.");
