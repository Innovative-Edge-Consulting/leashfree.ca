import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const citiesJsonFile = "src/data/generated/cities.json";
const parksJsonFile = "src/data/generated/parks.json";

const reviewDate = "Sat Jul 25 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const dogParkSource = "https://melville.ca/dog-park";
const parksSource = "https://melville.ca/parks-and-playgrounds";
const animalControlSource = "https://melville.ca/animal-control";

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
    if (values[headerIndex.get("Slug")] === "melville") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Melville");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Melville, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Melville, Saskatchewan, based on the city's official dog park, parks, and animal-control pages.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Melville is a stronger Saskatchewan city page once it relies on the City's own dog-park and animal-control pages instead of generic copy. The city directly publishes its off-leash dog park, confirms licensing rules, and gives a detailed park feature list that is specific enough to support a factual rewrite.</p>");
      set("About Section", "<p>The official City of Melville dog-park page describes the Melville Off-Leash Dog Park as a recent recreation addition created to meet public demand for a safe place for dogs to play. The city places the park within Melville Regional Park and the animal-control page says it is east of the tennis courts. Together, those pages provide much better location confidence than the older draft that referenced a different street corner.</p><p>The city also publishes concrete park details. It says the park has 6-foot chain-link fencing, a secure double-gated entrance, sturdy picnic tables, a 1,200-foot or 0.336 km walking track around the perimeter, and 2 acres of open green grass. A separate city page also promotes shady trees and the double-secure gate, which supports the same overall park profile without needing to invent extra amenities.</p><p>Melville's animal-control page strengthens the city guide further. It says all dog and cat owners in the city must license their animals, reminds residents that pets must be leashed when off the owner's premises except at the dog park, and provides current bylaw contact information. The dog-park rules page adds practical visit rules around aggression, age limits, cleanup, supervision, and dawn-to-dusk hours.</p>");
      set("Featured Park 1", "melville-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Melville's dog park hours are still dawn to dusk, but snow and cold prairie wind can shorten comfortable visits.</li><li><strong>Spring:</strong> Expect softer ground and wetter edges during thaw inside Melville Regional Park.</li><li><strong>Summer:</strong> Tree cover helps, but bring water and use the shadier portions of the park for longer play sessions.</li><li><strong>Fall:</strong> Cool temperatures make the walking loop and open grass especially usable.</li></ul>");
      set("Park Rules", "<p><strong>Official city park:</strong> The City of Melville publishes the dog park directly and includes it in its parks and tourism pages.</p><p><strong>Location context:</strong> The city places the dog park within Melville Regional Park, and the animal-control page says it is east of the tennis courts.</p><p><strong>Park setup:</strong> The city says the park has 6-foot chain-link fencing, a secure double-gated entrance, picnic tables, a perimeter walking track, and 2 acres of open grass.</p><p><strong>Use rules:</strong> The city says dogs must be licensed, vaccinated, leashed before entering and leaving, under verbal control, attended at all times, and cleaned up after. Dogs in heat, dogs under four months old, and dogs showing aggression are not allowed.</p><p><strong>Hours:</strong> The official dog-park page says park hours are from dawn until dusk.</p>");
      set("City Website", dogParkSource);
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Use the designated off-leash area, not ordinary city space.</strong></p><p>Melville's animal-control page says pets must be leashed off the owner's premises and specifically points owners to the fenced dog park for off-leash play.</p><p><strong>2. Arrive with licence, vaccination, collar, and ID current.</strong></p><p>The dog-park rules explicitly require dogs to be licensed, vaccinated, and wearing a collar and ID tag.</p><p><strong>3. Enter and leave on leash.</strong></p><p>The city says dogs must be leashed before entering and leaving the facility, and owners should have a leash visible at all times.</p><p><strong>4. Supervise actively.</strong></p><p>Owners must remain in verbal control of their dog, never leave dogs unattended, and remove aggressive dogs immediately.</p><p><strong>5. Keep the park clean and age-appropriate.</strong></p><p>Clean up waste, do not bring dogs in heat, and do not bring dogs younger than four months.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Melville have an official off-leash dog park?</strong></p><p>Yes. The City of Melville publishes an official dog-park page and includes the park in its broader parks listings.</p><p><strong>2. Where is the dog park located?</strong></p><p>The city places it within Melville Regional Park, and the animal-control page says it is east of the tennis courts.</p><p><strong>3. Is the park fenced?</strong></p><p>Yes. The city says it has 6-foot chain-link fencing and a secure double-gated entrance.</p><p><strong>4. How big is the park?</strong></p><p>The official dog-park page says it includes 2 acres of open green grass and a 1,200-foot perimeter walking track.</p><p><strong>5. What are the hours?</strong></p><p>The city says park hours are from dawn until dusk.</p><p><strong>6. Are dog licences required?</strong></p><p>Yes. The city says all dog and cat owners in Melville must license their animals, and the dog-park rules require dogs using the park to be properly licensed.</p>");
      set("Nearby Cities", "Yorkton, Esterhazy");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Melville row not found in city CSV.");
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
    if (values[headerIndex.get("slug")] === "melville-dog-park") {
      found = true;
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("Park Name", "Melville Off-Leash Dog Park");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", "Melville Off-Leash Dog Park");
      set("Park type", "Leash Free");
      set("Description", "<p>Melville Off-Leash Dog Park is the City of Melville's official fenced dog park within Melville Regional Park. The city's animal-control page says it is located east of the tennis courts, while the official dog-park page says the park includes 6-foot chain-link fencing, a secure double-gated entrance, sturdy picnic tables, a 1,200-foot or 0.336 km walking track around the perimeter, and 2 acres of open green grass.</p><p>That makes this page significantly stronger than the older thin draft. Instead of depending on generic claims and unsupported amenities like a water fountain, the current source set gives an explicit city-published layout, rules, and park context. The city's tourism and parks pages also reinforce that this is a recognized recreation feature within the broader park system.</p><p>The official rules are unusually useful. The city says dogs must be properly licensed, vaccinated, and wearing a collar and ID tag; dogs must be leashed before entering and leaving; owners must remain in verbal control; dogs in heat are not allowed; dogs must be at least four months old; waste must be cleaned up; and park hours are from dawn until dusk. The bylaw contact for unattended dogs is also published directly on the dog-park page.</p>");
      set("Street Address", "Within Melville Regional Park, east of the tennis courts");
      set("latitude", "");
      set("longitude", "");
      set("City", "Melville");
      set("Province", "Saskatchewan");
      set("Postal Code", "");
      set("Fenced", "Yes - 6-foot chain-link fence");
      set("Separate Small Dog Area", "Unknown");
      set("Surface type", "Grass");
      set("Size", "2 acres");
      set("Water source available", "Unknown");
      set("Benches", "Picnic tables");
      set("Shaded area", "Yes - mature and new-growth trees nearby");
      set("Waste bins", "Unknown");
      set("Bag Dispensers", "Unknown");
      set("Parking Available", "Unknown - verify on arrival");
      set("Washrooms nearby", "Unknown");
      set("Operating hours", "Dawn to dusk");
      set("Seasonal Restrictions", "None published on the city page");
      set("Park Website or Source", dogParkSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=Melville+Dog+Park+Melville+Regional+Park+SK");
      set("Tags", "leash-free, Melville, Saskatchewan, Melville Regional Park");
      set("Notes / Comments", `<p>Primary official park source: ${dogParkSource}. Supporting park source: ${parksSource}. Animal-control and licensing source: ${animalControlSource}. This pass removes unsupported fountain claims and keeps parking, washrooms, and waste amenities conservative where the city does not clearly publish them.</p>`);
      set("Intro Paragraph", "<p>Melville Off-Leash Dog Park is the City's official fenced off-leash space in Melville Regional Park, with a double-gated entrance, perimeter walking track, and 2 acres of open grass.</p>");
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", "Melville Off-Leash Dog Park | Melville, Saskatchewan");
      set("Meta Description", "Source-backed guide to Melville Off-Leash Dog Park, including the city-published regional-park location, fenced 2-acre layout, dawn-to-dusk hours, and official rules.");
    }
    nextLines.push(csv(values));
  }

  if (!found) throw new Error("Melville Dog Park row not found in park CSV.");
  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

