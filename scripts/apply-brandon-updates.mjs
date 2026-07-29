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
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
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
  for (const [key, value] of Object.entries(updates)) raw[key] = value;
}

function updateOverridesFile() {
  const source = fs.readFileSync(overridesPath, "utf8");
  if (source.includes('"brandon": "/images/cities/city-brandon-hero.png"')) return;
  const anchor = '  "st-albert": "/images/cities/city-st-albert-hero.png",\n';
  if (!source.includes(anchor)) throw new Error("Override anchor not found.");
  fs.writeFileSync(
    overridesPath,
    source.replace(anchor, `${anchor}  "brandon": "/images/cities/city-brandon-hero.png",\n`)
  );
}

function updateCitiesJson() {
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const city = cities.find((entry) => entry.slug === "brandon");
  if (!city) throw new Error("Brandon city record not found.");

  const reviewedAt = "Wed Jul 29 2026 19:00:00 GMT+0000 (Coordinated Universal Time)";
  const intro = "<p>As of Wednesday, July 29, 2026, Brandon's dog-park page is strongest when it follows the city's own park, licensing, and animal-control pages directly. Brandon currently publishes a short but usable official framework: three dog parks, clear entry rules, annual licensing requirements, and direct bylaw contact information.</p>";
  const about = "<p>Brandon's official dog-park information is straightforward. The city says there are currently three dog parks in Brandon: Doggy Diamond at 2720 Park Avenue, East End Paw Park at 11 Street East and Victoria Avenue East, and Hanbury Hill Pooch Park at 600 Braecrest Drive. That matters because the existing thin page had collapsed Brandon into a single generalized park narrative, while the city now clearly identifies a three-park network. The official rules page also gives visitors practical operating expectations: dogs must remain leashed until entry into the park, owners must keep dogs under control at all times, all messes must be cleaned up immediately, every dog must have a current City of Brandon licence and show it when requested by an Animal Control Officer, no food other than dog treats is allowed, and dogs in heat are not permitted at any time. That is the real usage guidance a Brandon page should surface.</p><p>The city's licensing page adds the compliance details. Brandon says all dogs and cats must be registered with the city annually, whether indoor pets or not, although new pets do not require registration until they are old enough for a rabies shot or six months of age. As of July 29, 2026, Brandon lists annual fees of $22 for a sterile dog or cat within the two-animal limit and $59 for an unsterilized pet within that limit, with higher rates once the household is over the limit of two adult cats and or dogs. The city also says a current rabies certificate must be provided each year, and spay or neuter proof is required for the discounted rate. Brandon Animal Control operates through Brandon Police Service, with officers available seven days a week from 7:00 a.m. to 5:00 p.m. and after hours for emergencies, using 204-729-2345 for complaints. Together, those official pages provide enough current structure to make Brandon's city page factual, specific, and useful without inventing amenities or unsupported policy details.</p>";
  const seasonalTips = "<ul><li><strong>Winter:</strong> Brandon's open prairie conditions can make fenced dog parks colder and windier than expected, so short high-movement visits work best.</li><li><strong>Spring:</strong> Snowmelt can leave soft turf and muddy entrances, especially in larger grass-heavy enclosures.</li><li><strong>Summer:</strong> Earlier and later visits are better because open Brandon dog parks offer less natural shade than treed urban parks.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer exercise sessions, but wind exposure is still worth planning around.</li></ul>";
  const parkRules = "<p><strong>Leash dogs until entry:</strong> Brandon says dogs must remain leashed until they enter the dog park.</p><p><strong>Keep dogs under control:</strong> owners must keep dogs under control at all times.</p><p><strong>Clean up immediately:</strong> all messes must be cleaned up right away.</p><p><strong>Carry a current city licence:</strong> Brandon says all dogs in the park must have a current City of Brandon licence and that it must be shown when requested by Animal Control.</p><p><strong>No dogs in heat and no general food:</strong> dogs in heat are not permitted, and no food other than dog treats is allowed.</p>";
  const etiquette = "<p><strong>1. Use the right Brandon park for your dog.</strong></p><p>Brandon has three official dog parks, so it is worth matching your dog's energy and comfort level to the specific site rather than defaulting to one location.</p><p><strong>2. Treat the entry gate seriously.</strong></p><p>The city explicitly requires dogs to remain leashed until entry, which is where many avoidable conflicts start.</p><p><strong>3. Do not treat licensing as optional paperwork.</strong></p><p>Brandon's official rules tie park access directly to holding a current city licence that can be shown on request.</p><p><strong>4. Keep the park food-light.</strong></p><p>The city allows dog treats but not general food, which helps reduce conflict and resource guarding.</p><p><strong>5. Use Animal Control when there is a real issue.</strong></p><p>Brandon publishes a direct complaint line, which is more useful than handling serious behaviour or at-large issues informally.</p>";
  const faqs = "<p><strong>1. How many official dog parks does Brandon list?</strong></p><p>As of July 29, 2026, Brandon says it currently has three dog parks.</p><p><strong>2. Which Brandon dog parks are officially listed by the city?</strong></p><p>The city lists Doggy Diamond, East End Paw Park, and Hanbury Hill Pooch Park.</p><p><strong>3. Do Brandon dogs need a city licence to use the dog parks?</strong></p><p>Yes. Brandon's dog-park rules say all dogs must have a current City of Brandon licence and that it must be shown when requested by Animal Control.</p><p><strong>4. When does a Brandon pet need to be registered?</strong></p><p>The city says new pets do not require registration until they are old enough for a rabies shot or six months of age.</p><p><strong>5. What are the current annual Brandon licence fees for dogs?</strong></p><p>As of July 29, 2026, the city lists $22 for a sterile dog within the two-animal limit and $59 for an unsterilized dog within that limit, with higher rates above the limit.</p><p><strong>6. Who handles Brandon animal-control complaints?</strong></p><p>Brandon Animal Control operates through Brandon Police Service and directs complaints to 204-729-2345.</p>";
  const metaDescription = "Source-backed guide to Brandon dog parks and rules, covering the city's three official dog parks, annual licensing, entry and supervision rules, vaccination paperwork, and animal-control contacts.";

  city.seoTitle = "Brandon Dog Parks and Off-Leash Rules | LeashFree.ca";
  city.metaDescription = metaDescription;
  city.description = metaDescription;
  city.body = about;
  city.media = [];
  city.references = {
    Province: ["Manitoba"],
    "Featured Park 1": ["doggy-diamond-off-leash-park"],
    "Featured Park 2": ["east-end-paw-park"],
    "Featured Park 3": ["hanbury-hill-pooch-park"],
    "Province Page": ["https://leashfree.ca/manitoba-dog-parks"]
  };

  setRawFields(city.raw, {
    "SEO Title Tag": city.seoTitle,
    "Meta Description": metaDescription,
    "Hero Image": "",
    "Intro Paragraph": intro,
    "About Section": about,
    "Featured Park 1": "doggy-diamond-off-leash-park",
    "Featured Park 2": "east-end-paw-park",
    "Featured Park 3": "hanbury-hill-pooch-park",
    "Seasonal Tips": seasonalTips,
    "Park Rules": parkRules,
    "City Website": "https://brandon.ca/dog-parks",
    "Province Page": "https://leashfree.ca/manitoba-dog-parks",
    "Dog Park Etiquettes": etiquette,
    "Dog Park FAQs": faqs,
    "Nearby Cities": "Virden, Neepawa, Portage la Prairie",
    "Updated On": reviewedAt,
    "Reviewed On": reviewedAt
  });

  fs.writeFileSync(citiesPath, `${JSON.stringify(cities, null, 2)}\n`);
}

