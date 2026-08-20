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
  const line = '  "marie-curtis-park-etobicoke": "/images/dog-parks/marie-curtis-park-etobicoke-original.png",\n';
  if (source.includes(line.trim())) return;
  const anchor = '  "martensville-dog-park": "/images/dog-parks/martensville-dog-park-original.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(overridesPath, source.replace(anchor, `${line}${anchor}`));
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
const park = parks.find((entry) => entry.slug === "marie-curtis-park-etobicoke");
if (!park) throw new Error("Marie Curtis Etobicoke record not found");

const seoTitle = "Marie Curtis Park | Etobicoke Off-Leash Area Guide | LeashFree.ca";
const metaDescription =
  "Source-backed guide to Marie Curtis Park in Etobicoke, including the official 2 Forty Second Street address, Toronto confirmation that it is a designated off-leash area, nearby beach restrictions, and current citywide off-leash rules.";
const intro =
  "<p>Marie Curtis Park is one of Toronto's current <strong>designated dogs off-leash areas</strong>. The park is listed at <strong>2 Forty Second Street</strong> in Etobicoke and sits on Toronto's western waterfront beside Marie Curtis Park East Beach.</p>";
const body =
  "<p>This page is stronger than the older draft because the current City of Toronto source set confirms the park's off-leash status without requiring guesswork about its size or exact layout. The clearest current evidence is Toronto's <strong>Off-Leash Area Enhancement Program</strong>, which includes <strong>Marie Curtis Park</strong> in the list of current and upcoming off-leash area improvements. That means the city is actively treating Marie Curtis as part of its recognized off-leash network, not as an informal place where dogs simply happen to run.</p><p>Toronto's current facility listings and related pages add the practical park context. The city lists <strong>Marie Curtis Park at 2 Forty Second St</strong>. It also identifies <strong>Marie Curtis Park East Beach</strong> as one of Toronto's supervised swimming beaches, and the beach rules page says <strong>dogs are not allowed on supervised swimming beaches</strong>. That matters here because this page should not imply that off-leash use extends onto the beach itself. The more accurate message is that the park includes a designated off-leash area, while the supervised beach has its own separate restrictions.</p><p>There is also useful waterfront context beyond dog use alone. Toronto's paddle-sports page lists Marie Curtis Park as a launch area and again uses the same park address, reinforcing the shoreline recreation role of the site. Current picnic-booking material also confirms Marie Curtis remains an active destination park in Etobicoke-York.</p><p>The citywide off-leash rules still govern the visit. Toronto says dogs must be <strong>licensed and vaccinated</strong> to use off-leash areas, and dogs that are aggressive, pit bulls as defined by the provincial act, dogs in heat, and dogs under a Dangerous Dog Order are not allowed in off-leash areas. Owners must follow all posted signs and boundaries, scoop waste, keep dogs attended, and remember that a fine can be issued for letting dogs run off leash outside a designated area. Those rules are especially important at a mixed-use waterfront park where beach users, trail users, and dog owners all share nearby space.</p><p>This update improves the page by keeping only the facts the City of Toronto currently supports: verified off-leash status, correct park address, waterfront setting, nearby beach restrictions, and the citywide rule set.</p>";
const notes =
  "<p>Primary sources reviewed on Thursday, August 20, 2026: https://www.toronto.ca/city-government/planning-development/construction-new-facilities/off-leash-area-enhancement-program/ for the current listing of Marie Curtis Park in the city's off-leash improvement program; https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/dogs-off-leash/ and https://www.toronto.ca/community-people/animals-pets/pets-in-the-city/dogs-in-the-city/responsible-dog-ownership/ for current citywide off-leash and leash rules; https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/parks-and-recreation-facilities/playground-listings/ for the 2 Forty Second St address listing; https://www.toronto.ca/explore-enjoy/parks-recreation/places-spaces/beaches-gardens-attractions/beaches/ for supervised beach restrictions at Marie Curtis Park East Beach; and https://www.toronto.ca/explore-enjoy/parks-recreation/program-activities/swim-water-activities/paddle-sports/ for supporting waterfront park context.</p>";

