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
  const line = '  "paul-mostoway-dog-park": "/images/dog-parks/paul-mostoway-dog-park-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "oswald-park-victoria": "/images/dog-parks/oswald-park-victoria-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "paul-mostoway-dog-park");
  if (!park) throw new Error("Paul Mostoway Dog Park record not found.");

  const seoTitle = "Paul Mostoway Dog Park | Saskatoon, SK | LeashFree.ca";
  const metaDescription = "Source-backed guide to Paul Mostoway Dog Park in Saskatoon, covering the current city dog-park rules plus the official park location at Richardson Road and McClocklin Road, 3.2-acre size, full fencing, crusher-dust pathway, waste receptacles, and ten-stall angled parking lot.";
  const intro = "<p>Paul Mostoway Dog Park is one of the City of Saskatoon's official dog parks. Saskatoon's current dog-park page confirms the park remains active, while the City's official opening release still provides useful site details including the location at Richardson Road and McClocklin Road and the park's original built features.</p>";
  const body = "<p>Paul Mostoway is a better candidate for factual expansion than the older record suggested because Saskatoon still has both a current citywide dog-parks page and an official park-opening release for this specific site. The opening release published on November 29, 2017 says Paul Mostoway Dog Park is located at Richardson Road and McClocklin Road, covers 3.2 acres, is fully fenced, and features a crusher dust pathway, waste receptacles and a ten-stall angled parking lot. Those details are still useful because they are specific, official, and materially better than generic prose about a quiet suburban setting.</p><p>The current City dog-parks page supplies the operating rules and safety expectations that matter most for a visit now. Saskatoon says its dog parks are naturalized spaces where dogs may be off leash while under the control of their owner. A valid dog licence is required, dogs should have up-to-date vaccinations, and owners should make sure their dogs are well behaved around people and other pets before using an off-leash area. The City also says owners must keep dogs leashed when entering and exiting, remain within sight of their dogs, pick up after them, remove any dog that becomes a nuisance, and remember that wildlife may be present in dog parks.</p><p>This update keeps the page grounded in those official sources rather than guessing at amenities the City does not currently repeat on the modern dog-parks page. The result is a more reliable park profile built from Saskatoon's current rules plus the City's own specific opening facts for Paul Mostoway.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks and the City of Saskatoon news release published November 29, 2017 at https://www.saskatoon.ca/news-releases/paul-mostoway-dog-park-set-open-130-pm-friday-december-1-2017. These sources support the current citywide dog-park rules and Paul Mostoway's published location, 3.2-acre size, full fencing, crusher-dust pathway, waste receptacles and ten-stall angled parking lot.</p>";

  park.title = "Paul Mostoway Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Saskatoon"],
    Province: ["Saskatchewan"],
    Tags: ["off-leash", "fenced", "crusher-dust-path", "parking-lot"]
  };

  Object.assign(park.raw, {
    "Park Name": "Paul Mostoway Dog Park",
    "Park Header": "Paul Mostoway Dog Park",
    "Description": body,
    "Street Address": "Richardson Road and McClocklin Road",
    "latitude": "",
    "longitude": "",
    "City": "Saskatoon",
    "Province": "Saskatchewan",
    "Postal Code": "",
    "Fenced": "Yes - fully fenced",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and crusher dust pathway",
    "Size": "3.2 acres",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - waste receptacles published by City",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - ten-stall angled parking lot",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Richardson+Road+and+McClocklin+Road+Saskatoon+SK",
    "Tags": "off-leash,fenced,crusher-dust-path,parking-lot",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "paul-mostoway-dog-park");
  if (!targetRow) throw new Error("Paul Mostoway CSV row not found.");
  const updates = {
    "Park Name": "Paul Mostoway Dog Park",
    "Park Header": "Paul Mostoway Dog Park",
    "Description": "<p>Paul Mostoway is a better candidate for factual expansion than the older record suggested because Saskatoon still has both a current citywide dog-parks page and an official park-opening release for this specific site. The opening release published on November 29, 2017 says Paul Mostoway Dog Park is located at Richardson Road and McClocklin Road, covers 3.2 acres, is fully fenced, and features a crusher dust pathway, waste receptacles and a ten-stall angled parking lot. Those details are still useful because they are specific, official, and materially better than generic prose about a quiet suburban setting.</p><p>The current City dog-parks page supplies the operating rules and safety expectations that matter most for a visit now. Saskatoon says its dog parks are naturalized spaces where dogs may be off leash while under the control of their owner. A valid dog licence is required, dogs should have up-to-date vaccinations, and owners should make sure their dogs are well behaved around people and other pets before using an off-leash area. The City also says owners must keep dogs leashed when entering and exiting, remain within sight of their dogs, pick up after them, remove any dog that becomes a nuisance, and remember that wildlife may be present in dog parks.</p><p>This update keeps the page grounded in those official sources rather than guessing at amenities the City does not currently repeat on the modern dog-parks page. The result is a more reliable park profile built from Saskatoon's current rules plus the City's own specific opening facts for Paul Mostoway.</p>",
    "Street Address": "Richardson Road and McClocklin Road",
    "latitude": "",
    "longitude": "",
    "City": "Saskatoon",
    "Province": "Saskatchewan",
    "Postal Code": "",
    "Fenced": "Yes - fully fenced",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and crusher dust pathway",
    "Size": "3.2 acres",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - waste receptacles published by City",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - ten-stall angled parking lot",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Richardson+Road+and+McClocklin+Road+Saskatoon+SK",
    "Tags": "off-leash,fenced,crusher-dust-path,parking-lot",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks and the City of Saskatoon news release published November 29, 2017 at https://www.saskatoon.ca/news-releases/paul-mostoway-dog-park-set-open-130-pm-friday-december-1-2017. These sources support the current citywide dog-park rules and Paul Mostoway's published location, 3.2-acre size, full fencing, crusher-dust pathway, waste receptacles and ten-stall angled parking lot.</p>",
    "Intro Paragraph": "<p>Paul Mostoway Dog Park is one of the City of Saskatoon's official dog parks. Saskatoon's current dog-park page confirms the park remains active, while the City's official opening release still provides useful site details including the location at Richardson Road and McClocklin Road and the park's original built features.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Paul Mostoway Dog Park | Saskatoon, SK | LeashFree.ca",
    "Meta Description": "Source-backed guide to Paul Mostoway Dog Park in Saskatoon, covering the current city dog-park rules plus the official park location at Richardson Road and McClocklin Road, 3.2-acre size, full fencing, crusher-dust pathway, waste receptacles, and ten-stall angled parking lot.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/paul-mostoway-dog-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/paul-mostoway-dog-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Paul Mostoway Dog Park and refreshed backlog files.");
