import fs from "node:fs";

const slug = "hamilton-beach";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/hamilton-beach-original.png";
const seoTitle = "Hamilton Beach On-Leash Guide | Hamilton, Ontario";
const metaDescription = "Plan an on-leash walk through approximately 93 hectares at Confederation Beach Park: current hours, paved trail, beach restriction, parking, and rules.";
const sourceUrl = "https://conservationhamilton.ca/conservation-areas/confederation-park/";
const sourceUrls = [
  sourceUrl,
  "https://conservationhamilton.ca/rules-and-regulations-at-conservation-areas/",
  "https://conservationhamilton.ca/blog/your-guide-to-a-day-at-the-beach/",
  "https://conservationhamilton.ca/trail-safety-etiquette/",
  "https://www.hamilton.ca/home-neighbourhood/animals-pets/responsible-pet-ownership/pet-etiquette-city-properties",
  "https://www.hamilton.ca/home-neighbourhood/animals-pets/dogs/dog-parks-and-free-running-areas",
  "https://www.hamilton.ca/sites/default/files/2023-03/animal-hamilton-dog-parks-map.pdf",
  "https://www.hamilton.ca/things-do/parks-green-space/parks-trails/parkfinder",
  "https://services.arcgis.com/rYz782eMbySr2srL/arcgis/rest/services/Parks_OD/FeatureServer/6",
  "https://conservationhamilton.ca/wp-content/uploads/2023/04/Confed-Park-Map-2023.pdf",
  "https://www.hamilton.ca/things-do/parks-green-space/creating-improving-parks/park-projects/confederation-beach-park"
];
const areaVariation = "The City project page's approximately 93-hectare total park-area figure controls visitor wording. The current Open Hamilton Parks polygon reports 96.444 hectares; that modest boundary-layer variation is retained only in internal notes and does not block publication.";
const intro = `<p>Hamilton Beach is an on-leash guide to the approximately 93-hectare Confederation Beach Park and its paved Hamilton Beach Trail, not a leash-free dog park. Dogs may join you on marked park trails, but they must stay leashed and are not permitted on the beach.</p>`;
const body = `<p>Hamilton Beach is an on-leash guide to Confederation Beach Park and the paved Hamilton Beach Trail, not a leash-free dog park. Dogs may join you on marked park trails, but they must stay leashed and are not permitted on the beach.</p><p>The wider waterfront park covers approximately 93 hectares. Use 680 Van Wagners Beach Road, Hamilton, Ontario L8E 3L8 for trip planning. The map uses the current City park polygon centroid at 43.2501726941, -79.7537066673 as a central reference for this large waterfront destination. Follow the park's wayfinding signs to your chosen parking lot and trail entrance.</p><p>The Hamilton Conservation Authority describes a 4.3-kilometre paved Hamilton Beach Trail through Confederation Beach Park. The promenade connects west to another 4.2 kilometres of Waterfront Trail toward the Burlington ship canal, making the area suitable for anything from a short lakefront outing to a longer shared-path walk. Keep your dog close when passing cyclists, runners and other trail users.</p><p>Dogs must remain on a leash shorter than 2 metres and under control. Keep to marked trails, clean up after your dog, do not allow pets to disturb wildlife and follow posted instructions. The beach is not a designated pet beach, so do not take your dog onto the sand or into the swimming area.</p><p>The wider park has picnic tables, garbage receptacles, washrooms shown on the official park map and accessible parking spaces in several named lots. Washroom schedules and ordinary parking availability can vary, and a dog drinking-water source or bag dispenser is not confirmed. Bring water and waste bags, especially for a longer walk.</p><p>Confederation Beach Park is open daily from 6 a.m. to 11 p.m. unless otherwise posted. Check current park and shoreline alerts before leaving, obey temporary closures and remember that beach water conditions do not change the no-pets-on-the-beach rule.</p>`;
const faqs = `<p><strong>1. Is Hamilton Beach a leash-free dog park?</strong></p><p>No. This page covers an on-leash visit to Confederation Beach Park and Hamilton Beach Trail. Use one of Hamilton's designated leash-free parks when your dog needs off-leash exercise.</p><p><strong>2. Can dogs go onto the beach?</strong></p><p>No. Hamilton Conservation Authority rules prohibit pets on beaches unless an area is specifically designated for pets, and Confederation Beach Park is not listed as a pet beach.</p><p><strong>3. What hours does Confederation Beach Park follow?</strong></p><p>The park is open seven days a week from 6 a.m. to 11 p.m. unless otherwise posted.</p><p><strong>4. How long is Hamilton Beach Trail?</strong></p><p>The paved Hamilton Beach Trail runs 4.3 kilometres through the park and connects west to another 4.2 kilometres of Waterfront Trail toward the Burlington ship canal.</p><p><strong>5. How large is Confederation Beach Park?</strong></p><p>The City describes the wider waterfront park as approximately 93 hectares. That is the total park area, not a separate dog area.</p><p><strong>6. Are parking and washrooms available?</strong></p><p>Yes. The official listing identifies accessible spaces in several park lots, and the official park map shows washrooms. Availability and washroom schedules can vary, so check signs when you arrive.</p><p><strong>7. What should I bring for my dog?</strong></p><p>Bring a leash shorter than 2 metres, waste bags and drinking water. Keep your dog under control and on marked trails, and stay off the beach.</p>`;
const notes = `<p>Primary sources reviewed on August 27, 2026: ${sourceUrls.join(" ; ")} . Confirmed: current Confederation Beach Park identity; approximately 93-hectare total park area from the current City project page; on-leash trail access; no pets on the beach; 680 Van Wagners Beach Road, L8E 3L8; daily 6 a.m.-11 p.m. hours unless posted; paved 4.3 km Hamilton Beach Trail and 4.2 km westward Waterfront Trail connection; City ownership with HCA operation; free entrance; picnic tables; accessible parking; mapped washrooms; garbage receptacles; current City Wide/Waterfront GIS classification; polygon centroid 43.2501726941, -79.7537066673. Reasonable inference: retain the established Hamilton Beach route as an on-leash guide and use the current municipal park centroid as its stable map reference. Source variation resolved under the established approximate-area policy: the City project page's approximately 93-hectare figure controls visitor wording, while the live Open Hamilton Parks layer, last edited August 2, 2026, reports 96.444 hectares as a modest polygon-boundary variation retained only internally. Unknown: precise surveyed boundary area, physical perimeter fencing, small-dog area, potable dog water, bag dispensers, separate bench locations, point-specific shade, washroom schedule, ordinary lot availability and temporary closures.</p>`;

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

