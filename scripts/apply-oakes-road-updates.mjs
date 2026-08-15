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
  const line = '  "oakes-road-north": "/images/dog-parks/oakes-road-north-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "nicomekl-dog-area": "/images/dog-parks/nicomekl-dog-area-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "oakes-road-north");
  if (!park) throw new Error("Oakes Road park record not found.");

  const seoTitle = "Oakes Road Dog Run | Grimsby, ON | LeashFree.ca";
  const metaDescription = "Source-backed guide to Oakes Road Dog Run in Grimsby, covering the Town's current leash-free designation, 7 a.m. to 9 p.m. hours, and published dog-park rules.";
  const intro = "<p>Oakes Road Dog Run is one of the Town of Grimsby's three officially listed leash-free dog parks. The Town's current leash-free dog parks page lists Oakes Road Dog Run alongside Steve McDonnell Leash-Free Dog Park and Southward Park Leash-Free Dog Park.</p>";
  const body = "<p>The main quality fix on this page is shifting from generic feature claims to the official Grimsby facts the Town actually publishes. Grimsby's current leash-free dog parks page clearly identifies Oakes Road Dog Run as one of the municipality's three leash-free dog parks and applies one consistent ruleset across the dog parks. The Town says all dogs must have valid licence tags, up-to-date vaccinations and rabies shots, and that the off-leash area is open from 7 a.m. to 9 p.m.</p><p>The official rules also provide the practical guidance visitors need most. Dogs must be leashed when entering and exiting, kept within sight and under verbal control at all times, and not allowed to chase wildlife. Grimsby prohibits puppies under four months, female dogs in heat, sick dogs, and aggressive dogs. The Town also says children must be supervised by an adult at all times and advises parents that the site is not suitable for young children. Because the reviewed official pages do not publish a full amenities sheet for Oakes Road Dog Run itself, this page now avoids overstating details such as benches, bag dispensers, water access, or exact park geometry unless those are confirmed on site.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/leash-free-dog-parks/, https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/, and https://www.grimsby.ca/town-hall/policies-plans-and-reports/fire-safety-plans/. These sources support Oakes Road Dog Run as an official leash-free dog park, the Town's 7 a.m. to 9 p.m. operating hours and rule set, general park by-law context, and the presence of Town facilities at 10 Oakes Road North. Specific amenity claims were intentionally limited to what the reviewed official sources publish.</p>";

  park.name = "Oakes Road Dog Run";
  park.title = "Oakes Road Dog Run";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Grimsby"],
    Province: ["Ontario"],
    Tags: ["leash-free", "fenced", "grimsby", "dog-run"]
  };

  Object.assign(park.raw, {
    "Park Name": "Oakes Road Dog Run",
    "Park Header": "Oakes Road Dog Run",
    "Description": body,
    "Street Address": "Oakes Road North",
    "latitude": "",
    "longitude": "",
    "City": "Grimsby",
    "Province": "Ontario",
    "Postal Code": "L3M 4E7",
    "Fenced": "Yes",
    "Separate Small Dog Area": "No published dedicated small-dog area in reviewed official sources",
    "Surface type": "",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7 a.m. to 9 p.m.",
    "Seasonal Restrictions": "Follow posted Town dog-park rules and general parks by-law",
    "Park Website or Source": "https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/leash-free-dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Oakes+Road+North+Grimsby+ON",
    "Tags": "leash-free,fenced,grimsby,dog-run",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "oakes-road-north");
  if (!targetRow) throw new Error("Oakes Road CSV row not found.");

  const updates = {
    "Park Name": "Oakes Road Dog Run",
    "Park Header": "Oakes Road Dog Run",
    "Description": "<p>The main quality fix on this page is shifting from generic feature claims to the official Grimsby facts the Town actually publishes. Grimsby's current leash-free dog parks page clearly identifies Oakes Road Dog Run as one of the municipality's three leash-free dog parks and applies one consistent ruleset across the dog parks. The Town says all dogs must have valid licence tags, up-to-date vaccinations and rabies shots, and that the off-leash area is open from 7 a.m. to 9 p.m.</p><p>The official rules also provide the practical guidance visitors need most. Dogs must be leashed when entering and exiting, kept within sight and under verbal control at all times, and not allowed to chase wildlife. Grimsby prohibits puppies under four months, female dogs in heat, sick dogs, and aggressive dogs. The Town also says children must be supervised by an adult at all times and advises parents that the site is not suitable for young children. Because the reviewed official pages do not publish a full amenities sheet for Oakes Road Dog Run itself, this page now avoids overstating details such as benches, bag dispensers, water access, or exact park geometry unless those are confirmed on site.</p>",
    "Street Address": "Oakes Road North",
    "latitude": "",
    "longitude": "",
    "City": "Grimsby",
    "Province": "Ontario",
    "Postal Code": "L3M 4E7",
    "Fenced": "Yes",
    "Separate Small Dog Area": "No published dedicated small-dog area in reviewed official sources",
    "Surface type": "",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7 a.m. to 9 p.m.",
    "Seasonal Restrictions": "Follow posted Town dog-park rules and general parks by-law",
    "Park Website or Source": "https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/leash-free-dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Oakes+Road+North+Grimsby+ON",
    "Tags": "leash-free,fenced,grimsby,dog-run",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/leash-free-dog-parks/, https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/, and https://www.grimsby.ca/town-hall/policies-plans-and-reports/fire-safety-plans/. These sources support Oakes Road Dog Run as an official leash-free dog park, the Town's 7 a.m. to 9 p.m. operating hours and rule set, general park by-law context, and the presence of Town facilities at 10 Oakes Road North. Specific amenity claims were intentionally limited to what the reviewed official sources publish.</p>",
    "Intro Paragraph": "<p>Oakes Road Dog Run is one of the Town of Grimsby's three officially listed leash-free dog parks. The Town's current leash-free dog parks page lists Oakes Road Dog Run alongside Steve McDonnell Leash-Free Dog Park and Southward Park Leash-Free Dog Park.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Oakes Road Dog Run | Grimsby, ON | LeashFree.ca",
    "Meta Description": "Source-backed guide to Oakes Road Dog Run in Grimsby, covering the Town's current leash-free designation, 7 a.m. to 9 p.m. hours, and published dog-park rules.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/oakes-road-north/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/oakes-road-north/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Oakes Road Dog Run and refreshed backlog files.");
