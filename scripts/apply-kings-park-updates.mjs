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
  const line = '  "kings-park": "/images/dog-parks/kings-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "king-george-park-cornwall": "/images/dog-parks/king-george-park-cornwall-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "kings-park");
  if (!park) throw new Error("Kings Park record not found.");

  const seoTitle = "Kings Park Dog Park | Winnipeg, MB | LeashFree.ca";
  const metaDescription = "Source-backed guide to the Kings Park off-leash area in Winnipeg, including the official 198 Kings Drive location, the off-leash section northeast of the retention pond, year-round washrooms, multi-use trail context, and the August to November 2026 park improvement project.";
  const intro = "<p>Kings Park includes an official City of Winnipeg off-leash dog area at 198 Kings Drive in south Winnipeg. The current City off-leash map places the dog area northeast of the retention pond inside a larger multi-use park known for its pathways, lake features, and year-round washroom access.</p>";
  const body = "<p>This page needed a factual rebuild because the older copy relied on generic riverside language instead of what Winnipeg currently publishes. The City of Winnipeg's off-leash area directory identifies Kings Park at 198 Kings Drive and says the off-leash section is northeast of the retention pond. The same source also warns that this is a multi-use park shared with skiers, snowshoers, walkers, runners, and cyclists, so dog owners should expect mixed traffic rather than an isolated fenced enclosure.</p><p>The broader Kings Park page adds the main park context that actually helps visitors plan a trip. The City lists a 2.8-hectare lake with a waterfall, rock garden, and labyrinth, plus 2.6 kilometres of pathway, a toboggan slide, an off-leash dog area, and year-round washroom access. Winnipeg also has an active park improvement project scheduled from August 2026 to November 2026. According to the City's current project page, crews are rebuilding roadway and pathway surfaces, repaving the road and parking lot near the washrooms, adding benches, waste receptacles, and signage, and restoring landscaped areas. The City specifically says access will be maintained to the primary parking lot, dog park, and washroom facilities during construction.</p><p>For current use rules, Winnipeg's off-leash guidance says dogs must remain under control and within view, handlers must carry a leash, aggressive dogs are not allowed, waste must be picked up, holes must be filled, and all dogs must be licensed. The same off-leash page says sites are generally open from 7 a.m. to 11 p.m. or as posted, while the Kings Park page lists daily park hours of 7 a.m. to 10 p.m. That discrepancy is another reason this page now sticks closely to official sources instead of repeating assumptions.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/ , https://legacy.winnipeg.ca/publicworks/parksopenspace/park-asset/kings-park.stm , and https://legacy.winnipeg.ca/publicworks/parksopenspace/park-improvements/park-improvements.stm . These sources support the 198 Kings Drive location, the off-leash area northeast of the retention pond, the multi-use park context, year-round washrooms, 2.6 km of pathways, and the August to November 2026 improvement project with maintained access to parking, washrooms, and the dog park.</p>";

  park.title = "Kings Park Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Winnipeg"],
    Province: ["Manitoba"],
    Tags: ["off-leash", "multi-use-park", "retention-pond", "year-round-washrooms"]
  };

  Object.assign(park.raw, {
    "Park Name": "Kings Park",
    "Park Header": "Kings Park Dog Park",
    "Description": body,
    "Street Address": "198 Kings Drive",
    "latitude": "",
    "longitude": "",
    "City": "Winnipeg",
    "Province": "Manitoba",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and park pathways",
    "Size": "Off-leash area northeast of retention pond",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - primary parking lot access maintained during August to November 2026 improvements",
    "Washrooms nearby": "Yes - year-round washroom access",
    "Operating hours": "As posted - official pages currently list 7 a.m. to 10 p.m. daily for the park and 7 a.m. to 11 p.m. for off-leash areas",
    "Seasonal Restrictions": "Park improvements scheduled August to November 2026; City says access will be maintained to the parking lot, dog park, and washrooms",
    "Park Website or Source": "https://winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=198+Kings+Drive+Winnipeg+MB",
    "Tags": "off-leash,multi-use-park,retention-pond,year-round-washrooms",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "kings-park");
  if (!targetRow) throw new Error("Kings Park CSV row not found.");
  const updates = {
    "Park Name": "Kings Park",
    "Park Header": "Kings Park Dog Park",
    "Description": "<p>This page needed a factual rebuild because the older copy relied on generic riverside language instead of what Winnipeg currently publishes. The City of Winnipeg's off-leash area directory identifies Kings Park at 198 Kings Drive and says the off-leash section is northeast of the retention pond. The same source also warns that this is a multi-use park shared with skiers, snowshoers, walkers, runners, and cyclists, so dog owners should expect mixed traffic rather than an isolated fenced enclosure.</p><p>The broader Kings Park page adds the main park context that actually helps visitors plan a trip. The City lists a 2.8-hectare lake with a waterfall, rock garden, and labyrinth, plus 2.6 kilometres of pathway, a toboggan slide, an off-leash dog area, and year-round washroom access. Winnipeg also has an active park improvement project scheduled from August 2026 to November 2026. According to the City's current project page, crews are rebuilding roadway and pathway surfaces, repaving the road and parking lot near the washrooms, adding benches, waste receptacles, and signage, and restoring landscaped areas. The City specifically says access will be maintained to the primary parking lot, dog park, and washroom facilities during construction.</p><p>For current use rules, Winnipeg's off-leash guidance says dogs must remain under control and within view, handlers must carry a leash, aggressive dogs are not allowed, waste must be picked up, holes must be filled, and all dogs must be licensed. The same off-leash page says sites are generally open from 7 a.m. to 11 p.m. or as posted, while the Kings Park page lists daily park hours of 7 a.m. to 10 p.m. That discrepancy is another reason this page now sticks closely to official sources instead of repeating assumptions.</p>",
    "Street Address": "198 Kings Drive",
    "latitude": "",
    "longitude": "",
    "City": "Winnipeg",
    "Province": "Manitoba",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and park pathways",
    "Size": "Off-leash area northeast of retention pond",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - primary parking lot access maintained during August to November 2026 improvements",
    "Washrooms nearby": "Yes - year-round washroom access",
    "Operating hours": "As posted - official pages currently list 7 a.m. to 10 p.m. daily for the park and 7 a.m. to 11 p.m. for off-leash areas",
    "Seasonal Restrictions": "Park improvements scheduled August to November 2026; City says access will be maintained to the parking lot, dog park, and washrooms",
    "Park Website or Source": "https://winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=198+Kings+Drive+Winnipeg+MB",
    "Tags": "off-leash,multi-use-park,retention-pond,year-round-washrooms",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas/ , https://legacy.winnipeg.ca/publicworks/parksopenspace/park-asset/kings-park.stm , and https://legacy.winnipeg.ca/publicworks/parksopenspace/park-improvements/park-improvements.stm . These sources support the 198 Kings Drive location, the off-leash area northeast of the retention pond, the multi-use park context, year-round washrooms, 2.6 km of pathways, and the August to November 2026 improvement project with maintained access to parking, washrooms, and the dog park.</p>",
    "Intro Paragraph": "<p>Kings Park includes an official City of Winnipeg off-leash dog area at 198 Kings Drive in south Winnipeg. The current City off-leash map places the dog area northeast of the retention pond inside a larger multi-use park known for its pathways, lake features, and year-round washroom access.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Kings Park Dog Park | Winnipeg, MB | LeashFree.ca",
    "Meta Description": "Source-backed guide to the Kings Park off-leash area in Winnipeg, including the official 198 Kings Drive location, the off-leash section northeast of the retention pond, year-round washrooms, multi-use trail context, and the August to November 2026 park improvement project.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/kings-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/kings-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Kings Park and refreshed backlog files.");
