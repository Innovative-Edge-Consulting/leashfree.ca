import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const citiesJsonFile = "src/data/generated/cities.json";
const parksJsonFile = "src/data/generated/parks.json";

const reviewDate = "Sat Jul 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const dogParkSource = "https://www.townofws.ca/live/animal-services/dog-park/";
const dogLicencesSource = "https://www.townofws.ca/live/animal-services/dog-licences/";
const parksSource = "https://www.townofws.ca/play/parks-and-open-spaces/";
const animalServicesSource = "https://www.townofws.ca/live/animal-services/";
const wildlifeSource = "https://www.townofws.ca/live/animal-services/wildlife/";

const parkSlug = "stouffville-leash-free-dog-park";
const parkTitle = "Stouffville Leash Free Dog Park";
const parkSeoTitle = "Stouffville Leash Free Dog Park | Stouffville, Ontario";
const parkMetaDescription =
  "Source-backed guide to Stouffville Leash Free Dog Park at 350 Rougeview Avenue, including the town's fenced off-leash description and current dog-licensing rules.";

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

const citySeoTitle = "Dog Parks in Stouffville, Ontario | Off-Leash Guide";
const cityMetaDescription =
  "Source-backed guide to dog parks in Stouffville, Ontario, based on official Town of Whitchurch-Stouffville dog park, dog licence, parks, animal services, and wildlife pages.";
const cityIntro =
  "<p>The older Stouffville page was thin and factually off target because it tied the town's dog-park coverage to Memorial Park. The current Town of Whitchurch-Stouffville source set is clearer: the official leash-free dog park page places the dog park at 350 Rougeview Avenue and describes it as a permanent fenced facility for large and small dogs.</p>";
const cityAbout =
  "<p>The Town of Whitchurch-Stouffville's official dog-park page provides the strongest anchor for this city guide. The town says the leash-free dog park is located at 350 Rougeview Avenue and describes it as a permanent fenced-in facility that provides a safe off-leash environment for dogs, large and small, to interact, socialize, and play. That is materially better than the older local content, which incorrectly pointed users to Memorial Park instead of the official Rougeview Avenue site.</p><p>The town's broader parks page adds the citywide context that matters outside the fenced dog park. Stouffville says dogs are welcome in town parks, but they must be leashed at all times and litter must be picked up as required by Parks Bylaw 75-87. The wildlife page reinforces that same rule more broadly by telling residents to keep dogs on a leash unless in a designated leash-free area.</p><p>Licensing is the other key operational fact. Stouffville's dog-licence page says the town's Dog Licensing By-law requires owners to buy or renew dog licences annually because they expire at the end of the year. It also says owners who do not have a dog licence may be charged a fine of up to $600. Together, those official pages are enough to support a stronger Stouffville guide without inventing unsupported details such as washrooms, published hours, or extra amenities that the reviewed town pages do not clearly confirm.</p>";
const citySeasonal =
  "<ul><li><strong>Winter:</strong> The town's general parks guidance says walkways in parks are not maintained during winter months, so use caution around snowy or icy access paths.</li><li><strong>Spring:</strong> Trail and grass conditions can be softer after thaw, so arrive ready for muddy footing near pond and path areas.</li><li><strong>Summer:</strong> The official dog-park page confirms the Rougeview Avenue site as the designated off-leash location, but the reviewed town pages do not clearly publish on-site water details, so bring your own.</li><li><strong>Fall:</strong> Re-check posted rules and local conditions before longer visits as daylight shortens and park surfaces change.</li></ul>";
const cityRules =
  "<p><strong>Official location:</strong> The Town of Whitchurch-Stouffville places the leash-free dog park at 350 Rougeview Avenue.</p><p><strong>Park type:</strong> The town describes it as a permanent fenced-in facility for large and small dogs to interact, socialize, and play off leash.</p><p><strong>Leash rules outside the dog park:</strong> Stouffville's parks page says dogs in town parks must be leashed at all times, and the wildlife page says to keep dogs on a leash unless in a designated leash-free area.</p><p><strong>Cleanup:</strong> The parks page says litter must be picked up as required by Parks Bylaw 75-87.</p><p><strong>Dog licensing:</strong> The town's Dog Licensing By-law requires dog licences to be bought or renewed annually, and licences expire at the end of each year.</p><p><strong>Enforcement:</strong> The dog-licence page says owners without a dog licence may be charged a fine of up to $600.</p>";
