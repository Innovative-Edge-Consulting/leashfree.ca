import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const citiesJsonFile = "src/data/generated/cities.json";
const parksJsonFile = "src/data/generated/parks.json";

const reviewDate = "Sat Jul 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const dogParkSource = "https://warman.ca/678/Off-Leash-Dog-Park";
const petLicensingSource = "https://warman.ca/801/Pet-Licensing-Animal-Services";
const parksSource = "https://warman.ca/466/Parks-Playgrounds";

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
  return fields
    .map((value) => {
      const field = value ?? "";
      return /[",\r\n]/.test(field) ? `"${field.replaceAll("\"", "\"\"")}"` : field;
    })
    .join(",");
}

const citySeoTitle = "Dog Parks in Warman, Saskatchewan | Off-Leash Guide";
const cityMetaDescription =
  "Source-backed guide to dog parks in Warman, Saskatchewan, based on the city's official off-leash dog park, parks, and pet-licensing pages.";
const cityIntro =
  "<p>Warman has a clearly published municipal off-leash dog park and a better official source set than the older city draft reflected. The city publishes the park's location context, rules, fencing, and licensing requirements directly, which makes it possible to replace generic copy with a more trustworthy guide.</p>";
const cityAbout =
  "<p>The City of Warman's official off-leash dog park page says the Warman Off-Leash Dog Park is on Central Street on the east side of the city. A second city parks page places it at the Central Street East entrance by the train monument. Together, those pages provide much stronger location context than the older draft, which pointed readers toward Community Centre Drive and the Legends Centre instead.</p><p>The same official source set confirms the park is fully fenced and includes walking paths, doggie bags, disposal stations, and a small beach area with a pond. Warman also publishes the operating expectations that matter before a visit: the park is for licensed pets only, dogs must wear a valid licence tag and be vaccinated, dogs must be leashed entering and exiting the fenced area, owners must have a leash with them at all times, and any dog altercation means the dogs must be leashed and leave immediately.</p><p>One detail does need caution. Warman's off-leash page says the park offers just over 20 acres of open space, while the parks page says it offers just under 12 acres. Because the city's own pages are inconsistent on size, this guide avoids claiming a precise acreage until the municipality reconciles those figures. The city's pet-licensing page adds one more useful fact: licences are required for dogs and cats within Warman and currently cost $25 for the lifetime of the animal.</p>";
const citySeasonal =
  "<ul><li><strong>Winter:</strong> Prairie wind, snow drifts, and icy gate areas can change access conditions quickly, so leash transitions matter.</li><li><strong>Spring:</strong> Expect softer ground near paths and around the pond-edge area during thaw.</li><li><strong>Summer:</strong> The open site and pond area can make visits appealing, but bring drinking water because the city pages do not clearly publish a separate potable water amenity.</li><li><strong>Fall:</strong> Cooler weather is often better for longer off-leash sessions, but check surface conditions and posted notices before evening visits.</li></ul>";
const cityRules =
  "<p><strong>Official location context:</strong> Warman places the park on Central Street at the east entrance into the city, by the train monument.</p><p><strong>Licensing:</strong> The city says the park is for licensed pets only, and its pet-licensing page says a pet licence is required within Warman.</p><p><strong>Dog requirements:</strong> The off-leash page says dogs must have a valid licence tag, wear a collar, and be vaccinated.</p><p><strong>Leash control:</strong> Dogs must be leashed entering and exiting the fenced area, and handlers must have a leash with them at all times.</p><p><strong>Conflict management:</strong> If there is an altercation between dogs, the city says the dogs must be leashed and the owners and dogs must leave immediately.</p>";
const cityEtiquette =
  "<p><strong>1. Treat the licence requirement as mandatory.</strong></p><p>Warman explicitly says the park is for licensed pets only, and its pet-licensing page sets out the city's licence requirement.</p><p><strong>2. Keep entries and exits controlled.</strong></p><p>The official rules say dogs must be leashed entering and exiting the fenced area and that handlers must have a leash with them at all times.</p><p><strong>3. Do not assume the pond means a full-service park.</strong></p><p>The city publishes a small beach area with a pond, but it does not clearly publish a separate drinking-water amenity, so bring water for your dog.</p><p><strong>4. Leave immediately if dog interactions escalate.</strong></p><p>The city says any altercation means the dogs must be leashed and both owners and dogs must leave.</p><p><strong>5. Stay conservative where the city is inconsistent.</strong></p><p>Because Warman's own pages conflict on acreage, focus on the published rules and location context instead of relying on unsupported size claims.</p>";
const cityFaqs =
  "<p><strong>1. Does Warman have an official off-leash dog park?</strong></p><p>Yes. The City of Warman publishes an official off-leash dog park page and lists the park in its parks and playgrounds section.</p><p><strong>2. Where does the city place the park?</strong></p><p>Warman places it on Central Street at the east entrance into the city, by the train monument.</p><p><strong>3. Is the park fenced?</strong></p><p>Yes. The official off-leash page says the dog park is fully fenced.</p><p><strong>4. What amenities does the city publish?</strong></p><p>The city publishes walking paths, doggie bags, disposal stations, and a small beach area with a pond.</p><p><strong>5. Do I need a licence for my dog?</strong></p><p>Yes. The city says the park is for licensed pets only, and its pet-licensing page says Warman licences currently cost $25 for the lifetime of the animal.</p><p><strong>6. Why does this guide avoid an exact acreage claim?</strong></p><p>Because Warman's own pages currently conflict, with one saying just over 20 acres and another saying just under 12 acres.</p>";

