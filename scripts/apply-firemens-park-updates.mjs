import fs from "node:fs";

const slug = "firemens-park";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/firemens-park-original.png";
const seoTitle = "Firemen's Park Dog Park | Niagara Falls, Ontario";
const metaDescription = "Plan a visit to Firemen's Park dog park in Niagara Falls: dawn-to-dusk hours, small- and large-dog areas, winter paths, current rules, and closures.";
const sourceUrl = "https://niagarafalls.ca/recreation-culture-and-community/parks-trails-and-sports-fields/off-leash-dog-parks/";
const intro = `<p>Niagara Falls Dog Park is the City's north-end designated off-leash area inside Firemen's Park at 2275 Dorchester Road. It is open daily from dawn to dusk all year, subject to posted maintenance, event and seasonal closures.</p>`;
const body = `<p>Niagara Falls Dog Park is the City's north-end designated off-leash area inside Firemen's Park at 2275 Dorchester Road. It is open daily from dawn to dusk all year, subject to posted maintenance, event and seasonal closures.</p><p>Use 2275 Dorchester Road, Niagara Falls, Ontario L2J 4L6 for trip planning. The map uses the City's current address point at 43.1393137668, -79.1143228370. This point is a stable reference for the park property; follow on-site signs to the dog-park entrance.</p><p>The City directs visitors to use designated small- and large-dog areas based on dog size. It also says walking paths within the dog parks are maintained in winter. The current listing does not publish the enclosure layout, path surface or dog-area size, so check the entrance and boundary signs before releasing your dog.</p><p>Sutera dog-waste containers are located near the dog-park entrances. A potable dog-water source, bag dispensers, benches, shade and washrooms are not listed for the dog areas. Bring water and waste bags rather than relying on unconfirmed amenities.</p><p>Normal day-to-day parking conditions are not described on the dog-park page. Firemen's Park hosts scheduled events that can change access, parking or dog-park availability, so check current City closure and event notices before travelling.</p><p>Dogs must have valid licence tags and current vaccinations, remain in sight and under verbal control, and be handled by no more than three dogs per person. Children under 13 require adult supervision. Dogs under four months, sick or injured dogs, female dogs in heat and aggressive dogs are prohibited. Glass, food, toys, smoking, vaping and alcohol are also prohibited. Leash your dog before entering and after leaving the designated area, and follow all posted rules.</p>`;
const faqs = `<p><strong>1. Is there an off-leash dog park at Firemen's Park?</strong></p><p>Yes. Niagara Falls identifies its north-end Niagara Falls Dog Park inside Firemen's Park at 2275 Dorchester Road.</p><p><strong>2. What hours does the dog park follow?</strong></p><p>The City says it is open daily from dawn to dusk all year. Maintenance, special events or seasonal conditions can prompt posted closures.</p><p><strong>3. Are there separate areas for different dog sizes?</strong></p><p>Yes. The City instructs owners to use the designated small- or large-dog area based on their dog's size.</p><p><strong>4. Are the paths maintained in winter?</strong></p><p>The City says walking paths within its dog parks are maintained in winter, but visitors should still check closure notices and current conditions.</p><p><strong>5. What should I bring?</strong></p><p>Bring water, waste bags, a leash, a valid dog licence tag and proof that vaccinations are current. The City confirms waste containers near the entrances but does not list water or bag dispensers.</p><p><strong>6. What are the main dog rules?</strong></p><p>Keep your dog in sight and under verbal control, bring no more than three dogs per handler, use the correct size area and follow the City's health, age and conduct restrictions.</p>`;
const notes = `<p>Primary sources reviewed on August 26, 2026: https://niagarafalls.ca/recreation-culture-and-community/parks-trails-and-sports-fields/off-leash-dog-parks/ ; https://niagarafalls.ca/property-home-and-environment/animal-services/dog-licences/ ; https://portal.niagarafalls.ca/arcgis/rest/services/Public/NF_AddressPoints/MapServer/1 ; https://portal.niagarafalls.ca/arcgis/rest/services/Public/NF_ParkAndTrailLands/MapServer/2 ; and https://portal.niagarafalls.ca/arcgis/rest/services/Public/NF_AccessPoints/MapServer/0 . Confirmed: current north-end off-leash designation inside Firemen's Park; 2275 Dorchester Road, Niagara Falls, Ontario L2J 4L6; municipal address point 43.1393137668, -79.1143228370; dawn-to-dusk daily access all year subject to closure notices; winter-maintained walking paths; designated small- and large-dog areas; entrance waste containers; licensing, vaccination, supervision, control, dog-limit, age, health and prohibited-item rules. Reasonable inference: the municipal address point is the best stable map reference because the municipal park polygon represents the wider Firemen's Park property. Unknown: dog-area fencing, surface composition beyond the published paths, precise dog-area size, potable dog water, benches, shade, bag dispensers, normal parking conditions, washrooms and closure-notice duration.</p>`;

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

