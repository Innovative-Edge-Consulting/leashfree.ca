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
  const seoTitle = "King's Mill Park | Etobicoke, ON | LeashFree.ca";
  const metaDescription =
    "Current Toronto source-backed note for King's Mill Park: it is a real Humber valley park in Etobicoke, but current City sources reviewed on August 21, 2026 do not confirm it as a designated off-leash area.";
  const intro =
    "<p>King's Mill Park is a real Humber valley park in Etobicoke, but current City of Toronto sources reviewed on <strong>Friday, August 21, 2026</strong> do <strong>not</strong> confirm it as a designated dogs off-leash area. Toronto's current rules require dogs to be <strong>on leash in parks unless they are inside a designated off-leash area</strong>.</p>";
  const body =
    "<p>This route needed a factual correction rather than a generic leash-free expansion. The older page described King's Mill Park as an off-leash destination, but the current City sources reviewed on August 21, 2026 did not verify that status. Toronto's current <strong>Dogs Off-Leash</strong> enforcement page says dogs must be on leash in parks and may only be off leash inside <strong>designated dogs off-leash areas</strong>. Toronto's current <strong>Responsible Dog Ownership</strong> page repeats the same rule. During this review, no current City source examined named King's Mill Park as one of those designated off-leash areas.</p><p>The park itself is still legitimate and worth documenting accurately. Toronto's current real-estate <strong>Leases and Licences</strong> page includes a listing for <strong>King's Mill Park watercraft rental, 5 Old Mill Road</strong>, which confirms the park as an active civic recreation site tied to the Humber River corridor. That fits the page's wooded-valley identity better than the older unsupported dog-park claims.</p><p>Toronto's broader park rules also matter here. The City's current <strong>Park &amp; Trail Rules &amp; Etiquette</strong> guidance says Toronto parks are closed between <strong>midnight and 5:30 a.m.</strong>. Combined with the off-leash rules above, the safer reading is straightforward: King's Mill Park is suitable for <strong>on-leash walks</strong> through the Humber valley landscape unless posted signage onsite specifically identifies a designated off-leash area.</p><p>The practical takeaway is simple. Treat King's Mill Park as a scenic Toronto park for on-leash walks, not as a confirmed off-leash dog park. This update improves trust by replacing unsupported leash-free wording with current Toronto rules and a current City reference confirming the park itself.</p>";
  const notes =
    "<p>Primary sources reviewed on Friday, August 21, 2026: https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/ for Toronto's current rule that dogs must be on leash in parks unless in a designated dogs off-leash area; https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dogs-in-the-city/responsible-dog-ownership/ for the current public rule that dogs must be leashed in public unless in a designated dogs off-leash area; https://www.toronto.ca/business-economy/doing-business-with-the-city/real-estate-services-delegated-approval-forms/leases-and-licences/ for the current City listing referencing King's Mill Park watercraft rental at 5 Old Mill Road; and https://www.toronto.ca/explore-enjoy/parks-recreation/how-to-use-our-services/love-parks/ for the current rule that Toronto parks are closed between midnight and 5:30 a.m. These current sources did not confirm King's Mill Park as a designated off-leash area.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "King's Mill Park | Etobicoke";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Toronto"],
    Province: ["Ontario"],
    Tags: ["integrity-correction", "toronto", "etobicoke", "humber-river", "dogs-on-leash"],
  };

  Object.assign(park.raw, {
    "Park Name": "King's Mill Park",
    "Park Header": "King's Mill Park | Etobicoke",
    "Park type": "City Park",
    Description: body,
    "Street Address": "5 Old Mill Road area",
    latitude: "43.647283072885905",
    longitude: "-79.49734035002312",
    City: "Etobicoke",
    Province: "Ontario",
    "Postal Code": "",
    Fenced: "No off-leash area confirmed",
    "Separate Small Dog Area": "No",
    "Surface type": "Wooded trails, paved paths, and valley green space",
    Size: "Large river valley park",
    "Water source available": "River corridor nearby",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Yes - mature tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "No off-leash area confirmed",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "5:30 a.m. to midnight",
    "Seasonal Restrictions": "Dogs must remain on leash unless inside a designated dogs off-leash area",
    "Park Website or Source": "https://www.toronto.ca/business-economy/doing-business-with-the-city/real-estate-services-delegated-approval-forms/leases-and-licences/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Kings+Mill+Park+Etobicoke+ON",
    Tags: "integrity-correction,toronto,etobicoke,humber-river,dogs-on-leash",
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
  const park = parks.find((entry) => entry.slug === "kings-mill-park-etobicoke");
  if (!park) throw new Error("King's Mill Park Etobicoke record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "kings-mill-park-etobicoke");
  if (!targetRow) throw new Error("King's Mill Park Etobicoke CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/kings-mill-park-etobicoke/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/kings-mill-park-etobicoke/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated King's Mill Park Etobicoke and refreshed backlog files.");
