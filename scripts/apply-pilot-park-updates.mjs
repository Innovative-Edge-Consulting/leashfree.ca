import fs from "node:fs";

const file = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewedOnHeader = "Reviewed On";
const metaTitleHeader = "Meta Title";
const metaDescriptionHeader = "Meta Description";

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

function csv(fields) {
  return fields.map((value) => {
    const field = value ?? "";
    return /[",\r\n]/.test(field) ? `"${field.replaceAll('"', '""')}"` : field;
  }).join(",");
}

const updates = {
  "confederation-park-075b6": {
    "slug": "confederation-park-toronto",
    "Park Header": "Confederation Park Dog Park",
    "Description": "<p>Confederation Park in Scarborough includes a designated fenced off-leash area within a larger multi-use city park. Toronto's 2025 off-leash area study lists this location in Ward 24, confirms that the dog area is fenced, and notes that there is no separate small-dog enclosure.</p><p>The broader park also includes washrooms, parking, sports facilities, and other recreation uses, so visitors should expect shared circulation outside the signed dog zone. Keep dogs leashed until you reach the posted off-leash boundary and check on-site signs for temporary closures or maintenance activity.</p>",
    "Street Address": "200 Markham Rd",
    "Fenced": "Yes",
    "Separate Small Dog Area": "No",
    "Surface type": "Gravel and dirt",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Partial",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes",
    "Washrooms nearby": "Yes",
    "Operating hours": "Unknown - confirm current hours on site",
    "Park Website or Source": "https://www.toronto.ca/legdocs/mmis/2025/ie/bgrd/backgroundfile-254206.pdf",
    "Tags": "leash-free, fenced, gravel, Scarborough",
    "Notes / Comments": "<p>The City facility page identifies Confederation Park as a larger recreation site with amenities beyond the dog area, including washrooms and parking. Use posted signage on arrival to confirm the current off-leash footprint and any active construction or event impacts elsewhere in the park.</p>",
    "Intro Paragraph": "<p>Confederation Park is one of Scarborough's fenced off-leash options for dogs that need a more enclosed place to exercise. It works best for owners who want a designated dog area inside a larger community park rather than a fully separate standalone dog run.</p>",
    "Media": "/images/dog-parks/confederation-park-toronto-original.png"
  },
  "hampton-dog-park-89f0c": {
    "slug": "hampton-dog-park-saskatoon",
    "Park Header": "Hampton Dog Park Saskatoon",
    "Description": "<p>Hampton Dog Park is a naturalized off-leash area in Saskatoon's Hampton Village area, near Junor Avenue, Hampton Circle, and Dawson Way. The City of Saskatoon reports that recent upgrades at this site included fencing work, signage, waste bins, and a parking lot that now supports up to 25 vehicles.</p><p>Because the park is described as a naturalized off-leash space rather than a compact urban dog run, conditions can vary with weather and seasonal ground softness. Review posted signs when you arrive, keep your dog within sight and under control, and bring water if you do not want to rely on amenities that are not clearly confirmed by the City.</p>",
    "Street Address": "North of 33rd Street along Junor Avenue, around Hampton Circle and north on Dawson Way",
    "Fenced": "Partial",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and naturalized terrain",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Yes",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Unknown - confirm current hours on site",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Tags": "leash-free, naturalized, parking, fencing upgrades",
    "Notes / Comments": "<p>The City's current dog park page highlights completed upgrades rather than a full amenities inventory, so treat unlisted features as unconfirmed. This park is a better fit for owners looking for open off-leash room and vehicle access than for those specifically seeking a separate small-dog section or guaranteed water service.</p>",
    "Intro Paragraph": "<p>Hampton Dog Park gives Saskatoon owners a larger naturalized setting for off-leash exercise with better vehicle access than older directory descriptions suggested. Bring a leash for the route in and out, plus waste bags and drinking water if you want to be self-sufficient during your visit.</p>",
    "Media": "/images/dog-parks/hampton-dog-park-saskatoon-original.png"
  },
  "lee-street-park": {
    "Park Header": "Lee Street Park Dog Park",
    "Description": "<p>Lee Street Park is a designated unfenced leash-free area at 71 Lee Street in Guelph. The City park listing identifies asphalt trails, a basketball court, a picnic table, and play equipment as part of the broader park, while the leash-free program confirms that dogs may use the designated off-leash area at this location.</p><p>Because the dog area is unfenced and sits inside a shared neighbourhood park, this site is a better choice for dogs with reliable recall and handlers who are comfortable managing transitions around other park users. Guelph's current leash-free policy lists Lee Street Park as available from dawn to dusk.</p>",
    "Street Address": "71 Lee Street",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass and asphalt paths",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Dawn to dusk",
    "Seasonal Restrictions": "Confirm current boundaries on site",
    "Park Website or Source": "https://guelph.ca/park/lee-street-park/",
    "Tags": "unfenced, asphalt trails, picnic table, Guelph",
    "Notes / Comments": "<p>The City's leash-free map should be used to confirm the exact area before letting your dog off leash, since this is not a fully enclosed dog run. Expect a shared neighbourhood setting and keep dogs under voice control near paths, play spaces, and other park activity.</p>",
    "Intro Paragraph": "<p>Lee Street Park offers an unfenced leash-free area in Guelph's Ward 1. It is a shared neighbourhood park with asphalt trails and other recreation features, so keep your dog under control and follow the marked area and posted rules.</p>",
    "Media": "/images/dog-parks/lee-street-park-guelph-original.png"
  }
};

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const headers = parseCsvLine(lines[0]);
for (const requiredHeader of [reviewedOnHeader, metaTitleHeader, metaDescriptionHeader]) {
  if (!headers.includes(requiredHeader)) headers.push(requiredHeader);
}
const indexByHeader = Object.fromEntries(headers.map((header, index) => [header, index]));
let changed = 0;
const output = [csv(headers)];
for (const line of lines.slice(1)) {
  if (!line) {
    output.push(line);
    continue;
  }
  const fields = parseCsvLine(line);
  while (fields.length < headers.length) fields.push("");
  const update = updates[fields[indexByHeader.slug]];
  if (!update) {
    output.push(csv(fields));
    continue;
  }
  for (const [header, value] of Object.entries(update)) fields[indexByHeader[header]] = value;
  fields[indexByHeader["Updated On"]] = "Fri Jul 17 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";
  fields[indexByHeader[reviewedOnHeader]] = "Fri Jul 17 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";
  fields[indexByHeader[metaTitleHeader]] =
    fields[indexByHeader.slug] === "confederation-park-toronto"
      ? "Confederation Park Dog Park Toronto | Off-Leash Guide"
      : fields[indexByHeader.slug] === "hampton-dog-park-saskatoon"
        ? "Hampton Dog Park Saskatoon | Off-Leash Guide"
        : "Lee Street Park Dog Park Guelph | Off-Leash Guide";
  fields[indexByHeader[metaDescriptionHeader]] =
    fields[indexByHeader.slug] === "confederation-park-toronto"
      ? "Research-backed guide to Confederation Park's fenced off-leash area in Scarborough, Toronto, with source-verified details on fencing, small-dog access, parking, and visit planning."
      : fields[indexByHeader.slug] === "hampton-dog-park-saskatoon"
        ? "Research-backed guide to Hampton Dog Park in Saskatoon, including City-confirmed upgrades, parking access, naturalized terrain, and practical visit notes."
        : "Research-backed guide to Lee Street Park's unfenced leash-free area in Guelph, with City-verified address, hours, shared-park context, and visit tips.";
  changed += 1;
  output.push(csv(fields));
}

fs.writeFileSync(file, output.join("\n"));
console.log(`Updated ${changed} pilot park records.`);
