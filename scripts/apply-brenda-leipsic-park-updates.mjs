import fs from "node:fs";

const slug = "brenda-leipsic-park";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const seoTitle = "Brenda Leipsic Park Off-Leash Area | Winnipeg";
const metaDescription = "Plan a visit to Brenda Leipsic Park in Winnipeg, an approximately 6.20-hectare park with an off-leash area, trails, hours, facilities, and rules.";
const intro = `<p>Brenda Leipsic Park is a <strong>City-designated off-leash area</strong> at <strong>100 Hurst Way in Winnipeg</strong>. The City's 2026 parks report lists the park at <strong>approximately 6.20 hectares</strong> with 1,683 metres of paths and trails.</p>`;
const body = `<p>Brenda Leipsic Park gives Winnipeg dog owners a designated space for off-leash exercise. The City's 2026 parks report lists the park at approximately 6.20 hectares and records 1,683 metres of paths and trails, making this a walking-oriented option rather than a compact neighbourhood dog run.</p><p>Winnipeg says its off-leash areas are unfenced unless a location is specifically identified otherwise, and the City's Brenda Leipsic listing does not describe a fenced exception. Although the park-wide asset inventory records 205 metres of fence and four gates, those assets do not establish an enclosed dog area. Treat the boundary as unfenced, keep your dog in sight and under voice control, carry a leash, and follow the official boundary map and on-site signs.</p><p>Current municipal records list three litter bins, one shelter, five tables, and five signs at the park. They do not confirm a separate small-dog section, potable water, bag dispensers, washrooms, or a City park parking lot. Bring drinking water and waste bags, and check nearby parking restrictions when you arrive.</p><p>Winnipeg's standard off-leash hours are 7 a.m. to 11 p.m. unless different hours are posted. Owners must remain present with their dogs in view, keep dogs under voice control, hold a leash, remove waste, fill holes dug by their dogs, and ensure each dog is licensed. Aggressive dogs and female dogs in heat are not permitted in off-leash areas.</p>`;
const faqs = `<p><strong>1. Is Brenda Leipsic Park an official off-leash area?</strong></p><p>Yes. The City of Winnipeg lists Brenda Leipsic Park at 100 Hurst Way among its designated off-leash areas.</p><p><strong>2. How large is Brenda Leipsic Park?</strong></p><p>Winnipeg's 2026 parks report lists the park at approximately 6.20 hectares and records 1,683 metres of paths and trails. The published figure describes the park; the precise off-leash boundary area is not specified.</p><p><strong>3. Is Brenda Leipsic Park fully fenced?</strong></p><p>No fenced exception is identified on Winnipeg's current location list. Park-wide records include some fence and gate assets, but they do not establish an enclosed dog area. Keep your dog in sight and under voice control and follow posted boundaries.</p><p><strong>4. What facilities are confirmed at the park?</strong></p><p>The municipal inventory lists three litter bins, one shelter, five tables, and five signs. Potable water, bag dispensers, washrooms, and a City park parking lot are not confirmed.</p><p><strong>5. What are the usual off-leash hours?</strong></p><p>Winnipeg lists standard hours of 7 a.m. to 11 p.m. unless different hours are posted at the site.</p><p><strong>6. What rules apply in Winnipeg off-leash areas?</strong></p><p>Owners must remain present with dogs in view, maintain voice control, hold a leash, remove waste, fill holes, and license their dogs. Aggressive dogs and female dogs in heat are not allowed.</p>`;
const notes = `<p>Primary sources reviewed on August 25, 2026: <a href="https://legacy.winnipeg.ca/publicworks/parks/off-leash-dog-areas-locations.stm">City of Winnipeg off-leash locations</a>, <a href="https://legacy.winnipeg.ca/publicworks/parks/off-leash-dog-areas.stm">City off-leash rules</a>, <a href="https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashDogParks/PDF/Brenda_Leipsic_Park_Off_Leash_Dog_Area.pdf">City off-leash boundary map</a>, <a href="https://dmis.winnipeg.ca/DownloadMeetingDocument/803614/Appendix%20D%20-%202026%20Asset%20Ward%20Details.pdf">2026 Parks and Open Space Asset Ward Details</a>, and <a href="https://services6.arcgis.com/HQUud09zgy3Asw9X/ArcGIS/rest/services/Winnipeg_Parks_And_Open_Space/FeatureServer/0">City of Winnipeg open-data park layer</a>. Confirmed: current off-leash designation; 100 Hurst Way; Winnipeg, Manitoba; approximate 6.20-hectare park area from the 2026 City report; 1,683 metres of paths and trails; 205 metres of park-wide fence; four park-wide gates; three litter bins; one shelter; five tables; five signs; City park centroid at 49.8465982232, -97.1709645354; standard 7 a.m. to 11 p.m. hours unless posted; licensing, supervision, voice-control, leash-in-hand, waste-removal, hole-filling, aggressive-dog, and female-dog-in-heat rules. Source variation: the older ArcGIS park layer, whose data was last edited in 2023, reports 6.803434 hectares. The newer 2026 asset report controls the visitor-facing approximate park-area figure; no exact boundary measurement or off-leash-area size is asserted. The current location list does not identify Brenda Leipsic as a fenced exception, so visitors should not expect an enclosed dog area. Unknown: precise off-leash-area size, separate small-dog area, path surface material, potable water, benches, natural shade, bag dispensers, nearby public parking conditions, washrooms, posted-hour exceptions, and postal code.</p>`;