function updateManifest(patch, nextPriorityPage = "Hamilton Beach") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Hamilton Beach manifest entry not found");
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
  if (end < 0) throw new Error("Hamilton Beach manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  if (Array.isArray(patch.conflicts) && patch.conflicts.length === 0) delete entry.blockingIssues;
  if (patch.status === "passed") delete entry.blockingIssues;
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  if (patch.status === "passed") updated = updated.replace(/"blockingIssues"\s*:\s*\[[^\]]*\]/, `"blockingIssues": []`);
  fs.writeFileSync(manifestPath, updated);
}

if (process.argv.includes("--mark-research-pending")) {
  updateManifest({
    status: "research-pending",
    nextAction: "Revalidate the conflicting current official area records and supporting park, trail, facility, and dog-access sources before changing visitor-facing artifacts."
  });
  console.log("Marked Hamilton Beach research-pending for current official-source revalidation.");
  process.exit(0);
}

if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", nextAction: "Implement the researched conflict-safe copy, data, image, mapping, queues, and audit artifacts together." });
  console.log("Marked Hamilton Beach implementation-pending.");
  process.exit(0);
}

if (process.argv.includes("--mark-research-complete")) {
  updateManifest({
    status: "research-complete",
    conflicts: [],
    sourceVariation: areaVariation,
    nextAction: "Apply the established approximate-area policy using the City project-page figure, then rerun production and targeted verification."
  });
  console.log("Marked Hamilton Beach research-complete after official-source revalidation.");
  process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Hamilton Beach generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("Hamilton Beach source image not found");

park.name = "Hamilton Beach";
park.title = seoTitle;
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = { City: ["Hamilton"], Province: ["Ontario"], Tags: ["on-leash", "waterfront-trail", "paved-trail"] };

Object.assign(park.raw, {
  "Park Name": "Hamilton Beach",
  "Park Header": seoTitle,
  "Park type": "On-leash park guide",
  Description: body,
  "Street Address": "680 Van Wagners Beach Road",
  latitude: "43.2501726941",
  longitude: "-79.7537066673",
  City: "Hamilton",
  Province: "Ontario",
  "Postal Code": "L8E 3L8",
  Fenced: "",
  "Separate Small Dog Area": "",
  "Surface type": "4.3 km paved Hamilton Beach Trail",
  Size: "Approximately 93 hectares (total park area)",
  "Water source available": "Not confirmed; bring water",
  Benches: "",
  "Shaded area": "",
  "Waste bins": "Yes",
  "Bag Dispensers": "Not confirmed; bring waste bags",
  "Parking Available": "Yes",
  "Washrooms nearby": "Yes",
  "Operating hours": "Daily 6 a.m. to 11 p.m., unless otherwise posted",
  "Seasonal Restrictions": "Dogs are not permitted on the beach; obey posted alerts and temporary closures",
  "Park Rules": "Keep dogs on a leash shorter than 2 metres and under control; stay on marked trails; clean up pet waste; keep pets off the beach; do not disturb wildlife; follow posted instructions.",
  "Park Website or Source": sourceUrl,
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=43.2501726941%2C-79.7537066673",
  Tags: "on-leash,waterfront-trail,paved-trail,no-beach-access",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  Media: "",
  "Reviewed On": "Thu Aug 27 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
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
if (!csvRow) throw new Error("Hamilton Beach CSV row not found");
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
  conflicts: [],
  sourceUrls,
  sourceVariation: areaVariation,
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
    source: "/images/dog-parks/hamilton-beach-original.png",
    alt: "Realistic digital illustration of a leashed dog and handler on the paved Hamilton Beach Trail beside Lake Ontario",
    derivatives: [480, 960],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Hamilton Beach",
    visualReference: "Current Hamilton Conservation Authority photographs show a broad Lake Ontario shoreline, beach grass, scattered deciduous trees, sand and rock protection. The generated scene uses those confirmed characteristics but places the leashed dog and handler on the paved shared trail, away from the beach, and does not copy an official photograph's composition."
  },
  reason: "Research completed with current City of Hamilton and Hamilton Conservation Authority park, trail, pet-rule, live dog-park listing, leash-free map, park map, and municipal GIS sources. The established approximate-area policy uses the current City project page's approximately 93-hectare total park figure while retaining the GIS polygon variation internally. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping, and queues are synchronized.",
  nextAction: "Mark verification pending, run the production build, repository QA, parity, image, and targeted rendered checks, then pass the page if every check succeeds."
});

console.log("Updated Hamilton Beach and removed it from the active improvement queues.");
