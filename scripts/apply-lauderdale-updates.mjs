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
  const line = '  "lauderdale-dog-park": "/images/dog-parks/lauderdale-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "larkspur-off-leash-dog-park": "/images/dog-parks/larkspur-off-leash-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "lauderdale-dog-park");
  if (!park) throw new Error("Lauderdale park record not found.");

  const seoTitle = "Lauderdale Dog Park | Edmonton, AB | LeashFree.ca";
  const metaDescription = "Source-backed guide to Lauderdale Dog Park in Edmonton, covering the City-listed 12735 113A Street NW location, the current dry pond construction notice, and Edmonton's off-leash rules.";
  const intro = "<p>Lauderdale Dog Park is one of Edmonton's officially listed off-leash areas. The City of Edmonton currently lists it at 12735 113A Street NW and notes that dry pond construction is underway, with staging planned so that a portion of the dog park remains open at all times.</p>";
  const body = "<p>Lauderdale is one of the clearer Edmonton off-leash pages because the City's current off-leash directory includes both a confirmed location and a live project-status update. Edmonton lists Lauderdale Dog Park at 12735 113A Street NW and says dry pond construction has begun. According to the current City notice, a portion of the dog park will be closed during this work, construction will be staged to keep a portion of the site open at all times, and temporary entrances may be added to improve accessibility while work is underway. That is more useful to visitors right now than recycling older generic claims about size or amenities.</p><p>The broader Edmonton rules still apply here. The City says dogs using off-leash areas should be licensed, up to date on vaccinations and deworming, and leashed while entering and leaving posted off-leash boundaries. Owners remain responsible for keeping dogs under control and in sight, cleaning up after them, and preventing wildlife chasing in shared-use parks. Edmonton's dog strategy also notes that Lauderdale received past safety-related enhancements, but the reviewed source set does not publish a detailed current amenities sheet for this specific site, so fields like fencing, water, benches, or fixed operating hours should be verified on arrival rather than stated as settled fact.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites, https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/owning-a-pet-in-edmonton, and https://www.edmonton.ca/projects_plans/parks_recreation/dogs-in-open-spaces. Edmonton's current off-leash page lists Lauderdale Dog Park at 12735 113A Street NW and says dry pond construction is underway, with part of the site kept open during staging.</p>";

  park.title = "Lauderdale Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Edmonton"],
    Province: ["Alberta"],
    Tags: ["leash-free", "edmonton", "construction-update"]
  };

  Object.assign(park.raw, {
    "Park Name": "Lauderdale Dog Park",
    "Park Header": "Lauderdale Dog Park",
    "Description": body,
    "Street Address": "12735 113A Street NW",
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
    "Seasonal Restrictions": "Active dry pond construction; a portion of the site may be closed while staging keeps part of the dog park open",
    "Park Website or Source": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=12735+113A+Street+NW+Edmonton+AB",
    "Tags": "leash-free,edmonton,construction-update",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "lauderdale-dog-park");
  if (!targetRow) throw new Error("Lauderdale park CSV row not found.");

  const updates = {
    "Park Name": "Lauderdale Dog Park",
    "Park Header": "Lauderdale Dog Park",
    "Description": "<p>Lauderdale is one of the clearer Edmonton off-leash pages because the City's current off-leash directory includes both a confirmed location and a live project-status update. Edmonton lists Lauderdale Dog Park at 12735 113A Street NW and says dry pond construction has begun. According to the current City notice, a portion of the dog park will be closed during this work, construction will be staged to keep a portion of the site open at all times, and temporary entrances may be added to improve accessibility while work is underway. That is more useful to visitors right now than recycling older generic claims about size or amenities.</p><p>The broader Edmonton rules still apply here. The City says dogs using off-leash areas should be licensed, up to date on vaccinations and deworming, and leashed while entering and leaving posted off-leash boundaries. Owners remain responsible for keeping dogs under control and in sight, cleaning up after them, and preventing wildlife chasing in shared-use parks. Edmonton's dog strategy also notes that Lauderdale received past safety-related enhancements, but the reviewed source set does not publish a detailed current amenities sheet for this specific site, so fields like fencing, water, benches, or fixed operating hours should be verified on arrival rather than stated as settled fact.</p>",
    "Street Address": "12735 113A Street NW",
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
    "Seasonal Restrictions": "Active dry pond construction; a portion of the site may be closed while staging keeps part of the dog park open",
    "Park Website or Source": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=12735+113A+Street+NW+Edmonton+AB",
    "Tags": "leash-free,edmonton,construction-update",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites, https://www.edmonton.ca/residential_neighbourhoods/pets_wildlife/owning-a-pet-in-edmonton, and https://www.edmonton.ca/projects_plans/parks_recreation/dogs-in-open-spaces. Edmonton's current off-leash page lists Lauderdale Dog Park at 12735 113A Street NW and says dry pond construction is underway, with part of the site kept open during staging.</p>",
    "Intro Paragraph": "<p>Lauderdale Dog Park is one of Edmonton's officially listed off-leash areas. The City of Edmonton currently lists it at 12735 113A Street NW and notes that dry pond construction is underway, with staging planned so that a portion of the dog park remains open at all times.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Lauderdale Dog Park | Edmonton, AB | LeashFree.ca",
    "Meta Description": "Source-backed guide to Lauderdale Dog Park in Edmonton, covering the City-listed 12735 113A Street NW location, the current dry pond construction notice, and Edmonton's off-leash rules.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/lauderdale-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/lauderdale-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Lauderdale Dog Park and refreshed backlog files.");
