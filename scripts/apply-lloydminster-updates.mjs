import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Sat Jul 18 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";

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
    if (values[headerIndex.get("Slug")] === "lloydminster") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Lloydminster");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Lloydminster | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to Lloydminster dog parks, including the fenced municipal off-leash park at 41 Street and 47 Avenue and R.H. Brekko Lake.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Lloydminster has better official dog-park information than many thin city pages because the City directly lists two off-leash options: a fenced municipal park at 41 Street and 47 Avenue, and an unfenced off-leash area at R.H. Brekko Lake. That makes it possible to replace generic filler with a factual guide built from the current animal-services page, the posted dog-park rules sign, and the current domestic animal bylaw.</p>");
      set("About Section", "<p>The strongest current source is the City of Lloydminster's animal-services page. It says the main off-leash dog park is a fully fenced green space with doggie bags, picnic tables, and waste bins at 41 Street and 47 Avenue. The same page says the site is nearly three acres and available for daily use by dog owners. It also identifies a second off-leash option at R.H. Brekko Lake, located at 51 Avenue and 62 Street, where the city describes the space as unfenced and suitable for well-trained dogs.</p><p>Lloydminster's current domestic animal bylaw and animal-services summary also help clean up outdated assumptions. Since January 11, 2021, pet owners no longer need to purchase a pet licence, but dogs and cats over six months still need identification tags with owner contact information when they are off the owner's property. In public, owners must keep animals under control, must not let them roam freely, and must pick up and dispose of pet waste. That gives this city page a much better factual foundation than the old version, which incorrectly centered the experience inside Bud Miller All Seasons Park and overstated features that are not supported by the current city guidance reviewed here.</p>");
      set("Featured Park 1", "lloydminster-off-leash-dog-park");
      set("Featured Park 2", "r-h-brekko-lake-off-leash-area");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Ice, wind, and hard-packed snow can change footing quickly in Lloydminster's exposed off-leash areas, especially at the unfenced lake site.</li><li><strong>Spring:</strong> Thaw conditions can create mud near gates, paths, and shoreline edges. Keep entry and exit transitions controlled.</li><li><strong>Summer:</strong> Bring your own water unless you have verified an on-site source. Open prairie conditions can heat up fast.</li><li><strong>Fall:</strong> Cooler temperatures are usually ideal for longer visits, but short daylight and wet grass can make evening recall harder in unfenced areas.</li></ul>");
      set("Park Rules", "<p><strong>Current city requirements:</strong> Lloydminster says dogs and cats over six months must wear identification tags with owner contact information when off the owner's property.</p><p><strong>Control in public:</strong> The city says owners must keep animals under control, must not let them roam freely, and must pick up and dispose of waste in public.</p><p><strong>Posted off-leash rules:</strong> The City's off-leash rules sign says the fenced park requires handlers to carry a leash, keep dogs within sight, clean up waste, fill holes, and remove aggressive dogs immediately.</p><p><strong>Dog-park conduct:</strong> The posted rules also say no glass containers, no dog or human food or treats, no children under eight, and children aged eight to fifteen must be accompanied by an adult.</p><p><strong>Use the right park for the right dog:</strong> The main 41 Street and 47 Avenue site is fenced, while R.H. Brekko Lake is explicitly described by the city as unfenced and better suited to well-trained dogs.</p>");
      set("City Website", "https://www.lloydminster.ca/home-property-utilities/animal-services/");
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Match your dog to the right off-leash setting.</strong></p><p>Lloydminster gives you a choice between a fenced municipal park and an unfenced lake-area off-leash space. Dogs with inconsistent recall are better suited to the fenced site.</p><p><strong>2. Treat current tag requirements as mandatory, not optional.</strong></p><p>The current bylaw requires identification tags with owner contact information for dogs and cats over six months when off property.</p><p><strong>3. Keep entrances calm.</strong></p><p>The posted rules for the fenced park emphasize leash control while entering and exiting, which is where many dog-park conflicts start.</p><p><strong>4. Leave food at home.</strong></p><p>The city's posted rules prohibit dog and human food or treats inside the main off-leash park because they can trigger guarding or crowding behaviour.</p><p><strong>5. Be stricter with yourself at R.H. Brekko Lake.</strong></p><p>Because the lake site is unfenced, recall, line-of-sight supervision, and early exits matter more than they do in the fenced municipal park.</p>");
      set("Dog Park FAQs", "<p><strong>1. How many official off-leash areas does Lloydminster list?</strong></p><p>Two. The city lists a fenced off-leash dog park at 41 Street and 47 Avenue and an unfenced off-leash area at R.H. Brekko Lake at 51 Avenue and 62 Street.</p><p><strong>2. Is the main Lloydminster dog park fenced?</strong></p><p>Yes. The city describes the 41 Street and 47 Avenue off-leash park as a fully fenced green space.</p><p><strong>3. Is R.H. Brekko Lake fenced?</strong></p><p>No. The city specifically describes R.H. Brekko Lake as an unfenced off-leash park.</p><p><strong>4. Do Lloydminster pets still need licences?</strong></p><p>No purchase licence is required after the January 11, 2021 bylaw update, but the city still requires dogs and cats over six months to wear identification tags with owner contact information when off property.</p><p><strong>5. What does the city require in public spaces?</strong></p><p>Owners must keep animals under control, must not let them roam freely, and must pick up and dispose of pet waste in public.</p>");
      set("Nearby Cities", "Vermilion, North Battleford");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Lloydminster row not found in city CSV.");
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
    "City": "Lloydminster",
    "Province": "Saskatchewan",
    "Reviewed On": reviewDate
  };

  upsertParkRow(lines, headers, "lloydminster-off-leash-dog-park", {
    ...common,
    "Park Name": "Lloydminster Off-Leash Dog Park",
    "slug": "lloydminster-off-leash-dog-park",
    "Item ID": "lloydminster-off-leash-dog-park-20260718",
    "Park Header": "Lloydminster Off-Leash Dog Park",
    "Park type": "Leash Free",
    "Description": "<p>Lloydminster Off-Leash Dog Park is the city's main fenced dog-park site. The City of Lloydminster says this green space is fully fenced, includes doggie bags, picnic tables, and waste bins, and is located at 41 Street and 47 Avenue. The same city page says the park is nearly three acres and available for daily use by dog owners.</p><p>The posted municipal rules sign adds more practical detail for on-site use. It tells handlers to carry a leash at all times, leash dogs while entering and exiting, keep dogs within sight, clean up waste, fill holes, and remove a dog immediately if it becomes aggressive. The sign also restricts dog and human food or treats, glass containers, and unsupervised child use.</p><p>One point needs to be handled carefully: the older rules sign still references licensing, but the city's current animal-services page says pet owners no longer need to purchase a licence after the January 11, 2021 domestic animal bylaw update. The current bylaw still requires dogs and cats over six months to wear identification tags with owner contact information when they are off the owner's property. For a high-trust listing, the safest approach is to use the city's current animal-services page and bylaw for identification requirements while still relying on the posted sign for behaviour and handler rules inside the fenced park.</p>",
    "Street Address": "41 Street and 47 Avenue",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "Yes",
    "Separate Small Dog Area": "Unknown",
    "Surface type": "Grass",
    "Size": "Nearly three acres",
    "Water source available": "Unknown - bring your own water",
    "Benches": "Picnic tables",
    "Shaded area": "Unknown",
    "Waste bins": "Yes",
    "Bag Dispensers": "Yes",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Available for use daily",
    "Seasonal Restrictions": "Check posted signage and local conditions before use",
    "Park Website or Source": "https://www.lloydminster.ca/home-property-utilities/animal-services/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=41+Street+and+47+Avenue+Lloydminster+AB+SK",
    "Tags": "leash-free, fenced, Lloydminster, Saskatchewan, Alberta border, municipal dog park",
    "Notes / Comments": "<p>Official city sources support the fenced status, near-three-acre size, and listed amenities. Behaviour rules are additionally supported by the city's posted off-leash rules PDF.</p>",
    "Intro Paragraph": "<p>Lloydminster Off-Leash Dog Park is the city's fenced municipal dog-park option. Bring water, carry a leash for gates and transitions, and follow the posted behaviour rules once inside.</p>",
    "Media": "",
    "Meta Title": "Lloydminster Off-Leash Dog Park | Lloydminster",
    "Meta Description": "Source-backed guide to Lloydminster Off-Leash Dog Park at 41 Street and 47 Avenue, including fencing, amenities, and posted city rules."
  });

  upsertParkRow(lines, headers, "r-h-brekko-lake-off-leash-area", {
    ...common,
    "Park Name": "R.H. Brekko Lake Off-Leash Area",
    "slug": "r-h-brekko-lake-off-leash-area",
    "Item ID": "r-h-brekko-lake-off-leash-area-20260718",
    "Park Header": "R.H. Brekko Lake Off-Leash Area",
    "Park type": "Leash Free",
    "Description": "<p>R.H. Brekko Lake is Lloydminster's second official off-leash option. The City of Lloydminster lists it on the animal-services page at 51 Avenue and 62 Street and describes it as an unfenced off-leash park available to the public.</p><p>The city's wording matters here because it also says well-trained dogs are able to play there without endangering themselves or disturbing the surrounding area. That is effectively a signal that this site is better suited to dogs with reliable recall and steady public-space manners than to dogs that still need a hard boundary to stay engaged with their handler.</p><p>Unlike the fenced municipal dog park at 41 Street and 47 Avenue, the reviewed city source set does not publish a detailed amenity list for R.H. Brekko Lake. A stronger listing should therefore stay conservative: identify it as an official unfenced off-leash area, give the city-published intersection, and remind visitors that current animal-control expectations still apply in public. Under the current domestic animal bylaw, dogs and cats over six months need identification tags with owner contact information when off property, owners must keep animals under control, and waste must be removed immediately.</p>",
    "Street Address": "51 Avenue and 62 Street",
    "latitude": "",
    "longitude": "",
    "Postal Code": "",
    "Fenced": "No",
    "Separate Small Dog Area": "No",
    "Surface type": "Unknown",
    "Size": "Unknown",
    "Water source available": "Unknown - bring your own water",
    "Benches": "Unknown",
    "Shaded area": "Unknown",
    "Waste bins": "Unknown",
    "Bag Dispensers": "Unknown",
    "Parking Available": "Unknown - verify on arrival",
    "Washrooms nearby": "Unknown",
    "Operating hours": "Unknown - check posted signage",
    "Seasonal Restrictions": "Use only with strong recall and current site awareness",
    "Park Website or Source": "https://www.lloydminster.ca/home-property-utilities/animal-services/",
    "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=51+Avenue+and+62+Street+Lloydminster+AB+SK",
    "Tags": "leash-free, unfenced, Lloydminster, Saskatchewan, Alberta border, lake area",
    "Notes / Comments": "<p>The city describes R.H. Brekko Lake as unfenced and suitable for well-trained dogs. Amenity details were intentionally left conservative because the reviewed city sources do not clearly publish a fuller feature list.</p>",
    "Intro Paragraph": "<p>R.H. Brekko Lake gives Lloydminster dog owners an official unfenced off-leash option. It is better suited to dogs with reliable recall and calm public-space behaviour.</p>",
    "Media": "",
    "Meta Title": "R.H. Brekko Lake Off-Leash Area | Lloydminster",
    "Meta Description": "Source-backed guide to R.H. Brekko Lake Off-Leash Area in Lloydminster, including the city-published location and unfenced-use context."
  });

  fs.writeFileSync(parkFile, `${lines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Lloydminster city guide and added both official off-leash park records.");