function updateManifest(patch, nextPriorityPage = "Firemen's Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Firemen's Park manifest entry not found");
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
  if (end < 0) throw new Error("Firemen's Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", nextAction: "Implement the researched copy, data, image, mapping, queues, and audit artifacts together." });
  console.log("Marked Firemen's Park implementation-pending.");
  process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Firemen's Park generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("Firemen's Park source image not found");

park.name = "Firemen's Park";
park.title = seoTitle;
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = { City: ["Niagara Falls"], Province: ["Ontario"], Tags: ["leash-free", "small-dog-area", "winter-paths"] };

Object.assign(park.raw, {
  "Park Name": "Firemen's Park",
  "Park Header": seoTitle,
  "Park type": "Leash Free",
  Description: body,
  "Street Address": "2275 Dorchester Road",
  latitude: "43.1393137668",
  longitude: "-79.1143228370",
  City: "Niagara Falls",
  Province: "Ontario",
  "Postal Code": "L2J 4L6",
  Fenced: "Not published by the City",
  "Separate Small Dog Area": "Yes",
  "Surface type": "Walking paths; surface composition not published",
  Size: "Not published by the City",
  "Water source available": "Not published; bring water",
  Benches: "Not published for the dog areas",
  "Shaded area": "Not published for the dog areas",
  "Waste bins": "Yes",
  "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Not confirmed for ordinary visits; check event notices",
  "Washrooms nearby": "Not published for the dog areas",
  "Operating hours": "Daily from dawn to dusk, all year, subject to posted closures",
  "Seasonal Restrictions": "Winter paths are maintained; maintenance, event and seasonal closures may be posted",
  "Park Rules": "Use the designated small- or large-dog area; keep dogs in sight and under verbal control; bring no more than three dogs per handler; maintain valid licensing and vaccinations; obey age, health, conduct and prohibited-item rules; follow posted closures.",
  "Park Website or Source": sourceUrl,
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=43.1393137668%2C-79.1143228370",
  Tags: "leash-free,small-dog-area,winter-paths",
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
if (!csvRow) throw new Error("Firemen's Park CSV row not found");
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
    source: "/images/dog-parks/firemens-park-original.png",
    width: 1536,
    height: 1024,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Painterly illustration of two off-leash dogs running with their handler in a grassy, tree-lined area of Firemen's Park",
    derivatives: [480, 960],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Firemen's Park",
    visualReference: "Current City material confirms a grassy dog-park setting within the mature wooded Firemen's Park property but does not provide a dependable close view of the dog-area boundaries or fixtures. The generated scene therefore uses only grass, a walking path and mature deciduous woodland, with fencing, gates and unconfirmed amenities outside the frame."
  },
  reason: "Research completed with current City of Niagara Falls off-leash, licensing, address, park-land, and access-point sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping, and queues are synchronized without carrying forward unsupported amenity claims or the sign-flipped latitude.",
  nextAction: "Mark verification pending, then run the production build, repository QA, parity, image, and targeted rendered checks before passing."
});

console.log("Updated Firemen's Park and removed it from the active improvement queues.");
