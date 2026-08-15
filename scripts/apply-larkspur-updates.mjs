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
  const line = '  "larkspur-off-leash-dog-park": "/images/dog-parks/larkspur-off-leash-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "klarvatten-off-leash-area": "/images/dog-parks/klarvatten-off-leash-area-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "larkspur-off-leash-dog-park");
  if (!park) throw new Error("Larkspur park record not found.");

  const seoTitle = "Larkspur Off-Leash Dog Park | Edmonton, AB | LeashFree.ca";
  const metaDescription = "Source-backed guide to Larkspur Off-Leash Dog Park in Edmonton, covering the Larkspur Park location, Edmonton's current off-leash rules, and what to verify on arrival because the City does not publish a detailed amenities sheet for this site.";
  const intro = "<p>Larkspur Off-Leash Dog Park is tied to Larkspur Park in southeast Edmonton. The City of Edmonton's current neighbourhood parks listing places Larkspur Park at 2928 41 Avenue NW, and Edmonton's official off-leash guidance says owners should verify posted boundaries and keep dogs leashed while entering and leaving designated off-leash areas.</p>";
  const body = "<p>The current Edmonton source set supports this page best as a conservative location-and-rules guide rather than a feature-heavy park review. Edmonton's neighbourhood parks listing identifies Larkspur Park at 2928 41 Avenue NW, while the City's current off-leash page explains the citywide operating rules that apply across Edmonton's designated off-leash network. Those rules include licensing your dog, keeping vaccinations and deworming up to date, knowing the posted site boundaries, and using a leash while entering and leaving the off-leash area. Owners are also responsible for keeping their dog under control and in sight, cleaning up after them, and preventing wildlife chasing in shared-use spaces.</p><p>What Edmonton does not currently publish in the reviewed official pages is a detailed amenities sheet for this specific Larkspur entry. That means this page should not overstate features such as fencing, water, benches, bag dispensers, or exact operating hours unless those details are verified on site or by a newer primary source. For now, the practical value is the confirmed Larkspur Park location plus Edmonton's current off-leash rules and bylaw context, including that dogs must otherwise be leashed on public property and are not allowed on playgrounds, sports fields, or golf courses.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites, https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/owning-a-pet-in-edmonton, and https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/neighbourhood-parks-alphabetical-listing. The reviewed official pages support the Larkspur Park location and Edmonton's current citywide off-leash rules, but they do not publish a rich standalone amenities sheet for this specific site.</p>";

  park.title = "Larkspur Off-Leash Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Edmonton"],
    Province: ["Alberta"],
    Tags: ["leash-free", "edmonton", "neighbourhood-park"]
  };

  Object.assign(park.raw, {
    "Park Name": "Larkspur Off-Leash Dog Park",
    "Park Header": "Larkspur Off-Leash Dog Park",
    "Description": body,
    "Street Address": "2928 41 Avenue NW",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "None published for this specific site in reviewed official sources",
    "Park Website or Source": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=2928+41+Avenue+NW+Edmonton+AB",
    "Tags": "leash-free,edmonton,neighbourhood-park",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "larkspur-off-leash-dog-park");
  if (!targetRow) throw new Error("Larkspur park CSV row not found.");

  const updates = {
    "Park Name": "Larkspur Off-Leash Dog Park",
    "Park Header": "Larkspur Off-Leash Dog Park",
    "Description": "<p>The current Edmonton source set supports this page best as a conservative location-and-rules guide rather than a feature-heavy park review. Edmonton's neighbourhood parks listing identifies Larkspur Park at 2928 41 Avenue NW, while the City's current off-leash page explains the citywide operating rules that apply across Edmonton's designated off-leash network. Those rules include licensing your dog, keeping vaccinations and deworming up to date, knowing the posted site boundaries, and using a leash while entering and leaving the off-leash area. Owners are also responsible for keeping their dog under control and in sight, cleaning up after them, and preventing wildlife chasing in shared-use spaces.</p><p>What Edmonton does not currently publish in the reviewed official pages is a detailed amenities sheet for this specific Larkspur entry. That means this page should not overstate features such as fencing, water, benches, bag dispensers, or exact operating hours unless those details are verified on site or by a newer primary source. For now, the practical value is the confirmed Larkspur Park location plus Edmonton's current off-leash rules and bylaw context, including that dogs must otherwise be leashed on public property and are not allowed on playgrounds, sports fields, or golf courses.</p>",
    "Street Address": "2928 41 Avenue NW",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "None published for this specific site in reviewed official sources",
    "Park Website or Source": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=2928+41+Avenue+NW+Edmonton+AB",
    "Tags": "leash-free,edmonton,neighbourhood-park",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites, https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/owning-a-pet-in-edmonton, and https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/neighbourhood-parks-alphabetical-listing. The reviewed official pages support the Larkspur Park location and Edmonton's current citywide off-leash rules, but they do not publish a rich standalone amenities sheet for this specific site.</p>",
    "Intro Paragraph": "<p>Larkspur Off-Leash Dog Park is tied to Larkspur Park in southeast Edmonton. The City of Edmonton's current neighbourhood parks listing places Larkspur Park at 2928 41 Avenue NW, and Edmonton's official off-leash guidance says owners should verify posted boundaries and keep dogs leashed while entering and leaving designated off-leash areas.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Larkspur Off-Leash Dog Park | Edmonton, AB | LeashFree.ca",
    "Meta Description": "Source-backed guide to Larkspur Off-Leash Dog Park in Edmonton, covering the Larkspur Park location, Edmonton's current off-leash rules, and what to verify on arrival because the City does not publish a detailed amenities sheet for this site.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/larkspur-off-leash-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/larkspur-off-leash-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Larkspur Off-Leash Dog Park and refreshed backlog files.");
