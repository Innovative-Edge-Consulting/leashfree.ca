import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const citiesJsonFile = "src/data/generated/cities.json";
const parksJsonFile = "src/data/generated/parks.json";

const reviewDate = "Sat Jul 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const dogParkSource = "https://www.cityofnb.ca/community-safety-support/animal-services/dog-park/";
const animalServicesSource = "https://www.cityofnb.ca/community-safety-support/animal-services/";
const petLicencesSource = "https://www.cityofnb.ca/community-safety-support/animal-services/pet-licences/";
const parksIndexSource = "https://www.cityofnb.ca/parks-recreation-culture/parks-trails-and-sports-fields/";

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
    if (values[headerIndex.get("Slug")] === "north-battleford") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "North Battleford");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in North Battleford, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in North Battleford, Saskatchewan, based on the city's official dog park page, animal services section, and current pet-licensing rules.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>North Battleford is a much stronger Saskatchewan city page once it is tied to the city's own dog-park and animal-services pages. The City of North Battleford explicitly publishes its dog park, states that it is the only public off-leash area in the city, and pairs that with current pet-licensing rules and contact information.</p>");
      set("About Section", "<p>The city's official dog park page says the Dog Park is the only area where a dog can be off leash in public. It places the park just off Airport Road by Cameron McIntosh Airport, says the park is open all year round, and confirms that it is fully fenced. That is materially better source support than the older generic draft and third-party park listing.</p><p>The same source set also gives practical rule detail. The city says dangerous dogs prohibited under Bylaw 1888 are not allowed, dogs in heat are not allowed, dogs must have a valid pet licence and up-to-date vaccinations, owners must clean up waste, nuisance dogs must be leashed and removed immediately, handlers must accompany their dog and carry a leash no longer than 1.5 metres, and motorized vehicles are not permitted in the park.</p><p>The current pet-licences page strengthens the city guide further by stating that all dogs and cats owned within North Battleford must be licensed and wear a city-issued tag. Together, these official pages support a high-confidence city overview without needing to rely on unsupported amenity claims or an unverified third-party map point.</p>");
      set("Featured Park 1", "north-battleford-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> The city says the dog park is open all year round, but prairie wind, snow, and icy gates can still change visit comfort quickly.</li><li><strong>Spring:</strong> Expect softer ground near entries and fence lines during thaw.</li><li><strong>Summer:</strong> Bring water and check heat exposure before longer play sessions.</li><li><strong>Fall:</strong> Cooler temperatures are ideal, but shorter daylight makes daytime visits easier.</li></ul>");
      set("Park Rules", "<p><strong>Official off-leash status:</strong> The city says the Dog Park is the only area your dog can be off leash in public.</p><p><strong>Location context:</strong> The city places the park just off Airport Road by Cameron McIntosh Airport.</p><p><strong>Core park rules:</strong> No dogs in heat, no dangerous dogs covered by Bylaw 1888, and no motorized vehicles in the park.</p><p><strong>Handler responsibilities:</strong> Owners must accompany their dog, carry a leash no longer than 1.5 metres, clean up waste, and remove nuisance dogs immediately.</p><p><strong>Licensing:</strong> The city's pet-licences page says all dogs and cats owned within North Battleford must be licensed and wear a city-issued tag.</p>");
      set("City Website", dogParkSource);
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Use the published dog park for off-leash time.</strong></p><p>The city explicitly says this is the only public area where dogs may be off leash.</p><p><strong>2. Arrive with licence and vaccination details current.</strong></p><p>The city requires a valid pet licence and says dogs at the park must be up to date with vaccinations.</p><p><strong>3. Stay with your dog and keep a leash on hand.</strong></p><p>The official park rules say handlers must accompany their dog and carry a leash no longer than 1.5 metres.</p><p><strong>4. Remove problems quickly.</strong></p><p>The city says nuisance dogs must be leashed and removed from the park immediately.</p><p><strong>5. Keep the space clean and low-conflict.</strong></p><p>Pick up waste, skip visits with dogs in heat, and avoid assuming unverified amenities will be available.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does North Battleford have an official off-leash dog park?</strong></p><p>Yes. The city publishes an official Dog Park page and says it is the only area where dogs can be off leash in public.</p><p><strong>2. Where does the city place the dog park?</strong></p><p>The city says it is just off Airport Road by Cameron McIntosh Airport.</p><p><strong>3. Is the park fenced?</strong></p><p>Yes. The official dog park page says the park is fully fenced.</p><p><strong>4. Is the park seasonal?</strong></p><p>No. The city says the dog park is open all year round.</p><p><strong>5. Are licences required?</strong></p><p>Yes. The city says all dogs and cats owned within North Battleford must be licensed and wear a city-issued tag.</p><p><strong>6. What rules matter most before visiting?</strong></p><p>Carry a leash, accompany your dog, clean up waste, keep dogs current on licensing and vaccinations, and remove nuisance dogs immediately.</p>");
      set("Nearby Cities", "Battleford, Lloydminster");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("North Battleford row not found in city CSV.");
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
    if (values[headerIndex.get("slug")] === "north-battleford-off-leash-dog-park") {
      found = true;
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("Park Name", "North Battleford Off-Leash Dog Park");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", "North Battleford Off-Leash Dog Park");
      set("Park type", "Leash Free");
      set("Description", "<p>North Battleford Off-Leash Dog Park is the City of North Battleford's official public off-leash dog park. The city says it is the only area where a dog can be off leash in public, places it just off Airport Road by Cameron McIntosh Airport, and confirms that the park is fully fenced and open all year round.</p><p>That immediately makes this page more trustworthy than the older draft, which leaned on a third-party listing and unsupported amenity specifics. The official city page gives stronger location context, confirms the park's fencing and year-round status, and publishes the operating rules that owners actually need before visiting.</p><p>The same municipal source set says no dogs in heat are allowed, dangerous dogs prohibited by Bylaw 1888 are not allowed, dogs must have a valid pet licence and up-to-date vaccinations, owners must clean up waste, nuisance dogs must be leashed and removed immediately, handlers must accompany their dog and carry a leash no longer than 1.5 metres, and motorized vehicles are not permitted in the park. The city's pet-licences page also says dogs and cats owned within North Battleford must be licensed and wear a city-issued tag.</p>");
      set("Street Address", "Just off Airport Road by Cameron McIntosh Airport");
      set("latitude", "");
      set("longitude", "");
      set("City", "North Battleford");
      set("Province", "Saskatchewan");
      set("Postal Code", "");
      set("Fenced", "Yes");
      set("Separate Small Dog Area", "Unknown");
      set("Surface type", "Grass");
      set("Size", "Unknown");
      set("Water source available", "Unknown");
      set("Benches", "Unknown");
      set("Shaded area", "Unknown");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Unknown - verify on arrival");
      set("Washrooms nearby", "Unknown");
      set("Operating hours", "Open all year round");
      set("Seasonal Restrictions", "None published on the city page");
      set("Park Website or Source", dogParkSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=North+Battleford+Dog+Park+Airport+Road+North+Battleford+SK");
      set("Tags", "leash-free, North Battleford, Saskatchewan, municipal dog park");
      set("Notes / Comments", `<p>Primary official park source: ${dogParkSource}. Supporting city context: ${animalServicesSource} and ${parksIndexSource}. Licensing source: ${petLicencesSource}. The city publishes strong location context, rules, fencing, and year-round status, but this pass leaves coordinates and unconfirmed amenities conservative.</p>`);
      set("Intro Paragraph", "<p>North Battleford Off-Leash Dog Park is the city's official fenced public off-leash space, located just off Airport Road by Cameron McIntosh Airport and open all year round.</p>");
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", "North Battleford Off-Leash Dog Park | North Battleford, Saskatchewan");
      set("Meta Description", "Source-backed guide to North Battleford Off-Leash Dog Park, including the city-published Airport Road location context, fenced status, year-round access, and official rules.");
    }
    nextLines.push(csv(values));
  }

  if (!found) throw new Error("North Battleford Off-Leash Dog Park row not found in park CSV.");
  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

