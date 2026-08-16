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
  const line = '  "lions-park": "/images/dog-parks/lions-park-ajax-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "lloydminster-off-leash-dog-park": "/images/dog-parks/lloydminster-off-leash-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "lions-park");
  if (!park) throw new Error("Ajax Lions Park record not found.");

  const seoTitle = "Lions Park Leash-Free Dog Park | Ajax, ON | LeashFree.ca";
  const metaDescription = "Source-backed guide to Lions Park in Ajax, covering the Town's current leash-free dog park reference at 430 Westney Road South and the current source inconsistency across Ajax's dog-park pages.";
  const intro = "<p>Lions Park is currently referenced by the Town of Ajax as a leash-free dog park at 430 Westney Road South. Because Ajax's current public dog-park sources are inconsistent, this page is written conservatively around the facts the Town clearly publishes today.</p>";
  const body = "<p>The strongest current Town source for this page is Ajax's current dog waste container locations page, which explicitly lists <em>Lions Park Leash-Free Dog Park – 430 Westney Road South</em> in Ward 3. That gives this page a firm current address and confirms that the Town still recognizes Lions Park as a leash-free dog park location. The same Town ecosystem also places Lions Park in south Ajax outdoor-route content, which helps confirm the broader park and trail context around this area.</p><p>There is, however, a source-quality issue that matters. Ajax's current outdoor parks page, reviewed on August 16, 2026, says the Town has \"four designated off-leash areas\" but then lists five entries and does not include Lions Park among them. That means the Town's own current public pages are not perfectly synchronized. Rather than guess, this rewrite keeps the page tightly scoped to what is directly supported: Lions Park is currently named by the Town as a leash-free dog park at 430 Westney Road South, and visitors should use the Town's current maps and on-site signage to confirm the exact off-leash area layout when they arrive.</p><p>Because the Town does not clearly publish detailed amenity information for the leash-free section on the pages reviewed here, earlier unsupported claims about size, fencing, water, benches, washrooms and hours have been removed. If you are planning a visit, the Town's parks and facilities map, pet-waste container listings and south-Ajax outdoor pages are the best current official references to cross-check before you go.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://ajax.ca/life-in-ajax/town-services/garbage-recycling/ and https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/. These sources support the current Town reference to Lions Park Leash-Free Dog Park at 430 Westney Road South and the south Ajax outdoor context. The outdoor page currently contains an internal inconsistency because it states Ajax has four designated off-leash areas while listing five entries and omitting Lions Park.</p>";

  park.title = "Lions Park Leash-Free Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Ajax"],
    Province: ["Ontario"],
    Tags: ["leash-free", "south-ajax", "source-inconsistency", "town-listed"]
  };

  Object.assign(park.raw, {
    "Park Name": "Lion's Park",
    "Park Header": "Lions Park Leash-Free Dog Park",
    "Description": body,
    "Street Address": "430 Westney Road South",
    "latitude": "",
    "longitude": "",
    "City": "Ajax",
    "Province": "Ontario",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "Unknown",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - pet waste container listed by Town",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://ajax.ca/life-in-ajax/town-services/garbage-recycling/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=430+Westney+Road+South+Ajax+ON",
    "Tags": "leash-free,south-ajax,source-inconsistency,town-listed",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "lions-park");
  if (!targetRow) throw new Error("Ajax Lions Park CSV row not found.");
  const updates = {
    "Park Name": "Lion's Park",
    "Park Header": "Lions Park Leash-Free Dog Park",
    "Description": "<p>The strongest current Town source for this page is Ajax's current dog waste container locations page, which explicitly lists <em>Lions Park Leash-Free Dog Park – 430 Westney Road South</em> in Ward 3. That gives this page a firm current address and confirms that the Town still recognizes Lions Park as a leash-free dog park location. The same Town ecosystem also places Lions Park in south Ajax outdoor-route content, which helps confirm the broader park and trail context around this area.</p><p>There is, however, a source-quality issue that matters. Ajax's current outdoor parks page, reviewed on August 16, 2026, says the Town has \"four designated off-leash areas\" but then lists five entries and does not include Lions Park among them. That means the Town's own current public pages are not perfectly synchronized. Rather than guess, this rewrite keeps the page tightly scoped to what is directly supported: Lions Park is currently named by the Town as a leash-free dog park at 430 Westney Road South, and visitors should use the Town's current maps and on-site signage to confirm the exact off-leash area layout when they arrive.</p><p>Because the Town does not clearly publish detailed amenity information for the leash-free section on the pages reviewed here, earlier unsupported claims about size, fencing, water, benches, washrooms and hours have been removed. If you are planning a visit, the Town's parks and facilities map, pet-waste container listings and south-Ajax outdoor pages are the best current official references to cross-check before you go.</p>",
    "Street Address": "430 Westney Road South",
    "latitude": "",
    "longitude": "",
    "City": "Ajax",
    "Province": "Ontario",
    "Postal Code": "",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "Unknown",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - pet waste container listed by Town",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "",
    "Park Website or Source": "https://ajax.ca/life-in-ajax/town-services/garbage-recycling/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=430+Westney+Road+South+Ajax+ON",
    "Tags": "leash-free,south-ajax,source-inconsistency,town-listed",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://ajax.ca/life-in-ajax/town-services/garbage-recycling/ and https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/. These sources support the current Town reference to Lions Park Leash-Free Dog Park at 430 Westney Road South and the south Ajax outdoor context. The outdoor page currently contains an internal inconsistency because it states Ajax has four designated off-leash areas while listing five entries and omitting Lions Park.</p>",
    "Intro Paragraph": "<p>Lions Park is currently referenced by the Town of Ajax as a leash-free dog park at 430 Westney Road South. Because Ajax's current public dog-park sources are inconsistent, this page is written conservatively around the facts the Town clearly publishes today.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Lions Park Leash-Free Dog Park | Ajax, ON | LeashFree.ca",
    "Meta Description": "Source-backed guide to Lions Park in Ajax, covering the Town's current leash-free dog park reference at 430 Westney Road South and the current source inconsistency across Ajax's dog-park pages.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/lions-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/lions-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Lions Park Ajax and refreshed backlog files.");
