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
  const line = '  "kinsmen-dog-park-quinte-west": "/images/dog-parks/kinsmen-dog-park-quinte-west-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "king-city-off-leash-dog-park": "/images/dog-parks/king-city-off-leash-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "kinsmen-dog-park-quinte-west");
  if (!park) throw new Error("Kinsmen Quinte West park record not found.");

  const seoTitle = "Kinsmen Community Dog Park | Quinte West, ON | LeashFree.ca";
  const metaDescription = "Source-backed guide to Kinsmen Community Dog Park in Quinte West, covering its Hanna Park location at 169 Creswell Drive, fully enclosed off-leash setup, free parking, nearby trails, and published dog-park rules.";
  const intro = "<p>Kinsmen Community Dog Park is located inside Hanna Park in Trenton, part of Quinte West. The City says Hanna Park is a 42-acre park at 169 Creswell Drive with free parking, marked nature trails, and a fully enclosed off-leash dog park.</p>";
  const body = "<p>The main quality fix on this page is replacing generic dog-park filler with the stronger location and rules detail Quinte West actually publishes. The City's current Hanna Park page identifies the off-leash area as Kinsmen Community Dog Park and says Hanna Park is a 42-acre park at 169 Creswell Drive in Trenton. The same page describes the dog park as fully enclosed and places it within a larger park setting that includes marked nature trails, tennis courts, a playground, and seasonal portable washrooms open from May 1 to Thanksgiving Day. It also adds a useful orientation detail: the dog park is located in Hanna Park just off Dufferin Avenue.</p><p>Quinte West also publishes specific dog-park rules that make this page more actionable for visitors. Dogs must be licensed, handlers must have a leash and remain present with their dogs inside the park, dogs must be on leash when entering and exiting, and owners must remove dogs at the first sign of aggression. The City also says puppies under five months are not allowed, female dogs in heat are prohibited, flat collars are required, children under six are not allowed in the park, children aged 6 to 15 must be accompanied by an adult, and a maximum of two dogs per handler is permitted. Those source-backed rules are more useful than older unsupported claims about fixed amenities that the official page does not fully detail.</p>";
  const notes = "<p>Primary sources reviewed August 15, 2026: https://quintewest.ca/parks-facilities/parks/hanna-park/, https://quintewest.ca/parks-facilities/parks/park-directory/, and https://quintewest.ca/community-services/animals-pets/. These sources support the Hanna Park location at 169 Creswell Drive, the fully enclosed Kinsmen Community Dog Park, free parking at Hanna Park, the off-leash area's placement just off Dufferin Avenue, and Quinte West's current dog-park rules and licensing requirement.</p>";

  park.name = "Kinsmen Community Dog Park";
  park.title = "Kinsmen Community Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Quinte West"],
    Province: ["Ontario"],
    Tags: ["leash-free", "fully-enclosed", "trails", "hanna-park"]
  };

  Object.assign(park.raw, {
    "Park Name": "Kinsmen Community Dog Park",
    "Park Header": "Kinsmen Community Dog Park",
    "Description": body,
    "Street Address": "169 Creswell Dr.",
    "latitude": "",
    "longitude": "",
    "City": "Quinte West",
    "Province": "Ontario",
    "Postal Code": "",
    "Fenced": "Yes - fully enclosed",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "",
    "Size": "Within Hanna Park's 42-acre setting",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes - verify in the enclosure on arrival",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - free parking available throughout Hanna Park",
    "Washrooms nearby": "Portable washrooms in Hanna Park from May 1 to Thanksgiving Day",
    "Operating hours": "Hanna Park open daily from dusk to dawn",
    "Seasonal Restrictions": "Portable washrooms open from May 1 to Thanksgiving Day; otherwise verify posted signage",
    "Park Website or Source": "https://quintewest.ca/parks-facilities/parks/hanna-park/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=169+Creswell+Drive+Trenton+ON",
    "Tags": "leash-free,fully-enclosed,trails,hanna-park",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "kinsmen-dog-park-quinte-west");
  if (!targetRow) throw new Error("Kinsmen Quinte West park CSV row not found.");

  const updates = {
    "Park Name": "Kinsmen Community Dog Park",
    "Park Header": "Kinsmen Community Dog Park",
    "Description": "<p>The main quality fix on this page is replacing generic dog-park filler with the stronger location and rules detail Quinte West actually publishes. The City's current Hanna Park page identifies the off-leash area as Kinsmen Community Dog Park and says Hanna Park is a 42-acre park at 169 Creswell Drive in Trenton. The same page describes the dog park as fully enclosed and places it within a larger park setting that includes marked nature trails, tennis courts, a playground, and seasonal portable washrooms open from May 1 to Thanksgiving Day. It also adds a useful orientation detail: the dog park is located in Hanna Park just off Dufferin Avenue.</p><p>Quinte West also publishes specific dog-park rules that make this page more actionable for visitors. Dogs must be licensed, handlers must have a leash and remain present with their dogs inside the park, dogs must be on leash when entering and exiting, and owners must remove dogs at the first sign of aggression. The City also says puppies under five months are not allowed, female dogs in heat are prohibited, flat collars are required, children under six are not allowed in the park, children aged 6 to 15 must be accompanied by an adult, and a maximum of two dogs per handler is permitted. Those source-backed rules are more useful than older unsupported claims about fixed amenities that the official page does not fully detail.</p>",
    "Street Address": "169 Creswell Dr.",
    "latitude": "",
    "longitude": "",
    "City": "Quinte West",
    "Province": "Ontario",
    "Postal Code": "",
    "Fenced": "Yes - fully enclosed",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "",
    "Size": "Within Hanna Park's 42-acre setting",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Yes - verify in the enclosure on arrival",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - free parking available throughout Hanna Park",
    "Washrooms nearby": "Portable washrooms in Hanna Park from May 1 to Thanksgiving Day",
    "Operating hours": "Hanna Park open daily from dusk to dawn",
    "Seasonal Restrictions": "Portable washrooms open from May 1 to Thanksgiving Day; otherwise verify posted signage",
    "Park Website or Source": "https://quintewest.ca/parks-facilities/parks/hanna-park/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=169+Creswell+Drive+Trenton+ON",
    "Tags": "leash-free,fully-enclosed,trails,hanna-park",
    "Notes / Comments": "<p>Primary sources reviewed August 15, 2026: https://quintewest.ca/parks-facilities/parks/hanna-park/, https://quintewest.ca/parks-facilities/parks/park-directory/, and https://quintewest.ca/community-services/animals-pets/. These sources support the Hanna Park location at 169 Creswell Drive, the fully enclosed Kinsmen Community Dog Park, free parking at Hanna Park, the off-leash area's placement just off Dufferin Avenue, and Quinte West's current dog-park rules and licensing requirement.</p>",
    "Intro Paragraph": "<p>Kinsmen Community Dog Park is located inside Hanna Park in Trenton, part of Quinte West. The City says Hanna Park is a 42-acre park at 169 Creswell Drive with free parking, marked nature trails, and a fully enclosed off-leash dog park.</p>",
    "Media": "",
    "Reviewed On": "Sat Aug 15 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Kinsmen Community Dog Park | Quinte West, ON | LeashFree.ca",
    "Meta Description": "Source-backed guide to Kinsmen Community Dog Park in Quinte West, covering its Hanna Park location at 169 Creswell Drive, fully enclosed off-leash setup, free parking, nearby trails, and published dog-park rules.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/kinsmen-dog-park-quinte-west/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/kinsmen-dog-park-quinte-west/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Kinsmen Community Dog Park and refreshed backlog files.");
