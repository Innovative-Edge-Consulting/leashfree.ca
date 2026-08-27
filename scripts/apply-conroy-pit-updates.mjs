import fs from "node:fs";

const slug = "conroy-pit";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const seoTitle = "Conroy Pit Off-Leash Dog Area | Ottawa | LeashFree.ca";
const metaDescription = "Plan a visit to Conroy Pit, Ottawa's year-round NCC off-leash dog area, with P17 parking, boundary rules, seasonal access, and verified visitor details.";
const intro = `<p>Conroy Pit is a <strong>year-round designated off-leash dog area</strong> in the Pine Grove sector of Ottawa's National Capital Greenbelt. The National Capital Commission directs visitors to parking lot P17 and requires dogs to be leashed outside the marked off-leash area, including in the parking lot.</p>`;
const body = `<p>Conroy Pit sits within Pine Grove, a large Greenbelt forest of natural woods and tree plantations. The National Capital Commission identifies Conroy Pit as a year-round off-leash area, while the broader Pine Grove trail network has different seasonal dog rules. Follow the signs at the site so your dog stays inside the designated boundary.</p><p>Free, year-round parking is available at P17 on Conroy Road. Keep your dog leashed through the parking lot and anywhere outside the off-leash area. Dogs are not permitted at the adjacent Conroy Pit toboggan hill, so winter visitors should take extra care at the boundary between the two uses.</p><p>NCC animal regulations allow no more than two pets per handler. An off-leash dog must remain under control and respond to voice commands or hand signals. Handlers must pick up after their pets, prevent property damage, and keep animals from biting, attacking, chasing, or injuring people or other animals.</p><p>The official sources do not state that the dog area is fenced, provide a measured size, or confirm drinking water, benches, waste bins, bag dispensers, on-site washrooms, a separate small-dog area, or daily opening hours. Pine Grove's trails do not meet universal accessibility standards. Bring water and waste bags, use footwear suited to current natural conditions, and check NCC advisories before leaving.</p>`;
const faqs = `<p><strong>1. Is Conroy Pit an official off-leash dog area?</strong></p><p>Yes. The National Capital Commission identifies Conroy Pit as a designated year-round off-leash area in Ottawa's Pine Grove sector.</p><p><strong>2. Where should visitors park?</strong></p><p>The NCC directs Conroy Pit visitors to P17 on Conroy Road. Parking is free and available year-round.</p><p><strong>3. Can dogs be off leash in the parking lot or throughout Pine Grove?</strong></p><p>No. Dogs must be leashed in the parking lot and everywhere outside Conroy Pit's designated off-leash boundary. Other Pine Grove trails have their own seasonal leash rules.</p><p><strong>4. Are dogs allowed on the Conroy Pit toboggan hill?</strong></p><p>No. The NCC says dogs are not permitted at the toboggan hill beside the off-leash area.</p><p><strong>5. What dog-handling rules apply?</strong></p><p>A handler may bring no more than two pets. Off-leash dogs must remain under control and respond to voice commands or hand signals, and handlers must pick up pet waste.</p><p><strong>6. Is Conroy Pit fenced, and are water or washrooms available?</strong></p><p>The official sources reviewed do not confirm fencing, drinking water, on-site washrooms, benches, waste bins, bag dispensers, or a separate small-dog area. Bring water and waste bags and verify conditions on arrival.</p>`;
const notes = `<p>Primary sources reviewed on August 25, 2026: <a href="https://ncc-ccn.gc.ca/places/pine-grove">National Capital Commission Pine Grove visitor page</a>, <a href="https://ncc-ccn.gc.ca/places/hiking-and-walking-greenbelt">NCC Greenbelt hiking and walking directory</a>, <a href="https://ncc-ccn.gc.ca/regulations">NCC animal regulations</a>, and the <a href="https://medias.ncc-ccn.ca/ncc/documents/national-capital-greenbelt-all-seasons-trail-map.pdf">NCC Greenbelt All Seasons Trail Map</a>. Confirmed: NCC-managed Pine Grove setting; designated year-round off-leash access; P17 as the starting point; free year-round P17 parking; leash required in the parking lot and outside the designated area; dogs prohibited at the toboggan hill; two-pet maximum; voice or hand-signal control; cleanup and safe-handling duties; Pine Grove trails do not meet universal accessibility standards; and P17 map coordinates 45.3622997, -75.6180932 from the NCC-linked parking map. Unknown: fence status, separate small-dog area, precise dog-area surface and size, drinking water, benches, shade within the dog area, waste bins, bag dispensers, on-site P17 washrooms, and daily opening hours. The NCC lists an outhouse by P18, not at P17. The legacy 24-hour and site-amenity claims were not supported by the reviewed official sources.</p>`;

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
if (!park) throw new Error("Conroy Pit record not found");

park.name = "Conroy Pit";
park.title = "Conroy Pit Off-Leash Dog Area | Ottawa";
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = {
  City: ["Ottawa"],
  Province: ["Ontario"],
  Tags: ["off-leash", "ottawa", "national-capital-greenbelt", "pine-grove", "year-round"]
};

Object.assign(park.raw, {
  "Park Name": "Conroy Pit",
  "Park Header": "Conroy Pit Off-Leash Dog Area | Ottawa",
  "Park type": "Leash Free",
  Description: body,
  "Street Address": "P17, Conroy Road",
  latitude: "45.3622997",
  longitude: "-75.6180932",
  City: "Ottawa",
  Province: "Ontario",
  "Postal Code": "",
  Fenced: "Unknown - not specified by NCC sources",
  "Separate Small Dog Area": "Unknown - not specified by NCC sources",
  "Surface type": "Unknown - natural conditions vary",
  Size: "Unknown - not specified by NCC sources",
  "Water source available": "Unknown - not specified by NCC sources",
  Benches: "Unknown - not specified by NCC sources",
  "Shaded area": "Unknown - not specified for the dog area",
  "Waste bins": "Unknown - not specified by NCC sources",
  "Bag Dispensers": "Unknown - not specified by NCC sources",
  "Parking Available": "Yes",
  "Washrooms nearby": "No on-site washroom confirmed at P17; NCC lists an outhouse by P18",
  "Operating hours": "Unknown - check current NCC advisories",
  "Seasonal Restrictions": "Year-round off-leash use only inside the designated area; leash required elsewhere; dogs prohibited at the toboggan hill",
  "Park Website or Source": "https://ncc-ccn.gc.ca/places/pine-grove",
  "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=45.3622997%2C-75.6180932",
  Tags: "off-leash,ottawa,national-capital-greenbelt,pine-grove,year-round",
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
if (!row) throw new Error("Conroy Pit CSV row not found");
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

console.log("Updated Conroy Pit and removed it from the active improvement queues.");
