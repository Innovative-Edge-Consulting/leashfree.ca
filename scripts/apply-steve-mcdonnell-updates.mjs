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

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  const line = '  "steve-mcdonnell": "/images/dog-parks/steve-mcdonnell-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "stocking-creek-park-ladysmith": "/images/dog-parks/stocking-creek-park-ladysmith-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${line}${anchor}`));
}

function getContent() {
  const seoTitle = "Steve McDonnell Leash Free Dog Park | Grimsby, ON | LeashFree.ca";
  const metaDescription =
    "Source-backed guide to Steve McDonnell Leash Free Dog Park in Grimsby, including the official 170 Lake Street location, current town rule set, limited onsite parking, April 4, 2025 maintenance reopening note, and the town's conflicting published hours.";
  const intro =
    "<p>Steve McDonnell Leash Free Dog Park is one of the Town of Grimsby's three official leash-free dog parks. Current town pages place it at <strong>170 Lake Street</strong> and describe it as a local place for dogs to run and meet other dog families.</p>";
  const body =
    "<p>The previous version of this page overstated details the town does not currently publish. Grimsby's dedicated leash-free dog parks page confirms Steve McDonnell as one of the municipality's three official off-leash locations, while the broader parks and tourism pages add two practical details that are actually useful on arrival: the park is at <strong>170 Lake Street</strong> and it has <strong>limited parking onsite</strong>. That is a stronger and more defensible description than generic claims about fencing, water service, or other amenities that the town pages do not currently verify.</p><p>The current operating-hours picture is slightly inconsistent across town sources, so it should be stated clearly rather than smoothed over. The dedicated leash-free dog parks page and Grimsby's animal-services page both say leash-free parks are open <strong>7 a.m. to 9 p.m.</strong>. Broader park-listing pages, including the parks-and-pavilions page and the tourism page, still describe Steve McDonnell as open <strong>7 a.m. until dusk</strong>. For this page, the dog-park-specific rules page is the stronger current source, but visitors should still expect posted signage onsite to control if hours differ seasonally.</p><p>The town also provides a current behaviour and compliance framework for all three leash-free parks. Dogs must have valid licence tags and up-to-date vaccinations and rabies shots. Owners must leash dogs when entering and exiting, keep them within sight and under verbal control, pick up waste, and prevent wildlife chasing or hole digging. Puppies under four months, female dogs in heat, sick dogs, and aggressive dogs are not permitted, and children must be supervised by an adult. There is also a useful recent maintenance note: in a public notice published on <strong>April 4, 2025</strong>, the Town of Grimsby said the <strong>large dog section</strong> at Steve McDonnell Park had reopened after maintenance was completed. That notice supports the existence of multiple sections at the site, but the town pages reviewed here do not provide a current small-dog/large-dog layout description beyond that reopening notice.</p><p>This update improves the page by correcting the address, removing unsupported amenity claims, preserving the published hours discrepancy, and anchoring the content in the Town of Grimsby's current park and animal-services guidance.</p>";
  const notes =
    "<p>Primary sources reviewed on Monday, August 17, 2026: https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/leash-free-dog-parks/ ; https://www.grimsby.ca/town-hall/municipal-law-enforcement/animal-services/ ; https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/parks-and-pavilions/ ; https://www.grimsby.ca/living-in/things-to-do-in-grimsby/ ; and the Town of Grimsby news listing that includes the April 4, 2025 notice &quot;Public Notice: Steve McDonnell Park is open&quot;. These sources support the official park status, 170 Lake Street location, limited onsite parking, current dog-park rules, the published hours discrepancy, and the April 4, 2025 maintenance reopening note for the large dog section.</p>";
  return { seoTitle, metaDescription, intro, body, notes };
}

function applyParkFields(park) {
  const { seoTitle, metaDescription, intro, body, notes } = getContent();

  park.title = "Steve McDonnell Leash Free Dog Park";
  park.seoTitle = seoTitle;
  park.metaDescription = metaDescription;
  park.description = intro;
  park.body = body;
  park.media = [];
  park.references = {
    City: ["Grimsby"],
    Province: ["Ontario"],
    Tags: ["leash-free", "official-town-park", "limited-parking", "lake-street"],
  };

  Object.assign(park.raw, {
    "Park Name": "Steve McDonnell Leash Free Dog Park",
    "Park Header": "Steve McDonnell Leash Free Dog Park",
    "Description": body,
    "Street Address": "170 Lake Street",
    "latitude": "",
    "longitude": "",
    City: "Grimsby",
    Province: "Ontario",
    "Postal Code": "",
    Fenced: "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    Size: "Neighbourhood leash-free dog park",
    "Water source available": "Unknown",
    Benches: "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - limited parking onsite",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Town sources conflict: leash-free and animal-services pages say 7 a.m. to 9 p.m.; broader park pages say 7 a.m. to dusk",
    "Seasonal Restrictions": "Check current posted signage and town notices before visiting",
    "Park Website or Source": "https://www.grimsby.ca/parks-recreation-and-culture/parks-sports-fields-and-trails/leash-free-dog-parks/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=170+Lake+Street+Grimsby+ON",
    Tags: "leash-free,official-town-park,limited-parking,lake-street",
    "Notes / Comments": notes,
    "Intro Paragraph": intro,
    Media: "",
    "Reviewed On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
    "Meta Title": seoTitle,
    "Meta Description": metaDescription,
    "Updated On": "Mon Aug 17 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  });
}

function updateParksJson() {
  const parks = JSON.parse(fs.readFileSync(parksJsonPath, "utf8"));
  const park = parks.find((entry) => entry.slug === "steve-mcdonnell");
  if (!park) throw new Error("Steve McDonnell record not found.");
  applyParkFields(park);
  fs.writeFileSync(parksJsonPath, `${JSON.stringify(parks, null, 2)}\n`);
}

function updateParkCsv() {
  const rows = parseCsv(fs.readFileSync(parkCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "steve-mcdonnell");
  if (!targetRow) throw new Error("Steve McDonnell CSV row not found.");

  const park = { raw: {} };
  applyParkFields(park);
  const updates = park.raw;
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/steve-mcdonnell/")];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));

  const bodyRows = filtered
    .slice(1)
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  const countBy = (field) =>
    [...bodyRows
      .reduce((map, row) => {
        const key = row[field] || "";
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map())
      .entries()].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier")
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join("\n");
  const sectionRows = countBy("contentType")
    .map(([key, count]) => `| ${key} | ${count} |`)
    .join("\n");
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/steve-mcdonnell/")];
  fs.writeFileSync(reviewQueueCsvPath, stringifyCsv(filtered));
}

updateOverridesFile();
updateParksJson();
updateParkCsv();
updateBacklogFiles();
updateReviewQueue();

console.log("Updated Steve McDonnell and refreshed backlog files.");