const cityEtiquette =
  "<p><strong>1. Use the Rougeview Avenue park as the town's designated off-leash space.</strong></p><p>The town's own pages separate the fenced dog park from regular parks, where dogs still need to stay leashed.</p><p><strong>2. Do not treat other Stouffville parkland as off-leash by default.</strong></p><p>The wildlife and parks pages both reinforce that leash control still applies outside designated leash-free areas.</p><p><strong>3. Arrive with waste bags and use them.</strong></p><p>The town's parks guidance makes cleanup part of normal park use.</p><p><strong>4. Keep licensing current.</strong></p><p>Stouffville's annual licensing requirement is explicit and should be treated as basic visit readiness, not optional admin.</p><p><strong>5. Avoid over-claiming amenities when planning.</strong></p><p>The reviewed town pages clearly support the fenced off-leash status and location, but not a full amenity sheet or published hours, so confirm details on site.</p>";
const cityFaqs =
  "<p><strong>1. Does Stouffville have an official leash-free dog park?</strong></p><p>Yes. The town's dog-park page publishes a designated leash-free dog park at 350 Rougeview Avenue.</p><p><strong>2. Is the Stouffville dog park fenced?</strong></p><p>Yes. The town describes it as a permanent fenced-in facility.</p><p><strong>3. Can dogs be off leash in other town parks?</strong></p><p>No. The town's parks and wildlife guidance says dogs should be leashed unless in a designated leash-free area.</p><p><strong>4. Do Stouffville dogs need a licence?</strong></p><p>Yes. The Dog Licensing By-law requires owners to buy or renew dog licences annually.</p><p><strong>5. Where is the park?</strong></p><p>The official location published by the town is 350 Rougeview Avenue.</p><p><strong>6. Are published park hours available on the reviewed official pages?</strong></p><p>Not clearly. Confirm posted hours and local conditions on arrival.</p>";

const parkBody =
  "<p>Stouffville Leash Free Dog Park is the Town of Whitchurch-Stouffville's designated municipal dog park. The town's official dog-park page places it at 350 Rougeview Avenue and describes it as a permanent fenced-in facility that provides a safe, off-leash environment for dogs, large and small, to interact, socialize, and play.</p><p>That official description is enough to correct the older local content, which incorrectly tied Stouffville's dog-park coverage to Memorial Park and left the actual municipal site underrepresented. The strongest town-published facts are the Rougeview Avenue location, the fenced off-leash status, and the explicit large-and-small-dog wording. The reviewed town pages do not clearly publish a fuller amenity sheet, so this record stays conservative instead of guessing at washrooms, water, or posted hours.</p><p>The broader operating context comes from the town's dog-licence, parks, and wildlife pages. Dog licences must be bought or renewed annually because they expire at the end of the year, and the town says owners without a dog licence may face a fine of up to $600. Outside designated leash-free areas, dogs in town parks must remain leashed, and owners are expected to pick up after them. That makes Rougeview Avenue the town's clearer off-leash destination, while regular park rules still control the rest of the system.</p>";
const parkIntro =
  "<p>Stouffville Leash Free Dog Park is the Town of Whitchurch-Stouffville's fenced municipal off-leash site at 350 Rougeview Avenue.</p>";
const parkNotes =
  `<p>Primary official sources reviewed July 25, 2026: ${dogParkSource}, ${dogLicencesSource}, ${parksSource}, ${animalServicesSource}, and ${wildlifeSource}. This record corrects older local copy that pointed Stouffville dog-park users to Memorial Park instead of the official Rougeview Avenue leash-free park.</p>`;

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
    if (values[headerIndex.get("Slug")] === "stouffville") {
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
      set("City Website", dogParkSource);
      set("Province Page", "https://leashfree.ca/ontario-dog-parks");
      set("Dog Park Etiquettes", cityEtiquette);
      set("Dog Park FAQs", cityFaqs);
      set("Nearby Cities", "");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Stouffville row not found in city CSV.");
  fs.writeFileSync(cityFile, `${nextLines.join("\n")}\n`);
}

