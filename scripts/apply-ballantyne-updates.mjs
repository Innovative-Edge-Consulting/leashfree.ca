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
  const seoTitle = "Ballantyne Park | Ottawa, ON | LeashFree.ca";
  const metaDescription =
    "Current Ottawa source-backed note for Ballantyne Park: it is a real city park in Old Ottawa East, but Ottawa's current dog-park sources do not confirm it as a designated off-leash dog park.";
  const intro =
    "<p>Ballantyne Park is a real City of Ottawa park space in Old Ottawa East, but Ottawa's current dog-park sources do <strong>not</strong> confirm it as a designated off-leash dog park. Ottawa's current rules say dogs must be <strong>leashed in parks unless a park is specifically designated for off-leash use</strong>.</p>";
  const body =
    "<p>This route needed an integrity correction rather than a generic leash-free expansion. The older page described Ballantyne Park as a neighborhood off-leash dog park, but Ottawa's current official dog-park map did not validate that claim when reviewed on <strong>August 20, 2026</strong>. On the City of Ottawa's current <strong>Map - dogs in parks</strong> page, searching Ballantyne Park did not return a designated off-leash park record comparable to Ottawa's confirmed dog-park entries. By contrast, the same official map clearly identifies designated locations such as fenced off-leash areas when they exist.</p><p>Ottawa's current bylaws also make the standard clear. The current <strong>Parks and Facilities By-law No. 2025-251</strong> says dog owners must leash their dogs in all parks unless the park is specifically designated as an off-leash area. The current <strong>Animal Care and Control By-law No. 2003-077</strong> says an unleashed dog is only allowed on parkland that is designated for off-leash use, and the person in control must keep the dog in sight and under voice control at all times. Without a confirmed designation, Ballantyne should not be represented as a legal off-leash destination.</p><p>The park itself is still a legitimate civic park. Current Ottawa construction materials for the <strong>Greenfield Avenue, Main Street, Hawthorne Avenue et al. reconstruction project</strong> refer to utility work taking place <strong>in Ballantyne Park</strong> along Hawthorne Avenue, which helps confirm the park as an active public-space reference point in the neighbourhood. That gives the page a stronger factual basis than the older unsupported dog-park claims.</p><p>The practical takeaway is simple: if you visit Ballantyne Park, plan for <strong>on-leash use unless posted signage onsite says otherwise</strong>. If you want a confirmed Ottawa off-leash destination, rely on the City's current dog-park map and designated off-leash listings instead of older third-party descriptions.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/map-dogs-parks, manually checked in the live Ottawa dogs-in-parks map for Ballantyne Park on August 20, 2026 and did not find a confirmed off-leash designation; https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/parks-and-facilities-law-no-2025-251 for current Ottawa park hours and the rule that dogs must be leashed unless a park is specifically designated off-leash; https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/animal-care-and-control-law-no-2003-077 for the rule that unleashed dogs are only permitted on parkland designated for off-leash use; and https://ottawa.ca/en/city-hall/public-engagement/public-engagement-project-search/greenfield-avenue-main-street-hawthorne-avenue-et-al-reconstruction-project for current city references to work in Ballantyne Park along Hawthorne Avenue.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Ballantyne Park | Ottawa";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Ottawa"],
    Province: ["Ontario"],
    Tags: ["integrity-correction", "ottawa", "dogs-on-leash", "old-ottawa-east"],
  };

  Object.assign(park.raw, {
    "Park Name": "Ballantyne Park",
    "Park Header": "Ballantyne Park | Ottawa",
    "Park type": "City Park",
    Description: body,
    "Street Address": "Hawthorne Avenue, Ottawa",
    latitude: "45.41262005083209",
    longitude: "-75.68146753791395",
    City: "Ottawa",
    Province: "Ontario",
    "Postal Code": "",
    Fenced: "No off-leash area confirmed",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass, shade trees, and paved paths",
    Size: "Small neighbourhood park",
    "Water source available": "Unknown - verify on arrival",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Yes - mature tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "No off-leash area confirmed",
    "Parking Available": "Street parking nearby",
    "Washrooms nearby": "Unknown",
    "Operating hours": "5 a.m. to 11 p.m. unless otherwise posted",
    "Seasonal Restrictions": "No current Ottawa source confirms off-leash designation for this park",
    "Park Website or Source": "https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/map-dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Ballantyne+Park+Ottawa+ON",
    Tags: "integrity-correction,ottawa,dogs-on-leash,old-ottawa-east",
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
  const park = parks.find((entry) => entry.slug === "ballantyne-park");
  if (!park) throw new Error("Ballantyne Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "ballantyne-park");
  if (!targetRow) throw new Error("Ballantyne Park CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/ballantyne-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/ballantyne-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Ballantyne Park and refreshed backlog files.");
