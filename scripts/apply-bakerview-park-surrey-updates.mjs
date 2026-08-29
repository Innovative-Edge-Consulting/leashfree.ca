import fs from "node:fs";

const slug = "bakerview-park-surrey";
const route = `/dog-parks/${slug}/`;
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/bakerview-park-surrey-original.png";
const seoTitle = "Bakerview Park On-Leash Guide | Surrey, BC | LeashFree.ca";
const metaDescription = "Plan a leashed visit to Bakerview Park in Surrey: dawn-to-dusk hours, 154 Street parking, sports fields, washrooms, dog rules and map.";
const intro = "<p>Bakerview Park is a dawn-to-dusk neighbourhood park in South Surrey where dogs must remain leashed. Plan a shared-use walk around its grass fields and community amenities, with parking available from 154 Street.</p>";
const body = `<p>Bakerview Park is a neighbourhood park at 1845 154 Street in South Surrey. It is not one of Surrey's designated dog off-leash areas, so keep your dog on a leash throughout the visit and follow any posted dog-exclusion signs.</p>
<h2>What to expect</h2>
<p>The City lists Sunnyside Community Hall, a garden, playground, picnic tables, two baseball diamonds, a grass soccer field and washrooms at the park. The current municipal park polygon covers approximately 3.85 hectares. Sports fields can be busy in summer, making a short leash and extra space around players, children and other park users especially important.</p>
<h2>Parking, hours and facilities</h2>
<p>Regular park hours are dawn until dusk. The parking lot beside the community hall is reached from 154 Street. Washrooms are listed as a park amenity, but the City does not publish their opening schedule on the park page. Dog-specific drinking water, waste-bag dispensers and exact waste-bin locations are not published, so bring water and waste bags.</p>
<h2>Dog rules</h2>
<p>Surrey requires dogs to be leashed in public places unless they are inside a designated off-leash area. In parks, the leash may be no longer than three metres unless the City has posted a specific off-leash place and time. Dogs over three months must have a current Surrey licence and wear the licence tag. Keep your dog under control, remove waste immediately and respect posted restrictions or temporary closures.</p>
<h2>Finding a designated off-leash area</h2>
<p>If your visit needs off-leash exercise, use Surrey's current dog off-leash directory before leaving home. The City's designated South Surrey options include Blackie Spit Park, Dogwood Park, Latimer Park, Nicomekl Dog Off-Leash and Wills Brook Park; confirm the current map, hours and posted conditions for the location you choose.</p>`;
const parkRules = "Dogs must remain leashed because Bakerview Park is not a designated off-leash area. Use a leash no longer than three metres, keep the dog under control, carry waste bags, remove waste immediately, display a current Surrey licence tag for dogs over three months, and follow posted restrictions.";
const faqs = `<p><strong>Is Bakerview Park an off-leash dog park?</strong></p><p>No. Bakerview Park is absent from Surrey's current designated off-leash list, so dogs must remain leashed.</p>
<p><strong>Where is Bakerview Park?</strong></p><p>The official address is 1845 154 Street in South Surrey, British Columbia.</p>
<p><strong>What are the park hours?</strong></p><p>The City lists regular operating hours as dawn until dusk. Follow posted notices for temporary changes.</p>
<p><strong>What amenities are at Bakerview Park?</strong></p><p>The City lists Sunnyside Community Hall, a garden, playground, picnic tables, two baseball diamonds, a grass soccer field and washrooms.</p>
<p><strong>Is parking available?</strong></p><p>Yes. The parking lot beside Sunnyside Community Hall is accessed from 154 Street, although availability can vary with programs and field use.</p>
<p><strong>How large is Bakerview Park?</strong></p><p>The current municipal park polygon covers approximately 3.85 hectares. This is the whole neighbourhood park, not a dog-use area.</p>`;
const notes = "Reviewed 2026-08-27. Confirmed facts: current on-leash status; 1845 154 Street address; dawn-to-dusk hours; neighbourhood classification; approximately 38,459-square-metre municipal park polygon; community hall, garden, playground, picnic tables, two baseball diamonds, grass soccer field, parking and washrooms; Surrey leash, licensing and cleanup rules. Reasonable inference: 49.0356433346, -122.7972670408 is the centroid calculated from the current City polygon and is used as the page map point. Unknowns: postal code, dog water, benches on a walking route, route-specific shade, waste-bin and bag-dispenser locations, washroom schedule, ordinary parking availability and temporary closures. Sources: https://www.surrey.ca/parks-recreation/parks/bakerview-park | https://www.surrey.ca/parks-recreation/parks/park-features-amenities/dog-off-leash-areas | https://www.surrey.ca/services-payments/animals/responsible-pet-ownership | https://www.surrey.ca/sites/default/files/bylaws/BYL_reg_19105_0.pdf | https://www.surrey.ca/sites/default/files/bylaws/BYL_reg_13480.pdf | https://gisservices.surrey.ca/arcgis/rest/services/ParksFinder/MapServer/0 | https://www.surrey.ca/sites/default/files/media/documents/Dog_Off-Leash_Master_Plan_2012.pdf. Historical source variation: the 2012 strategy proposed a possible 0.45-hectare dog area but required separate master planning; current City sources do not designate Bakerview Park for off-leash use.";

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

