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
  return `${rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  const line = '  "jackie-parker-park-off-leash-area": "/images/dog-parks/jackie-parker-park-off-leash-area-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "island-22-dog-park": "/images/dog-parks/island-22-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "jackie-parker-park-off-leash-area");
  if (!park) throw new Error("Jackie Parker record not found.");

  const seoTitle = "Jackie Parker Park Off-Leash Area | Edmonton, AB | LeashFree.ca";
  const metaDescription = "Source-backed guide to Jackie Parker Park in Edmonton, covering the official 4540 50 Street location, 5am to 11pm park hours, the on-site off-leash area, loop trail, small lake, pavilion washrooms, and current Edmonton off-leash rules.";
  const intro = "<p>Jackie Parker Park is a City of Edmonton park at 4540 50 Street with an on-site off-leash area as part of a larger family park setting. The current City park page lists the off-leash site alongside the park's small lake, walking trail, picnic areas, playground, spray park, pavilion and parking.</p>";
  const body = "<p>Jackie Parker is better understood as a multi-use city park with a dog off-leash area inside it, not as a stand-alone fenced dog park. Edmonton's current Jackie Parker Park page gives the most useful factual overview: the park is located at 4540 50 Street, is open from 5am to 11pm, has washrooms in the pavilion, and includes amenities such as a small lake with a loop trail, picnic sites, a playground, spray park, parking and an off-leash site. The City also notes that people should not swim or boat in the lake.</p><p>The current Edmonton off-leash rules page fills in the dog-use guidance. Before visiting, the City tells owners to license their dogs, keep vaccinations and deworming current, and learn the boundaries of the off-leash area because dogs must be leashed when entering or leaving it. At the off-leash area, owners remain responsible for their dog's behaviour, must keep dogs under control and in sight, clean up after them, and remember that Edmonton parks are shared-use spaces where wildlife may be present. If a coyote is seen, the City says to leash your dog.</p><p>This source set is stronger than the old record, but it does not support some of the earlier claims LeashFree was carrying forward. I have removed unsupported details such as a fully fenced layout and converted the page into a cleaner Edmonton-backed park guide centered on what the City currently publishes.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/jackie-parker-park and https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites. These sources support the 4540 50 Street address, 5am to 11pm hours, pavilion washrooms, small lake, loop trail, picnic and family-park amenities, the presence of an off-leash site at Jackie Parker Park, and Edmonton's current off-leash rules and cautions.</p>";

  park.title = "Jackie Parker Park Off-Leash Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Edmonton"],
    Province: ["Alberta"],
    Tags: ["off-leash", "multi-use-park", "small-lake", "loop-trail"]
  };

  Object.assign(park.raw, {
    "Park Name": "Jackie Parker Park Off-Leash Area",
    "Park Header": "Jackie Parker Park Off-Leash Area",
    "Description": body,
    "Street Address": "4540 50 Street",
    "latitude": "",
    "longitude": "",
    "City": "Edmonton",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and paved walking trails",
    "Size": "Multi-use city park with an off-leash site",
    "Water source available": "Unknown",
    "Benches": "Yes - picnic and fire-ring seating published for the park",
    "Shaded area": "Yes",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes",
    "Washrooms nearby": "Yes - in pavilion",
    "Operating hours": "5am to 11pm",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/jackie-parker-park",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=4540+50+Street+Edmonton+AB",
    "Tags": "off-leash,multi-use-park,small-lake,loop-trail",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });

  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "jackie-parker-park-off-leash-area");
  if (!targetRow) throw new Error("Jackie Parker CSV row not found.");
  const updates = {
    "Park Name": "Jackie Parker Park Off-Leash Area",
    "Park Header": "Jackie Parker Park Off-Leash Area",
    "Description": "<p>Jackie Parker is better understood as a multi-use city park with a dog off-leash area inside it, not as a stand-alone fenced dog park. Edmonton's current Jackie Parker Park page gives the most useful factual overview: the park is located at 4540 50 Street, is open from 5am to 11pm, has washrooms in the pavilion, and includes amenities such as a small lake with a loop trail, picnic sites, a playground, spray park, parking and an off-leash site. The City also notes that people should not swim or boat in the lake.</p><p>The current Edmonton off-leash rules page fills in the dog-use guidance. Before visiting, the City tells owners to license their dogs, keep vaccinations and deworming current, and learn the boundaries of the off-leash area because dogs must be leashed when entering or leaving it. At the off-leash area, owners remain responsible for their dog's behaviour, must keep dogs under control and in sight, clean up after them, and remember that Edmonton parks are shared-use spaces where wildlife may be present. If a coyote is seen, the City says to leash your dog.</p><p>This source set is stronger than the old record, but it does not support some of the earlier claims LeashFree was carrying forward. I have removed unsupported details such as a fully fenced layout and converted the page into a cleaner Edmonton-backed park guide centered on what the City currently publishes.</p>",
    "Street Address": "4540 50 Street",
    "latitude": "",
    "longitude": "",
    "City": "Edmonton",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and paved walking trails",
    "Size": "Multi-use city park with an off-leash site",
    "Water source available": "Unknown",
    "Benches": "Yes - picnic and fire-ring seating published for the park",
    "Shaded area": "Yes",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes",
    "Washrooms nearby": "Yes - in pavilion",
    "Operating hours": "5am to 11pm",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/jackie-parker-park",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=4540+50+Street+Edmonton+AB",
    "Tags": "off-leash,multi-use-park,small-lake,loop-trail",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/jackie-parker-park and https://www.edmonton.ca/activities_parks_recreation/parks_rivervalley/off-leash-sites. These sources support the 4540 50 Street address, 5am to 11pm hours, pavilion washrooms, small lake, loop trail, picnic and family-park amenities, the presence of an off-leash site at Jackie Parker Park, and Edmonton's current off-leash rules and cautions.</p>",
    "Intro Paragraph": "<p>Jackie Parker Park is a City of Edmonton park at 4540 50 Street with an on-site off-leash area as part of a larger family park setting. The current City park page lists the off-leash site alongside the park's small lake, walking trail, picnic areas, playground, spray park, pavilion and parking.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Jackie Parker Park Off-Leash Area | Edmonton, AB | LeashFree.ca",
    "Meta Description": "Source-backed guide to Jackie Parker Park in Edmonton, covering the official 4540 50 Street location, 5am to 11pm park hours, the on-site off-leash area, loop trail, small lake, pavilion washrooms, and current Edmonton off-leash rules.",
    "Updated On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/jackie-parker-park-off-leash-area/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/jackie-parker-park-off-leash-area/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Jackie Parker Park Off-Leash Area and refreshed backlog files.");
