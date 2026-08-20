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
  const seoTitle = "Cottonwood Falls Park | Nelson, BC | LeashFree.ca";
  const metaDescription =
    "Current Nelson source-backed note for Cottonwood Falls Park: it is a scenic waterfall park and market/event venue, but current City sources do not identify it as a designated off-leash dog park.";
  const intro =
    "<p>Cottonwood Falls Park is currently presented by the City of Nelson as a <strong>scenic waterfall park</strong>, not as a designated off-leash dog park. Nelson's current parks page highlights the waterfall, friendship garden, and stewarded green space, but does <strong>not</strong> identify Cottonwood Falls as an off-leash area.</p>";
  const body =
    "<p>This route needed an integrity correction rather than a routine dog-park expansion. The older page described Cottonwood Falls Park as a leash-free area, but Nelson's current parks and animal-control sources do not support that. On the City's current parks page, Cottonwood Falls Park is described as the place where <strong>Cottonwood Creek crosses under Highways 3A and 6 and tumbles down into a scenic waterfall</strong>. The page also notes the stewardship of the <strong>Nelson Izu-shi Friendship Society</strong> and the <strong>friendship garden and gate</strong>, which gives the park a clearer civic identity than the older dog stub did.</p><p>Nelson's current event and market materials reinforce that identity. In 2025 and 2026, Cottonwood Falls Park has been used as a <strong>Nelson Farmers Market location</strong>, and the city's market-relocation materials describe the site as having practical event amenities such as <strong>free parking</strong>, <strong>potable water</strong>, <strong>washrooms on site</strong>, and <strong>electrical plug-ins</strong>. Those details help explain the park's present-day community role, but they still do not make it a designated off-leash dog area.</p><p>The safest current interpretation is that visitors should not rely on this route for legal off-leash use unless Nelson posts signage onsite stating otherwise. Nelson's map resources include separate dog-use mapping such as the <strong>Downtown Dog Leash Map</strong> and <strong>Waterfront Dog Use Areas</strong>, which is another signal that dog access rules are handled specifically rather than assumed park by park.</p><p>This update improves trust more than adding unsupported amenity claims would. It replaces an inaccurate off-leash framing with Nelson's current description of Cottonwood Falls Park as a scenic urban waterfall park and community gathering space.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://nelson.ca/320/Parks for the current Cottonwood Falls Park description focused on the waterfall, friendship garden, and stewardship; https://nelson.ca/415/Maps for Nelson's current dog-walk and waterfront dog-use map resources; https://nelson.ca/CivicAlerts.aspx?AID=901&ARC=1453 and https://www.nelson.ca/3122/Market-Calendar-and-Maps for the current market/event use of Cottonwood Falls Park and the site's event-related amenities. These sources did not confirm Cottonwood Falls Park as a designated off-leash dog park.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Cottonwood Falls Park | Nelson";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Nelson"],
    Province: ["British Columbia"],
    Tags: ["integrity-correction", "waterfall-park", "nelson", "dogs-not-confirmed"],
  };

  Object.assign(park.raw, {
    "Park Name": "Cottonwood Falls Park",
    "Park Header": "Cottonwood Falls Park | Nelson",
    "Park type": "City Park",
    "Description": body,
    "Street Address": "Cottonwood Falls Park, Nelson",
    latitude: "49.4893",
    longitude: "-117.2863",
    City: "Nelson",
    Province: "British Columbia",
    "Postal Code": "",
    Fenced: "No off-leash area confirmed",
    "Separate Small Dog Area": "No",
    "Surface type": "Natural park paths and landscaped areas",
    Size: "Small scenic city park",
    "Water source available": "Yes - potable water noted in market/event context",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Yes - treed setting",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "No off-leash area confirmed",
    "Parking Available": "Yes - free parking noted in market/event context",
    "Washrooms nearby": "Yes - noted in market/event context",
    "Operating hours": "Verify posted park hours on arrival",
    "Seasonal Restrictions": "No current city source confirms off-leash designation",
    "Park Website or Source": "https://nelson.ca/320/Parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Cottonwood+Falls+Park+Nelson+BC",
    Tags: "integrity-correction,waterfall-park,nelson,dogs-not-confirmed",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    Media: "",
    "Reviewed On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  });
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "cottonwood-falls-park-nelson");
  if (!park) throw new Error("Cottonwood Falls Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "cottonwood-falls-park-nelson");
  if (!targetRow) throw new Error("Cottonwood Falls CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/cottonwood-falls-park-nelson/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/cottonwood-falls-park-nelson/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Cottonwood Falls Park and refreshed backlog files.");
