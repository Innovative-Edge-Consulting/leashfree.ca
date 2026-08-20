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
  const seoTitle = "Dr. R. J. Allan Hogg Rotary Park | White Rock, BC | LeashFree.ca";
  const metaDescription =
    "Current White Rock source-backed note for Dr. R. J. Allan Hogg Rotary Park: it is a city park with scenic views, but White Rock's current dog guidance identifies Ruth Johnson Park as the city's off-leash dog park.";
  const intro =
    "<p>Dr. R. J. Allan Hogg Rotary Park is a legitimate City of White Rock park, but the current White Rock dog guidance does <strong>not</strong> identify it as an off-leash dog park. White Rock's current dogs pages say the city's off-leash dog park is at <strong>Ruth Johnson Park, 14600 North Bluff Road</strong>.</p>";
  const body =
    "<p>This route needed an integrity correction instead of a generic dog-park expansion. The older page described Allan Hogg as an off-leash area, but White Rock's current public dog guidance points somewhere else. The City's current <strong>Off-Leash Dog Park</strong> page says the off-leash dog park is the <strong>large, treed and fenced area at Ruth Johnson Park</strong>. The broader <strong>Dogs in White Rock</strong> page says dogs in the city must be <strong>leashed and licenced</strong>, that dogs are generally <strong>allowed on-leash in most parks year-round</strong>, and that dogs can go <strong>off-leash in the off-leash dog park located in Ruth Johnson Park</strong>. Allan Hogg is not named as that off-leash site.</p><p>The park itself is still real and worth identifying accurately. White Rock's facility listing includes <strong>Dr. R. J. Allan Hogg Rotary Park</strong> as a city facility, and council materials from <strong>April 27, 2026</strong> refer to a proposed community garden at <strong>Hogg Park</strong>, which helps confirm it as an active civic park space rather than an off-leash designation. Based on the current public sources, the safer interpretation is that Allan Hogg should be treated like a normal White Rock park unless posted signage says otherwise.</p><p>For dog owners, the practical takeaway is simple. If you are visiting Allan Hogg, plan for <strong>on-leash use</strong> unless you see city signage stating a different rule onsite. If you want the official off-leash destination that White Rock currently promotes, go instead to the <strong>fenced off-leash dog park in Ruth Johnson Park</strong>.</p><p>This update improves trust more than adding unsupported amenities would. It removes an inaccurate off-leash claim and replaces it with White Rock's current dog guidance and a clearer explanation of where the city's official off-leash park actually is.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://www.whiterockcity.ca/1106/Off-Leash-Dog-Park for White Rock's current statement that the off-leash dog park is at Ruth Johnson Park, 14600 North Bluff Road; https://www.whiterockcity.ca/799/Dogs-in-White-Rock for the current city guidance that dogs are leashed and licenced in White Rock and may go off-leash in the off-leash dog park located in Ruth Johnson Park; https://www.whiterockcity.ca/facilities/facility/details/Centennial-and-Ruth-Johnson-Park-24 confirming the fenced off-leash dog park at Ruth Johnson Park; and https://www.whiterockcity.ca/953/Regular-and-Special-Meeting-Reports for the April 27, 2026 council materials referencing Hogg Park in a separate civic context.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Dr. R. J. Allan Hogg Rotary Park | White Rock";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["White Rock"],
    Province: ["British Columbia"],
    Tags: ["integrity-correction", "white-rock", "dogs-on-leash", "scenic-park"],
  };

  Object.assign(park.raw, {
    "Park Name": "Dr. R. J. Allan Hogg Rotary Park",
    "Park Header": "Dr. R. J. Allan Hogg Rotary Park | White Rock",
    "Park type": "City Park",
    "Description": body,
    "Street Address": "15497 Buena Vista Ave",
    latitude: "49.0241223",
    longitude: "-122.7933695",
    City: "White Rock",
    Province: "British Columbia",
    "Postal Code": "",
    Fenced: "No off-leash area confirmed",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass and landscaped park areas",
    Size: "Small city park",
    "Water source available": "Unknown - verify on arrival",
    Benches: "Yes",
    "Shaded area": "Some tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "No off-leash area confirmed",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Verify posted park hours on arrival",
    "Seasonal Restrictions": "White Rock's current dog guidance points off-leash use to Ruth Johnson Park, not Allan Hogg",
    "Park Website or Source": "https://www.whiterockcity.ca/799/Dogs-in-White-Rock",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=15497+Buena+Vista+Ave+White+Rock+BC",
    Tags: "integrity-correction,white-rock,dogs-on-leash,scenic-park",
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
  const park = parks.find((entry) => entry.slug === "allan-hogg-rotary-park");
  if (!park) throw new Error("Allan Hogg record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "allan-hogg-rotary-park");
  if (!targetRow) throw new Error("Allan Hogg CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/allan-hogg-rotary-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/allan-hogg-rotary-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Allan Hogg Rotary Park and refreshed backlog files.");
