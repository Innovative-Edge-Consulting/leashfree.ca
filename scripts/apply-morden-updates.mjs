import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const citiesJsonFile = "src/data/generated/cities.json";
const parksJsonFile = "src/data/generated/parks.json";

const reviewDate = "Sat Jul 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const parksSource = "https://morden.ca/parks-urban-forestry/parks";
const animalControlSource = "https://morden.ca/animal-control";
const leashReminderSource = "https://morden.ca/reminder-keep-your-pets-leashed";
const bylawsSource = "https://morden.ca/by-laws-policies";
const permitsSource = "https://morden.ca/applications-permits-licences";

const parkSlug = "morden-dog-park";
const parkTitle = "Morden Dog Park";
const parkSeoTitle = "Morden Dog Park | Morden, Manitoba";
const parkMetaDescription =
  "Source-backed guide to Morden Dog Park at Steppler Park on Jefferson Street, including Morden's leash rules, dog licensing context, and official off-leash location details.";

const citySeoTitle = "Dog Parks in Morden, Manitoba | Off-Leash Guide";
const cityMetaDescription =
  "Source-backed guide to dog parks in Morden, Manitoba, based on official City of Morden parks, animal control, by-law, and dog licensing information.";
const cityIntro =
  "<p>Morden's official sources support a much tighter guide than the older generic version. The City of Morden parks page places the off-leash dog park at Steppler Park on the corner of 9th Street South and Jefferson Street, while the city's animal-control and leash-reminder pages make clear that dogs must stay leashed elsewhere unless they are in a designated off-leash area.</p>";
const cityAbout =
  "<p>The strongest official anchor for Morden is the city's parks page. Morden lists Steppler Park as a small park at the corner of 9th Street South and Jefferson Street and says this is also the location of Morden's off-leash dog park. The city's January 28, 2025 reminder about keeping pets leashed reinforces the same point in plainer language by saying the Morden Dog Park on Jefferson Street is the dedicated space for off-leash activity.</p><p>The animal-control page adds the operational rules that matter outside the dog park. Morden says dogs are not allowed to be loose unless they are on your property or in a designated off-leash area like Steppler Park, and dogs off your property must be on a leash no longer than 2 metres (6 feet) when fully extended. The same page says dogs are not allowed on school grounds, sports fields, playgrounds, or golf courses, and it states the fine for violating that by-law is $150.</p><p>Licensing is also explicit. Morden's animal-control and applications pages explain how to purchase a dog licence, including bringing proof of current rabies vaccination and paying the licence fee at the civic centre. The city also notes that if an unlicensed dog is impounded, an additional fine and licensing fee may be charged before release. That combination of parks, leash, and licensing sources is enough to replace the older unsupported claims about Colert Beach amenities, shade, and operating hours.</p>";
const citySeasonal =
  "<ul><li><strong>Winter:</strong> Expect snow and ice around access paths and park edges, and verify current footing before off-leash play.</li><li><strong>Spring:</strong> Grass surfaces around neighbourhood parks can soften quickly during thaw, so muddy conditions are likely.</li><li><strong>Summer:</strong> Bring water for your dog because the reviewed official pages confirm the off-leash location, but do not clearly publish an on-site water amenity list.</li><li><strong>Fall:</strong> Shorter daylight and wetter turf make it worth checking conditions before later visits.</li></ul>";
const cityRules =
  "<p><strong>Official off-leash location:</strong> The City of Morden parks page places the dog park at Steppler Park, on the corner of 9th Street South and Jefferson Street.</p><p><strong>Leash rules elsewhere:</strong> Morden says dogs are not allowed to be loose unless they are on your property or in a designated off-leash area like Steppler Park.</p><p><strong>Leash length:</strong> Off your property, dogs must be on a leash no longer than 2 metres (6 feet) when fully extended.</p><p><strong>Restricted public spaces:</strong> Dogs are not allowed on school grounds, sports fields, playgrounds, or golf courses.</p><p><strong>Enforcement:</strong> The city says the fine for violating this by-law is $150.</p><p><strong>Dog licensing:</strong> Morden requires owners to complete a dog licence application, bring proof of current rabies vaccination, and pay the licence fee at the civic centre.</p>";
