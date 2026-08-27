import fs from "node:fs";

const slug = "ajax-waterfront-park";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/ajax-waterfront-park-original.png";
const seoTitle = "Ajax Waterfront Park Guide | Ajax, Ontario";
const metaDescription = "Plan a leashed dog walk at Ajax Waterfront: Lake Ontario parkland, an asphalt multi-use trail, current leash rules, hours, parking, and visitor tips.";
const intro = `<p>Ajax Waterfront is an <strong>on-leash park guide</strong>, not a designated off-leash dog park. The Town describes more than 150 acres of public waterfront space with six kilometres of Lake Ontario parkland and an asphalt multi-use trail more than seven kilometres long.</p>`;
const body = `<p>Ajax Waterfront stretches across the Town's Lake Ontario shoreline through natural and maintained parkland. The current Town leash-free list does not include Ajax Waterfront, and the municipal dog-park layer has no Ajax Waterfront dog-park polygon. Keep dogs leashed throughout this shared waterfront destination and use a designated Ajax leash-free area for off-leash exercise.</p><p>The map on this page uses 43.8214755746, -79.0100068494, the calculated centroid of the Town's 5.03-hectare Ajax Waterfront open-space segment associated with Lake Driveway East. Ajax Waterfront is a broad, multi-segment destination with several access points, so treat Lake Driveway East as a central reference rather than the only entrance.</p><p>The Town describes an asphalt multi-use trail more than seven kilometres long within more than 150 acres of public waterfront space. The route is shared by people walking, jogging, cycling and in-line skating. Keep the leash short enough that it does not impede other users. The waterfront page identifies washrooms at the Rotary Park and Carruthers Marsh pavilions, while the Town's pet-waste program lists containers at several waterfront nodes. Washroom hours, bag dispensers and a potable dog-water source are not published for the mapped reference point, so bring water and waste bags.</p><p>Six Town waterfront parking lots serve the broader shoreline. From May 15 to September 15, weekend and holiday controls apply: registered Ajax residents can use designated waterfront parking without charge, while non-resident visitors must pay in designated areas. Confirm the current zone, rate and signs before leaving your vehicle.</p><p>Ajax parks normally close from 11 p.m. to 6 a.m. The Dog and Cat By-law requires a leash no longer than 1.8 metres on or within three metres of a multi-use path or off-road trail, prohibits dogs from running at large, and requires immediate waste removal. Dogs are also prohibited within two metres of playgrounds, play structures, wading pools, spray pads and splash pads unless passing on a Town-designed multi-use pathway or off-road trail. Follow posted closures and site-specific notices.</p>`;
const faqs = `<p><strong>1. Is Ajax Waterfront an off-leash dog park?</strong></p><p>No. The Town's current leash-free list and dog-park layer do not designate Ajax Waterfront itself as leash-free. Keep dogs leashed and use a named Ajax leash-free area for off-leash exercise.</p><p><strong>2. What kind of route does Ajax Waterfront offer?</strong></p><p>The Town describes more than 150 acres of public waterfront space, six kilometres of Lake Ontario parkland and an asphalt multi-use trail more than seven kilometres long.</p><p><strong>3. Where does this page's map point lead?</strong></p><p>It uses the official centroid of a 5.03-hectare Ajax Waterfront open-space segment associated with Lake Driveway East. The waterfront has several segments and access points, so this is a central reference rather than the only entrance.</p><p><strong>4. Is waterfront parking available?</strong></p><p>Yes. The Town lists six waterfront parking lots. Seasonal controls run from May 15 to September 15 on weekends and holidays; check the current zone, registration requirements, rates and posted signs.</p><p><strong>5. Are washrooms, waste containers and dog water available?</strong></p><p>The waterfront page identifies washrooms at Rotary Park and Carruthers Marsh pavilions, and Ajax lists pet-waste containers at several waterfront nodes. Hours, bag dispensers and potable dog water are not confirmed for the mapped reference point, so bring water and waste bags.</p><p><strong>6. What leash rules and hours apply?</strong></p><p>Parks normally close from 11 p.m. to 6 a.m. Ajax requires a leash no longer than 1.8 metres on or within three metres of multi-use and off-road trails. Pick up waste immediately and follow posted dog restrictions and closures.</p>`;
const notes = `<p>Primary sources reviewed on August 26, 2026: https://ajax.ca/explore/parks-recreation/beaches-waterfronts-conservation/ ; https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/ ; https://ajax.ca/town-hall/governance-accountability/by-law/parking/ ; https://ajax.ca/life-in-ajax/town-services/garbage-recycling/ ; https://www.ajax.ca/Modules/bylaws/Bylaw/Download/1d18be84-8f82-4259-91a1-f8ea30eb8751 ; https://www.ajax.ca/Modules/bylaws/Bylaw/Download/dc5e13f2-b242-4ec1-93c5-a26849a7c2ab ; https://ajaxmaps.ajax.ca/gisernie/rest/services/Public/Ajax_Open_Data/MapServer/22 ; and https://ajaxmaps.ajax.ca/gisbert/rest/services/Cityworks/Ops_ES_IAM_PROD/MapServer/67 . Confirmed: Ajax Waterfront open-space records; more than 150 acres of public space; six kilometres of Lake Ontario parkland; an asphalt multi-use trail over seven kilometres long; absence from the current leash-free list and dog-park layer; 1.8-metre trail leash rule; cleanup and park rules; 6 a.m.-11 p.m. park hours; six waterfront parking lots and seasonal controls; selected waterfront pet-waste locations; and official central-segment centroid 43.8214755746, -79.0100068494. Reasonable inference: Lake Driveway East is a central reference rather than a single exclusive entrance, and the destination should be presented as an on-leash guide. Unknown: dog shoreline or water access, potable dog water, separate small-dog area, fencing outside ordinary park boundaries, bench and shade coverage at the reference point, bag dispensers, washroom hours and distance, postal code and temporary closures.</p>`;

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

