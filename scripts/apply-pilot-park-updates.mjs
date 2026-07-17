import fs from "node:fs";

const file = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";

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
    "Description": "<p>Confederation Park in Scarborough has a designated fenced off-leash area within a larger city park. The City of Toronto’s off-leash area study lists the site in Ward 24 and records it as fenced, with no separate small-dog area.</p>",
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
    "Operating hours": "Unknown — confirm current hours on site",
    "Park Website or Source": "https://www.toronto.ca/legdocs/mmis/2025/ie/bgrd/backgroundfile-254206.pdf",
    "Tags": "leash-free, fenced, gravel, Scarborough",
    "Notes / Comments": "<p>The off-leash area is part of a multi-use park. Check Toronto signage for current boundaries, hours, and any temporary closures.</p>",
    "Intro Paragraph": "<p>Confederation Park is a fenced off-leash option in Scarborough for dogs that need secure room to play. It sits within a broader recreation park, so visitors should keep dogs leashed until they reach the signed off-leash area.</p>",
    "Media": "/images/dog-parks/confederation-park-toronto-original.png"
  },
  "hampton-dog-park-89f0c": {
    "Description": "<p>Hampton Dog Park is a naturalized off-leash area in Saskatoon’s Hampton Village area, near Junor Avenue and Hampton Circle. The City reports completed upgrades to fencing, signage, waste bins, and parking, with the parking lot now supporting up to 25 vehicles.</p>",
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
    "Operating hours": "Unknown — confirm current hours on site",
    "Park Website or Source": "https://www.saskatoon.ca/services-residents/pet-licensing-animal-services/dog-parks",
    "Tags": "leash-free, naturalized, parking, fencing upgrades",
    "Notes / Comments": "<p>The City describes the park as a naturalized off-leash space and notes recent improvements. Follow current posted signs and keep your dog within sight and under control.</p>",
    "Intro Paragraph": "<p>Hampton Dog Park gives Saskatoon owners a spacious, naturalized setting for off-leash exercise. The City’s current information highlights upgraded fencing, parking, signage, and waste bins; bring a leash for the route to and from the designated area.</p>",
    "Media": "/images/dog-parks/hampton-dog-park-saskatoon-original.png"
  },
  "lee-street-park": {
    "Description": "<p>Lee Street Park is a designated unfenced leash-free area at 71 Lee Street in Guelph. The City lists asphalt trails, a basketball court, a picnic table, and play equipment among the park’s features.</p>",
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
    "Notes / Comments": "<p>The City’s off-leash page directs visitors to its map for the exact designated area. The current corporate policy lists Lee Street Park as a leash-free area from dawn to dusk.</p>",
    "Intro Paragraph": "<p>Lee Street Park offers an unfenced leash-free area in Guelph’s Ward 1. It is a shared neighbourhood park with asphalt trails and other recreation features, so keep your dog under control and follow the marked area and posted rules.</p>",
    "Media": "/images/dog-parks/lee-street-park-guelph-original.png"
  }
};

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const headers = parseCsvLine(lines[0]);
const indexByHeader = Object.fromEntries(headers.map((header, index) => [header, index]));
let changed = 0;
const output = lines.map((line) => {
  if (!line) return line;
  const fields = parseCsvLine(line);
  const update = updates[fields[indexByHeader.slug]];
  if (!update) return line;
  for (const [header, value] of Object.entries(update)) fields[indexByHeader[header]] = value;
  fields[indexByHeader["Updated On"]] = "Thu Jul 16 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";
  changed += 1;
  return csv(fields);
});

fs.writeFileSync(file, output.join("\n"));
console.log(`Updated ${changed} pilot park records.`);
