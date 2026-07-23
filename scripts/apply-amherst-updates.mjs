import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Wed Jul 22 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const officialSource = "https://www.amherst.ca/parks-playgrounds.html";

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
    if (values[headerIndex.get("Slug")] === "amherst") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Amherst");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Amherst, Nova Scotia | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Amherst, Nova Scotia, focused on the official off-leash dog park at Dickey Park, location context, and visit planning.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Amherst's off-leash dog park is now clearly documented on the Town of Amherst website rather than floating around as an unsupported local mention. The town lists the off-leash dog park at Dickey Park on East Pleasant Street and describes it as fenced green space that is available year round.</p>");
      set("About Section", "<p>The Town of Amherst's parks page places the off-leash dog park at Dickey Park, 132 East Pleasant Street. The same page says the dog park is a one-acre fenced-in green space where dogs can run and play all year round. That gives Amherst a much stronger factual base than the older version of this page, which relied on generic claims without a live municipal source.</p><p>The town also describes Dickey Park itself as a broader recreation area with a lighted walking track, a large greenspace, a play structure, a splash pad, and change rooms and washrooms. For dog owners, that matters because the off-leash area is not an isolated field in the abstract. It sits inside a real municipal park setting that is easier to locate and plan around before you arrive.</p>");
      set("Featured Park 1", "amherst-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> The town says the off-leash dog park is open all year round, but snow and ice can change footing at gates and along the wider Dickey Park grounds.</li><li><strong>Spring:</strong> One-acre grass parks can soften during thaw and rain, so bring towels and watch for muddy entry points.</li><li><strong>Summer:</strong> Dickey Park is part of a broader recreation area, so arrive with water and expect more activity around the splash pad and sports spaces.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer visits, but shorter daylight makes it worth planning your run earlier in the day.</li></ul>");
      set("Park Rules", "<p><strong>Official location:</strong> The Town of Amherst places the off-leash dog park at Dickey Park, 132 East Pleasant Street.</p><p><strong>Published park format:</strong> The town describes it as a one-acre fenced-in green space for dogs to run and play all year round.</p><p><strong>Published cleanliness guidance:</strong> The town asks visitors to help keep Amherst clean and beautiful by picking up after their pet and not littering.</p><p><strong>On-site verification:</strong> Amherst's public parks page is concise, so use posted signage at Dickey Park for any additional rules in force on the day of your visit.</p>");
      set("City Website", officialSource);
      set("Province Page", "https://leashfree.ca/nova-scotia-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Treat the fenced area as the off-leash zone and the rest of Dickey Park as shared public space.</strong></p><p>The town's page identifies a specific fenced dog park inside a larger recreation site, so leash transitions and calm entry behavior matter.</p><p><strong>2. Clean up immediately.</strong></p><p>That is one of the few explicit instructions published by the town, so it should be treated as a non-optional part of using the park responsibly.</p><p><strong>3. Plan for a municipal recreation setting, not a remote trailhead.</strong></p><p>Dickey Park also includes a walking track, splash pad, and other family-oriented amenities, which means traffic patterns can be busier than at a standalone dog field.</p><p><strong>4. Check signage before you unclip.</strong></p><p>The official Amherst page confirms the location and core setup, but any day-to-day restrictions or temporary notices will be posted on site.</p>");
      set("Dog Park FAQs", "<p><strong>1. Is there an official off-leash dog park in Amherst?</strong></p><p>Yes. The Town of Amherst lists an off-leash dog park on its Parks & Playgrounds page.</p><p><strong>2. Where is Amherst's off-leash dog park?</strong></p><p>The town places it at Dickey Park, 132 East Pleasant Street.</p><p><strong>3. Is the park fenced?</strong></p><p>Yes. The official town page describes it as a one-acre fenced-in green space.</p><p><strong>4. Is it seasonal?</strong></p><p>No seasonal closure is listed on the town page. Amherst says dogs can run and play there all year round.</p><p><strong>5. What nearby amenities does Dickey Park have?</strong></p><p>The town says Dickey Park includes a lighted walking track, large greenspace, play structure, splash pad, and change rooms and washrooms.</p><p><strong>6. What rule is explicitly published by the town for dog owners?</strong></p><p>The town asks visitors to pick up after their pet and not litter.</p>");
      set("Nearby Cities", "");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Amherst row not found in city CSV.");
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
  const slug = "amherst-off-leash-dog-park";
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

      set("Park Name", "Amherst Off-Leash Dog Park");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", "Amherst Off-Leash Dog Park");
      set("Park type", "Leash Free");
      set("Description", "<p>Amherst Off-Leash Dog Park is the Town of Amherst's published off-leash dog park at Dickey Park, 132 East Pleasant Street. The town's Parks & Playgrounds page describes it as a one-acre fenced-in green space for dogs to run and play all year round.</p><p>That same official source is useful because it also places the dog park inside a broader Dickey Park recreation setting rather than leaving owners to guess where it sits. The town says Dickey Park includes a lighted walking track, a large greenspace, a play structure, a splash pad, and change rooms and washrooms.</p><p>Amherst's published park guidance is concise, but it does include one explicit cleanliness instruction: visitors are asked to pick up after their pet and not litter. For the rest, this page stays conservative and points owners back to posted signage at Dickey Park for any day-specific restrictions or operating details not listed online.</p>");
      set("Street Address", "132 East Pleasant Street");
      set("latitude", "");
      set("longitude", "");
      set("City", "Amherst");
      set("Province", "Nova Scotia");
      set("Postal Code", "");
      set("Fenced", "Yes");
      set("Separate Small Dog Area", "Unknown");
      set("Surface type", "Grass");
      set("Size", "One acre");
      set("Water source available", "Unknown");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Unknown");
      set("Washrooms nearby", "Yes");
      set("Operating hours", "Open all year round");
      set("Seasonal Restrictions", "None published on the town page");
      set("Park Website or Source", officialSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=132+East+Pleasant+Street+Amherst+NS");
      set("Tags", "leash-free, Amherst, Nova Scotia, Dickey Park, municipal dog park");
      set("Notes / Comments", "<p>The official Town of Amherst parks page gives strong location support and core use details for this park. It does not publish a fuller amenity breakdown for the dog park itself, so unknown fields were left conservative rather than guessed.</p>");
      set("Intro Paragraph", "<p>Amherst Off-Leash Dog Park is the Town of Amherst's official fenced dog park at Dickey Park. It gives local owners a clear year-round off-leash option tied to a named municipal recreation site.</p>");
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", "Amherst Off-Leash Dog Park | Amherst, Nova Scotia");
      set("Meta Description", "Source-backed guide to Amherst Off-Leash Dog Park in Amherst, Nova Scotia, including its official Dickey Park location, fenced one-acre layout, and year-round access.");
    }
    nextLines.push(csv(values));
  }

  if (!found) {
    const row = Array(headers.length).fill("");
    const set = (field, value) => {
      row[headerIndex.get(field)] = value;
    };

    set("Park Name", "Amherst Off-Leash Dog Park");
    set("slug", slug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "amherst-dog-park-20260722");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", "Amherst Off-Leash Dog Park");
    set("Park type", "Leash Free");
    set("Description", "<p>Amherst Off-Leash Dog Park is the Town of Amherst's published off-leash dog park at Dickey Park, 132 East Pleasant Street. The town's Parks & Playgrounds page describes it as a one-acre fenced-in green space for dogs to run and play all year round.</p><p>That same official source is useful because it also places the dog park inside a broader Dickey Park recreation setting rather than leaving owners to guess where it sits. The town says Dickey Park includes a lighted walking track, a large greenspace, a play structure, a splash pad, and change rooms and washrooms.</p><p>Amherst's published park guidance is concise, but it does include one explicit cleanliness instruction: visitors are asked to pick up after their pet and not litter. For the rest, this page stays conservative and points owners back to posted signage at Dickey Park for any day-specific restrictions or operating details not listed online.</p>");
    set("Street Address", "132 East Pleasant Street");
    set("latitude", "");
    set("longitude", "");
    set("City", "Amherst");
    set("Province", "Nova Scotia");
    set("Postal Code", "");
    set("Fenced", "Yes");
    set("Separate Small Dog Area", "Unknown");
    set("Surface type", "Grass");
    set("Size", "One acre");
    set("Water source available", "Unknown");
    set("Benches", "Unknown");
    set("Shaded area", "Unknown");
    set("Waste bins", "Unknown");
    set("Bag Dispensers", "Unknown");
    set("Parking Available", "Unknown");
    set("Washrooms nearby", "Yes");
    set("Operating hours", "Open all year round");
    set("Seasonal Restrictions", "None published on the town page");
    set("Park Website or Source", officialSource);
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=132+East+Pleasant+Street+Amherst+NS");
    set("Tags", "leash-free, Amherst, Nova Scotia, Dickey Park, municipal dog park");
    set("Notes / Comments", "<p>The official Town of Amherst parks page gives strong location support and core use details for this park. It does not publish a fuller amenity breakdown for the dog park itself, so unknown fields were left conservative rather than guessed.</p>");
    set("Intro Paragraph", "<p>Amherst Off-Leash Dog Park is the Town of Amherst's official fenced dog park at Dickey Park. It gives local owners a clear year-round off-leash option tied to a named municipal recreation site.</p>");
    set("Media", "");
    set("Reviewed On", reviewDate);
    set("Meta Title", "Amherst Off-Leash Dog Park | Amherst, Nova Scotia");
    set("Meta Description", "Source-backed guide to Amherst Off-Leash Dog Park in Amherst, Nova Scotia, including its official Dickey Park location, fenced one-acre layout, and year-round access.");

    nextLines.push(csv(row));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Amherst city guide and added Amherst Off-Leash Dog Park record.");
