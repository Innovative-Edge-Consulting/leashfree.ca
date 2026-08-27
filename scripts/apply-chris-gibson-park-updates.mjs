import fs from "node:fs";

const slug = "chris-gibson-park";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const manifestPath = "reports/restart-six-page-audit-manifest.json";
const imagePath = "public/images/dog-parks/chris-gibson-park-original.png";
const seoTitle = "Chris Gibson Park Leash-Free Area | Brampton, Ontario";
const metaDescription = "Plan a visit to Chris Gibson Park's leash-free area in Brampton with its verified location, current dog rules, and construction access notes.";
const intro = `<p>Chris Gibson Park has a <strong>City-designated leash-free area</strong> at 135 McLaughlin Road North in Brampton. Municipal mapping places the dog area within a large community park that also supports outdoor sports and recreation.</p>`;
const body = `<p>Brampton's current park directory lists a leash-free area at Chris Gibson Park, and the City's park-feature map places it near 43.6837429262, -79.7767464074. The wider property is an 18.788-hectare community park with access from McLaughlin Road North, Denison Avenue, Rosset Crescent, Railroad Street and Amsterdam Crescent. Keep dogs leashed outside the marked leash-free boundary and around shared park areas.</p><p>The park directory also lists a splash pad, baseball diamonds and soccer fields in the wider park. These are shared recreation amenities, not part of the dog area. The adjacent Chris Gibson Recreation Centre is at 125 McLaughlin Road North and is closed for a major renovation. The City's project update estimates completion in Q4 2026 and warns that site access, traffic and on-site parking may be adjusted during construction, so check current notices before travelling.</p><p>Current City sources do not publish the dog area's fence details, precise size, surface, drinking water, seating, shade, waste bins or bag dispensers. They also do not confirm public washroom access while the recreation centre is closed. Bring drinking water and waste bags. Brampton's animal by-law refers to marked small- and large-dog areas within leash-free zones, but the City's site-specific pages do not describe the current Chris Gibson layout; use the section identified for your dog on posted signs.</p><p>Brampton's leash-free rules require dogs to be vaccinated against rabies, licensed, spayed or neutered, supervised and leashed while entering and exiting. One person may bring no more than three dogs, puppies under four months are not permitted, and children under ten are prohibited. Dogs with specified dangerous-dog controls or a recorded history of aggression are not allowed. Clean up immediately and use a proper refuse receptacle. The City does not publish dedicated hours for this dog area; follow posted rules and note that the Park Lands By-law restricts loitering from 11 p.m. to 7 a.m.</p>`;
const faqs = `<p><strong>1. Is Chris Gibson Park an official leash-free area?</strong></p><p>Yes. Brampton's current park directory and recreation-centre page both identify a leash-free dog area at Chris Gibson Park.</p><p><strong>2. Where is the dog area?</strong></p><p>The park address is 135 McLaughlin Road North. Brampton's municipal feature map places the leash-free area near 43.6837429262, -79.7767464074 within the wider community park.</p><p><strong>3. Is the leash-free area fenced?</strong></p><p>Current City sources do not publish fence details for the Chris Gibson leash-free area. Follow the marked boundary and keep your dog leashed outside it.</p><p><strong>4. Is there a separate small-dog section?</strong></p><p>Brampton's by-law directs owners to use marked small- and large-dog areas, but the current site-specific pages do not describe the Chris Gibson layout. Follow the size designation posted at the park.</p><p><strong>5. Are parking and washrooms available?</strong></p><p>The recreation-centre project page identifies on-site parking, but temporary access and parking adjustments may apply during construction. The centre is closed, so current public washroom access is not confirmed.</p><p><strong>6. What rules and hours should visitors know?</strong></p><p>Dogs must be vaccinated, licensed, spayed or neutered, supervised and leashed on entry and exit. The limit is three dogs per person; puppies under four months and children under ten are prohibited. No dedicated dog-area hours are published, so follow posted rules and note the park by-law's 11 p.m. to 7 a.m. loitering restriction.</p>`;
const notes = `<p>Primary sources reviewed on August 26, 2026: https://www.brampton.ca/EN/residents/parks/Pages/Find-a-Park.aspx ; https://www.brampton.ca/EN/residents/Animal-Services/pages/off-leash-parks.aspx ; https://www.brampton.ca/EN/City-Hall/Bylaws/All%20Bylaws/Animal%20Services%20By-law%20201-2023.pdf ; https://www.brampton.ca/en/City-Hall/Bylaws/All%20Bylaws/Parkland.PDF ; https://www.brampton.ca/EN/residents/Recreation/Community-Centres/Pages/Chris-Gibson.aspx ; https://www.brampton.ca/EN/residents/Recreation/Revitalized/Pages/Recreation-Revitalized-Chris-Gibson.aspx ; https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/ParksPts/FeatureServer/0 ; https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/ParkFeatures/FeatureServer/0 ; and https://services3.arcgis.com/rl7ACuZkiFsmDA2g/arcgis/rest/services/Planning_Parks/FeatureServer/1 . Confirmed: current leash-free designation; 135 McLaughlin Road North park address; 18.788-hectare wider community park; access points; official leash-free feature point 43.6837429262, -79.7767464074; wider-park splash pad, baseball and soccer assets; current leash-free rules; adjacent recreation-centre closure; Q4 2026 estimated construction completion; and possible temporary access and parking changes. Reasonable inference: the leash-free area remains available because current City directory and mapping records still list it, subject to posted construction access. Unknown: dog-area fencing, precise size, surface, site-specific small-dog layout, water, benches, shade, waste bins, bag dispensers, dedicated hours, current indoor washrooms, postal code and construction-period parking configuration.</p>`;

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
  if (markerIndex < 0) throw new Error("Chris Gibson Park manifest entry not found");
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
  if (end < 0) throw new Error("Chris Gibson Park manifest entry end not found");
  const entry = JSON.parse(text.slice(start, end + 1));
  Object.assign(entry, patch);
  fs.writeFileSync(manifestPath, `${text.slice(0, start)}${JSON.stringify(entry)}${text.slice(end + 1)}`);
}