function upsertParkCsv() {
  const raw = fs.readFileSync(parkFile, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  for (const header of ["Reviewed On", "Meta Title", "Meta Description"]) {
    if (!headers.includes(header)) headers.push(header);
  }
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  let found = false;

  const nextLines = [csv(headers)];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = parseCsvLine(lines[lineIndex]);
    while (values.length < headers.length) values.push("");
    if (values[headerIndex.get("slug")] === parkSlug) {
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
      set("Street Address", "350 Rougeview Avenue");
      set("latitude", "");
      set("longitude", "");
      set("City", "Stouffville");
      set("Province", "Ontario");
      set("Postal Code", "");
      set("Fenced", "Yes");
      set("Separate Small Dog Area", "Town says the park is for large and small dogs; separate zones are not clearly confirmed");
      set("Surface type", "Unknown");
      set("Size", "Unknown");
      set("Water source available", "Unknown - bring your own water");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Unknown - verify on arrival");
      set("Washrooms nearby", "Unknown");
      set("Operating hours", "Unknown - verify posted hours on arrival");
      set("Seasonal Restrictions", "Check posted local conditions and winter pathway cautions");
      set("Park Website or Source", dogParkSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=350+Rougeview+Avenue+Stouffville+ON");
      set("Tags", "leash-free, Stouffville, Ontario, municipal dog park");
      set("Notes / Comments", parkNotes);
      set("Intro Paragraph", parkIntro);
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", parkSeoTitle);
      set("Meta Description", parkMetaDescription);
    }
    nextLines.push(csv(values));
  }

  if (!found) {
    const values = Array(headers.length).fill("");
    const set = (field, value) => {
      values[headerIndex.get(field)] = value;
    };
    set("Park Name", parkTitle);
    set("slug", parkSlug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "stouffville-dog-park-20260725");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", parkTitle);
    set("Park type", "Leash Free");
    set("Description", parkBody);
    set("Street Address", "350 Rougeview Avenue");
    set("latitude", "");
    set("longitude", "");
    set("City", "Stouffville");
    set("Province", "Ontario");
    set("Postal Code", "");
    set("Fenced", "Yes");
    set("Separate Small Dog Area", "Town says the park is for large and small dogs; separate zones are not clearly confirmed");
    set("Surface type", "Unknown");
    set("Size", "Unknown");
    set("Water source available", "Unknown - bring your own water");
    set("Benches", "Unknown");
    set("Shaded area", "Unknown");
    set("Waste bins", "Unknown");
    set("Bag Dispensers", "Unknown");
    set("Parking Available", "Unknown - verify on arrival");
    set("Washrooms nearby", "Unknown");
    set("Operating hours", "Unknown - verify posted hours on arrival");
    set("Seasonal Restrictions", "Check posted local conditions and winter pathway cautions");
    set("Park Website or Source", dogParkSource);
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=350+Rougeview+Avenue+Stouffville+ON");
    set("Tags", "leash-free, Stouffville, Ontario, municipal dog park");
    set("Notes / Comments", parkNotes);
    set("Intro Paragraph", parkIntro);
    set("Media", "");
    set("Reviewed On", reviewDate);
    set("Meta Title", parkSeoTitle);
    set("Meta Description", parkMetaDescription);
    nextLines.push(csv(values));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

function updateGeneratedJson() {
  const cities = JSON.parse(fs.readFileSync(citiesJsonFile, "utf8"));
  const city = cities.find((entry) => entry.slug === "stouffville");
  if (!city) throw new Error("Stouffville city record not found in generated JSON.");
  city.seoTitle = citySeoTitle;
  city.metaDescription = cityMetaDescription;
  city.description = cityMetaDescription;
  city.body =
    "<p>The Town of Whitchurch-Stouffville's official dog-park page places the municipality's leash-free dog park at 350 Rougeview Avenue and describes it as a permanent fenced-in facility for large and small dogs. That immediately corrects the older local version of this city page, which incorrectly framed Stouffville dog-park coverage around Memorial Park rather than the town's current designated Rougeview Avenue site.</p><p>The town's dog-licence page adds the compliance layer that matters before regular visits. Stouffville says its Dog Licensing By-law requires dog licences to be bought or renewed annually because they expire at the end of the year, and owners without a dog licence may face a fine of up to $600.</p><p>The town's parks and wildlife pages clarify the off-leash boundary. Dogs are welcome in Stouffville parks, but they must be leashed at all times unless they are in a designated leash-free area, and owners are expected to pick up litter and waste. For a high-trust guide, it is better to stay precise on those published rules than to invent unsupported amenities or hours that the reviewed official pages do not clearly state.</p>";
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
  city.raw["City Website"] = dogParkSource;
  city.raw["Province Page"] = "https://leashfree.ca/ontario-dog-parks";
  city.raw["Dog Park Etiquettes"] = cityEtiquette;
  city.raw["Dog Park FAQs"] = cityFaqs;
  city.raw["Nearby Cities"] = "";
  city.raw["Reviewed On"] = reviewDate;
  city.references["Featured Park 1"] = [parkSlug];
  city.references["Province Page"] = ["https://leashfree.ca/ontario-dog-parks"];

  const parks = JSON.parse(fs.readFileSync(parksJsonFile, "utf8"));
  const existingIndex = parks.findIndex((entry) => entry.slug === parkSlug);
  const parkRecord = {
    id: "stouffville-dog-park-20260725",
    name: parkTitle,
    slug: parkSlug,
    title: parkTitle,
    seoTitle: parkSeoTitle,
    metaDescription: parkMetaDescription,
    description: parkMetaDescription,
    body: parkBody,
    collection: "Dog Parks",
    sourceFile: parkFile,
    canonicalUrl: `https://leashfree.ca/dog-parks/${parkSlug}/`,
    routePath: `/dog-parks/${parkSlug}/`,
    media: [],
    references: {
      Tags: ["leash-free", "Stouffville", "Ontario", "municipal dog park"]
    },
    raw: {
      "Park Name": parkTitle,
      slug: parkSlug,
      "Collection ID": "683758b0a3f8a696dfc417b0",
      "Locale ID": "683758b09dd1e3ac2e4e9809",
      "Item ID": "stouffville-dog-park-20260725",
      Archived: "false",
      Draft: "false",
      "Created On": reviewDate,
      "Updated On": reviewDate,
      "Published On": reviewDate,
      "Park Header": parkTitle,
      "Park type": "Leash Free",
      Description: parkBody,
      "Street Address": "350 Rougeview Avenue",
      latitude: "",
      longitude: "",
      City: "Stouffville",
      Province: "Ontario",
      "Postal Code": "",
      Fenced: "Yes",
      "Separate Small Dog Area": "Town says the park is for large and small dogs; separate zones are not clearly confirmed",
      "Surface type": "Unknown",
      Size: "Unknown",
      "Water source available": "Unknown - bring your own water",
      Benches: "Unknown",
      "Shaded area": "Unknown",
      "Waste bins": "Unknown",
      "Bag Dispensers": "Unknown",
      "Parking Available": "Unknown - verify on arrival",
      "Washrooms nearby": "Unknown",
      "Operating hours": "Unknown - verify posted hours on arrival",
      "Seasonal Restrictions": "Check posted local conditions and winter pathway cautions",
      "Park Website or Source": dogParkSource,
      "Google Maps Link": "https://www.google.com/maps/search/?api=1&query=350+Rougeview+Avenue+Stouffville+ON",
      Tags: "leash-free, Stouffville, Ontario, municipal dog park",
      "Notes / Comments": parkNotes,
      "Intro Paragraph": parkIntro,
      Media: "",
      "Reviewed On": reviewDate,
      "Meta Title": parkSeoTitle,
      "Meta Description": parkMetaDescription
    },
    warnings: []
  };

  if (existingIndex >= 0) {
    parks[existingIndex] = parkRecord;
  } else {
    parks.push(parkRecord);
  }

  fs.writeFileSync(citiesJsonFile, `${JSON.stringify(cities, null, 2)}\n`);
  fs.writeFileSync(parksJsonFile, `${JSON.stringify(parks, null, 2)}\n`);
}

updateCityCsv();
upsertParkCsv();
updateGeneratedJson();
console.log("Updated Stouffville city page and added the official Rougeview dog park record.");
