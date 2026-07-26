import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const citiesJsonFile = "src/data/generated/cities.json";
const parksJsonFile = "src/data/generated/parks.json";

const reviewDate = "Sat Jul 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const animalControlSource = "https://www.steinbach.ca/residents/bylaw-enforcement/animal-control/?PageSpeed=noscript";
const dogParkOpenSource = "https://www.steinbach.ca/notices-and-announcements/park-washrooms-and-dog-park-fountains-open-for-2026-season/";
const dogParkClosedSource = "https://www.steinbach.ca/notices-and-announcements/outdoor-facilities-closed-for-2025/";
const parksSource = "https://www.steinbach.ca/departments-and-services/parks-and-rec/";

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

const citySeoTitle = "Dog Parks in Steinbach, Manitoba | Off-Leash Guide";
const cityMetaDescription =
  "Source-backed guide to dog parks in Steinbach, Manitoba, based on official City of Steinbach animal-control, dog-licensing, parks, and seasonal dog-park notice pages.";
const cityIntro =
  "<p>Steinbach's older city page leaned on generic dog-park copy and unsupported amenity claims. The City of Steinbach now gives enough official information to make this page more useful: it confirms the city manages animal-control rules and dog licensing, and seasonal notices explicitly reference the dog park in L.A. Barkman Kinsmen Park.</p>";
const cityAbout =
  "<p>The strongest current Steinbach evidence comes from the City's own animal-control and parks pages together with seasonal parks notices. Steinbach's animal-control page says pets in public places must be kept on a leash not more than 2.5 metres in length, pets are not permitted to run at large in the city, and Steinbach residents with dogs over six months old need a dog licence. That establishes the citywide rules and licensing context that any Steinbach off-leash guide should lead with.</p><p>For the park-specific anchor, the City's Parks & Recreation notices say the water fountains at the dog park in L.A. Barkman Kinsmen Park were turned on for the 2026 season on May 22, 2026, and turned off for the 2025 season on November 28, 2025. Those notices matter because they confirm the city recognizes and services a dog park at L.A. Barkman Kinsmen Park, while also showing that at least one amenity there is seasonal rather than guaranteed year-round.</p><p>That gives Steinbach a better factual foundation than the previous version of this page, which described a fenced park with specific layout details that were not backed by the official city sources reviewed on July 25, 2026. The safe improvement is to be precise about what the city clearly publishes: leash and control rules, licensing requirements, the existence of the dog park in L.A. Barkman Kinsmen Park, and the seasonal status of the park fountains.</p>";
const citySeasonal =
  "<ul><li><strong>Winter:</strong> The city's November 28, 2025 notice says the dog-park fountains are turned off for the season, so bring your own water.</li><li><strong>Spring:</strong> Watch the city's parks notices for seasonal service changes as amenities reopen.</li><li><strong>Summer:</strong> Steinbach's May 22, 2026 notice says the dog-park fountains in L.A. Barkman Kinsmen Park are turned on for the season.</li><li><strong>Fall:</strong> Re-check city notices before longer visits because seasonal amenity shutdowns can start before winter weather fully sets in.</li></ul>";
const cityRules =
  "<p><strong>Leash control:</strong> The City of Steinbach says a pet in a street or other public place must be kept on a leash not more than 2.5 metres in length unless you are inside a designated off-leash setting.</p><p><strong>Running at large:</strong> Steinbach says pets are not permitted to run at large in the city.</p><p><strong>Clean-up:</strong> Pet owners are responsible for cleaning up after their pets immediately on property other than their own.</p><p><strong>Noise and nuisance:</strong> The city says dog owners must not allow barking or howling that unreasonably disturbs others.</p><p><strong>Dog licensing:</strong> Steinbach residents with a dog over the age of six months need a dog licence, and the city's animal-control page says licences are issued for the lifetime of the pet.</p><p><strong>Park amenity planning:</strong> Steinbach's seasonal notices show that dog-park fountains in L.A. Barkman Kinsmen Park are not a year-round amenity.</p>";
const cityEtiquette =
  "<p><strong>1. Treat off-leash time as the exception, not the default.</strong></p><p>Steinbach's animal-control page makes clear that pets in public places are normally leashed and are not allowed to run at large across the city.</p><p><strong>2. Go prepared for seasonal service changes.</strong></p><p>The city turns the dog-park fountains on and off seasonally, so water availability should be verified before warm-weather visits.</p><p><strong>3. Handle cleanup immediately.</strong></p><p>Steinbach explicitly requires pet owners to clean up after their animals.</p><p><strong>4. Keep dog behaviour manageable.</strong></p><p>The city's nuisance rules matter in and around the park, especially if barking or loss of control affects other users.</p><p><strong>5. Make sure your dog is licensed before regular visits.</strong></p><p>The city requires dog licences for resident dogs over six months old, so that should be part of basic visit prep.</p>";
