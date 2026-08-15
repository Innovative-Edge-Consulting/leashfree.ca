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
  const line = '  "shaughnessy": "/images/dog-parks/shaughnessy-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "seton-off-leash-area": "/images/dog-parks/seton-off-leash-area-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "shaughnessy");
  if (!park) throw new Error("Shaughnessy park record not found.");

  const seoTitle = "Shaughnessy Dog Park | Port Coquitlam, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Shaughnessy Dog Park in Port Coquitlam, covering the official 3345 Shaughnessy Street location, fenced status, posted dog-park rules, and current nearby project notes.";
  const intro = "<p>Shaughnessy Dog Park is one of the City of Port Coquitlam's officially listed fenced dog parks. The City currently lists it at 3345 Shaughnessy Street and the park directory confirms on-site dog waste bag and waste removal stations.</p>";
  const body = "<p>The strongest improvement on this page is correcting the jurisdiction and using Port Coquitlam's current official sources. Shaughnessy is not a Coquitlam dog park in the reviewed municipal material. Port Coquitlam's current off-leash page lists Shaughnessy Dog Park among the City's fenced dog parks and gives the official address as 3345 Shaughnessy Street. The current parks directory for the site adds two concrete amenities the City explicitly publishes: a dog waste bag station and a dog waste removal bin. That gives this page useful factual value without repeating unsupported claims about gravel, fixed hours, water service, or other features the City does not currently list on the reviewed pages.</p><p>Port Coquitlam also publishes clear dog-park rules that apply here. Owners must stay in the area, keep a leash on hand, maintain firm voice and visual control, and are limited to a maximum of three dogs per owner. Dogs using the area must be at least four months old, licensed, and up to date on vaccinations, and aggressive dogs are not permitted in the off-leash area. A current Port Coquitlam project page adds another practical note: the nearby multi-use sports facility project says there will be no impact to Shaughnessy Dog Park itself, though the Shaughnessy Street multi-use path may face periodic short-term closures during specific construction activities, with detours and signage provided when needed.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.portcoquitlam.ca/services/pets-wildlife/dogs/leash-dog-areas, https://www.portcoquitlam.ca/recreation-parks/parks-trails/parks-directory/shaughnessy-offleash-dog-park, and https://www.portcoquitlam.ca/our-government/capital-projects/multi-use-sports-facility. These sources support the Port Coquitlam location, fenced-dog-park classification, waste bag and waste bin amenities, posted dog-park rules, and the current note that the nearby sports-facility project will not impact the dog park itself.</p>";

  park.name = "Shaughnessy Dog Park";
  park.title = "Shaughnessy Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Port Coquitlam"],
    Province: ["British Columbia"],
    Tags: ["leash-free", "fenced", "port-coquitlam"]
  };

  Object.assign(park.raw, {
    "Park Name": "Shaughnessy Dog Park",
    "Park Header": "Shaughnessy Dog Park",
    "Description": body,
    "Street Address": "3345 Shaughnessy Street",
    "latitude": "",
    "longitude": "",
    "City": "Port Coquitlam",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "No park-specific seasonal restrictions published in reviewed sources; temporary path detours may occur nearby during sports-facility construction",
    "Park Website or Source": "https://www.portcoquitlam.ca/services/pets-wildlife/dogs/leash-dog-areas",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=3345+Shaughnessy+Street+Port+Coquitlam+BC",
    "Tags": "leash-free,fenced,port-coquitlam",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "shaughnessy");
  if (!targetRow) throw new Error("Shaughnessy park CSV row not found.");

  const updates = {
    "Park Name": "Shaughnessy Dog Park",
    "Park Header": "Shaughnessy Dog Park",
    "Description": "<p>The strongest improvement on this page is correcting the jurisdiction and using Port Coquitlam's current official sources. Shaughnessy is not a Coquitlam dog park in the reviewed municipal material. Port Coquitlam's current off-leash page lists Shaughnessy Dog Park among the City's fenced dog parks and gives the official address as 3345 Shaughnessy Street. The current parks directory for the site adds two concrete amenities the City explicitly publishes: a dog waste bag station and a dog waste removal bin. That gives this page useful factual value without repeating unsupported claims about gravel, fixed hours, water service, or other features the City does not currently list on the reviewed pages.</p><p>Port Coquitlam also publishes clear dog-park rules that apply here. Owners must stay in the area, keep a leash on hand, maintain firm voice and visual control, and are limited to a maximum of three dogs per owner. Dogs using the area must be at least four months old, licensed, and up to date on vaccinations, and aggressive dogs are not permitted in the off-leash area. A current Port Coquitlam project page adds another practical note: the nearby multi-use sports facility project says there will be no impact to Shaughnessy Dog Park itself, though the Shaughnessy Street multi-use path may face periodic short-term closures during specific construction activities, with detours and signage provided when needed.</p>",
    "Street Address": "3345 Shaughnessy Street",
    "latitude": "",
    "longitude": "",
    "City": "Port Coquitlam",
    "Province": "British Columbia",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "No park-specific seasonal restrictions published in reviewed sources; temporary path detours may occur nearby during sports-facility construction",
    "Park Website or Source": "https://www.portcoquitlam.ca/services/pets-wildlife/dogs/leash-dog-areas",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=3345+Shaughnessy+Street+Port+Coquitlam+BC",
    "Tags": "leash-free,fenced,port-coquitlam",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.portcoquitlam.ca/services/pets-wildlife/dogs/leash-dog-areas, https://www.portcoquitlam.ca/recreation-parks/parks-trails/parks-directory/shaughnessy-offleash-dog-park, and https://www.portcoquitlam.ca/our-government/capital-projects/multi-use-sports-facility. These sources support the Port Coquitlam location, fenced-dog-park classification, waste bag and waste bin amenities, posted dog-park rules, and the current note that the nearby sports-facility project will not impact the dog park itself.</p>",
    "Intro Paragraph": "<p>Shaughnessy Dog Park is one of the City of Port Coquitlam's officially listed fenced dog parks. The City currently lists it at 3345 Shaughnessy Street and the park directory confirms on-site dog waste bag and waste removal stations.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Shaughnessy Dog Park | Port Coquitlam, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Shaughnessy Dog Park in Port Coquitlam, covering the official 3345 Shaughnessy Street location, fenced status, posted dog-park rules, and current nearby project notes.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/shaughnessy/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/shaughnessy/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Shaughnessy Dog Park and refreshed backlog files.");
