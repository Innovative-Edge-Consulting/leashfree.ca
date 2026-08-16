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
  const line = '  "fred-mendel-dog-park": "/images/dog-parks/fred-mendel-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "fairfield-park-chilliwack": "/images/dog-parks/fairfield-park-chilliwack-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "fred-mendel-dog-park");
  if (!park) throw new Error("Fred Mendel Dog Park record not found.");

  const seoTitle = "Fred Mendel Dog Park | Saskatoon, SK | LeashFree.ca";
  const metaDescription = "Source-backed guide to Fred Mendel Dog Park in Saskatoon, covering the City's current dog-park listing, core off-leash rules, and City records for the Fred Mendel off-leash area near Avenue W South and 17th Street West.";
  const intro = "<p>Fred Mendel Dog Park is one of the City of Saskatoon's official dog parks. The current City dog parks page lists it among Saskatoon's active off-leash areas, while City records for the Fred Mendel off-leash designation place the site in Fred Mendel Park near Avenue W South and 17th Street West on the west side of Saskatoon.</p>";
  const body = "<p>This page needed a reset because the older LeashFree record included specific amenity claims that were not supported by Saskatoon's current public sources. What the City does clearly publish today is that Fred Mendel is an active Saskatoon dog park and that Saskatoon's dog parks are naturalized spaces where dogs may be off leash while under the control of their owners. The City's current dog parks page also says a valid dog licence is required to access any dog park and that dogs should have up-to-date vaccinations before visiting.</p><p>The most useful current guidance comes from the City's published dog park etiquette and readiness rules. Saskatoon tells owners to keep dogs leashed when entering and exiting the park, keep dogs within sight, pick up after them, and remove any dog that becomes a nuisance by leashing it and leaving the off-leash area. The City also advises that dogs should know basic commands such as come, sit and stay before visiting. Because Saskatoon's dog parks are shared naturalized spaces, the City reminds visitors that wildlife may be present and that dogs should remain under control at all times.</p><p>For location context, older City of Saskatoon records still matter here. In 2016, City Council materials documented the Fred Mendel off-leash recreation area as a designated site within Fred Mendel Park, and a later City Council agenda brief in 2016 noted that the proposed area had been adjusted to 1.22 acres. A City news release archived in the City's search results also placed Fred Mendel Dog Park near Avenue W South and 17th Street West. Those records are useful for orientation, but the current public dog park page is the primary source for the park's active status and operating rules.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks and https://www.saskatoon.ca/parks-recreation-attractions/parks/park-locations-amenities. Historical City of Saskatoon records also reviewed August 16, 2026: https://www.saskatoon.ca/news-releases/planning-development-community-services-decisions-brief-2 and https://www.saskatoon.ca/news-releases/city-council-agenda-brief-6. These sources support Fred Mendel's current status as an official Saskatoon dog park, the current citywide dog-park rules, the Fred Mendel park context, the Avenue W South and 17th Street West orientation, and the 1.22-acre off-leash area history.</p>";

  park.title = "Fred Mendel Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Saskatoon"],
    Province: ["Saskatchewan"],
    Tags: ["off-leash", "naturalized", "west-side", "city-listed"]
  };

  Object.assign(park.raw, {
    "Park Name": "Fred Mendel Dog Park",
    "Park Header": "Fred Mendel Dog Park",
    "Description": body,
    "Street Address": "Near Avenue W South and 17th Street West",
    "latitude": "",
    "longitude": "",
    "City": "Saskatoon",
    "Province": "Saskatchewan",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Naturalized grass",
    "Size": "1.22-acre off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Fred+Mendel+Dog+Park+Saskatoon+SK",
    "Tags": "off-leash,naturalized,west-side,city-listed",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "fred-mendel-dog-park");
  if (!targetRow) throw new Error("Fred Mendel Dog Park CSV row not found.");

  const updates = {
    "Park Name": "Fred Mendel Dog Park",
    "Park Header": "Fred Mendel Dog Park",
    "Description": "<p>This page needed a reset because the older LeashFree record included specific amenity claims that were not supported by Saskatoon's current public sources. What the City does clearly publish today is that Fred Mendel is an active Saskatoon dog park and that Saskatoon's dog parks are naturalized spaces where dogs may be off leash while under the control of their owners. The City's current dog parks page also says a valid dog licence is required to access any dog park and that dogs should have up-to-date vaccinations before visiting.</p><p>The most useful current guidance comes from the City's published dog park etiquette and readiness rules. Saskatoon tells owners to keep dogs leashed when entering and exiting the park, keep dogs within sight, pick up after them, and remove any dog that becomes a nuisance by leashing it and leaving the off-leash area. The City also advises that dogs should know basic commands such as come, sit and stay before visiting. Because Saskatoon's dog parks are shared naturalized spaces, the City reminds visitors that wildlife may be present and that dogs should remain under control at all times.</p><p>For location context, older City of Saskatoon records still matter here. In 2016, City Council materials documented the Fred Mendel off-leash recreation area as a designated site within Fred Mendel Park, and a later City Council agenda brief in 2016 noted that the proposed area had been adjusted to 1.22 acres. A City news release archived in the City's search results also placed Fred Mendel Dog Park near Avenue W South and 17th Street West. Those records are useful for orientation, but the current public dog park page is the primary source for the park's active status and operating rules.</p>",
    "Street Address": "Near Avenue W South and 17th Street West",
    "latitude": "",
    "longitude": "",
    "City": "Saskatoon",
    "Province": "Saskatchewan",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Naturalized grass",
    "Size": "1.22-acre off-leash area",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Fred+Mendel+Dog+Park+Saskatoon+SK",
    "Tags": "off-leash,naturalized,west-side,city-listed",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks and https://www.saskatoon.ca/parks-recreation-attractions/parks/park-locations-amenities. Historical City of Saskatoon records also reviewed August 16, 2026: https://www.saskatoon.ca/news-releases/planning-development-community-services-decisions-brief-2 and https://www.saskatoon.ca/news-releases/city-council-agenda-brief-6. These sources support Fred Mendel's current status as an official Saskatoon dog park, the current citywide dog-park rules, the Fred Mendel park context, the Avenue W South and 17th Street West orientation, and the 1.22-acre off-leash area history.</p>",
    "Intro Paragraph": "<p>Fred Mendel Dog Park is one of the City of Saskatoon's official dog parks. The current City dog parks page lists it among Saskatoon's active off-leash areas, while City records for the Fred Mendel off-leash designation place the site in Fred Mendel Park near Avenue W South and 17th Street West on the west side of Saskatoon.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Fred Mendel Dog Park | Saskatoon, SK | LeashFree.ca",
    "Meta Description": "Source-backed guide to Fred Mendel Dog Park in Saskatoon, covering the City's current dog-park listing, core off-leash rules, and City records for the Fred Mendel off-leash area near Avenue W South and 17th Street West.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/fred-mendel-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/fred-mendel-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Fred Mendel Dog Park and refreshed backlog files.");
