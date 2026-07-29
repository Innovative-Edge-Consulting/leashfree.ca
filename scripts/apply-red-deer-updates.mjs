import fs from "node:fs";

const citiesPath = "src/data/generated/cities.json";
const overridesPath = "src/data/dog-park-image-overrides.js";
const cityCsvPath = "LeashFree-Webflow-Backup-2026-05-26/02-cms-csv-exports/LeashFree.ca - City Pages - 68419a1c56454ae93923d2e4.csv";
const backlogCsvPath = "reports/thin-page-backlog.csv";
const backlogSummaryPath = "reports/thin-page-backlog-summary.md";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = false;
        continue;
      }
      value += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }
    if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

function stringifyCsv(rows) {
  return `${rows.map((row) => row.map((value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\n")}\n`;
}

function setRawFields(raw, updates) {
  for (const [key, value] of Object.entries(updates)) {
    raw[key] = value;
  }
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  if (source.includes('"red-deer": "/images/cities/city-red-deer-hero.png"')) return;
  const anchor = '  "regina": "/images/cities/city-regina-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  const updated = source.replace(
    anchor,
    `${anchor}  "red-deer": "/images/cities/city-red-deer-hero.png",\n`
  );
  fs.writeFileSync(overridesPath, updated);
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "red-deer");
  if (!city) throw new Error("Red Deer city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, the City of Red Deer publicly points dog owners to two official off-leash parks: Oxbows Off Leash Dog Park and Three Mile Bend Recreation Area. That current city material is more precise than the older generic copy because it also ties off-leash access to active dog licensing, leash-in-hand rules, wildlife control, and City of Red Deer or Alberta Animal Services contacts.</p>";
  const about = "<p>Red Deer's current city guidance is straightforward enough that this page should follow it directly. The City of Red Deer currently lists two official off-leash parks: Oxbows Off Leash Dog Park and Three Mile Bend Recreation Area. Oxbows is described as a 16 hectare site designed exclusively for dogs and their owners at the corner of 19 Street and 40 Avenue, with a staging area, winding trails, diverse terrain, open training sites, rest locations, an agility park, an amphitheatre, interpretive kiosks, and a separate small-dogs area. Three Mile Bend is described as a 55 hectare natural area on the North Bank Trail near the Red Deer River, accessed from Riverside Drive via 76 Street, with ponds, a boardwalk, picnic space, trails, and an off-leash dog area as part of a broader recreation site.</p><p>The city's broader pet guidance adds the operational rules this guide needs. Red Deer says dogs in off-leash parks must have a current licence, must not chase wildlife, must interact well with other dogs and dog owners, and must come immediately when called. Owners must keep dogs on leash until inside the fenced area, carry a leash at all times, and keep each dog within sight and under verbal control. The city's public-space policy also says dogs in regular city parks must otherwise stay leashed and licensed, while the dog licensing pages say all dog owners in Red Deer must buy a licence, licences renew annually on or before December 31, applicants must be at least 18 years old, and three dogs per household are permitted. For complaints involving barking, aggressive, stray, injured, or deceased domestic animals, the city directs residents to Alberta Animal Services at 403-347-2388. For park-specific questions, the city lists Parks and Public Works at 403-342-8238. The off-leash park pages also note that outdoor amenities may close during poor air quality events, so it is worth checking city notices before heading out.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Red Deer promotes both off-leash parks for year-round use, but natural surfaces at Three Mile Bend can get icy, snowy, and less predictable than Oxbows.</li><li><strong>Spring:</strong> Expect softer ground and muddier footing, especially at trail-heavy sites near water such as Three Mile Bend.</li><li><strong>Summer:</strong> Check city notices before visiting because Red Deer says outdoor recreation amenities may close during poor air quality events.</li><li><strong>Fall:</strong> Cooler temperatures make longer trail loops easier, but leaves and damp terrain can reduce traction in natural sections.</li></ul>";
  const parkRules = "<p><strong>Use only the city's designated off-leash sites:</strong> Red Deer currently names Oxbows and Three Mile Bend as its official off-leash parks.</p><p><strong>Keep licensing current:</strong> the city says dogs using public spaces and off-leash parks must have a current licence, and dog licences renew annually.</p><p><strong>Control wildlife interactions:</strong> Red Deer says dogs in off-leash parks must not chase wildlife.</p><p><strong>Handle leash transitions properly:</strong> owners must keep dogs on leash until inside the fenced area and must have a leash in possession at all times.</p><p><strong>Maintain sight and recall:</strong> the city requires dogs to stay within sight, under verbal control, and able to come immediately when called.</p>";
  const etiquette = "<p><strong>1. Pick the right Red Deer park format.</strong></p><p>Oxbows is a purpose-built dog park, while Three Mile Bend is a larger natural recreation area that happens to include off-leash access.</p><p><strong>2. Treat wildlife control as a real rule.</strong></p><p>Red Deer explicitly says dogs must not chase wildlife, which matters more at natural sites than at compact urban enclosures.</p><p><strong>3. Keep the leash transition clean.</strong></p><p>The city does not treat this as optional: leash the dog until the proper entry point and keep a leash with you throughout the visit.</p><p><strong>4. Use Oxbows differently from Three Mile Bend.</strong></p><p>Oxbows is better if you want a dedicated dog-focused site with amenities and a small-dog area, while Three Mile Bend works better for longer natural walks.</p><p><strong>5. Keep the admin side current.</strong></p><p>Red Deer requires current licensing, allows up to three dogs per household, and routes domestic-animal complaints through Alberta Animal Services.</p>";
  const faqs = "<p><strong>1. How many official off-leash dog parks does Red Deer currently list?</strong></p><p>The City of Red Deer currently points owners to two official off-leash parks: Oxbows Off Leash Dog Park and Three Mile Bend Recreation Area.</p><p><strong>2. What makes Oxbows different from Three Mile Bend?</strong></p><p>Oxbows is a dedicated 16 hectare dog park with features like an agility area, interpretive kiosks, and a separate small-dogs area, while Three Mile Bend is a larger 55 hectare natural recreation area that includes off-leash access as part of a broader trail and pond setting.</p><p><strong>3. Does Red Deer require a dog licence for off-leash park use?</strong></p><p>Yes. The city says dogs in its off-leash parks must have a current licence, and all Red Deer dog owners must buy and renew dog licences annually.</p><p><strong>4. Are Red Deer dog parks limited to summer use?</strong></p><p>No. The city's off-leash parks page says you can enjoy these parks any time of the year, subject to city notices or temporary closures.</p><p><strong>5. Who handles park questions and animal complaints in Red Deer?</strong></p><p>The city lists Parks and Public Works at 403-342-8238 for park questions and Alberta Animal Services at 403-347-2388 for concerns about domestic animals.</p><p><strong>6. How many dogs are allowed per household in Red Deer?</strong></p><p>The city's responsible pet ownership page says three dogs per household are permitted in Red Deer, and each dog requires its own licence.</p>";
  const metaDescription = "Source-backed guide to Red Deer dog parks, covering the city's two official off-leash parks, Oxbows and Three Mile Bend, current licence requirements, wildlife-control rules, leash-handling expectations, and current contact information.";

  city.seoTitle = "Red Deer Dog Parks | Official Off-Leash Guide | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Alberta"],
    "Featured Park 1": ["oxbows-off-leash-dog-park"],
    "Featured Park 2": ["three-mile-bend-recreation-area"],
    "Province Page": ["https://leashfree.ca/alberta-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "oxbows-off-leash-dog-park",
    "Featured Park 2": "three-mile-bend-recreation-area",
    "Featured Park 3": "",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://www.reddeer.ca/recreation-and-culture/outdoor-recreation/year-round-activities/off-leash-dog-parks/",
    "Province Page": "https://leashfree.ca/alberta-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Calgary, Edmonton",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "red-deer");
  if (!targetRow) throw new Error("Red Deer city CSV row not found.");

  const updates = {
    "SEO Title Tag": "Red Deer Dog Parks | Official Off-Leash Guide | LeashFree.ca",
    "Meta Description": "Source-backed guide to Red Deer dog parks, covering the city's two official off-leash parks, Oxbows and Three Mile Bend, current licence requirements, wildlife-control rules, leash-handling expectations, and current contact information.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, the City of Red Deer publicly points dog owners to two official off-leash parks: Oxbows Off Leash Dog Park and Three Mile Bend Recreation Area. That current city material is more precise than the older generic copy because it also ties off-leash access to active dog licensing, leash-in-hand rules, wildlife control, and City of Red Deer or Alberta Animal Services contacts.</p>",
    "About Section": "<p>Red Deer's current city guidance is straightforward enough that this page should follow it directly. The City of Red Deer currently lists two official off-leash parks: Oxbows Off Leash Dog Park and Three Mile Bend Recreation Area. Oxbows is described as a 16 hectare site designed exclusively for dogs and their owners at the corner of 19 Street and 40 Avenue, with a staging area, winding trails, diverse terrain, open training sites, rest locations, an agility park, an amphitheatre, interpretive kiosks, and a separate small-dogs area. Three Mile Bend is described as a 55 hectare natural area on the North Bank Trail near the Red Deer River, accessed from Riverside Drive via 76 Street, with ponds, a boardwalk, picnic space, trails, and an off-leash dog area as part of a broader recreation site.</p><p>The city's broader pet guidance adds the operational rules this guide needs. Red Deer says dogs in off-leash parks must have a current licence, must not chase wildlife, must interact well with other dogs and dog owners, and must come immediately when called. Owners must keep dogs on leash until inside the fenced area, carry a leash at all times, and keep each dog within sight and under verbal control. The city's public-space policy also says dogs in regular city parks must otherwise stay leashed and licensed, while the dog licensing pages say all dog owners in Red Deer must buy a licence, licences renew annually on or before December 31, applicants must be at least 18 years old, and three dogs per household are permitted. For complaints involving barking, aggressive, stray, injured, or deceased domestic animals, the city directs residents to Alberta Animal Services at 403-347-2388. For park-specific questions, the city lists Parks and Public Works at 403-342-8238. The off-leash park pages also note that outdoor amenities may close during poor air quality events, so it is worth checking city notices before heading out.</p>",
    "Featured Park 1": "oxbows-off-leash-dog-park",
    "Featured Park 2": "three-mile-bend-recreation-area",
    "Featured Park 3": "",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Red Deer promotes both off-leash parks for year-round use, but natural surfaces at Three Mile Bend can get icy, snowy, and less predictable than Oxbows.</li><li><strong>Spring:</strong> Expect softer ground and muddier footing, especially at trail-heavy sites near water such as Three Mile Bend.</li><li><strong>Summer:</strong> Check city notices before visiting because Red Deer says outdoor recreation amenities may close during poor air quality events.</li><li><strong>Fall:</strong> Cooler temperatures make longer trail loops easier, but leaves and damp terrain can reduce traction in natural sections.</li></ul>",
    "Park Rules": "<p><strong>Use only the city's designated off-leash sites:</strong> Red Deer currently names Oxbows and Three Mile Bend as its official off-leash parks.</p><p><strong>Keep licensing current:</strong> the city says dogs using public spaces and off-leash parks must have a current licence, and dog licences renew annually.</p><p><strong>Control wildlife interactions:</strong> Red Deer says dogs in off-leash parks must not chase wildlife.</p><p><strong>Handle leash transitions properly:</strong> owners must keep dogs on leash until inside the fenced area and must have a leash in possession at all times.</p><p><strong>Maintain sight and recall:</strong> the city requires dogs to stay within sight, under verbal control, and able to come immediately when called.</p>",
    "City Website": "https://www.reddeer.ca/recreation-and-culture/outdoor-recreation/year-round-activities/off-leash-dog-parks/",
    "Province Page": "https://leashfree.ca/alberta-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Pick the right Red Deer park format.</strong></p><p>Oxbows is a purpose-built dog park, while Three Mile Bend is a larger natural recreation area that happens to include off-leash access.</p><p><strong>2. Treat wildlife control as a real rule.</strong></p><p>Red Deer explicitly says dogs must not chase wildlife, which matters more at natural sites than at compact urban enclosures.</p><p><strong>3. Keep the leash transition clean.</strong></p><p>The city does not treat this as optional: leash the dog until the proper entry point and keep a leash with you throughout the visit.</p><p><strong>4. Use Oxbows differently from Three Mile Bend.</strong></p><p>Oxbows is better if you want a dedicated dog-focused site with amenities and a small-dog area, while Three Mile Bend works better for longer natural walks.</p><p><strong>5. Keep the admin side current.</strong></p><p>Red Deer requires current licensing, allows up to three dogs per household, and routes domestic-animal complaints through Alberta Animal Services.</p>",
    "Dog Park FAQs": "<p><strong>1. How many official off-leash dog parks does Red Deer currently list?</strong></p><p>The City of Red Deer currently points owners to two official off-leash parks: Oxbows Off Leash Dog Park and Three Mile Bend Recreation Area.</p><p><strong>2. What makes Oxbows different from Three Mile Bend?</strong></p><p>Oxbows is a dedicated 16 hectare dog park with features like an agility area, interpretive kiosks, and a separate small-dogs area, while Three Mile Bend is a larger 55 hectare natural recreation area that includes off-leash access as part of a broader trail and pond setting.</p><p><strong>3. Does Red Deer require a dog licence for off-leash park use?</strong></p><p>Yes. The city says dogs in its off-leash parks must have a current licence, and all Red Deer dog owners must buy and renew dog licences annually.</p><p><strong>4. Are Red Deer dog parks limited to summer use?</strong></p><p>No. The city's off-leash parks page says you can enjoy these parks any time of the year, subject to city notices or temporary closures.</p><p><strong>5. Who handles park questions and animal complaints in Red Deer?</strong></p><p>The city lists Parks and Public Works at 403-342-8238 for park questions and Alberta Animal Services at 403-347-2388 for concerns about domestic animals.</p><p><strong>6. How many dogs are allowed per household in Red Deer?</strong></p><p>The city's responsible pet ownership page says three dogs per household are permitted in Red Deer, and each dog requires its own licence.</p>",
    "Nearby Cities": "Calgary, Edmonton",
    "Updated On": "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)",
    "Reviewed On": "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)"
  };

  for (const [field, value] of Object.entries(updates)) {
    const columnIndex = headers.indexOf(field);
    if (columnIndex >= 0) targetRow[columnIndex] = value;
  }

  fs.writeFileSync(cityCsvPath, stringifyCsv(rows));
}

