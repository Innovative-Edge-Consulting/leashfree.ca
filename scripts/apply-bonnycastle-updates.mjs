import fs from "node:fs";

const parksJsonPath = "src/data/generated/parks.json";
const parkCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
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
  return `${rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    )
    .join("\n")}\n`;
}

function getContent() {
  const seoTitle = "Bonnycastle Park Off-Leash Dog Area | Winnipeg, MB | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to Bonnycastle Park Off-Leash Dog Area in Winnipeg, including the fully fenced 0.12-hectare downtown site, artificial turf, lights, summer bottle-refill fountain, and Assiniboine Riverwalk context.";
  const intro =
    "<p>Bonnycastle Park is one of Winnipeg's clearest source-backed small urban dog parks. The City currently lists it at <strong>260 Assiniboine Ave</strong> as a <strong>fully fenced 0.12-hectare off-leash dog area</strong> with <strong>artificial turf</strong>, <strong>lights</strong>, <strong>signage</strong>, <strong>park furniture</strong>, a <strong>waste receptacle</strong>, and a <strong>bottle-refill fountain that operates in summer</strong>.</p>";
  const body =
    "<p>The current Winnipeg off-leash locations page gives Bonnycastle Park much stronger factual support than the older generic copy. Rather than describing it only as a scenic riverside stop, the City now spells out the exact feature set: this is a <strong>fully fenced downtown enclosure</strong> with <strong>artificial turf</strong>, <strong>lighting</strong>, <strong>signage</strong>, <strong>seating or park furniture for people</strong>, and a <strong>waste receptacle</strong>. The same official listing also sets the operating window at <strong>7 a.m. to 11 p.m.</strong> and notes that the <strong>bottle-refill fountain is operational in summer</strong>.</p><p>Winnipeg's November 16, 2017 project release adds useful context that still helps explain why this page matters. The City described Bonnycastle as <strong>Winnipeg's first downtown dog park</strong> and said the site was chosen from seven downtown candidates. That release also confirms that the finished design incorporated <strong>existing trees and park elements</strong>, added <strong>tree and shrub planting</strong>, and sits next to the <strong>Assiniboine Riverwalk</strong>, which gives visitors a practical on-leash walking option before or after off-leash time.</p><p>The Citywide Winnipeg off-leash rules are worth keeping directly on the page because they shape how a compact downtown park functions. Owners must be <strong>present and within view of their dog</strong>, keep dogs <strong>under voice control</strong>, carry a <strong>leash in hand at all times</strong>, and <strong>pick up feces and fill holes</strong>. <strong>Aggressive dogs</strong> and <strong>female dogs in heat</strong> are not allowed, and dogs using Winnipeg off-leash areas must be <strong>licensed</strong>. Those rules matter more at Bonnycastle because the enclosure is small and urban, with nearby pedestrian traffic and the riverwalk just outside the fence.</p><p>This update improves the page by replacing unsupported generic claims with Winnipeg's current official feature list, hours, and rules, plus the original City context that Bonnycastle opened as the city's first downtown dog park.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://legacy.winnipeg.ca/PublicWorks/Parks/off-leash-dog-areas-locations.stm for Bonnycastle Park's current official location, feature list, fencing status, size, fountain seasonality, and 7 a.m. to 11 p.m. hours; https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashAreas.stm for Winnipeg's current off-leash rules; and https://legacy.winnipeg.ca/cao/media/news/nr_2017/nr_20171116.stm for the original downtown dog park opening context, Assiniboine Riverwalk note, and design details.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Bonnycastle Park Off-Leash Dog Area | Winnipeg";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Winnipeg"],
    Province: ["Manitoba"],
    Tags: ["off-leash", "downtown", "fully-fenced", "artificial-turf", "riverwalk"],
  };

  Object.assign(park.raw, {
    "Park Name": "Bonnycastle Park",
    "Park Header": "Bonnycastle Park Off-Leash Dog Area | Winnipeg",
    "Description": body,
    "Street Address": "260 Assiniboine Ave",
    latitude: "49.883497",
    longitude: "-97.141887",
    City: "Winnipeg",
    Province: "Manitoba",
    "Postal Code": "R3C 0P1",
    Fenced: "Yes - fully fenced",
    "Separate Small Dog Area": "No",
    "Surface type": "Artificial turf",
    Size: "0.12 hectare",
    "Water source available": "Yes - bottle-refill fountain in summer",
    Benches: "Yes - park furniture for people",
    "Shaded area": "Some tree cover",
    "Waste bins": "Yes - waste receptacle",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - downtown arrival varies by trip",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7:00 a.m. to 11:00 p.m.",
    "Seasonal Restrictions": "Bottle-refill fountain operates in summer",
    "Park Website or Source": "https://legacy.winnipeg.ca/PublicWorks/Parks/off-leash-dog-areas-locations.stm",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=260+Assiniboine+Ave+Winnipeg+MB",
    Tags: "off-leash,downtown,fully-fenced,artificial-turf,riverwalk",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    Media: "",
    "Reviewed On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  });
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "bonnycastle-park");
  if (!park) throw new Error("Bonnycastle Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "bonnycastle-park");
  if (!targetRow) throw new Error("Bonnycastle Park CSV row not found.");
  const park = { raw: {} };
  applyParkFields(park);
  for (const [field, value] of Object.entries(park.raw)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }
  fs.writeFileSync(parkCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/bonnycastle-park/")];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));

  const bodyRows = filtered
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));

  const countBy = (field) =>
    [...bodyRows.reduce((map, row) => {
      const key = row[field] || "";
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map()).entries()].sort((a, b) => b[1] - a[1]);

  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = bodyRows
    .slice(0, 50)
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`,
    )
    .join("\n");

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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/bonnycastle-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Bonnycastle Park and refreshed backlog files.");
