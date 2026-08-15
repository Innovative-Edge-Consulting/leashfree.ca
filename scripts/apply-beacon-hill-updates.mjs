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
  const line = '  "beacon-hill-park-victoria": "/images/dog-parks/beacon-hill-park-victoria-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "battleford-off-leash-dog-park": "/images/dog-parks/battleford-off-leash-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "beacon-hill-park-victoria");
  if (!park) throw new Error("Beacon Hill park record not found.");

  const seoTitle = "Beacon Hill Park Leash-Optional Area | Victoria, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to the dog leash-optional area at Beacon Hill Park in Victoria, covering the official 100 Cook Street park address, the south-of-Dallas-Road off-leash area, and current wildlife-related dog restrictions.";
  const intro = "<p>Beacon Hill Park is one of Victoria's largest and best-known parks, but dogs are not off-leash throughout the site. The City of Victoria says dogs must be on leash at all times in Beacon Hill Park except in the designated leash-optional area south of Dallas Road, closer to the ocean.</p>";
  const body = "<p>The key quality fix on this page is narrowing the claim to what Victoria actually publishes. The older record made Beacon Hill sound like a broadly off-leash park with scenic trails and open lawns for roaming. Victoria's current dog-rules page is more specific: dogs must be on leash throughout Beacon Hill Park except in the leash-optional area located south of Dallas Road. That makes this page more useful when it is framed as a guide to the designated leash-optional portion of Beacon Hill rather than a claim that the entire park functions as a dog park.</p><p>Victoria's official pages also add restrictions that matter for visitors. The City lists a no-dog area near the Beacon Hill Park heron rookery south of Goodacre Lake, and notes that only certified assistance dogs are allowed there. The general dog rules for Victoria's leash-optional areas also require owners to control their dogs at all times, pick up after them, stop them from jumping on people, and keep them leashed outside the designated off-leash section. Beacon Hill's park page confirms the 100 Cook Street address and lists park amenities such as trails, beach access, washrooms, and leash-optional areas, so this page can offer practical orientation without overstating site-wide off-leash freedom.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.victoria.ca/parks-recreation/our-parks/dogs-parks, https://www.victoria.ca/parks-recreation/parks-trails/our-parks/beacon-hill-park, and https://www.victoria.ca/parks-recreation/our-parks/public-washrooms. These sources support the 100 Cook Street park address, the leash-optional area south of Dallas Road, the no-dog restriction near the heron rookery south of Goodacre Lake, and the presence of park washrooms at Beacon Hill Park.</p>";

  park.title = "Beacon Hill Park Leash-Optional Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Victoria"],
    Province: ["British Columbia"],
    Tags: ["leash-optional", "coastal", "wildlife-sensitive", "victoria"]
  };

  Object.assign(park.raw, {
    "Park Name": "Beacon Hill Park",
    "Park Header": "Beacon Hill Park Leash-Optional Area",
    "Description": body,
    "Street Address": "100 Cook Street",
    "latitude": "",
    "longitude": "",
    "Postal Code": "V8V 4Z8",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass and paths",
    "Size": "Leash-optional area within a large city park",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Yes",
    "Operating hours": "",
    "Seasonal Restrictions": "Dogs must stay on leash outside the designated leash-optional area south of Dallas Road; no dogs near the heron rookery south of Goodacre Lake except certified assistance dogs",
    "Park Website or Source": "https://www.victoria.ca/parks-recreation/our-parks/dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=100+Cook+Street+Victoria+BC",
    "Tags": "leash-optional,coastal,wildlife-sensitive,victoria",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "beacon-hill-park-victoria");
  if (!targetRow) throw new Error("Beacon Hill park CSV row not found.");

  const updates = {
    "Park Name": "Beacon Hill Park",
    "Park Header": "Beacon Hill Park Leash-Optional Area",
    "Description": "<p>The key quality fix on this page is narrowing the claim to what Victoria actually publishes. The older record made Beacon Hill sound like a broadly off-leash park with scenic trails and open lawns for roaming. Victoria's current dog-rules page is more specific: dogs must be on leash throughout Beacon Hill Park except in the leash-optional area located south of Dallas Road. That makes this page more useful when it is framed as a guide to the designated leash-optional portion of Beacon Hill rather than a claim that the entire park functions as a dog park.</p><p>Victoria's official pages also add restrictions that matter for visitors. The City lists a no-dog area near the Beacon Hill Park heron rookery south of Goodacre Lake, and notes that only certified assistance dogs are allowed there. The general dog rules for Victoria's leash-optional areas also require owners to control their dogs at all times, pick up after them, stop them from jumping on people, and keep them leashed outside the designated off-leash section. Beacon Hill's park page confirms the 100 Cook Street address and lists park amenities such as trails, beach access, washrooms, and leash-optional areas, so this page can offer practical orientation without overstating site-wide off-leash freedom.</p>",
    "Street Address": "100 Cook Street",
    "latitude": "",
    "longitude": "",
    "Postal Code": "V8V 4Z8",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass and paths",
    "Size": "Leash-optional area within a large city park",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Yes",
    "Operating hours": "",
    "Seasonal Restrictions": "Dogs must stay on leash outside the designated leash-optional area south of Dallas Road; no dogs near the heron rookery south of Goodacre Lake except certified assistance dogs",
    "Park Website or Source": "https://www.victoria.ca/parks-recreation/our-parks/dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=100+Cook+Street+Victoria+BC",
    "Tags": "leash-optional,coastal,wildlife-sensitive,victoria",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.victoria.ca/parks-recreation/our-parks/dogs-parks, https://www.victoria.ca/parks-recreation/parks-trails/our-parks/beacon-hill-park, and https://www.victoria.ca/parks-recreation/our-parks/public-washrooms. These sources support the 100 Cook Street park address, the leash-optional area south of Dallas Road, the no-dog restriction near the heron rookery south of Goodacre Lake, and the presence of park washrooms at Beacon Hill Park.</p>",
    "Intro Paragraph": "<p>Beacon Hill Park is one of Victoria's largest and best-known parks, but dogs are not off-leash throughout the site. The City of Victoria says dogs must be on leash at all times in Beacon Hill Park except in the designated leash-optional area south of Dallas Road, closer to the ocean.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Beacon Hill Park Leash-Optional Area | Victoria, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to the dog leash-optional area at Beacon Hill Park in Victoria, covering the official 100 Cook Street park address, the south-of-Dallas-Road off-leash area, and current wildlife-related dog restrictions.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/beacon-hill-park-victoria/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/beacon-hill-park-victoria/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Beacon Hill Park and refreshed backlog files.");
