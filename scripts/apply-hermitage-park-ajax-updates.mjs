import fs from "node:fs";

const slug = "hermitage-park";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/hermitage-park-original.png";
const seoTitle = "Hermitage Leash-Free Dog Park | Ajax, Ontario";
const metaDescription = "Plan a visit to Hermitage Leash-Free Dog Park in Ajax: a fenced grass enclosure with current hours, size, parking, waste facilities, and rules.";
const intro = `<p>Hermitage Leash-Free Dog Park is a <strong>fenced grass enclosure</strong> at the bottom of Hermitage Park in Ajax. The Town's current asset record maps about <strong>1,805 square metres</strong> inside a 1.5-metre post-and-woven-wire fence.</p>`;
const body = `<p>Ajax identifies the bottom of Hermitage Park as a designated leash-free area. The current municipal dog-park inventory records the enclosure as a 2023 installation with a grass surface, a 1.5-metre post-and-woven-wire fence, and an official mapped area of approximately 1,805 square metres.</p><p>The Town lists the Hermitage Park Leash-Free Dog Park waste location at 42/44 Pollard Crescent. A separate municipal parking inventory confirms a Hermitage Park lot off Griffiths Drive on the east side of the larger park. Keep dogs leashed between the parking or street access points and the posted leash-free boundary, especially around shared park paths and recreation facilities.</p><p>Inside the enclosure, the current asset record lists one wooden picnic bench and one waste receptacle. Ajax also identifies an in-ground dog-waste container at the Pollard Crescent access reference; it accepts bagged dog waste, but the Town does not say that bags are supplied. Current records do not identify a separate small-dog section, a dog drinking-water station, shade within the enclosure, or dependable nearby washroom hours, so bring water and waste bags.</p><p>Ajax parks are normally open from 6 a.m. to 11 p.m. unless another time is posted. In a leash-free area, handlers must be at least 18, keep dogs under verbal control and in sight, supervise them continuously, and control no more than three dogs. A dog showing aggressive behaviour must be leashed immediately. Follow all posted closures and keep dogs leashed outside the designated enclosure.</p>`;
const faqs = `<p><strong>1. Is Hermitage Park an official leash-free dog park?</strong></p><p>Yes. Ajax's current outdoor guide designates the bottom of Hermitage Park as a leash-free area, and the Town's asset inventory identifies it as Hermitage Leash-Free Dog Park.</p><p><strong>2. Is the dog park fenced?</strong></p><p>Yes. The municipal asset record lists a 1.5-metre post-and-woven-wire fence around the grass enclosure.</p><p><strong>3. How large is the leash-free area?</strong></p><p>The Town's mapped dog-park polygon covers approximately 1,805 square metres, or about 0.18 hectares.</p><p><strong>4. What facilities are confirmed?</strong></p><p>The current asset record lists one wooden picnic bench and one waste receptacle, and Ajax lists an in-ground dog-waste container at the Pollard Crescent access reference. A separate small-dog area, dog drinking water, shade within the enclosure, bag dispensers, and reliable washroom hours are not confirmed.</p><p><strong>5. What are the park hours?</strong></p><p>Ajax's Parks By-law normally closes parks from 11 p.m. to 6 a.m. Follow any different hours or temporary closures posted at the site.</p><p><strong>6. What leash-free rules apply?</strong></p><p>Handlers must be at least 18, keep dogs under verbal control and in sight, supervise them continuously, and control no more than three dogs. Leash a dog immediately if it shows aggressive behaviour, and keep dogs leashed outside the posted leash-free boundary.</p>`;
const notes = `<p>Primary sources reviewed on August 25, 2026: https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/ ; https://ajax.ca/life-in-ajax/town-services/garbage-recycling/ ; https://ajaxmaps.ajax.ca/gisbert/rest/services/Cityworks/Ops_ES_IAM_PROD/MapServer/67 ; https://ajaxmaps.ajax.ca/gisernie/rest/services/Public/Ajax_Open_Data/MapServer/3 ; https://facilities.ajax.ca/Home/Detail?CategoryIds=&CloseMap=true&FacilityTypeIds=20420&Id=670d55a3-b480-4739-a524-71a63500a7ae&Keywords=&Page=3&ScrollTo=facilityResultsContainer ; https://www.ajax.ca/Modules/bylaws/Bylaw/Download/1d18be84-8f82-4259-91a1-f8ea30eb8751 ; and https://www.ajax.ca/Modules/bylaws/Bylaw/Download/dc5e13f2-b242-4ec1-93c5-a26849a7c2ab . Confirmed: current designation at the bottom of Hermitage Park; Town access reference at 42/44 Pollard Crescent; fenced 2023 grass enclosure; 1.5-metre post-and-woven-wire fence; official mapped polygon of 1,805.327 square metres; one wooden picnic bench; one waste receptacle; nearby in-ground dog-waste container; Hermitage Park parking lot off Griffiths Drive; official polygon centroid at 43.8578201779, -79.0530177105; normal park hours of 6 a.m. to 11 p.m.; and current handler-age, verbal-control, visual-supervision, three-dog maximum, unattended-dog, aggressive-dog, trail-leash, and outside-boundary leash rules. Unknown: separate small-dog area, dog drinking water, shade within the enclosure, bag dispensers, exact washroom operating schedule, postal code, and posted operating-hour exceptions.</p>`;