function updateGeneratedJson() {
  const cities = JSON.parse(fs.readFileSync(citiesJsonFile, "utf8"));
  const city = cities.find((entry) => entry.slug === "north-battleford");
  if (!city) throw new Error("North Battleford city record not found in generated JSON.");
  city.seoTitle = "Dog Parks in North Battleford, Saskatchewan | Off-Leash Guide";
  city.metaDescription = "Source-backed guide to dog parks in North Battleford, Saskatchewan, based on the city's official dog park page, animal services section, and current pet-licensing rules.";
  city.description = "Source-backed guide to dog parks in North Battleford, Saskatchewan, based on the city's official dog park page, animal services section, and current pet-licensing rules.";
  city.body = "<p>The City of North Battleford publishes an official dog park page that clearly states the Dog Park is the only public area where dogs may be off leash. The city places the park just off Airport Road by Cameron McIntosh Airport, says it is fully fenced, and says it is open all year round.</p><p>That source set is much stronger than the older generic city draft. The city also publishes practical rules for park use, including licensing and vaccination expectations, leash-carry requirements, nuisance-dog removal, and a ban on dogs in heat and motorized vehicles in the park.</p><p>The current pet-licences page adds another important fact base: all dogs and cats owned within North Battleford must be licensed and wear a city-issued tag. That gives this city page enough official support to be specific without inventing amenities the city does not publish.</p>";
  city.media = [];
  city.raw["Updated On"] = reviewDate;
  city.raw["Published On"] = reviewDate;
  city.raw["SEO Title Tag"] = "Dog Parks in North Battleford, Saskatchewan | Off-Leash Guide";
  city.raw["Meta Description"] = "Source-backed guide to dog parks in North Battleford, Saskatchewan, based on the city's official dog park page, animal services section, and current pet-licensing rules.";
  city.raw["Hero Image"] = "";
  city.raw["Intro Paragraph"] = "<p>North Battleford is a much stronger Saskatchewan city page once it is tied to the city's own dog-park and animal-services pages. The City of North Battleford explicitly publishes its dog park, states that it is the only public off-leash area in the city, and pairs that with current pet-licensing rules and contact information.</p>";
  city.raw["About Section"] = "<p>The city's official dog park page says the Dog Park is the only area where a dog can be off leash in public. It places the park just off Airport Road by Cameron McIntosh Airport, says the park is open all year round, and confirms that it is fully fenced. That is materially better source support than the older generic draft and third-party park listing.</p><p>The same source set also gives practical rule detail. The city says dangerous dogs prohibited under Bylaw 1888 are not allowed, dogs in heat are not allowed, dogs must have a valid pet licence and up-to-date vaccinations, owners must clean up waste, nuisance dogs must be leashed and removed immediately, handlers must accompany their dog and carry a leash no longer than 1.5 metres, and motorized vehicles are not permitted in the park.</p><p>The current pet-licences page strengthens the city guide further by stating that all dogs and cats owned within North Battleford must be licensed and wear a city-issued tag. Together, these official pages support a high-confidence city overview without needing to rely on unsupported amenity claims or an unverified third-party map point.</p>";
  city.raw["Featured Park 1"] = "north-battleford-off-leash-dog-park";
  city.raw["Featured Park 2"] = "";
  city.raw["Featured Park 3"] = "";
  city.raw["Seasonal Tips"] = "<ul><li><strong>Winter:</strong> The city says the dog park is open all year round, but prairie wind, snow, and icy gates can still change visit comfort quickly.</li><li><strong>Spring:</strong> Expect softer ground near entries and fence lines during thaw.</li><li><strong>Summer:</strong> Bring water and check heat exposure before longer play sessions.</li><li><strong>Fall:</strong> Cooler temperatures are ideal, but shorter daylight makes daytime visits easier.</li></ul>";
  city.raw["Park Rules"] = "<p><strong>Official off-leash status:</strong> The city says the Dog Park is the only area your dog can be off leash in public.</p><p><strong>Location context:</strong> The city places the park just off Airport Road by Cameron McIntosh Airport.</p><p><strong>Core park rules:</strong> No dogs in heat, no dangerous dogs covered by Bylaw 1888, and no motorized vehicles in the park.</p><p><strong>Handler responsibilities:</strong> Owners must accompany their dog, carry a leash no longer than 1.5 metres, clean up waste, and remove nuisance dogs immediately.</p><p><strong>Licensing:</strong> The city's pet-licences page says all dogs and cats owned within North Battleford must be licensed and wear a city-issued tag.</p>";
  city.raw["City Website"] = dogParkSource;
  city.raw["Dog Park Etiquettes"] = "<p><strong>1. Use the published dog park for off-leash time.</strong></p><p>The city explicitly says this is the only public area where dogs may be off leash.</p><p><strong>2. Arrive with licence and vaccination details current.</strong></p><p>The city requires a valid pet licence and says dogs at the park must be up to date with vaccinations.</p><p><strong>3. Stay with your dog and keep a leash on hand.</strong></p><p>The official park rules say handlers must accompany their dog and carry a leash no longer than 1.5 metres.</p><p><strong>4. Remove problems quickly.</strong></p><p>The city says nuisance dogs must be leashed and removed from the park immediately.</p><p><strong>5. Keep the space clean and low-conflict.</strong></p><p>Pick up waste, skip visits with dogs in heat, and avoid assuming unverified amenities will be available.</p>";
  city.raw["Dog Park FAQs"] = "<p><strong>1. Does North Battleford have an official off-leash dog park?</strong></p><p>Yes. The city publishes an official Dog Park page and says it is the only area where dogs can be off leash in public.</p><p><strong>2. Where does the city place the dog park?</strong></p><p>The city says it is just off Airport Road by Cameron McIntosh Airport.</p><p><strong>3. Is the park fenced?</strong></p><p>Yes. The official dog park page says the park is fully fenced.</p><p><strong>4. Is the park seasonal?</strong></p><p>No. The city says the dog park is open all year round.</p><p><strong>5. Are licences required?</strong></p><p>Yes. The city says all dogs and cats owned within North Battleford must be licensed and wear a city-issued tag.</p><p><strong>6. What rules matter most before visiting?</strong></p><p>Carry a leash, accompany your dog, clean up waste, keep dogs current on licensing and vaccinations, and remove nuisance dogs immediately.</p>";
  city.raw["Nearby Cities"] = "Battleford, Lloydminster";
  city.raw["Reviewed On"] = reviewDate;

  const parks = JSON.parse(fs.readFileSync(parksJsonFile, "utf8"));
  const park = parks.find((entry) => entry.slug === "north-battleford-off-leash-dog-park");
  if (!park) throw new Error("North Battleford park record not found in generated JSON.");
  park.title = "North Battleford Off-Leash Dog Park";
  park.seoTitle = "North Battleford Off-Leash Dog Park | North Battleford, Saskatchewan";
  park.metaDescription = "Source-backed guide to North Battleford Off-Leash Dog Park, including the city-published Airport Road location context, fenced status, year-round access, and official rules.";
  park.description = "Source-backed guide to North Battleford Off-Leash Dog Park, including the city-published Airport Road location context, fenced status, year-round access, and official rules.";
  park.body = "<p>North Battleford Off-Leash Dog Park is the City of North Battleford's official public off-leash dog park. The city says it is the only area where a dog can be off leash in public, places it just off Airport Road by Cameron McIntosh Airport, and confirms that the park is fully fenced and open all year round.</p><p>That immediately makes this page more trustworthy than the older draft, which leaned on a third-party listing and unsupported amenity specifics. The official city page gives stronger location context, confirms the park's fencing and year-round status, and publishes the operating rules that owners actually need before visiting.</p><p>The same municipal source set says no dogs in heat are allowed, dangerous dogs prohibited by Bylaw 1888 are not allowed, dogs must have a valid pet licence and up-to-date vaccinations, owners must clean up waste, nuisance dogs must be leashed and removed immediately, handlers must accompany their dog and carry a leash no longer than 1.5 metres, and motorized vehicles are not permitted in the park. The city's pet-licences page also says dogs and cats owned within North Battleford must be licensed and wear a city-issued tag.</p>";
  park.references.Tags = ["leash-free", "North Battleford", "Saskatchewan", "municipal dog park"];
  park.raw["Updated On"] = reviewDate;
  park.raw["Published On"] = reviewDate;
  park.raw["Park Header"] = "North Battleford Off-Leash Dog Park";
  park.raw["Description"] = park.body;
  park.raw["Street Address"] = "Just off Airport Road by Cameron McIntosh Airport";
  park.raw["latitude"] = "";
  park.raw["longitude"] = "";
  park.raw["Postal Code"] = "";
  park.raw["Fenced"] = "Yes";
  park.raw["Separate Small Dog Area"] = "Unknown";
  park.raw["Surface type"] = "Grass";
  park.raw["Size"] = "Unknown";
  park.raw["Water source available"] = "Unknown";
  park.raw["Benches"] = "Unknown";
  park.raw["Shaded area"] = "Unknown";
  park.raw["Waste bins"] = "Unknown";
  park.raw["Bag Dispensers"] = "Unknown";
  park.raw["Parking Available"] = "Unknown - verify on arrival";
  park.raw["Washrooms nearby"] = "Unknown";
  park.raw["Operating hours"] = "Open all year round";
  park.raw["Seasonal Restrictions"] = "None published on the city page";
  park.raw["Park Website or Source"] = dogParkSource;
  park.raw["Google Maps Link"] = "https://www.google.com/maps/search/?api=1&query=North+Battleford+Dog+Park+Airport+Road+North+Battleford+SK";
  park.raw["Tags"] = "leash-free, North Battleford, Saskatchewan, municipal dog park";
  park.raw["Notes / Comments"] = `<p>Primary official park source: ${dogParkSource}. Supporting city context: ${animalServicesSource} and ${parksIndexSource}. Licensing source: ${petLicencesSource}. The city publishes strong location context, rules, fencing, and year-round status, but this pass leaves coordinates and unconfirmed amenities conservative.</p>`;
  park.raw["Intro Paragraph"] = "<p>North Battleford Off-Leash Dog Park is the city's official fenced public off-leash space, located just off Airport Road by Cameron McIntosh Airport and open all year round.</p>";
  park.raw["Reviewed On"] = reviewDate;
  park.raw["Meta Title"] = "North Battleford Off-Leash Dog Park | North Battleford, Saskatchewan";
  park.raw["Meta Description"] = "Source-backed guide to North Battleford Off-Leash Dog Park, including the city-published Airport Road location context, fenced status, year-round access, and official rules.";

  fs.writeFileSync(citiesJsonFile, `${JSON.stringify(cities, null, 2)}\n`);
  fs.writeFileSync(parksJsonFile, `${JSON.stringify(parks, null, 2)}\n`);
}

updateCityCsv();
updateParkCsv();
updateGeneratedJson();
console.log("Updated North Battleford city and park records from current official city sources.");
