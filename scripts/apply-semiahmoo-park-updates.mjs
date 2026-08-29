import fs from "node:fs";

const slug = "semiahmoo-park";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/semiahmoo-park-original.png";
const seoTitle = "Semiahmoo Park Dog Access Advisory | Surrey, BC | LeashFree.ca";
const metaDescription = "Check dog access before visiting Semiahmoo Park in South Surrey. Semiahmoo First Nation's published rule prohibits pets; use designated alternatives.";
const intro = "<p>Semiahmoo Park is on <strong>Semiahmoo First Nation reserve land in South Surrey</strong>. It is not an off-leash dog park: the Nation's published rule prohibits dogs and other pets, so this page is an access advisory rather than a recommendation to bring a dog.</p>";
const body = `<h2>Dogs are not permitted at Semiahmoo Park</h2>
<p>Semiahmoo First Nation's published park rule prohibits dogs and other pets. Leave dogs at home unless the Nation publishes a change, and do not use the shoreline or internal routes for on-leash or off-leash exercise.</p>
<h2>Location and current access information</h2>
<p>A current 2026 community-event listing identifies the park at <strong>15782 Marine Drive</strong> and names Semiahmoo First Nation as the host. The Nation's current website does not publish routine park hours, general public-access conditions or a visitor amenity directory. Check directly with the Nation before a non-event visit, and follow every posted sign, gate, closure and event instruction when you arrive.</p>
<h2>What to plan for</h2>
<p>The site is on the Semiahmoo Bay shoreline, but current operator information does not confirm parking terms, washrooms, potable water, seating, waste facilities, exact boundaries or an official map point. Plan without relying on those facilities, and confirm current access before travelling.</p>
<h2>Nearby designated dog options</h2>
<p>For off-leash exercise, White Rock identifies the fenced dog park in <strong>Ruth Johnson Park</strong>. Surrey identifies <strong>Blackie Spit Park</strong> as a nearby municipal park with two designated off-leash areas, including an off-leash swim area used when the tide is in. Check each operator's current page and posted conditions before visiting.</p>
<h2>Respecting Semiahmoo First Nation land</h2>
<p>Semiahmoo First Nation manages and protects its land for cultural, archaeological and environmental reasons. Visit only where public access is allowed, keep pets away from the park, and respect temporary restrictions connected with community use or land stewardship.</p>`;
const parkRules = "Do not bring dogs or other pets. Confirm current public access with Semiahmoo First Nation and follow posted signs, gates, closures and event instructions.";
const faqs = `<p><strong>Is Semiahmoo Park an off-leash dog park?</strong></p><p>No. Semiahmoo First Nation's published park rule prohibits dogs and other pets.</p>
<p><strong>Who controls Semiahmoo Park?</strong></p><p>The park is on Semiahmoo First Nation reserve land in South Surrey. It is not a City of White Rock dog park.</p>
<p><strong>Where is Semiahmoo Park?</strong></p><p>A current official community-event listing uses 15782 Marine Drive in South Surrey. The operator does not publish an official park map point, so this guide does not provide coordinates.</p>
<p><strong>Can dogs use the beach or trails at Semiahmoo Park?</strong></p><p>No pet exception is published. Do not bring a dog onto the park, shoreline or any internal route unless Semiahmoo First Nation directly confirms a rule change.</p>
<p><strong>What are the current public hours?</strong></p><p>Current routine public hours are not published by the operator. Confirm access with Semiahmoo First Nation before a non-event visit and obey posted gates and notices.</p>
<p><strong>Are parking, washrooms or drinking water available?</strong></p><p>No current operator amenity directory confirms those features. Plan without relying on parking, washrooms, dog water, seating or waste supplies.</p>
<p><strong>Where can I take a dog nearby?</strong></p><p>White Rock's designated fenced off-leash park is in Ruth Johnson Park. Surrey's Blackie Spit Park has two designated off-leash areas, including a tidal dog-swim area.</p>`;
const notes = "Research reviewed 2026-08-28. Confirmed: Semiahmoo Park is on Semiahmoo First Nation reserve land in South Surrey; the Nation's explicit published rule prohibits dogs and other pets and corrected the former off-leash characterization; a current 2026 City of Surrey event listing identifies 15782 Marine Drive and Semiahmoo First Nation as host; current White Rock guidance identifies Ruth Johnson Park as its off-leash site; current Surrey guidance identifies Blackie Spit as a nearby municipal off-leash option. Reasonable inferences: visitors should follow the operator's no-pets rule unless the Nation publishes a change; the page should function as a dog-access advisory; unsupported legacy coordinates and postal code should be removed. Unknown: routine public access and hours, current fence/gate configuration, exact boundary and official coordinates, postal code, parking terms and availability, washrooms, potable water, benches, shade, waste bins, bag dispensers, surfaces, temporary closures and any case-specific pet exception. Sources: https://www.semiahmoofirstnation.ca/ | https://www.semiahmoofirstnation.ca/land-research-resource-mgmt | https://www.semiahmoofirstnation.ca/contact | https://www.surrey.ca/news-events/events/national-indigenous-peoples-day-2026 | https://www.whiterockcity.ca/799/Dogs-in-White-Rock | https://www.whiterockcity.ca/DocumentCenter/View/4527/Dogs-on-Promenade-Brochure | https://www.surrey.ca/parks-recreation/parks/park-features-amenities/dog-off-leash-areas | https://www.surrey.ca/parks-recreation/parks/blackie-spit-park | https://www.kindredfarm.ca/beach-access-lost-dog-owners/. Source variation: the explicit operator statement is from 2011; the current operator site has no park-rules page, current reports of posted restrictions corroborate it, and no current official source rescinds it. The old dawn-to-dusk trial access, area, fence and gate details are not presented as current facts.";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') { value += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value.length || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function serializeCsv(rows) {
  return `${rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

function updateManifest(patch, nextPriorityPage = "Semiahmoo Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Semiahmoo Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex);
  let depth = 0;
  let quoted = false;
  let escaped = false;
  let end = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) { end = index; break; }
  }
  if (end < 0) throw new Error("Semiahmoo Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

function rebuildBacklogSummary() {
  const rows = parseCsv(fs.readFileSync("reports/thin-page-backlog.csv", "utf8"));
  const headers = rows[0];
  const records = rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((key, index) => [key, row[index] ?? ""])));
  const countBy = (field) => [...records.reduce((map, row) => map.set(row[field] || "", (map.get(row[field] || "") || 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = records.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n");
  fs.writeFileSync("reports/thin-page-backlog-summary.md", `# Thin Page Improvement Backlog\n\nGenerated from \`reports/content-health.json\` on 2026-07-22.\n\nThis backlog contains ${records.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.\n\n## Backlog counts\n\n| Tier | Pages |\n| --- | ---: |\n${tierRows}\n\n| Content type | Pages |\n| --- | ---: |\n${sectionRows}\n\n## Prioritization\n\n- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.\n- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.\n- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.\n- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.\n\nDo not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.\n\n## First 50 pages\n\n| # | Tier | Type | Page | Score | Words | Missing source |\n| ---: | --- | --- | --- | ---: | ---: | --- |\n${topRows}\n`);
}