function updateManifest(patch, nextPriorityPage = "Bakerview Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Bakerview Park manifest entry not found");
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
  if (end < 0) throw new Error("Bakerview Park manifest entry end not found");
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
  updateManifest({ status: "implementation-pending", nextAction: "Implement the researched on-leash copy, data, unique illustration, mappings, queues and audit artifacts together." });
  console.log("Marked Bakerview Park implementation-pending.");
  process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Bakerview Park generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("Bakerview Park source image not found");

Object.assign(park, {
  name: "Bakerview Park",
  title: "Bakerview Park On-Leash Park Guide",
  seoTitle,
  metaDescription,
  description: intro,
  body,
  media: [],
  references: { City: ["Surrey"], Province: ["British Columbia"], Tags: ["on-leash", "neighbourhood-park", "sports-fields", "washrooms"] }
});

Object.assign(park.raw, {
  "Park Name": "Bakerview Park",
  "Park Header": "Bakerview Park On-Leash Park Guide",
  "Park type": "On-leash park guide",
  Description: body,
  "Street Address": "1845 154 Street",
  latitude: "49.0356433346",
  longitude: "-122.7972670408",
  City: "Surrey",
  Province: "British Columbia",
  "Postal Code": "",
  Fenced: "No designated dog enclosure; dogs must remain leashed",
  "Separate Small Dog Area": "No",
  "Surface type": "Grass sports fields; dog-walking route surface not published",
  Size: "Approximately 3.85 hectares for the whole park",
  "Water source available": "Dog drinking water not published; bring water",
  Benches: "Picnic tables confirmed; route-specific benches not published",
  "Shaded area": "Shade conditions along a dog-walking route not published",
  "Waste bins": "Locations not published; remove and dispose of dog waste",
  "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Yes",
  "Washrooms nearby": "Yes",
  "Operating hours": "Dawn until dusk",
  "Seasonal Restrictions": "Sports fields can be busy in summer; follow posted field, event and maintenance notices",
  "Park Rules": parkRules,
  "Park Website or Source": "https://www.surrey.ca/parks-recreation/parks/bakerview-park",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=49.0356433346%2C-122.7972670408",
  Tags: "on-leash,neighbourhood-park,sports-fields,washrooms",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  Media: "",
  "Reviewed On": "Thu Aug 27 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
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
if (!csvRow) throw new Error("Bakerview Park CMS CSV row not found");
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
    source: "/images/dog-parks/bakerview-park-surrey-original.png",
    width: 1536,
    height: 1024,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Realistic digital illustration of a leashed dog and handler on a tree-lined path beside Bakerview Park's grass sports fields in Surrey",
    derivatives: [480, 960],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Bakerview Park",
    visualReference: "The current City park image confirms a broad open lawn and mature deciduous tree edge. The independent illustration uses those general landscape characteristics in a new composition and adds only City-confirmed paved-path and sports-field context, with one dog visibly leashed and no playground, signs or unconfirmed dog amenities."
  },
  reason: "Implementation completed from current City park, dog-access, bylaw and municipal GIS research. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping and queues are synchronized.",
  nextAction: "Mark verification pending, then run the production build, repository QA, parity, image and targeted rendered checks before passing."
});

console.log("Updated Bakerview Park and removed it from the active improvement queues.");
