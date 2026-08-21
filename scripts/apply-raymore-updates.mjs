import fs from "node:fs";

const parksJsonPath = "src/data/generated/parks.json";
const parkCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
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
  return `${rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    )
    .join("\n")}\n`;
}

function getContent() {
  const seoTitle = "Raymore Park | Toronto, ON | LeashFree.ca";
  const metaDescription =
    "Current Toronto source-backed note for Raymore Park: it is a real city park at 95 Raymore Drive, but current City of Toronto dog pages reviewed on August 21, 2026 do not confirm it as a designated off-leash area.";
  const intro =
    "<p>Raymore Park is a real City of Toronto neighbourhood park at <strong>95 Raymore Drive</strong>, but current City of Toronto dog pages reviewed on <strong>August 21, 2026</strong> do <strong>not</strong> confirm it as a designated dogs off-leash area. Toronto's current rules require dogs to be <strong>on leash in parks unless they are inside a designated off-leash area</strong>.</p>";
  const body =
    "<p>This route needed an integrity correction instead of a generic dog-park expansion. The older page described Raymore Park as a leash-free destination, but current City of Toronto sources reviewed on August 21, 2026 did not confirm that designation. Toronto's current <strong>Dogs Off-Leash</strong> enforcement page and <strong>Responsible Dog Ownership</strong> page both state that dogs must be leashed in parks and may only be off leash in <strong>designated dogs off-leash areas</strong>. Toronto's current <strong>Dogs Off-Leash Areas</strong> page was publicly available during review, but its map was marked <strong>down for maintenance</strong>, and no other current City page reviewed on August 21, 2026 named Raymore Park as a designated off-leash site.</p><p>Current City sources do clearly confirm the park itself. Toronto's current <strong>Playground Listings</strong> page includes <strong>Raymore Park, 95 Raymore Dr</strong>, and the current <strong>Baseball &amp; Softball Diamond Listings</strong> page also includes <strong>Raymore Park, 95 Raymore Dr</strong>. That gives the page a solid civic-park foundation, but it does not support calling the park an off-leash run.</p><p>Toronto's broader park rules reinforce the safer interpretation. The City's current <strong>Park &amp; Trail Rules &amp; Etiquette</strong> guidance says Toronto parks are closed between <strong>midnight and 5:30 a.m.</strong>, and the current parks enforcement page notes that dogs may be off leash only in designated areas. Without a current City source specifically naming Raymore Park as one of those designated areas, the prudent reading is that visitors should plan for <strong>on-leash use unless posted signage onsite says otherwise</strong>.</p><p>The practical takeaway is simple: Raymore Park is a legitimate Toronto neighbourhood park with standard park amenities, but it should not be represented as a confirmed off-leash destination until a current City source or posted park signage verifies that status. This update improves trust by replacing unsupported leash-free claims with current Toronto rules and facility listings.</p>";
  const notes =
    "<p>Primary sources reviewed on Friday, August 21, 2026: https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dog-off-leash-areas/ for Toronto's current dogs off-leash page, which stated the map was down for maintenance during review; https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/ for the current rule that dogs must be on leash in parks unless inside a designated dogs off-leash area; https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dogs-in-the-city/responsible-dog-ownership/ for the current public rule that dogs must be leashed in public unless in a designated dogs off-leash area; https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/parks-and-recreation-facilities/playground-listings/ confirming Raymore Park at 95 Raymore Dr; https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/parks-and-recreation-facilities/baseball-and-softball-diamond-listings/ confirming Raymore Park at 95 Raymore Dr; and https://www.toronto.ca/explore-enjoy/parks-recreation/how-to-use-our-services/love-parks/ for the current rule that Toronto parks are closed between midnight and 5:30 a.m. These current sources did not confirm Raymore Park as a designated off-leash area.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Raymore Park | Toronto";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Toronto"],
    Province: ["Ontario"],
    Tags: ["integrity-correction", "toronto", "dogs-on-leash", "etobicoke"],
  };

  Object.assign(park.raw, {
    "Park Name": "Raymore Park",
    "Park Header": "Raymore Park | Toronto",
    "Park type": "City Park",
    Description: body,
    "Street Address": "95 Raymore Dr",
    latitude: "43.69682546630906",
    longitude: "-79.51274692698681",
    City: "Toronto",
    Province: "Ontario",
    "Postal Code": "",
    Fenced: "No off-leash area confirmed",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass, paved paths, and neighbourhood park sports space",
    Size: "Neighbourhood park",
    "Water source available": "Unknown - verify on arrival",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Some tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "No off-leash area confirmed",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "5:30 a.m. to midnight",
    "Seasonal Restrictions": "Dogs must remain on leash unless inside a designated dogs off-leash area",
    "Park Website or Source": "https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=95+Raymore+Dr+Toronto+ON",
    Tags: "integrity-correction,toronto,dogs-on-leash,etobicoke",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    Media: "",
    "Reviewed On": "Fri Aug 21 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Fri Aug 21 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  });
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "raymore-park");
  if (!park) throw new Error("Raymore Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "raymore-park");
  if (!targetRow) throw new Error("Raymore Park CSV row not found.");
  const park = { raw: {} };
  applyParkFields(park);
  for (const [field, value] of Object.entries(park.raw)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }
  fs.writeFileSync(parkCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/raymore-park/")];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));

  const bodyRows = filtered
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));

  const countBy = (field) =>
    [...bodyRows.reduce((map, row) => {
      const key = row[field] || "";
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map()).entries()].sort((a, b) => b[1] - a[1]);

  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = bodyRows
    .slice(0, 50)
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`,
    )
    .join("\n");

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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/raymore-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Raymore Park and refreshed backlog files.");
