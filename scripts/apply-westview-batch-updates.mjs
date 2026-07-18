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
    if (char === "\"") {
      if (quoted && line[index + 1] === "\"") {
        field += "\"";
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
    return /[",\r\n]/.test(field) ? `"${field.replaceAll("\"", "\"\"")}"` : field;
  }).join(",");
}

const updates = {
  "westview-park-chilliwack": {
    "Park Website or Source": "https://www.chilliwack.com/main/page.cfm?dowhat=amenityView&id=1754&paID=53",
    "Notes / Comments": "<p>Westview Park is not listed on the City of Chilliwack's current official dog off-leash area page. This route is redirected to the Chilliwack city guide until a municipal source confirms that Westview Park has a designated off-leash area.</p>",
    "Intro Paragraph": "<p>This record is retained only as a legacy source row. The live route now redirects to the Chilliwack dog parks city page because the official off-leash list does not currently include Westview Park.</p>",
    "Seasonal Restrictions": "Redirected to Chilliwack city guide pending official confirmation"
  },
  "westview-park-maple-ridge": {
    "Description": "<p>Westview Park is one of Maple Ridge's official off-leash dog park locations listed on the City's Dogs in Parks page. The same City page states that dogs must stay on leash in municipal parks except in posted off-leash areas, and that owners are responsible for picking up and disposing of dog waste.</p><p>The City's Westview Park project page identifies the park address as 20950 Wicklund Avenue and notes that the playground replacement work was completed in 2021. Maple Ridge's dog park planning notes also specifically mention mulch pathway improvements at Westview, which helps distinguish this page from other parks with the same name in other cities.</p>",
    "Street Address": "20950 Wicklund Avenue",
    "Fenced": "Unknown",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass and gravel paths",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Unknown - confirm current posted hours on site",
    "Seasonal Restrictions": "Follow posted off-leash signs and leash rules in other park areas",
    "Park Website or Source": "https://www.mapleridge.ca/art-parks-rec/parks-trails/dogs-parks",
    "Tags": "leash-free, Maple Ridge, municipal off-leash park, neighbourhood park",
    "Notes / Comments": "<p>Maple Ridge's official dog park page lists Westview Park as an off-leash location and states that dogs must be on leash outside designated off-leash areas. The City's project page for Westview Park gives the park address and confirms completed playground work within the broader park.</p>",
    "Intro Paragraph": "<p>Westview Park gives Maple Ridge dog owners a neighbourhood off-leash option that is distinct from the city's larger destination parks. This page is based on the City's current dog park listing plus a separate municipal project page that confirms the park address and broader park context.</p>"
  },
  "westview-park": {
    "Description": "<p>Westview Park is an official Winnipeg off-leash location at 1 Midland Street, near Midland Street and Saskatchewan Avenue. The City's off-leash locations page says the entire park is off-leash and also notes that the space is shared with other users such as walkers, runners, cyclists, skiers, and snowshoers.</p><p>The same City page says off-leash sites are open from 7 a.m. to 11 p.m. or as posted at the site. Because Westview is a large open hill rather than a fenced run, it is better suited to dogs that can handle a broad multi-use setting and owners who are comfortable managing recall around other park activity.</p>",
    "Street Address": "1 Midland St",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Grass and multi-use paths",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Minimal",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown",
    "Washrooms nearby": "Unknown",
    "Operating hours": "7 am - 11 pm or as posted on site",
    "Seasonal Restrictions": "Shared multi-use hill used by walkers, runners, cyclists, skiers, and snowshoers",
    "Park Website or Source": "https://legacy.winnipeg.ca/PublicWorks/Parks/off-leash-dog-areas-locations.stm",
    "Tags": "leash-free, Winnipeg, hilltop park, multi-use",
    "Notes / Comments": "<p>The official Winnipeg off-leash page identifies Westview as an entire-park off-leash area rather than a fenced enclosure. It also warns that the space is multi-use, so visitors should expect other recreation users depending on season and time of day.</p>",
    "Intro Paragraph": "<p>Westview Park is one of Winnipeg's more distinctive off-leash areas because the whole hill is used as open off-leash space instead of a compact fenced dog run. Local visitors often know it as a place for broad skyline views and flexible walking routes, but the official City guidance emphasizes its shared multi-use nature.</p>"
  }
};

const metaTitles = {
  "westview-park-chilliwack": "Chilliwack Dog Parks | Off-Leash Guide | LeashFree.ca",
  "westview-park-maple-ridge": "Westview Park Dog Park Maple Ridge | Off-Leash Guide",
  "westview-park": "Westview Park Dog Park Winnipeg | Off-Leash Guide"
};

const metaDescriptions = {
  "westview-park-chilliwack": "Westview Park is not currently confirmed as an official off-leash area by the City of Chilliwack, so this legacy route now redirects to the Chilliwack dog parks city guide.",
  "westview-park-maple-ridge": "Research-backed guide to Westview Park in Maple Ridge, including official off-leash status, municipal leash rules, address context, and practical visit notes.",
  "westview-park": "Research-backed guide to Westview Park in Winnipeg, including official off-leash status, full-park access, multi-use considerations, and current City hours."
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
  const slug = fields[indexByHeader.slug];
  const update = updates[slug];
  if (!update) {
    output.push(csv(fields));
    continue;
  }
  for (const [header, value] of Object.entries(update)) fields[indexByHeader[header]] = value;
  fields[indexByHeader["Updated On"]] = "Fri Jul 17 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";
  fields[indexByHeader[reviewedOnHeader]] = "Fri Jul 17 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";
  fields[indexByHeader[metaTitleHeader]] = metaTitles[slug];
  fields[indexByHeader[metaDescriptionHeader]] = metaDescriptions[slug];
  changed += 1;
  output.push(csv(fields));
}

fs.writeFileSync(file, output.join("\n"));
console.log(`Updated ${changed} Westview batch records.`);