const cityEtiquette =
  "<p><strong>1. Use Steppler Park for off-leash time, not general parkland.</strong></p><p>Morden's own pages point dog owners to the Jefferson Street dog park as the designated off-leash location.</p><p><strong>2. Keep dogs leashed everywhere else unless another area is explicitly designated.</strong></p><p>The city's animal-control page is direct that dogs cannot be loose off property except in a designated off-leash area.</p><p><strong>3. Treat leash length as an enforceable rule, not a suggestion.</strong></p><p>Morden specifies a maximum fully extended leash length of 2 metres (6 feet) when dogs are off your property.</p><p><strong>4. Keep licensing and rabies documentation current.</strong></p><p>The city's licence process depends on current rabies proof and is part of basic responsible use.</p><p><strong>5. Avoid over-claiming amenities.</strong></p><p>The reviewed official sources clearly support the location and off-leash designation, but they do not fully confirm detailed amenities or posted hours.</p>";
const cityFaqs =
  "<p><strong>1. Where is Morden's official off-leash dog park?</strong></p><p>The City of Morden places it at Steppler Park, on the corner of 9th Street South and Jefferson Street.</p><p><strong>2. Can dogs be off leash in other Morden parks?</strong></p><p>Not by default. Morden says dogs cannot be loose unless they are on your property or in a designated off-leash area like Steppler Park.</p><p><strong>3. How long can a leash be in public?</strong></p><p>The city says dogs off your property must be on a leash no longer than 2 metres (6 feet) when fully extended.</p><p><strong>4. Are there fines for off-leash violations?</strong></p><p>Yes. Morden says the fine for violating the by-law is $150.</p><p><strong>5. Do dogs need to be licensed in Morden?</strong></p><p>Yes. The city provides a dog licence application process and requires proof of current rabies vaccination when purchasing a licence.</p><p><strong>6. Are official park hours published on the reviewed sources?</strong></p><p>Not clearly on the reviewed dog-specific pages. Check posted signage and local conditions on arrival.</p>";

const cityBody =
  "<p>Morden's official parks page places the city's off-leash dog park at Steppler Park on the corner of 9th Street South and Jefferson Street, and the city's January 28, 2025 leash reminder separately describes the Morden Dog Park on Jefferson Street as the dedicated space for off-leash activity. That is the clearest official location signal for a city guide.</p><p>The city's animal-control page explains the broader rule set around that park. Dogs are not allowed to be loose unless they are on your property or in a designated off-leash area like Steppler Park, and when dogs are off your property they must be on a leash no longer than 2 metres (6 feet) when fully extended. Morden also says dogs are not allowed on school grounds, sports fields, playgrounds, or golf courses, and it publishes a $150 fine for violating the by-law.</p><p>Morden's licensing pages add the compliance context. The city explains how owners purchase a dog licence through the civic centre and bring proof of current rabies vaccination. For a higher-trust page, it is better to stay with those published facts than repeat unsupported claims about shade, water, or year-round hours that the reviewed official sources do not clearly confirm.</p>";

const parkBody =
  "<p>Morden Dog Park is the City of Morden's designated off-leash space. The city's parks page places it at Steppler Park on the corner of 9th Street South and Jefferson Street, and the city's January 28, 2025 leash reminder separately refers to the Morden Dog Park on Jefferson Street as the dedicated area for off-leash activity.</p><p>The most important operating rule comes from Morden's animal-control page: dogs are not allowed to be loose unless they are on your property or in a designated off-leash area like Steppler Park. Outside that designated area, dogs off your property must be on a leash no longer than 2 metres (6 feet) when fully extended. The city also says dogs are not allowed on school grounds, sports fields, playgrounds, or golf courses, and it publishes a $150 fine for violating the by-law.</p><p>The city's licensing information is also relevant for visit readiness. Morden explains that dog owners should complete the dog licence application, bring proof of current rabies vaccination, and pay the licence fee at the civic centre. The reviewed official sources clearly support the park's location and off-leash role, but they do not fully confirm a detailed amenity sheet or published operating hours, so this record stays conservative on those points.</p>";