if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", nextAction: "Implement the researched no-pets advisory, data cleanup, unique illustration, mappings, queues and audit artifacts together." });
  console.log("Marked Semiahmoo Park implementation-pending.");
  process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Semiahmoo Park generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("Semiahmoo Park source image not found");

Object.assign(park, {
  name: "Semiahmoo Park",
  title: "Semiahmoo Park Dog Access Advisory",
  seoTitle,
  metaDescription,
  description: intro,
  body,
  media: [],
  references: { City: ["Surrey"], Province: ["British Columbia"], Tags: ["no-pets", "access-advisory", "shoreline", "Semiahmoo-First-Nation"] }
});

Object.assign(park.raw, {
  "Park Name": "Semiahmoo Park",
  "Park Header": "Semiahmoo Park Dog Access Advisory",
  "Park type": "No pets permitted; dog access advisory",
  Description: body,
  "Street Address": "15782 Marine Drive",
  latitude: "",
  longitude: "",
  City: "Surrey",
  Province: "British Columbia",
  "Postal Code": "",
  Fenced: "Current configuration not published; pets prohibited",
  "Separate Small Dog Area": "No",
  "Surface type": "Not published by the operator",
  Size: "Current official size not published",
  "Water source available": "Not published; do not rely on a water source",
  Benches: "Not published by the operator",
  "Shaded area": "Not published by the operator",
  "Waste bins": "Not published by the operator",
  "Bag Dispensers": "Not published; pets prohibited",
  "Parking Available": "Current parking terms and availability not published",
  "Washrooms nearby": "Not published by the operator",
  "Operating hours": "Current routine public hours not published; check with Semiahmoo First Nation",
  "Seasonal Restrictions": "Public access can vary; pets are prohibited; follow posted notices and event controls",
  "Park Rules": parkRules,
  "Park Website or Source": "https://www.semiahmoofirstnation.ca/",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=15782%20Marine%20Drive%2C%20Surrey%2C%20BC",
  Tags: "no-pets,access-advisory,shoreline,Semiahmoo-First-Nation",
  "Notes / Comments": notes,
  "Public Notes": "",
  "Intro Paragraph": intro,
  Media: "",
  "Reviewed On": "Fri Aug 28 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  "Meta Title": seoTitle,
  "Meta Description": metaDescription,
  "Dog Park FAQs": faqs
});

