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
    if (values[headerIndex.get("Slug")] === "humboldt") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Humboldt");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Humboldt, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Humboldt, Saskatchewan, focused on the city's off-leash dog park, local dog-licensing rules, and practical visit context.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Humboldt appears to have a single designated off-leash dog park rather than a network of municipal dog runs. The City of Humboldt's parks and licensing pages provide enough official context to treat this as a one-park city guide: confirm the off-leash area, understand the local animal-licensing rules, and avoid overstating amenities the city does not clearly publish.</p>");
      set("About Section", "<p>The strongest official location context comes from the City of Humboldt's parks and trails material, which outlines the city's broader recreation system, and from city event listings that place the Humboldt Community Gathering Place at 701 6th Avenue. Existing local references describe the dog park as being behind that building, which is plausible in context, but the city does not appear to publish a dedicated dog-park page with a full amenity sheet. That means the right editorial move is restraint: describe the off-leash park as a local municipal facility with limited published detail, not as a richly documented destination.</p><p>Humboldt's licensing and bylaw pages are more explicit. The city requires annual dog and cat licences for animals over three months old and identifies animal control as part of its bylaw framework. For a useful city guide, those rules matter more than filler copy about dogs socializing on grass. The practical message is simple: Humboldt has an off-leash option, but visitors should check posted signage and rely on city rules rather than assumptions about services or hours.</p>");
      set("Featured Park 1", "humboldt-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Snow and prairie wind can affect access and footing, so keep dogs leashed until you are fully inside the off-leash area.</li><li><strong>Spring:</strong> Expect soft ground and muddy entrances during thaw. Bring towels and avoid assuming surfaces are fully dry.</li><li><strong>Summer:</strong> Bring your own water unless you confirm an on-site source. Open prairie conditions can heat up quickly.</li><li><strong>Fall:</strong> Cooler weather is better for longer play sessions, but shorter daylight makes posted hours and visibility more important.</li></ul>");
      set("Park Rules", "<p><strong>Animal licensing:</strong> The City of Humboldt says any dog or cat over three months old requires an annual licence from January 1 to December 31.</p><p><strong>Bylaw oversight:</strong> Humboldt's bylaw and protective-services pages identify animal control as an active municipal enforcement area.</p><p><strong>Park-use caution:</strong> Because the city does not clearly publish a comprehensive dog-park rule sheet on the source pages used here, visitors should follow all posted signage at the off-leash area and default to leash control outside the designated enclosure.</p>");
      set("City Website", "https://humboldt.ca/permits-licensing/");
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Treat the park as a designated off-leash exception.</strong></p><p>Humboldt's official material is clearer on licensing and bylaw control than on park amenities, so keep transitions on leash and rely on posted instructions once you arrive.</p><p><strong>2. Bring your own basics.</strong></p><p>Water, spare waste bags, and towels are worth carrying because the city does not clearly publish a detailed amenity list for the dog park.</p><p><strong>3. Use conservative assumptions with shared space.</strong></p><p>If the park sits behind the Community Gathering Place as local references suggest, it likely functions within a broader community setting, so keep entries and exits calm.</p><p><strong>4. Make sure your dog is properly licensed.</strong></p><p>Humboldt's permits and licensing page makes annual dog licensing an explicit city requirement.</p><p><strong>5. Leave if the environment is not working for your dog.</strong></p><p>Single-park cities often mix dogs of different sizes and play styles in one enclosure, so supervision matters more than generic etiquette slogans.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Humboldt have more than one official off-leash dog park?</strong></p><p>Current official city material used for this update supports one local off-leash dog park rather than multiple documented municipal dog parks.</p><p><strong>2. Does Humboldt require a dog licence?</strong></p><p>Yes. The City of Humboldt says dogs over three months old require an annual licence.</p><p><strong>3. Where is the Humboldt off-leash dog park?</strong></p><p>Local city-context references place it behind the Humboldt Community Gathering Place, which city event listings identify at 701 6th Avenue. Visitors should still confirm the exact on-site entrance and posted signage when they arrive.</p><p><strong>4. Does the city publish a full amenity list for the dog park?</strong></p><p>Not clearly on the official pages used here. Bring your own supplies unless you confirm specific amenities on site.</p><p><strong>5. What should I verify before letting my dog off leash?</strong></p><p>Check licensing status, posted signs, current park conditions, and whether the shared space is appropriate for your dog's size and play style.</p>");
      set("Nearby Cities", "Saskatoon, Muenster");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Humboldt row not found in city CSV.");
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
  const slug = "humboldt-off-leash-dog-park";
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

    set("Park Name", "Humboldt Off-Leash Dog Park");
    set("slug", slug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "humboldt-dog-park-20260718");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", "Humboldt Off-Leash Dog Park");
    set("Park type", "Leash Free");
    set("Description", "<p>Humboldt Off-Leash Dog Park serves as the city's local off-leash option in a municipality where official public information is much stronger on licensing and bylaw structure than on dog-park marketing. That makes this page intentionally practical: it focuses on what the City of Humboldt clearly supports rather than pretending the park is more documented than it is.</p><p>The City of Humboldt's permits and licensing page states that dogs over three months old require an annual licence, and the city's bylaw and protective-services pages identify animal control as an active enforcement area. Local city-context references place the off-leash park behind the Humboldt Community Gathering Place, which city event pages identify at 701 6th Avenue. Because the city does not appear to publish a dedicated official dog-park amenity page with exact coordinates, visitors should confirm the entrance and any current rules from posted signage on arrival.</p><p>That may sound cautious, but it is the right standard for content quality. A high-trust park page is better served by accurate municipal context, licensing requirements, and conservative location wording than by fabricated claims about fences, water taps, or separate play zones that are not clearly documented in the official sources reviewed.</p>");
    set("Street Address", "Behind Humboldt Community Gathering Place, 701 6th Ave");
    set("latitude", "");
    set("longitude", "");
    set("City", "Humboldt");
    set("Province", "Saskatchewan");
    set("Postal Code", "S0K 2A0");
    set("Fenced", "Unknown - verify on arrival");
    set("Separate Small Dog Area", "Unknown");
    set("Surface type", "Unknown");
    set("Size", "Unknown");
    set("Water source available", "Unknown");
    set("Benches", "Unknown");
    set("Shaded area", "Unknown");
    set("Waste bins", "Unknown");
    set("Bag Dispensers", "Unknown");
    set("Parking Available", "Likely nearby at the Community Gathering Place");
    set("Washrooms nearby", "Unknown");
    set("Operating hours", "Unknown - check posted signage");
    set("Seasonal Restrictions", "Check local signage and conditions before use");
    set("Park Website or Source", "https://humboldt.ca/permits-licensing/");
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=701+6th+Ave+Humboldt+SK+S0K+2A0");
    set("Tags", "leash-free, Humboldt, Saskatchewan, municipal dog park");
    set("Notes / Comments", "<p>The City of Humboldt pages used for this record do not clearly publish a full dog-park detail page. The location wording here is conservative: local city-context references place the park behind the Humboldt Community Gathering Place, and official city event listings place that building at 701 6th Avenue. Visitors should confirm the exact entrance and current posted rules on site.</p>");
    set("Intro Paragraph", "<p>Humboldt Off-Leash Dog Park is the city's practical off-leash option for local dog owners. Use it with conservative expectations: confirm signage, bring your own supplies, and make sure your dog's city licensing is current.</p>");
    set("Media", "");
    set("Reviewed On", reviewDate);
    set("Meta Title", "Humboldt Off-Leash Dog Park | Humboldt, Saskatchewan");
    set("Meta Description", "Source-backed guide to Humboldt Off-Leash Dog Park in Humboldt, Saskatchewan, with city licensing context, municipal bylaw references, and conservative location guidance.");

    nextLines.push(csv(row));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Humboldt city guide and added Humboldt off-leash dog park record.");
