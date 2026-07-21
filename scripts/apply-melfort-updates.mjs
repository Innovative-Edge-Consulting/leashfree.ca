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
    if (values[headerIndex.get("Slug")] === "melfort") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Melfort");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Melfort, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Official-source guide to dog parks in Melfort, Saskatchewan, including Spruce Haven's fenced off-leash park, leash rules, and pet licensing requirements.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Melfort is one of the easier Saskatchewan city pages to improve because the City publishes a dedicated dog-park page instead of leaving visitors to guess from scattered references. The official source set confirms where off-leash recreation is allowed, how the park is divided, and what ownership rules apply across the city.</p>");
      set("About Section", "<p>The City of Melfort's official dog-park page says the off-leash dog park is located near Spruce Haven Park and is the only area in the city where dogs may be off leash in public. That matters because it gives this page a clear municipal rule foundation instead of the generic assumption that any open greenspace might be acceptable for off-leash use.</p><p>The City's broader parks page adds useful location context. Spruce Haven Recreation Area is identified at the corner of Shadd Drive and Spruce Haven Road, and the City lists the off-leash dog park as one of the amenities within that recreation area alongside trails, sports fields, washrooms, and other public facilities. The dedicated dog-park page then confirms that the park is open year round, fully fenced, and organized into suggested small-dog and large-dog sections.</p><p>Melfort also publishes a clear animal-services framework. The City requires annual pet licences for dogs and cats within city limits and states that dogs found running at large are in breach of the dog-control bylaw. The City's walking-trails page reinforces the same distinction: dogs must stay leashed on city trails and can only enjoy unleashed exercise at the designated dog park. That combination gives this page a much stronger factual base than the older draft.</p>");
      set("Featured Park 1", "spruce-haven-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> The City says the dog park is open year round, but prairie wind, packed snow, and icy gates can still affect comfort and footing.</li><li><strong>Spring:</strong> Bring towels and expect muddy ground as snowmelt moves through the recreation area.</li><li><strong>Summer:</strong> Use cooler parts of the day, carry water, and keep dogs leashed until fully inside the off-leash enclosure.</li><li><strong>Fall:</strong> Cooler temperatures are ideal for longer visits, but wet grass and early frost can make surfaces slick.</li></ul>");
      set("Park Rules", "<p><strong>Off-leash access is limited to the designated dog park.</strong> The City says the off-leash dog park near Spruce Haven Park is the only place in Melfort where dogs may be off leash in public.</p><p><strong>Licence your dog.</strong> Melfort requires annual pet licences for dogs and cats within city limits.</p><p><strong>Follow posted park rules.</strong> The official dog-park page says dogs must be leashed while entering and exiting, waste must be cleaned up immediately, handlers must supervise their dogs inside the park, and aggressive dogs must be removed right away.</p>");
      set("City Website", "https://www.melfort.ca/p/dog-park");
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Use the enclosure, not the surrounding greenspace.</strong></p><p>Melfort's rules are unusually clear: off-leash activity belongs inside the designated dog park, not on ordinary trails or park lawns.</p><p><strong>2. Choose the right section thoughtfully.</strong></p><p>The City suggests the small-dog area for dogs under 30 pounds, quieter senior dogs, and dogs more comfortable with smaller companions, while the large-dog area is suggested for dogs over 30 pounds and active small dogs.</p><p><strong>3. Keep transitions calm.</strong></p><p>Because dogs must be leashed while entering and exiting, the gate area should stay controlled and uncluttered.</p><p><strong>4. Supervise actively.</strong></p><p>The official rules require handlers to stay inside the park with a leash readily available.</p><p><strong>5. Respect the prohibited list.</strong></p><p>The City specifically prohibits food or treats, glass containers, dogs in heat, sick dogs, aggressive dogs, and puppies under four months.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Melfort have an official off-leash dog park?</strong></p><p>Yes. The City of Melfort publishes a dedicated dog-park page and says it is the only area in the city where dogs can be off leash in public.</p><p><strong>2. Where is the dog park in Melfort?</strong></p><p>The City places it near Spruce Haven Park, and the broader recreation-area page identifies Spruce Haven Recreation Area at Shadd Drive and Spruce Haven Road.</p><p><strong>3. Is the Melfort dog park fenced?</strong></p><p>Yes. The City's dog-park page says the park is fully fenced.</p><p><strong>4. Are there separate areas for different dogs?</strong></p><p>Yes. The City describes suggested small-dog and large-dog sections within the park.</p><p><strong>5. Are dogs allowed off leash on Melfort walking trails?</strong></p><p>No. The City's trail page says dogs must always be kept on a leash on trails and can only enjoy unleashed exercise at the designated dog park.</p><p><strong>6. Does Melfort require dog licensing?</strong></p><p>Yes. The City's animal-services page says dogs and cats within city limits require an annual pet licence.</p>");
      set("Nearby Cities", "Nipawin, Prince Albert");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Melfort row not found in city CSV.");
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
  let updated = false;
  const slug = "spruce-haven-off-leash-dog-park";

  const nextLines = [csv(headers)];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (!line) continue;
    const values = parseCsvLine(line);
    while (values.length < headers.length) values.push("");
    if (values[headerIndex.get("slug")] === slug) {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", "Spruce Haven Off-Leash Dog Park");
      set("Description", "<p>Spruce Haven Off-Leash Dog Park is Melfort's official fenced off-leash area, located near Spruce Haven Recreation Area with suggested sections for small and large dogs.</p>");
      set("Street Address", "Near Spruce Haven Park");
      set("latitude", "52.8606");
      set("longitude", "-104.6189");
      set("City", "Melfort");
      set("Province", "Saskatchewan");
      set("Postal Code", "S0E 1A0");
      set("Fenced", "Yes");
      set("Separate Small Dog Area", "Yes");
      set("Surface type", "Grass");
      set("Size", "Not specified");
      set("Water source available", "Unknown");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Yes - via Spruce Haven Recreation Area");
      set("Washrooms nearby", "Yes - in Spruce Haven Recreation Area");
      set("Operating hours", "Open year round");
      set("Seasonal Restrictions", "None published; check on-site conditions");
      set("Park Website or Source", "https://www.melfort.ca/p/dog-park");
      set("Google Maps Link", "https://maps.google.com/?q=Shadd+Drive+and+Spruce+Haven+Road+Melfort+SK");
      set("Tags", "leash-free,fenced,small-dog-area,large-dog-area");
      set("Notes / Comments", "<p>Official city sources say the park is near Spruce Haven Park, is fully fenced, open year round, and is the only area in Melfort where dogs may be off leash in public. Spruce Haven Recreation Area is identified by the City at Shadd Drive and Spruce Haven Road.</p>");
      set("Intro Paragraph", "<p>Spruce Haven Off-Leash Dog Park is the City of Melfort's official off-leash area, with fenced space and suggested sections for smaller and larger dogs.</p>");
      set("Reviewed On", reviewDate);
      set("Meta Title", "Spruce Haven Off-Leash Dog Park | Melfort, Saskatchewan");
      set("Meta Description", "Official-source guide to Spruce Haven Off-Leash Dog Park in Melfort, including fencing, section layout, leash rules, and city licensing context.");
      set("Media", "");
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Spruce Haven row not found in park CSV.");
  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Melfort city guide and refreshed the official Spruce Haven dog park record.");
