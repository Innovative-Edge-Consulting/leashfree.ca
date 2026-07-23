import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Wed Jul 22 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const recreationSource = "https://nipawin.com/leisure-recreation/leisure-services/";
const programsSource = "https://nipawin.com/leisure-recreation/programs/";
const animalControlSource = "https://nipawin.com/animal-control/";

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
    if (values[headerIndex.get("Slug")] === "nipawin") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Nipawin");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Nipawin, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Nipawin, Saskatchewan, based on the town's recreation pages, the listed Nipawin Dog Park, and current animal-control licensing rules.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Nipawin is stronger than many thin Saskatchewan city pages because the town's current recreation pages directly list a dog park in the parks and open-spaces inventory, and the current animal-control page clearly confirms dog licensing requirements. That gives the city page a usable municipal source base instead of forcing it to rely on review sites or generic copy.</p>");
      set("About Section", "<p>The Town of Nipawin's current leisure-services page includes Nipawin Dog Park in the official parks, playgrounds, and open-spaces inventory. The town's programs page also refers to the same park as The Lions Nipawin Dog Park. That naming detail matters because it suggests the park may be known locally by both forms, but in both cases the source is the current municipal website rather than a third-party listing.</p><p>The town's current animal-control page adds the rule framework that makes this guide more useful. Nipawin says all dogs and cats residing in town must be licensed, and it provides current contact details for the animal-control officer. The town also links this service directly from the same site structure as recreation, which is enough to build a conservative city guide even though the municipal pages do not currently publish a precise civic address or a detailed amenity sheet for the dog park itself.</p>");
      set("Featured Park 1", "nipawin-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Snow, wind, and icy gates can change footing and comfort quickly in northeast Saskatchewan.</li><li><strong>Spring:</strong> Expect soft ground and mud during thaw, especially around entries and parking edges.</li><li><strong>Summer:</strong> Bring water and check sun exposure before longer play sessions.</li><li><strong>Fall:</strong> Cooler weather is ideal for visits, but earlier sunset makes daytime outings easier.</li></ul>");
      set("Park Rules", "<p><strong>Official park existence:</strong> The Town of Nipawin currently lists Nipawin Dog Park on its leisure-services page and refers to The Lions Nipawin Dog Park on the programs page.</p><p><strong>Licensing:</strong> The town's current animal-control page says all dogs and cats residing in Nipawin must be licensed.</p><p><strong>Animal-control contact:</strong> The same page provides current contact information for the animal-control officer, which is useful if you need local guidance before visiting.</p><p><strong>Location confidence:</strong> The current municipal pages confirm the park exists, but they do not clearly publish a full civic address or coordinates, so this guide keeps the location description conservative and points visitors back to town sources and on-site signage.</p>");
      set("City Website", recreationSource);
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Treat the listed dog park as the town-recognized off-leash space.</strong></p><p>The municipal recreation pages explicitly list Nipawin Dog Park, so that is the right place to focus off-leash visits rather than assuming ordinary greenspace is equivalent.</p><p><strong>2. Keep licensing current.</strong></p><p>Nipawin's animal-control page clearly says all resident dogs and cats must be licensed.</p><p><strong>3. Verify the exact entrance on arrival.</strong></p><p>Because the town confirms the park but does not clearly publish a full address on the current pages reviewed here, posted signage and local wayfinding still matter.</p><p><strong>4. Plan conservatively for amenities.</strong></p><p>The current official pages are better for park existence and town rules than for a detailed amenity breakdown, so bring water and basic cleanup supplies.</p><p><strong>5. Use the animal-control contact when needed.</strong></p><p>If you need clarification on local dog rules or a park-related issue, the town publishes direct current animal-control contact details.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Nipawin have an official dog park?</strong></p><p>Yes. The Town of Nipawin currently lists Nipawin Dog Park on its leisure-services page.</p><p><strong>2. Is the park named anything else?</strong></p><p>Yes. The town's programs page refers to it as The Lions Nipawin Dog Park.</p><p><strong>3. Does Nipawin require dog licensing?</strong></p><p>Yes. The town's animal-control page says all dogs and cats residing in Nipawin must be licensed.</p><p><strong>4. Does the town publish a full address for the dog park?</strong></p><p>Not clearly on the current municipal pages reviewed in this pass. The town confirms the park exists, but this guide keeps the exact location description conservative.</p><p><strong>5. Where can I find current local dog-rule contacts?</strong></p><p>The Town of Nipawin animal-control page publishes current contact information for the animal-control officer.</p><p><strong>6. What makes this city page more trustworthy than the older draft?</strong></p><p>It now relies on the town's own recreation and animal-control pages instead of generic unsupported park descriptions.</p>");
      set("Nearby Cities", "Melfort, Prince Albert");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Nipawin row not found in city CSV.");
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
    if (values[headerIndex.get("slug")] === "nipawin-dog-park") {
      found = true;
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("Park Name", "Nipawin Dog Park");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("Park Header", "Nipawin Dog Park");
      set("Park type", "Leash Free");
      set("Description", "<p>Nipawin Dog Park is the town-listed off-leash dog park in Nipawin, Saskatchewan. The Town of Nipawin's current leisure-services page includes Nipawin Dog Park in its official parks and open-spaces inventory, while the town's programs page refers to the same space as The Lions Nipawin Dog Park.</p><p>That combination gives this record a stronger municipal footing than the older version, which depended on a third-party listing and a specific map point the official town pages did not confirm. The current town sources support the park's existence and local recognition, but they do not clearly publish a full civic address, coordinate pair, or detailed amenity sheet.</p><p>Nipawin's current animal-control page adds the practical local rule context. The town says all resident dogs and cats must be licensed and provides current animal-control contact information. For visitors, that means this page can confidently describe the town-recognized off-leash space while staying conservative about location precision and unconfirmed amenities.</p>");
      set("Street Address", "Town-listed Nipawin Dog Park / The Lions Nipawin Dog Park");
      set("latitude", "");
      set("longitude", "");
      set("City", "Nipawin");
      set("Province", "Saskatchewan");
      set("Postal Code", "S0E 1E0");
      set("Fenced", "Unknown - verify on arrival");
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
      set("Operating hours", "Unknown - check posted signage");
      set("Seasonal Restrictions", "None confirmed in current source set");
      set("Park Website or Source", recreationSource);
      set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=Nipawin+Dog+Park+Nipawin+SK");
      set("Tags", "leash-free, Nipawin, Saskatchewan, Lions Nipawin Dog Park");
      set("Notes / Comments", `<p>Primary municipal recreation sources: ${recreationSource} and ${programsSource}. Rule and licensing source: ${animalControlSource}. The official town pages confirm the park exists but do not clearly publish a full civic address or coordinates, so location precision and amenities were kept conservative.</p>`);
      set("Intro Paragraph", "<p>Nipawin Dog Park is the town-listed off-leash dog space in Nipawin, with municipal support from the town's recreation pages and local rule support from the animal-control page.</p>");
      set("Media", "");
      set("Reviewed On", reviewDate);
      set("Meta Title", "Nipawin Dog Park | Nipawin, Saskatchewan");
      set("Meta Description", "Source-backed guide to Nipawin Dog Park in Nipawin, Saskatchewan, based on the town's recreation pages, listed dog-park inventory, and current animal-control licensing rules.");
    }
    nextLines.push(csv(values));
  }

  if (!found) throw new Error("Nipawin Dog Park row not found in park CSV.");
  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Nipawin city guide and refreshed Nipawin Dog Park from current town sources.");
