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
    if (values[headerIndex.get("Slug")] === "martensville") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Martensville");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Martensville, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Martensville, Saskatchewan, focused on the city's dog park, pet licensing requirements, and practical location context.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Martensville has an official dog park and clear municipal pet-licensing rules, but its current city page overclaims details that need better sourcing. The city itself gives enough evidence to build a better guide around licensing, location context, and nearby city services without pretending the park has a published amenity sheet it does not clearly show.</p>");
      set("About Section", "<p>The City of Martensville's pet-licensing and animal-services page makes one important fact explicit: pets must be licensed before visiting the Martensville Dog Park. That is stronger and more useful than generic statements about dogs socializing in an open field because it ties the off-leash space directly to a real municipal requirement. The city's parks and recreation section also lists an Off-Leash Dog Park within its recreation system, which confirms the park is an official city facility rather than an informal local spot.</p><p>For location context, the city's waste and recycling page says the yard waste site is along 10th Avenue South, south of the off-leash dog park. That is enough to place the dog park in the 10th Avenue South area without inventing a precise civic address the city does not clearly publish in the source set reviewed here. A high-trust city guide should therefore stay conservative: explain the official status, licensing requirement, and area context, then tell visitors to verify signage and entrance details when they arrive.</p>");
      set("Featured Park 1", "martensville-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Open prairie wind and snow drift can affect access and visibility, so keep dogs leashed until you are fully inside the park.</li><li><strong>Spring:</strong> Expect muddy approaches during thaw, especially in utility or yard-site-adjacent areas near 10th Avenue South.</li><li><strong>Summer:</strong> Bring your own water unless you confirm an on-site source. Open-sky exposure can heat up the space quickly.</li><li><strong>Fall:</strong> Cooler conditions are better for longer visits, but check surface conditions and posted notices before evening use.</li></ul>");
      set("Park Rules", "<p><strong>Licensing:</strong> The City of Martensville says pets are required to be licensed before visiting the Martensville Dog Park.</p><p><strong>Visible identification:</strong> The city says all dogs and cats must have a valid license and wear a visible license tag once weaned.</p><p><strong>Location context:</strong> Martensville's recreation pages list an Off-Leash Dog Park, and the city's yard-waste information places that park north of the yard waste site along 10th Avenue South.</p><p><strong>Use posted instructions:</strong> Because the city pages reviewed here do not clearly publish a full rules board for the park, visitors should follow all signage at the park entrance and default to leash control outside the designated off-leash space.</p>");
      set("City Website", "https://www.martensville.ca/services-for-residents/pet-licensing-animal-services/");
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Make licensing part of basic trip prep.</strong></p><p>Martensville explicitly requires pets to be licensed before visiting the dog park, so this is not optional housekeeping.</p><p><strong>2. Bring your own supplies.</strong></p><p>The source set reviewed here does not clearly publish a full amenity breakdown, so treat water, waste bags, and towels as bring-your-own items unless you confirm otherwise on site.</p><p><strong>3. Keep entries and exits controlled.</strong></p><p>The location context suggests a practical municipal edge-of-town setting rather than a staffed dog facility, so calm transitions matter.</p><p><strong>4. Use visible ID tags.</strong></p><p>The city says licensed pets must wear a visible license tag, which is useful if a dog slips away from the off-leash area.</p><p><strong>5. Respect the fact that this is a shared local dog park, not a private run.</strong></p><p>If your dog is overwhelmed or crowding others, leave early instead of forcing the interaction.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Martensville have an official dog park?</strong></p><p>Yes. The city's parks and recreation section lists an Off-Leash Dog Park, and the pet-licensing page refers specifically to the Martensville Dog Park.</p><p><strong>2. Do I need to license my dog before visiting?</strong></p><p>Yes. The city says pets are required to be licensed before visiting the dog park.</p><p><strong>3. Where is the dog park in Martensville?</strong></p><p>City source material places it in the 10th Avenue South area. The city's waste page says the yard waste site is south of the off-leash dog park, which helps with area context even though a full civic dog-park address is not clearly published in the reviewed sources.</p><p><strong>4. Does Martensville require visible pet tags?</strong></p><p>Yes. The city says once-weaned dogs and cats must have a valid license and wear a visible license tag.</p><p><strong>5. Why is this guide conservative about amenities?</strong></p><p>Because the municipal pages reviewed here support the park's official status and licensing requirement more clearly than they support specific claims about benches, hours, or extra features.</p>");
      set("Nearby Cities", "Saskatoon, Warman");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Martensville row not found in city CSV.");
  fs.writeFileSync(cityFile, `${nextLines.join("\n")}\n`);
}

