import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const citiesJsonFile = "src/data/generated/cities.json";

const reviewDate = "Sun Jul 26 2026 12:00:00 GMT+0000 (Coordinated Universal Time)";
const canineSpacesSource = "https://www.ville.quebec.qc.ca/citoyens/animaux/parcs-et-espaces-canins/";
const dogsSource = "https://www.ville.quebec.qc.ca/citoyens/animaux/animaux-domestiques/chien/index.aspx";
const registrationSource = "https://www.ville.quebec.qc.ca/citoyens/animaux/animaux-domestiques/enregistrer-animal/";
const regulationSource = "https://reglements.ville.quebec.qc.ca/fr/document/rc/R.V.Q.2698";

const citySeoTitle = "Dog Parks in Quebec City, Quebec | Off-Leash Guide";
const cityMetaDescription =
  "Source-backed guide to dog parks in Quebec City, Quebec, based on Ville de Québec canine-space listings, dog rules, registration requirements, and municipal regulation.";

const cityIntro =
  "<p>Ville de Québec publishes a clearer dog-park framework than the older generic city page suggested. The city's canine-spaces page lists five designated dog areas, gives addresses for each location, and pairs them with explicit rules on supervision, leash handling, registration, hours, and responsible use.</p>";
const cityAbout =
  "<p>The official Ville de Québec canine-spaces page is the strongest source for this city guide. It says dog parks and canine spaces are delimited places where dogs can run and play freely, then lists five official locations: the canine spaces at the base de plein air de Sainte-Foy, base de plein air La Découverte, and Duberger, plus Parc canin de la Pointe-aux-Lièvres and Parc canin de la Pente-Douce. That is a materially stronger factual base than the older city page, which generalized across boroughs without naming the actual current municipal locations.</p><p>The same official page also publishes usage rules that are specific enough to improve trust. Québec says the responsible person must be present to supervise the dog, the dog must stay on leash until arriving inside the entrance airlock, the dog must be registered and wear the city medal, a maximum of two dogs per responsible person is allowed, feeding a dog inside the park is prohibited, and threatening behaviour toward people or other dogs is prohibited. The page also says the parks and spaces are not recommended for children age 12 and under, and recommends dogs be vaccinated and receive appropriate antiparasitic treatment before visiting.</p><p>The wider dog and registration pages confirm the administrative side. Québec says registering dogs and cats is mandatory in the city, and the dog-information page points owners back to the municipal regulation and canine-space listings for local compliance. The codified by-law adds exact legal details, including that a canine exercise area is a delimited place identified by city signage where dogs may be left at liberty without a leash, and that people cannot bring more than two dogs at once or be present there between 9:00 p.m. and 7:00 a.m. Together, those official sources support a much tighter Québec City guide without over-claiming that every site shares the same amenities.</p>";
const citySeasonal =
  "<ul><li><strong>Winter:</strong> Québec dog spaces remain relevant in winter, but snow and ice can change footing quickly, especially near gates and sloped approaches.</li><li><strong>Spring:</strong> Expect softer ground and muddier edges during thaw, especially in larger natural settings such as Sainte-Foy and Duberger.</li><li><strong>Summer:</strong> The municipal rule set still applies in warm weather, so keep dogs leashed until they are inside the entry area and bring water if a specific site amenity is not confirmed.</li><li><strong>Fall:</strong> Cooler weather makes longer visits easier, but earlier darkness matters because the by-law prohibits use between 9:00 p.m. and 7:00 a.m.</li></ul>";
const cityRules =
  "<p><strong>Official locations:</strong> Ville de Québec lists five canine spaces: base de plein air de Sainte-Foy, base de plein air La Découverte, Duberger, Pointe-aux-Lièvres, and Pente-Douce.</p><p><strong>Leash handling:</strong> The city says a dog must be kept on leash until arrival inside the entrance airlock.</p><p><strong>Registration:</strong> Dogs must be registered with the city and wear the municipal medal.</p><p><strong>Maximum dogs:</strong> The city allows a maximum of two dogs per responsible person.</p><p><strong>Hours:</strong> The codified regulation prohibits being in a canine exercise area between 9:00 p.m. and 7:00 a.m.</p><p><strong>Conduct:</strong> Feeding a dog inside the park is prohibited, threatening behaviour is prohibited, and access doors must be closed after passing through.</p><p><strong>Health:</strong> Sick dogs and female dogs in heat are not allowed, and the city strongly recommends vaccination and appropriate antiparasitic treatment.</p>";
const cityEtiquette =
  "<p><strong>1. Use only the city's designated canine spaces for off-leash activity.</strong></p><p>Québec's regulation defines a canine exercise area as a delimited place identified by city signage where dogs may be free without a leash.</p><p><strong>2. Keep leash control at the entrance and exit.</strong></p><p>The city explicitly says the dog must remain on leash until arrival inside the entry airlock.</p><p><strong>3. Treat registration as mandatory, not optional.</strong></p><p>Québec requires registration and says the dog must wear the city medal in canine spaces.</p><p><strong>4. Keep numbers low and supervision active.</strong></p><p>The official rule set allows a maximum of two dogs per responsible person and requires constant supervision.</p><p><strong>5. Avoid food and shared toys in mixed-dog situations.</strong></p><p>The city prohibits feeding dogs in the park, and toy use is only permitted when the responsible person is alone with their dog.</p>";