const parkTitle = "Warman Off-Leash Dog Park";
const parkSeoTitle = "Warman Off-Leash Dog Park | Warman, Saskatchewan";
const parkMetaDescription =
  "Source-backed guide to Warman Off-Leash Dog Park, including the city's Central Street location context, fenced status, published amenities, licensing rules, and acreage discrepancy note.";
const parkBody =
  "<p>Warman Off-Leash Dog Park is the City of Warman's official municipal off-leash dog park. The city places it on Central Street on the east side of Warman and, on its parks page, more specifically at the Central Street East entrance by the train monument. The same official source set says the park is fully fenced and includes walking paths, doggie bags, disposal stations, and a small beach area with a pond.</p><p>That makes this page materially stronger than the older draft, which leaned on unsourced location detail and hard acreage language without acknowledging that Warman's own pages do not match on size. The off-leash page says the park offers just over 20 acres of open space, while the parks page says it offers just under 12 acres. Because the municipality itself is inconsistent here, this guide avoids claiming an exact acreage and prioritizes the rules and visit details the city clearly does publish.</p><p>Those published rules are practical: the park is for licensed pets only, dogs must have a valid licence tag, wear a collar, and be vaccinated, dogs must be leashed entering and exiting the fenced area, handlers must have a leash with them at all times, waste must be disposed of immediately, and if dogs get into an altercation the dogs must be leashed and both owners and dogs must leave immediately. Warman's pet-licensing page also says city licences currently cost $25 for the lifetime of the animal.</p>";
const parkIntro =
  "<p>Warman Off-Leash Dog Park is Warman's official fenced municipal off-leash space on Central Street at the city's east entrance, with published walking paths, waste stations, and a small pond area.</p>";
const parkNotes =
  `<p>Primary official park source: ${dogParkSource}. Supporting park-system context: ${parksSource}. Licensing source: ${petLicensingSource}. Warman's own pages conflict on acreage, so this record deliberately avoids a precise size claim until the city reconciles that detail.</p>`;

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
    if (values[headerIndex.get("Slug")] === "warman") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Warman");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", citySeoTitle);
      set("Meta Description", cityMetaDescription);
      set("Hero Image", "");
      set("Intro Paragraph", cityIntro);
      set("About Section", cityAbout);
      set("Featured Park 1", "warman-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", citySeasonal);
      set("Park Rules", cityRules);
      set("City Website", dogParkSource);
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", cityEtiquette);
      set("Dog Park FAQs", cityFaqs);
      set("Nearby Cities", "Saskatoon, Martensville");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Warman row not found in city CSV.");
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
  let found = false;

  const nextLines = [csv(headers)];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (!line) continue;
    const values = parseCsvLine(line);
    while (values.length < headers.length) values.push("");
    if (values[headerIndex.get("slug")] === "warman-off-leash-dog-park") {
      found = true;
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("Park Name", parkTitle);
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", parkTitle);
      set("Park type", "Leash Free");
      set("Description", parkBody);
      set("Street Address", "Central Street East entrance into Warman, by the train monument");
      set("City", "Warman");
      set("Province", "Saskatchewan");
      set("Postal Code", "");
      set("Fenced", "Yes");
      set("Separate Small Dog Area", "Unknown");
      set("Surface type", "Open grass space, walking paths, and pond edge");
      set("Size", "City pages conflict on acreage; verify locally");
      set("Water source available", "Unknown - pond area is published, drinking water is not");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Yes");
      set("Bag Dispensers", "Yes");
      set("Parking Available", "Unknown - verify on arrival");
      set("Washrooms nearby", "Unknown");
      set("Operating hours", "Hours not posted on the official city pages reviewed July 25, 2026");
      set("Seasonal Restrictions", "None published on the city pages reviewed July 25, 2026");
      set("Park Website or Source", dogParkSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=Warman+Off-Leash+Dog+Park+Central+Street+East+Warman+SK");
      set("Tags", "leash-free, Warman, Saskatchewan, municipal dog park");
      set("Notes / Comments", parkNotes);
      set("Intro Paragraph", parkIntro);
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", parkSeoTitle);
      set("Meta Description", parkMetaDescription);
    }
    nextLines.push(csv(values));
  }

  if (!found) throw new Error("Warman Off-Leash Dog Park row not found in park CSV.");
  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

