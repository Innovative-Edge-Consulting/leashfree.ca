import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Wed Jul 22 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const citySource = "https://www.citypa.ca/living-in-our-community/animal-services/";
const parkSource = "https://www.princealbertspca.ca/contact";
const secondarySource = "https://panow.com/2019/12/20/p-a-dog-park-volunteer-welcomes-more-potential-parks/";

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
    if (values[headerIndex.get("Slug")] === "prince-albert") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Prince Albert");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Prince Albert, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Prince Albert, Saskatchewan, built around current city pet rules and the community off-leash space beside the Prince Albert SPCA.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Prince Albert is a case where the current municipal source set is useful for pet rules but not especially strong for a dedicated dog-park listing. The City of Prince Albert's current animal-services page clearly explains licensing, animal control contacts, and where dogs and cats are handled in the city, while the best-supported local off-leash park record points to Central Bark beside the Prince Albert SPCA.</p>");
      set("About Section", "<p>The older Prince Albert page on LeashFree.ca relied on generic claims about a fenced dog park near the Alfred Jenkins Field House, but the current city website does not appear to publish a dedicated municipal dog-park page that supports that description. What the city does publish clearly is the current animal-services framework: Animal Control Services handles dogs and cats at large, Prince Albert requires annual pet licences, and pet owners are directed to the responsible-pet-ownership and dangerous-animal bylaws for the rules that govern ownership inside the city.</p><p>For the actual off-leash destination, the strongest local record available in this research pass points to Central Bark beside the Prince Albert SPCA. The SPCA's current contact page confirms its location at 1125 North Industrial Drive, and long-standing local reporting identifies Central Bark as the city's dog park beside the SPCA building on the north side of the river. That is not as strong as a direct city park page, so this guide stays explicit about source quality instead of overstating certainty.</p>");
      set("Featured Park 1", "central-bark-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Prince Albert winters can mean packed snow, ice, and exposed wind, so shorter visits and paw protection may matter.</li><li><strong>Spring:</strong> Snowmelt can make entry areas and parking edges wet or muddy, especially around industrial or shelter-adjacent sites.</li><li><strong>Summer:</strong> Bring water and confirm ground conditions before longer play sessions.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer outings, but shorter daylight makes earlier visits simpler.</li></ul>");
      set("Park Rules", "<p><strong>City-wide pet rules:</strong> The City of Prince Albert's current animal-services page directs owners to the responsible-pet-ownership bylaw, dangerous-animal bylaw, and annual licensing requirements.</p><p><strong>Licensing:</strong> The city says dog licences can be purchased through City Hall, the Prince Albert SPCA, or Paw Print Inn, and that licences must be renewed yearly.</p><p><strong>Animal control:</strong> The city says Animal Control Services handles dogs or cats at large and gives current reporting contacts for loose, distressed, or abandoned domestic animals.</p><p><strong>Off-leash source confidence:</strong> A current dedicated municipal dog-park page was not identified in this research pass, so the off-leash park details below are based on the Prince Albert SPCA location page plus local reporting about Central Bark beside the shelter.</p>");
      set("City Website", citySource);
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Treat Prince Albert's off-leash information conservatively.</strong></p><p>Because the city does not currently publish a dedicated dog-park page that clearly lays out every amenity and rule, visitors should use posted signage on arrival and avoid assuming unsupported features.</p><p><strong>2. Keep licensing current.</strong></p><p>The city's current animal-services page says pet licences are required and renewed yearly, so that should be handled before relying on any local off-leash space.</p><p><strong>3. Stay controlled outside the enclosure.</strong></p><p>The city maintains an active animal-control framework for dogs at large, which is a reminder that transitions in parking areas, road approaches, and paths still require control.</p><p><strong>4. Use shelter-adjacent spaces respectfully.</strong></p><p>Central Bark is associated with the Prince Albert SPCA site, so owners should keep visits clean, low-conflict, and considerate of the broader animal-services setting.</p><p><strong>5. Verify conditions before longer visits.</strong></p><p>Prince Albert's current source set is better for rules and location context than for daily amenity details, so water, footing, and temporary restrictions should be checked on site.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Prince Albert have a current official city dog-park page?</strong></p><p>Not one that was clearly identified in this research pass. The city currently publishes animal-services and pet-ownership information, but the off-leash park record is better supported by local shelter information and local reporting.</p><p><strong>2. What current city source is most useful for dog owners?</strong></p><p>The City of Prince Albert animal-services page is the strongest current municipal source because it explains licensing, animal-control contacts, and the bylaws owners should follow.</p><p><strong>3. What off-leash park does this guide feature?</strong></p><p>This guide features Central Bark Dog Park, the community off-leash space associated with the Prince Albert SPCA site.</p><p><strong>4. Where is Central Bark Dog Park?</strong></p><p>The Prince Albert SPCA contact page confirms the shelter location at 1125 North Industrial Drive, and local reporting places Central Bark beside the SPCA building on the north side of the river.</p><p><strong>5. Does Prince Albert require dog licensing?</strong></p><p>Yes. The city's animal-services page says pet licences are required and must be renewed yearly.</p><p><strong>6. Who handles dogs at large in Prince Albert?</strong></p><p>The city says Animal Control Services handles reports involving dogs or cats at large during business hours.</p>");
      set("Nearby Cities", "Nipawin, Melfort");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Prince Albert row not found in city CSV.");
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
  const slug = "central-bark-dog-park";
  let found = false;

  const nextLines = [csv(headers)];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (!line) continue;
    const values = parseCsvLine(line);
    while (values.length < headers.length) values.push("");
    if (values[headerIndex.get("slug")] === slug) {
      found = true;
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("Park Name", "Central Bark Dog Park");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", "Central Bark Dog Park");
      set("Park type", "Leash Free");
      set("Description", "<p>Central Bark Dog Park is the community off-leash space associated with the Prince Albert SPCA site at 1125 North Industrial Drive in Prince Albert. The Prince Albert SPCA's current contact page confirms the shelter location, which is the clearest current source-backed anchor for the park's location.</p><p>The strongest public description of the dog park itself in this research pass comes from long-standing local reporting rather than from a current city park page. A 2019 paNOW article describes Central Bark as the city's dog park beside the SPCA building on the north side of the river and reports that the SPCA built the park in 2010.</p><p>Because a current dedicated official park page was not identified, this profile stays conservative. It uses the SPCA location page for the address and local reporting for the existence and general context of the off-leash area, while the City of Prince Albert's current animal-services page supplies the city-wide licensing and animal-control framework dog owners should follow.</p>");
      set("Street Address", "1125 N Industrial Dr");
      set("latitude", "");
      set("longitude", "");
      set("City", "Prince Albert");
      set("Province", "Saskatchewan");
      set("Postal Code", "S6V 5T1");
      set("Fenced", "Yes");
      set("Separate Small Dog Area", "Unknown");
      set("Surface type", "Grass");
      set("Size", "0.75 acres (reported)");
      set("Water source available", "Unknown");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Yes - verify on arrival");
      set("Washrooms nearby", "Unknown");
      set("Operating hours", "Unknown - check posted signage");
      set("Seasonal Restrictions", "None confirmed in current source set");
      set("Park Website or Source", parkSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=1125+N+Industrial+Dr+Prince+Albert+SK");
      set("Tags", "leash-free, Prince Albert, Saskatchewan, Prince Albert SPCA");
      set("Notes / Comments", `<p>Primary location source: ${parkSource}. City-wide pet-rules source: ${citySource}. Secondary context source for park existence and history: ${secondarySource}. A current dedicated official dog-park page was not identified, so amenities beyond the basic location and reported fenced status were kept conservative.</p>`);
      set("Intro Paragraph", "<p>Central Bark Dog Park is the best-supported off-leash park record currently tied to Prince Albert, with location support from the Prince Albert SPCA and historical context from local reporting.</p>");
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", "Central Bark Dog Park | Prince Albert, Saskatchewan");
      set("Meta Description", "Conservative, source-backed guide to Central Bark Dog Park in Prince Albert, Saskatchewan, based on Prince Albert SPCA location data, local reporting, and current city pet-rule sources.");
    }
    nextLines.push(csv(values));
  }

  if (!found) {
    throw new Error("Central Bark Dog Park row not found in park CSV.");
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Prince Albert city guide and refreshed Central Bark Dog Park with conservative source-backed content.");
