import fs from "node:fs";

const slug = "sunnidale-park";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/sunnidale-park-original.png";
const seoTitle = "Sunnidale Park DOLRA | Barrie, Ontario";
const metaDescription = "Plan a visit to Sunnidale Park DOLRA in Barrie: a secure fenced natural area with woodland footpaths, parking, current rules, and safety cautions.";
const intro = `<p>Sunnidale Park's <strong>Dog Off-Leash Recreation Area (DOLRA)</strong> is a secure fenced natural area with footpaths between Sunnidale Road and Coulter Street in Barrie. The City lists parking for the dog area and maps it within Sunnidale Natural Area.</p>`;
const body = `<p>Barrie's current DOLRA page identifies Sunnidale as one of the City's two designated off-leash recreation areas. Municipal mapping places the dog area near 44.3969708514, -79.7013663948 within Sunnidale Natural Area. The natural-area address record is 227 Sunnidale Road; the City's separate page for the wider Sunnidale Park facilities uses 265 Sunnidale Road.</p><p>The City describes the DOLRA as a natural area with footpaths and its municipal map record describes a secure fenced area. Current official sources do not publish a precise dog-area size, a separate small-dog section, the exact path material, seating details or dedicated operating hours. Keep your dog leashed until you are inside the marked off-leash boundary and follow posted notices.</p><p>Parking is listed for the DOLRA. A year-round externally accessible washroom is available at the Dorian Parker Centre in the wider park: 8 a.m. to 5 p.m. from Thanksgiving weekend through April 30, and 8 a.m. to 7 p.m. from May 1 through Thanksgiving weekend. The City does not publish the walking distance from the DOLRA entrance, so confirm the route and posted access before relying on it.</p><p>Poison ivy may occur in Barrie's naturalized off-leash areas; stay on the footpaths and watch for herbicide-treatment signs. Streams in or near the dog areas are naturalized and are not monitored for water quality. No potable dog-water source is confirmed, so bring drinking water and do not assume creek water is safe.</p><p>The DOLRA is unsupervised. Owners must stay present and keep their dogs in view, carry one leash per dog, leash dogs when entering and exiting, and ensure dogs wear current City registration and rabies tags. No more than two dogs are permitted per owner. Pick up waste and use the receptacles provided. Aggressive dogs are not permitted, and the City advises close supervision of children because the DOLRAs are not recommended for people under 18.</p>`;
const faqs = `<p><strong>1. Is Sunnidale Park an official off-leash dog area?</strong></p><p>Yes. Barrie identifies Sunnidale Park DOLRA as one of its two designated Dog Off-Leash Recreation Areas.</p><p><strong>2. Is the Sunnidale DOLRA fenced?</strong></p><p>Yes. Barrie's municipal points-of-interest layer describes it as a secure fenced area. The City describes the setting as a natural area with footpaths.</p><p><strong>3. Where is the dog area, and is parking available?</strong></p><p>It is between Sunnidale Road and Coulter Street, within Sunnidale Natural Area. The municipal dog-area point is near 44.3969708514, -79.7013663948, and the City lists parking.</p><p><strong>4. Is drinking water available for dogs?</strong></p><p>No potable dog-water source is confirmed. The City says natural streams in or near the DOLRAs are not monitored for water quality, so bring drinking water.</p><p><strong>5. Are washrooms nearby?</strong></p><p>The wider park has a year-round externally accessible washroom at Dorian Parker Centre, open 8 a.m.–5 p.m. from Thanksgiving weekend through April 30 and 8 a.m.–7 p.m. from May 1 through Thanksgiving weekend. Confirm the walking route from the DOLRA before relying on it.</p><p><strong>6. What rules and hours should visitors know?</strong></p><p>Leash dogs on entry and exit, remain present with one leash per dog, keep dogs in view, display current registration and rabies tags, and clean up immediately. The limit is two dogs per owner. No dedicated DOLRA hours are published; follow posted signs and temporary notices.</p>`;
const notes = `<p>Primary sources reviewed on August 26, 2026: https://www.barrie.ca/community-recreation-environment/parks-trails-waterfront/dog-leash-recreation-areas ; https://www.barrie.ca/community-recreation-environment/parks-trails-waterfront/parks-amenities/sunnidale-park ; https://www.barrie.ca/government/policies-laws/laws-listing/animal-control-law ; https://www.barrie.ca/government/policies-laws/laws-listing/parks-use-law ; https://gispublic.barrie.ca/arcgis/rest/services/Public/OperationalLayers_Dynamic/MapServer/42 ; and https://gispublic.barrie.ca/arcgis/rest/services/Open_Data/FacilitiesStreets/MapServer/14 . Confirmed: designated DOLRA; location between Sunnidale Road and Coulter Street; 227 Sunnidale Road natural-area address; official dog-area point 44.3969708514, -79.7013663948; natural area with footpaths; secure fenced area; parking; poison-ivy and unmonitored-stream cautions; provided waste receptacles; current handler rules; and year-round Dorian Parker Centre washroom with seasonal daily hours. Reasonable inference: the municipal dog-area point and 227 Sunnidale Road natural-area record are the most specific location data for the DOLRA, while 265 Sunnidale Road refers to wider park facilities. Unknown: separate small-dog area, precise DOLRA size, exact path material, potable dog water, seating, exact shade coverage, bag dispensers, dedicated DOLRA hours, washroom walking distance, postal code and temporary closures.</p>`;

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
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

