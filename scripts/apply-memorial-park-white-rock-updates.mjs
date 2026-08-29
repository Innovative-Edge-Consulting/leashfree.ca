import fs from "node:fs";

const slug = "memorial-park-white-rock";
const route = `/dog-parks/${slug}/`;
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const parksPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const imagePath = "public/images/dog-parks/memorial-park-white-rock-original.png";

const seoTitle = "Memorial Park Dog Guide | White Rock, BC | LeashFree.ca";
const metaDescription = "Plan a leashed visit to Memorial Park in White Rock: waterfront lawn, benches, washrooms, spray pad, paid parking, hours, promenade access and dog rules.";
const intro = "<p>Memorial Park is a compact <strong>on-leash waterfront park</strong> beside White Rock Pier and the Promenade. Its sloped lawn, paved plaza, seating and views across Semiahmoo Bay suit a short leashed outing, but it is not one of White Rock&apos;s off-leash areas.</p>";
const body = "<p>White Rock identifies the fenced dog park in <strong>Ruth Johnson Park</strong> as the city&apos;s off-leash destination. At Memorial Park, dogs stay leashed and under control. The current visitor address is <strong>15300 Block Marine Drive</strong>, and the municipal park polygon places the centre of the compact waterfront site at approximately <strong>49.0213194049, -122.8062016774</strong>.</p><p>The park&apos;s accessible design includes a sloped green lawn, a paved plaza, a wider connection to the Promenade, benches and built-in seating, lighting, a spray pad and nearby Pier washrooms. The spray pad is not identified as a dog-drinking source, so bring water and a bowl. The City&apos;s regular park guidance is <strong>dawn to dusk</strong>; a separate waterfront rule also prohibits remaining in Memorial Park between 2 a.m. and 5 a.m. Events or maintenance can change access, so follow posted notices.</p><p>Paid waterfront parking is available along Marine Drive and in nearby waterfront facilities. Payment normally applies from 10 a.m. to midnight, and parking east of Oxford Street is generally limited to four hours outside the parkades. Availability can tighten during waterfront events.</p><p>Keep the park, Promenade, beach and pier rules distinct. Dogs are never permitted on White Rock Pier. On the adjacent Promenade, leashed dogs are allowed from <strong>5:30 a.m. to 9 a.m. from April 1 through September 30</strong> and at any time from <strong>October 1 through March 31</strong>. Bring waste bags, remove waste immediately and use the marked access routes without taking a dog onto the pier.</p>";
const parkRules = "Keep dogs on a leash no longer than three metres and under immediate control in public places; use a leash no longer than two metres on the Promenade; do not take dogs onto White Rock Pier; carry waste bags and remove waste immediately; follow posted closures and seasonal waterfront rules.";
const faqs = "<p><strong>1. Is Memorial Park in White Rock an off-leash dog park?</strong></p><p>No. Memorial Park is an on-leash waterfront park. White Rock identifies the fenced dog park in Ruth Johnson Park as its off-leash destination.</p><p><strong>2. Can dogs visit Memorial Park year-round?</strong></p><p>White Rock allows leashed dogs in most parks year-round. Keep your dog leashed at Memorial Park and follow any event or maintenance notices.</p><p><strong>3. What are Memorial Park&apos;s hours?</strong></p><p>The City lists regular park hours as dawn to dusk. The waterfront-park bylaw also prohibits remaining in Memorial Park between 2 a.m. and 5 a.m.</p><p><strong>4. What facilities are at Memorial Park?</strong></p><p>The park has an accessible sloped lawn and plaza, benches and built-in seating, a spray pad, lighting, a widened Promenade connection and nearby Pier washrooms.</p><p><strong>5. Can dogs use the nearby Promenade or pier?</strong></p><p>Dogs are never allowed on White Rock Pier. The Promenade permits leashed dogs from 5:30 a.m. to 9 a.m. from April 1 through September 30 and at any time from October 1 through March 31.</p><p><strong>6. Is parking available near Memorial Park?</strong></p><p>Yes, paid waterfront parking is available nearby. Check posted rates, time limits, event restrictions and space availability when you arrive.</p>";
const notes = "Research reviewed 2026-08-27. Official sources: https://www.whiterockcity.ca/799/Dogs-in-White-Rock ; https://www.whiterockcity.ca/398/Parks ; https://www.whiterockcity.ca/m/newsflash/Home/Detail/4698 ; https://www.whiterockcity.ca/683/Public-Pay-Parking ; https://www.whiterockcity.ca/401/Pier-Promenade ; https://www.whiterockcity.ca/DocumentCenter/View/271/Consolidated---Animal-Control-and-Licensing-Bylaw-2012-Number-1959-PDF ; https://www.whiterockcity.ca/DocumentCenter/View/2071/Consolidated---Parks-Regulation-Bylaw-1977-No-675-PDF ; https://maps.whiterockcity.ca/server/rest/services/opendata/Parks_Dataset_Package/MapServer/16 . Confirmed: on-leash status, Ruth Johnson as the named off-leash site, visitor-directory address, GIS centroid and mapped area, regular hours plus overnight restriction, lawn/plaza/accessibility/seating/spray-pad/washroom features, paid waterfront parking, pier and Promenade rules, cleanup and licensing rules. Inferences: GIS polygon centroid is the most stable map point; approximately 0.30 hectares is calculated from the municipal polygon. Unknown: surveyed area, perimeter fencing unrelated to dog access, potable dog water, shade coverage, park-specific waste-bin and bag-dispenser locations, washroom schedule, parking availability, postal code and temporary closures. Source variation: visitor directory says 15300 Block Marine Drive; GIS attribute says 15000 Marine Dr. The visitor address controls display and GIS geometry controls the centroid.";

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

