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
    if (values[headerIndex.get("Slug")] === "yorkton") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Yorkton");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Yorkton, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Yorkton, Saskatchewan, centered on Wiggly Field, the city's official off-leash dog park, plus leash rules and visit planning tips.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Yorkton's dog park situation is straightforward: the City of Yorkton says it has one off-leash dog park, Wiggly Field. For local dog owners, that means the city guide should focus less on hunting for multiple options and more on understanding where legal off-leash use is allowed and what municipal rules still apply everywhere else.</p>");
      set("About Section", "<p>The City of Yorkton's animal-services page names Wiggly Field as the city's single off-leash dog park. A separate city heritage page adds useful location context by noting that Wiggly Field opened in 2015 on the former site of JayCee Beach. Yorkton's sports-fields page places the Jaycee Beach Ball Complex just off York Road West, which helps explain the park's broader recreation setting without overstating an exact civic address that the city does not clearly publish on the dog-park summary page.</p><p>That matters for quality and trust. Rather than padding the page with generic prose about dogs running around, the practical takeaway is that Yorkton appears to rely on one official municipal off-leash area while maintaining standard leash expectations everywhere else in the city. If you are visiting with your dog, Wiggly Field is the official starting point to verify before assuming any other green space is open for off-leash use.</p>");
      set("Featured Park 1", "wiggly-field-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Prairie wind, snow drift, and icy gates can change conditions quickly, so keep dogs leashed until you are fully inside the designated off-leash area.</li><li><strong>Spring:</strong> Grass and surrounding recreation surfaces may soften during thaw. Bring towels and expect muddy paws.</li><li><strong>Summer:</strong> Open-sky exposure can heat up the park fast. Bring water, watch paws on hot surfaces, and visit earlier or later on very warm days.</li><li><strong>Fall:</strong> Cooler temperatures make for easier exercise, but shorter daylight means it is worth checking visibility and footing before evening visits.</li></ul>");
      set("Park Rules", "<p><strong>Leash rule citywide:</strong> The City of Yorkton says all dogs and cats must be on a leash and under your control when off your property.</p><p><strong>Where off-leash is allowed:</strong> The same city enforcement guidance says dogs can be off leash at an off-leash dog park, and the city's animal-services page identifies Wiggly Field as Yorkton's one off-leash dog park.</p><p><strong>Waste cleanup:</strong> Yorkton states that if your dog poops on any property other than your own, public or private, you must remove it immediately.</p>");
      set("City Website", "https://www.yorkton.ca/living-in-yorkton/animal-services/");
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Treat Wiggly Field as the designated off-leash exception, not the default rule.</strong></p><p>Yorkton's enforcement page makes the leash expectation clear outside official off-leash space, so leash up before entering and after leaving.</p><p><strong>2. Clean up immediately.</strong></p><p>The city explicitly calls out feces removal on public and private property, which makes waste-bag readiness part of basic park etiquette here.</p><p><strong>3. Manage greetings at the gate.</strong></p><p>Because Yorkton has one identified off-leash park, different dog sizes and play styles may converge in the same space. Slow entries help reduce pressure at the fence line.</p><p><strong>4. Use judgment with weather exposure.</strong></p><p>Yorkton's open prairie conditions can shift fast with sun, wind, or ice, so keep visits adaptable and leave early if your dog is overheating or uncomfortable.</p><p><strong>5. Check signage and posted conditions when you arrive.</strong></p><p>Municipal park operations change over time, especially in shared recreation areas, so rely on posted instructions over assumptions.</p>");
      set("Dog Park FAQs", "<p><strong>1. How many official off-leash dog parks are in Yorkton?</strong></p><p>The City of Yorkton says it has one off-leash dog park, Wiggly Field.</p><p><strong>2. Can I let my dog off leash in other Yorkton parks?</strong></p><p>City enforcement guidance says dogs must be leashed and under control when off your property, except at an off-leash dog park.</p><p><strong>3. Where is Wiggly Field located?</strong></p><p>Yorkton's published pages identify the park by name and note that it opened on the former JayCee Beach site. City recreation material places the Jaycee Beach Ball Complex just off York Road West, which helps with area context, but visitors should still confirm the final on-site entrance using posted signage or map directions.</p><p><strong>4. Does Yorkton publish dog-poop rules?</strong></p><p>Yes. The city says owners must remove dog poop immediately from any property other than their own.</p><p><strong>5. Why does this city guide focus on one park?</strong></p><p>Because the official city source only identifies one off-leash dog park in Yorkton, a high-quality guide should reflect that actual municipal supply rather than imply a broader network.</p>");
      set("Nearby Cities", "Melville, Esterhazy");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Yorkton row not found in city CSV.");
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
  const slug = "wiggly-field-off-leash-dog-park";
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

    set("Park Name", "Wiggly Field Off-Leash Dog Park");
    set("slug", slug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "yorkton-wiggly-field-20260718");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", "Wiggly Field Off-Leash Dog Park");
    set("Park type", "Leash Free");
    set("Description", "<p>Wiggly Field is the City of Yorkton's identified off-leash dog park. The city's animal-services page says Yorkton has one off-leash dog park, Wiggly Field, which makes this park the primary legal off-leash destination to confirm for local residents and travellers with dogs.</p><p>Yorkton's enforcement page supplies the rule framework around that listing: dogs must be leashed and under your control when off your property, and owners must remove dog poop immediately from public or private property that is not their own. In practice, that means Wiggly Field is not just another generic patch of grass. It is the specific municipal exception that lets dogs exercise off leash while the rest of the city's public realm remains under standard leash rules.</p><p>The city's heritage timeline adds historical context by noting that Wiggly Field opened in 2015 on the former site of JayCee Beach. A separate Yorkton recreation page places the Jaycee Beach Ball Complex just off York Road West, which suggests the dog park sits within or beside a broader ballfield and open-space setting. Because the city does not clearly publish a full civic dog-park address on the source pages used here, visitors should verify the exact entrance with posted signage or live map directions before arrival.</p>");
    set("Street Address", "");
    set("latitude", "");
    set("longitude", "");
    set("City", "Yorkton");
    set("Province", "Saskatchewan");
    set("Postal Code", "");
    set("Fenced", "Unknown - visitor reviews suggest fenced, confirm on arrival");
    set("Separate Small Dog Area", "Unknown");
    set("Surface type", "Grass");
    set("Size", "Unknown");
    set("Water source available", "Unknown");
    set("Benches", "Unknown");
    set("Shaded area", "Unknown");
    set("Waste bins", "Unknown");
    set("Bag Dispensers", "Unknown");
    set("Parking Available", "Unknown - likely nearby in the broader recreation area");
    set("Washrooms nearby", "Unknown");
    set("Operating hours", "Unknown - check posted signage");
    set("Seasonal Restrictions", "Dogs must remain leashed outside the designated off-leash park");
    set("Park Website or Source", "https://www.yorkton.ca/living-in-yorkton/animal-services/");
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=Wiggly+Field+Off-Leash+Dog+Park+Yorkton+SK");
    set("Tags", "leash-free, Yorkton, municipal dog park, Saskatchewan");
    set("Notes / Comments", "<p>Source-backed facts used here come from City of Yorkton pages. The city names Wiggly Field as its one off-leash dog park, states that dogs must be leashed outside designated off-leash areas, and notes that the park opened on the former JayCee Beach site in 2015. The nearby York Road West recreation context is inferred from the city's Jaycee Beach Ball Complex listing, not from a separately published dog-park address page.</p>");
    set("Intro Paragraph", "<p>Wiggly Field Off-Leash Dog Park is Yorkton's official municipal off-leash destination according to the City of Yorkton. If you want a source-backed place to let your dog run legally off leash in the city, this is the park to verify first.</p>");
    set("Media", "");
    set("Reviewed On", reviewDate);
    set("Meta Title", "Wiggly Field Off-Leash Dog Park | Yorkton, Saskatchewan");
    set("Meta Description", "Source-backed guide to Wiggly Field Off-Leash Dog Park in Yorkton, Saskatchewan, covering official off-leash status, leash rules outside the park, and location context from City of Yorkton sources.");

    nextLines.push(csv(row));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Yorkton city guide and added Wiggly Field park record.");
