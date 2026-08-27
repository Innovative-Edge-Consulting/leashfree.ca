import fs from "node:fs";

const slug = "corbetts-park";
const route = `/dog-parks/${slug}/`;
const jsonPath = "src/data/generated/parks.json";
const csvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const seoTitle = "Corbett's Park | Oshawa Park Guide | LeashFree.ca";
const metaDescription = "Source-backed guide to Corbett's Park in Oshawa, including its Grandview Street North address, playground, sports fields, gazebo, hours, and on-leash status.";
const intro = `<p>Corbett's Park is an <strong>Oshawa neighbourhood park</strong> at <strong>885 Grandview Street North</strong> with an accessible playground, baseball and sports fields, a gazebo, and mature shade trees. It is not one of Oshawa's designated off-leash dog parks, so dogs should remain leashed.</p>`;
const body = `<p>The City of Oshawa's current facility record identifies Corbett's Park as a sports-and-recreation park at 885 Grandview Street North. The official listing describes a place for active and passive recreation, with an accessible playground, baseball field, sports field, gazebo, and many shade trees.</p><p>The park is open daily from 6 a.m. to 10 p.m. The City also lists the sports field as a Class C rental field, so visitors should expect this to be a shared neighbourhood recreation space rather than a dedicated dog facility.</p><p>Oshawa's current off-leash directory names two designated dog areas: Clare Ford off-leash dog park and the enclosed area at Cordova Valley Park. Corbett's Park is not on that list. Oshawa's current responsible-pet guidance says dogs should be leashed in public areas, licensed, and kept under control, and owners must promptly remove pet waste.</p><p>Oshawa's current park listing does not publish details about a dog enclosure, separate small-dog area, drinking water, benches, waste bins, bag dispensers, public parking, or washrooms at Corbett's Park. Plan for a leashed visit, bring water and waste bags, and follow posted field or park notices when you arrive.</p>`;
const faqs = `<p><strong>1. Is Corbett's Park an off-leash dog park?</strong></p><p>No. Oshawa's current off-leash directory identifies Clare Ford and Cordova Valley as the City's two off-leash parks. Corbett's Park is not listed as an off-leash area.</p><p><strong>2. Where is Corbett's Park?</strong></p><p>The City of Oshawa lists the park at 885 Grandview Street North, Oshawa, Ontario, L1K 2J9.</p><p><strong>3. What facilities does the City confirm?</strong></p><p>The current municipal listing confirms an accessible playground, a baseball field, a sports field, a gazebo, and many shade trees.</p><p><strong>4. What are the park hours?</strong></p><p>Oshawa lists Corbett's Park as open every day from 6 a.m. to 10 p.m.</p><p><strong>5. Must dogs stay leashed?</strong></p><p>Yes. Because Corbett's Park is not a designated off-leash area, follow Oshawa's current guidance to keep dogs leashed in public areas and under control.</p><p><strong>6. Are parking, water, benches, washrooms, and dog-waste amenities confirmed?</strong></p><p>No. Oshawa's current park listing does not publish those site-specific details. Bring water and waste bags and verify conditions on arrival.</p>`;
const notes = `<p>Primary sources reviewed on August 25, 2026: <a href="https://www.oshawa.ca/parks-and-facilities/details/?facilityId=TNT-COO-00000261-2BA95E1D-9C77-4A02-A103-6571D6C3D782">City of Oshawa Corbetts Park facility record</a>, <a href="https://www.oshawa.ca/living-here/animal-services/off-leash-parks/">City of Oshawa off-leash parks</a>, <a href="https://www.oshawa.ca/news/posts/responsible-pet-ownership-matters/">City responsible pet ownership guidance</a>, <a href="https://www.oshawa.ca/explore-play/recreation/facilities-and-rentals/sport-field-rentals/">City sport field rentals</a>, and the City of Oshawa GIS park inventory and address locator. Confirmed: Oshawa location, 885 Grandview Street North address, L1K 2J9 postal code, neighbourhood-park classification, playground, baseball and sports fields, accessibility, gazebo, shade trees, daily 6 a.m. to 10 p.m. hours, municipal address coordinates, and absence from Oshawa's two designated off-leash parks. Unknown: dog enclosure, separate small-dog area, surface details, park size, water, benches, waste bins, bag dispensers, parking, and washrooms. The facility directory uses “Corbetts Park” while the municipal GIS inventory uses “Corbett's Park”; the established page name and slug retain the GIS punctuation.</p>`;

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
if (!park) throw new Error("Corbett's Park record not found");

park.name = "Corbett's Park";
park.title = "Corbett's Park | Oshawa Park Guide";
park.seoTitle = seoTitle;
park.metaDescription = metaDescription;
park.description = intro;
park.body = body;
park.media = [];
park.references = {
  City: ["Oshawa"],
  Province: ["Ontario"],
  Tags: ["park-guide", "oshawa", "on-leash", "playground", "sports-fields", "gazebo"]
};

Object.assign(park.raw, {
  "Park Name": "Corbett's Park",
  "Park Header": "Corbett's Park | Oshawa Park Guide",
  "Park type": "On-leash park guide",
  Description: body,
  "Street Address": "885 Grandview St. N.",
  latitude: "43.927513",
  longitude: "-78.835921",
  City: "Oshawa",
  Province: "Ontario",
  "Postal Code": "L1K 2J9",
  Fenced: "No designated off-leash area",
  "Separate Small Dog Area": "No designated off-leash area",
  "Surface type": "Unknown - not specified by the City listing",
  Size: "Unknown - not specified by the City listing",
  "Water source available": "Unknown - not specified by the City listing",
  Benches: "Unknown - not specified by the City listing",
  "Shaded area": "Yes - many shade trees noted by the City",
  "Waste bins": "Unknown - not specified by the City listing",
  "Bag Dispensers": "Unknown - not specified by the City listing",
  "Parking Available": "Unknown - not specified by the City listing",
  "Washrooms nearby": "Unknown - not specified by the City listing",
  "Operating hours": "Daily, 6 a.m. to 10 p.m.",
  "Seasonal Restrictions": "Dogs must remain leashed in public areas; follow posted park and field notices",
  "Park Website or Source": "https://www.oshawa.ca/parks-and-facilities/details/?facilityId=TNT-COO-00000261-2BA95E1D-9C77-4A02-A103-6571D6C3D782",
  "Google Maps Link": "https://www.google.com/maps/place/885+Grandview+St.+N.+Oshawa+Ontario+Canada",
  Tags: "park-guide,oshawa,on-leash,playground,sports-fields,gazebo",
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
const row = rows.find((item, index) => index > 0 && item[headers.indexOf("slug")] === slug);
if (!row) throw new Error("Corbett's Park CSV row not found");
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

console.log("Updated Corbett's Park as an Oshawa on-leash park guide and removed it from active improvement queues.");