function updateManifest(patch, nextPriorityPage = "Memorial Park") {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Memorial Park manifest entry not found");
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
  if (end < 0) throw new Error("Memorial Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

function rebuildBacklogSummary() {
  const backlogPath = "reports/thin-page-backlog.csv";
  const rows = parseCsv(fs.readFileSync(backlogPath, "utf8"));
  const headers = rows[0];
  const records = rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((key, index) => [key, row[index] ?? ""])));
  const countBy = (field) => [...records.reduce((map, row) => map.set(row[field] || "", (map.get(row[field] || "") || 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);
  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = records.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n");
  fs.writeFileSync("reports/thin-page-backlog-summary.md", `# Thin Page Improvement Backlog\n\nGenerated from \`reports/content-health.json\` on 2026-07-22.\n\nThis backlog contains ${records.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.\n\n## Backlog counts\n\n| Tier | Pages |\n| --- | ---: |\n${tierRows}\n\n| Content type | Pages |\n| --- | ---: |\n${sectionRows}\n\n## Prioritization\n\n- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.\n- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.\n- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.\n- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.\n\nDo not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.\n\n## First 50 pages\n\n| # | Tier | Type | Page | Score | Words | Missing source |\n| ---: | --- | --- | --- | ---: | ---: | --- |\n${topRows}\n`);
}

if (process.argv.includes("--mark-research-pending")) {
  updateManifest({
    status: "research-pending",
    nextAction: "Revalidate the current City park, dog, waterfront, parking, bylaw, project, and GIS sources before changing visitor-facing artifacts."
  });
  console.log("Marked Memorial Park research-pending for current official-source revalidation.");
  process.exit(0);
}

if (process.argv.includes("--mark-research-complete")) {
  updateManifest({
    status: "research-complete",
    conflicts: [],
    nextAction: "Apply the current official-source findings across copy, data, image, queues, and audit artifacts together."
  });
  console.log("Marked Memorial Park research-complete after current official-source revalidation.");
  process.exit(0);
}

if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({ status: "implementation-pending", nextAction: "Implement the researched copy, data, image, mapping, queues, and audit artifacts together." });
  console.log("Marked Memorial Park implementation-pending.");
  process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(parksPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Memorial Park generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("Memorial Park source image not found");

Object.assign(park, {
  name: "Memorial Park",
  title: "Memorial Park On-Leash Guide",
  seoTitle,
  metaDescription,
  description: intro,
  body,
  media: [],
  references: { City: ["White Rock"], Province: ["British Columbia"], Tags: ["on-leash", "waterfront", "accessible", "paid-parking", "washrooms"] }
});

Object.assign(park.raw, {
  "Park Name": "Memorial Park",
  "Park Header": "Memorial Park On-Leash Guide",
  "Park type": "On-leash park guide",
  Description: body,
  "Street Address": "15300 Block Marine Drive",
  latitude: "49.0213194049",
  longitude: "-122.8062016774",
  City: "White Rock",
  Province: "British Columbia",
  "Postal Code": "",
  Fenced: "No designated dog enclosure; leashed visits only",
  "Separate Small Dog Area": "No designated small-dog area",
  "Surface type": "Sloped grass lawn, paved plaza and Promenade access",
  Size: "Approximately 0.30 hectares in the municipal park polygon",
  "Water source available": "No potable dog water published; bring water",
  Benches: "Yes",
  "Shaded area": "Not published by the City",
  "Waste bins": "Not published specifically for Memorial Park",
  "Bag Dispensers": "Not published; bring waste bags",
  "Parking Available": "Paid waterfront parking nearby; observe posted limits",
  "Washrooms nearby": "Yes",
  "Operating hours": "Dawn to dusk; waterfront park area closed 2 a.m. to 5 a.m.",
  "Seasonal Restrictions": "Dogs stay leashed in Memorial Park; adjacent Promenade hours vary by season; dogs are never allowed on White Rock Pier",
  "Park Rules": parkRules,
  "Park Website or Source": "https://www.whiterockcity.ca/398/Parks",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=49.0213194049%2C-122.8062016774",
  Tags: "on-leash,waterfront,accessible,paid-parking,washrooms",
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
if (!csvRow) throw new Error("Memorial Park CMS CSV row not found");
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
    source: "/images/dog-parks/memorial-park-white-rock-original.png",
    width: 1536,
    height: 1024,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Realistic digital illustration of a leashed dog and handler beside the sloped waterfront lawn at Memorial Park in White Rock",
    derivatives: [480, 960],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Memorial Park in White Rock",
    visualReference: "The current City park photograph shows a compact sloped lawn, curving paved waterfront edge, benches, Semiahmoo Bay at low tide, and a wooded coastal hillside. The generated illustration uses those confirmed characteristics from a different composition, excludes signs and public-art replicas, and shows one dog leashed in the park rather than on the beach or pier."
  },
  reason: "Implementation completed from current City park, dog, waterfront, parking, bylaw, project, and GIS research. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping, and queues are synchronized.",
  nextAction: "Mark verification pending, then run the production build, repository QA, parity, image, and targeted rendered checks before passing."
});

console.log("Updated Memorial Park and removed it from the active improvement queues.");
