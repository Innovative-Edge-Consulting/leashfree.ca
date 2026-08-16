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
  const line = '  "park-n-bark-off-leash-dog-area": "/images/dog-parks/park-n-bark-off-leash-dog-area-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "paul-mostoway-dog-park": "/images/dog-parks/paul-mostoway-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${anchor}${line}`));
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "park-n-bark-off-leash-dog-area");
  if (!park) throw new Error("Park 'n' Bark record not found.");

  const seoTitle = "Park 'n' Bark Off-Leash Dog Area | Lethbridge, AB | LeashFree.ca";
  const metaDescription = "Source-backed guide to Park 'n' Bark in Lethbridge, covering the Scenic Drive North and Stafford Drive North location, the roughly 5.5-acre fenced layout, paved loop pathway, hills, agility equipment, accessible seating, and recent city improvement work.";
  const intro = "<p>Park 'n' Bark is one of the City of Lethbridge's official off-leash dog parks, located at the corner of Scenic Drive North and Stafford Drive North. The current city dog-park guide describes it as a fenced site of about 5.5 acres with a paved pathway loop, hills, agility equipment, and accessible seating areas.</p>";
  const body = "<p>This page needed a factual rebuild because the older stub used unsupported address details and treated Park 'n' Bark as a small generic run. Lethbridge's current dog parks page gives a much clearer description: Park 'n' Bark sits at the corner of Scenic Drive North and Stafford Drive North, it is fenced, and it covers about 5.5 acres. The city also identifies the key visitor-facing features that matter most for trip planning: a paved pathway loop, rolling hills, agility equipment, and accessible seating areas.</p><p>Recent city notices add useful current context that the old page missed. In May 2023, Lethbridge announced new toys, agility equipment, and shade structures for Park 'n' Bark, specifically naming weave poles, tunnels, hoop jumps, and umbrella shades. That same notice said both the small dog area and the main area were getting equipment, which is stronger evidence for a separate small-dog section than the older page's unsupported \"No\" field. Later in November 2023, the city temporarily closed the park for installation of light poles and bases and for gate-latch work, then returned to finish the lighting project with fixture installation. Those updates matter because they show Park 'n' Bark has continued to receive infrastructure investment rather than sitting as an outdated static listing.</p><p>Current Lethbridge etiquette rules also apply here. The city says dogs must remain on leash in public spaces unless they are inside an off-leash area, aggressive dogs are not allowed, handlers are responsible for respecting the safety of others, dogs should stay on leash until past the marker signs because these areas exist within shared park spaces, and waste cleanup is required. This update replaces thin filler with what Lethbridge actually publishes now: the current location, scale, surfaced loop, equipment, accessibility features, and the city's current operating guidance for safe use.</p>";
  const notes = "<p>Primary sources reviewed August 16, 2026: https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/ ; https://www.lethbridge.ca/news/posts/the-park-n-bark-is-getting-toys/ ; https://www.lethbridge.ca/news/posts/park-n-bark-upcoming-closure/ ; and https://www.lethbridge.ca/news/posts/park-n-bark-lighting-closure/ . These sources support the Scenic Drive North and Stafford Drive North location, the roughly 5.5-acre fenced layout, paved pathway loop, hills, agility equipment, accessible seating areas, separate small-dog-area equipment work, and the late-2023 lighting and gate-latch project.</p>";

  park.title = "Park 'n' Bark Off-Leash Dog Area";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Lethbridge"],
    Province: ["Alberta"],
    Tags: ["off-leash", "fenced", "paved-loop", "agility-equipment"]
  };

  Object.assign(park.raw, {
    "Park Name": "Park ’n’ Bark Off-Leash Dog Area",
    "Park Header": "Park 'n' Bark Off-Leash Dog Area",
    "Description": body,
    "Street Address": "Corner of Scenic Drive North and Stafford Drive North",
    "latitude": "",
    "longitude": "",
    "City": "Lethbridge",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Yes",
    "Surface type": "Grass and paved pathway loop",
    "Size": "About 5.5 acres",
    "Water source available": "Unknown",
    "Benches": "Yes - accessible seating areas",
    "Shaded area": "Yes - shade structures added in 2023",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Temporary closures may occur for maintenance or park improvement work",
    "Park Website or Source": "https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Scenic+Drive+North+and+Stafford+Drive+North+Lethbridge+AB",
    "Tags": "off-leash,fenced,paved-loop,agility-equipment",
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
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "park-n-bark-off-leash-dog-area");
  if (!targetRow) throw new Error("Park 'n' Bark CSV row not found.");
  const updates = {
    "Park Name": "Park ’n’ Bark Off-Leash Dog Area",
    "Park Header": "Park 'n' Bark Off-Leash Dog Area",
    "Description": "<p>This page needed a factual rebuild because the older stub used unsupported address details and treated Park 'n' Bark as a small generic run. Lethbridge's current dog parks page gives a much clearer description: Park 'n' Bark sits at the corner of Scenic Drive North and Stafford Drive North, it is fenced, and it covers about 5.5 acres. The city also identifies the key visitor-facing features that matter most for trip planning: a paved pathway loop, rolling hills, agility equipment, and accessible seating areas.</p><p>Recent city notices add useful current context that the old page missed. In May 2023, Lethbridge announced new toys, agility equipment, and shade structures for Park 'n' Bark, specifically naming weave poles, tunnels, hoop jumps, and umbrella shades. That same notice said both the small dog area and the main area were getting equipment, which is stronger evidence for a separate small-dog section than the older page's unsupported \"No\" field. Later in November 2023, the city temporarily closed the park for installation of light poles and bases and for gate-latch work, then returned to finish the lighting project with fixture installation. Those updates matter because they show Park 'n' Bark has continued to receive infrastructure investment rather than sitting as an outdated static listing.</p><p>Current Lethbridge etiquette rules also apply here. The city says dogs must remain on leash in public spaces unless they are inside an off-leash area, aggressive dogs are not allowed, handlers are responsible for respecting the safety of others, dogs should stay on leash until past the marker signs because these areas exist within shared park spaces, and waste cleanup is required. This update replaces thin filler with what Lethbridge actually publishes now: the current location, scale, surfaced loop, equipment, accessibility features, and the city's current operating guidance for safe use.</p>",
    "Street Address": "Corner of Scenic Drive North and Stafford Drive North",
    "latitude": "",
    "longitude": "",
    "City": "Lethbridge",
    "Province": "Alberta",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Yes",
    "Surface type": "Grass and paved pathway loop",
    "Size": "About 5.5 acres",
    "Water source available": "Unknown",
    "Benches": "Yes - accessible seating areas",
    "Shaded area": "Yes - shade structures added in 2023",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "",
    "Seasonal Restrictions": "Temporary closures may occur for maintenance or park improvement work",
    "Park Website or Source": "https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Scenic+Drive+North+and+Stafford+Drive+North+Lethbridge+AB",
    "Tags": "off-leash,fenced,paved-loop,agility-equipment",
    "Notes / Comments": "<p>Primary sources reviewed August 16, 2026: https://www.lethbridge.ca/parks-leisure-recreation/parks-and-playgrounds/dog-parks/ ; https://www.lethbridge.ca/news/posts/the-park-n-bark-is-getting-toys/ ; https://www.lethbridge.ca/news/posts/park-n-bark-upcoming-closure/ ; and https://www.lethbridge.ca/news/posts/park-n-bark-lighting-closure/ . These sources support the Scenic Drive North and Stafford Drive North location, the roughly 5.5-acre fenced layout, paved pathway loop, hills, agility equipment, accessible seating areas, separate small-dog-area equipment work, and the late-2023 lighting and gate-latch project.</p>",
    "Intro Paragraph": "<p>Park 'n' Bark is one of the City of Lethbridge's official off-leash dog parks, located at the corner of Scenic Drive North and Stafford Drive North. The current city dog-park guide describes it as a fenced site of about 5.5 acres with a paved pathway loop, hills, agility equipment, and accessible seating areas.</p>",
    "Media": "",
    "Reviewed On": "Sun Aug 16 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": "Park 'n' Bark Off-Leash Dog Area | Lethbridge, AB | LeashFree.ca",
    "Meta Description": "Source-backed guide to Park 'n' Bark in Lethbridge, covering the Scenic Drive North and Stafford Drive North location, the roughly 5.5-acre fenced layout, paved loop pathway, hills, agility equipment, accessible seating, and recent city improvement work.",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/park-n-bark-off-leash-dog-area/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/park-n-bark-off-leash-dog-area/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Park 'n' Bark and refreshed backlog files.");
