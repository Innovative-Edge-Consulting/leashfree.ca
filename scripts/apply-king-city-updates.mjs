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
    if (values[headerIndex.get("Slug")] === "king-city") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "King City");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in King City, Ontario | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in King City, Ontario, focused on the township’s designated off-leash dog park, leash rules, and nearby trail access.");
      set("Intro Paragraph", "<p>King City has one designated off-leash dog park managed by the Township of King. The official township sources position it as a fenced dog area near King Road and Keele Street, with access from Hogan Court and nearby walking-trail connections.</p>");
      set("About Section", "<p>King City’s off-leash option is not a network of scattered dog runs. Instead, the Township of King directs dog owners to one designated King City Off-Leash Dog Park located southwest of King Road and Keele Street, just west of the GO rail corridor. The township’s park page notes that access is via the footpath at the north end of Hogan Court, with a north-south walking trail and a stormwater pond nearby.</p><p>That limited supply makes the city guide straightforward: if you want legal off-leash access in King City itself, this is the official destination to check first. Township sources also make clear that dogs must stay on leash outside designated off-leash areas, which matters because King has an extensive trail network and many multi-use public spaces where standard leash rules still apply.</p>");
      set("Featured Park 1", "king-city-off-leash-dog-park");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Expect snow, ice, and packed-footpath access around the Hogan Court entry. Bring traction and keep dogs leashed until inside the off-leash area.</li><li><strong>Spring:</strong> Thaw conditions can make grassy surfaces soft or muddy. Bring towels and check for standing water near the pond and trail edges.</li><li><strong>Summer:</strong> Visit earlier or later on hot days and bring your own water unless posted amenities confirm otherwise.</li><li><strong>Fall:</strong> Wet leaves and early dusk can reduce visibility on access paths, so keep a leash handy for the walk in and out.</li></ul>");
      set("Park Rules", "<p><strong>Leash rules:</strong> King Township requires dogs to be on leash when not on their owner’s property, except in designated off-leash areas.</p><p><strong>Where off-leash is allowed:</strong> The township identifies the King City Off-Leash Dog Park as one of its two secured, fenced-in off-leash dog areas.</p><p><strong>Enforcement:</strong> Township animal-resources guidance states the fine for having a dog off leash outside an off-leash dog park is $360, and the fine for failing to pick up pet waste is $200.</p>");
      set("City Website", "https://www.king.ca/pets");
      set("Province Page", "https://leashfree.ca/dog-parks/on/");
      set("Dog Park Etiquettes", "<p><strong>1. Keep dogs leashed until you reach the designated off-leash area.</strong></p><p>The township’s leash rules still apply on the approach path and anywhere outside the fenced dog park.</p><p><strong>2. Expect a shared municipal setting.</strong></p><p>The off-leash park sits beside a walking trail and stormwater pond area, so transitions in and out of the enclosure should stay controlled.</p><p><strong>3. Pick up waste immediately.</strong></p><p>King’s animal-resources guidance specifically notes waste enforcement and fines, so bring bags even if township dispensers are available nearby.</p><p><strong>4. Use judgment with play intensity.</strong></p><p>Because King City has only one official off-leash location, dogs of different sizes and play styles may overlap. Step out if the social mix is not working for your dog.</p><p><strong>5. Check posted signs before letting your dog off leash.</strong></p><p>Township updates, maintenance work, or seasonal conditions can affect access or expected use patterns.</p>");
      set("Dog Park FAQs", "<p><strong>1. How many official off-leash dog parks are in King City?</strong></p><p>Township of King sources identify one designated off-leash dog park in King City itself.</p><p><strong>2. Where is the King City off-leash dog park?</strong></p><p>The township places it southwest of King Road and Keele Street, with access via the footpath at the north end of Hogan Court.</p><p><strong>3. Is the dog park fenced?</strong></p><p>Yes. Township pet and news pages describe King’s off-leash dog areas as secured, fenced-in spaces.</p><p><strong>4. Can dogs be off leash on King Township trails?</strong></p><p>No. Township guidance says dogs must be leashed outside designated off-leash areas, even though nearby trail connections exist.</p><p><strong>5. What is the penalty for letting a dog off leash outside the dog park?</strong></p><p>The township states the fine is $360 outside a designated off-leash dog park.</p><p><strong>6. Are there nearby trail connections?</strong></p><p>Yes. The township’s park and trails pages reference a nearby north-south walking trail and the Station Trail / Dog Park Trail connection.</p>");
      set("Nearby Cities", "Nobleton, Schomberg");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("King City row not found in city CSV.");
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
  const slug = "king-city-off-leash-dog-park";
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

    set("Park Name", "King City Off-Leash Dog Park");
    set("slug", slug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "687b0f57c1a24d31b5f9e901");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", "King City Off-Leash Dog Park");
    set("Park type", "Leash Free");
    set("Description", "<p>King City Off-Leash Dog Park is the Township of King’s designated off-leash space for King City. Official township pages describe it as a fenced dog area southwest of King Road and Keele Street, accessed from the north end of Hogan Court and positioned beside a walking trail and stormwater pond.</p><p>Township pet and enforcement pages also make the leash rules explicit: dogs must stay leashed outside designated off-leash areas. That makes this enclosure the key legal off-leash destination for King City dog owners rather than the surrounding trail network.</p>");
    set("Street Address", "At the end of Hogan Court");
    set("latitude", "43.923548");
    set("longitude", "-79.530542");
    set("City", "King City");
    set("Province", "Ontario");
    set("Postal Code", "L7B 0M1");
    set("Fenced", "Yes");
    set("Separate Small Dog Area", "Unknown");
    set("Surface type", "Grass");
    set("Size", "Unknown");
    set("Water source available", "Unknown");
    set("Benches", "Unknown");
    set("Shaded area", "Unknown");
    set("Waste bins", "Unknown");
    set("Bag Dispensers", "Unknown");
    set("Parking Available", "Unknown - confirm nearby posted parking");
    set("Washrooms nearby", "Unknown");
    set("Operating hours", "Unknown - check posted park signage");
    set("Seasonal Restrictions", "Dogs must remain leashed outside the designated off-leash area");
    set("Park Website or Source", "https://www.king.ca/recreation-living/parks-trails-and-forestry/parks/king-city-leash-dog-park");
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=44+Hogan+Court+King+City+ON+L7B+0M1");
    set("Tags", "leash-free, King City, fenced off-leash area, township park");
    set("Notes / Comments", "<p>The Township of King describes this park as one of its two secured, fenced-in off-leash dog areas. The coordinates used here are an access-point approximation based on York Region's address directory entry for 44 Hogan Court, which is the nearby civic address at the north end of the official access path.</p>");
    set("Intro Paragraph", "<p>King City Off-Leash Dog Park is the official off-leash destination identified by the Township of King for dog owners in King City. The township places it near King Road and Keele Street, with pedestrian access from Hogan Court rather than as an open off-leash trail system.</p>");
    set("Reviewed On", reviewDate);
    set("Meta Title", "King City Off-Leash Dog Park | King City, Ontario");
    set("Meta Description", "Source-backed guide to King City Off-Leash Dog Park in King City, Ontario, including official access details, fenced off-leash status, grass surface, and leash rules outside the enclosure.");

    nextLines.push(csv(row));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated King City city guide and park records.");
