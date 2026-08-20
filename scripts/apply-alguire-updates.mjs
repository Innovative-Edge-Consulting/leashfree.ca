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
  const seoTitle = "Alguire Park | Cornwall, ON | LeashFree.ca";
  const metaDescription =
    "Current Cornwall source-backed note for Alguire Park: it is listed as a neighbourhood park, but Cornwall's current animal rules do not list it among the city parks where dogs are permitted.";
  const intro =
    "<p>Alguire Park is currently listed by the City of Cornwall as a <strong>neighbourhood park at Dundee and Dewhurst Avenue</strong>. However, Cornwall's current animal rules say <strong>dogs are not allowed in City parks except for a limited list of named exceptions</strong>, and <strong>Alguire Park is not one of those exceptions</strong>.</p>";
  const body =
    "<p>This route needed an integrity correction rather than a normal content expansion. The older page treated Alguire Park as a dog-friendly stop, but Cornwall's current source set does not support that. On the City's neighbourhood parks page, Alguire appears as a standard local park. On the current animals and wildlife page, Cornwall says dogs are not allowed in City parks except for four specific exceptions: <strong>Guindon Park roadways and the Trillium Picnic area</strong>, <strong>Boals Drain Linear Park from Emma Avenue to Meadowvale Crescent</strong>, the <strong>Cedar Rapids corridor from Optimist Park to Brookdale Avenue and from Power Dam Drive east to Vincent Massey Drive</strong>, and <strong>Lamoureux Park</strong>. Alguire Park is not included in that list.</p><p>That means this page should not continue presenting Alguire as a dog park or even as a routine dog-walking destination unless Cornwall changes its rules. The safer interpretation from the current municipal sources is that visitors should treat Alguire as a neighbourhood park where the general city park dog restriction applies. If you are looking for a Cornwall location where the City's current rules explicitly allow dogs, the municipal source points instead to places such as <strong>Lamoureux Park</strong> or the named corridor exceptions.</p><p>The City also provides a useful location reference for Alguire itself. The neighbourhood parks page places it at <strong>Dundee and Dewhurst Avenue</strong>, and the summer playground program shows that Alguire continues to function as an active local family park rather than a specialized dog facility.</p><p>This update improves the page by correcting the dog-access status and replacing unsupported claims with Cornwall's current park listing and current animal-control rules.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/neighbourhood-parks/ for the current listing of Alguire Park at Dundee and Dewhurst Avenue; https://www.cornwall.ca/en/property-environment/animals-and-wildlife/ for Cornwall's current dog rules stating dogs are not allowed in City parks except for a short named list that does not include Alguire Park; and https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/summer-playground-program/ confirming Alguire's current use as a neighbourhood program park.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Alguire Park | Cornwall";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Cornwall"],
    Province: ["Ontario"],
    Tags: ["integrity-correction", "neighbourhood-park", "dogs-not-permitted", "cornwall"],
  };

  Object.assign(park.raw, {
    "Park Name": "Alguire Park",
    "Park Header": "Alguire Park | Cornwall",
    "Park type": "Neighbourhood Park",
    "Description": body,
    "Street Address": "Dundee & Dewhurst Ave",
    latitude: "45.0343801",
    longitude: "-74.7641621",
    City: "Cornwall",
    Province: "Ontario",
    "Postal Code": "",
    Fenced: "No dog area confirmed",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass and trees",
    Size: "Neighbourhood park",
    "Water source available": "Unknown - verify on arrival",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Yes - tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "No dog area confirmed",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Verify posted park hours on arrival",
    "Seasonal Restrictions": "Cornwall's current animal rules do not list Alguire Park among parks where dogs are permitted",
    "Park Website or Source": "https://www.cornwall.ca/en/recreation-community-supports/parks-and-trails/neighbourhood-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Alguire+Park+Cornwall+ON",
    Tags: "integrity-correction,neighbourhood-park,dogs-not-permitted,cornwall",
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
  const park = parks.find((entry) => entry.slug === "alguire-park-cornwall");
  if (!park) throw new Error("Alguire Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "alguire-park-cornwall");
  if (!targetRow) throw new Error("Alguire Park CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/alguire-park-cornwall/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/alguire-park-cornwall/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Alguire Park and refreshed backlog files.");
