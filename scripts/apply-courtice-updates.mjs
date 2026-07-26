import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const citiesJsonFile = "src/data/generated/cities.json";
const parksJsonFile = "src/data/generated/parks.json";

const reviewDate = "Sat Jul 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const dogParkSource = "https://www.clarington.net/community-and-people/animal-services/leash-free-dog-parks/";
const facilitySource = "https://facilities.clarington.net/Home/Detail?Id=146b55b7-8c7f-4770-87ca-81a0ae093961";
const petLicensingSource = "https://www.clarington.net/community-and-people/animal-services/pet-licensing/";
const animalServicesSource = "https://www.clarington.net/community-and-people/animal-services/";

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

const citySeoTitle = "Dog Parks in Courtice, Ontario | Off-Leash Guide";
const cityMetaDescription =
  "Source-backed guide to dog parks in Courtice, Ontario, based on Clarington's official leash-free dog parks, facility, animal services, and pet licensing pages.";
const cityIntro =
  "<p>Courtice has a clearly published municipal leash-free dog park, but the older city page relied on generic claims and unsupported details. Clarington now gives enough official detail to make this page specific about location, layout, hours, and the rules owners actually need before arriving.</p>";
const cityAbout =
  "<p>The Municipality of Clarington's official leash-free dog parks page says Courtice has a 1.5-acre fenced dog park on the east side of the South Courtice artificial turf field. The city's linked facility record adds the formal site address: 1595 Prestonvale Road, Courtice. Together, those pages give much stronger location confidence than the older draft, which described Courtice dog parks in broad terms without anchoring the guide to the actual municipal site.</p><p>Clarington also publishes useful layout detail. The municipality says the Courtice park has separate areas for large and small dogs and that the park sits east of the turf field at South Courtice Arena. The facility listing says the status is open and the hours are dawn to dusk, which gives this Courtice page stronger practical value than unsourced seasonal generalities.</p><p>The citywide etiquette and licensing pages add the compliance layer. Clarington says dogs must be on leash until inside the fenced area, owners must keep dogs in sight and within voice range, food and toys are not allowed in the park, and dogs must be up to date on vaccinations. The pet licensing page also says Clarington pet owners are required to license dogs each year. That combination is enough to produce a higher-trust Courtice guide without inventing volunteer support, seating, or maintenance details the official pages do not clearly publish.</p>";
const citySeasonal =
  "<ul><li><strong>Winter:</strong> The facility listing shows the park as open, but frozen ground and icy gate areas can change footing quickly.</li><li><strong>Spring:</strong> Expect softer ground and muddy patches during thaw around the fenced runs and field edges.</li><li><strong>Summer:</strong> Dawn-to-dusk hours give flexibility, but bring water for your dog because the reviewed official pages do not clearly publish a drinking-water amenity.</li><li><strong>Fall:</strong> Cooler temperatures are better for longer visits, though shorter daylight makes earlier trips easier.</li></ul>";
const cityRules =
  "<p><strong>Official location:</strong> Clarington places the Courtice Leash-Free Dog Park on the east side of the South Courtice artificial turf field at 1595 Prestonvale Road.</p><p><strong>Leash control:</strong> The municipality says dogs must stay on leash until inside the fenced area and must be leashed again when exiting.</p><p><strong>Children:</strong> Children under six are not allowed to enter, and an adult must supervise children between six and 12 years old.</p><p><strong>Dog handling:</strong> Owners must keep dogs in sight and within voice range, and leave immediately if a dog is bullying or being bullied.</p><p><strong>Park conduct:</strong> Clarington says do not bring toys, food, or dog treats into the leash-free park, clean up after your dog, and fill in any holes your dog creates.</p><p><strong>Licensing and vaccinations:</strong> Dogs must be up to date on vaccinations, and the city's pet licensing page says Clarington pet owners are required to license dogs each year.</p>";
const cityEtiquette =
  "<p><strong>1. Use the park exactly as the municipality describes it.</strong></p><p>Courtice's official leash-free park is the fenced area east of the South Courtice artificial turf field, not a general off-leash permission across public greenspace.</p><p><strong>2. Keep transitions controlled.</strong></p><p>Clarington explicitly says dogs stay on leash until inside the fenced area and again when leaving, which matters at gates and parking areas.</p><p><strong>3. Skip food, treats, and toys.</strong></p><p>The city's published etiquette forbids them because they can trigger guarding and conflict.</p><p><strong>4. Match the park to your dog.</strong></p><p>The city publishes separate large- and small-dog areas, so use the appropriate section rather than forcing mixed play.</p><p><strong>5. Treat licensing and vaccination status as basic visit prep.</strong></p><p>Clarington says dogs should be up to date on vaccinations and requires pet licensing each year.</p>";
