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
  if (source.includes('"warner-loat-park-burnaby": "/images/dog-parks/warner-loat-park-burnaby-original.png"')) return;
  const anchor = '  "willingdon-heights-park-burnaby": "/images/dog-parks/willingdon-heights-park-burnaby-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "warner-loat-park-burnaby": "/images/dog-parks/warner-loat-park-burnaby-original.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "warner-loat-park-burnaby");
  if (!park) throw new Error("Warner Loat park record not found.");

  const seoTitle = "Warner Loat Park Off-Leash Area | Burnaby, BC | LeashFree.ca";
  const metaDescription = "Source-backed guide to Warner Loat Park's fenced off-leash area in Burnaby, covering the 4252 Piper Avenue location, year-round access, Burnaby's leash and licence rules, and nearby Burnaby Lake context.";
  const intro = "<p>Warner Loat Park is one of Burnaby's officially listed dog off-leash areas. The City of Burnaby says it is a fenced enclosure with year-round access at 4252 Piper Avenue, a block from the Piper Avenue entrance to Burnaby Lake Regional Park.</p>";
  const body = "<p>Warner Loat Park is one of Burnaby's more straightforward official off-leash pages because the City clearly identifies what the site is and where it sits. Burnaby's current dog off-leash page lists Warner Loat as a fenced enclosure with access year-round and places it at 4252 Piper Avenue. The same listing adds a useful orientation note: it is a block away from the Piper Avenue entrance of Burnaby Lake Regional Park. That gives owners a practical landmark without forcing unsupported claims about amenities the City does not publish on the page.</p><p>Burnaby's current off-leash rules are also specific. The City says dogs using off-leash areas must wear a valid licence and have up-to-date vaccinations, must be leashed before and after using the off-leash area, and owners must keep a leash in hand at all times while their dog is off leash. Burnaby also requires owners to remove aggressive dogs immediately, limits use to a maximum of two dogs per person, and notes that dogs are not allowed in environmentally sensitive habitats around Burnaby Lake outside designated areas. That makes Warner Loat best described as a city-managed fenced enclosure with year-round access and clear rule enforcement, not as a loosely documented neighbourhood field.</p>";
  const notes = "<p>Primary official source: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas. Burnaby lists Warner Loat Park as a fenced enclosure with year-round access at 4252 Piper Avenue, a block from the Piper Avenue entrance of Burnaby Lake Regional Park.</p>";

  park.title = "Warner Loat Park Off-Leash Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = metaDescription;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Burnaby"],
    Province: ["British Columbia"],
    Tags: ["leash-free", "fenced", "year-round", "burnaby-lake"]
  };

  Object.assign(park.raw, {
    "Park Name": "Warner Loat Park",
    "Park Header": "Warner Loat Park Off-Leash Area",
    "Description": body,
    "Street Address": "4252 Piper Avenue",
    "latitude": "49.2613",
    "longitude": "-122.9574",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Dawn to dusk",
    "Seasonal Restrictions": "None published; City lists year-round access",
    "Park Website or Source": "https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=4252+Piper+Avenue+Burnaby+BC",
    "Tags": "leash-free,fenced,year-round,burnaby-lake",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "warner-loat-park-burnaby");
  if (!targetRow) throw new Error("Warner Loat park CSV row not found.");

  const updates = {
    "Park Name": "Warner Loat Park",
    "Park Header": "Warner Loat Park Off-Leash Area",
    "Description": "<p>Warner Loat Park is one of Burnaby's more straightforward official off-leash pages because the City clearly identifies what the site is and where it sits. Burnaby's current dog off-leash page lists Warner Loat as a fenced enclosure with access year-round and places it at 4252 Piper Avenue. The same listing adds a useful orientation note: it is a block away from the Piper Avenue entrance of Burnaby Lake Regional Park. That gives owners a practical landmark without forcing unsupported claims about amenities the City does not publish on the page.</p><p>Burnaby's current off-leash rules are also specific. The City says dogs using off-leash areas must wear a valid licence and have up-to-date vaccinations, must be leashed before and after using the off-leash area, and owners must keep a leash in hand at all times while their dog is off leash. Burnaby also requires owners to remove aggressive dogs immediately, limits use to a maximum of two dogs per person, and notes that dogs are not allowed in environmentally sensitive habitats around Burnaby Lake outside designated areas. That makes Warner Loat best described as a city-managed fenced enclosure with year-round access and clear rule enforcement, not as a loosely documented neighbourhood field.</p>",
    "Street Address": "4252 Piper Avenue",
    "latitude": "49.2613",
    "longitude": "-122.9574",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Dawn to dusk",
    "Seasonal Restrictions": "None published; City lists year-round access",
    "Park Website or Source": "https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=4252+Piper+Avenue+Burnaby+BC",
    "Tags": "leash-free,fenced,year-round,burnaby-lake",
    "Notes / Comments": "<p>Primary official source: https://www.burnaby.ca/explore-outdoors/dog-off-leash-areas. Burnaby lists Warner Loat Park as a fenced enclosure with year-round access at 4252 Piper Avenue, a block from the Piper Avenue entrance of Burnaby Lake Regional Park.</p>",
    "Intro Paragraph": "<p>Warner Loat Park is one of Burnaby's officially listed dog off-leash areas. The City of Burnaby says it is a fenced enclosure with year-round access at 4252 Piper Avenue, a block from the Piper Avenue entrance to Burnaby Lake Regional Park.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Warner Loat Park Off-Leash Area | Burnaby, BC | LeashFree.ca",
    "Meta Description": "Source-backed guide to Warner Loat Park's fenced off-leash area in Burnaby, covering the 4252 Piper Avenue location, year-round access, Burnaby's leash and licence rules, and nearby Burnaby Lake context.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/warner-loat-park-burnaby/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/warner-loat-park-burnaby/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Warner Loat Park and refreshed backlog files.");
