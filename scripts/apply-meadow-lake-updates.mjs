import fs from "node:fs";

const cityFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const parkFile = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - Dog Parks - 683758b0a3f8a696dfc417b0.csv";
const reviewDate = "Sat Jul 18 2026 00:00:00 GMT+0000 (Coordinated Universal Time)";

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
    if (values[headerIndex.get("Slug")] === "meadow-lake") {
      const set = (field, value) => {
        values[headerIndex.get(field)] = value;
      };

      set("City Name", "Meadow Lake");
      set("Draft", "false");
      set("Updated On", reviewDate);
      set("Published On", reviewDate);
      set("SEO Title Tag", "Dog Parks in Meadow Lake, Saskatchewan | Off-Leash Guide");
      set("Meta Description", "Source-backed guide to dog parks in Meadow Lake, Saskatchewan, focused on dog licensing, city animal-control expectations, and conservative off-leash park planning notes.");
      set("Hero Image", "");
      set("Intro Paragraph", "<p>Meadow Lake has enough real source material to improve this page substantially, but not enough to support the old generic claims about fencing, hours, and park amenities. The stronger approach is to build the city guide around what the City of Meadow Lake clearly publishes today: dog licensing, public animal-control expectations, park context, and cautious location guidance for the community off-leash park history.</p>");
      set("About Section", "<p>The City of Meadow Lake currently says dog licences are required for dogs whose primary residence is within city limits and must be renewed each calendar year by February 28. The city's urban wildlife and animal-control guidance also makes clear that control of domestic pets, especially dogs, is a city service delivered in cooperation with the Humane Society. That is much stronger than generic prose because it gives owners a real municipal compliance checklist before they ever head to an off-leash area.</p><p>For park context, the city parks page identifies Lions Park as a major community recreation space with a walking path, public shelter, amphitheatre, and large-event role, but the reviewed official city pages do not clearly list a dedicated dog park there. A separate community source from the Meadow Lake & District Humane Society is more specific about off-leash park history: in 2013 the group reported that the City had donated land on the far east side of Meadow Lake, near the compost site, for the off-leash dog park project, and in 2017 the Society referred to that effort as having resulted in an off-leash dog park for the City of Meadow Lake. Because that evidence is partly historical and partly community-based rather than a current official city park page, this guide stays intentionally conservative about the exact site layout and features.</p>");
      set("Featured Park 1", "meadow-lake-off-leash-dog-park");
      set("Featured Park 2", "");
      set("Featured Park 3", "");
      set("Seasonal Tips", "<ul><li><strong>Winter:</strong> Northwest Saskatchewan cold, wind, and snowdrift can change access quickly, so keep dogs leashed until you are fully inside any confirmed off-leash area.</li><li><strong>Spring:</strong> Thaw conditions can make east-side utility and compost-adjacent ground soft or muddy, so bring towels and manage exits carefully.</li><li><strong>Summer:</strong> Bring your own water unless you verify a safe on-site source. Open-sky exposure and insects can affect longer visits.</li><li><strong>Fall:</strong> Cooler temperatures are often best for longer outings, but shorter daylight means you should confirm footing and visibility before late-day visits.</li></ul>");
      set("Park Rules", "<p><strong>Dog licensing:</strong> The City of Meadow Lake says dogs whose primary residence is within city limits must be licensed and renewed annually by February 28.</p><p><strong>Public control:</strong> The city says domestic pet control, especially regarding dogs, is part of municipal service delivery in cooperation with the Humane Society.</p><p><strong>Wildlife-aware handling:</strong> Meadow Lake's urban-wildlife guidance warns that off-leash dogs in on-leash areas can trigger conflict with coyotes and other wildlife, so leash discipline outside designated off-leash use matters.</p><p><strong>Conservative park use:</strong> Because the reviewed source set does not include a current official city dog-park rules board, visitors should follow any posted signage on arrival and default to conservative leash control outside the designated off-leash area.</p>");
      set("City Website", "https://www.meadowlake.ca/permits-and-licensing");
      set("Province Page", "https://leashfree.ca/saskatchewan-dog-parks");
      set("Dog Park Etiquettes", "<p><strong>1. Start with licensing, not assumptions.</strong></p><p>Meadow Lake clearly publishes annual dog-licensing requirements, so responsible off-leash use starts with municipal compliance.</p><p><strong>2. Treat area context carefully.</strong></p><p>The strongest reviewed location history points to the far east side near the municipal compost site on 9th Avenue East, but current official city park-detail pages do not clearly publish a detailed dog-park amenity sheet.</p><p><strong>3. Bring your own essentials.</strong></p><p>Because current source material does not clearly confirm water, benches, bins, or washrooms for the off-leash site, plan as if you need to be self-sufficient.</p><p><strong>4. Respect wildlife realities.</strong></p><p>The city explicitly warns that off-leash dogs in the wrong setting can increase conflict with coyotes and other wildlife.</p><p><strong>5. Keep transitions controlled.</strong></p><p>If the park approach is in a light-service or edge-of-town area, calm entries and exits matter as much as recall inside the off-leash space.</p>");
      set("Dog Park FAQs", "<p><strong>1. Does Meadow Lake require dog licences?</strong></p><p>Yes. The City says dogs whose primary residence is within city limits must be licensed and renewed each year by February 28.</p><p><strong>2. Does Meadow Lake have an off-leash dog park?</strong></p><p>Community historical material from the Meadow Lake & District Humane Society says the City's dog-park fundraising effort resulted in an off-leash dog park, but the reviewed current official city pages do not provide a full dedicated dog-park detail page.</p><p><strong>3. Where is the off-leash area believed to be?</strong></p><p>The strongest reviewed location history places the project on the far east side of Meadow Lake near the municipal compost site. The city separately confirms that its compost site is on 9th Avenue East.</p><p><strong>4. Why is this guide conservative about amenities?</strong></p><p>Because the current city source set supports licensing, pet-control expectations, and general area context more clearly than it supports specific claims about fencing, hours, benches, or water.</p><p><strong>5. What should I do before visiting?</strong></p><p>Make sure your dog is licensed, bring your own supplies, and verify current signage and site conditions on arrival.</p>");
      set("Nearby Cities", "Lloydminster, North Battleford");
      set("Reviewed On", reviewDate);
      updated = true;
    }
    nextLines.push(csv(values));
  }

  if (!updated) throw new Error("Meadow Lake row not found in city CSV.");
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
  const slug = "meadow-lake-off-leash-dog-park";
  let found = false;

  const nextLines = [csv(headers)];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (!line) continue;
    const values = parseCsvLine(line);
    while (values.length < headers.length) values.push("");
    if (values[headerIndex.get("slug")] === slug) found = true;
    nextLines.push(csv(values));
  }

  if (!found) {
    const row = Array(headers.length).fill("");
    const set = (field, value) => {
      row[headerIndex.get(field)] = value;
    };

    set("Park Name", "Meadow Lake Off-Leash Dog Park");
    set("slug", slug);
    set("Collection ID", "683758b0a3f8a696dfc417b0");
    set("Locale ID", "683758b09dd1e3ac2e4e9809");
    set("Item ID", "meadow-lake-off-leash-dog-park-20260718");
    set("Archived", "false");
    set("Draft", "false");
    set("Created On", reviewDate);
    set("Updated On", reviewDate);
    set("Published On", reviewDate);
    set("Park Header", "Meadow Lake Off-Leash Dog Park");
    set("Park type", "Leash Free");
    set("Description", "<p>Meadow Lake Off-Leash Dog Park is a conservative listing built from the strongest reviewed source trail rather than from unsupported amenity claims. The City of Meadow Lake clearly publishes dog-licensing requirements, animal-control context, and the location of its municipal compost site on 9th Avenue East. A separate historical community source from the Meadow Lake & District Humane Society says the City donated land on the far east side near the compost site for the off-leash dog park project, and later referred to that effort as having resulted in an off-leash dog park for the City of Meadow Lake.</p><p>That means the off-leash park can be treated as a real local destination, but not one with a clearly published current city amenity sheet in the source set reviewed here. For that reason, this record avoids claiming exact fencing, water, benches, hours, or washroom details without direct current publication. Instead, it gives the strongest available area context and directs visitors to verify site signage and current conditions on arrival.</p><p>The city also gives practical animal-control context that matters before any off-leash visit. Dogs whose primary residence is within Meadow Lake city limits must be licensed annually, and the city warns that poorly controlled dogs can increase conflict with urban wildlife such as coyotes. In practice, that makes recall, leash transitions, and responsible waste handling part of trip planning even when the off-leash area itself is lightly documented online.</p>");
    set("Street Address", "Far east side near the municipal compost site on 9th Avenue East");
    set("latitude", "");
    set("longitude", "");
    set("City", "Meadow Lake");
    set("Province", "Saskatchewan");
    set("Postal Code", "");
    set("Fenced", "Unknown - verify on arrival");
    set("Separate Small Dog Area", "Unknown");
    set("Surface type", "Unknown");
    set("Size", "Unknown");
    set("Water source available", "Unknown");
    set("Benches", "Unknown");
    set("Shaded area", "Unknown");
    set("Waste bins", "Unknown");
    set("Bag Dispensers", "Unknown");
    set("Parking Available", "Unknown - verify on arrival");
    set("Washrooms nearby", "Unknown");
    set("Operating hours", "Unknown - check posted signage");
    set("Seasonal Restrictions", "Check posted signage and site conditions before use");
    set("Park Website or Source", "https://mldhs.wordpress.com/2013/12/");
    set("Google Maps Link", "https://www.google.com/maps/search/?api=1&query=9th+Avenue+East+Meadow+Lake+SK+compost+site");
    set("Tags", "leash-free, Meadow Lake, Saskatchewan, community dog park");
    set("Notes / Comments", "<p>This listing is intentionally conservative. Current official city sources clearly support dog licensing, animal-control context, and the municipal compost-site location on 9th Avenue East. Historical Meadow Lake & District Humane Society updates support the off-leash park project and east-side area context.</p>");
    set("Intro Paragraph", "<p>Meadow Lake Off-Leash Dog Park appears to serve as the city's community off-leash space, but current online source material is stronger on licensing and area context than on detailed amenity claims. Arrive prepared and verify current signage on site.</p>");
    set("Media", "");
    set("Reviewed On", reviewDate);
    set("Meta Title", "Meadow Lake Off-Leash Dog Park | Meadow Lake, Saskatchewan");
    set("Meta Description", "Conservative, source-backed guide to Meadow Lake Off-Leash Dog Park with dog-licensing requirements and east-side location context near the municipal compost site.");

    nextLines.push(csv(row));
  }

  fs.writeFileSync(parkFile, `${nextLines.join("\n")}\n`);
}

updateCityCsv();
updateParkCsv();
console.log("Updated Meadow Lake city guide and added Meadow Lake off-leash dog park record.");