function updateManifest(patch) {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Hermitage Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex);
  if (start < 0) throw new Error("Hermitage Park manifest entry start not found");
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
    else if (char === "}" && --depth === 0) {
      end = index;
      break;
    }
  }
  if (end < 0) throw new Error("Hermitage Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  fs.writeFileSync(manifestPath, `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`);
}

function parse(text) {
  const out = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      out.push(row);
      row = [];
      value = "";
    } else value += char;
  }
  if (value.length || row.length) {
    row.push(value.replace(/\r$/, ""));
    out.push(row);
  }
  return out;
}

function csv(rows) {
  return `${rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Hermitage Park generated JSON record not found");

park.name = "Hermitage Park";
park.title = seoTitle;
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = {
  City: ["Ajax"],
  Province: ["Ontario"],
  Tags: ["off-leash", "ajax", "fenced", "grass"]
};

Object.assign(park.raw, {
  "Park Name": "Hermitage Park",
  "Park Header": seoTitle,
  "Park type": "Leash Free",
  Description: body,
  "Street Address": "42/44 Pollard Crescent",
  latitude: "43.8578201779",
  longitude: "-79.0530177105",
  City: "Ajax",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "Yes",
  "Separate Small Dog Area": "Unknown - not identified in current Town records",
  "Surface type": "Grass",
  Size: "Approximately 1,805 m² (official mapped polygon)",
  "Water source available": "Unknown - no dog water station identified",
  Benches: "Yes",
  "Shaded area": "Unknown - not specified for the enclosure",
  "Waste bins": "Yes",
  "Bag Dispensers": "Unknown - waste pod accepts bagged waste; bags are not listed",
  "Parking Available": "Yes",
  "Washrooms nearby": "Unknown - no current dog-area washroom schedule published",
  "Operating hours": "Daily, 6 a.m. to 11 p.m., unless otherwise posted",
  "Seasonal Restrictions": "No seasonal schedule published; follow posted closures and conditions",
  "Park Website or Source": "https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=43.8578201779%2C-79.0530177105",
  Tags: "off-leash,ajax,fenced,grass",
  "Notes / Comments": notes,
  "Intro Paragraph": intro,
  Media: "",
  "Reviewed On": "Tue Aug 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)",
  "Meta Title": seoTitle,
  "Meta Description": metaDescription,
  "Dog Park FAQs": faqs
});

fs.writeFileSync(jsonPath, `${JSON.stringify(parks, null, 2)}\n`);

const rows = parse(fs.readFileSync(csvPath, "utf8"));
const headers = rows[0];
for (const key of Object.keys(park.raw)) {
  if (!headers.includes(key)) {
    headers.push(key);
    for (const item of rows.slice(1)) item.push("");
  }
}
const row = rows.find((item, index) => index > 0 && item[headers.indexOf("slug")] === slug);
if (!row) throw new Error("Hermitage Park CSV row not found");
for (const [key, value] of Object.entries(park.raw)) {
  const index = headers.indexOf(key);
  if (index >= 0) row[index] = value;
}
fs.writeFileSync(csvPath, csv(rows));

for (const path of ["reports/thin-page-backlog.csv", "reports/content-review-queue.csv"]) {
  const reportRows = parse(fs.readFileSync(path, "utf8"));
  const routeIndex = reportRows[0].indexOf("route");
  if (routeIndex >= 0) {
    fs.writeFileSync(path, csv([reportRows[0], ...reportRows.slice(1).filter((item) => item[routeIndex] !== route)]));
  }
}

const summaryPath = "reports/thin-page-backlog-summary.md";
const summary = fs.readFileSync(summaryPath, "utf8")
  .split(/\r?\n/)
  .filter((line) => !line.includes(`](${route})`))
  .join("\n");
fs.writeFileSync(summaryPath, summary.endsWith("\n") ? summary : `${summary}\n`);

updateManifest({
  status: "implementation-complete",
  currentRecord: "Ajax's current outdoor page designates the bottom of Hermitage Park as leash-free. The Town's current dog-park asset layer identifies Hermitage Leash-Free Dog Park as a 2023 grass enclosure with a 1.5-metre post-and-woven-wire fence, an approximately 1,805-square-metre mapped polygon, one wooden picnic bench, and one waste receptacle.",
  conflicts: [],
  sourceUrls: [
    "https://ajax.ca/explore/parks-recreation/explore-ajax-outdoors/",
    "https://ajax.ca/life-in-ajax/town-services/garbage-recycling/",
    "https://ajaxmaps.ajax.ca/gisbert/rest/services/Cityworks/Ops_ES_IAM_PROD/MapServer/67",
    "https://ajaxmaps.ajax.ca/gisernie/rest/services/Public/Ajax_Open_Data/MapServer/3",
    "https://facilities.ajax.ca/Home/Detail?CategoryIds=&CloseMap=true&FacilityTypeIds=20420&Id=670d55a3-b480-4739-a524-71a63500a7ae&Keywords=&Page=3&ScrollTo=facilityResultsContainer",
    "https://www.ajax.ca/Modules/bylaws/Bylaw/Download/1d18be84-8f82-4259-91a1-f8ea30eb8751",
    "https://www.ajax.ca/Modules/bylaws/Bylaw/Download/dc5e13f2-b242-4ec1-93c5-a26849a7c2ab"
  ],
  unknowns: [
    "separate small-dog area",
    "dog drinking water",
    "shade within the enclosure",
    "bag dispensers",
    "exact washroom operating schedule",
    "postal code",
    "posted operating-hour exceptions"
  ],
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
    source: "/images/dog-parks/hermitage-park-original.png",
    width: 1672,
    height: 941,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Painterly illustration of two off-leash dogs with their handler inside the grass and woven-wire enclosure at Hermitage Park in Ajax",
    derivatives: [480, 960, 1600],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Ajax's Hermitage Park"
  },
  reason: "Research completed with current Town of Ajax outdoor, park, waste, by-law, parking, and dog-park asset sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, image mapping, source illustration, responsive derivatives, and queue files are synchronized without asserting unknown amenities.",
  nextAction: "Run production build, repository QA, JSON-CSV parity, image uniqueness, and targeted rendered inspection before marking the page passed."
});

console.log("Updated Ajax Hermitage Park and removed it from the active improvement queues.");
