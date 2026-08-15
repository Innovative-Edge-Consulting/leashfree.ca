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
  const line = '  "knox-mountain-dog-park-kelowna": "/images/dog-parks/knox-mountain-dog-park-kelowna-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "klarvatten-off-leash-area": "/images/dog-parks/klarvatten-off-leash-area-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "knox-mountain-dog-park-kelowna");
  if (!park) throw new Error("Knox Mountain park record not found.");

  const seoTitle = "Knox Mountain Dog Park | Kelowna, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Kelowna's designated off-leash dog area at Knox Mountain Park, covering the 450 Knox Mountain Drive park location, park-wide leash boundaries, current rules, and the August 15, 2026 lookout road closure notice.";
  const intro = "<p>Knox Mountain Dog Park refers to the designated off-leash dog area inside Knox Mountain Park at 450 Knox Mountain Drive in Kelowna. The City of Kelowna says the rest of Knox Mountain Park is on-leash only, so this page works best as a guide to the designated off-leash zone rather than the entire mountain park.</p>";
  const body = "<p>The strongest update on this page is narrowing it to Kelowna's actual published dog access rules. Kelowna's dog-parks page lists Knox Mountain Dog Park as a designated off-leash location at 450 Knox Mountain Drive and explicitly states that the rest of Knox Mountain is on-leash only. That distinction matters because Knox Mountain Park is a large, ecologically sensitive natural area with trails, beach access, disc golf, tennis and pickleball courts, washrooms, and both on-leash and off-leash dog status depending on where you are in the park. Treating the whole site as a free-roaming dog park would be inaccurate.</p><p>The City also publishes current operational context for the park. As of Saturday, August 15, 2026, the Knox Mountain Park page says vehicle access to the first lookout is currently closed due to extreme wildfire danger and will resume after a significant decrease in wildfire danger. Regular park hours are also clearer on the park page than on the stale local record: Knox Mountain Park is open daily from 6 a.m. to 10 p.m. Kelowna's standard off-leash rules apply in the designated dog area, including that dogs must be licensed, should be currently vaccinated, must be on leash when entering and exiting, must remain under the handler's control and in view, and must be removed at the first sign of aggression. No dogs under four months old and no female dogs in heat are allowed in the off-leash area.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks and https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/knox-mountain-park. These sources support the designated off-leash location at 450 Knox Mountain Drive, the rule that the rest of Knox Mountain Park is on-leash only, the park amenities and hours, and the current notice that vehicle access to the first lookout is closed because of extreme wildfire danger.</p>";

  park.title = "Knox Mountain Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Kelowna"],
    Province: ["British Columbia"],
    Tags: ["off-leash", "knox-mountain", "okanagan", "designated-area"]
  };

  Object.assign(park.raw, {
    "Park Name": "Knox Mountain Dog Park",
    "Park Header": "Knox Mountain Dog Park",
    "Description": body,
    "Street Address": "450 Knox Mountain Dr",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Natural trail and grass terrain in designated off-leash area",
    "Size": "Designated off-leash location within a 367.34 ha park",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Partial",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - verify access conditions on arrival",
    "Washrooms nearby": "Yes",
    "Operating hours": "6 a.m. to 10 p.m. daily",
    "Seasonal Restrictions": "Rest of Knox Mountain Park is on-leash only; vehicle access to first lookout is currently closed due to extreme wildfire danger as of August 15, 2026",
    "Park Website or Source": "https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=450+Knox+Mountain+Drive+Kelowna+BC",
    "Tags": "off-leash,knox-mountain,okanagan,designated-area",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "knox-mountain-dog-park-kelowna");
  if (!targetRow) throw new Error("Knox Mountain park CSV row not found.");

  const updates = {
    "Park Name": "Knox Mountain Dog Park",
    "Park Header": "Knox Mountain Dog Park",
    "Description": "<p>The strongest update on this page is narrowing it to Kelowna's actual published dog access rules. Kelowna's dog-parks page lists Knox Mountain Dog Park as a designated off-leash location at 450 Knox Mountain Drive and explicitly states that the rest of Knox Mountain is on-leash only. That distinction matters because Knox Mountain Park is a large, ecologically sensitive natural area with trails, beach access, disc golf, tennis and pickleball courts, washrooms, and both on-leash and off-leash dog status depending on where you are in the park. Treating the whole site as a free-roaming dog park would be inaccurate.</p><p>The City also publishes current operational context for the park. As of Saturday, August 15, 2026, the Knox Mountain Park page says vehicle access to the first lookout is currently closed due to extreme wildfire danger and will resume after a significant decrease in wildfire danger. Regular park hours are also clearer on the park page than on the stale local record: Knox Mountain Park is open daily from 6 a.m. to 10 p.m. Kelowna's standard off-leash rules apply in the designated dog area, including that dogs must be licensed, should be currently vaccinated, must be on leash when entering and exiting, must remain under the handler's control and in view, and must be removed at the first sign of aggression. No dogs under four months old and no female dogs in heat are allowed in the off-leash area.</p>",
    "Street Address": "450 Knox Mountain Dr",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Natural trail and grass terrain in designated off-leash area",
    "Size": "Designated off-leash location within a 367.34 ha park",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Partial",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - verify access conditions on arrival",
    "Washrooms nearby": "Yes",
    "Operating hours": "6 a.m. to 10 p.m. daily",
    "Seasonal Restrictions": "Rest of Knox Mountain Park is on-leash only; vehicle access to first lookout is currently closed due to extreme wildfire danger as of August 15, 2026",
    "Park Website or Source": "https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=450+Knox+Mountain+Drive+Kelowna+BC",
    "Tags": "off-leash,knox-mountain,okanagan,designated-area",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.kelowna.ca/parks-recreation/parks-beaches/dog-parks and https://www.kelowna.ca/parks-recreation/parks-beaches/parks-beaches-listing/knox-mountain-park. These sources support the designated off-leash location at 450 Knox Mountain Drive, the rule that the rest of Knox Mountain Park is on-leash only, the park amenities and hours, and the current notice that vehicle access to the first lookout is closed because of extreme wildfire danger.</p>",
    "Intro Paragraph": "<p>Knox Mountain Dog Park refers to the designated off-leash dog area inside Knox Mountain Park at 450 Knox Mountain Drive in Kelowna. The City of Kelowna says the rest of Knox Mountain Park is on-leash only, so this page works best as a guide to the designated off-leash zone rather than the entire mountain park.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Knox Mountain Dog Park | Kelowna, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Kelowna's designated off-leash dog area at Knox Mountain Park, covering the 450 Knox Mountain Drive park location, park-wide leash boundaries, current rules, and the August 15, 2026 lookout road closure notice.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/knox-mountain-dog-park-kelowna/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/knox-mountain-dog-park-kelowna/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Knox Mountain Dog Park and refreshed backlog files.");
