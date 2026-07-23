import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Wed Jul 22 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const officialSource = "https://weyburn.ca/weyburn-community-dog-park/";
const rulesSource = "https://weyburn.ca/wp-content/uploads/2016/07/DogParkRulessignage.pdf";

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
    if (values[headerIndex.get("Slug")] === "weyburn") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Weyburn");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Weyburn, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Weyburn, Saskatchewan, focused on the official community dog park, published rules, and practical visit planning.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Weyburn has one of the clearer municipal dog-park source sets in this backlog. The City of Weyburn publishes a dedicated page for the Weyburn Community Dog Park, including the location along the Tatagwa Trail, park size, and fenced layout, and it also links directly to a separate rules PDF.</p>");
      set("About Section", "<p>The City's dog-park page says the Weyburn Community Dog Park is located on Aylmer Street along the Tatagwa Trail, across from the Tatagwa View Care Facility. The same page says the park is fenced, covers 2.8 acres, includes separate areas for large and small dogs, and has a fenced staging area where owners can remove leashes before entering the off-leash sections. That is a much stronger factual base than the older city page, which relied on generic claims and an imprecise location summary.</p><p>Weyburn also publishes the dog-park rules as a separate PDF linked from the official park page. Those rules add the practical details that matter for a higher-trust city guide: dogs must wear current rabies and licence tags, dogs outside the park boundaries must be leashed, owners must carry a leash inside the park, aggressive dogs and dogs in heat are not allowed, food and drinks are prohibited, and owners must clean up waste. Together, the city page and the rules PDF make Weyburn one of the more straightforward municipal off-leash profiles to improve.</p>");
      set("Featured Park 1", "weyburn-community-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> The park remains a useful off-leash option, but snow, ice, and packed surfaces can change footing around gates and the staging area.</li><li><strong>Spring:</strong> Trail approaches and grass zones can soften during thaw, so bring towels and keep transitions controlled near entries.</li><li><strong>Summer:</strong> Open prairie conditions can heat up quickly. Bring water and use the staging area to settle dogs before entering busier play zones.</li><li><strong>Fall:</strong> Cooler temperatures are ideal for longer visits, but shorter daylight and changing ground conditions make earlier outings easier.</li></ul>");
      set("Park Rules", "<p><strong>Official location:</strong> The City of Weyburn places the dog park on Aylmer Street along the Tatagwa Trail, across from the Tatagwa View Care Facility.</p><p><strong>Official park format:</strong> The city says the park is 2.8 acres, fenced, has separate areas for large and small dogs, and includes a fenced staging area for leash removal.</p><p><strong>Leash and tag rules:</strong> The official rules PDF says dogs must wear up-to-date rabies and licence tags, dogs outside the park boundaries must be leashed, and handlers must carry a leash at all times inside the off-leash park.</p><p><strong>Behavior and safety rules:</strong> The official rules prohibit aggressive dogs, female dogs in heat, sick dogs, and dogs younger than four months, and require owners to remove dogs immediately if they become aggressive.</p><p><strong>Cleanup and conduct:</strong> The official rules prohibit glass containers, smoking, and food or drinks, require owners to clean up feces, and require all gates to stay closed.</p>");
      set("City Website", officialSource);
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Use the staging area properly.</strong></p><p>Weyburn's official park page specifically mentions a fenced staging area for removing leashes before entering, so owners should use it to prevent rushed gate entries.</p><p><strong>2. Arrive with current tags and a leash in hand.</strong></p><p>The official rules require up-to-date rabies and licence tags and say handlers must carry a leash inside the park.</p><p><strong>3. Match your dog to the correct section.</strong></p><p>The city says the park has separate areas for large and small dogs, so use the section that best fits your dog's size and play style.</p><p><strong>4. Remove problems immediately.</strong></p><p>The rules require aggressive dogs to be leashed and taken out right away, which means owners need to act quickly instead of hoping behavior settles on its own.</p><p><strong>5. Keep the space clean and low-conflict.</strong></p><p>The rules prohibit food and drinks, require waste pickup, and require gates to stay closed, all of which reduce avoidable conflict and mess.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Weyburn have an official dog park?</strong></p><p>Yes. The City of Weyburn publishes a dedicated page for the Weyburn Community Dog Park.</p><p><strong>2. Where is Weyburn Community Dog Park?</strong></p><p>The city places it on Aylmer Street along the Tatagwa Trail, across from the Tatagwa View Care Facility.</p><p><strong>3. How large is the park?</strong></p><p>The official city page says the park is 2.8 acres.</p><p><strong>4. Are there separate areas for large and small dogs?</strong></p><p>Yes. The city says the park has separate areas for large and small dogs.</p><p><strong>5. Do I need to carry a leash inside the park?</strong></p><p>Yes. The official rules say dogs outside the park boundaries must be leashed and owners must carry a leash with them at all times inside the leash-free park.</p><p><strong>6. What dogs are not allowed?</strong></p><p>The official rules say female dogs in heat, sick dogs, dogs under four months old, and aggressive dogs are not allowed in the park.</p>");
      set("Nearby Cities", "Estevan, Regina");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Weyburn row not found in city CSV.");
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
  const slug = "weyburn-community-dog-park";
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

      set("Park Name", "Weyburn Community Dog Park");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", "Weyburn Community Dog Park");
      set("Park type", "Leash Free");
      set("Description", "<p>Weyburn Community Dog Park is the City of Weyburn's official off-leash dog park on Aylmer Street along the Tatagwa Trail, across from the Tatagwa View Care Facility. The city says the fenced park is 2.8 acres and includes separate areas for large and small dogs along with a fenced staging area where owners can remove leashes before entering the off-leash sections.</p><p>That makes this a notably stronger source-backed park record than many older listings in the current site. Instead of depending on third-party summaries, Weyburn publishes both the park overview and a separate dog-park rules PDF. The rules say dogs must wear current rabies and licence tags, handlers must carry a leash inside the park, and dogs outside the park boundaries must remain leashed.</p><p>The official rules also prohibit female dogs in heat, sick dogs, dogs under four months old, aggressive dogs, food and drinks, glass containers, and smoking. Owners must clean up dog feces, keep gates closed, and remove aggressive dogs immediately. Combined with the city page's layout details, that gives local visitors a practical, high-confidence guide before they arrive.</p>");
      set("Street Address", "Aylmer Street along the Tatagwa Trail, across from the Tatagwa View Care Facility");
      set("latitude", "");
      set("longitude", "");
      set("City", "Weyburn");
      set("Province", "Saskatchewan");
      set("Postal Code", "");
      set("Fenced", "Yes");
      set("Separate Small Dog Area", "Yes");
      set("Surface type", "Grass");
      set("Size", "2.8 acres");
      set("Water source available", "Unknown");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Yes - disposal bags provided");
      set("Parking Available", "Unknown - verify on arrival");
      set("Washrooms nearby", "Unknown");
      set("Operating hours", "Unknown - check posted signage");
      set("Seasonal Restrictions", "None published on the city page");
      set("Park Website or Source", officialSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=Weyburn+Community+Dog+Park+Aylmer+Street+Tatagwa+Trail+Weyburn+SK");
      set("Tags", "leash-free, Weyburn, Saskatchewan, municipal dog park");
      set("Notes / Comments", `<p>Primary official park source: ${officialSource}. Official rules source: ${rulesSource}. Coordinates were left blank because the official city page gives a strong descriptive location but no published latitude/longitude pair.</p>`);
      set("Intro Paragraph", "<p>Weyburn Community Dog Park is the City of Weyburn's official fenced off-leash park. It offers separate large- and small-dog areas plus a fenced staging area for safer entry and exit.</p>");
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", "Weyburn Community Dog Park | Weyburn, Saskatchewan");
      set("Meta Description", "Source-backed guide to Weyburn Community Dog Park in Weyburn, Saskatchewan, including official location details, 2.8-acre layout, separate dog areas, and published rules.");
    }
    nextLines.push(csv(values));
  }

  if (!found) {
    throw new Error("Weyburn Community Dog Park row not found in park CSV.");
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Weyburn city guide and refreshed Weyburn Community Dog Park from official city sources.");