function updateParkCsv() {
  const raw = fs.readFileSync(parkFile, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  for (const header of ["Reviewed On", "Meta Title", "Meta Description"]) {
    if (!headers.includes(header)) headers.push(header);
  }
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const slug = "martensville-dog-park";
  let found = false;

  const nextLines = [csv(headers)];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (!line) continue;
    const values = parseCsvLine(line);
    while (values.length < headers.length) values.push("");
    if (values[headerIndex.get("slug")] === slug) found = true;
    nextLines.push(csv(values));
  }

  if (!found) {
    const row = Array(headers.length).fill("");
    const set = (field, value) => {
      row[headerIndex.get(field)] = value;
    };

    set("Park Name", "Martensville Dog Park");
    set("slug", slug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "martensville-dog-park-20260718");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", "Martensville Dog Park");
    set("Park type", "Leash Free");
    set("Description", "<p>Martensville Dog Park is the City's official off-leash park within its parks and recreation system. The strongest official fact supporting this record is the city's pet-licensing guidance, which states that pets must be licensed before visiting the Martensville Dog Park.</p><p>That same municipal guidance says once-weaned dogs and cats must have a valid license and wear a visible license tag. In practical terms, Martensville treats the dog park as a real regulated civic amenity rather than just an informal open space. The city's recreation section also lists an Off-Leash Dog Park directly in its park system.</p><p>For location context, the city says its yard waste site is along 10th Avenue South, south of the off-leash dog park. That places the dog park in the 10th Avenue South area without overstating an exact address or amenities list that the reviewed municipal pages do not clearly publish. Visitors should use that area context, then confirm the specific entrance, posted park rules, and current site conditions on arrival.</p>");
    set("Street Address", "10th Avenue South area");
    set("latitude", "");
    set("longitude", "");
    set("City", "Martensville");
    set("Province", "Saskatchewan");
    set("Postal Code", "");
    set("Fenced", "Unknown - verify on arrival");
    set("Separate Small Dog Area", "Unknown");
    set("Surface type", "Unknown");
    set("Size", "Unknown");
    set("Water source available", "Unknown");
    set("Benches", "Unknown");
    set("Shaded area", "Unknown");
    set("Waste bins", "Unknown");
    set("Bag Dispensers", "Unknown");
    set("Parking Available", "Unknown - likely nearby in the 10th Avenue South area");
    set("Washrooms nearby", "Unknown");
    set("Operating hours", "Unknown - check posted signage");
    set("Seasonal Restrictions", "Check posted signage and local conditions before use");
    set("Park Website or Source", "https://www.martensville.ca/services-for-residents/pet-licensing-animal-services/");
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=10th+Avenue+South+Martensville+SK+dog+park");
    set("Tags", "leash-free, Martensville, Saskatchewan, municipal dog park");
    set("Notes / Comments", "<p>The park's official status is supported by City of Martensville recreation and pet-licensing pages. The location wording is intentionally conservative because the reviewed city sources place the dog park in the 10th Avenue South area but do not clearly publish a full civic address or coordinate pair.</p>");
    set("Intro Paragraph", "<p>Martensville Dog Park is the city's official off-leash destination for local dog owners. Before visiting, make sure your pet is licensed, carries visible ID, and that you are ready to follow any posted park-specific rules on site.</p>");
    set("Media", "");
    set("Reviewed On", reviewDate);
    set("Meta Title", "Martensville Dog Park | Martensville, Saskatchewan");
    set("Meta Description", "Source-backed guide to Martensville Dog Park in Martensville, Saskatchewan, with licensing requirements, municipal location context, and conservative planning notes.");

    nextLines.push(csv(row));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Martensville city guide and added Martensville dog park record.");