function updateGeneratedJson() {
  const cities = JSON.parse(fs.readFileSync(citiesJsonFile, "utf8"));
  const city = cities.find((entry) => entry.slug === "melville");
  if (!city) throw new Error("Melville city record not found in generated JSON.");
  city.seoTitle = "Dog Parks in Melville, Saskatchewan | Off-Leash Guide";
  city.metaDescription = "Source-backed guide to dog parks in Melville, Saskatchewan, based on the city's official dog park, parks, and animal-control pages.";
  city.description = "Source-backed guide to dog parks in Melville, Saskatchewan, based on the city's official dog park, parks, and animal-control pages.";
  city.body = "<p>The City of Melville directly publishes its off-leash dog park and provides stronger factual support than the older generic city page. The city places the park within Melville Regional Park, says it is east of the tennis courts, and describes a 2-acre fenced space with a double-gated entrance, picnic tables, and a perimeter walking track.</p><p>The official dog-park page also publishes practical operating rules, including licensing, vaccination, age, leash, supervision, cleanup, and aggression standards, along with dawn-to-dusk hours. That makes the page more useful than a general tourism summary.</p><p>Melville's animal-control page strengthens the city guide further by clearly stating that dogs and cats in the city must be licensed and that pets must be leashed off the owner's premises except at the dog park. Together, those official pages support a factual rewrite without unsupported amenity claims.</p>";
  city.media = [];
  city.raw["Updated On"] = reviewDate;
  city.raw["Published On"] = reviewDate;
  city.raw["SEO Title Tag"] = "Dog Parks in Melville, Saskatchewan | Off-Leash Guide";
  city.raw["Meta Description"] = "Source-backed guide to dog parks in Melville, Saskatchewan, based on the city's official dog park, parks, and animal-control pages.";
  city.raw["Hero Image"] = "";
  city.raw["Intro Paragraph"] = "<p>Melville is a stronger Saskatchewan city page once it relies on the City's own dog-park and animal-control pages instead of generic copy. The city directly publishes its off-leash dog park, confirms licensing rules, and gives a detailed park feature list that is specific enough to support a factual rewrite.</p>";
  city.raw["About Section"] = "<p>The official City of Melville dog-park page describes the Melville Off-Leash Dog Park as a recent recreation addition created to meet public demand for a safe place for dogs to play. The city places the park within Melville Regional Park and the animal-control page says it is east of the tennis courts. Together, those pages provide much better location confidence than the older draft that referenced a different street corner.</p><p>The city also publishes concrete park details. It says the park has 6-foot chain-link fencing, a secure double-gated entrance, sturdy picnic tables, a 1,200-foot or 0.336 km walking track around the perimeter, and 2 acres of open green grass. A separate city page also promotes shady trees and the double-secure gate, which supports the same overall park profile without needing to invent extra amenities.</p><p>Melville's animal-control page strengthens the city guide further. It says all dog and cat owners in the city must license their animals, reminds residents that pets must be leashed when off the owner's premises except at the dog park, and provides current bylaw contact information. The dog-park rules page adds practical visit rules around aggression, age limits, cleanup, supervision, and dawn-to-dusk hours.</p>";
  city.raw["Featured Park 1"] = "melville-dog-park";
  city.raw["Featured Park 2"] = "";
  city.raw["Featured Park 3"] = "";
  city.raw["Seasonal Tips"] = "<ul><li><strong>Winter:</strong> Melville's dog park hours are still dawn to dusk, but snow and cold prairie wind can shorten comfortable visits.</li><li><strong>Spring:</strong> Expect softer ground and wetter edges during thaw inside Melville Regional Park.</li><li><strong>Summer:</strong> Tree cover helps, but bring water and use the shadier portions of the park for longer play sessions.</li><li><strong>Fall:</strong> Cool temperatures make the walking loop and open grass especially usable.</li></ul>";
  city.raw["Park Rules"] = "<p><strong>Official city park:</strong> The City of Melville publishes the dog park directly and includes it in its parks and tourism pages.</p><p><strong>Location context:</strong> The city places the dog park within Melville Regional Park, and the animal-control page says it is east of the tennis courts.</p><p><strong>Park setup:</strong> The city says the park has 6-foot chain-link fencing, a secure double-gated entrance, picnic tables, a perimeter walking track, and 2 acres of open grass.</p><p><strong>Use rules:</strong> The city says dogs must be licensed, vaccinated, leashed before entering and leaving, under verbal control, attended at all times, and cleaned up after. Dogs in heat, dogs under four months old, and dogs showing aggression are not allowed.</p><p><strong>Hours:</strong> The official dog-park page says park hours are from dawn until dusk.</p>";
  city.raw["City Website"] = dogParkSource;
  city.raw["Dog Park Etiquettes"] = "<p><strong>1. Use the designated off-leash area, not ordinary city space.</strong></p><p>Melville's animal-control page says pets must be leashed off the owner's premises and specifically points owners to the fenced dog park for off-leash play.</p><p><strong>2. Arrive with licence, vaccination, collar, and ID current.</strong></p><p>The dog-park rules explicitly require dogs to be licensed, vaccinated, and wearing a collar and ID tag.</p><p><strong>3. Enter and leave on leash.</strong></p><p>The city says dogs must be leashed before entering and leaving the facility, and owners should have a leash visible at all times.</p><p><strong>4. Supervise actively.</strong></p><p>Owners must remain in verbal control of their dog, never leave dogs unattended, and remove aggressive dogs immediately.</p><p><strong>5. Keep the park clean and age-appropriate.</strong></p><p>Clean up waste, do not bring dogs in heat, and do not bring dogs younger than four months.</p>";
  city.raw["Dog Park FAQs"] = "<p><strong>1. Does Melville have an official off-leash dog park?</strong></p><p>Yes. The City of Melville publishes an official dog-park page and includes the park in its broader parks listings.</p><p><strong>2. Where is the dog park located?</strong></p><p>The city places it within Melville Regional Park, and the animal-control page says it is east of the tennis courts.</p><p><strong>3. Is the park fenced?</strong></p><p>Yes. The city says it has 6-foot chain-link fencing and a secure double-gated entrance.</p><p><strong>4. How big is the park?</strong></p><p>The official dog-park page says it includes 2 acres of open green grass and a 1,200-foot perimeter walking track.</p><p><strong>5. What are the hours?</strong></p><p>The city says park hours are from dawn until dusk.</p><p><strong>6. Are dog licences required?</strong></p><p>Yes. The city says all dog and cat owners in Melville must license their animals, and the dog-park rules require dogs using the park to be properly licensed.</p>";
  city.raw["Nearby Cities"] = "Yorkton, Esterhazy";
  city.raw["Reviewed On"] = reviewDate;

  const parks = JSON.parse(fs.readFileSync(parksJsonFile, "utf8"));
  const park = parks.find((entry) => entry.slug === "melville-dog-park");
  if (!park) throw new Error("Melville park record not found in generated JSON.");
  park.name = "Melville Off-Leash Dog Park";
  park.title = "Melville Off-Leash Dog Park";
  park.seoTitle = "Melville Off-Leash Dog Park | Melville, Saskatchewan";
  park.metaDescription = "Source-backed guide to Melville Off-Leash Dog Park, including the city-published regional-park location, fenced 2-acre layout, dawn-to-dusk hours, and official rules.";
  park.description = "Source-backed guide to Melville Off-Leash Dog Park, including the city-published regional-park location, fenced 2-acre layout, dawn-to-dusk hours, and official rules.";
  park.body = "<p>Melville Off-Leash Dog Park is the City of Melville's official fenced dog park within Melville Regional Park. The city's animal-control page says it is located east of the tennis courts, while the official dog-park page says the park includes 6-foot chain-link fencing, a secure double-gated entrance, sturdy picnic tables, a 1,200-foot or 0.336 km walking track around the perimeter, and 2 acres of open green grass.</p><p>That makes this page significantly stronger than the older thin draft. Instead of depending on generic claims and unsupported amenities like a water fountain, the current source set gives an explicit city-published layout, rules, and park context. The city's tourism and parks pages also reinforce that this is a recognized recreation feature within the broader park system.</p><p>The official rules are unusually useful. The city says dogs must be properly licensed, vaccinated, and wearing a collar and ID tag; dogs must be leashed before entering and leaving; owners must remain in verbal control; dogs in heat are not allowed; dogs must be at least four months old; waste must be cleaned up; and park hours are from dawn until dusk. The bylaw contact for unattended dogs is also published directly on the dog-park page.</p>";
  park.references.Tags = ["leash-free", "Melville", "Saskatchewan", "Melville Regional Park"];
  park.raw["Updated On"] = reviewDate;
  park.raw["Published On"] = reviewDate;
  park.raw["Park Name"] = "Melville Off-Leash Dog Park";
  park.raw["Park Header"] = "Melville Off-Leash Dog Park";
  park.raw["Description"] = park.body;
  park.raw["Street Address"] = "Within Melville Regional Park, east of the tennis courts";
  park.raw["latitude"] = "";
  park.raw["longitude"] = "";
  park.raw["Postal Code"] = "";
  park.raw["Fenced"] = "Yes - 6-foot chain-link fence";
  park.raw["Separate Small Dog Area"] = "Unknown";
  park.raw["Surface type"] = "Grass";
  park.raw["Size"] = "2 acres";
  park.raw["Water source available"] = "Unknown";
  park.raw["Benches"] = "Picnic tables";
  park.raw["Shaded area"] = "Yes - mature and new-growth trees nearby";
  park.raw["Waste bins"] = "Unknown";
  park.raw["Bag Dispensers"] = "Unknown";
  park.raw["Parking Available"] = "Unknown - verify on arrival";
  park.raw["Washrooms nearby"] = "Unknown";
  park.raw["Operating hours"] = "Dawn to dusk";
  park.raw["Seasonal Restrictions"] = "None published on the city page";
  park.raw["Park Website or Source"] = dogParkSource;
  park.raw["Google Maps Link"] = "https://www.google.com/maps/search/?api=1&query=Melville+Dog+Park+Melville+Regional+Park+SK";
  park.raw["Tags"] = "leash-free, Melville, Saskatchewan, Melville Regional Park";
  park.raw["Notes / Comments"] = `<p>Primary official park source: ${dogParkSource}. Supporting park source: ${parksSource}. Animal-control and licensing source: ${animalControlSource}. This pass removes unsupported fountain claims and keeps parking, washrooms, and waste amenities conservative where the city does not clearly publish them.</p>`;
  park.raw["Intro Paragraph"] = "<p>Melville Off-Leash Dog Park is the City's official fenced off-leash space in Melville Regional Park, with a double-gated entrance, perimeter walking track, and 2 acres of open grass.</p>";
  park.raw["Reviewed On"] = reviewDate;
  park.raw["Meta Title"] = "Melville Off-Leash Dog Park | Melville, Saskatchewan";
  park.raw["Meta Description"] = "Source-backed guide to Melville Off-Leash Dog Park, including the city-published regional-park location, fenced 2-acre layout, dawn-to-dusk hours, and official rules.";

  fs.writeFileSync(citiesJsonFile, `${JSON.stringify(cities, null, 2)}\n`);
  fs.writeFileSync(parksJsonFile, `${JSON.stringify(parks, null, 2)}\n`);
}

updateCityCsv();
updateParkCsv();
updateGeneratedJson();
console.log("Updated Melville city and park records from current official city sources.");
