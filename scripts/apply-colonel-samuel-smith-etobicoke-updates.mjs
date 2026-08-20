import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const parksPath = path.join(root, "src/data/generated/parks.json");
const parkCsvPath = path.join(
  root,
  "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv",
);
const overridesPath = path.join(root, "src/data/dog-park-image-overrides.js");
const backlogPath = path.join(root, "reports/thin-page-backlog.csv");
const backlogSummaryPath = path.join(root, "reports/thin-page-backlog-summary.md");
const reviewQueuePath = path.join(root, "reports/content-review-queue.csv");

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function stringifyCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((field = "") => {
          const text = String(field);
          const escaped = text.replace(/"/g, '""');
          return /[",\n\r]/.test(text) ? `"${escaped}"` : escaped;
        })
        .join(","),
    )
    .join("\n") + "\n";
}

function updateCsvRow(csvPath, keyField, keyValue, updates) {
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const header = rows[0];
  const keyIndex = header.indexOf(keyField);
  if (keyIndex === -1) throw new Error(`CSV field not found: ${keyField}`);
  const row = rows.find((entry, index) => index > 0 && entry[keyIndex] === keyValue);
  if (!row) throw new Error(`CSV row not found for ${keyField}=${keyValue}`);
  for (const [field, value] of Object.entries(updates)) {
    const index = header.indexOf(field);
    if (index === -1) throw new Error(`CSV field not found: ${field}`);
    row[index] = value;
  }
  fs.writeFileSync(csvPath, stringifyCsv(rows));
}

function removeCsvRow(csvPath, predicate) {
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const header = rows[0];
  const filtered = [header, ...rows.slice(1).filter((row) => !predicate(row, header))];
  fs.writeFileSync(csvPath, stringifyCsv(filtered));
}

function rebuildBacklogSummary() {
  const rows = parseCsv(fs.readFileSync(backlogPath, "utf8"));
  const headers = rows[0];
  const bodyRows = rows
    .slice(1)
    .filter((row) => row.some((value) => value !== ""))
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

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  const line = '  "colonel-samuel-smith-park-etobicoke": "/images/dog-parks/colonel-samuel-smith-park-etobicoke-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "confederation-park-toronto": "/images/dog-parks/confederation-park-toronto-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${line}${anchor}`));
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
const park = parks.find((entry) => entry.slug === "colonel-samuel-smith-park-etobicoke");
if (!park) throw new Error("Colonel Samuel Smith Etobicoke record not found");

const seoTitle = "Colonel Samuel Smith Park | Etobicoke Waterfront Park Guide | LeashFree.ca";
const metaDescription =
  "Source-backed guide to Colonel Samuel Smith Park in Etobicoke, including the official 3145 Lake Shore Boulevard West location, waterfront trail network, birding profile, and current City of Toronto rule that dogs must stay leashed except in designated off-leash areas.";
const intro =
  "<p>Colonel Samuel Smith Park is a <strong>Toronto waterfront park</strong> at <strong>3145 Lake Shore Boulevard West</strong>, known for its lakeside paths, birding habitat, and shoreline setting. It should <strong>not</strong> currently be presented as a confirmed dog off-leash area.</p>";
const body =
  "<p>The key correction on this page is park type. As of <strong>Thursday, August 20, 2026</strong>, I did not find a current City of Toronto source confirming Colonel Samuel Smith Park itself as a designated dogs off-leash area. Toronto's current citywide dogs off-leash page says dogs are only permitted off leash in <strong>designated dogs off-leash areas</strong>, and the city's park etiquette page says pets must be <strong>on a leash while in a park or on a trail</strong> unless they are in one of those designated areas. That makes the older off-leash framing on this route too strong to keep.</p><p>The park itself is still worth covering accurately. Toronto's current facility listings place <strong>Colonel Samuel Smith Park at 3145 Lake Shore Blvd W</strong>. The city also highlights it on the trails page as <strong>one of Toronto's most popular birding destinations</strong>, with <strong>a network of paths</strong> and <strong>the city's longest ice skating trail</strong>. Current booking pages add that the park remains an active civic destination, though one city booking page notes the <strong>southern headlands are excluded due to construction work</strong>.</p><p>There is also useful safety context for dog owners. In a City of Toronto release published on <strong>January 14, 2022</strong>, the city reminded residents not to feed coyotes after reports of people leaving food out in Colonel Samuel Smith Park. The release specifically says coyotes can pose a danger to pets and that dogs should only be allowed off leash in <strong>designated dog off-leash areas</strong>. That source reinforces the more careful current guidance: this is a real waterfront park where dogs may visit, but visitors should treat it as an <strong>on-leash park</strong> unless Toronto publishes a specific off-leash designation for part of the site.</p><p>This update improves trust by removing unsupported dog-park claims and replacing them with the city's actual published park profile, address, trail and birding context, and current leash expectations.</p>";
const notes =
  "<p>Primary sources reviewed on Thursday, August 20, 2026: https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/ for the current citywide off-leash rule; https://www.toronto.ca/explore-enjoy/parks-recreation/how-to-use-our-services/love-parks/ for current park and leash etiquette; https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/parks-and-recreation-facilities/playground-listings/ for the 3145 Lake Shore Blvd W address listing; https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/parks-and-recreation-facilities/trails/ for the birding, path network, and ice trail description; https://www.toronto.ca/services-payments/venues-facilities-bookings/booking-park-recreation-facilities/simple-permit-booking/ for the note excluding the southern headlands due to construction work; and the City of Toronto January 14, 2022 coyote notice for current wildlife caution context. No current City of Toronto source reviewed here confirmed Colonel Samuel Smith Park itself as a designated dog off-leash area.</p>";

Object.assign(park, {
  title: "Colonel Samuel Smith Park | Etobicoke Waterfront Park Guide",
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ["Etobicoke", "Toronto"],
    Province: ["Ontario"],
    Tags: ["waterfront-park", "etobicoke", "on-leash-park", "birding", "trails"],
  },
});