function updateGeneratedJson() {
  const cities = JSON.parse(fs.readFileSync(citiesJsonFile, "utf8"));
  const city = cities.find((entry) => entry.slug === "warman");
  if (!city) throw new Error("Warman city record not found in generated JSON.");
  city.seoTitle = citySeoTitle;
  city.metaDescription = cityMetaDescription;
  city.description = cityMetaDescription;
  city.body =
    "<p>The City of Warman publishes an official off-leash dog park and provides a much stronger factual base than the older city page reflected. Warman's own pages place the park on Central Street at the east side of the city, say it is fully fenced, and list practical amenities including walking paths, doggie bags, disposal stations, and a small beach area with a pond.</p><p>The city also publishes the operating rules dog owners actually need before visiting. Warman says the park is for licensed pets only, dogs must have a valid licence tag, wear a collar, and be vaccinated, dogs must be leashed entering and exiting the fenced area, handlers must carry a leash, and dog altercations require owners to leash up and leave immediately.</p><p>One point needs caution: Warman's official pages conflict on the park's acreage, with one page saying just over 20 acres and another saying just under 12 acres. This guide therefore avoids a precise size claim and focuses on the official rules, location context, and licensing facts the city clearly supports. Warman's pet-licensing page also says licences currently cost $25 for the lifetime of the animal.</p>";
  city.media = [];
  city.raw["Updated On"] = reviewDate;
  city.raw["Published On"] = reviewDate;
  city.raw["SEO Title Tag"] = citySeoTitle;
  city.raw["Meta Description"] = cityMetaDescription;
  city.raw["Hero Image"] = "";
  city.raw["Intro Paragraph"] = cityIntro;
  city.raw["About Section"] = cityAbout;
  city.raw["Featured Park 1"] = "warman-off-leash-dog-park";
  city.raw["Featured Park 2"] = "";
  city.raw["Featured Park 3"] = "";
  city.raw["Seasonal Tips"] = citySeasonal;
  city.raw["Park Rules"] = cityRules;
  city.raw["City Website"] = dogParkSource;
  city.raw["Province Page"] = "https://leashfree.ca/saskatchewan-dog-parks";
  city.raw["Dog Park Etiquettes"] = cityEtiquette;
  city.raw["Dog Park FAQs"] = cityFaqs;
  city.raw["Nearby Cities"] = "Saskatoon, Martensville";
  city.raw["Reviewed On"] = reviewDate;
  city.references["Featured Park 1"] = ["warman-off-leash-dog-park"];
  city.references["Province Page"] = ["https://leashfree.ca/saskatchewan-dog-parks"];
  city.references["Nearby Cities"] = ["Saskatoon", "Martensville"];

  const parks = JSON.parse(fs.readFileSync(parksJsonFile, "utf8"));
  const park = parks.find((entry) => entry.slug === "warman-off-leash-dog-park");
  if (!park) throw new Error("Warman park record not found in generated JSON.");
  park.title = parkTitle;
  park.seoTitle = parkSeoTitle;
  park.metaDescription = parkMetaDescription;
  park.description = parkMetaDescription;
  park.body = parkBody;
  park.references.Tags = ["leash-free", "Warman", "Saskatchewan", "municipal dog park"];
  park.raw["Updated On"] = reviewDate;
  park.raw["Published On"] = reviewDate;
  park.raw["Park Header"] = parkTitle;
  park.raw["Description"] = parkBody;
  park.raw["Street Address"] = "Central Street East entrance into Warman, by the train monument";
  park.raw["Postal Code"] = "";
  park.raw["Fenced"] = "Yes";
  park.raw["Separate Small Dog Area"] = "Unknown";
  park.raw["Surface type"] = "Open grass space, walking paths, and pond edge";
  park.raw["Size"] = "City pages conflict on acreage; verify locally";
  park.raw["Water source available"] = "Unknown - pond area is published, drinking water is not";
  park.raw["Benches"] = "Unknown";
  park.raw["Shaded area"] = "Unknown";
  park.raw["Waste bins"] = "Yes";
  park.raw["Bag Dispensers"] = "Yes";
  park.raw["Parking Available"] = "Unknown - verify on arrival";
  park.raw["Washrooms nearby"] = "Unknown";
  park.raw["Operating hours"] = "Hours not posted on the official city pages reviewed July 25, 2026";
  park.raw["Seasonal Restrictions"] = "None published on the city pages reviewed July 25, 2026";
  park.raw["Park Website or Source"] = dogParkSource;
  park.raw["Google Maps Link"] = "https://www.google.com/maps/search/?api=1&query=Warman+Off-Leash+Dog+Park+Central+Street+East+Warman+SK";
  park.raw["Tags"] = "leash-free, Warman, Saskatchewan, municipal dog park";
  park.raw["Notes / Comments"] = parkNotes;
  park.raw["Intro Paragraph"] = parkIntro;
  park.raw["Reviewed On"] = reviewDate;
  park.raw["Meta Title"] = parkSeoTitle;
  park.raw["Meta Description"] = parkMetaDescription;

  fs.writeFileSync(citiesJsonFile, `${JSON.stringify(cities, null, 2)}\n`);
  fs.writeFileSync(parksJsonFile, `${JSON.stringify(parks, null, 2)}\n`);
}

updateCityCsv();
updateParkCsv();
updateGeneratedJson();
console.log("Updated Warman city and park records from current official city sources.");