function updateBacklogFiles() {
  const rows = parseCsv(fs.readFileSync(backlogCsvPath, "utf8"));
  const headers = rows[0];
  const routeIndex = headers.indexOf("route");
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/red-deer/")];
  fs.writeFileSync(backlogCsvPath, stringifyCsv(filtered));

  const bodyRows = filtered.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  const countBy = (field) => [...bodyRows.reduce((map, row) => {
    const key = row[field] || "";
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => b[1] - a[1]);

  const tierRows = countBy("tier").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const sectionRows = countBy("contentType").map(([key, count]) => `| ${key} | ${count} |`).join("\n");
  const topRows = bodyRows.slice(0, 50).map((row, index) => `| ${index + 1} | ${row.tier} | ${row.contentType} | [${row.name}](${row.route}) | ${row.priorityScore} | ${row.wordCount} | ${row.missingSourceUrl === "true" ? "yes" : "no"} |`).join("\n");

  const summary = `# Thin Page Improvement Backlog

Generated from \`reports/content-health.json\` on 2026-07-22.

This backlog contains ${bodyRows.length} pages in the current working queue. The CSV is the operational backlog for this initiative; this document explains prioritization and shows the first 50 records.

## Backlog counts

| Tier | Pages |
| --- | ---: |
${tierRows}

| Content type | Pages |
| --- | ---: |
${sectionRows}

## Prioritization

- **T0-integrity-review:** resolve duplicates, canonical conflicts, or suspicious records before investing in new copy or imagery.
- **T1-source-research:** pages missing an official or trusted source URL. Evidence comes before expansion.
- **T2-high-value-expansion:** high-priority pages or pages with fewer than 100 words.
- **T3-standard-expansion:** remaining thin pages that are structurally sound and ready for a normal research pass.

Do not treat the queue as a mass publishing schedule. Work one page at a time, keep the page in \`queued\` until its evidence packet is complete, and do not update \`lastmod\` until the page has materially changed.

## First 50 pages

| # | Tier | Type | Page | Score | Words | Missing source |
| ---: | --- | --- | --- | ---: | ---: | --- |
${topRows}
`;
  fs.writeFileSync(backlogSummaryPath, summary);
}

updateOverridesFile();
updateCitiesJson();
updateCityCsv();
updateBacklogFiles();

console.log("Updated Red Deer city page and refreshed backlog files.");