Object.assign(park.raw, {
  "Park Header": "Colonel Samuel Smith Park | Etobicoke Waterfront Park Guide",
  "Park type": "Waterfront park",
  Description: "<p>Colonel Samuel Smith Park is an Etobicoke waterfront park with lakeside trails and birding habitat, but it should not currently be framed as a confirmed designated dog off-leash area.</p>",
  "Street Address": "3145 Lake Shore Blvd W",
  latitude: "43.591398",
  longitude: "-79.5133857",
  City: "Etobicoke",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "No",
  "Separate Small Dog Area": "No",
  "Surface type": "Paved waterfront paths, grass, shoreline",
  Size: "Large waterfront park",
  "Water source available": "Unknown - verify on arrival",
  Benches: "Yes - verify exact distribution on arrival",
  "Shaded area": "Some mature tree cover",
  "Waste bins": "Yes - verify on arrival",
  "Bag Dispensers": "Unknown",
  "Parking Available": "Yes - verify current restrictions onsite",
  "Washrooms nearby": "Unknown",
  "Operating hours": "Verify posted park hours on arrival",
  "Seasonal Restrictions": "Some city booking material excludes the southern headlands due to construction work",
  "Park Website or Source": "https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=3145+Lake+Shore+Blvd+W+Etobicoke+ON",
  Tags: "waterfront-park,etobicoke,on-leash-park,birding,trails",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  "Reviewed On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  "Meta Title": seoTitle,
  "Meta Description": metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + "\n");

updateCsvRow(parkCsvPath, "slug", "colonel-samuel-smith-park-etobicoke", {
  "Park Header": "Colonel Samuel Smith Park | Etobicoke Waterfront Park Guide",
  "Park type": "Waterfront park",
  Description: "<p>Colonel Samuel Smith Park is an Etobicoke waterfront park with lakeside trails and birding habitat, but it should not currently be framed as a confirmed designated dog off-leash area.</p>",
  "Street Address": "3145 Lake Shore Blvd W",
  latitude: "43.591398",
  longitude: "-79.5133857",
  City: "Etobicoke",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "No",
  "Separate Small Dog Area": "No",
  "Surface type": "Paved waterfront paths, grass, shoreline",
  Size: "Large waterfront park",
  "Water source available": "Unknown - verify on arrival",
  Benches: "Yes - verify exact distribution on arrival",
  "Shaded area": "Some mature tree cover",
  "Waste bins": "Yes - verify on arrival",
  "Bag Dispensers": "Unknown",
  "Parking Available": "Yes - verify current restrictions onsite",
  "Washrooms nearby": "Unknown",
  "Operating hours": "Verify posted park hours on arrival",
  "Seasonal Restrictions": "Some city booking material excludes the southern headlands due to construction work",
  "Park Website or Source": "https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=3145+Lake+Shore+Blvd+W+Etobicoke+ON",
  Tags: "waterfront-park,etobicoke,on-leash-park,birding,trails",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  "Reviewed On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  "Meta Title": seoTitle,
  "Meta Description": metaDescription,
});

updateOverridesFile();

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf("route");
  return routeIndex !== -1 && row[routeIndex] === "/dog-parks/colonel-samuel-smith-park-etobicoke/";
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf("route");
  return routeIndex !== -1 && row[routeIndex] === "/dog-parks/colonel-samuel-smith-park-etobicoke/";
});

rebuildBacklogSummary();

console.log("Updated Colonel Samuel Smith Park (Etobicoke) and refreshed backlog files.");