const cityFaqs =
  "<p><strong>1. How many official dog parks or canine spaces does Québec City list?</strong></p><p>The city currently lists five official canine spaces on its municipal page.</p><p><strong>2. Do dogs have to be registered in Québec City?</strong></p><p>Yes. Québec says registration of dogs and cats is mandatory, and dogs using canine spaces must wear the city's medal.</p><p><strong>3. How many dogs can one person bring?</strong></p><p>The city allows a maximum of two dogs per responsible person.</p><p><strong>4. Can dogs be in the canine spaces late at night?</strong></p><p>No. The codified regulation prohibits being in a canine exercise area between 9:00 p.m. and 7:00 a.m.</p><p><strong>5. Are toys and food allowed?</strong></p><p>Food is prohibited, and toys are only allowed when the responsible person is alone with their dog.</p><p><strong>6. Are canine spaces recommended for young children?</strong></p><p>The city says these parks and spaces are not recommended for children age 12 and under.</p>";

const cityBody =
  "<p>Ville de Québec's official canine-spaces page says the city maintains five designated dog spaces and names each one with an address: base de plein air de Sainte-Foy at 3137, rue Laberge; base de plein air La Découverte at 10, rue de la Découverte; Espace canin de Duberger at 3050, boulevard Central; Parc canin de la Pointe-aux-Lièvres at 25, rue de la Pointe-aux-Lièvres; and Parc canin de la Pente-Douce beside 600, avenue Belvédère. That alone makes the city page much more concrete than the older draft.</p><p>The same municipal page also gives practical operating rules. Dogs must be supervised by the responsible person, kept on leash until inside the entrance airlock, registered, and wearing the city's medal. The city also says a maximum of two dogs per person is allowed, food is prohibited inside the park, and threatening behaviour toward people or other dogs is prohibited.</p><p>Québec's dog and registration pages, plus the codified regulation R.V.Q. 2698, supply the compliance context behind those park rules. Registration is mandatory, and the by-law sets legal hours by prohibiting use of a canine exercise area between 9:00 p.m. and 7:00 a.m. For a higher-trust city guide, it is better to stay precise on those published facts than to imply every Québec City site has the same fencing, water access, or amenity mix.</p>";

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
    if (values[headerIndex.get("Slug")] === "quebec-city") {
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
      set("Featured Park 1", "base-plein-air-de-sainte-foy-dog-park");
      set("Featured Park 2", "parc-de-duberger");
      set("Featured Park 3", "parc-canin-de-la-pente-douce");
      set("Seasonal Tips", citySeasonal);
      set("Park Rules", cityRules);
      set("City Website", canineSpacesSource);
      set("Province Page", "https://leashfree.ca/quebec-dog-parks");
      set("Dog Park Etiquettes", cityEtiquette);
      set("Dog Park FAQs", cityFaqs);
      set("Nearby Cities", "Lévis, Saint-Augustin-de-Desmaures");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Quebec City row not found in city CSV.");
  fs.writeFileSync(cityFile, `${nextLines.join("\n")}\n`);
}

function updateGeneratedJson() {
  const cities = JSON.parse(fs.readFileSync(citiesJsonFile, "utf8"));
  const city = cities.find((entry) => entry.slug === "quebec-city");
  if (!city) throw new Error("Quebec City record not found in generated JSON.");

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
  city.raw["Featured Park 1"] = "base-plein-air-de-sainte-foy-dog-park";
  city.raw["Featured Park 2"] = "parc-de-duberger";
  city.raw["Featured Park 3"] = "parc-canin-de-la-pente-douce";
  city.raw["Seasonal Tips"] = citySeasonal;
  city.raw["Park Rules"] = cityRules;
  city.raw["City Website"] = canineSpacesSource;
  city.raw["Province Page"] = "https://leashfree.ca/quebec-dog-parks";
  city.raw["Dog Park Etiquettes"] = cityEtiquette;
  city.raw["Dog Park FAQs"] = cityFaqs;
  city.raw["Nearby Cities"] = "Lévis, Saint-Augustin-de-Desmaures";
  city.raw["Reviewed On"] = reviewDate;
  city.references["Featured Park 1"] = ["base-plein-air-de-sainte-foy-dog-park"];
  city.references["Featured Park 2"] = ["parc-de-duberger"];
  city.references["Featured Park 3"] = ["parc-canin-de-la-pente-douce"];
  city.references["Province Page"] = ["https://leashfree.ca/quebec-dog-parks"];
  city.references["Nearby Cities"] = ["Lévis", "Saint-Augustin-de-Desmaures"];

  fs.writeFileSync(citiesJsonFile, `${JSON.stringify(cities, null, 2)}\n`);
}

updateCityCsv();
updateGeneratedJson();
console.log("Updated Quebec City city page with official-source-backed content.");