function updateCityCsv() {
  const rows = parseCsv(fs.readFileSync(cityCsvPath, "utf8"));
  const headers = rows[0];
  const slugIndex = headers.indexOf("Slug");
  const targetRow = rows.find((row, index) => index > 0 && row[slugIndex] === "brandon");
  if (!targetRow) throw new Error("Brandon city CSV row not found.");
  const updates = {
    "SEO Title Tag": "Brandon Dog Parks and Off-Leash Rules | LeashFree.ca",
    "Meta Description": "Source-backed guide to Brandon dog parks and rules, covering the city's three official dog parks, annual licensing, entry and supervision rules, vaccination paperwork, and animal-control contacts.",
    "Hero Image": "",
    "Intro Paragraph": "<p>As of Wednesday, July 29, 2026, Brandon's dog-park page is strongest when it follows the city's own park, licensing, and animal-control pages directly. Brandon currently publishes a short but usable official framework: three dog parks, clear entry rules, annual licensing requirements, and direct bylaw contact information.</p>",
    "About Section": "<p>Brandon's official dog-park information is straightforward. The city says there are currently three dog parks in Brandon: Doggy Diamond at 2720 Park Avenue, East End Paw Park at 11 Street East and Victoria Avenue East, and Hanbury Hill Pooch Park at 600 Braecrest Drive. That matters because the existing thin page had collapsed Brandon into a single generalized park narrative, while the city now clearly identifies a three-park network. The official rules page also gives visitors practical operating expectations: dogs must remain leashed until entry into the park, owners must keep dogs under control at all times, all messes must be cleaned up immediately, every dog must have a current City of Brandon licence and show it when requested by an Animal Control Officer, no food other than dog treats is allowed, and dogs in heat are not permitted at any time. That is the real usage guidance a Brandon page should surface.</p><p>The city's licensing page adds the compliance details. Brandon says all dogs and cats must be registered with the city annually, whether indoor pets or not, although new pets do not require registration until they are old enough for a rabies shot or six months of age. As of July 29, 2026, Brandon lists annual fees of $22 for a sterile dog or cat within the two-animal limit and $59 for an unsterilized pet within that limit, with higher rates once the household is over the limit of two adult cats and or dogs. The city also says a current rabies certificate must be provided each year, and spay or neuter proof is required for the discounted rate. Brandon Animal Control operates through Brandon Police Service, with officers available seven days a week from 7:00 a.m. to 5:00 p.m. and after hours for emergencies, using 204-729-2345 for complaints. Together, those official pages provide enough current structure to make Brandon's city page factual, specific, and useful without inventing amenities or unsupported policy details.</p>",
    "Featured Park 1": "doggy-diamond-off-leash-park",
    "Featured Park 2": "east-end-paw-park",
    "Featured Park 3": "hanbury-hill-pooch-park",
    "Seasonal Tips": "<ul><li><strong>Winter:</strong> Brandon's open prairie conditions can make fenced dog parks colder and windier than expected, so short high-movement visits work best.</li><li><strong>Spring:</strong> Snowmelt can leave soft turf and muddy entrances, especially in larger grass-heavy enclosures.</li><li><strong>Summer:</strong> Earlier and later visits are better because open Brandon dog parks offer less natural shade than treed urban parks.</li><li><strong>Fall:</strong> Cooler weather is ideal for longer exercise sessions, but wind exposure is still worth planning around.</li></ul>",
    "Park Rules": "<p><strong>Leash dogs until entry:</strong> Brandon says dogs must remain leashed until they enter the dog park.</p><p><strong>Keep dogs under control:</strong> owners must keep dogs under control at all times.</p><p><strong>Clean up immediately:</strong> all messes must be cleaned up right away.</p><p><strong>Carry a current city licence:</strong> Brandon says all dogs in the park must have a current City of Brandon licence and that it must be shown when requested by Animal Control.</p><p><strong>No dogs in heat and no general food:</strong> dogs in heat are not permitted, and no food other than dog treats is allowed.</p>",
    "City Website": "https://brandon.ca/dog-parks",
    "Province Page": "https://leashfree.ca/manitoba-dog-parks",
    "Dog Park Etiquettes": "<p><strong>1. Use the right Brandon park for your dog.</strong></p><p>Brandon has three official dog parks, so it is worth matching your dog's energy and comfort level to the specific site rather than defaulting to one location.</p><p><strong>2. Treat the entry gate seriously.</strong></p><p>The city explicitly requires dogs to remain leashed until entry, which is where many avoidable conflicts start.</p><p><strong>3. Do not treat licensing as optional paperwork.</strong></p><p>Brandon's official rules tie park access directly to holding a current city licence that can be shown on request.</p><p><strong>4. Keep the park food-light.</strong></p><p>The city allows dog treats but not general food, which helps reduce conflict and resource guarding.</p><p><strong>5. Use Animal Control when there is a real issue.</strong></p><p>Brandon publishes a direct complaint line, which is more useful than handling serious behaviour or at-large issues informally.</p>",
    "Dog Park FAQs": "<p><strong>1. How many official dog parks does Brandon list?</strong></p><p>As of July 29, 2026, Brandon says it currently has three dog parks.</p><p><strong>2. Which Brandon dog parks are officially listed by the city?</strong></p><p>The city lists Doggy Diamond, East End Paw Park, and Hanbury Hill Pooch Park.</p><p><strong>3. Do Brandon dogs need a city licence to use the dog parks?</strong></p><p>Yes. Brandon's dog-park rules say all dogs must have a current City of Brandon licence and that it must be shown when requested by Animal Control.</p><p><strong>4. When does a Brandon pet need to be registered?</strong></p><p>The city says new pets do not require registration until they are old enough for a rabies shot or six months of age.</p><p><strong>5. What are the current annual Brandon licence fees for dogs?</strong></p><p>As of July 29, 2026, the city lists $22 for a sterile dog within the two-animal limit and $59 for an unsterilized dog within that limit, with higher rates above the limit.</p><p><strong>6. Who handles Brandon animal-control complaints?</strong></p><p>Brandon Animal Control operates through Brandon Police Service and directs complaints to 204-729-2345.</p>",
    "Nearby Cities": "Virden, Neepawa, Portage la Prairie",
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
  const filtered = [headers, ...rows.slice(1).filter((row) => row[routeIndex] !== "/dog-parks/brandon/")];
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
console.log("Updated Brandon city page and refreshed backlog files.");
