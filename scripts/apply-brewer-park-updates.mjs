import fs from "node:fs";

const slug = "brewer-park";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const seoTitle = "Brewer Park Off-Leash Area | Ottawa";
const metaDescription = "Plan a Brewer Park visit in Ottawa with verified mixed off-leash boundaries, the 100 Brewer Way address, free parking, hours, rules, and facilities.";
const intro = `<p>Brewer Park is an <strong>accessible Ottawa district park</strong> at <strong>100 Brewer Way</strong> with a mixed dog designation. Dogs may be off leash only in the designated southern area and on the Cameron Street path toward the Rideau River; dogs are prohibited throughout the rest of the park.</p>`;
const body = `<p>The City of Ottawa's current park inventory classifies Brewer Park as an accessible district park for active recreation. Its mixed dog designation is important: Ottawa uses “Dogs Allowed” for areas where dogs may be off leash, but only within the permitted boundaries. At Brewer Park, dogs are allowed south of the berm and parking lot and on the path from Cameron Street toward the Rideau River. Dogs are prohibited in every other part of the park.</p><p>This is a shared park setting, not a confirmed fenced dog enclosure. Keep your dog in sight and under voice control, carry a leash, and leash promptly if a confrontation could develop. Ottawa also prohibits dogs within five metres of play structures, wading pools, and splash pads, apart from the limited moving-through exception for a leashed dog on an asphalt path.</p><p>The City's inventory confirms the 100 Brewer Way address, free parking in three park lots, accessible parking spaces, benches, and waste bins in the wider park. Brewer Park also has sports fields, ball diamonds, playground equipment, a splash pad, a gazebo, and seasonal outdoor rinks, but these are outside the dog-access guidance and do not expand the designated dog area.</p><p>Ottawa's general park guidance says parks are open daily from 5 a.m. to 11 p.m. unless signs state otherwise. Current City sources do not confirm dog-area fencing, a separate small-dog area, the dog-area surface or size, drinking water, dog-area shade, bag dispensers, or year-round washrooms. Bring water and waste bags, use only the signed dog-permitted area, and check posted notices when you arrive.</p>`;
const faqs = `<p><strong>1. Is Brewer Park an off-leash dog park?</strong></p><p>Brewer Park has a mixed designation. Dogs may be off leash only in the City's designated Dogs Allowed area; dogs are prohibited throughout the rest of the park.</p><p><strong>2. Where are dogs allowed at Brewer Park?</strong></p><p>The City allows dogs south of the berm and parking lot and on the path from Cameron Street toward the Rideau River. Follow on-site signs because all other park areas prohibit dogs.</p><p><strong>3. Is the Brewer Park dog area fenced?</strong></p><p>Current City sources do not confirm a fenced dog enclosure or a separate small-dog section. Keep your dog in sight and under voice control and carry a leash.</p><p><strong>4. Is parking available?</strong></p><p>Yes. Ottawa's park inventory lists three free parking lots at 100 Brewer Way, including accessible spaces. Follow posted parking restrictions.</p><p><strong>5. What are Brewer Park's hours?</strong></p><p>Ottawa's general park guidance says parks are open daily from 5 a.m. to 11 p.m. unless different hours are posted.</p><p><strong>6. What rules apply to dogs?</strong></p><p>Use only the designated dog-permitted area, keep your dog in sight and under voice control, leash promptly if a confrontation could develop, stay at least five metres from play and pool areas, and remove your dog's waste.</p>`;
const notes = `<p>Primary sources reviewed on August 25, 2026: <a href="https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/map-dogs-parks">City of Ottawa dogs-in-parks map</a>, <a href="https://maps.ottawa.ca/arcgis/rest/services/Parks_Inventory/MapServer/24">City Parks Inventory park layer</a>, <a href="https://maps.ottawa.ca/arcgis/rest/services/Parks_Inventory/MapServer/14">City parking layer</a>, <a href="https://maps.ottawa.ca/arcgis/rest/services/Parks_Inventory/MapServer/30">City park-furniture table</a>, <a href="https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/dogs-parks">City dog-designation guidance</a>, <a href="https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/animal-care-and-control-law-no-2003-077">Animal Care and Control By-law</a>, <a href="https://ottawa.ca/en/living-ottawa/laws-licences-and-permits/laws/laws-z/parks-and-facilities-law-no-2025-251">Parks and Facilities By-law</a>, <a href="https://ottawa.ca/en/recreation-and-parks/facilities-and-rentals/parks-and-green-space">City park-amenities guidance</a>, and <a href="https://ottawa.ca/en/arts-heritage-and-events/public-art-and-city-ottawa-art-collection/art-search/play-pals">City public-art location record</a>. Confirmed: Brewer Park name; 100 Brewer Way, Ottawa, K1S 5T1 address; municipal park-centroid coordinates; accessible district-park classification; mixed dog designation; dog access south of the berm and parking lot and on the Cameron Street path toward the Rideau River; prohibition in all other park areas; general 5 a.m. to 11 p.m. hours unless posted; three free park lots including accessible spaces; benches and waste bins in the wider park; handler-control, five-metre, and waste-removal rules. Unknown: dog-area fencing, separate small-dog area, dog-area surface and size, drinking water, dog-area shade, bag dispensers, and year-round washrooms. Legacy fenced-run, grass, seasonal-water, and dedicated dog-amenity claims are unsupported by current City sources.</p>`;

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
if (!park) throw new Error("Brewer Park record not found");

park.name = "Brewer Park";
park.title = "Brewer Park Off-Leash Area | Ottawa";
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = {
  City: ["Ottawa"],
  Province: ["Ontario"],
  Tags: ["off-leash", "mixed-designation", "ottawa", "riverside-path", "parking"]
};

Object.assign(park.raw, {
  "Park Name": "Brewer Park",
  "Park Header": "Brewer Park Off-Leash Area | Ottawa",
  "Park type": "Leash Free",
  Description: body,
  "Street Address": "100 Brewer Way",
  latitude: "45.38696719",
  longitude: "-75.6889477",
  City: "Ottawa",
  Province: "Ontario",
  "Postal Code": "K1S 5T1",
  Fenced: "Unknown - no dog enclosure confirmed by current City sources",
  "Separate Small Dog Area": "Unknown - not specified by current City sources",
  "Surface type": "Unknown - not specified for the designated dog area",
  Size: "Unknown - not specified for the designated dog area",
  "Water source available": "Unknown - Rideau River access is not drinking-water confirmation",
  Benches: "Yes - in the wider park",
  "Shaded area": "Unknown - not specified for the designated dog area",
  "Waste bins": "Yes - in the wider park",
  "Bag Dispensers": "Unknown - not specified by current City sources",
  "Parking Available": "Yes",
  "Washrooms nearby": "Seasonal toilets are listed with rink facilities; year-round access unknown",
  "Operating hours": "Daily, 5 a.m. to 11 p.m., unless otherwise posted",
  "Seasonal Restrictions": "No seasonal dog-access schedule published; use only the signed dog-permitted area and follow temporary closures",
  "Park Website or Source": "https://ottawa.ca/en/recreation-and-parks/parks-facilities-and-rentals/outdoor-recreation/parks/dog-parks/map-dogs-parks",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=45.38696719%2C-75.6889477",
  Tags: "off-leash,mixed-designation,ottawa,riverside-path,parking",
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
if (!row) throw new Error("Brewer Park CSV row not found");
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

console.log("Updated Brewer Park and removed it from the active improvement queues.");