const parks = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const park = parks.find((item) => item.slug === slug);
if (!park) throw new Error("Chris Gibson Park generated JSON record not found");

park.name = "Chris Gibson Park";
park.title = seoTitle;
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = { City: ["Brampton"], Province: ["Ontario"], Tags: ["leash-free", "brampton", "community-park"] };

Object.assign(park.raw, {
  "Park Name": "Chris Gibson Park",
  "Park Header": seoTitle,
  "Park type": "Leash Free",
  Description: body,
  "Street Address": "135 McLaughlin Rd N",
  latitude: "43.6837429262",
  longitude: "-79.7767464074",
  City: "Brampton",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "Unknown - not documented in current City sources",
  "Separate Small Dog Area": "Follow posted small- and large-dog designations",
  "Surface type": "Unknown - not documented in current City sources",
  Size: "Dog-area size not published; wider park is 18.788 ha",
  "Water source available": "Unknown - bring water for your dog",
  Benches: "Unknown - not documented for the leash-free area",
  "Shaded area": "Unknown - not documented for the leash-free area",
  "Waste bins": "Unknown - not documented for the leash-free area",
  "Bag Dispensers": "Unknown - bring waste bags",
  "Parking Available": "Yes - on-site; temporary construction adjustments may apply",
  "Washrooms nearby": "Not confirmed while the recreation centre is closed",
  "Operating hours": "No dedicated hours published; follow posted rules (loitering restricted 11 p.m.-7 a.m.)",
  "Seasonal Restrictions": "No seasonal schedule published; construction may temporarily affect access and parking through Q4 2026",
  "Park Website or Source": "https://www.brampton.ca/EN/residents/parks/Pages/Find-a-Park.aspx",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=43.6837429262%2C-79.7767464074",
  Tags: "leash-free,brampton,community-park",
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
if (!csvRow) throw new Error("Chris Gibson Park CSV row not found");
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
  verificationBlocker: undefined,
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
    source: "/images/dog-parks/chris-gibson-park-original.png",
    width: 1774,
    height: 886,
    compressedBytes: fs.statSync(imagePath).size,
    alt: "Painterly illustration of two off-leash dogs playing with their handler in a broad tree-lined community park in Brampton",
    derivatives: [480, 960, 1600],
    formats: ["avif", "webp", "jpg"],
    reuse: "unique to Chris Gibson Park"
  },
  reason: "Research completed with current City of Brampton park, animal-services, by-law, recreation-construction, and municipal GIS sources. Visitor copy, SEO, FAQs, generated JSON, CMS CSV, image mapping, unique illustration, responsive derivatives, and queue files are synchronized without carrying forward unsupported amenities.",
  nextAction: "Run production build, repository QA, exact JSON-CSV parity, image uniqueness, and targeted rendered inspection before marking the page passed."
});

console.log("Updated Chris Gibson Park and removed it from the active improvement queues.");
