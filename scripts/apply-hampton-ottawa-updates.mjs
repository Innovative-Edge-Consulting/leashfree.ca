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
  const seoTitle = "Hampton Dog Park | Ottawa, ON | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to Hampton Dog Park in Ottawa, including the official 645 Parkview Road address, fenced off-leash designation from Ottawa's dogs-in-parks map, city park hours, and current Ottawa dog rules.";
  const intro =
    "<p>Hampton Dog Park is currently confirmed by the City of Ottawa's official dogs-in-parks map as a <strong>Fenced Off Leash Dog Area</strong> at <strong>645 Parkview Road, Ottawa</strong>.</p>";
  const body =
    "<p>The current Ottawa source set gives Hampton Dog Park a stronger factual basis than the older thin page. On the City's official interactive dogs-in-parks map, a live search for <strong>Hampton Park</strong> returns one fenced off-leash result at <strong>645 Parkview Road</strong>. The table labels the park feature as <strong>Fenced Off Leash Dog Area</strong> and describes it as <strong>dog park - fenced</strong>. That is the most important current fact because it confirms both the designation and the specific location using Ottawa's own system rather than a stale third-party map listing.</p><p>The broader Ottawa dog and park rules also belong on the page because they shape how the fenced area should be used. Ottawa's current dogs-in-parks guidance says some parks are designated so dogs may be <strong>off leash</strong>, but dogs must still remain <strong>under the control of their handler</strong>. The Animal Care and Control By-law adds that unleashed dogs are only allowed where parkland is designated for off-leash use, and owners must keep dogs <strong>in sight and under voice control at all times</strong>. Dogs are also prohibited from being within <strong>five metres of play structures, wading pools, and spray pads</strong> where those restrictions apply.</p><p>City park hours are current as well. Ottawa's parks page says parks are open daily from <strong>5 a.m. to 11 p.m.</strong> unless otherwise posted. That is the safest hours guidance to keep on the page because it comes from the city's current parks standards rather than older directory copy.</p><p>This update improves the page by replacing generic neighbourhood prose and incorrect address data with Ottawa's official fenced off-leash designation, correct Parkview Road location, and current city dog and park rules.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: Ottawa's official interactive dogs-in-parks map at https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/map-dogs-parks, verified live in browser on August 20, 2026, where a search for Hampton Park returned Hampton Park at 645 Parkview Road with the designation Fenced Off Leash Dog Area and type dog park - fenced; https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/dogs-parks for the current dogs-in-parks designation overview; https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/animal-care-and-control-law-no-2003-077 for the current off-leash, sight-control, and 5 metre restriction rules; and https://ottawa.ca/en/recreation-and-parks/facilities-and-rentals/parks-and-green-space for the current 5 a.m. to 11 p.m. park hours.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Hampton Dog Park | Ottawa";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Ottawa"],
    Province: ["Ontario"],
    Tags: ["off-leash", "fenced", "ottawa", "official-map-verified"],
  };

  Object.assign(park.raw, {
    "Park Name": "Hampton Dog Park",
    "Park Header": "Hampton Dog Park | Ottawa",
    "Description": body,
    "Street Address": "645 Parkview Road",
    latitude: "45.38815778875178",
    longitude: "-75.73637827949385",
    City: "Ottawa",
    Province: "Ontario",
    "Postal Code": "",
    Fenced: "Yes - fenced off leash dog area",
    "Separate Small Dog Area": "No separate small-dog area confirmed",
    "Surface type": "Grass",
    Size: "Neighbourhood fenced dog park",
    "Water source available": "Unknown - verify on arrival",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Some tree cover",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "5:00 a.m. to 11:00 p.m. unless otherwise posted",
    "Seasonal Restrictions": "Follow posted Ottawa park signage and dogs-in-parks rules",
    "Park Website or Source": "https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/map-dogs-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=645+Parkview+Road+Ottawa+ON",
    Tags: "off-leash,fenced,ottawa,official-map-verified",
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
  const park = parks.find((entry) => entry.slug === "hampton-dog-park");
  if (!park) throw new Error("Hampton Dog Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "hampton-dog-park");
  if (!targetRow) throw new Error("Hampton Dog Park CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/hampton-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/hampton-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Hampton Dog Park and refreshed backlog files.");