Object.assign(park, {
  title: "Marie Curtis Park | Etobicoke Off-Leash Area Guide",
  seoTitle,
  metaDescription,
  description: intro,
  body,
  references: {
    City: ["Etobicoke", "Toronto"],
    Province: ["Ontario"],
    Tags: ["off-leash", "etobicoke", "waterfront", "beach-adjacent", "toronto"],
  },
});

Object.assign(park.raw, {
  "Park Header": "Marie Curtis Park | Etobicoke Off-Leash Area Guide",
  "Park type": "Leash Free",
  Description: "<p>Marie Curtis Park is a verified Toronto off-leash area in Etobicoke's waterfront park system, but the nearby supervised beach has separate dog restrictions.</p>",
  "Street Address": "2 Forty Second St",
  latitude: "43.5867787",
  longitude: "-79.5425693",
  City: "Etobicoke",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "Unknown",
  "Separate Small Dog Area": "Unknown",
  "Surface type": "Grass and waterfront park paths",
  Size: "Large waterfront park",
  "Water source available": "Unknown - verify on arrival",
  Benches: "Unknown - verify on arrival",
  "Shaded area": "Some mature tree cover",
  "Waste bins": "Yes - verify onsite distribution",
  "Bag Dispensers": "Unknown",
  "Parking Available": "Yes - verify current restrictions onsite",
  "Washrooms nearby": "Unknown",
  "Operating hours": "Verify posted park hours and boundaries on arrival",
  "Seasonal Restrictions": "Dogs are not allowed on supervised swimming beaches; check current beach and off-leash signage onsite",
  "Park Website or Source": "https://www.toronto.ca/city-government/planning-development/construction-new-facilities/off-leash-area-enhancement-program/",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=2+Forty+Second+St+Etobicoke+ON",
  Tags: "off-leash,etobicoke,waterfront,beach-adjacent,toronto",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  "Reviewed On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  "Meta Title": seoTitle,
  "Meta Description": metaDescription,
});

fs.writeFileSync(parksPath, JSON.stringify(parks, null, 2) + "\n");

updateCsvRow(parkCsvPath, "slug", "marie-curtis-park-etobicoke", {
  "Park Header": "Marie Curtis Park | Etobicoke Off-Leash Area Guide",
  "Park type": "Leash Free",
  Description: "<p>Marie Curtis Park is a verified Toronto off-leash area in Etobicoke's waterfront park system, but the nearby supervised beach has separate dog restrictions.</p>",
  "Street Address": "2 Forty Second St",
  latitude: "43.5867787",
  longitude: "-79.5425693",
  City: "Etobicoke",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "Unknown",
  "Separate Small Dog Area": "Unknown",
  "Surface type": "Grass and waterfront park paths",
  Size: "Large waterfront park",
  "Water source available": "Unknown - verify on arrival",
  Benches: "Unknown - verify on arrival",
  "Shaded area": "Some mature tree cover",
  "Waste bins": "Yes - verify onsite distribution",
  "Bag Dispensers": "Unknown",
  "Parking Available": "Yes - verify current restrictions onsite",
  "Washrooms nearby": "Unknown",
  "Operating hours": "Verify posted park hours and boundaries on arrival",
  "Seasonal Restrictions": "Dogs are not allowed on supervised swimming beaches; check current beach and off-leash signage onsite",
  "Park Website or Source": "https://www.toronto.ca/city-government/planning-development/construction-new-facilities/off-leash-area-enhancement-program/",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=2+Forty+Second+St+Etobicoke+ON",
  Tags: "off-leash,etobicoke,waterfront,beach-adjacent,toronto",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  "Reviewed On": "Thu Aug 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  "Meta Title": seoTitle,
  "Meta Description": metaDescription,
});

updateOverridesFile();

removeCsvRow(backlogPath, (row, header) => {
  const routeIndex = header.indexOf("route");
  return routeIndex !== -1 && row[routeIndex] === "/dog-parks/marie-curtis-park-etobicoke/";
});

removeCsvRow(reviewQueuePath, (row, header) => {
  const routeIndex = header.indexOf("route");
  return routeIndex !== -1 && row[routeIndex] === "/dog-parks/marie-curtis-park-etobicoke/";
});

rebuildBacklogSummary();

console.log("Updated Marie Curtis Park (Etobicoke) and refreshed backlog files.");
