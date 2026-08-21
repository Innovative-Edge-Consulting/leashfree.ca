import fs from "node:fs";

const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const backlogPath = "reports/thin-page-backlog.csv";
const reviewPath = "reports/content-review-queue.csv";
const summaryPath = "reports/thin-page-backlog-summary.md";
const slug = "diamond-jubilee-park";
const route = `/dog-parks/${slug}/`;

function parseCsv(text) {
  const rows = []; let row = []; let value = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i], next = text[i + 1];
    if (quoted) { if (char === '"' && next === '"') { value += '"'; i += 1; } else if (char === '"') quoted = false; else value += char; }
    else if (char === '"') quoted = true;
    else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value.length || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function stringifyCsv(rows) {
  return `${rows.map((row) => row.map((value) => {
    const text = String(value ?? ""); return /[\",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

const seoTitle = "Diamond Jubilee Park | Ottawa, ON | LeashFree.ca";
const metaDescription = "Current Ottawa source-backed note for Diamond Jubilee Park: it is a City park in Findlay Creek, but Ottawa's current dogs-in-parks designation map does not identify it as an off-leash area.";
const intro = "<p>Diamond Jubilee Park is a City of Ottawa park in the <strong>Findlay Creek</strong> area, but Ottawa's current dogs-in-parks designation map does <strong>not</strong> identify it as a designated off-leash area. For a dog visit, treat it as an <strong>on-leash</strong> park unless onsite signs say otherwise.</p>";
const body = "<p>This route needed an integrity correction rather than a routine dog-park expansion. The previous entry described Diamond Jubilee Park as a small fenced leash-free area, but that claim was not supported by the current City of Ottawa dog-park record reviewed on <strong>August 20, 2026</strong>. Ottawa's official dogs-in-parks program uses three designations: Dogs Allowed (off leash), Dogs on Leash, and No Dogs. The current City map does not identify Diamond Jubilee Park as a Dogs Allowed location.</p><p>That distinction matters. Ottawa says dogs must always be under their handler's control, and its current policy treats off-leash access as a site-specific designation rather than a general park permission. Dogs must also stay at least <strong>five metres</strong> from children's play areas and pools. The City's current park guidance says parks are generally open daily from <strong>5 a.m. to 11 p.m.</strong>, unless otherwise posted.</p><p>Diamond Jubilee Park remains a legitimate Findlay Creek green-space stop for an on-leash walk. The useful, accurate takeaway is simply that it should not be represented as a verified off-leash dog park. For an Ottawa off-leash outing, use the City's live dogs-in-parks map and confirm the designation and posted signage before letting a dog run free.</p>";
const notes = "<p>Primary sources reviewed on Thursday, August 20, 2026: https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/dogs-parks for the current Ottawa dogs-in-parks designation rules and five-metre restriction near play areas and pools; https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/map-dogs-parks for the live City designation map, checked for Diamond Jubilee Park and not confirming an off-leash designation; https://www.arcgis.com/home/item.html?id=d44989a0579648df8666f27a30aa40f2 for the City map's July 2026 update; and https://ottawa.ca/en/recreation-and-parks/facilities-and-rentals/parks-and-green-space for current general park hours. These sources do not support the old leash-free claim.</p>";

function apply(park) {
  park.title = "Diamond Jubilee Park | Ottawa";
  park.seoTitle = seoTitle; park.metaDescription = metaDescription; park.description = intro; park.body = body; park.media = [];
  park.references = { City: ["Ottawa"], Province: ["Ontario"], Tags: ["integrity-correction", "ottawa", "findlay-creek", "dogs-on-leash"] };
  Object.assign(park.raw, {
    "Park Name": "Diamond Jubilee Park", "Park Header": "Diamond Jubilee Park | Ottawa", "Park type": "City Park", Description: body,
    "Street Address": "Findlay Creek Drive and Kelly Farm Drive area", latitude: "45.31485075316768", longitude: "-75.61040700389731", City: "Ottawa", Province: "Ontario", "Postal Code": "",
    Fenced: "No off-leash area confirmed", "Separate Small Dog Area": "No", "Surface type": "Grass and neighbourhood park landscaping", Size: "Neighbourhood park", "Water source available": "Unknown - verify on arrival", Benches: "Unknown - verify on arrival", "Shaded area": "Unknown - verify on arrival", "Waste bins": "Unknown - verify on arrival", "Bag Dispensers": "No off-leash area confirmed", "Parking Available": "Street parking nearby", "Washrooms nearby": "Unknown", "Operating hours": "5 a.m. to 11 p.m. unless otherwise posted", "Seasonal Restrictions": "Dogs must remain on leash unless a park is specifically designated for off-leash use; keep dogs 5 metres from play areas and pools", "Park Website or Source": "https://ottawa.ca/en/recreation-and-parks/parks-and-green-space/dog-parks/map-dogs-parks", "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Diamond+Jubilee+Park+Ottawa+ON", Tags: "integrity-correction,ottawa,findlay-creek,dogs-on-leash", "Notes / Comments": notes, "Intro Paragraph": intro, Media: "", "Reviewed On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)", "Meta Title": seoTitle, "Meta Description": metaDescription, "Updated On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)"
  });
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8")); const park = parks.find((entry) => entry.slug === slug); if (!park) throw new Error("Diamond Jubilee Park record not found."); apply(park); fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);
const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8")); const headers = csvRows[0]; const target = csvRows.find((row, index) => index && row[headers.indexOf("slug")] === slug); if (!target) throw new Error("Diamond Jubilee Park CSV row not found."); const csvPark = { raw: {} }; apply(csvPark); for (const [field, value] of Object.entries(csvPark.raw)) { const index = headers.indexOf(field); if (index >= 0) target[index] = value; } fs.writeFileSync(csvPath, stringifyCsv(csvRows));

function filterRoute(path) { const rows = parseCsv(fs.readFileSync(path, "utf8")); const index = rows[0].indexOf("route"); const filtered = [rows[0], ...rows.slice(1).filter((row) => row[index] !== route)]; fs.writeFileSync(path, stringifyCsv(filtered)); return filtered; }
const backlog = filterRoute(backlogPath); filterRoute(reviewPath); const fields = backlog[0]; const data = backlog.slice(1).map((row) => Object.fromEntries(fields.map((field, index) => [field, row[index] ?? ""]))); const counts = (field) => [...data.reduce((map, row) => map.set(row[field] || "", (map.get(row[field] || "") || 0) + 1), new Map()).entries()].sort((a, b) => b[1] - a[1]).map(([key, count]) => `| ${key} | ${count} |`).join("\n"); const top = data.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n"); fs.writeFileSync(summaryPath, `# Thin Page Improvement Backlog\n\nGenerated from \`reports/content-health.json\` on 2026-07-22.\n\nThis backlog contains ${data.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.\n\n## Backlog counts\n\n| Tier | Pages |\n| --- | ---: |\n${counts("tier")}\n\n| Content type | Pages |\n| --- | ---: |\n${counts("contentType")}\n\n## Prioritization\n\n- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.\n- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.\n- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.\n- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.\n\nDo not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.\n\n## First 50 pages\n\n| # | Tier | Type | Page | Score | Words | Missing source |\n| ---: | --- | --- | --- | ---: | ---: | --- |\n${top}\n`);
console.log("Updated Diamond Jubilee Park and refreshed backlog files.");