const parkIntro =
  "<p>Morden Dog Park is the City of Morden's designated off-leash area at Steppler Park on Jefferson Street.</p>";
const parkNotes =
  `<p>Primary official sources reviewed July 25, 2026: ${parksSource}, ${animalControlSource}, ${leashReminderSource}, ${bylawsSource}, and ${permitsSource}. This record replaces older unsupported claims tied to Colert Beach and unverified amenity details.</p>`;

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
    if (values[headerIndex.get("Slug")] === "morden") {
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
      set("Featured Park 1", parkSlug);
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", citySeasonal);
      set("Park Rules", cityRules);
      set("City Website", parksSource);
      set("Province Page", "https://leashfree.ca/manitoba-dog-parks");
      set("Dog Park Etiquettes", cityEtiquette);
      set("Dog Park FAQs", cityFaqs);
      set("Nearby Cities", "");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Morden row not found in city CSV.");
  fs.writeFileSync(cityFile, `${nextLines.join("\n")}\n`);
}

function updateParkCsv() {
  const raw = fs.readFileSync(parkFile, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  if (!headers.includes("Reviewed On")) headers.push("Reviewed On");
  if (!headers.includes("Meta Title")) headers.push("Meta Title");
  if (!headers.includes("Meta Description")) headers.push("Meta Description");
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  let updated = false;

  const nextLines = [csv(headers)];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (!line) continue;
    const values = parseCsvLine(line);
    while (values.length < headers.length) values.push("");
    if (values[headerIndex.get("slug")] === parkSlug) {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", parkTitle);
      set("Park type", "Leash Free");
      set("Description", parkBody);
      set("Street Address", "Steppler Park, corner of 9th Street South & Jefferson Street");
      set("latitude", "");
      set("longitude", "");
      set("City", "Morden");
      set("Province", "Manitoba");
      set("Postal Code", "");
      set("Fenced", "Official pages confirm designated off-leash status; fencing is not clearly confirmed on reviewed city pages");
      set("Separate Small Dog Area", "Unknown");
      set("Surface type", "Grass park setting");
      set("Size", "Unknown");
      set("Water source available", "Unknown - bring your own water");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Unknown - verify on arrival");
      set("Washrooms nearby", "Unknown");
      set("Operating hours", "Unknown - verify posted hours on arrival");
      set("Seasonal Restrictions", "Check posted local conditions before entering");
      set("Park Website or Source", parksSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=Steppler+Park+Morden+MB");
      set("Tags", "leash-free, Morden, Manitoba, municipal dog park");
      set("Notes / Comments", parkNotes);
      set("Intro Paragraph", parkIntro);
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", parkSeoTitle);
      set("Meta Description", parkMetaDescription);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Morden Dog Park row not found in park CSV.");
  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

function updateGeneratedJson() {
  const cities = JSON.parse(fs.readFileSync(citiesJsonFile, "utf8"));
  const city = cities.find((entry) => entry.slug === "morden");
  if (!city) throw new Error("Morden city record not found in generated JSON.");

  city.seoTitle = citySeoTitle;
  city.metaDescription = cityMetaDescription;
  city.description = cityMetaDescription;
  city.body = cityBody;
  city.media = [];
  city.raw["Updated On"] = reviewDate;
  city.raw["Published On"] = reviewDate;
  city.raw["SEO Title Tag"] = citySeoTitle;
  city.raw["Meta Description"] = cityMetaDescription;
  city.raw["Hero Image"] = "";
  city.raw["Intro Paragraph"] = cityIntro;
  city.raw["About Section"] = cityAbout;
  city.raw["Featured Park 1"] = parkSlug;
  city.raw["Featured Park 2"] = "";
  city.raw["Featured Park 3"] = "";
  city.raw["Seasonal Tips"] = citySeasonal;
  city.raw["Park Rules"] = cityRules;
  city.raw["City Website"] = parksSource;
  city.raw["Province Page"] = "https://leashfree.ca/manitoba-dog-parks";
  city.raw["Dog Park Etiquettes"] = cityEtiquette;
  city.raw["Dog Park FAQs"] = cityFaqs;
  city.raw["Nearby Cities"] = "";
  city.raw["Reviewed On"] = reviewDate;
  city.references["Featured Park 1"] = [parkSlug];
  city.references["Province Page"] = ["https://leashfree.ca/manitoba-dog-parks"];

  const parks = JSON.parse(fs.readFileSync(parksJsonFile, "utf8"));
  const park = parks.find((entry) => entry.slug === parkSlug);
  if (!park) throw new Error("Morden Dog Park record not found in generated JSON.");

  park.name = parkTitle;
  park.title = parkTitle;
  park.seoTitle = parkSeoTitle;
  park.metaDescription = parkMetaDescription;
  park.description = parkMetaDescription;
  park.body = parkBody;
  park.media = [];
  park.references = {
    City: ["Morden"],
    Province: ["Manitoba"],
    Tags: ["leash-free", "Morden", "Manitoba", "municipal dog park"]
  };
  park.raw["Updated On"] = reviewDate;
  park.raw["Published On"] = reviewDate;
  park.raw["Park Header"] = parkTitle;
  park.raw["Description"] = parkBody;
  park.raw["Street Address"] = "Steppler Park, corner of 9th Street South & Jefferson Street";
  park.raw["latitude"] = "";
  park.raw["longitude"] = "";
  park.raw["Postal Code"] = "";
  park.raw["Fenced"] = "Official pages confirm designated off-leash status; fencing is not clearly confirmed on reviewed city pages";
  park.raw["Separate Small Dog Area"] = "Unknown";
  park.raw["Surface type"] = "Grass park setting";
  park.raw["Size"] = "Unknown";
  park.raw["Water source available"] = "Unknown - bring your own water";
  park.raw["Benches"] = "Unknown";
  park.raw["Shaded area"] = "Unknown";
  park.raw["Waste bins"] = "Unknown";
  park.raw["Bag Dispensers"] = "Unknown";
  park.raw["Parking Available"] = "Unknown - verify on arrival";
  park.raw["Washrooms nearby"] = "Unknown";
  park.raw["Operating hours"] = "Unknown - verify posted hours on arrival";
  park.raw["Seasonal Restrictions"] = "Check posted local conditions before entering";
  park.raw["Park Website or Source"] = parksSource;
  park.raw["Google Maps Link"] = "https://www.google.com/maps/search/?api=1&query=Steppler+Park+Morden+MB";
  park.raw["Tags"] = "leash-free, Morden, Manitoba, municipal dog park";
  park.raw["Notes / Comments"] = parkNotes;
  park.raw["Intro Paragraph"] = parkIntro;
  park.raw["Media"] = "";
  park.raw["Reviewed On"] = reviewDate;
  park.raw["Meta Title"] = parkSeoTitle;
  park.raw["Meta Description"] = parkMetaDescription;

  fs.writeFileSync(citiesJsonFile, `${JSON.stringify(cities, null, 2)}\n`);
  fs.writeFileSync(parksJsonFile, `${JSON.stringify(parks, null, 2)}\n`);
}

updateCityCsv();
updateParkCsv();
updateGeneratedJson();
console.log("Updated Morden city page and Morden Dog Park with official-source-backed content.");
