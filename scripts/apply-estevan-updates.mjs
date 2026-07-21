import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Tue Jul 21 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";

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
    if (values[headerIndex.get("Slug")] === "estevan") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Estevan");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Estevan, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Estevan, Saskatchewan, including the city's off-leash park context, licence rules, and practical location guidance from official sources.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Estevan's dog-park situation is clearer than the old generic draft suggested, but not because the city publishes a glossy standalone dog-park brochure. The strongest current official sources are the City of Estevan's animal-licensing page and several city recreation pages that place the off-leash dog park within the valley and walking-path system rather than presenting it as a heavily marketed feature on its own.</p>");
      set("About Section", "<p>The City's current animal-licensing page confirms that dogs inside Estevan city limits are regulated under the Animal Control Bylaw and that unlicensed animals can trigger a fine. A separate city tourism and recreation source adds the key park-specific fact: the City's Selfie Spot page tells visitors to walk down from the 4th Avenue Walking Path into the valley to reach the off-leash dog park. That is an official municipal acknowledgement that the off-leash dog park is a real destination connected to the valley walking-path network, not just a user-submitted rumour.</p><p>Location detail still needs to be handled conservatively. The reviewed city sources are much stronger on valley-path context than on a formal civic dog-park address. The Pleasantdale Valley Walking Path page publishes exact access points at Wellock Road and Souris Avenue North on the north side and off King Street between Cundall Drive and Hillcrest Drive on the south side, while the Selfie Spot page separately points to the 4th Avenue Walking Path as the route down to the off-leash park. Rather than pretend the city has clearly published one tidy dog-park address, this guide should reflect what the sources actually support: Estevan's off-leash dog park sits within the valley walking-path area, and visitors should confirm the final entrance from posted signage or live map directions when they arrive.</p>");
      set("Featured Park 1", "estevan-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Valley paths and slopes can become icy or drifted with snow, so keep dogs leashed until you reach the designated off-leash area.</li><li><strong>Spring:</strong> Estevan's valley routes can be muddy during thaw. Bring towels and expect soft ground near path edges.</li><li><strong>Summer:</strong> Estevan is sunny and open. Bring water, avoid the hottest part of the day, and watch for heat buildup on exposed routes.</li><li><strong>Fall:</strong> Cooler temperatures make longer outings easier, but shorter daylight and leaf cover can make footing less predictable along valley paths.</li></ul>");
      set("Park Rules", "<p><strong>Licensing:</strong> The City of Estevan says pet owners are responsible under the Animal Control Bylaw and that unlicensed animals can result in a fine. The licence page also lists the registration requirements and City Hall purchase process.</p><p><strong>Use the designated off-leash space:</strong> The City's recreation material identifies one off-leash dog park in the valley context rather than suggesting that ordinary city parks are generally off leash.</p><p><strong>Control and cleanup:</strong> Because the off-leash space sits within a broader public-path setting, handlers should keep dogs under control on the approach and remove waste immediately.</p>");
      set("City Website", "https://estevan.ca/animal-licenses/");
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Start with licensing.</strong></p><p>Estevan's current animal-licensing page is one of the strongest official sources in the city dog-source set, so municipal compliance is part of basic trip prep.</p><p><strong>2. Treat the valley as a transition space.</strong></p><p>The city places the off-leash park within the walking-path and valley context, so calm leash transitions matter before your dog is fully inside the designated area.</p><p><strong>3. Bring your own essentials.</strong></p><p>The reviewed official source set does not clearly publish a full amenity sheet for the dog park, so plan as if you need your own water, bags, and towels.</p><p><strong>4. Use conservative assumptions about layout.</strong></p><p>The city clearly supports the park's existence, but not a detailed public feature map. Verify the exact entrance and current conditions when you arrive.</p><p><strong>5. Leave early if the environment is not working for your dog.</strong></p><p>Shared valley and pathway settings can mix walkers, dogs, and changing terrain, so supervision matters more than generic dog-park slogans.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Estevan have an official off-leash dog park?</strong></p><p>Yes. Current City of Estevan recreation content explicitly refers to the off-leash dog park in the valley.</p><p><strong>2. Does Estevan require dog licensing?</strong></p><p>Yes. The City's animal-licensing page says pets within city limits are regulated under the Animal Control Bylaw, and unlicensed animals can result in a fine.</p><p><strong>3. Where is the off-leash dog park in Estevan?</strong></p><p>The strongest official location context places it in the valley and walking-path system. The Selfie Spot page points visitors down from the 4th Avenue Walking Path to the off-leash dog park, while other city path pages publish nearby valley access points. Visitors should still confirm the final park entrance on arrival.</p><p><strong>4. Why is this guide conservative about amenities?</strong></p><p>Because the reviewed official source set confirms the park's existence and valley context more clearly than it confirms details such as fencing, water, benches, or posted hours.</p><p><strong>5. What should I check before visiting?</strong></p><p>Confirm your dog's licence status, bring your own supplies, and verify the exact entrance and current path conditions when you arrive.</p>");
      set("Nearby Cities", "Weyburn, Regina");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Estevan row not found in city CSV.");
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
  const slug = "estevan-off-leash-dog-park";
  const nextLines = [csv(headers)];
  let found = false;

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

    set("Park Name", "Estevan Off-Leash Dog Park");
    set("slug", slug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "estevan-off-leash-dog-park-20260721");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", "Estevan Off-Leash Dog Park");
    set("Park type", "Leash Free");
    set("Description", "<p>Estevan Off-Leash Dog Park is a conservative park record built from the strongest official municipal clues currently available, not from unsupported feature claims. The City of Estevan's Selfie Spot page explicitly tells visitors to walk down from the 4th Avenue Walking Path into the valley to the off-leash dog park, which confirms the park's existence within the city's valley recreation network.</p><p>The reviewed source set is stronger on context than on a formal park fact sheet. The Pleasantdale Valley Walking Path page gives exact valley access points at Wellock Road and Souris Avenue North on the north side and off King Street between Cundall Drive and Hillcrest Drive on the south side, while the city tourism page separately points to the 4th Avenue South walking-path route as the way down to the off-leash dog park. Because the city does not clearly publish one dedicated dog-park address page in the source set reviewed here, the safest approach is to describe the park as a valley off-leash destination and tell visitors to verify the final entrance on arrival.</p><p>Estevan's licensing page supplies the rule framework around that visit. The City says pet owners are responsible under the Animal Control Bylaw and that unlicensed animals can result in a fine. For a high-trust listing, it is better to rely on those published municipal duties and conservative location wording than to invent precise fencing, water, or bench details that the city does not clearly publish on the reviewed pages.</p>");
    set("Street Address", "Valley walking-path area below 4th Avenue South");
    set("latitude", "");
    set("longitude", "");
    set("City", "Estevan");
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
    set("Parking Available", "Unknown - verify from nearby valley access");
    set("Washrooms nearby", "Unknown");
    set("Operating hours", "Unknown - check posted signage");
    set("Seasonal Restrictions", "Check path and valley conditions before use");
    set("Park Website or Source", "https://estevan.ca/selfie-spot/");
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=4th+Avenue+South+Walking+Path+Estevan+SK");
    set("Tags", "leash-free, Estevan, Saskatchewan, valley dog park");
    set("Notes / Comments", "<p>The strongest official park-specific support is the City of Estevan Selfie Spot page, which directs visitors down from the 4th Avenue Walking Path to the off-leash dog park. Nearby valley access context comes from the City's Pleasantdale Valley Walking Path page. Exact amenities and final entrance details were intentionally left conservative.</p>");
    set("Intro Paragraph", "<p>Estevan Off-Leash Dog Park is the city's valley off-leash destination referenced by current municipal recreation content. Use the walking-path network to orient yourself, then confirm the final entrance on arrival.</p>");
    set("Media", "");
    set("Reviewed On", reviewDate);
    set("Meta Title", "Estevan Off-Leash Dog Park | Estevan, Saskatchewan");
    set("Meta Description", "Source-backed guide to Estevan Off-Leash Dog Park, including official valley location context and current municipal licensing requirements.");

    nextLines.push(csv(row));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Estevan city guide and added an official-context Estevan off-leash park record.");