function updateManifest(patch) {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Sunnidale Park manifest entry not found");
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
  if (end < 0) throw new Error("Sunnidale Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  fs.writeFileSync(manifestPath, `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`);
}

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Sunnidale Park generated JSON record not found");

park.name = "Sunnidale Park";
park.title = seoTitle;
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = { City: ["Barrie"], Province: ["Ontario"], Tags: ["leash-free", "fenced", "woodland", "footpaths"] };

Object.assign(park.raw, {
  "Park Name": "Sunnidale Park",
  "Park Header": seoTitle,
  "Park type": "Leash Free",
  Description: body,
  "Street Address": "227 Sunnidale Rd",
  latitude: "44.3969708514",
  longitude: "-79.7013663948",
  City: "Barrie",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "Yes",
  "Separate Small Dog Area": "Unknown - not identified in current City sources",
  "Surface type": "Natural area with footpaths; exact material not published",
  Size: "Unknown - precise DOLRA area not published",
  "Water source available": "No potable source confirmed; natural stream water is not monitored",
  Benches: "Unknown - not documented for the DOLRA",
  "Shaded area": "Wooded natural setting; exact shade coverage not documented",
  "Waste bins": "Yes",
  "Bag Dispensers": "Unknown - bring waste bags",
  "Parking Available": "Yes",
  "Washrooms nearby": "Year-round at Dorian Parker Centre in the wider park; confirm walking route",
  "Operating hours": "No dedicated DOLRA hours published; follow posted signs",
  "Seasonal Restrictions": "No seasonal schedule published; watch for poison ivy and posted treatment or closure notices",
  "Park Website or Source": "https://www.barrie.ca/community-recreation-environment/parks-trails-waterfront/dog-leash-recreation-areas",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=44.3969708514%2C-79.7013663948",
  Tags: "leash-free,fenced,woodland,footpaths",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  Media: "",
  "Reviewed On": "Wed Aug 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  "Meta Title": seoTitle,
  "Meta Description": metaDescription,
  "Dog Park FAQs": faqs
});

fs.writeFileSync(jsonPath, `${JSON.stringify(parks, null, 2)}\n`);

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = rows[0];
for (const key of Object.keys(park.raw)) {
  if (!headers.includes(key)) {
    headers.push(key);
    for (const item of rows.slice(1)) item.push("");
  }
}
const csvRow = rows.find((item, index) => index > 0 && item[headers.indexOf("slug")] === slug);
if (!csvRow) throw new Error("Sunnidale Park CSV row not found");
for (const [key, value] of Object.entries(park.raw)) csvRow[headers.indexOf(key)] = String(value ?? "");
fs.writeFileSync(csvPath, serializeCsv(rows));

for (const queuePath of ["reports/thin-page-backlog.csv", "reports/content-review-queue.csv"]) {
  const reportRows = parseCsv(fs.readFileSync(queuePath, "utf8"));
  const routeIndex = reportRows[0].indexOf("route");
  fs.writeFileSync(queuePath, serializeCsv([reportRows[0], ...reportRows.slice(1).filter((item) => item[routeIndex] !== route)]));
}

const summaryPath = "reports/thin-page-backlog-summary.md";
const summary = fs.readFileSync(summaryPath, "utf8").split(/\r?\n/).filter((line) => !line.includes(`](${route})`)).join("\n");
fs.writeFileSync(summaryPath, summary.endsWith("\n") ? summary : `${summary}\n`);

updateManifest({
  status: "verification-pending",
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
    source: "/images/dog-parks/sunnidale-park-original.png",
    width: 1693,
    height: 929,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Painterly illustration of two off-leash dogs and their handler on a fenced woodland footpath at Sunnidale Park in Barrie",
    derivatives: [480, 960, 1600],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Sunnidale Park"
  },
  reason: "Research completed with current City of Barrie DOLRA, park, by-law, and municipal GIS sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping, and queue files are synchronized without carrying forward unsupported details.",
  nextAction: "Run production build, repository QA, JSON-CSV parity, image uniqueness, and targeted rendered inspection before marking the page passed."
});

console.log("Updated Sunnidale Park and removed it from the active improvement queues.");
