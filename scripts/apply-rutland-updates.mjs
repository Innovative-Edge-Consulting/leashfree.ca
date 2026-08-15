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
  const line = '  "rutland-recreation-park-kelowna": "/images/dog-parks/rutland-recreation-park-kelowna-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "ruth-johnson-park": "/images/dog-parks/ruth-johnson-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "rutland-recreation-park-kelowna");
  if (!park) throw new Error("Rutland Recreation Park record not found.");

  const seoTitle = "Rutland Recreation Park Dog Area | Kelowna, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Rutland Recreation Park in Kelowna, covering the official 645 Dodd Rd location, the designated off-leash dog area within this multi-use recreation park, and the current 2026 park upgrade work.";
  const intro = "<p>Rutland Recreation Park is a large City of Kelowna recreation park at 645 Dodd Rd that includes a designated off-leash dog area within a broader sports and community park setting. Current City pages list the park as both on-leash and off-leash and place it among Kelowna's official off-leash dog park locations.</p>";
  const body = "<p>Rutland Recreation Park is not a stand-alone fenced dog run. The City of Kelowna describes it as a 14.56-hectare family recreation park with a designated off-leash dog area inside a much larger site that also includes soccer fields, ball diamonds, a BMX facility, community gardens, pickleball courts, trails and washrooms. The same City page notes that the park is home to the Rutland Arena, Kelowna Family Y, Okanagan Gymnastics Centre and Rutland Activity Centre, so visitors should expect a busy multi-use environment rather than an isolated dog-only space.</p><p>Kelowna's current dog parks page confirms Rutland Dog Park at 645 Dodd Road as one of the City's official off-leash locations and publishes the active off-leash rules used across these sites. Those rules require handlers to pick up after dogs, keep dogs under control and in view, remove dogs at the first sign of aggression, keep dogs leashed when entering and exiting the off-leash area, and ensure dogs are legally licensed and currently vaccinated. The City also limits off-leash use to dogs, handlers and accompanying visitors, does not allow dogs under four months old or female dogs in heat, requires handlers to be at least 15 years old, and requires children 14 and under to be accompanied by an adult inside the off-leash area.</p><p>There is also a current site condition worth knowing before you visit. In a City of Kelowna news release dated July 3, 2026, the City said the next phase of Rutland Recreation Park upgrades would begin July 6, 2026 and continue through December 2026. The published work includes a new artificial turf field, walking pathways, event space and irrigation upgrades, so access patterns or the feel of the park may differ while construction is underway.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/rutland-recreation-park, https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks, and the City of Kelowna news release published July 3, 2026 at https://www.kelowna.ca/our-community/news-events/news/construction-start-%C2%A0rutland-recreation-park-upgrades. These sources support the 645 Dodd Rd address, on-leash and off-leash status, core park amenities, Kelowna's current off-leash rules, and the July to December 2026 upgrade work.</p>";

  park.title = "Rutland Recreation Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Kelowna"],
    Province: ["British Columbia"],
    Tags: ["off-leash", "multi-use-park", "sports-park", "construction-2026"]
  };

  Object.assign(park.raw, {
    "Park Name": "Rutland Recreation Park",
    "Park Header": "Rutland Recreation Park",
    "Description": body,
    "Street Address": "645 Dodd Rd",
    "latitude": "",
    "longitude": "",
    "City": "Kelowna",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and park pathways",
    "Size": "14.56 ha park with a designated off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Yes",
    "Operating hours": "",
    "Seasonal Restrictions": "Construction upgrades underway from July 6, 2026 through December 2026; check City of Kelowna updates before visiting",
    "Park Website or Source": "https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/rutland-recreation-park",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=645+Dodd+Rd+Kelowna+BC",
    "Tags": "off-leash,multi-use-park,sports-park,construction-2026",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "rutland-recreation-park-kelowna");
  if (!targetRow) throw new Error("Rutland Recreation Park CSV row not found.");

  const updates = {
    "Park Name": "Rutland Recreation Park",
    "Park Header": "Rutland Recreation Park",
    "Description": "<p>Rutland Recreation Park is not a stand-alone fenced dog run. The City of Kelowna describes it as a 14.56-hectare family recreation park with a designated off-leash dog area inside a much larger site that also includes soccer fields, ball diamonds, a BMX facility, community gardens, pickleball courts, trails and washrooms. The same City page notes that the park is home to the Rutland Arena, Kelowna Family Y, Okanagan Gymnastics Centre and Rutland Activity Centre, so visitors should expect a busy multi-use environment rather than an isolated dog-only space.</p><p>Kelowna's current dog parks page confirms Rutland Dog Park at 645 Dodd Road as one of the City's official off-leash locations and publishes the active off-leash rules used across these sites. Those rules require handlers to pick up after dogs, keep dogs under control and in view, remove dogs at the first sign of aggression, keep dogs leashed when entering and exiting the off-leash area, and ensure dogs are legally licensed and currently vaccinated. The City also limits off-leash use to dogs, handlers and accompanying visitors, does not allow dogs under four months old or female dogs in heat, requires handlers to be at least 15 years old, and requires children 14 and under to be accompanied by an adult inside the off-leash area.</p><p>There is also a current site condition worth knowing before you visit. In a City of Kelowna news release dated July 3, 2026, the City said the next phase of Rutland Recreation Park upgrades would begin July 6, 2026 and continue through December 2026. The published work includes a new artificial turf field, walking pathways, event space and irrigation upgrades, so access patterns or the feel of the park may differ while construction is underway.</p>",
    "Street Address": "645 Dodd Rd",
    "latitude": "",
    "longitude": "",
    "City": "Kelowna",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and park pathways",
    "Size": "14.56 ha park with a designated off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Yes",
    "Operating hours": "",
    "Seasonal Restrictions": "Construction upgrades underway from July 6, 2026 through December 2026; check City of Kelowna updates before visiting",
    "Park Website or Source": "https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/rutland-recreation-park",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=645+Dodd+Rd+Kelowna+BC",
    "Tags": "off-leash,multi-use-park,sports-park,construction-2026",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/rutland-recreation-park, https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks, and the City of Kelowna news release published July 3, 2026 at https://www.kelowna.ca/our-community/news-events/news/construction-start-%C2%A0rutland-recreation-park-upgrades. These sources support the 645 Dodd Rd address, on-leash and off-leash status, core park amenities, Kelowna's current off-leash rules, and the July to December 2026 upgrade work.</p>",
    "Intro Paragraph": "<p>Rutland Recreation Park is a large City of Kelowna recreation park at 645 Dodd Rd that includes a designated off-leash dog area within a broader sports and community park setting. Current City pages list the park as both on-leash and off-leash and place it among Kelowna's official off-leash dog park locations.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Rutland Recreation Park Dog Area | Kelowna, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Rutland Recreation Park in Kelowna, covering the official 645 Dodd Rd location, the designated off-leash dog area within this multi-use recreation park, and the current 2026 park upgrade work.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/rutland-recreation-park-kelowna/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/rutland-recreation-park-kelowna/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Rutland Recreation Park and refreshed backlog files.");