fs.writeFileSync(parksPath, `${JSON.stringify(parks, null, 2)}\n`);

const csvRows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = csvRows[0];
for (const key of Object.keys(park.raw)) {
  if (!headers.includes(key)) {
    headers.push(key);
    for (const item of csvRows.slice(1)) item.push("");
  }
}
const csvRow = csvRows.find((row, index) => index > 0 && row[headers.indexOf("slug")] === slug);
if (!csvRow) throw new Error("Semiahmoo Park CMS CSV row not found");
for (const [key, value] of Object.entries(park.raw)) csvRow[headers.indexOf(key)] = String(value ?? "");
fs.writeFileSync(csvPath, serializeCsv(csvRows));

for (const queuePath of ["reports/thin-page-backlog.csv", "reports/content-review-queue.csv"]) {
  const rows = parseCsv(fs.readFileSync(queuePath, "utf8"));
  const routeIndex = rows[0].indexOf("route");
  fs.writeFileSync(queuePath, serializeCsv([rows[0], ...rows.slice(1).filter((row) => row[routeIndex] !== route)]));
}
rebuildBacklogSummary();

updateManifest({
  status: "implementation-complete",
  artifactChecks: {
    content: "implementation-complete",
    seo: "implementation-complete",
    structuredData: "implementation-complete",
    generatedJson: "implementation-complete",
    csv: "implementation-complete",
    imageMapping: "implementation-complete",
    sourceImage: "implementation-complete",
    optimizedDerivatives: "implementation-complete",
    backlog: "implementation-complete",
    renderedPage: "verification-pending"
  },
  image: {
    source: "/images/dog-parks/semiahmoo-park-original.png",
    width: 1536,
    height: 1024,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Realistic digital illustration of the driftwood shoreline and tidal flats at Semiahmoo Park on Semiahmoo Bay",
    derivatives: [480, 960],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Semiahmoo Park",
    visualReference: "Semiahmoo First Nation's current land-management page shows Semiahmoo Bay at low tide with broad tidal flats, shallow channels, a pebbly shoreline, driftwood and distant low headlands. The independent illustration uses those confirmed characteristics in a new composition, shows no dogs and adds no unconfirmed park amenities."
  },
  reason: "Implementation completed from the researched Semiahmoo First Nation no-pets rule and current official location context. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping and queues are synchronized.",
  nextAction: "Mark verification pending, then run the production build, repository QA, parity, image and targeted rendered checks before passing."
});

console.log("Updated Semiahmoo Park and removed it from the active improvement queues.");
