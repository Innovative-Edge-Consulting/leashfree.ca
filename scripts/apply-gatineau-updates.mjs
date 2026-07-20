import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Sun Jul 19 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";

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

function updateCityCsv() {
  const raw = fs.readFileSync(cityFile, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  if (!headers.includes("Reviewed On")) headers.push("Reviewed On");
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  let updated = false;

  const nextLines = [csv(headers)];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (!line) continue;
    const values = parseCsvLine(line);
    while (values.length < headers.length) values.push("");
    if (values[headerIndex.get("Slug")] === "gatineau") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Gatineau");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Gatineau, Quebec | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to Gatineau dog parks, including current city-listed off-leash areas, exercise zones, dog licensing rules, and leash requirements.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Gatineau is a much stronger city page than the old draft suggested because the Ville de Gatineau publishes a current list of where dogs are allowed off leash, where dedicated exercise areas exist, and what licensing and leash rules apply in public. That makes it possible to replace generic claims about \"over 10 parks\" with a factual guide built from the City's current dog-parks, licensing, and regulation pages.</p>");
      set("About Section", "<p>As of July 19, 2026, Gatineau's official dog-parks page divides dog-friendly spaces into three groups. Dogs are allowed off leash at three city-listed sites: Parc Jardins-Lavigne basin, Parc de la Technologie, and the fenced north portion of Parc du Lac-Beauchamp accessed from boulevard Saint-René Est opposite 757 Saint-René Est. The same current page separately lists four aires d'exercices canins: Parc Allen, Domaine Fairview, Parc Lamarche, and the terrain de la caserne Cadieux-Laflamme.</p><p>The city's current animal rules add useful planning detail. In parks where dogs must stay leashed, the leash can be no longer than 1.85 metres, dogs weighing 20 kilograms or more must wear a halter or harness attached to the leash, and retractable leashes are not recommended. Gatineau also requires every dog to have a valid licence, wear its city tag, and stay vaccinated. Those rules matter because they tell visitors exactly how to handle transitions outside designated off-leash spaces. For a stronger city guide, the best approach is to highlight a few representative official sites, explain the city-wide leash and licensing requirements, and avoid inventing amenities that the current municipal page does not clearly assign to each park.</p>");
      set("Featured Park 1", "parc-allen-dog-exercise-area");
      set("Featured Park 2", "parc-de-la-technologie-off-leash-area");
      set("Featured Park 3", "lac-beauchamp-north-off-leash-area");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Snow and ice change footing quickly in Gatineau parks and access paths, so keep dogs leashed until you are fully inside the designated off-leash or exercise area.</li><li><strong>Spring:</strong> Mud and thaw conditions are common on park edges and trail connections. Bring towels and use controlled exits.</li><li><strong>Summer:</strong> Bring water unless you have confirmed a safe source on site. City-listed dog spaces vary a lot in shade and services.</li><li><strong>Fall:</strong> Cooler weather is often ideal for longer outings, but leaf cover and shorter daylight can make recall harder near wooded edges.</li></ul>");
      set("Park Rules", "<p><strong>Know the official categories:</strong> Gatineau currently lists three sites where dogs are allowed off leash and four dedicated dog exercise areas.</p><p><strong>Leash rules outside off-leash zones:</strong> In parks where dogs must stay leashed, the City says the leash can be no longer than 1.85 metres, and dogs weighing 20 kilograms or more must wear a halter or harness attached to the leash.</p><p><strong>Dog requirements:</strong> The City says dogs using these spaces must have a valid licence, wear their city tag, and be vaccinated.</p><p><strong>Owner responsibilities:</strong> Owners must control their dogs, respect the code of conduct and other users, and immediately pick up and dispose of waste.</p><p><strong>Use the right site:</strong> Lac-Beauchamp's off-leash access is limited to the fenced north portion of the park, reached from the Saint-René Est side, not the entire park.</p>");
      set("City Website", "https://www.gatineau.ca/portail/default.aspx?p=guichet_municipal%2Fanimaux%2Fchiens%2Fchiens_dans_parcs");
      set("Province Page", "https://leashfree.ca/dog-parks/qc/");
      set("Dog Park Etiquettes", "<p><strong>1. Treat the city's park list as your ground truth.</strong></p><p>Gatineau clearly distinguishes between full off-leash permissions and dedicated exercise areas, so do not assume every green space is dog-friendly in the same way.</p><p><strong>2. Manage the transitions.</strong></p><p>The city's 1.85 metre leash rule matters most before and after you enter the designated dog space.</p><p><strong>3. Keep your dog's city tag current and visible.</strong></p><p>Gatineau requires a valid licence and city tag, which helps if a dog slips out of an off-leash area.</p><p><strong>4. Do not overread Lac-Beauchamp access.</strong></p><p>The city only allows off-leash use in the fenced north portion of the park, not across the full recreation site.</p><p><strong>5. Choose the quieter official site when your dog needs less stimulation.</strong></p><p>Gatineau offers both urban exercise areas and a more natural park option, so matching the site to your dog's temperament is part of responsible handling.</p>");
      set("Dog Park FAQs", "<p><strong>1. How many official dog spaces does Gatineau currently list?</strong></p><p>Seven. The City currently lists three places where dogs are allowed off leash and four dedicated dog exercise areas.</p><p><strong>2. Does Gatineau require a dog licence?</strong></p><p>Yes. The City requires every dog to be registered, renewed annually, and to wear its city tag.</p><p><strong>3. What is the leash rule in regular parks?</strong></p><p>Where dogs must stay leashed, Gatineau says the leash can be no longer than 1.85 metres.</p><p><strong>4. Are large dogs subject to extra equipment rules?</strong></p><p>Yes. The City says dogs weighing 20 kilograms or more must wear a halter or harness attached to the leash in on-leash public settings.</p><p><strong>5. Is all of Lac-Beauchamp off leash?</strong></p><p>No. The City limits off-leash access to the fenced north portion of the park, entered from the Saint-René Est side opposite 757 Saint-René Est.</p>");
      set("Nearby Cities", "Ottawa, Laval");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Gatineau row not found in city CSV.");
  fs.writeFileSync(cityFile, `${nextLines.join("\n")}\n`);
}