const cityFaqs =
  "<p><strong>1. Does Steinbach have an official dog park?</strong></p><p>Yes. City notices specifically reference the dog park in L.A. Barkman Kinsmen Park.</p><p><strong>2. What official rules apply outside the off-leash area?</strong></p><p>Steinbach says pets in public places must be kept on a leash not more than 2.5 metres long and pets are not permitted to run at large.</p><p><strong>3. Do Steinbach dog owners need a licence?</strong></p><p>Yes. The city's animal-control page says residents with dogs over six months old need a dog licence.</p><p><strong>4. Is water always available at the dog park?</strong></p><p>No. The city publishes seasonal notices showing the dog-park fountains are turned on and off by season.</p><p><strong>5. Where should I look for current park-service changes?</strong></p><p>Check the City of Steinbach parks and notices pages before visiting.</p><p><strong>6. What should this page avoid claiming?</strong></p><p>Details like exact park layout, washroom access, or published hours should not be treated as confirmed unless the city clearly posts them.</p>";

const parkTitle = "L.A. Barkman Kinsmen Park Dog Park";
const parkSeoTitle = "L.A. Barkman Kinsmen Park Dog Park | Steinbach, Manitoba";
const parkMetaDescription =
  "Source-backed guide to the dog park in L.A. Barkman Kinsmen Park in Steinbach, Manitoba, including official seasonal fountain notices plus Steinbach's leash and dog-licensing rules.";
const parkBody =
  "<p>The City of Steinbach's current official notices do not publish a full standalone park profile, but they do confirm an active dog park in L.A. Barkman Kinsmen Park. On May 22, 2026, the city said the water fountains at the dog park in L.A. Barkman Kinsmen Park were turned on for the season. On November 28, 2025, the city said those same fountains were turned off for the season. That is enough to confirm the city's dog-park use and seasonal servicing at this location.</p><p>The official source set is narrower than the older version of this record, which claimed a specific fenced layout, separate small-dog space, washrooms, and posted hours using a third-party page rather than Steinbach's own site. Based on the city sources reviewed on July 25, 2026, those details should not be treated as confirmed. This updated record keeps the official facts and removes unsupported amenity precision.</p><p>The broader visit rules come from Steinbach's animal-control page. The city says pets in public places must be kept on a leash not more than 2.5 metres in length, pets are not permitted to run at large in the city, owners must clean up after their pets, and Steinbach residents with dogs over six months old need a dog licence. That gives dog owners the key compliance context even where the city has not published a full dedicated dog-park detail page.</p>";
const parkIntro =
  "<p>The City of Steinbach's official notices confirm a dog park in L.A. Barkman Kinsmen Park and show that its dog-park fountains are managed seasonally.</p>";
const parkNotes =
  `<p>Primary official sources reviewed July 25, 2026: ${dogParkOpenSource}, ${dogParkClosedSource}, ${animalControlSource}, and ${parksSource}. This record intentionally removes unsupported legacy claims about exact hours, separate small-dog areas, and washrooms because the official city pages reviewed do not clearly confirm them.</p>`;

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
    if (values[headerIndex.get("Slug")] === "steinbach") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", citySeoTitle);
      set("Meta Description", cityMetaDescription);
      set("Hero Image", "");
      set("Intro Paragraph", cityIntro);
      set("About Section", cityAbout);
      set("Featured Park 1", "la-barkman-park-off-leash-area");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", citySeasonal);
      set("Park Rules", cityRules);
      set("City Website", animalControlSource);
      set("Province Page", "https://leashfree.ca/manitoba-dog-parks");
      set("Dog Park Etiquettes", cityEtiquette);
      set("Dog Park FAQs", cityFaqs);
      set("Nearby Cities", "");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Steinbach row not found in city CSV.");
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
    if (values[headerIndex.get("slug")] === "la-barkman-park-off-leash-area") {
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
      set("Street Address", "L.A. Barkman Kinsmen Park");
      set("latitude", "49.5221");
      set("longitude", "-96.6766");
      set("City", "Steinbach");
      set("Province", "Manitoba");
      set("Postal Code", "");
      set("Fenced", "Unknown - city notices reviewed July 25, 2026 do not clearly confirm fencing");
      set("Separate Small Dog Area", "Unknown");
      set("Surface type", "Unknown");
      set("Size", "Unknown");
      set("Water source available", "Seasonal - city notices say the dog-park fountains are turned on and off by season");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Unknown");
      set("Washrooms nearby", "Unknown - city notice references seasonal park washrooms elsewhere, not specifically this dog park");
      set("Operating hours", "Unknown - verify posted hours on arrival");
      set("Seasonal Restrictions", "City notices confirm dog-park fountains are turned on and off by season");
      set("Park Website or Source", dogParkOpenSource);
      set("Google Maps Link", "https://maps.google.com/?q=L.A.+Barkman+Kinsmen+Park+Steinbach+MB");
      set("Tags", "leash-free, Steinbach, Manitoba, municipal dog park");
      set("Notes / Comments", parkNotes);
      set("Intro Paragraph", parkIntro);
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", parkSeoTitle);
      set("Meta Description", parkMetaDescription);
    }
    nextLines.push(csv(values));
  }

  if (!found) throw new Error("Steinbach park row not found in park CSV.");
  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

