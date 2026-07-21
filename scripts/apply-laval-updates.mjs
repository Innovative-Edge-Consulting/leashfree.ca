import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Mon Jul 20 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";

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
    if (values[headerIndex.get("Slug")] === "laval") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Laval");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Laval, Quebec | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to Laval dog parks, including the city's current dog-park network, licence and tag rules, leash requirements, and official park access guidance.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>As of July 20, 2026, Laval's current official dog-parks guide page shows 12 results across parcs canins and aires d'exercice pour chiens. That is a much stronger factual base than the older generic draft, because the Ville de Laval now publishes a current network page, individual park entries, and the broader municipal animal rules that govern leash use, tags, and public conduct.</p>");
      set("About Section", "<p>Laval's current dog-parks guide and interactive map show that the city's dog spaces are distributed across multiple sectors rather than concentrated in one neighbourhood. The published list includes named sites in Auteuil, Duvernay, Laval-des-Rapides, Laval-Ouest, Sainte-Rose, Vimont, and other sectors, with both dedicated parcs canins and aires d'exercice pour chiens. Individual park pages also publish specific addresses, the standard park schedule of 7 h to 22 h year-round for the dog space, and the same core access rules.</p><p>The city-wide animal regulation page adds the broader legal context. Outside designated off-leash dog spaces, Laval requires dogs to be kept on a leash no longer than 1.85 metres in public. Dogs must also be registered with the city and wear a valid municipal tag, and handlers must clean up waste in public spaces. For a stronger city guide, the right approach is to reflect the size of the official network, link to representative current parks, and use the city's published rules instead of generic dog-park filler.</p>");
      set("Featured Park 1", "parc-canin-des-rossignols");
      set("Featured Park 2", "parc-canin-lava");
      set("Featured Park 3", "parc-laval-ouest-site-saint-antoine-dog-exercise-area");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Laval's dog spaces are listed as open year-round, but snowpack, ice, and slushy gates can change how easy it is to enter and exit safely.</li><li><strong>Spring:</strong> Thaw conditions can make dog runs muddy. Bring towels and keep transitions controlled near entrances.</li><li><strong>Summer:</strong> Standard dog-park hours remain broad, but midday heat can build quickly on exposed surfaces. Bring water unless you have confirmed a fountain on site.</li><li><strong>Fall:</strong> Cooler temperatures are usually better for longer play sessions, but wet leaves and shorter daylight make footing and visibility worth checking before evening visits.</li></ul>");
      set("Park Rules", "<p><strong>Leash rule outside designated dog spaces:</strong> Laval says dogs in public must be kept on a leash no longer than 1.85 metres unless they are inside a designated dog park or exercise area.</p><p><strong>Tag requirement:</strong> The city's current animal rules require dogs to be registered and to wear a valid municipal tag.</p><p><strong>Dog-park access rules:</strong> Laval's current dog-park pages say the space is reserved for dogs and their handlers, children under 12 must be accompanied by an adult, and dogs showing illness, aggression, or heat-cycle risk are not allowed.</p><p><strong>Dog-park use rules:</strong> The city says handlers must keep gates closed, keep dogs leashed until they are inside the exercise area, remain with the dog, clean up waste immediately, and avoid feeding dogs inside the enclosure.</p><p><strong>Incident reporting:</strong> Individual Laval dog-park pages say any bite or attack involving a dog should be reported by calling 911.</p>");
      set("City Website", "https://www.laval.ca/Pages/Fr/Citoyens/parcs-a-chiens.aspx");
      set("Province Page", "https://leashfree.ca/dog-parks/qc/");
      set("Dog Park Etiquettes", "<p><strong>1. Treat designated dog spaces as the exception.</strong></p><p>Laval's city-wide rule is that dogs stay on a leash up to 1.85 metres in public unless you are inside a designated dog park or exercise area.</p><p><strong>2. Keep your dog's city tag current and visible.</strong></p><p>The official rules require a valid municipal tag, and the dog-park pages repeat that dogs must wear it.</p><p><strong>3. Leash up until you are fully inside.</strong></p><p>Laval's published park rules explicitly require dogs to stay on leash until they are inside the exercise area, so calm entries and exits are part of basic handling.</p><p><strong>4. Do not bring a dog that is sick, in heat, or showing aggression.</strong></p><p>The city's access rules are clear on these restrictions, which is more useful than generic socialization advice.</p><p><strong>5. Plan for differences between parks.</strong></p><p>Some Laval sites publish extra amenities such as a water fountain or picnic area, while others are listed more simply. Confirm the exact site features before you rely on them.</p>");
      set("Dog Park FAQs", "<p><strong>1. How many official dog spaces does Laval currently show?</strong></p><p>As of July 20, 2026, Laval's current dog-parks guide page shows 12 results across dog parks and dog exercise areas.</p><p><strong>2. Can I let my dog off leash in regular Laval parks?</strong></p><p>No. Laval's animal rules say dogs in public must stay on a leash no longer than 1.85 metres unless they are in a designated dog space.</p><p><strong>3. Does Laval require a dog licence and tag?</strong></p><p>Yes. Laval requires dogs to be registered with the city and to wear a valid municipal tag.</p><p><strong>4. What hours do Laval dog parks usually follow?</strong></p><p>Individual official park pages reviewed for this update list the standard park schedule as open year-round from 7 h to 22 h for the dog space.</p><p><strong>5. Are all Laval dog parks the same?</strong></p><p>No. The city publishes a network of both parcs canins and aires d'exercice pour chiens, and some individual pages list extra features while others only confirm the location, hours, and rules.</p>");
      set("Nearby Cities", "Montreal, Terrebonne, Longueuil");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Laval row not found in city CSV.");
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
    "City": "Laval",
    "Province": "Quebec",
    "Reviewed On": reviewDate
  };

  upsertParkRow(lines, headers, "parc-canin-des-rossignols", {
    ...common,
    "Park Name": "Parc canin des Rossignols",
    "slug": "parc-canin-des-rossignols",
    "Item ID": "parc-canin-des-rossignols-20260720",
    "Park Header": "Parc canin des Rossignols",
    "Park type": "Leash Free",
    "Description": "<p>Parc canin des Rossignols is one of Laval's current official dog parks in the Sainte-Rose sector. The city's current interactive page publishes the exact address at 5596, boulevard des Rossignols and lists the dog space as open year-round from 7 h to 22 h.</p><p>This park page is also one of the stronger Laval records because the city publishes a small amenities section for it. Laval lists both a picnic area and a water fountain at this location, which gives dog owners more reason to choose it over a generic unnamed park entry.</p><p>The city's standard access and use rules still apply. Dogs must wear a valid city tag, stay on leash until they are inside the dog space, and be supervised throughout the visit. Handlers must keep gates closed, clean up waste immediately, and avoid bringing a sick, aggressive, or in-heat dog into the enclosure.</p>",
    "Street Address": "5596, boulevard des Rossignols",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Unknown - access rules reference gates, verify layout on arrival",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Unknown",
    "Size": "Unknown",
    "Water source available": "Yes - water fountain listed by the City",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - waste disposal at the entrance is referenced in the rules",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Open year-round, 7 h to 22 h",
    "Seasonal Restrictions": "Open year-round; check posted conditions on arrival",
    "Park Website or Source": "https://www.laval.ca/carte-interactive/parc-canin-des-rossignols/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=5596+boulevard+des+Rossignols+Laval+QC",
    "Tags": "leash-free, Laval, Quebec, Sainte-Rose, official dog park",
    "Notes / Comments": "<p>Laval's official park page for Parc canin des Rossignols publishes stronger detail than many city dog-park records, including the exact address, year-round 7 h to 22 h schedule, and listed commodities of a picnic area and water fountain.</p>",
    "Intro Paragraph": "<p>Parc canin des Rossignols is one of Laval's current official dog parks, with a published Sainte-Rose address and standard city dog-park hours of 7 h to 22 h year-round.</p>",
    "Media": "",
    "Meta Title": "Parc canin des Rossignols | Laval",
    "Meta Description": "Source-backed guide to Parc canin des Rossignols in Laval, Quebec, including the official address, published hours, and city dog-park rules."
  });

  upsertParkRow(lines, headers, "parc-canin-lava", {
    ...common,
    "Park Name": "Parc canin Lava",
    "slug": "parc-canin-lava",
    "Item ID": "parc-canin-lava-20260720",
    "Park Header": "Parc canin Lava",
    "Park type": "Leash Free",
    "Description": "<p>Parc canin Lava is one of Laval's current official dog parks in the Duvernay sector. Laval's current park page gives the exact address as 7890 Avenue Marcel-Villeneuve and lists the dog park as open year-round from 7 h to 22 h.</p><p>The strongest value of this record is clarity rather than exaggerated amenity claims. The city's page confirms the location, standard hours, and the full set of current access and use rules, which is more useful than generic promises about play features that are not clearly published.</p><p>Those rules matter for real visits. Dogs must wear a valid city tag, children under 12 must be accompanied by an adult, and dogs have to remain on leash until they are inside the dog space. Laval also requires handlers to remain with the dog, close gates, pick up waste immediately, and avoid feeding dogs inside the enclosure.</p>",
    "Street Address": "7890 Avenue Marcel-Villeneuve",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Unknown - access rules reference gates, verify layout on arrival",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Unknown",
    "Size": "Unknown",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - waste disposal at the entrance is referenced in the rules",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Open year-round, 7 h to 22 h",
    "Seasonal Restrictions": "Open year-round; check posted conditions on arrival",
    "Park Website or Source": "https://www.laval.ca/carte-interactive/parc-canin-lava/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=7890+Avenue+Marcel-Villeneuve+Laval+QC",
    "Tags": "leash-free, Laval, Quebec, Duvernay, official dog park",
    "Notes / Comments": "<p>The official city page for Parc canin Lava confirms the exact Duvernay address, year-round 7 h to 22 h hours, and the standard Laval dog-park rules used across the network.</p>",
    "Intro Paragraph": "<p>Parc canin Lava is an official Laval dog park in Duvernay with a published address and year-round city park hours of 7 h to 22 h.</p>",
    "Media": "",
    "Meta Title": "Parc canin Lava | Laval",
    "Meta Description": "Source-backed guide to Parc canin Lava in Laval, Quebec, including the official address, year-round hours, and current city dog-park rules."
  });

  upsertParkRow(lines, headers, "parc-laval-ouest-site-saint-antoine-dog-exercise-area", {
    ...common,
    "Park Name": "Parc Laval-Ouest, site Saint-Antoine Dog Exercise Area",
    "slug": "parc-laval-ouest-site-saint-antoine-dog-exercise-area",
    "Item ID": "parc-laval-ouest-site-saint-antoine-dog-exercise-area-20260720",
    "Park Header": "Parc Laval-Ouest, site Saint-Antoine Dog Exercise Area",
    "Park type": "Leash Free",
    "Description": "<p>The dog space at Parc Laval-Ouest, site Saint-Antoine is one of Laval's current official aires d'exercice pour chiens. The city's interactive page gives the address as 3150, chemin Saint-Antoine in Laval-Ouest and lists the dog area as open year-round from 7 h to 22 h.</p><p>This location is useful because Laval identifies it as a dog exercise area within a larger multi-use park site rather than as a stand-alone dog park. That makes it a good example of how Laval's network includes both dedicated parcs canins and dog exercise spaces integrated into broader recreation properties.</p><p>The same standard city rules apply here. Dogs must wear a valid Laval tag, stay on leash until they are inside the exercise area, and be supervised throughout the visit. Handlers must keep gates closed, clean up waste immediately, and avoid bringing dogs that are sick, aggressive, or in heat.</p>",
    "Street Address": "3150, chemin Saint-Antoine",
    "latitude": "",
    "longitude": "",
    "Postal Code": "H7R 1H8",
    "Fenced": "Unknown - access rules reference gates, verify layout on arrival",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Unknown",
    "Size": "Unknown",
    "Water source available": "Unknown",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Yes - waste disposal at the entrance is referenced in the rules",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Open year-round, 7 h to 22 h",
    "Seasonal Restrictions": "Open year-round; check posted conditions on arrival",
    "Park Website or Source": "https://www.laval.ca/carte-interactive/parc-laval-ouest-site-saint-antoine/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=3150+chemin+Saint-Antoine+Laval+QC",
    "Tags": "leash-free, Laval, Quebec, Laval-Ouest, dog exercise area",
    "Notes / Comments": "<p>The official city page identifies this site as an aire d'exercice pour chiens within the broader Parc Laval-Ouest, site Saint-Antoine property. The dog-space hours are published separately from other park facilities.</p>",
    "Intro Paragraph": "<p>The dog exercise area at Parc Laval-Ouest, site Saint-Antoine is one of Laval's current official dog spaces, with a published Laval-Ouest address and standard 7 h to 22 h year-round hours.</p>",
    "Media": "",
    "Meta Title": "Parc Laval-Ouest, site Saint-Antoine Dog Exercise Area | Laval",
    "Meta Description": "Source-backed guide to the dog exercise area at Parc Laval-Ouest, site Saint-Antoine in Laval, Quebec, including the official address, hours, and city rules."
  });

  fs.writeFileSync(parkFile, `${lines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Laval city guide and added three current official Laval dog park records.");
