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
  const seoTitle = "Chief Whitecap Dog Park | Saskatoon, SK | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to Chief Whitecap Dog Park in Saskatoon, including its large rural-style off-leash setting, current north parking expansion, ongoing Great Trail work outside the dog park area, and city dog-park rules.";
  const intro =
    "<p>Chief Whitecap Dog Park is one of Saskatoon's large rural-style off-leash areas. The City currently groups it with its larger natural dog parks and says the construction that directly affected the dog park is complete, with an <strong>expanded north parking lot that added 22 spots</strong> and <strong>Great Trail work continuing outside the dog park area over the next two years</strong>.</p>";
  const body =
    "<p>The current Saskatoon dog parks page gives this route a stronger factual base than the old generic copy. Rather than describing Chief Whitecap only as a scenic riverside trail area, the City frames Saskatoon's dog parks as <strong>naturalized spaces</strong> and specifically identifies Chief Whitecap as one of the city's <strong>large rural dog parks</strong>. That matters because it tells visitors to expect an open, less urban off-leash experience rather than a small fenced neighbourhood enclosure.</p><p>The most important current operational detail is access. Saskatoon's dog parks page now says the construction that directly impacted <strong>Chief Whitecap Dog Park is complete</strong> and that the <strong>north parking lot was expanded by 22 spots</strong>. The same page adds that <strong>Great Trail work will continue outside the dog park area over the next two years</strong>, so visitors should still expect nearby project activity and should watch for posted signs around the broader park setting.</p><p>The wider city guidance also belongs on this page. Saskatoon says a <strong>valid dog licence</strong> is required to access any dog park, dogs must be <strong>under the control of their owner</strong>, and owners should keep them <strong>within sight at all times</strong>. The city's etiquette guidance says dogs should be <strong>leashed when entering and exiting</strong>, waste should be <strong>picked up</strong>, and nuisance behaviour should lead to the dog being restrained and removed from the off-leash area. Because Chief Whitecap is part of a naturalized river-valley setting, Saskatoon also reminds visitors that dog parks share space with <strong>wildlife</strong>.</p><p>There is also recent river-safety context worth preserving. On <strong>June 12, 2026</strong>, Saskatoon's service alerts said cautionary signage was in place at <strong>Chief Whitecap Park</strong> because of increased river speed and height in the area. That does not mean the same condition is always present, but it reinforces that this is a river-adjacent off-leash destination where seasonal water conditions and posted notices matter.</p><p>This update improves the page by replacing thin promotional language with Saskatoon's current description of Chief Whitecap as a large rural dog park, the confirmed parking expansion, the ongoing trail-work context outside the dog park area, and the city's active dog-park rules.</p>";
  const notes =
    "<p>Primary sources reviewed on Thursday, August 20, 2026: https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks for Saskatoon's current dog park rules, the naturalized-space framing, and the current note that Chief Whitecap Dog Park's direct construction impact is complete, the north parking lot gained 22 spaces, and Great Trail work continues outside the dog park area; https://www.saskatoon.ca/news-releases/upgrades-and-reminders-saskatoons-dog-parks for the May 28, 2024 City statement that Chief Whitecap is one of Saskatoon's large rural dog parks; and https://www.saskatoon.ca/service-alerts?service=service_alert_parks for the June 12, 2026 river-flow cautionary signage notice affecting Chief Whitecap Park.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Chief Whitecap Dog Park | Saskatoon";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Saskatoon"],
    Province: ["Saskatchewan"],
    Tags: ["off-leash", "rural-style", "naturalized", "river-valley", "parking"],
  };

  Object.assign(park.raw, {
    "Park Name": "Chief Whitecap Park",
    "Park Header": "Chief Whitecap Dog Park | Saskatoon",
    "Description": body,
    "Street Address": "Chief Whitecap Park, Saskatoon",
    latitude: "52.0697",
    longitude: "-106.7542",
    City: "Saskatoon",
    Province: "Saskatchewan",
    "Postal Code": "",
    Fenced: "Unknown - verify on arrival",
    "Separate Small Dog Area": "No separate small-dog area confirmed on current city pages",
    "Surface type": "Naturalized terrain",
    Size: "Large rural-style off-leash area",
    "Water source available": "Unknown - verify on arrival",
    Benches: "Unknown - verify on arrival",
    "Shaded area": "Unknown - verify on arrival",
    "Waste bins": "Unknown - verify on arrival",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - north parking lot expanded by 22 spots",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Verify posted hours on arrival",
    "Seasonal Restrictions": "River conditions and posted notices may affect nearby access; Great Trail work continues outside the dog park area",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Chief+Whitecap+Park+Saskatoon+SK",
    Tags: "off-leash,rural-style,naturalized,river-valley,parking",
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
  const park = parks.find((entry) => entry.slug === "chief-whitecap-park");
  if (!park) throw new Error("Chief Whitecap Park record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "chief-whitecap-park");
  if (!targetRow) throw new Error("Chief Whitecap Park CSV row not found.");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/chief-whitecap-park/")];
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/chief-whitecap-park/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Chief Whitecap Park and refreshed backlog files.");