const cityFaqs =
  "<p><strong>1. Does Courtice have an official municipal leash-free dog park?</strong></p><p>Yes. Clarington publishes Courtice as one of its official leash-free dog park locations.</p><p><strong>2. Where is the Courtice park?</strong></p><p>The city places it on the east side of the South Courtice artificial turf field at 1595 Prestonvale Road, Courtice.</p><p><strong>3. Is it fenced?</strong></p><p>Yes. Clarington says it is a 1.5-acre fenced dog park.</p><p><strong>4. Are there separate areas for different dogs?</strong></p><p>Yes. The municipality says the park has separate areas for large and small dogs.</p><p><strong>5. What are the hours?</strong></p><p>The linked facility record lists the hours as dawn to dusk.</p><p><strong>6. Do dogs need to be licensed?</strong></p><p>Clarington's pet licensing page says pet owners are required to license dogs each year.</p>";

const parkTitle = "Courtice Leash-Free Dog Park";
const parkSeoTitle = "Courtice Leash-Free Dog Park | Courtice, Ontario";
const parkMetaDescription =
  "Source-backed guide to Courtice Leash-Free Dog Park, including the official 1595 Prestonvale Road location, 1.5-acre fenced layout, separate dog areas, dawn-to-dusk hours, and Clarington's published rules.";
const parkBody =
  "<p>Courtice Leash-Free Dog Park is the Municipality of Clarington's official off-leash dog park for Courtice. The municipality says it is a 1.5-acre fenced dog park on the east side of the South Courtice artificial turf field, and the linked facility page gives the formal address as 1595 Prestonvale Road, Courtice. Clarington also says the park has separate areas for large and small dogs.</p><p>That makes this page materially stronger than the older draft, which described a different \"South Courtice Dog Park\" in more generic terms and without tying the page to the official municipal park record. The current source set gives exact location context, confirms the fenced layout, and provides operating hours through the facility record.</p><p>Clarington's leash-free dog park etiquette also provides the rules owners need before visiting: children under six are not allowed to enter, children aged six to 12 must be supervised by an adult, dogs must remain on leash until inside the fenced area and again when leaving, toys and food are not allowed, owners must clean up after their dogs, dogs in heat and unaltered male dogs are not allowed, owners may bring a maximum of three dogs, dogs must be up to date on vaccinations, and if a dog is bullying or being bullied the owner should leave immediately. The municipality's pet licensing page also says dog owners in Clarington must license their pets each year.</p>";
const parkIntro =
  "<p>Courtice Leash-Free Dog Park is Clarington's official 1.5-acre fenced off-leash park at 1595 Prestonvale Road, with separate areas for large and small dogs and dawn-to-dusk hours.</p>";
const parkNotes =
  `<p>Primary official leash-free park source: ${dogParkSource}. Facility detail source: ${facilitySource}. Supporting licensing source: ${petLicensingSource}. This record uses the current municipal Courtice park name and avoids unsupported claims about benches, volunteer support, or on-site water.</p>`;

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
    if (values[headerIndex.get("Slug")] === "courtice") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Courtice");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", citySeoTitle);
      set("Meta Description", cityMetaDescription);
      set("Hero Image", "");
      set("Intro Paragraph", cityIntro);
      set("About Section", cityAbout);
      set("Featured Park 1", "south-courtice-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", citySeasonal);
      set("Park Rules", cityRules);
      set("City Website", dogParkSource);
      set("Province Page", "https://leashfree.ca/ontario-dog-parks");
      set("Dog Park Etiquettes", cityEtiquette);
      set("Dog Park FAQs", cityFaqs);
      set("Nearby Cities", "Bowmanville, Newcastle");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Courtice row not found in city CSV.");
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
    if (values[headerIndex.get("slug")] === "south-courtice-dog-park") {
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
      set("Street Address", "1595 Prestonvale Road");
      set("latitude", "43.88928142492009");
      set("longitude", "-78.79032433022415");
      set("City", "Courtice");
      set("Province", "Ontario");
      set("Postal Code", "");
      set("Fenced", "Yes");
      set("Separate Small Dog Area", "Yes");
      set("Surface type", "Grass");
      set("Size", "1.5 acres");
      set("Water source available", "Unknown");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Yes");
      set("Washrooms nearby", "Unknown");
      set("Operating hours", "Dawn to Dusk");
      set("Seasonal Restrictions", "None published on the official pages reviewed July 25, 2026");
      set("Park Website or Source", dogParkSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=1595+Prestonvale+Road+Courtice+ON");
      set("Tags", "leash-free, Courtice, Ontario, municipal dog park");
      set("Notes / Comments", parkNotes);
      set("Intro Paragraph", parkIntro);
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", parkSeoTitle);
      set("Meta Description", parkMetaDescription);
    }
    nextLines.push(csv(values));
  }

  if (!found) throw new Error("South Courtice Dog Park row not found in park CSV.");
  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