function updateGeneratedJson() {
  const cities = JSON.parse(fs.readFileSync(citiesJsonFile, "utf8"));
  const city = cities.find((entry) => entry.slug === "steinbach");
  if (!city) throw new Error("Steinbach city record not found in generated JSON.");
  city.seoTitle = citySeoTitle;
  city.metaDescription = cityMetaDescription;
  city.description = cityMetaDescription;
  city.body =
    "<p>Steinbach's official animal-control page says pets in public places must be kept on a leash not more than 2.5 metres in length, pets are not permitted to run at large in the city, and Steinbach residents with dogs over six months old need a dog licence. That gives this city page a much stronger regulatory base than the older version, which relied on generic park copy and unsupported amenity claims.</p><p>The city also publishes park-specific seasonal notices. On May 22, 2026, Steinbach said the water fountains at the dog park in L.A. Barkman Kinsmen Park were turned on for the season, and on November 28, 2025, the city said those fountains were turned off for the season. Those notices confirm the city's dog-park location and show that at least one key amenity is seasonal rather than permanent.</p><p>That means a responsible Steinbach guide should stay precise: the reviewed city sources support the existence of the dog park in L.A. Barkman Kinsmen Park, the city's leash and cleanup rules, and the local dog-licensing requirement. They do not clearly support more detailed claims about exact park layout, washrooms, or published hours, so those details should be verified locally before being stated as fact.</p>";
  city.media = [];
  city.raw["Updated On"] = reviewDate;
  city.raw["Published On"] = reviewDate;
  city.raw["SEO Title Tag"] = citySeoTitle;
  city.raw["Meta Description"] = cityMetaDescription;
  city.raw["Hero Image"] = "";
  city.raw["Intro Paragraph"] = cityIntro;
  city.raw["About Section"] = cityAbout;
  city.raw["Featured Park 1"] = "la-barkman-park-off-leash-area";
  city.raw["Featured Park 2"] = "";
  city.raw["Featured Park 3"] = "";
  city.raw["Seasonal Tips"] = citySeasonal;
  city.raw["Park Rules"] = cityRules;
  city.raw["City Website"] = animalControlSource;
  city.raw["Province Page"] = "https://leashfree.ca/manitoba-dog-parks";
  city.raw["Dog Park Etiquettes"] = cityEtiquette;
  city.raw["Dog Park FAQs"] = cityFaqs;
  city.raw["Nearby Cities"] = "";
  city.raw["Reviewed On"] = reviewDate;
  city.references["Featured Park 1"] = ["la-barkman-park-off-leash-area"];
  city.references["Province Page"] = ["https://leashfree.ca/manitoba-dog-parks"];

  const parks = JSON.parse(fs.readFileSync(parksJsonFile, "utf8"));
  const park = parks.find((entry) => entry.slug === "la-barkman-park-off-leash-area");
  if (!park) throw new Error("Steinbach park record not found in generated JSON.");
  park.name = parkTitle;
  park.title = parkTitle;
  park.seoTitle = parkSeoTitle;
  park.metaDescription = parkMetaDescription;
  park.description = parkMetaDescription;
  park.body = parkBody;
  park.references.Tags = ["leash-free", "Steinbach", "Manitoba", "municipal dog park"];
  park.raw["Park Name"] = parkTitle;
  park.raw["Updated On"] = reviewDate;
  park.raw["Published On"] = reviewDate;
  park.raw["Park Header"] = parkTitle;
  park.raw["Description"] = parkBody;
  park.raw["Street Address"] = "L.A. Barkman Kinsmen Park";
  park.raw["Postal Code"] = "";
  park.raw["Fenced"] = "Unknown - city notices reviewed July 25, 2026 do not clearly confirm fencing";
  park.raw["Separate Small Dog Area"] = "Unknown";
  park.raw["Surface type"] = "Unknown";
  park.raw["Size"] = "Unknown";
  park.raw["Water source available"] = "Seasonal - city notices say the dog-park fountains are turned on and off by season";
  park.raw["Benches"] = "Unknown";
  park.raw["Shaded area"] = "Unknown";
  park.raw["Waste bins"] = "Unknown";
  park.raw["Bag Dispensers"] = "Unknown";
  park.raw["Parking Available"] = "Unknown";
  park.raw["Washrooms nearby"] = "Unknown - city notice references seasonal park washrooms elsewhere, not specifically this dog park";
  park.raw["Operating hours"] = "Unknown - verify posted hours on arrival";
  park.raw["Seasonal Restrictions"] = "City notices confirm dog-park fountains are turned on and off by season";
  park.raw["Park Website or Source"] = dogParkOpenSource;
  park.raw["Google Maps Link"] = "https://maps.google.com/?q=L.A.+Barkman+Kinsmen+Park+Steinbach+MB";
  park.raw["Tags"] = "leash-free, Steinbach, Manitoba, municipal dog park";
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
console.log("Updated Steinbach city and park records from current official municipal sources.");
