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
  const seoTitle = "Duggan Park Off-Leash Area | Brampton, ON | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to Duggan Park in Brampton, including the official 73 Vodden Street East location, leash-free area status, baseball and sports-field context, washrooms, and current Brampton off-leash rules.";
  const intro =
    "<p>Duggan Park is one of Brampton's current official off-leash sites. The City's park directory lists <strong>Duggan Park at 73 Vodden Street East</strong> and specifically includes a <strong>leash free area</strong> among the park's amenities.</p>";
  const body =
    "<p>The current Brampton source set gives Duggan Park a more useful factual profile than the old thin copy. On the City's Find a Park directory, Duggan is listed at <strong>73 Vodden St E</strong> with amenity codes for a <strong>dog park</strong>, <strong>play area</strong>, and multiple <strong>sports fields and baseball diamonds</strong>. That matters because it frames Duggan as a multi-use community park with a designated off-leash component, not as a stand-alone dog-only facility.</p><p>Brampton's broader sports and venue information adds practical detail that helps visitors set expectations. The City lists Duggan Park as a feature venue with <strong>3 diamonds with lights</strong> and <strong>washrooms</strong>. That means dog owners should expect a busier shared park environment during organized sports use, especially when baseball activity is underway.</p><p>The off-leash rules are also current and worth keeping directly on the page. Brampton says dogs using leash-free parks must be <strong>vaccinated, licensed, and neutered or spayed</strong>. The City does not allow <strong>aggressive dogs</strong> or dogs with a history of biting in leash-free parks, and <strong>children younger than 10</strong> are not permitted in leash-free parks. The same city guidance says dogs must otherwise remain leashed outside designated off-leash areas, and owners who allow dogs off leash in undesignated areas can be fined up to <strong>$5,000</strong>.</p><p>The practical takeaway is that Duggan is a legitimate Brampton off-leash option, but it sits inside a broader active sports park. That combination is the important visitor expectation: a designated leash-free area at an official city park that also serves baseball, play, and washroom needs.</p><p>This update improves the page by replacing generic filler with Brampton's current official address, leash-free designation, and multi-use park context.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://www.brampton.ca/EN/residents/parks/Pages/Find-a-Park.aspx for the current Duggan Park listing at 73 Vodden St E and the official leash free area / sports amenity listing; https://www.brampton.ca/en/residents/Animal-Services/Pages/Off-Leash-Parks.aspx for Brampton's current leash-free dog area rules including vaccination, licensing, neuter/spay, aggressive-dog restrictions, and the under-10 rule; https://www.brampton.ca/en/city-hall/bylaws/pages/animal-by-laws.aspx for the current by-law summary on designated leash-free areas and fines for off-leash use in undesignated areas; and https://www.brampton.ca/EN/Arts-Culture-Tourism/Experience-Brampton/Sports/Pages/Diverse-Venues.aspx for Duggan's current 3 lit diamonds and washrooms context.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Duggan Park Off-Leash Area | Brampton";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Brampton"],
    Province: ["Ontario"],
    Tags: ["off-leash", "multi-use-park", "baseball", "washrooms", "brampton"],
  };

  Object.assign(park.raw, {
    "Park Name": "Duggan Park",
    "Park Header": "Duggan Park Off-Leash Area | Brampton",
    "Description": body,
    "Street Address": "73 Vodden St E",
    latitude: "43.6947683",
    longitude: "-79.7634546",
    City: "Brampton",
    Province: "Ontario",
    "Postal Code": "L6V 4B9",
    Fenced: "Unknown - verify on arrival",
    "Separate Small Dog Area": "No separate small-dog area confirmed on current city pages",
    "Surface type": "Grass",
    Size: "Part of a multi-use community park",
    "Water source available": "Unknown - verify on arrival",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Some tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Yes - city venue page lists washrooms",
    "Operating hours": "Verify posted park hours on arrival",
    "Seasonal Restrictions": "Sports-field activity may affect traffic and shared use at peak times",
    "Park Website or Source": "https://www.brampton.ca/EN/residents/parks/Pages/Find-a-Park.aspx",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=73+Vodden+St+E+Brampton+ON",
    Tags: "off-leash,multi-use-park,baseball,washrooms,brampton",
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
  const park = parks.find((entry) => entry.slug === "duggan-park");
  if (!park) throw new Error("Duggan Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "duggan-park");
  if (!targetRow) throw new Error("Duggan Park CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/duggan-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/duggan-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Duggan Park and refreshed backlog files.");
