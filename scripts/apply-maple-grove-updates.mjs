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
  const line = '  "maple-grove-park": "/images/dog-parks/maple-grove-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "malvern-park-burnaby": "/images/dog-parks/malvern-park-burnaby-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "maple-grove-park");
  if (!park) throw new Error("Maple Grove Park record not found.");

  const seoTitle = "Maple Grove Park Dog Park | Winnipeg, MB | LeashFree.ca";
  const metaDescription = "Source-backed guide to Maple Grove Park in Winnipeg, covering the official 100 Frobisher Road location, entry by the Fields for Fido kiosk, the fenced puppy area, 7 a.m. to 11 p.m. hours, and the shade shelter opened on October 4, 2025.";
  const intro = "<p>Maple Grove Park is one of Winnipeg's larger official off-leash dog areas at 100 Frobisher Road. The City currently directs visitors to enter near the Fields for Fido kiosk and says to use only the area directly north of the kiosk while staying within the pathway.</p>";
  const body = "<p>Maple Grove is a stronger municipal source page than the thin copy it replaces. Winnipeg's current off-leash dog area locations page gives a precise description of how to use the site: Maple Grove Park is at 100 Frobisher Road, includes a fenced-in area for puppies, and has its off-leash entrance by the Fields for Fido kiosk. The City also instructs visitors to stay only in the area directly north of the kiosk and to remain within the pathway, which is practical trip-planning guidance that belongs on the page.</p><p>The City also describes Maple Grove as a multi-use park, not a dog-only facility. Its current page says park users may also encounter rugby, soccer and football activity, along with skiers, snowshoers, walkers, runners and cyclists. Winnipeg's current off-leash rules page adds the operating framework: off-leash areas are generally not fenced unless noted, owners must remain present and within view of their dogs at all times, dogs must be under voice control, a leash must be in hand, aggressive dogs and female dogs in heat are not allowed, waste must be picked up, licensing is required, and sites are open from 7 a.m. to 11 p.m. unless posted otherwise.</p><p>There is also a current improvement worth noting because it materially changes the visitor experience. In a City of Winnipeg news release published on October 4, 2025, the City announced the opening of a new shade shelter at Maple Grove Dog Park. The release says users can reach the shelter via a new granular path and that solar lighting was planned to illuminate evening visits. That makes Maple Grove one of the stronger Winnipeg pages in this queue because the City provides both basic access rules and a recent site enhancement visitors can actually use.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://legacy.winnipeg.ca/PublicWorks/Parks/off-leash-dog-areas-locations.stm, https://legacy.winnipeg.ca/publicworks/parks/off-leash-dog-areas.stm, and the City of Winnipeg news release published October 4, 2025 at https://www.winnipeg.ca/news/2025-10-04-officials-raise-woof-er-roof-maple-grove. These sources support the 100 Frobisher Road address, kiosk-based entrance instructions, fenced puppy area, 7 a.m. to 11 p.m. hours, off-leash rules, and the shade shelter opening.</p>";

  park.title = "Maple Grove Park Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Winnipeg"],
    Province: ["Manitoba"],
    Tags: ["off-leash", "regional-site", "puppy-area", "shade-shelter"]
  };

  Object.assign(park.raw, {
    "Park Name": "Maple Grove Park",
    "Park Header": "Maple Grove Park Dog Park",
    "Description": body,
    "Street Address": "100 Frobisher Rd",
    "latitude": "",
    "longitude": "",
    "City": "Winnipeg",
    "Province": "Manitoba",
    "Postal Code": "",
    "Fenced": "Partially - fenced in area for puppies",
    "Separate Small Dog Area": "Yes - fenced puppy area",
    "Surface type": "Grass and park pathways",
    "Size": "Large regional off-leash site",
    "Water source available": "Unknown",
    "Benches": "Yes - shade shelter added in 2025",
    "Shaded area": "Yes - shade shelter added in 2025",
    "Waste bins": "Yes",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7 a.m. to 11 p.m.",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://legacy.winnipeg.ca/PublicWorks/Parks/off-leash-dog-areas-locations.stm",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=100+Frobisher+Rd+Winnipeg+MB",
    "Tags": "off-leash,regional-site,puppy-area,shade-shelter",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "maple-grove-park");
  if (!targetRow) throw new Error("Maple Grove Park CSV row not found.");
  const updates = {
    "Park Name": "Maple Grove Park",
    "Park Header": "Maple Grove Park Dog Park",
    "Description": "<p>Maple Grove is a stronger municipal source page than the thin copy it replaces. Winnipeg's current off-leash dog area locations page gives a precise description of how to use the site: Maple Grove Park is at 100 Frobisher Road, includes a fenced-in area for puppies, and has its off-leash entrance by the Fields for Fido kiosk. The City also instructs visitors to stay only in the area directly north of the kiosk and to remain within the pathway, which is practical trip-planning guidance that belongs on the page.</p><p>The City also describes Maple Grove as a multi-use park, not a dog-only facility. Its current page says park users may also encounter rugby, soccer and football activity, along with skiers, snowshoers, walkers, runners and cyclists. Winnipeg's current off-leash rules page adds the operating framework: off-leash areas are generally not fenced unless noted, owners must remain present and within view of their dogs at all times, dogs must be under voice control, a leash must be in hand, aggressive dogs and female dogs in heat are not allowed, waste must be picked up, licensing is required, and sites are open from 7 a.m. to 11 p.m. unless posted otherwise.</p><p>There is also a current improvement worth noting because it materially changes the visitor experience. In a City of Winnipeg news release published on October 4, 2025, the City announced the opening of a new shade shelter at Maple Grove Dog Park. The release says users can reach the shelter via a new granular path and that solar lighting was planned to illuminate evening visits. That makes Maple Grove one of the stronger Winnipeg pages in this queue because the City provides both basic access rules and a recent site enhancement visitors can actually use.</p>",
    "Street Address": "100 Frobisher Rd",
    "latitude": "",
    "longitude": "",
    "City": "Winnipeg",
    "Province": "Manitoba",
    "Postal Code": "",
    "Fenced": "Partially - fenced in area for puppies",
    "Separate Small Dog Area": "Yes - fenced puppy area",
    "Surface type": "Grass and park pathways",
    "Size": "Large regional off-leash site",
    "Water source available": "Unknown",
    "Benches": "Yes - shade shelter added in 2025",
    "Shaded area": "Yes - shade shelter added in 2025",
    "Waste bins": "Yes",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7 a.m. to 11 p.m.",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://legacy.winnipeg.ca/PublicWorks/Parks/off-leash-dog-areas-locations.stm",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=100+Frobisher+Rd+Winnipeg+MB",
    "Tags": "off-leash,regional-site,puppy-area,shade-shelter",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://legacy.winnipeg.ca/PublicWorks/Parks/off-leash-dog-areas-locations.stm, https://legacy.winnipeg.ca/publicworks/parks/off-leash-dog-areas.stm, and the City of Winnipeg news release published October 4, 2025 at https://www.winnipeg.ca/news/2025-10-04-officials-raise-woof-er-roof-maple-grove. These sources support the 100 Frobisher Road address, kiosk-based entrance instructions, fenced puppy area, 7 a.m. to 11 p.m. hours, off-leash rules, and the shade shelter opening.</p>",
    "Intro Paragraph": "<p>Maple Grove Park is one of Winnipeg's larger official off-leash dog areas at 100 Frobisher Road. The City currently directs visitors to enter near the Fields for Fido kiosk and says to use only the area directly north of the kiosk while staying within the pathway.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Maple Grove Park Dog Park | Winnipeg, MB | LeashFree.ca",
    "Meta Description": "Source-backed guide to Maple Grove Park in Winnipeg, covering the official 100 Frobisher Road location, entry by the Fields for Fido kiosk, the fenced puppy area, 7 a.m. to 11 p.m. hours, and the shade shelter opened on October 4, 2025.",
    "Updated On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/maple-grove-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/maple-grove-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Maple Grove Park and refreshed backlog files.");