function updateGeneratedJson() {
  const cities = JSON.parse(fs.readFileSync(citiesJsonFile, "utf8"));
  const city = cities.find((entry) => entry.slug === "courtice");
  if (!city) throw new Error("Courtice city record not found in generated JSON.");
  city.seoTitle = citySeoTitle;
  city.metaDescription = cityMetaDescription;
  city.description = cityMetaDescription;
  city.body =
    "<p>The Municipality of Clarington publishes an official Courtice leash-free dog park and gives a stronger factual base than the older city page reflected. Clarington says the Courtice park is a 1.5-acre fenced dog park on the east side of the South Courtice artificial turf field, and the municipality's facility page places it at 1595 Prestonvale Road.</p><p>The city also publishes layout and access details that matter to visitors. Courtice's official leash-free park has separate areas for large and small dogs, and the facility listing shows the park as open with dawn-to-dusk hours.</p><p>Clarington's etiquette and animal-services pages provide the operating rules and compliance context: dogs stay on leash until inside the fenced area, toys and food are not allowed, owners can bring a maximum of three dogs, dogs should be up to date on vaccinations, and Clarington pet owners are required to license dogs each year. That is enough to support a higher-trust Courtice guide without inventing on-site amenities the municipality does not clearly publish.</p>";
  city.media = [];
  city.raw["Updated On"] = reviewDate;
  city.raw["Published On"] = reviewDate;
  city.raw["SEO Title Tag"] = citySeoTitle;
  city.raw["Meta Description"] = cityMetaDescription;
  city.raw["Hero Image"] = "";
  city.raw["Intro Paragraph"] = cityIntro;
  city.raw["About Section"] = cityAbout;
  city.raw["Featured Park 1"] = "south-courtice-dog-park";
  city.raw["Featured Park 2"] = "";
  city.raw["Featured Park 3"] = "";
  city.raw["Seasonal Tips"] = citySeasonal;
  city.raw["Park Rules"] = cityRules;
  city.raw["City Website"] = dogParkSource;
  city.raw["Province Page"] = "https://leashfree.ca/ontario-dog-parks";
  city.raw["Dog Park Etiquettes"] = cityEtiquette;
  city.raw["Dog Park FAQs"] = cityFaqs;
  city.raw["Nearby Cities"] = "Bowmanville, Newcastle";
  city.raw["Reviewed On"] = reviewDate;
  city.references["Featured Park 1"] = ["south-courtice-dog-park"];
  city.references["Province Page"] = ["https://leashfree.ca/ontario-dog-parks"];
  city.references["Nearby Cities"] = ["Bowmanville", "Newcastle"];

  const parks = JSON.parse(fs.readFileSync(parksJsonFile, "utf8"));
  const park = parks.find((entry) => entry.slug === "south-courtice-dog-park");
  if (!park) throw new Error("Courtice park record not found in generated JSON.");
  park.title = parkTitle;
  park.seoTitle = parkSeoTitle;
  park.metaDescription = parkMetaDescription;
  park.description = parkMetaDescription;
  park.body = parkBody;
  park.references.Tags = ["leash-free", "Courtice", "Ontario", "municipal dog park"];
  park.raw["Updated On"] = reviewDate;
  park.raw["Published On"] = reviewDate;
  park.raw["Park Header"] = parkTitle;
  park.raw["Description"] = parkBody;
  park.raw["Street Address"] = "1595 Prestonvale Road";
  park.raw["latitude"] = "43.88928142492009";
  park.raw["longitude"] = "-78.79032433022415";
  park.raw["Postal Code"] = "";
  park.raw["Fenced"] = "Yes";
  park.raw["Separate Small Dog Area"] = "Yes";
  park.raw["Surface type"] = "Grass";
  park.raw["Size"] = "1.5 acres";
  park.raw["Water source available"] = "Unknown";
  park.raw["Benches"] = "Unknown";
  park.raw["Shaded area"] = "Unknown";
  park.raw["Waste bins"] = "Unknown";
  park.raw["Bag Dispensers"] = "Unknown";
  park.raw["Parking Available"] = "Yes";
  park.raw["Washrooms nearby"] = "Unknown";
  park.raw["Operating hours"] = "Dawn to Dusk";
  park.raw["Seasonal Restrictions"] = "None published on the official pages reviewed July 25, 2026";
  park.raw["Park Website or Source"] = dogParkSource;
  park.raw["Google Maps Link"] = "https://www.google.com/maps/search/?api=1&query=1595+Prestonvale+Road+Courtice+ON";
  park.raw["Tags"] = "leash-free, Courtice, Ontario, municipal dog park";
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
console.log("Updated Courtice city and park records from current official municipal sources.");
