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
  const seoTitle = "Primrose Park | Ottawa, ON | LeashFree.ca";
  const metaDescription =
    "Current Ottawa source-backed note for Primrose Park: it is a real city park at 179 Primrose Avenue, but Ottawa's current dog-park sources do not confirm it as a designated off-leash dog park.";
  const intro =
    "<p>Primrose Park is a real City of Ottawa neighbourhood park at <strong>179 Primrose Avenue</strong>, but Ottawa's current dog-park sources do <strong>not</strong> confirm it as a designated off-leash dog park. Ottawa's current rules say dogs must be <strong>leashed in parks unless a park is specifically designated for off-leash use</strong>.</p>";
  const body =
    "<p>This route needed an integrity correction rather than a routine dog-park expansion. The older page described Primrose Park as a leash-free park, but Ottawa's current official dog-park map did not validate that claim when reviewed on <strong>August 20, 2026</strong>. Searching Primrose Park in the City of Ottawa's current <strong>Map - dogs in parks</strong> did not surface a designated off-leash park entry, while the same map clearly identifies confirmed dog-use designations when they exist.</p><p>Current Ottawa sources do confirm that Primrose Park is an active civic park. The City's current <strong>Alcohol in Parks</strong> materials list <strong>Primrose Park, 179 Primrose Avenue</strong> as one of the parks participating in the 2026 pilot in designated zones. Ottawa's current splash-pad listings also identify <strong>Primrose Park</strong> as a splash-pad location. Those details strengthen the page factually, but they do not make the park an off-leash destination.</p><p>Ottawa's current bylaws are also explicit. The current <strong>Parks and Facilities By-law No. 2025-251</strong> says dog owners must leash their dogs in all parks unless a park is specifically designated as an off-leash area. The current <strong>Animal Care and Control By-law No. 2003-077</strong> says unleashed dogs are only allowed on parkland designated for off-leash use, and dogs are prohibited within <strong>five metres</strong> of play structures, wading pools, and spray pads. Because Primrose Park has a splash pad and no current off-leash confirmation in the official dog-park map, the safer interpretation is on-leash use unless posted signage onsite says otherwise.</p><p>The practical takeaway is simple: treat Primrose Park as a normal Ottawa neighbourhood park for dog visits, not as a confirmed off-leash area. If you want a verified off-leash destination, rely on Ottawa's current dog-park map and designated park records instead of older generic stubs.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/map-dogs-parks, manually checked in the live Ottawa dogs-in-parks map for Primrose Park on August 20, 2026 and did not find a confirmed off-leash designation; https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/parks-and-facilities-law-no-2025-251 for current park hours, the rule that dogs must be leashed unless a park is specifically designated off-leash, and the 2026 alcohol-in-parks listing for Primrose Park at 179 Primrose Avenue; https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/animal-care-and-control-law-no-2003-077 for off-leash and five-metre play-area/splash-pad restrictions; https://ottawa.ca/en/city-hall/city-news/newsroom/citys-alcohol-parks-pilot-continues-2026 for current 2026 program details naming Primrose Park; and https://ottawa.ca/en/outdoor-swim-and-splash/splash-pads for the current splash-pad listing for Primrose Park.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Primrose Park | Ottawa";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Ottawa"],
    Province: ["Ontario"],
    Tags: ["integrity-correction", "ottawa", "dogs-on-leash", "splash-pad"],
  };

  Object.assign(park.raw, {
    "Park Name": "Primrose Park",
    "Park Header": "Primrose Park | Ottawa",
    "Park type": "City Park",
    Description: body,
    "Street Address": "179 Primrose Avenue",
    latitude: "45.4110903",
    longitude: "-75.713384",
    City: "Ottawa",
    Province: "Ontario",
    "Postal Code": "",
    Fenced: "No off-leash area confirmed",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass, paved paths, and neighbourhood park landscaping",
    Size: "Neighbourhood park",
    "Water source available": "Seasonal splash-pad water feature nearby",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Yes - tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "No off-leash area confirmed",
    "Parking Available": "Street parking nearby",
    "Washrooms nearby": "Unknown",
    "Operating hours": "5 a.m. to 11 p.m. unless otherwise posted",
    "Seasonal Restrictions": "Dogs are prohibited within 5 metres of play structures, wading pools, and spray pads",
    "Park Website or Source": "https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/map-dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=179+Primrose+Avenue+Ottawa+ON",
    Tags: "integrity-correction,ottawa,dogs-on-leash,splash-pad",
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
  const park = parks.find((entry) => entry.slug === "primrose-park");
  if (!park) throw new Error("Primrose Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "primrose-park");
  if (!targetRow) throw new Error("Primrose Park CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/primrose-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/primrose-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Primrose Park and refreshed backlog files.");