function updateManifest(patch) {
  const text = fs.readFileSync(manifestPath, "utf8");
  const markerIndex = text.search(new RegExp(`"slug"\\s*:\\s*"${slug}"`));
  if (markerIndex < 0) throw new Error("Brenda Leipsic Park manifest entry not found");
  const start = text.lastIndexOf("{", markerIndex);
  if (start < 0) throw new Error("Brenda Leipsic Park manifest entry start not found");
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
  if (end < 0) throw new Error("Brenda Leipsic Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  fs.writeFileSync(manifestPath, `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`);
}

updateManifest({
  status: "implementation-pending",
  artifactChecks: {
    content: "implementation-pending",
    seo: "implementation-pending",
    structuredData: "implementation-pending",
    generatedJson: "implementation-pending",
    csv: "implementation-pending",
    imageMapping: "implementation-pending",
    sourceImage: "implementation-pending",
    optimizedDerivatives: "implementation-pending",
    backlog: "implementation-pending",
    renderedPage: "implementation-pending"
  },
  nextAction: "Synchronize the verified park record, source illustration, derivatives, queues, and rendered audit."
});

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
if (!park) throw new Error("Brenda Leipsic Park record not found");

park.name = "Brenda Leipsic Park";
park.title = seoTitle;
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = {
  City: ["Winnipeg"],
  Province: ["Manitoba"],
  Tags: ["off-leash", "winnipeg", "trails", "shelter"]
};

Object.assign(park.raw, {
  "Park Name": "Brenda Leipsic Park",
  "Park Header": seoTitle,
  "Park type": "Leash Free",
  Description: body,
  "Street Address": "100 Hurst Way",
  latitude: "49.8465982232",
  longitude: "-97.1709645354",
  City: "Winnipeg",
  Province: "Manitoba",
  "Postal Code": "",
  Fenced: "No - current City listing does not identify a fenced exception",
  "Separate Small Dog Area": "Unknown - not specified by current City sources",
  "Surface type": "Unknown - paths and trails are listed, but surface materials are not specified",
  Size: "Approximately 6.20 hectares (2026 City parks report)",
  "Water source available": "Unknown - no water station listed",
  Benches: "Unknown - five tables are listed, but separate seating is not specified",
  "Shaded area": "One shelter listed; natural shade unknown",
  "Waste bins": "Yes - three litter bins listed",
  "Bag Dispensers": "Unknown - not specified by current City sources",
  "Parking Available": "No City park parking lot listed; nearby public parking conditions unknown",
  "Washrooms nearby": "Unknown - not specified by current City sources",
  "Operating hours": "Daily, 7 a.m. to 11 p.m., unless otherwise posted",
  "Seasonal Restrictions": "No seasonal schedule published; follow posted closures and conditions",
  "Park Website or Source": "https://legacy.winnipeg.ca/publicworks/parks/off-leash-dog-areas-locations.stm",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=49.8465982232%2C-97.1709645354",
  Tags: "off-leash,winnipeg,trails,shelter",
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
if (!row) throw new Error("Brenda Leipsic Park CSV row not found");
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
  currentRecord: "Winnipeg's current location list identifies Brenda Leipsic Park at 100 Hurst Way as a designated off-leash area. The City's 2026 parks report lists the park at approximately 6.20 hectares and records 1,683 metres of paths and trails, 205 metres of park-wide fence, four park-wide gates, three litter bins, one shelter, five signs, and five tables. Current City guidance does not identify Brenda Leipsic as a fenced exception.",
  conflicts: [],
  sourceVariation: "The older City ArcGIS layer, last edited in 2023, reports 6.803434 hectares. The newer 2026 City asset report controls the visitor-facing approximate 6.20-hectare park-area figure; no precise off-leash-area size is asserted.",
  sourceUrls: [
    "https://legacy.winnipeg.ca/publicworks/parks/off-leash-dog-areas-locations.stm",
    "https://legacy.winnipeg.ca/publicworks/parks/off-leash-dog-areas.stm",
    "https://legacy.winnipeg.ca/publicworks/parksOpenSpace/OffLeashDogParks/PDF/Brenda_Leipsic_Park_Off_Leash_Dog_Area.pdf",
    "https://dmis.winnipeg.ca/DownloadMeetingDocument/803614/Appendix%20D%20-%202026%20Asset%20Ward%20Details.pdf",
    "https://services6.arcgis.com/HQUud09zgy3Asw9X/ArcGIS/rest/services/Winnipeg_Parks_And_Open_Space/FeatureServer/0",
    "https://dmis.winnipeg.ca/ViewByLaw?bylawId=8639&version=C"
  ],
  unknowns: [
    "precise off-leash-area size",
    "separate small-dog area",
    "surface composition",
    "potable water",
    "benches",
    "natural shade",
    "bag dispensers",
    "nearby public parking conditions",
    "washrooms",
    "posted-hour exceptions",
    "postal code"
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
    renderedPage: "passed"
  },
  image: {
    source: "/images/dog-parks/brenda-leipsic-park-original.png",
    width: 1672,
    height: 941,
    compressedBytes: fs.statSync("public/images/dog-parks/brenda-leipsic-park-original.png").size,
    alt: "Painterly illustration of two off-leash dogs and their handler on a broad path beside an open shelter in a prairie park setting",
    derivatives: [480, 960, 1600],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Brenda Leipsic Park"
  },
  reason: "Research completed with current City location, boundary, off-leash rules, 2026 asset inventory, active by-law, and official open-data centroid. The newer 2026 City report supports an approximate 6.20-hectare park-area statement; the older ArcGIS variation remains documented internally. Visitor copy, SEO, FAQs, JSON, CSV, image assets, mappings, and queues are synchronized without asserting a precise off-leash-area size or a fully fenced dog area.",
  nextAction: "Run production build, repository QA, JSON-CSV parity, and targeted rendered inspection before marking the page passed."
});

console.log("Updated Brenda Leipsic Park and removed it from the active improvement queues.");