function updateManifest(patch, nextPriorityPage) {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Ajax Waterfront Park manifest entry not found");
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
  if (end < 0) throw new Error("Ajax Waterfront Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  let updated = `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`;
  updated = updated.replace(/"overallStatus"\s*:\s*"[^"]+"/, `"overallStatus": "${patch.status}"`);
  if (nextPriorityPage) updated = updated.replace(/"nextPriorityPage"\s*:\s*"[^"]+"/, `"nextPriorityPage": "${nextPriorityPage}"`);
  fs.writeFileSync(manifestPath, updated);
}

if (process.argv.includes("--mark-implementation-pending")) {
  updateManifest({
    status: "implementation-pending",
    nextAction: "Implement the researched copy, data, image, mapping, queues, and audit artifacts together."
  });
  console.log("Marked Ajax Waterfront Park implementation-pending.");
  process.exit(0);
}

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Ajax Waterfront Park generated JSON record not found");
if (!fs.existsSync(imagePath)) throw new Error("Ajax Waterfront Park source image not found");

park.name = "Ajax Waterfront Park";
park.title = seoTitle;
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = { City: ["Ajax"], Province: ["Ontario"], Tags: ["on-leash", "waterfront", "multi-use-trail", "lake-ontario"] };

Object.assign(park.raw, {
  "Park Name": "Ajax Waterfront Park",
  "Park Header": seoTitle,
  "Park type": "On-leash park guide",
  Description: body,
  "Street Address": "Lake Driveway E",
  latitude: "43.8214755746",
  longitude: "-79.0100068494",
  City: "Ajax",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "No designated dog enclosure",
  "Separate Small Dog Area": "No designated small-dog area",
  "Surface type": "Asphalt multi-use trail; natural and maintained parkland",
  Size: "More than 150 acres of waterfront public space",
  "Water source available": "Unknown - no potable dog-water source confirmed",
  Benches: "Unknown at the mapped reference point",
  "Shaded area": "Varies by waterfront segment; not documented at the mapped reference point",
  "Waste bins": "Pet-waste containers at selected waterfront nodes",
  "Bag Dispensers": "Unknown - bring waste bags",
  "Parking Available": "Yes",
  "Washrooms nearby": "At Rotary Park and Carruthers Marsh pavilions; hours not published on the waterfront page",
  "Operating hours": "6 a.m.–11 p.m. unless otherwise authorized or posted",
  "Seasonal Restrictions": "Dogs remain leashed; May 15–September 15 weekend and holiday parking controls apply",
  "Park Rules": "Keep dogs leashed on a leash no longer than 1.8 metres on or within three metres of multi-use and off-road trails; prevent dogs from running at large; remove waste immediately; obey posted dog restrictions and closures.",
  "Park Website or Source": "https://ajax.ca/explore/parks-recreation/beaches-waterfronts-conservation/",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=43.8214755746%2C-79.0100068494",
  Tags: "on-leash,waterfront,multi-use-trail,lake-ontario",
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
if (!csvRow) throw new Error("Ajax Waterfront Park CSV row not found");
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
    source: "/images/dog-parks/ajax-waterfront-park-original.png",
    width: 1672,
    height: 941,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Painterly illustration of a leashed dog and handler on the asphalt trail beside Lake Ontario at Ajax Waterfront",
    derivatives: [480, 960, 1600],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Ajax Waterfront Park"
  },
  reason: "Research completed with current Town of Ajax waterfront, leash-free, parking, pet-waste, by-law, and municipal GIS sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, unique illustration, responsive derivatives, image mapping, and queues are synchronized without carrying forward unsupported off-leash or amenity claims.",
  nextAction: "Run production build, repository QA, JSON-CSV parity, image uniqueness, and targeted rendered inspection before marking the page passed."
});

console.log("Updated Ajax Waterfront Park and removed it from the active improvement queues.");