function upsertParkRow(lines, headers, slug, data) {
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const targetIndex = lines.findIndex((line, index) => index > 0 && parseCsvLine(line)[headerIndex.get("slug")] === slug);
  const row = Array(headers.length).fill("");
  const set = (field, value) => {
    row[headerIndex.get(field)] = value;
  };
  for (const [field, value] of Object.entries(data)) set(field, value);
  const encoded = csv(row);

  if (targetIndex === -1) {
    lines.push(encoded);
  } else {
    lines[targetIndex] = encoded;
  }
}

function updateParkCsv() {
  const raw = fs.readFileSync(parkFile, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((line, index, arr) => !(index === arr.length - 1 && line === ""));
  const headers = parseCsvLine(lines[0]);
  for (const header of ["Reviewed On", "Meta Title", "Meta Description"]) {
    if (!headers.includes(header)) headers.push(header);
  }

  const common = {
    "Collection ID": "683758b0a3f8a696dfc417b0",
    "Locale ID": "683758b09dd1e3ac2e4e9809",
    "Archived": "false",
    "Draft": "false",
    "Created On": reviewDate,
    "Updated On": reviewDate,
    "Published On": reviewDate,
    "City": "Gatineau",
    "Province": "Quebec",
    "Reviewed On": reviewDate
  };

  upsertParkRow(lines, headers, "parc-allen-dog-exercise-area", {
    ...common,
    "Park Name": "Parc Allen Dog Exercise Area",
    "slug": "parc-allen-dog-exercise-area",
    "Item ID": "parc-allen-dog-exercise-area-20260719",
    "Park Header": "Parc Allen Dog Exercise Area",
    "Park type": "Leash Free",
    "Description": "<p>Parc Allen is one of Gatineau's current official aires d'exercices canins. The City's dog-parks page lists it under the Aylmer sector, which makes it a confirmed municipal dog-exercise destination rather than a user-submitted guess.</p><p>The reviewed municipal source set is stronger on status and rules than on amenities. Gatineau's current dog guidance says dogs using exercise areas must have a valid licence, wear their city tag, and be vaccinated. Owners must also respect the code of conduct and other users, while city-wide animal rules require immediate waste pickup and controlled handling in public.</p><p>Because the current city dog-parks page does not clearly publish a fuller feature sheet for Parc Allen, this listing stays conservative about fencing, seating, water, and parking. The value of the page is that it tells visitors Parc Allen is a current official exercise area and places it within Gatineau's published dog-rule framework.</p>",
    "Street Address": "Parc Allen",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Unknown - verify on arrival",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Unknown",
    "Size": "Unknown",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Unknown - check posted signage",
    "Seasonal Restrictions": "Check posted signage and local conditions before use",
    "Park Website or Source": "https://www.gatineau.ca/portail/default.aspx?p=guichet_municipal%2Fanimaux%2Fchiens%2Fchiens_dans_parcs",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Parc+Allen+Gatineau+QC",
    "Tags": "leash-free, Gatineau, Quebec, dog exercise area, Aylmer",
    "Notes / Comments": "<p>Parc Allen is explicitly listed by the Ville de Gatineau as a current aire d'exercices canins. Amenity details were intentionally left conservative because the reviewed city page confirms status more clearly than park features.</p>",
    "Intro Paragraph": "<p>Parc Allen is an official Gatineau dog exercise area in the Aylmer sector. Bring your own essentials and verify on-site rules and layout when you arrive.</p>",
    "Media": "",
    "Meta Title": "Parc Allen Dog Exercise Area | Gatineau",
    "Meta Description": "Source-backed guide to Parc Allen Dog Exercise Area in Gatineau, Quebec, including current city status and dog-rule requirements."
  });

  upsertParkRow(lines, headers, "parc-de-la-technologie-off-leash-area", {
    ...common,
    "Park Name": "Parc de la Technologie Off-Leash Area",
    "slug": "parc-de-la-technologie-off-leash-area",
    "Item ID": "parc-de-la-technologie-off-leash-area-20260719",
    "Park Header": "Parc de la Technologie Off-Leash Area",
    "Park type": "Leash Free",
    "Description": "<p>Parc de la Technologie is one of Gatineau's current official locations where dogs are allowed off leash. The City lists it directly under the Hull sector on the current chiens dans les parcs page, which gives this record stronger support than a generic \"dog park in Gatineau\" summary.</p><p>As with several Gatineau dog listings, the current city source is clearer about permission and rules than about park furniture. Dogs using city dog spaces must have a valid licence, wear their city tag, and be vaccinated. Owners must control their dogs, respect other users, and immediately pick up waste.</p><p>That means the strongest use of this page is practical planning: confirm that Parc de la Technologie is a current off-leash location, understand the city-wide handling rules that still apply outside the designated space, and avoid assuming site-specific features that the municipal page does not clearly publish.</p>",
    "Street Address": "Parc de la Technologie",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Unknown - verify on arrival",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Unknown",
    "Size": "Unknown",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Unknown - check posted signage",
    "Seasonal Restrictions": "Check posted signage and local conditions before use",
    "Park Website or Source": "https://www.gatineau.ca/portail/default.aspx?p=guichet_municipal%2Fanimaux%2Fchiens%2Fchiens_dans_parcs",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=Parc+de+la+Technologie+Gatineau+QC",
    "Tags": "leash-free, Gatineau, Quebec, off-leash area, Hull",
    "Notes / Comments": "<p>The Ville de Gatineau explicitly lists Parc de la Technologie as a current place where dogs are allowed off leash. This record remains conservative about detailed amenities because the reviewed city page does not clearly publish them.</p>",
    "Intro Paragraph": "<p>Parc de la Technologie is one of Gatineau's official off-leash dog locations. Use the city's posted rules and verify current park signage on arrival.</p>",
    "Media": "",
    "Meta Title": "Parc de la Technologie Off-Leash Area | Gatineau",
    "Meta Description": "Source-backed guide to Parc de la Technologie Off-Leash Area in Gatineau, Quebec, including current city status and dog-rule requirements."
  });

  upsertParkRow(lines, headers, "lac-beauchamp-north-off-leash-area", {
    ...common,
    "Park Name": "Lac-Beauchamp North Off-Leash Area",
    "slug": "lac-beauchamp-north-off-leash-area",
    "Item ID": "lac-beauchamp-north-off-leash-area-20260719",
    "Park Header": "Lac-Beauchamp North Off-Leash Area",
    "Park type": "Leash Free",
    "Description": "<p>The north off-leash area at Parc du Lac-Beauchamp is the most location-specific dog listing currently published by the Ville de Gatineau. The City's current dog-parks page says dogs are allowed off leash only in the fenced north portion of Lac-Beauchamp, reached by the path opposite 757 boulevard Saint-René Est, north of the railway line crossing the park.</p><p>That precision matters because the broader Lac-Beauchamp recreation park is much larger than the off-leash zone itself. The main park page confirms the park address as 741 boulevard Maloney Est and describes it as a major outdoor site with free access and parking, but dog owners should not interpret that as blanket off-leash permission across the full property. The official dog page is explicit that off-leash use is limited to the fenced north section accessed from the Saint-René Est side.</p><p>Gatineau's current dog rules still apply. Dogs using the off-leash area must have a valid licence, wear their city tag, and be vaccinated. Outside the designated dog space, handlers should return to the City's standard leash and control rules.</p>",
    "Street Address": "Opposite 757 boulevard Saint-René Est",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Unknown",
    "Size": "Unknown",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Yes - broader park access and parking are free",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Unknown - check posted signage",
    "Seasonal Restrictions": "Use only in the fenced north portion identified by the City",
    "Park Website or Source": "https://www.gatineau.ca/portail/default.aspx?p=guichet_municipal%2Fanimaux%2Fchiens%2Fchiens_dans_parcs",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=757+boulevard+Saint-Rene+Est+Gatineau+QC",
    "Tags": "leash-free, Gatineau, Quebec, Lac-Beauchamp, fenced off-leash area",
    "Notes / Comments": "<p>The official dog page says off-leash access is limited to the fenced north portion of Lac-Beauchamp entered from the Saint-René Est side. The broader Lac-Beauchamp park page was used only for general park context and main address.</p>",
    "Intro Paragraph": "<p>Lac-Beauchamp North Off-Leash Area is Gatineau's most clearly defined official off-leash location. Use the Saint-René Est access described by the City and do not assume the entire park is off leash.</p>",
    "Media": "",
    "Meta Title": "Lac-Beauchamp North Off-Leash Area | Gatineau",
    "Meta Description": "Source-backed guide to the fenced north off-leash area at Lac-Beauchamp in Gatineau, including the official access point opposite 757 boulevard Saint-René Est."
  });

  fs.writeFileSync(parkFile, `${lines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Gatineau city guide and added three current official dog park records.");
