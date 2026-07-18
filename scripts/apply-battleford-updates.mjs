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
    if (values[headerIndex.get("Slug")] === "battleford") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Battleford");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Battleford, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Battleford, Saskatchewan, focused on the town's official off-leash dog park, park rules, licensing, and visit planning.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Battleford has a clearly documented municipal off-leash dog park rather than a vague local dog area. The Town of Battleford publishes an official page for the park, including its location at the south end of town, year-round access, and a rule set that is specific enough to support a factual city guide instead of generic filler.</p>");
      set("About Section", "<p>The Town of Battleford says its off-leash dog park is located at the south end of Battleford on 13th Street Industrial. The town also notes that the park is open all year and includes two separate spaces: a smaller 0.75 acre area and a larger 2.5 acre area. That is materially better source support than many thin city pages currently in the backlog, because it gives both real visit context and a genuine park structure to describe.</p><p>Battleford's public-safety and administration pages fill in the broader ownership rules around that park. The town requires dogs and cats to be licensed, requires pets to be on a leash when outside the owner's property, and requires immediate waste pickup on other people's property. Together, those pages make the city guide straightforward: Battleford's off-leash park is the specific place where owners can exercise dogs more freely, while the rest of town remains under standard leash and responsibility rules.</p>");
      set("Featured Park 1", "battleford-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> The park is open year-round, but snowpack and icy footing can change entry conditions quickly. Keep a leash ready for transitions.</li><li><strong>Spring:</strong> Mud and thaw can affect both the smaller and larger play areas, so bring towels and watch for soft ground near gates.</li><li><strong>Summer:</strong> Bring water and avoid the hottest part of the day, especially in the larger open area.</li><li><strong>Fall:</strong> Cooler temperatures are ideal for longer sessions, but check footing and visibility as daylight shortens.</li></ul>");
      set("Park Rules", "<p><strong>Where the park is:</strong> The town's official dog-park page places it at the south end of Battleford on 13th Street Industrial.</p><p><strong>Park structure:</strong> The town says the park includes a smaller 0.75 acre area and a larger 2.5 acre area.</p><p><strong>Leash readiness:</strong> Battleford requires attendants to carry a leash not more than 1.5 metres long so dogs can be quickly removed if needed.</p><p><strong>Town-wide pet rules:</strong> Battleford's public-safety guidance says pets must be on a leash outside the owner's property, must be licensed, and owners must remove defecation immediately from other property.</p>");
      set("City Website", "https://battleford.ca/off-leash-dog-park");
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Enter with a leash in hand.</strong></p><p>Battleford's posted rules explicitly require attendants to carry a leash of no more than 1.5 metres, which means the town expects fast intervention if play turns unsafe.</p><p><strong>2. Respect the no-food and no-toys rules.</strong></p><p>The official park page bans both because they can trigger guarding and conflict.</p><p><strong>3. Remove nuisance dogs immediately.</strong></p><p>The town defines nuisance behavior broadly enough to include injury or threats to another dog, person, or property.</p><p><strong>4. Keep children out of the park if they are too small to move safely around off-leash dogs.</strong></p><p>Battleford's official rule sheet says no infants or small children are permitted in the dog park.</p><p><strong>5. Clean up fully, including holes.</strong></p><p>The town's dog-park rules require waste disposal and filling any holes made by your dog.</p>");
      set("Dog Park FAQs", "<p><strong>1. Where is the official off-leash dog park in Battleford?</strong></p><p>The Town of Battleford places it at the south end of town on 13th Street Industrial.</p><p><strong>2. Is the park open year-round?</strong></p><p>Yes. The town says the off-leash dog park is open all year round.</p><p><strong>3. How large is the park?</strong></p><p>The official page says it includes a smaller 0.75 acre area and a larger 2.5 acre area.</p><p><strong>4. Do I need to carry a leash inside the park?</strong></p><p>Yes. Battleford requires attendants to have a leash of not more than 1.5 metres in length.</p><p><strong>5. Are aggressive or in-season dogs allowed?</strong></p><p>No. The town's rules prohibit dangerous, aggressive, and in-season dogs.</p><p><strong>6. Does Battleford require dog licensing?</strong></p><p>Yes. Town public-safety and administration pages say dogs must be licensed and wear a valid tag outside the home.</p>");
      set("Nearby Cities", "North Battleford, Cut Knife");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Battleford row not found in city CSV.");
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
  const slug = "battleford-off-leash-dog-park";
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

    set("Park Name", "Battleford Off-Leash Dog Park");
    set("slug", slug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "battleford-dog-park-20260718");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", "Battleford Off-Leash Dog Park");
    set("Park type", "Leash Free");
    set("Description", "<p>Battleford Off-Leash Dog Park is the Town of Battleford's official dog park at the south end of town on 13th Street Industrial. Unlike many lightly documented listings, the town publishes a dedicated page for this park and confirms that it is open year-round.</p><p>The official town page says the park includes two separate spaces: a smaller 0.75 acre area and a larger 2.5 acre area. That gives local dog owners some flexibility depending on comfort level and dog energy, while still keeping the site under one municipal rule set.</p><p>Battleford also publishes detailed dog-park rules. Attendants must carry a leash not more than 1.5 metres long, dangerous or in-season dogs are not permitted, nuisance dogs must be removed immediately, and no toys or food are allowed in the park. The town's broader pet-ownership guidance adds that pets must be licensed, must be on a leash outside the owner's property, and that waste must be removed immediately from other property. Together, those rules make this page a clear, source-backed entry point for safe and lawful off-leash use in Battleford.</p>");
    set("Street Address", "13th Street Industrial");
    set("latitude", "");
    set("longitude", "");
    set("City", "Battleford");
    set("Province", "Saskatchewan");
    set("Postal Code", "S0M 0E0");
    set("Fenced", "Yes");
    set("Separate Small Dog Area", "Two areas listed; exact small-dog designation not explicitly stated");
    set("Surface type", "Grass");
    set("Size", "0.75 acre smaller area and 2.5 acre larger area");
    set("Water source available", "Unknown");
    set("Benches", "Unknown");
    set("Shaded area", "Unknown");
    set("Waste bins", "Unknown");
    set("Bag Dispensers", "Unknown");
    set("Parking Available", "Likely nearby at the south-end industrial access area");
    set("Washrooms nearby", "Unknown");
    set("Operating hours", "Open all year round");
    set("Seasonal Restrictions", "None published; check conditions during winter and thaw periods");
    set("Park Website or Source", "https://battleford.ca/off-leash-dog-park");
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=13th+Street+Industrial+Battleford+SK");
    set("Tags", "leash-free, Battleford, Saskatchewan, municipal dog park");
    set("Notes / Comments", "<p>Battleford publishes one of the stronger official municipal dog-park source pages in this backlog. Exact coordinates were still left blank because the town page gives a clear area description but no latitude/longitude pair.</p>");
    set("Intro Paragraph", "<p>Battleford Off-Leash Dog Park is the Town of Battleford's official year-round dog park. It offers two play areas and a published rule set that is clear enough for visitors to plan around before they arrive.</p>");
    set("Media", "");
    set("Reviewed On", reviewDate);
    set("Meta Title", "Battleford Off-Leash Dog Park | Battleford, Saskatchewan");
    set("Meta Description", "Source-backed guide to Battleford Off-Leash Dog Park in Battleford, Saskatchewan, including official location context, park size, posted rules, and local pet-licensing requirements.");

    nextLines.push(csv(row));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Battleford city guide and added Battleford off-leash dog park record.");
